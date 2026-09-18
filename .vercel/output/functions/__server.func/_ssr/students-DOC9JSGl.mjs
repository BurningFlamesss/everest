import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ArrowRight, CircleCheck, CircleX, CloudUpload, Copy, Download, Ellipsis, FileSpreadsheet, GraduationCap, LoaderCircle, MailPlus, Pencil, Trash2, TriangleAlert, UserMinus, UserPlus, Users } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Progress } from "./progress-BR51tDET.mjs";
import { downloadTextFile, formatCurrency, toCsv } from "./format-BBWmN55e.mjs";
import { db } from "./db-CgIvOOZs.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { listClasses } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { bulkStudentAction, deleteStudent, findDuplicateStudents, importStudents, inviteGuardian, listStudents, setStudentStatus, studentFilterOptions, transferStudent } from "./students-IDW3j9qD.mjs";
import { StudentFormDialog } from "./StudentFormDialog-CcNrBXOe.mjs";
import { require_papaparse } from "../_libs/papaparse.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students-DOC9JSGl.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_papaparse = /* @__PURE__ */ __toESM(require_papaparse());
var STEPS = [
	{
		key: "upload",
		label: "Upload",
		hint: "Choose a CSV file"
	},
	{
		key: "inspect",
		label: "Inspect",
		hint: "Check what we detected"
	},
	{
		key: "map",
		label: "Map fields",
		hint: "Match columns to fields"
	},
	{
		key: "validate",
		label: "Validate",
		hint: "Resolve problems"
	},
	{
		key: "preview",
		label: "Preview",
		hint: "Confirm the final rows"
	},
	{
		key: "results",
		label: "Results",
		hint: "Import summary"
	}
];
var FIELDS = [
	{
		key: "firstName",
		label: "First name",
		required: true,
		aliases: [
			"first name",
			"firstname",
			"given name",
			"first"
		]
	},
	{
		key: "lastName",
		label: "Last name",
		required: true,
		aliases: [
			"last name",
			"lastname",
			"surname",
			"family name"
		]
	},
	{
		key: "grade",
		label: "Grade",
		required: true,
		aliases: [
			"grade",
			"class",
			"year",
			"standard"
		]
	},
	{
		key: "section",
		label: "Section",
		required: true,
		aliases: [
			"section",
			"division",
			"stream"
		]
	},
	{
		key: "guardianName",
		label: "Guardian name",
		required: true,
		aliases: [
			"guardian",
			"guardian name",
			"parent",
			"parent name"
		]
	},
	{
		key: "guardianPhone",
		label: "Guardian phone",
		required: true,
		aliases: [
			"guardian phone",
			"phone",
			"contact",
			"mobile"
		]
	},
	{
		key: "guardianEmail",
		label: "Guardian email",
		required: false,
		aliases: [
			"guardian email",
			"email",
			"parent email"
		]
	},
	{
		key: "gender",
		label: "Gender",
		required: false,
		aliases: ["gender", "sex"]
	},
	{
		key: "dateOfBirth",
		label: "Date of birth",
		required: false,
		aliases: [
			"date of birth",
			"dob",
			"birth date"
		]
	}
];
var SAMPLE_CSV = `First Name,Last Name,Grade,Section,Gender,Date of Birth,Guardian Name,Guardian Phone,Guardian Email
Noor,Hassan,Grade 7,A,female,2013-04-11,Samir Hassan,+1 (555) 233-9100,samir.hassan@familymail.com
Elias,Duarte,Grade 9,B,male,2011-09-02,Maria Duarte,+1 (555) 233-9111,maria.duarte@familymail.com
Ivy,Kimura,Grade 6,C,female,2014-01-23,Ken Kimura,+1 (555) 233-9122,ken.kimura@familymail.com`;
function CsvImportWizard({ open, onOpenChange, onImported }) {
	const { actor } = useAuth();
	const inputRef = (0, import_react.useRef)(null);
	const [step, setStep] = (0, import_react.useState)("upload");
	const [fileName, setFileName] = (0, import_react.useState)("");
	const [headers, setHeaders] = (0, import_react.useState)([]);
	const [rawRows, setRawRows] = (0, import_react.useState)([]);
	const [mapping, setMapping] = (0, import_react.useState)({});
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const [parsing, setParsing] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)(0);
	const [result, setResult] = (0, import_react.useState)(null);
	const reset = () => {
		setStep("upload");
		setFileName("");
		setHeaders([]);
		setRawRows([]);
		setMapping({});
		setProgress(0);
		setResult(null);
	};
	const autoMap = (columns) => {
		const next = {};
		FIELDS.forEach((field) => {
			const match = columns.find((column) => {
				const normalised = column.trim().toLowerCase();
				return normalised === field.key.toLowerCase() || field.aliases.includes(normalised);
			});
			if (match) next[field.key] = match;
		});
		return next;
	};
	const parseFile = (file) => {
		if (!file.name.toLowerCase().endsWith(".csv")) {
			toast.error("Please choose a .csv file");
			return;
		}
		setParsing(true);
		setFileName(file.name);
		import_papaparse.default.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: (output) => {
				const columns = (output.meta.fields ?? []).filter(Boolean);
				setHeaders(columns);
				setRawRows(output.data.filter((row) => Object.values(row).some((v) => String(v ?? "").trim())));
				setMapping(autoMap(columns));
				setParsing(false);
				setStep("inspect");
			},
			error: () => {
				setParsing(false);
				toast.error("That file could not be parsed");
			}
		});
	};
	const mappedRows = (0, import_react.useMemo)(() => rawRows.map((row) => {
		const output = {};
		FIELDS.forEach((field) => {
			const column = mapping[field.key];
			output[field.key] = column ? String(row[column] ?? "").trim() : "";
		});
		return output;
	}), [rawRows, mapping]);
	const knownGrades = (0, import_react.useMemo)(() => Array.from(new Set(db().classes.map((c) => c.grade))), []);
	const knownSections = (0, import_react.useMemo)(() => Array.from(new Set(db().classes.map((c) => c.section))), []);
	const validation = (0, import_react.useMemo)(() => {
		const duplicates = findDuplicateStudents(mappedRows);
		const issues = mappedRows.map((row, index) => {
			const problems = [];
			FIELDS.filter((f) => f.required).forEach((field) => {
				if (!String(row[field.key] ?? "").trim()) problems.push(`${field.label} is missing`);
			});
			if (row.grade && !knownGrades.includes(row.grade)) problems.push(`Unknown grade “${row.grade}”`);
			if (row.section && !knownSections.includes(row.section)) problems.push(`Unknown section “${row.section}”`);
			return {
				index,
				row,
				problems,
				duplicate: duplicates.has(index)
			};
		});
		return {
			issues,
			invalid: issues.filter((i) => i.problems.length > 0),
			duplicates: issues.filter((i) => i.duplicate && i.problems.length === 0),
			valid: issues.filter((i) => i.problems.length === 0 && !i.duplicate)
		};
	}, [
		mappedRows,
		knownGrades,
		knownSections
	]);
	const missingRequired = FIELDS.filter((f) => f.required && !mapping[f.key]);
	const importMutation = useMutation({
		mutationFn: async () => {
			setProgress(15);
			const rows = validation.valid.map((entry) => entry.row);
			const timer = window.setInterval(() => setProgress((p) => Math.min(92, p + 12)), 120);
			try {
				return await importStudents(rows, actor);
			} finally {
				window.clearInterval(timer);
				setProgress(100);
			}
		},
		onSuccess: (outcome) => {
			setResult(outcome);
			setStep("results");
			onImported?.();
			toast.success(`${outcome.created} students imported`);
		},
		onError: () => toast.error("The import could not be completed")
	});
	const downloadErrorReport = () => {
		const rows = [...validation.invalid.map((entry) => ({
			row: entry.index + 2,
			firstName: entry.row.firstName,
			lastName: entry.row.lastName,
			grade: entry.row.grade,
			section: entry.row.section,
			issue: entry.problems.join("; ")
		})), ...validation.duplicates.map((entry) => ({
			row: entry.index + 2,
			firstName: entry.row.firstName,
			lastName: entry.row.lastName,
			grade: entry.row.grade,
			section: entry.row.section,
			issue: "Possible duplicate of an existing student"
		}))];
		if (!rows.length) {
			toast.info("There are no failed rows to report");
			return;
		}
		downloadTextFile("student-import-errors.csv", toCsv(rows));
	};
	const stepIndex = STEPS.findIndex((s) => s.key === step);
	const canContinue = step === "inspect" && rawRows.length > 0 || step === "map" && missingRequired.length === 0 || step === "validate" || step === "preview";
	const goNext = () => {
		if (step === "inspect") setStep("map");
		else if (step === "map") setStep("validate");
		else if (step === "validate") setStep("preview");
		else if (step === "preview") importMutation.mutate();
	};
	const goBack = () => {
		const order = [
			"upload",
			"inspect",
			"map",
			"validate",
			"preview"
		];
		const index = order.indexOf(step);
		if (index > 0) setStep(order[index - 1]);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: (next) => {
			onOpenChange(next);
			if (!next) reset();
		},
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "max-h-[92vh] max-w-4xl overflow-hidden bg-popover p-0",
			"data-testid": "csv-import-wizard",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid max-h-[92vh] grid-cols-1 sm:grid-cols-[220px_1fr]",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "hidden border-r border-hairline bg-surface-2 p-5 sm:block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display text-sm font-semibold",
							children: "Import students"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "mt-1 text-xs",
							children: "Bulk onboarding from a spreadsheet export."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "mt-5 space-y-3",
							children: STEPS.map((item, index) => {
								const active = item.key === step;
								const done = index < stepIndex;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("num mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-semibold", active ? "border-primary bg-primary text-primary-foreground" : done ? "border-success bg-success/15 text-success" : "border-hairline bg-surface-1 text-muted-foreground"),
										children: done ? "✓" : index + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("block text-xs font-medium", active ? "text-foreground" : "text-muted-foreground"),
											children: item.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block text-[11px] text-muted-foreground",
											children: item.hint
										})]
									})]
								}, item.key);
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex max-h-[92vh] min-w-0 flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "border-b border-hairline px-5 py-3.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "eyebrow-label",
								children: [
									"Step ",
									stepIndex + 1,
									" of ",
									STEPS.length
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-display text-sm font-semibold text-foreground",
								children: STEPS[stepIndex].label
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-h-0 flex-1 overflow-y-auto px-5 py-4",
							children: [
								step === "upload" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => inputRef.current?.click(),
									onDragOver: (e) => {
										e.preventDefault();
										setDragging(true);
									},
									onDragLeave: () => setDragging(false),
									onDrop: (e) => {
										e.preventDefault();
										setDragging(false);
										const file = e.dataTransfer.files?.[0];
										if (file) parseFile(file);
									},
									"data-testid": "csv-dropzone",
									className: cn("flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-6 py-12 text-center transition-colors focus-ring", dragging ? "border-primary bg-primary/5" : "border-hairline bg-surface-2 hover:border-primary/40"),
									children: [
										parsing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-6 w-6 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-6 w-6 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium text-foreground",
											children: "Drop your CSV here, or click to browse"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "One student per row · first row must contain column headers"
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 rounded-lg border border-hairline bg-surface-2 p-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs font-medium text-foreground",
											children: "Not sure about the format?"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-1 text-xs text-muted-foreground",
											children: "Download the sample file, fill it in, then upload it here. Required columns: first name, last name, grade, section, guardian name and guardian phone."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											className: "mt-2.5 gap-1.5 text-xs",
											"data-testid": "csv-download-sample",
											onClick: () => downloadTextFile("northfield-student-import-sample.csv", SAMPLE_CSV),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download sample CSV"]
										})
									]
								})] }),
								step === "inspect" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mb-3 flex items-center gap-3 rounded-lg border border-hairline bg-surface-2 p-3",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileSpreadsheet, { className: "h-5 w-5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "truncate text-sm font-medium text-foreground",
												children: fileName
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "num text-xs text-muted-foreground",
												"data-testid": "csv-detected-summary",
												children: [
													rawRows.length,
													" data rows · ",
													headers.length,
													" columns detected"
												]
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "overflow-x-auto rounded-lg border border-hairline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "bg-surface-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground",
													children: header
												}, header)) })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-hairline",
												children: rawRows.slice(0, 5).map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
													className: "whitespace-nowrap px-3 py-1.5 text-foreground",
													children: row[header]
												}, header)) }, i))
											})]
										})
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-[11px] text-muted-foreground",
										children: "Showing the first 5 rows of the file."
									})
								] }),
								step === "map" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs text-muted-foreground",
											children: "We matched what we could automatically. Confirm each field below — required fields are marked."
										}),
										FIELDS.map((field) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col gap-2 rounded-lg border border-hairline bg-surface-1 p-2.5 sm:flex-row sm:items-center",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm text-foreground",
													children: [field.label, field.required && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "ml-1 text-destructive",
														children: "*"
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-mono text-[11px] text-muted-foreground",
													children: field.key
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
												value: mapping[field.key] ?? "__none",
												onValueChange: (value) => setMapping((prev) => {
													const next = { ...prev };
													if (value === "__none") delete next[field.key];
													else next[field.key] = value;
													return next;
												}),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
													className: "w-full sm:w-[240px]",
													"data-testid": `csv-map-${field.key}`,
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Not mapped" })
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
													className: "bg-popover",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "__none",
														children: "Not mapped"
													}), headers.map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: header,
														children: header
													}, header))]
												})]
											})]
										}, field.key)),
										missingRequired.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "flex items-center gap-1.5 text-xs text-destructive",
											"data-testid": "csv-map-warning",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-3.5 w-3.5" }),
												"Map ",
												missingRequired.map((f) => f.label).join(", "),
												" to continue."
											]
										})
									]
								}),
								step === "validate" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid grid-cols-3 gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
											label: "Ready to import",
											value: validation.valid.length,
											tone: "success",
											testId: "csv-valid-count"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
											label: "Possible duplicates",
											value: validation.duplicates.length,
											tone: "accent",
											testId: "csv-duplicate-count"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
											label: "Rows with errors",
											value: validation.invalid.length,
											tone: "danger",
											testId: "csv-invalid-count"
										})
									]
								}), validation.invalid.length === 0 && validation.duplicates.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 flex items-center gap-2 rounded-lg border border-success/30 bg-success/8 p-3 text-xs text-success",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-4 w-4" }), " Every row passed validation."]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-4 space-y-1.5",
									children: [[...validation.invalid, ...validation.duplicates].slice(0, 12).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-1 p-2.5",
										"data-testid": "csv-validation-issue",
										children: [entry.problems.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "min-w-0",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs font-medium text-foreground",
												children: [
													"Row ",
													entry.index + 2,
													" · ",
													entry.row.firstName || "—",
													" ",
													entry.row.lastName || ""
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted-foreground",
												children: entry.problems.length ? entry.problems.join(" · ") : "Looks like an existing student — it will be skipped"
											})]
										})]
									}, entry.index)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "mt-1 gap-1.5 text-xs",
										"data-testid": "csv-download-errors",
										onClick: downloadErrorReport,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download error report"]
									})]
								})] }),
								step === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "mb-3 text-xs text-muted-foreground",
										children: [validation.valid.length, " students will be created. Duplicate and invalid rows are excluded."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "overflow-x-auto rounded-lg border border-hairline",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
											className: "w-full text-xs",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
												className: "bg-surface-2",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
													"Name",
													"Grade",
													"Section",
													"Guardian",
													"Phone"
												].map((header) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
													className: "px-3 py-2 text-left font-semibold text-muted-foreground",
													children: header
												}, header)) })
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
												className: "divide-y divide-hairline",
												children: validation.valid.slice(0, 20).map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
													"data-testid": "csv-preview-row",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
															className: "px-3 py-1.5 text-foreground",
															children: [
																entry.row.firstName,
																" ",
																entry.row.lastName
															]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-1.5 text-muted-foreground",
															children: entry.row.grade
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-1.5 text-muted-foreground",
															children: entry.row.section
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "px-3 py-1.5 text-muted-foreground",
															children: entry.row.guardianName
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
															className: "num px-3 py-1.5 text-muted-foreground",
															children: entry.row.guardianPhone
														})
													]
												}, entry.index))
											})]
										})
									}),
									importMutation.isPending && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mb-1.5 flex items-center justify-between text-xs text-muted-foreground",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Importing students…" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "num",
												children: [progress, "%"]
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
											value: progress,
											className: "h-1.5"
										})]
									})
								] }),
								step === "results" && result && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									"data-testid": "csv-results",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center gap-3 rounded-lg border border-success/30 bg-success/8 p-4",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "h-6 w-6 text-success" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-semibold text-foreground",
												children: "Import complete"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "num text-xs text-muted-foreground",
												children: [
													result.created,
													" students created · ",
													validation.invalid.length + validation.duplicates.length,
													" ",
													"rows skipped"
												]
											})] })]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "mt-3 grid grid-cols-3 gap-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
													label: "Created",
													value: result.created,
													tone: "success",
													testId: "csv-result-created"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
													label: "Duplicates skipped",
													value: validation.duplicates.length,
													tone: "accent"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SummaryTile, {
													label: "Errors",
													value: validation.invalid.length,
													tone: "danger"
												})
											]
										}),
										(validation.invalid.length > 0 || validation.duplicates.length > 0) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "outline",
											size: "sm",
											className: "mt-3 gap-1.5 text-xs",
											"data-testid": "csv-results-download-errors",
											onClick: downloadErrorReport,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Download error report"]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
							className: "flex items-center justify-between gap-2 border-t border-hairline px-5 py-3",
							children: step === "results" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								size: "sm",
								onClick: reset,
								"data-testid": "csv-import-another",
								children: "Import another file"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								onClick: () => onOpenChange(false),
								"data-testid": "csv-import-done",
								children: "Done"
							})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "gap-1.5",
								disabled: step === "upload",
								onClick: goBack,
								"data-testid": "csv-back",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Back"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								size: "sm",
								className: "gap-1.5",
								disabled: !canContinue || importMutation.isPending || step === "preview" && validation.valid.length === 0,
								onClick: goNext,
								"data-testid": "csv-next",
								children: importMutation.isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-3.5 w-3.5 animate-spin" }), " Importing…"] }) : step === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									"Import ",
									validation.valid.length,
									" students"
								] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Continue ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "h-3.5 w-3.5" })] })
							})] })
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: ".csv,text/csv",
				className: "hidden",
				"data-testid": "csv-file-input",
				onChange: (e) => {
					const file = e.target.files?.[0];
					if (file) parseFile(file);
					e.target.value = "";
				}
			})]
		})
	});
}
function SummaryTile({ label, value, tone, testId }) {
	const toneClass = {
		success: "text-success",
		accent: "text-accent",
		danger: "text-destructive"
	}[tone];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-hairline bg-surface-1 p-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: cn("num mt-0.5 text-lg font-semibold", toneClass),
			"data-testid": testId,
			children: value
		})]
	});
}
function StudentsPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const [search, setSearch] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [section, setSection] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)(searchParams.status ?? "all");
	const [year, setYear] = (0, import_react.useState)("all");
	const [branch, setBranch] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)({
		key: "firstName",
		dir: "asc"
	});
	const [page, setPage] = (0, import_react.useState)(1);
	const [selected, setSelected] = (0, import_react.useState)([]);
	const [formOpen, setFormOpen] = (0, import_react.useState)(searchParams.new === "1");
	const [importOpen, setImportOpen] = (0, import_react.useState)(searchParams.import === "1");
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [transferTarget, setTransferTarget] = (0, import_react.useState)(null);
	const [transferClassId, setTransferClassId] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (searchParams.new === "1") setFormOpen(true);
		if (searchParams.import === "1") setImportOpen(true);
	}, [searchParams.new, searchParams.import]);
	const clearParams = () => {
		navigate({
			search: (prev) => {
				const next = { ...prev };
				delete next.new;
				delete next.import;
				return next;
			},
			replace: true
		});
	};
	const options = (0, import_react.useMemo)(() => studentFilterOptions(), []);
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const query = {
		search,
		grade,
		section,
		status,
		admissionYear: year,
		branchId: branch,
		sort: sort.key,
		dir: sort.dir,
		page,
		pageSize: 10
	};
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["students", query],
		queryFn: () => listStudents(query)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["students"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
		qc.invalidateQueries({ queryKey: ["classes"] });
	};
	const statusMutation = useMutation({
		mutationFn: ({ id, next }) => setStudentStatus(id, next, actor),
		onSuccess: (student) => {
			toast.success(`${student.firstName} ${student.lastName} is now ${student.status}`);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const removeMutation = useMutation({
		mutationFn: (id) => deleteStudent(id, actor),
		onSuccess: () => {
			toast.success("Student record deleted");
			setConfirm(null);
			invalidate();
		}
	});
	const inviteMutation = useMutation({
		mutationFn: (id) => inviteGuardian(id, actor),
		onSuccess: (student) => {
			toast.success(`Invitation sent to ${student.guardian.name}`);
			invalidate();
			qc.invalidateQueries({ queryKey: ["users"] });
		}
	});
	const transferMutation = useMutation({
		mutationFn: () => transferStudent(transferTarget.id, transferClassId, actor),
		onSuccess: (student) => {
			toast.success(`Transferred to ${student.grade} · ${student.section}`);
			setTransferTarget(null);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const bulkMutation = useMutation({
		mutationFn: (action) => bulkStudentAction(selected, action, actor),
		onSuccess: (count) => {
			toast.success(`${count} student${count === 1 ? "" : "s"} updated`);
			setSelected([]);
			setConfirm(null);
			invalidate();
		}
	});
	const exportSelection = (rows) => {
		const csv = toCsv(rows.map((s) => ({
			admissionNo: s.admissionNo,
			firstName: s.firstName,
			lastName: s.lastName,
			grade: s.grade,
			section: s.section,
			status: s.status,
			guardian: s.guardian.name,
			guardianPhone: s.guardian.phone,
			email: s.email,
			attendanceRate: s.attendanceRate,
			feeBalance: s.feeBalance
		})));
		downloadTextFile(`northfield-students-${Date.now()}.csv`, csv);
		toast.success(`Exported ${rows.length} student records`);
	};
	const columns = [
		{
			key: "firstName",
			header: "Student",
			sortable: true,
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: `${student.firstName} ${student.lastName}`,
				subtitle: student.admissionNo,
				avatarUrl: student.avatarUrl,
				to: `/students/${student.id}`,
				mono: true,
				testId: `student-link-${student.id}`
			})
		},
		{
			key: "grade",
			header: "Class",
			sortable: true,
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-foreground",
				children: [
					student.grade,
					" · ",
					student.section
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "num text-xs text-muted-foreground",
				children: ["Roll ", student.rollNo]
			})] })
		},
		{
			key: "guardian",
			header: "Guardian",
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-foreground",
					children: student.guardian.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "num truncate text-xs text-muted-foreground",
					children: [
						student.guardian.relation,
						" · ",
						student.guardian.phone
					]
				})]
			})
		},
		{
			key: "attendanceRate",
			header: "Attendance",
			sortable: true,
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "h-1.5 w-12 overflow-hidden rounded-full bg-surface-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("block h-full rounded-full", student.attendanceRate >= 92 ? "bg-success" : student.attendanceRate >= 82 ? "bg-warning" : "bg-destructive"),
						style: { width: `${student.attendanceRate}%` }
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "num text-xs text-muted-foreground",
					children: [student.attendanceRate, "%"]
				})]
			})
		},
		{
			key: "feeBalance",
			header: "Fees",
			sortable: true,
			align: "right",
			render: (student) => student.feeBalance > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-sm text-destructive",
				children: formatCurrency(student.feeBalance)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: "Settled"
			})
		},
		{
			key: "status",
			header: "Status",
			sortable: true,
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: student.status,
				testId: `student-status-${student.id}`
			})
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-end gap-1",
				children: [can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Edit student",
					"data-testid": `student-edit-${student.id}`,
					className: "row-actions rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground",
					onClick: (e) => {
						e.stopPropagation();
						setEditing(student);
						setFormOpen(true);
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "More actions",
						"data-testid": `student-actions-${student.id}`,
						className: "rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring",
						onClick: (e) => e.stopPropagation(),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
					align: "end",
					className: "w-52 bg-popover",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
							className: "text-xs",
							children: [
								student.firstName,
								" ",
								student.lastName
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => navigate(`/students/${student.id}`),
							"data-testid": `student-view-${student.id}`,
							children: "View profile"
						}),
						can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								onClick: () => {
									setEditing(student);
									setFormOpen(true);
								},
								children: "Edit details"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
								"data-testid": `student-transfer-${student.id}`,
								onClick: () => {
									setTransferTarget(student);
									setTransferClassId(student.classId);
								},
								children: "Transfer class"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => inviteMutation.mutate(student.id),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "mr-2 h-3.5 w-3.5" }), " Invite guardian"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => exportSelection([student]),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-3.5 w-3.5" }), " Export record"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirm({
									title: "Graduate this student?",
									description: `${student.firstName} ${student.lastName} will be marked as graduated and removed from active class lists.`,
									label: "Graduate student",
									run: () => statusMutation.mutate({
										id: student.id,
										next: "graduated"
									})
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "mr-2 h-3.5 w-3.5" }), " Graduate"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								onClick: () => setConfirm({
									title: "Deactivate this student?",
									description: `${student.firstName} ${student.lastName} will lose portal access and will not appear in attendance registers.`,
									label: "Deactivate",
									run: () => statusMutation.mutate({
										id: student.id,
										next: "inactive"
									})
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "mr-2 h-3.5 w-3.5" }), " Deactivate"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
								className: "text-destructive focus:text-destructive",
								"data-testid": `student-delete-${student.id}`,
								onClick: () => setConfirm({
									title: "Delete this student record?",
									description: `This permanently removes ${student.firstName} ${student.lastName}, including guardian links and documents. This cannot be undone.`,
									label: "Delete permanently",
									destructive: true,
									run: () => removeMutation.mutate(student.id)
								}),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-3.5 w-3.5" }), " Delete record"]
							})
						] })
					]
				})] })]
			})
		}
	];
	const noFilters = !search && grade === "all" && section === "all" && status === "all" && year === "all" && branch === "all";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "students-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "People",
				title: "Students",
				description: "The full student register with guardians, attendance health and fee position.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "students-total-count",
					children: [data?.total ?? 0, " matching records"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
					options.grades.length,
					" grades · ",
					classes.length,
					" classes"
				] })] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					"data-testid": "students-export",
					onClick: () => exportSelection(data?.rows ?? []),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
				}), can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					"data-testid": "students-import",
					onClick: () => setImportOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-3.5 w-3.5" }), " Import CSV"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "students-add",
					onClick: () => {
						setEditing(null);
						setFormOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Enroll student"]
				})] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "students-filters",
				search,
				onSearchChange: (value) => {
					setSearch(value);
					setPage(1);
				},
				placeholder: "Search by name, admission number or guardian…",
				filters: [
					{
						key: "grade",
						label: "Grade",
						value: grade,
						options: toOptions(options.grades, "All grades"),
						onChange: (v) => {
							setGrade(v);
							setPage(1);
						}
					},
					{
						key: "section",
						label: "Section",
						value: section,
						options: toOptions(options.sections, "All sections"),
						onChange: (v) => {
							setSection(v);
							setPage(1);
						},
						width: "w-[130px]"
					},
					{
						key: "status",
						label: "Status",
						value: status,
						options: [
							{
								value: "all",
								label: "Any status"
							},
							{
								value: "active",
								label: "Active"
							},
							{
								value: "inactive",
								label: "Inactive"
							},
							{
								value: "graduated",
								label: "Graduated"
							},
							{
								value: "transferred",
								label: "Transferred"
							},
							{
								value: "suspended",
								label: "Suspended"
							}
						],
						onChange: (v) => {
							setStatus(v);
							setPage(1);
						}
					},
					{
						key: "year",
						label: "Admission year",
						value: year,
						options: toOptions(options.years, "Any year"),
						onChange: (v) => {
							setYear(v);
							setPage(1);
						},
						width: "w-[130px]"
					},
					{
						key: "branch",
						label: "Branch",
						value: branch,
						options: [{
							value: "all",
							label: "All campuses"
						}, ...options.branches],
						onChange: (v) => {
							setBranch(v);
							setPage(1);
						},
						width: "w-[170px]"
					}
				],
				onReset: () => {
					setSearch("");
					setGrade("all");
					setSection("all");
					setStatus("all");
					setYear("all");
					setBranch("all");
					setPage(1);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "students-table",
				columns,
				rows: data?.rows ?? [],
				rowId: (student) => student.id,
				rowTestId: (student) => `student-row-${student.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => refetch(),
				onRowClick: (student) => navigate(`/students/${student.id}`),
				selectable: can("students.manage"),
				selected,
				onSelectedChange: setSelected,
				sort,
				onSortChange: (next) => {
					setSort(next);
					setPage(1);
				},
				page: data?.page ?? 1,
				pageSize: 10,
				total: data?.total ?? 0,
				onPageChange: setPage,
				bulkActions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "students-bulk-export",
						onClick: () => exportSelection((data?.rows ?? []).filter((s) => selected.includes(s.id))),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "students-bulk-invite",
						onClick: () => bulkMutation.mutate("invite_guardian"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "h-3.5 w-3.5" }), " Invite guardians"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs",
						"data-testid": "students-bulk-graduate",
						onClick: () => setConfirm({
							title: `Graduate ${selected.length} students?`,
							description: "They will be marked as graduated and removed from active class registers.",
							label: "Graduate students",
							run: () => bulkMutation.mutate("graduate")
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3.5 w-3.5" }), " Graduate"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "h-7 gap-1.5 px-2 text-xs text-destructive",
						"data-testid": "students-bulk-delete",
						onClick: () => setConfirm({
							title: `Delete ${selected.length} student records?`,
							description: "This permanently removes the selected students and their guardian links. This cannot be undone.",
							label: "Delete permanently",
							destructive: true,
							run: () => bulkMutation.mutate("delete")
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
					})
				] }),
				empty: noFilters ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Users,
					title: "No students yet",
					description: "Import students from a CSV file or add the first student manually to start building the register.",
					primaryLabel: can("students.manage") ? "Enroll first student" : void 0,
					onPrimary: () => {
						setEditing(null);
						setFormOpen(true);
					},
					secondaryLabel: can("students.manage") ? "Import from CSV" : void 0,
					onSecondary: () => setImportOpen(true),
					testId: "students-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Users,
					title: "No students match these filters",
					description: "Try a different grade, section or status — or clear the filters to see the whole register.",
					primaryLabel: "Clear filters",
					onPrimary: () => {
						setSearch("");
						setGrade("all");
						setSection("all");
						setStatus("all");
						setYear("all");
						setBranch("all");
					},
					testId: "students-empty-filtered"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentFormDialog, {
				open: formOpen,
				student: editing,
				classes,
				branches: options.branches,
				onOpenChange: (open) => {
					setFormOpen(open);
					if (!open) {
						setEditing(null);
						clearParams();
					}
				},
				onSaved: invalidate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CsvImportWizard, {
				open: importOpen,
				onOpenChange: (open) => {
					setImportOpen(open);
					if (!open) clearParams();
				},
				onImported: invalidate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(transferTarget),
				onOpenChange: (open) => !open && setTransferTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-md",
					"data-testid": "transfer-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Transfer student"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							"Move ",
							transferTarget?.firstName,
							" ",
							transferTarget?.lastName,
							" to another class. Roll numbers are reassigned automatically."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-medium text-foreground",
								children: "Destination class"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
								value: transferClassId,
								onValueChange: setTransferClassId,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
									"data-testid": "transfer-class-select",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a class" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
									className: "bg-popover",
									children: classes.map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
										value: cls.id,
										"data-testid": `transfer-class-${cls.id}`,
										children: [
											cls.name,
											" · ",
											cls.studentCount,
											"/",
											cls.capacity,
											" seats"
										]
									}, cls.id))
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setTransferTarget(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "transfer-confirm",
							disabled: !transferClassId || transferMutation.isPending,
							onClick: () => transferMutation.mutate(),
							children: transferMutation.isPending ? "Transferring…" : "Transfer student"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(confirm),
				onOpenChange: (open) => !open && setConfirm(null),
				title: confirm?.title ?? "",
				description: confirm?.description ?? "",
				confirmLabel: confirm?.label,
				destructive: confirm?.destructive,
				busy: removeMutation.isPending || bulkMutation.isPending || statusMutation.isPending,
				onConfirm: () => confirm?.run(),
				testId: "students-confirm"
			})
		]
	});
}
var SplitComponent = StudentsPage;
//#endregion
export { SplitComponent as component };
