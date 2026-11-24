import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	ArrowRight,
	Award,
	Bell,
	BookOpen,
	CalendarDays,
	ClipboardCheck,
	CreditCard,
	LayoutDashboard,
	NotebookPen,
	UserCheck,
	Users,
} from "lucide-react";
import { useMemo } from "react";
import { STAGGER } from "#/lib/motion";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getMyNoticesFn } from "#/packages/content/server.ts";
import { getDashboardSummaryFn } from "#/packages/dashboard/server.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/templates/modern/components/kit";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/dashboard")({
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

function Dashboard() {
	const { viewer } = Route.useRouteContext();
	const { notices, summary } = Route.useLoaderData();
	const role = viewer.primaryRole ?? "USER";

	const shortcuts = useMemo(() => {
		if (role === "STAFF") {
			return [
				{
					label: "My classes",
					description: "Your courses, today's periods and pending registers.",
					to: "/my-classes",
					icon: BookOpen,
				},
				{
					label: "Attendance",
					description: "Mark attendance registers for your classes.",
					to: "/admin/attendance",
					icon: UserCheck,
				},
				{
					label: "Homework",
					description: "Publish assignments and track due dates.",
					to: "/admin/homework",
					icon: NotebookPen,
				},
				{
					label: "Exams & Marks",
					description: "Grade student assessments and submit exam marks.",
					to: "/admin/exams",
					icon: Award,
				},
			];
		}
		if (role === "STUDENT" || role === "GUARDIAN") {
			return [
				{
					label: "My records",
					description: "Courses, attendance records and bus route details.",
					to: "/my-records",
					icon: ClipboardCheck,
				},
				{
					label: "Homework",
					description: "Active assignments, instructions and due dates.",
					to: "/my-homework",
					icon: NotebookPen,
				},
				{
					label: "Exam results",
					description: "Check published exam marks and term reports.",
					to: "/my-results",
					icon: Award,
				},
				{
					label: "Fees & Invoices",
					description: "Review fee statements, receipts and balances.",
					to: "/my-fees",
					icon: CreditCard,
				},
			];
		}
		return [
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
		];
	}, [role]);

	return (
		<PageFrame testId="dashboard-page" dense>
			<PageHeader
				testId="dashboard-page-header"
				eyebrow="Dashboard"
				title={`Welcome back, ${viewer.user.name}.`}
				subtitle={`You are signed in as ${role.toLowerCase()}. Use the shortcuts below to get to the parts of the school you need.`}
				meta={[
					{ label: "Role", value: role.toLowerCase() },
					{ label: "Notices", value: String(notices.length) },
				]}
				actions={
					viewer.isManagement ? (
						<div className="flex flex-wrap gap-3">
							<Button asChild>
								<Link to="/admin">
									<LayoutDashboard aria-hidden="true" />
									Open admin console
								</Link>
							</Button>
							<Button asChild variant="outline">
								<Link to="/admin/invites">
									<Users aria-hidden="true" />
									Invite people
								</Link>
							</Button>
						</div>
					) : undefined
				}
			/>

			<Section testId="dashboard-shortcuts">
				<SectionHeading eyebrow="Quick links" title="Shortcuts" />
				<ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{shortcuts.map((shortcut, index) => (
						<li key={shortcut.to} className="min-w-0">
							<Reveal delay={index * STAGGER} className="h-full">
								<Link
									to={shortcut.to}
									className="group flex h-full flex-col rounded-card border border-border bg-card p-6 shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
								>
									<shortcut.icon
										className="h-5 w-5 text-red-dark"
										aria-hidden="true"
									/>
									<h3 className="t-h3 mt-4 text-foreground">
										{shortcut.label}
									</h3>
									<p className="t-caption mt-1.5">{shortcut.description}</p>
									<span className="mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground">
										Open
										<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
									</span>
								</Link>
							</Reveal>
						</li>
					))}
				</ul>
			</Section>

			{summary?.role === "ADMIN" ? (
				<Section testId="dashboard-admin-summary">
					<SectionHeading
						eyebrow="Overview"
						title="School at a glance"
						aside={
							<Button asChild variant="link">
								<Link to="/admin">Open the admin console</Link>
							</Button>
						}
					/>
					<Reveal>
						<dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4">
							{[
								["Pending invites", summary.admin.pendingInvites],
								["New enquiries", summary.admin.newEnquiries],
								[
									"Unpaid fees",
									`₹${(summary.admin.unpaidTotal / 100).toLocaleString()}`,
								],
								["Upcoming events", summary.admin.upcomingEvents],
							].map(([label, value]) => (
								<div key={label} className="bg-card px-4 py-5">
									<dt className="t-eyebrow">{label}</dt>
									<dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
										{value}
									</dd>
								</div>
							))}
						</dl>
					</Reveal>
				</Section>
			) : null}

			{summary?.role === "STUDENT" ? (
				<Section testId="dashboard-student-summary">
					<SectionHeading
						eyebrow="Overview"
						title={`${summary.student.name}: at a glance`}
					/>
					<Reveal>
						<dl className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3">
							<div className="bg-card px-4 py-5">
								<dt className="t-eyebrow">Attendance</dt>
								<dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
									{summary.student.attendance.rate === null
										? "—"
										: `${summary.student.attendance.rate}%`}
								</dd>
							</div>
							<div className="bg-card px-4 py-5">
								<dt className="t-eyebrow">Fees due</dt>
								<dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
									₹{(summary.student.balance / 100).toLocaleString()}
								</dd>
							</div>
							<div className="bg-card px-4 py-5">
								<dt className="t-eyebrow">Next exam</dt>
								<dd className="mt-2 font-display text-xl font-semibold leading-tight text-foreground">
									{summary.student.nextExam
										? `${summary.student.nextExam.exam.name} · ${summary.student.nextExam.course.code}`
										: "None scheduled"}
								</dd>
							</div>
						</dl>
					</Reveal>
				</Section>
			) : null}

			{summary?.role === "STAFF" ? (
				<Section testId="dashboard-staff-summary">
					<SectionHeading title="Today" />
					<p className="t-body mt-4 max-w-measure text-muted-foreground">
						{summary.staff.todaySlots} class
						{summary.staff.todaySlots === 1 ? "" : "es"} on your timetable ·{" "}
						{summary.staff.registers} register
						{summary.staff.registers === 1 ? "" : "s"} taken today.
					</p>
					<Button asChild variant="link" className="mt-4">
						<Link to="/my-classes">Open my classes</Link>
					</Button>
				</Section>
			) : null}

			{summary?.role === "GUARDIAN" ? (
				<Section testId="dashboard-guardian-summary">
					<SectionHeading title="Your children" />
					<ul className="mt-6 divide-y divide-rule-soft">
						{summary.children.map((child) => (
							<li
								key={child.name}
								className="flex flex-wrap items-center justify-between gap-2 py-3.5"
							>
								<span className="text-[13.5px] font-medium text-foreground">
									{child.name}
								</span>
								<span className="t-caption">
									{child.attendance.rate === null
										? "No attendance yet"
										: `${child.attendance.rate}% attendance`}{" "}
									· ₹{(child.balance / 100).toLocaleString()} due
								</span>
							</li>
						))}
					</ul>
				</Section>
			) : null}

			<Section testId="dashboard-notices">
				<SectionHeading
					eyebrow="For you"
					title="Notices"
					aside={
						<Button asChild variant="link">
							<Link to="/notices">All notices</Link>
						</Button>
					}
				/>
				{notices.length === 0 ? (
					<EmptyState
						eyebrow="No notices"
						title="Nothing published for you"
						description="Nothing has been published for your role yet."
						testId="dashboard-notices-empty"
					/>
				) : (
					<ul className="mt-6 divide-y divide-rule-soft">
						{notices.map((notice) => (
							<li key={notice.id} className="py-3.5">
								<Link
									to="/notices/$slug"
									params={{ slug: notice.slug }}
									className="group flex flex-wrap items-baseline justify-between gap-2"
								>
									<span className="text-[13.5px] font-medium text-foreground transition-colors duration-fast group-hover:text-red-dark">
										{notice.title}
									</span>
									<span className="t-meta">
										{new Date(
											notice.publishedAt ?? notice.createdAt,
										).toLocaleDateString(undefined, { dateStyle: "medium" })}
									</span>
								</Link>
								{notice.audience !== "ALL" ? (
									<span className="mt-1 inline-flex items-center rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-[11px] font-medium text-red-dark">
										{notice.audience.toLowerCase()}
									</span>
								) : null}
							</li>
						))}
					</ul>
				)}
			</Section>

			<Section testId="dashboard-account">
				<SectionHeading title="Your account" />
				<dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
					<div>
						<dt className="t-eyebrow">Name</dt>
						<dd className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
							{viewer.user.name}
						</dd>
					</div>
					<div>
						<dt className="t-eyebrow">Email</dt>
						<dd className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
							{viewer.user.email}
						</dd>
					</div>
					<div>
						<dt className="t-eyebrow">Roles</dt>
						<dd className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
							{viewer.roles
								.map((entry: { role: string }) => entry.role)
								.join(", ") || "—"}
						</dd>
					</div>
					<div>
						<dt className="t-eyebrow">Activated</dt>
						<dd className="mt-1.5 text-[13.5px] leading-relaxed text-foreground">
							{viewer.user.activatedAt
								? new Date(viewer.user.activatedAt).toLocaleDateString()
								: "Not activated"}
						</dd>
					</div>
				</dl>
			</Section>
		</PageFrame>
	);
}
