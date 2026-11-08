import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import {
	BookOpen,
	CalendarClock,
	ClipboardCheck,
	GraduationCap,
} from "lucide-react";
import { getMyClassesFn } from "#/packages/academics/staff-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";

export const Route = createFileRoute("/my-classes")({
	beforeLoad: async () => {
		const viewer = await getViewerFn();

		if (!viewer.user) throw redirect({ to: "/login" });

		return { viewer };
	},
	loader: () => getMyClassesFn(),
	component: MyClasses,
});

function MyClasses() {
	const data = Route.useLoaderData();

	return (
		<main className="min-h-screen bg-background pb-20 pl-0 md:ml-72">
			<section className="px-6 py-16 md:px-16">
				<p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
					Staff workspace
				</p>
				<h1 className="mt-4 text-4xl font-bold text-foreground md:text-5xl">
					My classes today
				</h1>
				<p className="mt-3 max-w-2xl text-muted-foreground">
					Your courses, today&apos;s timetable and the registers still waiting
					to be taken.
				</p>
			</section>

			{!data ? (
				<section className="mx-6 rounded-2xl border border-border bg-card p-10 text-center md:mx-16">
					<GraduationCap className="mx-auto h-8 w-8 text-muted-foreground" />
					<p className="mt-3 text-muted-foreground">
						This account has no staff record. Ask the school office to link your
						profile.
					</p>
				</section>
			) : (
				<div className="space-y-6 px-6 md:px-16">
					<section className="rounded-2xl border border-border bg-card p-6">
						<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
							<CalendarClock className="h-5 w-5 text-primary" /> Today
						</h2>
						{data.todaySlots.length === 0 ? (
							<p className="mt-3 text-sm text-muted-foreground">
								No timetable slots today. Use the time for planning and marking.
							</p>
						) : (
							<ul className="mt-3 divide-y divide-border">
								{data.todaySlots.map((slot) => (
									<li
										key={slot.id}
										className="flex flex-wrap items-center justify-between gap-2 py-3"
									>
										<div>
											<p className="font-medium text-foreground">
												{slot.course.code} · {slot.course.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{slot.startsAt}–{slot.endsAt}
												{slot.classroom ? ` · ${slot.classroom.name}` : ""}
											</p>
										</div>
										<Link
											to="/admin/attendance"
											className="text-xs font-semibold text-primary hover:underline"
										>
											Take attendance
										</Link>
									</li>
								))}
							</ul>
						)}
					</section>

					<section className="overflow-hidden rounded-2xl border border-border bg-card">
						<header className="border-b border-border px-6 py-4">
							<h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
								<BookOpen className="h-5 w-5 text-primary" /> My courses
							</h2>
						</header>
						{data.courses.length === 0 ? (
							<p className="p-8 text-center text-sm text-muted-foreground">
								No courses are assigned to you yet. An administrator can assign
								you from Academics.
							</p>
						) : (
							<ul className="divide-y divide-border">
								{data.courses.map((course) => (
									<li
										key={course.id}
										className="flex flex-wrap items-center justify-between gap-3 px-6 py-4"
									>
										<div>
											<p className="font-medium text-foreground">
												{course.code} · {course.name}
											</p>
											<p className="text-xs text-muted-foreground">
												{[course.grade, course.section]
													.filter(Boolean)
													.join(" · ") || "No class"}
												{" · "}
												{course._count.enrollments} student
												{course._count.enrollments === 1 ? "" : "s"}
											</p>
										</div>
										<span
											className={
												course.registerTakenToday
													? "inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-[11px] font-semibold text-green-700"
													: "inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
											}
										>
											<ClipboardCheck className="h-3 w-3" />
											{course.registerTakenToday
												? "Register taken"
												: "Register pending"}
										</span>
									</li>
								))}
							</ul>
						)}
					</section>
				</div>
			)}
		</main>
	);
}
