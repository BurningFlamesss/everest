import { z } from "zod";
import { ImportWizard } from "#/components/imports/ImportWizard.tsx";
import type { ImportConfig, ImportWarning } from "#/packages/csv/types.ts";
import { importStudentsAction } from "#/packages/invite/server.ts";

const studentRowSchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.string().trim().email("Enter a valid email address"),
	admissionNo: z.string().trim().nullable().optional(),
	rollNo: z.string().trim().nullable().optional(),
	grade: z.string().trim().nullable().optional(),
	section: z.string().trim().nullable().optional(),
	joinedAt: z.string().trim().nullable().optional(),
});

export type StudentImportRow = z.infer<typeof studentRowSchema>;

export const studentImportConfig: ImportConfig<StudentImportRow> = {
	name: "Students",
	schema: studentRowSchema,
	fieldSuggestions: {
		name: ["name", "student name", "full name", "fullname"],
		email: ["email", "student email", "e-mail", "email address"],
		admissionNo: [
			"admission no",
			"admissionno",
			"admission number",
			"admission_no",
		],
		rollNo: ["roll no", "rollno", "roll number", "roll_no"],
		grade: ["grade", "class", "level", "year"],
		section: ["section", "sec", "division"],
		joinedAt: [
			"joined at",
			"joinedat",
			"admission date",
			"joined date",
			"date",
		],
	},
	requiredFields: ["name", "email"],
	optionalFields: ["admissionNo", "rollNo", "grade", "section", "joinedAt"],
	warningRules: (rows) =>
		rows.flatMap((row) => {
			const warnings: Array<ImportWarning> = [];

			if (!row.grade) {
				warnings.push({
					row: row.__rowIndex + 2,
					field: "grade",
					code: "MISSING_GRADE",
					message: "No grade/class supplied",
				});
			}

			if (!row.section) {
				warnings.push({
					row: row.__rowIndex + 2,
					field: "section",
					code: "MISSING_SECTION",
					message: "No section supplied",
				});
			}

			return warnings;
		}),
};

export const STUDENT_IMPORT_SAMPLE = `name,email,admissionNo,rollNo,grade,section,joinedAt
Aarav Sharma,aarav.sharma@example.com,ADM-1001,12,Grade 10,A,2026-04-14
Sara Tamang,sara.tamang@example.com,ADM-1002,13,Grade 10,B,2026-04-14
Niran Rai,niran.rai@example.com,ADM-1003,14,Grade 11,A,2026-04-15`;

export interface StudentImportProps {
	onImported?: (count: number) => void;
}

export function StudentImport({ onImported }: StudentImportProps = {}) {
	return (
		<ImportWizard
			config={studentImportConfig}
			sampleCsv={STUDENT_IMPORT_SAMPLE}
			title="Import students"
			description="Upload a CSV to create student records and email activation links in one pass. Rows with errors are skipped."
			onImport={async (rows, sendEmail) => {
				const result = await importStudentsAction({
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

export default StudentImport;
