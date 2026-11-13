import { createFileRoute } from "@tanstack/react-router";
import { actorFrom, requirePermission } from "@/lib/auth";
import { unpublishPage } from "@/lib/website-content";
import type { WebsitePageKey } from "@/types";

export const Route = createFileRoute("/api/website/pages/$key/unpublish")({
	server: {
		handlers: {
			POST: async ({ params, request }) => {
				try {
					const user = await requirePermission(request, "website.manage");
					const { key } = params;
					const page = await unpublishPage(
						key as WebsitePageKey,
						actorFrom(user),
					);
					return Response.json({ page });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed to unpublish page";
					const status =
						message === "Unauthorized"
							? 401
							: message === "Forbidden"
								? 403
								: 500;
					if (status === 500) console.error("Failed to unpublish page:", error);
					return Response.json({ error: message }, { status });
				}
			},
		},
	},
});
