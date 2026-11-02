import { z } from "zod";
import { ImportWizard } from "#/components/imports/ImportWizard.tsx";
import type { ImportConfig, ImportWarning } from "#/packages/csv/types.ts";
import { importStaffAction } from "#/packages/invite/server.ts";

const staffRowSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Enter a valid email address"),
	designation: z.string().trim().nullable().optional(),
	department: z.string().trim().nullable().optional(),
	employeeId: z.string().trim().nullable().optional(),
	role: z.enum(["STAFF", "ADMIN"]).nullable().optional(),
});

export type StaffImportRow = z.infer<typeof staffRowSchema>;

export const staffImportConfig: ImportConfig<StaffImportRow> = {
	name: "Staff",
	schema: staffRowSchema,
	fieldSuggestions: {
		name: ["name", "staff name", "full name", "fullname"],
		email: ["email", "staff email", "e-mail", "email address"],
		designation: ["designation", "title", "job title", "position"],
		department: ["department", "dept", "faculty"],
		employeeId: ["employee id", "employeeid", "staff id", "staff id no"],
		role: ["role", "access level", "type"],
	},
	requiredFields: ["name", "email"],
	optionalFields: ["designation", "department", "employeeId", "role"],
	warningRules: (rows) =>
		rows.flatMap((row) => {
			const warnings: Array<ImportWarning> = [];

			if (!row.designation) {
				warnings.push({
					row: row.__rowIndex + 2,
					field: "designation",
					code: "MISSING_DESIGNATION",
					message: "No designation supplied; defaulting to Staff",
				});
			}

			if (
				row.role &&
				row.role.toUpperCase() !== "STAFF" &&
				row.role.toUpperCase() !== "ADMIN"
			) {
				warnings.push({
					row: row.__rowIndex + 2,
					field: "role",
					code: "INVALID_ROLE",
					message: "Unknown role; defaulting to Staff",
				});
			}

			return warnings;
		}),
};

export const STAFF_IMPORT_SAMPLE = `name,email,designation,department,employeeId,role
Suman Thapa,suman.thapa@example.com,Mathematics Teacher,Science,EMP-201,STAFF
Rita Karki,rita.karki@example.com,Administrative Officer,Administration,EMP-202,ADMIN
Bikash Shrestha,bikash.shrestha@example.com,Lab Assistant,Science,EMP-203,STAFF`;

export interface StaffImportProps {
	onImported?: (count: number) => void;
}

export function StaffImport({ onImported }: StaffImportProps = {}) {
	return (
		<ImportWizard
			config={staffImportConfig}
			sampleCsv={STAFF_IMPORT_SAMPLE}
			title="Import staff"
			description="Bulk-create staff accounts from a CSV. Use the role column to grant admin access; everyone else is created as staff."
			onImport={async (rows, sendEmail) => {
				const result = await importStaffAction({
					data: { rows, sendEmail },
				});

				if (result.success) {
					onImported?.(result.created.length);
					return result;
				}

				return { success: false, error: result.error, created: [], errors: [] };
			}}
		/>
	);
}

export default StaffImport;
