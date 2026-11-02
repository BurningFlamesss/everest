import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createStaffInvite,
	createStudentInvite,
	InviteError,
} from "#/packages/invite/invite-service.ts";

const createInviteSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Enter a valid email address"),
	type: z.enum(["STAFF", "STUDENT"]).optional(),
	designation: z.string().trim().optional(),
	grade: z.string().trim().optional(),
	section: z.string().trim().optional(),
	sendEmail: z.boolean().optional(),
});

/**
 * Legacy invitation endpoint retained for older clients.
 *
 * It now requires the same `MANAGE_INVITES` permission as the admin console.
 * New public requests go through `requestInviteAction` instead.
 */
export const createInvite = createServerFn()
	.validator(createInviteSchema)
	.handler(async ({ data }) => {
		try {
			const { getRequestHeaders } = await import("@tanstack/react-start/server");
			const session = await auth.api.getSession({
				headers: getRequestHeaders(),
			});

			if (!session?.user?.id) {
				throw new AuthorizationError("Please sign in to continue");
			}

			await requirePermission(session.user.id, "MANAGE_INVITES");

			const invite =
				data.type === "STUDENT"
					? await createStudentInvite({
							name: data.name,
							email: data.email,
							grade: data.grade,
							section: data.section,
							sendEmail: data.sendEmail,
						})
					: await createStaffInvite({
							name: data.name,
							email: data.email,
							designation: data.designation,
							sendEmail: data.sendEmail,
						});

			return {
				invite: {
					id: invite.id,
					token: invite.token,
					type: invite.type,
					expiresAt: invite.expiresAt,
					url: invite.url,
				},
				success: true,
			};
		} catch (error) {
			if (error instanceof InviteError) {
				return {
					invite: null,
					success: false,
					error: error.message,
					code: error.code,
				};
			}

			if (error instanceof AuthorizationError) {
				return {
					invite: null,
					success: false,
					error: error.message,
					code: "UNAUTHORIZED",
				};
			}

			console.error("Could not create invite:", error);

			return {
				invite: null,
				success: false,
				error: "Could not create the invitation",
				code: "INTERNAL_ERROR",
			};
		}
	});
