import { createFileRoute } from "@tanstack/react-router";
import { actorFrom, requirePermission } from "@/lib/auth";
import {
	deleteBlock,
	moveBlock,
	toggleBlockVisibility,
	updateBlockFields,
} from "@/lib/website-content";
import type { WebsitePageKey } from "@/types";

function statusFor(message: string): number {
	return message === "Unauthorized" ? 401 : message === "Forbidden" ? 403 : 500;
}

export const Route = createFileRoute("/api/website/pages/$key/blocks/$blockId")(
	{
		server: {
			handlers: {
				PATCH: async ({ params, request }) => {
					try {
						const user = await requirePermission(request, "website.manage");
						const actor = actorFrom(user);
						const { key, blockId } = params;
						const body = await request.json();
						const { fields, direction, visibility } = body;

						let page;
						if (direction) {
							page = await moveBlock(
								key as WebsitePageKey,
								blockId,
								direction,
								actor,
							);
						} else if (visibility !== undefined) {
							page = await toggleBlockVisibility(
								key as WebsitePageKey,
								blockId,
								actor,
							);
						} else if (fields) {
							page = await updateBlockFields(
								key as WebsitePageKey,
								blockId,
								fields,
								actor,
							);
						} else {
							return Response.json(
								{ error: "Invalid request" },
								{ status: 400 },
							);
						}

						return Response.json({ page });
					} catch (error) {
						const message =
							error instanceof Error ? error.message : "Failed to update block";
						const status = statusFor(message);
						if (status === 500) console.error("Failed to update block:", error);
						return Response.json({ error: message }, { status });
					}
				},
				DELETE: async ({ params, request }) => {
					try {
						const user = await requirePermission(request, "website.manage");
						const { key, blockId } = params;
						const page = await deleteBlock(
							key as WebsitePageKey,
							blockId,
							actorFrom(user),
						);
						return Response.json({ page });
					} catch (error) {
						const message =
							error instanceof Error ? error.message : "Failed to delete block";
						const status = statusFor(message);
						if (status === 500) console.error("Failed to delete block:", error);
						return Response.json({ error: message }, { status });
					}
				},
			},
		},
	},
);
