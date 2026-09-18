import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useMutation, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Separator } from "./separator-CW0Ij8xK.mjs";
import { todayKey } from "./format-BBWmN55e.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { ScrollArea } from "./scroll-area-Uy1QVTEG.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
import { createEvent, updateEvent } from "./communications-D6qF7rY7.mjs";
import { ImageUploader } from "./ImageUploader-DxocfbVn.mjs";
import { Switch } from "./switch-CJPnMvU4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EventFormDialog-Bb0qBFWG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EVENT_CATEGORIES = [
	{
		value: "exam",
		label: "Examination"
	},
	{
		value: "sports",
		label: "Sports"
	},
	{
		value: "cultural",
		label: "Cultural"
	},
	{
		value: "trip",
		label: "Trip"
	},
	{
		value: "competition",
		label: "Competition"
	},
	{
		value: "meeting",
		label: "Meeting"
	},
	{
		value: "holiday",
		label: "Holiday"
	},
	{
		value: "program",
		label: "Programme"
	}
];
var EVENT_STATUSES = [
	{
		value: "draft",
		label: "Draft"
	},
	{
		value: "scheduled",
		label: "Scheduled"
	},
	{
		value: "ongoing",
		label: "Ongoing"
	},
	{
		value: "completed",
		label: "Completed"
	},
	{
		value: "cancelled",
		label: "Cancelled"
	}
];
var CATEGORY_LABEL = EVENT_CATEGORIES.reduce((acc, item) => ({
	...acc,
	[item.value]: item.label
}), {});
/** Chip styling per category — small colour areas only, per the design system. */
var CATEGORY_CLASS = {
	exam: "bg-info/12 text-info",
	sports: "bg-success/12 text-success",
	cultural: "bg-accent/14 text-accent",
	trip: "bg-primary/12 text-primary",
	competition: "bg-warning/18 text-warning",
	meeting: "bg-muted text-muted-foreground",
	holiday: "bg-accent/14 text-accent",
	program: "bg-primary/12 text-primary"
};
var CATEGORY_DOT = {
	exam: "bg-info",
	sports: "bg-success",
	cultural: "bg-accent",
	trip: "bg-primary",
	competition: "bg-warning",
	meeting: "bg-muted-foreground",
	holiday: "bg-accent",
	program: "bg-primary"
};
function categoryDotClass(category) {
	return CATEGORY_DOT[category];
}
function CategoryChip({ category, className, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium", CATEGORY_CLASS[category], className),
		"data-testid": testId,
		"data-category": category,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", CATEGORY_DOT[category]) }), CATEGORY_LABEL[category]]
	});
}
function emptyForm(defaultDate) {
	return {
		title: "",
		description: "",
		category: "program",
		status: "scheduled",
		startDate: defaultDate,
		endDate: defaultDate,
		allDay: true,
		startTime: "09:00",
		endTime: "12:00",
		location: "",
		registrationRequired: false,
		capacity: void 0,
		coverImage: void 0
	};
}
function EventFormDialog({ open, onOpenChange, event, defaultDate, onSaved }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(emptyForm(defaultDate ?? todayKey()));
	(0, import_react.useEffect)(() => {
		if (!open) return;
		if (event) setForm({
			title: event.title,
			description: event.description,
			category: event.category,
			status: event.status,
			startDate: event.startDate,
			endDate: event.endDate,
			allDay: event.allDay,
			startTime: event.startTime ?? "09:00",
			endTime: event.endTime ?? "12:00",
			location: event.location,
			registrationRequired: event.registrationRequired,
			capacity: event.capacity,
			coverImage: event.coverImage
		});
		else setForm(emptyForm(defaultDate ?? todayKey()));
	}, [
		open,
		event,
		defaultDate
	]);
	const patch = (next) => setForm((current) => ({
		...current,
		...next
	}));
	const saveMutation = useMutation({
		mutationFn: async () => {
			const payload = {
				...form,
				endDate: form.endDate < form.startDate ? form.startDate : form.endDate,
				startTime: form.allDay ? void 0 : form.startTime,
				endTime: form.allDay ? void 0 : form.endTime
			};
			if (event) return updateEvent(event.id, payload, actor);
			return createEvent(payload, actor);
		},
		onSuccess: (saved) => {
			qc.invalidateQueries({ queryKey: ["events"] });
			qc.invalidateQueries({ queryKey: ["event", saved.id] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			toast.success(event ? `“${saved.title}” updated` : `“${saved.title}” added to the calendar`);
			onOpenChange(false);
			onSaved?.(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const invalid = !form.title.trim() || !form.location.trim() || !form.startDate;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] bg-popover p-0 sm:max-w-2xl",
			"data-testid": "event-form-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
					className: "border-b border-hairline px-5 py-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
						className: "font-display",
						children: event ? "Edit event" : "Schedule an event"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Events appear on the school calendar and can be featured on the public website." })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "max-h-[62vh]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-3.5 px-5 py-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-title",
									children: "Event title *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-title",
									value: form.title,
									placeholder: "e.g. Inter-house athletics meet",
									"data-testid": "event-title-input",
									onChange: (e) => patch({ title: e.target.value })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Category"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.category,
									onValueChange: (value) => patch({ category: value }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "event-category-select",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "bg-popover",
										children: EVENT_CATEGORIES.map((category) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: category.value,
											className: "text-xs",
											children: category.label
										}, category.value))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.status,
									onValueChange: (value) => patch({ status: value }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "event-status-select",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "bg-popover",
										children: EVENT_STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: status.value,
											className: "text-xs",
											children: status.label
										}, status.value))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-start-date",
									children: "Starts *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-start-date",
									type: "date",
									value: form.startDate,
									"data-testid": "event-start-date",
									onChange: (e) => patch({
										startDate: e.target.value,
										endDate: form.endDate < e.target.value ? e.target.value : form.endDate
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-end-date",
									children: "Ends"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-end-date",
									type: "date",
									value: form.endDate,
									"data-testid": "event-end-date",
									onChange: (e) => patch({ endDate: e.target.value })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground",
										children: "All-day event"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Turn off to set a start and end time"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: form.allDay,
									onCheckedChange: (checked) => patch({ allDay: checked }),
									"aria-label": "All-day event",
									"data-testid": "event-all-day-switch"
								})]
							}),
							!form.allDay && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-start-time",
									children: "Start time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-start-time",
									type: "time",
									value: form.startTime ?? "",
									"data-testid": "event-start-time",
									onChange: (e) => patch({ startTime: e.target.value })
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-end-time",
									children: "End time"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-end-time",
									type: "time",
									value: form.endTime ?? "",
									"data-testid": "event-end-time",
									onChange: (e) => patch({ endTime: e.target.value })
								})]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-location",
									children: "Venue *"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-location",
									value: form.location,
									placeholder: "e.g. Main sports ground",
									"data-testid": "event-location-input",
									onChange: (e) => patch({ location: e.target.value })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5 sm:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-description",
									children: "Description"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									id: "event-description",
									rows: 3,
									value: form.description,
									placeholder: "What is happening, who should attend and what to bring.",
									"data-testid": "event-description-input",
									onChange: (e) => patch({ description: e.target.value })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "sm:col-span-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground",
										children: "Registration required"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Track sign-ups against capacity"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: form.registrationRequired,
									onCheckedChange: (checked) => patch({ registrationRequired: checked }),
									"aria-label": "Registration required",
									"data-testid": "event-registration-switch"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "event-capacity",
									children: "Capacity"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "event-capacity",
									type: "number",
									min: 0,
									value: form.capacity ?? "",
									placeholder: "Unlimited",
									"data-testid": "event-capacity-input",
									onChange: (e) => patch({ capacity: e.target.value ? Number(e.target.value) : void 0 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
									value: form.coverImage,
									onChange: (url) => patch({ coverImage: url }),
									label: "Cover image (optional)",
									testId: "event-cover-uploader"
								})
							})
						]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
					className: "border-t border-hairline px-5 py-3.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "outline",
						"data-testid": "event-form-cancel",
						onClick: () => onOpenChange(false),
						children: "Cancel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						"data-testid": "event-form-save",
						disabled: invalid || saveMutation.isPending,
						onClick: () => saveMutation.mutate(),
						children: saveMutation.isPending ? "Saving…" : event ? "Save changes" : "Create event"
					})]
				})
			]
		})
	});
}
//#endregion
export { CategoryChip, EVENT_CATEGORIES, EVENT_STATUSES, EventFormDialog, categoryDotClass };
