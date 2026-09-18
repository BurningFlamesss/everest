import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { Library, Plus } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { courseDepartments, createCourse, listCourses } from "./academics-BoJkVxby.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/courses-Cn_EJoWS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function CoursesPage() {
	const { actor, can } = useAuth();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [department, setDepartment] = (0, import_react.useState)("all");
	const [elective, setElective] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		code: "",
		name: "",
		department: "Mathematics",
		description: "",
		credits: 4,
		weeklyHours: 4,
		isElective: false,
		teacherIds: []
	});
	const { data: courses = [], isLoading } = useQuery({
		queryKey: ["courses", {
			search,
			department,
			elective
		}],
		queryFn: () => listCourses({
			search,
			department,
			elective
		})
	});
	const createMutation = useMutation({
		mutationFn: () => createCourse(form, actor),
		onSuccess: (course) => {
			toast.success(`${course.name} added to ${course.department}`);
			setOpen(false);
			qc.invalidateQueries({ queryKey: ["courses"] });
		},
		onError: (e) => toast.error(e.message)
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "courses-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Academics",
				title: "Courses & Subjects",
				description: "The academic catalogue with teaching allocations, weekly load and syllabus outlines.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "courses-count",
					children: [courses.length, " subjects"]
				}),
				actions: can("courses.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "courses-add",
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New subject"]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "courses-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search by subject name or code…",
				filters: [{
					key: "department",
					label: "Department",
					value: department,
					options: toOptions(courseDepartments(), "All departments"),
					onChange: setDepartment,
					width: "w-[170px]"
				}, {
					key: "type",
					label: "Type",
					value: elective,
					options: [
						{
							value: "all",
							label: "All types"
						},
						{
							value: "false",
							label: "Core"
						},
						{
							value: "true",
							label: "Elective"
						}
					],
					onChange: setElective,
					width: "w-[130px]"
				}],
				onReset: () => {
					setSearch("");
					setDepartment("all");
					setElective("all");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "courses-table",
				columns: [
					{
						key: "name",
						header: "Subject",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: `/admin/courses/${course.id}`,
								className: "block truncate text-sm font-medium text-foreground hover:text-primary",
								"data-testid": `course-link-${course.id}`,
								children: course.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "num truncate font-mono text-[11px] text-muted-foreground",
								children: course.code
							})]
						})
					},
					{
						key: "department",
						header: "Department",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-sm text-muted-foreground",
							children: course.department
						})
					},
					{
						key: "teachers",
						header: "Teachers",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-sm text-foreground",
							children: course.teacherIds.length
						})
					},
					{
						key: "classes",
						header: "Classes",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "num text-sm text-foreground",
							children: course.classIds.length
						})
					},
					{
						key: "weeklyHours",
						header: "Load",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "num text-xs text-muted-foreground",
							children: [
								course.weeklyHours,
								"h/week · ",
								course.credits,
								" credits"
							]
						})
					},
					{
						key: "type",
						header: "Type",
						render: (course) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
							value: course.isElective ? "internal" : "normal",
							label: course.isElective ? "Elective" : "Core",
							dot: false
						})
					}
				],
				rows: courses,
				rowId: (c) => c.id,
				rowTestId: (c) => `course-row-${c.id}`,
				loading: isLoading,
				total: courses.length,
				pageSize: courses.length || 1,
				footNote: `${courses.length} subjects in the catalogue`,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Library,
					title: "No subjects match",
					description: "Adjust the department or type filter, or add a new subject to the catalogue.",
					primaryLabel: can("courses.manage") ? "New subject" : void 0,
					onPrimary: () => setOpen(true),
					testId: "courses-empty"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-lg",
					"data-testid": "course-form-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Create subject"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Add a subject to the catalogue, then assign teachers and classes." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Subject name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										"data-testid": "course-name",
										onChange: (e) => setForm({
											...form,
											name: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Code *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.code,
										placeholder: "MATH-301",
										"data-testid": "course-code",
										onChange: (e) => setForm({
											...form,
											code: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Department"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.department,
										onValueChange: (v) => setForm({
											...form,
											department: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "course-department",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: courseDepartments().map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: d,
												children: d
											}, d))
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Type"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: String(form.isElective),
										onValueChange: (v) => setForm({
											...form,
											isElective: v === "true"
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "course-type",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "false",
												children: "Core"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "true",
												children: "Elective"
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Weekly hours"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.weeklyHours,
										"data-testid": "course-hours",
										onChange: (e) => setForm({
											...form,
											weeklyHours: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Credits"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.credits,
										"data-testid": "course-credits",
										onChange: (e) => setForm({
											...form,
											credits: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										value: form.description,
										rows: 3,
										"data-testid": "course-description",
										onChange: (e) => setForm({
											...form,
											description: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "course-form-save",
							disabled: !form.name || !form.code || createMutation.isPending,
							onClick: () => createMutation.mutate(),
							children: createMutation.isPending ? "Creating…" : "Create subject"
						})] })
					]
				})
			})
		]
	});
}
var SplitComponent = CoursesPage;
//#endregion
export { SplitComponent as component };
