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
	createCalendarEvent,
	createTerm,
	deleteCalendarEvent,
	deleteTerm,
	listAcademicYears,
	listCalendarEvents,
	seedCalendarEventsFromStatic,
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
		const [years, events] = await Promise.all([
			listAcademicYears(),
			listCalendarEvents(),
		]);

		return { success: true as const, years, events };
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

const calendarEventSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	titleNe: z.string().trim().optional(),
	description: z.string().trim().optional(),
	startDate: z.string().min(1, "Start date is required"),
	endDate: z.string().min(1, "End date is required"),
	startBs: z.string().trim().optional(),
	endBs: z.string().trim().optional(),
	kind: z.string().min(1, "Event kind is required"),
	category: z.string().optional(),
	term: z.string().optional(),
});

export const createCalendarEventAction = createServerFn()
	.validator(calendarEventSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await createCalendarEvent({
				title: data.title,
				titleNe: data.titleNe,
				description: data.description,
				startDate: new Date(data.startDate),
				endDate: new Date(data.endDate),
				startBs: data.startBs,
				endBs: data.endBs,
				kind: data.kind,
				category: data.category,
				term: data.term,
			});

			return { success: true as const, events: await listCalendarEvents() };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteCalendarEventAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteCalendarEvent(data.id);

			return { success: true as const, events: await listCalendarEvents() };
		} catch (error) {
			return failure(error);
		}
	});

export const seedCalendarEventsAction = createServerFn().handler(async () => {
	try {
		await requireManager();
		const events = await seedCalendarEventsFromStatic();

		return { success: true as const, events };
	} catch (error) {
		return failure(error);
	}
});
