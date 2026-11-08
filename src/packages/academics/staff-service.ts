import { prisma } from "#/packages/db/index.ts";

function startOfToday() {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday() {
	const start = startOfToday();
	return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

/** Courses, today's timetable and registers still to take for a staff member. */
export async function getStaffWorkspace(userId: string) {
	const staff = await prisma.staff.findUnique({
		where: { userId },
		select: {
			id: true,
			designation: true,
			user: { select: { name: true } },
			courses: {
				where: { isActive: true },
				select: {
					id: true,
					code: true,
					name: true,
					grade: true,
					section: true,
					_count: { select: { enrollments: true } },
				},
				orderBy: [{ grade: "asc" }, { name: "asc" }],
			},
		},
	});

	if (!staff) return null;

	const todayStart = startOfToday();
	const todayEnd = endOfToday();
	const weekday = new Date().getDay() === 0 ? 7 : new Date().getDay();

	const [slots, openRegisters] = await Promise.all([
		prisma.timetableSlot.findMany({
			where: { staffId: staff.id, weekday },
			include: {
				course: { select: { id: true, code: true, name: true } },
				classroom: { select: { name: true } },
			},
			orderBy: { periodIndex: "asc" },
		}),
		prisma.attendanceSession.findMany({
			where: {
				takenById: staff.id,
				date: { gte: todayStart, lt: todayEnd },
			},
			select: { courseId: true },
		}),
	]);

	const taken = new Set(openRegisters.map((session) => session.courseId));

	return {
		staff: {
			id: staff.id,
			name: staff.user.name,
			designation: staff.designation,
		},
		courses: staff.courses.map((course) => ({
			...course,
			registerTakenToday: taken.has(course.id),
		})),
		todaySlots: slots,
	};
}
