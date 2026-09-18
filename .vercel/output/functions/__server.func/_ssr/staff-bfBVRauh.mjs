import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Download, Ellipsis, MailPlus, UserPlus, Users } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { ROLE_LABEL, useAuth } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { downloadTextFile, formatDate, toCsv } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar, toOptions } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { changeStaffRole, createStaff, inviteStaff, listStaff, setStaffStatus, staffDirectorySummary, staffFilterOptions } from "./staff---BJ4xh4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff-bfBVRauh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY_STAFF = {
	firstName: "",
	lastName: "",
	gender: "female",
	email: "",
	phone: "",
	department: "Mathematics",
	designation: "Teacher",
	employmentType: "full_time",
	joiningDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
	branchId: "branch_main",
	role: "staff",
	qualification: "M.Ed."
};
function StaffPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const [search, setSearch] = (0, import_react.useState)("");
	const [department, setDepartment] = (0, import_react.useState)("all");
	const [designation, setDesignation] = (0, import_react.useState)("all");
	const [status, setStatus] = (0, import_react.useState)("all");
	const [branch, setBranch] = (0, import_react.useState)("all");
	const [sort, setSort] = (0, import_react.useState)({
		key: "firstName",
		dir: "asc"
	});
	const [page, setPage] = (0, import_react.useState)(1);
	const [formOpen, setFormOpen] = (0, import_react.useState)(searchParams.new === "1");
	const [form, setForm] = (0, import_react.useState)(EMPTY_STAFF);
	const [roleTarget, setRoleTarget] = (0, import_react.useState)(null);
	const [nextRole, setNextRole] = (0, import_react.useState)("staff");
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (searchParams.new === "1") setFormOpen(true);
	}, [searchParams.new]);
	const options = (0, import_react.useMemo)(() => staffFilterOptions(), []);
	const summary = (0, import_react.useMemo)(() => staffDirectorySummary(), []);
	const query = {
		search,
		department,
		designation,
		employmentStatus: status,
		branchId: branch,
		sort: sort.key,
		dir: sort.dir,
		page,
		pageSize: 10
	};
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["staff", query],
		queryFn: () => listStaff(query)
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["staff"] });
		qc.invalidateQueries({ queryKey: ["users"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const createMutation = useMutation({
		mutationFn: () => createStaff(form, actor),
		onSuccess: (member) => {
			toast.success(`${member.firstName} ${member.lastName} added to ${member.department}`);
			setFormOpen(false);
			setForm(EMPTY_STAFF);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const statusMutation = useMutation({
		mutationFn: ({ id, next }) => setStaffStatus(id, next, actor),
		onSuccess: (member) => {
			toast.success(`${member.firstName} ${member.lastName} · ${member.employmentStatus.replace(/_/g, " ")}`);
			setConfirm(null);
			invalidate();
		}
	});
	const inviteMutation = useMutation({
		mutationFn: (id) => inviteStaff(id, actor),
		onSuccess: (member) => {
			toast.success(`Invitation sent to ${member.email}`);
			invalidate();
		}
	});
	const roleMutation = useMutation({
		mutationFn: () => changeStaffRole(roleTarget.id, nextRole, actor),
		onSuccess: (member) => {
			toast.success(`${member.firstName} is now ${ROLE_LABEL[member.role]}`);
			setRoleTarget(null);
			invalidate();
		}
	});
	const exportStaff = (rows) => {
		downloadTextFile(`northfield-staff-${Date.now()}.csv`, toCsv(rows.map((s) => ({
			employeeId: s.employeeId,
			name: `${s.firstName} ${s.lastName}`,
			department: s.department,
			designation: s.designation,
			role: s.role,
			status: s.employmentStatus,
			email: s.email,
			phone: s.phone,
			joiningDate: s.joiningDate
		}))));
		toast.success(`Exported ${rows.length} staff records`);
	};
	const columns = [
		{
			key: "firstName",
			header: "Staff member",
			sortable: true,
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: `${member.firstName} ${member.lastName}`,
				subtitle: member.employeeId,
				avatarUrl: member.avatarUrl,
				to: `/staff/${member.id}`,
				mono: true,
				testId: `staff-link-${member.id}`
			})
		},
		{
			key: "designation",
			header: "Role at school",
			sortable: true,
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm text-foreground",
					children: member.designation
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: member.department
				})]
			})
		},
		{
			key: "role",
			header: "App role",
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: "internal",
				label: ROLE_LABEL[member.role],
				dot: false
			})
		},
		{
			key: "joiningDate",
			header: "Joined",
			sortable: true,
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "num text-xs text-muted-foreground",
				children: formatDate(member.joiningDate)
			})
		},
		{
			key: "classes",
			header: "Assignments",
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "num text-xs text-muted-foreground",
				children: [
					member.assignedClassIds.length,
					" classes · ",
					member.assignedCourseIds.length,
					" subjects"
				]
			})
		},
		{
			key: "employmentStatus",
			header: "Status",
			sortable: true,
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: member.employmentStatus,
				testId: `staff-status-${member.id}`
			})
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (member) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Staff actions",
					"data-testid": `staff-actions-${member.id}`,
					className: "rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring",
					onClick: (e) => e.stopPropagation(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-48 bg-popover",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuLabel, {
						className: "text-xs",
						children: [
							member.firstName,
							" ",
							member.lastName
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
						onClick: () => navigate(`/staff/${member.id}`),
						children: "View profile"
					}),
					can("staff.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => inviteMutation.mutate(member.id),
							"data-testid": `staff-invite-${member.id}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "mr-2 h-3.5 w-3.5" }), " Invite to console"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							"data-testid": `staff-change-role-${member.id}`,
							onClick: () => {
								setRoleTarget(member);
								setNextRole(member.role);
							},
							children: "Change role"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => exportStaff([member]),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "mr-2 h-3.5 w-3.5" }), " Export record"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => setConfirm({
								title: "Mark as on leave?",
								description: `${member.firstName} will be excluded from duty rosters until they return.`,
								label: "Set on leave",
								run: () => statusMutation.mutate({
									id: member.id,
									next: "on_leave"
								})
							}),
							children: "Set on leave"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => setConfirm({
								title: "Retire this staff member?",
								description: `${member.firstName} ${member.lastName} will be retired and their console account deactivated.`,
								label: "Retire",
								run: () => statusMutation.mutate({
									id: member.id,
									next: "retired"
								})
							}),
							children: "Retire"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							"data-testid": `staff-terminate-${member.id}`,
							onClick: () => setConfirm({
								title: "Terminate employment?",
								description: `This ends ${member.firstName} ${member.lastName}'s employment and revokes console access immediately.`,
								label: "Terminate",
								destructive: true,
								run: () => statusMutation.mutate({
									id: member.id,
									next: "terminated"
								})
							}),
							children: "Terminate"
						})
					] })
				]
			})] })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "staff-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "People",
				title: "Staff",
				description: "Teaching and support staff with employment status, assignments and console access.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "staff-total-count",
						children: [data?.total ?? 0, " matching records"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						summary.active,
						" active · ",
						summary.onLeave,
						" on leave"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.departments, " departments"] })
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					"data-testid": "staff-export",
					onClick: () => exportStaff(data?.rows ?? []),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "h-3.5 w-3.5" }), " Export"]
				}), can("staff.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "staff-add",
					onClick: () => setFormOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Add staff"]
				})] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "staff-filters",
				search,
				onSearchChange: (v) => {
					setSearch(v);
					setPage(1);
				},
				placeholder: "Search by name, employee ID or designation…",
				filters: [
					{
						key: "department",
						label: "Department",
						value: department,
						options: toOptions(options.departments, "All departments"),
						onChange: (v) => {
							setDepartment(v);
							setPage(1);
						},
						width: "w-[170px]"
					},
					{
						key: "designation",
						label: "Designation",
						value: designation,
						options: toOptions(options.designations, "All designations"),
						onChange: (v) => {
							setDesignation(v);
							setPage(1);
						},
						width: "w-[180px]"
					},
					{
						key: "status",
						label: "Employment",
						value: status,
						options: [
							{
								value: "all",
								label: "Any status"
							},
							{
								value: "active",
								label: "Active"
							},
							{
								value: "probation",
								label: "Probation"
							},
							{
								value: "on_leave",
								label: "On leave"
							},
							{
								value: "retired",
								label: "Retired"
							},
							{
								value: "terminated",
								label: "Terminated"
							}
						],
						onChange: (v) => {
							setStatus(v);
							setPage(1);
						}
					},
					{
						key: "branch",
						label: "Branch",
						value: branch,
						options: [{
							value: "all",
							label: "All campuses"
						}, ...options.branches],
						onChange: (v) => {
							setBranch(v);
							setPage(1);
						},
						width: "w-[170px]"
					}
				],
				onReset: () => {
					setSearch("");
					setDepartment("all");
					setDesignation("all");
					setStatus("all");
					setBranch("all");
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
				testId: "staff-table",
				columns,
				rows: data?.rows ?? [],
				rowId: (m) => m.id,
				rowTestId: (m) => `staff-row-${m.id}`,
				loading: isLoading,
				error: isError ? true : void 0,
				onRetry: () => refetch(),
				onRowClick: (m) => navigate(`/staff/${m.id}`),
				sort,
				onSortChange: setSort,
				page: data?.page ?? 1,
				total: data?.total ?? 0,
				onPageChange: setPage,
				empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Users,
					title: "No staff match these filters",
					description: "Adjust the department or employment filters, or add a new staff member to the directory.",
					primaryLabel: can("staff.manage") ? "Add staff member" : void 0,
					onPrimary: () => setFormOpen(true),
					testId: "staff-empty"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: formOpen,
				onOpenChange: (open) => {
					setFormOpen(open);
					if (!open) navigate({
						search: (prev) => {
							const next = { ...prev };
							delete next.new;
							return next;
						},
						replace: true
					});
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[92vh] overflow-y-auto bg-popover sm:max-w-xl",
					"data-testid": "staff-form-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Add staff member"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "New staff start on probation. Invite them separately to create their console account." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3 sm:grid-cols-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "First name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.firstName,
										"data-testid": "staff-first-name",
										onChange: (e) => setForm({
											...form,
											firstName: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Last name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.lastName,
										"data-testid": "staff-last-name",
										onChange: (e) => setForm({
											...form,
											lastName: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Work email *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.email,
										"data-testid": "staff-email",
										onChange: (e) => setForm({
											...form,
											email: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Phone"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.phone,
										"data-testid": "staff-phone",
										onChange: (e) => setForm({
											...form,
											phone: e.target.value
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
											"data-testid": "staff-department",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
											className: "bg-popover",
											children: options.departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
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
										children: "Designation"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.designation,
										"data-testid": "staff-designation",
										onChange: (e) => setForm({
											...form,
											designation: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Application role"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: form.role,
										onValueChange: (v) => setForm({
											...form,
											role: v
										}),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
											"data-testid": "staff-role",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
											className: "bg-popover",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "staff",
													children: "Staff"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "admin",
													children: "Admin"
												}),
												actor.role === "super_admin" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
													value: "super_admin",
													children: "Super Admin"
												})
											]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Joining date"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: form.joiningDate,
										"data-testid": "staff-joining-date",
										onChange: (e) => setForm({
											...form,
											joiningDate: e.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setFormOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "staff-form-save",
							disabled: !form.firstName || !form.lastName || !form.email || createMutation.isPending,
							onClick: () => createMutation.mutate(),
							children: createMutation.isPending ? "Saving…" : "Add staff member"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(roleTarget),
				onOpenChange: (open) => !open && setRoleTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-md",
					"data-testid": "staff-role-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Change application role"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [
							"This controls what ",
							roleTarget?.firstName,
							" can see and do inside the admin console."
						] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: nextRole,
							onValueChange: (v) => setNextRole(v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
								"data-testid": "staff-role-select",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
								className: "bg-popover",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "staff",
										children: "Staff"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "admin",
										children: "Admin"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "super_admin",
										children: "Super Admin"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setRoleTarget(null),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "staff-role-save",
							disabled: roleMutation.isPending,
							onClick: () => roleMutation.mutate(),
							children: roleMutation.isPending ? "Saving…" : "Update role"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(confirm),
				onOpenChange: (open) => !open && setConfirm(null),
				title: confirm?.title ?? "",
				description: confirm?.description ?? "",
				confirmLabel: confirm?.label,
				destructive: confirm?.destructive,
				busy: statusMutation.isPending,
				onConfirm: () => confirm?.run(),
				testId: "staff-confirm"
			})
		]
	});
}
var SplitComponent = StaffPage;
//#endregion
export { SplitComponent as component };
