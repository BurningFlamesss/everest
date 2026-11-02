import { prisma } from "#/packages/db/index.ts";

export type RecordsViewer = "STUDENT" | "GUARDIAN" | "OTHER";

export interface AttendanceSummary {
	present: number;
	absent: number;
	late: number;
	excused: number;
	total: number;
}

export interface StudentRecords {
	id: string;
	name: string;
	email: string;
	grade: string | null;
	section: string | null;
	rollNo: string | null;
	admissionNo: string | null;
	attendance: AttendanceSummary;
	courses: Array<{
		id: string;
		code: string;
		name: string;
		schedule: string | null;
		status: string;
		teacher: string | null;
		classroom: string | null;
	}>;
	recentAttendance: Array<{
		id: string;
		date: Date;
		status: string;
		note: string | null;
		courseCode: string;
		courseName: string;
	}>;
	transport: Array<{
		id: string;
		route: string;
		code: string | null;
		stop: string | null;
		direction: string;
		driverName: string | null;
		driverPhone: string | null;
		vehicleNumber: string | null;
		pickupTime: string | null;
		dropoffTime: string | null;
	}>;
}

export interface MyRecords {
	viewer: RecordsViewer;
	students: Array<StudentRecords>;
}

/**
 * Returns the signed-in student's own records, or every child linked to a
 * signed-in guardian. No ids are accepted from the client, so one family can
 * never read another family's data.
 */
export async function getMyRecords(userId: string): Promise<MyRecords> {
	const [student, guardian] = await Promise.all([
		prisma.student.findUnique({
			where: { userId },
			select: { id: true },
		}),
		prisma.guardian.findUnique({
			where: { userId },
			select: { guardianStudents: { select: { studentId: true } } },
		}),
	]);

	const studentIds = student
		? [student.id]
		: (guardian?.guardianStudents.map((entry) => entry.studentId) ?? []);

	const viewer: RecordsViewer = student
		? "STUDENT"
		: guardian
			? "GUARDIAN"
			: "OTHER";

	if (studentIds.length === 0) {
		return { viewer, students: [] };
	}

	const [students, summaryRows, recentRows] = await Promise.all([
		prisma.student.findMany({
			where: { id: { in: studentIds } },
			select: {
				id: true,
				grade: true,
				section: true,
				rollNo: true,
				admissionNo: true,
				user: { select: { name: true, email: true } },
				enrollments: {
					where: { status: { in: ["ACTIVE", "COMPLETED"] } },
					orderBy: { enrolledAt: "asc" },
					select: {
						id: true,
						status: true,
						course: {
							select: {
								code: true,
								name: true,
								schedule: true,
								teacher: {
									select: { user: { select: { name: true } } },
								},
								classroom: { select: { name: true, building: true } },
							},
						},
					},
				},
				transportAssignments: {
					where: { isActive: true },
					orderBy: { createdAt: "asc" },
					select: {
						id: true,
						direction: true,
						route: {
							select: {
								name: true,
								code: true,
								driverName: true,
								driverPhone: true,
								vehicleNumber: true,
							},
						},
						stop: {
							select: { name: true, pickupTime: true, dropoffTime: true },
						},
					},
				},
			},
			orderBy: { user: { name: "asc" } },
		}),
		prisma.attendanceRecord.groupBy({
			by: ["studentId", "status"],
			where: { studentId: { in: studentIds } },
			_count: { _all: true },
		}),
		prisma.attendanceRecord.findMany({
			where: { studentId: { in: studentIds } },
			select: {
				id: true,
				studentId: true,
				status: true,
				note: true,
				session: {
					select: {
						date: true,
						course: { select: { code: true, name: true } },
					},
				},
			},
			orderBy: { session: { date: "desc" } },
			take: 100,
		}),
	]);

	const summaries = new Map<string, AttendanceSummary>();

	for (const row of summaryRows) {
		const entry = summaries.get(row.studentId) ?? {
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

		summaries.set(row.studentId, entry);
	}

	return {
		viewer,
		students: students.map((entry) => ({
			id: entry.id,
			name: entry.user.name,
			email: entry.user.email,
			grade: entry.grade,
			section: entry.section,
			rollNo: entry.rollNo,
			admissionNo: entry.admissionNo,
			attendance: summaries.get(entry.id) ?? {
				present: 0,
				absent: 0,
				late: 0,
				excused: 0,
				total: 0,
			},
			courses: entry.enrollments.map((enrollment) => ({
				id: enrollment.id,
				code: enrollment.course.code,
				name: enrollment.course.name,
				schedule: enrollment.course.schedule,
				status: enrollment.status,
				teacher: enrollment.course.teacher?.user.name ?? null,
				classroom: enrollment.course.classroom
					? [
							enrollment.course.classroom.building,
							enrollment.course.classroom.name,
						]
							.filter(Boolean)
							.join(" · ")
					: null,
			})),
			recentAttendance: recentRows
				.filter((row) => row.studentId === entry.id)
				.slice(0, 10)
				.map((row) => ({
					id: row.id,
					date: row.session.date,
					status: row.status,
					note: row.note,
					courseCode: row.session.course.code,
					courseName: row.session.course.name,
				})),
			transport: entry.transportAssignments.map((assignment) => ({
				id: assignment.id,
				route: assignment.route.name,
				code: assignment.route.code,
				stop: assignment.stop?.name ?? null,
				direction: assignment.direction,
				driverName: assignment.route.driverName,
				driverPhone: assignment.route.driverPhone,
				vehicleNumber: assignment.route.vehicleNumber,
				pickupTime: assignment.stop?.pickupTime ?? null,
				dropoffTime: assignment.stop?.dropoffTime ?? null,
			})),
		})),
	};
}
