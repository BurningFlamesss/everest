import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "#/packages/auth/server/guard.ts";
import { issueUserInvite } from "#/packages/invite/invite-service.ts";

/**
 * @deprecated Legacy single-invite entry point kept for the existing StaffPage.
 * New code should use `createUserInvite` from `#/packages/invite/invite-service.ts`,
 * which resolves org/branch by slug and emails the link. This wrapper preserves
 * the old `{invite, success}` return shape.
 */
const createInviteSchema = z.object({
	name: z.string().min(1),
	email: z.string().min(1),
});

export const createInvite = createServerFn({ method: "POST" })
	.middleware([requireAdmin])
	.validator(createInviteSchema)
	.handler(async ({ data }) => {
		try {
			const out = await issueUserInvite({
				name: data.name,
				email: data.email,
				type: "STAFF",
				payload: {},
			});
			return {
				invite: { id: out.inviteId, token: out.inviteUrl.split("/").pop() },
				inviteUrl: out.inviteUrl,
				emailed: out.emailed,
				success: true,
			};
		} catch {
			return { invite: null, success: false };
		}
	});
