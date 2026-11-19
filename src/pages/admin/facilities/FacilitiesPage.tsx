import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { ImageUploader } from "#/components/common/ImageUploader";
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

function blankFacility(): Partial<Facility> {
	return {
		category: "Campus",
		block: "",
		blurb: "",
		description: "",
		image: "",
		gallery: [],
		stats: [],
		hours: "",
		inCharge: "",
		studentsLove: "",
		since: "",
	};
}

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
		mutationFn: (data: any) =>
			saveFacilityServer({
				data: {
					...data,
					gallery: (data.gallery ?? []).filter(Boolean),
					stats: (data.stats ?? []).filter(
						(stat: { label?: string; value?: string }) =>
							stat.label?.trim() && stat.value?.trim(),
					),
				},
			}),
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

	const gallery = editing?.gallery ?? [];
	const stats = editing?.stats ?? [];

	const setGallery = (next: string[]) =>
		setEditing((p) => ({ ...p, gallery: next }));
	const setStats = (next: { label: string; value: string }[]) =>
		setEditing((p) => ({ ...p, stats: next }));

	return (
		<div data-testid="facilities-page">
			<PageHeader
				eyebrow="Website"
				title="Facilities"
				description="Every space, photograph, specification and quote shown on the public facilities page."
				actions={
					canManage ? (
						<Button
							size="sm"
							className="gap-1.5"
							data-testid="facility-add"
							onClick={() => {
								setEditing(blankFacility());
								setOpen(true);
							}}
						>
							<Plus className="h-3.5 w-3.5" /> Add Facility
						</Button>
					) : null
				}
			/>

			<DataTable
				columns={columns}
				rows={facilities as Facility[]}
				rowId={(r) => r.id}
				testId="facilities-table"
				loading={isLoading}
				empty={
					<EmptyState
						icon={Building2}
						title="No facilities yet"
						description="Add your first campus facility to show it on the public page."
						primaryLabel={canManage ? "Add facility" : undefined}
						onPrimary={
							canManage
								? () => {
										setEditing(blankFacility());
										setOpen(true);
									}
								: undefined
						}
						testId="facilities-empty"
					/>
				}
			/>

			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="max-h-[92vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editing?.id ? "Edit Facility" : "Add Facility"}
						</DialogTitle>
						<DialogDescription>
							Everything below is rendered on the public facilities page.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Identity
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Name</Label>
									<Input
										value={editing?.name || ""}
										data-testid="facility-form-name"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, name: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Category</Label>
									<Input
										value={editing?.category || ""}
										placeholder="e.g. Campus, Lab, Sports"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												category: e.target.value as Facility["category"],
											}))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label className="text-xs">Short blurb</Label>
								<Input
									value={editing?.blurb || ""}
									placeholder="One line shown under the name in the index."
									onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
										setEditing((p) => ({ ...p, blurb: e.target.value }))
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
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Photography
							</h3>
							<ImageUploader
								value={editing?.image || undefined}
								label="Featured image"
								aspect="aspect-[16/9]"
								testId="facility-form-image"
								onChange={(url: string | undefined) =>
									setEditing((p) => ({ ...p, image: url ?? "" }))
								}
							/>
							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<div>
										<Label className="text-xs">Gallery</Label>
										<p className="mt-0.5 text-[11px] text-muted-foreground">
											Three images are shown under “Inside the space”.
										</p>
									</div>
									<Button
										variant="outline"
										size="sm"
										className="h-7 gap-1 px-2 text-xs"
										onClick={() => setGallery([...gallery, ""])}
									>
										<Plus className="h-3 w-3" /> Add image
									</Button>
								</div>
								{gallery.length === 0 ? (
									<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
										No gallery images yet.
									</p>
								) : null}
								<div className="space-y-2">
									{gallery.map((src, index) => (
										<div
											// biome-ignore lint/suspicious/noArrayIndexKey: gallery rows are positional and editable
											key={index}
											className="rounded-lg border border-hairline bg-surface-2 p-2.5"
										>
											<div className="mb-2 flex items-center justify-between">
												<p className="text-[11px] font-semibold text-muted-foreground">
													Image {index + 1}
												</p>
												<Button
													variant="ghost"
													size="icon"
													className="h-6 w-6 text-destructive"
													aria-label={`Remove image ${index + 1}`}
													onClick={() =>
														setGallery(gallery.filter((_, i) => i !== index))
													}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</div>
											<ImageUploader
												value={src || undefined}
												aspect="aspect-[4/3]"
												testId={`facility-form-gallery-${index}`}
												onChange={(url: string | undefined) =>
													setGallery(
														gallery.map((value, i) =>
															i === index ? (url ?? "") : value,
														),
													)
												}
											/>
										</div>
									))}
								</div>
							</div>
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
								Operating detail
							</h3>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">Block / location</Label>
									<Input
										value={editing?.block || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, block: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">Hours</Label>
									<Input
										value={editing?.hours || ""}
										placeholder="e.g. 08:00–17:00"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, hours: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label className="text-xs">In charge</Label>
									<Input
										value={editing?.inCharge || ""}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({
												...p,
												inCharge: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label className="text-xs">In service since</Label>
									<Input
										value={editing?.since || ""}
										placeholder="e.g. Renovated 2081 BS"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setEditing((p) => ({ ...p, since: e.target.value }))
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
						</section>

						<section className="space-y-3 rounded-lg border border-hairline p-3.5">
							<div className="flex items-center justify-between gap-2">
								<div>
									<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
										Specifications
									</h3>
									<p className="mt-1 text-[11px] text-muted-foreground">
										Shown in the stats strip on the featured facility.
									</p>
								</div>
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={() => setStats([...stats, { label: "", value: "" }])}
								>
									<Plus className="h-3 w-3" /> Add spec
								</Button>
							</div>
							{stats.length === 0 ? (
								<p className="rounded-lg border border-dashed border-hairline px-3 py-2.5 text-[11px] text-muted-foreground">
									No specifications yet.
								</p>
							) : null}
							{stats.map((stat, index) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: spec rows are positional and editable
								<div key={index} className="flex items-center gap-2">
									<Input
										value={stat.label}
										placeholder="Label, e.g. Work stations"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setStats(
												stats.map((row, i) =>
													i === index ? { ...row, label: e.target.value } : row,
												),
											)
										}
									/>
									<Input
										value={stat.value}
										placeholder="Value, e.g. 24"
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setStats(
												stats.map((row, i) =>
													i === index ? { ...row, value: e.target.value } : row,
												),
											)
										}
									/>
									<Button
										variant="ghost"
										size="icon"
										className="h-9 w-9 shrink-0 text-destructive"
										aria-label={`Remove spec ${index + 1}`}
										onClick={() =>
											setStats(stats.filter((_, i) => i !== index))
										}
									>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							))}
						</section>

						<section className="space-y-2 rounded-lg border border-hairline p-3.5">
							<Label className="text-xs">What students say</Label>
							<Textarea
								rows={3}
								value={editing?.studentsLove || ""}
								placeholder="The quote shown for this space."
								onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
									setEditing((p) => ({
										...p,
										studentsLove: e.target.value,
									}))
								}
							/>
						</section>
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
	);
}
