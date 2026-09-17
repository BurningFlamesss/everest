
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import {
	PageFrame,
	PageHeader,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";
import { DownloadsCentre } from "#/templates/modern/components/utilities/DownloadsCentre";
import { getResourcesServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/resources")({
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    if (String(search.cms) === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: { key: "resources" },
      });
      return { previewPage };
    }
    return { previewPage: null };
  },
	component: RouteComponent,
	loader: async () => {
		return {
			resources: await getResourcesServer(),
		};
	}
});

function RouteComponent() {
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("resources");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

	const { resources } = Route.useLoaderData();

	return (
		<PageFrame>
			<PageHeader
				eyebrow="Resources"
				title="Downloads and Materials"
				lead="Access important files, forms, and documents for the academic session."
			/>
			<div className="mt-10 mb-16" data-testid="resources-downloads">
				<DownloadsCentre dbResources={resources} />
			</div>
		</PageFrame>
	);
}
