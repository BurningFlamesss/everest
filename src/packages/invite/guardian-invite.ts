import { createServerFn } from "@tanstack/react-start";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { serverEnv } from "#/env/server.ts";
import { getSessionMiddleware } from "#/packages/auth/middleware/auth.middleware.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	isMailConfigured,
	renderMailTemplate,
	sendMail,
} from "#/packages/notifications/mail.ts";
import { getOrgContext } from "#/packages/school/context.ts";

const GUARDIAN_INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

function buildGuardianInviteUrl(token: string): string {
	const base = serverEnv.APP_URL.replace(/\/+$/, "");
	return `${base}/activate/guardian/${token}`;
}

const CreateGuardianInviteSchema = z.object({
	studentId: z.string().min(1),
	guardianName: z.string().min(1),
	guardianEmail: z.string().email(),
	relation: z.string().min(1),
});

/**
 * Issue a guardian invite for a student. Callable by an admin, or by the
 * student themselves (self-service from the student portal). The student and
 * admin paths converge here; admins are authorized via `requireAdmin`, students
 * are checked against their own Student record below.
 */
export const createGuardianInvite = createServerFn({ method: "POST" })
	.middleware([getSessionMiddleware])
	.validator(CreateGuardianInviteSchema)
	.handler(async ({ data, context }) => {
		const session = (context as any)?.session;
		if (!session?.user) throw new Error("UNAUTHENTICATED");

		const student = await prisma.student.findUnique({
			where: { id: data.studentId },
			include: { user: { select: { id: true, name: true, email: true } } },
		});
		if (!student) throw new Error("Student not found");

		const callerRole = session.user.role as string | undefined;
		const isAdmin = callerRole === "admin" || callerRole === "super_admin";
		const isSelf = student.userId === session.user.id;
		if (!isAdmin && !isSelf) throw new Error("FORBIDDEN");

		const delivery = await issueGuardianInvite({
			student,
			guardianName: data.guardianName,
			guardianEmail: data.guardianEmail,
			relation: data.relation,
		});
		return { success: true, ...delivery };
	});

async function issueGuardianInvite(args: {
	student: { id: string; user: { name: string } };
	guardianName: string;
	guardianEmail: string;
	relation: string;
}) {
	const { student, guardianName, guardianEmail, relation } = args;

	await prisma.guardianInvite.updateMany({
		where: { studentId: student.id, usedAt: null },
		data: { usedAt: new Date() },
	});
	const invite = await prisma.guardianInvite.create({
		data: {
			token: crypto.randomUUID(),
			studentId: student.id,
			guardianEmail,
			expiresAt: new Date(Date.now() + GUARDIAN_INVITE_TTL_MS),
		},
	});

	const inviteUrl = buildGuardianInviteUrl(invite.token);
	let emailed = false;
	let reason: string | undefined;
	if (isMailConfigured()) {
		const result = await sendMail({
			to: guardianEmail,
			subject: `${serverEnv.ORGANIZATION_NAME}: guardian access for ${student.user.name}`,
			html: renderMailTemplate({
				title: `Guardian access for ${student.user.name}`,
				body: `Hello ${guardianName}, ${serverEnv.ORGANIZATION_NAME} has invited you to follow updates for ${student.user.name}. Set a password to activate your guardian account.`,
				actionLabel: "Activate guardian account",
				actionUrl: inviteUrl,
			}),
		});
		emailed = result.success;
		reason = result.details?.error ?? result.message;
	} else {
		reason = "mail_unconfigured";
	}

	// Stash relation alongside the invite so activation can record it. The
	// relation is supplied again at activation, so we don't persist it here.
	return { inviteUrl, emailed, reason, relation, inviteId: invite.id };
}

/** Look up a guardian invite for the activation page. */
export const getGuardianInvite = createServerFn({ method: "GET" })
	.validator(z.string().min(1))
	.handler(async ({ data: token }) => {
		const cleanToken = decodeURIComponent(token.trim()).replace(/\/+$/, "");
		return prisma.guardianInvite.findFirst({
			where: { token: cleanToken },
			include: {
				student: { include: { user: { select: { name: true, email: true } } } },
			},
		});
	});

const ActivateGuardianSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
	guardianName: z.string().min(1),
	relation: z.string().min(1).default("Guardian"),
});

/** Activate a guardian account: create the user + guardian link + password. */
export const activateGuardianInvite = createServerFn({ method: "POST" })
	.validator(ActivateGuardianSchema)
	.handler(async ({ data }) => {
		const { token, password, guardianName, relation } = data;

		const invite = await prisma.guardianInvite.findUnique({
			where: { token },
			include: { student: true },
		});
		if (!invite) throw new Error("INVITE_NOT_FOUND");
		if (invite.usedAt) throw new Error("INVITE_ALREADY_USED");
		if (invite.expiresAt < new Date()) throw new Error("INVITE_EXPIRED");

		const email = invite.guardianEmail;
		if (!email) throw new Error("INVITE_MISSING_EMAIL");

		const { organizationId, branchId } = await getOrgContext();
		const hashedPassword = await hashPassword(password);

		const result = await prisma.$transaction(async (tx) => {
			let user = await tx.user.findUnique({ where: { email } });
			if (!user) {
				user = await tx.user.create({
					data: {
						id: crypto.randomUUID(),
						name: guardianName,
						email,
						emailVerified: true,
						activatedAt: new Date(),
					},
				});
			} else if (!user.activatedAt) {
				user = await tx.user.update({
					where: { id: user.id },
					data: {
						activatedAt: new Date(),
						emailVerified: true,
						name: guardianName,
					},
				});
			}

			// Credential account (skip if one already exists).
			const existingAccount = await tx.account.findFirst({
				where: { userId: user.id, providerId: "credential" },
			});
			if (!existingAccount) {
				await tx.account.create({
					data: {
						id: crypto.randomUUID(),
						accountId: user.id,
						providerId: "credential",
						userId: user.id,
						password: hashedPassword,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				});
			}

			await tx.userRole.upsert({
				where: {
					userId_organizationId_role: {
						userId: user.id,
						organizationId,
						role: "GUARDIAN",
					},
				},
				update: {},
				create: { userId: user.id, organizationId, branchId, role: "GUARDIAN" },
			});

			const guardian = await tx.guardian.upsert({
				where: { userId: user.id },
				update: {},
				create: { userId: user.id },
			});

			await tx.guardianStudent.upsert({
				where: {
					guardianId_studentId: {
						guardianId: guardian.id,
						studentId: invite.studentId,
					},
				},
				update: { relation },
				create: {
					guardianId: guardian.id,
					studentId: invite.studentId,
					relation,
				},
			});

			await tx.guardianInvite.update({
				where: { id: invite.id },
				data: { usedAt: new Date() },
			});

			return user;
		});

		return { success: true, email: result.email };
	});
