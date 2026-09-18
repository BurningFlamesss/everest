import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { CircleCheck, CircleX, Ellipsis, MailPlus, ShieldCheck, UserPlus } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { ROLE_DESCRIPTION, ROLE_LABEL, ROLE_PERMISSIONS, useAuth } from "./router-B6FnglFX.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { avatarFor, relativeTime } from "./format-BBWmN55e.mjs";
import { db, latency, matches, nowIso, paginate, persist, sortRows, uid } from "./db-CgIvOOZs.mjs";
import { recordAudit } from "./audit-CP1EiZ6i.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { FilterBar } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { pushNotification } from "./notifications-CeHCmL3l.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { DataTable } from "./DataTable-DqD2icP_.mjs";
import { PersonCell } from "./PersonCell-gZRimwsh.mjs";
import { Switch } from "./switch-CJPnMvU4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/users-BwyxAKT7.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
async function listUsers(query = {}) {
	await latency();
	const { search = "", role = "all", accountStatus = "all", invitationStatus = "all", sort = "name", dir = "asc", page = 1, pageSize = 10 } = query;
	const filtered = db().users.filter((u) => {
		if (!matches(search, u.name, u.email, u.profileLabel)) return false;
		if (role !== "all" && u.role !== role) return false;
		if (accountStatus !== "all" && u.accountStatus !== accountStatus) return false;
		if (invitationStatus !== "all" && u.invitationStatus !== invitationStatus) return false;
		return true;
	});
	return paginate(sortRows(filtered, sort, dir), page, pageSize);
}
async function listRoleDefinitions() {
	await latency(180);
	return db().roles.map((r) => ({
		...r,
		label: ROLE_LABEL[r.key],
		permissions: ROLE_PERMISSIONS[r.key],
		userCount: db().users.filter((u) => u.role === r.key).length
	}));
}
async function listSessions() {
	await latency(180);
	return db().sessions;
}
async function revokeSession(id, actor) {
	await latency(260);
	const index = db().sessions.findIndex((s) => s.id === id);
	if (index === -1) return;
	const [removed] = db().sessions.splice(index, 1);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "session",
		resourceId: removed.id,
		resourceLabel: `${removed.userName} · ${removed.device}`,
		summary: `Revoked a session for ${removed.userName} (${removed.device})`
	});
}
async function createUser(input, actor) {
	await latency(480);
	if (db().users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase())) throw new Error("A user with that email already exists.");
	const user = {
		id: uid("usr"),
		name: input.name.trim(),
		email: input.email.trim().toLowerCase(),
		avatarUrl: avatarFor(input.name),
		role: input.role,
		profileType: input.profileType,
		profileId: input.profileId,
		profileLabel: input.profileLabel,
		accountStatus: input.sendInvitation ? "invited" : "active",
		invitationStatus: input.sendInvitation ? "pending" : "none",
		invitedAt: input.sendInvitation ? nowIso() : void 0,
		invitationExpiresAt: input.sendInvitation ? new Date(Date.now() + 6048e5).toISOString() : void 0,
		emailVerified: false,
		branchId: input.branchId,
		createdAt: nowIso()
	};
	db().users.unshift(user);
	persist();
	recordAudit({
		actor,
		action: input.sendInvitation ? "invited" : "created",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: input.sendInvitation ? `Invited ${user.name} as ${ROLE_LABEL[user.role]}` : `Created a ${ROLE_LABEL[user.role]} account for ${user.name}`
	});
	pushNotification({
		kind: "user",
		title: input.sendInvitation ? "Invitation sent" : "User created",
		body: `${user.name} · ${ROLE_LABEL[user.role]}`,
		severity: "info",
		href: "/users",
		actorName: actor.name
	});
	return user;
}
async function resendInvitation(id, actor) {
	await latency(340);
	const user = db().users.find((u) => u.id === id);
	if (!user) throw new Error("User not found");
	user.invitationStatus = "pending";
	user.accountStatus = "invited";
	user.invitedAt = nowIso();
	user.invitationExpiresAt = new Date(Date.now() + 6048e5).toISOString();
	persist();
	recordAudit({
		actor,
		action: "invited",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: `Re-sent the account invitation to ${user.name}`
	});
	return user;
}
async function revokeInvitation(id, actor) {
	await latency(300);
	const user = db().users.find((u) => u.id === id);
	if (!user) throw new Error("User not found");
	user.invitationStatus = "revoked";
	user.accountStatus = "deactivated";
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: `Revoked ${user.name}’s pending invitation`
	});
	return user;
}
/** Simulates the invitee completing activation from their email link. */
async function simulateActivation(id, actor) {
	await latency(420);
	const user = db().users.find((u) => u.id === id);
	if (!user) throw new Error("User not found");
	user.invitationStatus = "activated";
	user.accountStatus = "active";
	user.emailVerified = true;
	user.lastActiveAt = nowIso();
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: `${user.name} activated their account`
	});
	pushNotification({
		kind: "invitation",
		title: "Invitation accepted",
		body: `${user.name} activated their ${ROLE_LABEL[user.role]} account.`,
		severity: "success",
		href: "/users"
	});
	return user;
}
async function setAccountStatus(id, status, actor) {
	await latency(300);
	const user = db().users.find((u) => u.id === id);
	if (!user) throw new Error("User not found");
	user.accountStatus = status;
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: `Set ${user.name}’s account to ${status}`
	});
	return user;
}
async function changeUserRole(id, role, actor) {
	await latency(300);
	const user = db().users.find((u) => u.id === id);
	if (!user) throw new Error("User not found");
	const previous = user.role;
	user.role = role;
	const profile = db().staff.find((s) => s.id === user.profileId);
	if (profile) profile.role = role;
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "user",
		resourceId: user.id,
		resourceLabel: user.name,
		summary: `Changed ${user.name}’s role from ${ROLE_LABEL[previous]} to ${ROLE_LABEL[role]}`
	});
	return user;
}
async function deleteUser(id, actor) {
	await latency(300);
	const index = db().users.findIndex((u) => u.id === id);
	if (index === -1) return;
	const [removed] = db().users.splice(index, 1);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "user",
		resourceId: removed.id,
		resourceLabel: removed.name,
		summary: `Deleted the user account for ${removed.name}`
	});
}
function userSummary() {
	const users = db().users;
	return {
		total: users.length,
		active: users.filter((u) => u.accountStatus === "active").length,
		pendingInvites: users.filter((u) => u.invitationStatus === "pending").length,
		expiredInvites: users.filter((u) => u.invitationStatus === "expired").length,
		unverified: users.filter((u) => !u.emailVerified).length
	};
}
var INVITE_STEPS = [
	{
		label: "Create user",
		detail: "Name, email and campus"
	},
	{
		label: "Assign role",
		detail: "Determines console access"
	},
	{
		label: "Link profile",
		detail: "Staff, student or guardian"
	},
	{
		label: "Send invitation",
		detail: "Expires after 7 days"
	},
	{
		label: "User activates",
		detail: "Sets a password and verifies email"
	}
];
function UsersPage() {
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const searchParams = useSearch({ strict: false }) || {};
	const tab = searchParams.tab ?? "directory";
	const [search, setSearch] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("all");
	const [accountStatus, setStatus] = (0, import_react.useState)("all");
	const [invitationStatus, setInvitationStatus] = (0, import_react.useState)("all");
	const [page, setPage] = (0, import_react.useState)(1);
	const [createOpen, setCreateOpen] = (0, import_react.useState)(searchParams.new === "1");
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		role: "staff",
		profileType: "staff",
		profileLabel: "",
		branchId: "branch_main",
		sendInvitation: true
	});
	const [confirm, setConfirm] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		if (searchParams.new === "1") setCreateOpen(true);
	}, [searchParams.new]);
	const summary = (0, import_react.useMemo)(() => userSummary(), []);
	const query = {
		search,
		role,
		accountStatus,
		invitationStatus: tab === "invitations" && invitationStatus === "all" ? "pending" : invitationStatus,
		page,
		pageSize: 10
	};
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["users", query],
		queryFn: () => listUsers(query)
	});
	const { data: roles = [] } = useQuery({
		queryKey: ["roles"],
		queryFn: listRoleDefinitions
	});
	const { data: sessions = [] } = useQuery({
		queryKey: ["sessions"],
		queryFn: listSessions
	});
	const invalidate = () => {
		qc.invalidateQueries({ queryKey: ["users"] });
		qc.invalidateQueries({ queryKey: ["roles"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
	};
	const createMutation = useMutation({
		mutationFn: () => createUser(form, actor),
		onSuccess: (user) => {
			toast.success(form.sendInvitation ? `Invitation sent to ${user.email}` : `${user.name} created`);
			setCreateOpen(false);
			setForm({
				...form,
				name: "",
				email: "",
				profileLabel: ""
			});
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const action = useMutation({
		mutationFn: async ({ kind, id, nextRole }) => {
			if (kind === "resend") return resendInvitation(id, actor);
			if (kind === "revoke") return revokeInvitation(id, actor);
			if (kind === "activate") return simulateActivation(id, actor);
			if (kind === "suspend") return setAccountStatus(id, "suspended", actor);
			if (kind === "reactivate") return setAccountStatus(id, "active", actor);
			if (kind === "role" && nextRole) return changeUserRole(id, nextRole, actor);
			if (kind === "delete") return deleteUser(id, actor);
		},
		onSuccess: () => {
			toast.success("User updated");
			setConfirm(null);
			invalidate();
		},
		onError: (e) => toast.error(e.message)
	});
	const sessionMutation = useMutation({
		mutationFn: (id) => revokeSession(id, actor),
		onSuccess: () => {
			toast.success("Session revoked");
			setConfirm(null);
			qc.invalidateQueries({ queryKey: ["sessions"] });
		}
	});
	const columns = [
		{
			key: "name",
			header: "User account",
			sortable: true,
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PersonCell, {
				name: user.name,
				subtitle: user.email,
				avatarUrl: user.avatarUrl
			})
		},
		{
			key: "role",
			header: "Role",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: "normal",
				label: ROLE_LABEL[user.role],
				dot: false
			})
		},
		{
			key: "profile",
			header: "Linked profile",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm capitalize text-foreground",
					children: user.profileType
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-xs text-muted-foreground",
					children: user.profileLabel ?? "—"
				})]
			})
		},
		{
			key: "accountStatus",
			header: "Account",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: user.accountStatus,
				testId: `user-account-status-${user.id}`
			})
		},
		{
			key: "invitationStatus",
			header: "Invitation",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
					value: user.invitationStatus,
					testId: `user-invite-status-${user.id}`
				}), user.invitationExpiresAt && user.invitationStatus === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "text-[11px] text-muted-foreground",
					children: ["expires ", relativeTime(user.invitationExpiresAt)]
				})]
			})
		},
		{
			key: "verified",
			header: "Email",
			align: "center",
			render: (user) => user.emailVerified ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
				className: "mx-auto h-4 w-4 text-success",
				"aria-label": "Verified"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, {
				className: "mx-auto h-4 w-4 text-muted-foreground",
				"aria-label": "Unverified"
			})
		},
		{
			key: "lastActiveAt",
			header: "Last active",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-xs text-muted-foreground",
				children: user.lastActiveAt ? relativeTime(user.lastActiveAt) : "Never"
			})
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "User actions",
					"data-testid": `user-actions-${user.id}`,
					className: "rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-ring",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
				align: "end",
				className: "w-52 bg-popover",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
						className: "text-xs",
						children: user.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
					user.invitationStatus === "pending" || user.invitationStatus === "expired" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							"data-testid": `user-resend-${user.id}`,
							onClick: () => action.mutate({
								kind: "resend",
								id: user.id
							}),
							children: "Resend invitation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							"data-testid": `user-simulate-activation-${user.id}`,
							onClick: () => action.mutate({
								kind: "activate",
								id: user.id
							}),
							children: "Simulate activation"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							"data-testid": `user-revoke-${user.id}`,
							onClick: () => setConfirm({
								title: "Revoke this invitation?",
								description: `${user.name} will no longer be able to activate their account with the current link.`,
								label: "Revoke invitation",
								destructive: true,
								run: () => action.mutate({
									kind: "revoke",
									id: user.id
								})
							}),
							children: "Revoke invitation"
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
						"data-testid": `user-invite-${user.id}`,
						onClick: () => action.mutate({
							kind: "resend",
							id: user.id
						}),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MailPlus, { className: "mr-2 h-3.5 w-3.5" }), " Send new invitation"]
					}),
					can("users.manage") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						[
							"super_admin",
							"admin",
							"staff"
						].filter((r) => r !== user.role).map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
							onClick: () => action.mutate({
								kind: "role",
								id: user.id,
								nextRole: r
							}),
							children: ["Make ", ROLE_LABEL[r]]
						}, r)),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
						user.accountStatus === "suspended" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => action.mutate({
								kind: "reactivate",
								id: user.id
							}),
							children: "Reactivate account"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							onClick: () => setConfirm({
								title: "Suspend this account?",
								description: `${user.name} will be signed out and blocked from signing in until reactivated.`,
								label: "Suspend account",
								run: () => action.mutate({
									kind: "suspend",
									id: user.id
								})
							}),
							children: "Suspend account"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
							className: "text-destructive focus:text-destructive",
							onClick: () => setConfirm({
								title: "Delete this user account?",
								description: "The linked staff, student or guardian profile is kept, but console access is removed permanently.",
								label: "Delete account",
								destructive: true,
								run: () => action.mutate({
									kind: "delete",
									id: user.id
								})
							}),
							children: "Delete account"
						})
					] })
				]
			})] })
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "users-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "People",
				title: "Users & Roles",
				description: "User accounts are separate from staff, student and guardian profiles. Roles decide what each account can do.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "users-total",
						children: [summary.total, " accounts"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.pendingInvites, " pending invitations"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [summary.unverified, " unverified emails"] })
				] }),
				actions: can("users.manage") ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "users-create",
					onClick: () => setCreateOpen(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserPlus, { className: "h-3.5 w-3.5" }), " Create user"]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				value: tab,
				onValueChange: (value) => {
					navigate({
						search: (prev) => {
							const next = { ...prev };
							next.tab = value;
							return next;
						},
						replace: true
					});
				},
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "mb-4 h-9",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "directory",
								className: "text-xs",
								"data-testid": "users-tab-directory",
								children: "Directory"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "roles",
								className: "text-xs",
								"data-testid": "users-tab-roles",
								children: "Roles & permissions"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "invitations",
								className: "text-xs",
								"data-testid": "users-tab-invitations",
								children: "Invitations"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "sessions",
								className: "text-xs",
								"data-testid": "users-tab-sessions",
								children: "Sessions"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "directory",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
							testId: "users-filters",
							search,
							onSearchChange: (v) => {
								setSearch(v);
								setPage(1);
							},
							placeholder: "Search by name, email or linked profile…",
							filters: [{
								key: "role",
								label: "Role",
								value: role,
								options: [
									{
										value: "all",
										label: "All roles"
									},
									{
										value: "super_admin",
										label: "Super Admin"
									},
									{
										value: "admin",
										label: "Admin"
									},
									{
										value: "staff",
										label: "Staff"
									},
									{
										value: "student",
										label: "Student"
									},
									{
										value: "guardian",
										label: "Guardian"
									}
								],
								onChange: (v) => {
									setRole(v);
									setPage(1);
								}
							}, {
								key: "status",
								label: "Account",
								value: accountStatus,
								options: [
									{
										value: "all",
										label: "Any account"
									},
									{
										value: "active",
										label: "Active"
									},
									{
										value: "invited",
										label: "Invited"
									},
									{
										value: "suspended",
										label: "Suspended"
									},
									{
										value: "deactivated",
										label: "Deactivated"
									}
								],
								onChange: (v) => {
									setStatus(v);
									setPage(1);
								}
							}],
							onReset: () => {
								setSearch("");
								setRole("all");
								setStatus("all");
							}
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							testId: "users-table",
							columns,
							rows: data?.rows ?? [],
							rowId: (u) => u.id,
							rowTestId: (u) => `user-row-${u.id}`,
							loading: isLoading,
							error: isError ? true : void 0,
							onRetry: () => refetch(),
							page: data?.page ?? 1,
							total: data?.total ?? 0,
							onPageChange: setPage,
							empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								icon: ShieldCheck,
								title: "No accounts match these filters",
								description: "Try a different role or account status, or create a new user and send them an invitation.",
								primaryLabel: can("users.manage") ? "Create user" : void 0,
								onPrimary: () => setCreateOpen(true),
								testId: "users-empty"
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "roles",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid gap-4 lg:grid-cols-2",
							children: roles.map((definition) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Panel, {
								title: ROLE_LABEL[definition.key],
								description: `${definition.userCount} accounts`,
								testId: `role-card-${definition.key}`,
								actions: definition.isSystem ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
									value: "internal",
									label: "System role",
									dot: false
								}) : null,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted-foreground",
									children: ROLE_DESCRIPTION[definition.key]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-1.5",
									children: [definition.permissions.slice(0, 14).map((permission) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground",
										children: permission
									}, permission)), definition.permissions.length > 14 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[11px] text-muted-foreground",
										children: [
											"+",
											definition.permissions.length - 14,
											" more"
										]
									})]
								})]
							}, definition.key))
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "invitations",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Invitation workflow",
								description: "How an account moves from creation to activation",
								className: "mb-4",
								testId: "invitation-workflow",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
									className: "grid gap-2 sm:grid-cols-5",
									children: INVITE_STEPS.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "rounded-lg border border-hairline bg-surface-2 p-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "num text-[10px] font-semibold text-primary",
												children: ["STEP ", index + 1]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-xs font-medium text-foreground",
												children: step.label
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-0.5 text-[11px] text-muted-foreground",
												children: step.detail
											})
										]
									}, step.label))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
								testId: "invitations-filters",
								search,
								onSearchChange: setSearch,
								placeholder: "Search invitations…",
								filters: [{
									key: "invitation",
									label: "Invitation",
									value: invitationStatus,
									options: [
										{
											value: "all",
											label: "Pending"
										},
										{
											value: "pending",
											label: "Pending"
										},
										{
											value: "activated",
											label: "Activated"
										},
										{
											value: "expired",
											label: "Expired"
										},
										{
											value: "revoked",
											label: "Revoked"
										}
									],
									onChange: setInvitationStatus
								}],
								onReset: () => {
									setSearch("");
									setInvitationStatus("all");
								}
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
								testId: "invitations-table",
								columns: columns.filter((c) => c.key !== "profile" && c.key !== "lastActiveAt"),
								rows: data?.rows ?? [],
								rowId: (u) => u.id,
								loading: isLoading,
								page: data?.page ?? 1,
								total: data?.total ?? 0,
								onPageChange: setPage,
								empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
									icon: MailPlus,
									title: "No invitations here",
									description: "Invitations you send appear here until they are activated, expire or are revoked.",
									testId: "invitations-empty"
								})
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "sessions",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DataTable, {
							testId: "sessions-table",
							columns: [
								{
									key: "userName",
									header: "User",
									render: (session) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm text-foreground",
										children: session.userName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: session.browser
									})] })
								},
								{
									key: "device",
									header: "Device",
									render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm text-foreground",
										children: s.device
									})
								},
								{
									key: "location",
									header: "Location",
									render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: s.location
									})
								},
								{
									key: "ip",
									header: "IP",
									render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "num font-mono text-xs text-muted-foreground",
										children: s.ip
									})
								},
								{
									key: "lastActiveAt",
									header: "Last active",
									render: (s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground",
										children: [relativeTime(s.lastActiveAt), s.current && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "ml-1.5 text-success",
											children: "· this device"
										})]
									})
								},
								{
									key: "actions",
									header: "",
									align: "right",
									render: (session) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "outline",
										size: "sm",
										className: "h-7 text-xs",
										disabled: session.current,
										"data-testid": `session-revoke-${session.id}`,
										onClick: () => setConfirm({
											title: "Revoke this session?",
											description: `${session.userName} will be signed out on ${session.device}.`,
											label: "Revoke session",
											destructive: true,
											run: () => sessionMutation.mutate(session.id)
										}),
										children: "Revoke"
									})
								}
							],
							rows: sessions,
							rowId: (s) => s.id,
							total: sessions.length,
							pageSize: sessions.length || 1,
							empty: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
								title: "No active sessions",
								description: "Sessions appear here when users sign in to the console."
							})
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: createOpen,
				onOpenChange: (open) => {
					setCreateOpen(open);
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
					className: "bg-popover sm:max-w-lg",
					"data-testid": "user-create-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Create user account"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "The account is separate from the person's profile. Assign a role, then send an invitation so they can set their own password." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Full name *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.name,
										"data-testid": "user-name",
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
										children: "Email *"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.email,
										"data-testid": "user-email",
										onChange: (e) => setForm({
											...form,
											email: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-3 sm:grid-cols-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs",
											children: "Role"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.role,
											onValueChange: (v) => setForm({
												...form,
												role: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"data-testid": "user-role",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
												className: "bg-popover",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "super_admin",
														children: "Super Admin"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "admin",
														children: "Admin"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "staff",
														children: "Staff"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "student",
														children: "Student"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "guardian",
														children: "Guardian"
													})
												]
											})]
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
											className: "text-xs",
											children: "Profile type"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: form.profileType,
											onValueChange: (v) => setForm({
												...form,
												profileType: v
											}),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
												"data-testid": "user-profile-type",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
												className: "bg-popover",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "staff",
														children: "Staff"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "student",
														children: "Student"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "guardian",
														children: "Guardian"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
														value: "none",
														children: "No profile"
													})
												]
											})]
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										children: "Profile description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										value: form.profileLabel,
										placeholder: "e.g. Registrar · Administration",
										"data-testid": "user-profile-label",
										onChange: (e) => setForm({
											...form,
											profileLabel: e.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between rounded-lg border border-hairline bg-surface-2 p-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground",
										children: "Send invitation now"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "The invitation link expires after 7 days."
									})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
										checked: form.sendInvitation,
										onCheckedChange: (checked) => setForm({
											...form,
											sendInvitation: checked
										}),
										"data-testid": "user-send-invitation"
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setCreateOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							"data-testid": "user-create-save",
							disabled: !form.name || !form.email || createMutation.isPending,
							onClick: () => createMutation.mutate(),
							children: createMutation.isPending ? "Creating…" : form.sendInvitation ? "Create & invite" : "Create account"
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
				busy: action.isPending || sessionMutation.isPending,
				onConfirm: () => confirm?.run(),
				testId: "users-confirm"
			})
		]
	});
}
var SplitComponent = UsersPage;
//#endregion
export { SplitComponent as component };
