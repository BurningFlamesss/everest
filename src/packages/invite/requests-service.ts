import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";
import { renderMailTemplate, sendMail } from "#/packages/notifications/mail.ts";
import {
	createStaffInvite,
	createStudentInvite,
	InviteError,
	normalizeEmail,
} from "./invite-service.ts";

export type InviteRequestKind = "STAFF" | "STUDENT";

export interface CreateInviteRequestInput {
	name: string;
	email: string;
	type: InviteRequestKind;
	message?: string;
}

export async function createInviteRequest(input: CreateInviteRequestInput) {
	const email = normalizeEmail(input.email);
	const name = input.name.trim();

	const existing = await prisma.inviteRequest.findFirst({
		where: { email, type: input.type, status: "PENDING" },
	});

	if (existing) {
		throw new InviteError(
			"A request for this email is already waiting for review.",
			"REQUEST_ALREADY_PENDING",
		);
	}

	const request = await prisma.inviteRequest.create({
		data: {
			name,
			email,
			type: input.type,
			message: input.message?.trim() || null,
		},
	});

	void sendMail({
		to: serverEnv.SUPER_ADMIN_EMAIL,
		subject: `New ${input.type.toLowerCase()} invitation request`,
		html: renderMailTemplate({
			title: "New invitation request",
			body: [
				`${name} (${email}) requested ${input.type === "STUDENT" ? "student" : "staff"} access.`,
				input.message?.trim() || "No message was included.",
				"Open the admin invitations page to approve or reject this request.",
			],
			actionLabel: "Review requests",
			actionUrl: `${serverEnv.APP_URL.replace(/\/$/, "")}/admin/invites`,
		}),
	});

	return request;
}

export async function listInviteRequests(options?: {
	status?: "PENDING" | "APPROVED" | "REJECTED";
	limit?: number;
}) {
	return prisma.inviteRequest.findMany({
		where: options?.status ? { status: options.status } : undefined,
		include: {
			reviewedBy: { select: { id: true, name: true, email: true } },
		},
		orderBy: { createdAt: "desc" },
		take: Math.min(Math.max(options?.limit ?? 100, 1), 200),
	});
}

export async function countPendingInviteRequests() {
	return prisma.inviteRequest.count({ where: { status: "PENDING" } });
}

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

export async function approveInviteRequest(input: {
	id: string;
	reviewerId: string;
	sendEmail?: boolean;
}) {
	const request = await prisma.inviteRequest.findUnique({
		where: { id: input.id },
	});

	if (!request) {
		throw new InviteError("Request not found", "REQUEST_NOT_FOUND");
	}

	if (request.status !== "PENDING") {
		throw new InviteError(
			"This request has already been reviewed.",
			"REQUEST_ALREADY_REVIEWED",
		);
	}

	// Claim the request atomically so a double click cannot create two invites.
	const claimed = await prisma.inviteRequest.updateMany({
		where: { id: request.id, status: "PENDING" },
		data: {
			status: "APPROVED",
			reviewedById: input.reviewerId,
			reviewedAt: new Date(),
		},
	});

	if (claimed.count === 0) {
		throw new InviteError(
			"This request has already been reviewed.",
			"REQUEST_ALREADY_REVIEWED",
		);
	}

	// The invite itself is created without its own email so the requester
	// receives exactly one decision message containing the activation link.
	let invite: Awaited<ReturnType<typeof createStudentInvite>>;

	try {
		invite =
			request.type === "STUDENT"
				? await createStudentInvite({
						name: request.name,
						email: request.email,
						sendEmail: false,
					})
				: await createStaffInvite({
						name: request.name,
						email: request.email,
						sendEmail: false,
					});
	} catch (error) {
		// Release the claim so the reviewer can retry after a failure.
		await prisma.inviteRequest.updateMany({
			where: {
				id: request.id,
				status: "APPROVED",
				reviewedById: input.reviewerId,
			},
			data: { status: "PENDING", reviewedById: null, reviewedAt: null },
		});

		throw error;
	}

	const updated = await prisma.inviteRequest.findUniqueOrThrow({
		where: { id: request.id },
	});

	const decision = await sendMail({
		to: request.email,
		subject: `Your ${serverEnv.ORGANIZATION_NAME} invitation request was approved`,
		html: renderMailTemplate({
			title: "You're approved",
			body: [
				`Hi ${escapeHtml(request.name)}, the school office approved your ${request.type === "STUDENT" ? "student" : "staff"} access request.`,
				"Choose a password with the button below to activate your account. The link expires in 7 days.",
			],
			actionLabel: "Activate my account",
			actionUrl: invite.url,
		}),
	});

	return { request: updated, invite, decisionEmailSent: decision.success };
}

export async function rejectInviteRequest(input: {
	id: string;
	reviewerId: string;
	note?: string;
}) {
	const request = await prisma.inviteRequest.findUnique({
		where: { id: input.id },
	});

	if (!request) {
		throw new InviteError("Request not found", "REQUEST_NOT_FOUND");
	}

	if (request.status !== "PENDING") {
		throw new InviteError(
			"This request has already been reviewed.",
			"REQUEST_ALREADY_REVIEWED",
		);
	}

	const note = input.note?.trim() || null;

	const claimed = await prisma.inviteRequest.updateMany({
		where: { id: request.id, status: "PENDING" },
		data: {
			status: "REJECTED",
			reviewedById: input.reviewerId,
			reviewedAt: new Date(),
			reviewNote: note,
		},
	});

	if (claimed.count === 0) {
		throw new InviteError(
			"This request has already been reviewed.",
			"REQUEST_ALREADY_REVIEWED",
		);
	}

	const updated = await prisma.inviteRequest.findUniqueOrThrow({
		where: { id: request.id },
	});

	const decision = await sendMail({
		to: request.email,
		subject: `Your ${serverEnv.ORGANIZATION_NAME} invitation request was not approved`,
		html: renderMailTemplate({
			title: "Request not approved",
			body: [
				`Hi ${escapeHtml(request.name)}, the school office reviewed your ${request.type === "STUDENT" ? "student" : "staff"} access request and could not approve it.`,
				...(note
					? [`Note from the school office: ${escapeHtml(note)}`]
					: ["Contact the school office if you believe this was a mistake."]),
			],
		}),
	});

	return { request: updated, decisionEmailSent: decision.success };
}
