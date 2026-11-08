import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import { getMyRecords } from "./service.ts";

export const getMyRecordsFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		return {
			success: false as const,
			error: "Please sign in to continue.",
			viewer: "OTHER" as const,
			students: [],
		};
	}

	const records = await getMyRecords(session.user.id);

	return { success: true as const, ...records };
});
