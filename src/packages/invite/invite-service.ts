import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";
import { renderMailTemplate, sendMail } from "#/packages/notifications/mail.ts";

export const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 7;

export type InviteKind = "STAFF" | "STUDENT" | "GUARDIAN";

export interface InviteContext {
	organizationId: string;
	branchId: string;
}

export interface StaffInviteInput {
	name: string;
	email: string;
	designation?: string;
	department?: string;
	employeeId?: string;
	role?: "STAFF" | "ADMIN";
	context?: InviteContext;
	sendEmail?: boolean;
}

export interface StudentInviteInput {
	name: string;
	email: string;
	admissionNo?: string;
	rollNo?: string;
	grade?: string;
	section?: string;
	joinedAt?: Date | string | null;
	context?: InviteContext;
	sendEmail?: boolean;
}

export interface GuardianInviteInput {
	name: string;
	email: string;
	studentId: string;
	relation?: string;
	isPrimary?: boolean;
	sendEmail?: boolean;
}

export interface CreatedInvite {
	id: string;
	token: string;
	type: InviteKind;
	expiresAt: Date;
	url: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
	emailSent: boolean;
}

export class InviteError extends Error {
	constructor(
		message: string,
		public readonly code: string,
	) {
		super(message);
		this.name = "InviteError";
	}
}

export function normalizeEmail(email: string): string {
	return email.trim().toLowerCase();
}

export function generateInviteToken(): string {
	return crypto.randomUUID();
}

export function getInviteExpiryDate(now = new Date()): Date {
	return new Date(now.getTime() + INVITE_TTL_MS);
}

export function buildInviteUrl(
	token: string,
	kind: InviteKind = "STAFF",
): string {
	const baseUrl = serverEnv.APP_URL.replace(/\/$/, "");

	if (kind === "GUARDIAN") {
		return `${baseUrl}/activate/guardian/${token}`;
	}

	return `${baseUrl}/activate/${token}`;
}

export function slugify(value: string): string {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

/**
 * Resolves the organization/branch that invitations should be attached to.
 * It prefers the values from the environment and falls back to the first
 * record in the database so the app also works for custom deployments.
 */
export async function getDefaultInviteContext(): Promise<InviteContext> {
	const organization =
		(await prisma.organization.findUnique({
			where: { slug: serverEnv.ORGANIZATION_SLUG },
			select: { id: true },
		})) ??
		(await prisma.organization.findFirst({
			orderBy: { createdAt: "asc" },
			select: { id: true },
		}));

	if (!organization) {
		throw new InviteError(
			"No organization exists. Run `npm run db:seed` first.",
			"ORGANIZATION_NOT_FOUND",
		);
	}

	const branch =
		(await prisma.branch.findUnique({
			where: {
				organizationId_slug: {
					organizationId: organization.id,
					slug: serverEnv.DEFAULT_BRANCH_SLUG,
				},
			},
			select: { id: true },
		})) ??
		(await prisma.branch.findFirst({
			where: { organizationId: organization.id },
			orderBy: { createdAt: "asc" },
			select: { id: true },
		}));

	if (!branch) {
		throw new InviteError(
			"No branch exists for the organization. Run `npm run db:seed` first.",
			"BRANCH_NOT_FOUND",
		);
	}

	return {
		organizationId: organization.id,
		branchId: branch.id,
	};
}

async function sendInviteEmail({
	name,
	email,
	url,
	kind,
}: {
	name: string;
	email: string;
	url: string;
	kind: InviteKind;
}): Promise<boolean> {
	const roleLabel =
		kind === "STUDENT" ? "student" : kind === "GUARDIAN" ? "guardian" : "staff";

	const result = await sendMail({
		to: email,
		subject: `You have been invited to ${serverEnv.ORGANIZATION_NAME}`,
		html: renderMailTemplate({
			title: `Welcome, ${name}`,
			body: [
				`An account has been prepared for you as a ${roleLabel} at ${serverEnv.ORGANIZATION_NAME}.`,
				"Use the button below to choose a password and activate your account.",
				"This link expires in 7 days. If you were not expecting it, you can safely ignore this email.",
			],
			actionLabel: "Activate my account",
			actionUrl: url,
		}),
	});

	return result.success;
}

async function findActivatedUser(userId: string) {
	return prisma.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			name: true,
			email: true,
			activatedAt: true,
			accounts: {
				where: { providerId: "credential" },
				select: { id: true },
			},
		},
	});
}

