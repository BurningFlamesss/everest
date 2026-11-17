import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	Banknote,
	CheckCircle2,
	Loader2,
	Receipt,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import {
	createFeeStructureAction,
	deleteFeeStructureAction,
	generateInvoicesAction,
	getFinanceDataFn,
	recordPaymentAction,
} from "#/packages/finance/server.ts";

export const Route = createFileRoute("/admin/_admin/fees")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_FEES")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminFees,
});

type Tab = "structures" | "invoices";

interface TermOption {
	id: string;
	name: string;
	academicYear: { name: string };
}

interface StructureRow {
	id: string;
	name: string;
	grade: string | null;
	section: string | null;
	amount: number;
	dueDate: string | Date;
	term: { name: string; academicYear: { name: string } };
	_count: { invoices: number };
}

interface InvoiceRow {
	id: string;
	amount: number;
	status: string;
	dueDate: string | Date;
	student: { id: string; user: { name: string; email: string } };
	term: { name: string };
	feeStructure: { name: string } | null;
	payments: Array<{
		id: string;
		amount: number;
		method: string;
		paidAt: string | Date;
	}>;
}

function money(value: number) {
	return (value / 100).toLocaleString(undefined, {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	});
}

function paidOf(invoice: InvoiceRow) {
	return invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
}

