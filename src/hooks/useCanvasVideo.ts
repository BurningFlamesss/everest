import { useCallback, useEffect, useRef, useState } from "react";
import { PUBLIC_ADDRESS } from "#/lib/data.ts";

/** Where the scroll footage lives and how its frames are named. */
export interface CanvasVideoSource {
	/** Public URL folder; must keep its trailing slash. */
	folder: string;
	/** Frame filename prefix, e.g. "frame_". */
	prefix: string;
	/** Frame file extension with the leading dot, e.g. ".jpeg". */
	extension: string;
	/** Total number of frames, numbered 1..frameCount (4-digit zero-padded). */
	frameCount: number;
}

/** Pure string key for the generation-guarded promise map. */
const frameKey = (generation: number, index: number) =>
	`${generation}:${index}`;

export const DEFAULT_SOURCE: CanvasVideoSource = {
	folder: `${PUBLIC_ADDRESS}/landing-footage/`,
	prefix: "frame_",
	extension: ".jpeg",
	// The shipped footage is 274 frames; a cleared/invalid CMS count must
	// restore the real default, not a stale historical value.
	frameCount: 274,
};

/**
 * Normalize any accepted source input (historical bare frameCount number, a
 * partial CMS config, or a full config) into a safe, complete source.
 *
 * Malformed admin input never breaks the hero: empty folder / missing trailing
 * slash / blank extension / non-positive frame count all fall back to the
 * defaults. Pure function so it is unit-testable.
 */
export function resolveCanvasVideoSource(
	source: number | Partial<CanvasVideoSource> | undefined,
): CanvasVideoSource {
	const requested: CanvasVideoSource =
		typeof source === "number"
			? { ...DEFAULT_SOURCE, frameCount: source }
			: { ...DEFAULT_SOURCE, ...(source ?? {}) };

	const folder = requested.folder.trim() || DEFAULT_SOURCE.folder;
	const extension = requested.extension.trim() || DEFAULT_SOURCE.extension;
	const prefix = requested.prefix.trim() || DEFAULT_SOURCE.prefix;
	return {
		folder: folder.endsWith("/") ? folder : `${folder}/`,
		prefix,
		extension: extension.startsWith(".") ? extension : `.${extension}`,
		frameCount:
			Number.isFinite(requested.frameCount) && requested.frameCount > 0
				? Math.floor(requested.frameCount)
				: DEFAULT_SOURCE.frameCount,
	};
}

