import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /admin/content has been retired in favor of the dedicated management
 * interfaces for notices (/admin/notices), events (/admin/events), and
 * clubs (/admin/clubs), which provide comprehensive field and workflow support.
 */
export const Route = createFileRoute("/admin/_admin/content")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/notices" });
	},
	component: () => null,
});
