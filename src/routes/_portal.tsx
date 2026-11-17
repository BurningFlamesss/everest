import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageShell } from "#/templates/modern/components/layout/PageShell";

/**
 * The shared authenticated-portal layout. Every signed-in portal page
 * (/dashboard, /notifications, /my-homework, /my-fees, /my-results,
 * /my-classes, /my-records) nests under this pathless route so the public
 * PageShell chrome (sidebar, notice ticker, footer) is rendered once from
 * here instead of being imported per page, while the URLs stay unchanged.
 */
export const Route = createFileRoute("/_portal")({
	component: PortalLayoutRoute,
});

function PortalLayoutRoute() {
	return (
		<PageShell>
			<Outlet />
		</PageShell>
	);
}
