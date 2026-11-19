import { createFileRoute } from "@tanstack/react-router";
import CoursesContentPage from "#/pages/admin/website/CoursesContentPage";

export const Route = createFileRoute("/admin/_admin/courses")({
	component: CoursesContentPage,
});
