import { prisma } from "#/packages/db/index.ts";

export interface AssignmentInput {
	courseId: string;
	title: string;
	instructions: string;
	dueAt: Date;
	attachments?: Array<{ fileAssetId: string; label?: string }>;
	createdById?: string | null;
}

export async function listAssignments(courseId?: string) {
	return prisma.assignment.findMany({
		where: courseId ? { courseId } : undefined,
		include: {
			course: { select: { id: true, code: true, name: true, grade: true } },
			attachments: {
				include: { fileAsset: { select: { url: true, originalName: true } } },
			},
			_count: { select: { attachments: true } },
		},
		orderBy: { dueAt: "desc" },
	});
}

export async function createAssignment(input: AssignmentInput) {
	if (Number.isNaN(input.dueAt.getTime())) {
		throw new Error("Enter a valid due date.");
	}

	return prisma.assignment.create({
		data: {
			courseId: input.courseId,
			title: input.title.trim(),
			instructions: input.instructions.trim(),
			dueAt: input.dueAt,
			createdById: input.createdById ?? null,
			...(input.attachments?.length
				? {
						attachments: {
							create: input.attachments.map((attachment) => ({
								fileAssetId: attachment.fileAssetId,
								label: attachment.label?.trim() || null,
							})),
						},
					}
				: {}),
		},
		include: { attachments: true },
	});
}

export async function updateAssignment(
	id: string,
	input: Partial<AssignmentInput>,
) {
	const existing = await prisma.assignment.findUnique({ where: { id } });

	if (!existing) throw new Error("ASSIGNMENT_NOT_FOUND");

	return prisma.$transaction(async (tx) => {
		if (input.attachments) {
			await tx.attachment.deleteMany({ where: { assignmentId: id } });

			if (input.attachments.length > 0) {
				await tx.attachment.createMany({
					data: input.attachments.map((attachment) => ({
						assignmentId: id,
						fileAssetId: attachment.fileAssetId,
						label: attachment.label?.trim() || null,
					})),
				});
			}
		}

		return tx.assignment.update({
			where: { id },
			data: {
				...(input.courseId ? { courseId: input.courseId } : {}),
				...(input.title !== undefined ? { title: input.title.trim() } : {}),
				...(input.instructions !== undefined
					? { instructions: input.instructions.trim() }
					: {}),
				...(input.dueAt ? { dueAt: input.dueAt } : {}),
			},
			include: { attachments: true },
		});
	});
}

export async function deleteAssignment(id: string) {
	return prisma.assignment.delete({ where: { id } });
}

/**
 * Assignments visible to a student or guardian, scoped through active
 * enrolments only. Each child's list is separate so a guardian can tell whose
 * homework is whose.
 */
export async function getAssignmentsForUser(userId: string) {
	const student = await prisma.student.findUnique({
		where: { userId },
		select: {
			id: true,
			user: { select: { name: true } },
			enrollments: {
				where: { status: "ACTIVE" },
				select: { courseId: true },
			},
		},
	});

	const guardian = await prisma.guardian.findUnique({
		where: { userId },
		select: {
			guardianStudents: {
				select: {
					student: {
						select: {
							id: true,
							user: { select: { name: true } },
							enrollments: {
								where: { status: "ACTIVE" },
								select: { courseId: true },
							},
						},
					},
				},
			},
		},
	});

	const children = student
		? [student]
		: (guardian?.guardianStudents.map((entry) => entry.student) ?? []);

	return Promise.all(
		children
			.filter((child) => child.enrollments.length > 0)
			.map(async (child) => {
				const assignments = await prisma.assignment.findMany({
					where: {
						courseId: { in: child.enrollments.map((entry) => entry.courseId) },
					},
					include: {
						course: { select: { code: true, name: true } },
						attachments: {
							include: {
								fileAsset: { select: { url: true, originalName: true } },
							},
						},
					},
					orderBy: { dueAt: "asc" },
					take: 30,
				});

				return {
					student: { id: child.id, name: child.user.name },
					assignments,
				};
			}),
	);
}
