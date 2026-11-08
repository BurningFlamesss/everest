import { prisma } from "#/packages/db/index.ts";

export const DIRECTORY_TABS = ["students", "staff", "guardians"] as const;
export type DirectoryTab = (typeof DIRECTORY_TABS)[number];

export const DEFAULT_DIRECTORY_PAGE_SIZE = 25;
export const MAX_DIRECTORY_PAGE_SIZE = 100;

export const DEFAULT_STUDENT_OPTION_LIMIT = 20;
export const MAX_STUDENT_OPTION_LIMIT = 100;

export interface DirectoryStudentRow {
	id: string;
	name: string;
	email: string;
	admissionNo: string | null;
	rollNo: string | null;
	grade: string | null;
	section: string | null;
	status: string;
	activatedAt: Date | null;
}

export interface DirectoryStaffRow {
	id: string;
	name: string;
	email: string;
	employeeId: string | null;
	designation: string;
	department: string | null;
	status: string;
	activatedAt: Date | null;
}

export interface DirectoryGuardianRow {
	id: string;
	name: string;
	email: string;
	activatedAt: Date | null;
	students: Array<{ id: string; name: string; relation: string }>;
}

export type DirectoryRow =
	| DirectoryStudentRow
	| DirectoryStaffRow
	| DirectoryGuardianRow;

export interface DirectoryPage {
	tab: DirectoryTab;
	rows: Array<DirectoryRow>;
	total: number;
	page: number;
	pageSize: number;
	pageCount: number;
}

export interface StudentOption {
	id: string;
	name: string;
	grade: string | null;
	section: string | null;
	admissionNo: string | null;
	rollNo: string | null;
}

/** A short, uniform search term: prevents unbounded `%…%` scans from clients. */
function normalizeSearch(search?: string) {
	return search?.trim().slice(0, 100) ?? "";
}

function normalizePageSize(pageSize?: number) {
	return Math.min(
		Math.max(Math.floor(pageSize ?? DEFAULT_DIRECTORY_PAGE_SIZE), 1),
		MAX_DIRECTORY_PAGE_SIZE,
	);
}

function studentWhere(search: string) {
	return search
		? {
				OR: [
					{
						user: { name: { contains: search, mode: "insensitive" as const } },
					},
					{
						user: { email: { contains: search, mode: "insensitive" as const } },
					},
					{
						admissionNo: {
							contains: search,
							mode: "insensitive" as const,
						},
					},
					{ rollNo: { contains: search, mode: "insensitive" as const } },
				],
			}
		: undefined;
}

function staffWhere(search: string) {
	return search
		? {
				OR: [
					{
						user: { name: { contains: search, mode: "insensitive" as const } },
					},
					{
						user: { email: { contains: search, mode: "insensitive" as const } },
					},
					{
						employeeId: {
							contains: search,
							mode: "insensitive" as const,
						},
					},
				],
			}
		: undefined;
}

function guardianWhere(search: string) {
	return search
		? {
				user: {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ email: { contains: search, mode: "insensitive" as const } },
					],
				},
			}
		: undefined;
}

async function countDirectoryRows(tab: DirectoryTab, search: string) {
	if (tab === "staff") {
		return prisma.staff.count({ where: staffWhere(search) });
	}

	if (tab === "guardians") {
		return prisma.guardian.count({ where: guardianWhere(search) });
	}

	return prisma.student.count({ where: studentWhere(search) });
}

