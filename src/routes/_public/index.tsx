import { createFileRoute, useSearch } from "@tanstack/react-router";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import LandingPage from "#/templates/modern/LandingPage.tsx";

export const Route = createFileRoute("/_public/")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "home" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: Home,
});

function Home() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("home");
	const preview = String(cms ?? "") === "1";
	const page = (
		preview ? previewPage : publishedContent
	) as WebsitePageContent | null;

	return <LandingPage page={page} preview={preview} />;
}
