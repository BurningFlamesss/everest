import { createFileRoute, redirect } from "@tanstack/react-router";

/**
 * /club/public route redirects visitors to the central Activities page
 * showcasing all public clubs, schedules, exhibitions, and activity feeds.
 */
export const Route = createFileRoute("/_public/club_/public")({
	beforeLoad: () => {
		throw redirect({ to: "/activities" });
	},
	component: () => null,
});
