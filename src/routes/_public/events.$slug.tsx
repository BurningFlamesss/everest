import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, MapPin, Paperclip } from "lucide-react";
import { getEventFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventFn>>>;
type EventAttachment = EventDetail["attachments"][number];

export const Route = createFileRoute("/_public/events/$slug")({
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
		<PageFrame>
			<Section className="mb-20 py-16">
				<h1 className="text-3xl font-bold text-foreground">Event not found</h1>
				<Link
					to="/events"
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
				>
					<ArrowLeft className="h-4 w-4" /> Back to events
				</Link>
			</Section>
		</PageFrame>
	),
	component: EventDetail,
});

function EventDetail() {
	const event = Route.useLoaderData();

	return (
		<PageFrame>
			<Section className="mb-20">
				<article className="mx-auto max-w-3xl">
					<Link
						to="/events"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" /> All events
					</Link>

					<p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
						School event
					</p>
					<h1 className="mt-3 font-display text-4xl font-bold leading-tight text-foreground">
						{event.title}
					</h1>

					{event.coverImage ? (
						<img
							src={event.coverImage}
							alt=""
							className="mt-8 h-72 w-full rounded-2xl object-cover"
						/>
					) : null}

					<dl className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-5 sm:grid-cols-2">
						<div>
							<dt className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
								<CalendarDays className="h-3.5 w-3.5" /> Starts
							</dt>
							<dd className="mt-1 font-medium text-foreground">
								{new Date(event.startsAt).toLocaleString(undefined, {
									dateStyle: "full",
									timeStyle: "short",
								})}
							</dd>
						</div>
						{event.endsAt ? (
							<div>
								<dt className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
									<CalendarDays className="h-3.5 w-3.5" /> Ends
								</dt>
								<dd className="mt-1 font-medium text-foreground">
									{new Date(event.endsAt).toLocaleString(undefined, {
										dateStyle: "full",
										timeStyle: "short",
									})}
								</dd>
							</div>
						) : null}
						{event.location ? (
							<div className="sm:col-span-2">
								<dt className="flex items-center gap-1 text-xs font-semibold uppercase text-muted-foreground">
									<MapPin className="h-3.5 w-3.5" /> Location
								</dt>
								<dd className="mt-1 font-medium text-foreground">
									{event.location}
								</dd>
							</div>
						) : null}
					</dl>

					{event.description ? (
						<div className="mt-8 space-y-4 border-t border-rule pt-8 text-base leading-relaxed text-muted-foreground">
							{event.description.split(/\n{2,}/).map((paragraph: string) => (
								<p key={`${paragraph.slice(0, 32)}-${paragraph.length}`}>
									{paragraph}
								</p>
							))}
						</div>
					) : null}

					{event.attachments.length > 0 ? (
						<div className="mt-10 rounded-2xl border border-border bg-card p-5">
							<h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<Paperclip className="h-4 w-4 text-primary" /> Attachments
							</h2>
							<ul className="mt-3 space-y-2">
								{event.attachments.map((attachment: EventAttachment) => (
									<li key={attachment.id}>
										<a
											href={attachment.fileAsset.url}
											target="_blank"
											rel="noreferrer"
											className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70"
										>
											<span className="font-medium">
												{attachment.label ?? attachment.fileAsset.originalName}
											</span>
											<span className="text-xs text-muted-foreground">
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
			</Section>
		</PageFrame>
	);
}
