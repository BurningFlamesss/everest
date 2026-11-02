import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	BookOpen,
	Loader2,
	Plus,
	School,
	Trash2,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
} from "#/packages/academics/server.ts";

export const Route = createFileRoute("/admin/academics")({
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

interface StudentRow {
	id: string;
	admissionNo: string | null;
	grade: string | null;
	section: string | null;
	user: { name: string; email: string };
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
	const [students, setStudents] = useState<Array<StudentRow>>([]);
	const [staff, setStaff] = useState<Array<StaffRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

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
		setStudents(response.students as Array<StudentRow>);
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
			return;
		}

		setIsLoadingCourse(true);
		const response = await getCourseDetailsAction({ data: { id: courseId } });

		if (response.success) {
			const course = response.course as {
				enrollments: Array<CourseEnrollment>;
			};
			setEnrollments(course.enrollments);
			setSelectedStudentIds(course.enrollments.map((entry) => entry.student.id));
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
								<SubmitButton isSubmitting={isSubmitting} label="Create course" />
							</div>
						</form>
					</section>

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
												<td className="px-5 py-3 text-right">
													<button
														type="button"
														onClick={() => void removeCourse(course)}
														className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-3.5 w-3.5" /> Delete
													</button>
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
												{[room.building, room.floor, room.capacity && `${room.capacity} seats`]
													.filter(Boolean)
													.join(" · ") || "No location details"}
											</p>
											{room.notes ? (
												<p className="mt-1 text-xs text-gray-400">{room.notes}</p>
											) : null}
										</div>
										<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">
											{room._count.courses} course
											{room._count.courses === 1 ? "" : "s"}
										</span>
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
								<h3 className="mb-2 text-sm font-semibold text-gray-900">
									Select students
								</h3>
								<div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200">
									{students.length === 0 ? (
										<p className="p-4 text-sm text-gray-500">
											No active students found.
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
															setSelectedStudentIds((current) =>
																event.target.checked
																	? [...current, student.id]
																	: current.filter((id) => id !== student.id),
															)
														}
													/>
													<span className="min-w-0">
														<span className="block text-sm font-medium text-gray-900">
															{student.user.name}
														</span>
														<span className="block text-xs text-gray-500">
															{[student.grade, student.section]
																.filter(Boolean)
																.join(" · ") || student.user.email}
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
