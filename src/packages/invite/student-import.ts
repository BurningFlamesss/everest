import { buildImportServer } from "./import-shared.ts";

/**
 * Bulk-import students from a mapped CSV: validates each row, creates a
 * STUDENT invite per valid row, and emails activation links. Returns a per-row
 * result so the wizard can render an accurate error report.
 */
export const importStudentInvites = buildImportServer("STUDENT");

/** Field definitions for the student CSV wizard (with header aliases). */
export const STUDENT_IMPORT_FIELDS = [
	{
		key: "firstName",
		label: "First name",
		required: true,
		aliases: ["first name", "firstname", "given name", "first"],
	},
	{
		key: "lastName",
		label: "Last name",
		required: true,
		aliases: ["last name", "lastname", "surname", "family name"],
	},
	{
		key: "email",
		label: "Email",
		required: true,
		aliases: ["email", "email address", "student email"],
	},
	{
		key: "grade",
		label: "Grade",
		required: false,
		aliases: ["grade", "class", "year", "standard"],
	},
	{
		key: "section",
		label: "Section",
		required: false,
		aliases: ["section", "division"],
	},
	{
		key: "rollNo",
		label: "Roll no",
		required: false,
		aliases: ["roll no", "roll", "roll number", "rollno"],
	},
] as const;

export const STUDENT_SAMPLE_CSV = `First Name,Last Name,Email,Grade,Section,Roll No
Noor,Hassan,noor.hassan@student.everest.edu,Grade 7,A,1
Elias,Duarte,elias.duarte@student.everest.edu,Grade 9,B,4
Ivy,Kimura,ivy.kimura@student.everest.edu,Grade 6,C,2`;
