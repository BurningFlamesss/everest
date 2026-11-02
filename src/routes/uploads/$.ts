import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "#/packages/db/index.ts";
import { getStorage } from "#/packages/storage/index.ts";

export const Route = createFileRoute("/uploads/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const key = params._splat;

				if (!key) {
					return new Response("Not found", { status: 404 });
				}

				const asset = await prisma.fileAsset.findUnique({ where: { key } });

				if (!asset) {
					return new Response("Not found", { status: 404 });
				}

				const object = await getStorage().get(key);

				if (!object) {
					return new Response("Not found", { status: 404 });
				}

				return new Response(new Uint8Array(object.body), {
					headers: {
						"content-type": asset.mimeType,
						"content-length": String(object.body.length),
						"cache-control": "public, max-age=31536000, immutable",
					},
				});
			},
		},
	},
});
