import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { ImageUploader } from "#/components/common/ImageUploader";
import { PageHeader } from "#/components/common/PageHeader";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { getProgramsServer } from "#/packages/content/server/content";
import {
	deleteProgramServer,
	saveProgramServer,
} from "#/packages/content/server/mutations";
import { useAuth } from "#/providers/AuthProvider";
import type { FeeLine, Program, Subject } from "#/types/index";

const LEVELS = [
	{ id: "basic", label: "Early Years & Primary" },
	{ id: "lower-secondary", label: "Lower Secondary" },
	{ id: "secondary", label: "Secondary" },
	{ id: "plus2-science", label: "+2 Science" },
	{ id: "plus2-management", label: "+2 Management" },
];

const ROUTINE_KEYS = [
	{ id: "grade-1-5", label: "Grade 1 – 5" },
	{ id: "grade-6-8", label: "Grade 6 – 8" },
	{ id: "grade-9-10", label: "Grade 9 – 10" },
	{ id: "grade-11-12-science", label: "Grade 11 – 12 · Science" },
	{ id: "grade-11-12-management", label: "Grade 11 – 12 · Management" },
];

const SUBJECT_KINDS: Subject["kind"][] = [
	"Compulsory",
	"Optional",
	"Elective",
	"Co-curricular",
];

const FEE_FREQUENCIES: FeeLine["frequency"][] = [
	"Annual",
	"Monthly",
	"One-time",
	"Per term",
];

function blankProgram(): Partial<Program> {
	return {
		level: "plus2-science",
		code: "",
		title: "",
		stream: "",
		duration: "",
		seats: 0,
		medium: "English",
		eligibility: "",
		summary: "",
		description: "",
		highlights: [],
		outcomes: [],
		careers: [],
		subjects: [],
		fees: [],
		image: "",
		routineKey: "grade-11-12-science",
		spotlight: false,
		order: 0,
	};
}

