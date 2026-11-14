import { createFileRoute, useRouter, useSearch } from "@tanstack/react-router";
import {
	Clock,
	MessageSquare,
	Paperclip,
	Pencil,
	Pin,
	Trash2,
	Users,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { relativeTime } from "#/lib/format";
import { clubPermissionsLabel } from "#/packages/clubs/permissions.ts";
import {
	createClubPostAction,
	createPostCommentAction,
	deleteClubPostAction,
	getAllMyClubAccessFn,
	getClubBoardFn,
	updateClubPostAction,
} from "#/packages/clubs/server.ts";
import { getWebsitePagePreviewServer } from "#/packages/content/server/content.ts";
import { getClubsFn } from "#/packages/content/server.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	PageHeader,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";
import type { BlockType } from "#/types";

type ClubRow = Awaited<ReturnType<typeof getClubsFn>>[number];
type ClubAttachment = ClubRow["attachments"][number];
type ClubRoleRow = ClubRow["roles"][number];
type ClubMemberRow = ClubRow["members"][number];

/** Posts as returned by getClubBoardFn for one club. */
type ClubBoardResult = Awaited<ReturnType<typeof getClubBoardFn>>;
type ClubPost = Extract<ClubBoardResult, { success: true }>["posts"][number];

export const Route = createFileRoute("/_public/clubs")({
	head: () =>
		pageMeta({
			title: "Clubs",
			description:
				"Clubs give students a place to build skills, make friends and take on responsibility beyond the classroom.",
		}),
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		const [clubs, accessResult, previewPage] = await Promise.all([
			getClubsFn({ data: {} }),
			getAllMyClubAccessFn(),
			String(search.cms) === "1"
				? getWebsitePagePreviewServer({ data: { key: "clubs" } })
				: Promise.resolve(null),
		]);

		// Pull each club's feed in parallel so ClubCard can render posts
		// server-side without a waterfall of client fetches.
		const boards = await Promise.all(
			clubs.map(async (club: ClubRow) => {
				const board = await getClubBoardFn({ data: { slug: club.slug } });
				return board.success ? { slug: club.slug, posts: board.posts } : null;
			}),
		);
		const postsBySlug: Record<string, ClubPost[]> = {};
		for (const board of boards) {
			if (board) postsBySlug[board.slug] = board.posts;
		}

		return {
			clubs,
			userId: accessResult.userId,
			accessBySlug: accessResult.accessBySlug as ClubAccessMap,
			postsBySlug,
			previewPage,
		};
	},
	component: ClubsPage,
});

function ClubsPage() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { clubs, userId, accessBySlug, postsBySlug, previewPage } =
		Route.useLoaderData();
	const publishedContent = useWebsitePageContent("clubs");
	const preview = String(cms ?? "") === "1";
	const cmsData = preview ? previewPage : publishedContent;

	const headerSection = {
		...sectionDefaults("headline"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "clubs",
				sectionType,
			},
			"*",
		);
	};

	return (
		<PageFrame>
			<CmsSectionBox
				preview={preview}
				sectionType="headline"
				onSelect={onSelectSection}
				testId="cms-section-hit-clubs-headline"
			>
				<PageHeader
					eyebrow={str(headerSection, "eyebrow") || "Student life"}
					title={str(headerSection, "title") || "Clubs"}
					lead={
						str(headerSection, "body") ||
						"Clubs give students a place to build skills, make friends and take on responsibility beyond the classroom."
					}
				/>
			</CmsSectionBox>

			<Section className="mb-20">
				{clubs.length === 0 ? (
					<div className="rounded-2xl border border-border bg-card p-10 text-center">
						<Users className="mx-auto h-8 w-8 text-muted-foreground/40" />
						<p className="mt-3 text-muted-foreground">
							Club information will be published soon.
						</p>
					</div>
				) : (
					<div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
						{clubs.map((club: ClubRow) => (
							<ClubCard
								key={club.id}
								club={club}
								access={accessBySlug[club.slug]}
								posts={postsBySlug[club.slug] ?? []}
								userId={userId}
							/>
						))}
					</div>
				)}
			</Section>
		</PageFrame>
	);
}

/** Per-club viewer access, as computed by getAllMyClubAccessFn.
 *
 * The server fn's return type narrows its accessBySlug to `Record<...> | {}`
 * (the anonymous branch returns `{}`), so indexing by slug needs a cast to a
 * uniform record — the runtime value is always a plain object keyed by slug.
 */
