import { createFileRoute, redirect } from "@tanstack/react-router";
import ClubsPage from "#/pages/admin/clubs/ClubsPage";

export const Route = createFileRoute("/admin/_admin/clubs")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_CONTENT")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: ClubsPage,
});
