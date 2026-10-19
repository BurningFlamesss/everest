import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";

/**
 * Single-tenant org/branch resolution.
 *
 * The previous invite flow hardcoded organization/branch row IDs, which broke
 * whenever the database was reseeded (new cuid each time). Instead we resolve
 * the seeded Organization and its default Branch by their stable slugs from
 * env, and cache the result for the life of the process.
 */
export interface OrgContext {
	organizationId: string;
	branchId: string;
	organizationSlug: string;
	branchSlug: string;
}

let cached: OrgContext | null = null;

export async function getOrgContext(): Promise<OrgContext> {
	if (cached) return cached;

	const organization = await prisma.organization.findUnique({
		where: { slug: serverEnv.ORGANIZATION_SLUG },
		select: { id: true, slug: true },
	});
	if (!organization) {
		throw new Error(
			`Organization "${serverEnv.ORGANIZATION_SLUG}" not found. Did you run the seed (npm run db:seed)?`,
		);
	}

	const branch = await prisma.branch.findUnique({
		where: {
			organizationId_slug: {
				organizationId: organization.id,
				slug: serverEnv.DEFAULT_BRANCH_SLUG,
			},
		},
		select: { id: true, slug: true },
	});
	if (!branch) {
		throw new Error(
			`Branch "${serverEnv.DEFAULT_BRANCH_SLUG}" not found for organization "${serverEnv.ORGANIZATION_SLUG}".`,
		);
	}

	cached = {
		organizationId: organization.id,
		branchId: branch.id,
		organizationSlug: organization.slug,
		branchSlug: branch.slug,
	};
	return cached;
}

/** Test/dev helper: clear the cached context (e.g. after reseeding). */
export function clearOrgContextCache(): void {
	cached = null;
}
