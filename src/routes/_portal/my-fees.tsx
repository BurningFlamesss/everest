import { createFileRoute, redirect } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { STAGGER } from "#/lib/motion";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getMyFeesFn } from "#/packages/finance/server.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/templates/modern/components/kit";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/my-fees")({
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
		<PageFrame testId="my-fees-page">
			<PageHeader
				testId="my-fees-page-header"
				eyebrow="Fees"
				title="Invoices & receipts"
				subtitle="What has been billed, what has been paid, and what is still due."
				actions={
					<Button
						type="button"
						variant="outline"
						className="rounded-field duration-fast print:hidden"
						onClick={() => window.print()}
						data-testid="my-fees-print-button"
					>
						<Printer className="h-4 w-4" aria-hidden="true" />
						Print
					</Button>
				}
			/>

			{data.length === 0 ? (
				<Section testId="fees-empty-section">
					<Reveal>
						<EmptyState
							eyebrow="Finance"
							title="No invoices are linked to this account yet"
							description="Once the school office issues a fee invoice for a student on this account, it will appear here with its payment status."
							testId="my-fees-empty-state"
						/>
					</Reveal>
				</Section>
			) : (
				data.map((entry, index) => (
					<Section
						key={entry.student.id}
						testId={`fees-student-${entry.student.id}`}
					>
						<Reveal delay={Math.min(index, 6) * STAGGER}>
							<SectionHeading
								rule={false}
								title={entry.student.name}
								testId={`fees-student-${entry.student.id}-title`}
								aside={
									<div className="text-right">
										<p className="t-meta">
											Paid {money(entry.paid)} of {money(entry.total)}
										</p>
										<p
											className={
												entry.balance > 0
													? "mt-1 text-[13px] font-semibold text-danger"
													: "mt-1 text-[13px] font-semibold text-success"
											}
										>
											{entry.balance > 0
												? `${money(entry.balance)} due`
												: "Fully paid"}
										</p>
									</div>
								}
							/>

							{entry.invoices.length === 0 ? (
								<div className="mt-6 rounded-card border border-border bg-card">
									<p className="t-caption p-6">No invoices yet.</p>
								</div>
							) : (
								<div className="mt-6 overflow-hidden rounded-card border border-border bg-card">
									<div className="rail-scroll overflow-x-auto">
										<table className="w-full min-w-[640px] border-collapse text-left">
											<thead>
												<tr className="border-b border-border bg-secondary">
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Fee
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Term
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Due
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Amount
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Status
													</th>
												</tr>
											</thead>
											<tbody className="divide-y divide-rule-soft">
												{entry.invoices.map((invoice) => (
													<tr key={invoice.id}>
														<td className="px-4 py-3.5 text-[13.5px] font-medium text-foreground">
															{invoice.feeStructure?.name ?? "School fee"}
														</td>
														<td className="px-4 py-3.5 text-[13px] text-muted-foreground">
															{invoice.term?.name ?? "—"}
														</td>
														<td className="px-4 py-3.5 text-[13px] text-muted-foreground">
															{invoice.dueDate
																? new Date(invoice.dueDate).toLocaleDateString()
																: "—"}
														</td>
														<td className="px-4 py-3.5 text-[13.5px] tabular-nums text-foreground">
															{money(invoice.amount)}
														</td>
														<td className="px-4 py-3.5">
															<span
																className={
																	invoice.status === "PAID"
																		? "rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success"
																		: invoice.status === "PARTIAL"
																			? "rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning"
																			: "rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger"
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
								</div>
							)}
						</Reveal>
					</Section>
				))
			)}
		</PageFrame>
	);
}
