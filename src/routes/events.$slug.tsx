import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Paperclip } from "lucide-react";
import { getEventFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";

export const Route = createFileRoute("/events/$slug")({
	loader: async ({ params }) => {
		const event = await getEventFn({ data: { slug: params.slug } });

		if (!event) throw notFound();

		return event;
	},
	head: ({ loaderData }) =>
		pageMeta({
			title: loaderData?.title ?? "Event",
			description: loaderData?.description ?? undefined,
			image: loaderData?.coverImage,
		}),
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

				{event.coverImage ? (
					<img
						src={event.coverImage}
						alt=""
						className="mt-8 h-72 w-full rounded-2xl object-cover"
					/>
				) : null}

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

				{event.attachments.length > 0 ? (
					<div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
						<h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
							<Paperclip className="h-4 w-4 text-red-500" /> Attachments
						</h2>
						<ul className="mt-3 space-y-2">
							{event.attachments.map((attachment) => (
								<li key={attachment.id}>
									<a
										href={attachment.fileAsset.url}
										target="_blank"
										rel="noreferrer"
										className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
									>
										<span className="font-medium">
											{attachment.label ?? attachment.fileAsset.originalName}
										</span>
										<span className="text-xs text-gray-400">
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
		</main>
	);
}
