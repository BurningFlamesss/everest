import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Award, ClipboardCheck, NotebookPen, UserCheck } from "lucide-react";
import { STAGGER } from "#/lib/motion";
import { getMyClassesFn } from "#/packages/academics/staff-server.ts";
import { getViewerFn } from "#/packages/auth/server/viewer.ts";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import { Button } from "#/templates/modern/components/kit";
import { EmptyState } from "#/templates/modern/components/shared/EmptyState";

export const Route = createFileRoute("/_portal/my-classes")({
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
		<PageFrame testId="my-classes-page" dense>
			<PageHeader
				testId="my-classes-page-header"
				eyebrow="Staff workspace"
				title="My classes today"
				subtitle="Your courses, today's timetable and the registers still waiting to be taken."
			/>

			{!data ? (
				<div className="mt-5">
					<EmptyState
						eyebrow="No staff record"
						title="This account has no staff record"
						description="Ask the school office to link your profile."
						testId="my-classes-empty-state"
					/>
				</div>
			) : (
				<>
					<Section testId="my-classes-today">
						<SectionHeading
							eyebrow="Timetable"
							title="Today"
							testId="my-classes-today-title"
						/>
						{data.todaySlots.length === 0 ? (
							<p className="t-caption mt-4">
								No timetable slots today. Use the time for planning and marking.
							</p>
						) : (
							<Reveal delay={STAGGER}>
								<ul className="mt-5 divide-y divide-rule-soft">
									{data.todaySlots.map((slot) => (
										<li
											key={slot.id}
											className="flex flex-wrap items-center justify-between gap-3 py-4"
										>
											<div className="min-w-0">
												<p className="text-[14px] font-medium text-foreground">
													{slot.course
														? `${slot.course.code} · ${slot.course.name}`
														: (slot.class?.name ?? "Class period")}
												</p>
												<p className="t-meta mt-1">
													{slot.startsAt}–{slot.endsAt}
													{slot.classroom ? ` · ${slot.classroom.name}` : ""}
												</p>
											</div>
											<div className="flex items-center gap-2">
												<Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" asChild>
													<Link to="/admin/attendance">
														<UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
														Take attendance
													</Link>
												</Button>
												<Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground" asChild>
													<Link to="/admin/timetable">Routine</Link>
												</Button>
											</div>
										</li>
									))}
								</ul>
							</Reveal>
						)}
					</Section>

					<Section testId="my-classes-courses">
						<SectionHeading
							eyebrow="Teaching load"
							title="My courses"
							testId="my-classes-courses-title"
						/>
						{data.courses.length === 0 ? (
							<p className="t-caption mt-4">
								No courses are assigned to you yet. An administrator can assign
								you from Academics.
							</p>
						) : (
							<Reveal delay={STAGGER}>
								<ul className="mt-5 divide-y divide-rule-soft">
									{data.courses.map((course) => (
										<li
											key={course.id}
											className="flex flex-wrap items-center justify-between gap-3 py-4"
										>
											<div className="min-w-0">
												<p className="text-[14px] font-medium text-foreground">
													{course.code} · {course.name}
												</p>
												<p className="t-caption mt-1">
													{[course.grade, course.section]
														.filter(Boolean)
														.join(" · ") || "No class"}
													{" · "}
													{course._count.enrollments} student
													{course._count.enrollments === 1 ? "" : "s"}
												</p>
											</div>
											<div className="flex flex-wrap items-center gap-2">
												<span
													className={
														course.registerTakenToday
															? "inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-[11px] font-medium text-success"
															: "inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-2.5 py-1 text-[11px] font-medium text-warning"
													}
												>
													<ClipboardCheck className="h-3 w-3" />
													{course.registerTakenToday
														? "Register taken"
														: "Register pending"}
												</span>
												<Button variant="outline" size="sm" className="h-8 gap-1 text-xs" asChild>
													<Link to="/admin/attendance" search={{ courseId: course.id }}>
														<UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
														Attendance
													</Link>
												</Button>
												<Button variant="outline" size="sm" className="h-8 gap-1 text-xs" asChild>
													<Link to="/admin/homework" search={{ courseId: course.id }}>
														<NotebookPen className="h-3.5 w-3.5 text-muted-foreground" />
														Homework
													</Link>
												</Button>
												<Button variant="outline" size="sm" className="h-8 gap-1 text-xs" asChild>
													<Link to="/admin/exams" search={{ courseId: course.id }}>
														<Award className="h-3.5 w-3.5 text-muted-foreground" />
														Marks
													</Link>
												</Button>
											</div>
										</li>
									))}
								</ul>
							</Reveal>
						)}
					</Section>
				</>
			)}
		</PageFrame>
	);
}
