import { createFileRoute } from "@tanstack/react-router";
import { serverEnv } from "#/env/server.ts";

export const Route = createFileRoute("/robots.txt")({
	server: {
		handlers: {
			GET: () => {
				const baseUrl = serverEnv.APP_URL.replace(/\/$/, "");

				return new Response(
					`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\nDisallow: /uploads\nDisallow: /dashboard\nDisallow: /my-records\n\nSitemap: ${baseUrl}/sitemap.xml\n`,
					{
						headers: {
							"content-type": "text/plain; charset=utf-8",
							"cache-control": "public, max-age=3600",
						},
					},
				);
			},
		},
	},
});
