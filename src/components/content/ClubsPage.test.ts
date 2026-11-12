// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({
	component: (() => null) as React.ComponentType,
	useLoaderData: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: { component: React.ComponentType }) => {
		route.component = options.component;
		return { useLoaderData: route.useLoaderData };
	},
	useSearch: () => ({}),
}));

vi.mock("#/packages/content/server.ts", () => ({
	getClubsFn: vi.fn(),
}));

vi.mock("#/packages/clubs/server.ts", () => ({
	getAllMyClubAccessFn: vi.fn(),
}));

vi.mock("#/packages/content/server/content.ts", () => ({
	getWebsitePagePreviewServer: vi.fn(),
}));

vi.mock("#/packages/school/hook.tsx", () => ({
	useWebsitePageContent: () => null,
}));

// The page chrome pulls in framer-motion and the shared motion language; stub
// it with inert wrappers (keeping the header h1) so the test renders only the
// route markup.
vi.mock("#/templates/modern/components/chrome/PageFrame", async () => {
	const react = await import("react");
	type ReactNode = import("react").ReactNode;

	const PageFrame = ({ children }: { children: ReactNode }) =>
		react.createElement("div", null, children);

	const PageHeader = ({
		eyebrow,
		title,
		lead,
	}: {
		eyebrow: string;
		title: ReactNode;
		lead?: string;
	}) =>
		react.createElement(
			"header",
			null,
			react.createElement("p", null, eyebrow),
			react.createElement("h1", null, title),
			lead ? react.createElement("p", null, lead) : null,
		);

	const Section = ({
		children,
		className,
	}: {
		children: ReactNode;
		className?: string;
	}) => react.createElement("section", { className }, children);

	return { PageFrame, PageHeader, Section };
});

import "../../routes/_public/clubs.tsx";

const club = {
	id: "science-club",
	name: "Science Club",
	description: "Explore science through hands-on experiments.",
	meetingSchedule: "Wednesdays after school",
	coverImage: null,
	attachments: [
		{
			id: "handbook-attachment",
			label: "Club handbook",
			fileAsset: {
				url: "/uploads/science-handbook.pdf",
				originalName: "science-handbook.pdf",
				size: 4096,
			},
		},
		{
			id: "schedule-attachment",
			label: null,
			fileAsset: {
				url: "/uploads/science-schedule.csv",
				originalName: "science-schedule.csv",
				size: 256,
			},
		},
	],
};

beforeEach(() => {
	route.useLoaderData.mockReset();
	route.useLoaderData.mockReturnValue({
		clubs: [club],
		accessBySlug: {},
		previewPage: null,
	});
});

afterEach(() => {
	cleanup();
});

describe("ClubsPage", () => {
	it("renders attachment labels, filename fallbacks and safe new-tab file links", () => {
		render(React.createElement(route.component));

		expect(screen.getByRole("heading", { name: club.name })).toBeTruthy();
		expect(screen.getByText(club.description)).toBeTruthy();
		expect(screen.getByText(club.meetingSchedule)).toBeTruthy();
		expect(screen.getByRole("heading", { name: "Attachments" })).toBeTruthy();
		expect(screen.getAllByRole("link")).toHaveLength(2);

		const links = [
			screen.getByRole("link", { name: /^Club handbook\s*4 KB$/ }),
			screen.getByRole("link", { name: /^science-schedule\.csv\s*1 KB$/ }),
		];
		for (const [index, link] of links.entries()) {
			expect(link.getAttribute("href")).toBe(
				club.attachments[index].fileAsset.url,
			);
			expect(link.getAttribute("target")).toBe("_blank");
			expect(link.getAttribute("rel")?.split(/\s+/)).toContain("noreferrer");
		}
		expect(screen.queryByText("science-handbook.pdf")).toBeNull();
	});

	it.each([
		128, 512, 1024,
	])("displays at least 1 KB for a %i-byte attachment", (size) => {
		const attachment = club.attachments[0];
		route.useLoaderData.mockReturnValue({
			clubs: [
				{
					...club,
					attachments: [
						{ ...attachment, fileAsset: { ...attachment.fileAsset, size } },
					],
				},
			],
			accessBySlug: {},
			previewPage: null,
		});

		render(React.createElement(route.component));

		const link = screen.getByRole("link", { name: /^Club handbook\s*1 KB$/ });
		expect(within(link).getByText("1 KB")).toBeTruthy();
		expect(screen.queryByText("0 KB")).toBeNull();
	});

	it("renders a club without an attachment section when it has no attachments", () => {
		route.useLoaderData.mockReturnValue({
			clubs: [{ ...club, attachments: [] }],
			accessBySlug: {},
			previewPage: null,
		});

		render(React.createElement(route.component));

		expect(screen.getByRole("heading", { name: club.name })).toBeTruthy();
		expect(screen.getByText(club.description)).toBeTruthy();
		expect(screen.queryByRole("heading", { name: "Attachments" })).toBeNull();
		expect(screen.queryByRole("link")).toBeNull();
		expect(
			screen.queryByText("Club information will be published soon."),
		).toBeNull();
	});

	it("renders the empty state when there are no clubs", () => {
		route.useLoaderData.mockReturnValue({
			clubs: [],
			accessBySlug: {},
			previewPage: null,
		});

		render(React.createElement(route.component));

		expect(screen.getByRole("heading", { name: "Clubs" })).toBeTruthy();
		expect(
			screen.getByText("Club information will be published soon."),
		).toBeTruthy();
		expect(screen.queryByRole("article")).toBeNull();
		expect(screen.queryByRole("heading", { name: "Attachments" })).toBeNull();
		expect(screen.queryByRole("link")).toBeNull();
	});
});
