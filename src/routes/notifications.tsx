import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import {
	getNotificationsFn,
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "#/packages/notifications/server.ts";

export const Route = createFileRoute("/notifications")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) throw redirect({ to: "/login" });

		return { viewer };
	},
	loader: () => getNotificationsFn(),
	component: NotificationsPage,
});

interface NotificationRow {
	id: string;
	type: string;
	title: string;
	body: string | null;
	refType: string | null;
	refId: string | null;
	readAt: string | Date | null;
	createdAt: string | Date;
}

function linkFor(notification: NotificationRow) {
	if (notification.refType === "notice") return "/notices";
	if (notification.refType === "exam") return "/my-results";
	if (notification.refType === "invite-request") return "/dashboard";
	return "/dashboard";
}

function NotificationsPage() {
	const data = Route.useLoaderData();
	const [notifications, setNotifications] = useState<Array<NotificationRow>>(
		data.notifications as Array<NotificationRow>,
	);
	const [unreadCount, setUnreadCount] = useState(data.unreadCount);
	const [isSaving, setIsSaving] = useState(false);

	const markRead = async (id: string) => {
		setIsSaving(true);
		const response = await markNotificationReadAction({ data: { id } });
		setIsSaving(false);

		if (response.success) {
			setNotifications((current) =>
				current.map((entry) =>
					entry.id === id ? { ...entry, readAt: new Date() } : entry,
				),
			);
			setUnreadCount(response.unreadCount);
		}
	};

	const markAll = async () => {
		setIsSaving(true);
		const response = await markAllNotificationsReadAction();
		setIsSaving(false);

		if (response.success) {
			setNotifications((current) =>
				current.map((entry) => ({ ...entry, readAt: new Date() })),
			);
			setUnreadCount(0);
		}
	};

	return (
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<div className="flex flex-wrap items-end justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
							Notifications
						</p>
						<h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
							What&apos;s new
						</h1>
						<p className="mt-3 text-muted-foreground">
							{unreadCount === 0
								? "You are all caught up."
								: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`}
						</p>
					</div>
					{unreadCount > 0 ? (
						<button
							type="button"
							onClick={() => void markAll()}
							disabled={isSaving}
							className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted disabled:opacity-60"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CheckCheck className="h-4 w-4" />
							)}
							Mark all read
						</button>
					) : null}
				</div>
			</section>

			<section className="mx-6 overflow-hidden rounded-2xl border border-border bg-card md:mx-16">
				{notifications.length === 0 ? (
					<div className="p-12 text-center">
						<Bell className="mx-auto h-8 w-8 text-muted-foreground" />
						<p className="mt-3 text-sm text-muted-foreground">
							No notifications yet. Invitation decisions, published notices and
							exam results will show up here.
						</p>
					</div>
				) : (
					<ul className="divide-y divide-border">
						{notifications.map((notification) => (
							<li
								key={notification.id}
								className={
									notification.readAt
										? "flex flex-wrap items-start justify-between gap-3 px-5 py-4"
										: "flex flex-wrap items-start justify-between gap-3 bg-primary/5 px-5 py-4"
								}
							>
								<div className="min-w-0">
									<p className="font-medium text-foreground">
										{notification.title}
									</p>
									{notification.body ? (
										<p className="mt-1 text-sm text-muted-foreground">
											{notification.body}
										</p>
									) : null}
									<p className="mt-1 text-xs text-muted-foreground">
										{new Date(notification.createdAt).toLocaleString()}
									</p>
								</div>
								<div className="flex items-center gap-3">
									<Link
										to={linkFor(notification)}
										className="text-xs font-semibold text-primary hover:underline"
									>
										Open
									</Link>
									{!notification.readAt ? (
										<button
											type="button"
											onClick={() => void markRead(notification.id)}
											disabled={isSaving}
											className="text-xs font-medium text-muted-foreground hover:text-foreground"
										>
											Mark read
										</button>
									) : null}
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</main>
	);
}
