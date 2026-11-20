import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Album, Img } from "#/content/types";
import { facultyPhotos } from "#/lib/faculty";
import { prisma } from "#/lib/prisma";
import type {
	ContentBlockFields,
	WebsitePageContent,
} from "#/lib/website-content-loader";
import { requirePermission } from "#/packages/auth/server/guard.ts";
import { setPublicCacheHeaders } from "#/packages/content/server/cache-headers";
import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";
import type {
	BlockType,
	Facility,
	Person,
	Program,
	Scholarship,
} from "#/types";
import type {
	SchoolConfig,
	SchoolContent,
	SidebarContent,
} from "#/types/school";
import type { Notice } from "#/types/website";

const PageKeySchema = z.object({
	key: z.string().transform((v) => v as any),
});

const StringSchema = z.object({
	identifier: z.string(),
});

function toWebsitePageContent(
	page: {
		blocks: Array<{
			id: string;
			type: BlockType;
			label: string;
			visible: boolean;
			order: number;
			fields: unknown;
			updatedAt: Date;
			createdAt: Date;
		}>;
	} & Omit<
		{
			id: string;
			key: string;
			title: string;
			path: string;
			status: string;
			hasUnpublishedChanges: boolean;
			seoTitle: string | null;
			seoDescription: string | null;
			seoKeywords: string | null;
			publishedAt: Date | null;
			updatedAt: Date;
			updatedBy: string;
			createdAt: Date;
		},
		"blocks"
	>,
): WebsitePageContent {
	return {
		id: page.id,
		key: page.key,
		title: page.title,
		path: page.path,
		status: page.status,
		hasUnpublishedChanges: page.hasUnpublishedChanges,
		seoTitle: page.seoTitle ?? "",
		seoDescription: page.seoDescription ?? "",
		seoKeywords: page.seoKeywords ?? "",
		blocks: page.blocks.map((block) => ({
			id: block.id,
			type: block.type,
			label: block.label,
			visible: block.visible,
			order: block.order,
			fields: (block.fields ?? {}) as ContentBlockFields,
			updatedAt: block.updatedAt.toISOString(),
			createdAt: block.createdAt.toISOString(),
		})),
		publishedAt: page.publishedAt?.toISOString() ?? null,
		updatedAt: page.updatedAt.toISOString(),
		createdAt: page.createdAt.toISOString(),
		updatedBy: page.updatedBy,
	};
}

/** Published page for a managed key (public rendering). */
export const getWebsitePageServer = createServerFn({ method: "GET" })
	.validator(PageKeySchema)
	.handler(async ({ data: { key } }) => {
		setPublicCacheHeaders();
		const page = await prisma.websitePage.findUnique({
			where: { key, status: "published" },
			include: {
				blocks: { where: { visible: true }, orderBy: { order: "asc" } },
			},
		});
		return (page
			? toWebsitePageContent(page)
			: null) as unknown as WebsitePageContent;
	});

/**
 * Any-status page for a managed key, used by the admin live preview
 * (`?cms=1`), so drafts render WYSIWYG before being published. Not cached.
 * Draft content is admin-only: unauthenticated callers get the auth error
 * boundary instead of any unpublished material.
 */
export const getWebsitePagePreviewServer = createServerFn({ method: "GET" })
	.validator(PageKeySchema)
	.middleware([requirePermission("website.view")])
	.handler(async ({ data: { key } }) => {
		const page = await prisma.websitePage.findUnique({
			where: { key },
			include: {
				blocks: { where: { visible: true }, orderBy: { order: "asc" } },
			},
		});
		return (page
			? toWebsitePageContent(page)
			: null) as unknown as WebsitePageContent;
	});

export const getSchoolConfigServer = createServerFn({ method: "GET" })
	.validator(StringSchema)
	.handler(async ({ data: { identifier } }) => {
		setPublicCacheHeaders();
		const org = await prisma.organization.findUnique({
			where: { slug: identifier },
			include: {
				branches: {
					take: 1,
				},
			},
		});
		if (!org) return null;

		const mainBranch = org.branches[0];
		// Start from the bundled config so every theme token (accent, background,
		// sidebar) survives database-backed reads, then overlay the live record.
		const base = getSchoolConfig(identifier);
		const config: SchoolConfig = {
			...base,
			organization: {
				...base.organization,
				name: org.name,
				slug: org.slug,
			},
			contact: {
				...base.contact,
				phone: mainBranch?.phone || base.contact.phone,
				email: mainBranch?.email || base.contact.email,
			},
			seo: {
				...base.seo,
				title: org.name,
				description: org.description || base.seo.description,
			},
		};
		return config;
	});

export const getSchoolContentServer = createServerFn({ method: "GET" })
	.validator(StringSchema)
	.handler(async ({ data: { identifier } }) => {
		setPublicCacheHeaders();
		const org = await prisma.organization.findUnique({
			where: { slug: identifier },
			include: {
				branches: true,
			},
		});
		if (!org) return null;

		// The navigation itself is not database data: use the same static
		// definition the root loader falls back to when the database is down, and
		// only overlay the organisation's logo and tagline. Keeping one source
		// means the public sidebar never changes shape with database availability.
		const baseSidebar = getSchoolContent(identifier).sidebar;
		const sidebarContent: SidebarContent = {
			...baseSidebar,
			logo: org.logo || baseSidebar.logo,
			tagline: org.description || baseSidebar.tagline,
		};

		const content: SchoolContent = {
			sidebar: sidebarContent,
			login: {},
		};
		return content;
	});

