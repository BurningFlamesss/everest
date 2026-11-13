import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
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
import { Textarea } from "#/components/ui/textarea";
import { getFacilitiesServer } from "#/packages/content/server/content";
import {
	deleteFacilityServer,
	saveFacilityServer,
} from "#/packages/content/server/mutations";
import { useAuth } from "#/providers/AuthProvider";
import type { Facility } from "#/types/index";

export default function FacilitiesPage() {
	const { can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<Facility> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Facility | null>(null);

	const { data: facilities = [], isLoading } = useQuery({
		queryKey: ["facilities"],
		queryFn: () => getFacilitiesServer(),
	});

	const invalidate = () => {
		void qc.invalidateQueries({ queryKey: ["facilities"] });
		void qc.invalidateQueries({ queryKey: ["content"] });
	};

	const saveMutation = useMutation({
		mutationFn: (data: any) => saveFacilityServer({ data }),
		onSuccess: () => {
			toast.success("Facility saved");
			invalidate();
			setOpen(false);
			setEditing(null);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to save facility"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteFacilityServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Facility deleted");
			invalidate();
			setPendingDelete(null);
		},
		onError: (error: Error) =>
			toast.error(error.message || "Failed to delete facility"),
	});

	const columns: Column<Facility>[] = [
		{
			key: "name",
			header: "Facility",
			render: (row) => (
				<div className="min-w-0">
					<div className="font-medium text-foreground">{row.name}</div>
					<p className="truncate text-xs text-muted-foreground">{row.blurb}</p>
				</div>
			),
		},
		{ key: "category", header: "Category", render: (row) => row.category },
		{ key: "block", header: "Block", render: (row) => row.block || "—" },
		{ key: "hours", header: "Hours", render: (row) => row.hours || "—" },
		{
			key: "inCharge",
			header: "In charge",
			render: (row) => row.inCharge || "—",
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
							aria-label={`Edit ${row.name}`}
							data-testid={`facility-edit-${row.id}`}
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
							aria-label={`Delete ${row.name}`}
							data-testid={`facility-delete-${row.id}`}
							onClick={() => setPendingDelete(row)}
						>
							<Trash2 className="h-4 w-4" />
						</Button>
					)}
				</div>
			),
		},
	];

	return (
		<main className="flex-1 overflow-y-auto bg-surface-base px-6 py-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<PageHeader
					eyebrow="Website"
					title="Facilities"
					description="Campus facilities shown on the public facilities page."
					actions={
						canManage ? (
							<Button
								data-testid="facility-add"
								onClick={() => {
									setEditing({ category: "Campus" });
									setOpen(true);
								}}
							>
								<Plus className="mr-2 h-4 w-4" /> Add Facility
							</Button>
						) : null
					}
				/>

				{facilities.length > 0 ? (
					<DataTable
						columns={columns}
						rows={facilities as Facility[]}
						rowId={(r) => r.id}
						testId="facilities-table"
					/>
				) : (
					!isLoading && (
						<EmptyState
							icon={Building2}
							title="No facilities yet"
							description="Add your first campus facility to show it on the public page."
							primaryLabel={canManage ? "Add facility" : undefined}
							onPrimary={
								canManage
									? () => {
											setEditing({ category: "Campus" });
											setOpen(true);
										}
									: undefined
							}
							testId="facilities-empty"
						/>
					)
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editing?.id ? "Edit Facility" : "Add Facility"}
							</DialogTitle>
							<DialogDescription>
								Name, category and a short description shown on the public page.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Name</Label>
									<Input
										value={editing?.name || ""}
										data-testid="facility-form-name"
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, name: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Category</Label>
									<Input
										value={editing?.category || ""}
										placeholder="e.g. Campus, Lab, Sports"
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, category: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Short blurb</Label>
								<Input
									value={editing?.blurb || ""}
									onChange={(e: any) =>
										setEditing((p) => ({ ...p, blurb: e.target.value }))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Description</Label>
								<Textarea
									rows={3}
									value={editing?.description || ""}
									onChange={(e: any) =>
										setEditing((p) => ({ ...p, description: e.target.value }))
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Block / location</Label>
									<Input
										value={editing?.block || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, block: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Hours</Label>
									<Input
										value={editing?.hours || ""}
										placeholder="e.g. 08:00–17:00"
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, hours: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>In charge</Label>
									<Input
										value={editing?.inCharge || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, inCharge: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Image URL</Label>
									<Input
										value={editing?.image || ""}
										placeholder="/images/…"
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, image: e.target.value }))
										}
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								data-testid="facility-form-save"
								onClick={() => saveMutation.mutate(editing)}
								disabled={
									saveMutation.isPending || !editing?.name || !editing?.category
								}
							>
								{saveMutation.isPending ? "Saving…" : "Save Facility"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<ConfirmDialog
					open={!!pendingDelete}
					onOpenChange={(op) => !op && setPendingDelete(null)}
					title="Delete Facility"
					description={`Are you sure you want to delete "${pendingDelete?.name}"?`}
					destructive
					onConfirm={() =>
						pendingDelete && deleteMutation.mutate(pendingDelete.id)
					}
					busy={deleteMutation.isPending}
					testId="facility-delete-dialog"
				/>
			</div>
		</main>
	);
}
