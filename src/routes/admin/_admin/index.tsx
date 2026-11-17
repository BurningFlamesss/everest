import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	Bell,
	CalendarDays,
	FileText,
	GraduationCap,
	Megaphone,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { ErrorState } from "#/components/common/ErrorState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { AdminPageLinks } from "#/components/layout/AdminPageLinks";
import { Button } from "#/components/ui/button";
import { getAdminStatsFn } from "#/packages/admin/server.ts";

export const Route = createFileRoute("/admin/_admin/")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_DASHBOARD")) {
			throw redirect({ to: "/dashboard" });
		}
	},
	loader: () => getAdminStatsFn(),
	component: AdminOverview,
});

const icons = [
	GraduationCap,
	Users,
	UserCheck,
	UserPlus,
	FileText,
	Bell,
	CalendarDays,
	FileText,
];

function AdminOverview() {
	const response = Route.useLoaderData();

	if (!response.success || !response.stats) {
		return (
			<div className="panel">
				<ErrorState
					title="Could not load the dashboard"
					description={response.error ?? "Could not load the dashboard."}
					testId="admin-home-error"
				/>
			</div>
		);
	}

	const stats = response.stats;
	const cards = [
		{ label: "Active students", value: stats.students, to: "/admin/directory" },
		{ label: "Active staff", value: stats.staff, to: "/admin/directory" },
		{ label: "Guardians", value: stats.guardians, to: "/admin/directory" },
		{
			label: "Pending invites",
			value: stats.pendingInvites,
			to: "/admin/invites",
		},
		{
			label: "Published notices",
			value: stats.publishedNotices,
			to: "/admin/content",
		},
		{ label: "Draft notices", value: stats.draftNotices, to: "/admin/content" },
		{
			label: "Upcoming events",
			value: stats.upcomingEvents,
			to: "/admin/content",
		},
		{ label: "Active clubs", value: stats.clubs, to: "/admin/content" },
	];

	return (
		<div data-testid="admin-home-page">
			<PageHeader
				eyebrow="Dashboard"
				title="School overview"
				description="Live counts from the database. Click a card to manage that area."
				testId="admin-home-page-header"
			/>

			<div className="space-y-5">
				<div
					className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
					data-testid="admin-home-stats-grid"
				>
					{cards.map((card, index) => {
						const Icon = icons[index] ?? FileText;

						return (
							<Link
								key={card.label}
								to={card.to}
								className="rounded-lg border border-hairline bg-surface-1 px-4 py-3 transition-colors duration-150 hover:border-primary/35 hover:bg-surface-2 focus-ring"
							>
								<div className="flex items-center justify-between gap-2">
									<p className="truncate text-[11px] font-medium text-muted-foreground">
										{card.label}
									</p>
									<Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
								</div>
								<p className="num mt-1.5 font-display text-lg font-semibold leading-none text-foreground">
									{card.value}
								</p>
							</Link>
						);
					})}
				</div>

				<Panel
					title="Go to a page"
					description="Jump straight into any part of the admin console."
					testId="admin-home-page-links"
				>
					<AdminPageLinks />
				</Panel>

				<Panel title="Get started" testId="admin-home-get-started">
					<div className="flex flex-wrap gap-2">
						<Button size="sm" className="gap-1.5" asChild>
							<Link to="/admin/invites">
								<UserPlus className="h-3.5 w-3.5" /> Create invitations
							</Link>
						</Button>
						<Button variant="outline" size="sm" className="gap-1.5" asChild>
							<Link to="/admin/directory">
								<Users className="h-3.5 w-3.5" /> Browse directory
							</Link>
						</Button>
						<Button variant="outline" size="sm" className="gap-1.5" asChild>
							<Link to="/admin/content">
								<Megaphone className="h-3.5 w-3.5" /> Publish a notice
							</Link>
						</Button>
					</div>
				</Panel>
			</div>
		</div>
	);
}
