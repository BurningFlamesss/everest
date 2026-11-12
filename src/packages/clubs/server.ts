import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	ClubAccessError,
	createClubPost,
	createPostComment,
	deleteClubPost,
	EMPTY_ACCESS,
	listClubPosts,
	listClubRoles,
	resolveClubAccess,
	setClubRoles,
	updateClubPost,
	upsertClubMember,
} from "#/packages/clubs/club-service.ts";
import {
	ALL_CLUB_PERMISSIONS,
	type ClubPermissionKey,
	isClubPermissionKey,
	parseClubPermissions,
} from "#/packages/clubs/permissions.ts";
import { prisma } from "#/packages/db/index.ts";

/** Resolve the current session, or null for anonymous visitors. */
async function getSessionUser() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });
	return session?.user?.id ? session.user : null;
}

function toActionError(error: unknown) {
	if (error instanceof ClubAccessError) {
		return { success: false as const, error: error.message };
	}
	console.error("Club action failed:", error);
	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
	};
}

/* ------------------------------------------------------------------ */
/* Public data                                                         */
/* ------------------------------------------------------------------ */

export const getClubBoardFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true, isActive: true },
		});

		if (!club || !club.isActive) {
			return { success: false as const, error: "Club not found" };
		}

		const [roles, posts] = await Promise.all([
			listClubRoles(club.id),
			listClubPosts(club.id),
		]);

		return {
			success: true as const,
			clubId: club.id,
			roles: roles.map((role) => ({
				id: role.id,
				name: role.name,
				description: role.description,
				permissions: role.permissions,
				isBoard: role.isBoard,
				sortOrder: role.sortOrder,
				members: role.members.map((member) => ({
					id: member.student.id,
					name: member.student.user.name,
					grade: member.student.grade,
					section: member.student.section,
					roleId: member.role?.id ?? null,
				})),
			})),
			posts,
		};
	});

export const getAllMyClubAccessFn = createServerFn().handler(async () => {
	const user = await getSessionUser();
	if (!user?.id) return { success: true as const, accessBySlug: {} };

	const [memberships, directRoles, isManagement] = await Promise.all([
		prisma.clubMember.findMany({
			where: { student: { userId: user.id } },
			select: { club: { select: { slug: true } }, role: true },
		}),
		prisma.clubRole.findMany({
			where: { assignedUsers: { some: { id: user.id } } },
			select: {
				club: { select: { slug: true } },
				permissions: true,
				sortOrder: true,
				name: true,
			},
		}),
		(async () => {
			const roles = await prisma.userRole.findMany({
				where: { userId: user.id },
				select: { role: true },
			});
			return roles.some(
				(row) => row.role === "SUPERADMIN" || row.role === "ADMIN",
			);
		})(),
	]);

	const accessBySlug: Record<
		string,
		{
			canCreatePosts: boolean;
			canEditAnyPost: boolean;
			canPinPosts: boolean;
			canManageMembers: boolean;
			roleName: string | null;
			isMember: boolean;
		}
	> = {};

	const managementPermissions = [
		"posts.create",
		"posts.editAny",
		"posts.pin",
		"members.manage",
	];

	for (const membership of memberships) {
		const keys = new Set(parseClubPermissions(membership.role?.permissions));
		if (isManagement) {
			for (const key of managementPermissions) keys.add(key);
		}
		accessBySlug[membership.club.slug] = {
			canCreatePosts: keys.has("posts.create"),
			canEditAnyPost: keys.has("posts.editAny"),
			canPinPosts: keys.has("posts.pin"),
			canManageMembers: keys.has("members.manage"),
			roleName: membership.role?.name ?? null,
			isMember: true,
		};
	}

	for (const role of directRoles) {
		const keys = new Set(parseClubPermissions(role.permissions));
		if (isManagement) {
			for (const key of managementPermissions) keys.add(key);
		}
		const current = accessBySlug[role.club.slug];
		accessBySlug[role.club.slug] = {
			canCreatePosts:
				keys.has("posts.create") || (current?.canCreatePosts ?? false),
			canEditAnyPost:
				keys.has("posts.editAny") || (current?.canEditAnyPost ?? false),
			canPinPosts: keys.has("posts.pin") || (current?.canPinPosts ?? false),
			canManageMembers:
				keys.has("members.manage") || (current?.canManageMembers ?? false),
			roleName: current?.roleName ?? role.name,
			isMember: current?.isMember ?? false,
		};
	}

	if (isManagement) {
		const clubs = await prisma.club.findMany({ select: { slug: true } });
		for (const club of clubs) {
			if (!accessBySlug[club.slug]) {
				accessBySlug[club.slug] = {
					canCreatePosts: true,
					canEditAnyPost: true,
					canPinPosts: true,
					canManageMembers: true,
					roleName: null,
					isMember: false,
				};
			}
		}
	}

	return { success: true as const, accessBySlug };
});

export const getMyClubAccessFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) return { success: true as const, access: EMPTY_ACCESS };

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true },
		});
		if (!club) return { success: true as const, access: EMPTY_ACCESS };

		const access = await resolveClubAccess(club.id, user.id);
		return {
			success: true as const,
			access: {
				canCreatePosts: access.canCreatePosts,
				canEditAnyPost: access.canEditAnyPost,
				canPinPosts: access.canPinPosts,
				canManageMembers: access.canManageMembers,
				roleName: access.roleName,
				isMember: access.isMember,
			},
		};
	});

