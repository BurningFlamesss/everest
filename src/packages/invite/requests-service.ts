import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	renderMailTemplate,
	sendMail,
} from "#/packages/notifications/mail.ts";
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

	const invite =
		request.type === "STUDENT"
			? await createStudentInvite({
					name: request.name,
					email: request.email,
					sendEmail: input.sendEmail,
				})
			: await createStaffInvite({
					name: request.name,
					email: request.email,
					sendEmail: input.sendEmail,
				});

	const updated = await prisma.inviteRequest.update({
		where: { id: request.id },
		data: {
			status: "APPROVED",
			reviewedById: input.reviewerId,
			reviewedAt: new Date(),
		},
	});

	return { request: updated, invite };
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

	return prisma.inviteRequest.update({
		where: { id: request.id },
		data: {
			status: "REJECTED",
			reviewedById: input.reviewerId,
			reviewedAt: new Date(),
			reviewNote: input.note?.trim() || null,
		},
	});
}
