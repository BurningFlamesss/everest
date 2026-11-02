import { prisma } from "#/packages/db/index.ts";
import { getStorage } from "./index.ts";

export interface CleanupResult {
	/** Number of unreferenced assets that were considered. */
	candidates: number;
	/** Number of assets removed from storage and the database. */
	deleted: number;
	/** Number of assets that could not be removed. */
	failed: number;
}

/**
 * Deletes uploads that are no longer referenced by a cover image or an
 * attachment and are older than the grace period.
 *
 * The grace period avoids removing a file that was uploaded while an editor is
 * still filling in a form. Storage errors are logged and the row is kept so a
 * later run can retry instead of leaving a dangling object in the bucket.
 */
export async function collectOrphanedFileAssets(options?: {
	olderThanHours?: number;
	limit?: number;
}): Promise<CleanupResult> {
	const olderThanHours = Math.min(
		Math.max(options?.olderThanHours ?? 24, 1),
		24 * 30,
	);
	const limit = Math.min(Math.max(options?.limit ?? 200, 1), 1000);
	const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);

	const [assets, noticeCovers, eventCovers, clubCovers, linked] =
		await Promise.all([
			prisma.fileAsset.findMany({
				where: { createdAt: { lt: cutoff } },
				select: { id: true, key: true, url: true },
				orderBy: { createdAt: "asc" },
				take: limit,
			}),
			prisma.notice.findMany({
				where: { coverImage: { not: null } },
				select: { coverImage: true },
			}),
			prisma.event.findMany({
				where: { coverImage: { not: null } },
				select: { coverImage: true },
			}),
			prisma.club.findMany({
				where: { coverImage: { not: null } },
				select: { coverImage: true },
			}),
			prisma.attachment.findMany({ select: { fileAssetId: true } }),
		]);

	const referenced = new Set<string>();

	for (const row of [...noticeCovers, ...eventCovers, ...clubCovers]) {
		if (row.coverImage) referenced.add(row.coverImage);
	}

	for (const row of linked) {
		referenced.add(row.fileAssetId);
	}

	let candidates = 0;
	let deleted = 0;
	let failed = 0;

	for (const asset of assets) {
		if (referenced.has(asset.url) || referenced.has(asset.key)) continue;

		candidates++;

		try {
			await getStorage().delete(asset.key);
		} catch (error) {
			failed++;
			console.error(`Could not delete stored object ${asset.key}:`, error);
			continue;
		}

		try {
			await prisma.fileAsset.delete({ where: { id: asset.id } });
			deleted++;
		} catch (error) {
			failed++;
			console.error(`Could not delete file asset ${asset.id}:`, error);
		}
	}

	return { candidates, deleted, failed };
}