async function loadDirectoryRows(
	tab: DirectoryTab,
	search: string,
	page: number,
	pageSize: number,
): Promise<Array<DirectoryRow>> {
	const range = { skip: (page - 1) * pageSize, take: pageSize };

	if (tab === "staff") {
		const rows = await prisma.staff.findMany({
			where: staffWhere(search),
			select: {
				id: true,
				employeeId: true,
				designation: true,
				department: true,
				status: true,
				user: { select: { name: true, email: true, activatedAt: true } },
			},
			orderBy: [{ createdAt: "desc" }, { id: "asc" }],
			...range,
		});

		return rows.map(
			(member): DirectoryStaffRow => ({
				id: member.id,
				name: member.user.name,
				email: member.user.email,
				employeeId: member.employeeId,
				designation: member.designation,
				department: member.department,
				status: member.status,
				activatedAt: member.user.activatedAt,
			}),
		);
	}

	if (tab === "guardians") {
		const rows = await prisma.guardian.findMany({
			where: guardianWhere(search),
			select: {
				id: true,
				user: { select: { name: true, email: true, activatedAt: true } },
				guardianStudents: {
					select: {
						relation: true,
						student: {
							select: { id: true, user: { select: { name: true } } },
						},
					},
				},
			},
			orderBy: [{ createdAt: "desc" }, { id: "asc" }],
			...range,
		});

		return rows.map(
			(guardian): DirectoryGuardianRow => ({
				id: guardian.id,
				name: guardian.user.name,
				email: guardian.user.email,
				activatedAt: guardian.user.activatedAt,
				students: guardian.guardianStudents.map((link) => ({
					id: link.student.id,
					name: link.student.user.name,
					relation: link.relation,
				})),
			}),
		);
	}

	const rows = await prisma.student.findMany({
		where: studentWhere(search),
		select: {
			id: true,
			admissionNo: true,
			rollNo: true,
			grade: true,
			section: true,
			status: true,
			user: { select: { name: true, email: true, activatedAt: true } },
		},
		orderBy: [{ createdAt: "desc" }, { id: "asc" }],
		...range,
	});

	return rows.map(
		(student): DirectoryStudentRow => ({
			id: student.id,
			name: student.user.name,
			email: student.user.email,
			admissionNo: student.admissionNo,
			rollNo: student.rollNo,
			grade: student.grade,
			section: student.section,
			status: student.status,
			activatedAt: student.user.activatedAt,
		}),
	);
}

/**
 * Lists one directory tab at a time, one page at a time.
 *
 * The directory previously fetched every student, staff member and guardian on
 * each keystroke; a school with a thousand students then shipped a thousand
 * rows for a tab the administrator was not even looking at. Each tab is now a
 * separate counted, ranged query so the payload stays constant as the school
 * grows.
 *
 * The count runs first, so an out-of-range page (for example after a search
 * shrinks the result set) costs one query, not a wasted page fetch.
 */
export async function listDirectoryPage(options?: {
	tab?: DirectoryTab;
	search?: string;
	page?: number;
	pageSize?: number;
}): Promise<DirectoryPage> {
	const tab = options?.tab ?? "students";
	const search = normalizeSearch(options?.search);
	const pageSize = normalizePageSize(options?.pageSize);
	const requestedPage = Math.max(Math.floor(options?.page ?? 1), 1);

	const total = await countDirectoryRows(tab, search);

	if (total === 0) {
		return { tab, rows: [], total: 0, page: 1, pageSize, pageCount: 1 };
	}

	const pageCount = Math.max(Math.ceil(total / pageSize), 1);
	const page = Math.min(requestedPage, pageCount);
	const rows = await loadDirectoryRows(tab, search, page, pageSize);

	return { tab, rows, total, page, pageSize, pageCount };
}

/**
 * Lightweight student lookup for pickers.
 *
 * Only the fields a picker renders are selected, and the result is capped, so
 * enrolling, inviting a guardian or assigning a bus seat never downloads the
 * whole student body.
 */
export async function listStudentOptions(options?: {
	search?: string;
	limit?: number;
}): Promise<Array<StudentOption>> {
	const search = normalizeSearch(options?.search);
	const limit = Math.min(
		Math.max(Math.floor(options?.limit ?? DEFAULT_STUDENT_OPTION_LIMIT), 1),
		MAX_STUDENT_OPTION_LIMIT,
	);

	const rows = await prisma.student.findMany({
		where: {
			status: "ACTIVE",
			...(search ? studentWhere(search) : {}),
		},
		select: {
			id: true,
			grade: true,
			section: true,
			admissionNo: true,
			rollNo: true,
			user: { select: { name: true } },
		},
		orderBy: [{ user: { name: "asc" } }, { id: "asc" }],
		take: limit,
	});

	return rows.map((student) => ({
		id: student.id,
		name: student.user.name,
		grade: student.grade,
		section: student.section,
		admissionNo: student.admissionNo,
		rollNo: student.rollNo,
	}));
}
