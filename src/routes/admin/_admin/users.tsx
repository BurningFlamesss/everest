import { createFileRoute } from "@tanstack/react-router";
import UsersPage from "#/pages/admin/users/UsersPage";

export const Route = createFileRoute("/admin/_admin/users")({
	validateSearch: (search: Record<string, unknown>) => ({
		tab: search.tab as string | undefined,
		new: search.new as string | undefined,
	}),
	component: UsersPage,
});
