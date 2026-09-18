import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Banknote, CreditCard, Download, FilePenLine, Landmark, Receipt, Wallet } from "../_libs/lucide-react.mjs";
import { useMutation, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { downloadTextFile, formatCurrency, formatDate, formatDateTime } from "./format-BBWmN55e.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { recordPayment } from "./operations-gGGfOgxw.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ReceiptDialog-Qb0gTNGN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var METHODS = [
	{
		value: "card",
		label: "Card"
	},
	{
		value: "bank_transfer",
		label: "Bank transfer"
	},
	{
		value: "cash",
		label: "Cash"
	},
	{
		value: "cheque",
		label: "Cheque"
	},
	{
		value: "wallet",
		label: "Wallet"
	}
];
function RecordPaymentDialog({ invoice, onOpenChange }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [amount, setAmount] = (0, import_react.useState)(0);
	const [method, setMethod] = (0, import_react.useState)("bank_transfer");
	const [reference, setReference] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const balance = invoice ? invoice.amount - invoice.amountPaid : 0;
	(0, import_react.useEffect)(() => {
		if (!invoice) return;
		setAmount(invoice.amount - invoice.amountPaid);
		setMethod("bank_transfer");
		setReference("");
		setError("");
	}, [invoice]);
	const mutation = useMutation({
		mutationFn: () => recordPayment(invoice.id, amount, method, reference, actor),
		onSuccess: (payment) => {
			toast.success(`${formatCurrency(payment.amount)} recorded · receipt ${payment.receiptNo}`);
			qc.invalidateQueries({ queryKey: ["invoices"] });
			qc.invalidateQueries({ queryKey: ["payments"] });
			qc.invalidateQueries({ queryKey: ["payments-analytics"] });
			qc.invalidateQueries({ queryKey: ["student-balances"] });
			qc.invalidateQueries({ queryKey: ["students"] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			onOpenChange(false);
		},
		onError: (err) => setError(err.message)
	});
	const submit = () => {
		if (!amount || amount <= 0) return setError("Enter an amount greater than zero.");
		if (amount > balance) return setError(`That is more than the outstanding balance of ${formatCurrency(balance)}.`);
		return mutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(invoice),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-hairline bg-popover sm:max-w-md",
			"data-testid": "record-payment-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-primary" }), " Record a payment"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: invoice ? `${invoice.invoiceNo} · ${invoice.studentName} · due ${formatDate(invoice.dueDate)}` : "Choose an invoice first." })] }),
				invoice && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-3 gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-hairline bg-surface-2 px-2.5 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Invoiced"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "num text-sm font-semibold text-foreground",
										children: formatCurrency(invoice.amount)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-hairline bg-surface-2 px-2.5 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Paid"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "num text-sm font-semibold text-success",
										children: formatCurrency(invoice.amountPaid)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-lg border border-hairline bg-surface-2 px-2.5 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Balance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "num text-sm font-semibold text-destructive",
										"data-testid": "record-payment-balance",
										children: formatCurrency(balance)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "payment-amount",
									className: "text-xs",
									children: "Amount"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "payment-amount",
									type: "number",
									min: 0,
									max: balance,
									value: amount,
									"data-testid": "record-payment-amount",
									onChange: (event) => setAmount(Number(event.target.value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "rounded border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-ring",
										"data-testid": "record-payment-full",
										onClick: () => setAmount(balance),
										children: "Full balance"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										className: "rounded border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground focus-ring",
										"data-testid": "record-payment-half",
										onClick: () => setAmount(Math.round(balance / 2)),
										children: "Half"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								className: "text-xs",
								children: "Method"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: method,
								onValueChange: (value) => setMethod(value),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"data-testid": "record-payment-method",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "bg-popover",
									children: METHODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: item.value,
										"data-testid": `record-payment-method-${item.value}`,
										children: item.label
									}, item.value))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "payment-reference",
								className: "text-xs",
								children: "Reference (optional)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "payment-reference",
								value: reference,
								placeholder: "TXN123456 or cheque number",
								"data-testid": "record-payment-reference",
								onChange: (event) => setReference(event.target.value)
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							"data-testid": "record-payment-error",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "record-payment-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: mutation.isPending,
					onClick: submit,
					"data-testid": "record-payment-submit",
					children: mutation.isPending ? "Recording…" : "Record payment"
				})] })
			]
		})
	});
}
var METHOD_LABEL = {
	card: "Card",
	bank_transfer: "Bank transfer",
	cash: "Cash",
	cheque: "Cheque",
	wallet: "Wallet"
};
var METHOD_ICON = {
	card: CreditCard,
	bank_transfer: Landmark,
	cash: Banknote,
	cheque: FilePenLine,
	wallet: Wallet
};
var METHOD_OPTIONS = Object.keys(METHOD_LABEL).map((value) => ({
	value,
	label: METHOD_LABEL[value]
}));
var INVOICE_STATUS_LABEL = {
	paid: "Paid",
	partial: "Partial",
	unpaid: "Unpaid",
	overdue: "Overdue",
	void: "Void"
};
var INVOICE_STATUS_OPTIONS = [{
	value: "all",
	label: "Any status"
}, ...Object.keys(INVOICE_STATUS_LABEL).map((value) => ({
	value,
	label: INVOICE_STATUS_LABEL[value]
}))];
var RECEIPT_STATUS_OPTIONS = [
	{
		value: "all",
		label: "Any status"
	},
	{
		value: "succeeded",
		label: "Succeeded"
	},
	{
		value: "pending",
		label: "Pending"
	},
	{
		value: "failed",
		label: "Failed"
	},
	{
		value: "refunded",
		label: "Refunded"
	}
];
var FREQUENCY_LABEL = {
	annual: "Annual",
	term: "Per term",
	monthly: "Monthly"
};
function balanceOf(invoice) {
	return Math.max(0, invoice.amount - invoice.amountPaid);
}
function paidShare(invoice) {
	if (invoice.amount <= 0) return 0;
	return Math.min(100, Math.round(invoice.amountPaid / invoice.amount * 100));
}
/** Positive = overdue by N days, negative = due in N days. */
function daysPastDue(dueDate) {
	const due = (/* @__PURE__ */ new Date(`${dueDate.slice(0, 10)}T00:00:00`)).getTime();
	const today = /* @__PURE__ */ new Date();
	today.setHours(0, 0, 0, 0);
	return Math.round((today.getTime() - due) / 864e5);
}
function dueDescriptor(invoice) {
	if (invoice.status === "paid") return {
		label: "Settled",
		tone: "text-success"
	};
	if (invoice.status === "void") return {
		label: "Voided",
		tone: "text-muted-foreground"
	};
	const days = daysPastDue(invoice.dueDate);
	if (days > 0) return {
		label: `${days} day${days === 1 ? "" : "s"} overdue`,
		tone: "text-destructive"
	};
	if (days === 0) return {
		label: "Due today",
		tone: "text-warning"
	};
	const ahead = Math.abs(days);
	return {
		label: `Due in ${ahead} day${ahead === 1 ? "" : "s"}`,
		tone: "text-muted-foreground"
	};
}
function rateTone(rate) {
	if (rate >= 90) return "text-success";
	if (rate >= 75) return "text-foreground";
	if (rate >= 60) return "text-warning";
	return "text-destructive";
}
function Line({ label, value, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-start justify-between gap-4 py-1.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "num max-w-[60%] truncate text-right text-xs font-medium text-foreground",
			"data-testid": testId,
			children: value
		})]
	});
}
function ReceiptDialog({ payment, onOpenChange, schoolName = "Everest English Boarding Secondary School" }) {
	const download = () => {
		if (!payment) return;
		const lines = [
			schoolName,
			"Payment receipt",
			"",
			`Receipt no      : ${payment.receiptNo}`,
			`Invoice no      : ${payment.invoiceNo}`,
			`Student         : ${payment.studentName}`,
			`Amount          : ${formatCurrency(payment.amount)}`,
			`Method          : ${METHOD_LABEL[payment.method]}`,
			`Reference       : ${payment.reference}`,
			`Status          : ${payment.status}`,
			`Paid at         : ${formatDateTime(payment.paidAt)}`,
			`Recorded by     : ${payment.recordedBy}`,
			"",
			"This is a demo receipt generated by the ScMS admin template."
		];
		downloadTextFile(`${payment.receiptNo}.txt`, lines.join("\n"), "text/plain");
		toast.success(`${payment.receiptNo} downloaded`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open: Boolean(payment),
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-hairline bg-popover sm:max-w-md",
			"data-testid": "receipt-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "h-4 w-4 text-primary" }), " Receipt"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: payment ? `${payment.receiptNo} · ${payment.studentName}` : "No receipt selected." })] }),
				payment && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-hairline bg-surface-2 p-4",
					"data-testid": "receipt-dialog-body",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-3 border-b border-hairline pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-display text-sm font-semibold text-foreground",
									children: schoolName
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-[11px] text-muted-foreground",
									children: "Fee payment receipt"
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
								value: payment.status,
								testId: "receipt-dialog-status"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num mt-3 font-display text-2xl font-semibold leading-none text-foreground",
							"data-testid": "receipt-dialog-amount",
							children: formatCurrency(payment.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-[11px] text-muted-foreground",
							children: formatDateTime(payment.paidAt)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-3 divide-y divide-hairline border-t border-hairline pt-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Receipt no",
									value: payment.receiptNo,
									testId: "receipt-dialog-no"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Invoice",
									value: payment.invoiceNo
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Student",
									value: payment.studentName
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Method",
									value: METHOD_LABEL[payment.method]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Reference",
									value: payment.reference
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									label: "Recorded by",
									value: payment.recordedBy
								})
							]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "receipt-dialog-close",
					children: "Close"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					className: "gap-1.5",
					onClick: download,
					"data-testid": "receipt-dialog-download",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download"]
				})] })
			]
		})
	});
}
//#endregion
export { FREQUENCY_LABEL, INVOICE_STATUS_OPTIONS, METHOD_ICON, METHOD_LABEL, METHOD_OPTIONS, RECEIPT_STATUS_OPTIONS, ReceiptDialog, RecordPaymentDialog, balanceOf, dueDescriptor, paidShare, rateTone };
