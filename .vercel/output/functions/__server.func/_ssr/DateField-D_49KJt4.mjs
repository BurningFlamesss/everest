import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button, buttonVariants } from "./button-CcyykU5Y.mjs";
import { CalendarDays, ChevronLeft, ChevronRight } from "../_libs/lucide-react.mjs";
import { addDays, formatDate, parseKey, toDateKey, todayKey } from "./format-BBWmN55e.mjs";
import { Popover, PopoverContent, PopoverTrigger } from "./popover-BTFlDfBT.mjs";
import { DayPicker } from "../_libs/react-day-picker.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DateField-D_49KJt4.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DayPicker, {
		showOutsideDays,
		className: cn("p-3", className),
		classNames: {
			months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
			month: "space-y-4",
			caption: "flex justify-center pt-1 relative items-center",
			caption_label: "text-sm font-medium",
			nav: "space-x-1 flex items-center",
			nav_button: cn(buttonVariants({ variant: "outline" }), "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"),
			nav_button_previous: "absolute left-1",
			nav_button_next: "absolute right-1",
			table: "w-full border-collapse space-y-1",
			head_row: "flex",
			head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
			row: "flex w-full mt-2",
			cell: cn("relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-secondary [&:has([aria-selected].day-outside)]:bg-secondary/60 [&:has([aria-selected].day-range-end)]:rounded-r-md", props.mode === "range" ? "[&:has(>.day-range-end)]:rounded-r-md [&:has(>.day-range-start)]:rounded-l-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md" : "[&:has([aria-selected])]:rounded-md"),
			day: cn(buttonVariants({ variant: "ghost" }), "h-8 w-8 p-0 font-normal aria-selected:opacity-100"),
			day_range_start: "day-range-start",
			day_range_end: "day-range-end",
			day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
			day_today: "bg-secondary text-secondary-foreground",
			day_outside: "day-outside text-muted-foreground aria-selected:bg-secondary/60 aria-selected:text-muted-foreground",
			day_disabled: "text-muted-foreground opacity-50",
			day_range_middle: "aria-selected:bg-secondary aria-selected:text-secondary-foreground",
			day_hidden: "invisible",
			...classNames
		},
		components: {
			IconLeft: ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, {
				className: cn("h-4 w-4", className),
				...props
			}),
			IconRight: ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, {
				className: cn("h-4 w-4", className),
				...props
			})
		},
		...props
	});
}
Calendar.displayName = "Calendar";
function DateField({ value, onChange, maxToday = false, stepper = false, className, testId }) {
	const [open, setOpen] = (0, import_react.useState)(false);
	const today = todayKey();
	const selected = value ? parseKey(value) : void 0;
	const nextDisabled = maxToday && value >= today;
	const step = (delta) => {
		const next = toDateKey(addDays(parseKey(value), delta));
		if (maxToday && next > today) return;
		onChange(next);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex items-center gap-1", className),
		children: [
			stepper && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "icon",
				className: "h-9 w-9 shrink-0",
				"aria-label": "Previous day",
				"data-testid": `${testId}-prev`,
				onClick: () => step(-1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
				open,
				onOpenChange: setOpen,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-9 min-w-[150px] justify-start gap-2 text-sm font-normal",
						"data-testid": testId,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num",
							children: value === today ? `Today · ${formatDate(value)}` : formatDate(value)
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
					align: "start",
					className: "w-auto border-hairline bg-popover p-0",
					"data-testid": `${testId}-popover`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Calendar, {
						mode: "single",
						selected,
						defaultMonth: selected,
						disabled: maxToday ? { after: /* @__PURE__ */ new Date() } : void 0,
						onSelect: (date) => {
							if (!date) return;
							onChange(toDateKey(date));
							setOpen(false);
						}
					})
				})]
			}),
			stepper && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "outline",
				size: "icon",
				className: "h-9 w-9 shrink-0",
				"aria-label": "Next day",
				disabled: nextDisabled,
				"data-testid": `${testId}-next`,
				onClick: () => step(1),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
			})
		]
	});
}
//#endregion
export { DateField };
