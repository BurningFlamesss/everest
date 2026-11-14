import {
	getRequest,
	getRequestHeaders,
	getResponseHeader,
	removeResponseHeader,
	setResponseHeader,
	setResponseHeaders,
} from "@tanstack/react-start/server";

const PUBLIC_CACHE_HEADERS = new Headers({
	"Cache-Control":
		"public, max-age=60, s-maxage=3600, stale-while-revalidate=86400",
	"CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
});

const PRIVATE_CACHE_HEADERS = new Headers({
	"Cache-Control": "private, no-cache",
});

/**
 * Stamp cache headers for a public GET — but only public when the request
 * carries no session cookie.
 *
 * When one of these fns runs during SSR, its headers land on the HTML
 * document itself: h3 merges the event's response headers over whatever
 * the route produced, so these calls decide the document's cache policy
 * even though the route never sees them. A logged-in visitor's document
 * embeds their dehydrated session context (user name/email) in the
 * router stream, so a document stamped `public, s-maxage=…` could be
 * served from a shared/CDN cache to a different visitor. Any request
 * carrying the better-auth session cookie therefore gets
 * `private, no-cache` instead.
 */
export function setPublicCacheHeaders(
	publicHeaders: Headers = PUBLIC_CACHE_HEADERS,
) {
	const cookie = getRequestHeaders().get("cookie") ?? "";
	const authenticated = requestHasSessionCookie(cookie);
	if (authenticated || requestHasSensitiveUrl()) {
		applyPrivateCacheHeaders();
		return;
	}
	setResponseHeaders(publicHeaders);
	// A public document's body differs by cookie (the session context in the
	// router stream), so any shared cache must key on it — otherwise the CDN
	// could serve an anonymous entry to a logged-in visitor. Merge with any
	// existing vary (the dev middleware stamps `sec-fetch-dest, accept`)
	// instead of clobbering it.
	const vary = getResponseHeader("vary") ?? "";
	if (!vary.split(",").some((v) => v.trim() === "cookie")) {
		setResponseHeader("vary", vary ? `${vary}, cookie` : "cookie");
	}
}

/**
 * Stamp the private headers AND scrub the public-only ones. `set()` only
 * replaces keys it is handed, so flipping to private must also delete
 * `cdn-cache-control` explicitly — otherwise the CDN advisory (and any other
 * public-only key from an earlier stamp in the same request) survives the
 * flip and the doc stays CDN-cacheable.
 */
function applyPrivateCacheHeaders(): void {
	setResponseHeaders(PRIVATE_CACHE_HEADERS);
	removeResponseHeader("cdn-cache-control");
}

/**
 * Paths that carry a credential in the URL itself (activation links). The
 * document rendered for `/activate/<token>` embeds the invited user's name
 * and email, and the token doubles as the activation credential: anyone who
 * holds the URL is served the page (that is the point of the link), but the
 * response must never sit in a shared cache where a URL leak (logs,
 * referrer, history) becomes a CACHE ENTRY others can hit — and the cached
 * entry would keep serving the pre-activation page even after the invite is
 * used, breaking the "already used" error too.
 */
export function requestHasSensitiveUrl(): boolean {
	const url = getRequest().url;
	// Activation and password-reset links both carry a bearer credential in
	// the URL and embed the account holder's details in the rendered
	// document; neither may ever sit in a shared cache.
	return url.includes("/activate/") || /[?&]token=/.test(url);
}

/**
 * Parse the Cookie header the same way better-auth does — via better-call's
 * parseCookies, which TRIMS cookie names (`key = value` is a valid pair) —
 * and answer whether a better-auth session cookie is present.
 *
 * A raw `cookie.includes("better-auth.session_token=")` would disagree with
 * better-auth on a name with stray whitespace (`better-auth.session_token =v`):
 * better-auth authenticates the request (trimmed name matches) while the
 * substring check misses it, so a logged-in document would be stamped public
 * and become CDN-cacheable. Matching the real parser closes that gap, and
 * keeps working for the `__Secure-` / `__Host-` cookie-name variants and any
 * future cookiePrefix because it checks the suffix after the last dot.
 */
export function requestHasSessionCookie(cookieHeader: string): boolean {
	for (const pair of cookieHeader.split(";")) {
		const eq = pair.indexOf("=");
		if (eq === -1) continue;
		// Mirror better-call parseCookies: trim the name, decode nothing,
		// and match any better-auth session_token cookie regardless of prefix.
		const name = pair.slice(0, eq).trim();
		if (name === "better-auth.session_token") return true;
		if (name.endsWith(".session_token") && name.includes("better-auth")) {
			return true;
		}
	}
	return false;
}
