import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import {
	getAlbumsServer,
	getAllPublishedPagesServer,
	getBoardResultsServer,
	getBusRoutesServer,
	getCalendarEventsServer,
	getFacilitiesServer,
	getFacultyMembersServer,
	getNoticesServer,
	getProgramsServer,
	getResourcesServer,
	getScholarshipsServer,
	getSchoolConfigServer,
	getSchoolContentServer,
} from "#/packages/content/server/content.ts";
import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";
import { schoolThemeStyle } from "#/packages/school/theme.ts";
import { AuthProvider } from "#/providers/AuthProvider";
import { Sidebar } from "#/templates/modern/components/layout/Sidebar";
import themeCss from "#/templates/modern/components/tokens/theme.css?url";
import type { MyRouterContext } from "#/types/router-context.ts";
import appCss from "../app.css?url";
import indexCss from "../index.css?url";
import globalCss from "../styles.css?url";

function ErrorComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4 lg:pl-[var(--nav-w)]">
			<div className="text-center max-w-md">
				<h1 className="font-display text-4xl font-bold text-foreground mb-4">
					Something went wrong
				</h1>
				<p className="text-muted-foreground mb-6">
					We encountered an unexpected error. Please try refreshing the page or
					contact support if the problem persists.
				</p>
				<button
					onClick={() => window.location.reload()}
					className="px-6 py-3 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 transition-colors"
				>
					Refresh Page
				</button>
			</div>
		</div>
	);
}

function NotFoundComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-background px-4 lg:pl-[var(--nav-w)]">
			<div className="text-center">
				<p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
					404
				</p>
				<h1 className="mt-3 font-display text-4xl font-bold text-foreground">
					We couldn&apos;t find that page
				</h1>
				<p className="mt-2 text-muted-foreground">
					The link may be old or the page may have moved.
				</p>
				<a
					href="/"
					className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
				>
					Back to the home page
				</a>
			</div>
		</div>
	);
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	async beforeLoad() {
		const session = await getSessionFn();

		// Dehydrate only the user, never the raw session record: the router
		// streams this context into every HTML document, and public pages
		// carry `Cache-Control: public, s-maxage=…` — a full session here
		// (token, ipAddress, userAgent) would be embedded in a page a shared
		// CDN may serve to other visitors. Consumers only read `session.user`.
		return {
			session: session?.user
				? {
						user: {
							id: session.user.id,
							name: session.user.name,
							email: session.user.email,
							emailVerified: session.user.emailVerified,
							image: session.user.image,
							role: session.user.role,
						},
					}
				: null,
		};
	},
	async loader() {
		// Wrap DB requests with a timeout to prevent infinite hanging when DB is asleep/down
		const withTimeout = <T,>(promise: Promise<T>, ms = 4000): Promise<T> =>
			Promise.race([
				promise,
				new Promise<T>((_, reject) =>
					setTimeout(() => reject(new Error("Loader query timeout")), ms),
				),
			]);

		// Fetch every published CMS page + every public content collection so all
		// public pages are driven from the database. Each call is independently
		// fault-tolerant — a single failure falls back to null and the affected page
		// renders its static placeholder content instead of erroring the whole load.
		const [
			configResult,
			pagesResult,
			sidebarContentResult,
			facultyMembersResult,
			noticesResult,
			scholarshipsResult,
			albumsResult,
			facilitiesResult,
			resourcesResult,
			boardResultsResult,
			programsResult,
			busRoutesResult,
			calendarEventsResult,
		] = await Promise.allSettled([
			withTimeout(getSchoolConfigServer({ data: { identifier: "everest" } })),
			withTimeout(getAllPublishedPagesServer()),
			withTimeout(getSchoolContentServer({ data: { identifier: "everest" } })),
			withTimeout(getFacultyMembersServer()),
			withTimeout(getNoticesServer()),
			withTimeout(getScholarshipsServer()),
			withTimeout(getAlbumsServer()),
			withTimeout(getFacilitiesServer()),
			withTimeout(getResourcesServer()),
			withTimeout(getBoardResultsServer()),
			withTimeout(getProgramsServer()),
			withTimeout(getBusRoutesServer()),
			withTimeout(getCalendarEventsServer()),
		]);

		const settled = <T,>(r: PromiseSettledResult<T>): T | null =>
			r.status === "fulfilled" ? r.value : null;

		const config = settled(configResult) ?? getSchoolConfig("everest");
		const fallbackContent = getSchoolContent("everest");
		const sidebarContent = settled(sidebarContentResult) ?? fallbackContent;

		// Key published pages by their WebsitePageKey so useWebsitePageContent(key)
		// resolves for every managed page, not just a hardcoded few.
		const pages = settled(pagesResult) ?? [];

		const content: Record<string, unknown> = {
			// Always ship a sidebar: when the database is unreachable (or not yet
			// seeded) the bundled navigation is used instead of an empty menu.
			sidebar: sidebarContent?.sidebar ?? fallbackContent.sidebar,
		};
		for (const page of pages) {
			if (page && page.key) content[page.key] = page;
		}

		// Entity collections — only set when non-empty so pages keep their static
		// fallback when a table has not been seeded yet.
		const collections: Array<[string, unknown[] | null]> = [
			["facultyMembers", settled(facultyMembersResult)],
			["notices", settled(noticesResult)],
			["scholarships", settled(scholarshipsResult)],
			["albums", settled(albumsResult)],
			["facilities", settled(facilitiesResult)],
			["resources", settled(resourcesResult)],
			["boardResults", settled(boardResultsResult)],
			["programs", settled(programsResult)],
			["busRoutes", settled(busRoutesResult)],
			["calendarEvents", settled(calendarEventsResult)],
		];
		for (const [key, rows] of collections) {
			if (Array.isArray(rows) && rows.length > 0) content[key] = rows;
		}

		return {
			config,
			content,
		};
	},
	head: ({ loaderData }) => {
		const config = loaderData?.config;
		const defaultTitle =
			config?.seo?.title ||
			"Everest English Boarding Secondary School | EEBSS - Best School in Nepal";
		const defaultDescription =
			config?.seo?.description ||
			"Everest English Boarding Secondary School (EEBSS) in Butwal, Nepal. Premier academic institution offering Early Childhood to Grade 12 (+2 Science & Management) affiliated with NEB Nepal.";
		const defaultImage =
			config?.seo?.ogImage || "https://everestebss.edu.np/schools/everest/logo.png";

		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					name: "robots",
					content:
						"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
				},
				{ name: "googlebot", content: "index, follow" },
				{
					name: "keywords",
					content:
						"everest school, everest english boarding school, eebss, school in nepal, best school in nepal, top school in nepal, best school in butwal, top school in butwal, best school in rupandehi, everest english boarding secondary school, everest butwal, eebss butwal, +2 science in butwal nepal, +2 management in butwal nepal, best secondary school in nepal, top neb school in nepal",
				},
				{
					name: "author",
					content: "Everest English Boarding Secondary School",
				},
				{
					name: "publisher",
					content: "Everest English Boarding Secondary School",
				},
				{ name: "geo.region", content: "NP-P5" },
				{ name: "geo.placename", content: "Butwal, Rupandehi, Nepal" },
				{ name: "geo.position", content: "27.7;83.4486" },
				{ name: "ICBM", content: "27.7, 83.4486" },
				{ title: defaultTitle },
				{
					name: "description",
					content: defaultDescription,
				},
				{
					name: "theme-color",
					content: config?.theme?.primary || "#DC2626",
				},
				{
					property: "og:type",
					content: "website",
				},
				{
					property: "og:site_name",
					content: "Everest English Boarding Secondary School (EEBSS)",
				},
				{
					property: "og:locale",
					content: "en_US",
				},
				{
					property: "og:locale:alternate",
					content: "ne_NP",
				},
				{
					property: "og:title",
					content: defaultTitle,
				},
				{
					property: "og:description",
					content: defaultDescription,
				},
				{
					property: "og:image",
					content: defaultImage,
				},
				{
					name: "twitter:card",
					content: "summary_large_image",
				},
				{
					name: "twitter:site",
					content: "@eebssbutwal",
				},
				{
					name: "twitter:title",
					content: defaultTitle,
				},
				{
					name: "twitter:description",
					content: defaultDescription,
				},
				{
					name: "twitter:image",
					content: defaultImage,
				},
			],
			links: [
				{
					rel: "canonical",
					href: "https://everestebss.edu.np",
				},
				{
					rel: "stylesheet",
					href: globalCss,
				},
				{
					rel: "stylesheet",
					href: appCss,
				},
				{
					rel: "stylesheet",
					href: indexCss,
				},
				{
					rel: "stylesheet",
					href: themeCss,
				},
			],
		};
	},
	errorComponent: ErrorComponent,
	notFoundComponent: NotFoundComponent,
	shellComponent: RootDocument,
});

