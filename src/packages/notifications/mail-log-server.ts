import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

export const getMailLogFn = createServerFn().handler(async () => {
	try {
		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const session = await auth.api.getSession({ headers: getRequestHeaders() });

		if (!session?.user?.id) {
			throw new AuthorizationError("Please sign in to continue");
		}

		await requirePermission(session.user.id, "MANAGE_DASHBOARD");

		const entries = await prisma.mailLog.findMany({
			orderBy: { createdAt: "desc" },
			take: 100,
		});

		return { success: true as const, entries };
	} catch (error) {
		return {
			success: false as const,
			error: error instanceof Error ? error.message : "Something went wrong",
			entries: [],
		};
	}
});
