import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "#/lib/prisma";
import { requirePermission } from "#/packages/auth/server/guard.ts";

const idSchema = z.object({ id: z.string() });

// NOTE: the public `getProgramsServer` lives in content.ts (ordered, with
// public cache headers). This module only carries the admin mutations.

const programSaveSchema = z.object({
	id: z.string().optional(),
	level: z.string().min(1),
	code: z.string().min(1),
	title: z.string().min(1),
	stream: z.string().nullable().optional(),
	duration: z.string().default(""),
	seats: z.number().int().default(0),
	medium: z.string().default(""),
	eligibility: z.string().default(""),
	summary: z.string().default(""),
	description: z.string().default(""),
	highlights: z.array(z.any()).default([]),
	outcomes: z.array(z.any()).default([]),
	careers: z.array(z.any()).default([]),
	subjects: z.array(z.any()).default([]),
	fees: z.array(z.any()).default([]),
	image: z.string().default(""),
	routineKey: z.string().default(""),
	spotlight: z.boolean().default(false),
	order: z.number().int().default(0),
});

export const saveProgramServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("courses.manage")])
	.validator(programSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.program.update({ where: { id }, data: rest });
		return await prisma.program.create({ data: rest });
	});

export const deleteProgramServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("courses.manage")])
	.validator(idSchema)
	.handler(async ({ data: { id } }) => {
		await prisma.program.delete({ where: { id } });
	});

const facilitySaveSchema = z.object({
	id: z.string().optional(),
	name: z.string().min(1),
	category: z.string().default("Campus"),
	block: z.string().default(""),
	blurb: z.string().default(""),
	description: z.string().default(""),
	image: z.string().default(""),
	gallery: z.array(z.any()).default([]),
	stats: z.array(z.any()).default([]),
	hours: z.string().default(""),
	inCharge: z.string().default(""),
	studentsLove: z.string().default(""),
	since: z.string().default(""),
	order: z.number().int().default(0),
});

export const saveFacilityServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("website.manage")])
	.validator(facilitySaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.facility.update({ where: { id }, data: rest });
		return await prisma.facility.create({ data: rest });
	});

export const deleteFacilityServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("website.manage")])
	.validator(idSchema)
	.handler(async ({ data: { id } }) => {
		await prisma.facility.delete({ where: { id } });
	});

const boardResultSaveSchema = z.object({
	id: z.string().optional(),
	board: z.string().min(1),
	year: z.string().min(1),
	appeared: z.number().int().default(0),
	passed: z.number().int().default(0),
	distinction: z.number().int().default(0),
	firstDivision: z.number().int().default(0),
	secondDivision: z.number().int().default(0),
	order: z.number().int().default(0),
});

export const saveBoardResultServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("courses.manage")])
	.validator(boardResultSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id)
			return await prisma.boardResult.update({ where: { id }, data: rest });
		return await prisma.boardResult.create({ data: rest });
	});

export const deleteBoardResultServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("courses.manage")])
	.validator(idSchema)
	.handler(async ({ data: { id } }) => {
		await prisma.boardResult.delete({ where: { id } });
	});

const busRouteSaveSchema = z.object({
	id: z.string().optional(),
	busNumber: z.string().min(1),
	driverName: z.string().default(""),
	driverPhone: z.string().default(""),
	stops: z.array(z.any()).default([]),
	feeMonthly: z.number().int().nullable().optional(),
	order: z.number().int().default(0),
});

export const saveBusRouteServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("transport.manage")])
	.validator(busRouteSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.busRoute.update({ where: { id }, data: rest });
		return await prisma.busRoute.create({ data: rest });
	});

export const deleteBusRouteServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("transport.manage")])
	.validator(idSchema)
	.handler(async ({ data: { id } }) => {
		await prisma.busRoute.delete({ where: { id } });
	});

const albumSaveSchema = z.object({
	id: z.string().optional(),
	event: z.string().min(1),
	year: z.string().min(1),
	category: z.string().min(1),
	date: z.string().nullable().optional(),
	photos: z.array(z.any()).default([]),
	order: z.number().int().default(0),
});

export const saveAlbumServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("gallery.manage")])
	.validator(albumSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.album.update({ where: { id }, data: rest });
		return await prisma.album.create({ data: rest });
	});

export const deleteAlbumServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("gallery.manage")])
	.validator(idSchema)
	.handler(async ({ data: { id } }) => {
		await prisma.album.delete({ where: { id } });
	});

// Staff
export const getStaffServer = createServerFn({ method: "GET" }).handler(
	async () => {
		return await prisma.staff.findMany({ include: { user: true } });
	},
);

export const createStaffServer = createServerFn({ method: "POST" })
	.validator((data: any) => data as any)
	.handler(async ({ data }) => {
		return await prisma.staff.create({ data });
	});

export const updateStaffServer = createServerFn({ method: "POST" })
	.validator((data: { id: string; patch: any }) => data)
	.handler(async ({ data: { id, patch } }) => {
		return await prisma.staff.update({ where: { id }, data: patch });
	});

export const deleteStaffServer = createServerFn({ method: "POST" })
	.validator((data: string) => data)
	.handler(async ({ data: id }) => {
		await prisma.staff.delete({ where: { id } });
	});

// ---------------------------------------------------------------------------
// Dynamic content collections (Notice, Scholarship, FacultyMember, Resource,
// CalendarEvent). These back the public notice board, scholarship, faculty,
// resources and calendar pages. All writes require the matching manage
// permission.
// ---------------------------------------------------------------------------

