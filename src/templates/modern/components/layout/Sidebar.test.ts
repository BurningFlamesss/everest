// @vitest-environment jsdom
import {
	act,
	cleanup,
	fireEvent,
	render,
	screen,
} from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";

let currentPathname = "/";
let mockUser: {
	id: string;
	name: string;
	email: string;
	role: string;
	title: string;
} | null = null;

vi.mock("@tanstack/react-router", () => ({
	Link: ({
		children,
		to,
		...props
	}: {
		children?: React.ReactNode;
		to?: string;
		[key: string]: unknown;
	}) => React.createElement("a", { href: to, ...props }, children),
	useRouterState: ({
		select,
	}: {
		select: (state: { location: { pathname: string } }) => unknown;
	}) => select({ location: { pathname: currentPathname } }),
}));

vi.mock("#/packages/auth/auth-client.ts", () => ({
	authClient: {
		useSession: () => ({ data: mockUser ? { user: mockUser } : null }),
	},
}));

vi.mock("#/providers/AuthProvider", () => ({
	useAuth: () => ({ user: mockUser, can: () => false, signOut: vi.fn() }),
}));

vi.mock("#/packages/school/hook.tsx", () => ({
	useSchoolContent: () => ({
		sidebar: {
			tagline: "Test School",
			collapsible: {
				about: { id: "1", label: "About", href: "/about" },
			},
		},
	}),
}));

vi.mock("motion/react", () => ({
	AnimatePresence: ({ children }: { children?: React.ReactNode }) =>
		React.createElement(React.Fragment, null, children),
	motion: {
		div: ({
			children,
			...props
		}: {
			children?: React.ReactNode;
			[key: string]: unknown;
		}) => React.createElement("div", props, children),
		nav: ({
			children,
			...props
		}: {
			children?: React.ReactNode;
			[key: string]: unknown;
		}) => React.createElement("nav", props, children),
		ul: ({
			children,
			...props
		}: {
			children?: React.ReactNode;
			[key: string]: unknown;
		}) => React.createElement("ul", props, children),
	},
	useReducedMotion: () => false,
}));