function assertCanBeInvited(
	user: Awaited<ReturnType<typeof findActivatedUser>>,
) {
	if (!user) {
		throw new InviteError("User could not be created", "USER_NOT_FOUND");
	}

	if (user.activatedAt || user.accounts.length > 0) {
		throw new InviteError(
			`${user.email} already has an activated account.`,
			"USER_ALREADY_ACTIVATED",
		);
	}
}

async function revokeOpenInvites(userId: string) {
	const now = new Date();

	await prisma.$transaction([
		prisma.invite.updateMany({
			where: { userId, usedAt: null, expiresAt: { gt: now } },
			data: { usedAt: now },
		}),
		prisma.guardianInvite.updateMany({
			where: { userId, usedAt: null, expiresAt: { gt: now } },
			data: { usedAt: now },
		}),
	]);
}

export async function createStaffInvite(
	input: StaffInviteInput,
): Promise<CreatedInvite> {
	const email = normalizeEmail(input.email);
	const context = input.context ?? (await getDefaultInviteContext());

	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			id: crypto.randomUUID(),
			name: input.name.trim(),
			email,
			emailVerified: true,
		},
	});

	const withAccount = await findActivatedUser(user.id);
	assertCanBeInvited(withAccount);
	await revokeOpenInvites(user.id);

	await prisma.staff.upsert({
		where: { userId: user.id },
		update: {
			...(input.designation ? { designation: input.designation } : {}),
			...(input.department !== undefined
				? { department: input.department || null }
				: {}),
			...(input.employeeId !== undefined
				? { employeeId: input.employeeId || null }
				: {}),
		},
		create: {
			userId: user.id,
			organizationId: context.organizationId,
			branchId: context.branchId,
			designation: input.designation?.trim() || "Staff",
			department: input.department?.trim() || null,
			employeeId: input.employeeId?.trim() || null,
			joinedAt: new Date(),
		},
	});

	const role = input.role === "ADMIN" ? "ADMIN" : "STAFF";

	await prisma.userRole.upsert({
		where: {
			userId_organizationId_role: {
				userId: user.id,
				organizationId: context.organizationId,
				role,
			},
		},
		update: { branchId: context.branchId },
		create: {
			userId: user.id,
			organizationId: context.organizationId,
			branchId: context.branchId,
			role,
		},
	});

	const token = generateInviteToken();
	const expiresAt = getInviteExpiryDate();

	const invite = await prisma.invite.create({
		data: {
			token,
			userId: user.id,
			type: "STAFF",
			expiresAt,
		},
	});

	const url = buildInviteUrl(token, "STAFF");
	const emailSent = input.sendEmail
		? await sendInviteEmail({
				name: user.name,
				email: user.email,
				url,
				kind: "STAFF",
			})
		: false;

	return {
		id: invite.id,
		token,
		type: "STAFF",
		expiresAt,
		url,
		user: { id: user.id, name: user.name, email: user.email },
		emailSent,
	};
}

