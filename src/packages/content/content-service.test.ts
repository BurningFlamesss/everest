import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
	createClub,
	deleteClub,
	listClubs,
	updateClub,
} from "./content-service.ts";

const prismaMock = vi.hoisted(() => ({
	club: {
		findFirst: vi.fn(),
		findUnique: vi.fn(),
		findMany: vi.fn(),
		create: vi.fn(),
		update: vi.fn(),
		delete: vi.fn(),
	},
	attachment: { deleteMany: vi.fn() },
	fileAsset: { delete: vi.fn(), deleteMany: vi.fn() },
}));

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));
vi.mock("#/packages/invite/invite-service.ts", () => ({
	slugify: (value: string) =>
		value
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-+|-+$/g, ""),
}));

const existingClub = {
	id: "club-1",
	name: "Robotics Club",
	slug: "robotics-club",
	description: "Build robots together",
	meetingSchedule: "Fridays",
	coverImage: null,
	isActive: true,
	organizationId: null,
	branchId: null,
};

const existingAttachment = {
	id: "attachment-1",
	clubId: existingClub.id,
	fileAssetId: "shared-handbook",
	label: "Club handbook",
	createdAt: new Date("2026-05-01T12:00:00.000Z"),
	fileAsset: {
		url: "/uploads/content/shared-handbook.pdf",
		originalName: "handbook.pdf",
		mimeType: "application/pdf",
		size: 2048,
	},
};

const attachmentInclude = {
	attachments: {
		select: {
			id: true,
			fileAssetId: true,
			label: true,
			fileAsset: {
				select: {
					url: true,
					originalName: true,
					mimeType: true,
					size: true,
				},
			},
		},
		orderBy: { createdAt: "asc" },
	},
	members: {
		orderBy: {
			createdAt: "asc",
		},
		select: {
			id: true,
			role: {
				select: {
					id: true,
					isBoard: true,
					name: true,
				},
			},
			student: {
				select: {
					grade: true,
					id: true,
					section: true,
					user: {
						select: {
							id: true,
							name: true,
						},
					},
				},
			},
		},
	},
	roles: {
		orderBy: {
			sortOrder: "asc",
		},
		select: {
			description: true,
			id: true,
			isBoard: true,
			name: true,
			permissions: true,
			sortOrder: true,
		},
	},
};

beforeEach(() => {
	vi.resetAllMocks();
	prismaMock.club.findFirst.mockResolvedValue(null);
	prismaMock.club.findUnique.mockResolvedValue(existingClub);
	prismaMock.club.findMany.mockResolvedValue([]);
	prismaMock.club.create.mockResolvedValue(existingClub);
	prismaMock.club.update.mockResolvedValue(existingClub);
	prismaMock.club.delete.mockResolvedValue(existingClub);
});

afterEach(() => {
	// File assets can be shared; CRUD must leave their deletion to orphan cleanup.
	expect(prismaMock.fileAsset.delete).not.toHaveBeenCalled();
	expect(prismaMock.fileAsset.deleteMany).not.toHaveBeenCalled();
});

describe("createClub attachments", () => {
	it("creates attachment links in input order with trimmed or null labels", async () => {
		const result = await createClub({
			name: "  Robotics Club  ",
			attachments: [
				{ fileAssetId: "shared-handbook", label: "  Club handbook  " },
				{ fileAssetId: "blank-label", label: " \t\n " },
				{ fileAssetId: "empty-label", label: "" },
				{ fileAssetId: "unlabeled" },
			],
		});

		expect(prismaMock.club.create).toHaveBeenCalledExactlyOnceWith({
			data: expect.objectContaining({
				name: "Robotics Club",
				slug: "robotics-club",
				attachments: {
					create: [
						{ fileAssetId: "shared-handbook", label: "Club handbook" },
						{ fileAssetId: "blank-label", label: null },
						{ fileAssetId: "empty-label", label: null },
						{ fileAssetId: "unlabeled", label: null },
					],
				},
			}),
		});
		expect(result).toBe(existingClub);
	});

	it.each([
		{ name: "omitted", input: { name: "Robotics Club" } },
		{ name: "empty", input: { name: "Robotics Club", attachments: [] } },
	])("creates a club with $name attachments", async ({ input }) => {
		await createClub(input);

		expect(prismaMock.club.create).toHaveBeenCalledOnce();
		expect(
			prismaMock.club.create.mock.calls[0][0].data.attachments,
		).toBeUndefined();
	});
});

