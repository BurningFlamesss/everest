
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { PageFrame, PageHeader } from "#/templates/modern/components/chrome/PageFrame";
import { BusFinder } from '#/templates/modern/components/interactions/BusFinder';
import { getBusRoutesServer } from "#/packages/content/server/content";

export const Route = createFileRoute("/_public/transportation")({
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    if (String(search.cms) === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: { key: "transportation" },
      });
      return { previewPage };
    }
    return { previewPage: null };
  },
  component: RouteComponent,
  loader: async () => {
    return {
      routes: await getBusRoutesServer(),
    };
  }
});

function RouteComponent() {
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("transportation");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

  const { routes } = Route.useLoaderData();
  
  return (
    <PageFrame>
      <PageHeader 
        eyebrow="TRANSPORTATION"
        title="Bus route and pickup finder"
        lead="Three routes cover the valley from Hemja in the north-west to Birauta in the south."
      />
      <div className="mt-10 mb-16">
        <BusFinder routes={routes} />
      </div>
    </PageFrame>
  );
}
