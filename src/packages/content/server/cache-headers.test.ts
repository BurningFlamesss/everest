import { describe, expect, it } from "vitest";
import { requestHasSessionCookie } from "./cache-headers.ts";

/**
 * The gate must agree with better-auth's own cookie parsing (better-call
 * parseCookies trims cookie names) on whether a session cookie is present.
 * A disagreement in either direction is a bug:
 *  - false negative → authenticated document stamped public (PII in a
 *    CDN-cacheable body)
 *  - false positive → anonymous document needlessly marked private
 */
describe("requestHasSessionCookie", () => {
	it("detects the standard better-auth session cookie", () => {
		expect(requestHasSessionCookie("better-auth.session_token=abc.def")).toBe(
			true,
		);
	});

	it("detects the cookie among other cookies in the header", () => {
		expect(
			requestHasSessionCookie(
				"theme=dark; better-auth.session_token=abc.def; consent=1",
			),
		).toBe(true);
	});

	it("detects a cookie name with stray whitespace, like better-auth does", () => {
		// better-call's parseCookies trims the name before matching, so a
		// header with `name =value` (some proxies reformat this way)
		// AUTHENTICATES. The gate must agree, not slip past on a substring
		// check that demands the exact `better-auth.session_token=` sequence.
		expect(requestHasSessionCookie("better-auth.session_token =abc.def")).toBe(
			true,
		);
		expect(requestHasSessionCookie("  better-auth.session_token=abc.def")).toBe(
			true,
		);
	});

	it("detects __Secure-/__Host- and prefixed variants", () => {
		expect(
			requestHasSessionCookie("__Secure-better-auth.session_token=abc"),
		).toBe(true);
		expect(
			requestHasSessionCookie("__Host-better-auth.session_token=abc"),
		).toBe(true);
		expect(
			requestHasSessionCookie("someprefix.better-auth.session_token=abc"),
		).toBe(true);
	});

	it("does not match other auth-ish cookies or bare look-alikes", () => {
		expect(requestHasSessionCookie("better-auth.csrf_token=abc")).toBe(false);
		expect(requestHasSessionCookie("session_token=abc")).toBe(false);
		expect(requestHasSessionCookie("app.session_token=abc")).toBe(false);
		expect(requestHasSessionCookie("better-auth.session_token")).toBe(false); // name with no value still counts? No: no '=' → not a pair
		expect(requestHasSessionCookie("")).toBe(false);
	});

	it("matches an empty-valued session cookie (gate must stay private)", () => {
		// A pair with an empty value still carries the name — treat as
		// present (fail-safe: private headers for anything session-ish).
		expect(requestHasSessionCookie("better-auth.session_token=")).toBe(true);
	});

	it("survives a value containing '=' or '; ' sequences", () => {
		expect(
			requestHasSessionCookie(
				"better-auth.session_token=abc.def.ghi; other=1; another.session_token=x",
			),
		).toBe(true);
		// The second cookie is a decoy — only the exact better-auth name
		// (or a *.better-auth.session_token prefix variant) matches.
		expect(requestHasSessionCookie("another.session_token=x; other=1")).toBe(
			false,
		);
	});
});
