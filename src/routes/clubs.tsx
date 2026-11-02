import { createFileRoute } from "@tanstack/react-router";
import { Clock, Paperclip, Users } from "lucide-react";
import { getClubsFn } from "#/packages/content/server.ts";

export const Route = createFileRoute("/clubs")({
	loader: () => getClubsFn({ data: {} }),
	component: ClubsPage,
});

function ClubsPage() {
	const clubs = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
					Student life
				</p>
				<h1 className="mt-4 text-5xl font-bold text-gray-900">Clubs</h1>
				<p className="mt-4 max-w-2xl text-gray-600">
					Clubs give students a place to build skills, make friends and take on
					responsibility beyond the classroom.
				</p>
			</section>

			<section className="px-6 md:px-16">
				{clubs.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
						<Users className="mx-auto h-8 w-8 text-gray-300" />
						<p className="mt-3 text-gray-600">
							Club information will be published soon.
						</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{clubs.map((club) => (
							<article
								key={club.id}
								className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6"
							>
								{club.coverImage ? (
									<img
										src={club.coverImage}
										alt=""
										className="mb-4 h-40 w-full rounded-xl object-cover"
									/>
								) : null}
								<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
									<Users className="h-5 w-5" />
								</div>
								<h2 className="mt-4 text-xl font-semibold text-gray-900">
									{club.name}
								</h2>
								{club.description ? (
									<p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
										{club.description}
									</p>
								) : null}
								{club.meetingSchedule ? (
									<p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500">
										<Clock className="h-3.5 w-3.5" />
										{club.meetingSchedule}
									</p>
								) : null}
								{club.attachments.length > 0 ? (
									<div className="mt-5 border-t border-gray-100 pt-4">
										<h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
											<Paperclip className="h-4 w-4 text-red-500" /> Attachments
										</h3>
										<ul className="mt-2 space-y-2">
											{club.attachments.map((attachment) => (
												<li key={attachment.id}>
													<a
														href={attachment.fileAsset.url}
														target="_blank"
														rel="noreferrer"
														className="flex items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
													>
														<span className="min-w-0 break-words font-medium">
															{attachment.label ??
																attachment.fileAsset.originalName}
														</span>
														<span className="shrink-0 text-xs text-gray-400">
															{Math.max(
																1,
																Math.round(attachment.fileAsset.size / 1024),
															)}{" "}
															KB
														</span>
													</a>
												</li>
											))}
										</ul>
									</div>
								) : null}
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
