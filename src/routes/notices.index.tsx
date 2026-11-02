import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, CalendarDays } from "lucide-react";
import { getNoticesFn } from "#/packages/content/server.ts";

export const Route = createFileRoute("/notices/")({
	loader: () => getNoticesFn({ data: { limit: 100 } }),
	component: NoticesPage,
});

function NoticesPage() {
	const notices = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
					School notices
				</p>
				<h1 className="mt-4 text-5xl font-bold text-gray-900">
					What you need to know
				</h1>
				<p className="mt-4 max-w-2xl text-gray-600">
					Official announcements from the school office, teachers and
					departments.
				</p>
			</section>

			<section className="px-6 md:px-16">
				{notices.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
						<Bell className="mx-auto h-8 w-8 text-gray-300" />
						<p className="mt-3 text-gray-600">
							There are no published notices right now.
						</p>
					</div>
				) : (
					<div className="grid gap-4">
						{notices.map((notice) => (
							<Link
								key={notice.id}
								to="/notices/$slug"
								params={{ slug: notice.slug }}
								className="group rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
							>
								<div className="flex flex-wrap items-center gap-2 text-xs">
									{notice.category ? (
										<span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
											{notice.category}
										</span>
									) : null}
									<span className="inline-flex items-center gap-1 text-gray-400">
										<CalendarDays className="h-3.5 w-3.5" />
										{new Date(
											notice.publishedAt ?? notice.createdAt,
										).toLocaleDateString(undefined, {
											dateStyle: "medium",
										})}
									</span>
								</div>
								<h2 className="mt-3 text-2xl font-semibold text-gray-900 group-hover:text-red-600">
									{notice.title}
								</h2>
								{notice.summary ? (
									<p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
										{notice.summary}
									</p>
								) : null}
								<span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
									Read notice <ArrowUpRight className="h-4 w-4" />
								</span>
							</Link>
						))}
					</div>
				)}
			</section>
		</main>
	);
}
