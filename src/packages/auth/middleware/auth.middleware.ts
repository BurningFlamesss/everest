import { createMiddleware, createServerFn } from "@tanstack/react-start";
import type { AppContext } from "#/types/router-context";

export const getSessionMiddleware = createMiddleware({
	type: "request",
}).server(async ({ next }) => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const headers = getRequestHeaders();
	let session: any = null;

	try {
		const { auth } = await import("#/packages/auth/auth");
		session = await auth.api.getSession({ headers });
	} catch {
		session = null;
	}

	// Populate `user.role` from the UserRole table. better-auth's User model has
	// no role field, so without this every role-based guard/redirect falls back
	// to "unprivileged".
	if (session?.user && !session.user.role) {
		try {
			const { resolveUserRole } = await import(
				"#/packages/auth/server/resolve-role"
			);
			const role = await resolveUserRole(session.user.id);
			if (role) session.user.role = role;
		} catch {
			// leave role unset; guards treat it as unprivileged
		}
	}

	return await next({ context: { session: session } satisfies AppContext });
});

export const getSessionFn = createServerFn()
	.middleware([getSessionMiddleware])
	.handler(({ context }) => context.session);
