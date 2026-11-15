import { albums as starterAlbums } from "#/content/gallery";
import type { Img } from "#/content/types";
import type { Prisma } from "#/generated/prisma/client.ts";
import { prisma } from "#/packages/db/index.ts";

export async function listGallery(includeUnpublished = false) {
	return prisma.galleryImage.findMany({
		where: includeUnpublished ? undefined : { isPublished: true },
		orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
	});
}

export async function createGalleryImage(input: {
	imageUrl: string;
	title?: string;
	caption?: string;
	sortOrder?: number;
	isPublished?: boolean;
}) {
	return prisma.galleryImage.create({
		data: {
			imageUrl: input.imageUrl,
			title: input.title?.trim() || null,
			caption: input.caption?.trim() || null,
			sortOrder: input.sortOrder ?? 0,
			isPublished: input.isPublished ?? true,
		},
	});
}

export async function updateGalleryImage(
	id: string,
	input: {
		imageUrl?: string;
		title?: string;
		caption?: string;
		sortOrder?: number;
		isPublished?: boolean;
	},
) {
	const existing = await prisma.galleryImage.findUnique({ where: { id } });

	if (!existing) throw new Error("GALLERY_IMAGE_NOT_FOUND");

	return prisma.galleryImage.update({
		where: { id },
		data: {
			...(input.imageUrl !== undefined ? { imageUrl: input.imageUrl } : {}),
			...(input.title !== undefined
				? { title: input.title.trim() || null }
				: {}),
			...(input.caption !== undefined
				? { caption: input.caption.trim() || null }
				: {}),
			...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
			...(input.isPublished !== undefined
				? { isPublished: input.isPublished }
				: {}),
		},
	});
}

export async function deleteGalleryImage(id: string) {
	return prisma.galleryImage.delete({ where: { id } });
}

// ------------------------------------------------------------- collections

export interface GalleryCollection {
	id: string;
	event: string;
	year: string;
	category: string;
	date: string;
	photos: Img[];
}

type AlbumRow = {
	id: string;
	event: string;
	year: string;
	category: string;
	date: string | null;
	photos: unknown;
};

export function toCollection(row: AlbumRow): GalleryCollection {
	return {
		id: row.id,
		event: row.event,
		year: row.year,
		category: row.category,
		date: row.date ?? "",
		photos: Array.isArray(row.photos) ? (row.photos as Img[]) : [],
	};
}

/** The public gallery reads `album`; keep the static starter set on first use. */
async function ensureStarterCollections() {
	const count = await prisma.album.count();
	if (count > 0) return;

	await prisma.album.createMany({
		data: starterAlbums.map((album, index) => ({
			id: album.id,
			event: album.event,
			year: album.year,
			category: album.category,
			date: album.date ?? null,
			photos: album.photos as unknown as Prisma.InputJsonValue,
			order: index,
		})),
	});
}

export async function listCollections(): Promise<GalleryCollection[]> {
	const rows = await prisma.album.findMany({ orderBy: { order: "asc" } });
	return rows.map(toCollection);
}

export async function createCollection(input: {
	event: string;
	year: string;
	category: string;
	date?: string;
}) {
	await ensureStarterCollections();

	const last = await prisma.album.findFirst({
		orderBy: { order: "desc" },
		select: { order: true },
	});

	return prisma.album.create({
		data: {
			event: input.event.trim(),
			year: input.year.trim(),
			category: input.category.trim(),
			date: input.date?.trim() || null,
			photos: [],
			order: (last?.order ?? -1) + 1,
		},
	});
}

export async function addCollectionPhoto(
	albumId: string,
	photo: { src: string; alt: string },
) {
	const album = await prisma.album.findUnique({ where: { id: albumId } });
	if (!album) throw new Error("GALLERY_COLLECTION_NOT_FOUND");

	const photos = Array.isArray(album.photos)
		? [...(album.photos as unknown as Img[])]
		: [];

	photos.push({
		src: photo.src,
		alt: photo.alt.trim() || "Gallery photo",
		width: 1600,
		height: 1067,
	});

	return prisma.album.update({
		where: { id: albumId },
		data: { photos: photos as unknown as Prisma.InputJsonValue },
	});
}

export async function deleteCollectionPhoto(albumId: string, index: number) {
	const album = await prisma.album.findUnique({ where: { id: albumId } });
	if (!album) throw new Error("GALLERY_COLLECTION_NOT_FOUND");

	const photos = Array.isArray(album.photos)
		? [...(album.photos as unknown as Img[])]
		: [];
	if (index < 0 || index >= photos.length) {
		throw new Error("GALLERY_PHOTO_NOT_FOUND");
	}

	photos.splice(index, 1);

	return prisma.album.update({
		where: { id: albumId },
		data: { photos: photos as unknown as Prisma.InputJsonValue },
	});
}
