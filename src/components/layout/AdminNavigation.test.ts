// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

const currentPathname = "/admin/overview";

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
	useNavigate: () => vi.fn(),
	useLocation: () => ({ pathname: currentPathname, search: "" }),
}));

vi.mock("@tanstack/react-query", () => ({
	useQuery: () => ({ data: undefined }),
	useQueryClient: () => ({ invalidateQueries: vi.fn(), setQueryData: vi.fn() }),
	useMutation: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock("#/providers/AuthProvider", () => ({
	useAuth: () => ({
		user: {
			id: "admin_1",
			name: "Admin User",
			email: "admin@eebss.edu.np",
			role: "admin",
			avatarUrl: "/avatar.png",
			title: "Administrator",
		},
		can: () => true,
		signOut: vi.fn(),
	}),
}));

vi.mock("#/services/overview", () => ({
	getOverview: vi.fn(),
}));

vi.mock("#/services/website", () => ({
	listBranches: vi.fn(),
}));

vi.mock("#/packages/notifications/server.ts", () => ({
	getUnreadNotificationCountFn: vi.fn(),
}));

describe("Admin Shell Public Website Links", () => {
	afterEach(() => {
		cleanup();
	});

	it("does not render a public-website link in the admin sidebar", () => {
		render(React.createElement(Sidebar, { collapsed: false }));
		expect(screen.queryByTestId("admin-goto-public")).toBeNull();
		expect(screen.queryByText("Public Website")).toBeNull();

		const logoLink = screen.getByTestId("admin-sidebar-logo").closest("a");
		expect(logoLink?.getAttribute("href")).toBe("/");
	});

	it("does not render the sidebar collapse toggle", () => {
		render(React.createElement(Sidebar, { collapsed: false }));
		expect(screen.queryByTestId("sidebar-collapse-toggle")).toBeNull();
	});

	it("does not mark Overview active on non-root admin routes", () => {
		render(React.createElement(Sidebar, { collapsed: false }));
		const overview = screen.getByTestId("nav-overview");
		expect(overview.className).not.toContain("before:absolute");
	});

	it("renders a link to the public website in the admin topbar", () => {
		render(
			React.createElement(Topbar, {
				onOpenMobileNav: vi.fn(),
				onOpenPalette: vi.fn(),
				onToggleSidebar: vi.fn(),
			}),
		);

		const publicBtn = screen.getByTestId("topbar-public-site-btn");
		expect(publicBtn.getAttribute("href")).toBe("/");
	});
});
