import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { collectOrphanedFileAssets } from "./cleanup.ts";

const prismaMock = vi.hoisted(() => ({
	fileAsset: { findMany: vi.fn(), deleteMany: vi.fn() },
	scmsNotice: { findMany: vi.fn() },
	event: { findMany: vi.fn() },
	club: { findMany: vi.fn() },
	attachment: { findMany: vi.fn() },
}));

const storageMock = vi.hoisted(() => ({ delete: vi.fn() }));

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));
vi.mock("./index.ts", () => ({ getStorage: () => storageMock }));

const NOW = new Date("2026-05-01T12:00:00.000Z");
const HOUR = 60 * 60 * 1000;

function asset(id: string, key = `content/${id}.pdf`, url = `/uploads/${key}`) {
	return { id, key, url };
}

beforeEach(() => {
	vi.useFakeTimers();
	vi.setSystemTime(NOW);
	vi.clearAllMocks();

	prismaMock.fileAsset.findMany.mockResolvedValue([]);
	prismaMock.scmsNotice.findMany.mockResolvedValue([]);
	prismaMock.event.findMany.mockResolvedValue([]);
	prismaMock.club.findMany.mockResolvedValue([]);
	prismaMock.attachment.findMany.mockResolvedValue([]);
	prismaMock.fileAsset.deleteMany.mockResolvedValue({ count: 1 });
	storageMock.delete.mockResolvedValue(undefined);
});

afterEach(() => {
	vi.useRealTimers();
});

