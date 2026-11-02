import { describe, expect, it } from "vitest";
import { z } from "zod";
import { CSVParseError } from "./errors";
import { normalizeRows } from "./normalize";
import { parseCSV } from "./parser";
import {
	getImportableRows,
	isPreviewImportable,
	missingRequiredFields,
	suggestMapping,
	validateRows,
} from "./preview";
import type { ImportConfig, NormalizedRow } from "./types";

describe("parseCSV", () => {
	it("splits the header from the data rows", () => {
		const parsed = parseCSV(
			"name,email\nAarav,aarav@example.com\nMaya,maya@example.com",
		);

		expect(parsed.headers).toEqual(["name", "email"]);
		expect(parsed.rows).toHaveLength(2);
		expect(parsed.rows[0]).toEqual(["Aarav", "aarav@example.com"]);
	});

	it("skips empty lines", () => {
		const parsed = parseCSV("name,email\n\nAarav,aarav@example.com\n\n");

		expect(parsed.rows).toHaveLength(1);
	});

	it("throws a structured error for malformed quotes", () => {
		expect(() => parseCSV('name,email\n"Aarav,aarav@example.com')).toThrow(
			CSVParseError,
		);
	});
});

describe("normalizeRows", () => {
	const headers = ["Student Name", "Email", "Class"];
	const rows = [
		["  Aarav Sharma ", " AARAV@Example.com ", " Grade 10 "],
		["", "\u200Bmaya@example.com\uFEFF", ""],
	];

	it("maps columns, trims values and normalizes email addresses", () => {
		const normalized = normalizeRows(headers, rows, {
			name: "Student Name",
			email: "Email",
			grade: "Class",
		});

		expect(normalized[0]).toMatchObject({
			name: "Aarav Sharma",
			email: "aarav@example.com",
			grade: "Grade 10",
			__rowIndex: 0,
		});
	});

	it("converts empty values to null and strips zero-width characters", () => {
		const normalized = normalizeRows(headers, rows, {
			name: "Student Name",
			email: "Email",
			grade: "Class",
		});

		expect(normalized[1].name).toBeNull();
		expect(normalized[1].grade).toBeNull();
		expect(normalized[1].email).toBe("maya@example.com");
	});
});

function row(
	__rowIndex: number,
	values: Record<string, string | null>,
): NormalizedRow {
	return { ...values, __rowIndex } as unknown as NormalizedRow;
}

const config: ImportConfig<{
	name: string;
	email: string;
	grade?: string | null;
}> = {
	name: "Students",
	schema: z.object({
		name: z.string().min(1),
		email: z.string().email(),
		grade: z.string().nullable().optional(),
	}),
	fieldSuggestions: {
		name: ["name", "student name"],
		email: ["email", "e-mail"],
		grade: ["grade", "class"],
	},
	requiredFields: ["name", "email"],
	optionalFields: ["grade"],
	warningRules: (rows) =>
		rows
			.filter((row) => !row.grade)
			.map((row) => ({
				row: row.__rowIndex + 2,
				field: "grade",
				code: "MISSING_GRADE",
				message: "No grade supplied",
			})),
};

describe("preview helpers", () => {
	it("suggests mappings from the configured header aliases", () => {
		const mapping = suggestMapping(["Student Name", "E-mail", "Class"], config);

		expect(mapping).toEqual({
			name: "Student Name",
			email: "E-mail",
			grade: "Class",
		});
	});

	it("reports missing required mappings", () => {
		expect(missingRequiredFields({ name: "Name" }, config)).toEqual(["email"]);
	});

	it("validates rows and produces a summary", () => {
		const preview = validateRows(config, [
			row(0, { name: "Aarav", email: "aarav@example.com", grade: "10" }),
			row(1, { name: "Maya", email: "not-an-email", grade: null }),
			row(2, { name: null, email: "niran@example.com", grade: "11" }),
		]);

		expect(preview.summary).toEqual({
			totalRows: 3,
			readyRows: 1,
			errorRows: 2,
			warningRows: 0,
		});
		expect(
			preview.rows[1].errors.some((error) => error.code === "INVALID_VALUE"),
		).toBe(true);
		expect(
			preview.rows[2].errors.some((error) => error.code === "REQUIRED_FIELD"),
		).toBe(true);
		expect(isPreviewImportable(preview)).toBe(false);
		expect(getImportableRows(preview)).toHaveLength(1);
	});

	it("treats warning-only rows as importable", () => {
		const preview = validateRows(config, [
			row(0, { name: "Aarav", email: "aarav@example.com", grade: null }),
		]);

		expect(preview.rows[0].status).toBe("WARNING");
		expect(preview.summary.warningRows).toBe(1);
		expect(isPreviewImportable(preview)).toBe(true);
	});
});
