import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CheckCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { STAGGER } from "#/lib/motion";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import {
	getNotificationsFn,
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "#/packages/notifications/server.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/templates/modern/components/kit";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/notifications")({
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
		<PageFrame testId="notifications-page">
			<PageHeader
				testId="notifications-page-header"
				eyebrow="Notifications"
				title="What's new"
				subtitle={
					unreadCount === 0
						? "You are all caught up."
						: `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}.`
				}
				actions={
					unreadCount > 0 ? (
						<Button
							type="button"
							variant="outline"
							onClick={() => void markAll()}
							disabled={isSaving}
							className="rounded-field duration-fast"
							data-testid="notifications-mark-all-read"
						>
							{isSaving ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CheckCheck className="h-4 w-4" />
							)}
							Mark all read
						</Button>
					) : undefined
				}
			/>

			<Section testId="notification-list">
				<SectionHeading
					eyebrow="Inbox"
					title="All notifications"
					aside={
						<span className="t-meta">
							{notifications.length} total · {unreadCount} unread
						</span>
					}
					testId="notification-list-heading"
				/>

				{notifications.length === 0 ? (
					<div className="mt-9">
						<EmptyState
							eyebrow="Quiet for now"
							title="No notifications yet"
							description="Invitation decisions, published notices and exam results will show up here."
							testId="notifications-empty-state"
						/>
					</div>
				) : (
					<ul className="mt-8 divide-y divide-rule-soft">
						{notifications.map((notification, index) => (
							<li key={notification.id}>
								<Reveal delay={Math.min(index, 6) * STAGGER}>
									<div
										data-testid="notification-row"
										className={
											notification.readAt
												? "flex flex-wrap items-start justify-between gap-3 px-5 py-4"
												: "flex flex-wrap items-start justify-between gap-3 bg-accent/[0.07] px-5 py-4"
										}
									>
										<div className="min-w-0">
											<p className="font-medium text-foreground">
												{notification.title}
											</p>
											{notification.body ? (
												<p className="t-caption mt-1">{notification.body}</p>
											) : null}
											<p className="t-meta mt-1">
												{new Date(notification.createdAt).toLocaleString()}
											</p>
										</div>
										<div className="flex items-center gap-3">
											<Button
												asChild
												variant="link"
												size="sm"
												className="text-[13px]"
												data-testid="notification-open-link"
											>
												<Link to={linkFor(notification)}>Open</Link>
											</Button>
											{!notification.readAt ? (
												<button
													type="button"
													onClick={() => void markRead(notification.id)}
													disabled={isSaving}
													className="text-[13px] text-muted-foreground transition-colors duration-fast hover:text-foreground disabled:opacity-60"
													data-testid="notification-mark-read"
												>
													Mark read
												</button>
											) : null}
										</div>
									</div>
								</Reveal>
							</li>
						))}
					</ul>
				)}
			</Section>
		</PageFrame>
	);
}