const noticeSaveSchema = z.object({
	id: z.string().optional(),
	ref: z.string().min(1),
	title: z.string().min(1),
	category: z.string().min(1),
	dateAd: z.string().min(1),
	dateBs: z.string().min(1),
	audience: z.string().min(1),
	issuedBy: z.string().min(1),
	summary: z.string().min(1),
	body: z.array(z.string()).default([]),
	bullets: z.array(z.string()).optional(),
	table: z.any().optional(),
	attachments: z.array(z.any()).default([]),
	pinned: z.boolean().default(false),
	order: z.number().int().default(0),
});

export const saveNoticeServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("notices.manage")])
	.validator(noticeSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.notice.update({ where: { id }, data: rest });
		return await prisma.notice.create({ data: rest });
	});

export const deleteNoticeServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("notices.manage")])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data: { id } }) => {
		await prisma.notice.delete({ where: { id } });
	});

const scholarshipSaveSchema = z.object({
	id: z.string().optional(),
	ref: z.string().min(1),
	name: z.string().min(1),
	nepaliName: z.string().default(""),
	category: z.string().min(1),
	coverage: z.number().int().default(0),
	award: z.string().default(""),
	amountNpr: z.number().int().default(0),
	seats: z.number().int().default(0),
	deadlineAd: z.string().default(""),
	deadlineBs: z.string().default(""),
	appliesTo: z.string().default(""),
	summary: z.string().default(""),
	description: z.string().default(""),
	eligibility: z.array(z.any()).default([]),
	benefits: z.array(z.string()).default([]),
	documents: z.array(z.string()).default([]),
	process: z.array(z.string()).default([]),
	renewal: z.string().default(""),
	contact: z.string().default(""),
	spotlight: z.boolean().default(false),
	order: z.number().int().default(0),
});

export const saveScholarshipServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("admissions.manage")])
	.validator(scholarshipSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id)
			return await prisma.scholarship.update({ where: { id }, data: rest });
		return await prisma.scholarship.create({ data: rest });
	});

export const deleteScholarshipServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("admissions.manage")])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data: { id } }) => {
		await prisma.scholarship.delete({ where: { id } });
	});

const facultySaveSchema = z.object({
	id: z.string().optional(),
	slug: z.string().min(1),
	name: z.string().min(1),
	role: z.string().min(1),
	department: z.string().min(1),
	qualification: z.string().default(""),
	experience: z.string().default(""),
	subjects: z.array(z.string()).default([]),
	email: z.string().default(""),
	extension: z.string().default(""),
	officeHours: z.string().default(""),
	bio: z.string().default(""),
	joined: z.string().default(""),
	leadership: z.boolean().default(false),
	rank: z.number().int().nullable().optional(),
	order: z.number().int().default(0),
});

export const saveFacultyMemberServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("staff.manage")])
	.validator(facultySaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id)
			return await prisma.facultyMember.update({ where: { id }, data: rest });
		return await prisma.facultyMember.create({ data: rest });
	});

export const deleteFacultyMemberServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("staff.manage")])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data: { id } }) => {
		await prisma.facultyMember.delete({ where: { id } });
	});

const resourceSaveSchema = z.object({
	id: z.string().optional(),
	title: z.string().min(1),
	category: z.string().min(1),
	fileUrl: z.string().min(1),
	fileSize: z.string().default(""),
	kind: z.string().default("PDF"),
	audience: z.string().default("All"),
	order: z.number().int().default(0),
});

export const saveResourceServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("website.manage")])
	.validator(resourceSaveSchema)
	.handler(async ({ data }) => {
		const { id, ...rest } = data;
		if (id) return await prisma.resource.update({ where: { id }, data: rest });
		return await prisma.resource.create({ data: rest });
	});

export const deleteResourceServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("website.manage")])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data: { id } }) => {
		await prisma.resource.delete({ where: { id } });
	});

const calendarEventSaveSchema = z.object({
	id: z.string().optional(),
	slug: z.string().optional(),
	title: z.string().min(1),
	titleNe: z.string().optional(),
	description: z.string().optional(),
	startDate: z.string().min(1),
	endDate: z.string().min(1),
	startBs: z.string().optional(),
	endBs: z.string().optional(),
	kind: z.string().optional(),
	category: z.string().min(1),
	term: z.string().optional(),
	status: z.string().optional(),
	allDay: z.boolean().optional(),
	startTime: z.string().optional(),
	endTime: z.string().optional(),
	location: z.string().optional(),
	organizerName: z.string().optional(),
});

export const saveCalendarEventServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("events.manage")])
	.validator(calendarEventSaveSchema)
	.handler(async ({ data }) => {
		const { id, startDate, endDate, ...rest } = data;
		const payload = {
			...rest,
			startDate: new Date(startDate),
			endDate: new Date(endDate),
		};
		if (id)
			return await prisma.calendarEvent.update({
				where: { id },
				data: payload,
			});
		return await prisma.calendarEvent.create({ data: payload });
	});

export const deleteCalendarEventServer = createServerFn({ method: "POST" })
	.middleware([requirePermission("events.manage")])
	.validator(z.object({ id: z.string() }))
	.handler(async ({ data: { id } }) => {
		await prisma.calendarEvent.delete({ where: { id } });
	});