export default function ProgrammesPage() {
	const { can } = useAuth();
	const canManage = can("courses.manage");
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<Program> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Program | null>(null);

	const { data: programs = [], isLoading } = useQuery({
		queryKey: ["programs"],
		queryFn: () => getProgramsServer(),
	});

	const invalidate = () => {
		void qc.invalidateQueries({ queryKey: ["programs"] });
		void qc.invalidateQueries({ queryKey: ["content"] });
	};

	const saveMutation = useMutation({
		mutationFn: (data: Partial<Program>) =>
			saveProgramServer({
				data: {
					...data,
					level: data.level ?? "plus2-science",
					code: data.code ?? "",
					title: data.title ?? "",
					seats: Number(data.seats ?? 0),
					order: Number(data.order ?? 0),
					highlights: (data.highlights ?? []).filter(Boolean),
					outcomes: (data.outcomes ?? []).filter(Boolean),
					careers: (data.careers ?? []).filter(Boolean),
					subjects: (data.subjects ?? []).filter((s) => s.code || s.name),
					fees: (data.fees ?? []).filter((f) => f.label || f.amount),
				},
			}),
		onSuccess: () => {
			toast.success("Programme saved");
			invalidate();
			setOpen(false);
			setEditing(null);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to save programme"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteProgramServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Programme deleted");
			invalidate();
			setPendingDelete(null);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to delete programme"),
	});

	const columns: Column<Program>[] = [
		{
			key: "title",
			header: "Programme",
			render: (row) => (
				<div className="min-w-0">
					<div className="font-medium text-foreground">{row.title}</div>
					<p className="truncate text-xs text-muted-foreground">
						{row.code}
						{row.stream ? ` · ${row.stream}` : ""}
					</p>
				</div>
			),
		},
		{
			key: "level",
			header: "Level",
			render: (row) =>
				LEVELS.find((level) => level.id === row.level)?.label ?? row.level,
		},
		{ key: "seats", header: "Seats", render: (row) => String(row.seats) },
		{
			key: "duration",
			header: "Duration",
			render: (row) => row.duration || "—",
		},
		{
			key: "spotlight",
			header: "Featured",
			render: (row) =>
				row.spotlight ? (
					<StatusBadge value="published" label="Featured" />
				) : (
					<span className="text-xs text-muted-foreground">—</span>
				),
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (row) => (
				<div className="flex items-center justify-end gap-1">
					{canManage && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8"
							aria-label={`Edit ${row.title}`}
							data-testid={`programme-edit-${row.id}`}
							onClick={() => {
								setEditing(row);
								setOpen(true);
							}}
						>
							<Pencil className="h-4 w-4" />
						</Button>
					)}
					{canManage && (
						<Button
							variant="ghost"
							size="icon"
							className="h-8 w-8 text-destructive"
							aria-label={`Delete ${row.title}`}
							data-testid={`programme-delete-${row.id}`}
							onClick={() => setPendingDelete(row)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			),
		},
	];

	const setField = <K extends keyof Program>(key: K, value: Program[K]) =>
		setEditing((prev) => ({ ...prev, [key]: value }));

	const subjects = editing?.subjects ?? [];
	const fees = editing?.fees ?? [];

	const setSubjects = (next: Subject[]) => setField("subjects", next);
	const setFees = (next: FeeLine[]) => setField("fees", next);

	return (
		<div data-testid="programmes-page">
			<PageHeader
				eyebrow="Academics"
				title="Programmes"
				description="Every programme record shown on the public courses page: identity, copy, subjects, fees and the timetable it links to."
				actions={
					canManage ? (
						<Button
							size="sm"
							className="gap-1.5"
							data-testid="programme-add"
							onClick={() => {
								setEditing(blankProgram());
								setOpen(true);
							}}
						>
							<Plus className="h-3.5 w-3.5" /> Add Programme
						</Button>
					) : null
				}
			/>

			<DataTable
				columns={columns}
				rows={programs as Program[]}
				rowId={(r) => r.id}
				testId="programmes-table"
				loading={isLoading}
				empty={
					<EmptyState
						icon={GraduationCap}
						title="No programmes yet"
						description="Add your first programme record to show it on the public courses page."
						primaryLabel={canManage ? "Add programme" : undefined}
						onPrimary={
							canManage
								? () => {
										setEditing(blankProgram());
										setOpen(true);
									}
								: undefined
						}
						testId="programmes-empty"
					/>
				}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[92vh] overflow-y-auto border-hairline bg-popover sm:max-w-3xl">
					<DialogHeader>
						<DialogTitle>
							{editing?.id ? "Edit Programme" : "Add Programme"}
						</DialogTitle>
						<DialogDescription>
							Everything below is rendered on the public courses page.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Identity
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Level</Label>
									<Select
										value={editing?.level ?? "plus2-science"}
										onValueChange={(value: string) =>
											setField("level", value as Program["level"])
										}
									>
										<SelectTrigger className="h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{LEVELS.map((level) => (
												<SelectItem key={level.id} value={level.id}>
													{level.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Code</Label>
									<Input
										value={editing?.code ?? ""}
										placeholder="e.g. NEB-SCI-PHY"
										data-testid="programme-form-code"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setField("code", e.target.value)
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Title</Label>
								<Input
									value={editing?.title ?? ""}
									placeholder="e.g. +2 Science — Physical Group"
									data-testid="programme-form-title"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setField("title", e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Stream</Label>
								<Input
									value={editing?.stream ?? ""}
									placeholder="e.g. Physics · Chemistry · Mathematics"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setField("stream", e.target.value)
									}
								/>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Duration</Label>
									<Input
										value={editing?.duration ?? ""}
										placeholder="2 years · 4 semesters"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setField("duration", e.target.value)
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Seats</Label>
									<Input
										type="number"
										value={editing?.seats ?? 0}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setField("seats", Number(e.target.value))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Medium</Label>
									<Input
										value={editing?.medium ?? ""}
										placeholder="English"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setField("medium", e.target.value)
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Eligibility</Label>
								<Textarea
									rows={2}
									value={editing?.eligibility ?? ""}
									placeholder="SEE with minimum GPA 2.4…"
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setField("eligibility", e.target.value)
									}
								/>
							</div>
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Copy
							</h3>
							<div className="space-y-2">
								<Label className="text-xs">Summary</Label>
								<Textarea
									rows={2}
									value={editing?.summary ?? ""}
									placeholder="Shown under the featured programme title."
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setField("summary", e.target.value)
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Description</Label>
								<Textarea
									rows={4}
									value={editing?.description ?? ""}
									placeholder="The overview paragraph in the programme detail."
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setField("description", e.target.value)
									}
								/>
							</div>
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Photography & presentation
							</h3>
							<ImageUploader
								value={editing?.image || undefined}
								label="Featured image"
								aspect="aspect-[16/9]"
								testId="programme-form-image"
								onChange={(url: string | undefined) =>
									setField("image", url ?? "")
								}
							/>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Routine</Label>
									<Select
										value={editing?.routineKey ?? "grade-11-12-science"}
										onValueChange={(value: string) =>
											setField("routineKey", value as Program["routineKey"])
										}
									>
										<SelectTrigger className="h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{ROUTINE_KEYS.map((routine) => (
												<SelectItem key={routine.id} value={routine.id}>
													{routine.label}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Order</Label>
									<Input
										type="number"
										value={editing?.order ?? 0}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setField("order", Number(e.target.value))
										}
									/>
								</div>
							</div>
							<div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface-1 px-3 py-2.5">
								<div>
									<Label className="text-xs">Featured programme</Label>
									<p className="text-[11px] text-muted-foreground">
										Shown in the spotlight block at the top of the level.
									</p>
								</div>
								<Switch
									checked={Boolean(editing?.spotlight)}
									onCheckedChange={(checked: boolean) =>
										setField("spotlight", checked)
									}
								/>
							</div>
						</section>

						<StringListEditor
							title="Highlights"
							description="The bullet points beside the featured programme image."
							values={editing?.highlights ?? []}
							onChange={(values) => setField("highlights", values)}
						/>
						<StringListEditor
							title="Learning outcomes"
							description="Shown on the Pathways tab."
							values={editing?.outcomes ?? []}
							onChange={(values) => setField("outcomes", values)}
						/>
						<StringListEditor
							title="Career pathways"
							description="Where graduates go next. Shown on the Pathways tab."
							values={editing?.careers ?? []}
							onChange={(values) => setField("careers", values)}
						/>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<div className="flex items-center justify-between gap-2">
								<div>
									<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Subjects
									</h3>
									<p className="mt-1 text-[11px] text-muted-foreground">
										The subject list and credit hours on the Subjects tab.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={() =>
										setSubjects([
											...subjects,
											{
												code: "",
												name: "",
												credit: 0,
												kind: "Compulsory",
											},
										])
									}
								>
									<Plus className="h-3 w-3" /> Add subject
								</Button>
							</div>
							{subjects.length === 0 ? (
								<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
									No subjects yet.
								</p>
							) : null}
							{subjects.map((subject, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: subject rows are positional and editable
									key={index}
									className="grid grid-cols-[1fr_1.4fr_70px_140px_36px] items-center gap-2"
								>
									<Input
										value={subject.code}
										placeholder="Code"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setSubjects(
												subjects.map((row, i) =>
													i === index ? { ...row, code: e.target.value } : row,
												),
											)
										}
									/>
									<Input
										value={subject.name}
										placeholder="Subject name"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setSubjects(
												subjects.map((row, i) =>
													i === index ? { ...row, name: e.target.value } : row,
												),
											)
										}
									/>
									<Input
										type="number"
										value={subject.credit}
										aria-label="Credit hours"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setSubjects(
												subjects.map((row, i) =>
													i === index
														? { ...row, credit: Number(e.target.value) }
														: row,
												),
											)
										}
									/>
									<Select
										value={subject.kind}
										onValueChange={(value: string) =>
											setSubjects(
												subjects.map((row, i) =>
													i === index
														? { ...row, kind: value as Subject["kind"] }
														: row,
												),
											)
										}
									>
										<SelectTrigger className="h-9">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{SUBJECT_KINDS.map((kind) => (
												<SelectItem key={kind} value={kind}>
													{kind}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 shrink-0 text-destructive"
										aria-label={`Remove subject ${index + 1}`}
										onClick={() =>
											setSubjects(subjects.filter((_, i) => i !== index))
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<div className="flex items-center justify-between gap-2">
								<div>
									<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Fees
									</h3>
									<p className="mt-1 text-[11px] text-muted-foreground">
										The fee table and totals on the Fees tab.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={() =>
										setFees([
											...fees,
											{
												label: "",
												amount: 0,
												frequency: "Annual",
												note: "",
											},
										])
									}
								>
									<Plus className="h-3 w-3" /> Add fee line
								</Button>
							</div>
							{fees.length === 0 ? (
								<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
									No fee lines yet.
								</p>
							) : null}
							{fees.map((fee, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: fee rows are positional and editable
									key={index}
									className="space-y-2 rounded-md border border-hairline bg-surface-2 p-2.5"
								>
									<div className="grid grid-cols-[1.4fr_110px_140px_36px] items-center gap-2">
										<Input
											value={fee.label}
											placeholder="Particular"
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setFees(
													fees.map((row, i) =>
														i === index
															? { ...row, label: e.target.value }
															: row,
													),
												)
											}
										/>
										<Input
											type="number"
											value={fee.amount}
											aria-label="Amount"
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setFees(
													fees.map((row, i) =>
														i === index
															? { ...row, amount: Number(e.target.value) }
															: row,
													),
												)
											}
										/>
										<Select
											value={fee.frequency}
											onValueChange={(value: string) =>
												setFees(
													fees.map((row, i) =>
														i === index
															? {
																	...row,
																	frequency: value as FeeLine["frequency"],
																}
															: row,
													),
												)
											}
										>
											<SelectTrigger className="h-9">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{FEE_FREQUENCIES.map((frequency) => (
													<SelectItem key={frequency} value={frequency}>
														{frequency}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Button
											variant="ghost"
											size="icon"
											className="h-9 w-9 shrink-0 text-destructive"
											aria-label={`Remove fee line ${index + 1}`}
											onClick={() =>
												setFees(fees.filter((_, i) => i !== index))
											}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
									<Input
										value={fee.note ?? ""}
										placeholder="Note (optional)"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setFees(
												fees.map((row, i) =>
													i === index ? { ...row, note: e.target.value } : row,
												),
											)
										}
									/>
								</div>
							))}
						</section>
					</div>

					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							data-testid="programme-form-save"
							onClick={() => saveMutation.mutate(editing ?? {})}
							disabled={
								saveMutation.isPending || !editing?.title || !editing?.code
							}
						>
							{saveMutation.isPending ? "Saving…" : "Save Programme"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(op) => !op && setPendingDelete(null)}
				title="Delete Programme"
				description={`Are you sure you want to delete "${pendingDelete?.title}"? This removes it from the public courses page.`}
				destructive
				onConfirm={() =>
					pendingDelete && deleteMutation.mutate(pendingDelete.id)
				}
				busy={deleteMutation.isPending}
				testId="programme-delete-dialog"
			/>
		</div>
	);
}

function StringListEditor({
	title,
	description,
	values,
	onChange,
}: {
	title: string;
	description: string;
	values: string[];
	onChange: (values: string[]) => void;
}) {
	const [input, setInput] = useState("");
	const add = () => {
		const value = input.trim();
		if (!value) return;
		onChange([...values, value]);
		setInput("");
	};
	return (
		<section className="space-y-3 rounded-lg border border-hairline p-3.5">
			<div>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{title}
				</h3>
				<p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
			</div>
			<div className="flex gap-2">
				<Input
					value={input}
					placeholder={`Add ${title.toLowerCase()}…`}
					onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
						setInput(e.target.value)
					}
					onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
						if (e.key === "Enter") {
							e.preventDefault();
							add();
						}
					}}
				/>
				<Button
					variant="outline"
					size="sm"
					className="h-9 shrink-0 gap-1"
					disabled={!input.trim()}
					onClick={add}
				>
					<Plus className="h-3.5 w-3.5" /> Add
				</Button>
			</div>
			{values.length === 0 ? (
				<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
					Nothing added yet.
				</p>
			) : (
				<ul className="space-y-1.5">
					{values.map((value, index) => (
						<li
							// biome-ignore lint/suspicious/noArrayIndexKey: list rows are positional and editable
							key={index}
							className="flex items-center gap-2 rounded-md border border-hairline bg-surface-2 px-2.5 py-1.5"
						>
							<span className="min-w-0 flex-1 text-[13px] text-foreground">
								{value}
							</span>
							<Button
								variant="ghost"
								size="icon"
								className="h-7 w-7 shrink-0 text-destructive"
								aria-label={`Remove ${value}`}
								onClick={() => onChange(values.filter((_, i) => i !== index))}
							>
								<Trash2 className="h-3.5 w-3.5" />
							</Button>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
