import { createFileRoute, Link } from "@tanstack/react-router";
import { formatDistanceToNow } from "date-fns";
import {
	ArrowRight,
	Clock,
	Megaphone,
	Paperclip,
	Search,
	Users,
} from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
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
				eyebrow="04 / CO-CURRICULAR"
				title="Student Societies & Activities"
				lead="Every Friday afternoon and after class hours, pupils participate in student-managed societies across practical sciences, computing, bilingual debate, environmental conservation, and athletics."
			/>

			{/* Search & Tabs Controls */}
			<Section className="mb-10">
				<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-rule-soft pb-6">
					<Tabs
						value={activeTab}
						onValueChange={(val: string) => setActiveTab(val as "clubs" | "posts")}
						className="w-full sm:w-auto"
					>
						<TabsList className="grid grid-cols-2 w-full sm:w-[380px] p-1 bg-secondary/80 border border-border rounded-lg shadow-inner">
							<TabsTrigger
								value="clubs"
								className="text-xs font-semibold rounded-md py-1.5 transition-all data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
							>
								Active Societies ({clubs.length})
							</TabsTrigger>
							<TabsTrigger
								value="posts"
								className="text-xs font-semibold rounded-md py-1.5 transition-all data-[state=active]:bg-foreground data-[state=active]:text-background data-[state=active]:shadow-xs data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
							>
								Society Dispatches ({recentPosts.length})
							</TabsTrigger>
						</TabsList>
					</Tabs>

					<div className="relative w-full sm:w-72">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Filter societies or reports..."
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
							<div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
								<Users className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
								<h3 className="font-display text-base font-semibold text-foreground">
									No societies match &ldquo;{searchQuery}&rdquo;
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									Check your search terms or view the complete societies directory.
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
											className="group flex h-full flex-col justify-between rounded-card border border-border bg-card p-6 shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 text-left"
										>
											<div>
												{club.coverImage ? (
													<div className="mb-6 h-[200px] w-full overflow-hidden rounded-md border border-border bg-secondary">
														<img
															src={club.coverImage}
															alt={club.name}
															className="h-full w-full object-cover transition-transform duration-[400ms] group-hover:scale-105"
														/>
													</div>
												) : (
													<div className="mb-6 flex h-12 w-12 items-center justify-center rounded-md border border-border bg-secondary text-foreground">
														<Users className="h-5 w-5" aria-hidden="true" />
													</div>
												)}

												<div className="flex items-center justify-between gap-2">
													<span className="t-eyebrow text-muted-foreground">
														Student Society
													</span>
													<span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground shrink-0">
														{memberCount} {memberCount === 1 ? "member" : "members"}
													</span>
												</div>

												<h3 className="mt-2.5 font-display text-[19px] font-semibold leading-snug text-foreground">
													{club.name}
												</h3>

												{club.meetingSchedule ? (
													<p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
														<Clock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
														<span className="truncate">{club.meetingSchedule}</span>
													</p>
												) : null}

												{club.description && (
													<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
														{club.description}
													</p>
												)}

												{/* Attachments if any */}
												{club.attachments?.length > 0 && (
													<div className="mt-4 pt-3 border-t border-rule-soft">
														<span className="text-[12px] font-mono text-muted-foreground flex items-center gap-1.5">
															<Paperclip className="h-3 w-3" />
															{club.attachments.length} document{club.attachments.length === 1 ? "" : "s"}
														</span>
													</div>
												)}
											</div>

											<div className="mt-6 pt-4 border-t border-rule-soft flex items-center justify-between">
												<span className="t-meta">
													{postsCount} {postsCount === 1 ? "report" : "reports"}
												</span>
												<Link
													to="/clubs/$slug"
													params={{ slug: club.slug }}
													className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground"
												>
													View society
													<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
							<div className="rounded-card border border-dashed border-border bg-card p-12 text-center">
								<Megaphone className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
								<h3 className="font-display text-base font-semibold text-foreground">
									No society reports match &ldquo;{searchQuery}&rdquo;
								</h3>
								<p className="mt-1 text-xs text-muted-foreground">
									Secretaries and faculty advisors post term exhibition guidelines, tournament tallies, and meeting minutes here.
								</p>
							</div>
						) : (
							<div className="grid gap-6 md:grid-cols-2">
								{filteredPosts.map((post: any) => {
									const plainText = (post.excerpt || post.body || "")
										.replace(/<[^>]*>/g, " ")
										.replace(/\s+/g, " ")
										.trim();
									return (
										<article
											key={post.id}
											className="group rounded-card border border-border bg-card p-6 flex flex-col justify-between shadow-xs hover:border-rule-strong hover:bg-secondary/40 transition-colors duration-fast text-left"
										>
											<div>
												<div className="flex items-center justify-between gap-3 border-b border-rule-soft pb-3 mb-3">
													<Link
														to="/clubs/$slug"
														params={{ slug: post.club.slug }}
														className="t-eyebrow text-foreground hover:underline"
													>
														{post.club.name}
													</Link>
													<span className="t-meta">
														{formatDistanceToNow(new Date(post.createdAt), {
															addSuffix: true,
														})}
													</span>
												</div>

												<Link
													to="/activities/$postId"
													params={{ postId: post.id }}
													className="block"
												>
													<h3 className="font-display text-[18px] font-semibold leading-snug text-foreground transition-colors group-hover:text-foreground">
														{post.title}
													</h3>
												</Link>

												<p className="mt-2.5 text-[13px] leading-relaxed text-muted-foreground line-clamp-3">
													{plainText}
												</p>
											</div>

											<div className="mt-6 pt-4 border-t border-rule-soft flex items-center justify-between text-[12px] text-muted-foreground">
												<span className="font-mono text-[11px]">
													By{" "}
													<strong className="text-foreground font-medium">
														{post.authorStudent?.user?.name || post.author?.name || "Society Secretary"}
													</strong>
												</span>
												<Link
													to="/activities/$postId"
													params={{ postId: post.id }}
													className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground"
												>
													Read report
													<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
												</Link>
											</div>
										</article>
									);
								})}
							</div>
						)}
					</div>
				)}

				{/* How to Participate Callout */}
				<div className="mt-16 rounded-card border border-border bg-card p-6 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xs">
					<div className="max-w-xl space-y-2">
						<p className="t-eyebrow">
							SOCIETY PARTICIPATION
						</p>
						<h3 className="font-display text-2xl font-semibold text-foreground">
							Joining a Society at Everest
						</h3>
						<p className="text-[13px] text-muted-foreground leading-relaxed">
							Pupils in Grades 6 through 12 register for one academic society and one athletics club at the beginning of each academic session. Society inquiries and room allocations are maintained by the co-curricular desk in Block A.
						</p>
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<Link
							to="/login"
							className="inline-flex min-h-11 items-center gap-2 rounded-chip bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
						>
							Student Portal Sign In
						</Link>
						<Link
							to="/contact"
							className="inline-flex min-h-11 items-center gap-2 rounded-chip border border-border bg-background px-4 py-2 text-xs font-medium text-foreground hover:bg-secondary"
						>
							Administrative Office
						</Link>
					</div>
				</div>
			</Section>
		</PageFrame>
	);
}