type ClubAccessEntry = {
	canCreatePosts: boolean;
	canEditAnyPost: boolean;
	canPinPosts: boolean;
	canManageMembers: boolean;
	roleName: string | null;
	isMember: boolean;
};
type ClubAccessMap = Record<string, ClubAccessEntry>;
type ClubAccess = ClubAccessEntry;

/** Post author label — staff author, student author, or system fallback. */
function postAuthorName(post: ClubPost): string {
	return post.author?.name ?? post.authorStudent?.user.name ?? "Club officer";
}

function ClubCard({
	club,
	access,
	posts,
	userId,
}: {
	club: ClubRow;
	access?: ClubAccess;
	posts: ClubPost[];
	userId?: string | null;
}) {
	const boardRoles = (club.roles || []).filter(
		(role: ClubRoleRow) => role.isBoard,
	);
	const memberCount = (club.members || []).length;
	const viewerRole = access?.roleName ?? null;

	return (
		<article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
			{club.coverImage ? (
				<img
					src={club.coverImage}
					alt=""
					className="mb-4 h-40 w-full rounded-xl object-cover"
				/>
			) : null}
			<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
				<Users className="h-5 w-5" />
			</div>
			<h2 className="mt-4 text-xl font-semibold text-foreground">
				{club.name}
			</h2>
			{club.description ? (
				<p className="mt-2 text-sm leading-relaxed text-muted-foreground">
					{club.description}
				</p>
			) : null}
			{club.meetingSchedule ? (
				<p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
					<Clock className="h-3.5 w-3.5" />
					{club.meetingSchedule}
				</p>
			) : null}

			{boardRoles.length > 0 ? (
				<div className="mt-5 border-t border-rule pt-4">
					<h3 className="text-sm font-semibold text-foreground">Club board</h3>
					<ul className="mt-2 space-y-1.5">
						{boardRoles.map((role: ClubRoleRow) => {
							const holder = club.members.find(
								(member: ClubMemberRow) => member.role?.id === role.id,
							);
							const permissionLabel = clubPermissionsLabel(role.permissions);
							return (
								<li
									key={role.id}
									className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm"
								>
									<span className="font-medium text-foreground">
										{holder ? holder.student.user.name : "—"}
									</span>
									<span className="text-xs text-muted-foreground">
										{role.name}
										{permissionLabel ? ` · ${permissionLabel}` : ""}
									</span>
								</li>
							);
						})}
					</ul>
					{memberCount > 0 ? (
						<p className="mt-2 text-xs text-muted-foreground">
							{memberCount} member{memberCount === 1 ? "" : "s"}
						</p>
					) : null}
				</div>
			) : null}

			{viewerRole ? (
				<p className="mt-2 text-xs font-medium text-primary">
					Your role: {viewerRole}
					{access?.canCreatePosts
						? " · you can publish to this feed"
						: " · publishing is limited to club officers"}
				</p>
			) : null}

			{club.attachments.length > 0 ? (
				<div className="mt-5 border-t border-rule pt-4">
					<h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
						<Paperclip className="h-4 w-4 text-primary" /> Attachments
					</h3>
					<ul className="mt-2 space-y-2">
						{club.attachments.map((attachment: ClubAttachment) => (
							<li key={attachment.id}>
								<a
									href={attachment.fileAsset.url}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between gap-2 rounded-lg bg-secondary px-3 py-2 text-sm text-foreground hover:bg-secondary/70"
								>
									<span className="min-w-0 break-words font-medium">
										{attachment.label ?? attachment.fileAsset.originalName}
									</span>
									<span className="shrink-0 text-xs text-muted-foreground">
										{Math.max(1, Math.round(attachment.fileAsset.size / 1024))}{" "}
										KB
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			) : null}

			<ClubFeed
				clubSlug={club.slug}
				posts={posts}
				access={access}
				userId={userId}
			/>
		</article>
	);
}

/**
 * The club feed: published posts (pinned first) plus a composer for viewers
 * whose role carries `posts.create`. Plain members see the feed read-only,
 * which is exactly the constraint the roles editor enforces. Authors can edit
 * or delete their own posts; `posts.editAny` allows editing anyone's; the
 * pin toggle follows `posts.pin`. Signed-in members can comment.
 */
function ClubFeed({
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

	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [isPinned, setIsPinned] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting) return;

		setError("");
		setNotice("");
		setIsSubmitting(true);

		try {
			const result = await createClubPostAction({
				data: {
					slug: clubSlug,
					title: title.trim(),
					body: body.trim(),
					isPinned: canPin ? isPinned : false,
				},
			});

			if (!result.success) {
				setError(result.error);
				return;
			}

			setTitle("");
			setBody("");
			setIsPinned(false);
			setNotice("Published.");
			await router.invalidate();
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="mt-5 border-t border-rule pt-4">
			<h3 className="text-sm font-semibold text-foreground">Club feed</h3>

			{canPost ? (
				<form
					onSubmit={(event) => void onSubmit(event)}
					className="mt-3 space-y-2"
					data-testid={`club-composer-${clubSlug}`}
				>
					<input
						value={title}
						onChange={(event) => setTitle(event.target.value)}
						placeholder="Post title"
						aria-label="Post title"
						required
						maxLength={160}
						className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
					/>
					<textarea
						value={body}
						onChange={(event) => setBody(event.target.value)}
						placeholder="Share an update with the club…"
						aria-label="Post body"
						required
						rows={3}
						maxLength={4000}
						className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
					/>
					<div className="flex flex-wrap items-center justify-between gap-2">
						{canPin ? (
							<label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
								<input
									type="checkbox"
									checked={isPinned}
									onChange={(event) => setIsPinned(event.target.checked)}
									className="size-4 accent-primary"
								/>
								Pin to top
							</label>
						) : (
							<span />
						)}
						<button
							type="submit"
							disabled={isSubmitting || !title.trim() || !body.trim()}
							className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isSubmitting ? "Publishing…" : "Publish"}
						</button>
					</div>
					{error ? (
						<p
							role="alert"
							className="text-xs text-red-600"
							data-testid={`club-composer-error-${clubSlug}`}
						>
							{error}
						</p>
					) : null}
					{notice ? (
						<p className="text-xs font-medium text-primary">{notice}</p>
					) : null}
				</form>
			) : null}

			{posts.length === 0 ? (
				<p className="mt-3 text-xs text-muted-foreground">No posts yet.</p>
			) : (
				<ul className="mt-3 space-y-3">
					{posts.map((post: ClubPost) => (
						<ClubFeedPost
							key={post.id}
							post={post}
							userId={userId}
							access={access}
							canEditAny={canEditAny}
							canPin={canPin}
						/>
					))}
				</ul>
			)}
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
}: {
	post: ClubPost;
	userId?: string | null;
	access?: ClubAccess;
	canEditAny: boolean;
	canPin: boolean;
}) {
	const router = useRouter();
	const isOwnPost = Boolean(userId) && post.authorId === userId;
	const canEdit = Boolean(isOwnPost || canEditAny);
	// The server admits members and anyone whose club roles grant at least one
	// permission (`permissions.size > 0`); a direct role with an empty
	// permission list does not qualify. Mirror that exactly — `roleName` alone
	// is too loose, since such a role still reports a name.
	const hasClubPermission = Boolean(
		access?.canCreatePosts ||
			access?.canEditAnyPost ||
			access?.canPinPosts ||
			access?.canManageMembers,
	);
	const canComment = Boolean(userId && (access?.isMember || hasClubPermission));

	/** null = render mode; non-null = inline edit form with those drafts. */
	const [editDraft, setEditDraft] = useState<{
		title: string;
		body: string;
	} | null>(null);
	const [isSaving, setIsSaving] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isPinning, setIsPinning] = useState(false);
	const [error, setError] = useState("");
	const [isCommentsOpen, setIsCommentsOpen] = useState(false);
	const [commentDraft, setCommentDraft] = useState("");
	const [commentBusy, setCommentBusy] = useState(false);
	const [commentError, setCommentError] = useState("");

	const startEdit = () => {
		setError("");
		setEditDraft({ title: post.title, body: post.body });
	};

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

	const saveEdit = async () => {
		if (!editDraft || isSaving) return;
		const title = editDraft.title.trim();
		const body = editDraft.body.trim();
		if (!title || !body) return;

		setError("");
		setIsSaving(true);

		try {
			const result = await updateClubPostAction({
				data: { postId: post.id, title, body },
			});

			if (!result.success) {
				setError(result.error);
				return;
			}

			setEditDraft(null);
			await router.invalidate();
		} finally {
			setIsSaving(false);
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

	return (
		<li
			className="rounded-xl border border-border bg-secondary/40 p-3"
			data-testid={`club-post-${post.id}`}
		>
			{editDraft ? (
				<form
					onSubmit={(event) => {
						event.preventDefault();
						void saveEdit();
					}}
					className="space-y-2"
					data-testid={`club-post-edit-${post.id}`}
				>
					<input
						value={editDraft.title}
						onChange={(event) =>
							setEditDraft({ ...editDraft, title: event.target.value })
						}
						placeholder="Post title"
						aria-label="Edit post title"
						required
						maxLength={160}
						className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
					/>
					<textarea
						value={editDraft.body}
						onChange={(event) =>
							setEditDraft({ ...editDraft, body: event.target.value })
						}
						placeholder="Post body"
						aria-label="Edit post body"
						required
						rows={3}
						maxLength={4000}
						className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
					/>
					<div className="flex items-center justify-between gap-2">
						{error ? (
							<p role="alert" className="text-xs text-red-600">
								{error}
							</p>
						) : (
							<span />
						)}
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setEditDraft(null)}
								className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary"
							>
								Cancel
							</button>
							<button
								type="submit"
								disabled={
									isSaving || !editDraft.title.trim() || !editDraft.body.trim()
								}
								className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{isSaving ? "Saving…" : "Save changes"}
							</button>
						</div>
					</div>
				</form>
			) : (
				<>
					<div className="flex items-start justify-between gap-2">
						<p className="min-w-0 break-words text-sm font-semibold text-foreground">
							{post.title}
						</p>
						{post.isPinned ? (
							<span
								className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
								title="Pinned post"
							>
								<Pin className="h-3 w-3" /> Pinned
							</span>
						) : null}
					</div>
					<p className="mt-1.5 whitespace-pre-line break-words text-sm leading-relaxed text-muted-foreground">
						{post.body}
					</p>
					<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
						<p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
							<span className="font-medium text-foreground">
								{postAuthorName(post)}
							</span>
							<span aria-hidden="true">·</span>
							<span>{relativeTime(post.createdAt)}</span>
						</p>
						<div className="inline-flex items-center gap-1">
							{canEdit ? (
								<>
									<button
										type="button"
										onClick={startEdit}
										className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
										aria-label="Edit post"
									>
										<Pencil className="h-3 w-3" /> Edit
									</button>
									<button
										type="button"
										onClick={() => void remove()}
										disabled={isDeleting}
										className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
									className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-secondary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
								<span>{post.comments.length}</span>
								{isCommentsOpen ? " Hide comments" : " Comments"}
							</button>
						</div>
					</div>
					{error ? (
						<p
							role="alert"
							className="mt-1 text-xs text-red-600"
							data-testid={`club-post-error-${post.id}`}
						>
							{error}
						</p>
					) : null}
					{isCommentsOpen ? (
						<div
							className="mt-3 space-y-2 border-t border-rule pt-3"
							data-testid={`club-comments-${post.id}`}
						>
							<ul className="space-y-2">
								{post.comments.map((comment) => (
									<li
										key={comment.id}
										className="text-xs leading-relaxed text-muted-foreground"
									>
										<span className="font-medium text-foreground">
											{comment.author?.name ?? "Member"}
										</span>
										<span aria-hidden="true"> · </span>
										<span>{relativeTime(comment.createdAt)}</span>
										<p className="mt-0.5 whitespace-pre-line break-words">
											{comment.body}
										</p>
									</li>
								))}
								{post.comments.length === 0 ? (
									<li className="text-xs text-muted-foreground">
										No comments yet.
									</li>
								) : null}
							</ul>
							{canComment ? (
								<form
									onSubmit={(event) => {
										event.preventDefault();
										void submitComment();
									}}
									className="space-y-2 border-t border-rule pt-3"
								>
									<textarea
										value={commentDraft}
										onChange={(event) => setCommentDraft(event.target.value)}
										placeholder="Write a comment…"
										aria-label="Comment"
										required
										maxLength={2000}
										rows={2}
										className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
									/>
									<div className="flex items-center justify-between gap-2">
										{commentError ? (
											<p role="alert" className="text-xs text-red-600">
												{commentError}
											</p>
										) : (
											<span />
										)}
										<button
											type="submit"
											disabled={commentBusy || !commentDraft.trim()}
											className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{commentBusy ? "Commenting…" : "Comment"}
										</button>
									</div>
								</form>
							) : (
								<p className="border-t border-rule pt-3 text-xs text-muted-foreground">
									{userId
										? "Join the club before commenting on its posts."
										: "Sign in to join the conversation."}
								</p>
							)}
						</div>
					) : null}
				</>
			)}
		</li>
	);
}
