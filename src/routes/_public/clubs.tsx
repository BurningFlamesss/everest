import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, Clock, Paperclip, Users } from "lucide-react";
import type { ClubAccess } from "#/components/clubs/ClubFeed";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { getAllMyClubAccessFn } from "#/packages/clubs/server.ts";
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
			title:
				"Student Clubs & Societies | Everest English Boarding Secondary School (EEBSS)",
			description:
				"Join student clubs at Everest School, Butwal: Science & Innovation, Robotics & IT, Literature & Debate, Eco Conservation, and Athletics. Developing leadership, teamwork, and passion.",
			path: "/clubs",
			keywords:
				"everest school clubs, student societies nepal, eebss clubs, robotics club school butwal, extracurricular activities nepal",
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

		return {
			clubs,
			accessBySlug: accessResult.accessBySlug as ClubAccessMap,
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
	const { clubs, accessBySlug, previewPage } = Route.useLoaderData();
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
}: {
	club: ClubRow;
	access?: ClubAccess;
}) {
	const memberCount = (club.members || []).length;

	return (
		<article className="flex h-full flex-col justify-between rounded-card border border-border bg-card p-6 shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 text-left">
			<Link
				to="/clubs/$slug"
				params={{ slug: club.slug }}
				data-testid="club-card-link"
				className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring"
			>
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
					<span className="t-eyebrow text-muted-foreground">Student Society</span>
					<span className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-secondary/60 px-2.5 py-0.5 text-[11px] font-mono text-muted-foreground shrink-0">
						{memberCount} {memberCount === 1 ? "member" : "members"}
					</span>
				</div>

				<div className="mt-2.5 flex flex-wrap items-center gap-2">
					<h2 className="font-display text-[20px] font-semibold leading-snug text-foreground">
						{club.name}
					</h2>
					{access?.isMember ? (
						<span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10.5px] font-medium text-primary">
							Member
						</span>
					) : null}
				</div>

				{club.meetingSchedule ? (
					<p className="mt-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
						<Clock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
						<span>{club.meetingSchedule}</span>
					</p>
				) : null}

				{club.description ? (
					<p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">
						{club.description}
					</p>
				) : null}

				<div className="mt-6 flex items-center justify-between gap-3 border-t border-rule-soft pt-4">
					<span className="t-meta">
						Official Society
					</span>
					<span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground">
						View society
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
				<div className="mt-4 border-t border-rule-soft pt-3">
					<h3 className="flex items-center gap-2 text-xs font-semibold text-foreground">
						<Paperclip className="h-3.5 w-3.5 text-primary" /> Attachments
					</h3>
					<ul className="mt-2 space-y-1.5">
						{club.attachments.map((attachment) => (
							<li key={attachment.id}>
								<a
									href={attachment.fileAsset.url}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between gap-2 rounded-md bg-secondary/60 px-2.5 py-1.5 text-xs text-foreground hover:bg-secondary"
								>
									<span className="min-w-0 truncate font-medium">
										{attachment.label ?? attachment.fileAsset.originalName}
									</span>
									<span className="shrink-0 text-[10px] text-muted-foreground font-mono">
										{Math.max(1, Math.round(attachment.fileAsset.size / 1024))}{" "}
										KB
									</span>
								</a>
							</li>
						))}
					</ul>
				</div>
			) : null}
		</article>
	);
}
