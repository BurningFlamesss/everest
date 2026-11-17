import { createFileRoute, redirect } from "@tanstack/react-router";
import { getMyAssignmentsFn } from "#/packages/academics/homework-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/my-homework")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) throw redirect({ to: "/login" });

		return { viewer };
	},
	loader: () => getMyAssignmentsFn(),
	component: MyHomework,
});

function MyHomework() {
	const data = Route.useLoaderData();

	return (
		<PageFrame testId="my-homework-page">
			<PageHeader
				testId="my-homework-page-header"
				eyebrow="Homework"
				title="Assignments"
				subtitle="Only work for courses the student is enrolled in appears here."
				meta={
					data.length > 0
						? [{ label: "Students", value: String(data.length) }]
						: undefined
				}
			/>

			{data.length === 0 ? (
				<div className="mt-9">
					<EmptyState
						eyebrow="Nothing set"
						title="No assignments have been set for this account yet"
						description="When a teacher publishes homework for your courses it will appear here."
						testId="my-homework-empty-state"
					/>
				</div>
			) : (
				data.map((entry) => (
					<Section
						key={entry.student.id}
						testId={`homework-student-${entry.student.id}`}
					>
						<Reveal>
							<SectionHeading eyebrow="Student" title={entry.student.name} />
						</Reveal>

						{entry.assignments.length === 0 ? (
							<p className="t-caption mt-5">Nothing due right now.</p>
						) : (
							<ul className="mt-6 divide-y divide-rule-soft">
								{entry.assignments.map((assignment) => (
									<li key={assignment.id} className="py-5">
										<div className="flex flex-wrap items-baseline justify-between gap-2">
											<p className="text-[14px] font-medium text-foreground">
												{assignment.title}
											</p>
											<span className="t-meta">
												Due {new Date(assignment.dueAt).toLocaleString()}
											</span>
										</div>
										<p className="t-caption mt-1">
											{assignment.course.code} · {assignment.course.name}
										</p>
										<p className="t-body mt-2.5 max-w-measure whitespace-pre-line text-foreground/90">
											{assignment.instructions}
										</p>
										{assignment.attachments.length > 0 ? (
											<ul className="mt-2.5 flex flex-wrap gap-2">
												{assignment.attachments.map((attachment) => (
													<li key={attachment.id}>
														<a
															href={attachment.fileAsset.url}
															target="_blank"
															rel="noreferrer"
															className="rounded-full border border-border bg-background px-2.5 py-1 text-[12px] text-red-dark underline-offset-2 hover:underline"
														>
															{attachment.label ||
																attachment.fileAsset.originalName}
														</a>
													</li>
												))}
											</ul>
										) : null}
									</li>
								))}
							</ul>
						)}
					</Section>
				))
			)}
		</PageFrame>
	);
}
