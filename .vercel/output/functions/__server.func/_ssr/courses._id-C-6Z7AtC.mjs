import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, BookOpen, Clock } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { getCourseDetail } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/courses._id-C-6Z7AtC.js
var import_jsx_runtime = require_jsx_runtime();
function CourseDetailPage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const { data, isLoading } = useQuery({
		queryKey: ["course-detail", id],
		queryFn: () => getCourseDetail(id)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Subject not found",
			description: "This subject may have been removed from the catalogue.",
			primaryLabel: "Back to catalogue",
			onPrimary: () => navigate("/admin/courses")
		})
	});
	const { course, teachers, classes } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "course-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "mb-3 gap-1.5 text-xs",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/courses",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Courses & Subjects"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "panel mb-5 p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-semibold tracking-[-0.02em] text-foreground",
							"data-testid": "course-name",
							children: course.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							value: course.isElective ? "internal" : "normal",
							label: course.isElective ? "Elective" : "Core",
							dot: false
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "num mt-1 font-mono text-xs text-muted-foreground",
						children: course.code
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground",
						children: course.description
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "h-3.5 w-3.5" }),
									" ",
									course.department
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "flex items-center gap-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "h-3.5 w-3.5" }),
									" ",
									course.weeklyHours,
									" hours per week"
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [course.credits, " credits"] })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-5 lg:col-span-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Syllabus",
						description: `${course.syllabus.length} units`,
						testId: "course-syllabus-panel",
						children: course.syllabus.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
							className: "space-y-3",
							children: course.syllabus.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "rounded-lg border border-hairline bg-surface-2 p-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-sm font-medium text-foreground",
										children: [
											"Unit ",
											unit.unit,
											" · ",
											unit.title
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num shrink-0 text-xs text-muted-foreground",
										children: [unit.hours, "h"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-2 flex flex-wrap gap-1.5",
									children: unit.topics.map((topic) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[11px] text-muted-foreground",
										children: topic
									}, topic))
								})]
							}, unit.unit))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							compact: true,
							title: "No syllabus yet",
							description: "Add units and topics so teachers can plan lessons."
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Classes using this subject",
						bodyClassName: "p-2",
						testId: "course-classes-panel",
						children: classes.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "grid gap-1.5 p-1 sm:grid-cols-3",
							children: classes.map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: `/admin/classes/${cls.id}`,
								className: "block rounded-md border border-hairline bg-surface-2 px-2.5 py-2 text-xs text-foreground transition-colors hover:border-primary/40",
								children: [cls.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "num block text-[11px] text-muted-foreground",
									children: [cls.studentCount, " students"]
								})]
							}) }, cls.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							compact: true,
							title: "Not yet allocated",
							description: "Assign this subject to classes from the class timetable."
						})
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Assigned teachers",
						testId: "course-teachers-panel",
						children: teachers.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3",
							children: teachers.map((teacher) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
								name: `${teacher.firstName} ${teacher.lastName}`,
								subtitle: `${teacher.designation} · ${teacher.department}`,
								avatarUrl: teacher.avatarUrl,
								to: `/admin/staff/${teacher.id}`
							}) }, teacher.id))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							compact: true,
							title: "No teachers assigned yet",
							description: "Assign teaching staff to this subject once the timetable is confirmed."
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Details",
						testId: "course-meta-panel",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Code",
									value: course.code,
									mono: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Department",
									value: course.department
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Credits",
									value: String(course.credits)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Weekly hours",
									value: String(course.weeklyHours)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Type",
									value: course.isElective ? "Elective" : "Core subject"
								})
							]
						})
					})]
				})]
			})
		]
	});
}
var SplitComponent = CourseDetailPage;
//#endregion
export { SplitComponent as component };
