import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { PageShell } from "#/templates/modern/components/layout/PageShell";

/**
 * Student / guardian portal. Requires a session; admins are bounced to the
 * admin console. Child routes pick the right dashboard from the resolved role.
 */
export const Route = createFileRoute("/user")({
	beforeLoad: async ({ context }) => {
		if (!context.session) {
			throw redirect({ to: "/login" });
		}
		const role = (context.session.user as any)?.role as string | undefined;
		if (role === "admin" || role === "super_admin") {
			throw redirect({ to: "/admin/overview" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<PageShell>
			<Outlet />
		</PageShell>
	);
}
