import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Check, ChevronsUpDown, Copy, CreditCard, Download, Ellipsis, FilePlusCorner, FileText, Pencil, Plus, Receipt, RotateCcw, ShieldOff, Trash2, Wallet } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Skeleton } from "./skeleton-Dhh7pexn.mjs";
import { Tabs, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { addDays, downloadTextFile, formatCurrency, formatDate, formatDateTime, relativeTime, toCsv, toDateKey } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { PanelSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { listAcademicYears } from "./website-DZTFoYsv.mjs";
import { Command$1, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "./command-BzGKVTov.mjs";
import { createFeeStructure, createInvoice, deleteFeeStructure, deleteInvoice, getPaymentsAnalytics, invoiceFilterOptions, listFeeStructures, listInvoices, listPayments, paymentsSummary, refundPayment, studentBalances, updateFeeStructure, voidInvoice } from "./operations-gGGfOgxw.mjs";
import { listClasses } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { Popover, PopoverContent, PopoverTrigger } from "./popover-BTFlDfBT.mjs";
import { DateField } from "./DateField-D_49KJt4.mjs";
import { Bar, BarChart, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "../_libs/recharts+[...].mjs";
import { FREQUENCY_LABEL, INVOICE_STATUS_OPTIONS, METHOD_ICON, METHOD_LABEL, METHOD_OPTIONS, RECEIPT_STATUS_OPTIONS, ReceiptDialog, RecordPaymentDialog, balanceOf, dueDescriptor, paidShare, rateTone } from "./ReceiptDialog-Qb0gTNGN.mjs";
import { listStudents } from "./students-IDW3j9qD.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/payments-D_qawbc2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var PAGE_SIZE$1 = 10;
function InvoicesTable({ canManage, status, onStatusChange, onRecordPayment, onIssue }) {
	const { actor } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [term, setTerm] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [sort, setSort] = (0, import_react.useState)({
		key: "dueDate",
		dir: "asc"
	});
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [pendingVoid, setPendingVoid] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["invoices", {
			search,
			status,
			grade
		}],
		queryFn: () => listInvoices({
			search,
			status,
			grade,
			pageSize: 1e3
		})
	});
	const options = invoiceFilterOptions();
	const rows = (data?.rows ?? []).filter((row) => term === "all" || row.term === term);
	const sorted = [...rows].sort((a, b) => {
		const dir = sort.dir === "asc" ? 1 : -1;
		switch (sort.key) {
			case "student": return a.studentName.localeCompare(b.studentName) * dir;
			case "amount": return (a.amount - b.amount) * dir;
			case "paid": return (a.amountPaid - b.amountPaid) * dir;
			case "balance": return (balanceOf(a) - balanceOf(b)) * dir;
			case "status": return a.status.localeCompare(b.status) * dir;
			case "invoiceNo": return a.invoiceNo.localeCompare(b.invoiceNo) * dir;
			default: return (a.dueDate < b.dueDate ? -1 : 1) * dir;
		}
	});
	const paged = sorted.slice((page - 1) * PAGE_SIZE$1, page * PAGE_SIZE$1);
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["invoices"] });
		qc.invalidateQueries({ queryKey: ["payments"] });
		qc.invalidateQueries({ queryKey: ["payments-analytics"] });
		qc.invalidateQueries({ queryKey: ["payments-summary"] });
		qc.invalidateQueries({ queryKey: ["student-balances"] });
		qc.invalidateQueries({ queryKey: ["students"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const voidMutation = useMutation({
		mutationFn: (id) => voidInvoice(id, actor),
		onSuccess: (invoice) => {
			toast.success(`${invoice.invoiceNo} voided`);
			setPendingVoid(null);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteInvoice(id, actor),
		onSuccess: () => {
			toast.success("Invoice deleted");
			setPendingDelete(null);
			setSelected([]);
			invalidate();
		},
		onError: (error) => toast.error(error.message)
	});
	const exportRows = (list) => {
		if (list.length === 0) {
			toast.error("Nothing to export with these filters.");
			return;
		}
		const csv = toCsv(list.map((row) => ({
			invoiceNo: row.invoiceNo,
			student: row.studentName,
			grade: row.grade,
			term: row.term,
			amount: row.amount,
			amountPaid: row.amountPaid,
			balance: balanceOf(row),
			issued: row.issuedDate,
			due: row.dueDate,
			status: row.status
		})));
		downloadTextFile(`northfield-invoices-${Date.now()}.csv`, csv);
		toast.success(`Exported ${list.length} invoices`);
	};
	const resetFilters = () => {
		setSearch("");
		setGrade("all");
		setTerm("all");
		onStatusChange("all");
		setPage(1);
	};
	const columns = [
		{
			key: "invoiceNo",
			header: "Invoice",
			sortable: true,
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: row.studentName,
				subtitle: row.invoiceNo,
				avatarUrl: row.studentAvatar,
				to: `/payments/invoices/${row.id}`,
				mono: true,
				testId: `invoices-row-link-${row.id}`
			})
		},
		{
			key: "term",
			header: "Grade / term",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-foreground",
					children: row.grade
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: row.term
				})]
			})
		},
		{
			key: "amount",
			header: "Invoiced",
			sortable: true,
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-sm text-foreground",
				children: formatCurrency(row.amount)
			})
		},
		{
			key: "paid",
			header: "Collected",
			sortable: true,
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto w-24",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num text-sm font-medium text-success",
					children: formatCurrency(row.amountPaid)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-1 block h-1 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("block h-full rounded-full", row.status === "void" ? "bg-muted-foreground" : "bg-success"),
						style: { width: `${paidShare(row)}%` }
					})
				})]
			})
		},
		{
			key: "balance",
			header: "Balance",
			sortable: true,
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("num text-sm font-semibold", balanceOf(row) > 0 && row.status !== "void" ? "text-destructive" : "text-muted-foreground"),
				"data-testid": `invoices-balance-${row.id}`,
				children: formatCurrency(balanceOf(row))
			})
		},
		{
			key: "dueDate",
			header: "Due",
			sortable: true,
			render: (row) => {
				const due = dueDescriptor(row);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num text-sm text-foreground",
					children: formatDate(row.dueDate)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: cn("text-xs", due.tone),
					children: due.label
				})] });
			}
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: row.status,
				testId: `invoices-status-${row.id}`
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
					"aria-label": "Invoice actions",
					"data-testid": `invoices-actions-${row.id}`,
					className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
					onClick: (event) => event.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-52 bg-popover",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
						className: "truncate font-mono text-xs",
						children: row.invoiceNo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						"data-testid": `invoices-open-${row.id}`,
						onClick: () => navigate(`/payments/invoices/${row.id}`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-2 h-3.5 w-3.5" }), " Open invoice"]
					}),
					canManage && row.status !== "paid" && row.status !== "void" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						"data-testid": `invoices-record-${row.id}`,
						onClick: () => onRecordPayment(row),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "mr-2 h-3.5 w-3.5" }), " Record a payment"]
					}),
					row.status !== "paid" && row.status !== "void" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						"data-testid": `invoices-checkout-${row.id}`,
						onClick: () => navigate(`/payments/checkout/${row.id}`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CreditCard, { className: "mr-2 h-3.5 w-3.5" }), " Pay online (demo)"]
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						row.status !== "void" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							"data-testid": `invoices-void-${row.id}`,
							onClick: () => setPendingVoid(row),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "mr-2 h-3.5 w-3.5" }), " Void invoice"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							"data-testid": `invoices-delete-${row.id}`,
							onClick: () => setPendingDelete(row),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-3.5 w-3.5" }), " Delete invoice"]
						})
					] })
				]
			})] })
		}
	];
	const totals = rows.reduce((acc, row) => ({
		billed: acc.billed + row.amount,
		collected: acc.collected + row.amountPaid
	}), {
		billed: 0,
		collected: 0
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "invoices-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "invoices-filters",
				search,
				onSearchChange: (value) => {
					setSearch(value);
					setPage(1);
				},
				placeholder: "Search by student or invoice number…",
				filters: [
					{
						key: "status",
						label: "Status",
						value: status,
						options: INVOICE_STATUS_OPTIONS,
						onChange: (value) => {
							onStatusChange(value);
							setPage(1);
						},
						width: "w-[140px]"
					},
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
						key: "term",
						label: "Term",
						value: term,
						options: toOptions(options.terms, "All terms"),
						onChange: (value) => {
							setTerm(value);
							setPage(1);
						},
						width: "w-[130px]"
					}
				],
				onReset: resetFilters,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-9 gap-1.5 text-xs",
					"data-testid": "invoices-export",
					onClick: () => exportRows(rows),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "invoices-table",
				columns,
				rows: paged,
				rowId: (row) => row.id,
				rowTestId: (row) => `invoices-row-${row.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => refetch(),
				onRowClick: (row) => navigate(`/payments/invoices/${row.id}`),
				selectable: true,
				selected,
				onSelectedChange: setSelected,
				bulkActions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-7 gap-1.5 px-2 text-xs",
					"data-testid": "invoices-bulk-export",
					onClick: () => exportRows(rows.filter((row) => selected.includes(row.id))),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export selected"]
				}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-7 gap-1.5 px-2 text-xs text-destructive",
					"data-testid": "invoices-bulk-void",
					onClick: () => {
						const target = rows.find((row) => selected.includes(row.id) && row.status !== "void");
						if (!target) {
							toast.error("Selected invoices are already void.");
							return;
						}
						setPendingVoid(target);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "h-3.5 w-3.5" }), " Void"]
				})] }),
				sort,
				onSortChange: (next) => {
					setSort(next);
					setPage(1);
				},
				page,
				pageSize: PAGE_SIZE$1,
				total: sorted.length,
				onPageChange: setPage,
				footNote: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "invoices-table-totals",
					children: [
						sorted.length,
						" invoices · ",
						formatCurrency(totals.billed),
						" billed · ",
						formatCurrency(totals.collected),
						" ",
						"collected"
					]
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: FileText,
					title: "No invoices match these filters",
					description: "Try another status, grade or term — or issue a new invoice for a student.",
					primaryLabel: canManage ? "Issue an invoice" : void 0,
					onPrimary: onIssue,
					secondaryLabel: "Clear filters",
					onSecondary: resetFilters,
					testId: "invoices-empty"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingVoid),
				onOpenChange: (open) => !open && setPendingVoid(null),
				title: "Void this invoice?",
				description: `${pendingVoid?.invoiceNo} will be marked void and the outstanding balance of ${formatCurrency(pendingVoid ? balanceOf(pendingVoid) : 0)} is removed from ${pendingVoid?.studentName}'s account.`,
				confirmLabel: "Void invoice",
				busy: voidMutation.isPending,
				onConfirm: () => pendingVoid && voidMutation.mutate(pendingVoid.id),
				testId: "invoices-void-confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this invoice?",
				description: `${pendingDelete?.invoiceNo} and every receipt recorded against it will be permanently removed.`,
				confirmLabel: "Delete invoice",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => pendingDelete && deleteMutation.mutate(pendingDelete.id),
				testId: "invoices-delete-confirm"
			})
		]
	});
}
var PAGE_SIZE = 10;
function ReceiptsTable({ canManage }) {
	const { actor } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [method, setMethod] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [sort, setSort] = (0, import_react.useState)({
		key: "paidAt",
		dir: "desc"
	});
	const [viewing, setViewing] = (0, import_react.useState)(null);
	const [pendingRefund, setPendingRefund] = (0, import_react.useState)(null);
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["payments", {
			search,
			method,
			status
		}],
		queryFn: () => listPayments({
			search,
			method,
			status,
			pageSize: 1e3
		})
	});
	const sorted = [...data?.rows ?? []].sort((a, b) => {
		const dir = sort.dir === "asc" ? 1 : -1;
		switch (sort.key) {
			case "amount": return (a.amount - b.amount) * dir;
			case "student": return a.studentName.localeCompare(b.studentName) * dir;
			case "method": return a.method.localeCompare(b.method) * dir;
			case "status": return a.status.localeCompare(b.status) * dir;
			default: return (a.paidAt < b.paidAt ? -1 : 1) * dir;
		}
	});
	const paged = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
	const refundMutation = useMutation({
		mutationFn: (id) => refundPayment(id, actor),
		onSuccess: (payment) => {
			toast.success(`${payment.receiptNo} refunded`);
			setPendingRefund(null);
			qc.invalidateQueries({ queryKey: ["payments"] });
			qc.invalidateQueries({ queryKey: ["invoices"] });
			qc.invalidateQueries({ queryKey: ["payments-analytics"] });
			qc.invalidateQueries({ queryKey: ["payments-summary"] });
			qc.invalidateQueries({ queryKey: ["student-balances"] });
			qc.invalidateQueries({ queryKey: ["students"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const exportRows = () => {
		if (sorted.length === 0) {
			toast.error("Nothing to export with these filters.");
			return;
		}
		const csv = toCsv(sorted.map((row) => ({
			receiptNo: row.receiptNo,
			invoiceNo: row.invoiceNo,
			student: row.studentName,
			amount: row.amount,
			method: row.method,
			reference: row.reference,
			status: row.status,
			paidAt: row.paidAt,
			recordedBy: row.recordedBy
		})));
		downloadTextFile(`northfield-receipts-${Date.now()}.csv`, csv);
		toast.success(`Exported ${sorted.length} receipts`);
	};
	const collected = sorted.filter((row) => row.status === "succeeded").reduce((sum, row) => sum + row.amount, 0);
	const columns = [
		{
			key: "receipt",
			header: "Receipt",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: row.studentName,
				subtitle: row.receiptNo,
				mono: true,
				testId: `receipts-row-name-${row.id}`
			})
		},
		{
			key: "invoice",
			header: "Invoice",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				className: "num font-mono text-xs text-primary underline-offset-2 transition-colors hover:underline focus-ring",
				"data-testid": `receipts-invoice-${row.id}`,
				onClick: (event) => {
					event.stopPropagation();
					navigate(`/payments/invoices/${row.invoiceId}`);
				},
				children: row.invoiceNo
			})
		},
		{
			key: "amount",
			header: "Amount",
			sortable: true,
			align: "right",
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-sm font-semibold text-foreground",
				children: formatCurrency(row.amount)
			})
		},
		{
			key: "method",
			header: "Method",
			sortable: true,
			render: (row) => {
				const Icon = METHOD_ICON[row.method];
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 shrink-0 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "block truncate text-sm text-foreground",
							children: METHOD_LABEL[row.method]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num block truncate font-mono text-[11px] text-muted-foreground",
							children: row.reference
						})]
					})]
				});
			}
		},
		{
			key: "paidAt",
			header: "Paid",
			sortable: true,
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "num text-sm text-foreground",
				children: formatDateTime(row.paidAt)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					relativeTime(row.paidAt),
					" · ",
					row.recordedBy
				]
			})] })
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			render: (row) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: row.status,
				testId: `receipts-status-${row.id}`
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
					"aria-label": "Receipt actions",
					"data-testid": `receipts-actions-${row.id}`,
					className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
					onClick: (event) => event.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-48 bg-popover",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
						className: "truncate font-mono text-xs",
						children: row.receiptNo
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						"data-testid": `receipts-view-${row.id}`,
						onClick: () => setViewing(row),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Receipt, { className: "mr-2 h-3.5 w-3.5" }), " View receipt"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						onClick: () => navigate(`/payments/invoices/${row.invoiceId}`),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mr-2 h-3.5 w-3.5" }), " Open invoice"]
					}),
					canManage && row.status === "succeeded" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						className: "text-destructive focus:text-destructive",
						"data-testid": `receipts-refund-${row.id}`,
						onClick: () => setPendingRefund(row),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "mr-2 h-3.5 w-3.5" }), " Refund payment"]
					})] })
				]
			})] })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "receipts-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "receipts-filters",
				search,
				onSearchChange: (value) => {
					setSearch(value);
					setPage(1);
				},
				placeholder: "Search by student, receipt, reference or invoice…",
				filters: [{
					key: "method",
					label: "Method",
					value: method,
					options: [{
						value: "all",
						label: "Any method"
					}, ...METHOD_OPTIONS],
					onChange: (value) => {
						setMethod(value);
						setPage(1);
					},
					width: "w-[150px]"
				}, {
					key: "status",
					label: "Status",
					value: status,
					options: RECEIPT_STATUS_OPTIONS,
					onChange: (value) => {
						setStatus(value);
						setPage(1);
					},
					width: "w-[140px]"
				}],
				onReset: () => {
					setSearch("");
					setMethod("all");
					setStatus("all");
					setPage(1);
				},
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-9 gap-1.5 text-xs",
					"data-testid": "receipts-export",
					onClick: exportRows,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "receipts-table",
				columns,
				rows: paged,
				rowId: (row) => row.id,
				rowTestId: (row) => `receipts-row-${row.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => refetch(),
				onRowClick: (row) => setViewing(row),
				sort,
				onSortChange: (next) => {
					setSort(next);
					setPage(1);
				},
				page,
				pageSize: PAGE_SIZE,
				total: sorted.length,
				onPageChange: setPage,
				footNote: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "receipts-table-totals",
					children: [
						sorted.length,
						" receipts · ",
						formatCurrency(collected),
						" collected"
					]
				}),
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Receipt,
					title: "No receipts yet",
					description: "Record a payment against an invoice — or use the demo checkout — and the receipt appears here.",
					secondaryLabel: "Clear filters",
					onSecondary: () => {
						setSearch("");
						setMethod("all");
						setStatus("all");
					},
					testId: "receipts-empty"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptDialog, {
				payment: viewing,
				onOpenChange: (open) => !open && setViewing(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingRefund),
				onOpenChange: (open) => !open && setPendingRefund(null),
				title: "Refund this payment?",
				description: `${formatCurrency(pendingRefund?.amount ?? 0)} will be reversed on ${pendingRefund?.invoiceNo} and the balance returns to ${pendingRefund?.studentName}'s account.`,
				confirmLabel: "Refund payment",
				destructive: true,
				busy: refundMutation.isPending,
				onConfirm: () => pendingRefund && refundMutation.mutate(pendingRefund.id),
				testId: "receipts-refund-confirm"
			})
		]
	});
}
var DEFAULT_COMPONENTS = [{
	label: "Tuition",
	amount: 3200
}, {
	label: "Technology & labs",
	amount: 240
}];
function FeeStructureDialog({ open, onOpenChange, structure, grades }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [name, setName] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("");
	const [frequency, setFrequency] = (0, import_react.useState)("term");
	const [academicYearId, setAcademicYearId] = (0, import_react.useState)("");
	const [components, setComponents] = (0, import_react.useState)(DEFAULT_COMPONENTS);
	const [error, setError] = (0, import_react.useState)("");
	const { data: years = [] } = useQuery({
		queryKey: ["academic-years"],
		queryFn: listAcademicYears,
		enabled: open
	});
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setError("");
		if (structure) {
			setName(structure.name);
			setGrade(structure.grade);
			setFrequency(structure.frequency);
			setAcademicYearId(structure.academicYearId);
			setComponents(structure.components.map((row) => ({ ...row })));
		} else {
			setName("");
			setGrade(grades[0] ?? "");
			setFrequency("term");
			setAcademicYearId(years.find((year) => year.isCurrent)?.id ?? years[0]?.id ?? "");
			setComponents(DEFAULT_COMPONENTS.map((row) => ({ ...row })));
		}
	}, [
		open,
		structure,
		years.length
	]);
	const total = components.reduce((sum, row) => sum + (Number(row.amount) || 0), 0);
	const mutation = useMutation({
		mutationFn: () => structure ? updateFeeStructure(structure.id, {
			name,
			grade,
			frequency,
			academicYearId,
			components
		}, actor) : createFeeStructure({
			name,
			grade,
			frequency,
			academicYearId,
			components
		}, actor),
		onSuccess: () => {
			toast.success(structure ? "Fee structure updated" : "Fee structure created");
			qc.invalidateQueries({ queryKey: ["fee-structures"] });
			onOpenChange(false);
		},
		onError: (err) => setError(err.message)
	});
	const submit = () => {
		if (!name.trim()) return setError("Give the structure a name, e.g. “Grade 8 — Annual Fee”.");
		if (!grade) return setError("Choose the grade this structure applies to.");
		if (components.length === 0) return setError("Add at least one fee component.");
		if (components.some((row) => !row.label.trim())) return setError("Every component needs a label.");
		return mutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto border-hairline bg-popover sm:max-w-lg",
			"data-testid": "fee-structure-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-4 w-4 text-primary" }),
						" ",
						structure ? "Edit fee structure" : "New fee structure"
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Components are summed into the headline amount used when issuing invoices for this grade." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "fee-name",
								className: "text-xs",
								children: "Name"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "fee-name",
								value: name,
								placeholder: "Grade 8 — Annual Fee",
								"data-testid": "fee-structure-name",
								onChange: (event) => setName(event.target.value)
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Grade"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: grade,
										onValueChange: setGrade,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "fee-structure-grade",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Grade" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: grades.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: item,
												className: "text-xs",
												children: item
											}, item))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Frequency"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: frequency,
										onValueChange: (value) => setFrequency(value),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "fee-structure-frequency",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "annual",
													className: "text-xs",
													children: "Annual"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "term",
													className: "text-xs",
													children: "Per term"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "monthly",
													className: "text-xs",
													children: "Monthly"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Academic year"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: academicYearId,
										onValueChange: setAcademicYearId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "fee-structure-year",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Year" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: years.map((year) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: year.id,
												className: "text-xs",
												children: year.label
											}, year.id))
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-hairline",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-b border-hairline px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "eyebrow-label",
										children: "Components"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "ghost",
										size: "sm",
										className: "h-7 gap-1.5 px-2 text-xs",
										"data-testid": "fee-structure-add-component",
										onClick: () => setComponents((prev) => [...prev, {
											label: "",
											amount: 0
										}]),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " Add component"]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "divide-y divide-hairline",
									children: components.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-2 px-3 py-2",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												value: row.label,
												placeholder: "Component",
												className: "h-8 flex-1 text-xs",
												"data-testid": `fee-structure-component-label-${index}`,
												onChange: (event) => setComponents((prev) => prev.map((item, i) => i === index ? {
													...item,
													label: event.target.value
												} : item))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												type: "number",
												min: 0,
												value: row.amount,
												className: "num h-8 w-28 text-xs",
												"data-testid": `fee-structure-component-amount-${index}`,
												onChange: (event) => setComponents((prev) => prev.map((item, i) => i === index ? {
													...item,
													amount: Number(event.target.value)
												} : item))
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												"aria-label": "Remove component",
												className: "rounded p-1 text-muted-foreground transition-colors hover:text-destructive focus-ring",
												"data-testid": `fee-structure-remove-component-${index}`,
												onClick: () => setComponents((prev) => prev.filter((_, i) => i !== index)),
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
											})
										]
									}, index))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between border-t border-hairline px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: "Total"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "num text-sm font-semibold text-foreground",
										"data-testid": "fee-structure-total",
										children: formatCurrency(total)
									})]
								})
							]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							"data-testid": "fee-structure-error",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "fee-structure-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: mutation.isPending,
					onClick: submit,
					"data-testid": "fee-structure-submit",
					children: mutation.isPending ? "Saving…" : structure ? "Save structure" : "Create structure"
				})] })
			]
		})
	});
}
function FeeStructuresPanel({ canManage }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const { data: structures = [], isLoading } = useQuery({
		queryKey: ["fee-structures"],
		queryFn: listFeeStructures
	});
	const { data: years = [] } = useQuery({
		queryKey: ["academic-years"],
		queryFn: listAcademicYears
	});
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const grades = Array.from(/* @__PURE__ */ new Set([...classes.map((cls) => cls.grade), ...structures.map((row) => row.grade)])).sort();
	const rows = structures.filter((row) => {
		if (grade !== "all" && row.grade !== grade) return false;
		if (!search.trim()) return true;
		const needle = search.trim().toLowerCase();
		return row.name.toLowerCase().includes(needle) || row.grade.toLowerCase().includes(needle);
	});
	const duplicateMutation = useMutation({
		mutationFn: (structure) => createFeeStructure({
			name: `${structure.name} (copy)`,
			grade: structure.grade,
			frequency: structure.frequency,
			academicYearId: structure.academicYearId,
			components: structure.components.map((component) => ({ ...component }))
		}, actor),
		onSuccess: (structure) => {
			toast.success(`${structure.name} created`);
			qc.invalidateQueries({ queryKey: ["fee-structures"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteMutation = useMutation({
		mutationFn: (id) => deleteFeeStructure(id, actor),
		onSuccess: () => {
			toast.success("Fee structure deleted");
			setPendingDelete(null);
			qc.invalidateQueries({ queryKey: ["fee-structures"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const yearLabel = (id) => years.find((year) => year.id === id)?.label ?? "—";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "fee-structures-panel",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "fee-structures-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search fee structures…",
				filters: [{
					key: "grade",
					label: "Grade",
					value: grade,
					options: toOptions(grades, "All grades"),
					onChange: setGrade
				}],
				onReset: () => {
					setSearch("");
					setGrade("all");
				},
				actions: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "h-9 gap-1.5 text-xs",
					"data-testid": "fee-structures-new",
					onClick: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New structure"]
				}) : void 0
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				"data-testid": "fee-structures-loading",
				children: Array.from({ length: 6 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel space-y-3 p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-32" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-7 w-24" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" })
					]
				}, index))
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Wallet,
					title: "No fee structures yet",
					description: "Fee structures group tuition and other components per grade, and pre-fill the amount when you issue invoices.",
					primaryLabel: canManage ? "Create a structure" : void 0,
					onPrimary: () => {
						setEditing(null);
						setDialogOpen(true);
					},
					testId: "fee-structures-empty"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 md:grid-cols-2 xl:grid-cols-3",
				"data-testid": "fee-structures-grid",
				children: rows.map((structure) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
					testId: `fee-structure-card-${structure.id}`,
					eyebrow: `${structure.grade} · ${FREQUENCY_LABEL[structure.frequency]}`,
					title: structure.name,
					description: yearLabel(structure.academicYearId),
					actions: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-label": "Fee structure actions",
							"data-testid": `fee-structure-actions-${structure.id}`,
							className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-44 bg-popover",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": `fee-structure-edit-${structure.id}`,
								onClick: () => {
									setEditing(structure);
									setDialogOpen(true);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-3.5 w-3.5" }), " Edit structure"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": `fee-structure-duplicate-${structure.id}`,
								onClick: () => duplicateMutation.mutate(structure),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mr-2 h-3.5 w-3.5" }), " Duplicate"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								className: "text-destructive focus:text-destructive",
								"data-testid": `fee-structure-delete-${structure.id}`,
								onClick: () => setPendingDelete(structure),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-3.5 w-3.5" }), " Delete"]
							})
						]
					})] }) : void 0,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num font-display text-2xl font-semibold leading-none text-foreground",
							"data-testid": `fee-structure-amount-${structure.id}`,
							children: formatCurrency(structure.amount)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted-foreground",
							children: [
								structure.components.length,
								" component",
								structure.components.length === 1 ? "" : "s",
								" ·",
								" ",
								FREQUENCY_LABEL[structure.frequency].toLowerCase()
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1.5 border-t border-hairline pt-3",
							children: structure.components.map((component, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex items-center justify-between gap-3 text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "truncate text-muted-foreground",
									children: component.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "num shrink-0 font-medium text-foreground",
									children: formatCurrency(component.amount)
								})]
							}, `${structure.id}-${index}`))
						})
					]
				}, structure.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeeStructureDialog, {
				open: dialogOpen,
				structure: editing,
				grades,
				onOpenChange: (open) => {
					setDialogOpen(open);
					if (!open) setEditing(null);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this fee structure?",
				description: `${pendingDelete?.name} will be removed. Invoices already issued against it keep their amounts.`,
				confirmLabel: "Delete structure",
				destructive: true,
				busy: deleteMutation.isPending,
				onConfirm: () => pendingDelete && deleteMutation.mutate(pendingDelete.id),
				testId: "fee-structures-delete-confirm"
			})
		]
	});
}
var TOOLTIP_STYLE = {
	background: "hsl(var(--popover))",
	border: "1px solid hsl(var(--hairline))",
	borderRadius: 8,
	fontSize: 12
};
function PaymentsAnalytics() {
	const { data, isLoading } = useQuery({
		queryKey: ["payments-analytics"],
		queryFn: getPaymentsAnalytics
	});
	const { data: balances = [] } = useQuery({
		queryKey: ["student-balances"],
		queryFn: () => studentBalances(8)
	});
	if (isLoading || !data) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-2",
		"data-testid": "payments-analytics-loading",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-60" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-60" })
		]
	});
	const maxAgeing = Math.max(1, ...data.ageing.map((row) => row.amount));
	const maxMethod = Math.max(1, ...data.methods.map((row) => row.amount));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid gap-5 lg:grid-cols-12",
		"data-testid": "payments-analytics",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-7",
				eyebrow: "Cash flow",
				title: "Billed vs collected",
				description: "Last six months of invoicing and receipts",
				testId: "payments-collections-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[250px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(ComposedChart, {
							data: data.collections,
							margin: {
								top: 8,
								right: 4,
								bottom: 0,
								left: 4
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "hsl(var(--hairline))",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "month",
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									tickFormatter: (value) => `${Math.round(value / 1e3)}k`,
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: TOOLTIP_STYLE,
									formatter: (value) => formatCurrency(Number(value))
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "billed",
									name: "Billed",
									fill: "hsl(var(--chart-3))",
									radius: [
										3,
										3,
										0,
										0
									],
									barSize: 18
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Line, {
									type: "monotone",
									dataKey: "collected",
									name: "Collected",
									stroke: "hsl(var(--primary))",
									strokeWidth: 1.8,
									dot: { r: 2 }
								})
							]
						})
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-3 flex flex-wrap items-center gap-4 border-t border-hairline pt-3 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-4 rounded-full bg-chart-3" }), " Billed"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-4 rounded-full bg-primary" }), " Collected"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-5",
				eyebrow: "Ageing",
				title: "Outstanding by age",
				description: "Unpaid balance grouped by days past due",
				testId: "payments-ageing-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.ageing.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-testid": `payments-ageing-${row.bucket.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: row.bucket
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num font-semibold text-foreground",
								children: formatCurrency(row.amount)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("block h-full rounded-full", row.bucket === "Due soon" ? "bg-info" : row.bucket === "31+ days" ? "bg-destructive" : "bg-warning"),
									style: { width: `${Math.round(row.amount / maxAgeing * 100)}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num w-20 shrink-0 text-right text-xs text-muted-foreground",
								children: [row.count, " invoices"]
							})]
						})]
					}, row.bucket))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-7",
				eyebrow: "Cohorts",
				title: "Collection rate by grade",
				description: "Share of the billed amount already collected",
				testId: "payments-grade-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "h-[240px]",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
						width: "100%",
						height: "100%",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
							data: data.byGrade,
							margin: {
								top: 8,
								right: 4,
								bottom: 0,
								left: -18
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
									stroke: "hsl(var(--hairline))",
									vertical: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
									dataKey: "grade",
									tickFormatter: (value) => value.replace("Grade ", "G"),
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
									domain: [0, 100],
									tick: {
										fontSize: 10,
										fill: "hsl(var(--muted-foreground))"
									},
									axisLine: false,
									tickLine: false
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
									contentStyle: TOOLTIP_STYLE,
									formatter: (value) => `${value}%`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
									dataKey: "rate",
									name: "Collected %",
									fill: "hsl(var(--primary))",
									radius: [
										3,
										3,
										0,
										0
									],
									barSize: 20
								})
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				className: "lg:col-span-5",
				eyebrow: "Channels",
				title: "Collected by method",
				testId: "payments-methods-panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-3",
					children: data.methods.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						"data-testid": `payments-method-${row.method}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-foreground",
								children: row.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "num font-semibold text-foreground",
								children: formatCurrency(row.amount)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1.5 flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block h-full rounded-full bg-chart-3",
									style: { width: `${Math.round(row.amount / maxMethod * 100)}%` }
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "num w-20 shrink-0 text-right text-xs text-muted-foreground",
								children: [row.count, " receipts"]
							})]
						})]
					}, row.method))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
				className: "lg:col-span-12",
				eyebrow: "Watchlist",
				title: "Largest outstanding balances",
				description: "Follow up with these guardians first",
				bodyClassName: "p-2",
				testId: "payments-balances-panel",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "grid gap-1 sm:grid-cols-2 xl:grid-cols-4",
					children: [balances.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-surface-2",
						"data-testid": `payments-balance-${student.id}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "min-w-0 flex-1",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
								name: `${student.firstName} ${student.lastName}`,
								subtitle: `${student.grade} · ${student.guardian.name}`,
								avatarUrl: student.avatarUrl,
								to: `/admin/students/${student.id}`,
								size: "sm"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num shrink-0 text-sm font-semibold text-destructive",
							children: formatCurrency(student.feeBalance)
						})]
					}, student.id)), balances.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "px-2 py-3 text-sm text-muted-foreground",
						children: "Every student balance is settled."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "px-2 pt-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/students",
						className: "text-xs text-primary underline-offset-2 hover:underline",
						"data-testid": "payments-balances-all",
						children: "Open the student register"
					})
				})]
			})
		]
	});
}
function InvoiceFormDialog({ open, onOpenChange }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [studentId, setStudentId] = (0, import_react.useState)("");
	const [studentPickerOpen, setStudentPickerOpen] = (0, import_react.useState)(false);
	const [feeStructureId, setFeeStructureId] = (0, import_react.useState)("");
	const [term, setTerm] = (0, import_react.useState)("Term 2");
	const [amount, setAmount] = (0, import_react.useState)(0);
	const [dueDate, setDueDate] = (0, import_react.useState)(toDateKey(addDays(/* @__PURE__ */ new Date(), 30)));
	const [error, setError] = (0, import_react.useState)("");
	const { data: studentPage } = useQuery({
		queryKey: ["students", "invoice-picker"],
		queryFn: () => listStudents({
			status: "active",
			pageSize: 500
		}),
		enabled: open
	});
	const { data: structures = [] } = useQuery({
		queryKey: ["fee-structures"],
		queryFn: listFeeStructures,
		enabled: open
	});
	const students = studentPage?.rows ?? [];
	const student = students.find((row) => row.id === studentId);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setStudentId("");
		setFeeStructureId("");
		setTerm("Term 2");
		setAmount(0);
		setDueDate(toDateKey(addDays(/* @__PURE__ */ new Date(), 30)));
		setError("");
	}, [open]);
	(0, import_react.useEffect)(() => {
		if (!student) return;
		const match = structures.find((row) => row.grade === student.grade);
		if (match) {
			setFeeStructureId(match.id);
			setAmount(Math.round(match.amount / 3));
		}
	}, [studentId, structures.length]);
	const mutation = useMutation({
		mutationFn: () => createInvoice({
			studentId,
			feeStructureId,
			term,
			amount,
			dueDate
		}, actor),
		onSuccess: (invoice) => {
			toast.success(`${invoice.invoiceNo} issued to ${invoice.studentName}`);
			qc.invalidateQueries({ queryKey: ["invoices"] });
			qc.invalidateQueries({ queryKey: ["payments-analytics"] });
			qc.invalidateQueries({ queryKey: ["student-balances"] });
			qc.invalidateQueries({ queryKey: ["students"] });
			onOpenChange(false);
		},
		onError: (err) => setError(err.message)
	});
	const submit = () => {
		if (!studentId) return setError("Choose the student this invoice is for.");
		if (!feeStructureId) return setError("Choose a fee structure.");
		if (!amount || amount <= 0) return setError("Enter an invoice amount greater than zero.");
		return mutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-hairline bg-popover sm:max-w-lg",
			"data-testid": "invoice-form-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center gap-2 font-display",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlusCorner, { className: "h-4 w-4 text-primary" }), " Issue an invoice"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The invoice is added as unpaid and the student's outstanding balance updates immediately." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Student"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
									open: studentPickerOpen,
									onOpenChange: setStudentPickerOpen,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											className: "w-full justify-between font-normal",
											"data-testid": "invoice-form-student",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("truncate", !student && "text-muted-foreground"),
												children: student ? `${student.firstName} ${student.lastName} · ${student.grade} ${student.section}` : "Search for a student…"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsUpDown, { className: "ml-2 h-3.5 w-3.5 shrink-0 opacity-50" })]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
										className: "w-[--radix-popover-trigger-width] border-hairline bg-popover p-0",
										align: "start",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
											placeholder: "Search students…",
											"data-testid": "invoice-form-student-search"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: "No student matches that search." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, { children: students.slice(0, 200).map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
											value: `${row.firstName} ${row.lastName} ${row.admissionNo}`,
											"data-testid": `invoice-form-student-${row.id}`,
											onSelect: () => {
												setStudentId(row.id);
												setStudentPickerOpen(false);
											},
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: cn("mr-2 h-3.5 w-3.5", row.id === studentId ? "opacity-100" : "opacity-0") }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "min-w-0 flex-1 truncate",
													children: [
														row.firstName,
														" ",
														row.lastName
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num ml-2 font-mono text-[10px] text-muted-foreground",
													children: row.admissionNo
												})
											]
										}, row.id)) })] })] })
									})]
								}),
								student && student.feeBalance > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: ["Existing balance ", formatCurrency(student.feeBalance)]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Fee structure"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: feeStructureId,
										onValueChange: setFeeStructureId,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "invoice-form-structure",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a structure" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: structures.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: row.id,
												className: "text-xs",
												children: [
													row.name,
													" · ",
													formatCurrency(row.amount)
												]
											}, row.id))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Term"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: term,
										onValueChange: setTerm,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "invoice-form-term",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Term 1",
													children: "Term 1"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Term 2",
													children: "Term 2"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Term 3",
													children: "Term 3"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "Annual",
													children: "Annual"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "invoice-amount",
										className: "text-xs",
										children: "Amount"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "invoice-amount",
										type: "number",
										min: 0,
										value: amount,
										"data-testid": "invoice-form-amount",
										onChange: (event) => setAmount(Number(event.target.value))
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Due date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DateField, {
										value: dueDate,
										onChange: setDueDate,
										testId: "invoice-form-due-date"
									})]
								})
							]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							"data-testid": "invoice-form-error",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "invoice-form-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: mutation.isPending,
					onClick: submit,
					"data-testid": "invoice-form-submit",
					children: mutation.isPending ? "Issuing…" : "Issue invoice"
				})] })
			]
		})
	});
}
var TABS = [
	{
		value: "invoices",
		label: "Invoices"
	},
	{
		value: "receipts",
		label: "Receipts"
	},
	{
		value: "structures",
		label: "Fee structures"
	},
	{
		value: "analytics",
		label: "Analytics"
	}
];
function PaymentsPage() {
	const { can } = useAuth();
	const navigate = useNavigate();
	const searchParams = useSearch({ strict: false }) || {};
	const canManage = can("payments.manage");
	const tab = searchParams.tab ?? "invoices";
	const status = searchParams.status ?? "all";
	const [issueOpen, setIssueOpen] = (0, import_react.useState)(false);
	const [recording, setRecording] = (0, import_react.useState)(null);
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
	const { data: summary } = useQuery({
		queryKey: ["payments-summary"],
		queryFn: async () => paymentsSummary()
	});
	const kpis = summary ? [
		{
			key: "billed",
			label: "Billed",
			value: formatCurrency(summary.billed),
			tone: "text-foreground",
			status: "all"
		},
		{
			key: "collected",
			label: "Collected",
			value: formatCurrency(summary.collected),
			tone: "text-success",
			status: "paid"
		},
		{
			key: "outstanding",
			label: "Outstanding",
			value: formatCurrency(summary.outstanding),
			tone: "text-destructive",
			status: "unpaid"
		},
		{
			key: "rate",
			label: "Collection rate",
			value: `${summary.collectionRate}%`,
			tone: rateTone(summary.collectionRate),
			status: "all"
		},
		{
			key: "overdue",
			label: "Overdue invoices",
			value: String(summary.overdueCount),
			tone: "text-destructive",
			status: "overdue"
		},
		{
			key: "overdue-amount",
			label: "Overdue value",
			value: formatCurrency(summary.overdueAmount),
			tone: "text-warning",
			status: "overdue"
		},
		{
			key: "paid",
			label: "Paid invoices",
			value: String(summary.paidCount),
			tone: "text-success",
			status: "paid"
		},
		{
			key: "partial",
			label: "Part-paid",
			value: String(summary.partialCount),
			tone: "text-accent",
			status: "partial"
		}
	] : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "payments-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Operations",
				title: "Payments",
				description: "Issue invoices, record receipts and keep collections on track across every grade and term.",
				meta: summary ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "payments-meta-outstanding",
						children: [
							formatCurrency(summary.outstanding),
							" outstanding across ",
							summary.unpaidCount,
							" invoices"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "payments-meta-rate",
						children: [summary.collectionRate, "% collected this year"]
					}),
					!canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Read-only for your role" })
				] }) : void 0,
				actions: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "payments-issue-invoice",
					onClick: () => setIssueOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilePlusCorner, { className: "h-3.5 w-3.5" }), " Issue invoice"]
				}) : void 0
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-5 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8",
				"data-testid": "payments-kpis",
				children: [kpis.map((kpi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					"data-testid": `payments-kpi-${kpi.key}`,
					onClick: () => {
						navigate({
							search: (prev) => {
								const next = { ...prev };
								next.tab = "invoices";
								if (kpi.status === "all") delete next.status;
								else next.status = kpi.status;
								return next;
							},
							replace: true
						});
					},
					className: cn("rounded-lg border bg-surface-1 px-3 py-2.5 text-left transition-colors duration-150 focus-ring", tab === "invoices" && status !== "all" && status === kpi.status ? "border-primary/50 bg-primary/[0.06]" : "border-hairline hover:border-primary/35 hover:bg-surface-2"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] font-medium text-muted-foreground",
						children: kpi.label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("num mt-1 font-display text-lg font-semibold leading-none", kpi.tone),
						children: kpi.value
					})]
				}, kpi.key)), kpis.length === 0 && Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-[62px] animate-pulse rounded-lg border border-hairline bg-surface-2" }, index))]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
				value: tab,
				onValueChange: (value) => setParam("tab", value),
				className: "mb-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
					className: "h-9",
					"data-testid": "payments-tabs",
					children: TABS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: item.value,
						"data-testid": `payments-tab-${item.value}`,
						children: item.label
					}, item.value))
				})
			}),
			tab === "invoices" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoicesTable, {
				canManage,
				status,
				onStatusChange: (value) => setParam("status", value),
				onRecordPayment: setRecording,
				onIssue: () => setIssueOpen(true)
			}),
			tab === "receipts" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ReceiptsTable, { canManage }),
			tab === "structures" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FeeStructuresPanel, { canManage }),
			tab === "analytics" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PaymentsAnalytics, {}),
			tab === "structures" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-3 flex items-center gap-1.5 text-xs text-muted-foreground",
				"data-testid": "payments-structures-hint",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wallet, { className: "h-3.5 w-3.5" }), " Structures pre-fill the invoice amount for a grade — components are summed into the headline figure."]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(InvoiceFormDialog, {
				open: issueOpen,
				onOpenChange: setIssueOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RecordPaymentDialog, {
				invoice: recording,
				onOpenChange: (open) => !open && setRecording(null)
			})
		]
	});
}
var SplitComponent = PaymentsPage;
//#endregion
export { SplitComponent as component };
