import { createFileRoute } from "@tanstack/react-router";
import ResourcesPage from "#/pages/admin/resources/ResourcesPage";

export const Route = createFileRoute("/admin/resources")({
	component: ResourcesPage,
});
