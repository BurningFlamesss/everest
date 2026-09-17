
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import LandingPage from "#/templates/modern/LandingPage.tsx";

const PUBLIC_CACHE_HEADERS = () => ({
  "Cache-Control": "public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
  "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

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
  headers: PUBLIC_CACHE_HEADERS,
});

function Home() {
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("home");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;

  return <LandingPage />;
}
