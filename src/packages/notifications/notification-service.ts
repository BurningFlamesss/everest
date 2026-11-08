import { prisma } from "#/packages/db/index.ts";

export type NotificationType =
	| "INVITE_APPROVED"
	| "INVITE_REJECTED"
	| "NOTICE_PUBLISHED"
	| "EXAM_PUBLISHED"
	| "PAYMENT_RECEIVED"
	| "ACCOUNT";

export interface NotificationInput {
	userId: string;
	type: NotificationType | string;
	title: string;
	body?: string | null;
	refType?: string | null;
	refId?: string | null;
}

export async function createNotification(input: NotificationInput) {
	return prisma.notification.create({
		data: {
			userId: input.userId,
			type: input.type,
			title: input.title,
			body: input.body || null,
			refType: input.refType || null,
			refId: input.refId || null,
		},
	});
}

/** Creates one notification per user, skipping duplicates in the same batch. */
export async function notifyUsers(
	input: Omit<NotificationInput, "userId"> & { userIds: Array<string> },
) {
	const userIds = [...new Set(input.userIds)].filter(Boolean);

	if (userIds.length === 0) return 0;

	const result = await prisma.notification.createMany({
		data: userIds.map((userId) => ({
			userId,
			type: input.type,
			title: input.title,
			body: input.body || null,
			refType: input.refType || null,
			refId: input.refId || null,
		})),
	});

	return result.count;
}

/** Notifies every user holding one of the given roles. */
export async function notifyRoles(
	input: Omit<NotificationInput, "userId"> & { roles: Array<string> },
) {
	if (input.roles.length === 0) return 0;

	const roles = await prisma.userRole.findMany({
		where: {
			role: {
				in: input.roles as Array<
					"ADMIN" | "STAFF" | "STUDENT" | "GUARDIAN" | "SUPERADMIN"
				>,
			},
		},
		select: { userId: true },
	});

	return notifyUsers({ ...input, userIds: roles.map((entry) => entry.userId) });
}

export async function listNotifications(userId: string, limit = 50) {
	return prisma.notification.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
		take: Math.min(Math.max(limit, 1), 100),
	});
}

export function getUnreadNotificationCount(userId: string) {
	return prisma.notification.count({ where: { userId, readAt: null } });
}

export async function markNotificationRead(userId: string, id: string) {
	const result = await prisma.notification.updateMany({
		where: { id, userId },
		data: { readAt: new Date() },
	});

	if (result.count === 0) throw new Error("NOTIFICATION_NOT_FOUND");
}

export function markAllNotificationsRead(userId: string) {
	return prisma.notification.updateMany({
		where: { userId, readAt: null },
		data: { readAt: new Date() },
	});
}
