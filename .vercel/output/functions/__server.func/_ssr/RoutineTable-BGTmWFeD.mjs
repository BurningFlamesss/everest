import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { CalendarClock, CircleDot } from "../_libs/lucide-react.mjs";
import { Button } from "./kit-Cq_igxhQ.mjs";
import { DownloadButton, downloadOfficialPdf, minutesOfDay, nowMinutes, routineDoc, todaySchoolWeekday } from "./DownloadButton-DFu4Krfj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/RoutineTable-BGTmWFeD.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var routines = [
	{
		key: "grade-11-12-science",
		label: "Grade 11 – 12 · Science",
		shift: "Morning shift",
		room: "Science Block · Rooms 201–206",
		effectiveFrom: "Shrawan 12, 2083 BS",
		periods: [
			{
				label: "I",
				start: "06:30",
				end: "07:15"
			},
			{
				label: "II",
				start: "07:15",
				end: "08:00"
			},
			{
				label: "III",
				start: "08:00",
				end: "08:45"
			},
			{
				label: "Break",
				start: "08:45",
				end: "09:05",
				isBreak: true
			},
			{
				label: "IV",
				start: "09:05",
				end: "09:50"
			},
			{
				label: "V",
				start: "09:50",
				end: "10:35"
			},
			{
				label: "VI",
				start: "10:35",
				end: "11:20"
			}
		],
		rows: [
			{
				day: "Sunday",
				slots: [
					"Physics",
					"Chemistry",
					"Mathematics",
					"Tiffin",
					"Computer Science",
					"English",
					"Physics Practical"
				]
			},
			{
				day: "Monday",
				slots: [
					"Chemistry",
					"Mathematics",
					"Physics",
					"Tiffin",
					"Biology",
					"Nepali",
					"Chemistry Practical"
				]
			},
			{
				day: "Tuesday",
				slots: [
					"Mathematics",
					"Physics",
					"English",
					"Tiffin",
					"Chemistry",
					"Computer Science",
					"Doubt Clinic"
				]
			},
			{
				day: "Wednesday",
				slots: [
					"Physics",
					"Biology",
					"Chemistry",
					"Tiffin",
					"Mathematics",
					"English",
					"Biology Practical"
				]
			},
			{
				day: "Thursday",
				slots: [
					"Chemistry",
					"Mathematics",
					"Computer Science",
					"Tiffin",
					"Physics",
					"Nepali",
					"Project Studio"
				]
			},
			{
				day: "Friday",
				slots: [
					"Mathematics",
					"Physics",
					"Chemistry",
					"Tiffin",
					"English",
					"Club Activity",
					"Assembly & Review"
				]
			}
		]
	},
	{
		key: "grade-11-12-management",
		label: "Grade 11 – 12 · Management",
		shift: "Morning shift",
		room: "Commerce Block · Rooms 301–305",
		effectiveFrom: "Shrawan 12, 2083 BS",
		periods: [
			{
				label: "I",
				start: "06:45",
				end: "07:30"
			},
			{
				label: "II",
				start: "07:30",
				end: "08:15"
			},
			{
				label: "III",
				start: "08:15",
				end: "09:00"
			},
			{
				label: "Break",
				start: "09:00",
				end: "09:20",
				isBreak: true
			},
			{
				label: "IV",
				start: "09:20",
				end: "10:05"
			},
			{
				label: "V",
				start: "10:05",
				end: "10:50"
			},
			{
				label: "VI",
				start: "10:50",
				end: "11:35"
			}
		],
		rows: [
			{
				day: "Sunday",
				slots: [
					"Accountancy",
					"Business Studies",
					"Economics",
					"Tiffin",
					"English",
					"Business Mathematics",
					"Computer Laboratory"
				]
			},
			{
				day: "Monday",
				slots: [
					"Business Studies",
					"Accountancy",
					"Business Mathematics",
					"Tiffin",
					"Economics",
					"Nepali",
					"Case Study"
				]
			},
			{
				day: "Tuesday",
				slots: [
					"Economics",
					"Accountancy",
					"English",
					"Tiffin",
					"Business Studies",
					"Computer Science",
					"Doubt Clinic"
				]
			},
			{
				day: "Wednesday",
				slots: [
					"Accountancy",
					"Business Mathematics",
					"Business Studies",
					"Tiffin",
					"Nepali",
					"English",
					"Ledger Practicum"
				]
			},
			{
				day: "Thursday",
				slots: [
					"Business Mathematics",
					"Economics",
					"Accountancy",
					"Tiffin",
					"Computer Science",
					"English",
					"Business Simulation"
				]
			},
			{
				day: "Friday",
				slots: [
					"Accountancy",
					"Business Studies",
					"Economics",
					"Tiffin",
					"Club Activity",
					"Career Guidance",
					"Assembly & Review"
				]
			}
		]
	},
	{
		key: "grade-9-10",
		label: "Grade 9 – 10 · Secondary",
		shift: "Day shift",
		room: "Main Block · Rooms 101–108",
		effectiveFrom: "Shrawan 12, 2083 BS",
		periods: [
			{
				label: "I",
				start: "10:00",
				end: "10:45"
			},
			{
				label: "II",
				start: "10:45",
				end: "11:30"
			},
			{
				label: "III",
				start: "11:30",
				end: "12:15"
			},
			{
				label: "Lunch",
				start: "12:15",
				end: "12:50",
				isBreak: true
			},
			{
				label: "IV",
				start: "12:50",
				end: "13:35"
			},
			{
				label: "V",
				start: "13:35",
				end: "14:20"
			},
			{
				label: "VI",
				start: "14:20",
				end: "15:05"
			},
			{
				label: "VII",
				start: "15:05",
				end: "15:50"
			}
		],
		rows: [
			{
				day: "Sunday",
				slots: [
					"English",
					"Mathematics",
					"Science",
					"Lunch",
					"Nepali",
					"Social Studies",
					"Computer Science",
					"Games"
				]
			},
			{
				day: "Monday",
				slots: [
					"Mathematics",
					"Science",
					"English",
					"Lunch",
					"Optional Mathematics",
					"Nepali",
					"Health & Physical Ed.",
					"Library"
				]
			},
			{
				day: "Tuesday",
				slots: [
					"Science",
					"English",
					"Mathematics",
					"Lunch",
					"Social Studies",
					"Computer Science",
					"Nepali",
					"Science Practical"
				]
			},
			{
				day: "Wednesday",
				slots: [
					"Nepali",
					"Mathematics",
					"Science",
					"Lunch",
					"English",
					"Optional Mathematics",
					"Social Studies",
					"Art & Craft"
				]
			},
			{
				day: "Thursday",
				slots: [
					"English",
					"Science",
					"Computer Science",
					"Lunch",
					"Mathematics",
					"Nepali",
					"Social Studies",
					"Games"
				]
			},
			{
				day: "Friday",
				slots: [
					"Mathematics",
					"English",
					"Science",
					"Lunch",
					"Club Activity",
					"Career & Counselling",
					"House Meeting",
					"Assembly & Review"
				]
			}
		]
	},
	{
		key: "grade-6-8",
		label: "Grade 6 – 8 · Lower Secondary",
		shift: "Day shift",
		room: "Main Block · Rooms 011–018",
		effectiveFrom: "Shrawan 12, 2083 BS",
		periods: [
			{
				label: "I",
				start: "10:00",
				end: "10:40"
			},
			{
				label: "II",
				start: "10:40",
				end: "11:20"
			},
			{
				label: "III",
				start: "11:20",
				end: "12:00"
			},
			{
				label: "Lunch",
				start: "12:00",
				end: "12:35",
				isBreak: true
			},
			{
				label: "IV",
				start: "12:35",
				end: "13:15"
			},
			{
				label: "V",
				start: "13:15",
				end: "13:55"
			},
			{
				label: "VI",
				start: "13:55",
				end: "14:35"
			},
			{
				label: "VII",
				start: "14:35",
				end: "15:15"
			}
		],
		rows: [
			{
				day: "Sunday",
				slots: [
					"English",
					"Mathematics",
					"Science & Technology",
					"Lunch",
					"Nepali",
					"Social Studies",
					"Computer Science",
					"Games"
				]
			},
			{
				day: "Monday",
				slots: [
					"Mathematics",
					"Nepali",
					"English",
					"Lunch",
					"Science & Technology",
					"Moral Education",
					"Exploratory Track",
					"Library"
				]
			},
			{
				day: "Tuesday",
				slots: [
					"Science & Technology",
					"English",
					"Mathematics",
					"Lunch",
					"Social Studies",
					"Computer Science",
					"Nepali",
					"Junior Laboratory"
				]
			},
			{
				day: "Wednesday",
				slots: [
					"Nepali",
					"Mathematics",
					"Science & Technology",
					"Lunch",
					"English",
					"Exploratory Track",
					"Social Studies",
					"Art & Craft"
				]
			},
			{
				day: "Thursday",
				slots: [
					"English",
					"Science & Technology",
					"Computer Science",
					"Lunch",
					"Mathematics",
					"Nepali",
					"Health & Physical Ed.",
					"Games"
				]
			},
			{
				day: "Friday",
				slots: [
					"Mathematics",
					"English",
					"Social Studies",
					"Lunch",
					"Club Activity",
					"House Meeting",
					"Reading Hour",
					"Assembly & Review"
				]
			}
		]
	},
	{
		key: "grade-1-5",
		label: "Grade 1 – 5 · Primary",
		shift: "Day shift",
		room: "Early Years Wing · Rooms A1–A8",
		effectiveFrom: "Shrawan 12, 2083 BS",
		periods: [
			{
				label: "I",
				start: "10:00",
				end: "10:40"
			},
			{
				label: "II",
				start: "10:40",
				end: "11:20"
			},
			{
				label: "Snack",
				start: "11:20",
				end: "11:40",
				isBreak: true
			},
			{
				label: "III",
				start: "11:40",
				end: "12:20"
			},
			{
				label: "IV",
				start: "12:20",
				end: "13:00"
			},
			{
				label: "Lunch",
				start: "13:00",
				end: "13:35",
				isBreak: true
			},
			{
				label: "V",
				start: "13:35",
				end: "14:15"
			},
			{
				label: "VI",
				start: "14:15",
				end: "14:55"
			}
		],
		rows: [
			{
				day: "Sunday",
				slots: [
					"English",
					"Mathematics",
					"Snack",
					"Our Environment",
					"Nepali",
					"Lunch",
					"Reading Corner",
					"Music & Movement"
				]
			},
			{
				day: "Monday",
				slots: [
					"Mathematics",
					"English",
					"Snack",
					"Nepali",
					"Computer Basics",
					"Lunch",
					"Reading Intervention",
					"Games"
				]
			},
			{
				day: "Tuesday",
				slots: [
					"English",
					"Our Environment",
					"Snack",
					"Mathematics",
					"Nepali",
					"Lunch",
					"Library",
					"Art & Craft"
				]
			},
			{
				day: "Wednesday",
				slots: [
					"Nepali",
					"Mathematics",
					"Snack",
					"English",
					"Our Environment",
					"Lunch",
					"Reading Intervention",
					"Music & Movement"
				]
			},
			{
				day: "Thursday",
				slots: [
					"Mathematics",
					"English",
					"Snack",
					"Computer Basics",
					"Nepali",
					"Lunch",
					"Story Hour",
					"Games"
				]
			},
			{
				day: "Friday",
				slots: [
					"English",
					"Mathematics",
					"Snack",
					"Our Environment",
					"House Activity",
					"Lunch",
					"Show & Tell",
					"Assembly & Review"
				]
			}
		]
	}
];
var routineByKey = (key) => routines.find((r) => r.key === key);
/**
* Printed-timetable aesthetic: hairline rules, tabular monospaced times,
* sticky day column, today's row tinted, and a live current-period marker.
*/
var RoutineTable = ({ routine }) => {
	const today = todaySchoolWeekday();
	const [clock, setClock] = (0, import_react.useState)(() => nowMinutes());
	const [focusToday, setFocusToday] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const id = window.setInterval(() => setClock(nowMinutes()), 3e4);
		return () => window.clearInterval(id);
	}, []);
	const activeIndex = (0, import_react.useMemo)(() => routine.periods.findIndex((p) => clock >= minutesOfDay(p.start) && clock < minutesOfDay(p.end)), [routine.periods, clock]);
	const activePeriod = activeIndex >= 0 ? routine.periods[activeIndex] : null;
	const activeSubject = today && activeIndex >= 0 ? routine.rows.find((r) => r.day === today)?.slots[activeIndex] : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		"data-testid": "routine-panel",
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
					className: "flex flex-wrap gap-x-8 gap-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: "Shift"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 text-sm text-foreground",
							children: routine.shift
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: "Rooms"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 text-sm text-foreground",
							children: routine.room
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: "Effective from"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-mono text-sm tabular-nums text-foreground",
							children: routine.effectiveFrom
						})] })
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [today ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "ghost",
						onClick: () => setFocusToday((v) => !v),
						"data-testid": "routine-jump-today-button",
						className: "h-9 gap-2 rounded-field px-3 text-[13px] text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarClock, {
							className: "h-4 w-4",
							"aria-hidden": "true"
						}), focusToday ? "Show full week" : `Show only ${today}`]
					}) : null, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
						label: "Routine PDF",
						size: "sm",
						testId: "routine-download-pdf-button",
						onDownload: () => downloadOfficialPdf(routineDoc(routine))
					})]
				})]
			}),
			activePeriod && activeSubject ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				"data-testid": "routine-now-indicator",
				className: "mt-5 inline-flex flex-wrap items-center gap-2 rounded-full border border-accent/35 bg-accent/10 px-3 py-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDot, {
						className: "h-3.5 w-3.5 text-accent",
						"aria-hidden": "true"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px] uppercase tracking-[0.14em] text-accent",
						children: "Right now"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "text-[13px] text-foreground",
						children: [
							"Period ",
							activePeriod.label,
							" · ",
							activeSubject
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "t-meta",
						children: [
							activePeriod.start,
							"–",
							activePeriod.end
						]
					})
				]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				"data-testid": "routine-now-indicator",
				className: "t-meta mt-5",
				children: today ? "No period is running at this moment." : "Saturday is the weekly holiday — no classes today."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5 overflow-hidden rounded-card border border-border bg-card",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "rail-scroll overflow-x-auto",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						"data-testid": "routine-table",
						className: "w-full min-w-[760px] border-collapse text-left",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", {
								className: "sr-only",
								children: [routine.label, " weekly class routine"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-b border-border bg-secondary",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									scope: "col",
									className: "sticky left-0 z-[1] w-[112px] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-20 bg-card border-r border-border" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-10 bg-secondary" }),
										"Day"
									]
								}), routine.periods.map((period, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
									scope: "col",
									className: ["border-l border-border px-3 py-3 align-top", index === activeIndex ? "bg-accent/10" : ""].join(" "),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
										children: period.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-1 block font-mono text-[10px] tabular-nums text-muted-foreground",
										children: [
											period.start,
											"–",
											period.end
										]
									})]
								}, `${period.label}-${period.start}`))]
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: routine.rows.filter((row) => !focusToday || row.day === today).map((row, rowIndex) => {
								const isToday = row.day === today;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									"data-testid": `routine-row-${row.day.toLowerCase()}`,
									"data-today": isToday,
									className: ["border-b border-rule-soft last:border-b-0", isToday ? "bg-accent/[0.07]" : rowIndex % 2 === 1 ? "bg-secondary/40" : ""].join(" "),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("th", {
										scope: "row",
										className: ["sticky left-0 z-[1] px-4 py-3 text-left align-top relative"].join(" "),
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 -z-20 bg-card border-r border-border" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: ["absolute inset-0 -z-10 border-r border-transparent", isToday ? "bg-accent/10" : rowIndex % 2 === 1 ? "bg-secondary" : "bg-transparent"].join(" ") }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-[13px] font-medium text-foreground",
												children: row.day
											}),
											isToday ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 inline-block font-mono text-[10px] uppercase tracking-[0.14em] text-accent",
												children: "Today"
											}) : null
										]
									}), row.slots.map((slot, slotIndex) => {
										const isBreak = routine.periods[slotIndex]?.isBreak;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: [
												"border-l border-rule-soft px-3 py-3 align-top text-[13px]",
												isBreak ? "font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground" : "text-foreground",
												isToday && slotIndex === activeIndex ? "bg-accent/[0.14] font-medium" : ""
											].join(" "),
											children: slot
										}, `${row.day}-${slotIndex}`);
									})]
								}, row.day);
							}) })
						]
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "t-meta mt-3",
				children: "Saturday is the weekly holiday. Practical and studio periods run in the final slot without interruption."
			})
		]
	});
};
//#endregion
export { RoutineTable, routineByKey, routines };
