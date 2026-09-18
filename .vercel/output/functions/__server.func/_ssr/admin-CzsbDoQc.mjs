import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, Outlet, useLocation, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { Activity, Bell, Building2, Bus, CalendarDays, CalendarPlus, Check, CheckCheck, ChevronDown, ChevronRight, ChevronsLeft, ChevronsRight, CloudUpload, CreditCard, GalleryVerticalEnd, Globe, GraduationCap, ImagePlus, Images, Info, LayoutDashboard, Library, LogOut, Mail, Megaphone, Menu, Moon, PanelsTopLeft, Plus, Search, Server, Settings, ShieldCheck, Sun, TriangleAlert, User, UserCheck, UserPlus, Users, X } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { ROLE_LABEL, useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip-Dvg3NVEm.mjs";
import { Skeleton } from "./skeleton-Dhh7pexn.mjs";
import { dayLabel, relativeTime } from "./format-BBWmN55e.mjs";
import { db, latency } from "./db-CgIvOOZs.mjs";
import { ScrollArea } from "./scroll-area-Uy1QVTEG.mjs";
import { getOverview } from "./overview-CA_FT-A4.mjs";
import { clearNotification, listNotifications, markAllNotificationsRead, markNotificationRead, unreadCount } from "./notifications-CeHCmL3l.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { listBranches } from "./website-DZTFoYsv.mjs";
import { Command$1, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "./command-BzGKVTov.mjs";
import { z } from "../_libs/next-themes.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/admin-CzsbDoQc.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV_GROUPS = [
	{
		label: "Operations",
		items: [
			{
				label: "Overview",
				to: "/admin/overview",
				icon: LayoutDashboard,
				permission: "overview.view"
			},
			{
				label: "Attendance",
				to: "/admin/attendance",
				icon: UserCheck,
				permission: "attendance.view",
				badgeKey: "unmarkedClasses",
				children: [
					{
						label: "Daily register",
						to: "/admin/attendance?view=daily"
					},
					{
						label: "Staff attendance",
						to: "/admin/attendance?view=staff"
					},
					{
						label: "Statistics",
						to: "/admin/attendance?view=stats"
					}
				]
			},
			{
				label: "Admissions",
				to: "/admin/admissions",
				icon: GraduationCap,
				permission: "admissions.view",
				badgeKey: "pendingAdmissions",
				children: [
					{
						label: "Pending",
						to: "/admin/admissions?status=pending"
					},
					{
						label: "Accepted",
						to: "/admin/admissions?status=accepted"
					},
					{
						label: "Waitlisted",
						to: "/admin/admissions?status=waitlisted"
					},
					{
						label: "Rejected",
						to: "/admin/admissions?status=rejected"
					}
				]
			},
			{
				label: "Payments",
				to: "/admin/payments",
				icon: CreditCard,
				permission: "payments.view"
			},
			{
				label: "Transportation",
				to: "/admin/transportation",
				icon: Bus,
				permission: "transport.view"
			},
			{
				label: "Scholarships",
				to: "/admin/scholarships",
				icon: GraduationCap,
				permission: "admissions.view"
			}
		]
	},
	{
		label: "People",
		items: [
			{
				label: "Students",
				to: "/admin/students",
				icon: Users,
				permission: "students.view"
			},
			{
				label: "Staff",
				to: "/admin/staff",
				icon: Users,
				permission: "staff.view"
			},
			{
				label: "Users & Roles",
				to: "/admin/users",
				icon: ShieldCheck,
				permission: "users.view",
				badgeKey: "pendingInvites",
				children: [
					{
						label: "User directory",
						to: "/admin/users?tab=directory"
					},
					{
						label: "Roles & permissions",
						to: "/admin/users?tab=roles"
					},
					{
						label: "Invitations",
						to: "/admin/users?tab=invitations"
					},
					{
						label: "Sessions",
						to: "/admin/users?tab=sessions"
					}
				]
			}
		]
	},
	{
		label: "Academics",
		items: [{
			label: "Classes & Sections",
			to: "/admin/classes",
			icon: GalleryVerticalEnd,
			permission: "classes.view"
		}, {
			label: "Courses & Subjects",
			to: "/admin/courses",
			icon: Library,
			permission: "courses.view"
		}]
	},
	{
		label: "Communications",
		items: [
			{
				label: "Notices",
				to: "/admin/notices",
				icon: Megaphone,
				permission: "notices.view",
				badgeKey: "draftNotices",
				children: [
					{
						label: "Published",
						to: "/admin/notices?status=published"
					},
					{
						label: "Scheduled",
						to: "/admin/notices?status=scheduled"
					},
					{
						label: "Drafts",
						to: "/admin/notices?status=draft"
					},
					{
						label: "Archived",
						to: "/admin/notices?status=archived"
					}
				]
			},
			{
				label: "Events",
				to: "/admin/events",
				icon: CalendarDays,
				permission: "events.view"
			},
			{
				label: "Gallery",
				to: "/admin/gallery",
				icon: Images,
				permission: "gallery.view"
			}
		]
	},
	{
		label: "Website",
		items: [{
			label: "Website Content",
			to: "/admin/website",
			icon: Globe,
			permission: "website.view",
			children: [
				{
					label: "Home",
					to: "/admin/website?page=home"
				},
				{
					label: "About",
					to: "/admin/website?page=about"
				},
				{
					label: "Courses",
					to: "/admin/website?page=courses"
				},
				{
					label: "Facilities",
					to: "/admin/website?page=facilities"
				},
				{
					label: "Gallery",
					to: "/admin/website?page=gallery"
				},
				{
					label: "Calendar",
					to: "/admin/website?page=calendar"
				},
				{
					label: "Contact",
					to: "/admin/website?page=contact"
				},
				{
					label: "Resources",
					to: "/admin/website?page=resources"
				},
				{
					label: "Results",
					to: "/admin/website?page=result"
				}
			]
		}]
	},
	{
		label: "System",
		items: [{
			label: "Activity",
			to: "/admin/activity",
			icon: Activity,
			permission: "activity.view"
		}, {
			label: "Settings",
			to: "/admin/settings",
			icon: Settings,
			permission: "settings.view",
			children: [
				{
					label: "School",
					to: "/admin/settings?tab=school"
				},
				{
					label: "Organization",
					to: "/admin/settings?tab=organization"
				},
				{
					label: "Users & security",
					to: "/admin/settings?tab=security"
				},
				{
					label: "Website",
					to: "/admin/settings?tab=website"
				},
				{
					label: "Notifications",
					to: "/admin/settings?tab=notifications"
				}
			]
		}]
	}
];
var ROUTE_TITLES = {
	overview: "Overview",
	students: "Students",
	staff: "Staff",
	users: "Users & Roles",
	classes: "Classes & Sections",
	courses: "Courses & Subjects",
	attendance: "Attendance",
	notices: "Notices",
	events: "Events",
	gallery: "Gallery",
	admissions: "Admissions",
	transportation: "Transportation",
	payments: "Payments",
	website: "Website Content",
	activity: "Activity",
	settings: "Settings"
};
function Sidebar({ collapsed, mobile = false, onToggle, onNavigate }) {
	const { user, can } = useAuth();
	const location = useLocation();
	const [openItem, setOpenItem] = (0, import_react.useState)(null);
	const { data: overview } = useQuery({
		queryKey: ["overview", "nav-badges"],
		queryFn: getOverview,
		staleTime: 6e4
	});
	const badges = (0, import_react.useMemo)(() => {
		const actions = overview?.pendingActions ?? [];
		const byId = (id) => actions.find((a) => a.id === id)?.count ?? 0;
		return {
			pendingAdmissions: byId("pa_admissions"),
			draftNotices: byId("pa_notices"),
			unmarkedClasses: byId("pa_attendance"),
			pendingInvites: byId("pa_invites")
		};
	}, [overview]);
	const groups = NAV_GROUPS.map((group) => ({
		...group,
		items: group.items.filter((item) => can(item.permission))
	})).filter((group) => group.items.length > 0);
	const isActive = (item) => location.pathname.startsWith(item.to);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full flex-col border-r border-border bg-card",
		"data-testid": "app-sidebar",
		"data-collapsed": collapsed ? "true" : "false",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: cn("flex h-14 items-center gap-2.5 border-b border-border px-4", collapsed && "justify-center px-0"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground",
					children: "EEBSS"
				}), !collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate font-display text-xs font-semibold leading-tight text-foreground",
						title: "Everest English Boarding Secondary School",
						children: "Everest English Boarding Sec. School"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "truncate text-[11px] text-muted-foreground",
						children: "EEBSS Admin Console"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: cn("space-y-5 px-3 py-4", collapsed && "px-2"),
					children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
						!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label mb-2 px-2.5 text-muted-foreground",
							children: group.label
						}),
						collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto mb-2 h-px w-6 bg-border" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-0.5",
							children: group.items.map((item) => {
								const active = isActive(item);
								const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0;
								const expanded = openItem === item.label;
								const link = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: item.to,
									onClick: onNavigate,
									"data-testid": `nav-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`,
									className: cn("group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors duration-150 focus-ring", active ? "bg-muted font-medium text-foreground before:absolute before:bottom-1.5 before:left-0 before:top-1.5 before:w-[2px] before:rounded-full before:bg-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground", collapsed && "justify-center px-0"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: cn("h-4 w-4 shrink-0 transition-colors", active ? "text-primary" : "text-muted-foreground group-hover:text-foreground") }),
										!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "flex-1 truncate",
											children: item.label
										}),
										!collapsed && badgeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num rounded-full bg-accent/15 px-1.5 py-0.5 text-[11px] font-semibold text-accent-foreground",
											children: badgeCount
										}),
										collapsed && badgeCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" })
									]
								});
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center",
									children: [collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tooltip, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "w-full",
											children: link
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TooltipContent, {
										side: "right",
										className: "bg-popover text-popover-foreground",
										children: [item.label, badgeCount > 0 ? ` · ${badgeCount}` : ""]
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex-1",
										children: link
									}), !collapsed && item.children && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Toggle ${item.label} sub-navigation`,
										"data-testid": `nav-expand-${item.label.toLowerCase().replace(/[^a-z]+/g, "-")}`,
										onClick: () => setOpenItem(expanded ? null : item.label),
										className: "ml-0.5 rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("h-3.5 w-3.5 transition-transform duration-180", expanded && "rotate-180") })
									})]
								}), !collapsed && item.children && expanded && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "ml-[18px] mt-0.5 space-y-0.5 border-l border-border pl-3",
									children: item.children.map((child) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: child.to,
										onClick: onNavigate,
										className: ({ isActive: childActive }) => cn("block rounded px-2 py-1.5 text-[13px] transition-colors duration-150 focus-ring", childActive && location.search === child.to.split("?")[1] ? "text-foreground" : "text-muted-foreground hover:text-foreground"),
										children: child.label
									}) }, child.to))
								})] }, item.label);
							})
						})
					] }, group.label))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-t border-border p-3",
				children: [!mobile && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onToggle,
					"data-testid": "sidebar-collapse-toggle",
					className: cn("flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring", collapsed && "justify-center px-0"),
					children: [
						collapsed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsRight, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronsLeft, { className: "h-4 w-4" }),
						!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Collapse sidebar" }),
						!collapsed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "ml-auto font-mono text-[10px] text-muted-foreground",
							children: "⌘B"
						})
					]
				}), !collapsed && user && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-2 flex items-center gap-2.5 rounded-md bg-muted px-2.5 py-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: user.avatarUrl,
						alt: "",
						className: "h-7 w-7 rounded-full border border-border"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-xs font-medium text-foreground",
							children: user.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[11px] text-muted-foreground",
							children: user.title
						})]
					})]
				})]
			})
		]
	});
}
var KIND_ICON = {
	admission: GraduationCap,
	user: UserPlus,
	attendance: TriangleAlert,
	event: CalendarDays,
	notice: Megaphone,
	invitation: Mail,
	payment: CreditCard,
	system: Server
};
var SEVERITY_STYLE = {
	info: "bg-info/12 text-info",
	success: "bg-success/12 text-success",
	warning: "bg-warning/15 text-warning",
	critical: "bg-destructive/12 text-destructive"
};
var FILTERS = [
	{
		key: "all",
		label: "All"
	},
	{
		key: "unread",
		label: "Unread"
	},
	{
		key: "admission",
		label: "Admissions"
	},
	{
		key: "attendance",
		label: "Attendance"
	},
	{
		key: "payment",
		label: "Payments"
	},
	{
		key: "system",
		label: "System"
	}
];
function NotificationCenter({ open, onOpenChange }) {
	const [filter, setFilter] = (0, import_react.useState)("all");
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { data: notifications, isLoading } = useQuery({
		queryKey: ["notifications", filter],
		queryFn: () => listNotifications(filter),
		enabled: open
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["notifications"] });
	};
	const markRead = useMutation({
		mutationFn: markNotificationRead,
		onSuccess: invalidate
	});
	const markAll = useMutation({
		mutationFn: markAllNotificationsRead,
		onSuccess: invalidate
	});
	const clear = useMutation({
		mutationFn: clearNotification,
		onSuccess: invalidate
	});
	const groups = (notifications ?? []).reduce((acc, item) => {
		const key = item.createdAt.slice(0, 10);
		acc[key] = acc[key] ? [...acc[key], item] : [item];
		return acc;
	}, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
			side: "right",
			className: "flex w-full flex-col gap-0 border-hairline bg-[#FEF2F2] p-0 sm:max-w-md",
			"data-testid": "notification-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetHeader, {
					className: "border-b border-hairline px-5 py-4 text-left",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
						className: "font-display text-base",
						children: "Notifications"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, {
						className: "text-xs",
						children: "Operational alerts across admissions, attendance, finance and the website."
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1.5 overflow-x-auto border-b border-hairline px-4 py-2.5",
					children: [FILTERS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"data-testid": `notification-filter-${item.key}`,
						onClick: () => setFilter(item.key),
						className: cn("whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors focus-ring", filter === item.key ? "border-primary/30 bg-primary/10 text-primary" : "border-hairline text-muted-foreground hover:text-foreground"),
						children: item.label
					}, item.key)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "sm",
						className: "ml-auto shrink-0 gap-1.5 text-xs",
						"data-testid": "notifications-mark-all-read",
						disabled: markAll.isPending,
						onClick: () => markAll.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5" }), " Mark all"]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
					className: "flex-1",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "px-4 py-3",
						children: [
							isLoading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "space-y-3",
								children: [
									0,
									1,
									2,
									3
								].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-full" }, i))
							}),
							!isLoading && (notifications ?? []).length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "py-16 text-center",
								"data-testid": "notifications-empty",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-secondary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "h-4 w-4 text-muted-foreground" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-foreground",
										children: "Nothing here"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1 text-xs text-muted-foreground",
										children: filter === "unread" ? "You're all caught up." : "Notifications will appear as the school day unfolds."
									})
								]
							}),
							Object.entries(groups).map(([day, items]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mb-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "eyebrow-label mb-2",
									children: dayLabel(day)
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "space-y-1.5",
									children: items.map((item) => {
										const Icon = KIND_ICON[item.kind];
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
											className: cn("group relative rounded-lg border border-hairline bg-[#FEF2F2] p-3 transition-colors hover:bg-gray-100", !item.read && "border-l-2 border-l-primary"),
											"data-testid": "notification-item",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md", SEVERITY_STYLE[item.severity]),
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5" })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "min-w-0 flex-1",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-sm font-medium leading-snug text-foreground",
																children: item.title
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
																children: item.body
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "mt-1.5 flex items-center gap-2 text-[11px] text-muted-foreground",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: relativeTime(item.createdAt) }),
																	item.actorName && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["· ", item.actorName] }),
																	item.href && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
																		type: "button",
																		className: "ml-auto text-primary hover:underline",
																		"data-testid": "notification-open",
																		onClick: () => {
																			markRead.mutate(item.id);
																			onOpenChange(false);
																			navigate(item.href);
																		},
																		children: "Open"
																	})
																]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "row-actions flex flex-col gap-1",
														children: [!item.read && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															"aria-label": "Mark as read",
															"data-testid": "notification-mark-read",
															className: "rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground",
															onClick: () => markRead.mutate(item.id),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckCheck, { className: "h-3.5 w-3.5" })
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
															type: "button",
															"aria-label": "Dismiss",
															"data-testid": "notification-dismiss",
															className: "rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground",
															onClick: () => clear.mutate(item.id),
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
														})]
													})
												]
											})
										}, item.id);
									})
								})]
							}, day))
						]
					})
				})
			]
		})
	});
}
var ACTIONS = [
	{
		label: "Enroll student",
		to: "/students?new=1",
		icon: UserPlus,
		permission: "students.manage",
		testId: "quick-create-student"
	},
	{
		label: "Add staff member",
		to: "/staff?new=1",
		icon: Users,
		permission: "staff.manage",
		testId: "quick-create-staff"
	},
	{
		label: "Write a notice",
		to: "/notices/new",
		icon: Megaphone,
		permission: "notices.manage",
		testId: "quick-create-notice"
	},
	{
		label: "Schedule an event",
		to: "/events?new=1",
		icon: CalendarPlus,
		permission: "events.manage",
		testId: "quick-create-event"
	},
	{
		label: "Create gallery album",
		to: "/gallery?new=1",
		icon: ImagePlus,
		permission: "gallery.manage",
		testId: "quick-create-album"
	},
	{
		label: "Import students (CSV)",
		to: "/students?import=1",
		icon: CloudUpload,
		permission: "students.manage",
		testId: "quick-create-import"
	}
];
function QuickCreate() {
	const navigate = useNavigate();
	const { can } = useAuth();
	const available = ACTIONS.filter((action) => can(action.permission));
	if (!available.length) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
		asChild: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
			size: "sm",
			className: "gap-1.5",
			"data-testid": "quick-create-trigger",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-4 w-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "hidden sm:inline",
				children: "Create"
			})]
		})
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
		align: "end",
		className: "w-64 bg-popover",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
				className: "text-xs",
				children: "Quick create"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
			available.map((action, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
				"data-testid": action.testId,
				onClick: () => navigate(action.to),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, { className: "mr-2 h-4 w-4 text-muted-foreground" }),
					action.label,
					index < 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuShortcut, { children: ["⌘", index + 1] })
				]
			}, action.to))
		]
	})] });
}
function Topbar({ onOpenMobileNav, onOpenPalette, onToggleSidebar }) {
	const { user, signOut } = useAuth();
	const { theme, setTheme } = z();
	const navigate = useNavigate();
	const location = useLocation();
	const [notificationsOpen, setNotificationsOpen] = (0, import_react.useState)(false);
	const [branchId, setBranchId] = (0, import_react.useState)("branch_main");
	const { data: unread = 0 } = useQuery({
		queryKey: ["notifications", "unread"],
		queryFn: unreadCount,
		refetchInterval: 2e4
	});
	const { data: branches = [] } = useQuery({
		queryKey: ["branches"],
		queryFn: listBranches
	});
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	const segments = location.pathname.split("/").filter(Boolean);
	const rootTitle = ROUTE_TITLES[segments[0] === "admin" ? segments[1] ?? "overview" : segments[0] ?? "overview"] ?? "Overview";
	const activeBranch = branches.find((b) => b.id === branchId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
		className: "sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-background px-3 sm:px-4 lg:px-6",
		"data-testid": "app-topbar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "lg:hidden",
				"aria-label": "Open navigation",
				"data-testid": "mobile-nav-trigger",
				onClick: onOpenMobileNav,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "icon",
				className: "hidden lg:inline-flex",
				"aria-label": "Toggle sidebar",
				"data-testid": "topbar-sidebar-toggle",
				onClick: onToggleSidebar,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelsTopLeft, { className: "h-4 w-4" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
				"aria-label": "Breadcrumb",
				className: "hidden min-w-0 items-center gap-1.5 text-sm md:flex",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/admin/overview",
						className: "text-muted-foreground transition-colors hover:text-foreground",
						children: "EEBSS"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate font-medium text-foreground",
						"data-testid": "breadcrumb-current",
						children: rootTitle
					}),
					segments[2] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "max-w-[220px] truncate text-muted-foreground",
						children: "Detail"
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mx-auto hidden w-full max-w-md sm:block",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: onOpenPalette,
					"data-testid": "global-search-trigger",
					className: "flex w-full items-center gap-2 rounded-md border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-ring",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1 text-left",
							children: "Search students, staff, notices…"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("kbd", {
							className: "hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground lg:inline-block",
							children: "⌘K"
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						className: "sm:hidden",
						"aria-label": "Search",
						"data-testid": "global-search-trigger-mobile",
						onClick: onOpenPalette,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickCreate, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "ghost",
							size: "sm",
							className: "hidden gap-2 text-xs font-medium xl:inline-flex",
							"data-testid": "branch-switcher",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Building2, { className: "h-3.5 w-3.5 text-muted-foreground" }), activeBranch?.name ?? "All campuses"]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-64 bg-popover",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
								className: "text-xs text-foreground",
								children: "School context"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							branches.map((branch) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": `branch-option-${branch.id}`,
								onClick: () => setBranchId(branch.id),
								className: "flex items-start gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: `mt-0.5 h-3.5 w-3.5 ${branch.id === branchId ? "opacity-100" : "opacity-0"} text-primary` }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-sm text-foreground",
									children: branch.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "block text-xs text-muted-foreground",
									children: [
										branch.code,
										" · ",
										branch.studentCount,
										" students"
									]
								})] })]
							}, branch.id))
						]
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Notifications",
						"data-testid": "notifications-trigger",
						className: "relative",
						onClick: () => setNotificationsOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "h-4 w-4" }), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground",
							"data-testid": "notifications-unread-count",
							children: unread
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						"aria-label": "Toggle theme",
						"data-testid": "theme-toggle",
						onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
						children: mounted && theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							className: "ml-1 flex items-center gap-2 rounded-md p-0.5 pr-2 transition-colors hover:bg-muted focus-ring",
							"data-testid": "profile-menu-trigger",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: user?.avatarUrl,
								alt: "",
								className: "h-7 w-7 rounded-full border border-border"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "hidden text-left lg:block",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-xs font-medium leading-tight text-foreground",
									children: user?.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block text-[11px] leading-tight text-muted-foreground",
									children: user ? ROLE_LABEL[user.role] : ""
								})]
							})]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
						align: "end",
						className: "w-60 bg-popover",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-sm text-foreground",
								children: user?.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "block text-xs font-normal text-muted-foreground",
								children: user?.email
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": "profile-menu-account",
								onClick: () => navigate({
									to: "/admin/settings",
									search: { tab: "school" }
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(User, { className: "mr-2 h-4 w-4" }), " Account & profile"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": "profile-menu-settings",
								onClick: () => navigate({ to: "/admin/settings" }),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings, { className: "mr-2 h-4 w-4" }), " School settings"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								"data-testid": "profile-menu-signout",
								className: "text-primary focus:text-primary",
								onClick: () => {
									signOut();
									navigate("/login", { replace: true });
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "mr-2 h-4 w-4" }), " Sign out"]
							})
						]
					})] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NotificationCenter, {
				open: notificationsOpen,
				onOpenChange: setNotificationsOpen
			})
		]
	});
}
/**
* Global search across the entities an administrator actually looks for.
* Backed by the local store today; the shape matches a `/api/search` response.
*/
async function globalSearch(term, limitPerType = 4) {
	await latency(140);
	const needle = term.trim().toLowerCase();
	if (needle.length < 1) return [];
	const results = [];
	const hit = (haystack) => haystack.toLowerCase().includes(needle);
	db().students.filter((s) => hit(`${s.firstName} ${s.lastName} ${s.admissionNo} ${s.guardian.name}`)).slice(0, limitPerType).forEach((s) => results.push({
		id: s.id,
		type: "student",
		title: `${s.firstName} ${s.lastName}`,
		subtitle: `${s.admissionNo} · ${s.grade} · ${s.section}`,
		href: `/students/${s.id}`,
		avatarUrl: s.avatarUrl
	}));
	db().staff.filter((s) => hit(`${s.firstName} ${s.lastName} ${s.employeeId} ${s.designation} ${s.department}`)).slice(0, limitPerType).forEach((s) => results.push({
		id: s.id,
		type: "staff",
		title: `${s.firstName} ${s.lastName}`,
		subtitle: `${s.designation} · ${s.department}`,
		href: `/staff/${s.id}`,
		avatarUrl: s.avatarUrl
	}));
	db().notices.filter((n) => hit(`${n.title} ${n.summary}`)).slice(0, limitPerType).forEach((n) => results.push({
		id: n.id,
		type: "notice",
		title: n.title,
		subtitle: `${n.status} · ${n.priority} priority`,
		href: `/notices/${n.id}`
	}));
	db().events.filter((e) => hit(`${e.title} ${e.location} ${e.category}`)).slice(0, limitPerType).forEach((e) => results.push({
		id: e.id,
		type: "event",
		title: e.title,
		subtitle: `${e.category} · ${e.startDate}`,
		href: `/events/${e.id}`
	}));
	db().classes.filter((c) => hit(`${c.name} ${c.roomNo}`)).slice(0, limitPerType).forEach((c) => results.push({
		id: c.id,
		type: "class",
		title: c.name,
		subtitle: `Room ${c.roomNo} · ${c.studentCount} students`,
		href: `/classes/${c.id}`
	}));
	db().courses.filter((c) => hit(`${c.name} ${c.code} ${c.department}`)).slice(0, limitPerType).forEach((c) => results.push({
		id: c.id,
		type: "course",
		title: c.name,
		subtitle: `${c.code} · ${c.department}`,
		href: `/courses/${c.id}`
	}));
	db().websitePages.filter((p) => hit(`${p.title} ${p.path}`)).slice(0, limitPerType).forEach((p) => results.push({
		id: p.id,
		type: "page",
		title: `${p.title} page`,
		subtitle: `Website · ${p.status}`,
		href: `/website?page=${p.key}`
	}));
	db().applications.filter((a) => hit(`${a.applicantName} ${a.applicationNo}`)).slice(0, limitPerType).forEach((a) => results.push({
		id: a.id,
		type: "application",
		title: a.applicantName,
		subtitle: `${a.applicationNo} · ${a.status}`,
		href: `/admissions/${a.id}`,
		avatarUrl: a.avatarUrl
	}));
	return results;
}
var TYPE_ICON = {
	student: Users,
	staff: UserCheck,
	notice: Megaphone,
	event: CalendarDays,
	class: GalleryVerticalEnd,
	course: Library,
	page: Globe,
	application: GraduationCap
};
var TYPE_LABEL = {
	student: "Students",
	staff: "Staff",
	notice: "Notices",
	event: "Events",
	class: "Classes",
	course: "Subjects",
	page: "Website pages",
	application: "Applications"
};
function CommandPalette({ open, onOpenChange }) {
	const navigate = useNavigate();
	const { can } = useAuth();
	const { theme, setTheme } = z();
	const [term, setTerm] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) setTerm("");
	}, [open]);
	const { data: results = [], isFetching } = useQuery({
		queryKey: ["search", term],
		queryFn: () => globalSearch(term),
		enabled: open && term.trim().length > 0
	});
	const go = (to) => {
		onOpenChange(false);
		navigate(to);
	};
	const navItems = NAV_GROUPS.flatMap((group) => group.items).filter((item) => can(item.permission)).filter((item) => !term || item.label.toLowerCase().includes(term.toLowerCase()));
	const grouped = results.reduce((acc, result) => {
		acc[result.type] = acc[result.type] ? [...acc[result.type], result] : [result];
		return acc;
	}, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-w-2xl overflow-hidden border-hairline bg-popover p-0 shadow-pop",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
				className: "sr-only",
				children: "Command palette"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Command$1, {
				shouldFilter: false,
				className: "bg-popover",
				"data-testid": "command-palette",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandInput, {
					autoFocus: true,
					value: term,
					onValueChange: setTerm,
					placeholder: "Search students, staff, notices, events, classes, pages…",
					"data-testid": "command-palette-input"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandList, {
					className: "max-h-[420px]",
					children: [
						term && !isFetching && results.length === 0 && navItems.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandEmpty, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "px-4 py-6 text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "mx-auto mb-2 h-5 w-5 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-sm font-medium text-foreground",
									children: [
										"No matches for “",
										term,
										"”"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-xs text-muted-foreground",
									children: "Try an admission number, staff name or notice title."
								})
							]
						}) }),
						Object.entries(grouped).map(([type, items]) => {
							const Icon = TYPE_ICON[type];
							return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
								heading: TYPE_LABEL[type],
								children: items.map((result) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
									value: `${result.type}-${result.id}`,
									onSelect: () => go(result.href),
									"data-testid": "command-palette-result",
									className: "gap-3",
									children: [result.avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: result.avatarUrl,
										alt: "",
										className: "h-6 w-6 rounded-full border border-hairline"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid h-6 w-6 place-items-center rounded-md bg-secondary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-3.5 w-3.5 text-muted-foreground" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm text-foreground",
											children: result.title
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-xs text-muted-foreground",
											children: result.subtitle
										})]
									})]
								}, `${result.type}-${result.id}`))
							}, type);
						}),
						results.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandGroup, {
							heading: "Navigate",
							children: navItems.slice(0, term ? 5 : 16).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
								value: `nav-${item.label}`,
								onSelect: () => go(item.to),
								"data-testid": "command-palette-nav-item",
								className: "gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-sm",
									children: item.label
								})]
							}, item.to))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandGroup, {
							heading: "Actions",
							children: [
								can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
									value: "action-new-student",
									onSelect: () => go("/students?new=1"),
									className: "gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Enroll a new student"
									})]
								}),
								can("notices.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
									value: "action-new-notice",
									onSelect: () => go("/notices/new"),
									className: "gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Megaphone, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Write a notice"
									})]
								}),
								can("attendance.mark") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
									value: "action-attendance",
									onSelect: () => go("/attendance"),
									className: "gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm",
										children: "Mark today's attendance"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CommandItem, {
									value: "action-theme",
									onSelect: () => {
										setTheme(theme === "dark" ? "light" : "dark");
										onOpenChange(false);
									},
									className: "gap-3",
									"data-testid": "command-palette-theme",
									children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "h-4 w-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "h-4 w-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-sm",
										children: [
											"Switch to ",
											theme === "dark" ? "light" : "dark",
											" theme"
										]
									})]
								})
							]
						})
					]
				})]
			})]
		})
	});
}
var COLLAPSE_KEY = "scms.sidebar.collapsed";
function AdminShell() {
	const location = useLocation();
	useNavigate();
	const [collapsed, setCollapsed] = (0, import_react.useState)(() => {
		if (typeof window === "undefined") return false;
		return window.localStorage.getItem(COLLAPSE_KEY) === "1";
	});
	const [mobileOpen, setMobileOpen] = (0, import_react.useState)(false);
	const [paletteOpen, setPaletteOpen] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
	}, [collapsed]);
	(0, import_react.useEffect)(() => {
		setMobileOpen(false);
	}, [location.pathname, location.search]);
	(0, import_react.useEffect)(() => {
		const onKey = (event) => {
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
				event.preventDefault();
				setPaletteOpen((open) => !open);
			}
			if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "b") {
				event.preventDefault();
				setCollapsed((value) => !value);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TooltipProvider, {
		delayDuration: 120,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-h-screen bg-background",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: `hidden shrink-0 transition-[width] duration-240 ease-standard lg:block ${collapsed ? "w-[72px]" : "w-[272px]"}`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: `fixed bottom-0 top-0 z-30 ${collapsed ? "w-[72px]" : "w-[272px]"} transition-[width] duration-240 ease-standard`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
							collapsed,
							onToggle: () => setCollapsed((v) => !v)
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
					open: mobileOpen,
					onOpenChange: setMobileOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
						side: "left",
						className: "w-[288px] border-border bg-sidebar p-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sidebar, {
							collapsed: false,
							mobile: true,
							onNavigate: () => setMobileOpen(false)
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex min-w-0 flex-1 flex-col",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Topbar, {
						onOpenMobileNav: () => setMobileOpen(true),
						onOpenPalette: () => setPaletteOpen(true),
						onToggleSidebar: () => setCollapsed((v) => !v)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
						className: "min-w-0 flex-1",
						"data-testid": "app-main",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "animate-rise-in px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
						}, location.pathname)
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CommandPalette, {
					open: paletteOpen,
					onOpenChange: setPaletteOpen
				})
			]
		})
	});
}
var SplitComponent = AdminShell;
//#endregion
export { SplitComponent as component };
