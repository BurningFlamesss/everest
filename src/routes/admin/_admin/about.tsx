import { createFileRoute } from "@tanstack/react-router";
import AboutContentPage from "#/pages/admin/website/AboutContentPage";

export const Route = createFileRoute("/admin/_admin/about")({
	component: AboutContentPage,
});
