import { createFileRoute, useSearch } from "@tanstack/react-router";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import { getPublicClubActivitiesFn } from "#/packages/clubs/server.ts";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { pageMeta } from "#/packages/school/meta.ts";
import LandingPage from "#/templates/modern/LandingPage.tsx";

export const Route = createFileRoute("/_public/")({
	head: () =>
		pageMeta({
			title:
				"Everest English Boarding Secondary School | EEBSS - Best School in Nepal",
			description:
				"Everest English Boarding Secondary School (EEBSS) in Butwal, Nepal. Ranked among the best schools in Nepal, offering pre-primary to Grade 12 (+2 Science & Management) with NEB affiliation, modern laboratories, and holistic student growth.",
			path: "/",
			keywords:
				"everest school, everest english boarding school, eebss, school in nepal, best school in nepal, top school in nepal, best school in butwal, best school in rupandehi, everest english boarding secondary school, everest butwal, eebss butwal, +2 science in butwal nepal, +2 management in butwal nepal",
		}),
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		const [previewPage, clubData] = await Promise.all([
			String(search.cms) === "1"
				? getWebsitePagePreviewServer({ data: { key: "home" } })
				: Promise.resolve(null),
			getPublicClubActivitiesFn(),
		]);
		return { previewPage, clubData };
	},
	component: Home,
});

function Home() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage, clubData } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("home");
	const preview = String(cms ?? "") === "1";
	const page = (
		preview ? previewPage : publishedContent
	) as WebsitePageContent | null;

	return <LandingPage page={page} preview={preview} clubData={clubData} />;
}
