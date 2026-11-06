import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import { getStaffWorkspace } from "./staff-service.ts";

export const getMyClassesFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return null;

	return getStaffWorkspace(session.user.id);
});
