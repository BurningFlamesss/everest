import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	BookOpen,
	Loader2,
	Pencil,
	Plus,
	School,
	Search,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useStudentSearch } from "#/components/people/useStudentSearch.ts";
import { cn } from "#/lib/utils.ts";
import {
	createClassroomAction,
	createCourseAction,
	deleteClassroomAction,
	deleteCourseAction,
	enrollStudentsAction,
	getAcademicsDataFn,
	getCourseDetailsAction,
	removeEnrollmentAction,
	updateClassroomAction,
	updateCourseAction,
} from "#/packages/academics/server.ts";
import type { StudentOption } from "#/packages/people/directory-service.ts";

export const Route = createFileRoute("/admin/_admin/academics")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_ACADEMICS")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminAcademics,
});

type Tab = "courses" | "classrooms" | "enrolments";

interface CourseRow {
	id: string;
	code: string;
	name: string;
	description: string | null;
	grade: string | null;
	section: string | null;
	schedule: string | null;
	teacher: { id: string; user: { name: string; email: string } } | null;
	classroom: { id: string; name: string; building: string | null } | null;
	isActive: boolean;
	_count: { enrollments: number; attendanceSessions: number };
}

interface ClassroomRow {
	id: string;
	name: string;
	building: string | null;
	floor: string | null;
	capacity: number | null;
	notes: string | null;
	isActive: boolean;
	_count: { courses: number };
}

interface StaffRow {
	id: string;
	designation: string;
	user: { name: string; email: string };
}

interface CourseEnrollment {
	id: string;
	status: string;
	student: {
		id: string;
		grade: string | null;
		section: string | null;
		user: { name: string; email: string };
	};
}

