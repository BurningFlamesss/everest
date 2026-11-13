// @vitest-environment node

import { describe, expect, it } from "vitest";
import {
	DEFAULT_SOURCE,
	resolveCanvasVideoSource,
} from "#/hooks/useCanvasVideo.ts";

describe("resolveCanvasVideoSource", () => {
	it("keeps a full custom config intact", () => {
		expect(
			resolveCanvasVideoSource({
				folder: "/custom/footage/",
				prefix: "shot_",
				extension: ".webp",
				frameCount: 120,
			}),
		).toEqual({
			folder: "/custom/footage/",
			prefix: "shot_",
			extension: ".webp",
			frameCount: 120,
		});
	});

	it("fills unprovided keys with the defaults for a partial config", () => {
		expect(resolveCanvasVideoSource({ frameCount: 216 })).toEqual({
			...DEFAULT_SOURCE,
			frameCount: 216,
		});
		expect(resolveCanvasVideoSource({ folder: "/media/hero/" })).toEqual({
			...DEFAULT_SOURCE,
			folder: "/media/hero/",
		});
	});

	it("treats a bare number as the historical frameCount argument", () => {
		expect(resolveCanvasVideoSource(216)).toEqual({
			...DEFAULT_SOURCE,
			frameCount: 216,
		});
	});

	it("falls back entirely when no source is given", () => {
		expect(resolveCanvasVideoSource(undefined)).toEqual(DEFAULT_SOURCE);
	});

	it("appends the trailing slash a folder is missing", () => {
		expect(
			resolveCanvasVideoSource({ folder: "/schools/everest/hero" }).folder,
		).toBe("/schools/everest/hero/");
	});

	it("falls back to the default folder when the folder is blank", () => {
		expect(resolveCanvasVideoSource({ folder: "   " }).folder).toBe(
			DEFAULT_SOURCE.folder,
		);
	});

	it("falls back to the default extension when the extension is blank", () => {
		expect(resolveCanvasVideoSource({ extension: "" }).extension).toBe(
			DEFAULT_SOURCE.extension,
		);
	});

	it("prepends the leading dot an extension is missing", () => {
		expect(resolveCanvasVideoSource({ extension: "jpeg" }).extension).toBe(
			".jpeg",
		);
		expect(resolveCanvasVideoSource({ extension: "webp" }).extension).toBe(
			".webp",
		);
	});

	it("falls back to the default prefix when the prefix is blank", () => {
		expect(resolveCanvasVideoSource({ prefix: "" }).prefix).toBe(
			DEFAULT_SOURCE.prefix,
		);
	});

	it.each([
		0,
		-5,
		Number.NaN,
	])("falls back to the default frame count for %s", (input) => {
		expect(resolveCanvasVideoSource({ frameCount: input }).frameCount).toBe(
			DEFAULT_SOURCE.frameCount,
		);
	});

	it("floors a positive fractional frame count", () => {
		expect(resolveCanvasVideoSource({ frameCount: 216.9 }).frameCount).toBe(
			216,
		);
		expect(resolveCanvasVideoSource({ frameCount: 3.7 }).frameCount).toBe(3);
	});
});
