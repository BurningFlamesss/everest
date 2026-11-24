import { hasPermission } from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import type { PermissionKey } from "#/packages/auth/permissions.ts";

export interface TeacherCourseAccess {
	isManager: boolean;
	staffId: string | null;
	accessibleCourseIds: string[] | "ALL";
}

/**
 * Resolves the courses a user has permission to manage.
 *
 * If the user has the relevant manager permission (e.g. MANAGE_ACADEMICS, MANAGE_EXAMS,
 * or MANAGE_ATTENDANCE), or is an ADMIN / SUPERADMIN, they have global ("ALL") access.
 *
 * If the user is a STAFF member without the global manager permission, access is scoped
 * strictly to:
 * 1. Courses where they are assigned as teacher (`course.teacherId === staff.id`).
 * 2. Courses where they are assigned in the timetable (`slot.staffId === staff.id`).
 * 3. Courses belonging to a homeroom class where they are the assigned class teacher.
 */
export async function getTeacherCourseAccess(
	userId: string,
	globalPermission: PermissionKey,
): Promise<TeacherCourseAccess> {
	// 1. Check if user has global permission or is admin
	const hasGlobal = await hasPermission(userId, globalPermission);
	if (hasGlobal) {
		const staff = await prisma.staff.findUnique({
			where: { userId },
			select: { id: true },
		});
		return {
			isManager: true,
			staffId: staff?.id ?? null,
			accessibleCourseIds: "ALL",
		};
	}

	// 2. Find Staff record
	const staff = await prisma.staff.findUnique({
		where: { userId },
		select: {
			id: true,
			courses: { select: { id: true } },
			timetableSlots: {
				where: { courseId: { not: null } },
				select: { courseId: true },
			},
			taughtClasses: {
				select: { grade: true, section: true },
			},
		},
	});

	if (!staff) {
		return {
			isManager: false,
			staffId: null,
			accessibleCourseIds: [],
		};
	}

	const courseIdSet = new Set<string>();

	// Direct teacher assignment
	for (const course of staff.courses) {
		courseIdSet.add(course.id);
	}

	// Timetable slot assignment
	for (const slot of staff.timetableSlots) {
		if (slot.courseId) {
			courseIdSet.add(slot.courseId);
		}
	}

	// Homeroom class teacher assignment
	if (staff.taughtClasses.length > 0) {
		const homeroomConditions = staff.taughtClasses.map((c) => ({
			grade: c.grade,
			section: c.section,
		}));
		const homeroomCourses = await prisma.course.findMany({
			where: {
				OR: homeroomConditions,
			},
			select: { id: true },
		});
		for (const course of homeroomCourses) {
			courseIdSet.add(course.id);
		}
	}

	return {
		isManager: false,
		staffId: staff.id,
		accessibleCourseIds: Array.from(courseIdSet),
	};
}

export async function canTeacherAccessCourse(
	userId: string,
	courseId: string,
	globalPermission: PermissionKey,
): Promise<boolean> {
	const access = await getTeacherCourseAccess(userId, globalPermission);
	if (access.accessibleCourseIds === "ALL") return true;
	return access.accessibleCourseIds.includes(courseId);
}

export async function canTeacherAccessSchedule(
	userId: string,
	scheduleId: string,
): Promise<boolean> {
	const schedule = await prisma.examSchedule.findUnique({
		where: { id: scheduleId },
		select: { courseId: true },
	});
	if (!schedule) return false;
	return canTeacherAccessCourse(userId, schedule.courseId, "MANAGE_EXAMS");
}

export async function canTeacherAccessAssignment(
	userId: string,
	assignmentId: string,
): Promise<boolean> {
	const assignment = await prisma.assignment.findUnique({
		where: { id: assignmentId },
		select: { courseId: true },
	});
	if (!assignment) return false;
	return canTeacherAccessCourse(userId, assignment.courseId, "MANAGE_ACADEMICS");
}
