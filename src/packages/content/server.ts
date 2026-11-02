import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createClub,
	createEvent,
	createNotice,
	deleteClub,
	deleteEvent,
	deleteNotice,
	getEventBySlug,
	getNoticeBySlug,
	listClubs,
	listEvents,
	listNotices,
	updateClub,
	updateEvent,
	updateNotice,
} from "#/packages/content/content-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_CONTENT");

	return session.user;
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Content action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

const searchSchema = z
	.object({
		search: z.string().trim().optional(),
		limit: z.number().int().positive().max(200).optional(),
	})
	.optional();

export const getNoticesFn = createServerFn()
	.validator(searchSchema)
	.handler(async ({ data }) => {
		return listNotices({
			search: data?.search,
			limit: data?.limit,
		});
	});

export const getNoticeFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		return getNoticeBySlug(data.slug, false);
	});

export const getEventsFn = createServerFn()
	.validator(searchSchema)
	.handler(async ({ data }) => {
		return listEvents({
			search: data?.search,
			limit: data?.limit,
		});
	});

export const getEventFn = createServerFn()
	.validator(z.object({ slug: z.string().min(1) }))
	.handler(async ({ data }) => {
		return getEventBySlug(data.slug, false);
	});

export const getClubsFn = createServerFn()
	.validator(searchSchema)
	.handler(async ({ data }) => {
		return listClubs({ search: data?.search });
	});

const noticeInputSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	summary: z.string().trim().optional(),
	body: z.string().trim().min(1, "Body is required"),
	category: z.string().trim().optional(),
	coverImage: z.string().trim().optional(),
	audience: z.enum(["ALL", "STUDENTS", "STAFF", "GUARDIANS"]).optional(),
	isPublished: z.boolean().optional(),
	expiresAt: z.string().trim().optional(),
});

export const createNoticeAction = createServerFn()
	.validator(noticeInputSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireManager();
			const notice = await createNotice({ ...data, authorId: user.id });

			return { success: true as const, notice };
		} catch (error) {
			return failure(error);
		}
	});

export const updateNoticeAction = createServerFn()
	.validator(noticeInputSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const notice = await updateNotice(id, input);

			return { success: true as const, notice };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteNoticeAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteNotice(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const eventInputSchema = z.object({
	title: z.string().trim().min(1, "Title is required"),
	description: z.string().trim().optional(),
	location: z.string().trim().optional(),
	coverImage: z.string().trim().optional(),
	startsAt: z.string().trim().min(1, "Start date is required"),
	endsAt: z.string().trim().optional(),
	isPublished: z.boolean().optional(),
});

export const createEventAction = createServerFn()
	.validator(eventInputSchema)
	.handler(async ({ data }) => {
		try {
			const user = await requireManager();
			const event = await createEvent({ ...data, authorId: user.id });

			return { success: true as const, event };
		} catch (error) {
			return failure(error);
		}
	});

export const updateEventAction = createServerFn()
	.validator(eventInputSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const event = await updateEvent(id, input);

			return { success: true as const, event };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteEventAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteEvent(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const clubInputSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	description: z.string().trim().optional(),
	meetingSchedule: z.string().trim().optional(),
	coverImage: z.string().trim().optional(),
	isActive: z.boolean().optional(),
});

export const createClubAction = createServerFn()
	.validator(clubInputSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const club = await createClub(data);

			return { success: true as const, club };
		} catch (error) {
			return failure(error);
		}
	});

export const updateClubAction = createServerFn()
	.validator(clubInputSchema.partial().extend({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const { id, ...input } = data;
			const club = await updateClub(id, input);

			return { success: true as const, club };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteClubAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteClub(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const getContentAdminDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [notices, events, clubs] = await Promise.all([
			listNotices({ includeDrafts: true }),
			listEvents({ includeDrafts: true }),
			listClubs({ includeInactive: true }),
		]);

		return { success: true as const, notices, events, clubs };
	} catch (error) {
		return failure(error);
	}
});
