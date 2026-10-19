import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverEnv } from "#/env/server.ts";
import { requireAdmin } from "#/packages/auth/server/guard.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	inviteEmailHtml,
	isMailConfigured,
	sendMail,
} from "#/packages/notifications/mail.ts";
import { getOrgContext } from "#/packages/school/context.ts";

const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

const RoleEnum = z.enum(["STUDENT", "STAFF"]);

const InvitePayloadSchema = z.object({
	grade: z.string().optional(),
	section: z.string().optional(),
	designation: z.string().optional(),
	department: z.string().optional(),
	rollNo: z.string().optional(),
	employeeId: z.string().optional(),
});
export type InvitePayload = z.infer<typeof InvitePayloadSchema>;

const CreateInviteSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	type: RoleEnum,
	payload: InvitePayloadSchema.optional(),
});

function buildInviteUrl(token: string): string {
	const base = serverEnv.APP_URL.replace(/\/+$/, "");
	return `${base}/activate/${token}`;
}

function roleLabelFor(type: "STUDENT" | "STAFF"): string {
	return type === "STUDENT" ? "a student" : "a staff member";
}

async function deliverInvite(args: {
	name: string;
	email: string;
	type: "STUDENT" | "STAFF";
	token: string;
}) {
	const inviteUrl = buildInviteUrl(args.token);
	if (!isMailConfigured()) {
		return { inviteUrl, emailed: false as const, reason: "mail_unconfigured" };
	}
	const result = await sendMail({
		to: args.email,
		subject: `You're invited to ${serverEnv.ORGANIZATION_NAME}`,
		html: inviteEmailHtml({
			recipientName: args.name,
			schoolName: serverEnv.ORGANIZATION_NAME,
			roleLabel: roleLabelFor(args.type),
			inviteUrl,
		}),
	});
	return {
		inviteUrl,
		emailed: result.success,
		reason: result.success ? undefined : result.reason,
	};
}

/**
 * Core invite logic, callable from both the single-invite server function and
 * the bulk CSV import. Creates (or reuses) a User + role profile and issues an
 * activation invite, then emails the link. Throws on hard failures.
 */
export async function issueUserInvite(input: {
	name: string;
	email: string;
	type: "STUDENT" | "STAFF";
	payload?: InvitePayload;
}) {
	const { name, email, type } = input;
	const payload = InvitePayloadSchema.parse(input.payload ?? {});
	const { organizationId, branchId } = await getOrgContext();

	// Reject if an account is already active (has a credential password).
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing?.activatedAt) {
		throw new Error(
			"A user with that email has already activated their account.",
		);
	}

	const user =
		existing ??
		(await prisma.user.create({
			data: { id: crypto.randomUUID(), name, email, emailVerified: false },
		}));
	if (existing && existing.name !== name) {
		await prisma.user.update({ where: { id: user.id }, data: { name } });
	}

	const role = type === "STUDENT" ? "STUDENT" : "STAFF";
	await prisma.userRole.upsert({
		where: {
			userId_organizationId_role: { userId: user.id, organizationId, role },
		},
		update: {},
		create: { userId: user.id, organizationId, branchId, role },
	});

	if (type === "STUDENT") {
		await prisma.student.upsert({
			where: { userId: user.id },
			update: {
				grade: payload.grade,
				section: payload.section,
				rollNo: payload.rollNo,
			},
			create: {
				userId: user.id,
				organizationId,
				branchId,
				grade: payload.grade,
				section: payload.section,
				rollNo: payload.rollNo,
				status: "ACTIVE",
			},
		});
	} else {
		await prisma.staff.upsert({
			where: { userId: user.id },
			update: {
				designation: payload.designation ?? "Staff",
				department: payload.department,
			},
			create: {
				userId: user.id,
				organizationId,
				branchId,
				designation: payload.designation ?? "Staff",
				department: payload.department,
				employeeId: payload.employeeId,
				status: "ACTIVE",
			},
		});
	}

	// Invalidate any outstanding invites for this user, then issue a fresh one.
	await prisma.invite.updateMany({
		where: { userId: user.id, usedAt: null },
		data: { usedAt: new Date() },
	});
	const invite = await prisma.invite.create({
		data: {
			token: crypto.randomUUID(),
			userId: user.id,
			type,
			expiresAt: new Date(Date.now() + INVITE_TTL_MS),
			payload: payload as any,
		},
	});

	const delivery = await deliverInvite({
		name,
		email,
		type,
		token: invite.token,
	});
	return { success: true, inviteId: invite.id, email, ...delivery };
}

