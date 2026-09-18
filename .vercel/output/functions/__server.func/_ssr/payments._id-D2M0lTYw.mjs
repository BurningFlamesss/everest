import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CreditCard, Download, FileText, Receipt, RotateCcw, ShieldOff, Trash2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { downloadTextFile, formatCurrency, formatDate, formatDateTime, relativeTime, toCsv } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { deleteInvoice, getInvoiceDetail, refundPayment, voidInvoice } from "./operations-gGGfOgxw.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { METHOD_ICON, METHOD_LABEL, ReceiptDialog, RecordPaymentDialog, balanceOf, dueDescriptor, paidShare } from "./ReceiptDialog-Qb0gTNGN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments._id-D2M0lTYw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function InvoiceDetailPage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor, can } = useAuth();
	const canManage = can("payments.manage");
	const [recordOpen, setRecordOpen] = (0, import_react.useState)(false);
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [pendingRefund, setPendingRefund] = (0, import_react.useState)(null);
	const [voidOpen, setVoidOpen] = (0, import_react.useState)(false);
	const [deleteOpen, setDeleteOpen] = (0, import_react.useState)(false);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["invoice", id],
		queryFn: () => getInvoiceDetail(id),
		enabled: Boolean(id)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["invoice", id] });
		qc.invalidateQueries({ queryKey: ["invoices"] });
		qc.invalidateQueries({ queryKey: ["payments"] });
		qc.invalidateQueries({ queryKey: ["payments-analytics"] });
		qc.invalidateQueries({ queryKey: ["payments-summary"] });
		qc.invalidateQueries({ queryKey: ["student-balances"] });
		qc.invalidateQueries({ queryKey: ["students"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const voidMutation = useMutation({
		mutationFn: () => voidInvoice(id, actor),
		onSuccess: (invoice) => {
			toast.success(`${invoice.invoiceNo} voided`);
			setVoidOpen(false);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: () => deleteInvoice(id, actor),
		onSuccess: () => {
			toast.success("Invoice deleted");
			qc.invalidateQueries({ queryKey: ["invoices"] });
			qc.invalidateQueries({ queryKey: ["payments-summary"] });
			navigate("/admin/payments");
		},
		onError: (error) => toast.error(error.message)
	});
	const refundMutation = useMutation({
		mutationFn: (paymentId) => refundPayment(paymentId, actor),
		onSuccess: (payment) => {
			toast.success(`${payment.receiptNo} refunded`);
			setPendingRefund(null);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			onRetry: () => refetch(),
			testId: "invoice-detail-error"
		})
	});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: FileText,
			title: "Invoice not found",
			description: "It may have been deleted. Head back to the ledger to pick another invoice.",
			primaryLabel: "Back to payments",
			onPrimary: () => navigate("/admin/payments"),
			testId: "invoice-detail-missing"
		})
	});
	const { invoice, student, structure, payments } = data;
	const balance = balanceOf(invoice);
	const due = dueDescriptor(invoice);
	const settled = invoice.status === "paid" || invoice.status === "void";
	const exportReceipts = () => {
		if (payments.length === 0) {
			toast.error("No receipts to export for this invoice yet.");
			return;
		}
		const csv = toCsv(payments.map((row) => ({
			receiptNo: row.receiptNo,
			amount: row.amount,
			method: row.method,
			reference: row.reference,
			status: row.status,
			paidAt: row.paidAt,
			recordedBy: row.recordedBy
		})));
		downloadTextFile(`${invoice.invoiceNo}-receipts.csv`, csv);
		toast.success(`Exported ${payments.length} receipts`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "invoice-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Payments",
				title: invoice.invoiceNo,
				description: `${invoice.term} fees for ${invoice.studentName} · ${invoice.grade}`,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: invoice.status,
						testId: "invoice-status-badge"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "invoice-due-meta",
						children: [
							"Due ",
							formatDate(invoice.dueDate),
							" · ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: due.tone,
								children: due.label
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Issued ", formatDate(invoice.issuedDate)] })
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/admin/payments",
							"data-testid": "invoice-back",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All invoices"]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "invoice-export-receipts",
						onClick: exportReceipts,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Receipts CSV"]
					}),
					!settled && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: `/admin/payments/checkout/${invoice.id}`,
							"data-testid": "invoice-pay-online",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "h-3.5 w-3.5" }), " Pay online"]
						})
					}),
					canManage && !settled && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						"data-testid": "invoice-record-payment",
						onClick: () => setRecordOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-3.5 w-3.5" }), " Record payment"]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							eyebrow: "Balance",
							title: "Amounts",
							testId: "invoice-amounts-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid gap-3 sm:grid-cols-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Invoiced"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "num mt-1 font-display text-xl font-semibold leading-none text-foreground",
											"data-testid": "invoice-amount",
											children: formatCurrency(invoice.amount)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Collected"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "num mt-1 font-display text-xl font-semibold leading-none text-success",
											"data-testid": "invoice-paid",
											children: formatCurrency(invoice.amountPaid)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-[11px] text-muted-foreground",
											children: "Balance"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: cn("num mt-1 font-display text-xl font-semibold leading-none", balance > 0 && invoice.status !== "void" ? "text-destructive" : "text-muted-foreground"),
											"data-testid": "invoice-balance",
											children: formatCurrency(balance)
										})]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between text-xs text-muted-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [paidShare(invoice), "% collected"] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num",
										children: [payments.filter((p) => p.status === "succeeded").length, " receipts"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1.5 block h-1.5 overflow-hidden rounded-full bg-surface-2",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("block h-full rounded-full transition-transform duration-200", invoice.status === "void" ? "bg-muted-foreground" : "bg-success"),
										style: { width: `${paidShare(invoice)}%` },
										"data-testid": "invoice-progress"
									})
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Breakdown",
							title: structure ? structure.name : "Fee components",
							description: structure ? `${structure.grade} · ${structure.frequency}` : "No structure linked",
							testId: "invoice-breakdown-panel",
							children: structure ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "divide-y divide-hairline",
								children: [
									structure.components.map((component, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-3 py-2 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-foreground",
											children: component.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num shrink-0 text-muted-foreground",
											children: formatCurrency(component.amount)
										})]
									}, `${structure.id}-${index}`)),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-3 pt-2.5 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-foreground",
											children: "Structure total"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num font-semibold text-foreground",
											children: formatCurrency(structure.amount)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center justify-between gap-3 pt-2.5 text-sm",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "font-medium text-foreground",
											children: [
												"This invoice (",
												invoice.term,
												")"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num font-semibold text-primary",
											children: formatCurrency(invoice.amount)
										})]
									})
								]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "This invoice was issued without a linked fee structure, so only the headline amount applies."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Receipts",
							title: "Payment history",
							description: "Every receipt recorded against this invoice",
							bodyClassName: payments.length ? "p-0" : "p-4",
							testId: "invoice-receipts-panel",
							children: payments.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								icon: Receipt,
								compact: true,
								title: "No payments yet",
								description: "Record a payment or use the demo checkout to collect this invoice.",
								primaryLabel: canManage && !settled ? "Record a payment" : void 0,
								onPrimary: () => setRecordOpen(true),
								testId: "invoice-receipts-empty"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-hairline",
								children: payments.map((payment) => {
									const Icon = METHOD_ICON[payment.method];
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2",
										"data-testid": `invoice-receipt-${payment.id}`,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-hairline bg-surface-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-muted-foreground" })
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "num truncate font-mono text-xs text-foreground",
													children: payment.receiptNo
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "truncate text-xs text-muted-foreground",
													children: [
														METHOD_LABEL[payment.method],
														" · ",
														payment.reference,
														" · ",
														relativeTime(payment.paidAt)
													]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "num text-sm font-semibold text-foreground",
													children: formatCurrency(payment.amount)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-[11px] text-muted-foreground",
													children: formatDateTime(payment.paidAt)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
												value: payment.status,
												testId: `invoice-receipt-status-${payment.id}`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													variant: "outline",
													size: "sm",
													className: "h-7 px-2 text-xs",
													"data-testid": `invoice-receipt-view-${payment.id}`,
													onClick: () => setViewing(payment),
													children: "View"
												}), canManage && payment.status === "succeeded" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "ghost",
													size: "sm",
													className: "h-7 gap-1 px-2 text-xs text-destructive",
													"data-testid": `invoice-receipt-refund-${payment.id}`,
													onClick: () => setPendingRefund(payment),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), " Refund"]
												})]
											})
										]
									}, payment.id);
								})
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Student",
							title: "Billed to",
							testId: "invoice-student-panel",
							children: student ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
								name: `${student.firstName} ${student.lastName}`,
								subtitle: student.admissionNo,
								avatarUrl: student.avatarUrl,
								to: `/admin/students/${student.id}`,
								size: "lg",
								mono: true,
								testId: "invoice-student-link"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "mt-4 grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Grade",
										value: `${student.grade} ${student.section}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Roll no",
										value: student.rollNo,
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Guardian",
										value: student.guardian.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Guardian phone",
										value: student.guardian.phone,
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Account balance",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: student.feeBalance > 0 ? "text-destructive" : "text-success",
											children: formatCurrency(student.feeBalance)
										}),
										testId: "invoice-student-balance"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Status",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: student.status })
									})
								]
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground",
								children: "The student record for this invoice is no longer available."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Invoice",
							title: "Details",
							testId: "invoice-meta-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
								className: "grid gap-4 sm:grid-cols-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Invoice no",
										value: invoice.invoiceNo,
										mono: true,
										testId: "invoice-no"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Term",
										value: invoice.term
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Issued",
										value: formatDate(invoice.issuedDate)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Due",
										value: formatDate(invoice.dueDate)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Structure",
										value: structure?.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Status",
										value: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: invoice.status })
									})
								]
							})
						}),
						canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							eyebrow: "Danger zone",
							title: "Invoice lifecycle",
							testId: "invoice-danger-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-2",
								children: [invoice.status !== "void" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "justify-start gap-1.5",
									"data-testid": "invoice-void",
									onClick: () => setVoidOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-3.5 w-3.5" }), " Void this invoice"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: "justify-start gap-1.5 text-destructive",
									"data-testid": "invoice-delete",
									onClick: () => setDeleteOpen(true),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete invoice"]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-[11px] leading-relaxed text-muted-foreground",
								children: "Voiding clears the outstanding balance from the student account. Deleting also removes every receipt recorded against this invoice."
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordPaymentDialog, {
				invoice: recordOpen ? invoice : null,
				onOpenChange: (open) => setRecordOpen(open)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptDialog, {
				payment: viewing,
				onOpenChange: (open) => !open && setViewing(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingRefund),
				onOpenChange: (open) => !open && setPendingRefund(null),
				title: "Refund this payment?",
				description: `${formatCurrency(pendingRefund?.amount ?? 0)} will be reversed and the balance returns to ${invoice.studentName}'s account.`,
				confirmLabel: "Refund payment",
				destructive: true,
				busy: refundMutation.isPending,
				onConfirm: () => pendingRefund && refundMutation.mutate(pendingRefund.id),
				testId: "invoice-refund-confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: voidOpen,
				onOpenChange: setVoidOpen,
				title: "Void this invoice?",
				description: `${invoice.invoiceNo} will be marked void and the outstanding ${formatCurrency(balance)} is removed from ${invoice.studentName}'s account.`,
				confirmLabel: "Void invoice",
				busy: voidMutation.isPending,
				onConfirm: () => voidMutation.mutate(),
				testId: "invoice-void-confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: deleteOpen,
				onOpenChange: setDeleteOpen,
				title: "Delete this invoice?",
				description: `${invoice.invoiceNo} and its ${payments.length} receipt(s) will be permanently removed.`,
				confirmLabel: "Delete invoice",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => deleteMutation.mutate(),
				testId: "invoice-delete-confirm"
			})
		]
	});
}
var SplitComponent = InvoiceDetailPage;
//#endregion
export { SplitComponent as component };
