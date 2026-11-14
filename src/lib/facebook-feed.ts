/**
 * Solid fetching of a Facebook page's public posts.
 *
 * Facebook retired anonymous access: the page HTML is behind a login wall,
 * the old public RSS endpoint is gone, and scraping violates Meta's terms.
 * The one supported way to read a page's posts programmatically is the
 * Graph API with a Page Access Token issued to an admin of the page.
 *
 * This module is the single source of truth for reading that feed. It tries
 * three sources in order and never blocks a page render for long:
 *
 *   1. Graph API (`FACEBOOK_PAGE_TOKEN` + `FACEBOOK_PAGE_ID`) — the real feed.
 *   2. RSS bridge (`FACEBOOK_RSS_URL`) — any service that mirrors the page to
 *      RSS (rss.app, RSSHub, a self-hosted bridge). Kept because it needs no
 *      app review and can be swapped in by the school without a developer.
 *   3. Empty result — the UI shows its honest empty state. The previous
 *      behaviour silently invented 46 fake posts and presented them as real
 *      school announcements; that is worse than an empty timeline.
 *
 * Results are cached in memory with a TTL so the landing page (queried on
 * every visit) hits Facebook at most once per CACHE_TTL_MS, and every
 * outbound request is bounded by a hard timeout so a slow Facebook never
 * stalls the SSR pass.
 */

/** One normalized feed item, whatever the source. */
export interface FacebookPost {
	id: string;
	message: string;
	created_time: string;
	full_picture?: string;
	permalink_url: string;
}

/** What the fetch resolved to, so the UI can label honesty appropriately. */
export type FacebookFeedSource = "graph" | "rss" | "none";

export interface FacebookFeedResult {
	posts: FacebookPost[];
	source: FacebookFeedSource;
	/** True when every configured source failed — posts is then empty. */
	failed: boolean;
}

export interface FacebookFeedConfig {
	pageToken?: string;
	pageId?: string;
	graphVersion?: string;
	rssUrl?: string;
}

/** How long one successful fetch is remembered. */
export const CACHE_TTL_MS = 5 * 60 * 1000;
/**
 * How long a FAILED fetch is remembered. Shorter than the success TTL so a
 * transient blip (one Facebook 502, one >6s response) doesn't blank the feed
 * sitewide for five full minutes — the next visitor after this window retries.
 */
export const FAILURE_TTL_MS = 30 * 1000;
/** Hard cap on any single outbound request. */
export const FETCH_TIMEOUT_MS = 6000;
/** Pages of Graph results pulled per fetch (each page is ~25 posts). */
const GRAPH_PAGES = 2;
/** Cap on stored posts; more than this never renders anywhere. */
const MAX_POSTS = 50;

const DEFAULT_GRAPH_VERSION = "v23.0";

interface CacheEntry {
	result: FacebookFeedResult;
	expiresAt: number;
}

let cache: CacheEntry | null = null;
let inFlight: Promise<FacebookFeedResult> | null = null;

/**
 * Read the environment config once per call site; values may change between
 * requests in dev (e.g. the admin adds the token and hot-reloads), so this
 * deliberately does not memoize the config itself.
 */
export function facebookFeedConfigFromEnv(
	env: Record<string, string | undefined> = process.env,
): FacebookFeedConfig {
	return {
		pageToken: env.FACEBOOK_PAGE_TOKEN || "",
		pageId: env.FACEBOOK_PAGE_ID || "",
		graphVersion: env.FACEBOOK_GRAPH_VERSION || DEFAULT_GRAPH_VERSION,
		rssUrl: env.FACEBOOK_RSS_URL || env.VITE_FACEBOOK_RSS_URL || "",
	};
}

