import { getRequestHeaders } from "@tanstack/react-start/server";
import { auth } from "#/packages/auth/auth";
import type { Session } from "@/generated/prisma/client";
import { type Permission, ROLE_PERMISSIONS } from "@/lib/permissions";
import type { Role } from "@/types";

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	role: string;
	image?: string;
}

/** Resolve a session from better-auth. No demo-session fallback; all role-based
  guards go through `requirePermission` / `hasPermission` using the merged
  permission system (MANAGE_* keys + UserPermission/RolePermission pattern). */
async function resolveSession(): Promise<{
	user: AuthUser;
	session: Session;
} | null> {
	const headers = getRequestHeaders();

	try {
		const session = await auth.api.getSession({ headers });
		if (session?.user) {
			const betterAuthUser = session.user as typeof session.user & {
				role?: string;
			};
			return {
				user: {
					id: session.user.id,
					name: session.user.name,
					email: session.user.email,
					role: betterAuthUser.role || "staff",
					image: session.user.image ?? undefined,
				},
				session: session.session as unknown as Session,
			};
		}
	} catch {
		return null;
	}

	return null;
}

export async function getCurrentUser(
	_request: Request,
): Promise<AuthUser | null> {
	const resolved = await resolveSession();
	return resolved?.user ?? null;
}

export async function getCurrentSession(
	_request: Request,
): Promise<{ user: AuthUser; session: Session } | null> {
	return resolveSession();
}

export async function requireAuth(request: Request): Promise<AuthUser> {
	const user = await getCurrentUser(request);
	if (!user) {
		throw new Error("Unauthorized");
	}
	return user;
}

/**
 * Server-side permission check that FAILS CLOSED. Unlike the client-side
 * `can()` (which defaults unknown roles to super_admin for a permissive demo
 * UX), this only grants the permission when the resolved role explicitly lists
 * it. Use this on every mutating API route.
 */
export function hasPermission(user: AuthUser, permission: Permission): boolean {
	const role = user.role as Role;
	const grants = ROLE_PERMISSIONS[role];
	return Array.isArray(grants) && grants.includes(permission);
}

/**
 * Resolve the authenticated user and require a permission, or throw.
 * Returns the user so the route can build a server-side actor (never trust a
 * client-supplied `actor` for attribution).
 */
export async function requirePermission(
	request: Request,
	permission: Permission,
): Promise<AuthUser> {
	const user = await getCurrentUser(request);
	if (!user) throw new Error("Unauthorized");
	if (!hasPermission(user, permission)) throw new Error("Forbidden");
	return user;
}

/** Build the attribution actor from the authenticated session (server-side). */
export function actorFrom(user: AuthUser): {
	id: string;
	name: string;
	role: string;
} {
	return { id: user.id, name: user.name, role: user.role };
}
