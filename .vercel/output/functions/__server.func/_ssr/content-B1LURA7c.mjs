import { _enum, object, string$1 as string } from "../_libs/@better-auth/core+[...].mjs";
import { createServerFn, setResponseHeaders } from "./ssr.mjs";
import { prisma } from "./prisma-BJwaacZj.mjs";
import { createServerRpc } from "./createServerRpc-DPX_ndmm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/content-B1LURA7c.js
var PageKeySchema = object({ key: _enum([
	"homepage",
	"about",
	"contact",
	"other",
	"faculty",
	"login"
]) });
var StringSchema = object({ identifier: string() });
var PUBLIC_CACHE_HEADERS = new Headers({
	"Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400"
});
function toWebsitePageContent(page) {
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
			fields: block.fields,
			updatedAt: block.updatedAt.toISOString(),
			createdAt: block.createdAt.toISOString()
		})),
		publishedAt: page.publishedAt?.toISOString() ?? null,
		updatedAt: page.updatedAt.toISOString(),
		createdAt: page.createdAt.toISOString(),
		updatedBy: page.updatedBy
	};
}
/** Published page for a managed key (public rendering). */
var getWebsitePageServer_createServerFn_handler = createServerRpc({
	id: "24972fe8e2a57b4119cb627621a200ef9021b91d16e694c2c9f298757cb5591e",
	name: "getWebsitePageServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getWebsitePageServer.__executeServer(opts));
var getWebsitePageServer = createServerFn({ method: "GET" }).validator(PageKeySchema).handler(getWebsitePageServer_createServerFn_handler, async ({ data: { key } }) => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	const page = await prisma.websitePage.findUnique({
		where: {
			key,
			status: "published"
		},
		include: { blocks: {
			where: { visible: true },
			orderBy: { order: "asc" }
		} }
	});
	return page ? toWebsitePageContent(page) : null;
});
var getWebsitePagePreviewServer_createServerFn_handler = createServerRpc({
	id: "05ee4134c252859a7c7ddbd9eda0df4da21ee5b4602332a49c5dbd0bfcc10ee5",
	name: "getWebsitePagePreviewServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getWebsitePagePreviewServer.__executeServer(opts));
var getWebsitePagePreviewServer = createServerFn({ method: "GET" }).validator(PageKeySchema).handler(getWebsitePagePreviewServer_createServerFn_handler, async ({ data: { key } }) => {
	const page = await prisma.websitePage.findUnique({
		where: { key },
		include: { blocks: {
			where: { visible: true },
			orderBy: { order: "asc" }
		} }
	});
	return page ? toWebsitePageContent(page) : null;
});
var getSchoolConfigServer_createServerFn_handler = createServerRpc({
	id: "15fe0817f69751555a6a34b4afc70d42ace904896970693c7e3f9e17b9abf47c",
	name: "getSchoolConfigServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getSchoolConfigServer.__executeServer(opts));
var getSchoolConfigServer = createServerFn({ method: "GET" }).validator(StringSchema).handler(getSchoolConfigServer_createServerFn_handler, async ({ data: { identifier } }) => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	const org = await prisma.organization.findUnique({
		where: { slug: identifier },
		include: { branches: { take: 1 } }
	});
	if (!org) return null;
	const mainBranch = org.branches[0];
	return {
		organization: {
			name: org.name,
			slug: org.slug
		},
		theme: {
			template: "modern",
			primary: "#1a1a2e"
		},
		features: {
			clubs: true,
			events: true,
			notices: true
		},
		contact: {
			phone: mainBranch?.phone ?? "",
			email: mainBranch?.email ?? ""
		},
		seo: {
			title: org.name,
			description: org.description ?? ""
		}
	};
});
var getSchoolContentServer_createServerFn_handler = createServerRpc({
	id: "d78fec660a8c9f262f3e0a9e4248f673f8878e00ed4199c753315e701e054dcf",
	name: "getSchoolContentServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getSchoolContentServer.__executeServer(opts));
var getSchoolContentServer = createServerFn({ method: "GET" }).validator(StringSchema).handler(getSchoolContentServer_createServerFn_handler, async ({ data: { identifier } }) => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	const org = await prisma.organization.findUnique({
		where: { slug: identifier },
		include: { branches: true }
	});
	if (!org) return null;
	return {
		sidebar: {
			logo: org.logo ?? "",
			tagline: org.description ?? "",
			collapsible: {
				home: {
					id: "home",
					label: "HOME",
					href: "/"
				},
				about: {
					id: "about",
					label: "ABOUT",
					href: "/about"
				},
				courses: {
					id: "courses",
					label: "COURSES",
					href: "/courses"
				},
				facilities: {
					id: "facilities",
					label: "FACILITIES",
					href: "/facilities"
				},
				gallery: {
					id: "gallery",
					label: "GALLERY",
					href: "/gallery"
				},
				moreInfo: {
					id: "moreInfo",
					label: "More Info",
					children: [
						{
							id: "faculty",
							label: "Faculty",
							href: "/faculty"
						},
						{
							id: "notices",
							label: "Notices",
							href: "/notices"
						},
						{
							id: "scholarship",
							label: "Scholarships",
							href: "/scholarship"
						},
						{
							id: "calendar",
							label: "Calendar",
							href: "/calendar"
						},
						{
							id: "transportation",
							label: "Transportation",
							href: "/transportation"
						},
						{
							id: "result",
							label: "Result",
							href: "/result"
						},
						{
							id: "course-finder",
							label: "Course Finder",
							href: "/course-finder"
						},
						{
							id: "resources",
							label: "Resources",
							href: "/resources"
						}
					]
				},
				contact: {
					id: "contact",
					label: "CONTACT",
					href: "/contact"
				}
			}
		},
		login: {}
	};
});
var getAllPublishedPagesServer_createServerFn_handler = createServerRpc({
	id: "b7f43ea08a9023819e12e9f7bfe7d553765bc7900caa1eec1bf61db1cfe94ae2",
	name: "getAllPublishedPagesServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getAllPublishedPagesServer.__executeServer(opts));
var getAllPublishedPagesServer = createServerFn({ method: "GET" }).handler(getAllPublishedPagesServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.websitePage.findMany({
		where: { status: "published" },
		include: { blocks: {
			where: { visible: true },
			orderBy: { order: "asc" }
		} }
	})).map(toWebsitePageContent);
});
function toPerson(row) {
	return {
		id: row.slug,
		name: row.name,
		role: row.role,
		department: row.department,
		qualification: row.qualification,
		experience: row.experience,
		subjects: Array.isArray(row.subjects) ? row.subjects : [],
		email: row.email,
		extension: row.extension,
		officeHours: row.officeHours,
		bio: row.bio,
		joined: row.joined,
		leadership: row.leadership || void 0,
		rank: row.rank ?? void 0
	};
}
function toNotice(row) {
	return {
		id: row.ref,
		ref: row.ref,
		title: row.title,
		category: row.category,
		dateAd: row.dateAd,
		dateBs: row.dateBs,
		audience: row.audience,
		issuedBy: row.issuedBy,
		summary: row.summary,
		body: Array.isArray(row.body) ? row.body : [],
		bullets: Array.isArray(row.bullets) ? row.bullets : void 0,
		table: row.table ? row.table : void 0,
		attachments: Array.isArray(row.attachments) ? row.attachments : [],
		pinned: row.pinned || void 0
	};
}
function toScholarship(row) {
	return {
		id: row.ref,
		ref: row.ref,
		name: row.name,
		nepaliName: row.nepaliName,
		category: row.category,
		coverage: row.coverage,
		award: row.award,
		amountNpr: row.amountNpr,
		seats: row.seats,
		deadlineAd: row.deadlineAd,
		deadlineBs: row.deadlineBs,
		appliesTo: row.appliesTo,
		summary: row.summary,
		description: row.description,
		eligibility: Array.isArray(row.eligibility) ? row.eligibility : [],
		benefits: Array.isArray(row.benefits) ? row.benefits : [],
		documents: Array.isArray(row.documents) ? row.documents : [],
		process: Array.isArray(row.process) ? row.process : [],
		renewal: row.renewal,
		contact: row.contact,
		spotlight: row.spotlight || void 0
	};
}
/** Public faculty directory, sorted leadership-first by rank. */
var getFacultyMembersServer_createServerFn_handler = createServerRpc({
	id: "0a2a59ee9783d075f29b433934622b87c0f0b7a421b8e27ca86bfe9a25786d43",
	name: "getFacultyMembersServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getFacultyMembersServer.__executeServer(opts));
var getFacultyMembersServer = createServerFn({ method: "GET" }).handler(getFacultyMembersServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.facultyMember.findMany({ orderBy: [
		{ leadership: "desc" },
		{ rank: "asc" },
		{ order: "asc" }
	] })).map(toPerson);
});
var getNoticesServer_createServerFn_handler = createServerRpc({
	id: "359cf7121f28a135211f559ff82c48270e5ff3f06c6b0ab8ca693494ff4ccf29",
	name: "getNoticesServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getNoticesServer.__executeServer(opts));
var getNoticesServer = createServerFn({ method: "GET" }).handler(getNoticesServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.notice.findMany({ orderBy: [{ pinned: "desc" }, { dateAd: "desc" }] })).map(toNotice);
});
var getScholarshipsServer_createServerFn_handler = createServerRpc({
	id: "c7258a65f851fdb91e10c600c93080da12e341370b1597d54bbadeb6d2331a64",
	name: "getScholarshipsServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getScholarshipsServer.__executeServer(opts));
var getScholarshipsServer = createServerFn({ method: "GET" }).handler(getScholarshipsServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.scholarship.findMany({ orderBy: { order: "asc" } })).map(toScholarship);
});
var getAlbumsServer_createServerFn_handler = createServerRpc({
	id: "fa328c642cc834688b17faf9c0dd85e5b23dc6b8639d6895b70c42c68bf6bc58",
	name: "getAlbumsServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getAlbumsServer.__executeServer(opts));
var getAlbumsServer = createServerFn({ method: "GET" }).handler(getAlbumsServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.album.findMany({ orderBy: { order: "asc" } })).map((r) => ({
		...r,
		photos: r.photos
	}));
});
var getFacilitiesServer_createServerFn_handler = createServerRpc({
	id: "80425186da58ad0aa712b7e791da23b3e3150f46dc1934737d9e7224fbf2bd28",
	name: "getFacilitiesServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getFacilitiesServer.__executeServer(opts));
var getFacilitiesServer = createServerFn({ method: "GET" }).handler(getFacilitiesServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.facility.findMany({ orderBy: { order: "asc" } })).map((r) => ({
		...r,
		specs: r.specs,
		images: r.images,
		block: r.block
	}));
});
var getResourcesServer_createServerFn_handler = createServerRpc({
	id: "bee60ab55065ac11a205d11b69d5d2fec2f00ad36719a3d1f5cef19aa920f5aa",
	name: "getResourcesServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getResourcesServer.__executeServer(opts));
var getResourcesServer = createServerFn({ method: "GET" }).handler(getResourcesServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return await prisma.resource.findMany({ orderBy: { order: "asc" } });
});
var getBoardResultsServer_createServerFn_handler = createServerRpc({
	id: "359054cc702b9ee1cb0cc381a97ddadb1798fcd4636f7ed76037fa0022577d6a",
	name: "getBoardResultsServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getBoardResultsServer.__executeServer(opts));
var getBoardResultsServer = createServerFn({ method: "GET" }).handler(getBoardResultsServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return await prisma.boardResult.findMany({ orderBy: { order: "asc" } });
});
var getBusRoutesServer_createServerFn_handler = createServerRpc({
	id: "fb307d82a368b0935b1167e49a44c136f1527fe896ba1a1ad925fb4dfffe55bd",
	name: "getBusRoutesServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getBusRoutesServer.__executeServer(opts));
var getBusRoutesServer = createServerFn({ method: "GET" }).handler(getBusRoutesServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.busRoute.findMany({ orderBy: { order: "asc" } })).map((r) => ({
		...r,
		stops: r.stops
	}));
});
var getCalendarEventsServer_createServerFn_handler = createServerRpc({
	id: "e0d85bd2c89db392d868fa4fe13b34ffd12562d1f60f8dfa16b2e132f7c0be0e",
	name: "getCalendarEventsServer",
	filename: "src/packages/content/server/content.ts"
}, (opts) => getCalendarEventsServer.__executeServer(opts));
var getCalendarEventsServer = createServerFn({ method: "GET" }).handler(getCalendarEventsServer_createServerFn_handler, async () => {
	setResponseHeaders(PUBLIC_CACHE_HEADERS);
	return (await prisma.calendarEvent.findMany({ orderBy: { startDate: "asc" } })).map((r) => ({
		...r,
		startDate: r.startDate.toISOString(),
		endDate: r.endDate.toISOString()
	}));
});
//#endregion
export { getAlbumsServer_createServerFn_handler, getAllPublishedPagesServer_createServerFn_handler, getBoardResultsServer_createServerFn_handler, getBusRoutesServer_createServerFn_handler, getCalendarEventsServer_createServerFn_handler, getFacilitiesServer_createServerFn_handler, getFacultyMembersServer_createServerFn_handler, getNoticesServer_createServerFn_handler, getResourcesServer_createServerFn_handler, getScholarshipsServer_createServerFn_handler, getSchoolConfigServer_createServerFn_handler, getSchoolContentServer_createServerFn_handler, getWebsitePagePreviewServer_createServerFn_handler, getWebsitePageServer_createServerFn_handler };
