import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAdmin } from "#/packages/auth/server/guard.ts";
import { prisma } from "#/packages/db/index.ts";
import { issueUserInvite } from "#/packages/invite/invite-service.ts";

/**
 * Shared row shape for a single CSV import line after field mapping. Each
 * import flow validates these and turns them into invites, collecting a
 * per-row result so the wizard can show exactly which rows failed and why.
 */
export const ImportRowSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.string().email("A valid email is required"),
	grade: z.string().optional(),
	section: z.string().optional(),
	designation: z.string().optional(),
	department: z.string().optional(),
	rollNo: z.string().optional(),
	employeeId: z.string().optional(),
});
export type ImportRow = z.infer<typeof ImportRowSchema>;

export interface RowResult {
	/** 1-based index into the submitted rows array. */
	index: number;
	email: string;
	name: string;
	ok: boolean;
	/** Machine reason when ok is false. */
	reason?: string;
	/** Invite URL when created (fallback if the email couldn't be sent). */
	inviteUrl?: string;
	emailed?: boolean;
}

export interface ImportSummary {
	total: number;
	created: number;
	skipped: number;
	emailed: number;
	results: RowResult[];
}

const ImportRequestSchema = z.object({
	rows: z.array(z.record(z.string(), z.unknown())),
});

/**
 * Validate rows and create invites for each, continuing past individual
 * failures so one bad row never aborts the batch. Duplicate emails (within the
 * file and against existing users) are skipped with a clear reason.
 */
export function buildImportServer(type: "STUDENT" | "STAFF") {
	return createServerFn({ method: "POST" })
		.middleware([requireAdmin])
		.validator(ImportRequestSchema)
		.handler(async ({ data }): Promise<ImportSummary> => {
			const results: RowResult[] = [];
			const seenEmails = new Set<string>();

			for (let i = 0; i < data.rows.length; i++) {
				const raw = data.rows[i];
				const parsed = ImportRowSchema.safeParse(raw);
				const emailGuess = typeof raw.email === "string" ? raw.email : "";
				const nameGuess = [raw.firstName, raw.lastName]
					.filter((v): v is string => typeof v === "string")
					.join(" ")
					.trim();

				if (!parsed.success) {
					const reason = parsed.error.issues
						.map((iss) => iss.message)
						.join("; ");
					results.push({
						index: i,
						email: emailGuess,
						name: nameGuess,
						ok: false,
						reason,
					});
					continue;
				}

				const row = parsed.data;
				const email = row.email.toLowerCase();
				const name = `${row.firstName} ${row.lastName}`.trim();

				if (seenEmails.has(email)) {
					results.push({
						index: i,
						email,
						name,
						ok: false,
						reason: "Duplicate email within this file",
					});
					continue;
				}
				seenEmails.add(email);

				const existing = await prisma.user.findUnique({ where: { email } });
				if (existing?.activatedAt) {
					results.push({
						index: i,
						email,
						name,
						ok: false,
						reason: "An active account already uses this email",
					});
					continue;
				}

				try {
					const out = await issueUserInvite({
						name,
						email,
						type,
						payload: {
							grade: row.grade,
							section: row.section,
							rollNo: row.rollNo,
							designation: row.designation,
							department: row.department,
							employeeId: row.employeeId,
						},
					});
					results.push({
						index: i,
						email,
						name,
						ok: true,
						inviteUrl: out.inviteUrl,
						emailed: out.emailed,
						reason: out.emailed ? undefined : out.reason,
					});
				} catch (err) {
					results.push({
						index: i,
						email,
						name,
						ok: false,
						reason:
							err instanceof Error ? err.message : "Failed to create invite",
					});
				}
			}

			const created = results.filter((r) => r.ok).length;
			const emailed = results.filter((r) => r.ok && r.emailed).length;
			return {
				total: data.rows.length,
				created,
				skipped: results.length - created,
				emailed,
				results,
			};
		});
}
