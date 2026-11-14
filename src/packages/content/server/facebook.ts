import { createServerFn } from "@tanstack/react-start";
import {
	FACEBOOK_PAGE_URL,
	type FacebookPost,
	facebookFeedConfigFromEnv,
	getFacebookFeed,
} from "#/lib/facebook-feed.ts";
import { setPublicCacheHeaders } from "#/packages/content/server/cache-headers";

export type { FacebookPost };
export { FACEBOOK_PAGE_URL };

export interface FacebookPostsPage {
	data: FacebookPost[];
	/** Next page number, or null when exhausted. */
	nextCursor: number | null;
	/** Where these posts came from — the UI may label this. */
	source: "graph" | "rss" | "none";
	/**
	 * True when every configured source failed — i.e. a token was set but
	 * Facebook rejected it, so "no posts" is a fault, not a configuration
	 * choice. Distinguishes an expired FACEBOOK_PAGE_TOKEN from a site that
	 * simply hasn't configured the feed.
	 */
	failed: boolean;
}

/**
 * Public feed of the school's Facebook page (facebook.com/eebssbutwal),
 * shown on the landing page and the /posts route.
 *
 * The fetching itself lives in `#/lib/facebook-feed.ts`: Graph API first,
 * an RSS bridge second, an honest empty state last — never fabricated
 * content. Results are cached server-side for five minutes and responses
 * carry the same public cache headers as the rest of the public site, so a
 * busy landing page costs Facebook at most one upstream request per TTL.
 */
export const getFacebookPostsServer = createServerFn({ method: "GET" })
	.validator((data: { page: number; pageSize: number }) => data)
	.handler(async ({ data }) => {
		// The fn is a public GET endpoint; never trust page/pageSize. Clamp
		// to sane values so a stray `page=0`/`pageSize=0` can't produce an
		// empty page that claims more pages exist (an infinite cursor).
		const page = Math.max(1, Math.trunc(Number(data.page) || 1));
		const pageSize = Math.min(
			50,
			Math.max(1, Math.trunc(Number(data.pageSize) || 6)),
		);

		const feed = await getFacebookFeed(facebookFeedConfigFromEnv());

		const start = (page - 1) * pageSize;
		const end = start + pageSize;
		const sliced = feed.posts.slice(start, end);

		setPublicCacheHeaders(
			new Headers({
				"Cache-Control":
					"public, max-age=300, s-maxage=900, stale-while-revalidate=3600",
			}),
		);

		return {
			data: sliced.map((post) => ({
				...post,
				// Never leave a dead link: posts without their own permalink
				// still point somewhere useful.
				permalink_url: post.permalink_url || FACEBOOK_PAGE_URL,
			})),
			nextCursor: end < feed.posts.length ? page + 1 : null,
			source: feed.source,
			failed: feed.failed,
		} satisfies FacebookPostsPage;
	});
