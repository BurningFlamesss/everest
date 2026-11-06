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
