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
	eligibility: any[];
	benefits: string[];
	documents: string[];
	process: string[];
	renewal: string;
	contact: string;
	spotlight: boolean;
	order: number;
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
		mutationFn: (data: any) => saveScholarshipServer({ data }),
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
						<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
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
						onClick={() => setPendingDelete(row)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<main className="flex-1 overflow-y-auto bg-surface-base px-6 py-8">
			<div className="mx-auto max-w-6xl space-y-6">
				<PageHeader
					eyebrow="Operations"
					title="Scholarships"
					description="Scholarship schemes shown on the public website."
					actions={
						<Button
							onClick={() => {
								setEditing({
									category: "Merit",
									benefits: [],
									documents: [],
									process: [],
									eligibility: [],
								});
								setOpen(true);
							}}
						>
							<Plus className="mr-2 h-4 w-4" /> Add Scholarship
						</Button>
					}
				/>

				{scholarships.length > 0 ? (
					<DataTable
						columns={columns}
						rows={scholarships as ScholarshipRow[]}
						rowId={(r) => r.id}
						testId="scholarships-table"
					/>
				) : (
					!isLoading && (
						<EmptyState
							icon={GraduationCap}
							title="No scholarships yet"
							description="Add your first scholarship scheme to display it publicly."
							primaryLabel="Add scholarship"
							onPrimary={() => {
								setEditing({
									category: "Merit",
									benefits: [],
									documents: [],
									process: [],
									eligibility: [],
								});
								setOpen(true);
							}}
						/>
					)
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editing?.id ? "Edit Scholarship" : "Add Scholarship"}
							</DialogTitle>
							<DialogDescription>
								Details shown on the public scholarship page.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Name (English)</Label>
									<Input
										value={editing?.name || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, name: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Name (Nepali)</Label>
									<Input
										value={editing?.nepaliName || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, nepaliName: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Reference</Label>
									<Input
										value={editing?.ref || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, ref: e.target.value }))
										}
										placeholder="e.g. SCH-01"
									/>
								</div>
								<div className="space-y-2">
									<Label>Category</Label>
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
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Coverage (%)</Label>
									<Input
										type="number"
										value={editing?.coverage ?? ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												coverage: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Amount (NPR)</Label>
									<Input
										type="number"
										value={editing?.amountNpr ?? ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												amountNpr: Number(e.target.value),
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Seats</Label>
									<Input
										type="number"
										value={editing?.seats ?? ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												seats: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Deadline (A.D.)</Label>
									<Input
										value={editing?.deadlineAd || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, deadlineAd: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Deadline (B.S.)</Label>
									<Input
										value={editing?.deadlineBs || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, deadlineBs: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Summary</Label>
								<Textarea
									rows={2}
									value={editing?.summary || ""}
									onChange={(e: any) =>
										setEditing((p) => ({ ...p, summary: e.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Benefits (comma-separated)</Label>
								<Input
									value={
										Array.isArray(editing?.benefits)
											? editing.benefits.join(", ")
											: ""
									}
									onChange={(e: any) =>
										setEditing((p) => ({
											...p,
											benefits: e.target.value
												.split(",")
												.map((s: string) => s.trim())
												.filter(Boolean),
										}))
									}
								/>
							</div>
							<div className="flex items-center justify-between rounded-lg border border-hairline p-3">
								<div>
									<Label>Spotlight</Label>
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
								onClick={() => saveMutation.mutate(editing)}
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
					title="Delete Scholarship"
					description={`Are you sure you want to delete "${pendingDelete?.name}"?`}
					destructive
					onConfirm={() =>
						pendingDelete && deleteMutation.mutate(pendingDelete.id)
					}
					busy={deleteMutation.isPending}
				/>
			</div>
		</main>
	);
}
