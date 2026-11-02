import type { PrismaClient } from "#/generated/prisma/client";
import { normalizeRows } from "./normalize";
import type { ParsedCSV } from "./parser";
import type {
	FieldMapping,
	ImportConfig,
	ImportContext,
	ImportError,
	ImportPreview,
	ImportWarning,
	NormalizedRow,
	PreviewRow,
} from "./types";

const MAX_PREVIEW_ROWS = 1000;

export interface PreviewOptions {
	prisma?: PrismaClient;
	context?: ImportContext;
}

function rowNumberFor(row: NormalizedRow): number {
	return row.__rowIndex + 2;
}

function toRawRecord(
	headers: Array<string>,
	row: Array<string>,
): Record<string, string> {
	return headers.reduce<Record<string, string>>((record, header, index) => {
		record[header] = row[index] ?? "";
		return record;
	}, {});
}

export function suggestMapping(
	headers: Array<string>,
	config: ImportConfig,
): FieldMapping {
	const normalizedHeaders = new Map(
		headers.map((header) => [header.trim().toLowerCase(), header]),
	);
	const mapping: FieldMapping = {};

	for (const [field, suggestions] of Object.entries(config.fieldSuggestions)) {
		const match = suggestions.find((suggestion) =>
			normalizedHeaders.has(suggestion.trim().toLowerCase()),
		);

		if (match) {
			mapping[field] = normalizedHeaders.get(match.toLowerCase()) as string;
		}
	}

	return mapping;
}

export function missingRequiredFields(
	mapping: FieldMapping,
	config: ImportConfig,
): Array<string> {
	return config.requiredFields.filter((field) => !mapping[field]);
}

export function validateRows<T>(
	config: ImportConfig<T>,
	rows: Array<NormalizedRow>,
): ImportPreview<T> {
	const previewRows = rows
		.slice(0, MAX_PREVIEW_ROWS)
		.map<PreviewRow<T>>((row) => {
			const rowNumber = rowNumberFor(row);
			const errors: Array<ImportError> = [];
			const warnings: Array<ImportWarning> = [];

			for (const field of config.requiredFields) {
				const value = row[field];

				if (value === null || value === undefined || value.trim() === "") {
					errors.push({
						row: rowNumber,
						field,
						code: "REQUIRED_FIELD",
						message: `${field} is required`,
					});
				}
			}

			const result = config.schema.safeParse(row);

			if (!result.success) {
				for (const issue of result.error.issues) {
					const field = issue.path.map(String).join(".") || undefined;

					errors.push({
						row: rowNumber,
						field,
						code: "INVALID_VALUE",
						message: issue.message,
					});
				}
			}

			if (config.warningRules) {
				for (const warning of config.warningRules([row])) {
					warnings.push({ ...warning, row: warning.row ?? rowNumber });
				}
			}

			const status: PreviewRow<T>["status"] =
				errors.length > 0 ? "ERROR" : warnings.length > 0 ? "WARNING" : "READY";

			return {
				rowNumber,
				raw: Object.fromEntries(
					Object.entries(row).filter(([key]) => key !== "__rowIndex"),
				) as Record<string, string>,
				normalized: Object.fromEntries(
					Object.entries(row).filter(([key]) => key !== "__rowIndex"),
				),
				status,
				errors,
				warnings,
				validated: result.success ? result.data : undefined,
			};
		});

	return summarizePreview(previewRows, rows.length);
}

export async function buildImportPreview<T>(
	config: ImportConfig<T>,
	parsed: ParsedCSV,
	mapping: FieldMapping,
	options: PreviewOptions = {},
): Promise<ImportPreview<T>> {
	const normalized = normalizeRows(parsed.headers, parsed.rows, mapping);
	const preview = validateRows(config, normalized);

	if (
		config.businessRules &&
		options.prisma &&
		options.context &&
		preview.rows.length > 0
	) {
		const businessErrors = await config.businessRules(
			normalized.slice(0, MAX_PREVIEW_ROWS),
			options.prisma,
			options.context,
		);

		for (const error of businessErrors) {
			const row =
				typeof error.row === "number"
					? preview.rows.find((entry) => entry.rowNumber === error.row)
					: undefined;

			if (row) {
				row.errors.push({ ...error, row: row.rowNumber });
				row.status = "ERROR";
			}
		}

		return summarizePreview(preview.rows, preview.summary.totalRows);
	}

	return preview;
}

function summarizePreview<T>(
	rows: Array<PreviewRow<T>>,
	totalRows: number,
): ImportPreview<T> {
	return {
		summary: {
			totalRows,
			readyRows: rows.filter((row) => row.status === "READY").length,
			errorRows: rows.filter((row) => row.status === "ERROR").length,
			warningRows: rows.filter((row) => row.status === "WARNING").length,
		},
		rows,
	};
}

export function isPreviewImportable<T>(preview: ImportPreview<T>): boolean {
	return (
		preview.summary.errorRows === 0 &&
		preview.summary.readyRows + preview.summary.warningRows > 0
	);
}

export function getImportableRows<T>(
	preview: ImportPreview<T>,
): Array<PreviewRow<T>> {
	return preview.rows.filter(
		(row) => row.status === "READY" || row.status === "WARNING",
	);
}

export function previewRowsToNormalized<T>(
	rows: Array<PreviewRow<T>>,
): Array<Record<string, string | null>> {
	return rows.map((row) => {
		const record: Record<string, string | null> = {};

		for (const [key, value] of Object.entries(row.normalized)) {
			record[key] =
				value === null || value === undefined ? null : String(value);
		}

		return record;
	});
}

export { normalizeRows, toRawRecord };
