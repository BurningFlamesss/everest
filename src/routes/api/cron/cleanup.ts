import { timingSafeEqual } from "node:crypto";
import { createFileRoute } from "@tanstack/react-router";
import { serverEnv } from "#/env/server.ts";
import { collectOrphanedFileAssets } from "#/packages/storage/cleanup.ts";

/** Matches the default batch size of `collectOrphanedFileAssets`. */
const BATCH_SIZE = 200;
const MAX_BATCHES = 5;

function json(body: unknown, status = 200) {
	return new Response(JSON.stringify(body), {
		status,
		headers: { "content-type": "application/json" },
	});
}

function readToken(request: Request) {
	const header = request.headers.get("authorization") ?? "";

	if (header.toLowerCase().startsWith("bearer ")) {
		return header.slice(7).trim();
	}

	return new URL(request.url).searchParams.get("token")?.trim() ?? "";
}

/** Constant-time comparison so the endpoint does not leak the secret by timing. */
function isAuthorized(request: Request, secret: string) {
	const provided = Buffer.from(readToken(request));
	const expected = Buffer.from(secret);

	return (
		provided.length === expected.length && timingSafeEqual(provided, expected)
	);
}

async function runCleanup() {
	const startedAt = Date.now();
	let candidates = 0;
	let deleted = 0;
	let failed = 0;
	let batches = 0;

	// Drain the backlog in bounded batches. A batch that removes nothing means
	// the next batch (newer uploads) is not worth another round trip.
	while (batches < MAX_BATCHES) {
		const result = await collectOrphanedFileAssets({ limit: BATCH_SIZE });

		batches += 1;
		candidates += result.candidates;
		deleted += result.deleted;
		failed += result.failed;

		if (result.deleted === 0 && result.failed === 0) break;
	}

	return {
		batches,
		candidates,
		deleted,
		failed,
		durationMs: Date.now() - startedAt,
	};
}

/**
 * Scheduled cleanup for uploads that no content references.
 *
 * This is deliberately an HTTP endpoint rather than an in-process timer: it is
 * safe with several app instances and works with any scheduler (cron, systemd
 * timer, a platform cron job, or an uptime monitor that sends a POST). Calls
 * require `Authorization: Bearer <CRON_SECRET>`; without `CRON_SECRET` the
 * endpoint is disabled.
 */
async function handleCleanup(request: Request) {
	const secret = serverEnv.CRON_SECRET;

	if (!secret) {
		return json(
			{
				success: false,
				error: "CRON_SECRET is not configured; scheduled cleanup is disabled.",
			},
			503,
		);
	}

	if (!isAuthorized(request, secret)) {
		return json({ success: false, error: "Unauthorized." }, 401);
	}

	try {
		const result = await runCleanup();

		return json({ success: true, ...result });
	} catch (error) {
		console.error("Scheduled upload cleanup failed:", error);

		return json({ success: false, error: "Cleanup failed." }, 500);
	}
}

export const Route = createFileRoute("/api/cron/cleanup")({
	server: {
		handlers: {
			GET: ({ request }) => handleCleanup(request),
			POST: ({ request }) => handleCleanup(request),
		},
	},
});
