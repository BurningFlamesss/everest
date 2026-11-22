import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { format, formatDistanceToNow } from "date-fns";
import {
	ArrowLeft,
	ArrowRight,
	Calendar,
	Check,
	Clock,
	MessageSquare,
	Send,
	Share2,
	ShieldAlert,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "#/components/ui/button";
import { Textarea } from "#/components/ui/textarea";
import {
	createPostCommentAction,
	getClubPostDetailFn,
} from "#/packages/clubs/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

export const Route = createFileRoute("/_public/activities_/$postId")({
	head: ({ loaderData, params }) => {
		const post = (loaderData as any)?.detail?.post;
		return pageMeta({
			title: post
				? `${post.title} | ${post.club?.name || "Activities"} | Everest English Boarding Secondary School (EEBSS)`
				: "Club Story & Announcement | Everest School (EEBSS)",
			description:
				post?.excerpt ||
				(post?.body ? post.body.replace(/<[^>]*>/g, "").slice(0, 160) : ""),
			image: post?.coverImage,
			path: `/activities/${params.postId}`,
			type: "article",
			publishedTime: post?.createdAt
				? new Date(post.createdAt).toISOString()
				: undefined,
			modifiedTime: post?.updatedAt
				? new Date(post.updatedAt).toISOString()
				: undefined,
		});
	},
	loader: async ({ params }) => {
		const detail = await getClubPostDetailFn({ data: { postId: params.postId } });
		return { detail };
	},
	component: ActivityBlogPostPage,
});

function ActivityBlogPostPage() {
	const { detail } = (Route.useLoaderData() as { detail: any }) || {};
	const router = useRouter();
	const [commentBody, setCommentBody] = useState("");
	const [isSubmittingComment, setIsSubmittingComment] = useState(false);
	const [copied, setCopied] = useState(false);

	if (!detail.success || !detail.post) {
		return (
			<PageFrame dense>
				<div className="py-24 text-center max-w-md mx-auto">
					<ShieldAlert className="mx-auto h-12 w-12 text-destructive mb-4" />
					<h2 className="text-xl font-bold text-foreground">
						Article Unavailable
					</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						{detail.error || "The requested club post could not be loaded or may be restricted."}
					</p>
					<Link
						to="/activities"
						className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> Back to all activities
					</Link>
				</div>
			</PageFrame>
		);
	}

	const { post, moreFromClub = [], userId } = detail;
	const authorName =
		post.authorStudent?.user?.name || post.author?.name || "Club Officer";
	const authorSub = post.authorStudent
		? `Grade ${post.authorStudent.grade || ""}${post.authorStudent.section ? ` '${post.authorStudent.section}'` : ""}`
		: "Staff Advisor";

	// Reading time estimate based on word count
	const wordCount = (post.body || "").replace(/<[^>]*>/g, " ").split(/\s+/).filter(Boolean).length;
	const readMinutes = Math.max(1, Math.ceil(wordCount / 180));

	const copyLink = async () => {
		try {
			await navigator.clipboard.writeText(window.location.href);
			setCopied(true);
			toast.success("Article link copied to clipboard");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Could not copy link");
		}
	};

	const onCommentSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!commentBody.trim() || isSubmittingComment) return;

		setIsSubmittingComment(true);
		try {
			const res = await createPostCommentAction({
				data: {
					postId: post.id,
					body: commentBody.trim(),
				},
			});
			if (res.success) {
				toast.success("Comment added");
				setCommentBody("");
				await router.invalidate();
			} else {
				toast.error(res.error || "Failed to post comment");
			}
		} finally {
			setIsSubmittingComment(false);
		}
	};

	return (
		<PageFrame dense testId="activity-blog-post">
			<Section className="max-w-4xl mx-auto pb-16">
				{/* Breadcrumb Navigation */}
				<nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8 overflow-x-auto whitespace-nowrap pb-1">
					<Link to="/" className="hover:text-foreground">
						Home
					</Link>
					<span>/</span>
					<Link to="/activities" className="hover:text-foreground">
						Activities
					</Link>
					<span>/</span>
					<Link
						to="/clubs/$slug"
						params={{ slug: post.club.slug }}
						className="hover:text-foreground font-medium text-primary"
					>
						{post.club.name}
					</Link>
					<span>/</span>
					<span className="text-foreground truncate max-w-xs">{post.title}</span>
				</nav>

				{/* Header Badges */}
				<div className="flex flex-wrap items-center gap-2.5 mb-4">
					<Link
						to="/clubs/$slug"
						params={{ slug: post.club.slug }}
						className="t-eyebrow text-foreground hover:underline"
					>
						{post.club.name}
					</Link>
					{post.category && (
						<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
							{post.category}
						</span>
					)}
					{post.isPinned && (
						<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
							Notice Board Feature
						</span>
					)}
					{post.visibility !== "PUBLIC" && (
						<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground">
							{post.visibility}
						</span>
					)}
				</div>

				{/* Blog Title */}
				<h1 className="font-display text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-foreground leading-[1.15]">
					{post.title}
				</h1>

				{/* Excerpt if present */}
				{post.excerpt && (
					<p className="mt-5 text-base sm:text-lg text-muted-foreground font-serif italic border-l-2 border-rule-strong pl-4 py-1 leading-relaxed">
						{post.excerpt}
					</p>
				)}

				{/* Author & Publication Meta Row */}
				<div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-rule-soft py-4">
					<div className="flex items-center gap-3">
						<div className="h-9 w-9 rounded-full border border-border bg-secondary flex items-center justify-center font-mono text-xs text-foreground uppercase">
							{authorName.charAt(0)}
						</div>
						<div className="flex flex-col">
							<span className="text-[13px] font-medium text-foreground">
								{authorName}
							</span>
							<span className="t-meta">
								{authorSub} · {post.club.name}
							</span>
						</div>
					</div>

					<div className="flex items-center gap-4 text-xs text-muted-foreground">
						<span className="flex items-center gap-1.5 t-meta">
							<Calendar className="h-3.5 w-3.5" />
							{format(new Date(post.createdAt), "MMMM d, yyyy")}
						</span>
						<span>·</span>
						<span className="flex items-center gap-1.5 t-meta">
							<Clock className="h-3.5 w-3.5" />
							{readMinutes} min read
						</span>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
							onClick={copyLink}
							aria-label="Share article link"
						>
							{copied ? (
								<>
									<Check className="h-3.5 w-3.5 text-emerald-500" /> Copied
								</>
							) : (
								<>
									<Share2 className="h-3.5 w-3.5" /> Share
								</>
							)}
						</Button>
					</div>
				</div>

				{/* Featured Cover Image */}
				{post.coverImage && (
					<div className="mt-8 overflow-hidden rounded-md border border-border bg-secondary shadow-xs">
						<img
							src={post.coverImage}
							alt={post.title}
							className="h-[340px] sm:h-[440px] w-full object-cover"
						/>
					</div>
				)}

				{/* Article Body (HTML or formatted text) */}
				<div className="mt-10 article-body">
					{post.body.includes("<") && post.body.includes(">") ? (
						<div
							className="prose prose-neutral max-w-none dark:prose-invert font-body text-[15px] sm:text-[16px] leading-[1.8] text-foreground [&_h1]:font-display [&_h1]:text-2xl [&_h2]:font-display [&_h2]:text-xl [&_h3]:font-display [&_h3]:text-lg [&_p]:leading-[1.8] [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_strong]:text-foreground [&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:border-border [&_th]:p-2 [&_td]:border [&_td]:border-border [&_td]:p-2"
							dangerouslySetInnerHTML={{ __html: post.body }}
						/>
					) : (
						<div className="font-body text-[15px] sm:text-[16px] leading-[1.8] text-foreground/90 whitespace-pre-line space-y-4">
							{post.body}
						</div>
					)}
				</div>

				{/* Back to Club & Activity CTA */}
				<div className="mt-12 rounded-card border border-border bg-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
					<div className="space-y-1">
						<p className="t-eyebrow">
							POSTED IN {post.club.name.toUpperCase()}
						</p>
						<h4 className="font-display text-[16px] font-semibold text-foreground">
							Explore meetings, schedules, and members in this society
						</h4>
					</div>
					<Link
						to="/clubs/$slug"
						params={{ slug: post.club.slug }}
						className="inline-flex min-h-10 items-center gap-1.5 rounded-chip border border-border bg-secondary hover:bg-secondary/80 px-4 py-2 text-xs font-semibold text-foreground transition-colors shrink-0"
					>
						Visit society page <ArrowRight className="h-3.5 w-3.5" />
					</Link>
				</div>

				{/* More from this Club */}
				{moreFromClub.length > 0 && (
					<div className="mt-16 pt-10 border-t border-rule-soft">
						<div className="flex items-center justify-between mb-6">
							<div>
								<p className="t-eyebrow">SOCIETY ARCHIVE</p>
								<h3 className="mt-1 font-display text-xl font-semibold text-foreground">
									More from {post.club.name}
								</h3>
							</div>
							<Link
								to="/activities"
								className="inline-flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
							>
								All dispatches <ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
						<div className="grid gap-6 sm:grid-cols-3">
							{moreFromClub.map((item: any) => (
								<Link
									key={item.id}
									to="/activities/$postId"
									params={{ postId: item.id }}
									className="group flex flex-col justify-between rounded-card border border-border bg-card p-5 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
								>
									<div>
										{item.coverImage && (
											<div className="h-32 w-full overflow-hidden rounded-md mb-3 border border-border bg-secondary">
												<img
													src={item.coverImage}
													alt=""
													className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											</div>
										)}
										<span className="t-meta">
											{formatDistanceToNow(new Date(item.createdAt), {
												addSuffix: true,
											})}
										</span>
										<h4 className="mt-1.5 font-display text-[15px] font-semibold text-foreground line-clamp-2 transition-colors group-hover:text-foreground">
											{item.title}
										</h4>
										<p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground line-clamp-2">
											{item.excerpt || item.body?.replace(/<[^>]*>/g, "").slice(0, 100)}
										</p>
									</div>
									<span className="mt-4 text-[12px] text-muted-foreground inline-flex items-center gap-1 pt-3 border-t border-rule-soft group-hover:text-foreground transition-colors">
										Read report <ArrowRight className="h-3 w-3" />
									</span>
								</Link>
							))}
						</div>
					</div>
				)}

				{/* Comments Section */}
				<div className="mt-16 pt-10 border-t border-rule-soft" id="comments">
					<div className="flex items-center gap-2 mb-6">
						<MessageSquare className="h-4 w-4 text-muted-foreground" />
						<h3 className="font-display text-lg font-semibold text-foreground">
							Reader Notes &amp; Inquiries ({post.comments?.length || 0})
						</h3>
					</div>

					{/* Comments List */}
					{post.comments && post.comments.length > 0 ? (
						<div className="space-y-3 mb-8">
							{post.comments.map((comment: any) => (
								<div
									key={comment.id}
									className="rounded-card border border-border bg-card p-4 flex gap-3 text-left shadow-xs"
								>
									<div className="h-8 w-8 rounded-full border border-border bg-secondary flex items-center justify-center font-mono text-xs text-foreground uppercase shrink-0">
										{(comment.author?.name || "U").charAt(0)}
									</div>
									<div className="flex-1 space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="font-medium text-foreground">
												{comment.author?.name || "Student"}
											</span>
											<span className="t-meta">
												{formatDistanceToNow(new Date(comment.createdAt), {
													addSuffix: true,
												})}
											</span>
										</div>
										<p className="text-[13px] text-muted-foreground whitespace-pre-line leading-relaxed">
											{comment.body}
										</p>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className="text-center py-8 rounded-card border border-dashed border-border mb-8 text-xs text-muted-foreground">
							No reader notes recorded on this dispatch yet.
						</div>
					)}

					{/* Add Comment Form */}
					{post.allowComments !== false && (
						<div className="rounded-card border border-border bg-card p-5 shadow-xs">
							{userId ? (
								<form onSubmit={onCommentSubmit} className="space-y-3">
									<label htmlFor="comment-text" className="text-xs font-medium text-foreground block">
										Leave a note or inquiry:
									</label>
									<Textarea
										id="comment-text"
										value={commentBody}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setCommentBody(e.target.value)
										}
										placeholder="Write a message regarding this activity…"
										rows={3}
										className="text-xs"
										required
									/>
									<div className="flex justify-end">
										<Button
											type="submit"
											size="sm"
											disabled={isSubmittingComment || !commentBody.trim()}
											className="gap-1.5 text-xs font-semibold rounded-chip"
										>
											<Send className="h-3.5 w-3.5" />
											{isSubmittingComment ? "Submitting…" : "Submit Note"}
										</Button>
									</div>
								</form>
							) : (
								<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
									<span className="text-muted-foreground">
										Sign in through the school portal to leave a note or inquiry for the society officers.
									</span>
									<Link
										to="/login"
										className="inline-flex items-center gap-1.5 font-medium text-foreground hover:underline shrink-0"
									>
										Sign in <ArrowRight className="h-3 w-3" />
									</Link>
								</div>
							)}
						</div>
					)}
				</div>
			</Section>
		</PageFrame>
	);
}
