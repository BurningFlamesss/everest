import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Paperclip } from "lucide-react";
import { getNoticeFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

type NoticeDetail = NonNullable<Awaited<ReturnType<typeof getNoticeFn>>>;
type NoticeAttachment = NoticeDetail["attachments"][number];

export const Route = createFileRoute("/_public/notices/$slug")({
	loader: async ({ params }) => {
		const notice = await getNoticeFn({ data: { slug: params.slug } });

		if (!notice) throw notFound();

		return notice;
	},
	head: ({ loaderData }) =>
		pageMeta({
			title: loaderData?.title ?? "Notice",
			description: loaderData?.summary ?? undefined,
			image: loaderData?.coverImage,
		}),
	notFoundComponent: () => (
		<PageFrame>
			<Section className="mb-20 py-16">
				<h1 className="text-3xl font-bold text-foreground">Notice not found</h1>
				<p className="mt-2 text-muted-foreground">
					This notice may have been removed or is no longer published.
				</p>
				<Link
					to="/notices"
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary"
				>
					<ArrowLeft className="h-4 w-4" /> Back to notices
				</Link>
			</Section>
		</PageFrame>
	),
	component: NoticeDetail,
});

function NoticeDetail() {
	const notice = Route.useLoaderData();

	return (
		<PageFrame>
			<Section className="mb-20">
				<article className="mx-auto max-w-3xl">
					<Link
						to="/notices"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
					>
						<ArrowLeft className="h-4 w-4" /> All notices
					</Link>

					<div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
						{notice.category ? (
							<span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
								{notice.category}
							</span>
						) : null}
						<span className="inline-flex items-center gap-1 text-muted-foreground">
							<CalendarDays className="h-3.5 w-3.5" />
							{new Date(
								notice.publishedAt ?? notice.createdAt,
							).toLocaleDateString(undefined, { dateStyle: "long" })}
						</span>
					</div>

					<h1 className="mt-4 font-display text-4xl font-bold leading-tight text-foreground">
						{notice.title}
					</h1>
					{notice.coverImage ? (
						<img
							src={notice.coverImage}
							alt=""
							className="mt-8 h-72 w-full rounded-2xl object-cover"
						/>
					) : null}
					{notice.summary ? (
						<p className="mt-4 text-lg leading-relaxed text-muted-foreground">
							{notice.summary}
						</p>
					) : null}

					<div className="mt-8 space-y-4 border-t border-rule pt-8 text-base leading-relaxed text-muted-foreground">
						{notice.body.split(/\n{2,}/).map((paragraph: string) => (
							<p key={`${paragraph.slice(0, 32)}-${paragraph.length}`}>
								{paragraph}
							</p>
						))}
					</div>

					{notice.attachments.length > 0 ? (
						<div className="mt-10 rounded-2xl border border-border bg-card p-5">
							<h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
								<Paperclip className="h-4 w-4 text-primary" /> Attachments
							</h2>
							<ul className="mt-3 space-y-2">
								{notice.attachments.map((attachment: NoticeAttachment) => (
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
