import { prisma } from "#/packages/db/index.ts";

export const WEEKDAYS = [
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
	"Sunday",
] as const;

export interface TimetableSlotInput {
	academicYearId: string;
	courseId: string;
	staffId?: string | null;
	classroomId?: string | null;
	weekday: number;
	periodIndex: number;
	startsAt: string;
	endsAt: string;
}

function toMinutes(value: string) {
	const [hours, minutes] = value.split(":").map(Number);
	return hours * 60 + minutes;
}

function assertSlot(input: TimetableSlotInput) {
	if (input.weekday < 1 || input.weekday > 7) {
		throw new Error("Choose a day between Monday and Sunday.");
	}

	if (input.periodIndex < 1 || input.periodIndex > 20) {
		throw new Error("Period must be between 1 and 20.");
	}

	const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

	if (!timePattern.test(input.startsAt) || !timePattern.test(input.endsAt)) {
		throw new Error("Use 24-hour times such as 09:00.");
	}

	if (toMinutes(input.endsAt) <= toMinutes(input.startsAt)) {
		throw new Error("The end time must be after the start time.");
	}
}

export async function listTimetable(academicYearId?: string) {
	return prisma.timetableSlot.findMany({
		where: academicYearId ? { academicYearId } : undefined,
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
			staff: { select: { id: true, user: { select: { name: true } } } },
			classroom: { select: { id: true, name: true } },
		},
		orderBy: [{ weekday: "asc" }, { periodIndex: "asc" }],
	});
}

/**
 * Rejects a slot that overlaps another class for the same teacher or room on
 * the same day. Two different courses may share a period when neither the
 * teacher nor the room is reused.
 */
async function assertNoConflict(input: TimetableSlotInput, ignoreId?: string) {
	const dayStart = 0;
	const dayEnd = 24 * 60;

	const candidates = await prisma.timetableSlot.findMany({
		where: {
			academicYearId: input.academicYearId,
			weekday: input.weekday,
			...(ignoreId ? { id: { not: ignoreId } } : {}),
			OR: [
				...(input.staffId ? [{ staffId: input.staffId }] : []),
				...(input.classroomId ? [{ classroomId: input.classroomId }] : []),
			],
		},
		include: {
			course: { select: { code: true, name: true } },
			staff: { select: { user: { select: { name: true } } } },
			classroom: { select: { name: true } },
		},
	});

	if (candidates.length === 0) return;

	const start = toMinutes(input.startsAt);
	const end = toMinutes(input.endsAt);

	for (const slot of candidates) {
		const otherStart = Math.max(toMinutes(slot.startsAt), dayStart);
		const otherEnd = Math.min(toMinutes(slot.endsAt), dayEnd);

		if (start < otherEnd && otherStart < end) {
			if (input.staffId && slot.staffId === input.staffId) {
				throw new Error(
					`STAFF_TIMETABLE_CONFLICT: ${slot.staff?.user.name ?? "This teacher"} already teaches ${slot.course.code} at that time.`,
				);
			}

			if (input.classroomId && slot.classroomId === input.classroomId) {
				throw new Error(
					`ROOM_TIMETABLE_CONFLICT: ${slot.classroom?.name ?? "This room"} is already booked for ${slot.course.code} at that time.`,
				);
			}
		}
	}
}

export async function createTimetableSlot(input: TimetableSlotInput) {
	assertSlot(input);
	await assertNoConflict(input);

	return prisma.timetableSlot.create({
		data: {
			academicYearId: input.academicYearId,
			courseId: input.courseId,
			staffId: input.staffId || null,
			classroomId: input.classroomId || null,
			weekday: input.weekday,
			periodIndex: input.periodIndex,
			startsAt: input.startsAt,
			endsAt: input.endsAt,
		},
	});
}

export async function updateTimetableSlot(
	id: string,
	input: Partial<TimetableSlotInput>,
) {
	const existing = await prisma.timetableSlot.findUnique({ where: { id } });

	if (!existing) throw new Error("TIMETABLE_SLOT_NOT_FOUND");

	const merged: TimetableSlotInput = {
		academicYearId: input.academicYearId ?? existing.academicYearId,
		courseId: input.courseId ?? existing.courseId,
		staffId: input.staffId !== undefined ? input.staffId : existing.staffId,
		classroomId:
			input.classroomId !== undefined
				? input.classroomId
				: existing.classroomId,
		weekday: input.weekday ?? existing.weekday,
		periodIndex: input.periodIndex ?? existing.periodIndex,
		startsAt: input.startsAt ?? existing.startsAt,
		endsAt: input.endsAt ?? existing.endsAt,
	};

	assertSlot(merged);
	await assertNoConflict(merged, id);

	return prisma.timetableSlot.update({
		where: { id },
		data: {
			courseId: merged.courseId,
			staffId: merged.staffId || null,
			classroomId: merged.classroomId || null,
			weekday: merged.weekday,
			periodIndex: merged.periodIndex,
			startsAt: merged.startsAt,
			endsAt: merged.endsAt,
		},
	});
}

export async function deleteTimetableSlot(id: string) {
	return prisma.timetableSlot.delete({ where: { id } });
}

export async function listTimetableOptions() {
	const [years, courses, staff, classrooms] = await Promise.all([
		prisma.academicYear.findMany({
			orderBy: [{ isActive: "desc" }, { startsOn: "desc" }],
			select: { id: true, name: true, isActive: true },
		}),
		prisma.course.findMany({
			where: { isActive: true },
			select: {
				id: true,
				code: true,
				name: true,
				grade: true,
				section: true,
				teacherId: true,
			},
			orderBy: [{ grade: "asc" }, { name: "asc" }],
		}),
		prisma.staff.findMany({
			where: { status: "ACTIVE" },
			select: { id: true, designation: true, user: { select: { name: true } } },
			orderBy: { user: { name: "asc" } },
		}),
		prisma.classroom.findMany({
			where: { isActive: true },
			select: { id: true, name: true, building: true },
			orderBy: { name: "asc" },
		}),
	]);

	return { years, courses, staff, classrooms };
}

export async function getMyTimetable(userId: string) {
	const staff = await prisma.staff.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!staff) return [];

	const year = await prisma.academicYear.findFirst({
		where: { isActive: true },
		select: { id: true },
	});

	return prisma.timetableSlot.findMany({
		where: {
			staffId: staff.id,
			...(year ? { academicYearId: year.id } : {}),
		},
		include: {
			course: {
				select: { code: true, name: true, grade: true, section: true },
			},
			classroom: { select: { name: true } },
		},
		orderBy: [{ weekday: "asc" }, { periodIndex: "asc" }],
	});
}
