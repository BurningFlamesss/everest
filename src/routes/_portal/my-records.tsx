import {
	createFileRoute,
	Link,
	redirect,
	useNavigate,
} from "@tanstack/react-router";
import { BookOpen, Bus, ClipboardCheck } from "lucide-react";
import { STAGGER } from "#/lib/motion";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getMyRecordsFn } from "#/packages/records/server.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
} from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/templates/modern/components/kit";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/my-records")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) {
			throw redirect({ to: "/login" });
		}

		return { viewer };
	},
	loader: () => getMyRecordsFn(),
	component: MyRecords,
});

const STATUS_STYLES: Record<string, string> = {
	PRESENT:
		"rounded-full border border-success/30 bg-success/10 px-2 py-0.5 text-[11px] font-medium text-success",
	ABSENT:
		"rounded-full border border-danger/30 bg-danger/10 px-2 py-0.5 text-[11px] font-medium text-danger",
	LATE: "rounded-full border border-warning/30 bg-warning/10 px-2 py-0.5 text-[11px] font-medium text-warning",
	EXCUSED:
		"rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground",
};

function MyRecords() {
	const data = Route.useLoaderData();
	const navigate = useNavigate();

	return (
		<PageFrame testId="my-records-page">
			<PageHeader
				testId="my-records-page-header"
				eyebrow="My records"
				title="Courses, attendance and transport"
				subtitle="Everything here is pulled from your own student record. It is read-only — contact the school office if something looks wrong."
			/>

			<Reveal delay={STAGGER}>
				<nav
					aria-label="Related portal pages"
					data-testid="my-records-cross-links"
					className="mt-6 flex flex-wrap gap-3"
				>
					<Button
						asChild
						variant="link"
						data-testid="my-records-link-my-results"
					>
						<Link to="/my-results">Exam results</Link>
					</Button>
					<Button
						asChild
						variant="link"
						data-testid="my-records-link-my-homework"
					>
						<Link to="/my-homework">Homework</Link>
					</Button>
					<Button asChild variant="link" data-testid="my-records-link-my-fees">
						<Link to="/my-fees">Fees</Link>
					</Button>
				</nav>
			</Reveal>

			{!data.success ? (
				<div
					data-testid="my-records-error"
					className="mt-10 rounded-card border border-danger/30 bg-danger/5 px-6 py-4 text-[13px] text-danger"
				>
					{data.error}
				</div>
			) : data.students.length === 0 ? (
				<div className="mt-9">
					<EmptyState
						eyebrow="No student record"
						title="No student record is linked to this account"
						description="This page is for students and guardians."
						actionLabel="Back to the dashboard"
						onAction={() => navigate({ to: "/dashboard" })}
						testId="my-records-empty-state"
					/>
				</div>
			) : (
				data.students.map((student, index) => {
					const rate =
						student.attendance.total > 0
							? Math.round(
									(student.attendance.present / student.attendance.total) * 100,
								)
							: null;

					return (
						<Section key={student.id} testId={`records-student-${student.id}`}>
							<Reveal delay={Math.min(index, 6) * STAGGER}>
								<article className="overflow-hidden rounded-card border border-border bg-card shadow-xs">
									<header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-5">
										<div className="min-w-0">
											<h2 className="t-h3 text-foreground">{student.name}</h2>
											<p className="t-meta mt-1">{student.email}</p>
										</div>
										<div className="flex flex-wrap gap-2">
											{student.grade ? (
												<span className="rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-[11.5px] font-medium text-red-dark">
													Grade {student.grade}
													{student.section ? ` · ${student.section}` : ""}
												</span>
											) : null}
											{student.rollNo ? (
												<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] text-muted-foreground">
													Roll {student.rollNo}
												</span>
											) : null}
											{student.admissionNo ? (
												<span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] text-muted-foreground">
													Adm {student.admissionNo}
												</span>
											) : null}
										</div>
									</header>

									<div className="grid gap-6 p-6 lg:grid-cols-3">
										<section className="lg:col-span-1">
											<h3 className="t-eyebrow inline-flex items-center gap-2">
												<ClipboardCheck
													className="h-3.5 w-3.5"
													aria-hidden="true"
												/>
												Attendance
											</h3>
											<dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-field border border-border bg-border">
												{[
													["Present", student.attendance.present],
													["Absent", student.attendance.absent],
													["Late", student.attendance.late],
													["Excused", student.attendance.excused],
												].map(([label, value]) => (
													<div key={label} className="bg-card px-3 py-3">
														<dt className="t-eyebrow">{label}</dt>
														<dd className="mt-1 font-display text-lg font-semibold text-foreground">
															{value}
														</dd>
													</div>
												))}
											</dl>
											<p className="t-caption mt-3">
												{student.attendance.total === 0
													? "No attendance has been recorded yet."
													: `${rate}% present across ${student.attendance.total} recorded classes.`}
											</p>
										</section>

										<section className="lg:col-span-2">
											<h3 className="t-eyebrow inline-flex items-center gap-2">
												<BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
												Courses
											</h3>
											{student.courses.length === 0 ? (
												<p className="t-caption mt-4">
													No courses are assigned yet.
												</p>
											) : (
												<ul className="mt-4 divide-y divide-rule-soft">
													{student.courses.map((course) => (
														<li
															key={course.id}
															className="flex flex-wrap items-center justify-between gap-3 py-3"
														>
															<div className="min-w-0">
																<p className="text-[13.5px] font-medium text-foreground">
																	{course.code} · {course.name}
																</p>
																<p className="t-caption mt-1">
																	{course.teacher ?? "No teacher assigned"}
																	{course.classroom
																		? ` · ${course.classroom}`
																		: ""}
																</p>
															</div>
															<div className="text-right">
																{course.schedule ? (
																	<p className="t-meta">{course.schedule}</p>
																) : null}
																<p className="mt-0.5 text-[12px] font-medium text-foreground">
																	{course.status}
																</p>
															</div>
														</li>
													))}
												</ul>
											)}
										</section>

										<section className="lg:col-span-2">
											<h3 className="t-eyebrow">Recent attendance</h3>
											{student.recentAttendance.length === 0 ? (
												<p className="t-caption mt-4">Nothing recorded yet.</p>
											) : (
												<ul className="mt-4 space-y-1.5">
													{student.recentAttendance.map((record) => (
														<li
															key={record.id}
															className="flex flex-wrap items-center justify-between gap-2 rounded-field bg-secondary/60 px-3 py-2.5"
														>
															<div className="min-w-0">
																<p className="text-[13.5px] font-medium text-foreground">
																	{record.courseCode} · {record.courseName}
																</p>
																<p className="t-caption mt-0.5">
																	{record.date
																		? new Date(record.date).toLocaleDateString()
																		: "—"}
																	{record.note ? ` · ${record.note}` : ""}
																</p>
															</div>
															<span
																className={`${
																	STATUS_STYLES[record.status] ??
																	"rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground"
																}`}
															>
																{record.status}
															</span>
														</li>
													))}
												</ul>
											)}
										</section>

										<section className="lg:col-span-1">
											<h3 className="t-eyebrow inline-flex items-center gap-2">
												<Bus className="h-3.5 w-3.5" aria-hidden="true" />
												Transport
											</h3>
											{student.transport.length === 0 ? (
												<p className="t-caption mt-4">No bus route assigned.</p>
											) : (
												<ul className="mt-4 space-y-2">
													{student.transport.map((entry) => (
														<li
															key={entry.id}
															className="rounded-field border border-border px-3 py-2.5"
														>
															<p className="text-[13.5px] font-medium text-foreground">
																{entry.route}
																{entry.code ? ` (${entry.code})` : ""}
															</p>
															<p className="t-caption mt-0.5">
																{entry.direction.toLowerCase()}
																{entry.stop ? ` · ${entry.stop}` : ""}
															</p>
															{entry.pickupTime || entry.dropoffTime ? (
																<p className="t-caption mt-0.5">
																	{entry.pickupTime
																		? `Pickup ${entry.pickupTime}`
																		: ""}
																	{entry.pickupTime && entry.dropoffTime
																		? " · "
																		: ""}
																	{entry.dropoffTime
																		? `Drop ${entry.dropoffTime}`
																		: ""}
																</p>
															) : null}
															{entry.driverName ? (
																<p className="t-caption mt-0.5">
																	{entry.driverName}
																	{entry.driverPhone
																		? ` · ${entry.driverPhone}`
																		: ""}
																	{entry.vehicleNumber
																		? ` · ${entry.vehicleNumber}`
																		: ""}
																</p>
															) : null}
														</li>
													))}
												</ul>
											)}
										</section>
									</div>

									<footer className="border-t border-rule-soft px-6 py-3 text-right">
										<span className="t-meta">
											Read-only view · updated by the school office
										</span>
									</footer>
								</article>
							</Reveal>
						</Section>
					);
				})
			)}
		</PageFrame>
	);
}