/* ------------------------------------------------------------------ */
/* Admin: roles & members                                              */
/* ------------------------------------------------------------------ */

async function requireContentManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		return { ok: false as const, error: "Please sign in to continue" };
	}

	const roles = await prisma.userRole.findMany({
		where: { userId: session.user.id },
		select: { role: true },
	});

	if (!roles.some((row) => row.role === "SUPERADMIN" || row.role === "ADMIN")) {
		return { ok: false as const, error: "You cannot manage club roles" };
	}

	return { ok: true as const, userId: session.user.id };
}

const roleInputSchema = z.object({
	id: z.string().optional(),
	name: z.string().trim().min(1, "Role name is required"),
	description: z.string().trim().optional(),
	permissions: z.array(z.string()).optional(),
	isBoard: z.boolean().optional(),
	sortOrder: z.number().int().optional(),
});

export const saveClubRolesAction = createServerFn()
	.validator(
		z.object({ slug: z.string().min(1), roles: z.array(roleInputSchema) }),
	)
	.handler(async ({ data }) => {
		const guard = await requireContentManager();
		if (!guard.ok) return { success: false as const, error: guard.error };

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true },
		});
		if (!club) {
			return { success: false as const, error: "Club not found" };
		}

		const sanitized = data.roles.map((role) => ({
			id: role.id,
			name: role.name,
			description: role.description,
			isBoard: role.isBoard,
			sortOrder: role.sortOrder,
			permissions: (role.permissions ?? []).filter(
				(key): key is ClubPermissionKey => isClubPermissionKey(key),
			),
		}));

		const roles = await setClubRoles(club.id, sanitized);
		return { success: true as const, roles };
	});

const memberSchema = z.object({
	studentId: z.string().min(1),
	roleId: z.string().nullable().optional(),
});

export const saveClubMembersAction = createServerFn()
	.validator(
		z.object({ slug: z.string().min(1), members: z.array(memberSchema) }),
	)
	.handler(async ({ data }) => {
		const guard = await requireContentManager();
		if (!guard.ok) return { success: false as const, error: guard.error };

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true },
		});
		if (!club) {
			return { success: false as const, error: "Club not found" };
		}

		const keep = new Set(data.members.map((member) => member.studentId));

		// Members dropped from the list are removed.
		await prisma.clubMember.deleteMany({
			where: {
				clubId: club.id,
				studentId: { notIn: [...keep] },
			},
		});

		for (const member of data.members) {
			await upsertClubMember(club.id, member.studentId, member.roleId ?? null);
		}

		const roles = await listClubRoles(club.id);
		return { success: true as const, roles };
	});

/* ------------------------------------------------------------------ */
/* Feed actions                                                        */
/* ------------------------------------------------------------------ */

const postInputSchema = z.object({
	title: z.string().trim().min(1, "Give the post a title"),
	body: z.string().trim().min(1, "Write something in the post"),
	isPinned: z.boolean().optional(),
});

export const createClubPostAction = createServerFn({ method: "POST" })
	.validator(
		z.object({ slug: z.string().min(1) }).extend(postInputSchema.shape),
	)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) {
			return { success: false as const, error: "Please sign in to post" };
		}

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true },
		});
		if (!club) return { success: false as const, error: "Club not found" };

		try {
			const post = await createClubPost(club.id, user.id, {
				title: data.title,
				body: data.body,
				isPinned: data.isPinned,
			});
			return { success: true as const, post };
		} catch (error) {
			return toActionError(error);
		}
	});

export const updateClubPostAction = createServerFn({ method: "POST" })
	.validator(
		z
			.object({ postId: z.string().min(1) })
			.extend(postInputSchema.partial().shape),
	)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) {
			return { success: false as const, error: "Please sign in first" };
		}

		try {
			const post = await updateClubPost(data.postId, user.id, {
				...(data.title !== undefined ? { title: data.title } : {}),
				...(data.body !== undefined ? { body: data.body } : {}),
				...(data.isPinned !== undefined ? { isPinned: data.isPinned } : {}),
			});
			return { success: true as const, post };
		} catch (error) {
			return toActionError(error);
		}
	});

export const deleteClubPostAction = createServerFn({ method: "POST" })
	.validator(z.object({ postId: z.string().min(1) }))
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) {
			return { success: false as const, error: "Please sign in first" };
		}

		try {
			await deleteClubPost(data.postId, user.id);
			return { success: true as const };
		} catch (error) {
			return toActionError(error);
		}
	});

export const createPostCommentAction = createServerFn({ method: "POST" })
	.validator(
		z.object({
			postId: z.string().min(1),
			body: z.string().trim().min(1, "Write a comment first"),
		}),
	)
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) {
			return { success: false as const, error: "Please sign in to comment" };
		}

		try {
			const comment = await createPostComment(data.postId, user.id, data.body);
			return { success: true as const, comment };
		} catch (error) {
			return toActionError(error);
		}
	});

/* ------------------------------------------------------------------ */
/* Exports for the admin UI                                            */
/* ------------------------------------------------------------------ */

export { ALL_CLUB_PERMISSIONS };
