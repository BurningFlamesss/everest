import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
	ArrowLeft,
	CalendarClock,
	CheckCircle2,
	Clock,
	Loader2,
	Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ClubFeed } from "#/components/clubs/ClubFeed";
import { getClubDetailFn, joinClubAction } from "#/packages/clubs/server.ts";
import { pageMeta } from "#/packages/school/meta.ts";
import {
	PageFrame,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";

export const Route = createFileRoute("/_public/clubs_/$slug")({
	head: () =>
		pageMeta({
			title: "Club",
			description:
				"Club profile, meeting schedule, attachments and the latest updates from the club feed.",
		}),
	loader: async ({ params }) => ({
		detail: await getClubDetailFn({ data: { slug: params.slug } }),
	}),
	component: ClubDetailPage,
});

const JOIN_POLICY_LABEL = {
	OPEN: "Open to all students",
	REQUEST: "Join by request",
	CLOSED: "Not accepting members",
} as const;

function ClubDetailPage() {
	const { detail } = Route.useLoaderData();
	const router = useRouter();
	const [isJoining, setIsJoining] = useState(false);

	if (!detail.success) {
		return (
			<PageFrame dense>
				<div className="py-24 text-center">
					<p className="text-sm font-medium text-foreground">
						{detail.error || "Club not found."}
					</p>
					<Link
						to="/clubs"
						className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary hover:underline"
					>
						<ArrowLeft className="h-3.5 w-3.5" /> All clubs
					</Link>
				</div>
			</PageFrame>
		);
	}

	const { club, posts, userId, access, joinState } = detail;
	const memberCount = club._count.members;

	const join = async () => {
		if (isJoining) return;
		setIsJoining(true);

		try {
			const result = await joinClubAction({ data: { slug: club.slug } });
			if (!result.success) {
				toast.error(result.error);
				return;
			}

			toast.success(
				result.status === "member"
					? `You joined ${club.name}.`
					: "Request sent to the club officers.",
			);
			await router.invalidate();
		} finally {
			setIsJoining(false);
		}
	};

	const joinControl = (() => {
		if (!userId) {
			return (
				<Link
					to="/login"
					className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
				>
					Sign in to join
				</Link>
			);
		}

		if (joinState.isMember) {
			return (
				<span className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
					<CheckCircle2 className="h-4 w-4" /> You are a member
				</span>
			);
		}

		if (joinState.requestStatus === "PENDING") {
			return (
				<span className="inline-flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground">
					<Clock className="h-4 w-4" /> Request pending
				</span>
			);
		}

		if (!joinState.isStudent) {
			return (
				<span className="text-sm text-muted-foreground">
					Only student accounts can join clubs. Ask a club officer to add a
					staff role for you.
				</span>
			);
		}

		if (club.joinPolicy === "CLOSED") {
			return (
				<span className="text-sm text-muted-foreground">
					This club is not accepting new members right now.
				</span>
			);
		}

		return (
			<button
				type="button"
				onClick={() => void join()}
				disabled={isJoining}
				data-testid="club-join-button"
				className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{isJoining ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
				{club.joinPolicy === "OPEN" ? "Join club" : "Request to join"}
			</button>
		);
	})();

	return (
		<PageFrame dense>
			<Link
				to="/clubs"
				className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft className="h-3.5 w-3.5" /> All clubs
			</Link>

			<Section className="mt-6">
				<div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
					<div className="min-w-0">
						<p className="t-eyebrow">{JOIN_POLICY_LABEL[club.joinPolicy]}</p>
						<h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
							{club.name}
						</h1>
						{club.description ? (
							<p className="mt-4 max-w-[65ch] text-[15px] leading-relaxed text-muted-foreground">
								{club.description}
							</p>
						) : null}

						{club.coverImage ? (
							<img
								src={club.coverImage}
								alt={`${club.name} cover`}
								className="mt-8 h-56 w-full rounded-2xl object-cover sm:h-72"
							/>
						) : null}

						<div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-rule py-4">
							{club.meetingSchedule ? (
								<span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
									<CalendarClock className="h-4 w-4 text-primary" />
									{club.meetingSchedule}
								</span>
							) : null}
							<span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
								<Users className="h-4 w-4 text-primary" />
								{memberCount} member{memberCount === 1 ? "" : "s"}
							</span>
							<span className="ml-auto">{joinControl}</span>
						</div>

						{club.attachments.length > 0 ? (
							<div className="mt-8">
								<h2 className="text-sm font-semibold text-foreground">
									Attachments
								</h2>
								<ul className="mt-3 grid gap-2 sm:grid-cols-2">
									{club.attachments.map((attachment) => (
										<li key={attachment.id}>
											<a
												href={attachment.fileAsset.url}
												target="_blank"
												rel="noreferrer"
												className="flex h-full items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground transition-colors hover:border-rule-strong"
											>
												<span className="min-w-0 break-words font-medium">
													{attachment.label ??
														attachment.fileAsset.originalName}
												</span>
												<span className="shrink-0 text-xs text-muted-foreground">
													{Math.max(
														1,
														Math.round(attachment.fileAsset.size / 1024),
													)}{" "}
													KB
												</span>
											</a>
										</li>
									))}
								</ul>
							</div>
						) : null}

						<div className="mt-8">
							<ClubFeed
								clubSlug={club.slug}
								posts={posts}
								access={access}
								userId={userId}
							/>
						</div>
					</div>

					<aside className="h-fit rounded-2xl border border-border bg-card p-5">
						<p className="t-eyebrow">About this club</p>
						<dl className="mt-4 space-y-3 text-sm">
							<div className="flex items-baseline justify-between gap-3">
								<dt className="text-muted-foreground">Members</dt>
								<dd className="font-medium text-foreground">{memberCount}</dd>
							</div>
							<div className="flex items-baseline justify-between gap-3">
								<dt className="text-muted-foreground">Joining</dt>
								<dd className="font-medium text-foreground">
									{JOIN_POLICY_LABEL[club.joinPolicy]}
								</dd>
							</div>
							{access?.roleName ? (
								<div className="flex items-baseline justify-between gap-3">
									<dt className="text-muted-foreground">Your role</dt>
									<dd className="font-medium text-foreground">
										{access.roleName}
									</dd>
								</div>
							) : null}
						</dl>
						{club.meetingSchedule ? (
							<p className="mt-4 border-t border-rule pt-4 text-xs leading-relaxed text-muted-foreground">
								Meets {club.meetingSchedule}.
							</p>
						) : null}
					</aside>
				</div>
			</Section>
		</PageFrame>
	);
}
