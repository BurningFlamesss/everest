import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	BookOpen,
	Loader2,
	type LucideIcon,
	Pencil,
	Plus,
	School,
	Search,
	Trash2,
	Users,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { useStudentSearch } from "#/components/people/useStudentSearch.ts";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
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

const TAB_ITEMS: Array<{ value: Tab; label: string; icon: LucideIcon }> = [
	{ value: "courses", label: "Courses", icon: BookOpen },
	{ value: "classrooms", label: "Classrooms", icon: School },
	{ value: "enrolments", label: "Enrolments", icon: Users },
];

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
	const [pendingCourse, setPendingCourse] = useState<CourseRow | null>(null);
	const [pendingClassroom, setPendingClassroom] = useState<ClassroomRow | null>(
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
		const response = await deleteCourseAction({ data: { id: course.id } });
		if (!response.success) {
			setError(response.error);
			return;
		}

		setPendingCourse(null);
		setNotice("Course deleted.");
		await load();
	};

	const removeClassroom = async (classroom: ClassroomRow) => {
		const response = await deleteClassroomAction({
			data: { id: classroom.id },
		});
		if (!response.success) {
			setError(response.error);
			return;
		}

		setPendingClassroom(null);
		setNotice("Classroom deleted.");
		await load();
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

	const courseColumns: Column<CourseRow>[] = [
		{
			key: "course",
			header: "Course",
			render: (course) => (
				<div className="min-w-0">
					<p className="font-medium text-foreground">{course.name}</p>
					<p className="mt-0.5 text-xs text-muted-foreground">
						{course.code}
						{course.schedule ? ` · ${course.schedule}` : ""}
					</p>
				</div>
			),
		},
		{
			key: "class",
			header: "Class",
			render: (course) =>
				[course.grade, course.section, course.classroom?.name]
					.filter(Boolean)
					.join(" · ") || "—",
		},
		{
			key: "teacher",
			header: "Teacher",
			render: (course) => course.teacher?.user.name ?? "Unassigned",
		},
		{
			key: "enrolled",
			header: "Enrolled",
			render: (course) => (
				<span className="num text-foreground">{course._count.enrollments}</span>
			),
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (course) => (
				<div className="row-actions justify-end">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8"
						aria-label={`Edit ${course.name}`}
						data-testid={`academics-course-edit-${course.id}`}
						onClick={() => setEditingCourse(course)}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive"
						aria-label={`Delete ${course.name}`}
						data-testid={`academics-course-delete-${course.id}`}
						onClick={() => setPendingCourse(course)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<div data-testid="academics-page" className="space-y-5">
			<PageHeader
				testId="academics-page-header"
				eyebrow="Academics"
				title="Academics"
				description="Manage courses, classrooms and student enrolments."
				meta={
					!isLoading ? (
						<>
							<span data-testid="academics-meta-courses">
								{courses.length} {courses.length === 1 ? "course" : "courses"}
							</span>
							<span data-testid="academics-meta-classrooms">
								{classrooms.length}{" "}
								{classrooms.length === 1 ? "classroom" : "classrooms"}
							</span>
						</>
					) : undefined
				}
				actions={
					<div
						className="flex items-center rounded-md border border-hairline bg-surface-1 p-0.5"
						data-testid="academics-tabs"
					>
						{TAB_ITEMS.map((item) => (
							<button
								key={item.value}
								type="button"
								onClick={() => setTab(item.value)}
								data-testid={`academics-tab-${item.value}`}
								className={cn(
									"inline-flex h-8 items-center gap-1.5 rounded px-2.5 text-xs font-medium capitalize transition-colors duration-150 focus-ring",
									tab === item.value
										? "bg-secondary text-foreground"
										: "text-muted-foreground hover:text-foreground",
								)}
							>
								<item.icon className="h-3.5 w-3.5" />
								{item.label}
							</button>
						))}
					</div>
				}
			/>

			{error ? (
				<div
					role="alert"
					data-testid="academics-error"
					className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{error}
				</div>
			) : null}
			{notice ? (
				<div
					data-testid="academics-notice"
					className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
				>
					{notice}
				</div>
			) : null}

			{tab === "courses" ? (
				<>
					<Panel
						title="New course"
						description="Create a course to schedule classes and enrol students."
						testId="academics-new-course-panel"
						bodyClassName="p-5"
					>
						<form
							onSubmit={(event) => void createCourse(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<Input label="Course code" name="code" required />
							<Input label="Course name" name="name" required />
							<Input label="Grade / class" name="grade" />
							<Input label="Section" name="section" />
							<Input label="Schedule" name="schedule" />
							<Select label="Teacher" name="teacherId">
								<option value="">Unassigned</option>
								{staff.map((member) => (
									<option key={member.id} value={member.id}>
										{member.user.name} · {member.designation}
									</option>
								))}
							</Select>
							<Select label="Classroom" name="classroomId">
								<option value="">Unassigned</option>
								{classrooms.map((room) => (
									<option key={room.id} value={room.id}>
										{room.name}
										{room.building ? ` · ${room.building}` : ""}
									</option>
								))}
							</Select>
							<Textarea
								label="Description"
								name="description"
								className="md:col-span-2"
							/>
							<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
								<input
									type="checkbox"
									name="isActive"
									defaultChecked
									className="h-4 w-4 accent-primary focus-ring"
								/>{" "}
								Active
							</label>
							<div className="md:col-span-2">
								<SubmitButton
									isSubmitting={isSubmitting}
									label="Create course"
								/>
							</div>
						</form>
					</Panel>

					{editingCourse ? (
						<Panel
							title="Edit course"
							description="Update the details for this course."
							testId="academics-edit-course-panel"
							bodyClassName="p-5"
						>
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
								<Select
									label="Teacher"
									name="teacherId"
									defaultValue={editingCourse.teacher?.id ?? ""}
								>
									<option value="">Unassigned</option>
									{staff.map((member) => (
										<option key={member.id} value={member.id}>
											{member.user.name} · {member.designation}
										</option>
									))}
								</Select>
								<Select
									label="Classroom"
									name="classroomId"
									defaultValue={editingCourse.classroom?.id ?? ""}
								>
									<option value="">Unassigned</option>
									{classrooms.map((room) => (
										<option key={room.id} value={room.id}>
											{room.name}
											{room.building ? ` · ${room.building}` : ""}
										</option>
									))}
								</Select>
								<Textarea
									label="Description"
									name="description"
									defaultValue={editingCourse.description ?? ""}
									className="md:col-span-2"
								/>
								<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
									<input
										type="checkbox"
										name="isActive"
										defaultChecked={editingCourse.isActive}
										className="h-4 w-4 accent-primary focus-ring"
									/>{" "}
									Active
								</label>
								<div className="flex flex-wrap gap-2 md:col-span-2">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="gap-1.5"
									>
										{isSubmitting ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<Pencil className="h-3.5 w-3.5" />
										)}
										{isSubmitting ? "Saving…" : "Save changes"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setEditingCourse(null)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</Panel>
					) : null}

					<DataTable
						columns={courseColumns}
						rows={courses}
						rowId={(course) => course.id}
						testId="academics-courses-table"
						loading={isLoading}
						footNote={`${courses.length} ${courses.length === 1 ? "course" : "courses"}`}
						empty={
							<EmptyState
								icon={BookOpen}
								title="No courses yet"
								description="No courses have been created yet."
								testId="academics-courses-empty"
							/>
						}
					/>
				</>
			) : tab === "classrooms" ? (
				<>
					<Panel
						title="New classroom"
						description="Add a room that courses can be scheduled into."
						testId="academics-new-classroom-panel"
						bodyClassName="p-5"
					>
						<form
							onSubmit={(event) => void createClassroom(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<Input label="Name" name="name" required />
							<Input label="Building" name="building" />
							<Input label="Floor" name="floor" />
							<Input label="Capacity" name="capacity" type="number" min={1} />
							<Textarea label="Notes" name="notes" className="md:col-span-2" />
							<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
								<input
									type="checkbox"
									name="isActive"
									defaultChecked
									className="h-4 w-4 accent-primary focus-ring"
								/>{" "}
								Active
							</label>
							<div className="md:col-span-2">
								<SubmitButton
									isSubmitting={isSubmitting}
									label="Add classroom"
								/>
							</div>
						</form>
					</Panel>

					{editingClassroom ? (
						<Panel
							title="Edit classroom"
							description="Update the details for this classroom."
							testId="academics-edit-classroom-panel"
							bodyClassName="p-5"
						>
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
								<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
									<input
										type="checkbox"
										name="isActive"
										defaultChecked={editingClassroom.isActive}
										className="h-4 w-4 accent-primary focus-ring"
									/>{" "}
									Active
								</label>
								<div className="flex flex-wrap gap-2 md:col-span-2">
									<Button
										type="submit"
										disabled={isSubmitting}
										className="gap-1.5"
									>
										{isSubmitting ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<Pencil className="h-3.5 w-3.5" />
										)}
										{isSubmitting ? "Saving…" : "Save changes"}
									</Button>
									<Button
										type="button"
										variant="outline"
										onClick={() => setEditingClassroom(null)}
									>
										Cancel
									</Button>
								</div>
							</form>
						</Panel>
					) : null}

					<Panel
						title="Classrooms"
						testId="academics-classrooms-panel"
						bodyClassName="p-0"
					>
						{isLoading ? (
							<div className="p-5">
								<ListSkeleton rows={4} />
							</div>
						) : classrooms.length === 0 ? (
							<EmptyState
								icon={School}
								title="No classrooms yet"
								description="No classrooms have been added yet."
								testId="academics-classrooms-empty"
							/>
						) : (
							<ul className="divide-y divide-hairline">
								{classrooms.map((room) => (
									<li
										key={room.id}
										className="group flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface-2"
									>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-foreground">{room.name}</p>
											<p className="text-xs text-muted-foreground">
												{[
													room.building,
													room.floor,
													room.capacity && `${room.capacity} seats`,
												]
													.filter(Boolean)
													.join(" · ") || "No location details"}
											</p>
											{room.notes ? (
												<p className="mt-1 text-xs text-muted-foreground">
													{room.notes}
												</p>
											) : null}
										</div>
										<span className="num rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-xs font-medium text-muted-foreground">
											{room._count.courses} course
											{room._count.courses === 1 ? "" : "s"}
										</span>
										<div className="row-actions">
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8"
												aria-label={`Edit ${room.name}`}
												data-testid={`academics-classroom-edit-${room.id}`}
												onClick={() => setEditingClassroom(room)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive"
												aria-label={`Delete ${room.name}`}
												data-testid={`academics-classroom-delete-${room.id}`}
												onClick={() => setPendingClassroom(room)}
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</div>
									</li>
								))}
							</ul>
						)}
					</Panel>
				</>
			) : (
				<Panel
					title="Student enrolments"
					description="Pick a course, then tick the students who should be enrolled."
					testId="academics-enrolments-panel"
					bodyClassName="space-y-5 p-5"
				>
					<Select
						label="Course"
						value={selectedCourseId}
						onChange={(event) => setSelectedCourseId(event.target.value)}
						className="max-w-md"
						testId="academics-course-select"
					>
						<option value="">Select a course…</option>
						{courses.map((course) => (
							<option key={course.id} value={course.id}>
								{course.code} · {course.name}
							</option>
						))}
					</Select>

					{!selectedCourseId ? (
						<p
							className="text-sm text-muted-foreground"
							data-testid="academics-enrolments-hint"
						>
							Choose a course to manage its roster.
						</p>
					) : isLoadingCourse ? (
						<ListSkeleton rows={3} />
					) : (
						<div className="grid gap-6 lg:grid-cols-2">
							<div>
								<h3 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
									Enrolled students ({enrollments.length})
								</h3>
								{enrollments.length === 0 ? (
									<p
										className="mt-2 rounded-lg border border-dashed border-hairline bg-surface-1 p-4 text-sm text-muted-foreground"
										data-testid="academics-enrolled-empty"
									>
										Nobody is enrolled in this course yet.
									</p>
								) : (
									<ul className="mt-2 divide-y divide-hairline rounded-lg border border-hairline">
										{enrollments.map((enrollment) => (
											<li
												key={enrollment.id}
												className="group flex items-center justify-between gap-3 px-3 py-2 transition-colors duration-150 hover:bg-surface-2"
											>
												<div className="min-w-0">
													<p className="truncate text-sm font-medium text-foreground">
														{enrollment.student.user.name}
													</p>
													<p className="truncate text-xs text-muted-foreground">
														{enrollment.student.user.email}
													</p>
												</div>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-destructive"
													aria-label="Remove enrolment"
													data-testid={`academics-enrolment-remove-${enrollment.id}`}
													onClick={() => void removeEnrolment(enrollment)}
												>
													<Trash2 className="h-3.5 w-3.5" />
												</Button>
											</li>
										))}
									</ul>
								)}
							</div>

							<div>
								<div className="flex items-center justify-between gap-2">
									<h3 className="text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground">
										Select students
									</h3>
									<span
										className="num text-xs text-muted-foreground"
										data-testid="academics-selected-count"
									>
										{selectedStudentIds.length} selected
									</span>
								</div>

								{selectedStudentIds.length > 0 ? (
									<div className="mt-2 mb-2 flex flex-wrap gap-1">
										{selectedStudentIds.map((studentId) => (
											<span
												key={studentId}
												className="inline-flex items-center gap-1 rounded-full bg-primary/[0.06] px-2 py-0.5 text-xs font-medium text-primary"
											>
												{selectedStudents[studentId] ?? "Student"}
												<button
													type="button"
													onClick={() => clearStudent(studentId)}
													className="rounded-full p-0.5 transition-colors duration-150 hover:bg-primary/15 focus-ring"
													aria-label="Remove student from selection"
													data-testid={`academics-chip-remove-${studentId}`}
												>
													<X className="h-3 w-3" />
												</button>
											</span>
										))}
									</div>
								) : null}

								<label className="relative mb-2 mt-2 block">
									<Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<input
										value={studentQuery}
										onChange={(event) => setStudentQuery(event.target.value)}
										placeholder="Search by name, admission or email…"
										data-testid="academics-student-search"
										className="h-9 w-full rounded-md border border-hairline bg-surface-1 pr-3 pl-9 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring"
									/>
								</label>

								<div className="max-h-80 overflow-y-auto rounded-lg border border-hairline">
									{isLoadingStudents ? (
										<div className="p-4">
											<ListSkeleton rows={3} />
										</div>
									) : students.length === 0 ? (
										<p className="p-4 text-sm text-muted-foreground">
											No active students match that search.
										</p>
									) : (
										students.map((student) => {
											const checked = selectedStudentIds.includes(student.id);

											return (
												<label
													key={student.id}
													className="flex cursor-pointer items-center gap-3 border-b border-hairline px-3 py-2 transition-colors duration-150 last:border-0 hover:bg-surface-2"
												>
													<input
														type="checkbox"
														checked={checked}
														onChange={(event) =>
															toggleStudent(student, event.target.checked)
														}
														className="h-4 w-4 accent-primary focus-ring"
														data-testid={`academics-student-option-${student.id}`}
													/>
													<span className="min-w-0">
														<span className="block text-sm font-medium text-foreground">
															{student.name}
														</span>
														<span className="block text-xs text-muted-foreground">
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
								<Button
									type="button"
									size="sm"
									className="mt-3 gap-1.5"
									disabled={isSubmitting}
									data-testid="academics-save-enrolments"
									onClick={() => void saveEnrolments()}
								>
									{isSubmitting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Users className="h-3.5 w-3.5" />
									)}
									Save enrolments
								</Button>
							</div>
						</div>
					)}
				</Panel>
			)}

			<ConfirmDialog
				open={!!pendingCourse}
				onOpenChange={(open) => !open && setPendingCourse(null)}
				testId="academics-course-delete-dialog"
				title="Delete course"
				description={`Delete ${pendingCourse?.code} — ${pendingCourse?.name}? This action cannot be undone.`}
				confirmLabel="Delete"
				destructive
				onConfirm={() => pendingCourse && void removeCourse(pendingCourse)}
			/>

			<ConfirmDialog
				open={!!pendingClassroom}
				onOpenChange={(open) => !open && setPendingClassroom(null)}
				testId="academics-classroom-delete-dialog"
				title="Delete classroom"
				description={`Delete ${pendingClassroom?.name}? This action cannot be undone.`}
				confirmLabel="Delete"
				destructive
				onConfirm={() =>
					pendingClassroom && void removeClassroom(pendingClassroom)
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
				rows={3}
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

function SubmitButton({
	isSubmitting,
	label,
}: {
	isSubmitting: boolean;
	label: string;
}) {
	return (
		<Button type="submit" disabled={isSubmitting} className="gap-1.5">
			{isSubmitting ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : (
				<Plus className="h-3.5 w-3.5" />
			)}
			{isSubmitting ? "Saving…" : label}
		</Button>
	);
}
