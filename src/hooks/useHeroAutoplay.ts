import { useCallback, useEffect, useRef } from "react";
import {
	autoplaySpeedFromSeconds,
	isScrollKey,
	MAX_FRAME_DELTA_MS,
	nextScrollPosition,
	RESUME_DELAY_MS,
	shouldResumeAutoplay,
} from "#/lib/hero-autoplay.ts";

/**
 * Auto-play for the landing-page hero.
 *
 * The hero "video" is the page's own scroll position: the GSAP ScrollTrigger
 * maps scroll progress onto both the footage frames and the overlay text, so
 * they can never drift apart. This hook advances the real scroll position
 * over time, which plays the sequence while the visitor is idle.
 *
 * User input is a seek: wheel / touch / pointer / scroll-key input pauses the
 * loop and playback resumes RESUME_DELAY_MS later from the new position —
 * unless the sequence has completed once, in which case it stays put.
 *
 * The component calls `start()` once its guards are satisfied (footage
 * ready, not admin preview, motion allowed); `start()` is idempotent.
 */
export function useHeroAutoplay({
	/** Full auto-play duration across the hero track, in seconds. */
	durationSeconds,
	/** Live ScrollTrigger bounds; re-read every frame so resizes just work. */
	getRange,
	/** False while footage loads, in admin preview, or under reduced motion. */
	enabled,
}: {
	durationSeconds: number;
	getRange: () => { start: number; end: number };
	enabled: boolean;
}) {
	const playing = useRef(false); // rAF loop is advancing scroll
	const started = useRef(false); // start() has been called for this mount
	const completed = useRef(false); // sequence reached its end once
	const resumeTimer = useRef<number | null>(null);
	const rafId = useRef<number | null>(null);
	const lastTs = useRef<number | null>(null);
	const rangeRef = useRef(getRange);
	rangeRef.current = getRange;
	const durationRef = useRef(durationSeconds);
	durationRef.current = durationSeconds;
	const enabledRef = useRef(enabled);
	enabledRef.current = enabled;

	const stopLoop = useCallback(() => {
		playing.current = false;
		if (rafId.current !== null) {
			cancelAnimationFrame(rafId.current);
			rafId.current = null;
		}
		lastTs.current = null;
	}, []);

	const step = useCallback(
		(ts: number) => {
			// Hold the sequence while the visitor has the navigation held open
			// (opened by hand or pinned) instead of scrolling underneath it.
			// The loop stays alive so playback resumes when the nav closes.
			if (document.documentElement.dataset.navHeld === "true") {
				lastTs.current = null;
				rafId.current = requestAnimationFrame(step);
				return;
			}

			const dt = lastTs.current === null ? 16 : ts - lastTs.current;
			lastTs.current = ts;

			const { start, end } = rangeRef.current();
			// Speed is recomputed from the live track span every frame, so a
			// resize or a CMS change to the duration takes effect immediately.
			const pxPerMs = autoplaySpeedFromSeconds(
				durationRef.current,
				Math.max(0, end - start),
			);
			const next = nextScrollPosition({
				current: window.scrollY,
				start,
				end,
				pxPerMs,
				dtMs: Math.min(dt, MAX_FRAME_DELTA_MS),
			});

			if (next.done) {
				completed.current = true;
				stopLoop();
				return;
			}

			// "instant" beats the html { scroll-behavior: smooth } rule, which
			// would otherwise ease every step and make playback mushy.
			window.scrollTo({ top: next.position, behavior: "instant" });
			rafId.current = requestAnimationFrame(step);
		},
		[stopLoop],
	);

	const runLoop = useCallback(() => {
		if (rafId.current === null) {
			lastTs.current = null;
			rafId.current = requestAnimationFrame(step);
		}
		playing.current = true;
	}, [step]);

	const start = useCallback(() => {
		started.current = true;
		if (!enabledRef.current || completed.current) return;
		runLoop();
	}, [runLoop]);

	const resumeIfAllowed = useCallback(() => {
		if (!started.current || !enabledRef.current || completed.current) {
			return;
		}
		const { start, end } = rangeRef.current();
		if (
			!shouldResumeAutoplay({
				completed: completed.current,
				progress: (window.scrollY - start) / Math.max(1, end - start),
				pageVisible: document.visibilityState === "visible",
			})
		) {
			return;
		}
		runLoop();
	}, [runLoop]);

	const pauseForSeek = useCallback(() => {
		if (completed.current || !started.current) return;
		if (!playing.current) return; // already paused mid-seek
		stopLoop();
		if (resumeTimer.current !== null) {
			window.clearTimeout(resumeTimer.current);
		}
		resumeTimer.current = window.setTimeout(() => {
			resumeTimer.current = null;
			resumeIfAllowed();
		}, RESUME_DELAY_MS);
	}, [stopLoop, resumeIfAllowed]);

	useEffect(() => {
		if (!enabled) {
			stopLoop();
			if (resumeTimer.current !== null) {
				window.clearTimeout(resumeTimer.current);
				resumeTimer.current = null;
			}
			return;
		}

		const onKeyDown = (e: KeyboardEvent) => {
			if (isScrollKey(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
				pauseForSeek();
			}
		};
		const onVisibility = () => {
			if (document.visibilityState === "hidden") {
				stopLoop();
			} else {
				resumeIfAllowed();
			}
		};

		// Programmatic scrollTo in the rAF step can emit a scroll event in the
		// same frame; only genuine user input should pause. The wheel/touch/
		// pointer/keydown events below never fire programmatically, so they
		// are safe to trust.
		window.addEventListener("wheel", pauseForSeek, { passive: true });
		window.addEventListener("touchstart", pauseForSeek, { passive: true });
		window.addEventListener("pointerdown", pauseForSeek, { passive: true });
		window.addEventListener("keydown", onKeyDown);
		document.addEventListener("visibilitychange", onVisibility);

		// If a mid-seek pause was in flight when guards flipped back on,
		// let the timer finish; nothing to restart here — start() drives that.
		return () => {
			window.removeEventListener("wheel", pauseForSeek);
			window.removeEventListener("touchstart", pauseForSeek);
			window.removeEventListener("pointerdown", pauseForSeek);
			window.removeEventListener("keydown", onKeyDown);
			document.removeEventListener("visibilitychange", onVisibility);
			stopLoop();
			if (resumeTimer.current !== null) {
				window.clearTimeout(resumeTimer.current);
				resumeTimer.current = null;
			}
		};
	}, [enabled, pauseForSeek, resumeIfAllowed, stopLoop]);

	return { start, pauseForSeek };
}
