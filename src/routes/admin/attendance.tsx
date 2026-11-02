import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarCheck, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "#/lib/utils.ts";
import {
	deleteAttendanceSessionAction,
	getAttendanceDataFn,
	getAttendanceSessionAction,
	openAttendanceSessionAction,
	saveAttendanceAction,
} from "#/packages/attendance/server.ts";

export const Route = createFileRoute("/admin/attendance")({
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

const MARKS: Array<AttendanceMark> = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

const markStyles: Record<AttendanceMark, string> = {
	PRESENT: "bg-green-100 text-green-700",
	ABSENT: "bg-red-100 text-red-700",
	LATE: "bg-amber-100 text-amber-700",
	EXCUSED: "bg-sky-100 text-sky-700",
};

function AdminAttendance() {
	const [courses, setCourses] = useState<Array<CourseOption>>([]);
	const [sessions, setSessions] = useState<Array<SessionSummary>>([]);
	const [session, setSession] = useState<SessionDetail | null>(null);
	const [records, setRecords] = useState<Array<SessionRecord>>([]);
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

		const loaded = response.session as SessionDetail;
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

		const loaded = response.session as SessionDetail;
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

		const loaded = response.session as SessionDetail;
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
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
				<p className="mt-1 text-sm text-gray-500">
					Open a daily register for a course, mark students and save the record.
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
					<CalendarCheck className="h-5 w-5 text-red-500" /> Open a register
				</h2>
				<form
					onSubmit={(event) => void openSession(event)}
					className="grid gap-4 md:grid-cols-3"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Course</span>
						<select
							name="courseId"
							required
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
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Date</span>
						<input
							type="date"
							name="date"
							required
							defaultValue={new Date().toISOString().slice(0, 10)}
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Topic <span className="text-gray-400">(optional)</span>
						</span>
						<input
							name="topic"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-3">
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CalendarCheck className="h-4 w-4" />
							)}
							{isSubmitting ? "Opening…" : "Open register"}
						</button>
					</div>
				</form>
			</section>

			{session ? (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
					<header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
						<div>
							<h2 className="font-semibold text-gray-900">
								{session.course.code} · {session.course.name}
							</h2>
							<p className="text-xs text-gray-500">
								{new Date(session.date).toLocaleDateString(undefined, {
									dateStyle: "full",
								})}
								{session.topic ? ` · ${session.topic}` : ""} ·{" "}
								{session.takenBy?.user.name ?? "Unassigned"}
							</p>
						</div>
						<div className="flex items-center gap-2">
							<span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-700">
								{presentCount}/{records.length} present
							</span>
							<button
								type="button"
								onClick={() => void save()}
								disabled={isSaving || records.length === 0}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSaving ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<CheckCircle2 className="h-4 w-4" />
								)}
								Save attendance
							</button>
						</div>
					</header>

					{records.length === 0 ? (
						<p className="p-6 text-sm text-gray-500">
							No students are enrolled in this course. Add enrolments from the
							academics page first.
						</p>
					) : (
						<ul className="divide-y divide-gray-100">
							{records.map((record) => (
								<li
									key={record.studentId}
									className="grid gap-3 px-5 py-4 md:grid-cols-[1fr_auto_1fr] md:items-center"
								>
									<div>
										<p className="font-medium text-gray-900">
											{record.student.user.name}
										</p>
										<p className="text-xs text-gray-500">
											{record.student.user.email}
										</p>
									</div>
									<div className="flex flex-wrap gap-1">
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
													"rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
													record.status === mark
														? markStyles[mark]
														: "bg-gray-100 text-gray-500 hover:bg-gray-200",
												)}
											>
												{mark.charAt(0) + mark.slice(1).toLowerCase()}
											</button>
										))}
									</div>
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
										className="w-full rounded-lg border border-gray-200 px-3 py-1.5 text-sm md:max-w-xs md:justify-self-end"
									/>
								</li>
							))}
						</ul>
					)}
				</section>
			) : null}

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
					<h2 className="font-semibold text-gray-900">Recent registers</h2>
					<button
						type="button"
						onClick={() => void load()}
						className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
					>
						<RefreshCw
							className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
						/>
						Refresh
					</button>
				</header>

				{isLoading ? (
					<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : sessions.length === 0 ? (
					<p className="p-8 text-center text-sm text-gray-500">
						No registers have been opened yet.
					</p>
				) : (
					<ul className="divide-y divide-gray-100">
						{sessions.map((entry) => (
							<li
								key={entry.id}
								className="flex flex-wrap items-center gap-3 px-5 py-4"
							>
								<div className="min-w-0 flex-1">
									<p className="font-medium text-gray-900">
										{entry.course.code} · {entry.course.name}
									</p>
									<p className="text-xs text-gray-500">
										{new Date(entry.date).toLocaleDateString()}
										{entry.topic ? ` · ${entry.topic}` : ""} ·{" "}
										{entry._count.records} record
										{entry._count.records === 1 ? "" : "s"}
									</p>
								</div>
								<button
									type="button"
									onClick={() => void viewSession(entry.id)}
									className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
								>
									Open
								</button>
								<button
									type="button"
									onClick={() => void removeSession(entry.id)}
									className="text-xs font-medium text-red-600 hover:text-red-700"
								>
									Delete
								</button>
							</li>
						))}
					</ul>
				)}
			</section>
		</div>
	);
}
