import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { BookOpen, Bus, ClipboardCheck, GraduationCap } from "lucide-react";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import { getMyRecordsFn } from "#/packages/records/server.ts";

export const Route = createFileRoute("/my-records")({
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
	PRESENT: "bg-green-100 text-green-700",
	ABSENT: "bg-red-100 text-red-700",
	LATE: "bg-amber-100 text-amber-700",
	EXCUSED: "bg-blue-100 text-blue-700",
};

function MyRecords() {
	const data = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-[#f6f1e8] pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-600">
					My records
				</p>
				<h1 className="mt-4 text-4xl font-bold text-gray-900 md:text-5xl">
					Courses, attendance and transport
				</h1>
				<p className="mt-3 max-w-2xl text-gray-600">
					Everything here is pulled from your own student record. It is
					read-only — contact the school office if something looks wrong.
				</p>
				<div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
					<Link to="/my-results" className="text-red-600 hover:text-red-700">
						Exam results
					</Link>
					<Link to="/my-homework" className="text-red-600 hover:text-red-700">
						Homework
					</Link>
					<Link to="/my-fees" className="text-red-600 hover:text-red-700">
						Fees
					</Link>
				</div>
			</section>

			<section className="space-y-6 px-6 md:px-16">
				{!data.success ? (
					<div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
						{data.error}
					</div>
				) : data.students.length === 0 ? (
					<div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
						<GraduationCap className="mx-auto h-8 w-8 text-gray-300" />
						<p className="mt-3 text-gray-600">
							No student record is linked to this account yet. This page is for
							students and guardians.
						</p>
						<Link
							to="/dashboard"
							className="mt-4 inline-flex text-sm font-semibold text-red-600 hover:text-red-700"
						>
							Back to the dashboard
						</Link>
					</div>
				) : (
					data.students.map((student) => {
						const rate =
							student.attendance.total > 0
								? Math.round(
										(student.attendance.present / student.attendance.total) *
											100,
									)
								: null;

						return (
							<article
								key={student.id}
								className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
							>
								<header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-5">
									<div>
										<h2 className="text-xl font-semibold text-gray-900">
											{student.name}
										</h2>
										<p className="text-xs text-gray-500">{student.email}</p>
									</div>
									<div className="flex flex-wrap gap-2 text-xs">
										{student.grade ? (
											<span className="rounded-full bg-red-50 px-2.5 py-1 font-semibold text-red-700">
												Grade {student.grade}
												{student.section ? ` · ${student.section}` : ""}
											</span>
										) : null}
										{student.rollNo ? (
											<span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
												Roll {student.rollNo}
											</span>
										) : null}
										{student.admissionNo ? (
											<span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-600">
												Adm {student.admissionNo}
											</span>
										) : null}
									</div>
								</header>

								<div className="grid gap-6 p-6 lg:grid-cols-3">
									<section className="lg:col-span-1">
										<h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
											<ClipboardCheck className="h-4 w-4 text-red-500" />
											Attendance
										</h3>
										<dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
											{[
												["Present", student.attendance.present],
												["Absent", student.attendance.absent],
												["Late", student.attendance.late],
												["Excused", student.attendance.excused],
											].map(([label, value]) => (
												<div
													key={label}
													className="rounded-xl bg-gray-50 px-3 py-2"
												>
													<dt className="text-[11px] uppercase tracking-wide text-gray-500">
														{label}
													</dt>
													<dd className="text-lg font-semibold text-gray-900">
														{value}
													</dd>
												</div>
											))}
										</dl>
										<p className="mt-3 text-xs text-gray-500">
											{student.attendance.total === 0
												? "No attendance has been recorded yet."
												: `${rate}% present across ${student.attendance.total} recorded classes.`}
										</p>
									</section>

									<section className="lg:col-span-2">
										<h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
											<BookOpen className="h-4 w-4 text-red-500" />
											Courses
										</h3>
										{student.courses.length === 0 ? (
											<p className="mt-3 text-sm text-gray-500">
												No courses are assigned yet.
											</p>
										) : (
											<ul className="mt-3 divide-y divide-gray-100">
												{student.courses.map((course) => (
													<li
														key={course.id}
														className="flex flex-wrap items-center justify-between gap-2 py-2"
													>
														<div>
															<p className="text-sm font-medium text-gray-900">
																{course.code} · {course.name}
															</p>
															<p className="text-xs text-gray-500">
																{course.teacher ?? "No teacher assigned"}
																{course.classroom
																	? ` · ${course.classroom}`
																	: ""}
															</p>
														</div>
														<div className="text-right text-xs text-gray-500">
															{course.schedule ? (
																<p>{course.schedule}</p>
															) : null}
															<p className="mt-0.5 font-semibold text-gray-600">
																{course.status}
															</p>
														</div>
													</li>
												))}
											</ul>
										)}
									</section>

									<section className="lg:col-span-2">
										<h3 className="text-sm font-semibold text-gray-900">
											Recent attendance
										</h3>
										{student.recentAttendance.length === 0 ? (
											<p className="mt-3 text-sm text-gray-500">
												Nothing recorded yet.
											</p>
										) : (
											<ul className="mt-3 space-y-1.5">
												{student.recentAttendance.map((record) => (
													<li
														key={record.id}
														className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
													>
														<div>
															<p className="font-medium text-gray-900">
																{record.courseCode} · {record.courseName}
															</p>
															<p className="text-xs text-gray-500">
																{new Date(record.date).toLocaleDateString()}
																{record.note ? ` · ${record.note}` : ""}
															</p>
														</div>
														<span
															className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
																STATUS_STYLES[record.status] ??
																"bg-gray-100 text-gray-600"
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
										<h3 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
											<Bus className="h-4 w-4 text-red-500" />
											Transport
										</h3>
										{student.transport.length === 0 ? (
											<p className="mt-3 text-sm text-gray-500">
												No bus route assigned.
											</p>
										) : (
											<ul className="mt-3 space-y-2">
												{student.transport.map((entry) => (
													<li
														key={entry.id}
														className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
													>
														<p className="font-medium text-gray-900">
															{entry.route}
															{entry.code ? ` (${entry.code})` : ""}
														</p>
														<p className="text-xs text-gray-500">
															{entry.direction.toLowerCase()}
															{entry.stop ? ` · ${entry.stop}` : ""}
														</p>
														{entry.pickupTime || entry.dropoffTime ? (
															<p className="mt-1 text-xs text-gray-500">
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
															<p className="mt-1 text-xs text-gray-500">
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

								<footer className="border-t border-gray-200 px-6 py-3 text-right">
									<span className="text-[11px] text-gray-400">
										Read-only view · updated by the school office
									</span>
								</footer>
							</article>
						);
					})
				)}
			</section>
		</main>
	);
}
