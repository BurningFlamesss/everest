import { createFileRoute } from "@tanstack/react-router";
import { auth } from "#/packages/auth/auth.ts";
import { hasPermission } from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	createObjectKey,
	getObjectUrl,
	getStorage,
} from "#/packages/storage/index.ts";
import {
	isAllowedDocumentType,
	isAllowedImageType,
	MAX_DOCUMENT_MB,
	MAX_IMAGE_MB,
	maxUploadBytes,
	UNSUPPORTED_UPLOAD_MESSAGE,
} from "#/packages/storage/policy.ts";

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

				const isImage = isAllowedImageType(file.type);

				if (!isImage && !isAllowedDocumentType(file.type)) {
					return json(
						{ success: false, error: UNSUPPORTED_UPLOAD_MESSAGE },
						415,
					);
				}

				const maxBytes = maxUploadBytes(file.type);

				if (file.size <= 0 || file.size > maxBytes) {
					return json(
						{
							success: false,
							error: isImage
								? `Images must be smaller than ${MAX_IMAGE_MB} MB.`
								: `Documents must be smaller than ${MAX_DOCUMENT_MB} MB.`,
						},
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
				let stored = false;

				try {
					await getStorage().put(key, body, file.type);
					stored = true;

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
					// Never leave an object behind that no row points at: the cleanup
					// sweep only knows about uploaded files recorded in the database.
					if (stored) {
						try {
							await getStorage().delete(key);
						} catch (cleanupError) {
							console.error("Could not roll back stored object:", cleanupError);
						}
					}

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
