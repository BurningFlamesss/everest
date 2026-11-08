import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import {
	createTransportRouteAction,
	deleteTransportAssignmentAction,
	getTransportDataFn,
	saveTransportAssignmentAction,
	updateTransportRouteAction,
} from "./server.ts";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	requirePermission: vi.fn(),
	createTransportRoute: vi.fn(),
	updateTransportRoute: vi.fn(),
	saveTransportAssignment: vi.fn(),
	deleteTransportAssignment: vi.fn(),
	listTransportRoutes: vi.fn(),
	listTransportAssignments: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let validator: { parse: (input: unknown) => unknown } | undefined;
		const builder = {
			validator(schema: typeof validator) {
				validator = schema;
				return builder;
			},
			handler(handler: (context: { data: unknown }) => unknown) {
				return async (options?: { data?: unknown }) =>
					handler({ data: validator?.parse(options?.data) });
			},
		};
		return builder;
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeaders: () => new Headers(),
}));

vi.mock("#/packages/auth/auth.ts", () => ({
	auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("#/packages/auth/permissions.ts", () => ({
	AuthorizationError: class AuthorizationError extends Error {},
	requirePermission: mocks.requirePermission,
}));

vi.mock("./service.ts", () => ({
	createTransportRoute: mocks.createTransportRoute,
	createTransportStop: vi.fn(),
	deleteTransportAssignment: mocks.deleteTransportAssignment,
	deleteTransportRoute: vi.fn(),
	deleteTransportStop: vi.fn(),
	listTransportAssignments: mocks.listTransportAssignments,
	listTransportRoutes: mocks.listTransportRoutes,
	saveTransportAssignment: mocks.saveTransportAssignment,
	updateTransportRoute: mocks.updateTransportRoute,
	updateTransportStop: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
	mocks.getSession.mockResolvedValue({ user: { id: "manager" } });
	mocks.requirePermission.mockResolvedValue(undefined);
	mocks.createTransportRoute.mockResolvedValue({ id: "route-1" });
	mocks.updateTransportRoute.mockResolvedValue({ id: "route-1" });
	mocks.saveTransportAssignment.mockResolvedValue({ id: "assignment-1" });
	mocks.deleteTransportAssignment.mockResolvedValue({ id: "assignment-1" });
	mocks.listTransportRoutes.mockResolvedValue([]);
	mocks.listTransportAssignments.mockResolvedValue([]);
});

describe("transport server actions", () => {
	it("gates the route list behind MANAGE_TRANSPORT", async () => {
		const result = await getTransportDataFn();

		expect(result).toEqual({ success: true, routes: [], assignments: [] });
		expect(mocks.requirePermission).toHaveBeenCalledWith(
			"manager",
			"MANAGE_TRANSPORT",
		);
	});

	it("creates a route and trims its fields", async () => {
		const result = await createTransportRouteAction({
			data: {
				name: "  North Loop  ",
				driverName: "  Ram  ",
				capacity: 32,
			},
		});

		expect(result).toMatchObject({ success: true, route: { id: "route-1" } });
		expect(mocks.createTransportRoute).toHaveBeenCalledWith({
			name: "North Loop",
			driverName: "Ram",
			capacity: 32,
		});
	});

	it("rejects a non-positive capacity and an oversized name before the service", async () => {
		await expect(
			createTransportRouteAction({ data: { name: "North", capacity: 0 } }),
		).rejects.toThrow();
		await expect(
			createTransportRouteAction({
				data: { name: "x".repeat(161) },
			}),
		).rejects.toThrow();
		expect(mocks.createTransportRoute).not.toHaveBeenCalled();
	});

	it("passes an explicit capacity clear through updates", async () => {
		await updateTransportRouteAction({
			data: { id: "route-1", capacity: null },
		});

		expect(mocks.updateTransportRoute).toHaveBeenCalledWith("route-1", {
			capacity: null,
		});
	});

	it("upserts an assignment with its direction default applied server-side", async () => {
		const result = await saveTransportAssignmentAction({
			data: { routeId: "route-1", studentId: "student-1" },
		});

		expect(result).toMatchObject({
			success: true,
			assignment: { id: "assignment-1" },
		});
		expect(mocks.saveTransportAssignment).toHaveBeenCalledWith({
			routeId: "route-1",
			studentId: "student-1",
		});
	});

	it("rejects an unknown direction", async () => {
		await expect(
			saveTransportAssignmentAction({
				data: {
					routeId: "route-1",
					studentId: "student-1",
					direction: "SIDEWAYS" as unknown as "BOTH",
				},
			}),
		).rejects.toThrow();
		expect(mocks.saveTransportAssignment).not.toHaveBeenCalled();
	});

	it("blocks signed-out users and users without the permission", async () => {
		mocks.getSession.mockResolvedValue(null);
		const signedOut = await deleteTransportAssignmentAction({
			data: { id: "assignment-1" },
		});

		expect(signedOut).toMatchObject({
			success: false,
			code: "UNAUTHORIZED",
		});
		expect(mocks.deleteTransportAssignment).not.toHaveBeenCalled();

		mocks.getSession.mockResolvedValue({ user: { id: "staff" } });
		mocks.requirePermission.mockRejectedValue(
			new AuthorizationError("You cannot manage transport"),
		);
		const forbidden = await createTransportRouteAction({
			data: { name: "North Loop" },
		});

		expect(forbidden).toMatchObject({
			success: false,
			code: "UNAUTHORIZED",
		});
		expect(mocks.createTransportRoute).not.toHaveBeenCalled();
	});
});
