import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2, NotebookPen, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { AttachmentUploadField } from "#/components/content/AttachmentUploadField.tsx";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils.ts";
import {
	createAssignmentAction,
	deleteAssignmentAction,
	getHomeworkDataFn,
} from "#/packages/academics/homework-server.ts";
import { getAcademicsDataFn } from "#/packages/academics/server.ts";

export const Route = createFileRoute("/admin/_admin/homework")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_ACADEMICS")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminHomework,
});

interface CourseOption {
	id: string;
	code: string;
	name: string;
}

interface AttachmentRow {
	id: string;
	label: string | null;
	fileAsset: { url: string; originalName: string };
}

interface AssignmentRow {
	id: string;
	title: string;
	instructions: string;
	dueAt: string | Date;
	course: { code: string; name: string };
	attachments: Array<AttachmentRow>;
}

function parseAttachments(raw: FormDataEntryValue | null) {
	if (typeof raw !== "string" || !raw.trim()) return [];

	try {
		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter(
				(entry: unknown): entry is { fileAssetId: string; label?: string } =>
					Boolean(entry) &&
					typeof entry === "object" &&
					typeof (entry as { fileAssetId?: unknown }).fileAssetId === "string",
			)
			.map((entry) => ({
				fileAssetId: entry.fileAssetId,
				...(entry.label ? { label: entry.label } : {}),
			}));
	} catch {
		return [];
	}
}

