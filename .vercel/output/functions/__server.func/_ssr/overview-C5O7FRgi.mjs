import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowDownRight, ArrowUpRight, CalendarPlus, ClipboardCheck, CloudUpload, Megaphone, Minus, UserPlus } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { formatDate, formatNumber, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Timeline } from "./Timeline-D_bg-_gg.mjs";
import { ListSkeleton, MetricsSkeleton, PanelSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { getOverview } from "./overview-CA_FT-A4.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/overview-C5O7FRgi.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TONE_ACCENT = {
	neutral: "text-foreground",
	accent: "text-accent",
	success: "text-success",
	warning: "text-warning"
};
var SPARK_STROKE = {
	neutral: "hsl(var(--primary))",
	accent: "hsl(var(--accent))",
	success: "hsl(var(--success))",
	warning: "hsl(var(--warning))"
};
function Sparkline({ points, stroke }) {
	if (points.length < 2) return null;
	const max = Math.max(...points);
	const min = Math.min(...points);
	const range = max - min || 1;
	const path = points.map((value, i) => {
		const x = i / (points.length - 1) * 100;
		const y = 28 - (value - min) / range * 24 - 2;
		return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(" ");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 100 28",
		preserveAspectRatio: "none",
		className: "h-7 w-full",
		"aria-hidden": true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: path,
			fill: "none",
			stroke,
			strokeWidth: "1.5",
			strokeLinecap: "round",
			vectorEffect: "non-scaling-stroke"
		})
	});
}
function MetricsStrip({ metrics }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8",
		"data-testid": "overview-metrics-strip",
		children: metrics.map((metric) => {
			const TrendIcon = metric.trend === "up" ? ArrowUpRight : metric.trend === "down" ? ArrowDownRight : Minus;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: metric.href,
				"data-testid": `metric-${metric.key}`,
				className: "group rounded-lg border border-hairline bg-surface-1 px-3 py-2.5 transition-colors duration-150 hover:border-primary/35 hover:bg-surface-2 focus-ring",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[11px] font-medium text-muted-foreground",
							children: metric.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TrendIcon, { className: cn("h-3 w-3 shrink-0", metric.trend === "up" ? "text-success" : metric.trend === "down" ? "text-destructive" : "text-muted-foreground") })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("num mt-1 font-display text-lg font-semibold leading-none", TONE_ACCENT[metric.tone]),
						children: metric.value
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 truncate text-[11px] text-muted-foreground",
						children: metric.delta
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkline, {
						points: metric.spark,
						stroke: SPARK_STROKE[metric.tone]
					})
				]
			}, metric.key);
		})
	});
}
var ATTENDANCE_STATES = [
	{
		key: "present",
		label: "Present",
		className: "bg-present"
	},
	{
		key: "late",
		label: "Late",
		className: "bg-late"
	},
	{
		key: "excused",
		label: "Excused",
		className: "bg-excused"
	},
	{
		key: "absent",
		label: "Absent",
		className: "bg-absent"
	}
];
var TONE_RING = {
	accent: "text-accent bg-accent/14",
	warning: "text-warning bg-warning/18",
	critical: "text-destructive bg-destructive/12",
	neutral: "text-muted-foreground bg-muted"
};
function OverviewPage() {
	const { user, can } = useAuth();
	const navigate = useNavigate();
	const [attendanceView, setAttendanceView] = (0, import_react.useState)("today");
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["overview"],
		queryFn: getOverview
	});
	const hour = (/* @__PURE__ */ new Date()).getHours();
	const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
	const firstName = user?.name.split(" ")[0] ?? "there";
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry: () => refetch() })
	});
	const attendance = data?.attendance;
	const totalMarked = attendance ? attendance.present + attendance.late + attendance.excused + attendance.absent : 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "overview-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			wash: true,
			eyebrow: `${formatDate(/* @__PURE__ */ new Date())} · Academic year 2025 – 2026`,
			title: `${greeting}, ${firstName}`,
			description: "Everything happening across Everest English Boarding Secondary School right now — attendance, admissions, communications and finance.",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Main Campus" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Term 2 · Week 6" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-success" }), " All systems operational"]
				})
			] }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [can("attendance.mark") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "sm",
				className: "gap-1.5",
				"data-testid": "overview-mark-attendance",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/attendance",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-3.5 w-3.5" }), " Mark attendance"]
				})
			}), can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				className: "gap-1.5",
				"data-testid": "overview-write-notice",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/notices/new",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-3.5 w-3.5" }), " Write a notice"]
				})
			})] })
		}), isLoading || !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsSkeleton, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-12",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-7",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-56" })
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetricsStrip, { metrics: data.metrics }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-7",
						title: "Attendance",
						description: `${formatDate(attendance?.date)} · ${formatNumber(totalMarked)} of ${formatNumber(totalMarked + (attendance?.unmarked ?? 0))} students marked`,
						testId: "overview-attendance-panel",
						actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex rounded-md border border-hairline bg-surface-2 p-0.5",
							children: ["today", "trend"].map((view) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								"data-testid": `attendance-view-${view}`,
								onClick: () => setAttendanceView(view),
								className: cn("rounded px-2.5 py-1 text-xs capitalize transition-colors", attendanceView === view ? "bg-surface-1 font-medium text-foreground shadow-panel" : "text-muted-foreground hover:text-foreground"),
								children: view === "today" ? "Today" : "22 days"
							}, view))
						}),
						children: attendanceView === "today" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap items-end gap-6",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "num font-display text-3xl font-semibold leading-none text-foreground",
									children: [attendance?.rate ?? 0, "%"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Present or late today"
								})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid flex-1 grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4",
									children: ATTENDANCE_STATES.map((state) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										"data-testid": `attendance-count-${state.key}`,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", state.className) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[11px] text-muted-foreground",
												children: state.label
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "num mt-0.5 text-lg font-semibold text-foreground",
											children: attendance ? attendance[state.key] : 0
										})]
									}, state.key))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-4 flex h-2.5 w-full overflow-hidden rounded-full bg-surface-2",
								children: ATTENDANCE_STATES.map((state) => {
									const value = attendance ? attendance[state.key] : 0;
									const pct = totalMarked ? value / totalMarked * 100 : 0;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: state.className,
										style: { width: `${pct}%` },
										title: `${state.label}: ${value}`
									}, state.key);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4 rounded-lg border border-hairline bg-surface-2 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground",
										children: attendance?.unmarkedClasses.length ? `${attendance.unmarkedClasses.length} registers still open` : "Every register has been submitted"
									}), can("attendance.mark") && attendance?.unmarkedClasses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/admin/attendance",
										className: "text-xs text-primary hover:underline",
										"data-testid": "overview-open-attendance",
										children: "Open register"
									}) : null]
								}), attendance?.unmarkedClasses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: attendance.unmarkedClasses.slice(0, 8).map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: `/admin/attendance?class=${cls.id}`,
										className: "rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground",
										children: cls.name
									}, cls.id))
								}) : null]
							})
						] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-[232px]",
							"data-testid": "attendance-trend-chart",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AreaChart, {
									data: data.attendanceTrend,
									margin: {
										top: 8,
										right: 4,
										bottom: 0,
										left: -18
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("defs", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("linearGradient", {
											id: "attendanceFill",
											x1: "0",
											y1: "0",
											x2: "0",
											y2: "1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "0%",
												stopColor: "hsl(var(--primary))",
												stopOpacity: .22
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("stop", {
												offset: "100%",
												stopColor: "hsl(var(--primary))",
												stopOpacity: .02
											})]
										}) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											stroke: "hsl(var(--hairline))",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "date",
											tickFormatter: (value) => value.slice(5),
											tick: {
												fontSize: 10,
												fill: "hsl(var(--muted-foreground))"
											},
											axisLine: false,
											tickLine: false,
											interval: 3
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											domain: [80, 100],
											tick: {
												fontSize: 10,
												fill: "hsl(var(--muted-foreground))"
											},
											axisLine: false,
											tickLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
											background: "hsl(var(--popover))",
											border: "1px solid hsl(var(--hairline))",
											borderRadius: 8,
											fontSize: 12
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Area, {
											type: "monotone",
											dataKey: "rate",
											name: "Attendance %",
											stroke: "hsl(var(--primary))",
											strokeWidth: 1.6,
											fill: "url(#attendanceFill)"
										})
									]
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-5",
						title: "Needs attention",
						description: "Work waiting on the school office",
						testId: "overview-pending-actions",
						bodyClassName: "p-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-hairline",
							children: data.pendingActions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: action.href,
								"data-testid": `pending-action-${action.id}`,
								className: "group flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("num grid h-8 w-8 shrink-0 place-items-center rounded-md text-xs font-semibold", TONE_RING[action.tone]),
										children: action.count
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium text-foreground",
											children: action.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-xs text-muted-foreground",
											children: action.detail
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" })
								]
							}) }, action.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "lg:col-span-7",
						title: "Enrolment & admissions",
						description: "Active students against capacity, with monthly admissions",
						testId: "overview-enrollment-panel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "h-[220px]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
								width: "100%",
								height: "100%",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
									data: data.enrollmentTrend,
									margin: {
										top: 8,
										right: 4,
										bottom: 0,
										left: -18
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
											stroke: "hsl(var(--hairline))",
											vertical: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
											dataKey: "period",
											tick: {
												fontSize: 10,
												fill: "hsl(var(--muted-foreground))"
											},
											axisLine: false,
											tickLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
											tick: {
												fontSize: 10,
												fill: "hsl(var(--muted-foreground))"
											},
											axisLine: false,
											tickLine: false
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, { contentStyle: {
											background: "hsl(var(--popover))",
											border: "1px solid hsl(var(--hairline))",
											borderRadius: 8,
											fontSize: 12
										} }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
											dataKey: "admissions",
											name: "New admissions",
											fill: "hsl(var(--accent))",
											radius: [
												3,
												3,
												0,
												0
											],
											barSize: 12
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
											type: "monotone",
											dataKey: "students",
											name: "Enrolled students",
											stroke: "hsl(var(--primary))",
											strokeWidth: 1.8,
											dot: false
										})
									]
								})
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-4 rounded-full bg-primary" }), " Enrolled students"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-4 rounded-full bg-accent" }), " New admissions"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-auto",
									children: [
										"Capacity ",
										formatNumber(data.enrollmentTrend[0]?.capacity ?? 0),
										" seats"
									]
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-5",
						title: "Upcoming events",
						testId: "overview-events-panel",
						bodyClassName: "p-2",
						actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 text-xs",
							asChild: true,
							"data-testid": "overview-all-events",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/events",
								children: "All events"
							})
						}),
						children: data.upcomingEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							compact: true,
							icon: CalendarPlus,
							title: "No events scheduled",
							description: "Add exams, sports fixtures or meetings so families can plan ahead.",
							primaryLabel: can("events.manage") ? "Schedule an event" : void 0,
							onPrimary: () => navigate("/admin/events?new=1"),
							testId: "overview-events-empty"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-hairline",
							children: data.upcomingEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `/admin/events/${event.id}`,
								className: "flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring",
								"data-testid": `overview-event-${event.id}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "grid h-9 w-9 shrink-0 place-items-center rounded-md border border-hairline bg-surface-2 text-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num block text-[13px] font-semibold leading-none text-foreground",
											children: new Date(event.startDate).getDate()
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[9px] uppercase tracking-wide text-muted-foreground",
											children: new Date(event.startDate).toLocaleDateString(void 0, { month: "short" })
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium text-foreground",
											children: event.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block truncate text-xs text-muted-foreground",
											children: [
												event.allDay ? "All day" : event.startTime,
												" · ",
												event.location
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
										value: event.category,
										label: event.category,
										dot: false
									})
								]
							}) }, event.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-7",
						title: "Recent notices",
						testId: "overview-notices-panel",
						bodyClassName: "p-2",
						actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 text-xs",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/notices",
								children: "All notices"
							})
						}),
						children: data.recentNotices.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							compact: true,
							icon: Megaphone,
							title: "Nothing published yet",
							description: "Publish your first notice to reach students, guardians or staff.",
							primaryLabel: can("notices.manage") ? "Write a notice" : void 0,
							onPrimary: () => navigate("/admin/notices/new")
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-hairline",
							children: data.recentNotices.map((notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `/admin/notices/${notice.id}`,
								className: "group flex items-start gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-surface-2 focus-ring",
								"data-testid": `overview-notice-${notice.id}`,
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full", notice.priority === "urgent" ? "bg-priority-urgent" : notice.priority === "high" ? "bg-priority-high" : notice.priority === "normal" ? "bg-priority-normal" : "bg-priority-low") }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium text-foreground",
											children: notice.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "block truncate text-xs text-muted-foreground",
											children: [
												notice.audience.map((a) => a.label).join(" · "),
												" · ",
												relativeTime(notice.publishAt)
											]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num shrink-0 text-xs text-muted-foreground",
										children: [notice.views, " views"]
									})
								]
							}) }, notice.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-5",
						title: "Recent activity",
						testId: "overview-activity-panel",
						actions: can("activity.view") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 text-xs",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/activity",
								children: "Full log"
							})
						}) : null,
						children: data.recentActivity.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 3 }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, {
							testId: "overview-activity-timeline",
							items: data.recentActivity.map((event) => ({
								id: event.id,
								title: event.summary,
								actor: event.actorName,
								at: event.createdAt,
								chip: event.resourceType.replace(/_/g, " "),
								tone: event.action === "deleted" ? "negative" : event.action === "published" || event.action === "created" ? "positive" : "neutral"
							}))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						className: "lg:col-span-6",
						title: "Recently added students",
						testId: "overview-recent-students",
						bodyClassName: "p-2",
						actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							className: "h-7 text-xs",
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/admin/students",
								children: "Register"
							})
						}),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "divide-y divide-hairline",
							children: data.recentStudents.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center gap-3 px-2 py-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
										name: `${student.firstName} ${student.lastName}`,
										subtitle: student.admissionNo,
										avatarUrl: student.avatarUrl,
										to: `/admin/students/${student.id}`,
										mono: true,
										testId: `overview-student-${student.id}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "ml-auto shrink-0 text-xs text-muted-foreground",
										children: [
											student.grade,
											" · ",
											student.section
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: student.status })
								]
							}, student.id))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
						className: "lg:col-span-6",
						title: "Cohort strength",
						description: "Enrolled students against seat capacity by grade",
						testId: "overview-grade-distribution",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-2.5",
							children: data.gradeDistribution.map((row) => {
								const pct = row.capacity ? Math.round(row.students / row.capacity * 100) : 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "w-8 shrink-0 text-xs font-medium text-muted-foreground",
											children: row.grade
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("block h-full rounded-full", pct > 92 ? "bg-accent" : "bg-primary"),
												style: { width: `${Math.min(100, pct)}%` }
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num w-16 shrink-0 text-right text-xs text-foreground",
											children: [
												row.students,
												"/",
												row.capacity
											]
										})
									]
								}, row.grade);
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 grid grid-cols-2 gap-2 border-t border-hairline pt-3 sm:grid-cols-4",
							children: [
								{
									label: "Enroll student",
									icon: UserPlus,
									to: "/admin/students?new=1",
									permission: "students.manage"
								},
								{
									label: "Import CSV",
									icon: CloudUpload,
									to: "/admin/students?import=1",
									permission: "students.manage"
								},
								{
									label: "New event",
									icon: CalendarPlus,
									to: "/admin/events?new=1",
									permission: "events.manage"
								},
								{
									label: "Website",
									icon: Megaphone,
									to: "/admin/website",
									permission: "website.view"
								}
							].filter((action) => can(action.permission)).map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: action.to,
								"data-testid": `quick-action-${action.label.toLowerCase().replace(/\s+/g, "-")}`,
								className: "flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-2 text-xs text-foreground transition-colors hover:border-primary/40 hover:bg-surface-1 focus-ring",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, { className: "h-3.5 w-3.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate",
									children: action.label
								})]
							}, action.label))
						})]
					})
				]
			})]
		})]
	});
}
var SplitComponent = OverviewPage;
//#endregion
export { SplitComponent as component };
