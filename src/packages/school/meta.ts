import { getSchoolConfig } from "./loader.ts";

export const DEFAULT_KEYWORDS = [
	"everest school",
	"everest english boarding school",
	"eebss",
	"school in nepal",
	"best school in nepal",
	"top school in nepal",
	"best school in butwal",
	"top school in butwal",
	"best school in rupandehi",
	"everest english boarding secondary school",
	"everest butwal",
	"eebss butwal",
	"+2 science in butwal nepal",
	"+2 management in butwal nepal",
	"best secondary school in nepal",
	"top neb school in nepal",
	"nepal english boarding school",
	"see preparation school nepal",
	"butwal english boarding school",
	"lumbini province school",
].join(", ");

/**
 * Super-optimized per-page metadata built for search engine visibility.
 *
 * Ensures all public pages carry complete meta tags (title, description,
 * keywords, OpenGraph, Twitter Cards, robots, canonical URLs, and geotargeting)
 * specifically optimized for queries like "everest school", "eebss",
 * "best school in nepal", and "school in nepal".
 */
export function pageMeta({
	title,
	description,
	image,
	path,
	keywords,
	type = "website",
	author,
	publishedTime,
	modifiedTime,
}: {
	title: string;
	description?: string;
	image?: string | null;
	path?: string;
	keywords?: string;
	type?: "website" | "article";
	author?: string;
	publishedTime?: string;
	modifiedTime?: string;
}) {
	const config = getSchoolConfig("everest");
	const baseUrl = "https://everestebss.edu.np";

	// Ensure brand and key terms are present in the page title
	const fullTitle = title.includes("Everest")
		? title
		: `${title} | Everest English Boarding Secondary School (EEBSS)`;

	const summary =
		description ??
		config.seo.description ??
		"Everest English Boarding Secondary School (EEBSS) is widely recognized as one of the best schools in Nepal, situated in Butwal-8, Rupandehi. Offering excellence from Early Years to Grade 12 (+2 Science & Management) affiliated with NEB Nepal.";

	const preview =
		image ??
		(config.seo.ogImage
			? config.seo.ogImage.startsWith("http")
				? config.seo.ogImage
				: `${baseUrl}${config.seo.ogImage}`
			: `${baseUrl}/schools/everest/logo.png`);

	const canonicalUrl = path
		? `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`
		: undefined;

	const allKeywords = keywords
		? `${keywords}, ${DEFAULT_KEYWORDS}`
		: DEFAULT_KEYWORDS;

	return {
		meta: [
			{ title: fullTitle },
			{ name: "description", content: summary },
			{ name: "keywords", content: allKeywords },
			{
				name: "robots",
				content:
					"index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
			},
			{ name: "googlebot", content: "index, follow" },
			{
				name: "author",
				content: author ?? "Everest English Boarding Secondary School",
			},
			{
				name: "publisher",
				content: "Everest English Boarding Secondary School",
			},
			{ name: "geo.region", content: "NP-P5" },
			{ name: "geo.placename", content: "Butwal, Rupandehi, Nepal" },
			{ name: "geo.position", content: "27.7;83.4486" },
			{ name: "ICBM", content: "27.7, 83.4486" },
			{
				property: "og:site_name",
				content: "Everest English Boarding Secondary School (EEBSS)",
			},
			{ property: "og:type", content: type },
			{ property: "og:title", content: fullTitle },
			{ property: "og:description", content: summary },
			{ property: "og:locale", content: "en_US" },
			{ property: "og:locale:alternate", content: "ne_NP" },
			...(canonicalUrl ? [{ property: "og:url", content: canonicalUrl }] : []),
			...(preview
				? [
						{ property: "og:image", content: preview },
						{ name: "twitter:image", content: preview },
					]
				: []),
			{ name: "twitter:card", content: "summary_large_image" },
			{ name: "twitter:site", content: "@eebssbutwal" },
			{ name: "twitter:title", content: fullTitle },
			{ name: "twitter:description", content: summary },
			...(publishedTime
				? [{ property: "article:published_time", content: publishedTime }]
				: []),
			...(modifiedTime
				? [{ property: "article:modified_time", content: modifiedTime }]
				: []),
		],
		...(canonicalUrl
			? {
					links: [
						{
							rel: "canonical",
							href: canonicalUrl,
						},
					],
				}
			: {}),
	};
}
