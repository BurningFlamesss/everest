import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import { createClubAction, updateClubAction } from "./server.ts";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	requirePermission: vi.fn(),
	createClub: vi.fn(),
	updateClub: vi.fn(),
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

vi.mock("#/packages/content/content-service.ts", () => ({
	createClub: mocks.createClub,
	updateClub: mocks.updateClub,
	createEvent: vi.fn(),
	createNotice: vi.fn(),
	deleteClub: vi.fn(),
	deleteEvent: vi.fn(),
	deleteNotice: vi.fn(),
	getEventBySlug: vi.fn(),
	getNoticeBySlug: vi.fn(),
	listClubs: vi.fn(),
	listEvents: vi.fn(),
	listNotices: vi.fn(),
	updateEvent: vi.fn(),
	updateNotice: vi.fn(),
}));

vi.mock("#/packages/storage/cleanup.ts", () => ({
	collectOrphanedFileAssets: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
	mocks.getSession.mockResolvedValue({ user: { id: "manager" } });
	mocks.requirePermission.mockResolvedValue(undefined);
	mocks.createClub.mockResolvedValue({ id: "club-1" });
	mocks.updateClub.mockResolvedValue({ id: "club-1" });
});

describe("club attachment actions", () => {
	it("accepts up to 10 attachments on creation and requires content management access", async () => {
		const attachments = Array.from({ length: 10 }, (_, index) => ({
			fileAssetId: `asset-${index}`,
			label: "  Handbook  ",
		}));

		const result = await createClubAction({
			data: { name: "  Robotics Club  ", attachments },
		});

		expect(result.success).toBe(true);
		expect(mocks.requirePermission).toHaveBeenCalledWith(
			"manager",
			"MANAGE_CONTENT",
		);
		expect(mocks.createClub).toHaveBeenCalledWith({
			name: "Robotics Club",
			attachments: attachments.map((attachment) => ({
				...attachment,
				label: "Handbook",
			})),
		});
	});

	it("passes attachment replacements and explicit clearing through updates", async () => {
		const attachments = [{ fileAssetId: "replacement", label: "Rules" }];
		await updateClubAction({ data: { id: "club-1", attachments } });
		await updateClubAction({ data: { id: "club-1", attachments: [] } });

		expect(mocks.updateClub).toHaveBeenNthCalledWith(1, "club-1", {
			attachments,
		});
		expect(mocks.updateClub).toHaveBeenNthCalledWith(2, "club-1", {
			attachments: [],
		});
	});

	it("does not turn a status toggle into an attachment deletion", async () => {
		await updateClubAction({ data: { id: "club-1", isActive: false } });

		expect(mocks.updateClub).toHaveBeenCalledWith("club-1", {
			isActive: false,
		});
	});

	it("rejects more than 10 attachments on both create and update", async () => {
		const attachments = Array.from({ length: 11 }, (_, index) => ({
			fileAssetId: `asset-${index}`,
		}));

		await expect(
			createClubAction({ data: { name: "Robotics", attachments } }),
		).rejects.toThrow();
		await expect(
			updateClubAction({ data: { id: "club-1", attachments } }),
		).rejects.toThrow();
		expect(mocks.createClub).not.toHaveBeenCalled();
		expect(mocks.updateClub).not.toHaveBeenCalled();
	});

	it.each([
		{ fileAssetId: "" },
		{ fileAssetId: "asset-1", label: "a".repeat(201) },
	])("rejects invalid attachment metadata: %j", async (attachment) => {
		await expect(
			createClubAction({
				data: { name: "Robotics", attachments: [attachment] },
			}),
		).rejects.toThrow();
		await expect(
			updateClubAction({
				data: { id: "club-1", attachments: [attachment] },
			}),
		).rejects.toThrow();
		expect(mocks.createClub).not.toHaveBeenCalled();
		expect(mocks.updateClub).not.toHaveBeenCalled();
	});

	it("blocks signed-out users from creating or changing attachments", async () => {
		mocks.getSession.mockResolvedValue(null);

		const created = await createClubAction({
			data: { name: "Robotics", attachments: [{ fileAssetId: "asset-1" }] },
		});
		const updated = await updateClubAction({
			data: { id: "club-1", attachments: [] },
		});

		for (const result of [created, updated]) {
			expect(result).toMatchObject({ success: false, code: "UNAUTHORIZED" });
		}
		expect(mocks.requirePermission).not.toHaveBeenCalled();
		expect(mocks.createClub).not.toHaveBeenCalled();
		expect(mocks.updateClub).not.toHaveBeenCalled();
	});

	it("blocks users without MANAGE_CONTENT from creating or changing attachments", async () => {
		mocks.requirePermission.mockRejectedValue(
			new AuthorizationError("You cannot manage content"),
		);

		const created = await createClubAction({
			data: { name: "Robotics", attachments: [{ fileAssetId: "asset-1" }] },
		});
		const updated = await updateClubAction({
			data: { id: "club-1", attachments: [] },
		});

		for (const result of [created, updated]) {
			expect(result).toMatchObject({ success: false, code: "UNAUTHORIZED" });
		}
		expect(mocks.createClub).not.toHaveBeenCalled();
		expect(mocks.updateClub).not.toHaveBeenCalled();
	});
});
