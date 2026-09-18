import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Activity } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { ROLE_LABEL } from "./router-BSCuBY6S.mjs";
import { auditActors, auditResourceTypes, listAudit } from "./audit-CP1EiZ6i.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { Timeline } from "./Timeline-D_bg-_gg.mjs";
import { ListSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activity-S10CAsLE.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ACTIONS = [
	"created",
	"updated",
	"deleted",
	"published",
	"archived",
	"invited",
	"status_changed",
	"imported",
	"exported",
	"signed_in",
	"marked_attendance",
	"recorded_payment"
];
function ActivityPage() {
	const [search, setSearch] = (0, import_react.useState)("");
	const [action, setAction] = (0, import_react.useState)("all");
	const [actorId, setActorId] = (0, import_react.useState)("all");
	const [resourceType, setResourceType] = (0, import_react.useState)("all");
	const actors = (0, import_react.useMemo)(() => auditActors(), []);
	const resources = (0, import_react.useMemo)(() => auditResourceTypes(), []);
	const { data: events = [], isLoading } = useQuery({
		queryKey: ["audit", {
			search,
			action,
			actorId,
			resourceType
		}],
		queryFn: () => listAudit({
			search,
			action,
			actorId,
			resourceType,
			limit: 120
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "activity-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "System",
				title: "Activity",
				description: "A chronological record of every administrative action: who did what, to which record, and when.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "activity-count",
					children: [events.length, " entries"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "activity-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search by summary, actor or record…",
				filters: [
					{
						key: "action",
						label: "Action",
						value: action,
						options: toOptions(ACTIONS, "All actions"),
						onChange: setAction,
						width: "w-[165px]"
					},
					{
						key: "actor",
						label: "Actor",
						value: actorId,
						options: [{
							value: "all",
							label: "All actors"
						}, ...actors.map((a) => ({
							value: a.id,
							label: a.name
						}))],
						onChange: setActorId,
						width: "w-[170px]"
					},
					{
						key: "resource",
						label: "Record type",
						value: resourceType,
						options: toOptions(resources, "All records"),
						onChange: setResourceType,
						width: "w-[165px]"
					}
				],
				onReset: () => {
					setSearch("");
					setAction("all");
					setActorId("all");
					setResourceType("all");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				title: "Audit timeline",
				description: "Grouped by day, newest first",
				testId: "activity-panel",
				children: isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ListSkeleton, { rows: 6 }) : events.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Activity,
					title: "No activity matches these filters",
					description: "Try a different actor or action, or clear the filters to see the full history.",
					primaryLabel: "Clear filters",
					onPrimary: () => {
						setSearch("");
						setAction("all");
						setActorId("all");
						setResourceType("all");
					},
					testId: "activity-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, {
					groupByDay: true,
					testId: "activity-timeline",
					items: events.map((event) => ({
						id: event.id,
						title: event.summary,
						description: `${ROLE_LABEL[event.actorRole]} · ${event.resourceLabel}`,
						actor: event.actorName,
						at: event.createdAt,
						chip: event.resourceType.replace(/_/g, " "),
						tone: event.action === "deleted" ? "negative" : event.action === "published" || event.action === "created" ? "positive" : event.action === "invited" || event.action === "status_changed" ? "accent" : "neutral"
					}))
				})
			})
		]
	});
}
var SplitComponent = ActivityPage;
//#endregion
export { SplitComponent as component };
