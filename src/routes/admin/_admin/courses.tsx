import { createFileRoute } from "@tanstack/react-router";
import CoursesPage from "#/pages/admin/courses/CoursesPage";

export const Route = createFileRoute("/admin/_admin/courses")({
	component: CoursesPage,
});