function AdminAcademics() {
	const [tab, setTab] = useState<Tab>("courses");
	const [courses, setCourses] = useState<Array<CourseRow>>([]);
	const [classrooms, setClassrooms] = useState<Array<ClassroomRow>>([]);
	const [staff, setStaff] = useState<Array<StaffRow>>([]);
	const [studentQuery, setStudentQuery] = useState("");
	const [selectedStudents, setSelectedStudents] = useState<
		Record<string, string>
	>({});
	const { students, isLoading: isLoadingStudents } = useStudentSearch(
		studentQuery,
		{ enabled: tab === "enrolments", limit: 30 },
	);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [editingCourse, setEditingCourse] = useState<CourseRow | null>(null);
	const [editingClassroom, setEditingClassroom] = useState<ClassroomRow | null>(
		null,
	);

	const [selectedCourseId, setSelectedCourseId] = useState("");
	const [enrollments, setEnrollments] = useState<Array<CourseEnrollment>>([]);
	const [selectedStudentIds, setSelectedStudentIds] = useState<Array<string>>(
		[],
	);
	const [isLoadingCourse, setIsLoadingCourse] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getAcademicsDataFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setCourses(response.courses as Array<CourseRow>);
		setClassrooms(response.classrooms as Array<ClassroomRow>);
		setStaff(response.staff as Array<StaffRow>);
		setError("");
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const loadCourse = useCallback(async (courseId: string) => {
		if (!courseId) {
			setEnrollments([]);
			setSelectedStudentIds([]);
			setSelectedStudents({});
			return;
		}

		setIsLoadingCourse(true);
		const response = await getCourseDetailsAction({ data: { id: courseId } });

		if (response.success) {
			const course = response.course as {
				enrollments: Array<CourseEnrollment>;
			};
			setEnrollments(course.enrollments);
			setSelectedStudentIds(
				course.enrollments.map((entry) => entry.student.id),
			);
			setSelectedStudents(
				Object.fromEntries(
					course.enrollments.map((entry) => [
						entry.student.id,
						entry.student.user.name,
					]),
				),
			);
		} else {
			setError(response.error);
		}

		setIsLoadingCourse(false);
	}, []);

	useEffect(() => {
		if (tab === "enrolments") void loadCourse(selectedCourseId);
	}, [tab, selectedCourseId, loadCourse]);

	const createCourse = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);

		const response = await createCourseAction({
			data: {
				code: String(data.get("code") ?? ""),
				name: String(data.get("name") ?? ""),
				description: String(data.get("description") ?? ""),
				grade: String(data.get("grade") ?? ""),
				section: String(data.get("section") ?? ""),
				schedule: String(data.get("schedule") ?? ""),
				teacherId: String(data.get("teacherId") ?? "") || null,
				classroomId: String(data.get("classroomId") ?? "") || null,
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Course created.");
		form.reset();
		await load();
	};

	const createClassroom = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const capacity = String(data.get("capacity") ?? "").trim();

		const response = await createClassroomAction({
			data: {
				name: String(data.get("name") ?? ""),
				building: String(data.get("building") ?? ""),
				floor: String(data.get("floor") ?? ""),
				capacity: capacity ? Number(capacity) : null,
				notes: String(data.get("notes") ?? ""),
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Classroom added.");
		form.reset();
		await load();
	};

	const saveCourse = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingCourse) return;

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const data = new FormData(event.currentTarget);
		const response = await updateCourseAction({
			data: {
				id: editingCourse.id,
				code: String(data.get("code") ?? ""),
				name: String(data.get("name") ?? ""),
				description: String(data.get("description") ?? ""),
				grade: String(data.get("grade") ?? ""),
				section: String(data.get("section") ?? ""),
				schedule: String(data.get("schedule") ?? ""),
				teacherId: String(data.get("teacherId") ?? "") || null,
				classroomId: String(data.get("classroomId") ?? "") || null,
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Course updated.");
		setEditingCourse(null);
		await load();
	};

	const saveClassroom = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingClassroom) return;

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const data = new FormData(event.currentTarget);
		const capacity = String(data.get("capacity") ?? "").trim();
		const response = await updateClassroomAction({
			data: {
				id: editingClassroom.id,
				name: String(data.get("name") ?? ""),
				building: String(data.get("building") ?? ""),
				floor: String(data.get("floor") ?? ""),
				capacity: capacity ? Number(capacity) : null,
				notes: String(data.get("notes") ?? ""),
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Classroom updated.");
		setEditingClassroom(null);
		await load();
	};

	const removeCourse = async (course: CourseRow) => {
		if (!confirm(`Delete ${course.code} — ${course.name}?`)) return;

		const response = await deleteCourseAction({ data: { id: course.id } });
		if (!response.success) setError(response.error);
		else {
			setNotice("Course deleted.");
			await load();
		}
	};

	const removeClassroom = async (classroom: ClassroomRow) => {
		if (!confirm(`Delete ${classroom.name}?`)) return;

		const response = await deleteClassroomAction({
			data: { id: classroom.id },
		});
		if (!response.success) setError(response.error);
		else {
			setNotice("Classroom deleted.");
			await load();
		}
	};

	const toggleStudent = (student: StudentOption, checked: boolean) => {
		setSelectedStudentIds((current) =>
			checked
				? [...new Set([...current, student.id])]
				: current.filter((id) => id !== student.id),
		);
		setSelectedStudents((current) => {
			if (!checked) {
				const next = { ...current };
				delete next[student.id];
				return next;
			}

			return { ...current, [student.id]: student.name };
		});
	};

	const clearStudent = (studentId: string) => {
		setSelectedStudentIds((current) =>
			current.filter((id) => id !== studentId),
		);
		setSelectedStudents((current) => {
			const next = { ...current };
			delete next[studentId];
			return next;
		});
	};

	const saveEnrolments = async () => {
		if (!selectedCourseId) return;
		if (selectedStudentIds.length === 0) {
			setError("Select at least one student.");
			return;
		}

		setError("");
		setIsSubmitting(true);
		const response = await enrollStudentsAction({
			data: { courseId: selectedCourseId, studentIds: selectedStudentIds },
		});
		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(`${response.count} student(s) enrolled.`);
		await Promise.all([load(), loadCourse(selectedCourseId)]);
	};

	const removeEnrolment = async (enrollment: CourseEnrollment) => {
		const response = await removeEnrollmentAction({
			data: { id: enrollment.id },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		await Promise.all([load(), loadCourse(selectedCourseId)]);
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Academics</h1>
					<p className="mt-1 text-sm text-gray-500">
						Manage courses, classrooms and student enrolments.
					</p>
				</div>
				<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
					{(["courses", "classrooms", "enrolments"] as Array<Tab>).map(
						(item) => (
							<button
								key={item}
								type="button"
								onClick={() => setTab(item)}
								className={cn(
									"rounded-md px-3 py-1.5 text-sm font-medium capitalize",
									tab === item
										? "bg-red-500 text-white"
										: "text-gray-600 hover:bg-gray-100",
								)}
							>
								{item}
							</button>
						),
					)}
				</div>
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

			{tab === "courses" ? (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-red-500" /> New course
						</h2>
						<form
							onSubmit={(event) => void createCourse(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<Input label="Course code" name="code" required />
							<Input label="Course name" name="name" required />
							<Input label="Grade / class" name="grade" />
							<Input label="Section" name="section" />
							<Input label="Schedule" name="schedule" />
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Teacher
								</span>
								<select
									name="teacherId"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Unassigned</option>
									{staff.map((member) => (
										<option key={member.id} value={member.id}>
											{member.user.name} · {member.designation}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Classroom
								</span>
								<select
									name="classroomId"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Unassigned</option>
									{classrooms.map((room) => (
										<option key={room.id} value={room.id}>
											{room.name}
											{room.building ? ` · ${room.building}` : ""}
										</option>
									))}
								</select>
							</label>
							<Textarea
								label="Description"
								name="description"
								className="md:col-span-2"
							/>
							<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
								<input type="checkbox" name="isActive" defaultChecked /> Active
							</label>
							<div className="md:col-span-2">
								<SubmitButton
									isSubmitting={isSubmitting}
									label="Create course"
								/>
							</div>
						</form>
					</section>

					{editingCourse ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6">
							<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
								<Pencil className="h-5 w-5 text-red-500" /> Edit course
							</h2>
							<form
								key={editingCourse.id}
								onSubmit={(event) => void saveCourse(event)}
								className="grid gap-4 md:grid-cols-2"
							>
								<Input
									label="Course code"
									name="code"
									defaultValue={editingCourse.code}
									required
								/>
								<Input
									label="Course name"
									name="name"
									defaultValue={editingCourse.name}
									required
								/>
								<Input
									label="Grade / class"
									name="grade"
									defaultValue={editingCourse.grade ?? ""}
								/>
								<Input
									label="Section"
									name="section"
									defaultValue={editingCourse.section ?? ""}
								/>
								<Input
									label="Schedule"
									name="schedule"
									defaultValue={editingCourse.schedule ?? ""}
								/>
								<label className="text-sm">
									<span className="mb-1 block font-medium text-gray-700">
										Teacher
									</span>
									<select
										name="teacherId"
										defaultValue={editingCourse.teacher?.id ?? ""}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="">Unassigned</option>
										{staff.map((member) => (
											<option key={member.id} value={member.id}>
												{member.user.name} · {member.designation}
											</option>
										))}
									</select>
								</label>
								<label className="text-sm">
									<span className="mb-1 block font-medium text-gray-700">
										Classroom
									</span>
									<select
										name="classroomId"
										defaultValue={editingCourse.classroom?.id ?? ""}
										className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
									>
										<option value="">Unassigned</option>
										{classrooms.map((room) => (
											<option key={room.id} value={room.id}>
												{room.name}
												{room.building ? ` · ${room.building}` : ""}
											</option>
										))}
									</select>
								</label>
								<Textarea
									label="Description"
									name="description"
									defaultValue={editingCourse.description ?? ""}
									className="md:col-span-2"
								/>
								<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
									<input
										type="checkbox"
										name="isActive"
										defaultChecked={editingCourse.isActive}
									/>{" "}
									Active
								</label>
								<div className="flex gap-2 md:col-span-2">
									<button
										type="submit"
										disabled={isSubmitting}
										className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
									>
										{isSubmitting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Pencil className="h-4 w-4" />
										)}
										{isSubmitting ? "Saving…" : "Save changes"}
									</button>
									<button
										type="button"
										onClick={() => setEditingCourse(null)}
										className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
								</div>
							</form>
						</section>
					) : null}

					<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<header className="border-b border-gray-200 px-5 py-4">
							<h2 className="font-semibold text-gray-900">Courses</h2>
						</header>
						{isLoading ? (
							<LoadingRow />
						) : courses.length === 0 ? (
							<EmptyRow
								icon={BookOpen}
								message="No courses have been created yet."
							/>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full text-left text-sm">
									<thead className="bg-gray-50 text-xs uppercase text-gray-500">
										<tr>
											<th className="px-5 py-3">Course</th>
											<th className="px-5 py-3">Class</th>
											<th className="px-5 py-3">Teacher</th>
											<th className="px-5 py-3">Enrolled</th>
											<th className="px-5 py-3" />
										</tr>
									</thead>
									<tbody>
										{courses.map((course) => (
											<tr key={course.id} className="border-t border-gray-100">
												<td className="px-5 py-3">
													<p className="font-medium text-gray-900">
														{course.name}
													</p>
													<p className="text-xs text-gray-500">
														{course.code}
														{course.schedule ? ` · ${course.schedule}` : ""}
													</p>
												</td>
												<td className="px-5 py-3 text-gray-600">
													{[
														course.grade,
														course.section,
														course.classroom?.name,
													]
														.filter(Boolean)
														.join(" · ") || "—"}
												</td>
												<td className="px-5 py-3 text-gray-600">
													{course.teacher?.user.name ?? "Unassigned"}
												</td>
												<td className="px-5 py-3 text-gray-600">
													{course._count.enrollments}
												</td>
												<td className="px-5 py-3">
													<div className="flex items-center justify-end gap-3">
														<button
															type="button"
															onClick={() => setEditingCourse(course)}
															className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
														>
															<Pencil className="h-3.5 w-3.5" /> Edit
														</button>
														<button
															type="button"
															onClick={() => void removeCourse(course)}
															className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
														>
															<Trash2 className="h-3.5 w-3.5" /> Delete
														</button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</>
			) : tab === "classrooms" ? (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-red-500" /> New classroom
						</h2>
						<form
							onSubmit={(event) => void createClassroom(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<Input label="Name" name="name" required />
							<Input label="Building" name="building" />
							<Input label="Floor" name="floor" />
							<Input label="Capacity" name="capacity" type="number" min={1} />
							<Textarea label="Notes" name="notes" className="md:col-span-2" />
							<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
								<input type="checkbox" name="isActive" defaultChecked /> Active
							</label>
							<div className="md:col-span-2">
								<SubmitButton
									isSubmitting={isSubmitting}
									label="Add classroom"
								/>
							</div>
						</form>
					</section>

					{editingClassroom ? (
						<section className="rounded-2xl border border-gray-200 bg-white p-6">
							<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
								<Pencil className="h-5 w-5 text-red-500" /> Edit classroom
							</h2>
							<form
								key={editingClassroom.id}
								onSubmit={(event) => void saveClassroom(event)}
								className="grid gap-4 md:grid-cols-2"
							>
								<Input
									label="Name"
									name="name"
									defaultValue={editingClassroom.name}
									required
								/>
								<Input
									label="Building"
									name="building"
									defaultValue={editingClassroom.building ?? ""}
								/>
								<Input
									label="Floor"
									name="floor"
									defaultValue={editingClassroom.floor ?? ""}
								/>
								<Input
									label="Capacity"
									name="capacity"
									type="number"
									min={1}
									defaultValue={editingClassroom.capacity ?? ""}
								/>
								<Textarea
									label="Notes"
									name="notes"
									defaultValue={editingClassroom.notes ?? ""}
									className="md:col-span-2"
								/>
								<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
									<input
										type="checkbox"
										name="isActive"
										defaultChecked={editingClassroom.isActive}
									/>{" "}
									Active
								</label>
								<div className="flex gap-2 md:col-span-2">
									<button
										type="submit"
										disabled={isSubmitting}
										className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
									>
										{isSubmitting ? (
											<Loader2 className="h-4 w-4 animate-spin" />
										) : (
											<Pencil className="h-4 w-4" />
										)}
										{isSubmitting ? "Saving…" : "Save changes"}
									</button>
									<button
										type="button"
										onClick={() => setEditingClassroom(null)}
										className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
									>
										Cancel
									</button>
								</div>
							</form>
						</section>
					) : null}

					<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<header className="border-b border-gray-200 px-5 py-4">
							<h2 className="font-semibold text-gray-900">Classrooms</h2>
						</header>
						{isLoading ? (
							<LoadingRow />
						) : classrooms.length === 0 ? (
							<EmptyRow
								icon={School}
								message="No classrooms have been added yet."
							/>
						) : (
							<ul className="divide-y divide-gray-100">
								{classrooms.map((room) => (
									<li
										key={room.id}
										className="flex flex-wrap items-center gap-4 px-5 py-4"
									>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-gray-900">{room.name}</p>
											<p className="text-xs text-gray-500">
												{[
													room.building,
													room.floor,
													room.capacity && `${room.capacity} seats`,
												]
													.filter(Boolean)
													.join(" · ") || "No location details"}
											</p>
											{room.notes ? (
												<p className="mt-1 text-xs text-gray-400">
													{room.notes}
												</p>
											) : null}
										</div>
										<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
											{room._count.courses} course
											{room._count.courses === 1 ? "" : "s"}
										</span>
										<button
											type="button"
											onClick={() => setEditingClassroom(room)}
											className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900"
										>
											<Pencil className="h-3.5 w-3.5" /> Edit
										</button>
										<button
											type="button"
											onClick={() => void removeClassroom(room)}
											className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-3.5 w-3.5" /> Delete
										</button>
									</li>
								))}
							</ul>
						)}
					</section>
				</>
			) : (
				<section className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6">
					<div>
						<h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Users className="h-5 w-5 text-red-500" /> Student enrolments
						</h2>
						<p className="mt-1 text-sm text-gray-500">
							Pick a course, then tick the students who should be enrolled.
						</p>
					</div>

					<label className="block max-w-md text-sm">
						<span className="mb-1 block font-medium text-gray-700">Course</span>
						<select
							value={selectedCourseId}
							onChange={(event) => setSelectedCourseId(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Select a course…</option>
							{courses.map((course) => (
								<option key={course.id} value={course.id}>
									{course.code} · {course.name}
								</option>
							))}
						</select>
					</label>

					{!selectedCourseId ? (
						<p className="text-sm text-gray-500">
							Choose a course to manage its roster.
						</p>
					) : isLoadingCourse ? (
						<LoadingRow />
					) : (
						<div className="grid gap-6 lg:grid-cols-2">
							<div>
								<h3 className="mb-2 text-sm font-semibold text-gray-900">
									Enrolled students ({enrollments.length})
								</h3>
								{enrollments.length === 0 ? (
									<p className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
										Nobody is enrolled in this course yet.
									</p>
								) : (
									<ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
										{enrollments.map((enrollment) => (
											<li
												key={enrollment.id}
												className="flex items-center justify-between gap-3 px-3 py-2"
											>
												<div>
													<p className="text-sm font-medium text-gray-900">
														{enrollment.student.user.name}
													</p>
													<p className="text-xs text-gray-500">
														{enrollment.student.user.email}
													</p>
												</div>
												<button
													type="button"
													onClick={() => void removeEnrolment(enrollment)}
													className="rounded-md p-1.5 text-red-600 hover:bg-red-50"
													aria-label="Remove enrolment"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</li>
										))}
									</ul>
								)}
							</div>

							<div>
								<div className="mb-2 flex items-center justify-between gap-2">
									<h3 className="text-sm font-semibold text-gray-900">
										Select students
									</h3>
									<span className="text-xs text-gray-500">
										{selectedStudentIds.length} selected
									</span>
								</div>

								{selectedStudentIds.length > 0 ? (
									<div className="mb-2 flex flex-wrap gap-1">
										{selectedStudentIds.map((studentId) => (
											<span
												key={studentId}
												className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700"
											>
												{selectedStudents[studentId] ?? "Student"}
												<button
													type="button"
													onClick={() => clearStudent(studentId)}
													className="rounded-full p-0.5 hover:bg-red-100"
													aria-label="Remove student from selection"
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										))}
									</div>
								) : null}

								<label className="relative mb-2 block">
									<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
									<input
										value={studentQuery}
										onChange={(event) => setStudentQuery(event.target.value)}
										placeholder="Search by name, admission or email…"
										className="w-full rounded-lg border border-gray-300 px-3 py-2 pl-9 text-sm"
									/>
								</label>

								<div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
									{isLoadingStudents ? (
										<p className="flex items-center gap-2 p-4 text-sm text-gray-500">
											<Loader2 className="h-4 w-4 animate-spin" /> Searching…
										</p>
									) : students.length === 0 ? (
										<p className="p-4 text-sm text-gray-500">
											No active students match that search.
										</p>
									) : (
										students.map((student) => {
											const checked = selectedStudentIds.includes(student.id);

											return (
												<label
													key={student.id}
													className="flex cursor-pointer items-center gap-3 border-b border-gray-100 px-3 py-2 last:border-0 hover:bg-gray-50"
												>
													<input
														type="checkbox"
														checked={checked}
														onChange={(event) =>
															toggleStudent(student, event.target.checked)
														}
													/>
													<span className="min-w-0">
														<span className="block text-sm font-medium text-gray-900">
															{student.name}
														</span>
														<span className="block text-xs text-gray-500">
															{[student.grade, student.section]
																.filter(Boolean)
																.join(" · ") ||
																student.admissionNo ||
																"Active student"}
														</span>
													</span>
												</label>
											);
										})
									)}
								</div>
								<button
									type="button"
									onClick={() => void saveEnrolments()}
									disabled={isSubmitting}
									className="mt-3 inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Users className="h-4 w-4" />
									)}
									Save enrolments
								</button>
							</div>
						</div>
					)}
				</section>
			)}
		</div>
	);
}

function Input({
	label,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
	return (
		<label className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<input
				{...props}
				className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
			/>
		</label>
	);
}

function Textarea({
	label,
	className,
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
	return (
		<label className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<textarea
				{...props}
				rows={3}
				className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
			/>
		</label>
	);
}

function SubmitButton({
	isSubmitting,
	label,
}: {
	isSubmitting: boolean;
	label: string;
}) {
	return (
		<button
			type="submit"
			disabled={isSubmitting}
			className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
		>
			{isSubmitting ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Plus className="h-4 w-4" />
			)}
			{isSubmitting ? "Saving…" : label}
		</button>
	);
}

function LoadingRow() {
	return (
		<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
			<Loader2 className="h-4 w-4 animate-spin" /> Loading…
		</p>
	);
}

function EmptyRow({
	icon: Icon,
	message,
}: {
	icon: React.ComponentType<{ className?: string }>;
	message: string;
}) {
	return (
		<div className="p-8 text-center">
			<Icon className="mx-auto h-8 w-8 text-gray-300" />
			<p className="mt-3 text-sm text-gray-500">{message}</p>
		</div>
	);
}
