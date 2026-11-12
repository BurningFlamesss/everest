import { buildImportServer } from "./import-shared.ts";

/**
 * Bulk-import staff from a mapped CSV: validates each row, creates a STAFF
 * invite per valid row, and emails activation links. Returns a per-row result
 * so the wizard can render an accurate error report.
 */
export const importStaffInvites = buildImportServer("STAFF");

/** Field definitions for the staff CSV wizard (with header aliases). */
export const STAFF_IMPORT_FIELDS = [
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
		aliases: ["email", "email address", "work email"],
	},
	{
		key: "designation",
		label: "Designation",
		required: false,
		aliases: ["designation", "role", "title", "position"],
	},
	{
		key: "department",
		label: "Department",
		required: false,
		aliases: ["department", "dept", "faculty"],
	},
	{
		key: "employeeId",
		label: "Employee ID",
		required: false,
		aliases: ["employee id", "employeeid", "emp id", "staff id"],
	},
] as const;

export const STAFF_SAMPLE_CSV = `First Name,Last Name,Email,Designation,Department,Employee ID
Sita,Sharma,sita.sharma@everest.edu,Mathematics Teacher,Mathematics,EMP-001
Binod,Adhikari,binod.adhikari@everest.edu,Science Teacher,Science,EMP-002
Rita,Karki,rita.karki@everest.edu,Accountant,Administration,EMP-003`;
