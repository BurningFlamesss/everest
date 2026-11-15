import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
	AlertTriangle,
	type Bell,
	CalendarDays,
	CheckCheck,
	CreditCard,
	GraduationCap,
	Info,
	Mail,
	Megaphone,
	Server,
	UserPlus,
} from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import { ScrollArea } from "#/components/ui/scroll-area";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
} from "#/components/ui/sheet";
import { Skeleton } from "#/components/ui/skeleton";
import { dayLabel, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";
import {
	getNotificationsFn,
	markAllNotificationsReadAction,
	markNotificationReadAction,
} from "#/packages/notifications/server.ts";

/** Row shape returned by `getNotificationsFn` (Prisma `Notification`). */
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

const TYPE_ICON: Record<string, typeof Bell> = {
	// Real DB notification types (packages/notifications/notification-service.ts)
	INVITE_APPROVED: UserPlus,
	INVITE_REJECTED: UserPlus,
	NOTICE_PUBLISHED: Megaphone,
	EXAM_PUBLISHED: GraduationCap,
	PAYMENT_RECEIVED: CreditCard,
	ACCOUNT: Server,
	// Mock kinds kept for parity during the transition (used by seeded demo data)
	admission: GraduationCap,
	user: UserPlus,
	attendance: AlertTriangle,
	event: CalendarDays,
	notice: Megaphone,
	invitation: Mail,
	payment: CreditCard,
	system: Server,
};

const FILTERS: {
	key: "all" | "unread";
	label: string;
}[] = [
	{ key: "all", label: "All" },
	{ key: "unread", label: "Unread" },
];

interface NotificationCenterProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/** Map a real DB notification to the in-app route its "Open" link targets. */
function linkFor(type: string, refType: string | null): string | null {
	if (refType === "notice") return "/notices";
	if (refType === "exam") return "/my-results";
	if (refType === "invite-request") return "/dashboard";
	if (type === "NOTICE_PUBLISHED") return "/admin/notices";
	if (type === "EXAM_PUBLISHED") return "/admin/exams";
	if (type === "PAYMENT_RECEIVED") return "/admin/payments";
	if (type === "INVITE_APPROVED" || type === "INVITE_REJECTED")
		return "/admin/invites";
	if (type === "ACCOUNT") return "/admin/settings";
	return "/admin/overview";
}

export function NotificationCenter({
	open,
	onOpenChange,
}: NotificationCenterProps) {
	const [filter, setFilter] = useState<"all" | "unread">("all");
	const navigate = useNavigate();
	const qc = useQueryClient();

	const { data, isLoading } = useQuery({
		queryKey: ["notifications", "center", filter],
		queryFn: () => getNotificationsFn(),
		enabled: open,
	});

	const notifications = (data?.notifications ?? []).filter((n) =>
		filter === "unread" ? !n.readAt : true,
	);

	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["notifications"] });
	};

	const markRead = useMutation({
		mutationFn: (id: string) => markNotificationReadAction({ data: { id } }),
		onSuccess: invalidate,
	});
	const markAll = useMutation({
		mutationFn: () => markAllNotificationsReadAction(),
		onSuccess: invalidate,
	});

	const groups = notifications.reduce<Record<string, Array<NotificationRow>>>(
		(acc, item) => {
			const key = new Date(item.createdAt).toISOString().slice(0, 10);
			acc[key] = acc[key] ? [...acc[key], item] : [item];
			return acc;
		},
		{},
	);

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent
				side="right"
				className="flex w-full flex-col gap-0 border-hairline bg-[#FEF2F2] p-0 sm:max-w-md"
				data-testid="notification-center"
			>
				<SheetHeader className="border-b border-hairline px-5 py-4 text-left">
					<SheetTitle className="font-display text-base">
						Notifications
					</SheetTitle>
					<SheetDescription className="text-xs">
						Operational alerts across admissions, attendance, finance and the
						website.
					</SheetDescription>
				</SheetHeader>

				<div className="flex items-center gap-1.5 overflow-x-auto border-b border-hairline px-4 py-2.5">
					{FILTERS.map((item) => (
						<button
							key={item.key}
							type="button"
							data-testid={`notification-filter-${item.key}`}
							onClick={() => setFilter(item.key)}
							className={cn(
								"whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors focus-ring",
								filter === item.key
									? "border-primary/30 bg-primary/10 text-primary"
									: "border-hairline text-muted-foreground hover:text-foreground",
							)}
						>
							{item.label}
						</button>
					))}
					<Button
						variant="ghost"
						size="sm"
						className="ml-auto shrink-0 gap-1.5 text-xs"
						data-testid="notifications-mark-all-read"
						disabled={markAll.isPending}
						onClick={() => markAll.mutate()}
					>
						<CheckCheck className="h-3.5 w-3.5" /> Mark all
					</Button>
				</div>

				<ScrollArea className="flex-1">
					<div className="px-4 py-3">
						{isLoading && (
							<div className="space-y-3">
								{[0, 1, 2, 3].map((i) => (
									<Skeleton key={i} className="h-16 w-full" />
								))}
							</div>
						)}

						{!isLoading && notifications.length === 0 && (
							<div
								className="py-16 text-center"
								data-testid="notifications-empty"
							>
								<span className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-secondary">
									<Info className="h-4 w-4 text-muted-foreground" />
								</span>
								<p className="text-sm font-medium text-foreground">
									Nothing here
								</p>
								<p className="mt-1 text-xs text-muted-foreground">
									{filter === "unread"
										? "You're all caught up."
										: "Notifications will appear as the school day unfolds."}
								</p>
							</div>
						)}

						{Object.entries(groups).map(([day, items]) => (
							<div key={day} className="mb-4">
								<p className="eyebrow-label mb-2">{dayLabel(day)}</p>
								<ul className="space-y-1.5">
									{items.map((item) => {
										const Icon = TYPE_ICON[item.type] ?? Server;
										const href = linkFor(item.type, item.refType);
										return (
											<li
												key={item.id}
												className={cn(
													"group relative rounded-lg border border-hairline bg-[#FEF2F2] p-3 transition-colors hover:bg-gray-100",
													!item.readAt && "border-l-2 border-l-primary",
												)}
												data-testid="notification-item"
											>
												<div className="flex gap-3">
													<span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-info/12 text-info">
														<Icon className="h-3.5 w-3.5" />
													</span>
													<div className="min-w-0 flex-1">
														<p className="text-sm font-medium leading-snug text-foreground">
															{item.title}
														</p>
														{item.body ? (
															<p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
																{item.body}
															</p>
														) : null}
														<div className="mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground">
															<span>{relativeTime(item.createdAt)}</span>
															{href && (
																<button
																	type="button"
																	className="ml-auto text-primary hover:underline"
																	data-testid="notification-open"
																	onClick={() => {
																		if (!item.readAt) markRead.mutate(item.id);
																		onOpenChange(false);
																		navigate({ to: href as never });
																	}}
																>
																	Open
																</button>
															)}
														</div>
													</div>
													<div className="row-actions flex flex-col gap-1">
														{!item.readAt && (
															<button
																type="button"
																aria-label="Mark as read"
																data-testid="notification-mark-read"
																className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
																onClick={() => markRead.mutate(item.id)}
															>
																<CheckCheck className="h-3.5 w-3.5" />
															</button>
														)}
													</div>
												</div>
											</li>
										);
									})}
								</ul>
							</div>
						))}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}
