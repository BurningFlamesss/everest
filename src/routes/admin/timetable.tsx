import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarClock, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	createTimetableSlotAction,
	deleteTimetableSlotAction,
	getTimetableDataFn,
	getTimetableOptionsFn,
} from "#/packages/academics/timetable-server.ts";

export const Route = createFileRoute("/admin/timetable")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_TIMETABLE")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminTimetable,
});

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface YearOption {
	id: string;
	name: string;
	isActive: boolean;
}

interface CourseOption {
	id: string;
	code: string;
	name: string;
	grade: string | null;
	teacherId: string | null;
}

interface StaffOption {
	id: string;
	designation: string;
	user: { name: string };
}

interface ClassroomOption {
	id: string;
	name: string;
	building: string | null;
}

interface SlotRow {
	id: string;
	weekday: number;
	periodIndex: number;
	startsAt: string;
	endsAt: string;
	course: { id: string; code: string; name: string; grade: string | null };
	staff: { id: string; user: { name: string } } | null;
	classroom: { id: string; name: string } | null;
}

function AdminTimetable() {
	const [years, setYears] = useState<Array<YearOption>>([]);
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [staff, setStaff] = useState<Array<StaffOption>>([]);
	const [classrooms, setClassrooms] = useState<Array<ClassroomOption>>([]);
	const [slots, setSlots] = useState<Array<SlotRow>>([]);
	const [yearId, setYearId] = useState("");
	const [courseId, setCourseId] = useState("");
	const [staffId, setStaffId] = useState("");
	const [classroomId, setClassroomId] = useState("");
	const [weekday, setWeekday] = useState("1");
	const [periodIndex, setPeriodIndex] = useState("1");
	const [startsAt, setStartsAt] = useState("09:00");
	const [endsAt, setEndsAt] = useState("09:45");
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const loadOptions = useCallback(async () => {
		const response = await getTimetableOptionsFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setYears(response.years as Array<YearOption>);
		setCourses(response.courses as Array<CourseOption>);
		setStaff(response.staff as Array<StaffOption>);
		setClassrooms(response.classrooms as Array<ClassroomOption>);

		const active = (response.years as Array<YearOption>).find(
			(year) => year.isActive,
		);

		setYearId((current) => current || active?.id || "");

		const firstCourse = (response.courses as Array<CourseOption>)[0];
		setCourseId((current) => current || firstCourse?.id || "");
		setIsLoading(false);
	}, []);

	const loadSlots = useCallback(async (academicYearId: string) => {
		const response = await getTimetableDataFn({
			data: { academicYearId: academicYearId || undefined },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setSlots(response.slots as Array<SlotRow>);
	}, []);

	useEffect(() => {
		void loadOptions();
	}, [loadOptions]);

	useEffect(() => {
		if (yearId) void loadSlots(yearId);
	}, [yearId, loadSlots]);

	const chooseCourse = (value: string) => {
		setCourseId(value);
		const course = courses.find((entry) => entry.id === value);
		setStaffId(course?.teacherId ?? "");
	};

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const response = await createTimetableSlotAction({
			data: {
				academicYearId: yearId,
				courseId,
				staffId: staffId || null,
				classroomId: classroomId || null,
				weekday: Number(weekday),
				periodIndex: Number(periodIndex),
				startsAt,
				endsAt,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setSlots(response.slots as Array<SlotRow>);
		setNotice("Timetable slot added.");
	};

	const remove = async (id: string) => {
		if (!confirm("Remove this slot from the timetable?")) return;

		const response = await deleteTimetableSlotAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		setSlots((current) => current.filter((slot) => slot.id !== id));
	};

	const maxPeriod = slots.reduce(
		(max, slot) => Math.max(max, slot.periodIndex),
		6,
	);
	const periods = Array.from(
		{ length: Math.max(maxPeriod, 1) },
		(_, i) => i + 1,
	);
	const byCell = new Map(
		slots.map((slot) => [`${slot.weekday}-${slot.periodIndex}`, slot]),
	);

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Timetable</h1>
				<p className="mt-1 text-sm text-gray-500">
					Assign courses to days and periods. A teacher or room cannot be in two
					places at once.
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
					<Plus className="h-5 w-5 text-red-500" /> Add a slot
				</h2>
				<form
					onSubmit={(event) => void submit(event)}
					className="grid gap-4 md:grid-cols-4"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Year</span>
						<select
							value={yearId}
							onChange={(event) => setYearId(event.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Select…</option>
							{years.map((year) => (
								<option key={year.id} value={year.id}>
									{year.name}
									{year.isActive ? " (active)" : ""}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Course</span>
						<select
							value={courseId}
							onChange={(event) => chooseCourse(event.target.value)}
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
							Teacher
						</span>
						<select
							value={staffId}
							onChange={(event) => setStaffId(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Unassigned</option>
							{staff.map((member) => (
								<option key={member.id} value={member.id}>
									{member.user.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Room</span>
						<select
							value={classroomId}
							onChange={(event) => setClassroomId(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							<option value="">Unassigned</option>
							{classrooms.map((room) => (
								<option key={room.id} value={room.id}>
									{room.name}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Day</span>
						<select
							value={weekday}
							onChange={(event) => setWeekday(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						>
							{DAYS.map((day, index) => (
								<option key={day} value={index + 1}>
									{day}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Period</span>
						<input
							type="number"
							min={1}
							max={20}
							value={periodIndex}
							onChange={(event) => setPeriodIndex(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Starts</span>
						<input
							type="time"
							value={startsAt}
							onChange={(event) => setStartsAt(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Ends</span>
						<input
							type="time"
							value={endsAt}
							onChange={(event) => setEndsAt(event.target.value)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-4">
						<button
							type="submit"
							disabled={isSubmitting || !yearId || !courseId}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CalendarClock className="h-4 w-4" />
							)}
							Add slot
						</button>
					</div>
				</form>
			</section>

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<header className="border-b border-gray-200 px-5 py-4">
					<h2 className="font-semibold text-gray-900">Weekly grid</h2>
				</header>
				{isLoading ? (
					<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full min-w-[900px] text-left text-sm">
							<thead className="bg-gray-50 text-xs uppercase text-gray-500">
								<tr>
									<th className="px-3 py-3">Period</th>
									{DAYS.map((day) => (
										<th key={day} className="px-3 py-3">
											{day}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{periods.map((period) => (
									<tr key={period} className="border-t border-gray-100">
										<td className="px-3 py-3 font-semibold text-gray-600">
											{period}
										</td>
										{DAYS.map((day, index) => {
											const slot = byCell.get(`${index + 1}-${period}`);

											return (
												<td key={day} className="px-2 py-2 align-top">
													{slot ? (
														<div className="rounded-lg border border-red-100 bg-red-50/60 p-2">
															<p className="text-xs font-semibold text-red-700">
																{slot.course.code}
															</p>
															<p className="text-[11px] text-gray-600">
																{slot.startsAt}–{slot.endsAt}
															</p>
															<p className="text-[11px] text-gray-500">
																{slot.staff?.user.name ?? "Unassigned"}
																{slot.classroom
																	? ` · ${slot.classroom.name}`
																	: ""}
															</p>
															<button
																type="button"
																onClick={() => void remove(slot.id)}
																className="mt-1 inline-flex items-center gap-1 text-[10px] font-medium text-red-600"
															>
																<Trash2 className="h-3 w-3" /> Remove
															</button>
														</div>
													) : (
														<span className="text-xs text-gray-300">—</span>
													)}
												</td>
											);
										})}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</section>
		</div>
	);
}
