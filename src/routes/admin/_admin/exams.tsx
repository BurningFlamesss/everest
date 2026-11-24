import { createFileRoute, redirect, useSearch } from "@tanstack/react-router";
import { Award, Loader2, Megaphone, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils.ts";
import {
	addExamScheduleAction,
	createExamAction,
	deleteExamAction,
	deleteExamScheduleAction,
	getExamOptionsFn,
	getExamRosterAction,
	getExamsDataFn,
	publishExamAction,
	saveMarksAction,
} from "#/packages/academics/exams-server.ts";

export const Route = createFileRoute("/admin/_admin/exams")({
	beforeLoad: ({ context }) => {
		if (
			!context.viewer.permissions.includes("MANAGE_EXAMS") &&
			context.viewer.primaryRole !== "STAFF"
		) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminExams,
});

interface TermOption {
	id: string;
	name: string;
	academicYear: { name: string; isActive: boolean };
}

interface CourseOption {
	id: string;
	code: string;
	name: string;
}

interface ScheduleRow {
	id: string;
	date: string | Date;
	startsAt: string | null;
	maxMarks: number;
	room: string | null;
	course: { id: string; code: string; name: string };
	_count: { marks: number };
}

interface ExamRow {
	id: string;
	name: string;
	startsOn: string | Date;
	endsOn: string | Date;
	isPublished: boolean;
	term: { name: string; academicYear: { name: string } };
	schedules: Array<ScheduleRow>;
}

interface RosterStudent {
	id: string;
	name: string;
	email: string;
	score: number | null;
}

interface Roster {
	schedule: { id: string; maxMarks: number; date: string | Date };
	course: { code: string; name: string };
	students: Array<RosterStudent>;
}

function AdminExams() {
	const { viewer } = Route.useRouteContext();
	const canManage = viewer.permissions.includes("MANAGE_EXAMS");
	const searchParams =
		(useSearch({ strict: false }) as Record<string, string | undefined>) || {};
	const queryCourseId = searchParams.courseId;

	const [terms, setTerms] = useState<Array<TermOption>>([]);
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [exams, setExams] = useState<Array<ExamRow>>([]);
	const [selectedExamId, setSelectedExamId] = useState("");
	const [roster, setRoster] = useState<Roster | null>(null);
	const [scores, setScores] = useState<Record<string, string>>({});
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [pendingPublish, setPendingPublish] = useState<ExamRow | null>(null);
	const [pendingExam, setPendingExam] = useState<ExamRow | null>(null);
	const [pendingSchedule, setPendingSchedule] = useState<ScheduleRow | null>(
		null,
	);

	const load = useCallback(async () => {
		const [options, data] = await Promise.all([
			getExamOptionsFn(),
			getExamsDataFn(),
		]);

		if (!options.success) setError(options.error);
		else {
			setTerms(options.terms as Array<TermOption>);
			setCourses(options.courses as Array<CourseOption>);
		}

		if (!data.success) setError(data.error);
		else {
			setExams(data.exams as Array<ExamRow>);
			setSelectedExamId((current) => current || (data.exams[0]?.id ?? ""));
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createExam = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const values = new FormData(form);
		const response = await createExamAction({
			data: {
				termId: String(values.get("termId") ?? ""),
				name: String(values.get("name") ?? ""),
				startsOn: String(values.get("startsOn") ?? ""),
				endsOn: String(values.get("endsOn") ?? ""),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setNotice("Exam created.");
		await load();
	};

	const addSchedule = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const values = new FormData(form);
		const response = await addExamScheduleAction({
			data: {
				examId: selectedExamId,
				courseId: String(values.get("courseId") ?? ""),
				date: String(values.get("date") ?? ""),
				startsAt: String(values.get("startsAt") ?? "") || undefined,
				maxMarks: Number(values.get("maxMarks") ?? 100),
				room: String(values.get("room") ?? "") || undefined,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setNotice("Paper added to the exam.");
		await load();
	};

	const openRoster = async (scheduleId: string) => {
		setError("");
		setNotice("");
		const response = await getExamRosterAction({ data: { scheduleId } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		const loaded = response as unknown as Roster & { success: true };
		setRoster(loaded);
		setScores(
			Object.fromEntries(
				loaded.students.map((student) => [
					student.id,
					student.score === null ? "" : String(student.score),
				]),
			),
		);
	};

	useEffect(() => {
		if (queryCourseId && exams.length > 0 && !roster) {
			const matchingExam = exams.find((exam) =>
				exam.schedules.some(
					(s) =>
						(s.course as any).id === queryCourseId ||
						s.course.code === queryCourseId,
				),
			);
			if (matchingExam) {
				setSelectedExamId(matchingExam.id);
				const matchingSchedule = matchingExam.schedules.find(
					(s) =>
						(s.course as any).id === queryCourseId ||
						s.course.code === queryCourseId,
				);
				if (matchingSchedule) {
					void openRoster(matchingSchedule.id);
				}
			}
		}
	}, [queryCourseId, exams, roster]);

	const save = async () => {
		if (!roster) return;

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const response = await saveMarksAction({
			data: {
				scheduleId: roster.schedule.id,
				marks: roster.students.map((student) => {
					const raw = scores[student.id]?.trim() ?? "";
					const parsed = raw === "" ? null : Number(raw);

					return {
						studentId: student.id,
						score:
							parsed === null || Number.isNaN(parsed)
								? null
								: Math.max(0, Math.min(roster.schedule.maxMarks, parsed)),
					};
				}),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		const loaded = response as unknown as Roster & { success: true };
		setRoster(loaded);
		setScores(
			Object.fromEntries(
				loaded.students.map((student) => [
					student.id,
					student.score === null ? "" : String(student.score),
				]),
			),
		);
		setNotice("Marks saved.");
		await load();
	};

	const publish = async (id: string) => {
		const response = await publishExamAction({ data: { id } });

		if (!response.success) setError(response.error);
		else {
			setNotice("Results published and notifications sent.");
			await load();
		}
	};

	const removeExam = async (id: string) => {
		const response = await deleteExamAction({ data: { id } });
		if (!response.success) setError(response.error);
		else {
			setSelectedExamId("");
			await load();
		}
	};

	const removeSchedule = async (id: string) => {
		const response = await deleteExamScheduleAction({ data: { id } });
		if (!response.success) setError(response.error);
		else await load();
	};

	const selectedExam = exams.find((exam) => exam.id === selectedExamId);

	return (
		<div data-testid="exams-page" className="space-y-5">
			<PageHeader
				testId="exams-page-header"
				eyebrow="Academics"
				title="Exams & marks"
				description="Schedule papers, enter marks per course and publish results once every paper is graded."
				meta={
					!isLoading ? (
						<span data-testid="exams-meta-count">
							{exams.length} {exams.length === 1 ? "exam" : "exams"}
						</span>
					) : undefined
				}
			/>

			{error ? (
				<div
					role="alert"
					data-testid="exams-error"
					className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{error}
				</div>
			) : null}
			{notice ? (
				<div
					data-testid="exams-notice"
					className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
				>
					{notice}
				</div>
			) : null}

			{canManage && (
				<Panel
					title="New exam"
					description="Create an exam window for a term."
					testId="exams-new-exam-panel"
					bodyClassName="p-5"
				>
					<form
						onSubmit={(event) => void createExam(event)}
						className="grid gap-4 md:grid-cols-4"
					>
						<Select label="Term" name="termId" required>
							<option value="">Select…</option>
							{terms.map((term) => (
								<option key={term.id} value={term.id}>
									{term.academicYear.name} · {term.name}
								</option>
							))}
						</Select>
						<Input label="Name" name="name" required placeholder="Mid-term" />
						<Input label="Starts" name="startsOn" type="date" required />
						<Input label="Ends" name="endsOn" type="date" required />
						<div className="md:col-span-4">
							<Button type="submit" disabled={isSubmitting} className="gap-1.5">
								{isSubmitting ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Award className="h-3.5 w-3.5" />
								)}
								Create exam
							</Button>
						</div>
					</form>
				</Panel>
			)}

			<Panel
				title="Exams"
				description="Select an exam to manage its papers and marks."
				testId="exams-exams-panel"
				actions={
					<label className="space-y-1.5">
						<Label className="text-xs">Selected exam</Label>
						<select
							value={selectedExamId}
							onChange={(event) => {
								setSelectedExamId(event.target.value);
								setRoster(null);
							}}
							data-testid="exams-selected-exam"
							className={fieldClasses}
						>
							<option value="">Select…</option>
							{exams.map((exam) => (
								<option key={exam.id} value={exam.id}>
									{exam.name} · {exam.term.name}
								</option>
							))}
						</select>
					</label>
				}
				bodyClassName="p-5"
			>
				{isLoading ? (
					<ListSkeleton rows={3} />
				) : exams.length === 0 ? (
					<EmptyState
						icon={Award}
						title="No exams yet"
						description="Create an exam above to start scheduling papers."
						testId="exams-empty"
						compact
					/>
				) : selectedExam ? (
					<div className="space-y-4">
						<div
							className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-1 px-4 py-3"
							data-testid={`exams-card-${selectedExam.id}`}
						>
							<div className="min-w-0">
								<p className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
									{selectedExam.name}
									{selectedExam.isPublished ? (
										<span className="rounded-full bg-success/12 px-2 py-0.5 text-[11px] font-semibold text-success">
											Published
										</span>
									) : null}
								</p>
								<p className="text-xs text-muted-foreground">
									{selectedExam.term.academicYear.name} ·{" "}
									{selectedExam.term.name}
								</p>
							</div>
							{canManage && (
								<div className="flex gap-2">
									{!selectedExam.isPublished ? (
										<Button
											size="sm"
											className="gap-1.5"
											data-testid={`exams-publish-${selectedExam.id}`}
											onClick={() => setPendingPublish(selectedExam)}
										>
											<Megaphone className="h-3.5 w-3.5" /> Publish results
										</Button>
									) : null}
									<Button
										variant="outline"
										size="sm"
										className="gap-1.5 text-destructive hover:bg-destructive/10"
										data-testid={`exams-delete-${selectedExam.id}`}
										onClick={() => setPendingExam(selectedExam)}
									>
										<Trash2 className="h-3.5 w-3.5" /> Delete
									</Button>
								</div>
							)}
						</div>

						{canManage && (
							<form
								onSubmit={(event) => void addSchedule(event)}
								className="grid gap-3 rounded-lg border border-hairline bg-surface-1 p-4 md:grid-cols-5"
								data-testid="exams-add-paper-form"
							>
								<Select label="Course" name="courseId" required>
									<option value="">Select…</option>
									{courses.map((course) => (
										<option key={course.id} value={course.id}>
											{course.code} · {course.name}
										</option>
									))}
								</Select>
								<Input label="Date" name="date" type="date" required />
								<Input
									label="Max marks"
									name="maxMarks"
									type="number"
									min={1}
									max={1000}
									defaultValue={100}
								/>
								<Input label="Room" name="room" className="md:col-span-2" />
								<div className="md:col-span-5">
									<Button
										type="submit"
										variant="outline"
										size="sm"
										className="gap-1.5"
										disabled={isSubmitting}
									>
										<Plus className="h-3.5 w-3.5" /> Add paper
									</Button>
								</div>
							</form>
						)}

						{selectedExam.schedules.length === 0 ? (
							<p
								className="rounded-lg border border-dashed border-hairline bg-surface-1 p-4 text-sm text-muted-foreground"
								data-testid="exams-schedules-empty"
							>
								No papers scheduled yet.
							</p>
						) : (
							<ul className="divide-y divide-hairline rounded-lg border border-hairline">
								{selectedExam.schedules.map((schedule) => (
									<li
										key={schedule.id}
										className="group flex flex-wrap items-center justify-between gap-3 px-4 py-3 transition-colors duration-150 hover:bg-surface-2"
									>
										<div className="min-w-0">
											<p className="text-sm font-medium text-foreground">
												{schedule.course.code} · {schedule.course.name}
											</p>
											<p className="num text-xs text-muted-foreground">
												{new Date(schedule.date).toLocaleDateString()}
												{schedule.startsAt ? ` · ${schedule.startsAt}` : ""} ·{" "}
												{schedule._count.marks} mark
												{schedule._count.marks === 1 ? "" : "s"} of{" "}
												{schedule.maxMarks}
											</p>
										</div>
										<div className="flex items-center gap-2">
											<Button
												size="sm"
												className="gap-1.5"
												data-testid={`exams-enter-marks-${schedule.id}`}
												onClick={() => void openRoster(schedule.id)}
											>
												Enter marks
											</Button>
											{canManage && (
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 text-destructive"
													aria-label="Delete paper"
													data-testid={`exams-schedule-delete-${schedule.id}`}
													onClick={() => setPendingSchedule(schedule)}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											)}
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				) : null}
			</Panel>

			{roster ? (
				<Panel
					title={`${roster.course.code} · ${roster.course.name}`}
					description={`Marks out of ${roster.schedule.maxMarks}. Leave blank to clear a mark.`}
					testId="exams-roster-panel"
					actions={
						<Button
							size="sm"
							className="gap-1.5"
							disabled={isSubmitting}
							data-testid="exams-save-marks"
							onClick={() => void save()}
						>
							{isSubmitting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<Save className="h-3.5 w-3.5" />
							)}
							Save marks
						</Button>
					}
					bodyClassName="p-0"
				>
					{roster.students.length === 0 ? (
						<EmptyState
							title="No students enrolled"
							description="No active students are enrolled in this course."
							testId="exams-roster-empty"
							compact
						/>
					) : (
						<ul className="divide-y divide-hairline">
							{roster.students.map((student) => (
								<li
									key={student.id}
									className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 transition-colors duration-150 hover:bg-surface-2"
								>
									<div className="min-w-0">
										<p className="text-sm font-medium text-foreground">
											{student.name}
										</p>
										<p className="text-xs text-muted-foreground">
											{student.email}
										</p>
									</div>
									<input
										type="number"
										min={0}
										max={roster.schedule.maxMarks}
										step="0.5"
										value={scores[student.id] ?? ""}
										onChange={(event) =>
											setScores((current) => ({
												...current,
												[student.id]: event.target.value,
											}))
										}
										placeholder="—"
										data-testid={`exams-score-${student.id}`}
										className={cn(fieldClasses, "num w-24")}
									/>
								</li>
							))}
						</ul>
					)}
				</Panel>
			) : null}

			<ConfirmDialog
				open={!!pendingPublish}
				onOpenChange={(open) => !open && setPendingPublish(null)}
				testId="exams-publish-dialog"
				title="Publish results"
				description="Publish results? Students and guardians will be notified."
				confirmLabel="Publish"
				onConfirm={() => pendingPublish && void publish(pendingPublish.id)}
			/>

			<ConfirmDialog
				open={!!pendingExam}
				onOpenChange={(open) => !open && setPendingExam(null)}
				testId="exams-delete-dialog"
				title="Delete exam"
				description="Delete this exam and all its marks?"
				confirmLabel="Delete"
				destructive
				onConfirm={() => pendingExam && void removeExam(pendingExam.id)}
			/>

			<ConfirmDialog
				open={!!pendingSchedule}
				onOpenChange={(open) => !open && setPendingSchedule(null)}
				testId="exams-schedule-delete-dialog"
				title="Delete paper"
				description="Delete this paper and its marks?"
				confirmLabel="Delete"
				destructive
				onConfirm={() =>
					pendingSchedule && void removeSchedule(pendingSchedule.id)
				}
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
