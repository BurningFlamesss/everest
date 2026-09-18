import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Archive, Ellipsis, Eye, Megaphone, Pencil, Pin, PinOff, Plus, Send, Trash2, Undo2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Tabs, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { formatDate, formatNumber, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { FilterBar } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { deleteNotice, listNotices, noticeCounts, setNoticeStatus, updateNotice } from "./communications-D6qF7rY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notices-Ckj0JUPM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STATUS_TABS = [
	{
		value: "all",
		label: "All",
		countKey: "all"
	},
	{
		value: "published",
		label: "Published",
		countKey: "published"
	},
	{
		value: "scheduled",
		label: "Scheduled",
		countKey: "scheduled"
	},
	{
		value: "draft",
		label: "Drafts",
		countKey: "draft"
	},
	{
		value: "archived",
		label: "Archived",
		countKey: "archived"
	}
];
function NoticesPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const [status, setStatus] = (0, import_react.useState)(searchParams.status ?? "all");
	const [search, setSearch] = (0, import_react.useState)("");
	const [priority, setPriority] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		const next = searchParams.status ?? "all";
		setStatus(next);
		setPage(1);
	}, [searchParams.status]);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["notices", {
			search,
			status,
			priority,
			page
		}],
		queryFn: () => listNotices({
			search,
			status,
			priority,
			page,
			pageSize: 8
		})
	});
	const counts = (0, import_react.useMemo)(() => noticeCounts(), [data]);
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["notices"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
		qc.invalidateQueries({ queryKey: ["notifications"] });
	};
	const statusMutation = useMutation({
		mutationFn: (vars) => setNoticeStatus(vars.id, vars.status, actor),
		onSuccess: (notice) => {
			toast.success(notice.status === "published" ? `“${notice.title}” is now live` : `“${notice.title}” moved to ${notice.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const pinMutation = useMutation({
		mutationFn: (notice) => updateNotice(notice.id, { pinned: !notice.pinned }, actor),
		onSuccess: (notice) => {
			toast.success(notice.pinned ? "Pinned to the top of the board" : "Unpinned");
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (notice) => deleteNotice(notice.id, actor),
		onSuccess: () => {
			toast.success("Notice deleted");
			setPendingDelete(null);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const changeStatusTab = (value) => {
		navigate({
			search: (prev) => {
				const next = { ...prev };
				if (value === "all") delete next.status;
				else next.status = value;
				return next;
			},
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "notices-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Communications",
				title: "Notices",
				description: "Draft, schedule and publish announcements to precisely the right audience.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "notices-count-published",
						children: [counts.published, " published"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "notices-count-draft",
						children: [counts.draft, " drafts"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "notices-count-scheduled",
						children: [counts.scheduled, " scheduled"]
					})
				] }),
				actions: can("notices.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					size: "sm",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/notices/new",
						"data-testid": "notices-new",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Write a notice"]
					})
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: status,
				onValueChange: changeStatusTab,
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "h-9",
					"data-testid": "notices-status-tabs",
					children: STATUS_TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
						value: tab.value,
						className: "h-7 gap-1.5 px-3 text-xs",
						"data-testid": `notices-tab-${tab.value}`,
						children: [tab.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-[11px] text-muted-foreground",
							children: counts[tab.countKey]
						})]
					}, tab.value))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "notices-filters",
				search,
				onSearchChange: (value) => {
					setSearch(value);
					setPage(1);
				},
				placeholder: "Search notices by title, summary or author…",
				filters: [{
					key: "priority",
					label: "Priority",
					value: priority,
					options: [
						{
							value: "all",
							label: "All priorities"
						},
						{
							value: "urgent",
							label: "Urgent"
						},
						{
							value: "high",
							label: "High"
						},
						{
							value: "normal",
							label: "Normal"
						},
						{
							value: "low",
							label: "Low"
						}
					],
					onChange: (value) => {
						setPriority(value);
						setPage(1);
					},
					width: "w-[150px]"
				}],
				onReset: () => {
					setSearch("");
					setPriority("all");
					setPage(1);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "notices-table",
				columns: [
					{
						key: "title",
						header: "Notice",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-start gap-2",
							children: [notice.pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
								className: "mt-1 h-3.5 w-3.5 shrink-0 text-accent",
								"aria-label": "Pinned"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: `/admin/notices/${notice.id}`,
									className: "block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring",
									"data-testid": `notice-link-${notice.id}`,
									onClick: (event) => event.stopPropagation(),
									children: notice.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate text-xs text-muted-foreground",
									children: notice.summary
								})]
							})]
						})
					},
					{
						key: "audience",
						header: "Audience",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-1",
							"data-testid": `notice-audience-${notice.id}`,
							children: [notice.audience.slice(0, 2).map((target) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground",
								children: target.label
							}, `${target.kind}-${target.value ?? "any"}`)), notice.audience.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num rounded border border-hairline bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted-foreground",
								children: ["+", notice.audience.length - 2]
							})]
						})
					},
					{
						key: "priority",
						header: "Priority",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							value: notice.priority,
							testId: `notice-priority-${notice.id}`
						})
					},
					{
						key: "status",
						header: "Status",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							value: notice.status,
							testId: `notice-status-${notice.id}`
						})
					},
					{
						key: "publishAt",
						header: "Publish",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "num truncate text-xs text-foreground",
								children: formatDate(notice.publishAt)
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-[11px] text-muted-foreground",
								children: relativeTime(notice.publishAt)
							})]
						})
					},
					{
						key: "views",
						header: "Views",
						align: "right",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-sm text-muted-foreground",
							children: formatNumber(notice.views)
						})
					},
					{
						key: "actions",
						header: "",
						align: "right",
						render: (notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-end gap-1",
							onClick: (event) => event.stopPropagation(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "ghost",
								size: "icon",
								className: "row-actions h-7 w-7",
								"aria-label": "Open notice",
								"data-testid": `notice-view-${notice.id}`,
								onClick: () => navigate(`/admin/notices/${notice.id}`),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "icon",
									className: "h-7 w-7",
									"aria-label": "Notice actions",
									"data-testid": `notice-menu-${notice.id}`,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-3.5 w-3.5" })
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
								align: "end",
								className: "w-48 bg-popover",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-open-${notice.id}`,
										onClick: () => navigate(`/admin/notices/${notice.id}`),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "h-3.5 w-3.5" }), " Open"]
									}),
									can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-edit-${notice.id}`,
										onClick: () => navigate(`/admin/notices/${notice.id}/edit`),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
									}),
									can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-pin-${notice.id}`,
										onClick: () => pinMutation.mutate(notice),
										children: [notice.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "h-3.5 w-3.5" }), notice.pinned ? "Unpin" : "Pin to top"]
									}),
									can("notices.publish") && notice.status !== "published" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-publish-${notice.id}`,
										onClick: () => statusMutation.mutate({
											id: notice.id,
											status: "published"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Publish now"]
									}),
									can("notices.publish") && notice.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-unpublish-${notice.id}`,
										onClick: () => statusMutation.mutate({
											id: notice.id,
											status: "draft"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }), " Revert to draft"]
									}),
									can("notices.manage") && notice.status !== "archived" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs",
										"data-testid": `notice-action-archive-${notice.id}`,
										onClick: () => statusMutation.mutate({
											id: notice.id,
											status: "archived"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "h-3.5 w-3.5" }), " Archive"]
									}),
									can("notices.publish") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
										className: "gap-2 text-xs text-destructive",
										"data-testid": `notice-action-delete-${notice.id}`,
										onClick: () => setPendingDelete(notice),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
									})] })
								]
							})] })]
						})
					}
				],
				rows: data?.rows ?? [],
				rowId: (notice) => notice.id,
				rowTestId: (notice) => `notice-row-${notice.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => void refetch(),
				onRowClick: (notice) => navigate(`/admin/notices/${notice.id}`),
				page,
				pageSize: 8,
				total: data?.total ?? 0,
				onPageChange: setPage,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Megaphone,
					title: "No notices here yet",
					description: "Nothing matches this view. Change the status tab or write a new notice for students, guardians or staff.",
					primaryLabel: can("notices.manage") ? "Write a notice" : void 0,
					onPrimary: () => navigate("/admin/notices/new"),
					testId: "notices-empty"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this notice?",
				description: `“${pendingDelete?.title ?? ""}” will be removed permanently. Recipients who already read it keep no copy.`,
				confirmLabel: "Delete notice",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => pendingDelete && deleteMutation.mutate(pendingDelete),
				testId: "notice-delete-dialog"
			})
		]
	});
}
var SplitComponent = NoticesPage;
//#endregion
export { SplitComponent as component };
