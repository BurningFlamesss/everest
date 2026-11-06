import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import {
	getPrimaryRole,
	getRolePermissionDefaults,
	type PermissionKey,
	resolvePermissions,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

export const getViewerFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		return {
			user: null,
			roles: [] as Array<{ role: string; branchId: string | null }>,
			primaryRole: null,
			permissions: [] as Array<PermissionKey>,
			isManagement: false,
			isSuperAdmin: false,
		};
	}

	// This runs on every page load, so roles, overrides and the activation
	// flag come from one user query. `getUserRoles` previously ran separately
	// and then again inside `getUserPermissions`, reading the same rows twice.
	const profile = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: {
			activatedAt: true,
			userRoles: {
				select: { role: true, branchId: true },
				orderBy: { createdAt: "asc" },
			},
			permissions: {
				select: { permission: true, granted: true, scopeKey: true },
			},
		},
	});

	const roles = profile?.userRoles ?? [];
	const branchId = roles[0]?.branchId ?? null;
	const roleDefaults = await getRolePermissionDefaults(branchId);
	const permissions = [
		...resolvePermissions(
			roles,
			profile?.permissions ?? [],
			roleDefaults,
			branchId,
		),
	];

	return {
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image ?? null,
			activatedAt: profile?.activatedAt ?? null,
		},
		roles: roles.map((role) => ({
			role: role.role,
			branchId: role.branchId,
		})),
		primaryRole: getPrimaryRole(roles),
		permissions,
		isManagement: permissions.length > 0,
		isSuperAdmin: roles.some((role) => role.role === "SUPERADMIN"),
	};
});
