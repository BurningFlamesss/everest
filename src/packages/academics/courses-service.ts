import { prisma } from "#/packages/db/index.ts";
import {
	getDefaultInviteContext,
	type InviteContext,
} from "#/packages/invite/invite-service.ts";

export interface ClassroomInput {
	name: string;
	building?: string;
	floor?: string;
	capacity?: number | null;
	notes?: string;
	isActive?: boolean;
	context?: InviteContext;
}

export interface CourseInput {
	code: string;
	name: string;
	description?: string;
	grade?: string;
	section?: string;
	schedule?: string;
	teacherId?: string | null;
	classroomId?: string | null;
	isActive?: boolean;
	context?: InviteContext;
}

function clean(value?: string | null) {
	return value?.trim() || null;
}

export async function listClassrooms(options?: { includeInactive?: boolean }) {
	return prisma.classroom.findMany({
		where: options?.includeInactive ? undefined : { isActive: true },
		include: { _count: { select: { courses: true } } },
		orderBy: [{ building: "asc" }, { name: "asc" }],
	});
}

export async function createClassroom(input: ClassroomInput) {
	const context = input.context ?? (await getDefaultInviteContext());

	return prisma.classroom.create({
		data: {
			organizationId: context.organizationId,
			branchId: context.branchId,
			name: input.name.trim(),
			building: clean(input.building),
			floor: clean(input.floor),
			capacity: input.capacity ?? null,
			notes: clean(input.notes),
			isActive: input.isActive ?? true,
		},
	});
}

export async function updateClassroom(
	id: string,
	input: Partial<ClassroomInput>,
) {
	const existing = await prisma.classroom.findUnique({ where: { id } });

	if (!existing) throw new Error("CLASSROOM_NOT_FOUND");

	return prisma.classroom.update({
		where: { id },
		data: {
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			...(input.building !== undefined
				? { building: clean(input.building) }
				: {}),
			...(input.floor !== undefined ? { floor: clean(input.floor) } : {}),
			...(input.capacity !== undefined
				? { capacity: input.capacity ?? null }
				: {}),
			...(input.notes !== undefined ? { notes: clean(input.notes) } : {}),
			...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
		},
	});
}

export async function deleteClassroom(id: string) {
	return prisma.classroom.delete({ where: { id } });
}

export async function listCourses(options?: {
	includeInactive?: boolean;
	search?: string;
}) {
	const search = options?.search?.trim();

	return prisma.course.findMany({
		where: {
			...(options?.includeInactive ? {} : { isActive: true }),
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{ code: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
		},
		include: {
			teacher: {
				select: {
					id: true,
					user: { select: { name: true, email: true } },
				},
			},
			classroom: { select: { id: true, name: true, building: true } },
			_count: { select: { enrollments: true, attendanceSessions: true } },
		},
		orderBy: [{ grade: "asc" }, { name: "asc" }],
	});
}

export async function getCourse(id: string) {
	return prisma.course.findUnique({
		where: { id },
		include: {
			teacher: {
				select: {
					id: true,
					user: { select: { name: true, email: true } },
				},
			},
			classroom: true,
			enrollments: {
				include: {
					student: {
						include: { user: { select: { name: true, email: true } } },
					},
				},
				orderBy: { enrolledAt: "asc" },
			},
		},
	});
}

export async function createCourse(input: CourseInput) {
	const context = input.context ?? (await getDefaultInviteContext());
	const code = input.code.trim().toUpperCase();

	const existing = await prisma.course.findFirst({
		where: {
			organizationId: context.organizationId,
			code,
		},
		select: { id: true },
	});

	if (existing) {
		throw new Error("COURSE_CODE_TAKEN");
	}

	return prisma.course.create({
		data: {
			organizationId: context.organizationId,
			branchId: context.branchId,
			code,
			name: input.name.trim(),
			description: clean(input.description),
			grade: clean(input.grade),
			section: clean(input.section),
			schedule: clean(input.schedule),
			teacherId: input.teacherId || null,
			classroomId: input.classroomId || null,
			isActive: input.isActive ?? true,
		},
	});
}

export async function updateCourse(id: string, input: Partial<CourseInput>) {
	const existing = await prisma.course.findUnique({ where: { id } });

	if (!existing) throw new Error("COURSE_NOT_FOUND");

	if (input.code !== undefined) {
		const code = input.code.trim().toUpperCase();
		const duplicate = await prisma.course.findFirst({
			where: {
				organizationId: existing.organizationId,
				code,
				id: { not: id },
			},
			select: { id: true },
		});

		if (duplicate) throw new Error("COURSE_CODE_TAKEN");
	}

	return prisma.course.update({
		where: { id },
		data: {
			...(input.code !== undefined ? { code: input.code.trim().toUpperCase() } : {}),
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			...(input.description !== undefined
				? { description: clean(input.description) }
				: {}),
			...(input.grade !== undefined ? { grade: clean(input.grade) } : {}),
			...(input.section !== undefined
				? { section: clean(input.section) }
				: {}),
			...(input.schedule !== undefined
				? { schedule: clean(input.schedule) }
				: {}),
			...(input.teacherId !== undefined
				? { teacherId: input.teacherId || null }
				: {}),
			...(input.classroomId !== undefined
				? { classroomId: input.classroomId || null }
				: {}),
			...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
		},
	});
}

export async function deleteCourse(id: string) {
	return prisma.course.delete({ where: { id } });
}

export async function listStudentsForCourses() {
	return prisma.student.findMany({
		where: { status: "ACTIVE" },
		include: { user: { select: { name: true, email: true } } },
		orderBy: { user: { name: "asc" } },
	});
}

export async function listStaffForCourses() {
	return prisma.staff.findMany({
		where: { status: "ACTIVE" },
		include: { user: { select: { name: true, email: true } } },
		orderBy: { user: { name: "asc" } },
	});
}

export async function enrollStudents(courseId: string, studentIds: Array<string>) {
	const course = await prisma.course.findUnique({
		where: { id: courseId },
		select: { id: true },
	});

	if (!course) throw new Error("COURSE_NOT_FOUND");

	await prisma.$transaction(
		studentIds.map((studentId) =>
			prisma.enrollment.upsert({
				where: {
					courseId_studentId: { courseId, studentId },
				},
				update: { status: "ACTIVE" },
				create: { courseId, studentId },
			}),
		),
	);

	return prisma.enrollment.count({ where: { courseId } });
}

export async function removeEnrollment(id: string) {
	return prisma.enrollment.delete({ where: { id } });
}
