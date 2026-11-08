import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import {
	Bell,
	BookOpen,
	Bus,
	CalendarRange,
	ClipboardCheck,
	Clock3,
	FileText,
	GraduationCap,
	Images,
	Inbox,
	LayoutDashboard,
	Mail,
	NotebookPen,
	ShieldCheck,
	UserPlus,
	Users,
	Wallet,
} from "lucide-react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getUnreadNotificationCountFn } from "#/packages/notifications/server.ts";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		if (!viewer.isManagement) {
			throw redirect({ to: "/dashboard" });
		}

		const unreadNotifications = await getUnreadNotificationCountFn();

		return { viewer, unreadNotifications };
	},
	component: AdminLayout,
});

const navItems = [
	{
		to: "/admin",
		label: "Overview",
		icon: LayoutDashboard,
		permission: "MANAGE_DASHBOARD",
		exact: true,
	},
	{
		to: "/admin/invites",
		label: "Invitations",
		icon: UserPlus,
		permission: "MANAGE_INVITES",
	},
	{
		to: "/admin/directory",
		label: "Directory",
		icon: Users,
		permission: "MANAGE_DIRECTORY",
	},
	{
		to: "/admin/content",
		label: "Content",
		icon: FileText,
		permission: "MANAGE_CONTENT",
	},
	{
		to: "/admin/academics",
		label: "Academics",
		icon: BookOpen,
		permission: "MANAGE_ACADEMICS",
	},
	{
		to: "/admin/calendar",
		label: "Calendar",
		icon: CalendarRange,
		permission: "MANAGE_ACADEMICS",
	},
	{
		to: "/admin/timetable",
		label: "Timetable",
		icon: Clock3,
		permission: "MANAGE_TIMETABLE",
	},
	{
		to: "/admin/exams",
		label: "Exams",
		icon: GraduationCap,
		permission: "MANAGE_EXAMS",
	},
	{
		to: "/admin/homework",
		label: "Homework",
		icon: NotebookPen,
		permission: "MANAGE_ACADEMICS",
	},
	{
		to: "/admin/attendance",
		label: "Attendance",
		icon: ClipboardCheck,
		permission: "MANAGE_ATTENDANCE",
	},
	{
		to: "/admin/transport",
		label: "Transport",
		icon: Bus,
		permission: "MANAGE_TRANSPORT",
	},
	{
		to: "/admin/fees",
		label: "Fees",
		icon: Wallet,
		permission: "MANAGE_FEES",
	},
	{
		to: "/admin/gallery",
		label: "Gallery",
		icon: Images,
		permission: "MANAGE_CONTENT",
	},
	{
		to: "/admin/inbox",
		label: "Inbox",
		icon: Inbox,
		permission: "MANAGE_INBOX",
	},
	{
		to: "/admin/mail",
		label: "Mail log",
		icon: Mail,
		permission: "MANAGE_DASHBOARD",
	},
	{
		to: "/admin/permissions",
		label: "Permissions",
		icon: ShieldCheck,
		permission: "MANAGE_PERMISSIONS",
	},
] as const;

function AdminLayout() {
	const { viewer, unreadNotifications } = Route.useRouteContext();
	const visibleNavItems = navItems.filter((item) =>
		viewer.permissions.includes(item.permission),
	);

	return (
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<header className="border-b border-border bg-card/80 px-6 py-4 backdrop-blur md:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
							Admin console
						</p>
						<p className="font-semibold text-foreground">{viewer.user.name}</p>
					</div>
					<div className="flex items-center gap-2">
						<Link
							to="/notifications"
							className="relative inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
						>
							<Bell className="h-4 w-4" /> Notifications
							{unreadNotifications > 0 ? (
								<span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground">
									{unreadNotifications}
								</span>
							) : null}
						</Link>
					</div>
					<nav className="flex flex-wrap gap-1">
						{visibleNavItems.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
								activeProps={{
									className:
										"inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary",
								}}
								activeOptions={{ exact: "exact" in item ? item.exact : false }}
							>
								<item.icon className="h-4 w-4" /> {item.label}
							</Link>
						))}
					</nav>
				</div>
			</header>

			<div className="px-6 py-10 md:px-10">
				<Outlet />
			</div>
		</main>
	);
}
