import type { Prisma } from "#/generated/prisma/client.ts";
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
				select: {
					id: true,
					code: true,
					name: true,
					grade: true,
					section: true,
				},
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

	// The course roster and the existing register are independent lookups.
	const [course, existing] = await Promise.all([
		prisma.course.findUnique({
			where: { id: input.courseId },
			select: {
				id: true,
				enrollments: {
					where: { status: "ACTIVE" },
					select: { studentId: true },
				},
			},
		}),
		prisma.attendanceSession.findUnique({
			where: {
				courseId_date: { courseId: input.courseId, date },
			},
			select: { id: true },
		}),
	]);

	if (!course) throw new Error("COURSE_NOT_FOUND");

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
	const [session, existing] = await Promise.all([
		prisma.attendanceSession.findUnique({
			where: { id: input.sessionId },
			select: { id: true },
		}),
		prisma.attendanceRecord.findMany({
			where: { sessionId: input.sessionId },
			select: { id: true, studentId: true, status: true, note: true },
		}),
	]);

	if (!session) throw new Error("SESSION_NOT_FOUND");

	const saved = new Map(
		existing.map((record) => [record.studentId, record] as const),
	);
	// Rows without a note only differ by status, so they can be written with one
	// `updateMany` per status instead of one `update` per student. Notes are the
	// rare case and keep their individual update.
	const groupedUpdates = new Map<AttendanceMark, Array<string>>();
	const noteUpdates: Array<Prisma.PrismaPromise<unknown>> = [];
	const creates: Array<{
		sessionId: string;
		studentId: string;
		status: AttendanceMark;
		note: string | null;
	}> = [];

	// Only send the rows that actually changed. Most saves are a re-submit of a
	// register the teacher barely touched, so an unchanged save writes nothing.
	for (const record of input.records) {
		const note = record.note?.trim() || null;
		const current = saved.get(record.studentId);

		if (!current) {
			creates.push({
				sessionId: input.sessionId,
				studentId: record.studentId,
				status: record.status,
				note,
			});
			continue;
		}

		if (current.status === record.status && (current.note ?? null) === note) {
			continue;
		}

		if (note === null) {
			const studentIds = groupedUpdates.get(record.status) ?? [];
			studentIds.push(record.studentId);
			groupedUpdates.set(record.status, studentIds);
		} else {
			noteUpdates.push(
				prisma.attendanceRecord.update({
					where: { id: current.id },
					data: { status: record.status, note },
				}),
			);
		}
	}

	const operations: Array<Prisma.PrismaPromise<unknown>> = [];

	for (const [status, studentIds] of groupedUpdates) {
		operations.push(
			prisma.attendanceRecord.updateMany({
				where: {
					sessionId: input.sessionId,
					studentId: { in: studentIds },
				},
				data: { status, note: null },
			}),
		);
	}

	operations.push(...noteUpdates);

	if (creates.length > 0) {
		operations.push(
			prisma.attendanceRecord.createMany({
				data: creates,
				skipDuplicates: true,
			}),
		);
	}

	if (operations.length > 0) {
		await prisma.$transaction(operations);
	}

	return getAttendanceSession(input.sessionId);
}

export async function deleteAttendanceSession(id: string) {
	return prisma.attendanceSession.delete({ where: { id } });
}

export async function getAttendanceSummary(courseId: string) {
	// Aggregate in PostgreSQL instead of loading every record (and its student)
	// into the app; a course accumulates thousands of rows over a school year.
	const rows = await prisma.attendanceRecord.groupBy({
		by: ["studentId", "status"],
		where: { session: { courseId } },
		_count: { _all: true },
	});

	if (rows.length === 0) return [];

	const students = await prisma.student.findMany({
		where: { id: { in: rows.map((row) => row.studentId) } },
		select: { id: true, user: { select: { name: true } } },
	});

	const names = new Map(
		students.map((student) => [student.id, student.user.name] as const),
	);
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

	for (const row of rows) {
		const entry = byStudent.get(row.studentId) ?? {
			id: row.studentId,
			name: names.get(row.studentId) ?? "Student",
			present: 0,
			absent: 0,
			late: 0,
			excused: 0,
			total: 0,
		};

		entry.total += row._count._all;
		if (row.status === "PRESENT") entry.present += row._count._all;
		if (row.status === "ABSENT") entry.absent += row._count._all;
		if (row.status === "LATE") entry.late += row._count._all;
		if (row.status === "EXCUSED") entry.excused += row._count._all;
		byStudent.set(row.studentId, entry);
	}

	return [...byStudent.values()].sort((a, b) => a.name.localeCompare(b.name));
}
