import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import { listCourses } from "#/packages/academics/courses-service.ts";
import {
	deleteAttendanceSession,
	getAttendanceSession,
	getAttendanceSummary,
	listAttendanceSessions,
	openAttendanceSession,
	saveAttendance,
} from "./service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_ATTENDANCE");

	const staff = await prisma.staff.findUnique({
		where: { userId: session.user.id },
		select: { id: true },
	});

	return { user: session.user, staffId: staff?.id ?? null };
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Attendance action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

export const getAttendanceDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [courses, sessions] = await Promise.all([
			listCourses({ includeInactive: false }),
			listAttendanceSessions({ limit: 20 }),
		]);

		return { success: true as const, courses, sessions };
	} catch (error) {
		return failure(error);
	}
});

const openSchema = z.object({
	courseId: z.string().min(1),
	date: z.string().min(1),
	topic: z.string().trim().max(200).optional(),
});

export const openAttendanceSessionAction = createServerFn()
	.validator(openSchema)
	.handler(async ({ data }) => {
		try {
			const { staffId } = await requireManager();
			const session = await openAttendanceSession({
				...data,
				takenById: staffId,
			});

			return { success: true as const, session };
		} catch (error) {
			return failure(error);
		}
	});

const saveSchema = z.object({
	sessionId: z.string().min(1),
	records: z
		.array(
			z.object({
				studentId: z.string().min(1),
				status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
				note: z.string().trim().max(300).optional(),
			}),
		)
		.max(500),
});

export const saveAttendanceAction = createServerFn()
	.validator(saveSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const session = await saveAttendance(data);

			return { success: true as const, session };
		} catch (error) {
			return failure(error);
		}
	});

export const getAttendanceSessionAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const session = await getAttendanceSession(data.id);

			if (!session) {
				return { success: false as const, error: "Session not found" };
			}

			return { success: true as const, session };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteAttendanceSessionAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteAttendanceSession(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const getAttendanceSummaryAction = createServerFn()
	.validator(z.object({ courseId: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const summary = await getAttendanceSummary(data.courseId);

			return { success: true as const, summary };
		} catch (error) {
			return failure(error);
		}
	});
