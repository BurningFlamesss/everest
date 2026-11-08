import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import { getAdminStatsFn } from "./server.ts";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	requirePermission: vi.fn(),
	studentCount: vi.fn(),
	staffCount: vi.fn(),
	guardianCount: vi.fn(),
	inviteCount: vi.fn(),
	guardianInviteCount: vi.fn(),
	scmsNoticeCount: vi.fn(),
	eventCount: vi.fn(),
	clubCount: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		const builder = {
			validator() {
				return builder;
			},
			handler(handler: (context: { data: unknown }) => unknown) {
				return async (options?: { data?: unknown }) =>
					handler({ data: options?.data });
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

vi.mock("#/packages/db/index.ts", () => ({
	prisma: {
		student: { count: mocks.studentCount },
		staff: { count: mocks.staffCount },
		guardian: { count: mocks.guardianCount },
		invite: { count: mocks.inviteCount },
		guardianInvite: { count: mocks.guardianInviteCount },
		scmsNotice: { count: mocks.scmsNoticeCount },
		event: { count: mocks.eventCount },
		club: { count: mocks.clubCount },
	},
}));

beforeEach(() => {
	vi.resetAllMocks();
	mocks.getSession.mockResolvedValue({ user: { id: "manager" } });
	mocks.requirePermission.mockResolvedValue(undefined);
	mocks.studentCount.mockResolvedValue(120);
	mocks.staffCount.mockResolvedValue(18);
	mocks.guardianCount.mockResolvedValue(90);
	mocks.inviteCount.mockResolvedValue(3);
	mocks.guardianInviteCount.mockResolvedValue(2);
	// Two notice counts (drafts then published).
	mocks.scmsNoticeCount.mockResolvedValueOnce(4).mockResolvedValueOnce(11);
	mocks.eventCount.mockResolvedValue(6);
	mocks.clubCount.mockResolvedValue(7);
});

describe("getAdminStatsFn", () => {
	it("combines invite kinds and returns live counts after the permission gate", async () => {
		const result = await getAdminStatsFn();

		expect(mocks.requirePermission).toHaveBeenCalledWith(
			"manager",
			"MANAGE_DASHBOARD",
		);
		expect(result).toEqual({
			success: true,
			stats: {
				students: 120,
				staff: 18,
				guardians: 90,
				pendingInvites: 5,
				draftNotices: 4,
				publishedNotices: 11,
				upcomingEvents: 6,
				clubs: 7,
			},
		});
	});

	it("returns a failure envelope for signed-out visitors without querying counts", async () => {
		mocks.getSession.mockResolvedValue(null);

		const result = await getAdminStatsFn();

		expect(result).toMatchObject({
			success: false,
			error: "Please sign in to continue",
			stats: null,
		});
		expect(mocks.studentCount).not.toHaveBeenCalled();
	});

	it("returns a failure envelope when the permission is missing", async () => {
		mocks.requirePermission.mockRejectedValue(
			new AuthorizationError("You are not allowed to perform this action"),
		);

		const result = await getAdminStatsFn();

		expect(result).toMatchObject({
			success: false,
			stats: null,
			error: "You are not allowed to perform this action",
		});
		expect(mocks.studentCount).not.toHaveBeenCalled();
	});
});
