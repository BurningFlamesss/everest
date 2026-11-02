import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import {
	getPrimaryRole,
	getUserRoles,
	isManagementUser,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

export const getViewerFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		return {
			user: null,
			roles: [] as Array<{ role: string; branchId: string | null }>,
			primaryRole: null,
			isManagement: false,
		};
	}

	const [roles, profile] = await Promise.all([
		getUserRoles(session.user.id),
		prisma.user.findUnique({
			where: { id: session.user.id },
			select: { activatedAt: true },
		}),
	]);

	return {
		user: {
			id: session.user.id,
			name: session.user.name,
			email: session.user.email,
			image: session.user.image ?? null,
			activatedAt: profile?.activatedAt ?? null,
		},
		roles: roles.map((role) => ({
			role: role.role,
			branchId: role.branchId,
		})),
		primaryRole: getPrimaryRole(roles),
		isManagement: await isManagementUser(session.user.id),
	};
});
