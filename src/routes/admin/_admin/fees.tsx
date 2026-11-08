import { createFileRoute, redirect } from "@tanstack/react-router";
import { Banknote, Loader2, Plus, Receipt, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Fees & finance</h1>
				<p className="mt-1 text-sm text-gray-500">
					Phase 1: define what is due, issue invoices and record payments. No
					online gateway yet.
				</p>
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{notice ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					{notice}
				</div>
			) : null}

			<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
				{(["structures", "invoices"] as Array<Tab>).map((item) => (
					<button
						key={item}
						type="button"
						onClick={() => setTab(item)}
						className={
							tab === item
								? "rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium capitalize text-white"
								: "rounded-md px-3 py-1.5 text-sm font-medium capitalize text-gray-600 hover:bg-gray-100"
						}
					>
						{item}
					</button>
				))}
			</div>

			{tab === "structures" ? (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-red-500" /> New fee structure
						</h2>
						<form
							onSubmit={(event) => void createStructure(event)}
							className="grid gap-4 md:grid-cols-3"
						>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Term
								</span>
								<select
									name="termId"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Select…</option>
									{terms.map((term) => (
										<option key={term.id} value={term.id}>
											{term.academicYear.name} · {term.name}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Name
								</span>
								<input
									name="name"
									required
									placeholder="Tuition"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Amount (₹)
								</span>
								<input
									type="number"
									name="amount"
									min={0}
									step="0.01"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Grade
								</span>
								<input
									name="grade"
									placeholder="All grades"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Section
								</span>
								<input
									name="section"
									placeholder="All sections"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Due
								</span>
								<input
									type="date"
									name="dueDate"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<div className="md:col-span-3">
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Banknote className="h-4 w-4" />
									)}
									Create structure
								</button>
							</div>
						</form>
					</section>

					<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<header className="border-b border-gray-200 px-5 py-4">
							<h2 className="font-semibold text-gray-900">Fee structures</h2>
						</header>
						{isLoading ? (
							<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
								<Loader2 className="h-4 w-4 animate-spin" /> Loading…
							</p>
						) : structures.length === 0 ? (
							<p className="p-8 text-center text-sm text-gray-500">
								No fee structures yet.
							</p>
						) : (
							<ul className="divide-y divide-gray-100">
								{structures.map((structure) => (
									<li
										key={structure.id}
										className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
									>
										<div>
											<p className="font-medium text-gray-900">
												{structure.name} · {money(structure.amount)}
											</p>
											<p className="text-xs text-gray-500">
												{structure.term.academicYear.name} ·{" "}
												{structure.term.name}
												{structure.grade ? ` · Grade ${structure.grade}` : ""}
												{structure.section ? ` ${structure.section}` : ""} · due{" "}
												{new Date(structure.dueDate).toLocaleDateString()} ·{" "}
												{structure._count.invoices} invoice
												{structure._count.invoices === 1 ? "" : "s"}
											</p>
										</div>
										<div className="flex gap-3">
											<button
												type="button"
												onClick={() => void generate(structure.id)}
												className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
											>
												Issue invoices
											</button>
											<button
												type="button"
												onClick={async () => {
													if (!confirm("Delete this fee structure?")) return;
													const response = await deleteFeeStructureAction({
														data: { id: structure.id },
													});
													if (!response.success) setError(response.error);
													else await load();
												}}
												className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
											>
												<Trash2 className="h-3.5 w-3.5" /> Delete
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</section>
				</>
			) : (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
					<header className="flex items-center gap-2 border-b border-gray-200 px-5 py-4">
						<Receipt className="h-5 w-5 text-red-500" />
						<h2 className="font-semibold text-gray-900">Invoices</h2>
					</header>
					{isLoading ? (
						<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
							<Loader2 className="h-4 w-4 animate-spin" /> Loading…
						</p>
					) : invoices.length === 0 ? (
						<p className="p-8 text-center text-sm text-gray-500">
							No invoices yet. Issue them from a fee structure.
						</p>
					) : (
						<ul className="divide-y divide-gray-100">
							{invoices.map((invoice) => {
								const paid = paidOf(invoice);
								const balance = invoice.amount - paid;

								return (
									<li key={invoice.id} className="px-5 py-4">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div>
												<p className="font-medium text-gray-900">
													{invoice.student.user.name} ·{" "}
													{invoice.feeStructure?.name ?? "Fee"}
												</p>
												<p className="text-xs text-gray-500">
													{invoice.term.name} · due{" "}
													{new Date(invoice.dueDate).toLocaleDateString()} ·{" "}
													{money(paid)} of {money(invoice.amount)} paid
												</p>
											</div>
											<div className="flex items-center gap-2">
												<span
													className={
														invoice.status === "PAID"
															? "rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700"
															: invoice.status === "PARTIAL"
																? "rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700"
																: "rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700"
													}
												>
													{invoice.status}
												</span>
												{balance > 0 ? (
													<button
														type="button"
														onClick={() => {
															setPayInvoiceId(
																payInvoiceId === invoice.id ? "" : invoice.id,
															);
															setPaymentAmount(String(balance / 100));
														}}
														className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
													>
														Record payment
													</button>
												) : null}
											</div>
										</div>

										{payInvoiceId === invoice.id ? (
											<div className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-gray-50 p-3">
												<label className="text-xs">
													<span className="mb-1 block font-medium text-gray-700">
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
														className="w-32 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
													/>
												</label>
												<label className="text-xs">
													<span className="mb-1 block font-medium text-gray-700">
														Method
													</span>
													<select
														value={paymentMethod}
														onChange={(event) =>
															setPaymentMethod(event.target.value)
														}
														className="rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
													>
														<option>Cash</option>
														<option>Bank transfer</option>
														<option>Cheque</option>
														<option>Card</option>
														<option>UPI</option>
													</select>
												</label>
												<button
													type="button"
													onClick={() => void pay(invoice)}
													disabled={isSubmitting}
													className="rounded-lg bg-red-500 px-3 py-2 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-60"
												>
													Save payment
												</button>
											</div>
										) : null}

										{invoice.payments.length > 0 ? (
											<ul className="mt-2 text-xs text-gray-500">
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
				</section>
			)}
		</div>
	);
}