function AdminHomework() {
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [assignments, setAssignments] = useState<Array<AssignmentRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [formVersion, setFormVersion] = useState(0);
	const [pendingAssignment, setPendingAssignment] =
		useState<AssignmentRow | null>(null);

	const load = useCallback(async () => {
		const [academics, homework] = await Promise.all([
			getAcademicsDataFn(),
			getHomeworkDataFn(),
		]);

		if (!academics.success) setError(academics.error);
		else setCourses(academics.courses as Array<CourseOption>);

		if (!homework.success) setError(homework.error);
		else setAssignments(homework.assignments as Array<AssignmentRow>);

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isUploading) return;
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const response = await createAssignmentAction({
			data: {
				courseId: String(data.get("courseId") ?? ""),
				title: String(data.get("title") ?? ""),
				instructions: String(data.get("instructions") ?? ""),
				dueAt: String(data.get("dueAt") ?? ""),
				attachments: parseAttachments(data.get("attachments")),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setFormVersion((version) => version + 1);
		setNotice("Assignment published to the class.");
		await load();
	};

	const remove = async (id: string) => {
		const response = await deleteAssignmentAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		setPendingAssignment(null);
		await load();
	};

	return (
		<div data-testid="homework-page" className="space-y-5">
			<PageHeader
				testId="homework-page-header"
				eyebrow="Academics"
				title="Homework"
				description="Assignments are visible only to students enrolled in the course and their guardians."
				meta={
					!isLoading ? (
						<span data-testid="homework-meta-count">
							{assignments.length}{" "}
							{assignments.length === 1 ? "assignment" : "assignments"}
						</span>
					) : undefined
				}
			/>

			{error ? (
				<div
					role="alert"
					data-testid="homework-error"
					className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{error}
				</div>
			) : null}
			{notice ? (
				<div
					data-testid="homework-notice"
					className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
				>
					{notice}
				</div>
			) : null}

			<Panel
				title="New assignment"
				description="Publish homework with instructions, a due date and optional attachments."
				testId="homework-new-assignment-panel"
				bodyClassName="p-5"
			>
				<form
					key={formVersion}
					onSubmit={(event) => void submit(event)}
					className="grid gap-4 md:grid-cols-2"
				>
					<Select label="Course" name="courseId" required>
						<option value="">Select…</option>
						{courses.map((course) => (
							<option key={course.id} value={course.id}>
								{course.code} · {course.name}
							</option>
						))}
					</Select>
					<Input label="Due" name="dueAt" type="datetime-local" required />
					<Input
						label="Title"
						name="title"
						required
						className="md:col-span-2"
					/>
					<Textarea
						label="Instructions"
						name="instructions"
						required
						rows={4}
						className="md:col-span-2"
					/>
					<AttachmentUploadField
						name="attachments"
						prefix="homework"
						disabled={isSubmitting}
						onUploadingChange={setIsUploading}
						className="md:col-span-2"
					/>
					<div className="md:col-span-2">
						<Button
							type="submit"
							disabled={isSubmitting || isUploading}
							className="gap-1.5"
							data-testid="homework-publish"
						>
							{isSubmitting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<NotebookPen className="h-3.5 w-3.5" />
							)}
							Publish assignment
						</Button>
					</div>
				</form>
			</Panel>

			<Panel
				title="Assignments"
				testId="homework-assignments-panel"
				bodyClassName="p-0"
			>
				{isLoading ? (
					<div className="p-5">
						<ListSkeleton rows={4} />
					</div>
				) : assignments.length === 0 ? (
					<EmptyState
						icon={NotebookPen}
						title="No assignments yet"
						description="Publish the first assignment above to send homework to a class."
						testId="homework-assignments-empty"
					/>
				) : (
					<ul className="divide-y divide-hairline">
						{assignments.map((assignment) => (
							<li
								key={assignment.id}
								className="group px-5 py-4 transition-colors duration-150 hover:bg-surface-2"
								data-testid={`homework-assignment-${assignment.id}`}
							>
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="font-medium text-foreground">
											{assignment.title}
										</p>
										<p className="text-xs text-muted-foreground">
											{assignment.course.code} · {assignment.course.name} · due{" "}
											{new Date(assignment.dueAt).toLocaleString()}
										</p>
										<p className="mt-1 text-sm text-foreground">
											{assignment.instructions}
										</p>
										{assignment.attachments.length > 0 ? (
											<ul className="mt-2 flex flex-wrap gap-2 text-xs">
												{assignment.attachments.map((attachment) => (
													<li key={attachment.id}>
														<a
															href={attachment.fileAsset.url}
															target="_blank"
															rel="noreferrer"
															className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-1 px-2 py-0.5 font-medium text-primary transition-colors duration-150 hover:border-primary/35 hover:text-primary focus-ring"
															data-testid={`homework-attachment-${attachment.id}`}
														>
															{attachment.label ||
																attachment.fileAsset.originalName}
														</a>
													</li>
												))}
											</ul>
										) : null}
									</div>
									<div className="row-actions">
										<Button
											variant="ghost"
											size="icon"
											className="h-8 w-8 text-destructive"
											aria-label={`Delete ${assignment.title}`}
											data-testid={`homework-assignment-delete-${assignment.id}`}
											onClick={() => setPendingAssignment(assignment)}
										>
											<Trash2 className="h-4 w-4" />
										</Button>
									</div>
								</div>
							</li>
						))}
					</ul>
				)}
			</Panel>

			<ConfirmDialog
				open={!!pendingAssignment}
				onOpenChange={(open) => !open && setPendingAssignment(null)}
				testId="homework-assignment-delete-dialog"
				title="Delete assignment"
				description="Delete this assignment?"
				confirmLabel="Delete"
				destructive
				onConfirm={() => pendingAssignment && void remove(pendingAssignment.id)}
			/>
		</div>
	);
}

const fieldClasses =
	"h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring";

function Input({
	label,
	className,
	testId,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
	label: string;
	testId?: string;
}) {
	return (
		<label className={cn("block space-y-1.5", className)}>
			<Label className="text-xs">{label}</Label>
			<input {...props} data-testid={testId} className={fieldClasses} />
		</label>
	);
}

function Textarea({
	label,
	className,
	testId,
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
	label: string;
	testId?: string;
}) {
	return (
		<label className={cn("block space-y-1.5", className)}>
			<Label className="text-xs">{label}</Label>
			<textarea
				{...props}
				data-testid={testId}
				className={cn(fieldClasses, "py-2")}
			/>
		</label>
	);
}

function Select({
	label,
	className,
	testId,
	children,
	...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
	label: string;
	testId?: string;
}) {
	return (
		<label className={cn("block space-y-1.5", className)}>
			<Label className="text-xs">{label}</Label>
			<select {...props} data-testid={testId} className={fieldClasses}>
				{children}
			</select>
		</label>
	);
}
