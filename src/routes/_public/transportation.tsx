
import { getBusRoutesServer } from "#/packages/content/server/content";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from "#/templates/modern/components/interactions/BusFinder";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/transportation")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "transportation" },
			});
		}
		return {
			previewPage,
			routes: await getBusRoutesServer(),
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage, routes } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("transportation");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as any;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "transportation",
				sectionType,
			},
			"*",
		);
	};

	return (
		<PageFrame>
			<CmsSectionBox
				preview={preview}
				sectionType="headline"
				onSelect={onSelectSection}
				testId="cms-section-hit-transportation-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "TRANSPORTATION"}
					title={str(headerSection, "title") || "Bus route and pickup finder"}
					lead={
						str(headerSection, "body") ||
						"Three routes cover the valley from Hemja in the north-west to Birauta in the south."
					}
				/>
			</CmsSectionBox>
			<div className="mt-10 mb-16">
				<BusFinder routes={routes} />
			</div>
		</PageFrame>
	);
}

