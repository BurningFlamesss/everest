import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarClock, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { TableSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { cn } from "#/lib/utils.ts";
import {
	createTimetableSlotAction,
	deleteTimetableSlotAction,
	getTimetableDataFn,
	getTimetableOptionsFn,
} from "#/packages/academics/timetable-server.ts";

export const Route = createFileRoute("/admin/_admin/timetable")({
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
	const [pendingSlot, setPendingSlot] = useState<SlotRow | null>(null);

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
		<div data-testid="timetable-page" className="space-y-5">
			<PageHeader
				testId="timetable-page-header"
				eyebrow="Academics"
				title="Timetable"
				description="Assign courses to days and periods. A teacher or room cannot be in two places at once."
				meta={
					!isLoading ? (
						<span data-testid="timetable-meta-slots">
							{slots.length} {slots.length === 1 ? "slot" : "slots"} scheduled
						</span>
					) : undefined
				}
			/>

			{error ? (
				<div
					role="alert"
					data-testid="timetable-error"
					className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
				>
					{error}
				</div>
			) : null}
			{notice ? (
				<div
					data-testid="timetable-notice"
					className="rounded-lg border border-success/30 bg-success/10 p-3 text-sm text-success"
				>
					{notice}
				</div>
			) : null}

			<Panel
				title="Add a slot"
				description="Place a course into a day and period."
				testId="timetable-add-slot-panel"
				bodyClassName="p-5"
			>
				<form
					onSubmit={(event) => void submit(event)}
					className="grid gap-4 md:grid-cols-4"
				>
					<Select
						label="Year"
						value={yearId}
						onChange={(event) => setYearId(event.target.value)}
						required
						testId="timetable-year-select"
					>
						<option value="">Select…</option>
						{years.map((year) => (
							<option key={year.id} value={year.id}>
								{year.name}
								{year.isActive ? " (active)" : ""}
							</option>
						))}
					</Select>
					<Select
						label="Course"
						value={courseId}
						onChange={(event) => chooseCourse(event.target.value)}
						required
						testId="timetable-course-select"
					>
						<option value="">Select…</option>
						{courses.map((course) => (
							<option key={course.id} value={course.id}>
								{course.code} · {course.name}
							</option>
						))}
					</Select>
					<Select
						label="Teacher"
						value={staffId}
						onChange={(event) => setStaffId(event.target.value)}
						testId="timetable-teacher-select"
					>
						<option value="">Unassigned</option>
						{staff.map((member) => (
							<option key={member.id} value={member.id}>
								{member.user.name}
							</option>
						))}
					</Select>
					<Select
						label="Room"
						value={classroomId}
						onChange={(event) => setClassroomId(event.target.value)}
						testId="timetable-room-select"
					>
						<option value="">Unassigned</option>
						{classrooms.map((room) => (
							<option key={room.id} value={room.id}>
								{room.name}
							</option>
						))}
					</Select>
					<Select
						label="Day"
						value={weekday}
						onChange={(event) => setWeekday(event.target.value)}
						testId="timetable-day-select"
					>
						{DAYS.map((day, index) => (
							<option key={day} value={index + 1}>
								{day}
							</option>
						))}
					</Select>
					<Input
						label="Period"
						type="number"
						min={1}
						max={20}
						value={periodIndex}
						onChange={(event) => setPeriodIndex(event.target.value)}
						testId="timetable-period-input"
					/>
					<Input
						label="Starts"
						type="time"
						value={startsAt}
						onChange={(event) => setStartsAt(event.target.value)}
						testId="timetable-starts-input"
					/>
					<Input
						label="Ends"
						type="time"
						value={endsAt}
						onChange={(event) => setEndsAt(event.target.value)}
						testId="timetable-ends-input"
					/>
					<div className="md:col-span-4">
						<Button
							type="submit"
							disabled={isSubmitting || !yearId || !courseId}
							className="gap-1.5"
							data-testid="timetable-add-slot"
						>
							{isSubmitting ? (
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
							) : (
								<CalendarClock className="h-3.5 w-3.5" />
							)}
							Add slot
						</Button>
					</div>
				</form>
			</Panel>

			<Panel
				title="Weekly grid"
				description="The timetable for the selected academic year."
				testId="timetable-grid-panel"
				bodyClassName="p-0"
			>
				{isLoading ? (
					<div className="p-5">
						<TableSkeleton rows={6} columns={5} />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table
							className="w-full min-w-[900px] border-collapse text-left text-sm"
							data-testid="timetable-grid"
						>
							<thead className="bg-surface-2">
								<tr className="border-b border-hairline">
									<th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
										Period
									</th>
									{DAYS.map((day) => (
										<th
											key={day}
											className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground"
										>
											{day}
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-hairline">
								{periods.map((period) => (
									<tr key={period} className="transition-colors duration-150">
										<td className="num px-3 py-2.5 font-semibold text-foreground">
											{period}
										</td>
										{DAYS.map((day, index) => {
											const slot = byCell.get(`${index + 1}-${period}`);

											return (
												<td
													key={day}
													className="px-2 py-2 align-top"
													data-testid={`timetable-cell-${index + 1}-${period}`}
												>
													{slot ? (
														<div className="group rounded-lg border border-primary/20 bg-primary/[0.06] p-2 transition-colors duration-150">
															<p className="text-xs font-semibold text-primary">
																{slot.course.code}
															</p>
															<p className="num text-[11px] text-foreground">
																{slot.startsAt}–{slot.endsAt}
															</p>
															<p className="text-[11px] text-muted-foreground">
																{slot.staff?.user.name ?? "Unassigned"}
																{slot.classroom
																	? ` · ${slot.classroom.name}`
																	: ""}
															</p>
															<button
																type="button"
																onClick={() => setPendingSlot(slot)}
																className="mt-1 inline-flex items-center gap-1 rounded text-[11px] font-medium text-muted-foreground transition-colors duration-150 hover:text-destructive focus-ring"
																data-testid={`timetable-slot-remove-${slot.id}`}
															>
																<Trash2 className="h-3 w-3" /> Remove
															</button>
														</div>
													) : (
														<span className="text-xs text-muted-foreground/60">
															—
														</span>
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
			</Panel>

			<ConfirmDialog
				open={!!pendingSlot}
				onOpenChange={(open) => !open && setPendingSlot(null)}
				testId="timetable-slot-delete-dialog"
				title="Remove slot"
				description="Remove this slot from the timetable?"
				confirmLabel="Remove"
				destructive
				onConfirm={() => pendingSlot && void remove(pendingSlot.id)}
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
