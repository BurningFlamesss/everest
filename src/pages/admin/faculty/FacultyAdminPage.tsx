import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, Star, Trash2, Users } from "lucide-react";
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
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { prismaFacultyListServer } from "#/packages/content/server/faculty";
import {
	deleteFacultyMemberServer,
	saveFacultyMemberServer,
} from "#/packages/content/server/mutations";

interface FacultyRow {
	id: string;
	slug: string;
	name: string;
	role: string;
	department: string;
	qualification: string;
	experience: string;
	subjects: string[];
	email: string;
	extension: string;
	officeHours: string;
	bio: string;
	joined: string;
	leadership: boolean;
	rank: number | null;
	order: number;
}

function slugify(value: string) {
	return value
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-");
}

export default function FacultyAdminPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<FacultyRow> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<FacultyRow | null>(null);

	const { data: members = [], isLoading } = useQuery({
		queryKey: ["faculty-members"],
		queryFn: () => prismaFacultyListServer(),
	});

	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["faculty-members"] });
		// public directory is read through the root loader; keep it fresh too
		qc.invalidateQueries({ queryKey: ["content"] });
	};

	const saveMutation = useMutation({
		mutationFn: (data: any) => saveFacultyMemberServer({ data }),
		onSuccess: () => {
			toast.success("Faculty member saved");
			invalidate();
			setOpen(false);
			setEditing(null);
		},
		onError: () => toast.error("Failed to save faculty member"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteFacultyMemberServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Faculty member deleted");
			invalidate();
			setPendingDelete(null);
		},
		onError: () => toast.error("Failed to delete faculty member"),
	});

	const columns: Column<FacultyRow>[] = [
		{
			key: "name",
			header: "Name",
			render: (row) => (
				<div className="flex items-center gap-2">
					<span className="font-medium">{row.name}</span>
					{row.leadership && (
						<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
					)}
				</div>
			),
		},
		{ key: "role", header: "Role", render: (row) => row.role },
		{
			key: "department",
			header: "Department",
			render: (row) => row.department,
		},
		{
			key: "subjects",
			header: "Subjects",
			render: (row) =>
				Array.isArray(row.subjects) ? row.subjects.join(", ") : "—",
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
					eyebrow="Website"
					title="Faculty Directory"
					description="Teachers and leadership shown on the public faculty page."
					actions={
						<Button
							onClick={() => {
								setEditing({ subjects: [], leadership: false });
								setOpen(true);
							}}
						>
							<Plus className="mr-2 h-4 w-4" /> Add Member
						</Button>
					}
				/>

				{members.length > 0 ? (
					<DataTable
						columns={columns}
						rows={members as FacultyRow[]}
						rowId={(r) => r.id}
						testId="faculty-table"
					/>
				) : (
					!isLoading && (
						<EmptyState
							icon={Users}
							title="No faculty members yet"
							description="Add your first faculty member to populate the public directory."
							primaryLabel="Add member"
							onPrimary={() => {
								setEditing({ subjects: [], leadership: false });
								setOpen(true);
							}}
						/>
					)
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
						<DialogHeader>
							<DialogTitle>
								{editing?.id ? "Edit Member" : "Add Member"}
							</DialogTitle>
							<DialogDescription>
								Details shown on the public faculty directory.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Full name</Label>
									<Input
										value={editing?.name || ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												name: e.target.value,
												slug: p?.id ? p.slug : slugify(e.target.value),
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Slug</Label>
									<Input
										value={editing?.slug || ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												slug: slugify(e.target.value),
											}))
										}
										placeholder="auto-generated"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Role</Label>
									<Input
										value={editing?.role || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, role: e.target.value }))
										}
										placeholder="e.g. Principal, Science Teacher"
									/>
								</div>
								<div className="space-y-2">
									<Label>Department</Label>
									<Input
										value={editing?.department || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, department: e.target.value }))
										}
										placeholder="e.g. Science"
									/>
								</div>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Qualification</Label>
									<Input
										value={editing?.qualification || ""}
										onChange={(e: any) =>
											setEditing((p) => ({
												...p,
												qualification: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Experience</Label>
									<Input
										value={editing?.experience || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, experience: e.target.value }))
										}
										placeholder="e.g. 12 years"
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Subjects (comma-separated)</Label>
								<Input
									value={
										Array.isArray(editing?.subjects)
											? editing.subjects.join(", ")
											: ""
									}
									onChange={(e: any) =>
										setEditing((p) => ({
											...p,
											subjects: e.target.value
												.split(",")
												.map((s: string) => s.trim())
												.filter(Boolean),
										}))
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Email</Label>
									<Input
										value={editing?.email || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, email: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Office hours</Label>
									<Input
										value={editing?.officeHours || ""}
										onChange={(e: any) =>
											setEditing((p) => ({ ...p, officeHours: e.target.value }))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Bio</Label>
								<Textarea
									value={editing?.bio || ""}
									onChange={(e: any) =>
										setEditing((p) => ({ ...p, bio: e.target.value }))
									}
									rows={3}
								/>
							</div>
							<div className="flex items-center justify-between rounded-lg border border-hairline p-3">
								<div>
									<Label>Leadership</Label>
									<p className="text-xs text-muted-foreground">
										Show this member in the leadership section.
									</p>
								</div>
								<Switch
									checked={Boolean(editing?.leadership)}
									onCheckedChange={(v: boolean) =>
										setEditing((p) => ({ ...p, leadership: v }))
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
									saveMutation.isPending ||
									!editing?.name ||
									!editing?.slug ||
									!editing?.role ||
									!editing?.department
								}
							>
								Save Member
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<ConfirmDialog
					open={!!pendingDelete}
					onOpenChange={(op) => !op && setPendingDelete(null)}
					title="Delete Faculty Member"
					description={`Are you sure you want to remove ${pendingDelete?.name} from the directory?`}
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
