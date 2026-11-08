import { createFileRoute } from "@tanstack/react-router";
import WebsiteContentPage from "#/pages/admin/website/WebsiteContentPage";

export const Route = createFileRoute("/admin/_admin/website")({
	validateSearch: (search: Record<string, unknown>) => ({
		page: search.page as string | undefined,
	}),
	component: WebsiteContentPage,
});
