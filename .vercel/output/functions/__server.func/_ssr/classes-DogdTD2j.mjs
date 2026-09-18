import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { GalleryVerticalEnd, Plus } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { PanelSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { createClass, listClasses } from "./academics-BoJkVxby.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { listStaff } from "./staff---BJ4xh4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/classes-DogdTD2j.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClassesPage() {
	const { actor, can } = useAuth();
	useNavigate();
	const qc = useQueryClient();
	const [search, setSearch] = (0, import_react.useState)("");
	const [grade, setGrade] = (0, import_react.useState)("all");
	const [branch, setBranch] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		grade: "Grade 6",
		section: "D",
		classTeacherId: "",
		roomNo: "104",
		capacity: 32,
		branchId: "branch_main",
		academicYearId: "ay_2025"
	});
	const { data: classes = [], isLoading } = useQuery({
		queryKey: ["classes", {
			search,
			grade,
			branch
		}],
		queryFn: () => listClasses({
			search,
			grade,
			branchId: branch
		})
	});
	const { data: staff } = useQuery({
		queryKey: ["staff", "all"],
		queryFn: () => listStaff({ pageSize: 100 })
	});
	const grades = (0, import_react.useMemo)(() => Array.from(new Set(classes.map((c) => c.grade))).sort(), [classes]);
	const teachers = staff?.rows ?? [];
	const createMutation = useMutation({
		mutationFn: () => createClass(form, actor),
		onSuccess: (cls) => {
			toast.success(`${cls.name} created`);
			setOpen(false);
			qc.invalidateQueries({ queryKey: ["classes"] });
		},
		onError: (e) => toast.error(e.message)
	});
	const grouped = classes.reduce((acc, cls) => {
		acc[cls.grade] = acc[cls.grade] ? [...acc[cls.grade], cls] : [cls];
		return acc;
	}, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "classes-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Academics",
				title: "Classes & Sections",
				description: "Every grade and section for the 2025 – 2026 academic year, with class teachers and occupancy.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					"data-testid": "classes-count",
					children: [classes.length, " classes"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [classes.reduce((sum, c) => sum + c.studentCount, 0), " enrolled students"] })] }),
				actions: can("classes.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "classes-add",
					onClick: () => setOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "h-3.5 w-3.5" }), " New class"]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "classes-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search by class name or room…",
				filters: [{
					key: "grade",
					label: "Grade",
					value: grade,
					options: toOptions(grades, "All grades"),
					onChange: setGrade
				}, {
					key: "branch",
					label: "Campus",
					value: branch,
					options: [
						{
							value: "all",
							label: "All campuses"
						},
						{
							value: "branch_main",
							label: "Main Campus"
						},
						{
							value: "branch_riverside",
							label: "Riverside Campus"
						}
					],
					onChange: setBranch,
					width: "w-[170px]"
				}],
				onReset: () => {
					setSearch("");
					setGrade("all");
					setBranch("all");
				}
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-3",
				children: [
					0,
					1,
					2,
					3,
					4,
					5
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-24" }, i))
			}) : classes.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: GalleryVerticalEnd,
					title: "No classes found",
					description: "Create a class to start assigning students, subjects and a class teacher.",
					primaryLabel: can("classes.manage") ? "New class" : void 0,
					onPrimary: () => setOpen(true),
					testId: "classes-empty"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-6",
				children: Object.entries(grouped).map(([gradeName, group]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2.5 flex items-center gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-sm font-semibold text-foreground",
							children: gradeName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-hairline" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "num text-xs text-muted-foreground",
							children: [group.reduce((sum, c) => sum + c.studentCount, 0), " students"]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
					children: group.map((cls) => {
						const teacher = teachers.find((t) => t.id === cls.classTeacherId);
						const occupancy = Math.round(cls.studentCount / cls.capacity * 100);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: `/admin/classes/${cls.id}`,
							"data-testid": `class-card-${cls.id}`,
							className: "panel group p-4 transition-colors hover:border-primary/35 focus-ring",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "font-display text-sm font-semibold text-foreground",
											children: cls.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "num mt-0.5 text-xs text-muted-foreground",
											children: ["Room ", cls.roomNo]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num rounded-md bg-surface-2 px-2 py-1 text-xs font-medium text-foreground",
										children: [
											cls.studentCount,
											"/",
											cls.capacity
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block h-1.5 overflow-hidden rounded-full bg-surface-2",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("block h-full rounded-full", occupancy > 92 ? "bg-accent" : "bg-primary"),
											style: { width: `${Math.min(100, occupancy)}%` }
										})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex items-center gap-2",
									children: [teacher ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
										src: teacher.avatarUrl,
										alt: "",
										className: "h-6 w-6 rounded-full border border-hairline"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 truncate text-xs text-muted-foreground",
										children: [
											teacher.firstName,
											" ",
											teacher.lastName
										]
									})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "No class teacher assigned"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "num ml-auto shrink-0 text-xs text-muted-foreground",
										children: [cls.attendanceRate, "% attendance"]
									})]
								})
							]
						}, cls.id);
					})
				})] }, gradeName))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-lg",
					"data-testid": "class-form-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Create class"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Core subjects are attached automatically and can be edited afterwards." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Grade"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.grade,
										"data-testid": "class-grade",
										onChange: (e) => setForm({
											...form,
											grade: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Section"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.section,
										"data-testid": "class-section",
										onChange: (e) => setForm({
											...form,
											section: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Room"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.roomNo,
										"data-testid": "class-room",
										onChange: (e) => setForm({
											...form,
											roomNo: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Capacity"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										value: form.capacity,
										"data-testid": "class-capacity",
										onChange: (e) => setForm({
											...form,
											capacity: Number(e.target.value)
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5 sm:col-span-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Class teacher"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.classTeacherId,
										onValueChange: (v) => setForm({
											...form,
											classTeacherId: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "class-teacher",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Choose a teacher" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: teachers.slice(0, 40).map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
												value: t.id,
												children: [
													t.firstName,
													" ",
													t.lastName,
													" · ",
													t.department
												]
											}, t.id))
										})]
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "class-form-save",
							disabled: createMutation.isPending,
							onClick: () => createMutation.mutate(),
							children: createMutation.isPending ? "Creating…" : "Create class"
						})] })
					]
				})
			})
		]
	});
}
var SplitComponent = ClassesPage;
//#endregion
export { SplitComponent as component };