describe("Sidebar pin & hero-section scroll behavior", () => {
	let heroTrackEl: HTMLDivElement;

	beforeEach(() => {
		currentPathname = "/";
		mockUser = null;
		window.scrollY = 0;
		delete document.documentElement.dataset.navHeld;

		// Mock hero-track in DOM: height 6000px, window innerHeight 1000px
		// heroEnd = 0 + 6000 - 1000 = 5000px
		window.innerHeight = 1000;
		heroTrackEl = document.createElement("div");
		heroTrackEl.id = "hero-track";
		Object.defineProperty(heroTrackEl, "offsetHeight", {
			configurable: true,
			value: 6000,
		});
		heroTrackEl.getBoundingClientRect = () =>
			({
				top: -window.scrollY,
				bottom: 6000 - window.scrollY,
				left: 0,
				right: 1000,
				width: 1000,
				height: 6000,
			}) as DOMRect;
		document.body.appendChild(heroTrackEl);
	});

	afterEach(() => {
		cleanup();
		if (heroTrackEl?.parentNode) {
			heroTrackEl.parentNode.removeChild(heroTrackEl);
		}
		delete document.documentElement.dataset.navHeld;
	});

	it("starts open at scrollY=0, then collapses when scrolling past 50px without pin", () => {
		const { container } = render(React.createElement(Sidebar));
		const aside = container.querySelector("aside");

		// Initially open at scrollY <= 50
		expect(aside?.className).toContain("translate-x-0");
		expect(document.documentElement.dataset.navHeld).toBeUndefined();

		// Scroll to 100px (still in hero, but unpinned default collapses)
		act(() => {
			window.scrollY = 100;
			window.dispatchEvent(new Event("scroll"));
		});

		expect(aside?.className).toContain("-translate-x-full");
		expect(document.documentElement.dataset.navHeld).toBeUndefined();
	});

	it("pins sidebar ONLY till heroEnd when explicitly opened mid-hero", () => {
		const { container } = render(React.createElement(Sidebar));
		const aside = container.querySelector("aside");
		const toggleBtn = screen.getByTestId("nav-collapse-toggle");

		// 1. Initial scroll to 200px collapses sidebar
		act(() => {
			window.scrollY = 200;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("-translate-x-full");

		// 2. User explicitly opens sidebar mid-hero
		act(() => {
			fireEvent.click(toggleBtn);
		});

		expect(aside?.className).toContain("translate-x-0");
		// navHeld should be true to pause hero auto-play
		expect(document.documentElement.dataset.navHeld).toBe("true");

		// 3. User scrolls further within the hero auto-scroll section (e.g. 2500px, 4500px)
		act(() => {
			window.scrollY = 2500;
			window.dispatchEvent(new Event("scroll"));
		});
		// Should STAY OPEN (pinned till heroEnd)
		expect(aside?.className).toContain("translate-x-0");
		expect(document.documentElement.dataset.navHeld).toBe("true");

		act(() => {
			window.scrollY = 5000; // exactly heroEnd
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("translate-x-0");

		// 4. User scrolls past heroEnd (e.g. 5050px)
		act(() => {
			window.scrollY = 5050;
			window.dispatchEvent(new Event("scroll"));
		});

		// Must COLLAPSE now that the auto-scroll section is passed
		expect(aside?.className).toContain("-translate-x-full");
		// navHeld should be cleared
		expect(document.documentElement.dataset.navHeld).toBeUndefined();

		// 5. Subsequent scrolling down in the page stays collapsed
		act(() => {
			window.scrollY = 6000;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("-translate-x-full");
	});

	it("pin button permanently locks sidebar open across the whole page", () => {
		const { container } = render(React.createElement(Sidebar));
		const aside = container.querySelector("aside");
		const pinBtn = screen.getByTestId("nav-pin-toggle");

		// Scroll past heroEnd
		act(() => {
			window.scrollY = 5500;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("-translate-x-full");

		// User clicks Pin button
		act(() => {
			fireEvent.click(pinBtn);
		});

		expect(aside?.className).toContain("translate-x-0");
		expect(pinBtn.getAttribute("aria-pressed")).toBe("true");

		// Scrolling everywhere keeps it open
		act(() => {
			window.scrollY = 7000;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("translate-x-0");

		// User clicks Pin button to unpin
		act(() => {
			fireEvent.click(pinBtn);
		});

		// Immediately collapses because scrollY > 50 and past hero
		expect(aside?.className).toContain("-translate-x-full");
		expect(pinBtn.getAttribute("aria-pressed")).toBe("false");
	});

	it("closing sidebar manually clears hero-pinned state and resumes hero autoplay", () => {
		const { container } = render(React.createElement(Sidebar));
		const aside = container.querySelector("aside");
		const toggleBtn = screen.getByTestId("nav-collapse-toggle");

		// Scroll to 300px
		act(() => {
			window.scrollY = 300;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("-translate-x-full");

		// Explicitly open
		act(() => {
			fireEvent.click(toggleBtn);
		});
		expect(aside?.className).toContain("translate-x-0");
		expect(document.documentElement.dataset.navHeld).toBe("true");

		// Explicitly close before heroEnd
		act(() => {
			fireEvent.click(toggleBtn);
		});
		expect(aside?.className).toContain("-translate-x-full");
		expect(document.documentElement.dataset.navHeld).toBeUndefined();

		// Scrolling continues within hero -> stays closed
		act(() => {
			window.scrollY = 800;
			window.dispatchEvent(new Event("scroll"));
		});
		expect(aside?.className).toContain("-translate-x-full");
	});

	it("prevents sidebar from collapsing while mouse is over sidebar and prevents window scroll", () => {
		const { container } = render(React.createElement(Sidebar));
		const aside = container.querySelector("aside");
		expect(aside).not.toBeNull();
		if (!aside) return;

		// Put mouse in sidebar
		act(() => {
			fireEvent.mouseEnter(aside);
		});

		// Window scroll event fires
		act(() => {
			window.scrollY = 300;
			window.dispatchEvent(new Event("scroll"));
		});

		// Sidebar MUST NOT collapse while mouse is inside
		expect(aside.className).toContain("translate-x-0");

		// Wheel event on aside has preventDefault called
		const wheelEvent = new WheelEvent("wheel", {
			deltaY: 50,
			cancelable: true,
		});
		aside.dispatchEvent(wheelEvent);
		expect(wheelEvent.defaultPrevented).toBe(true);

		// Mouse leaves sidebar -> now it evaluates collapse
		act(() => {
			fireEvent.mouseLeave(aside);
		});
		expect(aside.className).toContain("-translate-x-full");
	});

	it("shows Login when unauthenticated, and shows Admin Panel & portal routes when admin logs in", () => {
		// 1. Unauthenticated
		const { unmount } = render(React.createElement(Sidebar));
		const loginBtn = screen.getByTestId("sidebar-login-btn");
		expect(loginBtn.getAttribute("href")).toBe("/login");
		expect(screen.queryByText("Admin Panel")).toBeNull();
		expect(screen.queryByText("My Portal")).toBeNull();
		unmount();

		// 2. Admin logged in
		mockUser = {
			id: "1",
			name: "Principal",
			email: "principal@school.test",
			role: "admin",
			title: "Principal",
		};
		render(React.createElement(Sidebar));

		const adminBtn = screen.getByTestId("sidebar-admin-panel-btn");
		expect(adminBtn.getAttribute("href")).toBe("/admin");
		expect(screen.getByText("My Portal")).toBeDefined();
		expect(screen.getByText("Dashboard")).toBeDefined();
		expect(screen.getByText("Notifications")).toBeDefined();
	});

	it("shows My Dashboard when student/guardian logs in", () => {
		mockUser = {
			id: "2",
			name: "Student John",
			email: "john@school.test",
			role: "student",
			title: "Student",
		};
		render(React.createElement(Sidebar));

		const dashboardBtn = screen.getByTestId("sidebar-dashboard-btn");
		expect(dashboardBtn.getAttribute("href")).toBe("/dashboard");
		expect(screen.getByText("My Portal")).toBeDefined();
		expect(screen.queryByText("Admin Panel")).toBeNull();
	});
});
