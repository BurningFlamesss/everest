import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ClipboardCheck, DoorOpen, Users } from "../_libs/lucide-react.mjs";
import { useQuery } from "../_libs/tanstack__react-query.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { getClassDetail } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes._id-DNwK4TXy.js
var import_jsx_runtime = require_jsx_runtime();
var DAYS = [
	"Mon",
	"Tue",
	"Wed",
	"Thu",
	"Fri"
];
function ClassDetailPage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const { can } = useAuth();
	const { data, isLoading } = useQuery({
		queryKey: ["class-detail", id],
		queryFn: () => getClassDetail(id)
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Class not found",
			description: "This class may have been removed for the current academic year.",
			primaryLabel: "Back to classes",
			onPrimary: () => navigate("/admin/classes")
		})
	});
	const { cls, teacher, students, courses, attendance } = data;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "class-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "mb-3 gap-1.5 text-xs",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/classes",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Classes"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel mb-5 p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "font-display text-xl font-semibold tracking-[-0.02em] text-foreground",
							"data-testid": "class-name",
							children: cls.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DoorOpen, { className: "h-3.5 w-3.5" }),
										" Room ",
										cls.roomNo
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "flex items-center gap-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3.5 w-3.5" }),
										" ",
										cls.studentCount,
										" of ",
										cls.capacity,
										" seats"
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Academic year 2025 – 2026" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: cls.branchId === "branch_main" ? "Main Campus" : "Riverside Campus" })
							]
						})]
					}), can("attendance.mark") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						className: "gap-1.5",
						asChild: true,
						"data-testid": "class-mark-attendance",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: `/admin/attendance?class=${cls.id}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardCheck, { className: "h-3.5 w-3.5" }), " Mark attendance"]
						})
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "students",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "mb-4 h-9",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "students",
										className: "text-xs",
										"data-testid": "class-tab-students",
										children: "Students"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "subjects",
										className: "text-xs",
										"data-testid": "class-tab-subjects",
										children: "Subjects"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "schedule",
										className: "text-xs",
										"data-testid": "class-tab-schedule",
										children: "Schedule"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "students",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Class list",
									description: `${students.length} students`,
									bodyClassName: "p-2",
									testId: "class-students-panel",
									children: students.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-hairline",
										children: students.slice().sort((a, b) => a.rollNo - b.rollNo).map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 px-2 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num w-6 shrink-0 text-xs text-muted-foreground",
													children: student.rollNo
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
													name: `${student.firstName} ${student.lastName}`,
													subtitle: student.admissionNo,
													avatarUrl: student.avatarUrl,
													to: `/admin/students/${student.id}`,
													mono: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "num ml-auto shrink-0 text-xs text-muted-foreground",
													children: [student.attendanceRate, "%"]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: student.status })
											]
										}, student.id))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										compact: true,
										title: "No students in this class",
										description: "Transfer or enroll students to populate the class list."
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "subjects",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Subjects taught",
									bodyClassName: "p-2",
									testId: "class-subjects-panel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-hairline",
										children: courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 px-2 py-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary font-mono text-[10px] text-muted-foreground",
													children: course.code.split("-")[0]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: `/admin/courses/${course.id}`,
														className: "block truncate text-sm text-foreground hover:text-primary",
														children: course.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-xs text-muted-foreground",
														children: course.department
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "num text-xs text-muted-foreground",
													children: [course.weeklyHours, "h/week"]
												})
											]
										}, course.id))
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "schedule",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Weekly timetable",
									testId: "class-schedule-panel",
									bodyClassName: "p-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid gap-3 sm:grid-cols-5",
										children: DAYS.map((day) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "eyebrow-label mb-1.5",
											children: day
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "space-y-1.5",
											children: cls.schedule.filter((period) => period.day === day).map((period) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "rounded-md border border-hairline bg-surface-2 p-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "num text-[10px] text-muted-foreground",
														children: [
															period.start,
															" – ",
															period.end
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "mt-0.5 truncate text-xs font-medium text-foreground",
														children: period.courseName
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-[11px] text-muted-foreground",
														children: period.staffName
													})
												]
											}, period.id))
										})] }, day))
									})
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4 lg:sticky lg:top-20 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Class teacher",
							testId: "class-teacher-panel",
							children: teacher ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: teacher.avatarUrl,
									alt: "",
									className: "h-10 w-10 rounded-lg border border-hairline"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/admin/staff/${teacher.id}`,
										className: "block truncate text-sm font-medium text-foreground hover:text-primary",
										children: [
											teacher.firstName,
											" ",
											teacher.lastName
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "truncate text-xs text-muted-foreground",
										children: [
											teacher.designation,
											" · ",
											teacher.department
										]
									})]
								})]
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								compact: true,
								title: "No class teacher assigned yet",
								description: "Nominate a member of staff to oversee this class."
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
							title: "Attendance today",
							testId: "class-attendance-panel",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "num font-display text-2xl font-semibold text-foreground",
								children: [attendance.rate, "%"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 space-y-2",
								children: [
									{
										label: "Present",
										value: attendance.present,
										className: "bg-present"
									},
									{
										label: "Late",
										value: attendance.late,
										className: "bg-late"
									},
									{
										label: "Excused",
										value: attendance.excused,
										className: "bg-excused"
									},
									{
										label: "Absent",
										value: attendance.absent,
										className: "bg-absent"
									}
								].map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-xs",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("h-1.5 w-1.5 rounded-full", row.className) }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: row.label
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "num ml-auto font-medium text-foreground",
											children: row.value
										})
									]
								}, row.label))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							title: "Class details",
							testId: "class-meta-panel",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Grade",
										value: cls.grade
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Section",
										value: cls.section
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Room",
										value: cls.roomNo,
										mono: true
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Capacity",
										value: `${cls.studentCount} / ${cls.capacity}`
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
										label: "Subjects",
										value: String(courses.length)
									})
								]
							})
						})
					]
				})]
			})
		]
	});
}
var SplitComponent = ClassDetailPage;
//#endregion
export { SplitComponent as component };
