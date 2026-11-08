import { createFileRoute } from "@tanstack/react-router";
import FacilitiesPage from "#/pages/admin/facilities/FacilitiesPage";

export const Route = createFileRoute("/admin/facilities")({
	component: FacilitiesPage,
});
