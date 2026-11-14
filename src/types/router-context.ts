import type { QueryClient } from "@tanstack/react-query";
import type { auth } from "#/packages/auth/auth";

export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export type AppContext = {
	session: Session;
};

/**
 * What the root route dehydrates into every HTML document. Deliberately a
 * projection of the full session: the raw session record (token,
 * ipAddress, userAgent) is a credential, and public pages are served with
 * `Cache-Control: public, s-maxage=…` — anything put here can end up in a
 * page a shared CDN serves to other visitors. Consumers (AuthProvider,
 * login/user/activate guards) only read `session.user`.
 */
export interface DehydratedSession {
	user: {
		id: string;
		name: string;
		email: string;
		emailVerified?: boolean;
		image?: string | null;
		/** Merged from the UserRole table by the auth middleware. */
		role?: string;
	};
}

export interface MyRouterContext {
	queryClient: QueryClient;
	session: DehydratedSession | null;
}
