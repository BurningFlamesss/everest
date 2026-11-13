import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import {
	PageFrame,
	PageHeader,
} from "#/templates/modern/components/chrome/PageFrame";
import { StreamChooser } from "#/templates/modern/components/interactions/StreamChooser";
import type { BlockType } from "#/types";

export const Route = createFileRoute("/_public/course-finder")({
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		if (String(search.cms) === "1") {
			const previewPage = await getWebsitePagePreviewServer({
				data: { key: "course_finder" },
			});
			return { previewPage };
		}
		return { previewPage: null };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { previewPage } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("course_finder");
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
				pageKey: "course_finder",
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
				testId="cms-section-hit-course-finder-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "Course finder"}
					title={str(headerSection, "title") || "Which stream"}
					lead={
						str(headerSection, "body") ||
						"Six questions. The result shows all three streams and why each one ranked where it did."
					}
				/>
			</CmsSectionBox>
			<div className="mt-10">
				<StreamChooser
					onHandoff={() => {}}
					onSeeAll={() => navigate({ to: "/" })}
				/>
			</div>
		</PageFrame>
	);
}
