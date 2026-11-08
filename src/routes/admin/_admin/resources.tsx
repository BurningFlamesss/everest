import { createFileRoute } from "@tanstack/react-router";
import ResourcesPage from "#/pages/admin/resources/ResourcesPage";

export const Route = createFileRoute("/admin/_admin/resources")({
	component: ResourcesPage,
});
