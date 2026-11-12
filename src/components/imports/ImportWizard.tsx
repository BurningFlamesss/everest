import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CheckCircle2,
	Download,
	FileSpreadsheet,
	Loader2,
	MessageSquare,
	UploadCloud,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { cn } from "#/lib/utils.ts";
import { normalizeRows } from "#/packages/csv/normalize.ts";
import { parseCSV } from "#/packages/csv/parser.ts";
import {
	getImportableRows,
	previewRowsToNormalized,
	suggestMapping,
	validateRows,
} from "#/packages/csv/preview.ts";
import type {
	FieldMapping,
	ImportConfig,
	ImportPreview,
	NormalizedRow,
} from "#/packages/csv/types.ts";

export interface ImportWizardResult {
	success: boolean;
	created: Array<{ name: string; email: string; url?: string; token?: string }>;
	errors: Array<{ row: number; email: string; message: string }>;
	error?: string;
}

const escapeCsv = (value: string) => `"${value.replaceAll('"', '""')}"`;

export interface ImportWizardProps {
	config: ImportConfig;
	sampleCsv: string;
	title: string;
	description: string;
	onImport: (
		rows: Array<Record<string, string | null>>,
		sendEmail: boolean,
	) => Promise<ImportWizardResult>;
}

type Step = "upload" | "map" | "preview" | "result";

const STEP_LABELS: Record<Step, string> = {
	upload: "Upload file",
	map: "Match columns",
	preview: "Review",
	result: "Done",
};

function downloadText(filename: string, content: string) {
	const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	link.click();
	URL.revokeObjectURL(url);
}

function errorsToCsv(
	errors: Array<{ row: number; email: string; message: string }>,
): string {
	return [
		"row,email,message",
		...errors.map((error) =>
			[error.row, error.email, error.message]
				.map((value) => escapeCsv(String(value)))
				.join(","),
		),
	].join("\n");
}

/**
 * Build the CSV of created rows (name, email, activation link) so an admin can
 * hand the details to an SMS gateway or keep them on file when email delivery
 * is unavailable.
 */
function createdToCsv(
	created: Array<{ name: string; email: string; url?: string; token?: string }>,
): string {
	return [
		"name,email,activation_link",
		...created.map((entry) =>
			[entry.name, entry.email, entry.url ?? entry.token ?? ""]
				.map((value) => escapeCsv(String(value ?? "")))
				.join(","),
		),
	].join("\n");
}

/** One line per student, formatted for pasting into an SMS sender. */
function createdToSmsText(
	created: Array<{ name: string; email: string; url?: string; token?: string }>,
): string {
	return created
		.map(
			(entry) =>
				`${entry.name} (${entry.email}) — activate your Everest account: ${
					entry.url ?? entry.token ?? ""
				}`,
		)
		.join("\n");
}

