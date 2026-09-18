import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CalendarDays, CircleCheck, CirclePlay, CircleX, Clock, MapPin, Pencil, Trash2, Users } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Progress } from "./progress-BR51tDET.mjs";
import { formatDate, formatNumber, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { deleteEvent, getEvent, setEventStatus } from "./communications-D6qF7rY7.mjs";
import { CategoryChip, EventFormDialog } from "./EventFormDialog-Bb0qBFWG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/events._id-Rq_B4WfH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function EventDetailPage() {
	const { id = "" } = useParams();
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const { data: event, isLoading } = useQuery({
		queryKey: ["event", id],
		queryFn: () => getEvent(id),
		enabled: Boolean(id)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["events"] });
		qc.invalidateQueries({ queryKey: ["event", id] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: (status) => setEventStatus(id, status, actor),
		onSuccess: (updated) => {
			toast.success(`“${updated.title}” marked ${updated.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: () => deleteEvent(id, actor),
		onSuccess: () => {
			toast.success("Event removed from the calendar");
			invalidate();
			navigate("/admin/events");
		},
		onError: (error) => toast.error(error.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!event) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		"data-testid": "event-not-found",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: CalendarDays,
			title: "That event no longer exists",
			description: "It may have been deleted. Return to the calendar to see everything that is scheduled.",
			primaryLabel: "Back to events",
			onPrimary: () => navigate("/admin/events"),
			testId: "event-not-found-empty"
		})
	});
	const fill = event.capacity ? Math.min(100, Math.round(event.registrationCount / event.capacity * 100)) : 0;
	const totalParticipants = event.participants.reduce((sum, group) => sum + group.count, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "event-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Event",
				title: event.title,
				description: event.description,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, {
						category: event.category,
						testId: "event-detail-category"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: event.status,
						testId: "event-detail-status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num inline-flex items-center gap-1.5",
						"data-testid": "event-detail-when",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3 w-3" }), event.startDate === event.endDate ? formatDate(event.startDate) : `${formatDate(event.startDate, { withYear: false })} – ${formatDate(event.endDate)}`]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num inline-flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3 w-3" }), event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1.5",
						"data-testid": "event-detail-location",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3 w-3" }),
							" ",
							event.location
						]
					})
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/events",
							"data-testid": "event-detail-back",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All events"]
						})
					}),
					can("events.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "event-detail-edit",
						onClick: () => setEditOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
					}),
					can("events.manage") && event.status !== "ongoing" && event.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						disabled: statusMutation.isPending,
						"data-testid": "event-detail-start",
						onClick: () => statusMutation.mutate("ongoing"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CirclePlay, { className: "h-3.5 w-3.5" }), " Mark ongoing"]
					}),
					can("events.manage") && event.status !== "completed" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						disabled: statusMutation.isPending,
						"data-testid": "event-detail-complete",
						onClick: () => statusMutation.mutate("completed"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5" }), " Mark completed"]
					}),
					can("events.manage") && event.status !== "cancelled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5 text-destructive",
						disabled: statusMutation.isPending,
						"data-testid": "event-detail-cancel",
						onClick: () => statusMutation.mutate("cancelled"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5" }), " Cancel"]
					}),
					can("events.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8 text-destructive",
						"aria-label": "Delete event",
						"data-testid": "event-detail-delete",
						onClick: () => setConfirmDelete(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [
						event.coverImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: event.coverImage,
							alt: "",
							className: "aspect-[21/9] w-full rounded-xl border border-hairline object-cover",
							"data-testid": "event-detail-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "About this event",
							testId: "event-detail-about",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted-foreground",
								"data-testid": "event-detail-description",
								children: event.description || "No description was added for this event."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Participants",
							description: `${formatNumber(totalParticipants)} people expected`,
							testId: "event-detail-participants",
							children: event.participants.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								compact: true,
								title: "No participant groups assigned",
								description: "Add student groups so attendance can be taken against this event."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-hairline",
								children: event.participants.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0",
									"data-testid": `event-participant-${group.label}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex min-w-0 items-center gap-2 text-sm text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate",
											children: group.label
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "num text-sm font-medium text-foreground",
										children: formatNumber(group.count)
									})]
								}, group.label))
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Details",
						testId: "event-detail-meta",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Organiser",
									value: event.organizerName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Category",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CategoryChip, { category: event.category })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Starts",
									value: formatDate(event.startDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Ends",
									value: formatDate(event.endDate)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Timing",
									value: event.allDay ? "All day" : `${event.startTime ?? ""}–${event.endTime ?? ""}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Venue",
									value: event.location
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Created",
									value: relativeTime(event.createdAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Updated",
									value: relativeTime(event.updatedAt)
								})
							]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Registration",
						testId: "event-detail-registration",
						children: event.registrationRequired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-baseline justify-between gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "num font-display text-2xl font-semibold text-foreground",
									"data-testid": "event-registration-count",
									children: formatNumber(event.registrationCount)
								}), event.capacity && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "num text-xs text-muted-foreground",
									children: [
										"of ",
										formatNumber(event.capacity),
										" places"
									]
								})]
							}), event.capacity ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
								value: fill,
								className: "h-1.5"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "num text-[11px] text-muted-foreground",
								children: [fill, "% of capacity filled"]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No capacity limit set for this event."
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed text-muted-foreground",
							children: "Registration is not required — the whole school community can attend."
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EventFormDialog, {
				open: editOpen,
				onOpenChange: setEditOpen,
				event
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmDelete,
				onOpenChange: setConfirmDelete,
				title: "Delete this event?",
				description: `“${event.title}” will be removed from the calendar permanently.`,
				confirmLabel: "Delete event",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => deleteMutation.mutate(),
				testId: "event-detail-delete-dialog"
			})
		]
	});
}
var SplitComponent = EventDetailPage;
//#endregion
export { SplitComponent as component };
