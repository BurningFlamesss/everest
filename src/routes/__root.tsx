import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	createRootRouteWithContext,
	HeadContent,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { getSessionFn } from "#/packages/auth/middleware/auth.middleware.ts";
import { getSchoolConfig, getSchoolContent } from "#/packages/school/loader.ts";
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
	head: ({ loaderData }) => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: loaderData?.config.seo.title,
			},
			{
				name: "description",
				content: loaderData?.config.seo.description,
			},
		],
		links: [
			{
				rel: "stylesheet",
				href: appCss,
			},
		],
	}),
	notFoundComponent: () => {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-4 md:pl-72">
				<div className="text-center">
					<p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-600">
						404
					</p>
					<h1 className="mt-3 text-4xl font-bold text-gray-900">
						We couldn&apos;t find that page
					</h1>
					<p className="mt-2 text-gray-600">
						The link may be old or the page may have moved.
					</p>
					<a
						href="/"
						className="mt-6 inline-flex rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
					>
						Back to the home page
					</a>
				</div>
			</div>
		);
	},
	errorComponent: ({ error, reset }) => {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f6f1e8] px-4 md:pl-72">
				<div className="max-w-md text-center">
					<h1 className="text-3xl font-bold text-gray-900">
						Something went wrong
					</h1>
					<p className="mt-2 text-sm text-gray-600">
						{error.message || "An unexpected error occurred."}
					</p>
					<button
						type="button"
						onClick={reset}
						className="mt-6 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
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
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{/* <LenisProvider /> */}
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
