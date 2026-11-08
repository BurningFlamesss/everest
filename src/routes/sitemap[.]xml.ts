import { createFileRoute } from "@tanstack/react-router";
import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";

const staticPaths = [
	"/",
	"/about",
	"/contact",
	"/notices",
	"/events",
	"/clubs",
	"/gallery",
	"/admissions",
];

function escapeXml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

export const Route = createFileRoute("/sitemap.xml")({
	server: {
		handlers: {
			GET: async () => {
				const baseUrl = serverEnv.APP_URL.replace(/\/$/, "");
				const now = new Date();

				const [notices, events] = await Promise.all([
					prisma.scmsNotice.findMany({
						where: {
							isPublished: true,
							publishedAt: { lte: now },
							OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
						},
						select: { slug: true, updatedAt: true },
						orderBy: { publishedAt: "desc" },
						take: 500,
					}),
					prisma.event.findMany({
						where: { isPublished: true },
						select: { slug: true, updatedAt: true },
						orderBy: { startsAt: "desc" },
						take: 500,
					}),
				]);

				const urls: Array<{
					loc: string;
					lastmod?: string;
					priority: string;
				}> = staticPaths.map((path) => ({
					loc: `${baseUrl}${path}`,
					priority: path === "/" ? "1.0" : "0.7",
				}));

				for (const notice of notices) {
					urls.push({
						loc: `${baseUrl}/notices/${notice.slug}`,
						lastmod: notice.updatedAt.toISOString(),
						priority: "0.6",
					});
				}

				for (const event of events) {
					urls.push({
						loc: `${baseUrl}/events/${event.slug}`,
						lastmod: event.updatedAt.toISOString(),
						priority: "0.6",
					});
				}

				const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
			entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
		}
    <priority>${entry.priority}</priority>
  </url>`,
	)
	.join("\n")}
</urlset>
`;

				return new Response(body, {
					headers: {
						"content-type": "application/xml; charset=utf-8",
						"cache-control": "public, max-age=3600",
					},
				});
			},
		},
	},
});