export function useCanvasVideo(
	canvasRef: React.RefObject<HTMLCanvasElement | null>,
	source: number | Partial<CanvasVideoSource> | undefined = DEFAULT_SOURCE,
) {
	// Accept the historical bare frameCount number as well as a full/partial
	// CMS config; malformed values fall back to the defaults per-key above.
	const {
		folder: imageFolder,
		prefix: imagePrefix,
		extension: imageExtension,
		frameCount,
	} = resolveCanvasVideoSource(source);

	const [loadedCount, setLoadedCount] = useState(0);
	const [isInitialized, setIsInitialized] = useState(false);
	const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

	const savedImages = useRef<Array<HTMLImageElement>>([]);
	const loadingPromises = useRef<Map<string, Promise<HTMLImageElement>>>(
		new Map(),
	);
	const lastDrawnIndex = useRef<number>(-1);
	const currentRequestedIndex = useRef<number>(0);

	// Generation stamp: bumped whenever the source changes. Every cache write
	// is guarded by it, so in-flight loads from the OLD source that settle
	// after a reset can never pollute the fresh cache.
	const sourceGeneration = useRef(0);

	// When the source changes (e.g. an admin repoints the hero footage in the
	// CMS and the page re-renders with new fields), the cached images and
	// in-flight promises point at stale URLs — reset them so initFrames
	// reloads from the new folder.
	const sourceKey = `${imageFolder}|${imagePrefix}|${imageExtension}|${frameCount}`;
	const lastSourceKey = useRef<string>(sourceKey);
	if (lastSourceKey.current !== sourceKey) {
		lastSourceKey.current = sourceKey;
		sourceGeneration.current += 1;
		savedImages.current = [];
		loadingPromises.current = new Map();
		lastDrawnIndex.current = -1;
		setLoadedCount(0);
		setIsInitialized(false);
		setFirstFrameLoaded(false);
	}

	const padNumber = useCallback(
		(num: number) => num.toString().padStart(4, "0"),
		[],
	);

	const loadFrame = useCallback(
		(index: number): Promise<HTMLImageElement> => {
			const generation = sourceGeneration.current;
			const key = frameKey(generation, index);
			const existing = loadingPromises.current.get(key);
			if (existing) {
				return existing;
			}

			const promise = new Promise<HTMLImageElement>((resolve, reject) => {
				const img = new Image();
				const filename = `${imagePrefix}${padNumber(index)}${imageExtension}`;
				img.src = `${imageFolder}${filename}`;

				img.onload = () => {
					// The source changed while this frame was in flight — resolve it
					// as a failure so no stale frame reaches the fresh cache.
					if (sourceGeneration.current !== generation) {
						reject(
							new Error(`Frame ${index} belongs to a replaced footage source`),
						);
						return;
					}
					resolve(img);
				};
				img.onerror = () => reject(new Error(`Failed to load frame ${index}`));
			});

			loadingPromises.current.set(key, promise);
			return promise;
		},
		[imageFolder, imagePrefix, imageExtension, padNumber],
	);

	const findNearestLoadedFrame = useCallback(
		(targetIndex: number): { img: HTMLImageElement; index: number } | null => {
			// Search backwards from targetIndex
			for (let i = targetIndex; i >= 0; i--) {
				const img = savedImages.current[i];
				if (img && img.complete && img.naturalWidth > 0) {
					return { img, index: i };
				}
			}
			// Search forwards from targetIndex
			for (let i = targetIndex + 1; i < frameCount; i++) {
				const img = savedImages.current[i];
				if (img && img.complete && img.naturalWidth > 0) {
					return { img, index: i };
				}
			}
			return null;
		},
		[frameCount],
	);

	const drawFrame = useCallback(
		(index: number) => {
			const canvas = canvasRef.current;
			if (!canvas) return;

			const context = canvas.getContext("2d", {
				alpha: false,
				colorSpace: "display-p3",
			});
			if (!context) return;

			const generationAtDraw = sourceGeneration.current;

			const imgIndex = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
			currentRequestedIndex.current = imgIndex;

			const dpr = devicePixelRatio || 1;
			const rect = canvas.getBoundingClientRect();
			const width = rect.width;
			const height = rect.height;

			if (width === 0 || height === 0) return;

			// Check if target frame is ready
			let targetImg = savedImages.current[imgIndex];
			let chosenIndex = imgIndex;

			if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
				// Trigger background load for target frame if not loading
				if (
					!loadingPromises.current.has(
						frameKey(sourceGeneration.current, imgIndex + 1),
					)
				) {
					loadFrame(imgIndex + 1)
						.then((loadedImg) => {
							if (sourceGeneration.current !== generationAtDraw) return;
							savedImages.current[imgIndex] = loadedImg;
							setLoadedCount((prev) => prev + 1);
							if (Math.abs(currentRequestedIndex.current - imgIndex) <= 2) {
								drawFrame(currentRequestedIndex.current);
							}
						})
						.catch(() => {});
				}

				// Find nearest loaded frame so canvas NEVER turns black or freezes
				const fallback = findNearestLoadedFrame(imgIndex);
				if (fallback) {
					targetImg = fallback.img;
					chosenIndex = fallback.index;
				} else {
					return;
				}
			}

			const needsResize =
				canvas.width !== width * dpr || canvas.height !== height * dpr;
			if (!needsResize && chosenIndex === lastDrawnIndex.current) {
				return;
			}

			if (needsResize) {
				canvas.width = width * dpr;
				canvas.height = height * dpr;
				context.scale(dpr, dpr);
			}

			const vW = targetImg.naturalWidth;
			const vH = targetImg.naturalHeight;
			const rW = width / vW;
			const rH = height / vH;
			const ratio = Math.max(rW, rH);

			const newW = vW * ratio;
			const newH = vH * ratio;
			const x = (width - newW) / 2;
			const y = (height - newH) / 2;

			context.imageSmoothingEnabled = true;
			context.imageSmoothingQuality = "high";

			context.drawImage(targetImg, x, y, newW, newH);
			lastDrawnIndex.current = chosenIndex;
		},
		[canvasRef, frameCount, loadFrame, findNearestLoadedFrame],
	);

	useEffect(() => {
		let isCancelled = false;
		// Stamp this effect run with the generation it loaded for; a source
		// change mid-load makes every subsequent write a no-op.
		const generation = sourceGeneration.current;

		const cacheIfCurrent = (index: number, img: HTMLImageElement) => {
			if (isCancelled || sourceGeneration.current !== generation) return;
			savedImages.current[index] = img;
		};

		const initFrames = async () => {
			// 1. Load first frame FIRST for instantaneous initial render
			try {
				const firstImg = await loadFrame(1);
				if (isCancelled || sourceGeneration.current !== generation) return;
				savedImages.current[0] = firstImg;
				setFirstFrameLoaded(true);
				setLoadedCount(1);
			} catch (error) {
				console.error("Failed to load first frame:", error);
			}

			// 2. Load initial batch (frames 2..30) in parallel for smooth start
			const initialFrames = Math.min(30, frameCount);
			const initialPromises: Promise<HTMLImageElement>[] = [];

			for (let i = 2; i <= initialFrames; i++) {
				const promise = loadFrame(i).then((img) => {
					cacheIfCurrent(i - 1, img);
					return img;
				});
				initialPromises.push(promise);
			}

			try {
				await Promise.allSettled(initialPromises);
				if (isCancelled || sourceGeneration.current !== generation) return;
				setLoadedCount(initialFrames);
				setIsInitialized(true);
			} catch (error) {
				if (isCancelled || sourceGeneration.current !== generation) return;
				setIsInitialized(true);
			}

			// 3. Preload all remaining frames (31..frameCount) in background batches
			const BATCH_SIZE = 8;
			for (let i = initialFrames + 1; i <= frameCount; i += BATCH_SIZE) {
				if (isCancelled || sourceGeneration.current !== generation) break;
				const batchPromises: Promise<HTMLImageElement>[] = [];
				for (let j = i; j < i + BATCH_SIZE && j <= frameCount; j++) {
					if (!savedImages.current[j - 1]) {
						batchPromises.push(
							loadFrame(j).then((img) => {
								cacheIfCurrent(j - 1, img);
								return img;
							}),
						);
					}
				}
				if (batchPromises.length > 0) {
					await Promise.allSettled(batchPromises);
					if (isCancelled || sourceGeneration.current !== generation) break;
					setLoadedCount((prev) =>
						Math.min(prev + batchPromises.length, frameCount),
					);
				}
			}
		};

		initFrames();

		return () => {
			isCancelled = true;
		};
	}, [frameCount, loadFrame]);

	const preloadFrames = useCallback(
		async (startIndex: number, endIndex: number) => {
			const generation = sourceGeneration.current;
			const promises: Promise<HTMLImageElement>[] = [];
			for (let i = startIndex; i <= endIndex && i <= frameCount; i++) {
				if (!savedImages.current[i - 1]) {
					promises.push(
						loadFrame(i).then((img) => {
							if (sourceGeneration.current === generation) {
								savedImages.current[i - 1] = img;
							}
							return img;
						}),
					);
				}
			}
			if (promises.length > 0) {
				await Promise.allSettled(promises);
				if (sourceGeneration.current !== generation) return;
				setLoadedCount((prev) => Math.min(prev + promises.length, frameCount));
			}
		},
		[frameCount, loadFrame],
	);

	return {
		progress: (loadedCount / frameCount) * 100,
		isLoading: !isInitialized || loadedCount < Math.min(12, frameCount),
		frameCount,
		drawFrame,
		preloadFrames,
		firstFrameLoaded,
		ready: firstFrameLoaded && loadedCount >= 1,
	};
}
