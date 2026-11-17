// Pure decision helpers for the landing hero's auto-play.
//
// The hero is a "video" whose playhead is the page's own scroll position: the
// GSAP ScrollTrigger maps scroll progress onto the footage frames AND the
// overlay text, so both always stay in lockstep. Auto-play simply advances the
// real scroll position over time; user scrolling is a seek that pauses
// playback, which resumes shortly after the user goes idle.

/** A paused trackpad/momentum burst should not resume playback instantly. */
export const RESUME_DELAY_MS = 450;

/**
 * An upward scroll reads as "the visitor wants to be here / earlier", so the
 * page waits this much longer before taking the scroll position back over.
 * Every further upward movement re-arms the wait, so playback only returns
 * once the upward motion has settled.
 */
export const RESUME_DELAY_UPWARD_MS = 2000;

/** Beat the loading veil so the first frames settle before the page drifts. */
export const START_DELAY_MS = 800;

/**
 * Scroll speed: the hero track is ~5 viewport heights tall; px/ms gives
 * auto-play duration ≈ track height / speed. Derived from the CMS's
 * "Hero auto-play duration (seconds)" field: seconds → px/ms.
 */
export function autoplaySpeedFromSeconds(
	seconds: number,
	trackPx: number,
): number {
	if (!Number.isFinite(seconds) || seconds <= 0 || trackPx <= 0) {
		return 0;
	}
	return trackPx / (seconds * 1000);
}

/**
 * Time-driven players skip huge dt jumps after a background-tab nap — without
 * the clamp, returning to a hidden tab for minutes would teleport the hero.
 */
export const MAX_FRAME_DELTA_MS = 64;

/**
 * Keyboard input should only pause auto-play when it actually scrolls the
 * page (arrows / paging / space / home / end). Typing elsewhere on the page —
 * or modifier combos — leaves playback alone.
 */
export function isScrollKey(key: string): boolean {
	return (
		key === "ArrowUp" ||
		key === "ArrowDown" ||
		key === "PageUp" ||
		key === "PageDown" ||
		key === "Home" ||
		key === "End" ||
		key === " " ||
		key === "Spacebar"
	);
}

export interface OverlaySegment {
	/** Overlay number (1, 2, 3) — matches the .scroll-text-N position. */
	text: number;
	/** Playhead frame where this overlay begins to enter. */
	enterFrame: number;
	/** Playhead frame where the enter animation completes. */
	enterEndFrame: number;
	/** Playhead frame where the exit animation begins. */
	exitStartFrame: number;
	/** Playhead frame where this overlay has fully left. */
	exitFrame: number;
	/**
	 * Overlay 1 is on screen at frame 0 — the original hero showed its first
	 * text immediately, so it has no scroll-driven enter, only an exit. Its
	 * entrance animation plays once on mount instead.
	 */
	skipEnter: boolean;
}

/**
 * The original hero timeline placed five 1-unit tweens at 1.5, 3, 5.5, 7 and
 * 9.5 on an implicit 10.5-unit timeline. Those are the timings the visitor
 * already knows, so the frame-anchored model reproduces them exactly rather
 * than re-deriving thirds: each entry below is that timeline position.
 */
export const TIMELINE_UNITS = 10.5;
const T1_EXIT = [1.5, 2.5];
const T2_ENTER = [3, 4];
const T2_EXIT = [5.5, 6.5];
const T3_ENTER = [7, 8];
const T3_EXIT = [9.5, 10.5];

/**
 * The three overlay texts pair with exact frame ranges of the footage. Text 1
 * owns the opening, text 2 the middle, text 3 the closing — the same fade
 * timings the original GSAP timeline used, now anchored to frame numbers so
 * the pairing holds at any frameCount / footage duration.
 */
