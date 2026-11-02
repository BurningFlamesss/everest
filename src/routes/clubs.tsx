import { createFileRoute } from "@tanstack/react-router";
import { Clock, Users } from "lucide-react";
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
							</article>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