describe("collectOrphanedFileAssets", () => {
	it("removes unreferenced uploads from storage and the database", async () => {
		prismaMock.fileAsset.findMany.mockResolvedValue([asset("a1")]);

		const result = await collectOrphanedFileAssets();

		expect(storageMock.delete).toHaveBeenCalledWith("content/a1.pdf");
		expect(prismaMock.fileAsset.deleteMany).toHaveBeenCalledWith({
			where: { id: "a1" },
		});
		expect(result).toEqual({ candidates: 1, deleted: 1, failed: 0 });
	});

	it("keeps notice, event and club cover images", async () => {
		const noticeCover = asset("cover-notice");
		const eventCover = asset("cover-event");
		const clubCover = asset("cover-club");

		prismaMock.fileAsset.findMany.mockResolvedValue([
			noticeCover,
			eventCover,
			clubCover,
		]);
		prismaMock.scmsNotice.findMany.mockResolvedValue([
			{ coverImage: noticeCover.url },
		]);
		prismaMock.event.findMany.mockResolvedValue([
			{ coverImage: eventCover.url },
		]);
		prismaMock.club.findMany.mockResolvedValue([{ coverImage: clubCover.url }]);

		const result = await collectOrphanedFileAssets();

		expect(storageMock.delete).not.toHaveBeenCalled();
		expect(prismaMock.fileAsset.deleteMany).not.toHaveBeenCalled();
		expect(result).toEqual({ candidates: 0, deleted: 0, failed: 0 });
	});

	it("keeps files referenced by an attachment (regression)", async () => {
		const attached = asset("asset_attached");
		prismaMock.fileAsset.findMany.mockResolvedValue([attached]);
		prismaMock.attachment.findMany.mockResolvedValue([
			{ fileAssetId: "asset_attached" },
		]);

		const result = await collectOrphanedFileAssets();

		expect(storageMock.delete).not.toHaveBeenCalled();
		expect(result).toEqual({ candidates: 0, deleted: 0, failed: 0 });
	});

	it("preserves club-linked document assets until unlinked, then collects them (regression)", async () => {
		const clubDocument = asset("club-handbook");
		prismaMock.fileAsset.findMany.mockResolvedValue([clubDocument]);
		prismaMock.attachment.findMany.mockResolvedValue([
			{ fileAssetId: clubDocument.id },
		]);

		const linkedResult = await collectOrphanedFileAssets();

		// The reference scan must include attachments for every parent, including clubs.
		expect(prismaMock.attachment.findMany).toHaveBeenCalledExactlyOnceWith({
			select: { fileAssetId: true },
		});
		expect(storageMock.delete).not.toHaveBeenCalled();
		expect(prismaMock.fileAsset.deleteMany).not.toHaveBeenCalled();
		expect(linkedResult).toEqual({ candidates: 0, deleted: 0, failed: 0 });

		prismaMock.attachment.findMany.mockResolvedValue([]);

		const unlinkedResult = await collectOrphanedFileAssets();

		expect(storageMock.delete).toHaveBeenCalledExactlyOnceWith(
			clubDocument.key,
		);
		expect(prismaMock.fileAsset.deleteMany).toHaveBeenCalledExactlyOnceWith({
			where: { id: clubDocument.id },
		});
		expect(unlinkedResult).toEqual({ candidates: 1, deleted: 1, failed: 0 });
	});

	it("matches legacy cover values stored as a storage key", async () => {
		const cover = asset("cover-key");
		prismaMock.fileAsset.findMany.mockResolvedValue([cover]);
		prismaMock.scmsNotice.findMany.mockResolvedValue([
			{ coverImage: cover.key },
		]);

		await collectOrphanedFileAssets();

		expect(storageMock.delete).not.toHaveBeenCalled();
	});

	it("counts only unreferenced assets as candidates", async () => {
		const kept = asset("kept");
		prismaMock.fileAsset.findMany.mockResolvedValue([
			kept,
			asset("orphan-1"),
			asset("orphan-2"),
		]);
		prismaMock.event.findMany.mockResolvedValue([{ coverImage: kept.url }]);

		const result = await collectOrphanedFileAssets();

		expect(result).toEqual({ candidates: 2, deleted: 2, failed: 0 });
	});

	it("uses a 24 hour grace period by default", async () => {
		await collectOrphanedFileAssets();

		const query = prismaMock.fileAsset.findMany.mock.calls[0][0];
		expect(query.where.createdAt.lt).toEqual(
			new Date(NOW.getTime() - 24 * HOUR),
		);
		expect(query.take).toBe(200);
		expect(query.orderBy).toEqual({ createdAt: "asc" });
	});

	it("clamps the grace period and batch size to sane bounds", async () => {
		await collectOrphanedFileAssets({ olderThanHours: 0, limit: 0 });
		await collectOrphanedFileAssets({ olderThanHours: 10_000, limit: 5_000 });

		const [shortest, longest] = prismaMock.fileAsset.findMany.mock.calls;

		expect(shortest[0].where.createdAt.lt).toEqual(
			new Date(NOW.getTime() - 1 * HOUR),
		);
		expect(shortest[0].take).toBe(1);
		expect(longest[0].where.createdAt.lt).toEqual(
			new Date(NOW.getTime() - 30 * 24 * HOUR),
		);
		expect(longest[0].take).toBe(1000);
	});

	it("keeps the row when the storage delete fails", async () => {
		prismaMock.fileAsset.findMany.mockResolvedValue([asset("broken")]);
		storageMock.delete.mockRejectedValue(new Error("EISDIR"));
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const result = await collectOrphanedFileAssets();

		expect(prismaMock.fileAsset.deleteMany).not.toHaveBeenCalled();
		expect(result).toEqual({ candidates: 1, deleted: 0, failed: 1 });

		consoleError.mockRestore();
	});

	it("reports a database failure without aborting the sweep", async () => {
		prismaMock.fileAsset.findMany.mockResolvedValue([
			asset("first"),
			asset("second"),
		]);
		prismaMock.fileAsset.deleteMany
			.mockRejectedValueOnce(new Error("connection reset"))
			.mockResolvedValueOnce({ count: 1 });
		const consoleError = vi
			.spyOn(console, "error")
			.mockImplementation(() => {});

		const result = await collectOrphanedFileAssets();

		expect(result).toEqual({ candidates: 2, deleted: 1, failed: 1 });
		expect(storageMock.delete).toHaveBeenCalledTimes(2);

		consoleError.mockRestore();
	});
});
