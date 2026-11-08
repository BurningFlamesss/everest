import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Paperclip } from "lucide-react";
import { getNoticeFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";

export const Route = createFileRoute("/notices/$slug")({
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
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<div className="px-6 py-16 md:px-16">
				<h1 className="text-3xl font-bold text-gray-900">Notice not found</h1>
				<p className="mt-2 text-gray-600">
					This notice may have been removed or is no longer published.
				</p>
				<Link
					to="/notices"
					className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-red-600"
				>
					<ArrowLeft className="h-4 w-4" /> Back to notices
				</Link>
			</div>
		</main>
	),
	component: NoticeDetail,
});

function NoticeDetail() {
	const notice = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<article className="mx-auto max-w-3xl px-6 py-16 md:px-10">
				<Link
					to="/notices"
					className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
				>
					<ArrowLeft className="h-4 w-4" /> All notices
				</Link>

				<div className="mt-8 flex flex-wrap items-center gap-2 text-xs">
					{notice.category ? (
						<span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
							{notice.category}
						</span>
					) : null}
					<span className="inline-flex items-center gap-1 text-gray-500">
						<CalendarDays className="h-3.5 w-3.5" />
						{new Date(
							notice.publishedAt ?? notice.createdAt,
						).toLocaleDateString(undefined, { dateStyle: "long" })}
					</span>
				</div>

				<h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900">
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
					<p className="mt-4 text-lg leading-relaxed text-gray-600">
						{notice.summary}
					</p>
				) : null}

				<div className="mt-8 space-y-4 border-t border-gray-200 pt-8 text-base leading-relaxed text-gray-700">
					{notice.body.split(/\n{2,}/).map((paragraph) => (
						<p key={`${paragraph.slice(0, 32)}-${paragraph.length}`}>
							{paragraph}
						</p>
					))}
				</div>

				{notice.attachments.length > 0 ? (
					<div className="mt-10 rounded-2xl border border-gray-200 bg-white p-5">
						<h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
							<Paperclip className="h-4 w-4 text-red-500" /> Attachments
						</h2>
						<ul className="mt-3 space-y-2">
							{notice.attachments.map((attachment) => (
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
