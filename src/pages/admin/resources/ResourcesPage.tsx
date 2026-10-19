import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FolderDown, Pencil, Plus, Trash2 } from "lucide-react";
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
import { getResourcesServer } from "#/packages/content/server/content";
import {
	deleteResourceServer,
	saveResourceServer,
} from "#/packages/content/server/mutations";
import type { Resource } from "#/types/index";

const KIND_OPTIONS = ["PDF", "DOC", "XLSX", "ZIP", "Link"] as const;
const AUDIENCE_OPTIONS = ["All", "Students", "Guardians", "Staff"] as const;

export default function ResourcesPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<Resource> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<Resource | null>(null);

	const { data: resources = [], isLoading } = useQuery({
		queryKey: ["resources"],
		queryFn: () => getResourcesServer(),
	});

	const invalidate = () => qc.invalidateQueries({ queryKey: ["resources"] });

	const saveMutation = useMutation({
		mutationFn: (data: any) => saveResourceServer({ data }),
		onSuccess: () => {
			toast.success("Resource saved");
			invalidate();
			setOpen(false);
			setEditing(null);
		},
		onError: () => toast.error("Failed to save resource"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteResourceServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Resource deleted");
			invalidate();
			setPendingDelete(null);
		},
		onError: () => toast.error("Failed to delete resource"),
	});

	const columns: Column<Resource>[] = [
		{
			key: "title",
			header: "Title",
			render: (row) => <div className="font-medium">{row.title}</div>,
		},
		{ key: "category", header: "Category", render: (row) => row.category },
		{ key: "kind", header: "Type", render: (row) => row.kind },
		{ key: "audience", header: "Audience", render: (row) => row.audience },
		{ key: "fileSize", header: "Size", render: (row) => row.fileSize || "—" },
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
			<div className="mx-auto max-w-5xl space-y-6">
				<PageHeader
					eyebrow="Website"
					title="Resources"
					description="Downloadable files and links for students, guardians and staff."
					actions={
						<Button
							onClick={() => {
								setEditing({ kind: "PDF", audience: "All" });
								setOpen(true);
							}}
						>
							<Plus className="mr-2 h-4 w-4" /> Add Resource
						</Button>
					}
				/>

				{resources.length > 0 ? (
					<DataTable
						columns={columns}
						rows={resources}
						rowId={(r) => r.id}
						testId="resources-table"
					/>
				) : (
					!isLoading && (
						<EmptyState
							icon={FolderDown}
							title="No resources yet"
							description="Add your first downloadable resource to get started."
							primaryLabel="Add resource"
							onPrimary={() => {
								setEditing({ kind: "PDF", audience: "All" });
								setOpen(true);
							}}
						/>
					)
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editing?.id ? "Edit Resource" : "Add Resource"}
							</DialogTitle>
							<DialogDescription>
								Provide a title, link and audience for this resource.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label>Title</Label>
								<Input
									value={editing?.title || ""}
									onChange={(e: any) =>
										setEditing((p) => ({ ...p, title: e.target.value }))
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Category</Label>
									<Input
										value={editing?.category || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, category: e.target.value }))
										}
										placeholder="e.g. Forms, Syllabus"
									/>
								</div>
								<div className="space-y-2">
									<Label>File URL</Label>
									<Input
										value={editing?.fileUrl || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, fileUrl: e.target.value }))
										}
										placeholder="https://…"
									/>
								</div>
							</div>
							<div className="grid grid-cols-3 gap-4">
								<div className="space-y-2">
									<Label>Type</Label>
									<Select
										value={editing?.kind || "PDF"}
										onValueChange={(v: string) =>
											setEditing((p) => ({ ...p, kind: v }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-popover">
											{KIND_OPTIONS.map((k) => (
												<SelectItem key={k} value={k}>
													{k}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>Audience</Label>
									<Select
										value={editing?.audience || "All"}
										onValueChange={(v: string) =>
											setEditing((p) => ({ ...p, audience: v }))
										}
									>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-popover">
											{AUDIENCE_OPTIONS.map((a) => (
												<SelectItem key={a} value={a}>
													{a}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-2">
									<Label>File size</Label>
									<Input
										value={editing?.fileSize || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, fileSize: e.target.value }))
										}
										placeholder="e.g. 1.2 MB"
									/>
								</div>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => saveMutation.mutate(editing)}
								disabled={
									saveMutation.isPending ||
									!editing?.title ||
									!editing?.fileUrl ||
									!editing?.category
								}
							>
								Save Resource
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<ConfirmDialog
					open={!!pendingDelete}
					onOpenChange={(op) => !op && setPendingDelete(null)}
					title="Delete Resource"
					description={`Are you sure you want to delete "${pendingDelete?.title}"?`}
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
