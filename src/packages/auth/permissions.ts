import { prisma } from "#/packages/db/index.ts";
import type { Session } from "#/types/router-context.ts";

export const MANAGEMENT_ROLES = ["SUPERADMIN", "ADMIN"] as const;

export type ManagementRole = (typeof MANAGEMENT_ROLES)[number];

export function isAuthenticated(
	session: Session | null | undefined,
): session is NonNullable<Session> {
	return Boolean(session?.user?.id);
}

export async function getUserRoles(userId: string) {
	return prisma.userRole.findMany({
		where: { userId },
		orderBy: { createdAt: "asc" },
	});
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

export class AuthorizationError extends Error {
	constructor(message = "You are not allowed to perform this action") {
		super(message);
		this.name = "AuthorizationError";
	}
}

export async function requireManagementUser(userId: string) {
	if (!(await isManagementUser(userId))) {
		throw new AuthorizationError();
	}
}
