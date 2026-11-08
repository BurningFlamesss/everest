import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	Bell,
	CalendarDays,
	FileText,
	GraduationCap,
	UserCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { getAdminStatsFn } from "#/packages/admin/server.ts";

export const Route = createFileRoute("/admin/")({
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
			<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
				{response.error ?? "Could not load the dashboard."}
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
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">School overview</h1>
				<p className="mt-1 text-sm text-gray-500">
					Live counts from the database. Click a card to manage that area.
				</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
				{cards.map((card, index) => {
					const Icon = icons[index] ?? FileText;

					return (
						<Link
							key={card.label}
							to={card.to}
							className="rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
						>
							<Icon className="h-5 w-5 text-red-500" />
							<p className="mt-4 text-3xl font-bold text-gray-900">
								{card.value}
							</p>
							<p className="text-sm text-gray-500">{card.label}</p>
						</Link>
					);
				})}
			</div>

			<div className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="text-lg font-semibold text-gray-900">Get started</h2>
				<div className="mt-4 flex flex-wrap gap-3">
					<Link
						to="/admin/invites"
						className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
					>
						Create invitations
					</Link>
					<Link
						to="/admin/directory"
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
					>
						Browse directory
					</Link>
					<Link
						to="/admin/content"
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
					>
						Publish a notice
					</Link>
				</div>
			</div>
		</div>
	);
}
