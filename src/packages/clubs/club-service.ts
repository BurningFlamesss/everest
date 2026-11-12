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

	await prisma.$transaction([
		// Roles removed from the payload are deleted; members drop to no role.
		prisma.clubRole.deleteMany({
			where: { clubId, id: { notIn: [...keepIds] } },
		}),
	]);

	for (const [index, role] of roles.entries()) {
		const data = {
			name: role.name.trim(),
			description: role.description?.trim() || null,
			permissions: (role.permissions ?? []).join(","),
			isBoard: role.isBoard ?? false,
			sortOrder: role.sortOrder ?? index,
		};

		if (role.id) {
			await prisma.clubRole.update({ where: { id: role.id }, data });
		} else {
			await prisma.clubRole.create({ data: { ...data, clubId } });
		}
	}

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

	if (!access.canEditAnyPost && !isOwn) {
		throw new ClubAccessError(
			"Only the author or a club officer can edit this post.",
		);
	}

	return prisma.post.update({
		where: { id: postId },
		data: {
			...(input.title !== undefined ? { title: input.title.trim() } : {}),
			...(input.body !== undefined ? { body: input.body.trim() } : {}),
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
