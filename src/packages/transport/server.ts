import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createTransportRoute,
	createTransportStop,
	deleteTransportAssignment,
	deleteTransportRoute,
	deleteTransportStop,
	listTransportAssignments,
	listTransportRoutes,
	saveTransportAssignment,
	updateTransportRoute,
	updateTransportStop,
} from "./service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_TRANSPORT");

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

	console.error("Transport action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

export const getTransportDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [routes, assignments] = await Promise.all([
			listTransportRoutes({ includeInactive: true }),
			listTransportAssignments(),
		]);

		return { success: true as const, routes, assignments };
	} catch (error) {
		return failure(error);
	}
});

const routeSchema = z.object({
	name: z.string().trim().min(1, "Name is required").max(160),
	code: z.string().trim().max(40).optional(),
	description: z.string().trim().max(2000).optional(),
	driverName: z.string().trim().max(160).optional(),
	driverPhone: z.string().trim().max(60).optional(),
	vehicleNumber: z.string().trim().max(60).optional(),
	capacity: z.number().int().positive().max(1000).nullable().optional(),
	isActive: z.boolean().optional(),
});

export const createTransportRouteAction = createServerFn()
	.validator(routeSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const route = await createTransportRoute(data);

			return { success: true as const, route };
		} catch (error) {
			return failure(error);
		}
	});

export const updateTransportRouteAction = createServerFn()
	.validator(routeSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const route = await updateTransportRoute(id, input);

			return { success: true as const, route };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteTransportRouteAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteTransportRoute(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const stopSchema = z.object({
	routeId: z.string().min(1),
	name: z.string().trim().min(1, "Name is required").max(160),
	sortOrder: z.number().int().min(0).max(1000).optional(),
	pickupTime: z.string().trim().max(20).optional(),
	dropoffTime: z.string().trim().max(20).optional(),
	latitude: z.number().min(-90).max(90).nullable().optional(),
	longitude: z.number().min(-180).max(180).nullable().optional(),
});

export const createTransportStopAction = createServerFn()
	.validator(stopSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const stop = await createTransportStop(data);

			return { success: true as const, stop };
		} catch (error) {
			return failure(error);
		}
	});

export const updateTransportStopAction = createServerFn()
	.validator(stopSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const stop = await updateTransportStop(id, input);

			return { success: true as const, stop };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteTransportStopAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteTransportStop(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const assignmentSchema = z.object({
	routeId: z.string().min(1),
	stopId: z.string().trim().nullable().optional(),
	studentId: z.string().min(1),
	direction: z.enum(["PICKUP", "DROPOFF", "BOTH"]).optional(),
	isActive: z.boolean().optional(),
	activeFrom: z.string().trim().nullable().optional(),
	activeTo: z.string().trim().nullable().optional(),
});

export const saveTransportAssignmentAction = createServerFn()
	.validator(assignmentSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const assignment = await saveTransportAssignment(data);

			return { success: true as const, assignment };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteTransportAssignmentAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteTransportAssignment(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});