export function ImportWizard({
	config,
	sampleCsv,
	title,
	description,
	onImport,
}: ImportWizardProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const [step, setStep] = useState<Step>("upload");
	const [fileName, setFileName] = useState("");
	const [headers, setHeaders] = useState<Array<string>>([]);
	const [rawRows, setRawRows] = useState<Array<Array<string>>>([]);
	const [mapping, setMapping] = useState<FieldMapping>({});
	const [preview, setPreview] = useState<ImportPreview | null>(null);
	const [result, setResult] = useState<ImportWizardResult | null>(null);
	const [sendEmail, setSendEmail] = useState(false);
	const [isImporting, setIsImporting] = useState(false);
	const [error, setError] = useState("");
	const [isDragging, setIsDragging] = useState(false);
	const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">(
		"idle",
	);

	const allFields = useMemo(
		() => [
			...new Set([
				...config.requiredFields,
				...config.optionalFields,
				...Object.keys(config.fieldSuggestions),
			]),
		],
		[config],
	);

	const handleFile = async (file: File) => {
		setError("");

		if (!file.name.toLowerCase().endsWith(".csv")) {
			setError("Please choose a .csv file.");
			return;
		}

		try {
			const text = await file.text();
			const parsed = parseCSV(text);

			if (parsed.headers.length === 0 || parsed.rows.length === 0) {
				setError(
					"This CSV is empty. Add a header row and at least one record.",
				);
				return;
			}

			setFileName(file.name);
			setHeaders(parsed.headers);
			setRawRows(parsed.rows);
			setMapping(suggestMapping(parsed.headers, config));
			setStep("map");
		} catch (parseError) {
			setError(
				parseError instanceof Error
					? parseError.message
					: "Could not read this CSV file.",
			);
		}
	};

	const buildPreview = () => {
		setError("");
		const missing = config.requiredFields.filter((field) => !mapping[field]);

		if (missing.length > 0) {
			setError(`Match these required columns first: ${missing.join(", ")}`);
			return;
		}

		const normalized: Array<NormalizedRow> = normalizeRows(
			headers,
			rawRows,
			mapping,
		);
		setPreview(validateRows(config, normalized));
		setStep("preview");
	};

	const runImport = async () => {
		if (!preview) return;

		const rows = getImportableRows(preview);

		if (rows.length === 0) {
			setError("There are no valid rows to import.");
			return;
		}

		setIsImporting(true);
		setError("");

		try {
			const response = await onImport(previewRowsToNormalized(rows), sendEmail);
			setResult(response);

			if (!response.success) {
				setError(response.error ?? "The import failed.");
			}

			setStep("result");
		} catch (importError) {
			setError(
				importError instanceof Error
					? importError.message
					: "The import failed.",
			);
		} finally {
			setIsImporting(false);
		}
	};

	const reset = () => {
		setStep("upload");
		setFileName("");
		setHeaders([]);
		setRawRows([]);
		setMapping({});
		setPreview(null);
		setResult(null);
		setError("");
		setCopyState("idle");
		if (inputRef.current) inputRef.current.value = "";
	};

	/**
	 * Copy every created student's details + activation link in one click, so
	 * the block can be pasted straight into an SMS sender when email delivery
	 * is not available.
	 */
	const copyAllDetails = async () => {
		if (!result || result.created.length === 0) return;
		const text = createdToSmsText(result.created);

		try {
			await navigator.clipboard.writeText(text);
			setCopyState("copied");
		} catch {
			setCopyState("failed");
		}

		window.setTimeout(() => setCopyState("idle"), 2500);
	};

	const downloadCreatedCsv = () => {
		if (!result || result.created.length === 0) return;
		downloadText(
			`imported-${config.name.toLowerCase().replaceAll(" ", "-")}.csv`,
			createdToCsv(result.created),
		);
	};

	return (
		<section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<header className="mb-6">
				<div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-red-500">
					<FileSpreadsheet className="h-4 w-4" />
					CSV import
				</div>
				<h2 className="mt-2 text-2xl font-bold text-gray-900">{title}</h2>
				<p className="mt-1 max-w-2xl text-sm text-gray-500">{description}</p>
			</header>

			<ol className="mb-6 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
				{(["upload", "map", "preview", "result"] as Array<Step>).map(
					(item, index) => {
						const active = item === step;
						const stepIndex = ["upload", "map", "preview", "result"].indexOf(
							step,
						);
						const done = index < stepIndex;

						return (
							<li
								key={item}
								className={cn(
									"rounded-lg border px-3 py-2 font-medium",
									active
										? "border-red-300 bg-red-50 text-red-700"
										: done
											? "border-green-200 bg-green-50 text-green-700"
											: "border-gray-200 bg-gray-50 text-gray-500",
								)}
							>
								{index + 1}. {STEP_LABELS[item]}
							</li>
						);
					},
				)}
			</ol>

			{error ? (
				<div
					role="alert"
					className="mb-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
				>
					<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
					<span>{error}</span>
				</div>
			) : null}

			{step === "upload" ? (
				<div className="space-y-4">
					<label
						htmlFor="csv-upload"
						onDragOver={(event) => {
							event.preventDefault();
							setIsDragging(true);
						}}
						onDragLeave={() => setIsDragging(false)}
						onDrop={(event) => {
							event.preventDefault();
							setIsDragging(false);
							const file = event.dataTransfer.files?.[0];
							if (file) void handleFile(file);
						}}
						className={cn(
							"flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors",
							isDragging
								? "border-red-400 bg-red-50"
								: "border-gray-300 bg-gray-50",
						)}
					>
						<UploadCloud className="mb-3 h-8 w-8 text-red-500" />
						<span className="font-medium text-gray-900">
							Drop your CSV here, or click to browse
						</span>
						<span className="mt-1 text-xs text-gray-500">
							UTF-8 CSV, up to 500 rows. The first row must contain headers.
						</span>
						<span className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600">
							Choose CSV file
						</span>
						<input
							ref={inputRef}
							id="csv-upload"
							type="file"
							accept=".csv,text/csv"
							className="hidden"
							onChange={(event) => {
								const file = event.target.files?.[0];
								if (file) void handleFile(file);
							}}
						/>
					</label>

					<button
						type="button"
						onClick={() =>
							downloadText(
								`${config.name.toLowerCase().replaceAll(" ", "-")}-sample.csv`,
								sampleCsv,
							)
						}
						className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
					>
						<Download className="h-4 w-4" /> Download a sample CSV
					</button>
				</div>
			) : null}

			{step === "map" ? (
				<div className="space-y-5">
					<p className="text-sm text-gray-600">
						<strong>{fileName}</strong> has {rawRows.length} row
						{rawRows.length === 1 ? "" : "s"}. Match each field to a column.
					</p>

					<div className="grid gap-4 sm:grid-cols-2">
						{allFields.map((field) => (
							<label key={field} className="block text-sm">
								<span className="mb-1 flex items-center gap-1 font-medium text-gray-700">
									{field}
									{config.requiredFields.includes(field) ? (
										<span className="text-red-500">*</span>
									) : null}
								</span>
								<select
									value={mapping[field] ?? ""}
									onChange={(event) => {
										const value = event.target.value;
										setMapping((current) => {
											const next = { ...current };
											if (value) next[field] = value;
											else delete next[field];
											return next;
										});
									}}
									className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
								>
									<option value="">— not mapped —</option>
									{headers.map((header) => (
										<option key={header} value={header}>
											{header}
										</option>
									))}
								</select>
							</label>
						))}
					</div>

					<div className="flex justify-between gap-3">
						<button
							type="button"
							onClick={reset}
							className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							<ArrowLeft className="h-4 w-4" /> Start over
						</button>
						<button
							type="button"
							onClick={buildPreview}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
						>
							Review rows <ArrowRight className="h-4 w-4" />
						</button>
					</div>
				</div>
			) : null}

			{step === "preview" && preview ? (
				<div className="space-y-5">
					<div className="grid gap-3 sm:grid-cols-3">
						<div className="rounded-lg border border-green-200 bg-green-50 p-4">
							<p className="text-xs font-medium uppercase text-green-700">
								Ready
							</p>
							<p className="text-2xl font-bold text-green-800">
								{preview.summary.readyRows + preview.summary.warningRows}
							</p>
						</div>
						<div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
							<p className="text-xs font-medium uppercase text-amber-700">
								Warnings
							</p>
							<p className="text-2xl font-bold text-amber-800">
								{preview.summary.warningRows}
							</p>
						</div>
						<div className="rounded-lg border border-red-200 bg-red-50 p-4">
							<p className="text-xs font-medium uppercase text-red-700">
								Errors
							</p>
							<p className="text-2xl font-bold text-red-800">
								{preview.summary.errorRows}
							</p>
						</div>
					</div>

					<div className="max-h-80 overflow-auto rounded-lg border border-gray-200">
						<table className="min-w-full text-left text-sm">
							<thead className="sticky top-0 bg-gray-50 text-xs uppercase text-gray-500">
								<tr>
									<th className="px-3 py-2">Row</th>
									<th className="px-3 py-2">Status</th>
									<th className="px-3 py-2">Name</th>
									<th className="px-3 py-2">Email</th>
									<th className="px-3 py-2">Notes</th>
								</tr>
							</thead>
							<tbody>
								{preview.rows.map((row) => (
									<tr key={row.rowNumber} className="border-t border-gray-100">
										<td className="px-3 py-2 text-gray-500">{row.rowNumber}</td>
										<td className="px-3 py-2">
											<span
												className={cn(
													"rounded-full px-2 py-0.5 text-[11px] font-semibold",
													row.status === "READY"
														? "bg-green-100 text-green-700"
														: row.status === "WARNING"
															? "bg-amber-100 text-amber-700"
															: "bg-red-100 text-red-700",
												)}
											>
												{row.status}
											</span>
										</td>
										<td className="px-3 py-2">
											{String(row.normalized.name ?? "—")}
										</td>
										<td className="px-3 py-2">
											{String(row.normalized.email ?? "—")}
										</td>
										<td className="px-3 py-2 text-xs text-gray-500">
											{[...row.errors, ...row.warnings]
												.map((issue) => issue.message)
												.join("; ") || "—"}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>

					<label className="flex items-center gap-2 text-sm text-gray-700">
						<input
							type="checkbox"
							checked={sendEmail}
							onChange={(event) => setSendEmail(event.target.checked)}
							className="h-4 w-4 rounded border-gray-300 text-red-500"
						/>
						Email each person their activation link (requires mail settings)
					</label>

					<div className="flex justify-between gap-3">
						<button
							type="button"
							onClick={() => setStep("map")}
							className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
						>
							<ArrowLeft className="h-4 w-4" /> Back
						</button>
						<button
							type="button"
							onClick={runImport}
							disabled={
								isImporting ||
								preview.summary.readyRows + preview.summary.warningRows === 0
							}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
						>
							{isImporting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CheckCircle2 className="h-4 w-4" />
							)}
							{isImporting ? "Creating invitations…" : "Create invitations"}
						</button>
					</div>
				</div>
			) : null}

			{step === "result" && result ? (
				<div className="space-y-5">
					<div className="rounded-lg border border-green-200 bg-green-50 p-4">
						<p className="flex items-center gap-2 font-semibold text-green-800">
							<CheckCircle2 className="h-5 w-5" /> {result.created.length}{" "}
							invitation{result.created.length === 1 ? "" : "s"} created
						</p>
						{result.errors.length > 0 ? (
							<p className="mt-1 text-sm text-green-700">
								{result.errors.length} row
								{result.errors.length === 1 ? "" : "s"} could not be imported.
							</p>
						) : null}
					</div>

					{result.created.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							<button
								type="button"
								onClick={() => void copyAllDetails()}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
							>
								<MessageSquare className="h-4 w-4 text-red-500" />
								{copyState === "copied"
									? "Copied — paste into your SMS sender"
									: copyState === "failed"
										? "Copy failed — use the CSV download"
										: "Copy all details + activation links"}
							</button>
							<button
								type="button"
								onClick={downloadCreatedCsv}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
							>
								<Download className="h-4 w-4 text-red-500" />
								Download CSV (details + links)
							</button>
						</div>
					) : null}

					{result.created.length > 0 ? (
						<div className="max-h-64 overflow-auto rounded-lg border border-gray-200">
							<table className="min-w-full text-left text-sm">
								<thead className="bg-gray-50 text-xs uppercase text-gray-500">
									<tr>
										<th className="px-3 py-2">Name</th>
										<th className="px-3 py-2">Email</th>
										<th className="px-3 py-2">Activation link</th>
									</tr>
								</thead>
								<tbody>
									{result.created.map((entry) => (
										<tr key={entry.email} className="border-t border-gray-100">
											<td className="px-3 py-2">{entry.name}</td>
											<td className="px-3 py-2">{entry.email}</td>
											<td className="max-w-[260px] truncate px-3 py-2 text-xs text-gray-500">
												{entry.url ?? entry.token ?? "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					) : null}

					{result.errors.length > 0 ? (
						<div>
							<button
								type="button"
								onClick={() =>
									downloadText("import-errors.csv", errorsToCsv(result.errors))
								}
								className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
							>
								<Download className="h-4 w-4" /> Download error report
							</button>
							<ul className="max-h-48 space-y-1 overflow-auto text-sm text-red-700">
								{result.errors.map((entry) => (
									<li key={`${entry.row}-${entry.email}`}>
										Row {entry.row} ({entry.email || "no email"}):{" "}
										{entry.message}
									</li>
								))}
							</ul>
						</div>
					) : null}

					<button
						type="button"
						onClick={reset}
						className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
					>
						Import another file
					</button>
				</div>
			) : null}
		</section>
	);
}
