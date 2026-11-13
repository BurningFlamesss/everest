import { createFileRoute } from "@tanstack/react-router";
import { actorFrom, requirePermission } from "@/lib/auth";
import { publishPage } from "@/lib/website-content";
import type { WebsitePageKey } from "@/types";

export const Route = createFileRoute("/api/website/pages/$key/publish")({
	server: {
		handlers: {
			POST: async ({ params, request }) => {
				try {
					const user = await requirePermission(request, "website.manage");
					const { key } = params;
					const page = await publishPage(
						key as WebsitePageKey,
						actorFrom(user),
					);
					return Response.json({ page });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to publish page";
					const status =
						message === "Unauthorized"
							? 401
							: message === "Forbidden"
								? 403
								: 500;
					if (status === 500) console.error("Failed to publish page:", error);
					return Response.json({ error: message }, { status });
				}
			},
		},
	},
});
