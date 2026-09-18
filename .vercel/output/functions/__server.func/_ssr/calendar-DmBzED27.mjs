import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { CalendarPlus, ChevronLeft, ChevronRight } from "../_libs/lucide-react.mjs";
import { AnimatePresence, useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { motion } from "../_libs/motion.mjs";
import { Button, Eyebrow, PageFrame, PageHeader, Section, WidgetCaption, duration, easing } from "./router-dKngB4cM.mjs";
import { Segmented } from "./Segmented-DUXR0cXM.mjs";
import { BS_MONTHS_EN, BS_MONTHS_NE, WEEKDAYS_NE, WEEKDAYS_SHORT, adToBs, addDaysAd, bsToAd, buildBsMonthGrid, formatAd, formatBs, toNepaliDigits } from "./nepaliDate-D2jed4L4.mjs";
import { ACADEMIC_YEAR_BS, calendarEvents, calendarIntro, countdownLabel, downloadIcs, eventKindMeta, eventsInTerm, eventsOnBs, nextOfKind, terms, today } from "./calendar-DKgR-srN.mjs";
import { RoutineTable, routines } from "./RoutineTable-BGTmWFeD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-DmBzED27.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RoutineViewer() {
	const [selectedClass, setSelectedClass] = (0, import_react.useState)("Grade 11-12 (Science)");
	const [selectedSection, setSelectedSection] = (0, import_react.useState)("A");
	const [selectedShift, setSelectedShift] = (0, import_react.useState)("Morning");
	const classes = [
		"Grade 11-12 (Science)",
		"Grade 11-12 (Management)",
		"Basic Level (Grade 6-8)"
	];
	const sections = [
		"A",
		"B",
		"C"
	];
	const shifts = ["Morning", "Day"];
	const mappedKey = {
		"Grade 11-12 (Science)": "grade-11-12-science",
		"Grade 11-12 (Management)": "grade-11-12-management",
		"Basic Level (Grade 6-8)": "basic-level"
	}[selectedClass] || "basic-level";
	const routine = (0, import_react.useMemo)(() => {
		return {
			...routines.find((r) => r.key === mappedKey) || routines[0],
			label: `${selectedClass} - Section ${selectedSection}`,
			shift: `${selectedShift} Shift`
		};
	}, [
		mappedKey,
		selectedClass,
		selectedSection,
		selectedShift
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		"data-testid": "routine-viewer",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Class routine" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "The period running right now is highlighted, in Nepal time." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-3 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5 text-sm font-medium text-foreground",
						children: ["Class", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedClass,
							onChange: (e) => setSelectedClass(e.target.value),
							className: "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
							children: classes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: c,
								className: "text-foreground bg-background",
								children: c
							}, c))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5 text-sm font-medium text-foreground",
						children: ["Section", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedSection,
							onChange: (e) => setSelectedSection(e.target.value),
							className: "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
							children: sections.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: s,
								className: "text-foreground bg-background",
								children: s
							}, s))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex flex-col gap-1.5 text-sm font-medium text-foreground",
						children: ["Shift", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							value: selectedShift,
							onChange: (e) => setSelectedShift(e.target.value),
							className: "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
							children: shifts.map((sh) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: sh,
								className: "text-foreground bg-background",
								children: sh
							}, sh))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "-mx-2 sm:-mx-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoutineTable, { routine })
			})
		]
	});
}
var KINDS = [
	"exam",
	"holiday",
	"festival",
	"event",
	"admission"
];
function Glyph({ kind }) {
	const g = eventKindMeta[kind].glyph;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "9",
		height: "9",
		viewBox: "0 0 10 10",
		"aria-hidden": "true",
		className: "shrink-0",
		children: [
			g === "square" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "1",
				y: "1",
				width: "8",
				height: "8",
				fill: "currentColor"
			}) : null,
			g === "circle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("circle", {
				cx: "5",
				cy: "5",
				r: "4",
				fill: "currentColor"
			}) : null,
			g === "diamond" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M5 0 L10 5 L5 10 L0 5 Z",
				fill: "currentColor"
			}) : null,
			g === "triangle" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				d: "M5 0 L10 9 L0 9 Z",
				fill: "currentColor"
			}) : null,
			g === "bar" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
				x: "0",
				y: "3.5",
				width: "10",
				height: "3",
				fill: "currentColor"
			}) : null
		]
	});
}
var KIND_TEXT = {
	exam: "text-brand",
	holiday: "text-accent",
	festival: "text-ink",
	event: "text-n-600",
	admission: "text-brand-deep"
};
function RouteComponent() {
	const reduced = Boolean(useReducedMotion());
	const [primary, setPrimary] = (0, import_react.useState)("bs");
	const [month, setMonth] = (0, import_react.useState)(1);
	const [year, setYear] = (0, import_react.useState)(ACADEMIC_YEAR_BS);
	const [selected, setSelected] = (0, import_react.useState)(null);
	const [focusBs, setFocusBs] = (0, import_react.useState)(ACADEMIC_YEAR_BS + "-01-01");
	const [hidden, setHidden] = (0, import_react.useState)([]);
	const cells = (0, import_react.useMemo)(() => buildBsMonthGrid(year, month), [year, month]);
	const visibleKinds = KINDS.filter((k) => !hidden.includes(k));
	const nextHoliday = nextOfKind(["holiday", "festival"]);
	const nextExam = nextOfKind(["exam"]);
	const selectedEvents = selected ? eventsOnBs(selected).filter((e) => visibleKinds.includes(e.kind)) : [];
	const monthStartAd = bsToAd(year + "-" + String(month).padStart(2, "0") + "-01") ?? "";
	const step = (deltaMonths) => {
		let m = month + deltaMonths;
		let y = year;
		if (m > 12) {
			m = 1;
			y += 1;
		}
		if (m < 1) {
			m = 12;
			y -= 1;
		}
		setMonth(m);
		setYear(y);
		setFocusBs(y + "-" + String(m).padStart(2, "0") + "-01");
	};
	const moveFocus = (days, fromBs) => {
		const ad = bsToAd(fromBs);
		if (!ad) return;
		const nextBs = adToBs(addDaysAd(ad, days));
		if (!nextBs) return;
		const [y, m] = nextBs.split("-").map(Number);
		setFocusBs(nextBs);
		if (y !== year || m !== month) {
			setYear(y);
			setMonth(m);
		}
		window.setTimeout(() => {
			document.querySelector("[data-cell=\"" + nextBs + "\"]")?.focus();
		}, 0);
	};
	const focusCell = (bs) => {
		setFocusBs(bs);
		window.setTimeout(() => {
			document.querySelector("[data-cell=\"" + bs + "\"]")?.focus();
		}, 0);
	};
	const onCellKey = (e, bs) => {
		const keys = {
			ArrowRight: 1,
			ArrowLeft: -1,
			ArrowDown: 7,
			ArrowUp: -7
		};
		if (keys[e.key] !== void 0) {
			e.preventDefault();
			moveFocus(keys[e.key], bs);
		} else if (e.key === "PageDown") {
			e.preventDefault();
			step(1);
		} else if (e.key === "PageUp") {
			e.preventDefault();
			step(-1);
		} else if (e.key === "Home") {
			e.preventDefault();
			const first = cells.find((c) => c.inMonth);
			if (first) focusCell(first.bs);
		} else if (e.key === "End") {
			e.preventDefault();
			const last = [...cells].reverse().find((c) => c.inMonth);
			if (last) focusCell(last.bs);
		}
	};
	const todayAd = today();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: calendarIntro.eyebrow,
			title: calendarIntro.statement.join(" "),
			lead: calendarIntro.support
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			testId: "calendar-intro",
			className: "!mt-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-px border-hair border-n-200 bg-n-200 sm:grid-cols-2",
				"data-testid": "calendar-counters",
				children: [{
					label: "Next holiday",
					ev: nextHoliday
				}, {
					label: "Next examination",
					ev: nextExam
				}].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-2 bg-[#FEF2F2] p-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "u-label text-n-600",
						children: c.label
					}), c.ev ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "u-display text-display-m text-ink",
						children: c.ev.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "u-label tnum text-accent",
						children: [
							countdownLabel(c.ev.date.ad),
							" ·",
							" ",
							formatBs(c.ev.date.bs),
							" BS ·",
							" ",
							formatAd(c.ev.date.ad)
						]
					})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-body-m text-n-600",
						children: "Nothing further is scheduled this session."
					})]
				}, c.label))
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			testId: "calendar-grid-section",
			className: "!mt-10",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "Both calendars are always shown; the toggle only chooses which one leads." }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-end justify-between gap-6 border-y-hair border-n-200 py-6",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
							label: "Primary calendar",
							value: primary,
							onChange: setPrimary,
							testId: "calendar-system",
							options: [{
								value: "bs",
								label: "Bikram Sambat"
							}, {
								value: "ad",
								label: "Gregorian"
							}]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => step(-1),
									"data-testid": "calendar-prev",
									"aria-label": "Previous month",
									className: "inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-n-300 text-ink hover:border-ink",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
										"aria-hidden": "true",
										size: 18
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-[220px] text-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "u-display text-display-m text-ink",
										"data-testid": "calendar-month-label",
										children: primary === "bs" ? BS_MONTHS_EN[month - 1] + " " + year : formatAd(monthStartAd).replace(/^\d+\s/, "")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "u-label text-n-600",
										children: primary === "bs" ? BS_MONTHS_NE[month - 1] + " " + toNepaliDigits(year) + " · " + formatAd(monthStartAd) : BS_MONTHS_EN[month - 1] + " " + year + " BS"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => step(1),
									"data-testid": "calendar-next",
									"aria-label": "Next month",
									className: "inline-flex h-tap w-tap items-center justify-center rounded-ui border-hair border-n-300 text-ink hover:border-ink",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
										"aria-hidden": "true",
										size: 18
									})
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						"data-testid": "calendar-year-strip",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "t-eyebrow mr-2 text-muted-foreground",
							children: "Jump to month"
						}), BS_MONTHS_EN.map((m, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => {
								setMonth(i + 1);
								setFocusBs(year + "-" + String(i + 1).padStart(2, "0") + "-01");
							},
							"aria-pressed": month === i + 1,
							"data-testid": "calendar-month-" + (i + 1),
							className: [
								"inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
								"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
								month === i + 1 ? "border-accent/40 bg-accent/12 font-medium text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
							].join(" "),
							children: m.slice(0, 3)
						}, m))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						role: "grid",
						"aria-label": "Academic calendar, " + BS_MONTHS_EN[month - 1] + " " + year + " Bikram Sambat",
						className: "mt-4 border-l-hair border-t-hair border-n-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "row",
							className: "grid grid-cols-7",
							children: WEEKDAYS_SHORT.map((d, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "columnheader",
								className: cn("u-label border-b-rule border-r-hair border-n-300 px-2 py-3 text-n-600", i === 6 && "bg-n-50"),
								children: [d, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-ne ml-1",
									children: WEEKDAYS_NE[i]
								})]
							}, d))
						}), Array.from({ length: Math.ceil(cells.length / 7) }, (_, w) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "row",
							className: "grid grid-cols-7",
							children: cells.slice(w * 7, w * 7 + 7).map((c) => {
								const evs = eventsOnBs(c.bs).filter((e) => visibleKinds.includes(e.kind));
								const isSelected = selected === c.bs;
								const isToday = c.ad === todayAd;
								const bsDay = Number(c.bs.split("-")[2]);
								const adDay = Number(c.ad.split("-")[2]);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									role: "gridcell",
									"data-cell": c.bs,
									tabIndex: focusBs === c.bs ? 0 : -1,
									"aria-selected": isSelected,
									"data-testid": "cell-" + c.bs,
									onFocus: () => setFocusBs(c.bs),
									onKeyDown: (e) => onCellKey(e, c.bs),
									onClick: () => setSelected(isSelected ? null : c.bs),
									"aria-label": formatBs(c.bs) + " Bikram Sambat, " + formatAd(c.ad) + ", " + evs.length + (evs.length === 1 ? " event" : " events"),
									className: cn("relative flex min-h-[92px] flex-col items-start gap-1 border-b-hair border-r-hair border-n-200 p-2 text-left", c.weekday === 6 && "bg-n-50", isSelected && "outline outline-rule -outline-offset-2 outline-accent"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex w-full items-baseline justify-between gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("u-display tnum text-display-m", c.inMonth ? "text-ink" : "text-n-500"),
												children: primary === "bs" ? bsDay : adDay
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "u-label tnum text-n-600",
												children: primary === "bs" ? adDay : bsDay
											})]
										}),
										isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "u-label text-accent",
											children: "Today"
										}) : null,
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex flex-wrap items-center gap-1",
											children: evs.slice(0, 4).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: KIND_TEXT[e.kind],
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { kind: e.kind })
											}, e.id))
										})
									]
								}, c.bs);
							})
						}, w))]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
						initial: false,
						children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(motion.div, {
							initial: reduced ? { opacity: 0 } : {
								height: 0,
								opacity: 0
							},
							animate: reduced ? { opacity: 1 } : {
								height: "auto",
								opacity: 1
							},
							exit: reduced ? { opacity: 0 } : {
								height: 0,
								opacity: 0
							},
							transition: {
								duration: (reduced ? 0 : duration.standard) / 1e3,
								ease: easing.state
							},
							className: "overflow-hidden",
							"data-testid": "calendar-detail",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-b-rule border-accent bg-n-50 p-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "u-label text-accent",
									children: [
										formatBs(selected),
										" BS ·",
										" ",
										formatBs(selected, { nepali: true }),
										" ·",
										" ",
										formatAd(bsToAd(selected) ?? "")
									]
								}), selectedEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-3 text-body-l text-ink",
									children: "Nothing scheduled on this date. It is a normal teaching day."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 flex flex-col",
									children: selectedEvents.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t-hair border-n-200 py-4",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: cn("u-label inline-flex items-center gap-2", KIND_TEXT[e.kind]),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { kind: e.kind }), eventKindMeta[e.kind].label]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block text-body-l text-ink",
														children: e.title
													}),
													e.titleNe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "u-ne block text-body-m text-n-600",
														children: e.titleNe
													}) : null,
													e.detail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "block text-body-s text-n-600",
														children: e.detail
													}) : null,
													e.endDate ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "u-label block text-n-600",
														children: [
															"until ",
															formatBs(e.endDate.bs),
															" BS ·",
															" ",
															formatAd(e.endDate.ad)
														]
													}) : null
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												variant: "secondary",
												onClick: () => downloadIcs([e], e.title),
												testId: "ics-" + e.id,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
													"aria-hidden": "true",
													size: 14
												}), "Add to calendar"]
											})
										]
									}, e.id))
								})]
							})
						}) : null
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-2",
						"data-testid": "calendar-legend",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "t-eyebrow mr-2 text-muted-foreground",
							children: "Show"
						}), KINDS.map((k) => {
							const on = !hidden.includes(k);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								"aria-pressed": on,
								onClick: () => setHidden((h) => h.includes(k) ? h.filter((x) => x !== k) : [...h, k]),
								"data-testid": "legend-" + k,
								className: [
									"inline-flex min-h-[36px] items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
									"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
									on ? "border-accent/40 bg-accent/12 font-medium text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground line-through opacity-50"
								].join(" "),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: KIND_TEXT[k],
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { kind: k })
								}), eventKindMeta[k].label]
							}, k);
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-6 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label mr-2 text-n-600",
							children: "Export a whole term"
						}), terms.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "secondary",
							onClick: () => downloadIcs(eventsInTerm(t.id), t.name),
							testId: "ics-term-" + t.id,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
								"aria-hidden": "true",
								size: 14
							}), t.name]
						}, t.id))]
					})
				]
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
			testId: "calendar-list",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				id: "allnotices-heading",
				className: "u-display mb-8 text-display-l text-ink",
				children: "Every date this session"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col",
				children: calendarEvents.filter((e) => visibleKinds.includes(e.kind)).map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-hair border-n-200 py-3 last:border-b-hair",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: cn("u-label inline-flex w-[152px] items-center gap-2", KIND_TEXT[e.kind]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Glyph, { kind: e.kind }), eventKindMeta[e.kind].label]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-0 flex-1 text-body-m text-ink",
							children: e.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "u-label tnum hidden md:block text-n-600",
							children: [formatBs(e.date.bs), " BS"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label tnum md:hidden text-n-600 shrink-0 text-right",
							children: formatBs(e.date.bs).split(" ").slice(0, 2).join(" ")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "u-label tnum hidden w-[168px] text-right text-n-600 md:block",
							children: formatAd(e.date.ad)
						})
					]
				}, e.id))
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
			testId: "calendar-routine",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoutineViewer, {})
		})
	] });
}
//#endregion
export { RouteComponent as component };
