import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { Archive, ArrowLeft, Megaphone, Pencil, Pin, PinOff, Send, Trash2, Undo2, Users } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { formatDateTime, formatNumber, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { audienceReach, deleteNotice, getNotice, setNoticeStatus, updateNotice } from "./communications-D6qF7rY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notices._id-ByBI3qrg.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function NoticeDetailPage() {
	const { id = "" } = useParams();
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [confirmDelete, setConfirmDelete] = (0, import_react.useState)(false);
	const { data: notice, isLoading } = useQuery({
		queryKey: ["notice", id],
		queryFn: () => getNotice(id),
		enabled: Boolean(id)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["notices"] });
		qc.invalidateQueries({ queryKey: ["notice", id] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: (status) => setNoticeStatus(id, status, actor),
		onSuccess: (updated) => {
			toast.success(updated.status === "published" ? `“${updated.title}” is now live` : `Moved to ${updated.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const pinMutation = useMutation({
		mutationFn: () => updateNotice(id, { pinned: !notice?.pinned }, actor),
		onSuccess: (updated) => {
			toast.success(updated.pinned ? "Pinned to the top" : "Unpinned");
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: () => deleteNotice(id, actor),
		onSuccess: () => {
			toast.success("Notice deleted");
			invalidate();
			navigate("/admin/notices");
		},
		onError: (error) => toast.error(error.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!notice) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		"data-testid": "notice-not-found",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Megaphone,
			title: "That notice no longer exists",
			description: "It may have been deleted. Head back to the notice board to see everything that's live.",
			primaryLabel: "Back to notices",
			onPrimary: () => navigate("/admin/notices"),
			testId: "notice-not-found-empty"
		})
	});
	const reach = audienceReach(notice.audience);
	const hasContent = notice.content.replace(/<[^>]*>/g, "").trim().length > 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "notice-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Notice",
				title: notice.title,
				description: notice.summary,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: notice.status,
						testId: "notice-detail-status"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: notice.priority,
						testId: "notice-detail-priority"
					}),
					notice.pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "inline-flex items-center gap-1 rounded-full bg-accent/14 px-2 py-0.5 text-accent",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "h-3 w-3" }), " Pinned"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "notice-detail-author",
						children: ["By ", notice.authorName]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-testid": "notice-detail-publish",
						children: formatDateTime(notice.publishAt)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num",
						"data-testid": "notice-detail-views",
						children: [formatNumber(notice.views), " views"]
					})
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "ghost",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/notices",
							"data-testid": "notice-detail-back",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All notices"]
						})
					}),
					can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: `/admin/notices/${notice.id}/edit`,
							"data-testid": "notice-detail-edit",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
						})
					}),
					can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						disabled: pinMutation.isPending,
						"data-testid": "notice-detail-pin",
						onClick: () => pinMutation.mutate(),
						children: [notice.pinned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PinOff, { className: "h-3.5 w-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, { className: "h-3.5 w-3.5" }), notice.pinned ? "Unpin" : "Pin"]
					}),
					can("notices.manage") && notice.status !== "archived" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						disabled: statusMutation.isPending,
						"data-testid": "notice-detail-archive",
						onClick: () => statusMutation.mutate("archived"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Archive, { className: "h-3.5 w-3.5" }), " Archive"]
					}),
					can("notices.publish") && (notice.status === "published" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						disabled: statusMutation.isPending,
						"data-testid": "notice-detail-unpublish",
						onClick: () => statusMutation.mutate("draft"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }), " Revert to draft"]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						disabled: statusMutation.isPending,
						"data-testid": "notice-detail-publish",
						onClick: () => statusMutation.mutate("published"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }), " Publish now"]
					})),
					can("notices.publish") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "h-8 w-8 text-destructive",
						"aria-label": "Delete notice",
						"data-testid": "notice-detail-delete",
						onClick: () => setConfirmDelete(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "lg:col-span-2",
					title: "Notice content",
					testId: "notice-detail-content",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "space-y-4",
						children: [notice.featuredImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: notice.featuredImage,
							alt: "",
							className: "aspect-[16/9] w-full rounded-lg border border-hairline object-cover",
							"data-testid": "notice-detail-image"
						}), hasContent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "prose-editor",
							"data-testid": "notice-detail-body",
							dangerouslySetInnerHTML: { __html: notice.content }
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							"data-testid": "notice-detail-body",
							children: "This notice has no body text — the summary above is all recipients will see."
						})]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Audience",
						description: `${formatNumber(reach)} recipients`,
						testId: "notice-detail-audience",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex flex-wrap gap-1.5",
								children: notice.audience.map((target) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground",
									children: target.label
								}, `${target.kind}-${target.value ?? "any"}`))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "flex items-center gap-1.5 text-xs text-muted-foreground",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
									" Reaches ",
									formatNumber(reach),
									" students, guardians and staff"
								]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Details",
						testId: "notice-detail-meta",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
							className: "grid grid-cols-2 gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Author",
									value: notice.authorName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Status",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: notice.status })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Priority",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: notice.priority })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Views",
									value: formatNumber(notice.views),
									mono: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Publish at",
									value: formatDateTime(notice.publishAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Expires",
									value: notice.expiresAt ? formatDateTime(notice.expiresAt) : "No expiry"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Created",
									value: relativeTime(notice.createdAt)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Last updated",
									value: relativeTime(notice.updatedAt)
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: confirmDelete,
				onOpenChange: setConfirmDelete,
				title: "Delete this notice?",
				description: `“${notice.title}” will be removed permanently from the notice board.`,
				confirmLabel: "Delete notice",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => deleteMutation.mutate(),
				testId: "notice-detail-delete-dialog"
			})
		]
	});
}
var SplitComponent = NoticeDetailPage;
//#endregion
export { SplitComponent as component };
