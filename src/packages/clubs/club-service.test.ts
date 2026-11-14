import { beforeEach, describe, expect, it, vi } from "vitest";

const prismaMock = vi.hoisted(() => {
	const tx = {
		clubRole: {
			deleteMany: vi.fn(),
			update: vi.fn(),
			create: vi.fn(),
		},
	};
	return {
		clubRole: {
			findMany: vi.fn(),
			findUnique: vi.fn(),
		},
		clubMember: { findFirst: vi.fn() },
		userRole: { findMany: vi.fn() },
		post: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
		postComment: { create: vi.fn() },
		$transaction: vi.fn(async (callback: (client: typeof tx) => unknown) =>
			callback(tx),
		),
		tx,
	};
});

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));

const { ClubAccessError, setClubRoles, updateClubPost } = await import(
	"./club-service.ts"
);

/** A signed-in author with no club role and no permission grants. */
function noClubAccess() {
	prismaMock.clubMember.findFirst.mockResolvedValue(null);
	prismaMock.clubRole.findMany.mockResolvedValue([]);
	prismaMock.userRole.findMany.mockResolvedValue([]);
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe("setClubRoles", () => {
	it("refuses to delete a role that still has members assigned", async () => {
		prismaMock.clubRole.findMany
			// the guard query: role 'Officer' is being dropped but holds a member
			.mockResolvedValueOnce([
				{
					id: "role-officer",
					name: "Officer",
					members: [{ id: "member-1" }],
				},
				{ id: "role-president", name: "President", members: [] },
			]);

		await expect(
			setClubRoles("club-1", [
				{
					id: "role-president",
					name: "President",
					permissions: ["members.manage"],
				},
			]),
		).rejects.toThrow(/Officer still has members assigned/);

		expect(prismaMock.$transaction).not.toHaveBeenCalled();
	});

	it("writes every role inside one transaction so a failure rolls back", async () => {
		prismaMock.clubRole.findMany
			.mockResolvedValueOnce([]) // guard query: no roles exist yet
			.mockResolvedValueOnce([{ id: "role-1", name: "President" }]); // final read
		prismaMock.tx.clubRole.create.mockRejectedValue(new Error("db down"));

		await expect(
			setClubRoles("club-1", [
				{ name: "President", permissions: ["members.manage"] },
			]),
		).rejects.toThrow("db down");

		expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
		expect(prismaMock.tx.clubRole.deleteMany).toHaveBeenCalledWith({
			where: { clubId: "club-1", id: { notIn: [] } },
		});
		// Only the transaction client may mutate roles.
		expect(prismaMock.tx.clubRole.create).toHaveBeenCalledTimes(1);
	});
});

describe("updateClubPost pinning", () => {
	it("rejects a pin change from the author who lacks posts.pin", async () => {
		prismaMock.post.findUnique.mockResolvedValue({
			id: "post-1",
			clubId: "club-1",
			authorId: "user-1",
			title: "Old title",
			body: "Old body",
			isPinned: false,
		});
		noClubAccess();

		await expect(
			updateClubPost("post-1", "user-1", { isPinned: true }),
		).rejects.toBeInstanceOf(ClubAccessError);

		// The old behaviour reported success while writing nothing.
		expect(prismaMock.post.update).not.toHaveBeenCalled();
	});

	it("allows a pin-only change for a non-author holding posts.pin", async () => {
		prismaMock.post.findUnique.mockResolvedValue({
			id: "post-1",
			clubId: "club-1",
			authorId: "author-2",
			title: "Old title",
			body: "Old body",
			isPinned: false,
		});
		prismaMock.clubMember.findFirst.mockResolvedValue(null);
		// A role assigned directly to the acting user grants only posts.pin.
		prismaMock.clubRole.findMany.mockResolvedValue([
			{ name: "Moderator", permissions: "posts.pin", sortOrder: 0 },
		]);
		prismaMock.userRole.findMany.mockResolvedValue([]);
		prismaMock.post.update.mockResolvedValue({ id: "post-1", isPinned: true });

		await updateClubPost("post-1", "user-3", { isPinned: true });

		expect(prismaMock.post.update).toHaveBeenCalledWith({
			where: { id: "post-1" },
			data: { isPinned: true },
		});
	});

	it("still rejects title edits from a user who only holds posts.pin", async () => {
		prismaMock.post.findUnique.mockResolvedValue({
			id: "post-1",
			clubId: "club-1",
			authorId: "author-2",
			title: "Old title",
			body: "Old body",
			isPinned: false,
		});
		prismaMock.clubMember.findFirst.mockResolvedValue(null);
		prismaMock.clubRole.findMany.mockResolvedValue([
			{ name: "Moderator", permissions: "posts.pin", sortOrder: 0 },
		]);
		prismaMock.userRole.findMany.mockResolvedValue([]);

		await expect(
			updateClubPost("post-1", "user-3", { title: "Hijacked" }),
		).rejects.toThrow(/Only the author or a club officer can edit this post/);
	});
});
