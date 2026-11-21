import { createFileRoute } from "@tanstack/react-router";
import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";

const staticPaths = [
	{ path: "/", priority: "1.0", changefreq: "daily" },
	{ path: "/about", priority: "0.9", changefreq: "weekly" },
	{ path: "/admissions", priority: "0.95", changefreq: "weekly" },
	{ path: "/courses", priority: "0.9", changefreq: "weekly" },
	{ path: "/course-finder", priority: "0.85", changefreq: "monthly" },
	{ path: "/faculty", priority: "0.8", changefreq: "weekly" },
	{ path: "/notices", priority: "0.85", changefreq: "daily" },
	{ path: "/events", priority: "0.85", changefreq: "daily" },
	{ path: "/activities", priority: "0.85", changefreq: "daily" },
	{ path: "/clubs", priority: "0.8", changefreq: "weekly" },
	{ path: "/facilities", priority: "0.8", changefreq: "monthly" },
	{ path: "/transportation", priority: "0.8", changefreq: "monthly" },
	{ path: "/scholarship", priority: "0.85", changefreq: "weekly" },
	{ path: "/calendar", priority: "0.8", changefreq: "weekly" },
	{ path: "/result", priority: "0.8", changefreq: "monthly" },
	{ path: "/resources", priority: "0.75", changefreq: "monthly" },
	{ path: "/gallery", priority: "0.75", changefreq: "weekly" },
	{ path: "/contact", priority: "0.85", changefreq: "monthly" },
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

				const [notices, events, clubs, posts, faculty] = await Promise.all([
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
					prisma.club.findMany({
						select: { slug: true, updatedAt: true },
						take: 100,
					}),
					prisma.post.findMany({
						where: { visibility: "PUBLIC" },
						select: { id: true, updatedAt: true },
						orderBy: { createdAt: "desc" },
						take: 500,
					}),
					prisma.facultyMember.findMany({
						select: { slug: true, updatedAt: true },
						take: 200,
					}),
				]);

				const urls: Array<{
					loc: string;
					lastmod?: string;
					priority: string;
					changefreq?: string;
				}> = staticPaths.map((item) => ({
					loc: `${baseUrl}${item.path}`,
					priority: item.priority,
					changefreq: item.changefreq,
				}));

				for (const notice of notices) {
					urls.push({
						loc: `${baseUrl}/notices/${notice.slug}`,
						lastmod: notice.updatedAt.toISOString(),
						priority: "0.7",
						changefreq: "monthly",
					});
				}

				for (const event of events) {
					urls.push({
						loc: `${baseUrl}/events/${event.slug}`,
						lastmod: event.updatedAt.toISOString(),
						priority: "0.7",
						changefreq: "weekly",
					});
				}

				for (const club of clubs) {
					urls.push({
						loc: `${baseUrl}/clubs/${club.slug}`,
						lastmod: club.updatedAt.toISOString(),
						priority: "0.75",
						changefreq: "weekly",
					});
				}

				for (const post of posts) {
					urls.push({
						loc: `${baseUrl}/activities/${post.id}`,
						lastmod: post.updatedAt.toISOString(),
						priority: "0.75",
						changefreq: "weekly",
					});
				}

				for (const member of faculty) {
					urls.push({
						loc: `${baseUrl}/faculty/${member.slug}`,
						lastmod: member.updatedAt.toISOString(),
						priority: "0.65",
						changefreq: "monthly",
					});
				}

				const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		(entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>${
			entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""
		}${
			entry.changefreq ? `\n    <changefreq>${entry.changefreq}</changefreq>` : ""
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
