import { useCallback, useEffect, useRef } from "react";
import {
	autoplaySpeedFromSeconds,
	isScrollKey,
	isUpwardSeek,
	MAX_FRAME_DELTA_MS,
	nextScrollPosition,
	RESUME_DELAY_MS,
	RESUME_DELAY_UPWARD_MS,
	type SeekDirection,
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
 * loop and playback resumes from the new position once the visitor has been
 * idle for a moment — 450ms after a downward or directionless interaction,
 * 2s after an upward one (scrolling up reads as "let me look at this"), and
 * every upward movement re-arms that wait. There is no completed latch: the
 * sequence always plays "when possible", from wherever the visitor currently
 * is — the sidebar hold (navHeld) and the track bounds are the only stops.
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
				// The sequence reached its end — stop. When the visitor scrolls
				// back up into the track, the input handler re-arms playback
				// after the upward-seek delay; there is no completed latch.
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
		if (!enabledRef.current) return;
		runLoop();
	}, [runLoop]);

	const resumeIfAllowed = useCallback(() => {
		if (!started.current || !enabledRef.current) {
			return;
		}
		const { start, end } = rangeRef.current();
		if (
			!shouldResumeAutoplay({
				progress: (window.scrollY - start) / Math.max(1, end - start),
				pageVisible: document.visibilityState === "visible",
			})
		) {
			return;
		}
		runLoop();
	}, [runLoop]);

	const pauseForSeek = useCallback(
		(direction: SeekDirection) => {
			if (!started.current) return;
			const delay =
				direction === "up" ? RESUME_DELAY_UPWARD_MS : RESUME_DELAY_MS;
			if (!playing.current) {
				// Already paused: either a seek settle timer is pending, the loop
				// ran to its end, or the tab was hidden. An UPWARD movement must
				// still (re-)arm the long wait — that is what brings playback
				// back after the sequence completed and the visitor scrolled up
				// into the hero again, and it stops continuous upward scrolling
				// from being fought by the loop. Downward / directionless input
				// only refreshes a timer that is already pending, so trackpad
				// momentum cannot extend the short delay.
				if (direction === "up" || resumeTimer.current !== null) {
					if (resumeTimer.current !== null) {
						window.clearTimeout(resumeTimer.current);
					}
					resumeTimer.current = window.setTimeout(() => {
						resumeTimer.current = null;
						resumeIfAllowed();
					}, delay);
				}
				return;
			}
			stopLoop();
			if (resumeTimer.current !== null) {
				window.clearTimeout(resumeTimer.current);
			}
			resumeTimer.current = window.setTimeout(() => {
				resumeTimer.current = null;
				resumeIfAllowed();
			}, delay);
		},
		[stopLoop, resumeIfAllowed],
	);

	useEffect(() => {
		if (!enabled) {
			stopLoop();
			if (resumeTimer.current !== null) {
				window.clearTimeout(resumeTimer.current);
				resumeTimer.current = null;
			}
			return;
		}

		// A wheel/trackpad burst may carry several events after the visitor has
		// stopped; every upward one re-arms the long delay by pausing again —
		// pauseForSeek restarts the timer only while the loop is actually
		// running, so a settled upward position is not penalised a second time.
		const onWheel = (e: WheelEvent) =>
			pauseForSeek(isUpwardSeek({ deltaY: e.deltaY }) ? "up" : "down");
		// Touch scrolling has no delta on touchstart; touchmove carries the
		// finger position, so the direction is derived between successive moves
		// (finger moving DOWN drags the page content down = scrolling up).
		const lastTouchY = { current: null as number | null };
		const onTouchStart = (e: TouchEvent) => {
			lastTouchY.current = e.touches[0]?.clientY ?? null;
			pauseForSeek("unknown");
		};
		const onTouchMove = (e: TouchEvent) => {
			const y = e.touches[0]?.clientY;
			if (y === undefined) return;
			const dy = lastTouchY.current === null ? 0 : y - lastTouchY.current;
			lastTouchY.current = y;
			if (Math.abs(dy) >= 2) {
				pauseForSeek(dy > 0 ? "up" : "down");
			}
		};
		const onTouchOrPointer = () => pauseForSeek("unknown");
		const onKeyDown = (e: KeyboardEvent) => {
			if (isScrollKey(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
				pauseForSeek(isUpwardSeek({ key: e.key }) ? "up" : "down");
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
		window.addEventListener("wheel", onWheel, { passive: true });
		window.addEventListener("touchstart", onTouchStart, { passive: true });
		window.addEventListener("touchmove", onTouchMove, { passive: true });
		window.addEventListener("pointerdown", onTouchOrPointer, { passive: true });
		window.addEventListener("keydown", onKeyDown);
		document.addEventListener("visibilitychange", onVisibility);

		// If a mid-seek pause was in flight when guards flipped back on,
		// let the timer finish; nothing to restart here — start() drives that.
		return () => {
			window.removeEventListener("wheel", onWheel);
			window.removeEventListener("touchstart", onTouchStart);
			window.removeEventListener("touchmove", onTouchMove);
			window.removeEventListener("pointerdown", onTouchOrPointer);
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
