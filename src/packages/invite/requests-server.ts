import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { InviteError } from "./invite-service.ts";
import {
	approveInviteRequest,
	createInviteRequest,
	listInviteRequests,
	rejectInviteRequest,
} from "./requests-service.ts";

function failure(error: unknown) {
	if (error instanceof InviteError) {
		return { success: false as const, error: error.message, code: error.code };
	}

	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Invite request failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_INVITES");

	return session.user;
}

const publicRequestSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(120),
	email: z.string().trim().email("Enter a valid email address").max(200),
	type: z.enum(["STAFF", "STUDENT"]),
	message: z.string().trim().max(1000).optional(),
});

export const requestInviteAction = createServerFn()
	.validator(publicRequestSchema)
	.handler(async ({ data }) => {
		try {
			const request = await createInviteRequest(data);

			return {
				success: true as const,
				request: {
					id: request.id,
					name: request.name,
					email: request.email,
					type: request.type,
					status: request.status,
				},
			};
		} catch (error) {
			return failure(error);
		}
	});

const listRequestsSchema = z
	.object({
		status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
	})
	.optional();

export const listInviteRequestsAction = createServerFn()
	.validator(listRequestsSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const requests = await listInviteRequests(data ?? {});

			return { success: true as const, requests };
		} catch (error) {
			return failure(error);
		}
	});

const approveSchema = z.object({
	id: z.string().min(1),
	sendEmail: z.boolean().optional(),
});

export const approveInviteRequestAction = createServerFn()
	.validator(approveSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireManager();
			const result = await approveInviteRequest({
				id: data.id,
				reviewerId: user.id,
				sendEmail: data.sendEmail,
			});

			return { success: true as const, ...result };
		} catch (error) {
			return failure(error);
		}
	});

const rejectSchema = z.object({
	id: z.string().min(1),
	note: z.string().trim().max(500).optional(),
});

export const rejectInviteRequestAction = createServerFn()
	.validator(rejectSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireManager();
			const result = await rejectInviteRequest({
				id: data.id,
				reviewerId: user.id,
				note: data.note,
			});

			return { success: true as const, ...result };
		} catch (error) {
			return failure(error);
		}
	});
