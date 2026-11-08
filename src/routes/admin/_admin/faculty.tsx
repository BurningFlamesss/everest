import { createFileRoute } from "@tanstack/react-router";
import FacultyAdminPage from "#/pages/admin/faculty/FacultyAdminPage";

export const Route = createFileRoute("/admin/_admin/faculty")({
	component: FacultyAdminPage,
});
