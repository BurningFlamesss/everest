import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	activateAcademicYear,
	createAcademicYear,
	createTerm,
	deleteTerm,
	listAcademicYears,
	updateAcademicYear,
} from "./calendar-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_ACADEMICS");

	return session.user;
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Calendar action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

const yearSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(80),
	startsOn: z.string().min(1),
	endsOn: z.string().min(1),
	isActive: z.boolean().optional(),
});

const termSchema = z.object({
	academicYearId: z.string().min(1),
	name: z.string().trim().min(1, "Name is required").max(80),
	startsOn: z.string().min(1),
	endsOn: z.string().min(1),
});

export const getCalendarDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();
		const years = await listAcademicYears();

		return { success: true as const, years };
	} catch (error) {
		return failure(error);
	}
});

export const createAcademicYearAction = createServerFn()
	.validator(yearSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const year = await createAcademicYear({
				name: data.name,
				startsOn: new Date(data.startsOn),
				endsOn: new Date(data.endsOn),
				isActive: data.isActive,
			});

			return { success: true as const, year, years: await listAcademicYears() };
		} catch (error) {
			return failure(error);
		}
	});

export const updateAcademicYearAction = createServerFn()
	.validator(yearSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			await updateAcademicYear(id, {
				...(input.name !== undefined ? { name: input.name } : {}),
				...(input.startsOn ? { startsOn: new Date(input.startsOn) } : {}),
				...(input.endsOn ? { endsOn: new Date(input.endsOn) } : {}),
				...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
			});

			return { success: true as const, years: await listAcademicYears() };
		} catch (error) {
			return failure(error);
		}
	});

export const activateAcademicYearAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await activateAcademicYear(data.id);

			return { success: true as const, years: await listAcademicYears() };
		} catch (error) {
			return failure(error);
		}
	});

export const createTermAction = createServerFn()
	.validator(termSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await createTerm({
				academicYearId: data.academicYearId,
				name: data.name,
				startsOn: new Date(data.startsOn),
				endsOn: new Date(data.endsOn),
			});

			return { success: true as const, years: await listAcademicYears() };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteTermAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteTerm(data.id);

			return { success: true as const, years: await listAcademicYears() };
		} catch (error) {
			return failure(error);
		}
	});
