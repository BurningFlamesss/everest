import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Suspense } from "react";
import NotFoundPage from "#/components/NotFoundPage.tsx";
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
import { AuthProvider } from "#/providers/AuthProvider";
import { Sidebar } from "#/templates/modern/components/layout/Sidebar";
import themeCss from "#/templates/modern/components/tokens/theme.css?url";
import type { MyRouterContext } from "#/types/router-context.ts";
import appCss from "../app.css?url";
import indexCss from "../index.css?url";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import globalCss from "../styles.css?url";

import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";

const PUBLIC_CACHE_HEADERS = () => ({
	"Cache-Control":
		"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

function ErrorComponent() {
	return (
		<div className="flex min-h-screen items-center justify-center bg-muted p-4">
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

export const Route = createRootRouteWithContext<MyRouterContext>()({
	async beforeLoad() {
		const session = await getSessionFn();

		return { session };
	},
	async loader() {
		// Wrap DB requests with a timeout to prevent infinite hanging when DB is asleep/down
		const withTimeout = <T,>(promise: Promise<T>, ms = 4000): Promise<T> =>
			Promise.race([
				promise,
				new Promise<T>((_, reject) =>
					setTimeout(() => reject(new Error("Loader query timeout")), ms)
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
		const sidebarContent =
			settled(sidebarContentResult) ?? getSchoolContent("everest");

		// Key published pages by their WebsitePageKey so useWebsitePageContent(key)
		// resolves for every managed page, not just a hardcoded few.
		const pages = settled(pagesResult) ?? [];

		const content: Record<string, unknown> = {
			sidebar: sidebarContent?.sidebar,
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
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "Everest English Boarding Secondary School",
			},
		],
		links: [
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
	}),
	headers: PUBLIC_CACHE_HEADERS,
	notFoundComponent: NotFoundPage,
	errorComponent: ErrorComponent,
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				<AuthProvider>
					<Sidebar />
					<Suspense
						fallback={
							<div className="flex h-screen items-center justify-center">
								Loading...
							</div>
						}
					>
						{children}
					</Suspense>
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
						TanStackQueryDevtools,
					]}
				/>
				<Scripts />
			</body>
		</html>
	);
}
