import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowRight, Search, X } from "../_libs/lucide-react.mjs";
import { useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { motion } from "../_libs/motion.mjs";
import { Chip, Eyebrow, PageFrame, PageHeader, RevealUp, Route$41, TRANSPORT_EMAIL, WidgetCaption, duration, easing, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { areaAliases, busRoutes, formatNpr, popularAreas, stopArea } from "./fees-CfgHNLg2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/transportation-nqs4qWKK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function norm(s) {
	return String(s).toLowerCase().replace(/[\s\-_.]/g, "");
}
function levenshtein(a, b) {
	const m = a.length;
	const n = b.length;
	if (!m) return n;
	if (!n) return m;
	let prev = Array.from({ length: n + 1 }, (_, i) => i);
	for (let i = 1; i <= m; i++) {
		const cur = [i];
		for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
		prev = cur;
	}
	return prev[n];
}
function tokenScore(token, q) {
	const na = norm(token);
	if (!na) return 0;
	if (na === q) return 1;
	if (na.startsWith(q) || q.startsWith(na)) return .9;
	if (na.includes(q)) return .75;
	return levenshtein(na, q) <= Math.max(1, Math.floor(Math.max(na.length, q.length) * .25)) ? .6 : 0;
}
/**
* Fuzzy match over ward numbers, area names and landmarks in both English and
* Nepali. A stop's own name outranks a match on its wider area, so searching
* “Bagar” surfaces the Bagar stop rather than the first stop on its route.
* Returns [] for a genuine no-match — which is the most valuable state here.
*/
function findPickup(query) {
	const q = norm(query);
	if (q.length < 2) return [];
	const wardMatch = /^(?:ward)?(\d{1,2})$/.exec(q);
	const areaScores = /* @__PURE__ */ new Map();
	for (const a of areaAliases) {
		let best = wardMatch && a.ward === Number(wardMatch[1]) ? 1 : 0;
		for (const alias of a.aliases) best = Math.max(best, tokenScore(alias, q));
		if (best > 0) areaScores.set(a.areaId, best);
	}
	const out = [];
	for (const route of busRoutes) for (const stop of route.stops) {
		const areaId = stopArea[stop.id] ?? "";
		const own = Math.max(tokenScore(stop.name, q), tokenScore(stop.nameNe ?? "", q), tokenScore(stop.landmark, q));
		const viaArea = (areaScores.get(areaId) ?? 0) * .95;
		const score = Math.max(own, viaArea);
		if (score > 0) out.push({
			route,
			stop,
			areaId,
			score,
			matchedOnStop: own >= viaArea
		});
	}
	return out.sort((a, b) => b.score - a.score || a.stop.order - b.stop.order);
}
/** Parse an SVG `M/L` polyline into numeric points. */
function pathPoints(path) {
	const nums = path.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
	const pts = [];
	for (let i = 0; i + 1 < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
	return pts;
}
/** Position on a polyline at a 0..1 fraction of its total length. */
function pointOnPath(points, t) {
	if (points.length < 2) return {
		x: points[0]?.[0] ?? 0,
		y: points[0]?.[1] ?? 0
	};
	const segLen = points.slice(0, -1).map((_, i) => Math.hypot(points[i + 1][0] - points[i][0], points[i + 1][1] - points[i][1]));
	const total = segLen.reduce((sum, l) => sum + l, 0);
	if (total === 0) return {
		x: points[0][0],
		y: points[0][1]
	};
	let target = Math.min(1, Math.max(0, t)) * total;
	for (let i = 0; i < segLen.length; i++) {
		if (target <= segLen[i]) {
			const f = segLen[i] === 0 ? 0 : target / segLen[i];
			return {
				x: points[i][0] + (points[i + 1][0] - points[i][0]) * f,
				y: points[i][1] + (points[i + 1][1] - points[i][1]) * f
			};
		}
		target -= segLen[i];
	}
	const last = points[points.length - 1];
	return {
		x: last[0],
		y: last[1]
	};
}
/**
* SIGNATURE INTERACTION - Facilities
* Bus route and pickup finder. Search leads; the diagram only confirms. The
* no-result state is the most valuable state here, so it says so plainly and
* captures the enquiry rather than faking a match.
*/
function BusFinder() {
	const reduced = Boolean(useReducedMotion());
	const [q, setQ] = (0, import_react.useState)("");
	const [shift, setShift] = (0, import_react.useState)("Morning");
	const inputRef = (0, import_react.useRef)(null);
	const matches = (0, import_react.useMemo)(() => findPickup(q), [q]);
	const best = matches[0] ?? null;
	const searched = q.trim().length >= 2;
	const routePoints = (0, import_react.useMemo)(() => best ? pathPoints(best.route.path) : [], [best]);
	const stopPositions = (0, import_react.useMemo)(() => best ? best.route.stops.map((_, i) => pointOnPath(routePoints, routePoints.length > 1 ? i / Math.max(best.route.stops.length - 1, 1) : 0)) : [], [best, routePoints]);
	const linePath = (0, import_react.useMemo)(() => routePoints.length > 1 ? "M " + routePoints.map((p) => p[0] + " " + p[1]).join(" L ") : "", [routePoints]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		"data-testid": "bus-finder",
		id: "transport",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Bus route and pickup finder" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "Type an area, a ward number or a landmark, in English or Nepali." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 border-y border-border py-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
							htmlFor: "bus-search",
							className: "u-label text-muted-foreground",
							children: "Your area"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs font-medium uppercase tracking-wider text-muted-foreground",
								children: "Shift:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: shift,
								onChange: (e) => setShift(e.target.value),
								className: "flex h-8 max-w-[120px] rounded-md border border-input bg-transparent px-2 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Morning",
									className: "bg-background",
									children: "Morning"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "Day",
									className: "bg-background",
									children: "Day"
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3 border-b-2 border-transparent focus-within:!outline-none focus-within:!ring-0 focus-within:border-accent",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
								"aria-hidden": "true",
								size: 18,
								className: "shrink-0 text-muted-foreground"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "bus-search",
								ref: inputRef,
								type: "search",
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Lakeside, Ward 15, बागर …",
								"data-testid": "bus-search",
								className: "min-h-[52px] w-full bg-transparent text-[19px] leading-snug text-foreground placeholder:text-muted-foreground",
								style: {
									boxShadow: "none",
									outline: "none",
									border: "none"
								}
							}),
							q ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => {
									setQ("");
									inputRef.current?.focus();
								},
								"data-testid": "bus-clear",
								className: "inline-flex h-tap w-tap shrink-0 items-center justify-center text-muted-foreground hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									"aria-hidden": "true",
									size: 16
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "sr-only",
									children: "Clear the search"
								})]
							}) : null
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label mr-2 self-center text-muted-foreground",
							children: "Common areas"
						}), popularAreas.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							selected: q === a,
							onClick: () => setQ(a),
							testId: "bus-chip-" + a.toLowerCase().replace(/\s+/g, "-"),
							children: a
						}, a))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				role: "status",
				"aria-live": "polite",
				"data-testid": "bus-live",
				children: !searched ? "Type at least two characters to search for a pickup point." : matches.length === 0 ? "No pickup point found for that area." : matches.length + " pickup point" + (matches.length === 1 ? "" : "s") + " found."
			}),
			!searched ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-body-l text-muted-foreground",
				"data-testid": "bus-empty",
				children: "Three routes cover the valley from Hemja in the north-west to Birauta in the south. Start typing, or choose one of the common areas above."
			}) : matches.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 border-y border-border py-8",
				"data-testid": "bus-nomatch",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "max-w-measure text-body-l text-foreground",
					children: [
						"No bus currently stops in “",
						q.trim(),
						"”. The school adds stops when enough families ask from the same area."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "mailto:" + TRANSPORT_EMAIL + "?subject=" + encodeURIComponent("Bus stop request — " + q.trim()) + "&body=" + encodeURIComponent("Area or landmark: " + q.trim() + "\nStudent name:\nGrade:\nGuardian mobile:\n\nPlease let us know whether a stop can be added near this area."),
					"data-testid": "bus-request-stop",
					className: "u-label inline-flex w-fit min-h-tap items-center gap-2 border-b border-foreground py-2 text-foreground",
					children: ["Email the transport office about this area", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
						"aria-hidden": "true",
						size: 14
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(RevealUp, {
					className: "flex flex-col gap-6 rounded-card border border-border p-8",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-baseline justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: best.route.busNo }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "u-display text-display-m text-foreground",
									"data-testid": "bus-route-name",
									children: best.route.name
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "u-display tnum text-display-m text-foreground",
								"data-testid": "bus-fare",
								children: [formatNpr(best.route.monthlyFare), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label ml-2 text-muted-foreground",
									children: "a month"
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid gap-x-8 gap-y-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4 border-t border-border pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "u-label text-muted-foreground",
										children: "Pickup point"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
										className: "u-label text-foreground",
										"data-testid": "bus-stop-name",
										children: [best.stop.name, best.stop.nameNe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "u-ne ml-2 text-muted-foreground",
											children: best.stop.nameNe
										}) : null]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4 border-t border-border pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "u-label text-muted-foreground",
										children: "Nearest landmark"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "u-label text-foreground",
										children: best.stop.landmark
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4 border-t border-border pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "u-label text-muted-foreground",
										children: "Morning pickup"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "u-label tnum text-foreground",
										children: best.stop.pickup
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between gap-4 border-t border-border pt-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "u-label text-muted-foreground",
										children: "Afternoon drop"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "u-label tnum text-foreground",
										children: best.stop.drop
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-1 border-t border-border pt-4 mt-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "u-label text-muted-foreground",
								children: "Assigned Driver"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "u-label text-foreground",
								children: [
									"Shri ",
									best.route.driver || "Ram Bahadur",
									" — ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
										href: `tel:${best.route.phone || "+977 984XXXXXXX"}`,
										className: "text-accent underline underline-offset-4",
										children: best.route.phone || "+977 984XXXXXXX"
									})
								]
							})]
						})
					]
				}, best.stop.id),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden -my-10",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.svg, {
						viewBox: "0 0 720 200",
						className: "w-full",
						"aria-hidden": "true",
						initial: reduced ? { opacity: 0 } : { scaleX: 0 },
						animate: reduced ? { opacity: 1 } : { scaleX: 1 },
						transition: {
							duration: (reduced ? 160 : duration.routeDraw) / 1e3,
							ease: easing.entrance
						},
						style: { transformOrigin: "left center" },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
							d: linePath,
							fill: "none",
							stroke: "var(--c-gray-300)",
							strokeWidth: "2"
						}), best.route.stops.map((s, i) => {
							const { x, y } = stopPositions[i];
							const isMatch = s.id === best.stop.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("g", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
								cx: x,
								cy: y,
								r: isMatch ? 9 : 5,
								fill: isMatch ? "var(--c-yellow)" : "var(--c-white)",
								stroke: "var(--c-gray-300)",
								strokeWidth: "2"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("text", {
								x,
								y: y - 20,
								textAnchor: "middle",
								fill: isMatch ? "var(--c-black)" : "var(--c-gray-500)",
								fontSize: "13",
								letterSpacing: "1.2",
								fontFamily: "'IBM Plex Mono', monospace",
								children: s.name
							})] }, s.id);
						})]
					}, best.route.id)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "u-label text-muted-foreground",
						children: "All stops on this route"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col",
						"data-testid": "bus-stop-list",
						children: best.route.stops.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-border py-3 last:border-b " + (s.id === best.stop.id ? "border-accent" : "border-border"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label tnum w-6 text-accent",
									children: String(s.order).padStart(2, "0")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "min-w-0 flex-1 text-body-m text-foreground",
									children: [s.name, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "u-ne ml-2 text-muted-foreground",
										children: s.nameNe
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label text-muted-foreground",
									children: s.landmark
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "u-label tnum text-foreground",
									children: [
										s.pickup,
										" · ",
										s.drop
									]
								})
							]
						}, s.id))
					})]
				}),
				matches.length > 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "u-label text-muted-foreground",
						children: [
							"Other stops matching “",
							q.trim(),
							"”"
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-wrap gap-2",
						"data-testid": "bus-other-matches",
						children: matches.slice(1, 5).map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setQ(m.stop.name),
							className: "u-label rounded-pill border border-border px-3 py-2 text-muted-foreground hover:border-foreground hover:text-foreground",
							children: [
								m.stop.name,
								" · ",
								m.route.busNo
							]
						}) }, m.route.id + m.stop.id))
					})]
				}) : null
			] })
		]
	});
}
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$41.useLoaderData();
	useWebsitePageContent("transportation");
	const { routes } = Route$41.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "TRANSPORTATION",
		title: "Bus route and pickup finder",
		lead: "Three routes cover the valley from Hemja in the north-west to Birauta in the south."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-10 mb-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BusFinder, { routes })
	})] });
}
//#endregion
export { RouteComponent as component };
