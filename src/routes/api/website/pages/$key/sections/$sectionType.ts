import { createFileRoute } from "@tanstack/react-router";
import { actorFrom, requirePermission } from "@/lib/auth";
import { saveSectionFields } from "@/lib/website-content";
import type { BlockType, WebsitePageKey } from "@/types";

export const Route = createFileRoute(
	"/api/website/pages/$key/sections/$sectionType",
)({
	server: {
		handlers: {
			PATCH: async ({ params, request }) => {
				try {
					const user = await requirePermission(request, "website.manage");

					const { key, sectionType } = params;
					const body = await request.json();
					const { fields } = body;

					if (!fields) {
						return Response.json({ error: "Invalid request" }, { status: 400 });
					}

					const page = await saveSectionFields(
						key as WebsitePageKey,
						sectionType as BlockType,
						fields,
						actorFrom(user),
					);

					return Response.json({ page });
				} catch (error) {
					const message = error instanceof Error ? error.message : "Failed";
					const status =
						message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
					if (status === 500) console.error("Failed to update section:", error);
					return Response.json({ error: message }, { status });
				}
			},
		},
	},
});