/** Fetch with timeout. Returns null on any failure (network, 4xx/5xx, body). */
async function fetchText(
	url: string,
	timeoutMs = FETCH_TIMEOUT_MS,
): Promise<string | null> {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), timeoutMs);
	try {
		const res = await fetch(url, {
			signal: controller.signal,
			headers: { "user-agent": "scms-school-website/1.0" },
		});
		if (!res.ok) return null;
		return await res.text();
	} catch {
		return null;
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Fetch the page's feed via the Graph API.
 *
 * `/{page-id}/posts` returns the page's own published posts with
 * `message`, `created_time`, `full_picture` and `permalink_url` — exactly
 * the fields the UI renders. A Page Access Token from a page admin needs
 * no additional review for this; it is the page reading its own content.
 *
 * Returns `[]` when the API call SUCCEEDS but the page simply has no
 * renderable posts (a valid token on a quiet page — not a fault), and
 * `null` only when the fetch genuinely failed (network, bad token, 4xx).
 * Callers use that distinction to report `failed` honestly.
 */
export async function fetchGraphPosts(
	config: FacebookFeedConfig,
): Promise<FacebookPost[] | null> {
	const { pageToken, pageId } = config;
	if (!pageToken || !pageId) return null;

	const version = config.graphVersion || DEFAULT_GRAPH_VERSION;
	const fields = "id,message,created_time,full_picture,permalink_url";
	const collected: FacebookPost[] = [];
	let nextUrl: string | null = null;
	let page0Succeeded = false;

	for (
		let page = 0;
		page < GRAPH_PAGES && collected.length < MAX_POSTS;
		page++
	) {
		const url =
			page === 0
				? `https://graph.facebook.com/${version}/${pageId}/posts?fields=${fields}&limit=25&access_token=${encodeURIComponent(pageToken)}`
				: nextUrl;
		if (!url) break;

		const body = await fetchText(url);

		let json: {
			data?: Array<{
				id?: string;
				message?: string;
				created_time?: string;
				full_picture?: string;
				permalink_url?: string;
			}>;
			paging?: { next?: string };
			error?: unknown;
		} | null;
		try {
			json = body ? JSON.parse(body) : null;
		} catch {
			json = null;
		}

		// Page one IS the feed's verdict (a bad token errors right here); a
		// later page failing is a partial fetch — keep what we already
		// collected rather than throwing away up to 25 good posts.
		if (!json || json.error) {
			if (page === 0) return null;
			break;
		}
		if (page === 0) page0Succeeded = true;

		for (const raw of json.data ?? []) {
			// Posts without text still render (picture + link), but a post with
			// neither message nor picture shows nothing — skip those.
			if (!raw.message && !raw.full_picture) continue;
			collected.push({
				id: raw.id ?? "",
				message: raw.message ?? "",
				created_time: raw.created_time ?? new Date(0).toISOString(),
				full_picture: raw.full_picture,
				permalink_url: raw.permalink_url ?? "",
			});
			if (collected.length >= MAX_POSTS) break;
		}
		nextUrl = json.paging?.next ?? null;
	}

	if (collected.length === 0) {
		// Distinguish "the call worked, nothing to show" from "the call
		// failed". page === 0 returning null above means page one errored
		// (bad token etc.); reaching here means Graph answered fine with a
		// page that just has no renderable posts.
		return page0Succeeded ? [] : null;
	}
	return collected;
}

/**
 * Parse an RSS bridge feed with a tiny regex parser instead of pulling a
 * dependency: the bridge feeds in play (rss.app, RSSHub) emit plain
 * `<item><title/><link/><pubDate/><description/>` documents, and the old
 * rss-parser mapping already told us exactly which fields matter.
 */
export function parseRssItems(xml: string): Array<{
	title: string;
	link: string;
	pubDate: string;
	description: string;
	enclosureUrl?: string;
}> {
	const items: Array<{
		title: string;
		link: string;
		pubDate: string;
		description: string;
		enclosureUrl?: string;
	}> = [];

	const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) ?? [];
	for (const block of itemBlocks.slice(0, MAX_POSTS)) {
		const pick = (tag: string) => {
			const m = block.match(
				new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"),
			);
			return m ? m[1].trim() : "";
		};

		const cdataStrip = (s: string) =>
			s
				.replace(/^<!\[CDATA\[/, "")
				.replace(/\]\]>$/, "")
				.trim();

		const rawDescription = pick("description");
		const enclosureMatch = block.match(/<enclosure[^>]+url=["']([^"']+)["']/i);

		const item = {
			title: cdataStrip(pick("title")),
			link: cdataStrip(pick("link")),
			pubDate: cdataStrip(pick("pubDate")),
			description: cdataStrip(rawDescription),
			enclosureUrl: enclosureMatch?.[1],
		};
		if (item.title || item.description) items.push(item);
	}
	return items;
}

