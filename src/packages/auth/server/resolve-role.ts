import type { Role } from "#/generated/prisma/enums.ts";
import { prisma } from "#/packages/db/index.ts";
import { getOrgContext } from "#/packages/school/context.ts";
import type { Role as AppRole } from "#/types/index";

/**
 * The database `Role` enum is UPPERCASE (`SUPERADMIN`), while the frontend
 * permission vocabulary (`src/lib/permissions.ts`) uses snake_case
 * (`super_admin`). Normalize at the boundary so the rest of the app is
 * unchanged.
 */
const DB_ROLE_TO_APP_ROLE: Record<Role, AppRole> = {
	SUPERADMIN: "super_admin",
	ADMIN: "admin",
	STAFF: "staff",
	STUDENT: "student",
	GUARDIAN: "guardian",
};

/**
 * Resolve the app role for a user by reading their `UserRole` row for the
 * current organization. Returns null when the user has no role assignment
 * (e.g. a freshly-created invite that has not been activated yet).
 *
 * If a user somehow holds multiple roles in the org, the most privileged wins.
 */
const ROLE_PRIORITY: Role[] = [
	"SUPERADMIN",
	"ADMIN",
	"STAFF",
	"GUARDIAN",
	"STUDENT",
];

export async function resolveUserRole(userId: string): Promise<AppRole | null> {
	try {
		const { organizationId } = await getOrgContext();
		const rows = await prisma.userRole.findMany({
			where: { userId, organizationId },
			select: { role: true },
		});
		if (rows.length === 0) return null;
		const best = ROLE_PRIORITY.find((r) => rows.some((row) => row.role === r));
		return best ? DB_ROLE_TO_APP_ROLE[best] : null;
	} catch {
		return null;
	}
}
