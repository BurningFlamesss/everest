import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	ClubAccessError,
	createClubPost,
	createPostComment,
	decideJoinRequest,
	deleteClubPost,
	EMPTY_ACCESS,
	getClubJoinState,
	joinClub,
	listClubPosts,
	listClubRoles,
	listPendingJoinRequests,
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
		// Roles and member assignments are officer-only data. The public club
		// page shows the feed and profile, never the board roster.
		const guard = await requireClubManager(data.slug);
		if (!guard.ok) {
			return { success: false as const, error: guard.error };
		}

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true, isActive: true },
		});

		if (!club || !club.isActive) {
			return { success: false as const, error: "Club not found" };
		}

		const [roles, posts, unassignedMembers] = await Promise.all([
			listClubRoles(club.id),
			listClubPosts(club.id),
			prisma.clubMember.findMany({
				where: { clubId: club.id, roleId: null },
				select: {
					student: {
						select: {
							id: true,
							grade: true,
							section: true,
							user: { select: { id: true, name: true } },
						},
					},
				},
				orderBy: { createdAt: "asc" },
			}),
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
			// Members with no role assigned are kept visible for the admin board
			// editor; without them the editor would delete them on the next save.
			unassignedMembers: unassignedMembers.map((member) => ({
				id: member.student.id,
				name: member.student.user.name,
				grade: member.student.grade,
				section: member.student.section,
			})),
			posts,
		};
	});

export const getClubPostsFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true, isActive: true },
		});

		if (!club || !club.isActive) {
			return { success: false as const, error: "Club not found" };
		}

		return { success: true as const, posts: await listClubPosts(club.id) };
	});

export const getPublicClubActivitiesFn = createServerFn().handler(async () => {
	const [clubs, recentPosts] = await Promise.all([
		prisma.club.findMany({
			where: { isActive: true },
			include: {
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
				},
				_count: {
					select: { members: true, posts: true },
				},
			},
			orderBy: { name: "asc" },
		}),
		prisma.post.findMany({
			where: {
				club: { isActive: true },
				visibility: "PUBLIC",
			},
			orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
			take: 20,
			include: {
				club: {
					select: {
						id: true,
						name: true,
						slug: true,
						coverImage: true,
					},
				},
				author: {
					select: { id: true, name: true, image: true },
				},
				authorStudent: {
					select: {
						id: true,
						user: { select: { id: true, name: true, image: true } },
					},
				},
				_count: {
					select: { comments: true },
				},
			},
		}),
	]);

	return {
		clubs,
		recentPosts,
	};
});

export const getAllMyClubAccessFn = createServerFn().handler(async () => {
	const user = await getSessionUser();
	if (!user?.id) {
		return { success: true as const, userId: null, accessBySlug: {} };
	}

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

	return { success: true as const, userId: user.id, accessBySlug };
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
/* Public club detail & joining                                        */
/* ------------------------------------------------------------------ */

export const getClubDetailFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: {
				id: true,
				name: true,
				slug: true,
				description: true,
				meetingSchedule: true,
				coverImage: true,
				joinPolicy: true,
				isActive: true,
				_count: { select: { members: true } },
				attachments: {
					select: {
						id: true,
						label: true,
						fileAsset: {
							select: {
								url: true,
								originalName: true,
								size: true,
							},
						},
					},
					orderBy: { createdAt: "asc" },
				},
			},
		});

		if (!club || !club.isActive) {
			return { success: false as const, error: "Club not found" };
		}

		const user = await getSessionUser();
		const [posts, access, joinState] = await Promise.all([
			listClubPosts(club.id),
			user?.id
				? resolveClubAccess(club.id, user.id)
				: Promise.resolve(EMPTY_ACCESS),
			user?.id
				? getClubJoinState(club.id, user.id)
				: Promise.resolve({
						isStudent: false,
						isMember: false,
						requestStatus: null,
					}),
		]);

		return {
			success: true as const,
			club,
			posts,
			userId: user?.id ?? null,
			access: {
				canCreatePosts: access.canCreatePosts,
				canEditAnyPost: access.canEditAnyPost,
				canPinPosts: access.canPinPosts,
				canManageMembers: access.canManageMembers,
				roleName: access.roleName,
				isMember: access.isMember,
			},
			joinState,
		};
	});

export const joinClubAction = createServerFn({ method: "POST" })
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		if (!user?.id) {
			return {
				success: false as const,
				error: "Please sign in to join a club",
			};
		}

		const club = await prisma.club.findUnique({
			where: { slug: data.slug },
			select: { id: true },
		});
		if (!club) return { success: false as const, error: "Club not found" };

		try {
			const result = await joinClub(club.id, user.id);
			return { success: true as const, status: result.status };
		} catch (error) {
			return toActionError(error);
		}
	});

export const getClubJoinRequestsFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		const guard = await requireClubManager(data.slug);
		if (!guard.ok) return { success: false as const, error: guard.error };

		return {
			success: true as const,
			requests: await listPendingJoinRequests(guard.clubId),
		};
	});

export const decideClubJoinRequestAction = createServerFn({ method: "POST" })
	.validator(z.object({ requestId: z.string().min(1), approve: z.boolean() }))
	.handler(async ({ data }) => {
		const request = await prisma.clubJoinRequest.findUnique({
			where: { id: data.requestId },
			select: { club: { select: { slug: true } } },
		});
		if (!request) {
			return {
				success: false as const,
				error: "This request no longer exists.",
			};
		}

		const guard = await requireClubManager(request.club.slug);
		if (!guard.ok) return { success: false as const, error: guard.error };

		try {
			await decideJoinRequest(data.requestId, data.approve);
			return { success: true as const };
		} catch (error) {
			return toActionError(error);
		}
	});

