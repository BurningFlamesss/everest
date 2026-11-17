import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	BarChart3,
	CalendarCheck,
	CheckCircle2,
	Loader2,
	RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { cn } from "#/lib/utils.ts";
import {
	deleteAttendanceSessionAction,
	getAttendanceDataFn,
	getAttendanceSessionAction,
	getAttendanceSummaryAction,
	openAttendanceSessionAction,
	saveAttendanceAction,
} from "#/packages/attendance/server.ts";

export const Route = createFileRoute("/admin/_admin/attendance")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_ATTENDANCE")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminAttendance,
});

type AttendanceMark = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

interface CourseOption {
	id: string;
	code: string;
	name: string;
	grade: string | null;
	section: string | null;
}

interface SessionSummary {
	id: string;
	date: string | Date;
	topic: string | null;
	course: { id: string; code: string; name: string };
	_count: { records: number };
}

interface SessionRecord {
	studentId: string;
	status: AttendanceMark;
	note: string | null;
	student: { id: string; user: { name: string; email: string } };
}

interface SessionDetail {
	id: string;
	date: string | Date;
	topic: string | null;
	course: {
		id: string;
		code: string;
		name: string;
		grade: string | null;
		section: string | null;
	};
	takenBy: { user: { name: string } } | null;
	records: Array<SessionRecord>;
}

interface SummaryRow {
	id: string;
	name: string;
	present: number;
	absent: number;
	late: number;
	excused: number;
	total: number;
}

const MARKS: Array<AttendanceMark> = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const markStyles: Record<AttendanceMark, string> = {
	PRESENT: "bg-success/12 text-success",
	ABSENT: "bg-destructive/12 text-destructive",
	LATE: "bg-accent/14 text-accent",
	EXCUSED: "bg-info/12 text-info",
};

const fieldClasses =
	"h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring";

