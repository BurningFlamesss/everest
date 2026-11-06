import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	getUnreadNotificationCount,
	listNotifications,
	markAllNotificationsRead,
	markNotificationRead,
} from "./notification-service.ts";

async function getUserId() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	return session?.user?.id ?? null;
}

export const getNotificationsFn = createServerFn().handler(async () => {
	const userId = await getUserId();

	if (!userId) return { notifications: [], unreadCount: 0 };

	const [notifications, unreadCount] = await Promise.all([
		listNotifications(userId),
		getUnreadNotificationCount(userId),
	]);

	return { notifications, unreadCount };
});

export const getUnreadNotificationCountFn = createServerFn().handler(
	async () => {
		const userId = await getUserId();

		if (!userId) return 0;

		return getUnreadNotificationCount(userId);
	},
);

export const markNotificationReadAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			const userId = await getUserId();

			if (!userId) {
				return {
					success: false as const,
					error: "Please sign in to continue.",
				};
			}

			await markNotificationRead(userId, data.id);

			return {
				success: true as const,
				unreadCount: await getUnreadNotificationCount(userId),
			};
		} catch (error) {
			return {
				success: false as const,
				error: error instanceof Error ? error.message : "Something went wrong",
			};
		}
	});

export const markAllNotificationsReadAction = createServerFn().handler(
	async () => {
		try {
			const userId = await getUserId();

			if (!userId) {
				return {
					success: false as const,
					error: "Please sign in to continue.",
				};
			}

			await markAllNotificationsRead(userId);

			return { success: true as const, unreadCount: 0 };
		} catch (error) {
			return {
				success: false as const,
				error: error instanceof Error ? error.message : "Something went wrong",
			};
		}
	},
);
