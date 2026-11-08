import { createFileRoute, redirect } from "@tanstack/react-router";
import { Award, Loader2, Megaphone, Plus, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
		if (!context.viewer.permissions.includes("MANAGE_EXAMS")) {
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
		if (!confirm("Publish results? Students and guardians will be notified.")) {
			return;
		}

		const response = await publishExamAction({ data: { id } });

		if (!response.success) setError(response.error);
		else {
			setNotice("Results published and notifications sent.");
			await load();
		}
	};

	const selectedExam = exams.find((exam) => exam.id === selectedExamId);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Exams & marks</h1>
				<p className="mt-1 text-sm text-gray-500">
					Schedule papers, enter marks per course and publish results once every
					paper is graded.
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
					<Plus className="h-5 w-5 text-red-500" /> New exam
				</h2>
				<form
					onSubmit={(event) => void createExam(event)}
					className="grid gap-4 md:grid-cols-4"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Term</span>
						<select
							name="termId"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Select…</option>
							{terms.map((term) => (
								<option key={term.id} value={term.id}>
									{term.academicYear.name} · {term.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Name</span>
						<input
							name="name"
							required
							placeholder="Mid-term"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Starts</span>
						<input
							type="date"
							name="startsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Ends</span>
						<input
							type="date"
							name="endsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-4">
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Award className="h-4 w-4" />
							)}
							Create exam
						</button>
					</div>
				</form>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<div className="flex flex-wrap items-end justify-between gap-3">
					<h2 className="text-lg font-semibold text-gray-900">Exams</h2>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Selected exam
						</span>
						<select
							value={selectedExamId}
							onChange={(event) => {
								setSelectedExamId(event.target.value);
								setRoster(null);
							}}
							className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Select…</option>
							{exams.map((exam) => (
								<option key={exam.id} value={exam.id}>
									{exam.name} · {exam.term.name}
								</option>
							))}
						</select>
					</label>
				</div>

				{isLoading ? (
					<p className="mt-4 flex items-center gap-2 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : exams.length === 0 ? (
					<p className="mt-4 text-sm text-gray-500">No exams yet.</p>
				) : selectedExam ? (
					<div className="mt-5 space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-4 py-3">
							<div>
								<p className="font-semibold text-gray-900">
									{selectedExam.name}
									{selectedExam.isPublished ? (
										<span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
											Published
										</span>
									) : null}
								</p>
								<p className="text-xs text-gray-500">
									{selectedExam.term.academicYear.name} ·{" "}
									{selectedExam.term.name}
								</p>
							</div>
							<div className="flex gap-2">
								{!selectedExam.isPublished ? (
									<button
										type="button"
										onClick={() => void publish(selectedExam.id)}
										className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
									>
										<Megaphone className="h-3.5 w-3.5" /> Publish results
									</button>
								) : null}
								<button
									type="button"
									onClick={async () => {
										if (!confirm("Delete this exam and all its marks?")) return;
										const response = await deleteExamAction({
											data: { id: selectedExam.id },
										});
										if (!response.success) setError(response.error);
										else {
											setSelectedExamId("");
											await load();
										}
									}}
									className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
								>
									<Trash2 className="h-3.5 w-3.5" /> Delete
								</button>
							</div>
						</div>

						<form
							onSubmit={(event) => void addSchedule(event)}
							className="grid gap-3 rounded-lg border border-gray-200 p-4 md:grid-cols-5"
						>
							<label className="text-sm md:col-span-2">
								<span className="mb-1 block font-medium text-gray-700">
									Course
								</span>
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
								<span className="mb-1 block font-medium text-gray-700">
									Date
								</span>
								<input
									type="date"
									name="date"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Max marks
								</span>
								<input
									type="number"
									name="maxMarks"
									min={1}
									max={1000}
									defaultValue={100}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Room
								</span>
								<input
									name="room"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								/>
							</label>
							<div className="md:col-span-5">
								<button
									type="submit"
									disabled={isSubmitting}
									className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
								>
									Add paper
								</button>
							</div>
						</form>

						{selectedExam.schedules.length === 0 ? (
							<p className="text-sm text-gray-500">No papers scheduled yet.</p>
						) : (
							<ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
								{selectedExam.schedules.map((schedule) => (
									<li
										key={schedule.id}
										className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
									>
										<div>
											<p className="text-sm font-medium text-gray-900">
												{schedule.course.code} · {schedule.course.name}
											</p>
											<p className="text-xs text-gray-500">
												{new Date(schedule.date).toLocaleDateString()}
												{schedule.startsAt ? ` · ${schedule.startsAt}` : ""} ·{" "}
												{schedule._count.marks} mark
												{schedule._count.marks === 1 ? "" : "s"} of{" "}
												{schedule.maxMarks}
											</p>
										</div>
										<div className="flex gap-2">
											<button
												type="button"
												onClick={() => void openRoster(schedule.id)}
												className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
											>
												Enter marks
											</button>
											<button
												type="button"
												onClick={async () => {
													if (!confirm("Delete this paper and its marks?"))
														return;
													const response = await deleteExamScheduleAction({
														data: { id: schedule.id },
													});
													if (!response.success) setError(response.error);
													else await load();
												}}
												className="text-xs font-medium text-red-600"
											>
												Delete
											</button>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
				) : null}
			</section>

			{roster ? (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
					<header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
						<div>
							<h2 className="font-semibold text-gray-900">
								{roster.course.code} · {roster.course.name}
							</h2>
							<p className="text-xs text-gray-500">
								Marks out of {roster.schedule.maxMarks}. Leave blank to clear a
								mark.
							</p>
						</div>
						<button
							type="button"
							onClick={() => void save()}
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<Save className="h-4 w-4" />
							)}
							Save marks
						</button>
					</header>
					{roster.students.length === 0 ? (
						<p className="p-6 text-sm text-gray-500">
							No active students are enrolled in this course.
						</p>
					) : (
						<ul className="divide-y divide-gray-100">
							{roster.students.map((student) => (
								<li
									key={student.id}
									className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
								>
									<div>
										<p className="text-sm font-medium text-gray-900">
											{student.name}
										</p>
										<p className="text-xs text-gray-500">{student.email}</p>
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
										className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
									/>
								</li>
							))}
						</ul>
					)}
				</section>
			) : null}
		</div>
	);
}
