
import { getResourcesServer } from "#/packages/content/server/content";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { DownloadsCentre } from "#/templates/modern/components/utilities/DownloadsCentre";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/resources")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "resources" },
			});
		}
		return {
			previewPage,
			resources: await getResourcesServer(),
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage, resources } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("resources");
	const preview = String(cms ?? "") === "1";
	const cmsData = preview ? previewPage : publishedContent;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "resources",
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
				testId="cms-section-hit-resources-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "Resources"}
					title={str(headerSection, "title") || "Downloads and Materials"}
					lead={
						str(headerSection, "body") ||
						"Access important files, forms, and documents for the academic session."
					}
				/>
			</CmsSectionBox>
			<div className="mt-10 mb-16" data-testid="resources-downloads">
				<DownloadsCentre dbResources={resources} />
			</div>
		</PageFrame>
	);
}