export function overlaySegments(frameCount: number): OverlaySegment[] {
	if (!Number.isFinite(frameCount) || frameCount <= 0) {
		return [];
	}
	const last = frameCount - 1;
	const at = (units: number) =>
		Math.min(last, Math.max(0, Math.round((units / TIMELINE_UNITS) * last)));

	return [
		{
			text: 1,
			enterFrame: 0,
			enterEndFrame: 0,
			exitStartFrame: at(T1_EXIT[0]),
			exitFrame: at(T1_EXIT[1]),
			skipEnter: true,
		},
		{
			text: 2,
			enterFrame: at(T2_ENTER[0]),
			enterEndFrame: at(T2_ENTER[1]),
			exitStartFrame: at(T2_EXIT[0]),
			exitFrame: at(T2_EXIT[1]),
			skipEnter: false,
		},
		{
			text: 3,
			enterFrame: at(T3_ENTER[0]),
			enterEndFrame: at(T3_ENTER[1]),
			exitStartFrame: at(T3_EXIT[0]),
			exitFrame: at(T3_EXIT[1]),
			skipEnter: false,
		},
	];
}

/** Fraction of an enter span used to stagger each successive word. */
export const WORD_STAGGER_FRACTION = 0.08;

/** Long bodies would push their last words past the exit; cap the cascade. */
export const WORD_STAGGER_MAX_RATIO = 0.35;

/** The supporting paragraph trails its headline by this share of the fade. */
export const BODY_ENTER_LAG = 0.18;

/**
 * Core style maths. `enterLag` / `exitLag` are fractions of the relevant span
 * that delay this element behind its segment's nominal window — that is how a
 * word cascade and the trailing paragraph are produced from one set of timings.
 *
 * Lags are clamped so the enter window always finishes before the exit window
 * starts (when the segment allows it). Without that, a strongly lagged element
 * would finish entering *during* its exit and briefly fade back in. The exit
 * lag shortens the fade window instead of extending it, so every element is
 * fully gone by its segment's exitFrame — no text outlives its footage.
 */
function styleAt(
	frame: number,
	segment: OverlaySegment,
	enterLag: number,
	exitLag: number,
): { opacity: number; y: number; blur: number } {
	const { enterFrame, enterEndFrame, exitStartFrame, exitFrame, skipEnter } =
		segment;
	const enterSpan = Math.max(1, enterEndFrame - enterFrame);
	const exitSpan = Math.max(1, exitFrame - exitStartFrame);
	const gap = Math.max(0, exitStartFrame - enterEndFrame);

	// Split the available gaps evenly so a full lag on both sides still fits.
	const maxEnterLagFrames = enterSpan * 0.5 + gap / 2;
	const maxExitLagFrames = exitSpan * 0.5 + gap / 2;
	const enterLagFrames = Math.min(
		enterSpan * Math.max(0, enterLag),
		maxEnterLagFrames,
	);
	// The exit lag may delay a fade but never extend it: keep at least one
	// frame of fade so the window below can be compressed to fit the deadline.
	const exitLagFrames = Math.min(
		exitSpan * Math.max(0, exitLag),
		maxExitLagFrames,
		Math.max(0, exitSpan - 1),
	);

	const enterStart = enterFrame + enterLagFrames;
	const exitStart = exitStartFrame + exitLagFrames;
	// Compress (never extend) the window so it ENDS at the segment's exitFrame.
	const elementExitSpan = Math.max(1, exitFrame - exitStart);

	const enterT = skipEnter ? 1 : clamp01((frame - enterStart) / enterSpan);
	const exitT = clamp01((frame - exitStart) / elementExitSpan);

	const easedEnter = 1 - (1 - enterT) ** 2; // ease-out quad
	const easedExit = exitT * exitT; // ease-in quad

	return {
		opacity: clamp01(easedEnter - easedExit),
		y: (1 - easedEnter) * 24 - easedExit * 24,
		blur: Math.max((1 - easedEnter) * 6, easedExit * 6),
	};
}

/**
 * Per-word animation style. Words inside one overlay enter in a short cascade
 * (each later word starts a little further into the enter span), which reads as
 * an animated headline rather than a block of text switching on. Exits are
 * simultaneous so a line leaves as a unit.
 */
