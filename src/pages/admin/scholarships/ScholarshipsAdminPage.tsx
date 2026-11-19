import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
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
import {
	deleteScholarshipServer,
	saveScholarshipServer,
} from "#/packages/content/server/mutations";
import { prismaScholarshipListServer } from "#/packages/content/server/scholarships";

const CATEGORIES = [
	"Merit",
	"Need-based",
	"Government",
	"Sports",
	"Arts",
	"Community",
] as const;

interface EligibilityRow {
	id?: string;
	label?: string;
	detail?: string;
}

interface ScholarshipRow {
	id: string;
	ref: string;
	name: string;
	nepaliName: string;
	category: string;
	coverage: number;
	award: string;
	amountNpr: number;
	seats: number;
	deadlineAd: string;
	deadlineBs: string;
	appliesTo: string;
	summary: string;
	description: string;
	eligibility: EligibilityRow[];
	benefits: string[];
	documents: string[];
	process: string[];
	renewal: string;
	contact: string;
	spotlight: boolean;
	order: number;
}

function blankScholarship(): Partial<ScholarshipRow> {
	return {
		category: "Merit",
		coverage: 0,
		amountNpr: 0,
		seats: 0,
		deadlineAd: "",
		deadlineBs: "",
		award: "",
		appliesTo: "",
		summary: "",
		description: "",
		benefits: [],
		documents: [],
		process: [],
		eligibility: [],
		renewal: "",
		contact: "",
		spotlight: false,
		order: 0,
	};
}

function FormSection({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="space-y-3 rounded-lg border border-hairline p-3.5">
			<div>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
					{title}
				</h3>
				{description ? (
					<p className="mt-1 text-[11px] text-muted-foreground">
						{description}
					</p>
				) : null}
			</div>
			{children}
		</section>
	);
}

function StringListEditor({
	label,
	addLabel,
	items,
	placeholder,
	multiline = false,
	onChange,
}: {
	label: string;
	addLabel: string;
	items: string[];
	placeholder?: string;
	multiline?: boolean;
	onChange: (next: string[]) => void;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<Label className="text-xs">{label}</Label>
				<Button
					variant="outline"
					size="sm"
					className="h-7 gap-1 px-2 text-xs"
					onClick={() => onChange([...items, ""])}
				>
					<Plus className="h-3 w-3" /> {addLabel}
				</Button>
			</div>
			{items.length === 0 ? (
				<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
					Nothing added yet.
				</p>
			) : null}
			{items.map((item, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: rows are positional and editable
				<div key={index} className="flex items-start gap-2">
					{multiline ? (
						<Textarea
							rows={2}
							value={item}
							placeholder={placeholder}
							onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
								onChange(
									items.map((value, i) =>
										i === index ? event.target.value : value,
									),
								)
							}
						/>
					) : (
						<Input
							value={item}
							placeholder={placeholder}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								onChange(
									items.map((value, i) =>
										i === index ? event.target.value : value,
									),
								)
							}
						/>
					)}
					<Button
						variant="ghost"
						size="icon"
						className="h-9 w-9 shrink-0 text-destructive"
						aria-label={`Remove ${label} ${index + 1}`}
						onClick={() => onChange(items.filter((_, i) => i !== index))}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			))}
		</div>
	);
}

function EligibilityEditor({
	items,
	onChange,
}: {
	items: EligibilityRow[];
	onChange: (next: EligibilityRow[]) => void;
}) {
	const setRow = (index: number, key: "label" | "detail", value: string) => {
		onChange(
			items.map((row, i) => (i === index ? { ...row, [key]: value } : row)),
		);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<div>
					<Label className="text-xs">Eligibility criteria</Label>
					<p className="mt-0.5 text-[11px] text-muted-foreground">
						Each row appears in the public self-check list.
					</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="h-7 gap-1 px-2 text-xs"
					onClick={() =>
						onChange([
							...items,
							{ id: crypto.randomUUID(), label: "", detail: "" },
						])
					}
				>
					<Plus className="h-3 w-3" /> Add criterion
				</Button>
			</div>
			{items.length === 0 ? (
				<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
					No criteria yet.
				</p>
			) : null}
			{items.map((row, index) => (
				<div
					key={row.id ?? `criterion-${index}`}
					className="space-y-2 rounded-lg border border-hairline bg-surface-2 p-2.5"
				>
					<div className="flex items-center justify-between gap-2">
						<p className="text-[11px] font-semibold text-muted-foreground">
							Criterion {index + 1}
						</p>
						<Button
							variant="ghost"
							size="icon"
							className="h-6 w-6 text-destructive"
							aria-label={`Remove criterion ${index + 1}`}
							onClick={() => onChange(items.filter((_, i) => i !== index))}
						>
							<Trash2 className="h-3.5 w-3.5" />
						</Button>
					</div>
					<Input
						value={row.label ?? ""}
						placeholder="Short criterion, e.g. SEE GPA 3.6 or above"
						onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
							setRow(index, "label", event.target.value)
						}
					/>
					<Textarea
						rows={2}
						value={row.detail ?? ""}
						placeholder="How the committee verifies this."
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
							setRow(index, "detail", event.target.value)
						}
					/>
				</div>
			))}
		</div>
	);
}

