import { createFileRoute } from "@tanstack/react-router";
import ScholarshipsAdminPage from "#/pages/admin/scholarships/ScholarshipsAdminPage";

export const Route = createFileRoute("/admin/_admin/scholarships")({
	component: ScholarshipsAdminPage,
});
