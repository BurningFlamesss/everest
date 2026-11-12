
import { getBoardResultsServer } from "#/packages/content/server/content";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { ResultsChart } from "#/templates/modern/components/utilities/ResultsChart";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { str } from "#/components/cms/block-fields";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/result")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "result" },
			});
		}
		return { 
			previewPage,
			results: await getBoardResultsServer(),
		};
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage, results } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("result");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as any;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const statsSection = {
		...sectionDefaults("stats"),
		...getSectionFields(cmsData?.blocks, "stats"),
	};

	const statsTitle = str(statsSection, "title").trim();
	const statsBody = str(statsSection, "body").trim();

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "result",
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
				testId="cms-section-hit-result-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "RESULT"}
					title={str(headerSection, "title") || "Board results"}
					lead={
						str(headerSection, "body") ||
						"Division splits over the last five sessions for secondary education exams."
					}
				/>
			</CmsSectionBox>

			<CmsSectionBox
				preview={preview}
				sectionType="stats"
				onSelect={onSelectSection}
				testId="cms-section-hit-result-stats"
			>
				<div className="mt-10 mb-16">
					{statsTitle || statsBody ? (
						<div className="mb-6 flex flex-col gap-1">
							{statsTitle ? (
								<h2 className="font-semibold text-foreground">{statsTitle}</h2>
							) : null}
							{statsBody ? (
								<p className="text-sm text-muted-foreground">{statsBody}</p>
							) : null}
						</div>
					) : null}
					<ResultsChart dbResults={results} />
				</div>
			</CmsSectionBox>
		</PageFrame>
	);
}

