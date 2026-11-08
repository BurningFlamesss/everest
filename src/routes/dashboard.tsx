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
import { getMyNoticesFn } from "#/packages/content/server.ts";
import { getDashboardSummaryFn } from "#/packages/dashboard/server.ts";

export const Route = createFileRoute("/dashboard")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		return { viewer };
	},
	loader: async () => {
		const [notices, summary] = await Promise.all([
			getMyNoticesFn(),
			getDashboardSummaryFn(),
		]);

		return { notices, summary };
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
	const { notices, summary } = Route.useLoaderData();
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

			{summary?.role === "ADMIN" ? (
				<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
					<h2 className="text-lg font-semibold text-foreground">
						School at a glance
					</h2>
					<dl className="mt-4 grid gap-4 sm:grid-cols-4">
						{[
							["Pending invites", summary.admin.pendingInvites],
							["New enquiries", summary.admin.newEnquiries],
							[
								"Unpaid fees",
								`₹${(summary.admin.unpaidTotal / 100).toLocaleString()}`,
							],
							["Upcoming events", summary.admin.upcomingEvents],
						].map(([label, value]) => (
							<div key={label} className="rounded-xl bg-muted px-4 py-3">
								<dt className="text-xs uppercase tracking-wide text-muted-foreground">
									{label}
								</dt>
								<dd className="mt-1 text-2xl font-semibold text-foreground">
									{value}
								</dd>
							</div>
						))}
					</dl>
					<Link
						to="/admin"
						className="mt-4 inline-flex text-sm font-semibold text-primary hover:underline"
					>
						Open the admin console
					</Link>
				</section>
			) : null}

			{summary?.role === "STUDENT" ? (
				<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
					<h2 className="text-lg font-semibold text-foreground">
						{summary.student.name}: at a glance
					</h2>
					<dl className="mt-4 grid gap-4 sm:grid-cols-3">
						<div className="rounded-xl bg-muted px-4 py-3">
							<dt className="text-xs uppercase tracking-wide text-muted-foreground">
								Attendance
							</dt>
							<dd className="mt-1 text-2xl font-semibold text-foreground">
								{summary.student.attendance.rate === null
									? "—"
									: `${summary.student.attendance.rate}%`}
							</dd>
						</div>
						<div className="rounded-xl bg-muted px-4 py-3">
							<dt className="text-xs uppercase tracking-wide text-muted-foreground">
								Fees due
							</dt>
							<dd className="mt-1 text-2xl font-semibold text-foreground">
								₹{(summary.student.balance / 100).toLocaleString()}
							</dd>
						</div>
						<div className="rounded-xl bg-muted px-4 py-3">
							<dt className="text-xs uppercase tracking-wide text-muted-foreground">
								Next exam
							</dt>
							<dd className="mt-1 text-sm font-semibold text-foreground">
								{summary.student.nextExam
									? `${summary.student.nextExam.exam.name} · ${summary.student.nextExam.course.code}`
									: "None scheduled"}
							</dd>
						</div>
					</dl>
				</section>
			) : null}

			{summary?.role === "STAFF" ? (
				<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
					<h2 className="text-lg font-semibold text-foreground">Today</h2>
					<p className="mt-2 text-sm text-muted-foreground">
						{summary.staff.todaySlots} class
						{summary.staff.todaySlots === 1 ? "" : "es"} on your timetable ·{" "}
						{summary.staff.registers} register
						{summary.staff.registers === 1 ? "" : "s"} taken today.
					</p>
					<Link
						to="/my-classes"
						className="mt-3 inline-flex text-sm font-semibold text-primary hover:underline"
					>
						Open my classes
					</Link>
				</section>
			) : null}

			{summary?.role === "GUARDIAN" ? (
				<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
					<h2 className="text-lg font-semibold text-foreground">
						Your children
					</h2>
					<ul className="mt-4 divide-y divide-border">
						{summary.children.map((child) => (
							<li
								key={child.name}
								className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm"
							>
								<span className="font-medium text-foreground">
									{child.name}
								</span>
								<span className="text-muted-foreground">
									{child.attendance.rate === null
										? "No attendance yet"
										: `${child.attendance.rate}% attendance`}{" "}
									· ₹{(child.balance / 100).toLocaleString()} due
								</span>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
				<div className="flex flex-wrap items-baseline justify-between gap-2">
					<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
						<Bell className="h-5 w-5 text-primary" /> Notices for you
					</h2>
					<Link
						to="/notices"
						className="text-sm font-semibold text-primary hover:underline"
					>
						All notices
					</Link>
				</div>
				{notices.length === 0 ? (
					<p className="mt-3 text-sm text-muted-foreground">
						Nothing has been published for your role yet.
					</p>
				) : (
					<ul className="mt-3 divide-y divide-border">
						{notices.map((notice) => (
							<li key={notice.id} className="py-3">
								<Link
									to="/notices/$slug"
									params={{ slug: notice.slug }}
									className="group flex flex-wrap items-baseline justify-between gap-2"
								>
									<span className="font-medium text-foreground group-hover:text-primary">
										{notice.title}
									</span>
									<span className="text-xs text-muted-foreground">
										{new Date(
											notice.publishedAt ?? notice.createdAt,
										).toLocaleDateString(undefined, { dateStyle: "medium" })}
									</span>
								</Link>
								{notice.audience !== "ALL" ? (
									<span className="mt-1 inline-block rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-accent-foreground">
										{notice.audience.toLowerCase()}
									</span>
								) : null}
							</li>
						))}
					</ul>
				)}
			</section>

			<section className="mx-6 mt-10 rounded-2xl border border-border bg-card p-6 md:mx-16">
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
