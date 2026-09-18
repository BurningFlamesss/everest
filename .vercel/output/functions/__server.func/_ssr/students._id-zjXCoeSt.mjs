import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, BadgeCheck, Bus, CalendarDays, Download, FileText, GraduationCap, MailPlus, MapPin, Pencil, Phone, Trash2, UserMinus } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Separator } from "./separator-CW0Ij8xK.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { downloadTextFile, formatCurrency, formatDate, formatDateTime, toCsv } from "./format-BBWmN55e.mjs";
import { listAudit } from "./audit-CP1EiZ6i.mjs";
import "./PageHeader-CM0cVttf.mjs";
import { KeyValue, Panel } from "./Panel-DSd1zziT.mjs";
import { Timeline } from "./Timeline-D_bg-_gg.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { getClassDetail, getStudentAttendance, listClasses } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { deleteStudent, getStudent, inviteGuardian, setStudentStatus } from "./students-IDW3j9qD.mjs";
import { StudentFormDialog } from "./StudentFormDialog-Bg3c7z-Q.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/students._id-zjXCoeSt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var TABS = [
	{
		key: "personal",
		label: "Personal"
	},
	{
		key: "academic",
		label: "Academic"
	},
	{
		key: "guardian",
		label: "Guardian"
	},
	{
		key: "attendance",
		label: "Attendance"
	},
	{
		key: "courses",
		label: "Courses"
	},
	{
		key: "documents",
		label: "Documents"
	},
	{
		key: "activity",
		label: "Activity"
	}
];
function StudentProfilePage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor, can } = useAuth();
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	const { data: student, isLoading } = useQuery({
		queryKey: ["student", id],
		queryFn: () => getStudent(id)
	});
	const { data: attendance } = useQuery({
		queryKey: ["student-attendance", id],
		queryFn: () => getStudentAttendance(id),
		enabled: Boolean(student)
	});
	const { data: classes = [] } = useQuery({
		queryKey: ["classes"],
		queryFn: () => listClasses()
	});
	const { data: classDetail } = useQuery({
		queryKey: ["class-detail", student?.classId],
		queryFn: () => getClassDetail(student.classId),
		enabled: Boolean(student?.classId)
	});
	const { data: activity = [] } = useQuery({
		queryKey: [
			"audit",
			"student",
			id
		],
		queryFn: () => listAudit({
			search: student ? `${student.firstName} ${student.lastName}` : "",
			limit: 12
		}),
		enabled: Boolean(student)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["student", id] });
		qc.invalidateQueries({ queryKey: ["students"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const statusMutation = useMutation({
		mutationFn: (next) => setStudentStatus(id, next, actor),
		onSuccess: (updated) => {
			toast.success(`Status changed to ${updated.status}`);
			setConfirm(null);
			invalidate();
		}
	});
	const inviteMutation = useMutation({
		mutationFn: () => inviteGuardian(id, actor),
		onSuccess: (updated) => {
			toast.success(`Invitation sent to ${updated.guardian.name}`);
			invalidate();
		}
	});
	const deleteMutation = useMutation({
		mutationFn: () => deleteStudent(id, actor),
		onSuccess: () => {
			toast.success("Student record deleted");
			navigate("/admin/students");
		}
	});
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (!student) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			title: "Student not found",
			description: "This record may have been deleted or the link is out of date.",
			primaryLabel: "Back to register",
			onPrimary: () => navigate("/admin/students"),
			testId: "student-not-found"
		})
	});
	const fullName = `${student.firstName} ${student.lastName}`;
	const exportRecord = () => {
		downloadTextFile(`${student.admissionNo}.csv`, toCsv([{
			admissionNo: student.admissionNo,
			name: fullName,
			grade: student.grade,
			section: student.section,
			rollNo: student.rollNo,
			status: student.status,
			dateOfBirth: student.dateOfBirth,
			guardian: student.guardian.name,
			guardianPhone: student.guardian.phone,
			guardianEmail: student.guardian.email,
			attendanceRate: student.attendanceRate,
			feeBalance: student.feeBalance
		}]));
		toast.success("Student record exported");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "student-profile-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "ghost",
				size: "sm",
				className: "mb-3 gap-1.5 text-xs",
				asChild: true,
				"data-testid": "student-back",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/admin/students",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Student register"]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel mb-5 p-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col gap-4 sm:flex-row sm:items-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: student.avatarUrl,
							alt: "",
							className: "h-16 w-16 shrink-0 rounded-xl border border-hairline object-cover"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
											className: "font-display text-xl font-semibold tracking-[-0.02em] text-foreground",
											"data-testid": "student-name",
											children: fullName
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: student.status,
											testId: "student-profile-status"
										}),
										student.guardian.invited && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-[11px] text-success",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, { className: "h-3 w-3" }), " Guardian invited"]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "num mt-1 font-mono text-xs text-muted-foreground",
									children: student.admissionNo
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3.5 w-3.5" }),
												" ",
												student.grade,
												" · ",
												student.section,
												" · Roll ",
												student.rollNo
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, { className: "h-3.5 w-3.5" }),
												" ",
												student.guardian.phone
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPin, { className: "h-3.5 w-3.5" }),
												" ",
												student.city
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3.5 w-3.5" }),
												" Admitted ",
												formatDate(student.admissionDate)
											]
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								onClick: exportRecord,
								"data-testid": "student-export",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
							}), can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								"data-testid": "student-invite-guardian",
								disabled: inviteMutation.isPending,
								onClick: () => inviteMutation.mutate(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "h-3.5 w-3.5" }), " Invite guardian"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								size: "sm",
								className: "gap-1.5",
								"data-testid": "student-edit",
								onClick: () => setEditOpen(true),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
							})] })]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "min-w-0 lg:col-span-2",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
						defaultValue: "personal",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
								className: "mb-4 h-9 w-full justify-start overflow-x-auto",
								children: TABS.map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
									value: tab.key,
									className: "text-xs",
									"data-testid": `student-tab-${tab.key}`,
									children: tab.label
								}, tab.key))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "personal",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Personal information",
									testId: "student-personal-panel",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
										className: "grid gap-4 sm:grid-cols-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Full name",
												value: fullName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Date of birth",
												value: formatDate(student.dateOfBirth)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Gender",
												value: student.gender === "male" ? "Male" : "Female"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Blood group",
												value: student.bloodGroup
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Nationality",
												value: student.nationality
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "House",
												value: student.houseName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Email",
												value: student.email
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Phone",
												value: student.phone
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Emergency contact",
												value: student.emergencyContact
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
												label: "Address",
												value: `${student.address}, ${student.city}`
											})
										]
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "academic",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "Academic information",
										testId: "student-academic-panel",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "grid gap-4 sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Grade",
													value: student.grade
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Section",
													value: student.section
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Roll number",
													value: String(student.rollNo),
													mono: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Class teacher",
													value: classDetail?.teacher ? `${classDetail.teacher.firstName} ${classDetail.teacher.lastName}` : "—"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Room",
													value: classDetail?.cls.roomNo,
													mono: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Academic year",
													value: "2025 – 2026"
												})
											]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
										title: "Admission information",
										testId: "student-admission-panel",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "grid gap-4 sm:grid-cols-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Admission number",
													value: student.admissionNo,
													mono: true
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Admission date",
													value: formatDate(student.admissionDate)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Admission year",
													value: String(student.admissionYear)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Campus",
													value: student.branchId === "branch_main" ? "EEBSS Main Campus" : "Riverside Campus"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Record created",
													value: formatDateTime(student.createdAt)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Last updated",
													value: formatDateTime(student.updatedAt)
												})
											]
										})
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "guardian",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
									title: "Guardian information",
									testId: "student-guardian-panel",
									actions: can("students.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "h-7 gap-1.5 text-xs",
										onClick: () => inviteMutation.mutate(),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "h-3.5 w-3.5" }), " Invite to portal"]
									}) : null,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-start gap-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid h-10 w-10 place-items-center rounded-lg bg-secondary text-xs font-semibold text-muted-foreground",
													children: student.guardian.name.split(" ").map((p) => p[0]).join("")
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-sm font-medium text-foreground",
													children: student.guardian.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-xs text-muted-foreground",
													children: [
														student.guardian.relation,
														" · ",
														student.guardian.occupation ?? "—"
													]
												})] }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "ml-auto",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
														value: student.guardian.invited ? "activated" : "none",
														label: student.guardian.invited ? "Portal access" : "Not invited"
													})
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-4" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
											className: "grid gap-4 sm:grid-cols-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Phone",
													value: student.guardian.phone
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Email",
													value: student.guardian.email
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Emergency contact",
													value: student.emergencyContact
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
													label: "Address",
													value: `${student.address}, ${student.city}`
												})
											]
										})
									]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "attendance",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
									title: "Attendance",
									description: `${attendance?.records.length ?? 0} recorded school days`,
									testId: "student-attendance-panel",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid grid-cols-2 gap-3 sm:grid-cols-4",
										children: [
											{
												label: "Present",
												value: attendance?.present ?? 0,
												className: "text-success"
											},
											{
												label: "Late",
												value: attendance?.late ?? 0,
												className: "text-accent"
											},
											{
												label: "Excused",
												value: attendance?.excused ?? 0,
												className: "text-info"
											},
											{
												label: "Absent",
												value: attendance?.absent ?? 0,
												className: "text-destructive"
											}
										].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-lg border border-hairline bg-surface-2 p-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-[11px] text-muted-foreground",
												children: item.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: cn("num mt-0.5 text-lg font-semibold", item.className),
												children: item.value
											})]
										}, item.label))
									}), attendance?.records.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-4 divide-y divide-hairline",
										children: attendance.records.slice(0, 10).map((record) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "num w-24 shrink-0 text-xs text-muted-foreground",
													children: formatDate(record.date)
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: record.state }),
												record.note && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "truncate text-xs text-muted-foreground",
													children: record.note
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-auto shrink-0 text-[11px] text-muted-foreground",
													children: record.markedBy
												})
											]
										}, record.id))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										compact: true,
										title: "No attendance recorded yet",
										description: "Attendance appears here once the class register has been submitted."
									})]
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "courses",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Enrolled subjects",
									testId: "student-courses-panel",
									bodyClassName: "p-2",
									children: classDetail?.courses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-hairline",
										children: classDetail.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
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
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "truncate text-xs text-muted-foreground",
														children: [
															course.department,
															" · ",
															course.weeklyHours,
															"h/week"
														]
													})]
												}),
												course.isElective && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
													value: "internal",
													label: "Elective",
													dot: false
												})
											]
										}, course.id))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										compact: true,
										title: "No subjects assigned",
										description: "Assign subjects to this class to populate the student's timetable."
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "documents",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Documents",
									description: "Admission and verification paperwork",
									testId: "student-documents-panel",
									bodyClassName: "p-2",
									children: student.documents.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "divide-y divide-hairline",
										children: student.documents.map((document) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 px-2 py-2.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid h-8 w-8 shrink-0 place-items-center rounded-md bg-secondary",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "h-3.5 w-3.5 text-muted-foreground" })
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "min-w-0 flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "truncate text-sm text-foreground",
														children: document.name
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "num truncate text-xs text-muted-foreground",
														children: [
															(document.sizeKb / 1024).toFixed(1),
															" MB · uploaded ",
															formatDate(document.uploadedAt)
														]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
													value: document.verified ? "active" : "pending",
													label: document.verified ? "Verified" : "Pending"
												})
											]
										}, document.id))
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										compact: true,
										icon: FileText,
										title: "No documents on file",
										description: "Birth certificates, transcripts and immunisation records will appear here."
									})
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
								value: "activity",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
									title: "Recent activity",
									testId: "student-activity-panel",
									children: activity.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Timeline, { items: activity.map((event) => ({
										id: event.id,
										title: event.summary,
										actor: event.actorName,
										at: event.createdAt,
										chip: event.action.replace(/_/g, " ")
									})) }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
										compact: true,
										title: "No activity recorded",
										description: "Edits and status changes for this student will be listed here."
									})
								})
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "space-y-4 lg:sticky lg:top-20 lg:self-start",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Snapshot",
						testId: "student-snapshot",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between text-xs",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Attendance"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num font-medium text-foreground",
											children: [student.attendanceRate, "%"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 block h-1.5 overflow-hidden rounded-full bg-surface-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("block h-full rounded-full", student.attendanceRate >= 92 ? "bg-success" : student.attendanceRate >= 82 ? "bg-warning" : "bg-destructive"),
											style: { width: `${student.attendanceRate}%` }
										})
									}),
									student.attendanceRate < 82 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-1.5 text-[11px] text-destructive",
										children: "Below the 82% intervention threshold"
									})
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Fee balance",
									value: student.feeBalance > 0 ? formatCurrency(student.feeBalance) : "Settled",
									testId: "student-fee-balance"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Transport",
									value: student.transportRouteId ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/admin/transportation",
										className: "flex items-center gap-1.5 text-primary hover:underline",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bus, { className: "h-3.5 w-3.5" }), " Route assigned"]
									}) : "Not using transport"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyValue, {
									label: "Class",
									value: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: `/admin/classes/${student.classId}`,
										className: "text-primary hover:underline",
										children: [
											student.grade,
											" · ",
											student.section
										]
									})
								})
							]
						})
					}), can("students.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
						title: "Status & lifecycle",
						testId: "student-lifecycle",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "w-full justify-start gap-2 text-xs",
									"data-testid": "student-graduate",
									onClick: () => setConfirm({
										title: "Graduate this student?",
										description: `${fullName} will be marked as graduated and removed from active registers.`,
										label: "Graduate",
										run: () => statusMutation.mutate("graduated")
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "h-3.5 w-3.5" }), " Graduate student"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "w-full justify-start gap-2 text-xs",
									"data-testid": "student-deactivate",
									onClick: () => setConfirm({
										title: "Deactivate this student?",
										description: `${fullName} will lose portal access and be hidden from attendance registers.`,
										label: "Deactivate",
										run: () => statusMutation.mutate("inactive")
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserMinus, { className: "h-3.5 w-3.5" }), " Deactivate"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									className: "w-full justify-start gap-2 text-xs text-destructive",
									"data-testid": "student-delete",
									onClick: () => setConfirm({
										title: "Delete this student record?",
										description: "This permanently removes the student, guardian links and documents. This cannot be undone.",
										label: "Delete permanently",
										destructive: true,
										run: () => deleteMutation.mutate()
									}),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete record"]
								})
							]
						})
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentFormDialog, {
				open: editOpen,
				student,
				classes,
				branches: [{
					value: "branch_main",
					label: "EEBSS Main Campus"
				}, {
					value: "branch_riverside",
					label: "Riverside Campus"
				}],
				onOpenChange: setEditOpen,
				onSaved: invalidate
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(confirm),
				onOpenChange: (open) => !open && setConfirm(null),
				title: confirm?.title ?? "",
				description: confirm?.description ?? "",
				confirmLabel: confirm?.label,
				destructive: confirm?.destructive,
				busy: statusMutation.isPending || deleteMutation.isPending,
				onConfirm: () => confirm?.run(),
				testId: "student-profile-confirm"
			})
		]
	});
}
var SplitComponent = StudentProfilePage;
//#endregion
export { SplitComponent as component };
