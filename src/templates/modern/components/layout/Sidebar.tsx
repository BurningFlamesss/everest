import { Link, useRouterState } from "@tanstack/react-router";
import {
	ChevronRight,
	LayoutDashboard,
	Menu,
	Pin,
	PinOff,
	X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils";
import { authClient } from "#/packages/auth/auth-client.ts";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import type { ItemDetail } from "#/types/school";

const SIDEBAR_W = 240;

function setNavWidth(open: boolean) {
	document.documentElement.style.setProperty(
		"--nav-w",
		open ? `${SIDEBAR_W}px` : "0px",
	);
}

function SidebarItem({
	item,
	pathname,
}: {
	item: ItemDetail;
	pathname: string;
}) {
	const isActive = item.href
		? pathname === item.href || pathname.startsWith(`${item.href}/`)
		: false;
	const [isOpen, setIsOpen] = useState(isActive);
	const hasChildren = item.children && item.children.length > 0;

	// Check if any child is active to auto-expand
	useEffect(() => {
		if (
			hasChildren &&
			item.children?.some(
				(c) =>
					c.href && (pathname === c.href || pathname.startsWith(`${c.href}/`)),
			)
		) {
			setIsOpen(true);
		}
	}, [pathname, hasChildren, item.children]);

	if (!hasChildren) {
		return (
			<li>
				<Link
					to={item.href ?? "/"}
					target={item.external ? "_blank" : undefined}
					className={cn(
						"relative flex min-h-11 items-center w-full gap-2.5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
					)}
				>
					<span className="sr-only">{isActive ? "(current page) " : ""}</span>
					<span
						aria-hidden="true"
						className={cn(
							"absolute inset-y-0 left-0 w-[3px] bg-[#EAB308]",
							isActive ? "" : "hidden",
						)}
					/>
					<span>{item.label}</span>
				</Link>
			</li>
		);
	}

	return (
		<li>
			<div className="flex items-center w-full transition-colors">
				{item.href ? (
					<Link
						to={item.href}
						className={cn(
							"flex min-h-11 flex-1 px-4 py-2 text-sm font-medium text-left text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
						)}
					>
						{item.label}
					</Link>
				) : (
					<button
						type="button"
						onClick={() => setIsOpen((s) => !s)}
						className={cn(
							"flex min-h-11 flex-1 cursor-pointer px-4 py-2 text-sm font-medium text-left text-white transition-colors bg-transparent border-none hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
						)}
					>
						{item.label}
					</button>
				)}
				<button
					type="button"
					onClick={() => setIsOpen((s) => !s)}
					aria-expanded={isOpen}
					className="flex min-h-11 min-w-11 cursor-pointer items-center px-3 py-2 text-white bg-transparent border-none hover:text-[#EAB308] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
				>
					<ChevronRight
						size={16}
						className={cn(
							"shrink-0 transition-transform duration-300",
							isOpen ? "rotate-90" : "",
						)}
					/>
				</button>
			</div>

			<AnimatePresence initial={false}>
				{isOpen && (
					<motion.ul
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="overflow-hidden ml-6 pl-2 border-l border-white/20 mt-1 space-y-1 flex flex-col"
					>
						{item.children?.map((child) => (
							<SidebarItem key={child.id} item={child} pathname={pathname} />
						))}
					</motion.ul>
				)}
			</AnimatePresence>
		</li>
	);
}

export function getHeroEnd(): number {
	if (typeof window === "undefined") return 0;
	// @ts-expect-error ScrollTrigger may be registered on window
	const st = window.ScrollTrigger?.getById?.("hero-scroll");
	if (st && typeof st.end === "number") {
		return st.end;
	}
	const el = document.getElementById("hero-track");
	if (el) {
		const top = el.getBoundingClientRect().top + window.scrollY;
		return Math.max(0, top + el.offsetHeight - window.innerHeight);
	}
	return window.innerHeight * 5;
}

const POST_LOGIN_ITEMS: ItemDetail[] = [
	{
		id: "dashboard",
		label: "Dashboard",
		href: "/dashboard",
	},
	{
		id: "my_portal",
		label: "My Records & Classes",
		children: [
			{ id: "my_records", label: "Overview & Records", href: "/my-records" },
			{ id: "my_classes", label: "My Classes", href: "/my-classes" },
			{ id: "my_homework", label: "Homework", href: "/my-homework" },
			{ id: "my_results", label: "Exam Results", href: "/my-results" },
			{ id: "my_fees", label: "Fees & Dues", href: "/my-fees" },
		],
	},
	{
		id: "notifications",
		label: "Notifications",
		href: "/notifications",
	},
];

export function Sidebar() {
	const { data } = authClient.useSession();
	const { sidebar } = useSchoolContent();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const reduced = useReducedMotion();

	const user = data?.user as
		| { id?: string; name?: string; email?: string; role?: string }
		| undefined;

	const isLoggedIn = Boolean(user || data?.session?.id);
	const isAdminUser = Boolean(
		user &&
			(user.role === "admin" ||
				user.role === "super_admin" ||
				user.role === "staff" ||
				user.role?.toUpperCase() === "ADMIN" ||
				user.role?.toUpperCase() === "SUPERADMIN" ||
				user.role?.toUpperCase() === "STAFF"),
	);

	const isAdmin = pathname.startsWith("/admin");

	const [isOpen, setIsOpen] = useState(() => pathname === "/");
	const [pinned, setPinned] = useState(false);
	// When the sidebar auto-collapses on scroll on the landing page, and the
	// visitor explicitly re-opens it while inside the auto-scrolling hero
	// section, heroPinned keeps the sidebar open (pinned) ONLY until the
	// auto-scrolling hero section completes (scrollY <= heroEnd).
	// Once the visitor scrolls past the hero, auto-collapse resumes and the
	// sidebar collapses (unless pinned with the pin button).
	const [heroPinned, setHeroPinned] = useState(false);
	const [sheetOpen, setSheetOpen] = useState(false);

	const asideRef = useRef<HTMLElement | null>(null);
	const navRef = useRef<HTMLElement | null>(null);
	const isHovered = useRef(false);

	useEffect(() => {
		const aside = asideRef.current;
		if (!aside) return;

		const onWheel = (e: WheelEvent) => {
			// Prevent the main website from scrolling while mouse is in the sidebar
			e.stopPropagation();
			e.preventDefault();

			if (navRef.current) {
				navRef.current.scrollTop += e.deltaY;
			}
		};

		aside.addEventListener("wheel", onWheel, { passive: false });
		return () => aside.removeEventListener("wheel", onWheel);
	}, []);

	useEffect(() => {
		if (pathname !== "/") return;

		const onScroll = () => {
			// If user has their mouse in the sidebar, keep it open and do not collapse
			if (isHovered.current) {
				setIsOpen(true);
				return;
			}

			const scrollY = window.scrollY;

			// If explicitly locked open with the Pin toggle, stay open everywhere.
			if (pinned) {
				setIsOpen(true);
				return;
			}

			// If explicitly opened while in the auto-scrolling hero section:
			if (heroPinned) {
				const heroEnd = getHeroEnd();
				if (scrollY > heroEnd) {
					// Scrolled past the auto-scroll section: collapse and release hero pin.
					setHeroPinned(false);
					setIsOpen(false);
				} else {
					setIsOpen(true);
				}
				return;
			}

			// Default unpinned behavior: open only at the very top (<= 50px).
			setIsOpen(scrollY <= 50);
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, [pinned, heroPinned, pathname]);

	// Hold the hero auto-play while the visitor has explicitly opened the
	// navigation during the hero sequence or pinned it open, so the video
	// does not keep advancing underneath the menu they stopped to read.
	useEffect(() => {
		if (heroPinned || (pinned && isOpen)) {
			document.documentElement.dataset.navHeld = "true";
		} else {
			delete document.documentElement.dataset.navHeld;
		}
		return () => {
			delete document.documentElement.dataset.navHeld;
		};
	}, [heroPinned, pinned, isOpen]);

	useEffect(() => {
		if (pathname === "/") setIsOpen(true);
	}, [pathname]);

	useEffect(() => setNavWidth(isOpen), [isOpen]);

	useEffect(() => {
		if (!sheetOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSheetOpen(false);
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [sheetOpen]);

	// The admin console renders its own shell (AdminShell with an admin
	// sidebar + topbar), so the public red sidebar must not stack on top of
	// it on /admin routes. All hooks are declared above, so this early
	// return is safe.
	if (isAdmin) return null;

	const logoMark = (
		<img
			src={"/schools/everest/logo.png"}
			alt="School logo"
			className="h-16 object-contain"
		/>
	);

	const navFooter = isLoggedIn ? (
		<div className="flex flex-col gap-2 p-3 bg-primary border-t border-white/10">
			{isAdminUser ? (
				<Link
					to="/admin"
					data-testid="sidebar-admin-panel-btn"
					className="bg-[#EAB308] flex min-h-11 w-full items-center justify-center gap-2 rounded py-2.5 px-3 cursor-pointer text-black font-semibold text-sm hover:bg-[#EAB308]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors shadow-sm"
				>
					<LayoutDashboard className="h-4 w-4" />
					<span>Admin Panel</span>
				</Link>
			) : (
				<Link
					to="/dashboard"
					data-testid="sidebar-dashboard-btn"
					className="bg-[#EAB308] flex min-h-11 w-full items-center justify-center gap-2 rounded py-2.5 px-3 cursor-pointer text-black font-semibold text-sm hover:bg-[#EAB308]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors shadow-sm"
				>
					<LayoutDashboard className="h-4 w-4" />
					<span>My Dashboard</span>
				</Link>
			)}
		</div>
	) : (
		<Link
			to="/login"
			data-testid="sidebar-login-btn"
			className="bg-[#EAB308] flex min-h-11 w-full items-center justify-center py-2.5 cursor-pointer text-black font-semibold hover:bg-[#EAB308]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white transition-colors"
		>
			Login
		</Link>
	);

	const navLinks = (
		<ul className="space-y-1 mt-4">
			{sidebar?.collapsible &&
				Object.values(sidebar.collapsible).map((item) => (
					<SidebarItem key={item.id} item={item} pathname={pathname} />
				))}

			{isLoggedIn && (
				<>
					<li className="pt-3 pb-1 px-4">
						<div className="h-px bg-white/20 mb-2" />
						<span className="text-[10px] font-bold uppercase tracking-wider text-[#EAB308]">
							My Portal
						</span>
					</li>
					{POST_LOGIN_ITEMS.map((item) => (
						<SidebarItem key={item.id} item={item} pathname={pathname} />
					))}
				</>
			)}
		</ul>
	);

	return (
		<>
			{/* ── Desktop sidebar panel: fixed left edge ── */}
			<aside
				ref={asideRef}
				onMouseEnter={() => {
					isHovered.current = true;
				}}
				onMouseLeave={() => {
					isHovered.current = false;
					if (pathname === "/" && !pinned) {
						const scrollY = window.scrollY;
						const heroEnd = getHeroEnd();
						if (heroPinned && scrollY > heroEnd) {
							setHeroPinned(false);
							setIsOpen(false);
						} else if (!heroPinned && scrollY > 50) {
							setIsOpen(false);
						}
					}
				}}
				className={cn(
					"fixed top-0 left-0 z-nav hidden h-screen w-60 flex-col justify-between bg-primary shadow-xl transition-transform duration-500 overscroll-contain lg:flex",
					isOpen ? "translate-x-0" : "-translate-x-full invisible",
				)}
			>
				<header className="flex flex-col items-center justify-center text-primary-foreground">
					<Link
						to="/"
						className="flex min-h-11 items-center gap-3 p-4"
						data-testid="nav-home"
					>
						{logoMark}
					</Link>
				</header>

				<nav
					ref={navRef}
					aria-label="Main"
					className="min-h-0 flex-1 overflow-auto overscroll-contain text-primary-foreground"
				>
					{navLinks}
				</nav>

				<footer className="bg-primary">{navFooter}</footer>
			</aside>

			{/* ── Desktop controls: fixed right edge ── */}
			<div className="fixed top-4 right-4 z-nav hidden flex-col items-center gap-2 rounded-full bg-primary/95 backdrop-blur-sm p-1.5 shadow-lg lg:flex">
				<button
					type="button"
					onClick={() => {
						if (isOpen) {
							// User explicitly closes navigation
							setIsOpen(false);
							setHeroPinned(false);
							if (pinned) setPinned(false);
						} else {
							// User explicitly opens navigation
							setIsOpen(true);
							if (pathname === "/") {
								const scrollY = window.scrollY;
								const heroEnd = getHeroEnd();
								if (scrollY <= heroEnd) {
									setHeroPinned(true);
								}
							}
						}
					}}
					aria-expanded={isOpen}
					aria-label={isOpen ? "Close navigation" : "Open navigation"}
					title={isOpen ? "Close navigation" : "Open navigation"}
					data-testid="nav-collapse-toggle"
					className="inline-flex size-11 border-none cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
				>
					<Menu aria-hidden="true" size={18} />
				</button>

				<button
					type="button"
					onClick={() => {
						setPinned((prev) => {
							const next = !prev;
							if (next) {
								setIsOpen(true);
							} else {
								// When explicitly unpinning, clear hero-pinned state and collapse if scrolled
								setHeroPinned(false);
								if (pathname === "/") {
									const scrollY = window.scrollY;
									if (scrollY > 50) {
										setIsOpen(false);
									}
								}
							}
							return next;
						});
					}}
					aria-pressed={pinned}
					aria-label={pinned ? "Unlock sidebar" : "Lock sidebar open"}
					title={pinned ? "Auto-collapse: OFF" : "Lock open"}
					data-testid="nav-pin-toggle"
					className={cn(
						"inline-flex size-11 border-none cursor-pointer items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white",
						pinned
							? "bg-white text-black"
							: "bg-white/10 text-white hover:bg-white/30",
					)}
				>
					{pinned ? (
						<Pin aria-hidden="true" size={16} />
					) : (
						<PinOff aria-hidden="true" size={16} />
					)}
				</button>
			</div>

			{/* ── Mobile top bar ── */}
			<div className="fixed inset-x-0 top-0 z-nav flex h-topbar items-center justify-between bg-primary px-4 lg:hidden">
				<Link
					to="/"
					className="flex min-h-11 min-w-0 items-center gap-3"
					data-testid="nav-home-mobile"
				>
					<img
						src="/schools/everest/logo.png"
						alt="School logo"
						className="h-8 object-contain"
					/>
					<span className="truncate text-[15px] font-semibold text-primary-foreground">
						{sidebar?.tagline}
					</span>
				</Link>
				<button
					type="button"
					onClick={() => setSheetOpen(true)}
					aria-expanded={sheetOpen}
					aria-controls="sidebar-nav-panel"
					data-testid="nav-mobile-trigger"
					className="inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground"
				>
					<Menu aria-hidden="true" size={20} />
					<span className="sr-only">Open the main menu</span>
				</button>
			</div>

			{/* ── Mobile sheet ── */}
			<AnimatePresence>
				{sheetOpen && (
					<motion.div
						className="fixed inset-0 z-overlay lg:hidden"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						<button
							type="button"
							tabIndex={-1}
							aria-label="Close the main menu"
							data-testid="nav-mobile-scrim"
							className="absolute inset-0 border-none bg-black/60"
							onClick={() => setSheetOpen(false)}
						/>
						<motion.nav
							aria-label="Main"
							id="sidebar-nav-panel"
							data-testid="nav-mobile-sheet"
							className="absolute inset-x-0 bottom-0 top-8 flex flex-col rounded-t-3xl bg-primary"
							initial={reduced ? { opacity: 0 } : { y: "100%" }}
							animate={reduced ? { opacity: 1 } : { y: 0 }}
							exit={reduced ? { opacity: 0 } : { y: "100%" }}
							transition={{ duration: 0.3 }}
						>
							<div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-white/10">
								<img
									src="/schools/everest/logo.png"
									alt="School logo"
									className="h-16 w-full object-contain"
								/>
								<button
									type="button"
									onClick={() => setSheetOpen(false)}
									data-testid="nav-mobile-close"
									className="absolute right-4 top-4 inline-flex size-11 border-none bg-transparent items-center justify-center rounded-lg text-primary-foreground"
								>
									<X aria-hidden="true" size={20} />
									<span className="sr-only">Close the main menu</span>
								</button>
							</div>
							<div className="flex-1 overflow-y-auto px-4 py-4 text-primary-foreground">
								<nav aria-label="Main">{navLinks}</nav>
							</div>
							<div
								style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
								className="px-4"
							>
								{navFooter}
							</div>
						</motion.nav>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
