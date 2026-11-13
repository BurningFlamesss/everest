import { createFileRoute } from "@tanstack/react-router";
import { actorFrom, requirePermission } from "@/lib/auth";
import { addBlock, duplicateBlock, reorderBlocks } from "@/lib/website-content";
import type { WebsitePageKey } from "@/types";

export const Route = createFileRoute("/api/website/pages/$key/blocks")({
	server: {
		handlers: {
			POST: async ({ params, request }) => {
				try {
					const user = await requirePermission(request, "website.manage");
					const actor = actorFrom(user);
					const { key } = params;
					const body = await request.json();
					const { type, orderedIds, blockId } = body;

					let page;
					if (type) {
						page = await addBlock(key as WebsitePageKey, type, actor);
					} else if (orderedIds) {
						page = await reorderBlocks(
							key as WebsitePageKey,
							orderedIds,
							actor,
						);
					} else if (blockId) {
						page = await duplicateBlock(key as WebsitePageKey, blockId, actor);
					} else {
						return Response.json({ error: "Invalid request" }, { status: 400 });
					}

					return Response.json({ page });
				} catch (error) {
					const message =
						error instanceof Error ? error.message : "Failed block operation";
					const status =
						message === "Unauthorized"
							? 401
							: message === "Forbidden"
								? 403
								: 500;
					if (status === 500) console.error("Failed block operation:", error);
					return Response.json({ error: message }, { status });
				}
			},
		},
	},
});