export async function createStudentInvite(
	input: StudentInviteInput,
): Promise<CreatedInvite> {
	const email = normalizeEmail(input.email);
	const context = input.context ?? (await getDefaultInviteContext());

	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			id: crypto.randomUUID(),
			name: input.name.trim(),
			email,
			emailVerified: true,
		},
	});

	const withAccount = await findActivatedUser(user.id);
	assertCanBeInvited(withAccount);
	await revokeOpenInvites(user.id);

	let joinedAt: Date | null = null;

	if (input.joinedAt) {
		const parsed =
			input.joinedAt instanceof Date
				? input.joinedAt
				: new Date(input.joinedAt);
		joinedAt = Number.isNaN(parsed.getTime()) ? null : parsed;
	}

	await prisma.student.upsert({
		where: { userId: user.id },
		update: {
			...(input.admissionNo !== undefined
				? { admissionNo: input.admissionNo || null }
				: {}),
			...(input.rollNo !== undefined ? { rollNo: input.rollNo || null } : {}),
			...(input.grade !== undefined ? { grade: input.grade || null } : {}),
			...(input.section !== undefined
				? { section: input.section || null }
				: {}),
			...(joinedAt ? { joinedAt } : {}),
		},
		create: {
			userId: user.id,
			organizationId: context.organizationId,
			branchId: context.branchId,
			admissionNo: input.admissionNo?.trim() || null,
			rollNo: input.rollNo?.trim() || null,
			grade: input.grade?.trim() || null,
			section: input.section?.trim() || null,
			joinedAt,
		},
	});

	await prisma.userRole.upsert({
		where: {
			userId_organizationId_role: {
				userId: user.id,
				organizationId: context.organizationId,
				role: "STUDENT",
			},
		},
		update: { branchId: context.branchId },
		create: {
			userId: user.id,
			organizationId: context.organizationId,
			branchId: context.branchId,
			role: "STUDENT",
		},
	});

	const token = generateInviteToken();
	const expiresAt = getInviteExpiryDate();

	const invite = await prisma.invite.create({
		data: {
			token,
			userId: user.id,
			type: "STUDENT",
			expiresAt,
		},
	});

	const url = buildInviteUrl(token, "STUDENT");
	const emailSent = input.sendEmail
		? await sendInviteEmail({
				name: user.name,
				email: user.email,
				url,
				kind: "STUDENT",
			})
		: false;

	return {
		id: invite.id,
		token,
		type: "STUDENT",
		expiresAt,
		url,
		user: { id: user.id, name: user.name, email: user.email },
		emailSent,
	};
}

export async function createGuardianInvite(
	input: GuardianInviteInput,
): Promise<CreatedInvite> {
	const email = normalizeEmail(input.email);

	const student = await prisma.student.findUnique({
		where: { id: input.studentId },
		select: {
			id: true,
			organizationId: true,
			branchId: true,
			user: { select: { name: true } },
		},
	});

	if (!student) {
		throw new InviteError("Student not found", "STUDENT_NOT_FOUND");
	}

	const user = await prisma.user.upsert({
		where: { email },
		update: {},
		create: {
			id: crypto.randomUUID(),
			name: input.name.trim(),
			email,
			emailVerified: true,
		},
	});

	const withAccount = await findActivatedUser(user.id);
	assertCanBeInvited(withAccount);
	await revokeOpenInvites(user.id);

	const guardian = await prisma.guardian.upsert({
		where: { userId: user.id },
		update: {},
		create: { userId: user.id },
	});

	const relation = input.relation?.trim() || "Guardian";

	await prisma.guardianStudent.upsert({
		where: {
			guardianId_studentId: {
				guardianId: guardian.id,
				studentId: student.id,
			},
		},
		update: {
			relation,
			isPrimary: input.isPrimary ?? false,
		},
		create: {
			guardianId: guardian.id,
			studentId: student.id,
			relation,
			isPrimary: input.isPrimary ?? false,
		},
	});

	await prisma.userRole.upsert({
		where: {
			userId_organizationId_role: {
				userId: user.id,
				organizationId: student.organizationId,
				role: "GUARDIAN",
			},
		},
		update: {},
		create: {
			userId: user.id,
			organizationId: student.organizationId,
			branchId: student.branchId,
			role: "GUARDIAN",
		},
	});

	const token = generateInviteToken();
	const expiresAt = getInviteExpiryDate();

	const invite = await prisma.guardianInvite.create({
		data: {
			token,
			userId: user.id,
			studentId: student.id,
			relation,
			isPrimary: input.isPrimary ?? false,
			expiresAt,
		},
	});

	const url = buildInviteUrl(token, "GUARDIAN");
	const emailSent = input.sendEmail
		? await sendInviteEmail({
				name: user.name,
				email: user.email,
				url,
				kind: "GUARDIAN",
			})
		: false;

	return {
		id: invite.id,
		token,
		type: "GUARDIAN",
		expiresAt,
		url,
		user: { id: user.id, name: user.name, email: user.email },
		emailSent,
	};
}

