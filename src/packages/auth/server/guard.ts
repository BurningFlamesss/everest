import { createMiddleware } from "@tanstack/react-start";
import { can, type Permission } from "#/lib/permissions";
import type { Role } from "#/types/index";
import { getSessionMiddleware } from "../middleware/auth.middleware";

/**
 * Authorization helpers for `createServerFn` mutations.
 *
 * Today most server functions perform no auth check at all — any caller can
 * invoke them. These middlewares build on `getSessionMiddleware` (which also
 * resolves `user.role` from the UserRole table) and reject unauthenticated or
 * under-privileged calls before the handler runs.
 */

/** Reject unauthenticated callers. Adds `session` to the server-fn context. */
export const requireAuth = createMiddleware({ type: "function" })
	.middleware([getSessionMiddleware])
	.server(async ({ next, context }) => {
		const session = (context as any)?.session;
		if (!session?.user) {
			throw new Error("UNAUTHENTICATED");
		}
		return next({ context: { session } });
	});

/** Require one of the given app roles (e.g. "admin", "super_admin"). */
export function requireRole(...roles: Role[]) {
	return createMiddleware({ type: "function" })
		.middleware([getSessionMiddleware])
		.server(async ({ next, context }) => {
			const session = (context as any)?.session;
			if (!session?.user) throw new Error("UNAUTHENTICATED");
			const role = session.user.role as Role | undefined;
			if (!role || !roles.includes(role)) throw new Error("FORBIDDEN");
			return next({ context: { session } });
		});
}

/** Require a specific permission from the role→permission map. */
export function requirePermission(permission: Permission) {
	return createMiddleware({ type: "function" })
		.middleware([getSessionMiddleware])
		.server(async ({ next, context }) => {
			const session = (context as any)?.session;
			if (!session?.user) throw new Error("UNAUTHENTICATED");
			const role = session.user.role as Role | undefined;
			if (!can(role, permission)) throw new Error("FORBIDDEN");
			return next({ context: { session } });
		});
}

/** Convenience guard for administrative mutations (admin and super_admin). */
export const requireAdmin = requireRole("admin", "super_admin");
