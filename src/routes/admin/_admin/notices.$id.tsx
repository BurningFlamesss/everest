import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_admin/notices/$id")({
	component: Outlet,
});
