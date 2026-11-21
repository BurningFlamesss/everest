import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
	ArrowRight,
	Clock,
	Compass,
	Megaphone,
	Paperclip,
	Search,
	Users,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { getPublicClubActivitiesFn } from "#/packages/clubs/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	PageHeader,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

export const Route = createFileRoute("/_public/activities")({
	head: () =>
		pageMeta({
			title:
				"Student Clubs & Extracurricular Activities | Everest English Boarding Secondary School (EEBSS)",
			description:
				"Explore student clubs, tournaments, science workshops, debate championships, and extracurricular activities at Everest School, Butwal, Nepal.",
			path: "/activities",
			keywords:
				"everest school clubs, student activities butwal, robotics club nepal, interschool debate butwal, sports club everest school",
		}),
	loader: async () => {
		const { clubs, recentPosts } = await getPublicClubActivitiesFn();
		return { clubs, recentPosts };
	},
	component: ActivitiesPage,
});

function ActivitiesPage() {
	const { clubs = [], recentPosts = [] } = Route.useLoaderData();
	const [searchQuery, setSearchQuery] = useState("");
	const [activeTab, setActiveTab] = useState<"clubs" | "posts">("clubs");

	const filteredClubs = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return clubs;
		return clubs.filter(
			(c: any) =>
				c.name?.toLowerCase().includes(q) ||
				c.description?.toLowerCase().includes(q) ||
				c.meetingSchedule?.toLowerCase().includes(q),
		);
	}, [clubs, searchQuery]);

	const filteredPosts = useMemo(() => {
		const q = searchQuery.toLowerCase().trim();
		if (!q) return recentPosts;
		return recentPosts.filter(
			(p: any) =>
				p.title?.toLowerCase().includes(q) ||
				p.body?.toLowerCase().includes(q) ||
				p.club?.name?.toLowerCase().includes(q),
		);
	}, [recentPosts, searchQuery]);

	return (
		<PageFrame dense testId="activities-page">
			{/* Page Header */}
			<PageHeader
				eyebrow="CO-CURRICULAR & STUDENT LIFE"
				title="Clubs & Activities"
				lead="Clubs give students at Everest English Secondary School a platform to build leadership, explore passions, organize tournaments, and present research beyond the curriculum."
			/>

			{/* Search & Tabs Controls */}
			<Section className="mb-10">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-border pb-6">
					<Tabs
						value={activeTab}
						onValueChange={(val: string) => setActiveTab(val as "clubs" | "posts")}
						className="w-full sm:w-auto"
					>
						<TabsList className="grid grid-cols-2 w-full sm:w-[340px]">
							<TabsTrigger value="clubs" className="text-xs font-medium">
								Active Clubs ({clubs.length})
							</TabsTrigger>
							<TabsTrigger value="posts" className="text-xs font-medium">
								Club Activity Feed ({recentPosts.length})
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="relative w-full sm:w-72">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search clubs & posts..."
							value={searchQuery}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
								setSearchQuery(e.target.value)
							}
							className="pl-9 h-9 text-xs"
						/>
					</div>
				</div>

				{/* TAB 1: ALL ACTIVE CLUBS DIRECTORY */}
				{activeTab === "clubs" && (
					<div className="mt-8">
						{filteredClubs.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
								<Users className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
								<h3 className="text-base font-semibold text-foreground">
									No clubs match &ldquo;{searchQuery}&rdquo;
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									Try searching with a broader keyword or view all clubs above.
								</p>
								<Button
									variant="outline"
									size="sm"
									className="mt-4 text-xs"
									onClick={() => setSearchQuery("")}
								>
									Clear Search
								</Button>
							</div>
						) : (
							<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
								{filteredClubs.map((club: any) => {
									const memberCount = club._count?.members ?? 0;
									const postsCount = club._count?.posts ?? 0;

									return (
										<article
											key={club.id}
											className="group flex h-full flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-xs transition-colors duration-fast hover:border-foreground/30 hover:bg-secondary/20"
										>
											<div>
												{club.coverImage ? (
													<div className="mb-4 h-44 w-full overflow-hidden rounded-xl border border-border bg-secondary">
														<img
															src={club.coverImage}
															alt={club.name}
															className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
														/>
													</div>
												) : (
													<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
														<Users className="h-6 w-6" />
													</div>
												)}

												<div className="flex items-center justify-between gap-2">
													{club.meetingSchedule ? (
														<span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground">
															<Clock className="h-3 w-3" />
															{club.meetingSchedule}
														</span>
													) : (
														<span className="text-[11px] font-mono text-muted-foreground">
															Active Society
														</span>
													)}
													<Badge
														variant="outline"
														className="text-[10px] font-mono px-2 py-0"
													>
														{memberCount} {memberCount === 1 ? "member" : "members"}
													</Badge>
												</div>

												<h3 className="mt-2.5 text-lg font-bold text-foreground">
													{club.name}
												</h3>

												{club.description && (
													<p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-3">
														{club.description}
													</p>
												)}

												{/* Attachments if any */}
												{club.attachments?.length > 0 && (
													<div className="mt-4 pt-3 border-t border-border/60">
														<span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
															<Paperclip className="h-3 w-3" />
															{club.attachments.length} downloadable resource{club.attachments.length === 1 ? "" : "s"}
														</span>
													</div>
												)}
											</div>

											<div className="mt-6 pt-4 border-t border-border flex items-center justify-between">
												<span className="text-xs text-muted-foreground font-mono">
													{postsCount} updates published
												</span>
												<Link
													to="/clubs/$slug"
													params={{ slug: club.slug }}
													className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
												>
													Explore Club
													<ArrowRight className="h-3 w-3" />
												</Link>
											</div>
										</article>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* TAB 2: PUBLIC ACTIVITY FEED & ANNOUNCEMENTS */}
				{activeTab === "posts" && (
					<div className="mt-8">
						{filteredPosts.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
								<Megaphone className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
								<h3 className="text-base font-semibold text-foreground">
									No club activities match &ldquo;{searchQuery}&rdquo;
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									Club officers regularly publish announcements, tournament recaps, and exhibitions here.
								</p>
							</div>
						) : (
							<div className="grid gap-5 md:grid-cols-2">
								{filteredPosts.map((post: any) => (
									<article
										key={post.id}
										className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-foreground/30 transition-colors"
									>
										<div>
											<div className="flex items-center justify-between gap-3 mb-3">
												<Link
													to="/clubs/$slug"
													params={{ slug: post.club.slug }}
													className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary hover:underline"
												>
													<Compass className="h-3 w-3" />
													{post.club.name}
												</Link>
												<span className="text-xs text-muted-foreground font-mono">
													{formatDistanceToNow(new Date(post.createdAt), {
														addSuffix: true,
													})}
												</span>
											</div>

											<Link
												to="/activities/$postId"
												params={{ postId: post.id }}
												className="hover:underline block group"
											>
												<h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors">
													{post.title}
												</h3>
											</Link>

											<p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-4 whitespace-pre-line">
												{post.excerpt || post.body?.replace(/<[^>]*>/g, "")}
											</p>
										</div>

										<div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
											<span>
												By{" "}
												<strong className="text-foreground font-medium">
													{post.authorStudent?.user?.name || post.author?.name || "Club Officer"}
												</strong>
											</span>
											<Link
												to="/activities/$postId"
												params={{ postId: post.id }}
												className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
											>
												Read article
												<ArrowRight className="h-3 w-3" />
											</Link>
										</div>
									</article>
								))}
							</div>
						)}
					</div>
				)}

				{/* How to Participate Callout */}
				<div className="mt-16 rounded-2xl border border-border bg-card/60 p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
					<div className="max-w-xl space-y-2">
						<span className="text-xs font-mono font-semibold uppercase tracking-wider text-primary">
							STUDENT PARTICIPATION
						</span>
						<h3 className="text-xl font-bold text-foreground">
							Interested in joining or launching a club?
						</h3>
						<p className="text-xs text-muted-foreground leading-relaxed">
							Students currently enrolled in Secondary and Senior Secondary grades can request membership directly through the student portal, or propose new co-curricular initiatives with faculty advisor sponsorship.
						</p>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<Link
							to="/login"
							className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
						>
							Student Portal Sign In
						</Link>
						<Link
							to="/contact"
							className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary"
						>
							Contact Activities Office
						</Link>
					</div>
				</div>
			</Section>
		</PageFrame>
	);
}
