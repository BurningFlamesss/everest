import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createTimetableSlot,
	deleteTimetableSlot,
	getMyTimetable,
	listTimetable,
	listTimetableOptions,
	updateTimetableSlot,
} from "./timetable-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_TIMETABLE");

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

	console.error("Timetable action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

const slotSchema = z.object({
	academicYearId: z.string().min(1),
	courseId: z.string().min(1),
	staffId: z.string().trim().nullable().optional(),
	classroomId: z.string().trim().nullable().optional(),
	weekday: z.number().int().min(1).max(7),
	periodIndex: z.number().int().min(1).max(20),
	startsAt: z.string().min(1),
	endsAt: z.string().min(1),
});

export const getTimetableOptionsFn = createServerFn().handler(async () => {
	try {
		await requireManager();
		const options = await listTimetableOptions();

		return { success: true as const, ...options };
	} catch (error) {
		return failure(error);
	}
});

export const getTimetableDataFn = createServerFn()
	.validator(z.object({ academicYearId: z.string().optional() }).optional())
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const slots = await listTimetable(data?.academicYearId);

			return { success: true as const, slots };
		} catch (error) {
			return failure(error);
		}
	});

export const createTimetableSlotAction = createServerFn()
	.validator(slotSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await createTimetableSlot(data);

			return {
				success: true as const,
				slots: await listTimetable(data.academicYearId),
			};
		} catch (error) {
			return failure(error);
		}
	});

export const updateTimetableSlotAction = createServerFn()
	.validator(slotSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			const { id, ...input } = data;
			await requireManager();
			await updateTimetableSlot(id, input);

			return {
				success: true as const,
				slots: await listTimetable(input.academicYearId),
			};
		} catch (error) {
			return failure(error);
		}
	});

export const deleteTimetableSlotAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteTimetableSlot(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const getMyTimetableFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return [];

	return getMyTimetable(session.user.id);
});
