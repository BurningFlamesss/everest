import { createFileRoute } from "@tanstack/react-router";
import { auth } from "#/packages/auth/auth.ts";
import { hasPermission } from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	createObjectKey,
	getObjectUrl,
	getStorage,
} from "#/packages/storage/index.ts";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
]);

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export const Route = createFileRoute("/api/uploads")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const session = await auth.api.getSession({
					headers: request.headers,
				});

				if (!session?.user?.id) {
					return json({ success: false, error: "Please sign in." }, 401);
				}

				if (!(await hasPermission(session.user.id, "MANAGE_CONTENT"))) {
					return json(
						{ success: false, error: "You cannot upload files." },
						403,
					);
				}

				let form: FormData;

				try {
					form = await request.formData();
				} catch {
					return json({ success: false, error: "Invalid upload." }, 400);
				}

				const file = form.get("file");

				if (!(file instanceof File)) {
					return json({ success: false, error: "Choose a file first." }, 400);
				}

				if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
					return json(
						{
							success: false,
							error: "Only PNG, JPEG, WebP and GIF images are supported.",
						},
						415,
					);
				}

				if (file.size <= 0 || file.size > MAX_UPLOAD_BYTES) {
					return json(
						{ success: false, error: "Images must be smaller than 5 MB." },
						413,
					);
				}

				const prefixValue = form.get("prefix");
				const prefix =
					typeof prefixValue === "string" && prefixValue.length > 0
						? prefixValue
						: "content";
				const key = createObjectKey(prefix, file.name);
				const body = Buffer.from(await file.arrayBuffer());

				try {
					await getStorage().put(key, body, file.type);

					const asset = await prisma.fileAsset.create({
						data: {
							key,
							url: getObjectUrl(key),
							originalName: file.name.slice(0, 200),
							mimeType: file.type,
							size: file.size,
							uploadedById: session.user.id,
						},
					});

					return json({ success: true, asset }, 201);
				} catch (error) {
					console.error("Upload failed:", error);
					return json(
						{ success: false, error: "Could not store this file." },
						500,
					);
				}
			},
		},
	},
});
