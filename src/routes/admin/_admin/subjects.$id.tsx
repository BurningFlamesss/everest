import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_admin/subjects/$id")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/academics" });
	},
});
