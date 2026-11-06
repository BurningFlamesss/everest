import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	addExamSchedule,
	createExam,
	deleteExam,
	deleteExamSchedule,
	getExamRoster,
	getResultsForUser,
	listExams,
	publishExam,
	saveMarks,
} from "./exams-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_EXAMS");

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

	console.error("Exam action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

export const getExamOptionsFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [terms, courses] = await Promise.all([
			prisma.term.findMany({
				include: { academicYear: { select: { name: true, isActive: true } } },
				orderBy: [{ academicYear: { startsOn: "desc" } }, { startsOn: "asc" }],
			}),
			prisma.course.findMany({
				where: { isActive: true },
				select: {
					id: true,
					code: true,
					name: true,
					grade: true,
					section: true,
				},
				orderBy: [{ grade: "asc" }, { name: "asc" }],
			}),
		]);

		return { success: true as const, terms, courses };
	} catch (error) {
		return failure(error);
	}
});

export const getExamsDataFn = createServerFn()
	.validator(z.object({ termId: z.string().optional() }).optional())
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const exams = await listExams(data?.termId);

			return { success: true as const, exams };
		} catch (error) {
			return failure(error);
		}
	});

const examSchema = z.object({
	termId: z.string().min(1),
	name: z.string().trim().min(1, "Name is required").max(120),
	startsOn: z.string().min(1),
	endsOn: z.string().min(1),
});

export const createExamAction = createServerFn()
	.validator(examSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const exam = await createExam({
				termId: data.termId,
				name: data.name,
				startsOn: new Date(data.startsOn),
				endsOn: new Date(data.endsOn),
			});

			return { success: true as const, exam };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteExamAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteExam(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const scheduleSchema = z.object({
	examId: z.string().min(1),
	courseId: z.string().min(1),
	date: z.string().min(1),
	startsAt: z.string().trim().optional(),
	maxMarks: z.number().int().min(1).max(1000),
	room: z.string().trim().optional(),
});

export const addExamScheduleAction = createServerFn()
	.validator(scheduleSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const schedule = await addExamSchedule({
				examId: data.examId,
				courseId: data.courseId,
				date: new Date(data.date),
				startsAt: data.startsAt,
				maxMarks: data.maxMarks,
				room: data.room,
			});

			return { success: true as const, schedule };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteExamScheduleAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteExamSchedule(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const getExamRosterAction = createServerFn()
	.validator(z.object({ scheduleId: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const roster = await getExamRoster(data.scheduleId);

			return { success: true as const, ...roster };
		} catch (error) {
			return failure(error);
		}
	});

export const saveMarksAction = createServerFn()
	.validator(
		z.object({
			scheduleId: z.string().min(1),
			marks: z
				.array(
					z.object({
						studentId: z.string().min(1),
						score: z.number().min(0).max(1000).nullable(),
					}),
				)
				.max(500),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const { staffId } = await requireManager();
			const roster = await saveMarks({
				scheduleId: data.scheduleId,
				enteredById: staffId,
				marks: data.marks,
			});

			return { success: true as const, ...roster };
		} catch (error) {
			return failure(error);
		}
	});

export const publishExamAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const exam = await publishExam(data.id);

			return { success: true as const, exam };
		} catch (error) {
			return failure(error);
		}
	});

export const getMyResultsFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return [];

	return getResultsForUser(session.user.id);
});
