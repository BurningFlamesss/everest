import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import { getEventFn } from "#/packages/content/server.ts";

export const Route = createFileRoute("/events/$slug")({
	loader: async ({ params }) => {
		const event = await getEventFn({ data: { slug: params.slug } });

		if (!event) throw notFound();

		return event;
	},
	notFoundComponent: () => (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<div className="px-6 py-16 md:px-16">
				<h1 className="text-3xl font-bold text-gray-900">Event not found</h1>
				<Link
					to="/events"
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600"
				>
					<ArrowLeft className="h-4 w-4" /> Back to events
				</Link>
			</div>
		</main>
	),
	component: EventDetail,
});

function EventDetail() {
	const event = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<article className="mx-auto max-w-3xl px-6 py-16 md:px-10">
				<Link
					to="/events"
					className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
				>
					<ArrowLeft className="h-4 w-4" /> All events
				</Link>

				<p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
					School event
				</p>
				<h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900">
					{event.title}
				</h1>

				<dl className="mt-6 grid gap-4 rounded-2xl border border-gray-200 bg-white p-5 sm:grid-cols-2">
					<div>
						<dt className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
							<CalendarDays className="h-3.5 w-3.5" /> Starts
						</dt>
						<dd className="mt-1 font-medium text-gray-900">
							{new Date(event.startsAt).toLocaleString(undefined, {
								dateStyle: "full",
								timeStyle: "short",
							})}
						</dd>
					</div>
					{event.endsAt ? (
						<div>
							<dt className="text-xs font-semibold uppercase text-gray-500">
								Ends
							</dt>
							<dd className="mt-1 font-medium text-gray-900">
								{new Date(event.endsAt).toLocaleString(undefined, {
									dateStyle: "full",
									timeStyle: "short",
								})}
							</dd>
						</div>
					) : null}
					{event.location ? (
						<div className="sm:col-span-2">
							<dt className="flex items-center gap-1 text-xs font-semibold uppercase text-gray-500">
								<MapPin className="h-3.5 w-3.5" /> Location
							</dt>
							<dd className="mt-1 font-medium text-gray-900">
								{event.location}
							</dd>
						</div>
					) : null}
				</dl>

				{event.description ? (
					<div className="mt-8 space-y-4 border-t border-gray-200 pt-8 text-base leading-relaxed text-gray-700">
						{event.description.split(/\n{2,}/).map((paragraph) => (
							<p key={`${paragraph.slice(0, 32)}-${paragraph.length}`}>
								{paragraph}
							</p>
						))}
					</div>
				) : null}
			</article>
		</main>
	);
}