/* ------------------------------------------------------------------ */
/* Admin: roles & members                                              */
/* ------------------------------------------------------------------ */

/**
 * Allow ADMIN/SUPERADMIN or a club officer holding `members.manage`.
 *
 * A president (or any role granted "Manage members" in the roles editor) can
 * therefore run the roles/members editor without school-wide admin rights.
 * `resolveClubAccess` already folds implicit ADMIN/SUPERADMIN permissions in,
 * so a single check on `canManageMembers` covers both paths.
 */
async function requireClubManager(slug: string) {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		return { ok: false as const, error: "Please sign in to continue" };
	}

	const club = await prisma.club.findUnique({
		where: { slug },
		select: { id: true },
	});
	if (!club) {
		return { ok: false as const, error: "Club not found" };
	}

	const access = await resolveClubAccess(club.id, session.user.id);

	if (!access.canManageMembers) {
		return {
			ok: false as const,
			error: "You need the Manage members permission for this club.",
		};
	}

	return { ok: true as const, userId: session.user.id, clubId: club.id };
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
		const guard = await requireClubManager(data.slug);
		if (!guard.ok) return { success: false as const, error: guard.error };

		const club = { id: guard.clubId };

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

		try {
			const roles = await setClubRoles(club.id, sanitized);
			return { success: true as const, roles };
		} catch (error) {
			return toActionError(error);
		}
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
		const guard = await requireClubManager(data.slug);
		if (!guard.ok) return { success: false as const, error: guard.error };

		const clubId = guard.clubId;

		// A roleId pointing at another club (or a deleted role) would corrupt
		// the membership rows; resolve each id against this club first.
		const clubRoles = await prisma.clubRole.findMany({
			where: { clubId },
			select: { id: true },
		});
		const validRoleIds = new Set(clubRoles.map((role) => role.id));

		const keep = new Set(data.members.map((member) => member.studentId));

		// Members dropped from the list are removed.
		await prisma.clubMember.deleteMany({
			where: {
				clubId,
				studentId: { notIn: [...keep] },
			},
		});

		for (const member of data.members) {
			const roleId =
				member.roleId && validRoleIds.has(member.roleId) ? member.roleId : null;
			await upsertClubMember(clubId, member.studentId, roleId);
		}

		const roles = await listClubRoles(clubId);
		return { success: true as const, roles };
	});

/* ------------------------------------------------------------------ */
/* Feed actions                                                        */
/* ------------------------------------------------------------------ */

const postInputSchema = z.object({
	title: z.string().trim().min(1, "Give the post a title"),
	body: z.string().trim().min(1, "Write something in the post"),
	excerpt: z.string().trim().optional(),
	coverImage: z.string().trim().optional(),
	category: z.string().trim().optional(),
	visibility: z.string().trim().optional(),
	allowComments: z.boolean().optional(),
	isPinned: z.boolean().optional(),
});

export const getClubPostDetailFn = createServerFn()
	.validator(z.object({ postId: z.string().min(1) }))
	.handler(async ({ data }) => {
		const user = await getSessionUser();
		const post = await prisma.post.findUnique({
			where: { id: data.postId },
			include: {
				club: {
					select: {
						id: true,
						name: true,
						slug: true,
						coverImage: true,
						meetingSchedule: true,
						description: true,
						_count: { select: { members: true, posts: true } },
					},
				},
				author: {
					select: { id: true, name: true, image: true, email: true },
				},
				authorStudent: {
					select: {
						id: true,
						grade: true,
						section: true,
						user: { select: { id: true, name: true, image: true } },
					},
				},
				comments: {
					orderBy: { createdAt: "asc" },
					include: {
						author: { select: { id: true, name: true, image: true } },
					},
				},
			},
		});

		if (!post) {
			return { success: false as const, error: "Article not found" };
		}

		if (post.visibility === "MEMBERS_ONLY" || post.visibility === "DRAFT") {
			if (!user?.id) {
				return {
					success: false as const,
					error: "This article is restricted to club members. Please sign in.",
				};
			}
			const access = await resolveClubAccess(post.clubId, user.id);
			if (post.visibility === "MEMBERS_ONLY" && !access.isMember) {
				return {
					success: false as const,
					error: "This article is private to members of this club.",
				};
			}
			if (
				post.visibility === "DRAFT" &&
				!access.canCreatePosts &&
				post.authorId !== user.id
			) {
				return {
					success: false as const,
					error: "This draft article is only visible to authors and club officers.",
				};
			}
		}

		const moreFromClub = await prisma.post.findMany({
			where: {
				clubId: post.clubId,
				id: { not: post.id },
				visibility: "PUBLIC",
			},
			orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
			take: 3,
			select: {
				id: true,
				title: true,
				excerpt: true,
				body: true,
				createdAt: true,
				coverImage: true,
				category: true,
				club: {
					select: {
						name: true,
						slug: true,
					},
				},
			},
		});

		return {
			success: true as const,
			post,
			moreFromClub,
			userId: user?.id ?? null,
		};
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
				excerpt: data.excerpt,
				coverImage: data.coverImage,
				category: data.category,
				visibility: data.visibility,
				allowComments: data.allowComments,
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
				...(data.excerpt !== undefined ? { excerpt: data.excerpt } : {}),
				...(data.coverImage !== undefined ? { coverImage: data.coverImage } : {}),
				...(data.category !== undefined ? { category: data.category } : {}),
				...(data.visibility !== undefined ? { visibility: data.visibility } : {}),
				...(data.allowComments !== undefined ? { allowComments: data.allowComments } : {}),
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