/**
 * Decode the entities that commonly survive into feed text. One pass, no
 * re-scanning: `&amp;quot;` (already-escaped text) stays as the literal
 * `&quot;`, matching how a browser renders the same source. Numeric
 * references decode to their real character; anything invalid or unknown
 * is left as-is rather than dropped.
 */
const NAMED_ENTITIES: Record<string, string> = {
	quot: '"',
	amp: "&",
	apos: "'",
	lt: "<",
	gt: ">",
	nbsp: " ",
	mdash: "—",
	ndash: "–",
	hellip: "…",
	rsquo: "’",
	lsquo: "‘",
	rdquo: "”",
	ldquo: "“",
};

function decodeEntities(text: string): string {
	// fromCodePoint throws on lone surrogates and >0x10ffff; anything invalid
	// stays as its literal source text rather than vanishing.
	const fromCode = (code: number, original: string) =>
		code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff)
			? String.fromCodePoint(code)
			: original;

	return text
		.replace(/&#(\d+);/g, (m, code: string) =>
			fromCode(Number.parseInt(code, 10), m),
		)
		.replace(/&#x([0-9a-f]+);/gi, (m, code: string) =>
			fromCode(Number.parseInt(code, 16), m),
		)
		.replace(
			/&([a-z]+);/gi,
			(m, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? m,
		);
}

/** Map RSS items to the shared shape (mirrors the old rss-parser mapping). */
export function rssItemsToPosts(
	items: ReturnType<typeof parseRssItems>,
): FacebookPost[] {
	// Bridges can emit the same link (often the bare page URL) for every
	// item, and ids double as React keys in both UIs — disambiguate repeats.
	const linkUses = new Map<string, number>();

	return items.map((item) => {
		// Decode entities BEFORE stripping tags: escaped-HTML descriptions
		// (`&lt;p&gt;Hello&lt;/p&gt;`) become real tags the strip can remove,
		// while `&mdash;`/`&#39;` in plain text become real characters.
		const decoded = decodeEntities(item.description);
		let pic: string | undefined = item.enclosureUrl;
		if (!pic) {
			const imgMatch = decoded.match(/<img[^>]+src=["']([^"']+)["']/i);
			if (imgMatch) pic = imgMatch[1];
		}
		const cleanMessage = decoded
			// Strip only real tags (a letter right after `<`): a bare `<`
			// that starts no tag — the `<3` in school posts, `a < b` —
			// survives instead of eating the rest of the message.
			.replace(/<\/?[a-zA-Z][^>]*>/g, "")
			// Adjacent CDATA sections leave their boundary mid-text.
			.replace(/\]\]><!\[CDATA\[/g, "")
			.replace(/\s+/g, " ")
			.trim();

		const created =
			item.pubDate && !Number.isNaN(Date.parse(item.pubDate))
				? new Date(item.pubDate).toISOString()
				: new Date(0).toISOString();

		const link = item.link || "";

		// Ids double as React keys and as the /posts dedupe key, so they must
		// be STABLE ACROSS SNAPSHOTS — a positional id (`link#rss_2`) refers to
		// whatever is 3rd in THIS fetch; after a refresh that's a different
		// post, and an already-rendered post would come back under a new id,
		// defeating the dedupe. Derive the id from content instead: same
		// post → same id no matter where it sits in the snapshot. The
		// snapshot-local counter only disambiguates exact repeats (bridges
		// re-emit the same post twice).
		const contentKey = `${link}|${created}|${(cleanMessage || item.title).slice(0, 128)}`;
		const uses = linkUses.get(contentKey) ?? 0;
		linkUses.set(contentKey, uses + 1);

		return {
			id: uses === 0 ? contentKey : `${contentKey}#rss_${uses}`,
			message: cleanMessage || decodeEntities(item.title),
			created_time: created,
			permalink_url: link,
			full_picture: pic,
		};
	});
}

