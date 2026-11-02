import { prisma } from "#/packages/db/index.ts";

export type AttendanceMark = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export function normalizeAttendanceDate(value: Date | string): Date {
	const date = value instanceof Date ? new Date(value) : new Date(value);

	if (Number.isNaN(date.getTime())) {
		throw new Error("INVALID_DATE");
	}

	date.setUTCHours(0, 0, 0, 0);
	return date;
}

export async function listAttendanceSessions(options?: {
	courseId?: string;
	limit?: number;
}) {
	return prisma.attendanceSession.findMany({
		where: options?.courseId ? { courseId: options.courseId } : undefined,
		include: {
			course: { select: { id: true, code: true, name: true } },
			_count: { select: { records: true } },
		},
		orderBy: { date: "desc" },
		take: Math.min(Math.max(options?.limit ?? 25, 1), 100),
	});
}

export async function getAttendanceSession(id: string) {
	return prisma.attendanceSession.findUnique({
		where: { id },
		include: {
			course: {
				select: { id: true, code: true, name: true, grade: true, section: true },
			},
			takenBy: { select: { id: true, user: { select: { name: true } } } },
			records: {
				include: {
					student: {
						include: {
							user: { select: { name: true, email: true } },
						},
					},
				},
				orderBy: { student: { user: { name: "asc" } } },
			},
		},
	});
}

export async function openAttendanceSession(input: {
	courseId: string;
	date: Date | string;
	topic?: string;
	takenById?: string | null;
}) {
	const date = normalizeAttendanceDate(input.date);

	const course = await prisma.course.findUnique({
		where: { id: input.courseId },
		select: {
			id: true,
			enrollments: {
				where: { status: "ACTIVE" },
				select: { studentId: true },
			},
		},
	});

	if (!course) throw new Error("COURSE_NOT_FOUND");

	const existing = await prisma.attendanceSession.findUnique({
		where: {
			courseId_date: { courseId: input.courseId, date },
		},
		select: { id: true },
	});

	if (existing) {
		if (input.topic !== undefined || input.takenById !== undefined) {
			await prisma.attendanceSession.update({
				where: { id: existing.id },
				data: {
					...(input.topic !== undefined
						? { topic: input.topic.trim() || null }
						: {}),
					...(input.takenById !== undefined
						? { takenById: input.takenById || null }
						: {}),
				},
			});
		}

		return getAttendanceSession(existing.id);
	}

	const session = await prisma.attendanceSession.create({
		data: {
			courseId: course.id,
			date,
			topic: input.topic?.trim() || null,
			takenById: input.takenById || null,
			records: {
				create: course.enrollments.map((enrollment) => ({
					studentId: enrollment.studentId,
					status: "PRESENT",
				})),
			},
		},
		select: { id: true },
	});

	return getAttendanceSession(session.id);
}

export async function saveAttendance(input: {
	sessionId: string;
	records: Array<{ studentId: string; status: AttendanceMark; note?: string }>;
}) {
	const session = await prisma.attendanceSession.findUnique({
		where: { id: input.sessionId },
		select: { id: true },
	});

	if (!session) throw new Error("SESSION_NOT_FOUND");

	await prisma.$transaction(
		input.records.map((record) =>
			prisma.attendanceRecord.upsert({
				where: {
					sessionId_studentId: {
						sessionId: input.sessionId,
						studentId: record.studentId,
					},
				},
				update: {
					status: record.status,
					note: record.note?.trim() || null,
				},
				create: {
					sessionId: input.sessionId,
					studentId: record.studentId,
					status: record.status,
					note: record.note?.trim() || null,
				},
			}),
		),
	);

	return getAttendanceSession(input.sessionId);
}

export async function deleteAttendanceSession(id: string) {
	return prisma.attendanceSession.delete({ where: { id } });
}

export async function getAttendanceSummary(courseId: string) {
	const records = await prisma.attendanceRecord.findMany({
		where: { session: { courseId } },
		select: {
			status: true,
			studentId: true,
			student: {
				select: {
					id: true,
					user: { select: { name: true } },
				},
			},
		},
	});

	const byStudent = new Map<
		string,
		{
			id: string;
			name: string;
			present: number;
			absent: number;
			late: number;
			excused: number;
			total: number;
		}
	>();

	for (const record of records) {
		const entry = byStudent.get(record.studentId) ?? {
			id: record.student.id,
			name: record.student.user.name,
			present: 0,
			absent: 0,
			late: 0,
			excused: 0,
			total: 0,
		};

		entry.total++;
		if (record.status === "PRESENT") entry.present++;
		if (record.status === "ABSENT") entry.absent++;
		if (record.status === "LATE") entry.late++;
		if (record.status === "EXCUSED") entry.excused++;
		byStudent.set(record.studentId, entry);
	}

	return [...byStudent.values()].sort((a, b) => a.name.localeCompare(b.name));
}