const schoolStructuredData = {
	"@context": "https://schema.org",
	"@type": ["School", "EducationalOrganization"],
	"@id": "https://everestebss.edu.np/#school",
	name: "Everest English Boarding Secondary School",
	alternateName: [
		"EEBSS",
		"Everest School",
		"Everest English Boarding School",
		"Everest School Butwal",
		"Everest Higher Secondary School",
		"EEBSS Butwal",
		"श्री एभरेस्ट इङ्लिश बोर्डिङ माध्यमिक विद्यालय",
	],
	url: "https://everestebss.edu.np",
	logo: "https://everestebss.edu.np/schools/everest/logo.png",
	image:
		"https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=80",
	description:
		"Everest English Boarding Secondary School (EEBSS), established in 1985 AD (2042 BS), is one of the top and best schools in Nepal. Located in Butwal-8, Rupandehi, Everest EBSS provides premier education from Early Years through Grade 12 (+2 Science & Management) affiliated with National Examinations Board (NEB), Nepal.",
	address: {
		"@type": "PostalAddress",
		streetAddress: "Butwal-8, Sukkhanagar",
		addressLocality: "Butwal",
		addressRegion: "Lumbini Province",
		postalCode: "32907",
		addressCountry: "NP",
	},
	geo: {
		"@type": "GeoCoordinates",
		latitude: 27.7,
		longitude: 83.4486,
	},
	telephone: "+977-71-535962",
	email: "everestbutwal@gmail.com",
	foundingDate: "1985",
	sameAs: [
		"https://www.facebook.com/eebssbutwal",
		"https://www.instagram.com/",
	],
	hasOfferCatalog: {
		"@type": "OfferCatalog",
		name: "Academic Programs",
		itemListElement: [
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Course",
					name: "+2 Science Program",
					description:
						"Physics, Chemistry, Biology, Mathematics and Computer Science program affiliated with NEB Nepal.",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Course",
					name: "+2 Management Program",
					description:
						"Accounting, Economics, Business Studies, Marketing and Computer Applications affiliated with NEB Nepal.",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Course",
					name: "Secondary School (Grades 1-10 / SEE)",
					description:
						"Rigorous school education preparing students for the national Secondary Education Examination (SEE).",
				},
			},
			{
				"@type": "Offer",
				itemOffered: {
					"@type": "Course",
					name: "Early Childhood Care & Primary School",
					description:
						"Foundational education fostering curiosity, creativity, and character development.",
				},
			},
		],
	},
};

const websiteStructuredData = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	"@id": "https://everestebss.edu.np/#website",
	name: "Everest English Boarding Secondary School - EEBSS",
	alternateName: "Everest School Nepal",
	url: "https://everestebss.edu.np",
	potentialAction: {
		"@type": "SearchAction",
		target: "https://everestebss.edu.np/course-finder?q={search_term_string}",
		"query-input": "required name=search_term_string",
	},
};

function RootDocument({ children }: { children: React.ReactNode }) {
	const { config } = Route.useLoaderData();

	return (
		<html lang="en" style={schoolThemeStyle(config)}>
			<head>
				<HeadContent />
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schoolStructuredData),
					}}
				/>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteStructuredData),
					}}
				/>
			</head>
			<body>
				<AuthProvider>
					<Sidebar />
					{children}
				</AuthProvider>
				<TanStackDevtools
					config={{
						position: "bottom-right",
					}}
					plugins={[
						{
							name: "Tanstack Router",
							render: <TanStackRouterDevtoolsPanel />,
						},
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
