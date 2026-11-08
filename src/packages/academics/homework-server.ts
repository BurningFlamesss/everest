import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createAssignment,
	deleteAssignment,
	getAssignmentsForUser,
	listAssignments,
	updateAssignment,
} from "./homework-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_ACADEMICS");

	return session.user;
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Homework action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

const attachmentSchema = z.object({
	fileAssetId: z.string().min(1),
	label: z.string().trim().max(200).optional(),
});

const assignmentSchema = z.object({
	courseId: z.string().min(1),
	title: z.string().trim().min(1, "Title is required").max(160),
	instructions: z.string().trim().min(1, "Instructions are required").max(5000),
	dueAt: z.string().min(1),
	attachments: z.array(attachmentSchema).max(10).optional(),
});

export const getHomeworkDataFn = createServerFn()
	.validator(z.object({ courseId: z.string().optional() }).optional())
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const assignments = await listAssignments(data?.courseId);

			return { success: true as const, assignments };
		} catch (error) {
			return failure(error);
		}
	});

export const createAssignmentAction = createServerFn()
	.validator(assignmentSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireManager();
			const assignment = await createAssignment({
				...data,
				dueAt: new Date(data.dueAt),
				createdById: user.id,
			});

			return { success: true as const, assignment };
		} catch (error) {
			return failure(error);
		}
	});

export const updateAssignmentAction = createServerFn()
	.validator(assignmentSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, dueAt, ...input } = data;
			const assignment = await updateAssignment(id, {
				...input,
				...(dueAt ? { dueAt: new Date(dueAt) } : {}),
			});

			return { success: true as const, assignment };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteAssignmentAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteAssignment(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const getMyAssignmentsFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return [];

	return getAssignmentsForUser(session.user.id);
});