function AdminAttendance() {
	const [view, setView] = useState<"registers" | "summary">("registers");
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [sessions, setSessions] = useState<Array<SessionSummary>>([]);
	const [session, setSession] = useState<SessionDetail | null>(null);
	const [records, setRecords] = useState<Array<SessionRecord>>([]);
	const [summaryCourseId, setSummaryCourseId] = useState("");
	const [summary, setSummary] = useState<Array<SummaryRow>>([]);
	const [isLoadingSummary, setIsLoadingSummary] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getAttendanceDataFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setCourses(response.courses as Array<CourseOption>);
		setSessions(response.sessions as Array<SessionSummary>);
		setError("");
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const loadSummary = useCallback(async (courseId: string) => {
		setIsLoadingSummary(true);
		const response = await getAttendanceSummaryAction({ data: { courseId } });
		setIsLoadingSummary(false);

		if (!response.success) {
			setError(response.error);
			setSummary([]);
			return;
		}

		setError("");
		setSummary(response.summary as Array<SummaryRow>);
	}, []);

	useEffect(() => {
		if (view !== "summary" || !summaryCourseId) {
			setSummary([]);
			return;
		}

		void loadSummary(summaryCourseId);
	}, [view, summaryCourseId, loadSummary]);

	const openSession = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const data = new FormData(event.currentTarget);
		const response = await openAttendanceSessionAction({
			data: {
				courseId: String(data.get("courseId") ?? ""),
				date: String(data.get("date") ?? ""),
				topic: String(data.get("topic") ?? "") || undefined,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		const loaded = response.session as unknown as SessionDetail;
		setSession(loaded);
		setRecords(loaded.records);
		setNotice(
			loaded.records.length === 0
				? "Register opened. No active students are enrolled in this course."
				: "Register opened. All students start as present.",
		);
		await load();
	};

	const viewSession = async (id: string) => {
		setError("");
		setNotice("");
		const response = await getAttendanceSessionAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		const loaded = response.session as unknown as SessionDetail;
		setSession(loaded);
		setRecords(loaded.records);
	};

	const save = async () => {
		if (!session) return;

		setError("");
		setNotice("");
		setIsSaving(true);

		const response = await saveAttendanceAction({
			data: {
				sessionId: session.id,
				records: records.map((record) => ({
					studentId: record.studentId,
					status: record.status,
					note: record.note ?? undefined,
				})),
			},
		});

		setIsSaving(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		const loaded = response.session as unknown as SessionDetail;
		setSession(loaded);
		setRecords(loaded.records);
		setNotice("Attendance saved.");
		await load();
	};

	const removeSession = async (id: string) => {
		if (!confirm("Delete this attendance register permanently?")) return;

		const response = await deleteAttendanceSessionAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
			return;
		}

		if (session?.id === id) {
			setSession(null);
			setRecords([]);
		}

		setNotice("Register deleted.");
		await load();
	};

	const presentCount = records.filter(
		(record) => record.status === "PRESENT",
	).length;

	return (
		<div className="space-y-5" data-testid="attendance-page">
			<PageHeader
				eyebrow="Academics"
				title="Attendance"
				description="Open a daily register for a course, mark students and save the record."
				meta={
					<>
						<span data-testid="attendance-session-count">
							{sessions.length} register{sessions.length === 1 ? "" : "s"}
						</span>
						<span data-testid="attendance-course-count">
							{courses.length} course{courses.length === 1 ? "" : "s"}
						</span>
					</>
				}
				testId="attendance-page-header"
			/>

			<Tabs
				value={view}
				onValueChange={(value: string) =>
					setView(value as "registers" | "summary")
				}
			>
				<TabsList className="h-9" data-testid="attendance-tabs">
					<TabsTrigger value="registers" data-testid="attendance-tab-registers">
						<CalendarCheck className="mr-1.5 h-3.5 w-3.5" /> Registers
					</TabsTrigger>
					<TabsTrigger value="summary" data-testid="attendance-tab-summary">
						<BarChart3 className="mr-1.5 h-3.5 w-3.5" /> Summary
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{error ? (
				<div
					className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
					data-testid="attendance-error-banner"
				>
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{error}</p>
				</div>
			) : null}
			{notice ? (
				<div
					className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
					data-testid="attendance-notice-banner"
				>
					<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{notice}</p>
				</div>
			) : null}

			{view === "registers" ? (
				<>
					<Panel
						title="Open a register"
						description="Pick a course and date; every enrolled student starts as present."
						testId="attendance-open-panel"
						bodyClassName="p-5"
					>
						<form
							onSubmit={(event) => void openSession(event)}
							className="grid gap-4 md:grid-cols-3"
						>
							<label className="space-y-1.5">
								<Label htmlFor="attendance-course" className="text-xs">
									Course
								</Label>
								<select
									id="attendance-course"
									name="courseId"
									required
									className={fieldClasses}
									data-testid="attendance-course"
								>
									<option value="">Select a course…</option>
									{courses.map((course) => (
										<option key={course.id} value={course.id}>
											{course.code} · {course.name}
										</option>
									))}
								</select>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="attendance-date" className="text-xs">
									Date
								</Label>
								<input
									id="attendance-date"
									type="date"
									name="date"
									required
									defaultValue={new Date().toISOString().slice(0, 10)}
									className={fieldClasses}
									data-testid="attendance-date"
								/>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="attendance-topic" className="text-xs">
									Topic{" "}
									<span className="font-normal text-muted-foreground">
										(optional)
									</span>
								</Label>
								<input
									id="attendance-topic"
									name="topic"
									className={fieldClasses}
									data-testid="attendance-topic"
								/>
							</label>
							<div className="md:col-span-3">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSubmitting}
									data-testid="attendance-open-submit"
								>
									{isSubmitting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<CalendarCheck className="h-3.5 w-3.5" />
									)}
									{isSubmitting ? "Opening…" : "Open register"}
								</Button>
							</div>
						</form>
					</Panel>

					{session ? (
						<Panel
							title={`${session.course.code} · ${session.course.name}`}
							description={`${new Date(session.date).toLocaleDateString(undefined, { dateStyle: "full" })}${session.topic ? ` · ${session.topic}` : ""} · ${session.takenBy?.user.name ?? "Unassigned"}`}
							actions={
								<div className="flex items-center gap-2">
									<span
										className="num rounded-full bg-success/12 px-2.5 py-1 text-xs font-semibold text-success"
										data-testid="attendance-present-count"
									>
										{presentCount}/{records.length} present
									</span>
									<Button
										type="button"
										size="sm"
										className="gap-1.5"
										onClick={() => void save()}
										disabled={isSaving || records.length === 0}
										data-testid="attendance-save"
									>
										{isSaving ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<CheckCircle2 className="h-3.5 w-3.5" />
										)}
										Save attendance
									</Button>
								</div>
							}
							testId="attendance-register-panel"
							bodyClassName="p-0"
						>
							{records.length === 0 ? (
								<EmptyState
									icon={CalendarCheck}
									title="No students enrolled"
									description="No students are enrolled in this course. Add enrolments from the academics page first."
									testId="attendance-register-empty"
									compact
								/>
							) : (
								<ul className="divide-y divide-hairline">
									{records.map((record) => (
										<li
											key={record.studentId}
											data-testid={`attendance-record-${record.studentId}`}
											className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center"
										>
											<div className="min-w-0">
												<p className="text-sm font-medium text-foreground">
													{record.student.user.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{record.student.user.email}
												</p>
											</div>
											<fieldset className="flex min-w-0 flex-wrap gap-1">
												<legend className="sr-only">
													Attendance mark for {record.student.user.name}
												</legend>
												{MARKS.map((mark) => (
													<button
														key={mark}
														type="button"
														onClick={() =>
															setRecords((current) =>
																current.map((entry) =>
																	entry.studentId === record.studentId
																		? { ...entry, status: mark }
																		: entry,
																),
															)
														}
														className={cn(
															"rounded-full px-2.5 py-1 text-xs font-semibold transition-colors duration-150 focus-ring",
															record.status === mark
																? markStyles[mark]
																: "bg-surface-2 text-muted-foreground hover:text-foreground",
														)}
														data-testid={`attendance-mark-${record.studentId}-${mark.toLowerCase()}`}
													>
														{mark.charAt(0) + mark.slice(1).toLowerCase()}
													</button>
												))}
											</fieldset>
											<input
												value={record.note ?? ""}
												onChange={(event) =>
													setRecords((current) =>
														current.map((entry) =>
															entry.studentId === record.studentId
																? { ...entry, note: event.target.value }
																: entry,
														),
													)
												}
												placeholder="Note (optional)"
												aria-label={`Note for ${record.student.user.name}`}
												className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring md:max-w-xs md:justify-self-end"
											/>
										</li>
									))}
								</ul>
							)}
						</Panel>
					) : null}

					<Panel
						title="Recent registers"
						description="Reopen or delete a saved register."
						actions={
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-7 gap-1 px-2 text-xs"
								onClick={() => void load()}
								data-testid="attendance-refresh"
							>
								<RefreshCw
									className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
								/>
								Refresh
							</Button>
						}
						testId="attendance-registers-panel"
						bodyClassName="p-0"
					>
						{isLoading ? (
							<div className="p-5" data-testid="attendance-registers-loading">
								<ListSkeleton rows={5} />
							</div>
						) : sessions.length === 0 ? (
							<EmptyState
								icon={CalendarCheck}
								title="No registers yet"
								description="No registers have been opened yet. Open one above."
								testId="attendance-registers-empty"
							/>
						) : (
							<ul className="divide-y divide-hairline">
								{sessions.map((entry) => (
									<li
										key={entry.id}
										data-testid={`attendance-session-${entry.id}`}
										className="flex flex-wrap items-center gap-3 px-5 py-4"
									>
										<div className="min-w-0 flex-1">
											<p className="text-sm font-medium text-foreground">
												{entry.course.code} · {entry.course.name}
											</p>
											<p className="num mt-0.5 text-xs text-muted-foreground">
												{new Date(entry.date).toLocaleDateString()}
												{entry.topic ? ` · ${entry.topic}` : ""} ·{" "}
												{entry._count.records} record
												{entry._count.records === 1 ? "" : "s"}
											</p>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-7 gap-1 px-2 text-xs"
											onClick={() => void viewSession(entry.id)}
											data-testid={`attendance-session-open-${entry.id}`}
										>
											Open
										</Button>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
											onClick={() => void removeSession(entry.id)}
											data-testid={`attendance-session-delete-${entry.id}`}
										>
											Delete
										</Button>
									</li>
								))}
							</ul>
						)}
					</Panel>
				</>
			) : (
				<Panel
					title="Attendance summary"
					description="Per-student totals across every register recorded for a course."
					testId="attendance-summary-panel"
					bodyClassName="p-0"
				>
					<div className="border-b border-hairline p-5">
						<label className="block max-w-md space-y-1.5">
							<Label htmlFor="attendance-summary-course" className="text-xs">
								Course
							</Label>
							<select
								id="attendance-summary-course"
								value={summaryCourseId}
								onChange={(event) => setSummaryCourseId(event.target.value)}
								className={fieldClasses}
								data-testid="attendance-summary-course"
							>
								<option value="">Select a course…</option>
								{courses.map((course) => (
									<option key={course.id} value={course.id}>
										{course.code} · {course.name}
									</option>
								))}
							</select>
						</label>
					</div>

					{isLoadingSummary ? (
						<div className="p-5" data-testid="attendance-summary-loading">
							<ListSkeleton rows={5} />
						</div>
					) : !summaryCourseId ? (
						<EmptyState
							icon={BarChart3}
							title="Choose a course"
							description="Choose a course to see its attendance summary."
							testId="attendance-summary-pick-course"
						/>
					) : summary.length === 0 ? (
						<EmptyState
							icon={BarChart3}
							title="No attendance recorded"
							description="No attendance has been recorded for this course yet."
							testId="attendance-summary-empty"
						/>
					) : (
						<div className="overflow-x-auto">
							<table className="w-full min-w-[640px] border-collapse text-sm">
								<thead className="bg-surface-2">
									<tr className="border-b border-hairline">
										{[
											"Student",
											"Present",
											"Absent",
											"Late",
											"Excused",
											"Registers",
											"Rate",
										].map((header, index) => (
											<th
												key={header}
												className={cn(
													"px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground",
													index === 0 && "px-5",
													index === 6 && "px-5",
												)}
											>
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-hairline">
									{summary.map((row) => {
										const rate =
											row.total === 0
												? 0
												: Math.round(
														((row.present + row.late) / row.total) * 100,
													);

										return (
											<tr
												key={row.id}
												data-testid={`attendance-summary-row-${row.id}`}
												className="transition-colors duration-150 hover:bg-surface-2"
											>
												<td className="px-5 py-2.5 font-medium text-foreground">
													{row.name}
												</td>
												<td className="num px-3 py-2.5 text-success">
													{row.present}
												</td>
												<td className="num px-3 py-2.5 text-destructive">
													{row.absent}
												</td>
												<td className="num px-3 py-2.5 text-warning">
													{row.late}
												</td>
												<td className="num px-3 py-2.5 text-info">
													{row.excused}
												</td>
												<td className="num px-3 py-2.5 text-muted-foreground">
													{row.total}
												</td>
												<td className="num px-5 py-2.5 font-semibold text-foreground">
													{rate}%
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</Panel>
			)}
		</div>
	);
}
