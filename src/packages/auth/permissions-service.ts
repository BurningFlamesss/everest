import { prisma } from "#/packages/db/index.ts";
import {
	ALL_PERMISSIONS,
	DEFAULT_ROLE_PERMISSIONS,
	getPrimaryRole,
	getRolePermissionDefaults,
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

export const EDITABLE_PERMISSION_ROLES = [
	"ADMIN",
	"STAFF",
	"STUDENT",
	"GUARDIAN",
] as const;

export type EditablePermissionRole = (typeof EDITABLE_PERMISSION_ROLES)[number];

export function isEditablePermissionRole(
	value: string,
): value is EditablePermissionRole {
	return EDITABLE_PERMISSION_ROLES.some((role) => role === value);
}

export interface RolePermissionSummary {
	role: string;
	editable: boolean;
	defaults: Array<PermissionKey>;
	effective: Array<PermissionKey>;
	overrides: Array<{ permission: PermissionKey; granted: boolean }>;
}

export interface PermissionUserPage {
	users: Array<PermissionUser>;
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

export const DEFAULT_PERMISSION_PAGE_SIZE = 25;
export const MAX_PERMISSION_PAGE_SIZE = 100;

/**
 * Lists users with their effective permissions, one page at a time.
 *
 * The search matches name and email so an administrator can find any account
 * without the list silently stopping at a fixed number of rows.
 */
export async function listPermissionUsers(options?: {
	search?: string;
	page?: number;
	pageSize?: number;
}): Promise<PermissionUserPage> {
	const search = options?.search?.trim().slice(0, 100) ?? "";
	const pageSize = Math.min(
		Math.max(Math.floor(options?.pageSize ?? DEFAULT_PERMISSION_PAGE_SIZE), 1),
		MAX_PERMISSION_PAGE_SIZE,
	);
	const requestedPage = Math.max(Math.floor(options?.page ?? 1), 1);

	const where = search
		? {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ email: { contains: search, mode: "insensitive" as const } },
				],
			}
		: undefined;

	const [total, roleDefaults] = await Promise.all([
		prisma.user.count({ where }),
		getRolePermissionDefaults(),
	]);

	const pageCount = Math.max(Math.ceil(total / pageSize), 1);
	const page = Math.min(requestedPage, pageCount);

	const users = await prisma.user.findMany({
		where,
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
		orderBy: [{ name: "asc" }, { id: "asc" }],
		skip: (page - 1) * pageSize,
		take: pageSize,
	});

	const mapped = users.map((user) => {
		const roles = user.userRoles.map((role) => ({
			role: role.role,
			branchId: role.branchId,
		}));
		const primaryRole = getPrimaryRole(user.userRoles);

		const rolePermissions = new Set<PermissionKey>();

		for (const role of user.userRoles) {
			for (const permission of roleDefaults[role.role] ?? []) {
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

	return { users: mapped, total, page, pageSize, pageCount };
}

export async function listRolePermissions(): Promise<
	Array<RolePermissionSummary>
> {
	const [defaults, overrides] = await Promise.all([
		getRolePermissionDefaults(),
		prisma.rolePermission.findMany({
			select: { role: true, permission: true, granted: true },
			orderBy: { role: "asc" },
		}),
	]);

	const roles = ["SUPERADMIN", "ADMIN", "STAFF", "STUDENT", "GUARDIAN"];

	return roles.map((role) => ({
		role,
		editable: isEditablePermissionRole(role),
		defaults: ALL_PERMISSIONS.filter((permission) =>
			DEFAULT_ROLE_PERMISSIONS[role]?.includes(permission),
		),
		effective: ALL_PERMISSIONS.filter((permission) =>
			defaults[role]?.has(permission),
		),
		overrides: overrides
			.filter((override) => override.role === role)
			.filter((override) => isPermissionKey(override.permission))
			.map((override) => ({
				permission: override.permission as PermissionKey,
				granted: override.granted,
			})),
	}));
}

async function requireEditableRole(role: string) {
	if (!isEditablePermissionRole(role)) {
		throw new Error("ROLE_NOT_EDITABLE");
	}
}

export async function setRolePermissionDefault(input: {
	role: EditablePermissionRole;
	permission: PermissionKey;
	granted: boolean;
}) {
	await requireEditableRole(input.role);

	if (!isPermissionKey(input.permission)) {
		throw new Error("UNKNOWN_PERMISSION");
	}

	return prisma.rolePermission.upsert({
		where: {
			role_permission: {
				role: input.role,
				permission: input.permission,
			},
		},
		update: { granted: input.granted },
		create: {
			role: input.role,
			permission: input.permission,
			granted: input.granted,
		},
	});
}

export async function clearRolePermissionDefault(input: {
	role: EditablePermissionRole;
	permission: PermissionKey;
}) {
	await requireEditableRole(input.role);

	await prisma.rolePermission.deleteMany({
		where: { role: input.role, permission: input.permission },
	});
}

export async function resetRolePermissionDefaults(role: string) {
	await requireEditableRole(role);

	await prisma.rolePermission.deleteMany({
		where: { role: role as EditablePermissionRole },
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
