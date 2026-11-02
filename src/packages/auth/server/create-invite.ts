import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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
 * Legacy self-service invitation endpoint used by the onboarding screen.
 *
 * The admin console uses the role-protected actions in
 * `src/packages/invite/server.ts` instead.
 */
export const createInvite = createServerFn()
	.validator(createInviteSchema)
	.handler(async ({ data }) => {
		try {
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

			console.error("Could not create invite:", error);

			return {
				invite: null,
				success: false,
				error: "Could not create the invitation",
				code: "INTERNAL_ERROR",
			};
		}
	});