describe("updateClub attachments", () => {
	it("replaces links using nested deleteMany and create, normalizing labels", async () => {
		const updatedClub = {
			...existingClub,
			attachments: [{ ...existingAttachment, fileAssetId: "replacement" }],
		};
		prismaMock.club.update.mockResolvedValue(updatedClub);

		const result = await updateClub(existingClub.id, {
			attachments: [
				{ fileAssetId: "replacement", label: "  New handbook  " },
				{ fileAssetId: "blank-label", label: " \t " },
				{ fileAssetId: "empty-label", label: "" },
				{ fileAssetId: "unlabeled" },
			],
		});

		expect(prismaMock.club.findUnique).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
		});
		expect(prismaMock.club.update).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
			data: {
				attachments: {
					deleteMany: {},
					create: [
						{ fileAssetId: "replacement", label: "New handbook" },
						{ fileAssetId: "blank-label", label: null },
						{ fileAssetId: "empty-label", label: null },
						{ fileAssetId: "unlabeled", label: null },
					],
				},
			},
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
		expect(result).toBe(updatedClub);
	});

	it("clears every attachment when explicitly given an empty array", async () => {
		await updateClub(existingClub.id, { attachments: [] });

		expect(prismaMock.club.update).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
			data: { attachments: { deleteMany: {}, create: [] } },
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
	});

	it("preserves existing attachments when another field is edited without attachments", async () => {
		await updateClub(existingClub.id, {
			description: "  Updated description  ",
		});

		expect(prismaMock.club.update).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
			data: { description: "Updated description" },
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
	});

	it("preserves existing attachments when attachments is explicitly undefined", async () => {
		await updateClub(existingClub.id, {
			meetingSchedule: "  Mondays  ",
			attachments: undefined,
		});

		expect(prismaMock.club.update).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
			data: { meetingSchedule: "Mondays" },
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
	});

	it.each([
		false,
		true,
	])("preserves attachment links on a partial isActive=%s toggle", async (isActive) => {
		prismaMock.club.findUnique.mockResolvedValue({
			...existingClub,
			isActive: !isActive,
		});

		await updateClub(existingClub.id, { isActive });

		expect(prismaMock.club.update).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
			data: { isActive },
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
	});

	it("rejects a missing club before changing links or assets", async () => {
		prismaMock.club.findUnique.mockResolvedValue(null);

		await expect(
			updateClub("missing-club", {
				attachments: [{ fileAssetId: "shared-handbook" }],
			}),
		).rejects.toThrow("CLUB_NOT_FOUND");

		expect(prismaMock.club.findUnique).toHaveBeenCalledExactlyOnceWith({
			where: { id: "missing-club" },
		});
		expect(prismaMock.club.update).not.toHaveBeenCalled();
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
	});
});

describe("listClubs attachments", () => {
	const searchWhere = {
		OR: [
			{ name: { contains: "robot", mode: "insensitive" } },
			{ description: { contains: "robot", mode: "insensitive" } },
		],
	};

	it.each([
		{
			name: "defaults to active clubs only",
			options: undefined,
			where: { isActive: true },
		},
		{
			name: "keeps the active-only filter for includeInactive=false",
			options: { includeInactive: false },
			where: { isActive: true },
		},
		{
			name: "includes inactive clubs when requested",
			options: { includeInactive: true },
			where: {},
		},
		{
			name: "combines active-only filtering with trimmed name/description search",
			options: { search: "  robot  " },
			where: { isActive: true, ...searchWhere },
		},
		{
			name: "searches active and inactive clubs when requested",
			options: { includeInactive: true, search: "  robot  " },
			where: searchWhere,
		},
		{
			name: "ignores whitespace-only search",
			options: { search: " \t " },
			where: { isActive: true },
		},
	])("$name and includes ordered attachment metadata", async ({
		options,
		where,
	}) => {
		await listClubs(options);

		expect(prismaMock.club.findMany).toHaveBeenCalledExactlyOnceWith({
			where,
			orderBy: { name: "asc" },
			include: attachmentInclude,
		});
	});

	it("returns fileAssetId for admin editing alongside labels and public file metadata", async () => {
		const clubs = [{ ...existingClub, attachments: [existingAttachment] }];
		prismaMock.club.findMany.mockResolvedValue(clubs);

		const result = await listClubs({ includeInactive: true });

		expect(prismaMock.club.findMany).toHaveBeenCalledWith({
			where: {},
			orderBy: { name: "asc" },
			include: attachmentInclude,
		});
		expect(result).toBe(clubs);
		expect(result[0].attachments[0]).toEqual(existingAttachment);
	});
});

describe("deleteClub attachments", () => {
	it("deletes only the club, relying on FK cascade for links and leaving shared file assets intact", async () => {
		const result = await deleteClub(existingClub.id);

		expect(prismaMock.club.delete).toHaveBeenCalledExactlyOnceWith({
			where: { id: existingClub.id },
		});
		expect(prismaMock.attachment.deleteMany).not.toHaveBeenCalled();
		expect(prismaMock.club.update).not.toHaveBeenCalled();
		expect(result).toBe(existingClub);
	});
});
