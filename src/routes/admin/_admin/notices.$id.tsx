import { createFileRoute } from "@tanstack/react-router";
import NoticeDetailPage from "#/pages/admin/notices/NoticeDetailPage";

export const Route = createFileRoute("/admin/_admin/notices/$id")({
	component: NoticeDetailPage,
});
