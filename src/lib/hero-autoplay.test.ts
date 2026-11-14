// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
	autoplaySpeedFromSeconds,
	isScrollKey,
	MAX_FRAME_DELTA_MS,
	nextScrollPosition,
	overlayBodyStyle,
	overlaySegments,
	overlayStyleForFrame,
	overlayWordStyle,
	shouldResumeAutoplay,
	TIMELINE_UNITS,
} from "./hero-autoplay";

describe("autoplaySpeedFromSeconds", () => {
	it("spreads the track over the requested duration", () => {
		// 6000px over 30s → 6000 / 30000ms
		expect(autoplaySpeedFromSeconds(30, 6000)).toBeCloseTo(0.2);
	});

	it("rejects non-positive durations and tracks", () => {
		expect(autoplaySpeedFromSeconds(0, 6000)).toBe(0);
		expect(autoplaySpeedFromSeconds(-5, 6000)).toBe(0);
		expect(autoplaySpeedFromSeconds(30, 0)).toBe(0);
		expect(autoplaySpeedFromSeconds(Number.NaN, 6000)).toBe(0);
	});
});

describe("isScrollKey", () => {
	it("recognises keys that move the page", () => {
		for (const key of [
			"ArrowDown",
			"ArrowUp",
			"PageDown",
			"PageUp",
			"Home",
			"End",
			" ",
		]) {
			expect(isScrollKey(key)).toBe(true);
		}
	});

	it("ignores typing keys", () => {
		for (const key of ["a", "Enter", "Shift", "Escape", "Tab"]) {
			expect(isScrollKey(key)).toBe(false);
		}
	});
});

describe("nextScrollPosition", () => {
	it("advances by speed × elapsed time", () => {
		const next = nextScrollPosition({
			current: 100,
			start: 0,
			end: 1000,
			pxPerMs: 0.5,
			dtMs: 16,
		});
		expect(next.position).toBe(108);
		expect(next.done).toBe(false);
	});

	it("clamps an absurd dt (a background-tab nap) to one frame", () => {
		const next = nextScrollPosition({
			current: 0,
			start: 0,
			end: 100_000,
			pxPerMs: 1,
			dtMs: 5 * 60 * 1000,
		});
		expect(next.position).toBe(MAX_FRAME_DELTA_MS);
	});

	it("stops exactly at the end and reports done", () => {
		const next = nextScrollPosition({
			current: 995,
			start: 0,
			end: 1000,
			pxPerMs: 1,
			dtMs: 16,
		});
		expect(next.position).toBe(1000);
		expect(next.done).toBe(true);
	});

	it("treats an already-finished sequence as done", () => {
		const next = nextScrollPosition({
			current: 1000,
			start: 0,
			end: 1000,
			pxPerMs: 0.2,
			dtMs: 16,
		});
		expect(next.done).toBe(true);
		expect(next.position).toBe(1000);
	});

	it("treats a zero-height track as nothing to play", () => {
		const next = nextScrollPosition({
			current: 0,
			start: 50,
			end: 50,
			pxPerMs: 0.2,
			dtMs: 16,
		});
		expect(next.done).toBe(true);
	});

	it("never moves backwards for negative speed or dt", () => {
		const next = nextScrollPosition({
			current: 200,
			start: 0,
			end: 1000,
			pxPerMs: -3,
			dtMs: -100,
		});
		expect(next.position).toBe(200);
		expect(next.done).toBe(false);
	});
});

describe("shouldResumeAutoplay", () => {
	it("resumes while incomplete, visible and inside the track", () => {
		expect(
			shouldResumeAutoplay({
				completed: false,
				progress: 0.4,
				pageVisible: true,
			}),
		).toBe(true);
	});

	it("never restarts once the sequence has completed", () => {
		expect(
			shouldResumeAutoplay({
				completed: true,
				progress: 0.1,
				pageVisible: true,
			}),
		).toBe(false);
	});

	it("stays paused on a hidden tab", () => {
		expect(
			shouldResumeAutoplay({
				completed: false,
				progress: 0.4,
				pageVisible: false,
			}),
		).toBe(false);
	});

	it("does not resume once the visitor has scrolled past the hero", () => {
		expect(
			shouldResumeAutoplay({
				completed: false,
				progress: 1,
				pageVisible: true,
			}),
		).toBe(false);
	});
});

describe("overlaySegments", () => {
	it("returns nothing for a degenerate frame count", () => {
		expect(overlaySegments(0)).toEqual([]);
		expect(overlaySegments(-4)).toEqual([]);
		expect(overlaySegments(Number.NaN)).toEqual([]);
	});

	it("maps the original timeline positions onto frames", () => {
		const [first, second, third] = overlaySegments(216);
		const at = (units: number) => Math.round((units / TIMELINE_UNITS) * 215);

		expect(first.text).toBe(1);
		expect(first.enterFrame).toBe(0);
		expect(first.exitStartFrame).toBe(at(1.5));
		expect(first.exitFrame).toBe(at(2.5));

		expect(second.enterFrame).toBe(at(3));
		expect(second.enterEndFrame).toBe(at(4));
		expect(second.exitStartFrame).toBe(at(5.5));
		expect(second.exitFrame).toBe(at(6.5));

		expect(third.enterFrame).toBe(at(7));
		expect(third.enterEndFrame).toBe(at(8));
		expect(third.exitStartFrame).toBe(at(9.5));
		expect(third.exitFrame).toBe(at(10.5));
	});

	it("keeps every window ordered and inside the frame range", () => {
		for (const count of [3, 12, 216, 1000]) {
			const segments = overlaySegments(count);
			for (const segment of segments) {
				expect(segment.enterFrame).toBeLessThanOrEqual(segment.enterEndFrame);
				expect(segment.enterEndFrame).toBeLessThanOrEqual(
					segment.exitStartFrame,
				);
				expect(segment.exitStartFrame).toBeLessThanOrEqual(segment.exitFrame);
				expect(segment.enterFrame).toBeGreaterThanOrEqual(0);
				expect(segment.exitFrame).toBeLessThanOrEqual(count - 1);
			}
		}
	});

	it("gives the overlays non-overlapping visibility", () => {
		const segments = overlaySegments(216);
		// Text 2 must not start entering before text 1 has left.
		expect(segments[1].enterFrame).toBeGreaterThanOrEqual(
			segments[0].exitFrame,
		);
		expect(segments[2].enterFrame).toBeGreaterThanOrEqual(
			segments[1].exitFrame,
		);
	});

	it("marks only the opening overlay as skip-enter", () => {
		const segments = overlaySegments(216);
		expect(segments.map((s) => s.skipEnter)).toEqual([true, false, false]);
	});
});

