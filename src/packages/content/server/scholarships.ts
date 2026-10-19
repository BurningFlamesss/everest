import { createServerFn } from "@tanstack/react-start";
import { prisma } from "#/lib/prisma";
import { requirePermission } from "#/packages/auth/server/guard.ts";

/**
 * Raw scholarship rows for the admin editor. Returns database rows with their
 * real `id` (the public `getScholarshipsServer` maps `id = ref`), so edits and
 * deletes can target records reliably.
 */
export const prismaScholarshipListServer = createServerFn({ method: "GET" })
	.middleware([requirePermission("admissions.view")])
	.handler(async () => {
		const rows = await prisma.scholarship.findMany({
			orderBy: { order: "asc" },
		});
		return rows.map((r) => ({
			id: r.id,
			ref: r.ref,
			name: r.name,
			nepaliName: r.nepaliName,
			category: r.category,
			coverage: r.coverage,
			award: r.award,
			amountNpr: r.amountNpr,
			seats: r.seats,
			deadlineAd: r.deadlineAd,
			deadlineBs: r.deadlineBs,
			appliesTo: r.appliesTo,
			summary: r.summary,
			description: r.description,
			eligibility: Array.isArray(r.eligibility) ? (r.eligibility as any[]) : [],
			benefits: Array.isArray(r.benefits) ? (r.benefits as string[]) : [],
			documents: Array.isArray(r.documents) ? (r.documents as string[]) : [],
			process: Array.isArray(r.process) ? (r.process as string[]) : [],
			renewal: r.renewal,
			contact: r.contact,
			spotlight: r.spotlight,
			order: r.order,
		}));
	});
