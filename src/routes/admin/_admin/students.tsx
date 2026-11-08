import { createFileRoute } from "@tanstack/react-router";
import StudentsPage from "#/pages/admin/students/StudentsPage";

export const Route = createFileRoute("/admin/_admin/students")({
	component: StudentsPage,
});
