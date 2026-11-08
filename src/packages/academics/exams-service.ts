import { prisma } from "#/packages/db/index.ts";
import {
	notifyRoles,
	notifyUsers,
} from "#/packages/notifications/notification-service.ts";

export async function listExams(termId?: string) {
	return prisma.exam.findMany({
		where: termId ? { termId } : undefined,
		include: {
			term: {
				select: {
					id: true,
					name: true,
					academicYear: { select: { id: true, name: true, isActive: true } },
				},
			},
			schedules: {
				include: {
					course: { select: { id: true, code: true, name: true } },
					_count: { select: { marks: true } },
				},
				orderBy: { date: "asc" },
			},
		},
		orderBy: [{ startsOn: "desc" }, { name: "asc" }],
	});
}

export async function createExam(input: {
	termId: string;
	name: string;
	startsOn: Date;
	endsOn: Date;
}) {
	if (input.endsOn < input.startsOn) {
		throw new Error("The exam end date must be after its start date.");
	}

	return prisma.exam.create({
		data: {
			termId: input.termId,
			name: input.name.trim(),
			startsOn: input.startsOn,
			endsOn: input.endsOn,
		},
	});
}

export async function deleteExam(id: string) {
	return prisma.exam.delete({ where: { id } });
}

export async function addExamSchedule(input: {
	examId: string;
	courseId: string;
	date: Date;
	startsAt?: string;
	maxMarks: number;
	room?: string;
}) {
	if (input.maxMarks < 1 || input.maxMarks > 1000) {
		throw new Error("Max marks must be between 1 and 1000.");
	}

	return prisma.examSchedule.upsert({
		where: {
			examId_courseId: { examId: input.examId, courseId: input.courseId },
		},
		update: {
			date: input.date,
			startsAt: input.startsAt || null,
			maxMarks: input.maxMarks,
			room: input.room?.trim() || null,
		},
		create: {
			examId: input.examId,
			courseId: input.courseId,
			date: input.date,
			startsAt: input.startsAt || null,
			maxMarks: input.maxMarks,
			room: input.room?.trim() || null,
		},
	});
}

export async function deleteExamSchedule(id: string) {
	return prisma.examSchedule.delete({ where: { id } });
}

export async function getExamRoster(scheduleId: string) {
	const schedule = await prisma.examSchedule.findUnique({
		where: { id: scheduleId },
		include: {
			exam: {
				select: {
					id: true,
					name: true,
					isPublished: true,
					term: { select: { name: true } },
				},
			},
			course: {
				select: {
					id: true,
					code: true,
					name: true,
					enrollments: {
						where: { status: "ACTIVE" },
						include: {
							student: {
								select: {
									id: true,
									user: { select: { name: true, email: true } },
								},
							},
						},
						orderBy: { student: { user: { name: "asc" } } },
					},
				},
			},
			marks: { select: { studentId: true, score: true } },
		},
	});

	if (!schedule) throw new Error("EXAM_SCHEDULE_NOT_FOUND");

	const scores = new Map(
		schedule.marks.map((mark) => [mark.studentId, mark.score]),
	);

	return {
		schedule: {
			id: schedule.id,
			date: schedule.date,
			startsAt: schedule.startsAt,
			maxMarks: schedule.maxMarks,
			room: schedule.room,
			exam: schedule.exam,
		},
		course: {
			id: schedule.course.id,
			code: schedule.course.code,
			name: schedule.course.name,
		},
		students: schedule.course.enrollments.map((entry) => ({
			id: entry.student.id,
			name: entry.student.user.name,
			email: entry.student.user.email,
			score: scores.get(entry.student.id) ?? null,
		})),
	};
}

/**
 * Saves a whole roster in one transaction. A null score clears an existing
 * mark, and the unique (schedule, student) key makes repeated saves idempotent.
 */
