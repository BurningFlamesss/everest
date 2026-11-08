import { createFileRoute } from "@tanstack/react-router";
import { prisma } from "#/packages/db/index.ts";
import { assertSafeObjectKey, getStorage } from "#/packages/storage/index.ts";

/**
 * Serves uploaded files.
 *
 * Decision (Tasks T-5, option a): assets stay public by unguessable UUID key.
 * There is no listing endpoint, keys are validated against the storage key
 * grammar, and responses are marked `nosniff` with a sandboxing CSP so stored
 * files cannot execute as HTML/JS in the app origin. Sensitive documents must
 * not be attached to public content until per-asset authz is introduced.
 */
export const Route = createFileRoute("/uploads/$")({
	server: {
		handlers: {
			GET: async ({ params }) => {
				const rawKey = params._splat;

				if (!rawKey) {
					return new Response("Not found", { status: 404 });
				}

				let key: string;

				try {
					key = assertSafeObjectKey(rawKey);
				} catch {
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

				const inline =
					asset.mimeType.startsWith("image/") ||
					asset.mimeType === "application/pdf";

				return new Response(new Uint8Array(object.body), {
					headers: {
						"content-type": asset.mimeType,
						"content-length": String(object.body.length),
						"cache-control": "public, max-age=31536000, immutable",
						"content-disposition": `${inline ? "inline" : "attachment"}; filename="${encodeURIComponent(asset.originalName)}"`,
						"x-content-type-options": "nosniff",
						"content-security-policy": "default-src 'none'; sandbox",
						"cross-origin-resource-policy": "same-site",
					},
				});
			},
		},
	},
});