export const getAllPublishedPagesServer = createServerFn({
	method: "GET",
}).handler(async () => {
	setPublicCacheHeaders();
	const pages = await prisma.websitePage.findMany({
		where: { status: "published" },
		include: {
			blocks: { where: { visible: true }, orderBy: { order: "asc" } },
		},
	});
	return pages.map(toWebsitePageContent) as unknown as WebsitePageContent[];
});

// ---------------------------------------------------------------------------
// Public content collections (faculty / notices / scholarships). These power
// the /user/*-page-detail routes from the database, mirroring the static
// src/lib types so the pages can fall back to their static data when the
// collection has not been seeded yet.
// ---------------------------------------------------------------------------

interface FacultyMemberRow {
	slug: string;
	name: string;
	role: string;
	department: string;
	qualification: string;
	experience: string;
	subjects: unknown;
	email: string;
	extension: string;
	officeHours: string;
	bio: string;
	image: string | null;
	joined: string;
	leadership: boolean;
	rank: number | null;
}

function toPerson(row: FacultyMemberRow): Person {
	return {
		id: row.slug,
		name: row.name,
		role: row.role,
		department: row.department as Person["department"],
		qualification: row.qualification,
		experience: row.experience,
		subjects: Array.isArray(row.subjects) ? (row.subjects as string[]) : [],
		email: row.email,
		extension: row.extension,
		officeHours: row.officeHours,
		bio: row.bio,
		joined: row.joined,
		leadership: row.leadership || undefined,
		rank: row.rank ?? undefined,
		photo: row.image || facultyPhotos[row.slug],
	};
}

/**
 * The public notice board is served from the ScMS `ScmsNotice` model but
 * rendered with the curated `Notice` view type. ScMS notices have no AD/BS
 * pair or table/bullet blocks, so the publication date is used for both
 * calendars and attachments are not surfaced on this board.
 */
function toNotice(row: {
	slug: string;
	title: string;
	summary: string | null;
	body: string;
	category: string | null;
	audience: string | null;
	publishedAt: Date | null;
	createdAt: Date;
}): Notice {
	const publishedOn = row.publishedAt ?? row.createdAt;
	const date = publishedOn.toISOString().slice(0, 10);

	const notice: Notice = {
		id: row.slug,
		ref: row.slug,
		title: row.title,
		category: (row.category ?? "General") as Notice["category"],
		dateAd: date,
		dateBs: date,
		audience: row.audience ?? "ALL",
		issuedBy: "School Office",
		summary: row.summary ?? "",
		body: row.body ? [row.body] : [],
		attachments: [],
		...(row.publishedAt ? { pinned: false } : {}),
	};

	return notice;
}

interface ScholarshipRow {
	ref: string;
	name: string;
	nepaliName: string;
	category: string;
	coverage: number;
	award: string;
	amountNpr: number;
	seats: number;
	deadlineAd: string;
	deadlineBs: string;
	appliesTo: string;
	summary: string;
	description: string;
	eligibility: unknown;
	benefits: unknown;
	documents: unknown;
	process: unknown;
	renewal: string;
	contact: string;
	spotlight: boolean;
}

function toScholarship(row: ScholarshipRow): Scholarship {
	return {
		id: row.ref,
		ref: row.ref,
		name: row.name,
		nepaliName: row.nepaliName,
		category: row.category as Scholarship["category"],
		coverage: row.coverage,
		award: row.award,
		amountNpr: row.amountNpr,
		seats: row.seats,
		deadlineAd: row.deadlineAd,
		deadlineBs: row.deadlineBs,
		appliesTo: row.appliesTo,
		summary: row.summary,
		description: row.description,
		eligibility: Array.isArray(row.eligibility)
			? (row.eligibility as Scholarship["eligibility"])
			: [],
		benefits: Array.isArray(row.benefits) ? (row.benefits as string[]) : [],
		documents: Array.isArray(row.documents) ? (row.documents as string[]) : [],
		process: Array.isArray(row.process) ? (row.process as string[]) : [],
		renewal: row.renewal,
		contact: row.contact,
		spotlight: row.spotlight || undefined,
	};
}

/** Public faculty directory, sorted leadership-first by rank. */
export const getFacultyMembersServer = createServerFn({
	method: "GET",
}).handler(async () => {
	setPublicCacheHeaders();
	const rows = await prisma.facultyMember.findMany({
		orderBy: [{ leadership: "desc" }, { rank: "asc" }, { order: "asc" }],
	});
	return rows.map(toPerson);
});

/** Public notice board: newest first, stable within the same timestamp. */
export const getNoticesServer = createServerFn({ method: "GET" }).handler(
	async (): Promise<Notice[]> => {
		setPublicCacheHeaders();
		const rows = await prisma.scmsNotice.findMany({
			where: { isPublished: true },
			orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
		});
		return rows.map(toNotice);
	},
);

