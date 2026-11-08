import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Footer } from "#/components/layout/Footer.tsx";
import { getGalleryFn } from "#/packages/content/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";

export const Route = createFileRoute("/gallery")({
	head: () =>
		pageMeta({
			title: "Campus gallery",
			description:
				"Photos from classrooms, sports days, clubs and everyday life at the school.",
		}),
	loader: () => getGalleryFn(),
	component: GalleryPage,
});

function GalleryPage() {
	const images = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-background pl-0 md:ml-72">
			<section className="px-6 py-20 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
					Gallery
				</p>
				<h1 className="mt-5 max-w-3xl font-display text-5xl font-bold leading-[1.05] text-foreground md:text-7xl">
					Life on campus.
				</h1>
				<p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
					Classrooms, sports, clubs and the small moments in between.
				</p>
			</section>

			<section className="px-6 pb-16 md:px-16">
				{images.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground">
						Photos will appear here once the school office adds them.
					</div>
				) : (
					<ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{images.map((image) => (
							<li
								key={image.id}
								className="group overflow-hidden rounded-2xl border border-border bg-card"
							>
								<img
									src={image.imageUrl}
									alt={image.title ?? "School gallery photo"}
									className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
								/>
								{image.title || image.caption ? (
									<div className="p-4">
										{image.title ? (
											<p className="font-semibold text-foreground">
												{image.title}
											</p>
										) : null}
										{image.caption ? (
											<p className="mt-1 text-sm text-muted-foreground">
												{image.caption}
											</p>
										) : null}
									</div>
								) : null}
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="mx-6 mb-16 rounded-2xl bg-primary p-8 text-primary-foreground md:mx-16 md:p-12">
				<h2 className="font-display text-3xl font-bold md:text-4xl">
					Come and see it for yourself.
				</h2>
				<p className="mt-3 max-w-xl text-primary-foreground/80">
					Book a campus visit or start an admission enquiry with the school
					office.
				</p>
				<Link
					to="/admissions"
					className="mt-6 inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-background/90"
				>
					Admissions <ArrowRight className="h-4 w-4" />
				</Link>
			</section>

			<Footer />
		</main>
	);
}
