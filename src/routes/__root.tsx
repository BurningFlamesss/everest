import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";
import { schoolThemeStyle } from "#/packages/school/theme.ts";
import Sidebar from "#/templates/modern/Sidebar.tsx";
import type { MyRouterContext } from "#/types/router-context.ts";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<MyRouterContext>()({
	async beforeLoad() {
		const session = await getSessionFn();

		return { session };
	},
	async loader() {
		const config = getSchoolConfig("everest");
		const content = getSchoolContent("everest");

		return {
			config,
			content,
		};
	},
	head: ({ loaderData }) => {
		const config = loaderData?.config;
		const title = config?.seo.title;
		const description = config?.seo.description;

		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{ title },
				{ name: "description", content: description },
				{ name: "theme-color", content: config?.theme.primary },
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: config?.organization.name },
				{ property: "og:title", content: title },
				{ property: "og:description", content: description },
				{ property: "og:image", content: config?.seo.ogImage },
				{ name: "twitter:card", content: "summary_large_image" },
				{ name: "twitter:title", content: title },
				{ name: "twitter:description", content: description },
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
			],
		};
	},
	notFoundComponent: () => {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4 md:pl-72">
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
						className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
					>
						Back to the home page
					</a>
				</div>
			</div>
		);
	},
	errorComponent: ({ error, reset }) => {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4 md:pl-72">
				<div className="max-w-md text-center">
					<h1 className="font-display text-3xl font-bold text-foreground">
						Something went wrong
					</h1>
					<p className="mt-2 text-sm text-muted-foreground">
						{(error instanceof Error && error.message) ||
							"An unexpected error occurred."}
					</p>
					<button
						type="button"
						onClick={reset}
						className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
					>
						Try again
					</button>
				</div>
			</div>
		);
	},
	shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
	const { config } = Route.useLoaderData();

	return (
		<html lang="en" style={schoolThemeStyle(config)}>
			<head>
				<HeadContent />
			</head>
			<body>
				<Sidebar />
				{children}
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
