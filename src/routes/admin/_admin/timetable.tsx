import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	CalendarClock,
	Check,
	Globe,
	Loader2,
	Minus,
	Pencil,
	Plus,
	RotateCcw,
	SlidersHorizontal,
	Sparkles,
	Trash2,
	X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { TableSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils.ts";
import {
	createTimetableSlotAction,
	deleteTimetableSlotAction,
	getTimetableDataFn,
	getTimetableOptionsFn,
	updateTimetableSlotAction,
} from "#/packages/academics/timetable-server.ts";

export const Route = createFileRoute("/admin/_admin/timetable")({
	beforeLoad: ({ context }) => {
		if (
			!context.viewer.permissions.includes("MANAGE_TIMETABLE") &&
			context.viewer.primaryRole !== "STAFF"
		) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminTimetable,
});

const DAYS = [
	{ id: 1, name: "Monday", short: "Mon" },
	{ id: 2, name: "Tuesday", short: "Tue" },
	{ id: 3, name: "Wednesday", short: "Wed" },
	{ id: 4, name: "Thursday", short: "Thu" },
	{ id: 5, name: "Friday", short: "Fri" },
	{ id: 6, name: "Saturday", short: "Sat" },
	{ id: 7, name: "Sunday", short: "Sun" },
];

const DEFAULT_PERIOD_TIMES: Record<number, { startsAt: string; endsAt: string }> = {
	1: { startsAt: "09:00", endsAt: "09:45" },
	2: { startsAt: "09:45", endsAt: "10:30" },
	3: { startsAt: "10:30", endsAt: "11:15" },
	4: { startsAt: "11:35", endsAt: "12:20" },
	5: { startsAt: "12:20", endsAt: "13:05" },
	6: { startsAt: "13:05", endsAt: "13:50" },
	7: { startsAt: "13:50", endsAt: "14:35" },
	8: { startsAt: "14:35", endsAt: "15:20" },
	9: { startsAt: "15:20", endsAt: "16:05" },
	10: { startsAt: "16:05", endsAt: "16:50" },
	11: { startsAt: "16:50", endsAt: "17:35" },
	12: { startsAt: "17:35", endsAt: "18:20" },
	13: { startsAt: "18:20", endsAt: "19:05" },
	14: { startsAt: "19:05", endsAt: "19:50" },
};

function getPeriodDefaultTime(period: number): { startsAt: string; endsAt: string } {
	if (DEFAULT_PERIOD_TIMES[period]) {
		return DEFAULT_PERIOD_TIMES[period];
	}
	// Fallback calculation for period > 14
	const baseMinutes = 9 * 60 + (period - 1) * 45;
	const startH = Math.floor(baseMinutes / 60) % 24;
	const startM = baseMinutes % 60;
	const endMinutes = baseMinutes + 45;
	const endH = Math.floor(endMinutes / 60) % 24;
	const endM = endMinutes % 60;
	const pad = (n: number) => String(n).padStart(2, "0");
	return {
		startsAt: `${pad(startH)}:${pad(startM)}`,
		endsAt: `${pad(endH)}:${pad(endM)}`,
	};
}

interface YearOption {
	id: string;
	name: string;
	isActive: boolean;
}

interface ClassOption {
	id: string;
	name: string;
	grade: string;
	section: string;
	roomNo: string | null;
}

interface CourseOption {
	id: string;
	code: string;
	name: string;
	grade: string | null;
	section: string | null;
	teacherId: string | null;
}

interface FacultyOption {
	id: string;
	name: string;
	role: string;
	department: string;
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
	class: { id: string; name: string; grade: string; section: string } | null;
	course: {
		id: string;
		code: string;
		name: string;
		grade: string | null;
	} | null;
	staff: { id: string; user: { name: string } } | null;
	facultyMember: { id: string; name: string; role: string } | null;
	classroom: { id: string; name: string } | null;
}

interface InlineEditState {
	weekday: number;
	periodIndex: number;
	slot?: SlotRow;
	courseId: string;
	facultyMemberId: string;
	classroomId: string;
	startsAt: string;
	endsAt: string;
}

function AdminTimetable() {
	const { viewer } = Route.useRouteContext();
	const canManage = viewer.permissions.includes("MANAGE_TIMETABLE");

	const [years, setYears] = useState<Array<YearOption>>([]);
	const [classes, setClasses] = useState<Array<ClassOption>>([]);
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [faculty, setFaculty] = useState<Array<FacultyOption>>([]);
	const [classrooms, setClassrooms] = useState<Array<ClassroomOption>>([]);
	const [slots, setSlots] = useState<Array<SlotRow>>([]);
	const [yearId, setYearId] = useState("");
	const [classId, setClassId] = useState("");
	const [courseId, setCourseId] = useState("");
	const [facultyMemberId, setFacultyMemberId] = useState("");
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

	// Period configuration: Global default + per-class overrides
	const [globalPeriodCount, setGlobalPeriodCount] = useState<number>(() => {
		if (typeof window !== "undefined") {
			const saved = localStorage.getItem("scms_timetable_global_periods");
			if (saved) {
				const parsed = Number.parseInt(saved, 10);
				if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 20) return parsed;
			}
		}
		return 7;
	});

	const [classPeriodCounts, setClassPeriodCounts] = useState<Record<string, number>>(() => {
		if (typeof window !== "undefined") {
			try {
				const saved = localStorage.getItem("scms_timetable_class_periods");
				if (saved) return JSON.parse(saved);
			} catch {}
		}
		return {};
	});

	// Sync period configs to localStorage
	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("scms_timetable_global_periods", String(globalPeriodCount));
		}
	}, [globalPeriodCount]);

	useEffect(() => {
		if (typeof window !== "undefined") {
			localStorage.setItem("scms_timetable_class_periods", JSON.stringify(classPeriodCounts));
		}
	}, [classPeriodCounts]);

	// Inline cell editing state (triggered via double-click)
	const [inlineEdit, setInlineEdit] = useState<InlineEditState | null>(null);
	const [isInlineSaving, setIsInlineSaving] = useState(false);
	const inlineSelectRef = useRef<HTMLSelectElement | null>(null);

	const loadOptions = useCallback(async () => {
		const response = await getTimetableOptionsFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setYears(response.years as Array<YearOption>);
		setClasses(response.classes as Array<ClassOption>);
		setCourses(response.courses as Array<CourseOption>);
		setFaculty(response.faculty as Array<FacultyOption>);
		setClassrooms(response.classrooms as Array<ClassroomOption>);

		const active = (response.years as Array<YearOption>).find(
			(year) => year.isActive,
		);

		setYearId((current) => current || active?.id || "");
		setClassId(
			(current) =>
				current || (response.classes as Array<ClassOption>)[0]?.id || "",
		);
		setIsLoading(false);
	}, []);

	const loadSlots = useCallback(
		async (academicYearId: string, selectedClassId: string) => {
			const response = await getTimetableDataFn({
				data: {
					academicYearId: academicYearId || undefined,
					classId: selectedClassId || undefined,
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setSlots(response.slots as Array<SlotRow>);
		},
		[],
	);

	useEffect(() => {
		void loadOptions();
	}, [loadOptions]);

	useEffect(() => {
		if (yearId) void loadSlots(yearId, classId);
	}, [yearId, classId, loadSlots]);

	useEffect(() => {
		if (inlineEdit && inlineSelectRef.current) {
			inlineSelectRef.current.focus();
		}
	}, [inlineEdit]);

	const selectedClass = classes.find((entry) => entry.id === classId);
	const courseChoices = courses.filter(
		(course) =>
			!selectedClass ||
			((!course.grade || course.grade === selectedClass.grade) &&
				(!course.section || course.section === selectedClass.section)),
	);

	// Period count calculations
	const isClassOverridden = Boolean(classId && classPeriodCounts[classId]);
	const currentClassTargetPeriods = classId && classPeriodCounts[classId]
		? classPeriodCounts[classId]
		: globalPeriodCount;

	const slotMax = slots.reduce(
		(max, slot) => Math.max(max, slot.periodIndex),
		0,
	);
	const displayPeriodCount = Math.max(currentClassTargetPeriods, slotMax, 1);
	const periods = Array.from(
		{ length: displayPeriodCount },
		(_, i) => i + 1,
	);
	const byCell = new Map(
		slots.map((slot) => [`${slot.weekday}-${slot.periodIndex}`, slot]),
	);

	// Period manipulation handlers (Class level)
	const handleIncreaseClassPeriods = () => {
		if (!classId) {
			toast.error("Please select a class first");
			return;
		}
		const next = displayPeriodCount + 1;
		if (next > 20) {
			toast.error("Maximum 20 periods supported");
			return;
		}
		setClassPeriodCounts((prev) => ({ ...prev, [classId]: next }));
		toast.success(
			`Periods for ${selectedClass?.name ?? "class"} set to ${next}`,
		);
	};

	const handleDecreaseClassPeriods = () => {
		if (!classId) {
			toast.error("Please select a class first");
			return;
		}
		if (displayPeriodCount <= 1) {
			toast.error("Minimum 1 period required");
			return;
		}
		const hasSlotsInLastPeriod = slots.some(
			(s) => s.periodIndex === displayPeriodCount,
		);
		if (hasSlotsInLastPeriod) {
			toast.error(
				`Period ${displayPeriodCount} has active slots. Remove them first before decreasing periods.`,
			);
			return;
		}
		const next = displayPeriodCount - 1;
		setClassPeriodCounts((prev) => ({ ...prev, [classId]: next }));
		toast.success(
			`Periods for ${selectedClass?.name ?? "class"} set to ${next}`,
		);
	};

	const handleResetClassToGlobal = () => {
		if (!classId) return;
		setClassPeriodCounts((prev) => {
			const next = { ...prev };
			delete next[classId];
			return next;
		});
		toast.success(
			`Reset ${selectedClass?.name ?? "class"} to global default (${globalPeriodCount} periods)`,
		);
	};

	// Period manipulation handlers (Global level)
	const handleIncreaseGlobalPeriods = () => {
		const next = globalPeriodCount + 1;
		if (next > 20) {
			toast.error("Maximum 20 periods supported");
			return;
		}
		setGlobalPeriodCount(next);
		toast.success(`Global default set to ${next} periods`);
	};

	const handleDecreaseGlobalPeriods = () => {
		if (globalPeriodCount <= 1) {
			toast.error("Minimum 1 period required");
			return;
		}
		const next = globalPeriodCount - 1;
		setGlobalPeriodCount(next);
		toast.success(`Global default set to ${next} periods`);
	};

	const handleApplyGlobalToAllClasses = () => {
		setClassPeriodCounts({});
		toast.success(
			`Applied global setting (${globalPeriodCount} periods) to all classes`,
		);
	};

	const submit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const response = await createTimetableSlotAction({
			data: {
				academicYearId: yearId,
				classId,
				courseId: courseId || null,
				facultyMemberId: facultyMemberId || null,
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
		toast.success("Timetable slot added");
	};

	const remove = async (id: string) => {
		const response = await deleteTimetableSlotAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		setSlots((current) => current.filter((slot) => slot.id !== id));
		toast.success("Slot removed from timetable");
	};

	// Start double-click inline editing on a cell
	const startInlineEdit = (
		dayNum: number,
		periodNum: number,
		slot?: SlotRow,
	) => {
		setError("");
		const defaultTimes = getPeriodDefaultTime(periodNum);

		setInlineEdit({
			weekday: dayNum,
			periodIndex: periodNum,
			slot,
			courseId: slot?.course?.id ?? "",
			facultyMemberId: slot?.facultyMember?.id ?? "",
			classroomId: slot?.classroom?.id ?? "",
			startsAt: slot?.startsAt ?? defaultTimes.startsAt,
			endsAt: slot?.endsAt ?? defaultTimes.endsAt,
		});
	};

	const cancelInlineEdit = () => {
		setInlineEdit(null);
	};

	// Save inline edit (either update existing slot or create new slot)
	const saveInlineEdit = async () => {
		if (!inlineEdit || !yearId || !classId) return;
		setIsInlineSaving(true);
		setError("");

		try {
			if (inlineEdit.slot) {
				const response = await updateTimetableSlotAction({
					data: {
						id: inlineEdit.slot.id,
						academicYearId: yearId,
						classId,
						courseId: inlineEdit.courseId || null,
						facultyMemberId: inlineEdit.facultyMemberId || null,
						classroomId: inlineEdit.classroomId || null,
						weekday: inlineEdit.weekday,
						periodIndex: inlineEdit.periodIndex,
						startsAt: inlineEdit.startsAt,
						endsAt: inlineEdit.endsAt,
					},
				});

				if (!response.success) {
					setError(response.error);
					toast.error(response.error);
					setIsInlineSaving(false);
					return;
				}

				if (response.slots) {
					setSlots(response.slots as Array<SlotRow>);
				} else {
					void loadSlots(yearId, classId);
				}

				const course = courses.find((c) => c.id === inlineEdit.courseId);
				toast.success(
					`Updated subject to ${course ? course.name : "Class period"}`,
				);
			} else {
				const response = await createTimetableSlotAction({
					data: {
						academicYearId: yearId,
						classId,
						courseId: inlineEdit.courseId || null,
						facultyMemberId: inlineEdit.facultyMemberId || null,
						classroomId: inlineEdit.classroomId || null,
						weekday: inlineEdit.weekday,
						periodIndex: inlineEdit.periodIndex,
						startsAt: inlineEdit.startsAt,
						endsAt: inlineEdit.endsAt,
					},
				});

				if (!response.success) {
					setError(response.error);
					toast.error(response.error);
					setIsInlineSaving(false);
					return;
				}

				setSlots(response.slots as Array<SlotRow>);
				const course = courses.find((c) => c.id === inlineEdit.courseId);
				toast.success(
					`Assigned ${course ? course.name : "Class period"} to Period ${inlineEdit.periodIndex}`,
				);
			}

			setInlineEdit(null);
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : "Failed to update timetable";
			setError(msg);
			toast.error(msg);
		} finally {
			setIsInlineSaving(false);
		}
	};

	return (
		<div data-testid="timetable-page" className="space-y-6">
			<PageHeader
				testId="timetable-page-header"
				eyebrow="Academics"
				title="Class Timetable & Routine"
				description="Manage weekly academic routines. Increase or decrease periods per class or globally, and double-click any slot to update subjects."
				meta={
					!isLoading ? (
						<div className="flex flex-wrap items-center gap-2">
							<span
								data-testid="timetable-meta-slots"
								className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary"
							>
								{slots.length} {slots.length === 1 ? "slot" : "slots"}{" "}
								scheduled
							</span>
							<span className="rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground">
								{displayPeriodCount} {displayPeriodCount === 1 ? "period" : "periods"} active
							</span>
							{selectedClass && (
								<span className="rounded-full border border-hairline bg-surface-2 px-2.5 py-1 text-xs font-medium text-foreground">
									{selectedClass.name}
									{selectedClass.roomNo ? ` · Room ${selectedClass.roomNo}` : ""}
								</span>
							)}
						</div>
					) : undefined
				}
			/>

			{error ? (
				<div
					role="alert"
					data-testid="timetable-error"
					className="rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-sm text-destructive"
				>
					{error}
				</div>
			) : null}
			{notice ? (
				<div
					data-testid="timetable-notice"
					className="rounded-xl border border-success/30 bg-success/10 p-3.5 text-sm text-success"
				>
					{notice}
				</div>
			) : null}

			{/* Routine Controls: Academic Year, Class, Period Adjustments */}
			<div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-hairline bg-surface-1 p-4 shadow-sm">
				<div className="flex flex-wrap items-center gap-4">
					<div className="w-44">
						<Select
							label="Academic Year"
							value={yearId}
							onChange={(event) => setYearId(event.target.value)}
							required
							testId="timetable-year-select"
						>
							<option value="">Select year…</option>
							{years.map((year) => (
								<option key={year.id} value={year.id}>
									{year.name}
									{year.isActive ? " (active)" : ""}
								</option>
							))}
						</Select>
					</div>

					<div className="w-52">
						<Select
							label="Class / Section"
							value={classId}
							onChange={(event) => {
								setClassId(event.target.value);
								setCourseId("");
								setFacultyMemberId("");
								setInlineEdit(null);
							}}
							required
							testId="timetable-class-select"
						>
							<option value="">Select class…</option>
							{classes.map((entry) => (
								<option key={entry.id} value={entry.id}>
									{entry.name}
									{entry.roomNo ? ` · Room ${entry.roomNo}` : ""}
								</option>
							))}
						</Select>
					</div>

					{/* Period Count Stepper (Per Class & Global) */}
					<div className="flex flex-col gap-1 border-t sm:border-t-0 sm:border-l sm:border-hairline pt-3 sm:pt-0 sm:pl-4">
						<div className="flex items-center justify-between gap-2">
							<Label className="text-xs font-semibold">Periods (This Class)</Label>
							{isClassOverridden && (
								<button
									type="button"
									onClick={handleResetClassToGlobal}
									className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline"
									title={`Reset to global default (${globalPeriodCount})`}
									data-testid="timetable-reset-class-periods"
								>
									<RotateCcw className="h-2.5 w-2.5" />
									Reset to global
								</button>
							)}
						</div>

						<div className="flex items-center gap-1.5">
							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-8 w-8"
								onClick={handleDecreaseClassPeriods}
								disabled={displayPeriodCount <= 1}
								title="Decrease periods for this class"
								data-testid="timetable-decrease-class-periods"
							>
								<Minus className="h-3.5 w-3.5" />
							</Button>

							<span
								className="min-w-20 text-center font-mono text-xs font-semibold text-foreground px-1"
								data-testid="timetable-active-periods-count"
							>
								{displayPeriodCount} {displayPeriodCount === 1 ? "Period" : "Periods"}
							</span>

							<Button
								type="button"
								variant="outline"
								size="icon"
								className="h-8 w-8"
								onClick={handleIncreaseClassPeriods}
								disabled={displayPeriodCount >= 20}
								title="Increase periods for this class"
								data-testid="timetable-increase-class-periods"
							>
								<Plus className="h-3.5 w-3.5" />
							</Button>

							{/* Global Period Setup Popover */}
							<Popover>
								<PopoverTrigger asChild>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
										title="Configure global period default"
										data-testid="timetable-periods-global-settings"
									>
										<SlidersHorizontal className="h-3.5 w-3.5" />
										<span className="hidden lg:inline">
											Global: {globalPeriodCount}
										</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className="w-80 p-4" align="start">
									<div className="space-y-3">
										<div className="flex items-center gap-2 border-b border-hairline pb-2">
											<Globe className="h-4 w-4 text-primary" />
											<p className="font-display font-semibold text-sm text-foreground">
												Global Period Configuration
											</p>
										</div>

										<p className="text-xs text-muted-foreground">
											Set the baseline number of periods used across all classes
											unless explicitly customized for a specific class.
										</p>

										<div className="flex items-center justify-between rounded-lg border border-hairline bg-surface-2/60 p-2.5">
											<span className="text-xs font-medium text-foreground">
												Global Default:
											</span>
											<div className="flex items-center gap-1.5">
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={handleDecreaseGlobalPeriods}
													disabled={globalPeriodCount <= 1}
													data-testid="timetable-decrease-global-periods"
												>
													<Minus className="h-3 w-3" />
												</Button>
												<span className="w-8 text-center font-mono text-xs font-bold text-primary">
													{globalPeriodCount}
												</span>
												<Button
													type="button"
													variant="outline"
													size="icon"
													className="h-7 w-7"
													onClick={handleIncreaseGlobalPeriods}
													disabled={globalPeriodCount >= 20}
													data-testid="timetable-increase-global-periods"
												>
													<Plus className="h-3 w-3" />
												</Button>
											</div>
										</div>

										<Button
											type="button"
											variant="secondary"
											size="sm"
											className="w-full text-xs font-medium"
											onClick={handleApplyGlobalToAllClasses}
											data-testid="timetable-apply-global-all"
										>
											Apply {globalPeriodCount} Periods to All Classes
										</Button>
									</div>
								</PopoverContent>
							</Popover>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary">
					<Sparkles className="h-4 w-4 shrink-0" />
					<span className="font-medium">
						{canManage
							? "Double-click any cell to assign or edit the subject instantly."
							: "Staff timetable view: Browse weekly class schedules, teachers, and assigned rooms."}
					</span>
				</div>
			</div>

			{/* Weekly Routine Grid */}
			<Panel
				title={`Weekly Timetable Routine — ${selectedClass?.name ?? "Select a Class"}`}
				description="Interactive weekly routine grid. Double-click any cell to change subject, teacher or room."
				testId="timetable-grid-panel"
				bodyClassName="p-0"
			>
				{isLoading ? (
					<div className="p-5">
						<TableSkeleton rows={6} columns={6} />
					</div>
				) : (
					<div className="overflow-x-auto">
						<table
							className="w-full min-w-[960px] border-collapse text-left text-sm"
							data-testid="timetable-grid"
						>
							<thead>
								<tr className="border-b border-hairline bg-surface-2/80">
									<th className="w-28 px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
										Period / Time
									</th>
									{DAYS.map((day) => (
										<th
											key={day.id}
											className="px-3 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
										>
											<div className="flex items-center justify-between">
												<span>{day.name}</span>
												<span className="text-[10px] text-muted-foreground/60 font-mono">
													{day.short}
												</span>
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody className="divide-y divide-hairline">
								{periods.map((period) => {
									const defaultTime = getPeriodDefaultTime(period);

									return (
										<tr
											key={period}
											className="transition-colors hover:bg-surface-2/30"
										>
											{/* Period Column Header */}
											<td className="w-28 bg-surface-2/40 px-3 py-3.5 font-medium text-foreground align-top">
												<div className="flex items-center gap-1.5 font-display font-semibold text-primary">
													<span>Period {period}</span>
												</div>
												<p className="mt-1 font-mono text-[10px] text-muted-foreground">
													{defaultTime.startsAt}–{defaultTime.endsAt}
												</p>
											</td>

											{/* Day Columns */}
											{DAYS.map((day) => {
												const slot = byCell.get(`${day.id}-${period}`);
												const isEditing =
													inlineEdit?.weekday === day.id &&
													inlineEdit?.periodIndex === period;

												return (
													<td
														key={day.id}
														className={cn(
															"group relative min-w-[130px] p-2 align-top transition-colors select-none",
															isEditing
																? "bg-primary/[0.08] ring-2 ring-inset ring-primary"
																: "hover:bg-primary/[0.03]",
														)}
														data-testid={`timetable-cell-${day.id}-${period}`}
														onDoubleClick={() =>
															canManage && startInlineEdit(day.id, period, slot)
														}
														title={
															canManage ? "Double-click to edit subject" : undefined
														}
													>
														{isEditing ? (
															/* Inline Editor on Double-Click */
															<div
																className="space-y-2 rounded-lg border border-primary/40 bg-surface-1 p-2.5 shadow-md"
																onClick={(e) => e.stopPropagation()}
															>
																<div className="flex items-center justify-between border-b border-hairline pb-1.5 text-[11px] font-semibold text-primary">
																	<span>
																		{slot ? "Edit Subject" : "Assign Subject"}
																	</span>
																	<button
																		type="button"
																		onClick={cancelInlineEdit}
																		className="rounded p-0.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
																		aria-label="Cancel"
																	>
																		<X className="h-3 w-3" />
																	</button>
																</div>

																<div className="space-y-1">
																	<label className="text-[10px] font-medium text-muted-foreground">
																		Course / Subject
																	</label>
																	<select
																		ref={inlineSelectRef}
																		value={inlineEdit.courseId}
																		onChange={(e) =>
																			setInlineEdit((prev) =>
																				prev
																					? {
																							...prev,
																							courseId: e.target.value,
																						}
																					: null,
																			)
																		}
																		onKeyDown={(e) => {
																			if (e.key === "Enter")
																				void saveInlineEdit();
																			if (e.key === "Escape")
																				cancelInlineEdit();
																		}}
																		className="h-8 w-full rounded border border-hairline bg-surface-2 px-2 text-xs font-medium text-foreground outline-none focus:border-primary focus:ring-1 focus:ring-primary"
																		data-testid="timetable-inline-course-select"
																	>
																		<option value="">Class period</option>
																		{courseChoices.map((c) => (
																			<option key={c.id} value={c.id}>
																				{c.name} ({c.code})
																			</option>
																		))}
																	</select>
																</div>

																<div className="space-y-1">
																	<label className="text-[10px] font-medium text-muted-foreground">
																		Teacher
																	</label>
																	<select
																		value={inlineEdit.facultyMemberId}
																		onChange={(e) =>
																			setInlineEdit((prev) =>
																				prev
																					? {
																							...prev,
																							facultyMemberId: e.target.value,
																						}
																					: null,
																			)
																		}
																		className="h-7 w-full rounded border border-hairline bg-surface-2 px-2 text-[11px] text-foreground outline-none focus:border-primary"
																	>
																		<option value="">Unassigned</option>
																		{faculty.map((f) => (
																			<option key={f.id} value={f.id}>
																				{f.name}
																			</option>
																		))}
																	</select>
																</div>

																<div className="flex items-center justify-end gap-1.5 pt-1">
																	<Button
																		type="button"
																		variant="ghost"
																		size="sm"
																		className="h-6 px-2 text-[11px]"
																		onClick={cancelInlineEdit}
																		disabled={isInlineSaving}
																	>
																		Cancel
																	</Button>
																	<Button
																		type="button"
																		size="sm"
																		className="h-6 gap-1 px-2 text-[11px]"
																		onClick={() => void saveInlineEdit()}
																		disabled={isInlineSaving}
																		data-testid="timetable-inline-save"
																	>
																		{isInlineSaving ? (
																			<Loader2 className="h-3 w-3 animate-spin" />
																		) : (
																			<Check className="h-3 w-3" />
																		)}
																		Save
																	</Button>
																</div>
															</div>
														) : slot ? (
															/* Populated Slot Card */
															<div className="group/card relative flex h-full min-h-[94px] flex-col justify-between rounded-lg border border-primary/25 bg-primary/[0.05] p-2.5 transition-all hover:border-primary hover:shadow-sm">
																<div className="space-y-1">
																	<div className="flex items-start justify-between gap-1">
																		<span className="font-semibold text-xs leading-snug text-primary">
																			{slot.course ? (
																				slot.course.name
																			) : (
																				<span className="italic text-foreground/75">
																					{slot.class?.name ?? "Class period"}
																				</span>
																			)}
																		</span>

																		<button
																			type="button"
																			onClick={() =>
																				startInlineEdit(day.id, period, slot)
																			}
																			className="opacity-0 group-hover/card:opacity-100 rounded p-1 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-opacity"
																			title="Edit subject (or double-click)"
																			data-testid={`timetable-edit-slot-${slot.id}`}
																		>
																			<Pencil className="h-3 w-3" />
																		</button>
																	</div>

																	{slot.course && (
																		<span className="inline-block rounded bg-surface-1 px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground border border-hairline">
																			{slot.course.code}
																		</span>
																	)}
																</div>

																<div className="mt-2 space-y-0.5 border-t border-hairline/60 pt-1.5 text-[10px] text-muted-foreground">
																	<p className="font-mono text-foreground">
																		{slot.startsAt}–{slot.endsAt}
																	</p>
																	<p className="truncate">
																		{slot.facultyMember?.name ??
																			slot.staff?.user.name ??
																			"Teacher unassigned"}
																		{slot.classroom
																			? ` · ${slot.classroom.name}`
																			: ""}
																	</p>

																	{canManage && (
																		<div className="flex items-center justify-between pt-1">
																			<button
																				type="button"
																				onClick={() => setPendingSlot(slot)}
																				className="inline-flex items-center gap-1 rounded text-[10px] font-medium text-muted-foreground hover:text-destructive focus-ring opacity-60 group-hover/card:opacity-100 transition-opacity"
																				data-testid={`timetable-slot-remove-${slot.id}`}
																			>
																				<Trash2 className="h-2.5 w-2.5" /> Remove
																			</button>

																			<span className="text-[9px] text-primary/70 opacity-0 group-hover/card:opacity-100 font-mono">
																				2× click to edit
																			</span>
																		</div>
																	)}
																</div>
															</div>
														) : (
															/* Empty Cell */
															<div
																className={cn(
																	"flex h-full min-h-[94px] flex-col items-center justify-center rounded-lg border border-dashed border-hairline/80 p-2 text-center transition-colors",
																	canManage
																		? "cursor-pointer hover:border-primary/50 hover:bg-primary/[0.04]"
																		: "opacity-40",
																)}
																onClick={() =>
																	canManage && startInlineEdit(day.id, period)
																}
															>
																{canManage ? (
																	<>
																		<Plus className="h-4 w-4 text-muted-foreground/40 transition-colors group-hover:text-primary" />
																		<span className="mt-1 text-[11px] text-muted-foreground/60 transition-colors group-hover:text-primary">
																			Add subject
																		</span>
																		<span className="text-[9px] text-muted-foreground/40 font-mono">
																			(2× click)
																		</span>
																	</>
																) : (
																	<span className="text-[11px] text-muted-foreground/50">
																		Free period
																	</span>
																)}
															</div>
														)}
													</td>
												);
											})}
										</tr>
									);
								})}
							</tbody>
							{/* Routine Grid Footer with Quick Period Controls */}
							<tfoot>
								<tr className="border-t border-hairline bg-surface-2/40">
									<td colSpan={DAYS.length + 1} className="p-3">
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>
													Showing <strong>{displayPeriodCount}</strong> periods for this class.
												</span>
												{isClassOverridden ? (
													<span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
														Custom class override active
													</span>
												) : (
													<span className="rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[10px] text-muted-foreground">
														Using global default ({globalPeriodCount} periods)
													</span>
												)}
											</div>

											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={handleDecreaseClassPeriods}
													disabled={displayPeriodCount <= 1}
													className="inline-flex items-center gap-1 rounded-md border border-hairline bg-surface-1 px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-surface-2 hover:text-foreground disabled:opacity-40"
													title="Remove the last period"
												>
													<Minus className="h-3 w-3" /> Remove Period {displayPeriodCount}
												</button>

												<button
													type="button"
													onClick={handleIncreaseClassPeriods}
													disabled={displayPeriodCount >= 20}
													className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20 disabled:opacity-40"
													title="Add another period row"
													data-testid="timetable-grid-add-period-btn"
												>
													<Plus className="h-3 w-3" /> Add Period {displayPeriodCount + 1}
												</button>
											</div>
										</div>
									</td>
								</tr>
							</tfoot>
						</table>
					</div>
				)}
			</Panel>

			{/* Detailed Add Slot Panel */}
			{canManage && (
				<Panel
					title="Add slot manually"
				description="Or configure start and end times explicitly for custom periods."
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
						label="Class"
						value={classId}
						onChange={(event) => {
							setClassId(event.target.value);
							setCourseId("");
							setFacultyMemberId("");
						}}
						required
						testId="timetable-class-select"
					>
						<option value="">Select…</option>
						{classes.map((entry) => (
							<option key={entry.id} value={entry.id}>
								{entry.name}
								{entry.roomNo ? ` · Room ${entry.roomNo}` : ""}
							</option>
						))}
					</Select>
					<Select
						label="Subject (optional)"
						value={courseId}
						onChange={(event) => setCourseId(event.target.value)}
						testId="timetable-course-select"
					>
						<option value="">Class period</option>
						{courseChoices.map((course) => (
							<option key={course.id} value={course.id}>
								{course.code} · {course.name}
							</option>
						))}
					</Select>
					<Select
						label="Teacher (faculty)"
						value={facultyMemberId}
						onChange={(event) => setFacultyMemberId(event.target.value)}
						testId="timetable-teacher-select"
					>
						<option value="">Unassigned</option>
						{faculty.map((member) => (
							<option key={member.id} value={member.id}>
								{member.name} · {member.role}
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
						{DAYS.map((day) => (
							<option key={day.id} value={day.id}>
								{day.name}
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
					<div className="grid grid-cols-2 gap-2">
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
					</div>
					<div className="md:col-span-4">
						<Button
							type="submit"
							disabled={isSubmitting || !yearId || !classId}
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
			)}

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
