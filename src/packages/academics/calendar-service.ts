import { prisma } from "#/packages/db/index.ts";
import { getDefaultInviteContext } from "#/packages/invite/invite-service.ts";

export interface AcademicYearInput {
	name: string;
	startsOn: Date;
	endsOn: Date;
	isActive?: boolean;
}

export interface TermInput {
	academicYearId: string;
	name: string;
	startsOn: Date;
	endsOn: Date;
}

function assertRange(startsOn: Date, endsOn: Date) {
	if (Number.isNaN(startsOn.getTime()) || Number.isNaN(endsOn.getTime())) {
		throw new Error("Enter valid start and end dates.");
	}

	if (endsOn <= startsOn) {
		throw new Error("The end date must be after the start date.");
	}
}

export async function listAcademicYears() {
	return prisma.academicYear.findMany({
		include: {
			terms: { orderBy: { startsOn: "asc" } },
			_count: { select: { timetableSlots: true } },
		},
		orderBy: [{ isActive: "desc" }, { startsOn: "desc" }],
	});
}

export async function getActiveAcademicYear() {
	return prisma.academicYear.findFirst({
		where: { isActive: true },
		include: { terms: { orderBy: { startsOn: "asc" } } },
		orderBy: { startsOn: "desc" },
	});
}

export async function createAcademicYear(input: AcademicYearInput) {
	assertRange(input.startsOn, input.endsOn);

	const context = await getDefaultInviteContext();

	const year = await prisma.academicYear.create({
		data: {
			organizationId: context.organizationId,
			name: input.name.trim(),
			startsOn: input.startsOn,
			endsOn: input.endsOn,
			isActive: false,
		},
	});

	if (input.isActive) {
		await activateAcademicYear(year.id);
	}

	return prisma.academicYear.findUniqueOrThrow({
		where: { id: year.id },
		include: { terms: true },
	});
}

export async function updateAcademicYear(
	id: string,
	input: Partial<AcademicYearInput>,
) {
	const existing = await prisma.academicYear.findUnique({ where: { id } });

	if (!existing) throw new Error("ACADEMIC_YEAR_NOT_FOUND");

	const startsOn = input.startsOn ?? existing.startsOn;
	const endsOn = input.endsOn ?? existing.endsOn;

	assertRange(startsOn, endsOn);

	const updated = await prisma.academicYear.update({
		where: { id },
		data: {
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			startsOn,
			endsOn,
		},
	});

	if (input.isActive) {
		await activateAcademicYear(id);
	}

	return updated;
}

/**
 * Activates one year and retires the previous active year in the same
 * transaction, so two years can never both be "current".
 */
export async function activateAcademicYear(id: string) {
	const year = await prisma.academicYear.findUnique({ where: { id } });

	if (!year) throw new Error("ACADEMIC_YEAR_NOT_FOUND");

	await prisma.$transaction([
		prisma.academicYear.updateMany({
			where: {
				organizationId: year.organizationId,
				isActive: true,
				id: { not: id },
			},
			data: { isActive: false },
		}),
		prisma.academicYear.update({ where: { id }, data: { isActive: true } }),
	]);

	return prisma.academicYear.findUniqueOrThrow({ where: { id } });
}

export async function createTerm(input: TermInput) {
	assertRange(input.startsOn, input.endsOn);

	const year = await prisma.academicYear.findUnique({
		where: { id: input.academicYearId },
	});

	if (!year) throw new Error("ACADEMIC_YEAR_NOT_FOUND");

	if (input.startsOn < year.startsOn || input.endsOn > year.endsOn) {
		throw new Error("Terms must fall inside the academic year.");
	}

	return prisma.term.create({
		data: {
			academicYearId: input.academicYearId,
			name: input.name.trim(),
			startsOn: input.startsOn,
			endsOn: input.endsOn,
		},
	});
}

export async function deleteTerm(id: string) {
	const counts = await prisma.term.findUnique({
		where: { id },
		select: { _count: { select: { exams: true, feeStructures: true } } },
	});

	if (!counts) throw new Error("TERM_NOT_FOUND");

	if (counts._count.exams > 0 || counts._count.feeStructures > 0) {
		throw new Error(
			"This term already has exams or fee structures. Remove them first.",
		);
	}

	return prisma.term.delete({ where: { id } });
}