export function overlayWordStyle(
	frame: number,
	segment: OverlaySegment,
	wordIndex: number,
	wordCount: number,
): { opacity: number; y: number; blur: number } {
	const lag =
		segment.skipEnter || wordCount <= 1
			? 0
			: Math.min(
					WORD_STAGGER_MAX_RATIO,
					WORD_STAGGER_FRACTION * (wordIndex / Math.max(1, wordCount - 1)),
				);
	return styleAt(frame, segment, lag, 0);
}

/**
 * The supporting paragraph enters after its headline and leaves a beat later,
 * so each overlay reads as headline → body rather than one static block.
 */
export function overlayBodyStyle(
	frame: number,
	segment: OverlaySegment,
): { opacity: number; y: number; blur: number } {
	return styleAt(frame, segment, BODY_ENTER_LAG, 0.12);
}

/**
 * Per-text animation style for a given playhead position, ignoring word
 * stagger. Kept for callers that render an overlay as a single unit.
 */
export function overlayStyleForFrame(
	frame: number,
	segments: ReturnType<typeof overlaySegments>,
	textIndex: number,
): { opacity: number; y: number; blur: number } | null {
	const seg = segments[textIndex];
	if (!seg) return null;
	return styleAt(frame, seg, 0, 0);
}

function clamp01(v: number): number {
	if (Number.isNaN(v)) return 0;
	return Math.min(1, Math.max(0, v));
}

/**
 * The next scroll position for one animation frame of auto-play.
 * Never moves backwards, never overshoots the end, and treats absurd dt
 * values (tab naps, GC pauses) as a single frame's worth of time.
 */
export function nextScrollPosition({
	current,
	start,
	end,
	pxPerMs,
	dtMs,
}: {
	/** Current window.scrollY. */
	current: number;
	/** ScrollTrigger start position — the hero's first frame (usually 0). */
	start: number;
	/** ScrollTrigger end position — the hero's final frame. */
	end: number;
	/** Scroll speed in pixels per millisecond (always >= 0 here). */
	pxPerMs: number;
	/** Elapsed ms since the previous step. */
	dtMs: number;
}): { position: number; done: boolean } {
	const span = Math.max(0, end - start);
	if (span === 0 || current >= end) {
		return { position: end, done: true };
	}
	const dt = Math.min(Math.max(dtMs, 0), MAX_FRAME_DELTA_MS);
	const speed = Math.max(pxPerMs, 0);
	const position = current + speed * dt;
	if (position >= end) {
		return { position: end, done: true };
	}
	return { position, done: false };
}

/**
 * Direction of a user input, as far as it can be known at the moment it
 * arrives. Wheel events carry a signed delta; keys have inherent directions;
 * a touch or pointer press gives no hint until the scroll actually moves.
 */
export type SeekDirection = "up" | "down" | "unknown";

/** Wheel and trackpad deltas above this count as deliberate movement. */
const WHEEL_UP_THRESHOLD = 0;

/**
 * Whether an interaction should wait the long upward delay before playback
 * resumes. Upward wheel/trackpad movement and upward scroll keys do; a touch
 * or pointer press knows no direction, so it gets the standard delay.
 */
export function isUpwardSeek(input: {
	deltaY?: number;
	key?: string;
}): boolean {
	if (typeof input.deltaY === "number" && input.deltaY < WHEEL_UP_THRESHOLD) {
		return true;
	}
	return (
		input.key === "ArrowUp" || input.key === "PageUp" || input.key === "Home"
	);
}

/**
 * Whether auto-play may (re)start right now. There is no completed latch:
 * once the visitor goes idle the sequence plays again from wherever the
 * scroll position currently is — that is what makes the hero behave like a
 * video that is always running "when possible". The only genuine holds are
 * the hero track bounds (progress must be inside 0..1) and tab visibility.
 */
export function shouldResumeAutoplay({
	progress,
	pageVisible,
}: {
	/** ScrollTrigger progress, 0..1. */
	progress: number;
	/** The tab is the visible one. */
	pageVisible: boolean;
}): boolean {
	return pageVisible && progress >= 0 && progress < 1;
}
