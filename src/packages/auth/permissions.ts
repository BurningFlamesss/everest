import { prisma } from "#/packages/db/index.ts";
import type { Session } from "#/types/router-context.ts";

export const MANAGEMENT_ROLES = ["SUPERADMIN", "ADMIN"] as const;

export type ManagementRole = (typeof MANAGEMENT_ROLES)[number];

export const PERMISSION_DEFINITIONS = [
	{
		key: "MANAGE_DASHBOARD",
		label: "Admin dashboard",
		description: "Open the admin console and view school-wide counts.",
	},
	{
		key: "MANAGE_INVITES",
		label: "Invitations",
		description:
			"Create and revoke invitations, and review invitation requests.",
	},
	{
		key: "MANAGE_DIRECTORY",
		label: "Directory",
		description: "Browse students, staff and guardians.",
	},
	{
		key: "MANAGE_CONTENT",
		label: "Website content",
		description: "Create and publish notices, events and clubs.",
	},
	{
		key: "MANAGE_ACADEMICS",
		label: "Academics",
		description: "Manage courses, classrooms and student enrolments.",
	},
	{
		key: "MANAGE_ATTENDANCE",
		label: "Attendance",
		description: "Open attendance registers and mark students.",
	},
	{
		key: "MANAGE_TRANSPORT",
		label: "Transport",
		description: "Manage bus routes, stops and student assignments.",
	},
	{
		key: "MANAGE_PERMISSIONS",
		label: "Permissions",
		description: "Grant or revoke individual permissions for users.",
	},
] as const;

export type PermissionKey = (typeof PERMISSION_DEFINITIONS)[number]["key"];

export const ALL_PERMISSIONS: Array<PermissionKey> = PERMISSION_DEFINITIONS.map(
	(definition) => definition.key,
);

/** Permissions granted by role before any per-user overrides are applied. */
export const DEFAULT_ROLE_PERMISSIONS: Record<string, Array<PermissionKey>> = {
	SUPERADMIN: ALL_PERMISSIONS,
	ADMIN: ALL_PERMISSIONS.filter(
		(permission) => permission !== "MANAGE_PERMISSIONS",
	),
	STAFF: ["MANAGE_DASHBOARD", "MANAGE_ATTENDANCE"],
	STUDENT: [],
	GUARDIAN: [],
};

export function isPermissionKey(value: string): value is PermissionKey {
	return (ALL_PERMISSIONS as Array<string>).includes(value);
}

export function getPermissionLabel(permission: PermissionKey): string {
	return (
		PERMISSION_DEFINITIONS.find((definition) => definition.key === permission)
			?.label ?? permission
	);
}

export function isAuthenticated(
	session: Session | null | undefined,
): session is NonNullable<Session> {
	return Boolean(session?.user?.id);
}

export async function hasAnyRole(
	userId: string,
	roles: Array<string>,
): Promise<boolean> {
	if (roles.length === 0) return true;

	const match = await prisma.userRole.findFirst({
		where: {
			userId,
			role: {
				in: roles as Array<
					"SUPERADMIN" | "ADMIN" | "STUDENT" | "GUARDIAN" | "STAFF"
				>,
			},
		},
		select: { id: true },
	});

	return Boolean(match);
}

export async function isManagementUser(userId: string): Promise<boolean> {
	return hasAnyRole(userId, [...MANAGEMENT_ROLES]);
}

export function getPrimaryRole(roles: Array<{ role: string }>): string | null {
	if (roles.some((entry) => entry.role === "SUPERADMIN")) return "SUPERADMIN";
	if (roles.some((entry) => entry.role === "ADMIN")) return "ADMIN";
	if (roles.some((entry) => entry.role === "STAFF")) return "STAFF";
	if (roles.some((entry) => entry.role === "STUDENT")) return "STUDENT";
	if (roles.some((entry) => entry.role === "GUARDIAN")) return "GUARDIAN";
	return roles[0]?.role ?? null;
}

