import { prisma } from "#/packages/db/index.ts";
import { slugify } from "#/packages/invite/invite-service.ts";

export type NoticeAudience = "ALL" | "STUDENTS" | "STAFF" | "GUARDIANS";

export interface AttachmentInput {
	fileAssetId: string;
	label?: string;
}

export interface NoticeInput {
	title: string;
	summary?: string;
	body: string;
	category?: string;
	coverImage?: string;
	attachments?: Array<AttachmentInput>;
	audience?: NoticeAudience;
	isPublished?: boolean;
	expiresAt?: Date | string | null;
	organizationId?: string | null;
	branchId?: string | null;
	authorId?: string | null;
}

export interface EventInput {
	title: string;
	description?: string;
	location?: string;
	coverImage?: string;
	attachments?: Array<AttachmentInput>;
	startsAt: Date | string;
	endsAt?: Date | string | null;
	isPublished?: boolean;
	organizationId?: string | null;
	branchId?: string | null;
	authorId?: string | null;
}

export interface ClubInput {
	name: string;
	description?: string;
	meetingSchedule?: string;
	coverImage?: string;
	attachments?: Array<AttachmentInput>;
	isActive?: boolean;
	organizationId?: string | null;
	branchId?: string | null;
}

function attachmentCreates(
	attachments?: Array<AttachmentInput>,
): Array<{ fileAssetId: string; label: string | null }> | undefined {
	if (!attachments?.length) return undefined;

	return attachments.map((attachment) => ({
		fileAssetId: attachment.fileAssetId,
		label: attachment.label?.trim() || null,
	}));
}

function toDate(value: Date | string | null | undefined): Date | null {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

async function uniqueNoticeSlug(title: string, ignoreId?: string) {
	const base = slugify(title) || `notice-${Date.now()}`;
	let slug = base;
	let suffix = 1;

	while (
		await prisma.notice.findFirst({
			where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
			select: { id: true },
		})
	) {
		slug = `${base}-${suffix++}`;
	}

	return slug;
}

async function uniqueEventSlug(title: string, ignoreId?: string) {
	const base = slugify(title) || `event-${Date.now()}`;
	let slug = base;
	let suffix = 1;

	while (
		await prisma.event.findFirst({
			where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
			select: { id: true },
		})
	) {
		slug = `${base}-${suffix++}`;
	}

	return slug;
}

async function uniqueClubSlug(name: string, ignoreId?: string) {
	const base = slugify(name) || `club-${Date.now()}`;
	let slug = base;
	let suffix = 1;

	while (
		await prisma.club.findFirst({
			where: { slug, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
			select: { id: true },
		})
	) {
		slug = `${base}-${suffix++}`;
	}

	return slug;
}

export async function createNotice(input: NoticeInput) {
	return prisma.notice.create({
		data: {
			title: input.title.trim(),
			slug: await uniqueNoticeSlug(input.title),
			summary: input.summary?.trim() || null,
			body: input.body,
			category: input.category?.trim() || null,
			coverImage: input.coverImage?.trim() || null,
			attachments: attachmentCreates(input.attachments)
				? { create: attachmentCreates(input.attachments) }
				: undefined,
			audience: input.audience ?? "ALL",
			isPublished: input.isPublished ?? false,
			publishedAt: input.isPublished ? new Date() : null,
			expiresAt: toDate(input.expiresAt),
			organizationId: input.organizationId ?? null,
			branchId: input.branchId ?? null,
			authorId: input.authorId ?? null,
		},
	});
}

export async function updateNotice(id: string, input: Partial<NoticeInput>) {
	const existing = await prisma.notice.findUnique({ where: { id } });

	if (!existing) throw new Error("NOTICE_NOT_FOUND");

	const publishChanged =
		input.isPublished !== undefined &&
		input.isPublished !== existing.isPublished;

	return prisma.notice.update({
		where: { id },
		data: {
			...(input.title !== undefined
				? {
						title: input.title.trim(),
						slug: await uniqueNoticeSlug(input.title, id),
					}
				: {}),
			...(input.summary !== undefined
				? { summary: input.summary.trim() || null }
				: {}),
			...(input.body !== undefined ? { body: input.body } : {}),
			...(input.category !== undefined
				? { category: input.category.trim() || null }
				: {}),
			...(input.coverImage !== undefined
				? { coverImage: input.coverImage.trim() || null }
				: {}),
			...(input.attachments !== undefined
				? {
						attachments: {
							deleteMany: {},
							create: attachmentCreates(input.attachments) ?? [],
						},
					}
				: {}),
			...(input.audience !== undefined ? { audience: input.audience } : {}),
			...(input.isPublished !== undefined
				? {
						isPublished: input.isPublished,
						publishedAt: input.isPublished
							? (existing.publishedAt ?? new Date())
							: null,
					}
				: {}),
			...(input.expiresAt !== undefined
				? { expiresAt: toDate(input.expiresAt) }
				: {}),
			...(publishChanged && input.isPublished
				? { publishedAt: new Date() }
				: {}),
		},
	});
}

export async function deleteNotice(id: string) {
	return prisma.notice.delete({ where: { id } });
}

export async function listNotices(options?: {
	includeDrafts?: boolean;
	limit?: number;
	audience?: NoticeAudience;
	search?: string;
}) {
	const now = new Date();
	const search = options?.search?.trim();

	return prisma.notice.findMany({
		where: {
			...(options?.includeDrafts
				? {}
				: {
						isPublished: true,
						publishedAt: { lte: now },
						AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] }],
					}),
			...(options?.audience && options.audience !== "ALL"
				? { audience: { in: ["ALL", options.audience] } }
				: {}),
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: "insensitive" as const } },
							{ summary: { contains: search, mode: "insensitive" as const } },
						],
					}
				: {}),
		},
		orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
		take: Math.min(Math.max(options?.limit ?? 100, 1), 200),
		// List views never render the article body; selecting it would send a
		// large payload for every card on the public notices page.
		select: {
			id: true,
			title: true,
			slug: true,
			summary: true,
			category: true,
			coverImage: true,
			audience: true,
			isPublished: true,
			publishedAt: true,
			expiresAt: true,
			createdAt: true,
			updatedAt: true,
		},
	});
}

