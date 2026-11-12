import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_public/notices")({
	component: NoticesLayout,
});

function NoticesLayout() {
	return <Outlet />;
}
