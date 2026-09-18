import { __toESM } from "../_runtime.mjs";
import { cva } from "../_libs/class-variance-authority+clsx.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { CalendarDays, CalendarPlus, ChevronLeft, ChevronRight, CircleCheck, CircleX, Clock, Ellipsis, Eye, LayoutList, MapPin, Pencil, Plus, Trash2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { formatDate, toDateKey, todayKey } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { FilterBar } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { deleteEvent, listEvents, setEventStatus } from "./communications-D6qF7rY7.mjs";
import { CategoryChip, EVENT_CATEGORIES, EVENT_STATUSES, EventFormDialog, categoryDotClass } from "./EventFormDialog-Bb0qBFWG.mjs";
import { Root } from "../_libs/@radix-ui/react-toggle+[...].mjs";
import { ToggleGroup as ToggleGroup$1, ToggleGroupItem as ToggleGroupItem$1 } from "../_libs/radix-ui__react-toggle-group.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events-D_pTH7c6.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var WEEKDAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri",
	"Sat",
	"Sun"
];
/**
* Density-first month grid: each day shows up to two event slivers plus an
* overflow count. Colour is limited to a small category dot per the guidelines.
*/
function MonthCalendar({ month, onMonthChange, events, selectedDate, onSelectDate }) {
	const cells = (0, import_react.useMemo)(() => {
		const year = month.getFullYear();
		const monthIndex = month.getMonth();
		const startOffset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
		const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
		const total = Math.ceil((startOffset + daysInMonth) / 7) * 7;
		return Array.from({ length: total }, (_, index) => {
			const date = new Date(year, monthIndex, index - startOffset + 1);
			return {
				key: toDateKey(date),
				day: date.getDate(),
				inMonth: date.getMonth() === monthIndex
			};
		});
	}, [month]);
	const byDay = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		cells.forEach((cell) => {
			const matches = events.filter((event) => event.startDate <= cell.key && event.endDate >= cell.key);
			if (matches.length) map.set(cell.key, matches);
		});
		return map;
	}, [cells, events]);
	const monthLabel = month.toLocaleDateString(void 0, {
		month: "long",
		year: "numeric"
	});
	const today = todayKey();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel overflow-hidden",
		"data-testid": "events-calendar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "panel-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow-label mb-0.5",
						children: "Month"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "panel-title truncate",
						"data-testid": "events-calendar-month",
						children: monthLabel
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex shrink-0 items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: "h-7 w-7",
							"aria-label": "Previous month",
							"data-testid": "events-calendar-prev",
							onClick: () => onMonthChange(new Date(month.getFullYear(), month.getMonth() - 1, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "sm",
							className: "h-7 px-2 text-xs",
							"data-testid": "events-calendar-today",
							onClick: () => {
								const now = /* @__PURE__ */ new Date();
								onMonthChange(new Date(now.getFullYear(), now.getMonth(), 1));
								onSelectDate(toDateKey(now));
							},
							children: "Today"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							size: "icon",
							className: "h-7 w-7",
							"aria-label": "Next month",
							"data-testid": "events-calendar-next",
							onClick: () => onMonthChange(new Date(month.getFullYear(), month.getMonth() + 1, 1)),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7 border-b border-hairline bg-surface-2",
				children: WEEKDAYS.map((weekday) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
					children: weekday
				}, weekday))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-7",
				children: cells.map((cell) => {
					const dayEvents = byDay.get(cell.key) ?? [];
					const isSelected = cell.key === selectedDate;
					const isToday = cell.key === today;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						"data-testid": `events-calendar-day-${cell.key}`,
						onClick: () => onSelectDate(cell.key),
						className: cn("min-h-[92px] border-b border-r border-hairline p-1.5 text-left align-top transition-colors duration-150 focus-ring", cell.inMonth ? "bg-surface-1" : "bg-surface-2/60", isSelected ? "bg-primary/[0.07]" : "hover:bg-surface-2"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "mb-1 flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("num grid h-5 w-5 place-items-center rounded-full text-[11px] font-semibold", isToday ? "bg-primary text-primary-foreground" : cell.inMonth ? "text-foreground" : "text-muted-foreground/60"),
								children: cell.day
							}), dayEvents.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num text-[10px] text-muted-foreground",
								children: dayEvents.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "block space-y-1",
							children: [dayEvents.slice(0, 2).map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1 rounded border border-hairline bg-surface-2 px-1 py-0.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 shrink-0 rounded-full", categoryDotClass(event.category)) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 truncate text-[10px] leading-4 text-foreground",
									children: event.title
								})]
							}, event.id)), dayEvents.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num block px-1 text-[10px] text-muted-foreground",
								children: [
									"+",
									dayEvents.length - 2,
									" more"
								]
							})]
						})]
					}, cell.key);
				})
			})
		]
	});
}
var toggleVariants = cva("inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-primary/12 data-[state=on]:text-primary [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border border-input bg-transparent shadow-sm hover:bg-secondary hover:text-secondary-foreground"
		},
		size: {
			default: "h-9 px-2 min-w-9",
			sm: "h-8 px-1.5 min-w-8",
			lg: "h-10 px-2.5 min-w-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Toggle = import_react.forwardRef(({ className, variant, size, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Root, {
	ref,
	className: cn(toggleVariants({
		variant,
		size,
		className
	})),
	...props
}));
Toggle.displayName = Root.displayName;
var ToggleGroupContext = import_react.createContext({
	size: "default",
	variant: "default"
});
var ToggleGroup = import_react.forwardRef(({ className, variant, size, children, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroup$1, {
	ref,
	className: cn("flex items-center justify-center gap-1", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupContext.Provider, {
		value: {
			variant,
			size
		},
		children
	})
}));
ToggleGroup.displayName = ToggleGroup$1.displayName;
var ToggleGroupItem = import_react.forwardRef(({ className, children, variant, size, ...props }, ref) => {
	const context = import_react.useContext(ToggleGroupContext);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ToggleGroupItem$1, {
		ref,
		className: cn(toggleVariants({
			variant: context.variant || variant,
			size: context.size || size
		}), className),
		...props,
		children
	});
});
ToggleGroupItem.displayName = ToggleGroupItem$1.displayName;
function whenLabel(event) {
	const range = event.startDate === event.endDate ? formatDate(event.startDate) : `${formatDate(event.startDate, { withYear: false })} – ${formatDate(event.endDate)}`;
	if (event.allDay) return `${range} · All day`;
	return `${range} · ${event.startTime ?? ""}–${event.endTime ?? ""}`;
}
function EventsPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const [search, setSearch] = (0, import_react.useState)("");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [view, setView] = (0, import_react.useState)("list");
	const [month, setMonth] = (0, import_react.useState)(() => {
		const now = /* @__PURE__ */ new Date();
		return new Date(now.getFullYear(), now.getMonth(), 1);
	});
	const [selectedDate, setSelectedDate] = (0, import_react.useState)(todayKey());
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (searchParams.new === "1") {
			setEditing(null);
			setFormOpen(true);
			navigate({
				search: (prev) => {
					const next = { ...prev };
					delete next.new;
					return next;
				},
				replace: true
			});
		}
	}, [searchParams.new, navigate]);
	const { data: events = [], isLoading, isError, refetch } = useQuery({
		queryKey: ["events", {
			search,
			category,
			status
		}],
		queryFn: () => listEvents({
			search,
			category,
			status
		})
	});
	const dayEvents = (0, import_react.useMemo)(() => events.filter((event) => event.startDate <= selectedDate && event.endDate >= selectedDate), [events, selectedDate]);
	const upcoming = (0, import_react.useMemo)(() => {
		const today = todayKey();
		return events.filter((event) => event.endDate >= today && event.status !== "cancelled").length;
	}, [events]);
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["events"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: (vars) => setEventStatus(vars.id, vars.status, actor),
		onSuccess: (event) => {
			toast.success(`“${event.title}” marked ${event.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (event) => deleteEvent(event.id, actor),
		onSuccess: () => {
			toast.success("Event removed from the calendar");
			setPendingDelete(null);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const openCreate = (date) => {
		setEditing(null);
		if (date) setSelectedDate(date);
		setFormOpen(true);
	};
	const rowMenu = (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center justify-end gap-1",
		onClick: (e) => e.stopPropagation(),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "ghost",
			size: "icon",
			className: "row-actions h-7 w-7",
			"aria-label": "Open event",
			"data-testid": `event-view-${event.id}`,
			onClick: () => navigate(`/admin/events/${event.id}`),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "h-7 w-7",
				"aria-label": "Event actions",
				"data-testid": `event-menu-${event.id}`,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-3.5 w-3.5" })
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
			align: "end",
			className: "w-48 bg-popover",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "gap-2 text-xs",
					"data-testid": `event-action-open-${event.id}`,
					onClick: () => navigate(`/admin/events/${event.id}`),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " Open"]
				}),
				can("events.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "gap-2 text-xs",
					"data-testid": `event-action-edit-${event.id}`,
					onClick: () => {
						setEditing(event);
						setFormOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
				}),
				can("events.manage") && event.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "gap-2 text-xs",
					"data-testid": `event-action-complete-${event.id}`,
					onClick: () => statusMutation.mutate({
						id: event.id,
						status: "completed"
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Mark completed"]
				}),
				can("events.manage") && event.status !== "cancelled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "gap-2 text-xs",
					"data-testid": `event-action-cancel-${event.id}`,
					onClick: () => statusMutation.mutate({
						id: event.id,
						status: "cancelled"
					}),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }), " Cancel event"]
				}),
				can("events.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
					className: "gap-2 text-xs text-destructive",
					"data-testid": `event-action-delete-${event.id}`,
					onClick: () => setPendingDelete(event),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
				})] })
			]
		})] })]
	});
	const columns = [
		{
			key: "title",
			header: "Event",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: `/admin/events/${event.id}`,
					className: "block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring",
					"data-testid": `event-link-${event.id}`,
					onClick: (e) => e.stopPropagation(),
					children: event.title
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: event.organizerName
				})]
			})
		},
		{
			key: "category",
			header: "Category",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
				category: event.category,
				testId: `event-category-${event.id}`
			})
		},
		{
			key: "when",
			header: "When",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-xs text-foreground",
				"data-testid": `event-when-${event.id}`,
				children: whenLabel(event)
			})
		},
		{
			key: "location",
			header: "Venue",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "truncate",
					children: event.location
				})]
			})
		},
		{
			key: "status",
			header: "Status",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: event.status,
				testId: `event-status-${event.id}`
			})
		},
		{
			key: "registrations",
			header: "Sign-ups",
			align: "right",
			render: (event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-xs text-muted-foreground",
				children: event.registrationRequired ? `${event.registrationCount}${event.capacity ? ` / ${event.capacity}` : ""}` : "—"
			})
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: rowMenu
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "events-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Communications",
				title: "Events",
				description: "Plan the school calendar — examinations, sports, cultural programmes, trips and meetings.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "events-count-total",
					children: [events.length, " events"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "events-count-upcoming",
					children: [upcoming, " upcoming"]
				})] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToggleGroup, {
					type: "single",
					value: view,
					onValueChange: (value) => value && setView(value),
					className: "rounded-md border border-hairline bg-surface-1 p-0.5",
					"data-testid": "events-view-toggle",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToggleGroupItem, {
						value: "list",
						className: "h-7 gap-1.5 px-2.5 text-xs",
						"data-testid": "events-view-list",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutList, { className: "h-3.5 w-3.5" }), " List"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ToggleGroupItem, {
						value: "calendar",
						className: "h-7 gap-1.5 px-2.5 text-xs",
						"data-testid": "events-view-calendar",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }), " Calendar"]
					})]
				}), can("events.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "events-new",
					onClick: () => openCreate(),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New event"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "events-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search events by title, venue or organiser…",
				filters: [{
					key: "category",
					label: "Category",
					value: category,
					options: [{
						value: "all",
						label: "All categories"
					}, ...EVENT_CATEGORIES.map((c) => ({
						value: c.value,
						label: c.label
					}))],
					onChange: setCategory,
					width: "w-[160px]"
				}, {
					key: "status",
					label: "Status",
					value: status,
					options: [{
						value: "all",
						label: "All statuses"
					}, ...EVENT_STATUSES.map((s) => ({
						value: s.value,
						label: s.label
					}))],
					onChange: setStatus,
					width: "w-[150px]"
				}],
				onReset: () => {
					setSearch("");
					setCategory("all");
					setStatus("all");
				}
			}),
			view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "events-table",
				columns,
				rows: events,
				rowId: (event) => event.id,
				rowTestId: (event) => `event-row-${event.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => void refetch(),
				onRowClick: (event) => navigate(`/admin/events/${event.id}`),
				total: events.length,
				pageSize: events.length || 1,
				footNote: `${events.length} events on the calendar`,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: CalendarDays,
					title: "No events match this view",
					description: "Adjust the category or status filter, or schedule a new event for the school calendar.",
					primaryLabel: can("events.manage") ? "New event" : void 0,
					onPrimary: () => openCreate(),
					testId: "events-empty"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonthCalendar, {
						month,
						onMonthChange: setMonth,
						events,
						selectedDate,
						onSelectDate: setSelectedDate
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					eyebrow: "Agenda",
					title: formatDate(selectedDate),
					description: `${dayEvents.length} event${dayEvents.length === 1 ? "" : "s"} on this day`,
					testId: "events-agenda",
					actions: can("events.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "events-agenda-add",
						onClick: () => openCreate(selectedDate),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "h-3.5 w-3.5" }), " Add"]
					}) : null,
					children: dayEvents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						compact: true,
						icon: CalendarDays,
						title: "Nothing scheduled",
						description: "Pick another day in the calendar, or add an event to this date.",
						primaryLabel: can("events.manage") ? "Add event" : void 0,
						onPrimary: () => openCreate(selectedDate),
						testId: "events-agenda-empty"
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2.5",
						"data-testid": "events-agenda-list",
						children: dayEvents.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "group",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `/admin/events/${event.id}`,
								"data-testid": `events-agenda-item-${event.id}`,
								className: "block rounded-lg border border-hairline bg-surface-1 px-3 py-2.5 transition-colors duration-150 hover:border-primary/35 hover:bg-surface-2 focus-ring",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "min-w-0 truncate text-sm font-medium text-foreground",
											children: event.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: event.status,
											dot: false,
											className: "shrink-0"
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num inline-flex items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "inline-flex min-w-0 items-center gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "truncate",
												children: event.location
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, { category: event.category })
									})
								]
							})
						}, event.id))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFormDialog, {
				open: formOpen,
				onOpenChange: setFormOpen,
				event: editing,
				defaultDate: selectedDate,
				onSaved: () => setEditing(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this event?",
				description: `“${pendingDelete?.title ?? ""}” will be removed from the calendar and the public website.`,
				confirmLabel: "Delete event",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => pendingDelete && deleteMutation.mutate(pendingDelete),
				testId: "event-delete-dialog"
			})
		]
	});
}
var SplitComponent = EventsPage;
//#endregion
export { SplitComponent as component };
