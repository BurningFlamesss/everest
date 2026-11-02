import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import {
	getPrimaryRole,
	getUserPermissions,
	getUserRoles,
	type PermissionKey,
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

	const [roles, profile, permissionSet] = await Promise.all([
		getUserRoles(session.user.id),
		prisma.user.findUnique({
			where: { id: session.user.id },
			select: { activatedAt: true },
		}),
		getUserPermissions(session.user.id),
	]);

	const permissions = [...permissionSet];

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