export async function getNoticeBySlug(slug: string, includeDrafts = false) {
	const notice = await prisma.notice.findUnique({
		where: { slug },
		include: {
			attachments: {
				include: {
					fileAsset: {
						select: {
							url: true,
							originalName: true,
							mimeType: true,
							size: true,
						},
					},
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!notice) return null;
	if (!includeDrafts) {
		if (!notice.isPublished) return null;
		if (notice.expiresAt && notice.expiresAt <= new Date()) return null;
	}

	return notice;
}

export async function createEvent(input: EventInput) {
	const startsAt = toDate(input.startsAt);
	const endsAt = toDate(input.endsAt);

	if (!startsAt) throw new Error("EVENT_START_REQUIRED");

	return prisma.event.create({
		data: {
			title: input.title.trim(),
			slug: await uniqueEventSlug(input.title),
			description: input.description?.trim() || null,
			location: input.location?.trim() || null,
			coverImage: input.coverImage?.trim() || null,
			attachments: attachmentCreates(input.attachments)
				? { create: attachmentCreates(input.attachments) }
				: undefined,
			startsAt,
			endsAt,
			isPublished: input.isPublished ?? false,
			publishedAt: input.isPublished ? new Date() : null,
			organizationId: input.organizationId ?? null,
			branchId: input.branchId ?? null,
			authorId: input.authorId ?? null,
		},
	});
}

export async function updateEvent(id: string, input: Partial<EventInput>) {
	const existing = await prisma.event.findUnique({ where: { id } });

	if (!existing) throw new Error("EVENT_NOT_FOUND");

	return prisma.event.update({
		where: { id },
		data: {
			...(input.title !== undefined
				? {
						title: input.title.trim(),
						slug: await uniqueEventSlug(input.title, id),
					}
				: {}),
			...(input.description !== undefined
				? { description: input.description.trim() || null }
				: {}),
			...(input.location !== undefined
				? { location: input.location.trim() || null }
				: {}),
			...(input.coverImage !== undefined
				? { coverImage: input.coverImage.trim() || null }
				: {}),
			...(input.attachments !== undefined
				? {
						attachments: {
							deleteMany: {},
							create: attachmentCreates(input.attachments) ?? [],
						},
					}
				: {}),
			...(input.startsAt !== undefined
				? { startsAt: toDate(input.startsAt) ?? existing.startsAt }
				: {}),
			...(input.endsAt !== undefined ? { endsAt: toDate(input.endsAt) } : {}),
			...(input.isPublished !== undefined
				? {
						isPublished: input.isPublished,
						publishedAt: input.isPublished
							? (existing.publishedAt ?? new Date())
							: null,
					}
				: {}),
		},
	});
}

export async function deleteEvent(id: string) {
	return prisma.event.delete({ where: { id } });
}

export async function listEvents(options?: {
	includeDrafts?: boolean;
	limit?: number;
	upcomingOnly?: boolean;
	search?: string;
}) {
	const now = new Date();
	const search = options?.search?.trim();

	return prisma.event.findMany({
		where: {
			...(options?.includeDrafts ? {} : { isPublished: true }),
			...(options?.upcomingOnly ? { startsAt: { gte: now } } : {}),
			...(search
				? {
						OR: [
							{ title: { contains: search, mode: "insensitive" as const } },
							{
								description: {
									contains: search,
									mode: "insensitive" as const,
								},
							},
						],
					}
				: {}),
		},
		orderBy: { startsAt: "asc" },
		take: Math.min(Math.max(options?.limit ?? 100, 1), 200),
	});
}

export async function getEventBySlug(slug: string, includeDrafts = false) {
	const event = await prisma.event.findUnique({
		where: { slug },
		include: {
			attachments: {
				include: {
					fileAsset: {
						select: {
							url: true,
							originalName: true,
							mimeType: true,
							size: true,
						},
					},
				},
				orderBy: { createdAt: "asc" },
			},
		},
	});

	if (!event) return null;
	if (!includeDrafts && !event.isPublished) return null;

	return event;
}

export async function createClub(input: ClubInput) {
	return prisma.club.create({
		data: {
			name: input.name.trim(),
			slug: await uniqueClubSlug(input.name),
			description: input.description?.trim() || null,
			meetingSchedule: input.meetingSchedule?.trim() || null,
			coverImage: input.coverImage?.trim() || null,
			attachments: attachmentCreates(input.attachments)
				? { create: attachmentCreates(input.attachments) }
				: undefined,
			isActive: input.isActive ?? true,
			organizationId: input.organizationId ?? null,
			branchId: input.branchId ?? null,
		},
	});
}

export async function updateClub(id: string, input: Partial<ClubInput>) {
	const existing = await prisma.club.findUnique({ where: { id } });

	if (!existing) throw new Error("CLUB_NOT_FOUND");

	return prisma.club.update({
		where: { id },
		data: {
			...(input.name !== undefined
				? {
						name: input.name.trim(),
						slug: await uniqueClubSlug(input.name, id),
					}
				: {}),
			...(input.description !== undefined
				? { description: input.description.trim() || null }
				: {}),
			...(input.meetingSchedule !== undefined
				? { meetingSchedule: input.meetingSchedule.trim() || null }
				: {}),
			...(input.coverImage !== undefined
				? { coverImage: input.coverImage.trim() || null }
				: {}),
			...(input.attachments !== undefined
				? {
						attachments: {
							deleteMany: {},
							create: attachmentCreates(input.attachments) ?? [],
						},
					}
				: {}),
			...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
		},
	});
}

export async function deleteClub(id: string) {
	return prisma.club.delete({ where: { id } });
}

export async function listClubs(options?: {
	includeInactive?: boolean;
	search?: string;
}) {
	const search = options?.search?.trim();

	return prisma.club.findMany({
		where: {
			...(options?.includeInactive ? {} : { isActive: true }),
			...(search
				? {
						OR: [
							{ name: { contains: search, mode: "insensitive" as const } },
							{
								description: {
									contains: search,
									mode: "insensitive" as const,
								},
							},
						],
					}
				: {}),
		},
		include: {
			attachments: {
				select: {
					id: true,
					fileAssetId: true,
					label: true,
					fileAsset: {
						select: {
							url: true,
							originalName: true,
							mimeType: true,
							size: true,
						},
					},
				},
				orderBy: { createdAt: "asc" },
			},
		},
		orderBy: { name: "asc" },
	});
}