/**
 * Resolves the editable role defaults.
 *
 * The hard-coded map is the starting point; `RolePermission` rows let an
 * administrator change the baseline for a whole role. SUPERADMIN is always
 * granted every permission so the system can never be locked out completely.
 */
export async function getRolePermissionDefaults(): Promise<
	Record<string, Set<PermissionKey>>
> {
	const overrides = await prisma.rolePermission.findMany({
		select: { role: true, permission: true, granted: true },
	});

	const result: Record<string, Set<PermissionKey>> = {};

	for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
		result[role] = new Set(permissions);
	}

	result.SUPERADMIN = new Set(ALL_PERMISSIONS);

	for (const override of overrides) {
		if (!isPermissionKey(override.permission)) continue;

		let permissions = result[override.role];

		if (!permissions) {
			permissions = new Set<PermissionKey>();
			result[override.role] = permissions;
		}

		if (override.granted) {
			permissions.add(override.permission);
		} else {
			permissions.delete(override.permission);
		}
	}

	result.SUPERADMIN = new Set(ALL_PERMISSIONS);

	return result;
}

/**
 * Applies role defaults and per-user overrides to produce an effective set.
 *
 * Pure, so callers that already loaded roles and overrides (for example the
 * viewer loader) can avoid querying the same rows twice.
 */
export function resolvePermissions(
	roles: Array<{ role: string }>,
	overrides: Array<{ permission: string; granted: boolean }>,
	roleDefaults: Record<string, Set<PermissionKey>>,
): Set<PermissionKey> {
	const permissions = new Set<PermissionKey>();

	for (const role of roles) {
		for (const permission of roleDefaults[role.role] ?? []) {
			permissions.add(permission);
		}
	}

	for (const override of overrides) {
		if (!isPermissionKey(override.permission)) continue;

		if (override.granted) {
			permissions.add(override.permission);
		} else {
			permissions.delete(override.permission);
		}
	}

	return permissions;
}

/**
 * Resolves the effective permission set for a user.
 *
 * Roles provide a baseline (editable through `RolePermission`) and
 * `UserPermission` rows act as explicit allow/deny overrides. This keeps
 * administration simple while still allowing individual exceptions (for
 * example, a staff member who should manage transport but not take
 * attendance).
 *
 * Roles and overrides are read in one user query and combined in memory, so a
 * permission check costs two statements instead of three.
 */
export async function getUserPermissions(
	userId: string,
): Promise<Set<PermissionKey>> {
	const [user, roleDefaults] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			select: {
				userRoles: { select: { role: true } },
				permissions: { select: { permission: true, granted: true } },
			},
		}),
		getRolePermissionDefaults(),
	]);

	if (!user) return new Set<PermissionKey>();

	return resolvePermissions(user.userRoles, user.permissions, roleDefaults);
}

export async function hasPermission(
	userId: string,
	permission: PermissionKey,
): Promise<boolean> {
	const permissions = await getUserPermissions(userId);

	return permissions.has(permission);
}

export async function hasAnyPermission(
	userId: string,
	required: Array<PermissionKey>,
): Promise<boolean> {
	if (required.length === 0) return true;

	const permissions = await getUserPermissions(userId);

	return required.some((permission) => permissions.has(permission));
}

export class AuthorizationError extends Error {
	constructor(message = "You are not allowed to perform this action") {
		super(message);
		this.name = "AuthorizationError";
	}
}

export async function requirePermission(
	userId: string,
	permission: PermissionKey,
) {
	if (!(await hasPermission(userId, permission))) {
		throw new AuthorizationError();
	}
}

export async function requireAnyPermission(
	userId: string,
	required: Array<PermissionKey>,
) {
	if (!(await hasAnyPermission(userId, required))) {
		throw new AuthorizationError();
	}
}

export async function requireManagementUser(userId: string) {
	await requireAnyPermission(userId, ["MANAGE_DASHBOARD"]);
}
