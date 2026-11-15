import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import {
	createCalendarEventAction,
	deleteCalendarEventAction,
	getCalendarDataFn,
	seedCalendarEventsAction,
} from "./calendar-server.ts";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	requirePermission: vi.fn(),
	listAcademicYears: vi.fn(),
	listCalendarEvents: vi.fn(),
	createCalendarEvent: vi.fn(),
	deleteCalendarEvent: vi.fn(),
	seedCalendarEventsFromStatic: vi.fn(),
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
					handler({
						data: validator ? validator.parse(options?.data) : undefined,
					});
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

vi.mock("./calendar-service.ts", () => ({
	activateAcademicYear: vi.fn(),
	createAcademicYear: vi.fn(),
	createCalendarEvent: mocks.createCalendarEvent,
	createTerm: vi.fn(),
	deleteCalendarEvent: mocks.deleteCalendarEvent,
	deleteTerm: vi.fn(),
	listAcademicYears: mocks.listAcademicYears,
	listCalendarEvents: mocks.listCalendarEvents,
	seedCalendarEventsFromStatic: mocks.seedCalendarEventsFromStatic,
	updateAcademicYear: vi.fn(),
}));

describe("calendar server actions", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getSession.mockResolvedValue({
			user: { id: "user-admin", role: "admin" },
		});
		mocks.requirePermission.mockResolvedValue(undefined);
		mocks.listAcademicYears.mockResolvedValue([
			{ id: "year-1", name: "2081/82", terms: [] },
		]);
		mocks.listCalendarEvents.mockResolvedValue([
			{ id: "event-1", title: "Dashain Vacation", kind: "holiday" },
		]);
	});

	it("fetches both academic years and calendar events in getCalendarDataFn", async () => {
		const res = await getCalendarDataFn();
		expect(res.success).toBe(true);
		if (res.success) {
			expect(res.years).toHaveLength(1);
			expect(res.events).toHaveLength(1);
		}
		expect(mocks.requirePermission).toHaveBeenCalledWith(
			"user-admin",
			"MANAGE_ACADEMICS",
		);
	});

	it("creates a new calendar event", async () => {
		mocks.createCalendarEvent.mockResolvedValue({ id: "event-2" });
		mocks.listCalendarEvents.mockResolvedValue([
			{ id: "event-1", title: "Dashain Vacation", kind: "holiday" },
			{ id: "event-2", title: "Sports Day", kind: "event" },
		]);

		const res = await createCalendarEventAction({
			data: {
				title: "Sports Day",
				titleNe: "खेलकुद दिन",
				startDate: "2024-11-20T00:00:00.000Z",
				endDate: "2024-11-21T00:00:00.000Z",
				kind: "event",
			},
		});

		expect(res.success).toBe(true);
		expect(mocks.createCalendarEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Sports Day",
				titleNe: "खेलकुद दिन",
				kind: "event",
			}),
		);
		if (res.success) {
			expect(res.events).toHaveLength(2);
		}
	});

	it("deletes a calendar event", async () => {
		mocks.deleteCalendarEvent.mockResolvedValue({ id: "event-1" });
		mocks.listCalendarEvents.mockResolvedValue([]);

		const res = await deleteCalendarEventAction({
			data: { id: "event-1" },
		});

		expect(res.success).toBe(true);
		expect(mocks.deleteCalendarEvent).toHaveBeenCalledWith("event-1");
		if (res.success) {
			expect(res.events).toHaveLength(0);
		}
	});

	it("seeds calendar events from static data", async () => {
		mocks.seedCalendarEventsFromStatic.mockResolvedValue([
			{ id: "ev-static-1", title: "New Year" },
		]);

		const res = await seedCalendarEventsAction();

		expect(res.success).toBe(true);
		expect(mocks.seedCalendarEventsFromStatic).toHaveBeenCalled();
		if (res.success) {
			expect(res.events).toHaveLength(1);
		}
	});

	it("handles unauthorized access gracefully", async () => {
		mocks.requirePermission.mockRejectedValue(
			new AuthorizationError("Forbidden"),
		);

		const res = await getCalendarDataFn();
		expect(res.success).toBe(false);
		if (!res.success) {
			expect(res.code).toBe("UNAUTHORIZED");
		}
	});
});
