import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/prisma";
import { requirePermission } from "#/packages/auth/server/guard.ts";

/**
 * Raw notice rows for the admin notice board editor. Returns database rows with
 * their real `id` (the public `getNoticesServer` maps `id = ref`), so edits and
 * deletes can target records reliably.
 */
export const prismaNoticeListServer = createServerFn({ method: "GET" })
	.middleware([requirePermission("notices.view")])
	.handler(async () => {
		const rows = await prisma.notice.findMany({
			orderBy: [{ pinned: "desc" }, { dateAd: "desc" }],
		});
		return rows.map((r) => ({
			id: r.id,
			ref: r.ref,
			title: r.title,
			category: r.category,
			dateAd: r.dateAd,
			dateBs: r.dateBs,
			audience: r.audience,
			issuedBy: r.issuedBy,
			summary: r.summary,
			body: Array.isArray(r.body) ? (r.body as string[]) : [],
			bullets: Array.isArray(r.bullets) ? (r.bullets as string[]) : [],
			attachments: Array.isArray(r.attachments) ? (r.attachments as any[]) : [],
			pinned: r.pinned,
			order: r.order,
		}));
	});
