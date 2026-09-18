import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CircleCheck, CircleX, FileText, GraduationCap, MailQuestionMark, MessageSquarePlus, Pencil, ShieldCheck, Trash2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { formatDate, formatDateTime, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { Timeline } from "./Timeline-D_bg-_gg.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { listBranches } from "./website-DZTFoYsv.mjs";
import { addApplicationNote, deleteApplication, getApplication, requestApplicationInfo, setApplicationStatus } from "./operations-gGGfOgxw.mjs";
import { listClasses } from "./academics-BoJkVxby.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { ApplicationFormDialog, ConvertApplicantDialog, SOURCE_LABEL, scoreTone } from "./pipeline-constants-DxOm0Asn.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admissions._id-tITrC7xC.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ApplicationDetailPage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor, can } = useAuth();
	const canManage = can("admissions.manage");
	const [note, setNote] = (0, import_react.useState)("");
	const [infoOpen, setInfoOpen] = (0, import_react.useState)(false);
	const [infoMessage, setInfoMessage] = (0, import_react.useState)("Could you please share the latest transcript from the previous school so we can complete the review?");
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [convertOpen, setConvertOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const { data: application, isLoading, isError, refetch } = useQuery({
		queryKey: ["application", id],
		queryFn: () => getApplication(id),
		enabled: Boolean(id)
	});
	const { data: branches = [] } = useQuery({
		queryKey: ["branches"],
		queryFn: listBranches
	});
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["application", id] });
		qc.invalidateQueries({ queryKey: ["applications"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: (status) => setApplicationStatus(id, status, actor),
		onSuccess: (saved) => {
			toast.success(`Application marked ${saved.status}`);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const noteMutation = useMutation({
		mutationFn: () => addApplicationNote(id, note.trim(), actor),
		onSuccess: () => {
			toast.success("Note added");
			setNote("");
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const infoMutation = useMutation({
		mutationFn: () => requestApplicationInfo(id, infoMessage.trim(), actor),
		onSuccess: () => {
			toast.success("Information request logged on the timeline");
			setInfoOpen(false);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: () => deleteApplication(id, actor),
		onSuccess: () => {
			toast.success("Application deleted");
			qc.invalidateQueries({ queryKey: ["applications"] });
			navigate("/admin/admissions");
		},
		onError: (error) => toast.error(error.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			onRetry: () => refetch(),
			testId: "application-detail-error"
		})
	});
	if (!application) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: GraduationCap,
			title: "Application not found",
			description: "It may have been deleted or converted. Head back to the pipeline to pick another one.",
			primaryLabel: "Back to admissions",
			onPrimary: () => navigate("/admin/admissions"),
			testId: "application-detail-missing"
		})
	});
	const branch = branches.find((item) => item.id === application.branchId);
	const timelineItems = application.timeline.slice().reverse().map((entry) => ({
		id: entry.id,
		title: entry.label,
		description: entry.description,
		actor: entry.actor,
		at: entry.at,
		tone: entry.tone
	}));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "application-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Admissions",
				title: application.applicantName,
				description: `${application.applicationNo} · applied for ${application.gradeApplied} at ${branch?.name ?? "Northfield"}`,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: application.status,
						testId: "application-status-badge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Submitted ", formatDate(application.submittedAt)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: SOURCE_LABEL[application.source] ?? application.source }),
					application.convertedStudentId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: `/admin/students/${application.convertedStudentId}`,
						className: "text-primary hover:underline",
						"data-testid": "application-student-link",
						children: "Open student record"
					})
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/admissions",
						"data-testid": "application-back",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All applications"]
					})
				}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "application-edit",
						onClick: () => setEditOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "application-request-info",
						onClick: () => setInfoOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailQuestionMark, { className: "h-3.5 w-3.5" }), " Request info"]
					}),
					application.status !== "converted" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						"data-testid": "application-convert",
						onClick: () => setConvertOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3.5 w-3.5" }), " Enrol as student"]
					})
				] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [
						canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Decision",
							title: "Move this application",
							description: "Every decision is written to the audit log and notifies the office",
							testId: "application-decision-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1.5",
										disabled: statusMutation.isPending || application.status === "accepted",
										"data-testid": "application-accept",
										onClick: () => statusMutation.mutate("accepted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-3.5 w-3.5 text-success" }), " Make an offer"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1.5",
										disabled: statusMutation.isPending || application.status === "waitlisted",
										"data-testid": "application-waitlist",
										onClick: () => statusMutation.mutate("waitlisted"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "h-3.5 w-3.5 text-accent" }), " Waitlist"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1.5",
										disabled: statusMutation.isPending || application.status === "rejected",
										"data-testid": "application-reject",
										onClick: () => statusMutation.mutate("rejected"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "h-3.5 w-3.5 text-destructive" }), " Decline"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1.5",
										disabled: statusMutation.isPending || application.status === "pending",
										"data-testid": "application-reopen",
										onClick: () => statusMutation.mutate("pending"),
										children: "Reopen review"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: "ml-auto gap-1.5 text-destructive",
										"data-testid": "application-delete",
										onClick: () => setDeleteOpen(true),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Applicant",
							title: "Personal details",
							testId: "application-personal-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-4 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Date of birth",
										value: formatDate(application.dateOfBirth)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Gender",
										value: application.gender === "male" ? "Male" : "Female"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Application no.",
										value: application.applicationNo,
										mono: true,
										testId: "application-no"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Email",
										value: application.email
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Phone",
										value: application.phone,
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Campus",
										value: branch?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Address",
										value: application.address
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Previous school",
										value: application.previousSchool
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Previous grade",
										value: application.previousGrade
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Guardian",
							title: "Primary contact",
							testId: "application-guardian-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Name",
										value: application.guardian.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Relation",
										value: application.guardian.relation
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Phone",
										value: application.guardian.phone,
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Email",
										value: application.guardian.email
									}),
									application.guardian.occupation && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Occupation",
										value: application.guardian.occupation
									})
								]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Documents",
							title: "Submitted paperwork",
							description: `${application.documents.filter((doc) => doc.verified).length} of ${application.documents.length} verified`,
							bodyClassName: "p-2",
							testId: "application-documents-panel",
							children: application.documents.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								compact: true,
								icon: FileText,
								title: "No documents uploaded",
								description: "Request the birth certificate and previous transcript from the guardian.",
								testId: "application-documents-empty"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-hairline",
								children: application.documents.map((doc) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-3 px-2 py-2.5",
									"data-testid": `application-doc-${doc.id}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "grid h-8 w-8 shrink-0 place-items-center rounded-md border border-hairline bg-surface-2",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0 flex-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm text-foreground",
												children: doc.name
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "num truncate text-xs text-muted-foreground",
												children: [
													doc.sizeKb,
													" KB · uploaded ",
													relativeTime(doc.uploadedAt)
												]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: doc.verified ? "active" : "pending",
											label: doc.verified ? "Verified" : "Unverified"
										})
									]
								}, doc.id))
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Assessment",
							title: "Review summary",
							testId: "application-assessment-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Entrance score"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: cn("num font-display text-2xl font-semibold leading-none", scoreTone(application.entranceScore)),
											children: application.entranceScore ?? "—"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-[11px] text-muted-foreground",
											children: application.entranceScore === void 0 ? "Assessment not recorded yet" : application.entranceScore >= 80 ? "Strong candidate — fast-track the interview" : application.entranceScore >= 60 ? "Meets the threshold for a standard review" : "Below threshold — consider the waitlist"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
									className: "grid gap-3 grid-cols-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
											label: "Status",
											value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: application.status })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
											label: "Source",
											value: SOURCE_LABEL[application.source] ?? application.source
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
											label: "Grade",
											value: application.gradeApplied
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
											label: "Seats open",
											value: classes.filter((cls) => cls.grade === application.gradeApplied).reduce((sum, cls) => sum + Math.max(0, cls.capacity - cls.studentCount), 0)
										})
									]
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							eyebrow: "Internal",
							title: "Notes",
							description: `${application.notes.length} note${application.notes.length === 1 ? "" : "s"}`,
							testId: "application-notes-panel",
							children: [canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-3 space-y-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									value: note,
									rows: 3,
									placeholder: "Add an internal note for the admissions team…",
									"data-testid": "application-note-input",
									onChange: (event) => setNote(event.target.value)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									size: "sm",
									className: "w-full gap-1.5",
									disabled: !note.trim() || noteMutation.isPending,
									"data-testid": "application-note-submit",
									onClick: () => noteMutation.mutate(),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageSquarePlus, { className: "h-3.5 w-3.5" }), noteMutation.isPending ? "Saving…" : "Add note"]
								})]
							}), application.notes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "No internal notes yet."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-2.5",
								children: application.notes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-lg border border-hairline bg-surface-2 px-3 py-2",
									"data-testid": `application-note-${item.id}`,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm leading-relaxed text-foreground",
										children: item.text
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mt-1 text-[11px] text-muted-foreground",
										children: [
											item.author,
											" · ",
											relativeTime(item.createdAt)
										]
									})]
								}, item.id))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "History",
							title: "Timeline",
							testId: "application-timeline-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, {
								items: timelineItems,
								testId: "application-timeline"
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: infoOpen,
				onOpenChange: setInfoOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-md",
					"data-testid": "application-info-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Request more information"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The request is logged on the application timeline so the whole office can see what was asked and when." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: infoMessage,
							rows: 4,
							"data-testid": "application-info-message",
							onChange: (event) => setInfoMessage(event.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setInfoOpen(false),
							"data-testid": "application-info-cancel",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !infoMessage.trim() || infoMutation.isPending,
							"data-testid": "application-info-submit",
							onClick: () => infoMutation.mutate(),
							children: infoMutation.isPending ? "Sending…" : "Log request"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApplicationFormDialog, {
				open: editOpen,
				application,
				grades: Array.from(new Set(classes.map((cls) => cls.grade))).sort(),
				branches,
				onOpenChange: setEditOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConvertApplicantDialog, {
				application: convertOpen ? application : null,
				onOpenChange: (open) => setConvertOpen(open)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				title: "Delete this application?",
				description: `${application.applicantName}'s application and its notes will be permanently removed. This cannot be undone.`,
				confirmLabel: "Delete application",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => deleteMutation.mutate(),
				testId: "application-delete-confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground",
				children: ["Last updated ", formatDateTime(application.timeline[application.timeline.length - 1]?.at)]
			})
		]
	});
}
var SplitComponent = ApplicationDetailPage;
//#endregion
export { SplitComponent as component };
