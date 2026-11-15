import { Link } from "@tanstack/react-router";
import {
	BookOpen,
	Bus,
	CalendarDays,
	Clock3,
	FileSpreadsheet,
	FileText,
	GraduationCap,
	Inbox,
	Library,
	Mail,
	ShieldCheck,
	UserPlus,
	Users,
	Wallet,
} from "lucide-react";
import { cn } from "#/lib/utils";
import { NAV_GROUPS } from "./nav-config";

/**
 * Extra console destinations that are not in the primary navigation but were
 * previously reachable from the admin overview (legacy ScMS screens).
 */
const MORE_LINKS = [
	{ label: "Invitations", to: "/admin/invites", icon: UserPlus },
	{ label: "Directory", to: "/admin/directory", icon: Users },
	{ label: "Content", to: "/admin/content", icon: FileText },
	{ label: "Calendar", to: "/admin/calendar", icon: CalendarDays },
	{ label: "Timetable", to: "/admin/timetable", icon: Clock3 },
	{ label: "Exams", to: "/admin/exams", icon: FileSpreadsheet },
	{ label: "Fees", to: "/admin/fees", icon: Wallet },
	{ label: "Homework", to: "/admin/homework", icon: BookOpen },
	{ label: "Classes", to: "/admin/classes", icon: GraduationCap },
	{ label: "Courses", to: "/admin/courses", icon: Library },
	{ label: "Transport", to: "/admin/transport", icon: Bus },
	{ label: "Mail", to: "/admin/mail", icon: Mail },
	{ label: "Inbox", to: "/admin/inbox", icon: Inbox },
	{ label: "Permissions", to: "/admin/permissions", icon: ShieldCheck },
];

const LINK_CLASS =
	"flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-ring";

const GROUP_LABEL_CLASS =
	"text-[11px] font-semibold uppercase tracking-wider text-muted-foreground";

/** Grouped links to every admin surface, for the overview pages. */
export function AdminPageLinks({ className }: { className?: string }) {
	return (
		<div
			className={cn(
				"grid gap-x-8 gap-y-5 sm:grid-cols-2 xl:grid-cols-3",
				className,
			)}
			data-testid="admin-page-links"
		>
			{NAV_GROUPS.map((group) => (
				<div key={group.label}>
					<p className={GROUP_LABEL_CLASS}>{group.label}</p>
					<ul className="mt-2 space-y-0.5">
						{group.items.map((item) => (
							<li key={`${group.label}-${item.label}`}>
								<Link to={item.to} className={LINK_CLASS}>
									<item.icon className="h-4 w-4 shrink-0 text-accent-foreground" />
									<span className="truncate">{item.label}</span>
								</Link>
							</li>
						))}
					</ul>
				</div>
			))}

			<div>
				<p className={GROUP_LABEL_CLASS}>More tools</p>
				<ul className="mt-2 space-y-0.5">
					{MORE_LINKS.map((item) => (
						<li key={item.label}>
							<Link to={item.to} className={LINK_CLASS}>
								<item.icon className="h-4 w-4 shrink-0 text-accent-foreground" />
								<span className="truncate">{item.label}</span>
							</Link>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}
