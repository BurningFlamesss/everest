import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_admin/classes/$id")({
	beforeLoad: () => {
		throw redirect({ to: "/admin/classes" });
	},
});
