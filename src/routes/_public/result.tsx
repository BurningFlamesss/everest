
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { ResultsChart } from '#/templates/modern/components/utilities/ResultsChart';
import { getBoardResultsServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/result")({
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    if (String(search.cms) === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: { key: "result" },
      });
      return { previewPage };
    }
    return { previewPage: null };
  },
  component: RouteComponent,
  loader: async () => {
    return {
      results: await getBoardResultsServer(),
    };
  }
});

function RouteComponent() {
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("result");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

  const { results } = Route.useLoaderData();

  return (
    <PageFrame>
      <PageHeader 
        eyebrow="RESULT"
        title="Board results"
        lead="Division splits over the last five sessions for secondary education exams."
      />
      <div className="mt-10 mb-16">
          <ResultsChart dbResults={results} />
      </div>
    </PageFrame>
  );
}
