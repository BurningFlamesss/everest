import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { CircleCheck, CircleX, Download, Ellipsis, GraduationCap, GripVertical, Inbox, Kanban, Rows3, Star, Trash2, UserPlus } from "../_libs/lucide-react.mjs";
import { CSS, DndContext, PointerSensor, closestCorners, useDraggable, useDroppable, useSensor, useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { Skeleton } from "./skeleton-Dhh7pexn.mjs";
import { downloadTextFile, formatDate, relativeTime, toCsv } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { listBranches } from "./website-DZTFoYsv.mjs";
import { applicationFilterOptions, deleteApplication, listApplications, setApplicationStatus } from "./operations-gGGfOgxw.mjs";
import { listClasses } from "./academics-BoJkVxby.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { ApplicationFormDialog, ConvertApplicantDialog, PIPELINE, SOURCE_LABEL, scoreTone } from "./pipeline-constants-DxOm0Asn.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admissions-BSRFeb16.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ApplicationCard({ application, canManage }) {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: application.id,
		disabled: !canManage
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		ref: setNodeRef,
		style: { transform: CSS.Translate.toString(transform) },
		"data-testid": `admissions-card-${application.id}`,
		className: cn("group rounded-lg border bg-surface-1 p-2.5 transition-colors duration-150", isDragging ? "z-20 border-primary/50 shadow-pop" : "border-hairline hover:border-primary/35"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: application.avatarUrl,
						alt: "",
						className: "h-8 w-8 shrink-0 rounded-full border border-hairline object-cover",
						loading: "lazy"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: `/admissions/${application.id}`,
							className: "block truncate text-sm font-medium text-foreground transition-colors hover:text-primary focus-ring",
							"data-testid": `admissions-card-link-${application.id}`,
							children: application.applicantName
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num truncate font-mono text-[11px] text-muted-foreground",
							children: application.applicationNo
						})]
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": `Drag ${application.applicantName}`,
						"data-testid": `admissions-card-drag-${application.id}`,
						className: "shrink-0 cursor-grab rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground active:cursor-grabbing focus-ring",
						...attributes,
						...listeners,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-3.5 w-3.5" })
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-2 flex flex-wrap items-center gap-1.5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-hairline px-1.5 py-0.5 text-[11px] text-muted-foreground",
						children: application.gradeApplied
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "rounded-full border border-hairline px-1.5 py-0.5 text-[11px] text-muted-foreground",
						children: SOURCE_LABEL[application.source] ?? application.source
					}),
					application.entranceScore !== void 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: cn("num inline-flex items-center gap-1 text-[11px] font-semibold", scoreTone(application.entranceScore)),
						"data-testid": `admissions-card-score-${application.id}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }),
							" ",
							application.entranceScore
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1.5 truncate text-[11px] text-muted-foreground",
				children: [
					application.guardian.name,
					" · ",
					relativeTime(application.submittedAt)
				]
			})
		]
	});
}
function KanbanColumn({ status, applications, canManage, highlighted }) {
	const stage = PIPELINE.find((item) => item.status === status);
	const { setNodeRef, isOver } = useDroppable({ id: status });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		ref: setNodeRef,
		"data-testid": `admissions-column-${status}`,
		className: cn("flex min-w-[248px] flex-1 flex-col rounded-xl border bg-surface-2/60 transition-colors duration-150", isOver ? "border-primary/60 bg-primary/6" : highlighted ? "border-primary/40" : "border-hairline"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex items-center gap-2 border-b border-hairline px-3 py-2.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-4 w-[3px] rounded-full", stage.rail) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-sm font-semibold text-foreground",
						children: stage.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-muted-foreground",
						children: stage.hint
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: cn("num rounded-full px-2 py-0.5 text-[11px] font-semibold text-foreground", stage.tint),
					"data-testid": `admissions-column-count-${status}`,
					children: applications.length
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
			className: "flex max-h-[620px] flex-1 flex-col gap-2 overflow-y-auto p-2",
			children: [applications.map((application) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationCard, {
				application,
				canManage
			}, application.id)), applications.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-hairline px-3 py-8 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Inbox, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: canManage ? "Drop an application here" : "Nothing in this stage"
				})]
			})]
		})]
	});
}
function KanbanBoard({ applications, canManage, highlightStatus }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-3 overflow-x-auto pb-2",
		"data-testid": "admissions-kanban",
		children: PIPELINE.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanColumn, {
			status: stage.status,
			applications: applications.filter((application) => application.status === stage.status),
			canManage,
			highlighted: highlightStatus === stage.status
		}, stage.status))
	});
}
function AdmissionsPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const statusParam = searchParams.status ?? "all";
	const view = searchParams.view ?? (statusParam !== "all" ? "table" : "board");
	const canManage = can("admissions.manage");
	const [search, setSearch] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [source, setSource] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [converting, setConverting] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const setParam = (key, value) => {
		navigate({
			search: (prev) => {
				const next = { ...prev };
				if (value === "all" || !value) delete next[key];
				else next[key] = value;
				return next;
			},
			replace: true
		});
	};
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["applications", {
			search,
			grade,
			source
		}],
		queryFn: () => listApplications({
			search,
			grade,
			source,
			pageSize: 500
		})
	});
	const { data: branches = [] } = useQuery({
		queryKey: ["branches"],
		queryFn: listBranches
	});
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const all = data?.rows ?? [];
	const options = applicationFilterOptions();
	const grades = Array.from(/* @__PURE__ */ new Set([...options.grades, ...classes.map((cls) => cls.grade)])).sort();
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["applications"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: ({ id, status }) => setApplicationStatus(id, status, actor),
		onSuccess: (application) => {
			toast.success(`${application.applicantName} moved to ${application.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const removeMutation = useMutation({
		mutationFn: (id) => deleteApplication(id, actor),
		onSuccess: () => {
			toast.success("Application deleted");
			setPendingDelete(null);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const onDragEnd = (event) => {
		const { active, over } = event;
		if (!over) return;
		const target = String(over.id);
		const application = all.find((row) => row.id === String(active.id));
		if (!application || application.status === target) return;
		if (target === "converted") {
			setConverting(application);
			return;
		}
		statusMutation.mutate({
			id: application.id,
			status: target
		});
	};
	const summary = PIPELINE.map((stage) => ({
		...stage,
		count: all.filter((row) => row.status === stage.status).length
	}));
	const tableRows = statusParam === "all" ? all : all.filter((row) => row.status === statusParam);
	const pageSize = 10;
	const pagedRows = tableRows.slice((page - 1) * pageSize, page * pageSize);
	const exportRows = () => {
		const csv = toCsv(tableRows.map((row) => ({
			applicationNo: row.applicationNo,
			applicant: row.applicantName,
			grade: row.gradeApplied,
			status: row.status,
			score: row.entranceScore ?? "",
			source: row.source,
			guardian: row.guardian.name,
			guardianPhone: row.guardian.phone,
			submitted: row.submittedAt.slice(0, 10)
		})));
		downloadTextFile(`northfield-admissions-${Date.now()}.csv`, csv);
		toast.success(`Exported ${tableRows.length} applications`);
	};
	const columns = [
		{
			key: "applicant",
			header: "Applicant",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: row.applicantName,
				subtitle: row.applicationNo,
				avatarUrl: row.avatarUrl,
				to: `/admissions/${row.id}`,
				mono: true,
				testId: `admissions-row-link-${row.id}`
			})
		},
		{
			key: "grade",
			header: "Grade",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-foreground",
				children: row.gradeApplied
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "truncate text-xs text-muted-foreground",
				children: ["from ", row.previousSchool]
			})] })
		},
		{
			key: "guardian",
			header: "Guardian",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-foreground",
					children: row.guardian.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num truncate text-xs text-muted-foreground",
					children: row.guardian.phone
				})]
			})
		},
		{
			key: "score",
			header: "Score",
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("num text-sm font-semibold", scoreTone(row.entranceScore)),
				children: row.entranceScore ?? "—"
			})
		},
		{
			key: "source",
			header: "Source",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: SOURCE_LABEL[row.source] ?? row.source
			})
		},
		{
			key: "submitted",
			header: "Submitted",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "num text-sm text-foreground",
				children: formatDate(row.submittedAt)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs text-muted-foreground",
				children: relativeTime(row.submittedAt)
			})] })
		},
		{
			key: "status",
			header: "Status",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: row.status,
				testId: `admissions-status-${row.id}`
			})
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Application actions",
					"data-testid": `admissions-actions-${row.id}`,
					className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
					onClick: (event) => event.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-52 bg-popover",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
						className: "truncate text-xs",
						children: row.applicantName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onClick: () => navigate(`/admissions/${row.id}`),
						"data-testid": `admissions-view-${row.id}`,
						children: "Open application"
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => {
								setEditing(row);
								setFormOpen(true);
							},
							children: "Edit details"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							"data-testid": `admissions-accept-${row.id}`,
							onClick: () => statusMutation.mutate({
								id: row.id,
								status: "accepted"
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mr-2 h-3.5 w-3.5" }), " Make an offer"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => statusMutation.mutate({
								id: row.id,
								status: "waitlisted"
							}),
							children: "Move to waitlist"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => statusMutation.mutate({
								id: row.id,
								status: "rejected"
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mr-2 h-3.5 w-3.5" }), " Decline"]
						}),
						row.status !== "converted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							"data-testid": `admissions-convert-${row.id}`,
							onClick: () => setConverting(row),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-2 h-3.5 w-3.5" }), " Enrol as student"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							"data-testid": `admissions-delete-${row.id}`,
							onClick: () => setPendingDelete(row),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-3.5 w-3.5" }), " Delete application"]
						})
					] })
				]
			})] })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "admissions-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Operations",
				title: "Admissions",
				description: "Move applications through the pipeline, review assessments and enrol accepted applicants.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "admissions-total",
						children: [all.length, " applications in view"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.find((s) => s.status === "pending")?.count ?? 0, " awaiting review"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.find((s) => s.status === "converted")?.count ?? 0, " enrolled"] })
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center rounded-md border border-hairline bg-surface-1 p-0.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "admissions-view-board",
							onClick: () => setParam("view", "board"),
							className: cn("inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors duration-150 focus-ring", view === "board" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kanban, { className: "h-3.5 w-3.5" }), " Pipeline"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							"data-testid": "admissions-view-table",
							onClick: () => setParam("view", "table"),
							className: cn("inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium transition-colors duration-150 focus-ring", view === "table" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rows3, { className: "h-3.5 w-3.5" }), " Table"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "admissions-export",
						onClick: exportRows,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						"data-testid": "admissions-new",
						onClick: () => {
							setEditing(null);
							setFormOpen(true);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " New application"]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-5",
				"data-testid": "admissions-summary",
				children: summary.map((stage) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setParam("status", statusParam === stage.status ? "all" : stage.status);
						setPage(1);
					},
					"data-testid": `admissions-summary-${stage.status}`,
					className: cn("rounded-lg border bg-surface-1 px-3 py-2.5 text-left transition-colors duration-150 focus-ring", statusParam === stage.status ? "border-primary/50 bg-primary/6" : "border-hairline hover:border-primary/35"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", stage.rail) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "truncate text-[11px] font-medium text-muted-foreground",
							children: stage.label
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "num mt-1 block font-display text-lg font-semibold leading-none text-foreground",
						children: stage.count
					})]
				}, stage.status))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "admissions-filters",
				search,
				onSearchChange: (value) => {
					setSearch(value);
					setPage(1);
				},
				placeholder: "Search by applicant, application number or guardian…",
				filters: [
					{
						key: "grade",
						label: "Grade",
						value: grade,
						options: toOptions(options.grades, "All grades"),
						onChange: (value) => {
							setGrade(value);
							setPage(1);
						}
					},
					{
						key: "source",
						label: "Source",
						value: source,
						options: [{
							value: "all",
							label: "Any source"
						}, ...options.sources.map((item) => ({
							value: item,
							label: SOURCE_LABEL[item] ?? item
						}))],
						onChange: (value) => {
							setSource(value);
							setPage(1);
						},
						width: "w-[150px]"
					},
					...view === "table" ? [{
						key: "status",
						label: "Status",
						value: statusParam,
						options: [{
							value: "all",
							label: "Any status"
						}, ...PIPELINE.map((stage) => ({
							value: stage.status,
							label: stage.label
						}))],
						onChange: (value) => {
							setParam("status", value);
							setPage(1);
						},
						width: "w-[150px]"
					}] : []
				],
				onReset: () => {
					setSearch("");
					setGrade("all");
					setSource("all");
					setParam("status", "all");
					setPage(1);
				}
			}),
			isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					onRetry: () => refetch(),
					testId: "admissions-error"
				})
			}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-hidden",
				"data-testid": "admissions-loading",
				children: Array.from({ length: 5 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel min-w-[240px] flex-1 space-y-2 p-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 w-full" })
					]
				}, index))
			}) : view === "board" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
				sensors,
				collisionDetection: closestCorners,
				onDragEnd,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KanbanBoard, {
					applications: all,
					canManage,
					highlightStatus: statusParam === "all" ? void 0 : statusParam
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "admissions-table",
				columns,
				rows: pagedRows,
				rowId: (row) => row.id,
				rowTestId: (row) => `admissions-table-row-${row.id}`,
				onRowClick: (row) => navigate(`/admissions/${row.id}`),
				page,
				pageSize,
				total: tableRows.length,
				onPageChange: setPage,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: GraduationCap,
					title: "No applications match these filters",
					description: "Try another grade, source or status — or clear the filters to see the whole pipeline.",
					primaryLabel: "Clear filters",
					onPrimary: () => {
						setSearch("");
						setGrade("all");
						setSource("all");
						setParam("status", "all");
					},
					testId: "admissions-table-empty"
				})
			}),
			canManage && view === "board" && all.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-xs text-muted-foreground",
				"data-testid": "admissions-board-hint",
				children: "Drag a card by its handle to change its stage. Dropping into “Enrolled” opens the class-placement step."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationFormDialog, {
				open: formOpen,
				application: editing,
				grades,
				branches,
				onOpenChange: (open) => {
					setFormOpen(open);
					if (!open) setEditing(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvertApplicantDialog, {
				application: converting,
				onOpenChange: (open) => !open && setConverting(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this application?",
				description: `${pendingDelete?.applicantName}'s application (${pendingDelete?.applicationNo}) and its notes will be permanently removed.`,
				confirmLabel: "Delete application",
				destructive: true,
				busy: removeMutation.isPending,
				onConfirm: () => pendingDelete && removeMutation.mutate(pendingDelete.id),
				testId: "admissions-delete-confirm"
			})
		]
	});
}
var SplitComponent = AdmissionsPage;
//#endregion
export { SplitComponent as component };
