import { prisma } from "#/packages/db/index.ts";
import {
	ALL_PERMISSIONS,
	DEFAULT_ROLE_PERMISSIONS,
	getPrimaryRole,
	isPermissionKey,
	PERMISSION_DEFINITIONS,
	type PermissionKey,
} from "./permissions.ts";

export interface PermissionUser {
	id: string;
	name: string;
	email: string;
	activatedAt: Date | null;
	primaryRole: string | null;
	roles: Array<{ role: string; branchId: string | null }>;
	rolePermissions: Array<PermissionKey>;
	effectivePermissions: Array<PermissionKey>;
	overrides: Array<{ permission: PermissionKey; granted: boolean }>;
}

export async function listPermissionUsers(): Promise<Array<PermissionUser>> {
	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			activatedAt: true,
			userRoles: { select: { role: true, branchId: true } },
			permissions: {
				select: { permission: true, granted: true },
			},
		},
		orderBy: { name: "asc" },
		take: 500,
	});

	return users.map((user) => {
		const roles = user.userRoles.map((role) => ({
			role: role.role,
			branchId: role.branchId,
		}));
		const primaryRole = getPrimaryRole(user.userRoles);

		const rolePermissions = new Set<PermissionKey>();

		for (const role of user.userRoles) {
			for (const permission of DEFAULT_ROLE_PERMISSIONS[role.role] ?? []) {
				rolePermissions.add(permission);
			}
		}

		const effectivePermissions = new Set(rolePermissions);

		for (const override of user.permissions) {
			if (!isPermissionKey(override.permission)) continue;

			if (override.granted) effectivePermissions.add(override.permission);
			else effectivePermissions.delete(override.permission);
		}

		return {
			id: user.id,
			name: user.name,
			email: user.email,
			activatedAt: user.activatedAt,
			primaryRole,
			roles,
			rolePermissions: ALL_PERMISSIONS.filter((permission) =>
				rolePermissions.has(permission),
			),
			effectivePermissions: ALL_PERMISSIONS.filter((permission) =>
				effectivePermissions.has(permission),
			),
			overrides: user.permissions
				.filter((override) => isPermissionKey(override.permission))
				.map((override) => ({
					permission: override.permission as PermissionKey,
					granted: override.granted,
				})),
		};
	});
}

export async function setPermissionOverride(input: {
	userId: string;
	permission: PermissionKey;
	granted: boolean;
}) {
	if (!isPermissionKey(input.permission)) {
		throw new Error("UNKNOWN_PERMISSION");
	}

	return prisma.userPermission.upsert({
		where: {
			userId_permission: {
				userId: input.userId,
				permission: input.permission,
			},
		},
		update: { granted: input.granted },
		create: {
			userId: input.userId,
			permission: input.permission,
			granted: input.granted,
		},
	});
}

export async function clearPermissionOverride(input: {
	userId: string;
	permission: PermissionKey;
}) {
	await prisma.userPermission.deleteMany({
		where: {
			userId: input.userId,
			permission: input.permission,
		},
	});
}

export async function resetUserPermissions(userId: string) {
	await prisma.userPermission.deleteMany({ where: { userId } });
}

export function getPermissionCatalog() {
	return PERMISSION_DEFINITIONS.map((definition) => ({ ...definition }));
}
