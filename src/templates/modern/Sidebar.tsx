import { Link, useNavigate } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	LayoutDashboard,
	LogIn,
	LogOut,
	UserPlus,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils.ts";
import { authClient } from "#/packages/auth/auth-client.ts";
import { useSchoolContent } from "#/packages/school/hook.tsx";
import type { ItemDetail } from "#/types/school.ts";

function Sidebar() {
	const { data } = authClient.useSession();
	const { sidebar } = useSchoolContent();
	const navigate = useNavigate();
	const [scrolled, setScrolled] = useState(false);
	const [isSidebarOpened, setIsSidebarOpened] = useState(true);
	const [isSigningOut, setIsSigningOut] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(scrollY > 50);

			if (scrollY > 50) {
				setIsSidebarOpened(false);
			} else {
				setIsSidebarOpened(true);
			}
		};

		window.addEventListener("scroll", handleScroll);
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, []);

	const handleSignOut = async () => {
		setIsSigningOut(true);

		try {
			await authClient.signOut();
			await navigate({ to: "/" });
		} finally {
			setIsSigningOut(false);
		}
	};

	return (
		<aside
			className={cn(
				"fixed z-50 my-4 mx-4 rounded-2xl h-[calc(100vh-32px)] w-60 transition-all duration-500",
				isSidebarOpened ? "" : "w-4",
				scrolled && isSidebarOpened ? "shadow-xl" : "",
			)}
		>
			<button
				type="button"
				aria-label={isSidebarOpened ? "Collapse navigation" : "Open navigation"}
				onClick={() => setIsSidebarOpened((state) => !state)}
				className={cn(
					"absolute right-0 top-1/2 translate-x-[30%] translate-y-[-50%] cursor-pointer rounded-full border border-primary bg-card",
				)}
			>
				<ChevronLeft
					width={18}
					height={18}
					className={cn(isSidebarOpened ? "" : "rotate-180")}
				/>
			</button>
			<section
				className={cn(
					"h-full flex flex-col justify-between overflow-hidden",
					isSidebarOpened ? "" : "hidden",
				)}
			>
				<header className="flex flex-col items-center justify-center rounded-t-2xl bg-sidebar text-sidebar-foreground">
					<Link to="/" className="p-4">
						<img
							src={sidebar.logo}
							alt="School logo"
							className="max-h-16 object-contain"
						/>
					</Link>
					<span className="w-full bg-sidebar-primary py-2 text-center text-sidebar-primary-foreground">
						{sidebar.tagline}
					</span>
				</header>

				<main className="min-h-0 flex-1 overflow-auto bg-sidebar text-sidebar-foreground">
					<ul>
						{Object.values(sidebar.collapsible)
							.filter((item): item is ItemDetail => Boolean(item))
							.map((item) => (
								<SidebarItem key={item.id} item={item} />
							))}
					</ul>
				</main>

				<footer className="rounded-b-2xl bg-sidebar text-sidebar-foreground">
					{data?.session ? (
						<>
							<Link
								to="/dashboard"
								className="flex w-full items-center justify-center gap-2 bg-sidebar-primary py-2 font-medium text-sidebar-primary-foreground"
							>
								<LayoutDashboard size={16} /> Dashboard
							</Link>
							<button
								type="button"
								onClick={handleSignOut}
								disabled={isSigningOut}
								className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-b-2xl bg-sidebar py-2 hover:bg-sidebar-accent disabled:opacity-60"
							>
								<LogOut size={16} />
								{isSigningOut ? "Signing out…" : "Sign out"}
							</button>
						</>
					) : (
						<>
							<Link
								to="/signup"
								className="flex w-full items-center justify-center gap-2 bg-sidebar-primary py-2 font-medium text-sidebar-primary-foreground"
							>
								<UserPlus size={16} /> Join / Invite
							</Link>
							<Link
								to="/login"
								className="flex w-full items-center justify-center gap-2 rounded-b-2xl bg-sidebar py-2 hover:bg-sidebar-accent"
							>
								<LogIn size={16} /> Login
							</Link>
						</>
					)}
				</footer>
			</section>
		</aside>
	);
}

export default Sidebar;

function SidebarItem({ item }: { item: ItemDetail }) {
	const [isOpen, setIsOpen] = useState(false);
	const hasChildren = item.children && item.children.length > 0;

	if (!hasChildren) {
		return (
			<li>
				<Link
					to={item.href ?? "/"}
					target={item.external ? "_blank" : undefined}
					className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent"
					activeProps={{ className: "bg-sidebar-primary font-semibold" }}
				>
					<span>{item.label}</span>
				</Link>
			</li>
		);
	}

	return (
		<li>
			<button
				type="button"
				onClick={() => setIsOpen((state) => !state)}
				className="flex w-full items-center gap-2.5 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent"
			>
				<span className="flex-1 text-left">{item.label}</span>
				<ChevronRight
					size={16}
					className={cn(
						"shrink-0 transition-transform duration-300",
						isOpen ? "rotate-90" : "",
					)}
				/>
			</button>

			{isOpen && (
				<ul className="rounded-lg overflow-hidden">
					{item.children?.map((child) => (
						<SidebarItem key={child.id} item={child} />
					))}
				</ul>
			)}
		</li>
	);
}
