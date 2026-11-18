import { createFileRoute, redirect } from "@tanstack/react-router";
import { Award } from "lucide-react";
import { STAGGER } from "#/lib/motion";
import { getMyResultsFn } from "#/packages/academics/exams-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/my-results")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) throw redirect({ to: "/login" });

		return { viewer };
	},
	loader: () => getMyResultsFn(),
	component: MyResults,
});

function MyResults() {
	const data = Route.useLoaderData();

	return (
		<PageFrame testId="my-results-page" dense>
			<PageHeader
				testId="my-results-page-header"
				eyebrow="Results"
				title="Exam results"
				subtitle="Published marks by exam and course. Results appear here as soon as the school publishes them."
			/>

			{data.length === 0 ? (
				<Section>
					<Reveal>
						<EmptyState
							title="No results have been published for this account yet"
							description="Marks appear here as soon as the school publishes them for any exam."
							testId="my-results-empty-state"
						/>
					</Reveal>
				</Section>
			) : (
				data.map((student, index) => (
					<Section
						key={student.student.id}
						testId={`results-student-${student.student.id}`}
					>
						<Reveal delay={Math.min(index, 6) * STAGGER}>
							<SectionHeading
								rule={false}
								title={student.student.name}
								aside={
									<span className="t-meta inline-flex items-center gap-1.5">
										<Award
											className="h-3.5 w-3.5 text-muted-foreground"
											aria-hidden="true"
										/>
										{student.marks.length} result
										{student.marks.length === 1 ? "" : "s"}
									</span>
								}
							/>

							{student.marks.length === 0 ? (
								<div className="mt-4 overflow-hidden rounded-card border border-border bg-card">
									<p className="t-caption p-6">No published marks yet.</p>
								</div>
							) : (
								<div className="mt-4 overflow-hidden rounded-card border border-border bg-card">
									<div className="rail-scroll overflow-x-auto">
										<table className="w-full text-left">
											<thead className="border-b border-border bg-secondary">
												<tr>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Exam
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Course
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Date
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														Score
													</th>
													<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
														%
													</th>
												</tr>
											</thead>
											<tbody>
												{student.marks.map((mark) => (
													<tr
														key={mark.id}
														className="border-b border-rule-soft last:border-b-0"
													>
														<td className="px-4 py-3.5">
															<p className="text-[13.5px] font-medium text-foreground">
																{mark.exam}
															</p>
															<p className="t-caption mt-0.5">{mark.term}</p>
														</td>
														<td className="px-4 py-3.5 text-[13px] text-muted-foreground">
															{mark.course}
														</td>
														<td className="px-4 py-3.5 text-[13px] text-muted-foreground">
															{new Date(mark.date).toLocaleDateString()}
														</td>
														<td className="px-4 py-3.5 font-mono text-[13px] tabular-nums">
															{mark.score} / {mark.maxMarks}
														</td>
														<td className="px-4 py-3.5 font-mono text-[13px] font-medium tabular-nums text-foreground">
															{Math.round((mark.score / mark.maxMarks) * 100)}%
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
