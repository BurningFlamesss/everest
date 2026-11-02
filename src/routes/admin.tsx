import {
	createFileRoute,
	Link,
	Outlet,
	redirect,
} from "@tanstack/react-router";
import {
	BookOpen,
	Bus,
	ClipboardCheck,
	FileText,
	LayoutDashboard,
	ShieldCheck,
	UserPlus,
	Users,
} from "lucide-react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		if (!viewer.isManagement) {
			throw redirect({ to: "/dashboard" });
		}

		return { viewer };
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
		to: "/admin/permissions",
		label: "Permissions",
		icon: ShieldCheck,
		permission: "MANAGE_PERMISSIONS",
	},
] as const;

function AdminLayout() {
	const { viewer } = Route.useRouteContext();
	const visibleNavItems = navItems.filter((item) =>
		viewer.permissions.includes(item.permission),
	);

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<header className="border-b border-gray-200 bg-white/80 px-6 py-4 backdrop-blur md:px-10">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.18em] text-red-600">
							Admin console
						</p>
						<p className="font-semibold text-gray-900">{viewer.user.name}</p>
					</div>
					<nav className="flex flex-wrap gap-1">
						{visibleNavItems.map((item) => (
							<Link
								key={item.to}
								to={item.to}
								className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
								activeProps={{
									className:
										"inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700",
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
