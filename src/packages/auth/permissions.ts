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
	{
		key: "MANAGE_INBOX",
		label: "Contact inbox",
		description:
			"Read messages sent through the public contact form and mark them handled.",
	},
	{
		key: "MANAGE_TIMETABLE",
		label: "Timetable",
		description:
			"Build the weekly timetable and resolve room or teacher clashes.",
	},
	{
		key: "MANAGE_EXAMS",
		label: "Exams & marks",
		description:
			"Schedule exams, enter marks and publish results to students and guardians.",
	},
	{
		key: "MANAGE_FEES",
		label: "Fees & finance",
		description: "Create fee structures, issue invoices and record payments.",
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
export async function getRolePermissionDefaults(
	branchId?: string | null,
): Promise<Record<string, Set<PermissionKey>>> {
	const overrides = await prisma.rolePermission.findMany({
		where: {
			scopeKey: { in: branchId ? ["global", branchId] : ["global"] },
		},
		select: { role: true, permission: true, granted: true, scopeKey: true },
	});

	const result: Record<string, Set<PermissionKey>> = {};

	for (const [role, permissions] of Object.entries(DEFAULT_ROLE_PERMISSIONS)) {
		result[role] = new Set(permissions);
	}

	result.SUPERADMIN = new Set(ALL_PERMISSIONS);

	// Global defaults first, then branch-specific rows so a branch override wins.
	const ordered = [...overrides].sort(
		(a, b) => Number(a.scopeKey !== "global") - Number(b.scopeKey !== "global"),
	);

	for (const override of ordered) {
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
	overrides: Array<{
		permission: string;
		granted: boolean;
		scopeKey?: string | null;
	}>,
	roleDefaults: Record<string, Set<PermissionKey>>,
	branchId?: string | null,
): Set<PermissionKey> {
	const permissions = new Set<PermissionKey>();

	for (const role of roles) {
		for (const permission of roleDefaults[role.role] ?? []) {
			permissions.add(permission);
		}
	}

	const scoped = overrides
		.filter(
			(override) =>
				!override.scopeKey ||
				override.scopeKey === "global" ||
				(override.scopeKey === branchId && Boolean(branchId)),
		)
		.sort(
			(a, b) =>
				Number(a.scopeKey !== "global" && a.scopeKey !== null) -
				Number(b.scopeKey !== "global" && b.scopeKey !== null),
		);

	for (const override of scoped) {
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
	branchId?: string | null,
): Promise<Set<PermissionKey>> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: {
			userRoles: { select: { role: true, branchId: true } },
			permissions: {
				select: { permission: true, granted: true, scopeKey: true },
			},
		},
	});

	if (!user) return new Set<PermissionKey>();

	const scope = branchId ?? user.userRoles[0]?.branchId ?? null;
	const roleDefaults = await getRolePermissionDefaults(scope);

	return resolvePermissions(
		user.userRoles,
		user.permissions,
		roleDefaults,
		scope,
	);
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
