import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	CACHE_TTL_MS,
	FAILURE_TTL_MS,
	type FacebookFeedConfig,
	facebookFeedConfigFromEnv,
	fetchGraphPosts,
	fetchRssPosts,
	getFacebookFeed,
	parseRssItems,
	resetFacebookFeedCache,
	rssItemsToPosts,
} from "./facebook-feed.ts";

// --- test doubles -----------------------------------------------------------

const fetchMock = vi.fn();
const globalFetch = globalThis.fetch;

beforeEach(() => {
	resetFacebookFeedCache();
	(globalThis as Record<string, unknown>).fetch = fetchMock;
});

afterEach(() => {
	(globalThis as Record<string, unknown>).fetch = globalFetch;
	fetchMock.mockReset();
	vi.restoreAllMocks();
});

const graphBody = (posts: object[], next?: string) =>
	JSON.stringify({ data: posts, ...(next ? { paging: { next } } : {}) });

const graphPost = (overrides: Partial<object> = {}) => ({
	id: "post_1",
	message: "Sports week starts tomorrow!",
	created_time: "2026-11-10T04:00:00+0000",
	full_picture: "https://example.com/pic.jpg",
	permalink_url: "https://facebook.com/eebssbutwal/posts/post_1",
	...overrides,
});

const rssXml = (items: string) => `<?xml version="1.0"?>
<rss version="2.0"><channel><title>Feed</title>
${items}
</channel></rss>`;

// --- config from env --------------------------------------------------------

describe("facebookFeedConfigFromEnv", () => {
	it("reads the Graph and RSS settings from the environment", () => {
		const config = facebookFeedConfigFromEnv({
			FACEBOOK_PAGE_TOKEN: "token",
			FACEBOOK_PAGE_ID: "12345",
			FACEBOOK_GRAPH_VERSION: "v22.0",
			FACEBOOK_RSS_URL: "https://rss.example/feed.xml",
		});
		expect(config).toEqual({
			pageToken: "token",
			pageId: "12345",
			graphVersion: "v22.0",
			rssUrl: "https://rss.example/feed.xml",
		});
	});

	it("falls back to the legacy VITE_ RSS variable", () => {
		const config = facebookFeedConfigFromEnv({
			VITE_FACEBOOK_RSS_URL: "https://rss.app/feeds/abc.xml",
		});
		expect(config.rssUrl).toBe("https://rss.app/feeds/abc.xml");
	});

	it("defaults the Graph version when unset", () => {
		expect(facebookFeedConfigFromEnv({}).graphVersion).toBe("v23.0");
	});
});

// --- Graph source -----------------------------------------------------------

describe("fetchGraphPosts", () => {
	it("fetches the page feed and normalizes the fields", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(
				graphBody([
					graphPost(),
					// A photo-only post still counts.
					graphPost({
						id: "post_2",
						message: undefined,
						permalink_url: undefined,
					}),
					// A post with neither text nor picture is dropped.
					graphPost({
						id: "post_3",
						message: undefined,
						full_picture: undefined,
					}),
				]),
				{ status: 200 },
			),
		);

		const posts = await fetchGraphPosts({
			pageToken: "tok",
			pageId: "123",
		});

		expect(posts).toHaveLength(2);
		expect(posts?.[0]).toEqual({
			id: "post_1",
			message: "Sports week starts tomorrow!",
			created_time: "2026-11-10T04:00:00+0000",
			full_picture: "https://example.com/pic.jpg",
			permalink_url: "https://facebook.com/eebssbutwal/posts/post_1",
		});
		// The photo-only post gets an empty permalink the server fn fills with
		// the page URL fallback.
		expect(posts?.[1].permalink_url).toBe("");
	});

	it("follows pagination up to two pages", async () => {
		const url = fetchMock.mockResolvedValueOnce(
			new Response(
				graphBody([graphPost()], "https://graph.facebook.com/page2"),
				{ status: 200 },
			),
		);
		fetchMock.mockResolvedValueOnce(
			new Response(graphBody([graphPost({ id: "post_9" })]), { status: 200 }),
		);

		const posts = await fetchGraphPosts({ pageToken: "t", pageId: "1" });

		expect(posts).toHaveLength(2);
		expect(url).toHaveBeenCalledWith(
			"https://graph.facebook.com/v23.0/1/posts?fields=id,message,created_time,full_picture,permalink_url&limit=25&access_token=t",
			expect.objectContaining({ signal: expect.any(AbortSignal) }),
		);
		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock.mock.calls[1]?.[0]).toBe(
			"https://graph.facebook.com/page2",
		);
	});

	it("returns null when Graph answers with an error object", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(
				JSON.stringify({ error: { message: "bad token", code: 190 } }),
				{ status: 200 },
			),
		);
		expect(await fetchGraphPosts({ pageToken: "bad", pageId: "1" })).toBeNull();
	});

	it("keeps page-one posts when a later page fails", async () => {
		// Page 1 succeeds and points at page 2…
		fetchMock.mockResolvedValueOnce(
			new Response(
				graphBody([graphPost()], "https://graph.facebook.com/page2"),
				{ status: 200 },
			),
		);
		// …but page 2 blows up mid-request. The 25 real posts already in hand
		// must survive; only the second page is lost.
		fetchMock.mockRejectedValueOnce(new Error("connection reset"));

		const posts = await fetchGraphPosts({ pageToken: "t", pageId: "1" });
		expect(posts).toHaveLength(1);
		expect(posts?.[0].id).toBe("post_1");
	});

	it("keeps page-one posts when a later page returns an error object", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(
				graphBody([graphPost()], "https://graph.facebook.com/page2"),
				{ status: 200 },
			),
		);
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: { code: 2 } }), { status: 200 }),
		);

		const posts = await fetchGraphPosts({ pageToken: "t", pageId: "1" });
		expect(posts).toHaveLength(1);
	});

	it("returns null on HTTP errors and network failures", async () => {
		fetchMock.mockResolvedValueOnce(new Response("nope", { status: 500 }));
		expect(await fetchGraphPosts({ pageToken: "t", pageId: "1" })).toBeNull();

		fetchMock.mockRejectedValueOnce(new Error("network down"));
		expect(await fetchGraphPosts({ pageToken: "t", pageId: "1" })).toBeNull();
	});

	it("returns null without a token or page id", async () => {
		expect(await fetchGraphPosts({})).toBeNull();
		expect(fetchMock).not.toHaveBeenCalled();
	});
});