export default function ScholarshipsAdminPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<ScholarshipRow> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<ScholarshipRow | null>(
		null,
	);

	const { data: scholarships = [], isLoading } = useQuery({
		queryKey: ["scholarships"],
		queryFn: () => prismaScholarshipListServer(),
	});

	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["scholarships"] });
		qc.invalidateQueries({ queryKey: ["content"] });
	};

	const saveMutation = useMutation({
		mutationFn: (data: Partial<ScholarshipRow>) => {
			const payload = {
				...data,
				eligibility: (data.eligibility ?? []).map((row, index) => ({
					id: row.id || `criterion-${index + 1}`,
					label: row.label ?? "",
					detail: row.detail ?? "",
				})),
			};
			return saveScholarshipServer({
				data: {
					...payload,
					name: payload.name ?? "",
					ref: payload.ref ?? "",
					category: payload.category ?? "Merit",
				},
			});
		},
		onSuccess: () => {
			toast.success("Scholarship saved");
			invalidate();
			setOpen(false);
			setEditing(null);
		},
		onError: () => toast.error("Failed to save scholarship"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteScholarshipServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Scholarship deleted");
			invalidate();
			setPendingDelete(null);
		},
		onError: () => toast.error("Failed to delete scholarship"),
	});

	const columns: Column<ScholarshipRow>[] = [
		{
			key: "name",
			header: "Scholarship",
			render: (row) => (
				<div className="flex items-center gap-2">
					<span className="font-medium">{row.name}</span>
					{row.spotlight && (
						<Star className="h-3.5 w-3.5 fill-warning text-warning" />
					)}
				</div>
			),
		},
		{ key: "category", header: "Category", render: (row) => row.category },
		{
			key: "coverage",
			header: "Coverage",
			render: (row) => `${row.coverage}%`,
		},
		{ key: "seats", header: "Seats", render: (row) => String(row.seats) },
		{
			key: "deadlineBs",
			header: "Deadline (B.S.)",
			render: (row) => row.deadlineBs || "—",
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (row) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label={`Edit ${row.name}`}
						data-testid={`scholarship-edit-${row.id}`}
						onClick={() => {
							setEditing(row);
							setOpen(true);
						}}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive"
						aria-label={`Delete ${row.name}`}
						data-testid={`scholarship-delete-${row.id}`}
						onClick={() => setPendingDelete(row)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<div data-testid="scholarships-page">
			<PageHeader
				eyebrow="Operations"
				title="Scholarships"
				description="Every scheme, criterion, document and line of copy shown on the public scholarship page."
				actions={
					<Button
						size="sm"
						className="gap-1.5"
						onClick={() => {
							setEditing(blankScholarship());
							setOpen(true);
						}}
					>
						<Plus className="h-3.5 w-3.5" /> Add Scholarship
					</Button>
				}
			/>

			<DataTable
				columns={columns}
				rows={scholarships as ScholarshipRow[]}
				rowId={(r) => r.id}
				testId="scholarships-table"
				loading={isLoading}
				empty={
					<EmptyState
						icon={GraduationCap}
						title="No scholarships yet"
						description="Add your first scholarship scheme to display it publicly."
						primaryLabel="Add scholarship"
						onPrimary={() => {
							setEditing(blankScholarship());
							setOpen(true);
						}}
					/>
				}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[92vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editing?.id ? "Edit Scholarship" : "Add Scholarship"}
						</DialogTitle>
						<DialogDescription>
							All of this content is rendered on the public scholarship page.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3.5">
						<FormSection title="Identity">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Name (English)</Label>
									<Input
										value={editing?.name || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, name: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Name (Nepali)</Label>
									<Input
										value={editing?.nepaliName || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												nepaliName: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Reference</Label>
									<Input
										value={editing?.ref || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, ref: e.target.value }))
										}
										placeholder="e.g. SCH-01"
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Category</Label>
									<Select
										value={editing?.category || "Merit"}
										onValueChange={(v: string) =>
											setEditing((p) => ({ ...p, category: v }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-popover">
											{CATEGORIES.map((c) => (
												<SelectItem key={c} value={c}>
													{c}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>
						</FormSection>

						<FormSection
							title="Award"
							description="The figures and scope shown in the award summary strip."
						>
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Coverage (%)</Label>
									<Input
										type="number"
										value={editing?.coverage ?? ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												coverage: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Amount (NPR)</Label>
									<Input
										type="number"
										value={editing?.amountNpr ?? ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												amountNpr: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Seats</Label>
									<Input
										type="number"
										value={editing?.seats ?? ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												seats: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Award label</Label>
								<Input
									value={editing?.award || ""}
									placeholder="e.g. Full tuition waiver"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setEditing((p) => ({ ...p, award: e.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Applies to</Label>
								<Input
									value={editing?.appliesTo || ""}
									placeholder="e.g. +2 Science and Management · Grade 11 entry"
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setEditing((p) => ({
											...p,
											appliesTo: e.target.value,
										}))
									}
								/>
							</div>
						</FormSection>

						<FormSection title="Dates & ordering">
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Deadline (A.D.)</Label>
									<Input
										type="date"
										value={editing?.deadlineAd || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												deadlineAd: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Deadline (B.S.)</Label>
									<Input
										value={editing?.deadlineBs || ""}
										placeholder="e.g. Ashwin 19, 2083"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												deadlineBs: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Order</Label>
									<Input
										type="number"
										value={editing?.order ?? 0}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												order: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>
						</FormSection>

						<FormSection title="Page copy">
							<div className="space-y-2">
								<Label className="text-xs">Summary</Label>
								<Textarea
									rows={2}
									value={editing?.summary || ""}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setEditing((p) => ({ ...p, summary: e.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Description</Label>
								<Textarea
									rows={4}
									value={editing?.description || ""}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setEditing((p) => ({
											...p,
											description: e.target.value,
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Renewal terms</Label>
								<Textarea
									rows={2}
									value={editing?.renewal || ""}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setEditing((p) => ({ ...p, renewal: e.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Who to ask</Label>
								<Textarea
									rows={2}
									value={editing?.contact || ""}
									onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
										setEditing((p) => ({ ...p, contact: e.target.value }))
									}
								/>
							</div>
						</FormSection>

						<FormSection
							title="Eligibility"
							description="Shown as the public eligibility self-check."
						>
							<EligibilityEditor
								items={editing?.eligibility ?? []}
								onChange={(next) =>
									setEditing((p) => ({ ...p, eligibility: next }))
								}
							/>
						</FormSection>

						<FormSection title="Benefits">
							<StringListEditor
								label="Benefit lines"
								addLabel="Add benefit"
								items={editing?.benefits ?? []}
								multiline
								placeholder="What the award covers."
								onChange={(next) =>
									setEditing((p) => ({ ...p, benefits: next }))
								}
							/>
						</FormSection>

						<FormSection title="Documents">
							<StringListEditor
								label="Required documents"
								addLabel="Add document"
								items={editing?.documents ?? []}
								multiline
								placeholder="One document per row, as the desk asks for it."
								onChange={(next) =>
									setEditing((p) => ({ ...p, documents: next }))
								}
							/>
						</FormSection>

						<FormSection title="Application process">
							<StringListEditor
								label="Process steps"
								addLabel="Add step"
								items={editing?.process ?? []}
								multiline
								placeholder="One step per row, in order."
								onChange={(next) =>
									setEditing((p) => ({ ...p, process: next }))
								}
							/>
						</FormSection>

						<div className="flex items-center justify-between rounded-lg border border-hairline p-3">
							<div>
								<Label className="text-xs">Spotlight</Label>
								<p className="text-xs text-muted-foreground">
									Feature this scholarship prominently.
								</p>
							</div>
							<Switch
								checked={Boolean(editing?.spotlight)}
								onCheckedChange={(v: boolean) =>
									setEditing((p) => ({ ...p, spotlight: v }))
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => editing && saveMutation.mutate(editing)}
							disabled={
								saveMutation.isPending || !editing?.name || !editing?.ref
							}
						>
							Save Scholarship
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(op) => !op && setPendingDelete(null)}
				testId="scholarships-delete-confirm"
				title="Delete Scholarship"
				description={`Are you sure you want to delete "${pendingDelete?.name}"?`}
				destructive
				onConfirm={() =>
					pendingDelete && deleteMutation.mutate(pendingDelete.id)
				}
				busy={deleteMutation.isPending}
			/>
		</div>
	);
}
