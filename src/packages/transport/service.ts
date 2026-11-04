import { prisma } from "#/packages/db/index.ts";
import {
	getDefaultInviteContext,
	type InviteContext,
} from "#/packages/invite/invite-service.ts";

export interface TransportRouteInput {
	name: string;
	code?: string;
	description?: string;
	driverName?: string;
	driverPhone?: string;
	vehicleNumber?: string;
	capacity?: number | null;
	isActive?: boolean;
	context?: InviteContext;
}

export interface TransportStopInput {
	routeId: string;
	name: string;
	sortOrder?: number;
	pickupTime?: string;
	dropoffTime?: string;
	latitude?: number | null;
	longitude?: number | null;
}

export interface TransportAssignmentInput {
	routeId: string;
	stopId?: string | null;
	studentId: string;
	direction?: "PICKUP" | "DROPOFF" | "BOTH";
	isActive?: boolean;
	activeFrom?: string | null;
	activeTo?: string | null;
}

function clean(value?: string | null) {
	return value?.trim() || null;
}

function toDate(value?: string | null) {
	if (!value) return null;
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

export async function listTransportRoutes(options?: {
	includeInactive?: boolean;
}) {
	return prisma.transportRoute.findMany({
		where: options?.includeInactive ? undefined : { isActive: true },
		include: {
			stops: { orderBy: [{ sortOrder: "asc" }, { name: "asc" }] },
			_count: { select: { assignments: true } },
		},
		orderBy: { name: "asc" },
	});
}

export async function createTransportRoute(input: TransportRouteInput) {
	const context = input.context ?? (await getDefaultInviteContext());

	return prisma.transportRoute.create({
		data: {
			organizationId: context.organizationId,
			branchId: context.branchId,
			name: input.name.trim(),
			code: clean(input.code),
			description: clean(input.description),
			driverName: clean(input.driverName),
			driverPhone: clean(input.driverPhone),
			vehicleNumber: clean(input.vehicleNumber),
			capacity: input.capacity ?? null,
			isActive: input.isActive ?? true,
		},
	});
}

export async function updateTransportRoute(
	id: string,
	input: Partial<TransportRouteInput>,
) {
	const existing = await prisma.transportRoute.findUnique({ where: { id } });

	if (!existing) throw new Error("ROUTE_NOT_FOUND");

	return prisma.transportRoute.update({
		where: { id },
		data: {
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			...(input.code !== undefined ? { code: clean(input.code) } : {}),
			...(input.description !== undefined
				? { description: clean(input.description) }
				: {}),
			...(input.driverName !== undefined
				? { driverName: clean(input.driverName) }
				: {}),
			...(input.driverPhone !== undefined
				? { driverPhone: clean(input.driverPhone) }
				: {}),
			...(input.vehicleNumber !== undefined
				? { vehicleNumber: clean(input.vehicleNumber) }
				: {}),
			...(input.capacity !== undefined
				? { capacity: input.capacity ?? null }
				: {}),
			...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
		},
	});
}

export async function deleteTransportRoute(id: string) {
	return prisma.transportRoute.delete({ where: { id } });
}

export async function createTransportStop(input: TransportStopInput) {
	return prisma.transportStop.create({
		data: {
			routeId: input.routeId,
			name: input.name.trim(),
			sortOrder: input.sortOrder ?? 0,
			pickupTime: clean(input.pickupTime),
			dropoffTime: clean(input.dropoffTime),
			latitude: input.latitude ?? null,
			longitude: input.longitude ?? null,
		},
	});
}

export async function updateTransportStop(
	id: string,
	input: Partial<TransportStopInput>,
) {
	const existing = await prisma.transportStop.findUnique({ where: { id } });

	if (!existing) throw new Error("STOP_NOT_FOUND");

	return prisma.transportStop.update({
		where: { id },
		data: {
			...(input.name !== undefined ? { name: input.name.trim() } : {}),
			...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
			...(input.pickupTime !== undefined
				? { pickupTime: clean(input.pickupTime) }
				: {}),
			...(input.dropoffTime !== undefined
				? { dropoffTime: clean(input.dropoffTime) }
				: {}),
			...(input.latitude !== undefined
				? { latitude: input.latitude ?? null }
				: {}),
			...(input.longitude !== undefined
				? { longitude: input.longitude ?? null }
				: {}),
		},
	});
}

export async function deleteTransportStop(id: string) {
	return prisma.transportStop.delete({ where: { id } });
}

export async function listTransportAssignments() {
	return prisma.transportAssignment.findMany({
		include: {
			route: { select: { id: true, name: true, code: true } },
			stop: { select: { id: true, name: true } },
			student: {
				include: { user: { select: { name: true, email: true } } },
			},
		},
		orderBy: { createdAt: "desc" },
		take: 300,
	});
}

export async function saveTransportAssignment(input: TransportAssignmentInput) {
	const direction = input.direction ?? "BOTH";

	return prisma.transportAssignment.upsert({
		where: {
			studentId_routeId_direction: {
				studentId: input.studentId,
				routeId: input.routeId,
				direction,
			},
		},
		update: {
			stopId: input.stopId || null,
			isActive: input.isActive ?? true,
			activeFrom: toDate(input.activeFrom),
			activeTo: toDate(input.activeTo),
		},
		create: {
			routeId: input.routeId,
			stopId: input.stopId || null,
			studentId: input.studentId,
			direction,
			isActive: input.isActive ?? true,
			activeFrom: toDate(input.activeFrom),
			activeTo: toDate(input.activeTo),
		},
	});
}

export async function deleteTransportAssignment(id: string) {
	return prisma.transportAssignment.delete({ where: { id } });
}
