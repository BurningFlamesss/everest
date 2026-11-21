import {
	type ClubPermissionKey,
	parseClubPermissions,
} from "#/packages/clubs/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

/**
 * Club roles, membership and feed service.
 *
 * Permission model
 * ----------------
 * Each `ClubRole` (e.g. "President") carries a comma-separated permission
 * list. A signed-in user's effective permissions for a club are the union of:
 *
 *   1. Management staff (ADMIN/SUPERADMIN with MANAGE_CONTENT) get everything.
 *   2. Permissions of roles assigned directly to the user (staff patrons).
 *   3. Permissions of the role on their ClubMember row (students).
 *
 * A plain "Member" role with no permission keys can read the club but cannot
 * create posts — that is exactly the constraint requested.
 */

export interface ClubRoleInput {
	name: string;
	description?: string;
	permissions?: Array<ClubPermissionKey>;
	isBoard?: boolean;
	sortOrder?: number;
}

const DEFAULT_ROLE_TEMPLATE = [
	{
		name: "President",
		permissions: [
			"posts.create",
			"posts.editAny",
			"posts.pin",
			"members.manage",
		],
		description: "Leads the club and its feed.",
		isBoard: true,
		sortOrder: 0,
	},
	{
		name: "Vice President",
		permissions: ["posts.create", "posts.editAny"],
		description: "Supports the president and can publish.",
		isBoard: true,
		sortOrder: 1,
	},
	{
		name: "Secretary",
		permissions: ["posts.create"],
		description: "Writes club updates.",
		isBoard: true,
		sortOrder: 2,
	},
	{
		name: "Member",
		permissions: [],
		description: "Belongs to the club; cannot publish posts.",
		isBoard: false,
		sortOrder: 3,
	},
] satisfies Array<ClubRoleInput & { permissions: Array<ClubPermissionKey> }>;

/** Roles every new club starts with. Editable from the admin panel. */
export function defaultClubRoles(): Array<ClubRoleInput> {
	return DEFAULT_ROLE_TEMPLATE.map((role) => ({ ...role }));
}

export async function setClubRoles(
	clubId: string,
	roles: Array<ClubRoleInput & { id?: string }>,
) {
	const keepIds = new Set(
		roles.map((role) => role.id).filter((id): id is string => Boolean(id)),
	);

	// Reject duplicate role names up front — the schema enforces uniqueness per
	// club, so a duplicate would throw a raw Prisma error mid-save.
	const names = roles.map((role) => role.name.trim().toLowerCase());
	if (new Set(names).size !== names.length) {
		throw new ClubAccessError("Two roles cannot share the same name.");
	}

	// Deleting a role that still holds members would silently strip those
	// members of their standing (the relation is `onDelete: SetNull`); require
	// the editor to move them to another role first.
	const existing = await prisma.clubRole.findMany({
		where: { clubId },
		select: { id: true, name: true, members: { select: { id: true } } },
	});
	for (const role of existing) {
		if (keepIds.has(role.id)) continue;
		if (role.members.length > 0) {
			throw new ClubAccessError(
				`${role.name} still has members assigned. Move them to another role before deleting it.`,
			);
		}
	}

	// At least one remaining role must keep `members.manage`, otherwise the
	// club can no longer be managed without school-wide admin rights.
	const anyManager = roles.some((role) =>
		(role.permissions ?? []).includes("members.manage"),
	);
	if (!anyManager) {
		throw new ClubAccessError(
			"At least one role must keep the Manage members permission.",
		);
	}

	await prisma.$transaction(async (tx) => {
		// Roles removed from the payload are deleted; members drop to no role.
		await tx.clubRole.deleteMany({
			where: { clubId, id: { notIn: [...keepIds] } },
		});

		for (const [index, role] of roles.entries()) {
			const data = {
				name: role.name.trim(),
				description: role.description?.trim() || null,
				permissions: (role.permissions ?? []).join(","),
				isBoard: role.isBoard ?? false,
				sortOrder: role.sortOrder ?? index,
			};

			if (role.id) {
				await tx.clubRole.update({ where: { id: role.id }, data });
			} else {
				await tx.clubRole.create({ data: { ...data, clubId } });
			}
		}
	});

	return prisma.clubRole.findMany({
		where: { clubId },
		orderBy: { sortOrder: "asc" },
	});
}

