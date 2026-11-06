import { createFileRoute, redirect } from "@tanstack/react-router";
import { Printer, Receipt } from "lucide-react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getMyFeesFn } from "#/packages/finance/server.ts";

export const Route = createFileRoute("/my-fees")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) throw redirect({ to: "/login" });

		return { viewer };
	},
	loader: () => getMyFeesFn(),
	component: MyFees,
});

function money(value: number) {
	return (value / 100).toLocaleString(undefined, {
		style: "currency",
		currency: "INR",
		maximumFractionDigits: 2,
	});
}

function MyFees() {
	const data = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
							Fees
						</p>
						<h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
							Invoices & receipts
						</h1>
						<p className="mt-3 max-w-2xl text-muted-foreground">
							What has been billed, what has been paid, and what is still due.
						</p>
					</div>
					<button
						type="button"
						onClick={() => window.print()}
						className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted print:hidden"
					>
						<Printer className="h-4 w-4" /> Print
					</button>
				</div>
			</section>

			<section className="space-y-6 px-6 md:px-16">
				{data.length === 0 ? (
					<div className="rounded-2xl border border-border bg-card p-10 text-center">
						<Receipt className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-3 text-muted-foreground">
							No invoices are linked to this account yet.
						</p>
					</div>
				) : (
					data.map((entry) => (
						<article
							key={entry.student.id}
							className="overflow-hidden rounded-2xl border border-border bg-card"
						>
							<header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
								<h2 className="text-lg font-semibold text-foreground">
									{entry.student.name}
								</h2>
								<div className="text-right text-sm">
									<p className="text-muted-foreground">
										Paid {money(entry.paid)} of {money(entry.total)}
									</p>
									<p
										className={
											entry.balance > 0
												? "font-semibold text-red-600"
												: "font-semibold text-green-700"
										}
									>
										{entry.balance > 0
											? `${money(entry.balance)} due`
											: "Fully paid"}
									</p>
								</div>
							</header>
							{entry.invoices.length === 0 ? (
								<p className="p-6 text-sm text-muted-foreground">
									No invoices yet.
								</p>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
											<tr>
												<th className="px-6 py-3">Fee</th>
												<th className="px-3 py-3">Term</th>
												<th className="px-3 py-3">Due</th>
												<th className="px-3 py-3">Amount</th>
												<th className="px-6 py-3">Status</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{entry.invoices.map((invoice) => (
												<tr key={invoice.id}>
													<td className="px-6 py-3 font-medium text-foreground">
														{invoice.feeStructure?.name ?? "School fee"}
													</td>
													<td className="px-3 py-3 text-muted-foreground">
														{invoice.term.name}
													</td>
													<td className="px-3 py-3 text-muted-foreground">
														{new Date(invoice.dueDate).toLocaleDateString()}
													</td>
													<td className="px-3 py-3 text-foreground">
														{money(invoice.amount)}
													</td>
													<td className="px-6 py-3">
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
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</article>
					))
				)}
			</section>
		</main>
	);
}
