const fs = require('fs');
const path = require('path');

const routes = {
  'index.tsx': 'home',
  'about.tsx': 'about',
  'courses.tsx': 'courses',
  'facilities.tsx': 'facilities',
  'gallery.tsx': 'gallery',
  'calendar.tsx': 'calendar',
  'contact.tsx': 'contact',
  'resources.tsx': 'resources',
  'result.tsx': 'result',
  'transportation.tsx': 'transportation',
  'notices.tsx': 'notices',
  'scholarship.tsx': 'scholarship'
};

const boilerplateImp = `
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { useSearch } from "@tanstack/react-router";
`;

for (const [file, key] of Object.entries(routes)) {
  const p = path.join(__dirname, 'src', 'routes', '_public', file);
  if (!fs.existsSync(p)) continue;
  
  let content = fs.readFileSync(p, 'utf8');
  if (content.includes('getWebsitePagePreviewServer')) {
    console.log(`Skipping ${file}, already has CMS setup.`);
    continue;
  }

  // Inject imports near the top
  const firstImportMatch = content.match(/import\s+.*?;/);
  if (firstImportMatch) {
    const importIndex = content.indexOf(firstImportMatch[0]);
    content = content.substring(0, importIndex) + boilerplateImp + content.substring(importIndex);
  }

  // Find Route definition and inject loader
  const routeMatch = content.match(/export\s+const\s+Route\s*=\s*createFileRoute\(["'][^"']+["']\)\(\{/);
  if (routeMatch) {
    const routeIndex = content.indexOf(routeMatch[0]) + routeMatch[0].length;
    const loaderCode = `
  loader: async ({ location }) => {
    const search = location.search as { cms?: string };
    if (String(search.cms) === "1") {
      const previewPage = await getWebsitePagePreviewServer({
        data: "${key}",
      });
      return { previewPage };
    }
    return { previewPage: null };
  },`;
    content = content.substring(0, routeIndex) + loaderCode + content.substring(routeIndex);
  }

  // Find Component and inject CMS hooks
  // usually `function RouteComponent() {` or `function Component() {` or `export default function ...`
  const compMatch = content.match(/function\s+(\w+)\s*\([^)]*\)\s*\{/);
  if (compMatch) {
    const fnName = compMatch[1];
    if (['RouteComponent', 'About', 'Calendar', 'Contact', 'Courses', 'Facilities', 'Gallery', 'Home', 'Notices', 'Resources', 'Result', 'Scholarships', 'Transportation'].includes(fnName)) {
      const compIndex = content.indexOf(compMatch[0]) + compMatch[0].length;
      const hookCode = `
  const search = (useSearch({ strict: false }) as Record<string, unknown>) || {};
  const cms = search.cms;
  const { previewPage } = Route.useLoaderData();
  const publishedContent = useWebsitePageContent("${key}");
  const preview = String(cms ?? "") === "1";
  const cmsData = preview ? previewPage : publishedContent;
`;
      content = content.substring(0, compIndex) + hookCode + content.substring(compIndex);
    }
  }

  fs.writeFileSync(p, content);
  console.log(`Patched ${file} for key ${key}`);
}