describe("overlayWordStyle", () => {
	it("starts fully visible for the skip-enter overlay", () => {
		const [first] = overlaySegments(216);
		expect(overlayWordStyle(0, first, 0, 3).opacity).toBe(1);
	});

	it("is invisible before a later overlay enters", () => {
		const [, second] = overlaySegments(216);
		expect(overlayWordStyle(second.enterFrame - 5, second, 0, 3).opacity).toBe(
			0,
		);
	});

	it("is fully visible once an overlay has finished entering", () => {
		const [, second] = overlaySegments(216);
		const style = overlayWordStyle(second.exitStartFrame - 1, second, 2, 3);
		expect(style.opacity).toBe(1);
	});

	it("is invisible again after the exit completes", () => {
		const [, second] = overlaySegments(216);
		expect(overlayWordStyle(second.exitFrame + 1, second, 0, 3).opacity).toBe(
			0,
		);
	});

	it("cascades words: later words lag earlier ones on entry", () => {
		const [, second] = overlaySegments(216);
		// Sample early in the enter window: word 0 is further along than word 2.
		const mid =
			second.enterFrame + (second.enterEndFrame - second.enterFrame) / 3;
		const firstWord = overlayWordStyle(mid, second, 0, 4);
		const lastWord = overlayWordStyle(mid, second, 3, 4);
		expect(firstWord.opacity).toBeGreaterThan(lastWord.opacity);
		expect(firstWord.blur).toBeLessThan(lastWord.blur);
	});

	it("caps the cascade so long bodies still finish entering", () => {
		const [, second] = overlaySegments(216);
		// Well past the end of the enter span the last of 40 words is visible.
		const late = second.exitStartFrame - 1;
		const style = overlayWordStyle(late, second, 39, 40);
		expect(style.opacity).toBe(1);
	});

	it("never lets a strongly lagged word fade back in during the exit", () => {
		const [, second] = overlaySegments(216);
		const samples: number[] = [];
		for (let frame = second.enterFrame; frame <= second.exitFrame; frame++) {
			samples.push(overlayWordStyle(frame, second, 39, 40).opacity);
		}
		// Each sample is at least the previous one until the exit turns it down;
		// i.e. the curve never rises after having started to fall.
		let fell = false;
		for (let i = 1; i < samples.length; i++) {
			if (samples[i] < samples[i - 1] - 0.02) fell = true;
			if (fell) {
				expect(samples[i]).toBeLessThanOrEqual(samples[i - 1] + 0.02);
			}
		}
	});

	it("keeps opacity within 0..1 at every sampled frame", () => {
		for (const segment of overlaySegments(216)) {
			for (let frame = 0; frame <= 215; frame += 7) {
				for (const [index, count] of [
					[0, 1],
					[2, 5],
					[9, 12],
				] as const) {
					const style = overlayWordStyle(frame, segment, index, count);
					expect(style.opacity).toBeGreaterThanOrEqual(0);
					expect(style.opacity).toBeLessThanOrEqual(1);
					expect(Number.isFinite(style.y)).toBe(true);
					expect(style.blur).toBeGreaterThanOrEqual(0);
				}
			}
		}
	});
});

describe("overlayBodyStyle", () => {
	it("trails its headline on entry", () => {
		const [, second] = overlaySegments(216);
		const mid =
			second.enterFrame + (second.enterEndFrame - second.enterFrame) / 3;
		const headline = overlayWordStyle(mid, second, 0, 3);
		const body = overlayBodyStyle(mid, second);
		expect(body.opacity).toBeLessThan(headline.opacity);
	});

	it("reaches fully visible once past the enter span", () => {
		const [, second] = overlaySegments(216);
		// The body trails the headline, so it completes inside the body's own
		// (slightly later) enter window — by the early part of its hold it is
		// solid.
		const hold =
			second.enterEndFrame + (second.exitStartFrame - second.enterEndFrame) / 2;
		expect(overlayBodyStyle(hold, second).opacity).toBeCloseTo(1);
	});

	it("leaves with its overlay", () => {
		const [, second] = overlaySegments(216);
		expect(overlayBodyStyle(second.exitFrame + 1, second).opacity).toBe(0);
	});
});

describe("overlayStyleForFrame", () => {
	it("returns null for an overlay that does not exist", () => {
		expect(overlayStyleForFrame(10, overlaySegments(216), 9)).toBeNull();
	});

	it("matches the un-staggered style for a visible overlay", () => {
		const segments = overlaySegments(216);
		const style = overlayStyleForFrame(
			segments[1].exitStartFrame - 1,
			segments,
			1,
		);
		expect(style?.opacity).toBe(1);
	});
});
