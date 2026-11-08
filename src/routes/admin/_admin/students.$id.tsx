import { createFileRoute } from "@tanstack/react-router";
import StudentProfilePage from "#/pages/admin/students/StudentProfilePage";

export const Route = createFileRoute("/admin/_admin/students/$id")({
	component: StudentProfilePage,
});