/** Fetch via an RSS bridge (rss.app, RSSHub, self-hosted). Returns posts or null. */
export async function fetchRssPosts(
	rssUrl: string,
): Promise<FacebookPost[] | null> {
	if (!rssUrl) return null;
	const xml = await fetchText(rssUrl);
	if (!xml) return null;
	const posts = rssItemsToPosts(parseRssItems(xml)).filter(
		(p) => p.message || p.full_picture,
	);
	return posts.length > 0 ? posts : null;
}

/**
 * The public entry point: fetch the feed with a per-process TTL cache.
 *
 * Concurrent callers share one in-flight request (the landing page and the
 * /posts route can request at once during SSR). Failures are cached too, so
 * a broken token doesn't hammer Facebook on every page view.
 */
export async function getFacebookFeed(
	config: FacebookFeedConfig = facebookFeedConfigFromEnv(),
): Promise<FacebookFeedResult> {
	const now = Date.now();
	if (cache && cache.expiresAt > now) {
		return cache.result;
	}
	if (inFlight) return inFlight;

	inFlight = (async () => {
		let result: FacebookFeedResult | null = null;

		const graphPosts = await fetchGraphPosts(config);
		if (graphPosts) {
			result = { posts: graphPosts, source: "graph", failed: false };
		} else if (graphPosts !== null && !result) {
			// Graph answered successfully with zero renderable posts: a
			// working feed on a quiet page, not a fault. Don't mark it
			// failed and don't warn — and skip the RSS fallback, since the
			// configured primary source already gave its answer.
			result = { posts: [], source: "graph", failed: false };
		}

		if (!result) {
			const rssPosts = await fetchRssPosts(config.rssUrl ?? "");
			if (rssPosts) {
				result = { posts: rssPosts, source: "rss", failed: false };
			}
		}

		const final: FacebookFeedResult = result ?? {
			posts: [],
			source: "none",
			failed: true,
		};

		// A configured source that yields nothing is a fault worth one log
		// line — from the UI alone an expired token looks identical to a
		// site that never set one. Logged once per fetch (results are
		// cached, so that's once per TTL), and only when something was
		// actually configured: an unconfigured feed is a choice, not a fault.
		if (final.failed && (config.pageToken || config.rssUrl)) {
			const attempted = [
				config.pageToken && config.pageId ? "graph" : null,
				config.rssUrl ? "rss" : null,
			]
				.filter(Boolean)
				.join(", ");
			console.warn(
				`[facebook-feed] no posts available (sources attempted: ${
					attempted || "none"
				}) — check FACEBOOK_PAGE_TOKEN / FACEBOOK_RSS_URL if this is unexpected`,
			);
		}

		cache = {
			result: final,
			expiresAt: Date.now() + (final.failed ? FAILURE_TTL_MS : CACHE_TTL_MS),
		};
		return final;
	})();

	try {
		return await inFlight;
	} finally {
		inFlight = null;
	}
}

/** Test hook: wipe the module cache between test cases. */
export function resetFacebookFeedCache(): void {
	cache = null;
	inFlight = null;
}

/**
 * The school's actual Facebook page. Used as the permalink fallback when a
 * post has no link of its own, and by the UI for the "Follow us" affordance.
 */
export const FACEBOOK_PAGE_URL = "https://www.facebook.com/eebssbutwal";
