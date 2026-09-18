import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, Briefcase, CalendarDays, Mail, MailPlus, MapPin, Phone } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { ROLE_LABEL, useAuth } from "./router-dKngB4cM.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { formatDate } from "./format-BBWmN55e.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { listClasses, listCourses } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { getStaff, inviteStaff } from "./staff---BJ4xh4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff._id-CCPsz8Xa.js
var import_jsx_runtime = require_jsx_runtime();
function StaffProfilePage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor, can } = useAuth();
	const { data: member, isLoading } = useQuery({
		queryKey: ["staff", id],
		queryFn: () => getStaff(id)
	});
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const { data: courses = [] } = useQuery({
		queryKey: ["courses"],
		queryFn: () => listCourses()
	});
	const inviteMutation = useMutation({
		mutationFn: () => inviteStaff(id, actor),
		onSuccess: () => {
			toast.success("Invitation sent");
			qc.invalidateQueries({ queryKey: ["staff", id] });
			qc.invalidateQueries({ queryKey: ["users"] });
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!member) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Staff member not found",
			description: "This record may have been removed from the directory.",
			primaryLabel: "Back to directory",
			onPrimary: () => navigate("/admin/staff")
		})
	});
	const assignedClasses = classes.filter((c) => member.assignedClassIds.includes(c.id) || c.classTeacherId === member.id);
	const assignedCourses = courses.filter((c) => member.assignedCourseIds.includes(c.id) || c.teacherIds.includes(member.id));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "staff-profile-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "mb-3 gap-1.5 text-xs",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/staff",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Staff directory"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel mb-5 p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: member.avatarUrl,
							alt: "",
							className: "h-16 w-16 shrink-0 rounded-xl border border-hairline"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
											className: "font-display text-xl font-semibold tracking-[-0.02em] text-foreground",
											"data-testid": "staff-name",
											children: [
												member.firstName,
												" ",
												member.lastName
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: member.employmentStatus,
											testId: "staff-profile-status"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: "internal",
											label: ROLE_LABEL[member.role],
											dot: false
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										member.designation,
										" · ",
										member.department
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num flex items-center gap-1.5 font-mono",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Briefcase, { className: "h-3.5 w-3.5" }),
												" ",
												member.employeeId
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "h-3.5 w-3.5" }),
												" ",
												member.email
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }),
												" ",
												member.phone
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }),
												" Joined ",
												formatDate(member.joiningDate)
											]
										})
									]
								})
							]
						}),
						can("staff.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							className: "gap-1.5",
							"data-testid": "staff-profile-invite",
							disabled: inviteMutation.isPending,
							onClick: () => inviteMutation.mutate(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "h-3.5 w-3.5" }), " Invite to console"]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "employment",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
								className: "mb-4 h-9",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "employment",
										className: "text-xs",
										"data-testid": "staff-tab-employment",
										children: "Employment"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "assignments",
										className: "text-xs",
										"data-testid": "staff-tab-assignments",
										children: "Assignments"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
										value: "personal",
										className: "text-xs",
										"data-testid": "staff-tab-personal",
										children: "Personal"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "employment",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Employment record",
									testId: "staff-employment-panel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid gap-4 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Employee ID",
												value: member.employeeId,
												mono: true
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Designation",
												value: member.designation
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Department",
												value: member.department
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Employment type",
												value: member.employmentType.replace(/_/g, " ")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Joining date",
												value: formatDate(member.joiningDate)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Experience",
												value: `${member.experienceYears} years`
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Qualification",
												value: member.qualification
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Campus",
												value: member.branchId === "branch_main" ? "Main Campus" : "Riverside Campus"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Attendance",
												value: `${member.attendanceRate}%`
											})
										]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "assignments",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "Classes",
										description: `${assignedClasses.length} assigned`,
										bodyClassName: "p-2",
										testId: "staff-classes-panel",
										children: assignedClasses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "divide-y divide-hairline",
											children: assignedClasses.map((cls) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center gap-3 px-2 py-2.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
														to: `/admin/classes/${cls.id}`,
														className: "text-sm text-foreground hover:text-primary",
														children: cls.name
													}),
													cls.classTeacherId === member.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
														value: "normal",
														label: "Class teacher",
														dot: false
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "num ml-auto text-xs text-muted-foreground",
														children: [
															cls.studentCount,
															" students · Room ",
															cls.roomNo
														]
													})
												]
											}, cls.id))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
											compact: true,
											title: "No classes assigned",
											description: "Assign this staff member as a class teacher or subject teacher."
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "Subjects",
										description: `${assignedCourses.length} taught`,
										bodyClassName: "p-2",
										testId: "staff-courses-panel",
										children: assignedCourses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
											className: "divide-y divide-hairline",
											children: assignedCourses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
												className: "flex items-center gap-3 px-2 py-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
													to: `/admin/courses/${course.id}`,
													className: "text-sm text-foreground hover:text-primary",
													children: course.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num ml-auto font-mono text-xs text-muted-foreground",
													children: course.code
												})]
											}, course.id))
										}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
											compact: true,
											title: "No subjects assigned",
											description: "Subject allocations appear here once the timetable is set."
										})
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "personal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Personal information",
									testId: "staff-personal-panel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid gap-4 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Gender",
												value: member.gender === "male" ? "Male" : "Female"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Date of birth",
												value: member.dateOfBirth
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Phone",
												value: member.phone
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Email",
												value: member.email
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Address",
												value: member.address
											})
										]
									})
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "space-y-4 lg:sticky lg:top-20 lg:self-start",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "At a glance",
						testId: "staff-snapshot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Console role",
									value: ROLE_LABEL[member.role]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Class teacher",
									value: member.isClassTeacher ? "Yes" : "No"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Documents",
									value: `${member.documents.length} on file`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Location",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "flex items-center gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }), member.address]
									})
								})
							]
						})
					})
				})]
			})
		]
	});
}
var SplitComponent = StaffProfilePage;
//#endregion
export { SplitComponent as component };
