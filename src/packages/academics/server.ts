import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { ERROR_CODES } from "#/lib/error-codes.ts";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createClass,
	createClassroom,
	createCourse,
	deleteClass,
	deleteClassroom,
	deleteCourse,
	enrollStudents,
	getCourse,
	listClasses,
	listClassrooms,
	listCourses,
	listStaffForCourses,
	removeEnrollment,
	updateClass,
	updateClassroom,
	updateCourse,
} from "./courses-service.ts";

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
			code: ERROR_CODES.UNAUTHORIZED,
		};
	}

	console.error("Academics action failed:", error);

	const message =
		error instanceof Error ? error.message : "Something went wrong";

	return {
		success: false as const,
		error:
			message === ERROR_CODES.COURSE_CODE_TAKEN
				? "Another course already uses that code."
				: message,
		code: ERROR_CODES.INTERNAL_ERROR,
	};
}

export const getAcademicsDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [courses, classrooms, classes, staff] = await Promise.all([
			listCourses({ includeInactive: true }),
			listClassrooms({ includeInactive: true }),
			listClasses(),
			listStaffForCourses(),
		]);

		return { success: true as const, courses, classrooms, classes, staff };
	} catch (error) {
		return failure(error);
	}
});

export const getCourseDetailsAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const course = await getCourse(data.id);

			if (!course) {
				return { success: false as const, error: "Course not found" };
			}

			return { success: true as const, course };
		} catch (error) {
			return failure(error);
		}
	});

const classroomSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	building: z.string().trim().optional(),
	floor: z.string().trim().optional(),
	capacity: z.number().int().positive().max(10000).nullable().optional(),
	notes: z.string().trim().optional(),
	isActive: z.boolean().optional(),
});

export const createClassroomAction = createServerFn()
	.validator(classroomSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const classroom = await createClassroom(data);

			return { success: true as const, classroom };
		} catch (error) {
			return failure(error);
		}
	});

export const updateClassroomAction = createServerFn()
	.validator(classroomSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const classroom = await updateClassroom(id, input);

			return { success: true as const, classroom };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteClassroomAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteClassroom(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const classSchema = z.object({
	grade: z.string().trim().min(1, "Grade is required").max(80),
	section: z.string().trim().min(1, "Section is required").max(20),
	roomNo: z.string().trim().optional(),
	capacity: z.number().int().positive().max(1000).optional(),
	classTeacherId: z.string().trim().nullable().optional(),
	academicYear: z.string().trim().optional(),
});

export const createClassAction = createServerFn()
	.validator(classSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const classroom = await createClass(data);

			return { success: true as const, classroom };
		} catch (error) {
			return failure(error);
		}
	});

export const updateClassAction = createServerFn()
	.validator(classSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			const { id, ...input } = data;
			await requireManager();
			const classroom = await updateClass(id, input);

			return { success: true as const, classroom };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteClassAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteClass(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const courseSchema = z.object({
	code: z.string().trim().min(1, "Code is required").max(40),
	name: z.string().trim().min(1, "Name is required").max(160),
	description: z.string().trim().max(2000).optional(),
	grade: z.string().trim().max(80).optional(),
	section: z.string().trim().max(80).optional(),
	schedule: z.string().trim().max(200).optional(),
	teacherId: z.string().trim().nullable().optional(),
	classroomId: z.string().trim().nullable().optional(),
	isActive: z.boolean().optional(),
});

export const createCourseAction = createServerFn()
	.validator(courseSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const course = await createCourse(data);

			return { success: true as const, course };
		} catch (error) {
			return failure(error);
		}
	});

export const updateCourseAction = createServerFn()
	.validator(courseSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const course = await updateCourse(id, input);

			return { success: true as const, course };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteCourseAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteCourse(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const enrollStudentsAction = createServerFn()
	.validator(
		z.object({
			courseId: z.string().min(1),
			studentIds: z.array(z.string().min(1)).min(1).max(500),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const count = await enrollStudents(data.courseId, data.studentIds);

			return { success: true as const, count };
		} catch (error) {
			return failure(error);
		}
	});

export const removeEnrollmentAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await removeEnrollment(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});