/** Public scholarship schemes in their editorial (seed) order. */
export const getScholarshipsServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setPublicCacheHeaders();
		const rows = await prisma.scholarship.findMany({
			orderBy: { order: "asc" },
		});
		return rows.map(toScholarship);
	},
);

/** Gallery albums are stored with JSON photos; the page renders `Album`. */
function toAlbum(row: {
	id: string;
	event: string;
	year: string;
	category: string;
	date: string | null;
	photos: unknown;
}): Album {
	return {
		id: row.id,
		event: row.event,
		year: row.year,
		category: row.category,
		date: row.date ?? "",
		photos: Array.isArray(row.photos) ? (row.photos as Img[]) : [],
	};
}

export const getAlbumsServer = createServerFn({ method: "GET" }).handler(
	async (): Promise<Album[]> => {
		setPublicCacheHeaders();
		const rows = await prisma.album.findMany({ orderBy: { order: "asc" } });
		return rows.map(toAlbum);
	},
);

/** Campus facilities carry JSON `gallery`/`stats` columns. */
function toFacility(row: {
	id: string;
	name: string;
	category: string;
	block: string;
	blurb: string;
	description: string;
	image: string;
	gallery: unknown;
	stats: unknown;
	hours: string;
	inCharge: string;
	studentsLove: string;
	since: string;
	order: number;
}): Facility {
	return {
		id: row.id,
		name: row.name,
		category: row.category as Facility["category"],
		block: row.block,
		blurb: row.blurb,
		description: row.description,
		image: row.image,
		gallery: Array.isArray(row.gallery) ? (row.gallery as string[]) : [],
		stats: Array.isArray(row.stats) ? (row.stats as Facility["stats"]) : [],
		hours: row.hours,
		inCharge: row.inCharge,
		studentsLove: row.studentsLove,
		since: row.since,
		order: row.order,
	};
}

export const getFacilitiesServer = createServerFn({ method: "GET" }).handler(
	async (): Promise<Facility[]> => {
		setPublicCacheHeaders();
		const rows = await prisma.facility.findMany({ orderBy: { order: "asc" } });
		return rows.map(toFacility);
	},
);

export const getResourcesServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setPublicCacheHeaders();
		return await prisma.resource.findMany({ orderBy: { order: "asc" } });
	},
);

export const getBoardResultsServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setPublicCacheHeaders();
		return await prisma.boardResult.findMany({ orderBy: { order: "asc" } });
	},
);

/** Academic programmes carry JSON subject/fee/highlight columns. */
function toProgram(row: {
	id: string;
	level: string;
	code: string;
	title: string;
	stream: string | null;
	duration: string;
	seats: number;
	medium: string;
	eligibility: string;
	summary: string;
	description: string;
	highlights: unknown;
	outcomes: unknown;
	careers: unknown;
	subjects: unknown;
	fees: unknown;
	image: string;
	routineKey: string;
	spotlight: boolean;
	order: number;
}): Program {
	return {
		id: row.id,
		level: row.level as Program["level"],
		code: row.code,
		title: row.title,
		stream: row.stream ?? undefined,
		duration: row.duration,
		seats: row.seats,
		medium: row.medium,
		eligibility: row.eligibility,
		summary: row.summary,
		description: row.description,
		highlights: Array.isArray(row.highlights)
			? (row.highlights as string[])
			: [],
		outcomes: Array.isArray(row.outcomes) ? (row.outcomes as string[]) : [],
		careers: Array.isArray(row.careers) ? (row.careers as string[]) : [],
		subjects: Array.isArray(row.subjects)
			? (row.subjects as Program["subjects"])
			: [],
		fees: Array.isArray(row.fees) ? (row.fees as Program["fees"]) : [],
		image: row.image,
		routineKey: row.routineKey as Program["routineKey"],
		spotlight: row.spotlight || undefined,
		order: row.order,
	};
}

export const getProgramsServer = createServerFn({ method: "GET" }).handler(
	async (): Promise<Program[]> => {
		setPublicCacheHeaders();
		const rows = await prisma.program.findMany({ orderBy: { order: "asc" } });
		return rows.map(toProgram);
	},
);

export const getBusRoutesServer = createServerFn({ method: "GET" }).handler(
	async () => {
		setPublicCacheHeaders();
		const rows = await prisma.busRoute.findMany({ orderBy: { order: "asc" } });
		return rows.map((r) => ({ ...r, stops: r.stops as any }));
	},
);

export const getCalendarEventsServer = createServerFn({
	method: "GET",
}).handler(async () => {
	setPublicCacheHeaders();
	const rows = await prisma.calendarEvent.findMany({
		orderBy: { startDate: "asc" },
	});
	return rows.map((r) => ({
		...r,
		startDate: r.startDate.toISOString(),
		endDate: r.endDate.toISOString(),
		createdAt: r.createdAt.toISOString(),
		updatedAt: r.updatedAt.toISOString(),
	}));
});
