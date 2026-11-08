import { createFileRoute } from "@tanstack/react-router";
import NotFoundPage from "#/pages/admin/NotFoundPage";

export const Route = createFileRoute("/admin/_admin/$")({
	component: NotFoundPage,
});
