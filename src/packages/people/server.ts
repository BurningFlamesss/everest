import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import { hasAnyPermission } from "#/packages/auth/permissions.ts";
import { listStudentOptions } from "./directory-service.ts";

const STUDENT_PICKER_PERMISSIONS = [
	"MANAGE_INVITES",
	"MANAGE_ACADEMICS",
	"MANAGE_TRANSPORT",
	"MANAGE_ATTENDANCE",
	"MANAGE_DIRECTORY",
] as const;

const searchSchema = z
	.object({
		search: z.string().trim().max(100).optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.optional();

/**
 * Student lookup shared by the invite, transport and academics screens.
 *
 * The three screens each need a student picker, but none of them should load
 * the whole student body. This endpoint returns a short, searchable list.
 */
export const searchStudentsFn = createServerFn()
	.validator(searchSchema)
	.handler(async ({ data }) => {
		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const session = await auth.api.getSession({ headers: getRequestHeaders() });

		if (!session?.user?.id) {
			return { success: false as const, error: "Please sign in to continue." };
		}

		const allowed = await hasAnyPermission(session.user.id, [
			...STUDENT_PICKER_PERMISSIONS,
		]);

		if (!allowed) {
			return {
				success: false as const,
				error: "You cannot view the student list.",
			};
		}

		const students = await listStudentOptions(data ?? {});

		return { success: true as const, students };
	});