export interface InviteListFilters {
	type?: InviteKind;
	includeUsed?: boolean;
	organizationId?: string;
	search?: string;
	limit?: number;
}

export async function listInvites(filters: InviteListFilters = {}) {
	const limit = Math.min(Math.max(filters.limit ?? 100, 1), 500);
	const usedFilter = filters.includeUsed
		? {}
		: { usedAt: null, expiresAt: { gt: new Date() } };
	const search = filters.search?.trim();
	const userSearch = search
		? {
				user: {
					OR: [
						{ name: { contains: search, mode: "insensitive" as const } },
						{ email: { contains: search, mode: "insensitive" as const } },
					],
				},
			}
		: {};

	const [staffAndStudent, guardian] = await Promise.all([
		filters.type === "GUARDIAN"
			? Promise.resolve([])
			: prisma.invite.findMany({
					where: {
						...(filters.type ? { type: filters.type } : {}),
						...usedFilter,
						...userSearch,
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								activatedAt: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: limit,
				}),
		filters.type === "STAFF" || filters.type === "STUDENT"
			? Promise.resolve([])
			: prisma.guardianInvite.findMany({
					where: {
						...usedFilter,
						...userSearch,
					},
					include: {
						user: {
							select: {
								id: true,
								name: true,
								email: true,
								activatedAt: true,
							},
						},
						student: {
							select: {
								id: true,
								user: { select: { name: true } },
								grade: true,
								section: true,
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: limit,
				}),
	]);

	return [
		...staffAndStudent.map((invite) => ({
			id: invite.id,
			token: invite.token,
			type: invite.type as InviteKind,
			expiresAt: invite.expiresAt,
			usedAt: invite.usedAt,
			createdAt: invite.createdAt,
			url: buildInviteUrl(invite.token, invite.type),
			user: invite.user,
			student: null,
		})),
		...guardian
			.filter((invite) => invite.user !== null)
			.map((invite) => ({
				id: invite.id,
				token: invite.token,
				type: "GUARDIAN" as InviteKind,
				expiresAt: invite.expiresAt,
				usedAt: invite.usedAt,
				createdAt: invite.createdAt,
				url: buildInviteUrl(invite.token, "GUARDIAN"),
				user: invite.user as {
					id: string;
					name: string;
					email: string;
					activatedAt: Date | null;
				},
				student: invite.student
					? {
							id: invite.student.id,
							name: invite.student.user.name,
							grade: invite.student.grade,
							section: invite.student.section,
						}
					: null,
			})),
	].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function revokeInvite(input: {
	id: string;
	type: InviteKind;
}): Promise<{ success: true }> {
	const now = new Date();

	if (input.type === "GUARDIAN") {
		const result = await prisma.guardianInvite.updateMany({
			where: { id: input.id, usedAt: null },
			data: { usedAt: now },
		});

		if (result.count === 0) {
			throw new InviteError(
				"Invitation was not found or is already inactive",
				"INVITE_NOT_ACTIVE",
			);
		}

		return { success: true };
	}

	const result = await prisma.invite.updateMany({
		where: { id: input.id, usedAt: null },
		data: { usedAt: now },
	});

	if (result.count === 0) {
		throw new InviteError(
			"Invitation was not found or is already inactive",
			"INVITE_NOT_ACTIVE",
		);
	}

	return { success: true };
}

export async function getInviteByToken(token: string) {
	return prisma.invite.findUnique({
		where: { token },
		include: { user: true },
	});
}

export async function getGuardianInviteByToken(token: string) {
	return prisma.guardianInvite.findUnique({
		where: { token },
		include: {
			user: true,
			student: { include: { user: true } },
		},
	});
}

export type InviteListEntry = Awaited<ReturnType<typeof listInvites>>[number];
