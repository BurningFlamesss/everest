import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock, Paperclip, Users } from "lucide-react";
import {
	type ClubAccess,
	ClubFeed,
	type ClubPost,
} from "#/components/clubs/ClubFeed";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import {
	getAllMyClubAccessFn,
	getClubPostsFn,
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

		// Each card renders its own feed, so fetch the boards in parallel once
		// rather than letting every card waterfall a client request.
		const boards = await Promise.all(
			clubs.map(async (club: ClubRow) => {
				const board = await getClubPostsFn({ data: { slug: club.slug } });
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

type ClubAccessMap = Record<string, ClubAccess>;

function ClubsPage() {
	const search =
		(useSearch({ strict: false }) as Record<string, unknown>) || {};
	const cms = search.cms;
	const { clubs, accessBySlug, postsBySlug, userId, previewPage } =
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
		<PageFrame dense>
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

			<Section className="mb-10">
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
	const memberCount = (club.members || []).length;

	return (
		<article className="flex h-full flex-col rounded-2xl border border-border bg-card p-6">
			<Link
				to="/clubs/$slug"
				params={{ slug: club.slug }}
				data-testid="club-card-link"
				className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
			>
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
				<div className="mt-4 flex flex-wrap items-center gap-2">
					<h2 className="text-xl font-semibold text-foreground">{club.name}</h2>
					{access?.isMember ? (
						<span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary">
							Member
						</span>
					) : null}
				</div>
				{club.description ? (
					<p className="mt-2 line-clamp-4 text-sm leading-relaxed text-muted-foreground">
						{club.description}
					</p>
				) : null}
				{club.meetingSchedule ? (
					<p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
						<Clock className="h-3.5 w-3.5" />
						{club.meetingSchedule}
					</p>
				) : null}

				<div className="mt-5 flex items-center justify-between gap-3 border-t border-rule pt-4">
					<span className="text-xs text-muted-foreground">
						{memberCount} member{memberCount === 1 ? "" : "s"}
					</span>
					<span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
						View club
						<ArrowRight
							className="h-3.5 w-3.5 transition-transform duration-fast group-hover:translate-x-0.5"
							aria-hidden="true"
						/>
					</span>
				</div>
			</Link>

			{access?.roleName ? (
				<p className="mt-3 text-xs font-medium text-primary">
					Your role: {access.roleName}
					{access.canCreatePosts
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
						{club.attachments.map((attachment) => (
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
