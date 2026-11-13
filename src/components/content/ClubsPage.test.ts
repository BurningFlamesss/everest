// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const route = vi.hoisted(() => ({
	component: (() => null) as React.ComponentType,
	useLoaderData: vi.fn(),
}));

const router = vi.hoisted(() => ({
	invalidate: vi.fn(),
}));

const clubServer = vi.hoisted(() => ({
	getAllMyClubAccessFn: vi.fn(),
	getClubBoardFn: vi.fn(),
	createClubPostAction: vi.fn(),
	updateClubPostAction: vi.fn(),
	deleteClubPostAction: vi.fn(),
	createPostCommentAction: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
	createFileRoute: () => (options: { component: React.ComponentType }) => {
		route.component = options.component;
		return { useLoaderData: route.useLoaderData };
	},
	useSearch: () => ({}),
	useRouter: () => ({ invalidate: router.invalidate }),
}));

vi.mock("#/packages/content/server.ts", () => ({
	getClubsFn: vi.fn(),
}));

vi.mock("#/packages/clubs/server.ts", () => ({
	getAllMyClubAccessFn: clubServer.getAllMyClubAccessFn,
	getClubBoardFn: clubServer.getClubBoardFn,
	createClubPostAction: clubServer.createClubPostAction,
	updateClubPostAction: clubServer.updateClubPostAction,
	deleteClubPostAction: clubServer.deleteClubPostAction,
	createPostCommentAction: clubServer.createPostCommentAction,
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
	slug: "science-club",
	name: "Science Club",
	description: "Explore science through hands-on experiments.",
	meetingSchedule: "Wednesdays after school",
	coverImage: null,
	roles: [],
	members: [],
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

const post = {
	id: "post-1",
	title: "Science fair prep",
	body: "Bring your project sketches to Friday's meeting.",
	isPinned: false,
	createdAt: new Date().toISOString(),
	authorId: "user-1",
	author: { id: "user-1", name: "Deepa Sharma", image: null },
	authorStudent: null,
	comments: [
		{
			id: "comment-1",
			body: "I will bring mine.",
			createdAt: new Date().toISOString(),
			author: { id: "user-2", name: "Ramesh Thapa", image: null },
		},
	],
};

function loaderData(overrides: Record<string, unknown> = {}) {
	return {
		clubs: [club],
		userId: null,
		accessBySlug: {},
		postsBySlug: {},
		previewPage: null,
		...overrides,
	};
}

const memberAccess = {
	canCreatePosts: false,
	canEditAnyPost: false,
	canPinPosts: false,
	canManageMembers: false,
	roleName: "Member",
	isMember: true,
};

beforeEach(() => {
	route.useLoaderData.mockReset();
	route.useLoaderData.mockReturnValue(loaderData());
	router.invalidate.mockReset();
	clubServer.getAllMyClubAccessFn.mockReset();
	clubServer.getClubBoardFn.mockReset();
	clubServer.createClubPostAction.mockReset();
	clubServer.updateClubPostAction.mockReset();
	clubServer.deleteClubPostAction.mockReset();
	clubServer.createPostCommentAction.mockReset();
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
		route.useLoaderData.mockReturnValue(
			loaderData({
				clubs: [
					{
						...club,
						attachments: [
							{ ...attachment, fileAsset: { ...attachment.fileAsset, size } },
						],
					},
				],
			}),
		);

		render(React.createElement(route.component));

		const link = screen.getByRole("link", { name: /^Club handbook\s*1 KB$/ });
		expect(within(link).getByText("1 KB")).toBeTruthy();
		expect(screen.queryByText("0 KB")).toBeNull();
	});

	it("renders a club without an attachment section when it has no attachments", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({ clubs: [{ ...club, attachments: [] }] }),
		);

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
		route.useLoaderData.mockReturnValue(loaderData({ clubs: [] }));

		render(React.createElement(route.component));

		expect(screen.getByRole("heading", { name: "Clubs" })).toBeTruthy();
		expect(
			screen.getByText("Club information will be published soon."),
		).toBeTruthy();
		expect(screen.queryByRole("article")).toBeNull();
		expect(screen.queryByRole("heading", { name: "Attachments" })).toBeNull();
		expect(screen.queryByRole("link")).toBeNull();
	});

	it("renders feed posts with author, relative time and comment count", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({ postsBySlug: { "science-club": [post] } }),
		);

		render(React.createElement(route.component));

		expect(screen.getByText(post.title)).toBeTruthy();
		expect(screen.getByText(post.body)).toBeTruthy();
		expect(screen.getByText("Deepa Sharma")).toBeTruthy();
		expect(screen.getByText("just now")).toBeTruthy();
		expect(screen.getByText("1")).toBeTruthy();
		expect(screen.queryByTestId("club-composer-science-club")).toBeNull();
	});

	it("marks pinned posts with a pinned badge", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				postsBySlug: { "science-club": [{ ...post, isPinned: true }] },
			}),
		);

		render(React.createElement(route.component));

		expect(screen.getByText("Pinned")).toBeTruthy();
		expect(screen.getByTitle("Pinned post")).toBeTruthy();
	});

	it("shows an empty feed note when a club has no posts", () => {
		render(React.createElement(route.component));

		expect(screen.getByRole("heading", { name: "Club feed" })).toBeTruthy();
		expect(screen.getByText("No posts yet.")).toBeTruthy();
	});

	it("hides the composer from plain members without posts.create", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				accessBySlug: {
					"science-club": {
						canCreatePosts: false,
						canEditAnyPost: false,
						canPinPosts: false,
						canManageMembers: false,
						roleName: "Member",
						isMember: true,
					},
				},
			}),
		);

		render(React.createElement(route.component));

		const roleLine = screen.getByText(
			(_, element) =>
				element?.textContent ===
				"Your role: Member · publishing is limited to club officers",
		);
		expect(roleLine).toBeTruthy();
		expect(screen.queryByRole("button", { name: "Publish" })).toBeNull();
		expect(screen.queryByLabelText("Post title")).toBeNull();
	});

	it("shows the composer to a role with posts.create and publishes a post", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				accessBySlug: {
					"science-club": {
						canCreatePosts: true,
						canEditAnyPost: false,
						canPinPosts: false,
						canManageMembers: false,
						roleName: "Secretary",
						isMember: true,
					},
				},
			}),
		);
		clubServer.createClubPostAction.mockResolvedValue({
			success: true,
			post: { id: "post-2" },
		});

		render(React.createElement(route.component));

		const composer = screen.getByTestId("club-composer-science-club");
		const titleInput = within(composer).getByLabelText("Post title");
		const bodyInput = within(composer).getByLabelText("Post body");

		expect(
			screen.getByText(
				(_, element) =>
					element?.textContent ===
					"Your role: Secretary · you can publish to this feed",
			),
		).toBeTruthy();
		// No pin permission means no pin toggle.
		expect(within(composer).queryByText("Pin to top")).toBeNull();

		fireEvent.change(titleInput, { target: { value: "Meeting moved" } });
		fireEvent.change(bodyInput, {
			target: { value: "We meet Thursday this week." },
		});
		fireEvent.click(within(composer).getByRole("button", { name: "Publish" }));

		await vi.waitFor(() => {
			expect(clubServer.createClubPostAction).toHaveBeenCalledWith({
				data: {
					slug: "science-club",
					title: "Meeting moved",
					body: "We meet Thursday this week.",
					isPinned: false,
				},
			});
		});
		await vi.waitFor(() => {
			expect(router.invalidate).toHaveBeenCalled();
		});
		await vi.waitFor(() => {
			expect(screen.getByText("Published.")).toBeTruthy();
		});
		expect((titleInput as HTMLInputElement).value).toBe("");
		expect((bodyInput as HTMLTextAreaElement).value).toBe("");
	});

	it("shows the pin toggle only to a role with posts.pin and forwards the flag", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				accessBySlug: {
					"science-club": {
						canCreatePosts: true,
						canEditAnyPost: true,
						canPinPosts: true,
						canManageMembers: true,
						roleName: "President",
						isMember: true,
					},
				},
			}),
		);
		clubServer.createClubPostAction.mockResolvedValue({
			success: true,
			post: { id: "post-3" },
		});

		render(React.createElement(route.component));

		const composer = screen.getByTestId("club-composer-science-club");
		const pinToggle = within(composer).getByText("Pin to top");
		fireEvent.click(pinToggle);

		fireEvent.change(within(composer).getByLabelText("Post title"), {
			target: { value: "Big announcement" },
		});
		fireEvent.change(within(composer).getByLabelText("Post body"), {
			target: { value: "Fest next month!" },
		});
		fireEvent.click(within(composer).getByRole("button", { name: "Publish" }));

		await vi.waitFor(() => {
			expect(clubServer.createClubPostAction).toHaveBeenCalledWith({
				data: {
					slug: "science-club",
					title: "Big announcement",
					body: "Fest next month!",
					isPinned: true,
				},
			});
		});
	});

	it("shows the action error inline when publishing fails", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				accessBySlug: {
					"science-club": {
						canCreatePosts: true,
						canEditAnyPost: false,
						canPinPosts: false,
						canManageMembers: false,
						roleName: "Secretary",
						isMember: true,
					},
				},
			}),
		);
		clubServer.createClubPostAction.mockResolvedValue({
			success: false,
			error: "Your club role does not allow publishing posts.",
		});

		render(React.createElement(route.component));

		const composer = screen.getByTestId("club-composer-science-club");
		fireEvent.change(within(composer).getByLabelText("Post title"), {
			target: { value: "Draft" },
		});
		fireEvent.change(within(composer).getByLabelText("Post body"), {
			target: { value: "Body" },
		});
		fireEvent.click(within(composer).getByRole("button", { name: "Publish" }));

		await vi.waitFor(() => {
			expect(
				screen.getByTestId("club-composer-error-science-club"),
			).toBeTruthy();
		});
		expect(
			screen.getByText("Your club role does not allow publishing posts."),
		).toBeTruthy();
		expect(router.invalidate).not.toHaveBeenCalled();
	});

	it("lets the author edit their own post and saves the trimmed draft", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-1",
				postsBySlug: { "science-club": [post] },
			}),
		);
		clubServer.updateClubPostAction.mockResolvedValue({ success: true });

		render(React.createElement(route.component));

		fireEvent.click(screen.getByRole("button", { name: "Edit post" }));

		const form = screen.getByTestId("club-post-edit-post-1");
		const titleInput = within(form).getByLabelText("Edit post title");
		const bodyInput = within(form).getByLabelText("Edit post body");
		expect((titleInput as HTMLInputElement).value).toBe(post.title);
		expect((bodyInput as HTMLTextAreaElement).value).toBe(post.body);

		fireEvent.change(titleInput, { target: { value: "  Science fair sign-up  " } });
		fireEvent.change(bodyInput, {
			target: { value: "Sketches are due Thursday." },
		});
		fireEvent.click(
			within(form).getByRole("button", { name: "Save changes" }),
		);

		await vi.waitFor(() => {
			expect(clubServer.updateClubPostAction).toHaveBeenCalledWith({
				data: {
					postId: "post-1",
					title: "Science fair sign-up",
					body: "Sketches are due Thursday.",
				},
			});
		});
		await vi.waitFor(() => {
			expect(router.invalidate).toHaveBeenCalled();
		});
		await vi.waitFor(() => {
			expect(screen.queryByTestId("club-post-edit-post-1")).toBeNull();
		});
	});

	it("hides edit and delete from a plain member who is not the author", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-2",
				accessBySlug: { "science-club": memberAccess },
				postsBySlug: { "science-club": [post] },
			}),
		);

		render(React.createElement(route.component));

		expect(screen.queryByRole("button", { name: "Edit post" })).toBeNull();
		expect(screen.queryByRole("button", { name: "Delete post" })).toBeNull();
	});

	it("shows edit and delete to a role with posts.editAny", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-2",
				accessBySlug: {
					"science-club": {
						...memberAccess,
						canEditAnyPost: true,
						roleName: "President",
					},
				},
				postsBySlug: { "science-club": [post] },
			}),
		);

		render(React.createElement(route.component));

		expect(screen.getByRole("button", { name: "Edit post" })).toBeTruthy();
		expect(screen.getByRole("button", { name: "Delete post" })).toBeTruthy();
	});

	it("toggles a post's pinned flag through updateClubPostAction", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-2",
				accessBySlug: {
					"science-club": { ...memberAccess, canPinPosts: true },
				},
				postsBySlug: { "science-club": [post] },
			}),
		);
		clubServer.updateClubPostAction.mockResolvedValue({ success: true });

		render(React.createElement(route.component));

		fireEvent.click(screen.getByTitle("Pin post"));

		await vi.waitFor(() => {
			expect(clubServer.updateClubPostAction).toHaveBeenCalledWith({
				data: { postId: "post-1", isPinned: true },
			});
		});
		await vi.waitFor(() => {
			expect(router.invalidate).toHaveBeenCalled();
		});
	});

	it("deletes a post only after the confirm dialog is accepted", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-1",
				postsBySlug: { "science-club": [post] },
			}),
		);
		clubServer.deleteClubPostAction.mockResolvedValue({ success: true });
		const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);

		render(React.createElement(route.component));

		fireEvent.click(screen.getByRole("button", { name: "Delete post" }));
		expect(clubServer.deleteClubPostAction).not.toHaveBeenCalled();

		confirm.mockReturnValue(true);
		fireEvent.click(screen.getByRole("button", { name: "Delete post" }));

		await vi.waitFor(() => {
			expect(clubServer.deleteClubPostAction).toHaveBeenCalledWith({
				data: { postId: "post-1" },
			});
		});
		await vi.waitFor(() => {
			expect(router.invalidate).toHaveBeenCalled();
		});
		confirm.mockRestore();
	});

	it("expands a post's comments and posts a new comment as a signed-in user", async () => {
		route.useLoaderData.mockReturnValue(
			loaderData({
				userId: "user-2",
				postsBySlug: { "science-club": [post] },
			}),
		);
		clubServer.createPostCommentAction.mockResolvedValue({ success: true });

		render(React.createElement(route.component));

		expect(screen.queryByTestId("club-comments-post-1")).toBeNull();

		fireEvent.click(screen.getByTestId("club-post-comments-toggle-post-1"));

		const panel = screen.getByTestId("club-comments-post-1");
		expect(within(panel).getByText("Ramesh Thapa")).toBeTruthy();
		expect(within(panel).getByText("I will bring mine.")).toBeTruthy();

		fireEvent.change(within(panel).getByLabelText("Comment"), {
			target: { value: "  Count me in.  " },
		});
		fireEvent.click(within(panel).getByRole("button", { name: "Comment" }));

		await vi.waitFor(() => {
			expect(clubServer.createPostCommentAction).toHaveBeenCalledWith({
				data: { postId: "post-1", body: "Count me in." },
			});
		});
		await vi.waitFor(() => {
			expect(router.invalidate).toHaveBeenCalled();
		});
	});

	it("asks anonymous visitors to sign in instead of showing the comment form", () => {
		route.useLoaderData.mockReturnValue(
			loaderData({ postsBySlug: { "science-club": [post] } }),
		);

		render(React.createElement(route.component));

		fireEvent.click(screen.getByTestId("club-post-comments-toggle-post-1"));

		const panel = screen.getByTestId("club-comments-post-1");
		expect(
			within(panel).getByText("Sign in to join the conversation."),
		).toBeTruthy();
		expect(within(panel).queryByLabelText("Comment")).toBeNull();
	});
});
