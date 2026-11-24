import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	canTeacherAccessAssignment,
	canTeacherAccessCourse,
	getTeacherCourseAccess,
} from "./teacher-access.ts";
import {
	createAssignment,
	deleteAssignment,
	getAssignmentsForUser,
	listAssignments,
	updateAssignment,
} from "./homework-service.ts";

async function requireAuthUser() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

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
			const user = await requireAuthUser();
			const access = await getTeacherCourseAccess(user.id, "MANAGE_ACADEMICS");

			if (
				access.accessibleCourseIds !== "ALL" &&
				access.accessibleCourseIds.length === 0
			) {
				throw new AuthorizationError(
					"You do not have permission to manage homework or have not been assigned any teaching subjects.",
				);
			}

			if (data?.courseId && access.accessibleCourseIds !== "ALL") {
				if (!access.accessibleCourseIds.includes(data.courseId)) {
					throw new AuthorizationError("You do not teach this subject.");
				}
			}

			const courseFilter = data?.courseId
				? data.courseId
				: access.accessibleCourseIds === "ALL"
					? undefined
					: access.accessibleCourseIds;

			const [assignments, courses] = await Promise.all([
				listAssignments(courseFilter),
				prisma.course.findMany({
					where: {
						isActive: true,
						...(access.accessibleCourseIds === "ALL"
							? {}
							: { id: { in: access.accessibleCourseIds } }),
					},
					select: { id: true, code: true, name: true },
					orderBy: [{ grade: "asc" }, { name: "asc" }],
				}),
			]);

			return { success: true as const, assignments, courses };
		} catch (error) {
			return failure(error);
		}
	});

export const createAssignmentAction = createServerFn()
	.validator(assignmentSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireAuthUser();
			const allowed = await canTeacherAccessCourse(
				user.id,
				data.courseId,
				"MANAGE_ACADEMICS",
			);
			if (!allowed) {
				throw new AuthorizationError(
					"You can only create assignments for subjects you teach.",
				);
			}

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
			const user = await requireAuthUser();
			const allowed = await canTeacherAccessAssignment(user.id, data.id);
			if (!allowed) {
				throw new AuthorizationError(
					"You can only edit assignments for subjects you teach.",
				);
			}

			if (data.courseId) {
				const courseAllowed = await canTeacherAccessCourse(
					user.id,
					data.courseId,
					"MANAGE_ACADEMICS",
				);
				if (!courseAllowed) {
					throw new AuthorizationError(
						"You can only assign homework to subjects you teach.",
					);
				}
			}

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
			const user = await requireAuthUser();
			const allowed = await canTeacherAccessAssignment(user.id, data.id);
			if (!allowed) {
				throw new AuthorizationError(
					"You can only delete assignments for subjects you teach.",
				);
			}

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
