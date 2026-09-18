import { __toESM } from "./_runtime.mjs";
import { require_react } from "./_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { Link, useSearch } from "./_libs/@tanstack/react-router+[...].mjs";
import { ArrowRight, BookOpen, Building2, Info } from "./_libs/lucide-react.mjs";
import { ScrollTrigger, gsapWithCSS } from "./_libs/gsap.mjs";
import { Route$54, SectionHeading, albums, useWebsitePageContent } from "./_ssr/router-B6FnglFX.mjs";
import { ResultsChart } from "./_ssr/ResultsChart-VqZpA6a5.mjs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./_ssr/dialog-ST9L4J-Q.mjs";
import { MonogramAvatar, people } from "./_ssr/MonogramAvatar-ozrFwXVY.mjs";
import { pinnedNotice } from "./_ssr/notices-C5VFH4Yw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_public-DZ_G7Xqo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PUBLIC_ADDRESS = "../../../schools/everest";
function useCanvasVideo(canvasRef, frameCount = 72) {
	const [loadedCount, setLoadedCount] = (0, import_react.useState)(0);
	const [isInitialized, setIsInitialized] = (0, import_react.useState)(false);
	const [firstFrameLoaded, setFirstFrameLoaded] = (0, import_react.useState)(false);
	const imageFolder = `${PUBLIC_ADDRESS}/landing-footage/`;
	const imagePrefix = "frame_";
	const imageExtension = ".jpeg";
	const savedImages = (0, import_react.useRef)([]);
	const loadingPromises = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const lastDrawnIndex = (0, import_react.useRef)(-1);
	const currentRequestedIndex = (0, import_react.useRef)(0);
	const padNumber = (0, import_react.useCallback)((num) => num.toString().padStart(4, "0"), []);
	const loadFrame = (0, import_react.useCallback)((index) => {
		if (loadingPromises.current.has(index)) return loadingPromises.current.get(index);
		const promise = new Promise((resolve, reject) => {
			const img = new Image();
			const filename = `${imagePrefix}${padNumber(index)}${imageExtension}`;
			img.src = `${imageFolder}${filename}`;
			img.onload = () => resolve(img);
			img.onerror = () => reject(/* @__PURE__ */ new Error(`Failed to load frame ${index}`));
		});
		loadingPromises.current.set(index, promise);
		return promise;
	}, [
		imageFolder,
		imagePrefix,
		imageExtension,
		padNumber
	]);
	const findNearestLoadedFrame = (0, import_react.useCallback)((targetIndex) => {
		for (let i = targetIndex; i >= 0; i--) {
			const img = savedImages.current[i];
			if (img && img.complete && img.naturalWidth > 0) return {
				img,
				index: i
			};
		}
		for (let i = targetIndex + 1; i < frameCount; i++) {
			const img = savedImages.current[i];
			if (img && img.complete && img.naturalWidth > 0) return {
				img,
				index: i
			};
		}
		return null;
	}, [frameCount]);
	const drawFrame = (0, import_react.useCallback)((index) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d", {
			alpha: false,
			colorSpace: "display-p3"
		});
		if (!context) return;
		const imgIndex = Math.min(frameCount - 1, Math.max(0, Math.round(index)));
		currentRequestedIndex.current = imgIndex;
		const dpr = devicePixelRatio || 1;
		const rect = canvas.getBoundingClientRect();
		const width = rect.width;
		const height = rect.height;
		if (width === 0 || height === 0) return;
		let targetImg = savedImages.current[imgIndex];
		let chosenIndex = imgIndex;
		if (!targetImg || !targetImg.complete || targetImg.naturalWidth === 0) {
			if (!loadingPromises.current.has(imgIndex + 1)) loadFrame(imgIndex + 1).then((loadedImg) => {
				savedImages.current[imgIndex] = loadedImg;
				setLoadedCount((prev) => prev + 1);
				if (Math.abs(currentRequestedIndex.current - imgIndex) <= 2) drawFrame(currentRequestedIndex.current);
			}).catch(() => {});
			const fallback = findNearestLoadedFrame(imgIndex);
			if (fallback) {
				targetImg = fallback.img;
				chosenIndex = fallback.index;
			} else return;
		}
		const needsResize = canvas.width !== width * dpr || canvas.height !== height * dpr;
		if (!needsResize && chosenIndex === lastDrawnIndex.current) return;
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
	}, [
		canvasRef,
		frameCount,
		loadFrame,
		findNearestLoadedFrame
	]);
	(0, import_react.useEffect)(() => {
		let isCancelled = false;
		const initFrames = async () => {
			try {
				const firstImg = await loadFrame(1);
				if (isCancelled) return;
				savedImages.current[0] = firstImg;
				setFirstFrameLoaded(true);
				setLoadedCount(1);
			} catch (error) {
				console.error("Failed to load first frame:", error);
			}
			const initialFrames = Math.min(30, frameCount);
			const initialPromises = [];
			for (let i = 2; i <= initialFrames; i++) {
				const promise = loadFrame(i).then((img) => {
					savedImages.current[i - 1] = img;
					return img;
				});
				initialPromises.push(promise);
			}
			try {
				await Promise.allSettled(initialPromises);
				if (isCancelled) return;
				setLoadedCount(initialFrames);
				setIsInitialized(true);
			} catch (error) {
				if (isCancelled) return;
				setIsInitialized(true);
			}
			const BATCH_SIZE = 8;
			for (let i = initialFrames + 1; i <= frameCount; i += BATCH_SIZE) {
				if (isCancelled) break;
				const batchPromises = [];
				for (let j = i; j < i + BATCH_SIZE && j <= frameCount; j++) if (!savedImages.current[j - 1]) batchPromises.push(loadFrame(j).then((img) => {
					savedImages.current[j - 1] = img;
					return img;
				}));
				if (batchPromises.length > 0) {
					await Promise.allSettled(batchPromises);
					if (isCancelled) break;
					setLoadedCount((prev) => Math.min(prev + batchPromises.length, frameCount));
				}
			}
		};
		initFrames();
		return () => {
			isCancelled = true;
		};
	}, [frameCount, loadFrame]);
	const preloadFrames = (0, import_react.useCallback)(async (startIndex, endIndex) => {
		const promises = [];
		for (let i = startIndex; i <= endIndex && i <= frameCount; i++) if (!savedImages.current[i - 1]) promises.push(loadFrame(i).then((img) => {
			savedImages.current[i - 1] = img;
			return img;
		}));
		if (promises.length > 0) {
			await Promise.allSettled(promises);
			setLoadedCount((prev) => Math.min(prev + promises.length, frameCount));
		}
	}, [frameCount, loadFrame]);
	return {
		progress: loadedCount / frameCount * 100,
		isLoading: !isInitialized || loadedCount < Math.min(12, frameCount),
		frameCount,
		drawFrame,
		preloadFrames,
		firstFrameLoaded,
		ready: firstFrameLoaded && loadedCount >= 1
	};
}
var DISMISSED_KEY = "scms.notice.dismissed";
function NoticeDialog() {
	const [isOpen, setIsOpen] = (0, import_react.useState)(false);
	const notice = pinnedNotice;
	(0, import_react.useEffect)(() => {
		const dismissed = localStorage.getItem(DISMISSED_KEY);
		const dismissedNotice = dismissed ? JSON.parse(dismissed) : null;
		if (notice && (!dismissedNotice || dismissedNotice.id !== notice.id || dismissedNotice.version !== 1)) setIsOpen(true);
	}, []);
	const handleOpenChange = (open) => {
		setIsOpen(open);
		if (!open && notice) localStorage.setItem(DISMISSED_KEY, JSON.stringify({
			id: notice.id,
			version: 1,
			dismissedAt: Date.now()
		}));
	};
	if (!isOpen || !notice) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: isOpen,
		onOpenChange: handleOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl max-h-[80vh] overflow-y-auto",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary",
					children: "Important Notice"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "mt-3 text-xl",
					children: notice.title
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
					className: "text-base mt-2",
					children: notice.summary
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 space-y-3 text-sm",
					children: [
						notice.body.map((paragraph, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-foreground",
							children: paragraph
						}, i)),
						notice.bullets && notice.bullets.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1.5 list-disc list-inside text-sm text-muted-foreground",
							children: notice.bullets.map((bullet, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: bullet }, i))
						}),
						notice.attachments && notice.attachments.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-3 flex flex-wrap gap-2",
							children: notice.attachments.map((att, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-[11px] text-muted-foreground",
								children: [
									att.name,
									" (",
									att.kind,
									", ",
									att.size,
									")"
								]
							}, i))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-4 flex items-center justify-between text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Ref: ", notice.ref] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"Issued: ",
						notice.dateAd,
						" (",
						notice.dateBs,
						")"
					] })]
				})
			]
		})
	});
}
gsapWithCSS.registerPlugin(ScrollTrigger);
function LandingPage() {
	const containerRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		if (!containerRef.current) return;
		const ctx = gsapWithCSS.context(() => {
			gsapWithCSS.fromTo(".hero-next-section", {
				yPercent: 100,
				clipPath: "polygon(5% 0%, 95% 0%, 90% 100%, 10% 100%)"
			}, {
				yPercent: 0,
				clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
				ease: "none",
				scrollTrigger: {
					trigger: containerRef.current,
					start: "20% top",
					end: "bottom top",
					scrub: true
				}
			});
		}, containerRef);
		return () => ctx.revert();
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			ref: containerRef,
			className: "relative h-[600vh]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 h-screen w-full overflow-hidden bg-black",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeroCanvas, { scrollTrackRef: containerRef }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-[5] bg-gradient-to-b from-black/40 via-transparent to-black/60" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "pointer-events-none absolute inset-0 z-10 flex lg:pl-[var(--nav-w)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative h-full w-full p-8 lg:p-16",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "scroll-text-1 absolute right-8 top-1/4 max-w-lg text-right text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:right-24",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-5xl font-bold leading-tight md:text-7xl",
										children: "A place to grow."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-lg font-medium text-white/95 md:text-xl",
										children: "Developing character, capability, and curiosity since 2050 BS."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "scroll-text-2 absolute bottom-24 left-8 max-w-xl translate-y-[20px] text-white opacity-0 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] lg:left-24",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "font-display text-5xl font-bold leading-tight md:text-7xl",
										children: "Future ready."
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-lg font-medium text-white/95 md:text-xl",
										children: "Our state-of-the-art facilities and modern curriculums empower students to thrive in an evolving world."
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "scroll-text-3 absolute inset-0 flex flex-col items-center justify-center text-center text-white opacity-0 translate-y-[20px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "max-w-3xl px-6",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "font-display text-5xl font-bold leading-tight md:text-8xl",
											children: "Everest."
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-4 text-xl font-medium text-white/95 md:text-2xl",
											children: "The summit of education."
										})]
									})
								})
							]
						})
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
				className: "hero-next-section absolute bottom-0 left-0 z-10 w-full overflow-y-auto overflow-x-hidden bg-[#FEF2F2] rounded-t-3xl min-h-[70vh] lg:h-[80vh]",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid grid-cols-1 lg:grid-cols-[6fr_5fr] mx-6 md:mx-12 lg:mx-20 pt-10 pb-16 lg:pt-20 lg:pb-0 gap-10 lg:gap-[8%]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "text-5xl md:text-6xl lg:text-8xl font-bold text-foreground",
						children: [
							"Established in purpose.",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"Contemporary in outlook."
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-base md:text-lg leading-normal mb-8 text-muted-foreground",
						children: "Everest English Boarding Higher Secondary School is a learning institution in Nepal built around a simple conviction: students thrive when expectations are clear, relationships are strong, and curiosity has room to become practice."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "border-t border-rule-soft",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-5 py-4 lg:py-5 border-b border-rule-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[11px] sm:text-xs uppercase text-muted-foreground tracking-wider",
									children: "Institution"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-sm sm:text-md font-medium text-foreground",
									children: "Everest English Boarding Higher Secondary School"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-5 py-4 lg:py-5 border-b border-rule-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[11px] sm:text-xs uppercase text-muted-foreground tracking-wider",
									children: "Learning Spaces"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-sm sm:text-md font-medium text-foreground",
									children: "Everest Building + Canon Building"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-5 py-4 lg:py-5 border-b border-rule-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[11px] sm:text-xs uppercase text-muted-foreground tracking-wider",
									children: "Streams"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-sm sm:text-md font-medium text-foreground",
									children: "Science (Computer/Biology), Management"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-2 sm:gap-5 py-4 lg:py-5 border-b border-rule-soft",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "text-[11px] sm:text-xs uppercase text-muted-foreground tracking-wider",
									children: "Labs"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "text-sm sm:text-md font-medium text-foreground",
									children: "Computer, Biology, Physics, Chemistry"
								})]
							})
						]
					})] })]
				})
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "relative z-20 bg-[#FEF2F2] px-8 py-24 pb-32",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto max-w-screen-xl",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-32",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							eyebrow: "Academic Excellence",
							title: "Board Results",
							description: "Consistent performance across all levels of examination."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 rounded-card border border-border bg-card p-6 shadow-sm sm:p-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsChart, {})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-32",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							eyebrow: "Explore Everest",
							title: "Discover the school",
							description: "Learn more about our academic programs, state-of-the-art facilities, and the institution's history."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/courses",
									className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
												className: "h-6 w-6 text-accent",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "t-eyebrow mt-6",
											children: "Academics"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground",
											children: "Courses & Programs"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3",
											children: "Explore subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
											children: ["View courses", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												className: "h-3.5 w-3.5",
												"aria-hidden": "true"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/facilities",
									className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, {
												className: "h-6 w-6 text-accent",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "t-eyebrow mt-6",
											children: "Campus"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground",
											children: "Facilities"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3",
											children: "Detailed overviews of our laboratories, libraries, spaces, and digital infrastructure across the campus."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
											children: ["Tour facilities", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												className: "h-3.5 w-3.5",
												"aria-hidden": "true"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/about",
									className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 sm:h-14 sm:w-14",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, {
												className: "h-6 w-6 text-accent",
												"aria-hidden": "true"
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "t-eyebrow mt-6",
											children: "The Institution"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground",
											children: "About Everest"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3",
											children: "Our history, guiding principles, and the structural vision that builds the foundation of our institution."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-auto pt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
											children: ["Read about us", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												className: "h-3.5 w-3.5",
												"aria-hidden": "true"
											})]
										})
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-32",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
							eyebrow: "Campus Life",
							title: "Gallery Highlights",
							description: "Moments captured around the school grounds and during major events."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
							children: albums.slice(0, 3).map((album) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/gallery",
								className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mb-6 h-[200px] w-full overflow-hidden rounded-md border border-border bg-secondary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: album.photos[0].src,
											alt: album.photos[0].alt,
											className: "h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "t-eyebrow mt-auto",
										children: [
											album.year,
											" · ",
											album.category
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground line-clamp-2",
										children: album.event
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-6 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
										children: [
											"View all ",
											album.photos.length,
											" photos",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
												className: "h-3.5 w-3.5",
												"aria-hidden": "true"
											})
										]
									})
								]
							}, album.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: "Leadership",
						title: "Our Faculty",
						description: "The educators leading our academic departments and steering the school's vision."
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3",
						children: people.filter((p) => p.leadership).slice(0, 3).map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/faculty",
							className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonogramAvatar, {
									name: person.name,
									department: person.department,
									size: "lg"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-eyebrow mt-6",
									children: person.role
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground",
									children: person.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2.5 text-[13px] leading-relaxed text-muted-foreground",
									children: person.qualification
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground",
										children: person.department
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "t-meta",
										children: ["Ext. ", person.extension]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
									children: ["View directory", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										className: "h-3.5 w-3.5",
										"aria-hidden": "true"
									})]
								})
							]
						}, person.id))
					})] })
				]
			})
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeDialog, {})] });
}
function HeroCanvas({ scrollTrackRef }) {
	const canvasRef = (0, import_react.useRef)(null);
	const { drawFrame, frameCount, isLoading, progress, ready } = useCanvasVideo(canvasRef, 216);
	(0, import_react.useEffect)(() => {
		if (ready && !isLoading) requestAnimationFrame(() => {
			const start = ScrollTrigger.getById("hero-scroll");
			const index = start ? Math.floor(start.progress * (frameCount - 1)) : 0;
			drawFrame(index);
		});
	}, [
		ready,
		isLoading,
		drawFrame,
		frameCount
	]);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		const handleResize = () => {
			const start = ScrollTrigger.getById("hero-scroll");
			if (start) drawFrame(start.progress * (frameCount - 1));
			else drawFrame(0);
		};
		addEventListener("resize", handleResize);
		const timeline = gsapWithCSS.timeline({ scrollTrigger: {
			id: "hero-scroll",
			trigger: scrollTrackRef.current,
			start: "top top",
			end: "bottom bottom",
			scrub: true,
			onUpdate: (self) => {
				const frameIndex = Math.floor(self.progress * (frameCount - 1));
				drawFrame(frameIndex);
			}
		} });
		timeline.to(".scroll-text-1", {
			opacity: 0,
			y: -20,
			duration: 1,
			ease: "power1.inOut"
		}, 1.5).to(".scroll-text-2", {
			opacity: 1,
			y: 0,
			duration: 1,
			ease: "power1.inOut"
		}, 3).to(".scroll-text-2", {
			opacity: 0,
			y: -20,
			duration: 1,
			ease: "power1.inOut"
		}, 5.5).to(".scroll-text-3", {
			opacity: 1,
			y: 0,
			duration: 1,
			ease: "power1.inOut"
		}, 7).to(".scroll-text-3", {
			opacity: 0,
			y: -20,
			duration: 1,
			ease: "power1.inOut"
		}, 9.5);
		const currentScroll = ScrollTrigger.getById("hero-scroll");
		const initialIndex = currentScroll ? Math.floor(currentScroll.progress * (frameCount - 1)) : 0;
		drawFrame(initialIndex);
		return () => {
			removeEventListener("resize", handleResize);
			ScrollTrigger.getById("hero-scroll")?.kill();
			timeline.kill();
		};
	}, [
		ready,
		drawFrame,
		scrollTrackRef,
		frameCount
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative w-full h-full bg-black",
		children: [isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "fixed inset-0 z-50 flex flex-col items-center justify-center bg-background",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-lg font-medium",
						children: "Loading Experience"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted-foreground mt-1",
						children: [Math.round(progress), "%"]
					})
				]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("canvas", {
			ref: canvasRef,
			className: "block w-full h-full object-cover filter contrast-[1.05] saturate-[1.05]"
		})]
	});
}
function Home() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$54.useLoaderData();
	useWebsitePageContent("home");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LandingPage, {});
}
//#endregion
export { Home as component };
