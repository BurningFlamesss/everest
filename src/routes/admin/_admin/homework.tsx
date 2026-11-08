import { createFileRoute, redirect } from "@tanstack/react-router";
import { Loader2, NotebookPen, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AttachmentUploadField } from "#/components/content/AttachmentUploadField.tsx";
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

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Homework</h1>
				<p className="mt-1 text-sm text-gray-500">
					Assignments are visible only to students enrolled in the course and
					their guardians.
				</p>
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{notice ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					{notice}
				</div>
			) : null}

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Plus className="h-5 w-5 text-red-500" /> New assignment
				</h2>
				<form
					key={formVersion}
					onSubmit={(event) => void submit(event)}
					className="grid gap-4 md:grid-cols-2"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Course</span>
						<select
							name="courseId"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Select…</option>
							{courses.map((course) => (
								<option key={course.id} value={course.id}>
									{course.code} · {course.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Due</span>
						<input
							type="datetime-local"
							name="dueAt"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm md:col-span-2">
						<span className="mb-1 block font-medium text-gray-700">Title</span>
						<input
							name="title"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm md:col-span-2">
						<span className="mb-1 block font-medium text-gray-700">
							Instructions
						</span>
						<textarea
							name="instructions"
							required
							rows={4}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<AttachmentUploadField
						name="attachments"
						prefix="homework"
						disabled={isSubmitting}
						onUploadingChange={setIsUploading}
						className="md:col-span-2"
					/>
					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={isSubmitting || isUploading}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<NotebookPen className="h-4 w-4" />
							)}
							Publish assignment
						</button>
					</div>
				</form>
			</section>

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<header className="border-b border-gray-200 px-5 py-4">
					<h2 className="font-semibold text-gray-900">Assignments</h2>
				</header>
				{isLoading ? (
					<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : assignments.length === 0 ? (
					<p className="p-8 text-center text-sm text-gray-500">
						No assignments yet.
					</p>
				) : (
					<ul className="divide-y divide-gray-100">
						{assignments.map((assignment) => (
							<li key={assignment.id} className="px-5 py-4">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div className="min-w-0">
										<p className="font-medium text-gray-900">
											{assignment.title}
										</p>
										<p className="text-xs text-gray-500">
											{assignment.course.code} · {assignment.course.name} · due{" "}
											{new Date(assignment.dueAt).toLocaleString()}
										</p>
										<p className="mt-1 text-sm text-gray-600">
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
															className="text-red-600 underline"
														>
															{attachment.label ||
																attachment.fileAsset.originalName}
														</a>
													</li>
												))}
											</ul>
										) : null}
									</div>
									<button
										type="button"
										onClick={async () => {
											if (!confirm("Delete this assignment?")) return;
											const response = await deleteAssignmentAction({
												data: { id: assignment.id },
											});
											if (!response.success) setError(response.error);
											else await load();
										}}
										className="inline-flex items-center gap-1 text-xs font-medium text-red-600"
									>
										<Trash2 className="h-3.5 w-3.5" /> Delete
									</button>
								</div>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
