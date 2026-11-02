import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	MANAGEMENT_ROLES,
	requireManagementUser,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	createGuardianInvite,
	createStaffInvite,
	createStudentInvite,
	InviteError,
	listInvites,
	revokeInvite,
} from "#/packages/invite/invite-service.ts";

async function getCurrentUser() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requireManagementUser(session.user.id);

	return session.user;
}

function toActionError(error: unknown) {
	if (error instanceof InviteError) {
		return { success: false as const, error: error.message, code: error.code };
	}

	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Invite action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

const emailSchema = z.string().trim().email("Enter a valid email address");

const staffInviteSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: emailSchema,
	designation: z.string().trim().optional(),
	department: z.string().trim().optional(),
	employeeId: z.string().trim().optional(),
	role: z.enum(["STAFF", "ADMIN"]).optional(),
	sendEmail: z.boolean().optional(),
});

export const createStaffInviteAction = createServerFn()
	.validator(staffInviteSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();
			const invite = await createStaffInvite(data);

			return { success: true as const, invite };
		} catch (error) {
			return toActionError(error);
		}
	});

const studentInviteSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: emailSchema,
	admissionNo: z.string().trim().optional(),
	rollNo: z.string().trim().optional(),
	grade: z.string().trim().optional(),
	section: z.string().trim().optional(),
	joinedAt: z.string().trim().optional(),
	sendEmail: z.boolean().optional(),
});

export const createStudentInviteAction = createServerFn()
	.validator(studentInviteSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();
			const invite = await createStudentInvite(data);

			return { success: true as const, invite };
		} catch (error) {
			return toActionError(error);
		}
	});

const guardianInviteSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: emailSchema,
	studentId: z.string().trim().min(1, "Student is required"),
	relation: z.string().trim().optional(),
	isPrimary: z.boolean().optional(),
	sendEmail: z.boolean().optional(),
});

export const createGuardianInviteAction = createServerFn()
	.validator(guardianInviteSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();
			const invite = await createGuardianInvite(data);

			return { success: true as const, invite };
		} catch (error) {
			return toActionError(error);
		}
	});

const listInvitesSchema = z
	.object({
		type: z.enum(["STAFF", "STUDENT", "GUARDIAN"]).optional(),
		includeUsed: z.boolean().optional(),
		search: z.string().trim().optional(),
	})
	.optional();

export const listInvitesAction = createServerFn()
	.validator(listInvitesSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();
			const invites = await listInvites(data ?? {});

			return { success: true as const, invites };
		} catch (error) {
			return toActionError(error);
		}
	});

const revokeInviteSchema = z.object({
	id: z.string().min(1),
	type: z.enum(["STAFF", "STUDENT", "GUARDIAN"]),
});

export const revokeInviteAction = createServerFn()
	.validator(revokeInviteSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();
			await revokeInvite(data);

			return { success: true as const };
		} catch (error) {
			return toActionError(error);
		}
	});

const importRowSchema = z.record(z.string(), z.union([z.string(), z.null()]));

const importStudentsSchema = z.object({
	rows: z.array(importRowSchema).min(1).max(500),
	sendEmail: z.boolean().optional(),
});

export const importStudentsAction = createServerFn()
	.validator(importStudentsSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();

			const created: Array<{
				name: string;
				email: string;
				token: string;
				url: string;
			}> = [];
			const errors: Array<{ row: number; email: string; message: string }> = [];
			const seen = new Set<string>();

			for (const [index, row] of data.rows.entries()) {
				const name = row.name?.trim() ?? "";
				const email = row.email?.trim().toLowerCase() ?? "";

				if (!name || !email) {
					errors.push({
						row: index + 1,
						email,
						message: "Name and email are required",
					});
					continue;
				}

				if (seen.has(email)) {
					errors.push({
						row: index + 1,
						email,
						message: "Duplicate email in this file",
					});
					continue;
				}

				seen.add(email);

				try {
					const invite = await createStudentInvite({
						name,
						email,
						admissionNo: row.admissionNo ?? undefined,
						rollNo: row.rollNo ?? undefined,
						grade: row.grade ?? undefined,
						section: row.section ?? undefined,
						joinedAt: row.joinedAt ?? undefined,
						sendEmail: data.sendEmail,
					});

					created.push({
						name: invite.user.name,
						email: invite.user.email,
						token: invite.token,
						url: invite.url,
					});
				} catch (error) {
					errors.push({
						row: index + 1,
						email,
						message:
							error instanceof Error
								? error.message
								: "Could not create invite",
					});
				}
			}

			return {
				success: true as const,
				created,
				errors,
			};
		} catch (error) {
			return toActionError(error);
		}
	});

