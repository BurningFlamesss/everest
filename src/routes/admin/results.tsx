import { createFileRoute } from "@tanstack/react-router";
import ResultsPage from "#/pages/admin/results/ResultsPage";

export const Route = createFileRoute("/admin/results")({
  component: ResultsPage,
});