function AdminFees() {
	const [tab, setTab] = useState<Tab>("structures");
	const [terms, setTerms] = useState<Array<TermOption>>([]);
	const [structures, setStructures] = useState<Array<StructureRow>>([]);
	const [invoices, setInvoices] = useState<Array<InvoiceRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [payInvoiceId, setPayInvoiceId] = useState("");
	const [paymentAmount, setPaymentAmount] = useState("");
	const [paymentMethod, setPaymentMethod] = useState("Cash");
	const [pendingStructure, setPendingStructure] = useState<StructureRow | null>(
		null,
	);
	const [isDeletingStructure, setIsDeletingStructure] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getFinanceDataFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setTerms(response.terms as Array<TermOption>);
		setStructures(response.structures as Array<StructureRow>);
		setInvoices(response.invoices as Array<InvoiceRow>);
		setError("");
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createStructure = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const rupees = Number(data.get("amount") ?? 0);
		const response = await createFeeStructureAction({
			data: {
				termId: String(data.get("termId") ?? ""),
				name: String(data.get("name") ?? ""),
				grade: String(data.get("grade") ?? "") || undefined,
				section: String(data.get("section") ?? "") || undefined,
				amount: Math.round(rupees * 100),
				dueDate: String(data.get("dueDate") ?? ""),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setNotice("Fee structure created.");
		await load();
	};

	const generate = async (id: string) => {
		setError("");
		const response = await generateInvoicesAction({
			data: { feeStructureId: id },
		});

		if (!response.success) setError(response.error);
		else {
			setNotice(`${response.count} invoice(s) issued.`);
			setTab("invoices");
			await load();
		}
	};

	const pay = async (invoice: InvoiceRow) => {
		setError("");
		setNotice("");

		const amount = Math.round(Number(paymentAmount) * 100);

		if (!Number.isFinite(amount) || amount <= 0) {
			setError("Enter a payment amount.");
			return;
		}

		setIsSubmitting(true);
		const response = await recordPaymentAction({
			data: {
				invoiceId: invoice.id,
				amount,
				method: paymentMethod,
			},
		});
		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setPayInvoiceId("");
		setPaymentAmount("");
		setNotice("Payment recorded.");
		await load();
	};

	const removeStructure = async (structure: StructureRow) => {
		setIsDeletingStructure(true);
		try {
			const response = await deleteFeeStructureAction({
				data: { id: structure.id },
			});
			if (!response.success) setError(response.error);
			else {
				setPendingStructure(null);
				setNotice("Fee structure deleted.");
				await load();
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this fee structure.",
			);
		} finally {
			setIsDeletingStructure(false);
		}
	};

	return (
		<div data-testid="fees-page">
			<PageHeader
				eyebrow="Operations"
				title="Fees & finance"
				description="Phase 1: define what is due, issue invoices and record payments. No online gateway yet."
				meta={
					<>
						<span data-testid="fees-term-count">
							{terms.length} term{terms.length === 1 ? "" : "s"}
						</span>
						<span data-testid="fees-structure-count">
							{structures.length} structure{structures.length === 1 ? "" : "s"}
						</span>
						<span data-testid="fees-invoice-count">
							{invoices.length} invoice{invoices.length === 1 ? "" : "s"}
						</span>
					</>
				}
				testId="fees-page-header"
			/>

			<div className="space-y-5">
				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="fees-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
						data-testid="fees-notice-banner"
					>
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{notice}</p>
					</div>
				) : null}

				<Tabs
					value={tab}
					onValueChange={(value: string) => setTab(value as Tab)}
				>
					<TabsList className="h-9" data-testid="fees-tabs">
						<TabsTrigger value="structures" data-testid="fees-tab-structures">
							Structures
						</TabsTrigger>
						<TabsTrigger value="invoices" data-testid="fees-tab-invoices">
							Invoices
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{tab === "structures" ? (
					<>
						<Panel
							title="New fee structure"
							description="Define what is due, for which grades, and when."
							testId="fees-new-structure-panel"
							bodyClassName="p-5"
						>
							<form
								onSubmit={(event) => void createStructure(event)}
								className="grid gap-4 md:grid-cols-3"
							>
								<div className="space-y-2">
									<Label htmlFor="fee-term" className="text-xs">
										Term
									</Label>
									<select
										id="fee-term"
										name="termId"
										required
										className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
									>
										<option value="">Select…</option>
										{terms.map((term) => (
											<option key={term.id} value={term.id}>
												{term.academicYear.name} · {term.name}
											</option>
										))}
									</select>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fee-name" className="text-xs">
										Name
									</Label>
									<Input
										id="fee-name"
										name="name"
										required
										placeholder="Tuition"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fee-amount" className="text-xs">
										Amount (₹)
									</Label>
									<Input
										id="fee-amount"
										type="number"
										name="amount"
										min={0}
										step="0.01"
										required
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fee-grade" className="text-xs">
										Grade
									</Label>
									<Input id="fee-grade" name="grade" placeholder="All grades" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="fee-section" className="text-xs">
										Section
									</Label>
									<Input
										id="fee-section"
										name="section"
										placeholder="All sections"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="fee-due-date" className="text-xs">
										Due
									</Label>
									<Input
										id="fee-due-date"
										type="date"
										name="dueDate"
										required
									/>
								</div>
								<div className="md:col-span-3">
									<Button
										type="submit"
										size="sm"
										className="gap-1.5"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<Banknote className="h-3.5 w-3.5" />
										)}
										Create structure
									</Button>
								</div>
							</form>
						</Panel>

						<Panel
							title="Fee structures"
							description="Issue invoices for every active student matching a structure."
							testId="fees-structures-panel"
							bodyClassName="p-0"
						>
							{isLoading ? (
								<div className="p-5" data-testid="fees-structures-loading">
									<ListSkeleton rows={5} />
								</div>
							) : structures.length === 0 ? (
								<EmptyState
									compact
									icon={Receipt}
									title="No fee structures yet"
									description="Create the first structure above, then issue invoices from it."
									testId="fees-structures-empty"
								/>
							) : (
								<ul className="divide-y divide-hairline/60">
									{structures.map((structure) => (
										<li
											key={structure.id}
											className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
											data-testid={`fees-structure-${structure.id}`}
										>
											<div className="min-w-0">
												<p className="text-sm font-medium text-foreground">
													{structure.name} ·{" "}
													<span className="num">{money(structure.amount)}</span>
												</p>
												<p className="num mt-0.5 text-xs text-muted-foreground">
													{structure.term.academicYear.name} ·{" "}
													{structure.term.name}
													{structure.grade ? ` · Grade ${structure.grade}` : ""}
													{structure.section ? ` ${structure.section}` : ""} ·
													due {new Date(structure.dueDate).toLocaleDateString()}{" "}
													· {structure._count.invoices} invoice
													{structure._count.invoices === 1 ? "" : "s"}
												</p>
											</div>
											<div className="flex shrink-0 items-center gap-2">
												<Button
													type="button"
													size="sm"
													className="gap-1.5"
													onClick={() => void generate(structure.id)}
													data-testid={`fees-generate-${structure.id}`}
												>
													Issue invoices
												</Button>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
													onClick={() => setPendingStructure(structure)}
													data-testid={`fees-delete-${structure.id}`}
												>
													<Trash2 className="h-3.5 w-3.5" /> Delete
												</Button>
											</div>
										</li>
									))}
								</ul>
							)}
						</Panel>
					</>
				) : (
					<Panel
						title="Invoices"
						description="Record payments against each student invoice."
						testId="fees-invoices-panel"
						bodyClassName="p-0"
					>
						{isLoading ? (
							<div className="p-5" data-testid="fees-invoices-loading">
								<ListSkeleton rows={5} />
							</div>
						) : invoices.length === 0 ? (
							<EmptyState
								compact
								icon={Receipt}
								title="No invoices yet"
								description="Issue them from a fee structure."
								testId="fees-invoices-empty"
							/>
						) : (
							<ul className="divide-y divide-hairline/60">
								{invoices.map((invoice) => {
									const paid = paidOf(invoice);
									const balance = invoice.amount - paid;

									return (
										<li
											key={invoice.id}
											className="px-5 py-4"
											data-testid={`fees-invoice-${invoice.id}`}
										>
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div className="min-w-0">
													<p className="text-sm font-medium text-foreground">
														{invoice.student.user.name} ·{" "}
														{invoice.feeStructure?.name ?? "Fee"}
													</p>
													<p className="num mt-0.5 text-xs text-muted-foreground">
														{invoice.term.name} · due{" "}
														{new Date(invoice.dueDate).toLocaleDateString()} ·{" "}
														{money(paid)} of {money(invoice.amount)} paid
													</p>
												</div>
												<div className="flex items-center gap-2">
													<StatusBadge
														value={invoice.status.toLowerCase()}
														testId={`fees-invoice-status-${invoice.id}`}
													/>
													{balance > 0 ? (
														<Button
															type="button"
															variant="outline"
															size="sm"
															className="gap-1.5"
															onClick={() => {
																setPayInvoiceId(
																	payInvoiceId === invoice.id ? "" : invoice.id,
																);
																setPaymentAmount(String(balance / 100));
															}}
															data-testid={`fees-pay-${invoice.id}`}
														>
															Record payment
														</Button>
													) : null}
												</div>
											</div>

											{payInvoiceId === invoice.id ? (
												<div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg border border-hairline bg-surface-2 p-3">
													<label className="grid gap-1.5">
														<span className="text-xs font-medium text-foreground">
															Amount (₹)
														</span>
														<input
															type="number"
															min={0}
															step="0.01"
															value={paymentAmount}
															onChange={(event) =>
																setPaymentAmount(event.target.value)
															}
															className="h-9 w-32 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
														/>
													</label>
													<label className="grid gap-1.5">
														<span className="text-xs font-medium text-foreground">
															Method
														</span>
														<select
															value={paymentMethod}
															onChange={(event) =>
																setPaymentMethod(event.target.value)
															}
															className="h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
														>
															<option>Cash</option>
															<option>Bank transfer</option>
															<option>Cheque</option>
															<option>Card</option>
															<option>UPI</option>
														</select>
													</label>
													<Button
														type="button"
														size="sm"
														className="gap-1.5"
														onClick={() => void pay(invoice)}
														disabled={isSubmitting}
													>
														Save payment
													</Button>
												</div>
											) : null}

											{invoice.payments.length > 0 ? (
												<ul className="num mt-2 space-y-1 text-xs text-muted-foreground">
													{invoice.payments.map((payment) => (
														<li key={payment.id}>
															{money(payment.amount)} · {payment.method} ·{" "}
															{new Date(payment.paidAt).toLocaleDateString()}
														</li>
													))}
												</ul>
											) : null}
										</li>
									);
								})}
							</ul>
						)}
					</Panel>
				)}
			</div>

			<ConfirmDialog
				open={!!pendingStructure}
				onOpenChange={(open) => !open && setPendingStructure(null)}
				testId="fees-delete-confirm"
				title="Delete this fee structure?"
				description={`Delete ${pendingStructure?.name ?? "this structure"}? Issued invoices stay recorded.`}
				confirmLabel="Delete"
				destructive
				busy={isDeletingStructure}
				onConfirm={() =>
					pendingStructure && void removeStructure(pendingStructure)
				}
			/>
		</div>
	);
}