const importStaffSchema = z.object({
	rows: z.array(importRowSchema).min(1).max(500),
	sendEmail: z.boolean().optional(),
});

export const importStaffAction = createServerFn()
	.validator(importStaffSchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();

			const created: Array<{
				name: string;
				email: string;
				token: string;
				url: string;
			}> = [];
			const errors: Array<{ row: number; email: string; message: string }> = [];
			const seen = new Set<string>();

			for (const [index, row] of data.rows.entries()) {
				const name = row.name?.trim() ?? "";
				const email = row.email?.trim().toLowerCase() ?? "";

				if (!name || !email) {
					errors.push({
						row: index + 1,
						email,
						message: "Name and email are required",
					});
					continue;
				}

				if (seen.has(email)) {
					errors.push({
						row: index + 1,
						email,
						message: "Duplicate email in this file",
					});
					continue;
				}

				seen.add(email);

				try {
					const invite = await createStaffInvite({
						name,
						email,
						designation: row.designation ?? undefined,
						department: row.department ?? undefined,
						employeeId: row.employeeId ?? undefined,
						role: row.role === "ADMIN" ? "ADMIN" : "STAFF",
						sendEmail: data.sendEmail,
					});

					created.push({
						name: invite.user.name,
						email: invite.user.email,
						token: invite.token,
						url: invite.url,
					});
				} catch (error) {
					errors.push({
						row: index + 1,
						email,
						message:
							error instanceof Error
								? error.message
								: "Could not create invite",
					});
				}
			}

			return {
				success: true as const,
				created,
				errors,
			};
		} catch (error) {
			return toActionError(error);
		}
	});

const directorySchema = z
	.object({
		search: z.string().trim().optional(),
		status: z.string().trim().optional(),
	})
	.optional();

export const listDirectoryAction = createServerFn()
	.validator(directorySchema)
	.handler(async ({ data }) => {
		try {
			await getCurrentUser();

			const search = data?.search?.trim();
			const status = data?.status?.trim();

			const [students, staff, guardians] = await Promise.all([
				prisma.student.findMany({
					where: {
						...(status ? { status: status as "ACTIVE" } : {}),
						...(search
							? {
									OR: [
										{
											user: {
												name: {
													contains: search,
													mode: "insensitive" as const,
												},
											},
										},
										{
											user: {
												email: {
													contains: search,
													mode: "insensitive" as const,
												},
											},
										},
										{
											admissionNo: {
												contains: search,
												mode: "insensitive" as const,
											},
										},
									],
								}
							: {}),
					},
					include: { user: true },
					orderBy: { createdAt: "desc" },
					take: 200,
				}),
				prisma.staff.findMany({
					where: {
						...(status ? { status: status as "ACTIVE" } : {}),
						...(search
							? {
									OR: [
										{
											user: {
												name: {
													contains: search,
													mode: "insensitive" as const,
												},
											},
										},
										{
											user: {
												email: {
													contains: search,
													mode: "insensitive" as const,
												},
											},
										},
										{
											employeeId: {
												contains: search,
												mode: "insensitive" as const,
											},
										},
									],
								}
							: {}),
					},
					include: { user: true },
					orderBy: { createdAt: "desc" },
					take: 200,
				}),
				prisma.guardian.findMany({
					where: search
						? {
								user: {
									OR: [
										{
											name: { contains: search, mode: "insensitive" as const },
										},
										{
											email: {
												contains: search,
												mode: "insensitive" as const,
											},
										},
									],
								},
							}
						: undefined,
					include: {
						user: true,
						guardianStudents: {
							include: {
								student: { include: { user: true } },
							},
						},
					},
					orderBy: { createdAt: "desc" },
					take: 200,
				}),
			]);

			return {
				success: true as const,
				students: students.map((student) => ({
					id: student.id,
					name: student.user.name,
					email: student.user.email,
					admissionNo: student.admissionNo,
					rollNo: student.rollNo,
					grade: student.grade,
					section: student.section,
					status: student.status,
					activatedAt: student.user.activatedAt,
				})),
				staff: staff.map((member) => ({
					id: member.id,
					name: member.user.name,
					email: member.user.email,
					employeeId: member.employeeId,
					designation: member.designation,
					department: member.department,
					status: member.status,
					activatedAt: member.user.activatedAt,
				})),
				guardians: guardians.map((guardian) => ({
					id: guardian.id,
					name: guardian.user.name,
					email: guardian.user.email,
					activatedAt: guardian.user.activatedAt,
					students: guardian.guardianStudents.map((link) => ({
						id: link.student.id,
						name: link.student.user.name,
						relation: link.relation,
					})),
				})),
				roles: [...MANAGEMENT_ROLES],
			};
		} catch (error) {
			return toActionError(error);
		}
	});
