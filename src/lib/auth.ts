import { auth } from "#/packages/auth/auth";
import { getRequestHeaders } from "@tanstack/react-start/server";
import type { Session } from "@/generated/prisma/client";
import type { Role } from "@/types";
import { ROLE_PERMISSIONS, type Permission } from "@/lib/permissions";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string;
}

/** Resolve a session from better-auth, falling back to the demo console cookie. */
async function resolveSession(): Promise<{ user: AuthUser; session: Session } | null> {
  const headers = getRequestHeaders();

  try {
    const session = await auth.api.getSession({ headers });
    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role || "staff",
          image: session.user.image,
        },
        session: session.session,
      };
    }
  } catch {
    // fall through to the demo-session fallback below
  }

  const cookieHeader = headers.get("cookie") || "";
  const match = cookieHeader.match(/scms_demo_session=([^;]+)/);
  if (!match) return null;

  try {
    const decoded = JSON.parse(decodeURIComponent(match[1]));
    if (!decoded?.user) return null;
    const demoUser = decoded.user as Record<string, unknown>;
    return {
      user: {
        id: String(demoUser.id ?? "usr_demo"),
        name: String(demoUser.name ?? "Demo Admin"),
        email: String(demoUser.email ?? ""),
        role: String(demoUser.role ?? "admin"),
        image: typeof demoUser.image === "string" ? demoUser.image : undefined,
      },
      session: {
        id: "demo-session-id",
        userId: String(demoUser.id ?? "usr_demo"),
        expiresAt: new Date(Date.now() + 86400000),
      } as unknown as Session,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser(_request: Request): Promise<AuthUser | null> {
  const resolved = await resolveSession();
  return resolved?.user ?? null;
}

export async function getCurrentSession(_request: Request): Promise<{ user: AuthUser; session: Session } | null> {
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
export function actorFrom(user: AuthUser): { id: string; name: string; role: string } {
  return { id: user.id, name: user.name, role: user.role };
}