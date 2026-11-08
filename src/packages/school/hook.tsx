import { useEffect } from "react";
import type { WebsitePageContent } from "#/lib/website-content-loader";
import { Route as RootRoute } from "#/routes/__root";
import {
	useContentStoreActions,
	useSchoolConfig as useSchoolConfigStore,
	useSchoolContent as useSchoolContentStore,
} from "#/stores/contentStore.ts";
import type { Person, Scholarship } from "#/types";
import type { Notice } from "#/types/website";
import type { SchoolContent } from "#/types/school";

/**
 * Shape of the root loader `content` payload: the managed CMS pages keyed by
 * page key, plus the public collections and the sidebar blob.
 */
type LoaderContent = {
	sidebar?: SchoolContent["sidebar"];
	notices?: Notice[];
	facultyMembers?: Person[];
	scholarships?: Scholarship[];
} & Record<string, unknown>;

function isWebsitePageContent(
	value: unknown,
): value is WebsitePageContent & Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

export function useSyncContentStore() {
	const loaderData = RootRoute.useLoaderData();
	const { setSchoolConfig, setSchoolContent, setWebsitePage } =
		useContentStoreActions();

	useEffect(() => {
		if (loaderData?.config) {
			setSchoolConfig(loaderData.config);
		}
		if (loaderData?.content) {
			const { sidebar, ...pageContent } = loaderData.content as unknown as LoaderContent;
			for (const [key, page] of Object.entries(pageContent)) {
				// Only managed WebsitePage payloads belong in the websitePages map;
				// collection arrays (facultyMembers/notices/scholarships) are read
				// straight from the loader via their dedicated hooks.
				if (page && isWebsitePageContent(page)) {
					setWebsitePage(key as WebsitePageKey, page);
				}
			}
			if (sidebar) {
				setSchoolContent(sidebar);
			}
		}
	}, [loaderData, setSchoolConfig, setSchoolContent, setWebsitePage]);
}

export function useSchoolConfig() {
	const storeConfig = useSchoolConfigStore();
	const loaderConfig = RootRoute.useLoaderData({
		select: (data) => data.config,
	});
	return storeConfig ?? loaderConfig;
}

export function useSchoolContent() {
	const storeContent = useSchoolContentStore();
	const loaderContent = RootRoute.useLoaderData({
		select: (data) => data.content as unknown as LoaderContent,
	});
	return {
		sidebar: storeContent ?? loaderContent?.sidebar,
	};
}

import type { WebsitePageKey } from "#/types";
export type ManagedPageKey = WebsitePageKey;

/**
 * Returns the published WebsitePage for a managed page key (with its rendered
 * blocks) when one exists, so public routes can be driven from the admin CMS.
 * Falls back to null so pages keep their static design until content is
 * published.
 */
export function useWebsitePageContent(
	key: ManagedPageKey,
): WebsitePageContent | null {
	const loaderContent = RootRoute.useLoaderData({
		select: (data) =>
			(data.content as unknown as LoaderContent)[key] as WebsitePageContent | undefined,
	});

	if (
		loaderContent &&
		loaderContent.status === "published" &&
		Array.isArray(loaderContent.blocks) &&
		loaderContent.blocks.length > 0
	) {
		return loaderContent;
	}
	return null;
}

/**
 * Public faculty directory loaded from the database by the root loader.
 * Null when the collection has not been seeded, so pages fall back to their
 * static data.
 */
export function useFacultyDirectory(): Person[] | null {
	return (
		RootRoute.useLoaderData({
			select: (data) =>
				(data.content as unknown as LoaderContent).facultyMembers as Person[] | undefined,
		}) ?? null
	);
}

/** Public notice board loaded from the database. */
export function useNotices(): Notice[] | null {
	return (
		RootRoute.useLoaderData({
			select: (data) =>
				(data.content as unknown as LoaderContent).notices as Notice[] | undefined,
		}) ?? null
	);
}

/** Public scholarship schemes loaded from the database. */
export function useScholarships(): Scholarship[] | null {
	return (
		RootRoute.useLoaderData({
			select: (data) =>
				(data.content as unknown as LoaderContent).scholarships as Scholarship[] | undefined,
		}) ?? null
	);
}

/** Generic loader for a public content collection keyed in the root loader. */
function useCollection<T>(key: string): T[] | null {
	return (
		RootRoute.useLoaderData({
			select: (data) =>
			(data.content as unknown as LoaderContent)[key] as T[] | undefined,
		}) ?? null
	);
}

/** Gallery albums loaded from the database. */
export function useAlbums<T = unknown>(): T[] | null {
	return useCollection<T>("albums");
}

/** Campus facilities loaded from the database. */
export function useFacilities<T = unknown>(): T[] | null {
	return useCollection<T>("facilities");
}

/** Downloadable resources loaded from the database. */
export function useResources<T = unknown>(): T[] | null {
	return useCollection<T>("resources");
}

/** Board (SEE/NEB) results loaded from the database. */
export function useBoardResults<T = unknown>(): T[] | null {
	return useCollection<T>("boardResults");
}

/** Academic programs loaded from the database. */
export function usePrograms<T = unknown>(): T[] | null {
	return useCollection<T>("programs");
}

/** Bus routes loaded from the database. */
export function useBusRoutes<T = unknown>(): T[] | null {
	return useCollection<T>("busRoutes");
}

/** Calendar events loaded from the database. */
export function useCalendarEvents<T = unknown>(): T[] | null {
	return useCollection<T>("calendarEvents");
}
