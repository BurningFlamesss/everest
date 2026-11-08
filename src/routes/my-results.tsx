import { createFileRoute, redirect } from "@tanstack/react-router";
import { Award, GraduationCap } from "lucide-react";
import { getMyResultsFn } from "#/packages/academics/exams-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/my-results")({
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
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
					Results
				</p>
				<h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
					Exam results
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Published marks by exam and course. Results appear here as soon as the
					school publishes them.
				</p>
			</section>

			<section className="space-y-6 px-6 md:px-16">
				{data.length === 0 ? (
					<div className="rounded-2xl border border-border bg-card p-10 text-center">
						<GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-3 text-muted-foreground">
							No results have been published for this account yet.
						</p>
					</div>
				) : (
					data.map((student) => (
						<article
							key={student.student.id}
							className="overflow-hidden rounded-2xl border border-border bg-card"
						>
							<header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-6 py-4">
								<h2 className="text-lg font-semibold text-foreground">
									{student.student.name}
								</h2>
								<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
									<Award className="h-3.5 w-3.5" /> {student.marks.length}{" "}
									result
									{student.marks.length === 1 ? "" : "s"}
								</span>
							</header>
							{student.marks.length === 0 ? (
								<p className="p-6 text-sm text-muted-foreground">
									No published marks yet.
								</p>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full text-left text-sm">
										<thead className="bg-muted text-xs uppercase tracking-wide text-muted-foreground">
											<tr>
												<th className="px-6 py-3">Exam</th>
												<th className="px-3 py-3">Course</th>
												<th className="px-3 py-3">Date</th>
												<th className="px-3 py-3">Score</th>
												<th className="px-6 py-3">%</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-border">
											{student.marks.map((mark) => (
												<tr key={mark.id}>
													<td className="px-6 py-3">
														<p className="font-medium text-foreground">
															{mark.exam}
														</p>
														<p className="text-xs text-muted-foreground">
															{mark.term}
														</p>
													</td>
													<td className="px-3 py-3 text-muted-foreground">
														{mark.course}
													</td>
													<td className="px-3 py-3 text-muted-foreground">
														{new Date(mark.date).toLocaleDateString()}
													</td>
													<td className="px-3 py-3 text-foreground">
														{mark.score} / {mark.maxMarks}
													</td>
													<td className="px-6 py-3 font-semibold text-foreground">
														{Math.round((mark.score / mark.maxMarks) * 100)}%
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
