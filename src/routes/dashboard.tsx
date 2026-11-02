import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	ArrowUpRight,
	Bell,
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	LayoutDashboard,
	Users,
} from "lucide-react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		return { viewer };
	},
	component: Dashboard,
});

const shortcuts = [
	{
		label: "Notices",
		description: "Read the latest school announcements.",
		to: "/notices",
		icon: Bell,
	},
	{
		label: "Events",
		description: "See what is coming up on the school calendar.",
		to: "/events",
		icon: CalendarDays,
	},
	{
		label: "Clubs",
		description: "Explore the clubs students can join.",
		to: "/clubs",
		icon: BookOpen,
	},
	{
		label: "My records",
		description:
			"Courses, attendance and bus details for you or your children.",
		to: "/my-records",
		icon: ClipboardCheck,
	},
] as const;

function Dashboard() {
	const { viewer } = Route.useRouteContext();
	const role = viewer.primaryRole ?? "USER";

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
					Dashboard
				</p>
				<h1 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
					Welcome back, {viewer.user.name}.
				</h1>
				<p className="mt-3 max-w-2xl text-gray-600">
					You are signed in as <strong>{role.toLowerCase()}</strong>. Use the
					shortcuts below to get to the parts of the school you need.
				</p>

				{viewer.isManagement ? (
					<div className="mt-8 flex flex-wrap gap-3">
						<Link
							to="/admin"
							className="inline-flex items-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-600"
						>
							<LayoutDashboard className="h-4 w-4" /> Open admin console
						</Link>
						<Link
							to="/admin/invites"
							className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50"
						>
							<Users className="h-4 w-4" /> Invite people
						</Link>
					</div>
				) : null}
			</section>

			<section className="grid gap-5 px-6 md:grid-cols-3 md:px-16">
				{shortcuts.map((shortcut) => (
					<Link
						key={shortcut.to}
						to={shortcut.to}
						className="group rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg"
					>
						<shortcut.icon className="h-6 w-6 text-red-500" />
						<h2 className="mt-4 text-xl font-semibold text-gray-900">
							{shortcut.label}
						</h2>
						<p className="mt-1 text-sm text-gray-500">{shortcut.description}</p>
						<span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-red-600">
							Open <ArrowUpRight className="h-4 w-4" />
						</span>
					</Link>
				))}
			</section>

			<section className="mx-6 mt-10 rounded-2xl border border-gray-200 bg-white p-6 md:mx-16">
				<h2 className="text-lg font-semibold text-gray-900">Your account</h2>
				<dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
					<div>
						<dt className="text-xs uppercase tracking-wide text-gray-500">
							Name
						</dt>
						<dd className="mt-1 font-medium text-gray-900">
							{viewer.user.name}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-gray-500">
							Email
						</dt>
						<dd className="mt-1 font-medium text-gray-900">
							{viewer.user.email}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-gray-500">
							Roles
						</dt>
						<dd className="mt-1 font-medium text-gray-900">
							{viewer.roles
								.map((entry: { role: string }) => entry.role)
								.join(", ") || "—"}
						</dd>
					</div>
					<div>
						<dt className="text-xs uppercase tracking-wide text-gray-500">
							Activated
						</dt>
						<dd className="mt-1 font-medium text-gray-900">
							{viewer.user.activatedAt
								? new Date(viewer.user.activatedAt).toLocaleDateString()
								: "Not activated"}
						</dd>
					</div>
				</dl>
			</section>
		</main>
	);
}