export async function saveMarks(input: {
	scheduleId: string;
	enteredById: string | null;
	marks: Array<{ studentId: string; score: number | null }>;
}) {
	const schedule = await prisma.examSchedule.findUnique({
		where: { id: input.scheduleId },
		select: { maxMarks: true },
	});

	if (!schedule) throw new Error("EXAM_SCHEDULE_NOT_FOUND");

	for (const mark of input.marks) {
		if (mark.score === null) continue;

		if (
			!Number.isFinite(mark.score) ||
			mark.score < 0 ||
			mark.score > schedule.maxMarks
		) {
			throw new Error(`Scores must be between 0 and ${schedule.maxMarks}.`);
		}
	}

	await prisma.$transaction(
		input.marks.map((mark) =>
			mark.score === null
				? prisma.mark.deleteMany({
						where: {
							scheduleId: input.scheduleId,
							studentId: mark.studentId,
						},
					})
				: prisma.mark.upsert({
						where: {
							scheduleId_studentId: {
								scheduleId: input.scheduleId,
								studentId: mark.studentId,
							},
						},
						update: { score: mark.score, enteredById: input.enteredById },
						create: {
							scheduleId: input.scheduleId,
							studentId: mark.studentId,
							score: mark.score,
							enteredById: input.enteredById,
						},
					}),
		),
	);

	return getExamRoster(input.scheduleId);
}

/**
 * Publishes results and notifies every enrolled student plus their guardians
 * exactly once per publish transition.
 */
export async function publishExam(id: string) {
	const exam = await prisma.exam.findUnique({
		where: { id },
		include: {
			term: { select: { name: true } },
			schedules: {
				include: {
					course: {
						select: {
							code: true,
							enrollments: {
								where: { status: "ACTIVE" },
								select: { studentId: true },
							},
						},
					},
				},
			},
		},
	});

	if (!exam) throw new Error("EXAM_NOT_FOUND");

	const alreadyPublished = exam.isPublished;

	await prisma.exam.update({ where: { id }, data: { isPublished: true } });

	if (!alreadyPublished) {
		const studentIds = [
			...new Set(
				exam.schedules.flatMap((schedule) =>
					schedule.course.enrollments.map((entry) => entry.studentId),
				),
			),
		];

		if (studentIds.length > 0) {
			const students = await prisma.student.findMany({
				where: { id: { in: studentIds } },
				select: {
					userId: true,
					guardianStudents: {
						select: { guardian: { select: { userId: true } } },
					},
				},
			});

			await notifyUsers({
				userIds: [
					...new Set([
						...students.map((student) => student.userId),
						...students.flatMap((student) =>
							student.guardianStudents.map((entry) => entry.guardian.userId),
						),
					]),
				],
				type: "EXAM_PUBLISHED",
				title: `${exam.name} results are published`,
				body: `Marks for ${exam.term.name} are now available in My records.`,
				refType: "exam",
				refId: exam.id,
			});
		}
	}

	return prisma.exam.findUniqueOrThrow({
		where: { id },
		include: {
			term: { select: { name: true } },
			schedules: { include: { course: true } },
		},
	});
}

/** Results for a signed-in student or guardian, grouped per child. */
export async function getResultsForUser(userId: string) {
	const student = await prisma.student.findUnique({
		where: { userId },
		select: { id: true, user: { select: { name: true } } },
	});

	const guardian = await prisma.guardian.findUnique({
		where: { userId },
		select: {
			guardianStudents: {
				select: {
					student: { select: { id: true, user: { select: { name: true } } } },
				},
			},
		},
	});

	const children = student
		? [student]
		: (guardian?.guardianStudents.map((entry) => entry.student) ?? []);

	if (children.length === 0) return [];

	return Promise.all(
		children.map(async (child) => {
			const marks = await prisma.mark.findMany({
				where: {
					studentId: child.id,
					schedule: { exam: { isPublished: true } },
				},
				include: {
					schedule: {
						include: {
							course: { select: { code: true, name: true } },
							exam: {
								select: {
									id: true,
									name: true,
									term: { select: { name: true } },
								},
							},
						},
					},
				},
				orderBy: { schedule: { date: "asc" } },
			});

			return {
				student: { id: child.id, name: child.user.name },
				marks: marks.map((mark) => ({
					id: mark.id,
					score: mark.score,
					maxMarks: mark.schedule.maxMarks,
					exam: mark.schedule.exam.name,
					term: mark.schedule.exam.term.name,
					course: `${mark.schedule.course.code} · ${mark.schedule.course.name}`,
					date: mark.schedule.date,
				})),
			};
		}),
	);
}

export async function notifyMarksPublished(examId: string) {
	await notifyRoles({
		roles: ["ADMIN", "STAFF"],
		type: "EXAM_PUBLISHED",
		title: "Exam results published",
		body: "Results are visible to students and guardians.",
		refType: "exam",
		refId: examId,
	});
}
