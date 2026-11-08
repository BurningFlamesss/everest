import { createFileRoute, redirect } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";
import { getMyAssignmentsFn } from "#/packages/academics/homework-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/my-homework")({
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
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
					Homework
				</p>
				<h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
					Assignments
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Only work for courses the student is enrolled in appears here.
				</p>
			</section>

			<section className="space-y-6 px-6 md:px-16">
				{data.length === 0 ? (
					<div className="rounded-2xl border border-border bg-card p-10 text-center">
						<NotebookPen className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-3 text-muted-foreground">
							No assignments have been set for this account yet.
						</p>
					</div>
				) : (
					data.map((entry) => (
						<article
							key={entry.student.id}
							className="overflow-hidden rounded-2xl border border-border bg-card"
						>
							<header className="border-b border-border px-6 py-4">
								<h2 className="text-lg font-semibold text-foreground">
									{entry.student.name}
								</h2>
							</header>
							{entry.assignments.length === 0 ? (
								<p className="p-6 text-sm text-muted-foreground">
									Nothing due right now.
								</p>
							) : (
								<ul className="divide-y divide-border">
									{entry.assignments.map((assignment) => (
										<li key={assignment.id} className="px-6 py-4">
											<div className="flex flex-wrap items-baseline justify-between gap-2">
												<p className="font-medium text-foreground">
													{assignment.title}
												</p>
												<span className="text-xs text-muted-foreground">
													Due {new Date(assignment.dueAt).toLocaleString()}
												</span>
											</div>
											<p className="mt-1 text-xs text-muted-foreground">
												{assignment.course.code} · {assignment.course.name}
											</p>
											<p className="mt-2 whitespace-pre-line text-sm text-foreground/90">
												{assignment.instructions}
											</p>
											{assignment.attachments.length > 0 ? (
												<ul className="mt-2 flex flex-wrap gap-3 text-xs">
													{assignment.attachments.map((attachment) => (
														<li key={attachment.id}>
															<a
																href={attachment.fileAsset.url}
																target="_blank"
																rel="noreferrer"
																className="font-semibold text-primary underline"
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
						</article>
					))
				)}
			</section>
		</main>
	);
}