// --- RSS source -------------------------------------------------------------

describe("parseRssItems / rssItemsToPosts", () => {
	it("parses items with CDATA content and entities", () => {
		const items = parseRssItems(
			rssXml(`<item>
				<title><![CDATA[Result published]]></title>
				<link>https://facebook.com/eebssbutwal/posts/abc</link>
				<pubDate>Tue, 10 Nov 2026 04:00:00 GMT</pubDate>
				<description><![CDATA[<p>Check the &quot;notice board&quot; &amp; download PDF <img src="https://example.com/img.jpg"></p>]]></description>
				<enclosure url="https://example.com/enc.jpg" type="image/jpeg" />
			</item>`),
		);
		expect(items).toHaveLength(1);

		const [post] = rssItemsToPosts(items);
		// Content-derived id: link|created|first-128-chars-of-message.
		expect(post.id).toBe(
			'https://facebook.com/eebssbutwal/posts/abc|2026-11-10T04:00:00.000Z|Check the "notice board" & download PDF',
		);
		expect(post.message).toBe('Check the "notice board" & download PDF');
		// Enclosure wins over an inline image.
		expect(post.full_picture).toBe("https://example.com/enc.jpg");
		expect(post.created_time).toBe("2026-11-10T04:00:00.000Z");
	});

	it("decodes named and numeric entities to real characters", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[t]]></title>
				<description><![CDATA[Sports day &mdash; results &ndash; published &hellip; it&#39;s &#8220;final&#8221; &amp; &amp;amp; stays escaped]]></description></item>`),
			),
		);
		// `&amp;amp;` decodes exactly once (to the literal text `&amp;`);
		// one pass, no rescanning — same as a browser rendering that source.
		expect(post.message).toBe(
			"Sports day — results – published … it's “final” & &amp; stays escaped",
		);
	});

	it("keeps a bare '<' that starts no tag (the '<3' in school posts)", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[t]]></title>
				<description><![CDATA[Happy teachers day <3 from EEBSS family — a < b and c > d]]></description></item>`),
			),
		);
		expect(post.message).toBe(
			"Happy teachers day <3 from EEBSS family — a < b and c > d",
		);
	});

	it("strips tags from escaped-HTML descriptions after decoding them", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[t]]></title>
				<description>&lt;p&gt;Result of &lt;b&gt;Grade 10&lt;/b&gt; &nbsp;published&lt;/p&gt;</description></item>`),
			),
		);
		expect(post.message).toBe("Result of Grade 10 published");
	});

	it("gives duplicate links distinct ids for React keys", () => {
		const posts = rssItemsToPosts(
			parseRssItems(
				rssXml(
					`<item><title><![CDATA[One]]></title><link>https://same</link><description><![CDATA[d1]]></description></item>
					<item><title><![CDATA[Two]]></title><link>https://same</link><description><![CDATA[d2]]></description></item>
					<item><title><![CDATA[Three]]></title><link>https://same</link><description><![CDATA[d3]]></description></item>`,
				),
			),
		);
		expect(posts.map((p) => p.id)).toEqual([
			// Content-derived: same link, distinct body → distinct id,
			// stable across snapshots (not positional).
			"https://same|1970-01-01T00:00:00.000Z|d1",
			"https://same|1970-01-01T00:00:00.000Z|d2",
			"https://same|1970-01-01T00:00:00.000Z|d3",
		]);
		// The permalink keeps pointing at the real link.
		expect(posts.every((p) => p.permalink_url === "https://same")).toBe(true);
	});

	it("ignores unknown or invalid entities rather than dropping the text", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[t]]></title>
				<description><![CDATA[Odd &notanentity; and &#999999999; and &#xD800; survive &#x1F600; ok]]></description></item>`),
			),
		);
		expect(post.message).toBe(
			"Odd &notanentity; and &#999999999; and &#xD800; survive \u{1F600} ok",
		);
	});

	it("falls back to the inline img when there is no enclosure", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[Photo day]]></title><link>https://l</link>
				<pubDate>Tue, 10 Nov 2026 04:00:00 GMT</pubDate>
				<description><![CDATA[<img src="https://example.com/inline.jpg">]]></description></item>`),
			),
		);
		expect(post.full_picture).toBe("https://example.com/inline.jpg");
		// The description held no text, so the title carries the message.
		expect(post.message).toBe("Photo day");
		// Ids are content-derived (link|created|message) and stable across
		// snapshots, so lazy pages can dedupe against earlier snapshots.
		expect(post.id).toBe("https://l|2026-11-10T04:00:00.000Z|Photo day");
	});

	it("survives an unparseable date and missing link", () => {
		const [post] = rssItemsToPosts(
			parseRssItems(
				rssXml(`<item><title><![CDATA[Update]]></title>
				<pubDate>not a date</pubDate>
				<description><![CDATA[Body text]]></description></item>`),
			),
		);
		expect(post.created_time).toBe(new Date(0).toISOString());
		expect(post.id).toBe("|1970-01-01T00:00:00.000Z|Body text");
		expect(post.permalink_url).toBe("");
	});

	it("caps stored items at 50", () => {
		const many = parseRssItems(
			rssXml(
				Array.from(
					{ length: 60 },
					(_, i) =>
						`<item><title><![CDATA[t${i}]]></title><description><![CDATA[d]]></description></item>`,
				).join(""),
			),
		);
		expect(many).toHaveLength(50);
	});
});

describe("fetchRssPosts", () => {
	it("fetches and maps an RSS feed", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(
				rssXml(`<item><title><![CDATA[Exam notice]]></title><link>https://fb/post/1</link>
				<pubDate>Tue, 10 Nov 2026 04:00:00 GMT</pubDate>
				<description><![CDATA[Admit cards from the office.]]></description></item>`),
				{ status: 200 },
			),
		);
		const posts = await fetchRssPosts("https://rss.example/feed.xml");
		expect(posts).toHaveLength(1);
		expect(posts?.[0].message).toBe("Admit cards from the office.");
	});

	it("returns null for an empty URL, failed fetch, or empty feed", async () => {
		expect(await fetchRssPosts("")).toBeNull();
		fetchMock.mockResolvedValueOnce(new Response("err", { status: 502 }));
		expect(await fetchRssPosts("https://rss.example/x")).toBeNull();
		fetchMock.mockResolvedValueOnce(new Response(rssXml(""), { status: 200 }));
		expect(await fetchRssPosts("https://rss.example/x")).toBeNull();
	});
});

// --- pipeline + cache -------------------------------------------------------

describe("getFacebookFeed", () => {
	it("prefers Graph when configured and working", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(graphBody([graphPost()]), { status: 200 }),
		);
		const result = await getFacebookFeed({
			pageToken: "t",
			pageId: "1",
			rssUrl: "https://rss.example/feed.xml",
		});
		expect(result.source).toBe("graph");
		expect(result.failed).toBe(false);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("falls back to RSS when Graph fails", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: { code: 190 } }), { status: 200 }),
		);
		fetchMock.mockResolvedValueOnce(
			new Response(
				rssXml(
					`<item><title><![CDATA[Hi]]></title><description><![CDATA[Body]]></description></item>`,
				),
				{ status: 200 },
			),
		);
		const result = await getFacebookFeed({
			pageToken: "expired",
			pageId: "1",
			rssUrl: "https://rss.example/feed.xml",
		});
		expect(result.source).toBe("rss");
		expect(result.posts).toHaveLength(1);
	});

	it("returns an honest empty result when nothing is configured", async () => {
		const result = await getFacebookFeed({});
		expect(result).toEqual({
			posts: [],
			source: "none",
			failed: true,
		});
		// No outbound request for an unconfigured feed.
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("warns once when a configured source fails, not when unconfigured", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

		// Configured token, but Graph rejects it and there's no RSS fallback:
		// a fault the operator needs to see in the server log.
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: { code: 190 } }), { status: 200 }),
		);
		const fault = await getFacebookFeed({ pageToken: "expired", pageId: "1" });
		expect(fault.failed).toBe(true);
		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0]?.[0]).toMatch(
			/\[facebook-feed\] no posts available \(sources attempted: graph\)/,
		);

		// Unconfigured is a deliberate choice, not a fault — stays silent.
		// (fresh fetch: the cache above would otherwise answer from memory)
		warn.mockClear();
		resetFacebookFeedCache();
		await getFacebookFeed({});
		expect(warn).not.toHaveBeenCalled();

		// A working source logs nothing either.
		warn.mockClear();
		resetFacebookFeedCache();
		fetchMock.mockResolvedValueOnce(
			new Response(graphBody([graphPost()]), { status: 200 }),
		);
		const ok = await getFacebookFeed({ pageToken: "t", pageId: "1" });
		expect(ok.failed).toBe(false);
		expect(warn).not.toHaveBeenCalled();
	});

	it("caches the result and shares concurrent requests", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(graphBody([graphPost()]), { status: 200 }),
		);
		const config: FacebookFeedConfig = { pageToken: "t", pageId: "1" };

		const [a, b] = await Promise.all([
			getFacebookFeed(config),
			getFacebookFeed(config), // in-flight, not a second request
		]);
		expect(a).toBe(b); // same cached object identity
		expect(fetchMock).toHaveBeenCalledTimes(1);

		const again = await getFacebookFeed(config); // cached within TTL
		expect(again).toBe(a);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it("re-fetches once the TTL expires", async () => {
		vi.useFakeTimers();
		try {
			fetchMock.mockResolvedValue(
				new Response(graphBody([graphPost()]), { status: 200 }),
			);
			const config: FacebookFeedConfig = { pageToken: "t", pageId: "1" };
			await getFacebookFeed(config);
			expect(fetchMock).toHaveBeenCalledTimes(1);

			vi.advanceTimersByTime(CACHE_TTL_MS + 1);
			await getFacebookFeed(config);
			expect(fetchMock).toHaveBeenCalledTimes(2);
		} finally {
			vi.useRealTimers();
		}
	});

	it("retries a failed fetch after the short failure TTL, not the full one", async () => {
		vi.useFakeTimers();
		try {
			const config: FacebookFeedConfig = { pageToken: "t", pageId: "1" };
			// One transient failure — Graph rejects once, then works.
			fetchMock
				.mockResolvedValueOnce(
					new Response(JSON.stringify({ error: { code: 2 } }), {
						status: 200,
					}),
				)
				.mockResolvedValue(
					new Response(graphBody([graphPost()]), {
						status: 200,
					}),
				);

			const failed = await getFacebookFeed(config);
			expect(failed.failed).toBe(true);

			// Still inside the failure window: served from cache, no retry.
			await getFacebookFeed(config);
			expect(fetchMock).toHaveBeenCalledTimes(1);

			// Past the failure TTL (but well before the success TTL): retried
			// and recovered.
			vi.advanceTimersByTime(FAILURE_TTL_MS + 1);
			const recovered = await getFacebookFeed(config);
			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(recovered.failed).toBe(false);
			expect(recovered.source).toBe("graph");
		} finally {
			vi.useRealTimers();
		}
	});

	it("treats a valid-but-empty Graph feed as success, not a fault", async () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		fetchMock.mockResolvedValueOnce(
			new Response(graphBody([]), { status: 200 }),
		);

		const result = await getFacebookFeed({ pageToken: "good", pageId: "1" });
		// The API answered fine; an empty page is not a misconfiguration.
		expect(result.failed).toBe(false);
		expect(result.source).toBe("graph");
		// And no RSS fallback was attempted — Graph already gave its answer.
		expect(fetchMock).toHaveBeenCalledTimes(1);
		expect(warn).not.toHaveBeenCalled();
	});
});