export async function listClubRoles(clubId: string) {
	return prisma.clubRole.findMany({
		where: { clubId },
		orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
		include: {
			members: {
				select: {
					id: true,
					role: true,
					student: {
						select: {
							id: true,
							grade: true,
							section: true,
							rollNo: true,
							user: { select: { id: true, name: true } },
						},
					},
				},
			},
		},
	});
}

export async function upsertClubMember(
	clubId: string,
	studentId: string,
	roleId?: string | null,
) {
	return prisma.clubMember.upsert({
		where: { clubId_studentId: { clubId, studentId } },
		create: { clubId, studentId, roleId: roleId ?? null },
		update: { roleId: roleId ?? null },
		include: {
			role: true,
			student: {
				select: { user: { select: { id: true, name: true } } },
			},
		},
	});
}

export async function removeClubMember(clubId: string, studentId: string) {
	await prisma.clubMember.delete({
		where: { clubId_studentId: { clubId, studentId } },
	});
}

export interface ViewerClubAccess {
	/** True when the viewer may publish to this club's feed. */
	canCreatePosts: boolean;
	/** True when the viewer may edit/delete any post (not just their own). */
	canEditAnyPost: boolean;
	/** True when the viewer may pin posts. */
	canPinPosts: boolean;
	/** True when the viewer may manage members and roles. */
	canManageMembers: boolean;
	/** All permission keys the viewer holds for this club. */
	permissions: Set<string>;
	/** The viewer's role name in this club, if any. */
	roleName: string | null;
	/** True when the viewer is a member of this club. */
	isMember: boolean;
}

export const EMPTY_ACCESS: ViewerClubAccess = {
	canCreatePosts: false,
	canEditAnyPost: false,
	canPinPosts: false,
	canManageMembers: false,
	permissions: new Set<string>(),
	roleName: null,
	isMember: false,
};

/**
 * Resolve the effective club permissions for a signed-in user.
 *
 * Staff assigned directly to a club role (e.g. a teacher patron) and students
 * with a membership role both contribute permissions; management staff with
 * MANAGE_CONTENT implicitly hold every permission.
 */
export async function resolveClubAccess(
	clubId: string,
	userId: string,
): Promise<ViewerClubAccess> {
	const [memberRow, directRoles, management] = await Promise.all([
		prisma.clubMember.findFirst({
			where: { clubId, student: { userId } },
			include: { role: true },
		}),
		prisma.clubRole.findMany({
			where: { clubId, assignedUsers: { some: { id: userId } } },
		}),
		isClubManager(userId),
	]);

	const roleRows = [
		...(memberRow?.role ? [memberRow.role] : []),
		...directRoles,
	];

	const permissions = new Set<string>();
	for (const role of roleRows) {
		for (const key of parseClubPermissions(role.permissions)) {
			permissions.add(key);
		}
	}

	if (management) {
		for (const key of [
			"posts.create",
			"posts.editAny",
			"posts.pin",
			"members.manage",
		]) {
			permissions.add(key);
		}
	}

	const primaryRole =
		memberRow?.role ??
		[...directRoles].sort((a, b) => a.sortOrder - b.sortOrder)[0] ??
		null;

	return {
		canCreatePosts: permissions.has("posts.create"),
		canEditAnyPost: permissions.has("posts.editAny"),
		canPinPosts: permissions.has("posts.pin"),
		canManageMembers: permissions.has("members.manage"),
		permissions,
		roleName: primaryRole?.name ?? null,
		isMember: Boolean(memberRow),
	};
}

/** MANAGEMENT staff (ADMIN/SUPERADMIN) hold every club permission implicitly. */
async function isClubManager(userId: string): Promise<boolean> {
	const roles = await prisma.userRole.findMany({
		where: { userId },
		select: { role: true },
	});

	if (roles.some((row) => row.role === "SUPERADMIN" || row.role === "ADMIN")) {
		return true;
	}

	return false;
}

/* ------------------------------------------------------------------ */
/* Posts                                                               */
/* ------------------------------------------------------------------ */

export interface ClubPostInput {
	title: string;
	body: string;
	excerpt?: string;
	coverImage?: string;
	category?: string;
	visibility?: "PUBLIC" | "MEMBERS_ONLY" | "DRAFT" | string;
	allowComments?: boolean;
	isPinned?: boolean;
}

