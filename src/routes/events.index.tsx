import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, CalendarDays, MapPin } from "lucide-react";
import { getEventsFn } from "#/packages/content/server.ts";

export const Route = createFileRoute("/events/")({
	loader: () => getEventsFn({ data: { limit: 100 } }),
	component: EventsPage,
});

function EventsPage() {
	const events = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
					School calendar
				</p>
				<h1 className="mt-4 text-5xl font-bold text-gray-900">Events</h1>
				<p className="mt-4 max-w-2xl text-gray-600">
					Programmes, examinations, sports and celebrations happening at the
					school.
				</p>
			</section>

			<section className="px-6 md:px-16">
				{events.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
						<CalendarDays className="mx-auto h-8 w-8 text-gray-300" />
						<p className="mt-3 text-gray-600">
							No upcoming events have been published yet.
						</p>
					</div>
				) : (
					<div className="grid gap-4 md:grid-cols-2">
						{events.map((event) => (
							<Link
								key={event.id}
								to="/events/$slug"
								params={{ slug: event.slug }}
								className="group rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
							>
								{event.coverImage ? (
									<img
										src={event.coverImage}
										alt=""
										className="mb-5 h-44 w-full rounded-xl object-cover"
									/>
								) : null}
								<div className="flex items-start justify-between gap-4">
									<div className="rounded-xl bg-red-50 px-4 py-3 text-center">
										<p className="text-xs font-semibold uppercase text-red-600">
											{new Date(event.startsAt).toLocaleDateString(undefined, {
												month: "short",
											})}
										</p>
										<p className="text-2xl font-bold text-red-700">
											{new Date(event.startsAt).getDate()}
										</p>
									</div>
									<span className="inline-flex items-center gap-1 text-xs text-gray-500">
										{new Date(event.startsAt).toLocaleTimeString(undefined, {
											hour: "2-digit",
											minute: "2-digit",
										})}
									</span>
								</div>
								<h2 className="mt-4 text-xl font-semibold text-gray-900 group-hover:text-red-600">
									{event.title}
								</h2>
								{event.location ? (
									<p className="mt-2 inline-flex items-center gap-1 text-sm text-gray-500">
										<MapPin className="h-3.5 w-3.5" /> {event.location}
									</p>
								) : null}
								{event.description ? (
									<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
										{event.description}
									</p>
								) : null}
								<span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
									View event <ArrowUpRight className="h-4 w-4" />
								</span>
							</Link>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