/**
 * Create (or reuse) a User + role profile and issue an activation invite.
 * Generalizes the original hardcoded staff-only `create-invite.ts` to both
 * students and staff, resolves org/branch by slug, and emails the link.
 */
export const createUserInvite = createServerFn({ method: "POST" })
	.middleware([requireAdmin])
	.validator(CreateInviteSchema)
	.handler(async ({ data }) => {
		return issueUserInvite(data);
	});

const IdSchema = z.object({ id: z.string().min(1) });

/** Re-issue an invite with a fresh token and resend the email. */
export const resendInvite = createServerFn({ method: "POST" })
	.middleware([requireAdmin])
	.validator(IdSchema)
	.handler(async ({ data }) => {
		const invite = await prisma.invite.findUnique({
			where: { id: data.id },
			include: { user: true },
		});
		if (!invite) throw new Error("Invite not found");
		if (invite.user.activatedAt)
			throw new Error("That account is already active.");

		await prisma.invite.update({
			where: { id: invite.id },
			data: { usedAt: new Date() },
		});
		const fresh = await prisma.invite.create({
			data: {
				token: crypto.randomUUID(),
				userId: invite.userId,
				type: invite.type,
				expiresAt: new Date(Date.now() + INVITE_TTL_MS),
				payload: invite.payload as any,
			},
		});
		const delivery = await deliverInvite({
			name: invite.user.name,
			email: invite.user.email,
			type: invite.type,
			token: fresh.token,
		});
		return {
			success: true,
			inviteId: fresh.id,
			email: invite.user.email,
			...delivery,
		};
	});

/** Revoke a pending invite (mark it used so the link no longer works). */
export const revokeInvite = createServerFn({ method: "POST" })
	.middleware([requireAdmin])
	.validator(IdSchema)
	.handler(async ({ data }) => {
		const invite = await prisma.invite.findUnique({ where: { id: data.id } });
		if (!invite) throw new Error("Invite not found");
		await prisma.invite.update({
			where: { id: invite.id },
			data: { usedAt: new Date() },
		});
		return { success: true };
	});

const ListSchema = z
	.object({
		type: RoleEnum.optional(),
		status: z.enum(["pending", "used", "expired", "all"]).optional(),
	})
	.optional();

/** List invites with their user + computed status for the admin Users page. */
export const listInvites = createServerFn({ method: "GET" })
	.middleware([requireAdmin])
	.validator(ListSchema)
	.handler(async ({ data }) => {
		const now = new Date();
		const invites = await prisma.invite.findMany({
			where: {
				type: data?.type,
				...(data?.status === "pending"
					? { usedAt: null, expiresAt: { gt: now } }
					: data?.status === "used"
						? { usedAt: { not: null } }
						: data?.status === "expired"
							? { usedAt: null, expiresAt: { lte: now } }
							: {}),
			},
			include: {
				user: {
					select: { id: true, name: true, email: true, activatedAt: true },
				},
			},
			orderBy: { createdAt: "desc" },
		});
		return invites.map((inv) => ({
			id: inv.id,
			token: inv.token,
			type: inv.type,
			email: inv.user.email,
			name: inv.user.name,
			activated: Boolean(inv.user.activatedAt),
			createdAt: inv.createdAt.toISOString(),
			expiresAt: inv.expiresAt.toISOString(),
			usedAt: inv.usedAt?.toISOString() ?? null,
			inviteUrl: buildInviteUrl(inv.token),
			status: inv.usedAt
				? ("used" as const)
				: inv.expiresAt < now
					? ("expired" as const)
					: ("pending" as const),
		}));
	});
