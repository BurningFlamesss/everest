import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "@tanstack/react-router";
import { ChevronDown, ChevronsLeft, ChevronsRight, Globe } from "lucide-react";
import { useMemo, useState } from "react";
import { ScrollArea } from "#/components/ui/scroll-area";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";
import { useAuth } from "#/providers/AuthProvider";
import { getOverview } from "#/services/overview";
import { NAV_GROUPS, type NavItem } from "./nav-config";

interface SidebarProps {
	collapsed: boolean;
	mobile?: boolean;
	onToggle?: () => void;
	onNavigate?: () => void;
}

export function Sidebar({
	collapsed,
	mobile = false,
	onToggle,
	onNavigate,
}: SidebarProps) {
	const { user, can } = useAuth();
	const location = useLocation();
	const [openItem, setOpenItem] = useState<string | null>(null);

	const { data: overview } = useQuery({
		queryKey: ["overview", "nav-badges"],
		queryFn: getOverview,
		staleTime: 60_000,
	});

	const badges = useMemo(() => {
		const actions = overview?.pendingActions ?? [];
		const byId = (id: string) => actions.find((a) => a.id === id)?.count ?? 0;
		return {
			pendingAdmissions: byId("pa_admissions"),
			draftNotices: byId("pa_notices"),
			unmarkedClasses: byId("pa_attendance"),
			pendingInvites: byId("pa_invites"),
		};
	}, [overview]);

	const groups = NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => can(item.permission)),
	})).filter((group) => group.items.length > 0);

	const isActive = (item: NavItem) => location.pathname.startsWith(item.to);

	return (
		<aside
			className="flex h-full flex-col bg-primary text-primary-foreground shadow-xl"
			data-testid="app-sidebar"
			data-collapsed={collapsed ? "true" : "false"}
		>
			<div
				className={cn(
					"flex h-14 items-center justify-center gap-2.5 px-4",
					collapsed && "px-0",
				)}
			>
				<Link
					to="/"
					title="View public website"
					className="flex items-center justify-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
				>
					<img
						src="/schools/everest/logo.png"
						alt="Everest English Boarding Secondary School"
						data-testid="admin-sidebar-logo"
						className={cn(
							"shrink-0 object-contain",
							collapsed ? "h-8 w-8" : "h-10 w-auto max-w-[210px]",
						)}
					/>
				</Link>
			</div>

			<ScrollArea className="flex-1">
				<nav className={cn("space-y-5 py-4", collapsed && "px-2")}>
					{groups.map((group) => (
						<div key={group.label}>
							{!collapsed && (
								<p className="mb-2 px-4 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60">
									{group.label}
								</p>
							)}
							{collapsed && (
								<div className="mx-auto mb-2 h-px w-6 bg-white/20" />
							)}
							<ul className="space-y-0.5">
								{group.items.map((item) => {
									const active = isActive(item);
									const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
									const expanded = openItem === item.label;

									const link = (
										<Link
											to={item.to}
											onClick={onNavigate}
											data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
											className={cn(
												"group relative flex min-h-11 items-center gap-3 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
												active &&
													"font-semibold before:absolute before:inset-y-0 before:left-0 before:w-[3px] before:bg-[#EAB308]",
												collapsed && "justify-center px-0",
											)}
										>
											<item.icon
												className={cn(
													"h-4 w-4 shrink-0 transition-colors",
													active
														? "text-[#EAB308]"
														: "text-white/70 group-hover:text-white",
												)}
											/>
											{!collapsed && (
												<span className="flex-1 truncate">{item.label}</span>
											)}
											{!collapsed && badgeCount > 0 && (
												<span className="num rounded-full bg-[#EAB308] px-1.5 py-0.5 text-[11px] font-semibold text-black">
													{badgeCount}
												</span>
											)}
											{collapsed && badgeCount > 0 && (
												<span className="absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-[#EAB308]" />
											)}
										</Link>
									);

									return (
										<li key={item.label}>
											<div className="flex items-center">
												{collapsed ? (
													<Tooltip>
														<TooltipTrigger asChild>
															<div className="w-full">{link}</div>
														</TooltipTrigger>
														<TooltipContent
															side="right"
															className="bg-popover text-popover-foreground"
														>
															{item.label}
															{badgeCount > 0 ? ` · ${badgeCount}` : ""}
														</TooltipContent>
													</Tooltip>
												) : (
													<div className="flex-1">{link}</div>
												)}
												{!collapsed && item.children && (
													<button
														type="button"
														aria-label={`Toggle ${item.label} sub-navigation`}
														data-testid={`nav-expand-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`}
														onClick={() =>
															setOpenItem(expanded ? null : item.label)
														}
														className="ml-0.5 flex min-h-9 min-w-9 items-center justify-center rounded border-none bg-transparent text-white/70 transition-colors hover:bg-white/5 hover:text-[#EAB308] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
													>
														<ChevronDown
															className={cn(
																"h-3.5 w-3.5 transition-transform duration-180",
																expanded && "rotate-180",
															)}
														/>
													</button>
												)}
											</div>

											{!collapsed && item.children && expanded && (
												<ul className="ml-6 mt-1 space-y-1 border-l border-white/20 pl-2">
													{item.children.map((child) => (
														<li key={child.to}>
															<Link
																to={child.to}
																onClick={onNavigate}
																className="block rounded px-4 py-1.5 text-[13px] transition-colors duration-150 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
															>
																{({ isActive: childActive }) => (
																	<span
																		className={cn(
																			childActive &&
																				location.search ===
																					child.to.split("?")[1]
																				? "font-medium text-white"
																				: "text-white/70",
																		)}
																	>
																		{child.label}
																	</span>
																)}
															</Link>
														</li>
													))}
												</ul>
											)}
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>
			</ScrollArea>

			<div className="border-t border-white/10 p-3 space-y-2">
				{collapsed ? (
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								to="/"
								data-testid="admin-goto-public"
								className="flex min-h-11 w-full items-center justify-center rounded bg-white/10 p-2 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
								aria-label="View public website"
							>
								<Globe className="h-4 w-4" />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="right">View public website</TooltipContent>
					</Tooltip>
				) : (
					<Link
						to="/"
						data-testid="admin-goto-public"
						className="flex min-h-11 w-full items-center gap-2.5 rounded bg-white/10 px-2.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
					>
						<Globe className="h-4 w-4 shrink-0" />
						<span>Public Website</span>
					</Link>
				)}

				{!mobile && (
					<button
						type="button"
						onClick={onToggle}
						data-testid="sidebar-collapse-toggle"
						className={cn(
							"flex min-h-11 w-full items-center gap-2 rounded border-none bg-transparent px-2.5 py-2 text-xs font-medium text-white/75 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
							collapsed && "justify-center px-0",
						)}
					>
						{collapsed ? (
							<ChevronsRight className="h-4 w-4" />
						) : (
							<ChevronsLeft className="h-4 w-4" />
						)}
						{!collapsed && <span>Collapse sidebar</span>}
						{!collapsed && (
							<span className="ml-auto font-mono text-[10px] text-white/50">
								⌘B
							</span>
						)}
					</button>
				)}
				{!collapsed && user && (
					<div className="mt-2 flex items-center gap-2.5 rounded-md bg-white/10 px-2.5 py-2">
						<img
							src={user.avatarUrl}
							alt=""
							className="h-7 w-7 rounded-full border border-white/30"
						/>
						<div className="min-w-0">
							<p className="truncate text-xs font-medium text-white">
								{user.name}
							</p>
							<p className="truncate text-[11px] text-white/60">{user.title}</p>
						</div>
					</div>
				)}
			</div>
		</aside>
	);
}
