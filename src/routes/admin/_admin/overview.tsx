import { createFileRoute } from "@tanstack/react-router";
import OverviewPage from "#/pages/admin/overview/OverviewPage";

export const Route = createFileRoute("/admin/_admin/overview")({
	component: OverviewPage,
});
