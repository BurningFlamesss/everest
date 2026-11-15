import { createFileRoute, redirect } from "@tanstack/react-router";
import { AdminShell } from "#/components/layout/AdminShell";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/admin")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		if (!viewer.isManagement) {
			throw redirect({ to: "/dashboard" });
		}

		return { viewer };
	},
	component: () => <AdminShell />,
});
