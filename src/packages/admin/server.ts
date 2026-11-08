import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

export const getAdminStatsFn = createServerFn().handler(async () => {
	try {
		const { getRequestHeaders } = await import("@tanstack/react-start/server");
		const session = await auth.api.getSession({ headers: getRequestHeaders() });

		if (!session?.user?.id) {
			throw new AuthorizationError("Please sign in to continue");
		}

		await requirePermission(session.user.id, "MANAGE_DASHBOARD");

		const now = new Date();

		const [
			students,
			staff,
			guardians,
			pendingInvites,
			pendingGuardianInvites,
			draftNotices,
			publishedNotices,
			upcomingEvents,
			clubs,
		] = await Promise.all([
			prisma.student.count({ where: { status: "ACTIVE" } }),
			prisma.staff.count({ where: { status: "ACTIVE" } }),
			prisma.guardian.count(),
			prisma.invite.count({
				where: { usedAt: null, expiresAt: { gt: now } },
			}),
			prisma.guardianInvite.count({
				where: { usedAt: null, expiresAt: { gt: now } },
			}),
			prisma.scmsNotice.count({ where: { isPublished: false } }),
			prisma.scmsNotice.count({ where: { isPublished: true } }),
			prisma.event.count({
				where: { isPublished: true, startsAt: { gte: now } },
			}),
			prisma.club.count({ where: { isActive: true } }),
		]);

		return {
			success: true as const,
			stats: {
				students,
				staff,
				guardians,
				pendingInvites: pendingInvites + pendingGuardianInvites,
				draftNotices,
				publishedNotices,
				upcomingEvents,
				clubs,
			},
		};
	} catch (error) {
		return {
			success: false as const,
			error: error instanceof Error ? error.message : "Something went wrong",
			stats: null,
		};
	}
});
