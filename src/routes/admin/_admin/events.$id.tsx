import { createFileRoute } from "@tanstack/react-router";
import EventDetailPage from "#/pages/admin/events/EventDetailPage";

export const Route = createFileRoute("/admin/_admin/events/$id")({
	component: EventDetailPage,
});
