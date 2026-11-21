import { Link, useRouter } from "@tanstack/react-router";
import {
	ArrowRight,
	Lock,
	MessageSquare,
	Pencil,
	Pin,
	Plus,
	Trash2,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { relativeTime } from "#/lib/format";
import type { getClubBoardFn } from "#/packages/clubs/server.ts";
import {
	createPostCommentAction,
	deleteClubPostAction,
	updateClubPostAction,
} from "#/packages/clubs/server.ts";
import { ClubPostComposerDialog } from "./ClubPostComposerDialog";

type ClubBoardResult = Awaited<ReturnType<typeof getClubBoardFn>>;
export type ClubPost = Extract<
	ClubBoardResult,
	{ success: true }
>["posts"][number] & {
	excerpt?: string | null;
	coverImage?: string | null;
	category?: string | null;
	visibility?: string | null;
	allowComments?: boolean;
};

/** Per-club viewer access, as computed by getAllMyClubAccessFn / getClubDetailFn. */
export type ClubAccess = {
	canCreatePosts: boolean;
	canEditAnyPost: boolean;
	canPinPosts: boolean;
	canManageMembers: boolean;
	roleName: string | null;
	isMember: boolean;
};

/** Post author label — staff author, student author, or system fallback. */
function postAuthorName(post: ClubPost): string {
	return post.author?.name ?? post.authorStudent?.user.name ?? "Club officer";
}

export function ClubFeed({
	clubSlug,
	posts,
	access,
	userId,
}: {
	clubSlug: string;
	posts: ClubPost[];
	access?: ClubAccess;
	userId?: string | null;
}) {
	const router = useRouter();
	const canPost = Boolean(access?.canCreatePosts);
	const canPin = Boolean(access?.canPinPosts);
	const canEditAny = Boolean(access?.canEditAnyPost);

	const [isComposerOpen, setIsComposerOpen] = useState(false);
	const [editingPost, setEditingPost] = useState<ClubPost | null>(null);

	return (
		<div className="mt-5 border-t border-rule pt-4">
			<div className="flex items-center justify-between gap-2 mb-3">
				<div>
					<h3 className="text-sm font-semibold text-foreground">Club Feed &amp; Stories</h3>
					<p className="text-[11px] text-muted-foreground">
						Public articles, announcements, and workshop recaps.
					</p>
				</div>
				{canPost && (
					<Button
						size="sm"
						onClick={() => {
							setEditingPost(null);
							setIsComposerOpen(true);
						}}
						className="gap-1.5 text-xs font-semibold h-8"
						data-testid={`club-composer-open-${clubSlug}`}
					>
						<Plus className="h-3.5 w-3.5" />
						Create Post / Article
					</Button>
				)}
			</div>

			{posts.length === 0 ? (
				<div className="rounded-xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
					No posts published yet in this club feed.
				</div>
			) : (
				<ul className="space-y-3">
					{posts.map((post: ClubPost) => (
						<ClubFeedPost
							key={post.id}
							post={post}
							userId={userId}
							access={access}
							canEditAny={canEditAny}
							canPin={canPin}
							onEdit={() => {
								setEditingPost(post);
								setIsComposerOpen(true);
							}}
						/>
					))}
				</ul>
			)}

			{/* Powerful Modal Post Composer with RichTextEditor and Visibility controls */}
			<ClubPostComposerDialog
				open={isComposerOpen}
				onOpenChange={(open) => {
					setIsComposerOpen(open);
					if (!open) setEditingPost(null);
				}}
				clubSlug={clubSlug}
				canPin={canPin}
				editingPost={editingPost}
				onSuccess={() => void router.invalidate()}
			/>
		</div>
	);
}

/** One feed post with its per-viewer edit / pin / comment controls. */
function ClubFeedPost({
	post,
	userId,
	access,
	canEditAny,
	canPin,
	onEdit,
}: {
	post: ClubPost;
	userId?: string | null;
	access?: ClubAccess;
	canEditAny: boolean;
	canPin: boolean;
	onEdit: () => void;
}) {
	const router = useRouter();
	const isOwnPost = Boolean(userId) && post.authorId === userId;
	const canEdit = Boolean(isOwnPost || canEditAny);
	const hasClubPermission = Boolean(
		access?.canCreatePosts ||
			access?.canEditAnyPost ||
			access?.canPinPosts ||
			access?.canManageMembers,
	);
	const canComment = Boolean(userId && (access?.isMember || hasClubPermission));

	const [isDeleting, setIsDeleting] = useState(false);
	const [isPinning, setIsPinning] = useState(false);
	const [error, setError] = useState("");
	const [isCommentsOpen, setIsCommentsOpen] = useState(false);
	const [commentDraft, setCommentDraft] = useState("");
	const [commentBusy, setCommentBusy] = useState(false);
	const [commentError, setCommentError] = useState("");

	const submitComment = async () => {
		const trimmed = commentDraft.trim();
		if (!trimmed || commentBusy) return;

		setCommentError("");
		setCommentBusy(true);

		try {
			const result = await createPostCommentAction({
				data: { postId: post.id, body: trimmed },
			});

			if (!result.success) {
				setCommentError(result.error);
				return;
			}

			setCommentDraft("");
			await router.invalidate();
		} finally {
			setCommentBusy(false);
		}
	};

	const togglePin = async () => {
		if (isPinning) return;

		setError("");
		setIsPinning(true);

		try {
			const result = await updateClubPostAction({
				data: { postId: post.id, isPinned: !post.isPinned },
			});

			if (!result.success) {
				setError(result.error);
				return;
			}

			await router.invalidate();
		} finally {
			setIsPinning(false);
		}
	};

	const remove = async () => {
		if (isDeleting) return;
		if (!window.confirm("Delete this post permanently?")) return;

		setError("");
		setIsDeleting(true);

		try {
			const result = await deleteClubPostAction({ data: { postId: post.id } });

			if (!result.success) {
				setError(result.error);
				return;
			}

			await router.invalidate();
		} finally {
			setIsDeleting(false);
		}
	};

	const isHtml = post.body.includes("<") && post.body.includes(">");

	return (
		<li
			className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-foreground/20"
			data-testid={`club-post-${post.id}`}
		>
			<div className="flex flex-col gap-2">
				{/* Top Badges & Meta */}
				<div className="flex flex-wrap items-center justify-between gap-2">
					<div className="flex items-center gap-2 flex-wrap">
						{post.category && (
							<Badge variant="outline" className="text-[10px] font-mono py-0">
								{post.category}
							</Badge>
						)}
						{post.visibility && post.visibility !== "PUBLIC" && (
							<Badge variant="secondary" className="text-[10px] py-0">
								<Lock className="mr-1 h-2.5 w-2.5" />
								{post.visibility}
							</Badge>
						)}
						{post.isPinned ? (
							<span
								className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold"
								title="Pinned post"
							>
								<Pin className="h-3 w-3" /> Pinned
							</span>
						) : null}
					</div>

					<span className="text-[11px] text-muted-foreground font-mono">
						{relativeTime(post.createdAt)}
					</span>
				</div>

				{/* Title as Blog Link */}
				<Link
					to="/activities/$postId"
					params={{ postId: post.id }}
					className="min-w-0 break-words text-base font-bold text-foreground hover:text-primary transition-colors inline-flex items-center gap-1.5 group"
					data-testid={`club-post-title-${post.id}`}
				>
					<span>{post.title}</span>
					<ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
				</Link>

				{/* Excerpt if present */}
				{post.excerpt && (
					<p className="text-xs text-muted-foreground font-serif italic border-l-2 border-primary/50 pl-2.5 py-0.5">
						{post.excerpt}
					</p>
				)}

				{/* Body snippet */}
				{isHtml ? (
					<div
						className="text-xs text-muted-foreground line-clamp-3 leading-relaxed"
						dangerouslySetInnerHTML={{ __html: post.body }}
					/>
				) : (
					<p className="whitespace-pre-line break-words text-xs leading-relaxed text-muted-foreground line-clamp-3">
						{post.body}
					</p>
				)}

				{/* Post Footer & Controls */}
				<div className="mt-2 pt-2 border-t border-border/60 flex flex-wrap items-center justify-between gap-2">
					<p className="text-[11px] text-muted-foreground">
						By <span className="font-medium text-foreground">{postAuthorName(post)}</span>
					</p>

					<div className="inline-flex items-center gap-1.5">
						<Link
							to="/activities/$postId"
							params={{ postId: post.id }}
							className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10 transition-colors"
						>
							Read blog article <ArrowRight className="h-2.5 w-2.5" />
						</Link>

						{canEdit ? (
							<>
								<button
									type="button"
									onClick={onEdit}
									className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
									aria-label="Edit post"
								>
									<Pencil className="h-3 w-3" /> Edit
								</button>
								<button
									type="button"
									onClick={() => void remove()}
									disabled={isDeleting}
									className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10 disabled:opacity-50"
									aria-label="Delete post"
								>
									<Trash2 className="h-3 w-3" />
									{isDeleting ? "Deleting…" : "Delete"}
								</button>
							</>
						) : null}

						{canPin ? (
							<button
								type="button"
								onClick={() => void togglePin()}
								disabled={isPinning}
								className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-50"
								title={post.isPinned ? "Unpin post" : "Pin post"}
							>
								<Pin className="h-3 w-3" />
								{isPinning ? "Pinning…" : post.isPinned ? "Unpin" : "Pin"}
							</button>
						) : null}

						<button
							type="button"
							onClick={() => setIsCommentsOpen((open) => !open)}
							aria-expanded={isCommentsOpen}
							className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
							data-testid={`club-post-comments-toggle-${post.id}`}
						>
							<MessageSquare className="h-3 w-3" />
							<span>{post.comments?.length || 0}</span>
						</button>
					</div>
				</div>

				{error ? (
					<p role="alert" className="mt-1 text-xs text-destructive">
						{error}
					</p>
				) : null}

				{/* Collapsible Comments Section */}
				{isCommentsOpen ? (
					<div
						className="mt-3 space-y-2 border-t border-border pt-3"
						data-testid={`club-comments-${post.id}`}
					>
						<ul className="space-y-2">
							{post.comments && post.comments.map((comment) => (
								<li
									key={comment.id}
									className="text-xs leading-relaxed text-muted-foreground bg-secondary/50 p-2.5 rounded-lg"
								>
									<div className="flex items-center justify-between text-[11px] mb-1">
										<span className="font-semibold text-foreground">
											{comment.author?.name ?? "Member"}
										</span>
										<span>{relativeTime(comment.createdAt)}</span>
									</div>
									<p className="whitespace-pre-line break-words text-foreground/90">
										{comment.body}
									</p>
								</li>
							))}
							{(!post.comments || post.comments.length === 0) && (
								<li className="text-xs text-muted-foreground italic py-1">
									No comments yet.
								</li>
							)}
						</ul>
						{canComment ? (
							<form
								onSubmit={(event) => {
									event.preventDefault();
									void submitComment();
								}}
								className="space-y-2 border-t border-border/60 pt-2"
							>
								<textarea
									value={commentDraft}
									onChange={(event) => setCommentDraft(event.target.value)}
									placeholder="Write a comment…"
									aria-label="Comment"
									required
									maxLength={2000}
									rows={2}
									className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground outline-none focus:border-primary"
								/>
								<div className="flex items-center justify-between gap-2">
									{commentError ? (
										<p role="alert" className="text-xs text-destructive">
											{commentError}
										</p>
									) : (
										<span />
									)}
									<button
										type="submit"
										disabled={commentBusy || !commentDraft.trim()}
										className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
									>
										{commentBusy ? "Commenting…" : "Comment"}
									</button>
								</div>
							</form>
						) : (
							<p className="border-t border-border/60 pt-2 text-xs text-muted-foreground">
								{userId
									? "Join the club before commenting on its posts."
									: "Sign in to join the conversation."}
							</p>
						)}
					</div>
				) : null}
			</div>
		</li>
	);
}
