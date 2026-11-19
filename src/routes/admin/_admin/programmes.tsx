import { createFileRoute } from "@tanstack/react-router";
import ProgrammesPage from "#/pages/admin/programmes/ProgrammesPage";

export const Route = createFileRoute("/admin/_admin/programmes")({
	component: ProgrammesPage,
});
