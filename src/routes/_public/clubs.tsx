import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Clock, Paperclip, Users } from "lucide-react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { clubPermissionsLabel } from "#/packages/clubs/permissions.ts";
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
type ClubAttachment = ClubRow["attachments"][number];
type ClubRoleRow = ClubRow["roles"][number];
type ClubMemberRow = ClubRow["members"][number];

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
		return {
			clubs,
			accessBySlug: accessResult.accessBySlug,
			previewPage,
		};
	},
	component: ClubsPage,
});

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
							/>
						))}
					</div>
				)}
			</Section>
		</PageFrame>
	);
}

type ClubAccess = Awaited<
	ReturnType<typeof getAllMyClubAccessFn>
>["accessBySlug"][string];

function ClubCard({ club, access }: { club: ClubRow; access?: ClubAccess }) {
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
				<p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
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
					{viewerRole ? (
						<p className="mt-2 text-xs font-medium text-primary">
							Your role: {viewerRole}
							{access?.canCreatePosts
								? " · you can publish to this feed"
								: " · publishing is limited to club officers"}
						</p>
					) : null}
				</div>
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
		</article>
	);
}
