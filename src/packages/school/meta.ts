import { getSchoolConfig } from "./loader.ts";

/**
 * Per-page metadata built from school config.
 *
 * Route `head` functions use this so every public page gets a real title,
 * description and social preview without duplicating config strings.
 */
export function pageMeta({
	title,
	description,
	image,
}: {
	title: string;
	description?: string;
	image?: string | null;
}) {
	const config = getSchoolConfig("everest");
	const fullTitle =
		title === config.organization.name
			? title
			: `${title} · ${config.organization.shortName ?? config.organization.name}`;
	const summary = description ?? config.seo.description;
	const preview = image ?? config.seo.ogImage;

	return {
		meta: [
			{ title: fullTitle },
			{ name: "description", content: summary },
			{ property: "og:title", content: fullTitle },
			{ property: "og:description", content: summary },
			...(preview ? [{ property: "og:image", content: preview }] : []),
		],
	};
}