export async function listClubPosts(clubId: string) {
	return prisma.post.findMany({
		where: { clubId },
		orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
		include: {
			author: { select: { id: true, name: true, image: true } },
			authorStudent: {
				select: {
					id: true,
					user: { select: { id: true, name: true, image: true } },
				},
			},
			comments: {
				orderBy: { createdAt: "asc" },
				include: { author: { select: { id: true, name: true, image: true } } },
			},
		},
	});
}

export class ClubAccessError extends Error {}

/* ------------------------------------------------------------------ */
/* Joining                                                             */
/* ------------------------------------------------------------------ */

export interface ClubJoinState {
	/** Whether the signed-in account has a Student record (only students join). */
	isStudent: boolean;
	isMember: boolean;
	requestStatus: "PENDING" | "APPROVED" | "DECLINED" | null;
}

export async function getClubJoinState(
	clubId: string,
	userId: string,
): Promise<ClubJoinState> {
	const student = await prisma.student.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!student) {
		return { isStudent: false, isMember: false, requestStatus: null };
	}

	const [member, request] = await Promise.all([
		prisma.clubMember.findUnique({
			where: { clubId_studentId: { clubId, studentId: student.id } },
			select: { id: true },
		}),
		prisma.clubJoinRequest.findUnique({
			where: { clubId_studentId: { clubId, studentId: student.id } },
			select: { status: true },
		}),
	]);

	return {
		isStudent: true,
		isMember: Boolean(member),
		requestStatus: request?.status ?? null,
	};
}

/**
 * Join (OPEN) or request to join (REQUEST) a club. CLOSED clubs refuse.
 * Returns whether the viewer is now a member or has a pending request.
 */
export async function joinClub(
	clubId: string,
	userId: string,
): Promise<{ status: "member" | "pending" }> {
	const [student, club] = await Promise.all([
		prisma.student.findUnique({
			where: { userId },
			select: { id: true },
		}),
		prisma.club.findUnique({
			where: { id: clubId },
			select: { joinPolicy: true, isActive: true },
		}),
	]);

	if (!club || !club.isActive) throw new ClubAccessError("Club not found");
	if (!student) {
		throw new ClubAccessError(
			"Only students can join clubs. Ask a club officer to add your staff role.",
		);
	}

	const existing = await prisma.clubMember.findUnique({
		where: { clubId_studentId: { clubId, studentId: student.id } },
		select: { id: true },
	});
	if (existing) return { status: "member" };

	if (club.joinPolicy === "CLOSED") {
		throw new ClubAccessError("This club is not accepting new members.");
	}

	if (club.joinPolicy === "OPEN") {
		await prisma.clubMember.create({
			data: { clubId, studentId: student.id },
		});
		return { status: "member" };
	}

	await prisma.clubJoinRequest.upsert({
		where: { clubId_studentId: { clubId, studentId: student.id } },
		create: { clubId, studentId: student.id },
		update: { status: "PENDING", reviewedAt: null },
	});
	return { status: "pending" };
}

/** Pending requests for club managers, oldest first. */
export async function listPendingJoinRequests(clubId: string) {
	return prisma.clubJoinRequest.findMany({
		where: { clubId, status: "PENDING" },
		orderBy: { createdAt: "asc" },
		select: {
			id: true,
			createdAt: true,
			student: {
				select: {
					id: true,
					grade: true,
					section: true,
					user: { select: { name: true } },
				},
			},
		},
	});
}

/** Approve (creating membership) or decline one join request. */
export async function decideJoinRequest(requestId: string, approve: boolean) {
	const request = await prisma.clubJoinRequest.findUnique({
		where: { id: requestId },
		select: { clubId: true, studentId: true, status: true },
	});

	if (!request) throw new ClubAccessError("This request no longer exists.");
	if (request.status !== "PENDING") {
		throw new ClubAccessError("This request has already been reviewed.");
	}

	await prisma.$transaction(async (tx) => {
		if (approve) {
			await tx.clubMember.upsert({
				where: {
					clubId_studentId: {
						clubId: request.clubId,
						studentId: request.studentId,
					},
				},
				create: { clubId: request.clubId, studentId: request.studentId },
				update: {},
			});
		}

		await tx.clubJoinRequest.update({
			where: { id: requestId },
			data: {
				status: approve ? "APPROVED" : "DECLINED",
				reviewedAt: new Date(),
			},
		});
	});
}

