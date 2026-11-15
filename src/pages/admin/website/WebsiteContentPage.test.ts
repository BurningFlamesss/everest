import { describe, expect, it } from "vitest";
import {
	type CmsPageKey,
	pageSectionTypes,
	sectionDefaults,
	sectionLabel,
} from "#/lib/cms-sections";
import { PUBLIC_PAGES } from "./WebsiteContentPage";

describe("Website CMS - Multi-Route Full Public Page Support", () => {
	it("registers all 20 public routes with complete metadata", () => {
		expect(PUBLIC_PAGES).toHaveLength(20);

		const expectedKeys = [
			"home",
			"about",
			"contact",
			"facilities",
			"faculty",
			"courses",
			"course_finder",
			"admissions",
			"scholarship",
			"calendar",
			"result",
			"clubs",
			"events",
			"gallery",
			"notices",
			"posts",
			"transportation",
			"resources",
			"login",
			"activate",
		];

		const actualKeys = PUBLIC_PAGES.map((p) => p.key);
		for (const key of expectedKeys) {
			expect(actualKeys).toContain(key);
		}
	});

	it("provides dedicated CMS bridges for pages with dedicated management", () => {
		const dedicatedKeys = [
			"notices",
			"gallery",
			"calendar",
			"events",
			"admissions",
			"faculty",
			"clubs",
			"facilities",
			"courses",
			"scholarship",
			"result",
			"transportation",
		];

		for (const key of dedicatedKeys) {
			const page = PUBLIC_PAGES.find((p) => p.key === key);
			expect(page?.dedicatedCms).toBeDefined();
			expect(page?.dedicatedCms?.to).toMatch(/^\/admin\//);
			expect(page?.dedicatedCms?.label.length).toBeGreaterThan(0);
		}
	});

	it("returns valid section definitions for every public route", () => {
		for (const page of PUBLIC_PAGES) {
			const sections = pageSectionTypes(page.key as CmsPageKey);
			expect(sections.length).toBeGreaterThan(0);

			for (const section of sections) {
				const label = sectionLabel(section);
				expect(label.length).toBeGreaterThan(0);

				const defaults = sectionDefaults(section, page.key as CmsPageKey);
				expect(typeof defaults).toBe("object");
			}
		}
	});

	it("provides page-specific headline defaults for content pages", () => {
		const coursesDefaults = sectionDefaults("headline", "courses");
		expect(coursesDefaults.eyebrow).toBe("Academics");
		expect(coursesDefaults.title).toBe("Courses & Academic Programmes");

		const calendarDefaults = sectionDefaults("headline", "calendar");
		expect(calendarDefaults.eyebrow).toBe("Calendar");
		expect(calendarDefaults.title).toBe("Academic calendar & routine");

		const galleryDefaults = sectionDefaults("headline", "gallery");
		expect(galleryDefaults.eyebrow).toBe("Gallery");
		expect(galleryDefaults.title).toBe("Life on the Butwal-8 campus");

		const noticesDefaults = sectionDefaults("headline", "notices");
		expect(noticesDefaults.eyebrow).toBe("Notices");
		expect(noticesDefaults.title).toBe("Official notices & circulars");

		const clubsDefaults = sectionDefaults("headline", "clubs");
		expect(clubsDefaults.eyebrow).toBe("Student life");
		expect(clubsDefaults.title).toBe("Clubs");
	});

	it("corrects activate path to public route /activate instead of /_onboard", () => {
		const activatePage = PUBLIC_PAGES.find((p) => p.key === "activate");
		expect(activatePage?.path).toBe("/activate");

		const loginPage = PUBLIC_PAGES.find((p) => p.key === "login");
		expect(loginPage?.path).toBe("/login");
	});
});
