import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
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
		<PageFrame testId="my-classes-page">
			<PageHeader
				testId="my-classes-page-header"
				eyebrow="Staff workspace"
				title="My classes today"
				subtitle="Your courses, today's timetable and the registers still waiting to be taken."
			/>

			{!data ? (
				<div className="mt-9">
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
							<p className="t-caption mt-5">
								No timetable slots today. Use the time for planning and marking.
							</p>
						) : (
							<Reveal delay={STAGGER}>
								<ul className="mt-6 divide-y divide-rule-soft">
									{data.todaySlots.map((slot) => (
										<li
											key={slot.id}
											className="flex flex-wrap items-center justify-between gap-3 py-4"
										>
											<div className="min-w-0">
												<p className="text-[14px] font-medium text-foreground">
													{slot.course.code} · {slot.course.name}
												</p>
												<p className="t-meta mt-1">
													{slot.startsAt}–{slot.endsAt}
													{slot.classroom ? ` · ${slot.classroom.name}` : ""}
												</p>
											</div>
											<Button variant="link" size="sm" asChild>
												<Link to="/admin/attendance">Take attendance</Link>
											</Button>
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
							<p className="t-caption mt-5">
								No courses are assigned to you yet. An administrator can assign
								you from Academics.
							</p>
						) : (
							<Reveal delay={STAGGER}>
								<ul className="mt-6 divide-y divide-rule-soft">
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