/** Create a post; enforces `posts.create` for the acting user. */
export async function createClubPost(
	clubId: string,
	userId: string,
	input: ClubPostInput,
) {
	const access = await resolveClubAccess(clubId, userId);

	if (!access.canCreatePosts) {
		throw new ClubAccessError(
			"Your club role does not allow publishing posts. Ask a club officer to publish for you.",
		);
	}

	return prisma.post.create({
		data: {
			clubId,
			authorId: userId,
			title: input.title.trim(),
			body: input.body.trim(),
			excerpt: input.excerpt?.trim() || null,
			coverImage: input.coverImage?.trim() || null,
			category: input.category?.trim() || "General",
			visibility: input.visibility || "PUBLIC",
			allowComments: input.allowComments ?? true,
			isPinned: Boolean(input.isPinned && access.canPinPosts),
		},
	});
}

/** Edit a post; the author, holders of `posts.editAny`, and management can. */
export async function updateClubPost(
	postId: string,
	userId: string,
	input: Partial<ClubPostInput>,
) {
	const existing = await prisma.post.findUnique({ where: { id: postId } });
	if (!existing) throw new ClubAccessError("This post no longer exists.");

	const access = await resolveClubAccess(existing.clubId, userId);
	const isOwn = existing.authorId === userId;
	const canEdit = access.canEditAnyPost || isOwn;

	// Pinning is a moderation act, not an edit: a role may hold `posts.pin`
	// without `posts.editAny` (the roles editor offers them independently), so
	// a pin-only change is allowed on any post for pin holders. Any title/body
	// change still requires author or `posts.editAny`.
	const isPinOnlyChange =
		input.isPinned !== undefined &&
		input.title === undefined &&
		input.body === undefined &&
		input.excerpt === undefined &&
		input.coverImage === undefined &&
		input.category === undefined &&
		input.visibility === undefined &&
		input.allowComments === undefined;

	if (!canEdit && !(isPinOnlyChange && access.canPinPosts)) {
		throw new ClubAccessError(
			isPinOnlyChange
				? "You do not have permission to pin this post."
				: "Only the author or a club officer can edit this post.",
		);
	}

	// An author may edit their post without holding `posts.pin`. Accepting a
	// pin change and silently dropping it would report success while nothing
	// changed, so reject the request instead.
	if (input.isPinned !== undefined && !access.canPinPosts) {
		throw new ClubAccessError("You do not have permission to pin this post.");
	}

	return prisma.post.update({
		where: { id: postId },
		data: {
			...(input.title !== undefined && canEdit
				? { title: input.title.trim() }
				: {}),
			...(input.body !== undefined && canEdit
				? { body: input.body.trim() }
				: {}),
			...(input.excerpt !== undefined && canEdit
				? { excerpt: input.excerpt?.trim() || null }
				: {}),
			...(input.coverImage !== undefined && canEdit
				? { coverImage: input.coverImage?.trim() || null }
				: {}),
			...(input.category !== undefined && canEdit
				? { category: input.category?.trim() || "General" }
				: {}),
			...(input.visibility !== undefined && canEdit
				? { visibility: input.visibility }
				: {}),
			...(input.allowComments !== undefined && canEdit
				? { allowComments: input.allowComments }
				: {}),
			...(input.isPinned !== undefined && access.canPinPosts
				? { isPinned: input.isPinned }
				: {}),
		},
	});
}

/** Delete a post; the author, holders of `posts.editAny`, and management can. */
export async function deleteClubPost(postId: string, userId: string) {
	const existing = await prisma.post.findUnique({ where: { id: postId } });
	if (!existing) return;

	const access = await resolveClubAccess(existing.clubId, userId);

	if (!access.canEditAnyPost && existing.authorId !== userId) {
		throw new ClubAccessError(
			"Only the author or a club officer can delete this post.",
		);
	}

	await prisma.post.delete({ where: { id: postId } });
}

/** Anyone who is a member (or management/patron) may comment on a post. */
export async function createPostComment(
	postId: string,
	userId: string,
	body: string,
) {
	const post = await prisma.post.findUnique({
		where: { id: postId },
		select: { clubId: true },
	});
	if (!post) throw new ClubAccessError("This post no longer exists.");

	const access = await resolveClubAccess(post.clubId, userId);

	if (!access.isMember && access.permissions.size === 0) {
		throw new ClubAccessError("Join the club before commenting on its posts.");
	}

	return prisma.postComment.create({
		data: {
			postId,
			authorId: userId,
			body: body.trim(),
		},
	});
}
