import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Loader2,
	RotateCcw,
	ShieldCheck,
	ShieldOff,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { FilterBar } from "#/components/common/FilterBar";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils.ts";
import {
	clearPermissionAction,
	clearRolePermissionAction,
	getPermissionsDataFn,
	resetRolePermissionsAction,
	resetUserPermissionsAction,
	setPermissionAction,
	setRolePermissionAction,
} from "#/packages/auth/permissions-server.ts";

export const Route = createFileRoute("/admin/_admin/permissions")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_PERMISSIONS")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminPermissions,
});

interface PermissionDefinition {
	key: string;
	label: string;
	description: string;
}

interface PermissionUser {
	id: string;
	name: string;
	email: string;
	activatedAt: string | Date | null;
	primaryRole: string | null;
	roles: Array<{ role: string; branchId: string | null }>;
	rolePermissions: Array<string>;
	effectivePermissions: Array<string>;
	overrides: Array<{ permission: string; granted: boolean }>;
}

interface RolePermissionSummary {
	role: string;
	editable: boolean;
	defaults: Array<string>;
	effective: Array<string>;
	overrides: Array<{ permission: string; granted: boolean }>;
}

function AdminPermissions() {
	const [users, setUsers] = useState<Array<PermissionUser>>([]);
	const [roles, setRoles] = useState<Array<RolePermissionSummary>>([]);
	const [catalog, setCatalog] = useState<Array<PermissionDefinition>>([]);
	const [search, setSearch] = useState("");
	const [total, setTotal] = useState(0);
	const [page, setPage] = useState(1);
	const [pageCount, setPageCount] = useState(1);
	const [pageSize, setPageSize] = useState(25);
	const [isLoading, setIsLoading] = useState(true);
	const [busyKey, setBusyKey] = useState("");
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [pendingUserReset, setPendingUserReset] =
		useState<PermissionUser | null>(null);
	const [pendingRoleReset, setPendingRoleReset] =
		useState<RolePermissionSummary | null>(null);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getPermissionsDataFn({
			data: { search: search.trim() || undefined, page },
		});

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setUsers(response.users as Array<PermissionUser>);
		setRoles(response.roles as Array<RolePermissionSummary>);
		setCatalog(response.catalog as Array<PermissionDefinition>);
		setTotal(response.total);
		setPage(response.page);
		setPageCount(response.pageCount);
		setPageSize(response.pageSize);
		setError("");
		setIsLoading(false);
	}, [search, page]);

	useEffect(() => {
		// Debounce typing so the list is not refetched on every keystroke.
		const timer = setTimeout(() => {
			void load();
		}, 250);

		return () => clearTimeout(timer);
	}, [load]);

	const toggle = async (
		user: PermissionUser,
		permission: PermissionDefinition,
	) => {
		const currentlyAllowed = user.effectivePermissions.includes(permission.key);
		const roleAllows = user.rolePermissions.includes(permission.key);
		const next = !currentlyAllowed;

		setError("");
		setNotice("");
		setBusyKey(`${user.id}:${permission.key}`);

		const response =
			next === roleAllows
				? await clearPermissionAction({
						data: { userId: user.id, permission: permission.key },
					})
				: await setPermissionAction({
						data: {
							userId: user.id,
							permission: permission.key,
							granted: next,
						},
					});

		setBusyKey("");

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(
			next === roleAllows
				? `${permission.label} reset to the role default for ${user.name}.`
				: `${permission.label} ${next ? "granted to" : "denied for"} ${user.name}.`,
		);
		await load();
	};

	const reset = async (user: PermissionUser) => {
		setBusyKey(`${user.id}:reset`);
		try {
			const response = await resetUserPermissionsAction({
				data: { userId: user.id },
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setNotice(`Permission overrides cleared for ${user.name}.`);
			setPendingUserReset(null);
			await load();
		} catch (resetError) {
			setError(
				resetError instanceof Error
					? resetError.message
					: "Could not reset overrides.",
			);
		} finally {
			setBusyKey("");
		}
	};

	const toggleRole = async (
		role: RolePermissionSummary,
		permission: PermissionDefinition,
		next: boolean,
	) => {
		setError("");
		setNotice("");
		setBusyKey(`role:${role.role}:${permission.key}`);

		const defaultAllows = role.defaults.includes(permission.key);
		const response =
			next === defaultAllows
				? await clearRolePermissionAction({
						data: { role: role.role, permission: permission.key },
					})
				: await setRolePermissionAction({
						data: {
							role: role.role,
							permission: permission.key,
							granted: next,
						},
					});

		setBusyKey("");

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(
			next === defaultAllows
				? `${permission.label} reset to the built-in default for the ${role.role.toLowerCase()} role.`
				: `${permission.label} ${next ? "enabled" : "disabled"} for the ${role.role.toLowerCase()} role.`,
		);
		await load();
	};

	const resetRole = async (role: RolePermissionSummary) => {
		setBusyKey(`role:${role.role}:reset`);
		try {
			const response = await resetRolePermissionsAction({
				data: { role: role.role },
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setNotice(`${role.role} permissions reset to the built-in defaults.`);
			setPendingRoleReset(null);
			await load();
		} catch (resetError) {
			setError(
				resetError instanceof Error
					? resetError.message
					: "Could not reset this role.",
			);
		} finally {
			setBusyKey("");
		}
	};

	return (
		<div data-testid="permissions-page">
			<PageHeader
				eyebrow="System"
				title="Permissions"
				description="Roles provide a baseline. Toggle a permission to grant or deny it for one person."
				meta={
					<>
						<span data-testid="permissions-total-count">
							{total} {total === 1 ? "person" : "people"}
						</span>
						<span data-testid="permissions-catalog-count">
							{catalog.length} permission{catalog.length === 1 ? "" : "s"}
						</span>
					</>
				}
				testId="permissions-page-header"
			/>

			<FilterBar
				testId="permissions-filters"
				search={search}
				onSearchChange={(value) => {
					setSearch(value);
					setPage(1);
				}}
				placeholder="Search people…"
			/>

			<div className="space-y-5">
				<section className="panel p-5" data-testid="permissions-catalog">
					<h2 className="font-display text-sm font-semibold text-foreground">
						Permission catalog
					</h2>
					<div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
						{catalog.map((permission) => (
							<div
								key={permission.key}
								className="rounded-lg border border-hairline bg-surface-1 p-3"
							>
								<p className="text-xs font-semibold text-foreground">
									{permission.label}
								</p>
								<p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
									{permission.description}
								</p>
							</div>
						))}
					</div>
				</section>

				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="permissions-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
						data-testid="permissions-notice-banner"
					>
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{notice}</p>
					</div>
				) : null}

				<Panel
					title="Role defaults"
					description="Change the baseline every person with a role receives. Individual overrides still win. SUPERADMIN always keeps every permission."
					testId="permissions-role-defaults-panel"
					bodyClassName="p-0"
				>
					<div className="divide-y divide-hairline/60">
						{roles.map((role) => (
							<div key={role.role} className="p-4">
								<div className="flex flex-wrap items-center justify-between gap-2">
									<div className="flex items-center gap-2">
										<span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
											{role.role}
										</span>
										{role.overrides.length > 0 ? (
											<span className="text-xs text-muted-foreground">
												{role.overrides.length} customised
											</span>
										) : null}
									</div>
									{role.editable ? (
										<Button
											type="button"
											variant="outline"
											size="sm"
											className="h-7 gap-1 px-2 text-xs"
											onClick={() => setPendingRoleReset(role)}
											disabled={busyKey === `role:${role.role}:reset`}
											data-testid={`permissions-role-reset-${role.role}`}
										>
											{busyKey === `role:${role.role}:reset` ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<RotateCcw className="h-3.5 w-3.5" />
											)}
											Reset
										</Button>
									) : (
										<span className="text-xs font-medium text-muted-foreground/70">
											Fixed
										</span>
									)}
								</div>

								<div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
									{catalog.map((permission) => {
										const allowed = role.effective.includes(permission.key);
										const isBusy =
											busyKey === `role:${role.role}:${permission.key}`;

										return (
											<button
												key={permission.key}
												type="button"
												disabled={!role.editable || isBusy}
												onClick={() =>
													void toggleRole(role, permission, !allowed)
												}
												className={cn(
													"flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60",
													allowed
														? "border-success/25 bg-success/[0.06] text-foreground hover:border-success/40"
														: "border-hairline bg-surface-2 hover:border-primary/35",
												)}
												data-testid={`permissions-role-toggle-${role.role}-${permission.key}`}
											>
												{isBusy ? (
													<Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
												) : allowed ? (
													<ShieldCheck className="h-4 w-4 shrink-0 text-success" />
												) : (
													<ShieldOff className="h-4 w-4 shrink-0 text-muted-foreground" />
												)}
												<span className="text-xs font-medium text-foreground">
													{permission.label}
												</span>
											</button>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</Panel>

				{isLoading ? (
					<div className="panel p-5" data-testid="permissions-users-loading">
						<ListSkeleton rows={5} />
					</div>
				) : users.length === 0 ? (
					<div className="panel">
						<EmptyState
							icon={Users}
							title="No people"
							description={
								search.trim() ? "No matching people." : "No people yet."
							}
							testId="permissions-users-empty"
						/>
					</div>
				) : (
					<div className="space-y-4">
						{users.map((user) => {
							const hasOverrides = user.overrides.length > 0;

							return (
								<Panel
									key={user.id}
									title={user.name}
									description={user.email}
									actions={
										<div className="flex flex-wrap items-center gap-2">
											<span className="rounded-full bg-primary/12 px-2.5 py-1 text-xs font-semibold text-primary">
												{user.primaryRole ?? "No role"}
											</span>
											{user.roles.length > 1 ? (
												<span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
													{user.roles.map((role) => role.role).join(" · ")}
												</span>
											) : null}
											{!user.activatedAt ? (
												<span className="rounded-full bg-warning/18 px-2.5 py-1 text-xs font-medium text-warning">
													Invited
												</span>
											) : null}
											{hasOverrides ? (
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-7 gap-1 px-2 text-xs"
													onClick={() => setPendingUserReset(user)}
													disabled={busyKey === `${user.id}:reset`}
													data-testid={`permissions-user-reset-${user.id}`}
												>
													{busyKey === `${user.id}:reset` ? (
														<Loader2 className="h-3.5 w-3.5 animate-spin" />
													) : (
														<RotateCcw className="h-3.5 w-3.5" />
													)}
													Reset overrides
												</Button>
											) : null}
										</div>
									}
									testId={`permissions-user-${user.id}`}
									bodyClassName="p-4"
								>
									<div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
										{catalog.map((permission) => {
											const allowed = user.effectivePermissions.includes(
												permission.key,
											);
											const roleAllows = user.rolePermissions.includes(
												permission.key,
											);
											const isOverride = allowed !== roleAllows;
											const isBusy = busyKey === `${user.id}:${permission.key}`;

											return (
												<button
													key={permission.key}
													type="button"
													onClick={() => void toggle(user, permission)}
													disabled={isBusy}
													className={cn(
														"flex items-start gap-2 rounded-lg border p-3 text-left transition-colors duration-150 disabled:opacity-60",
														allowed
															? "border-success/25 bg-success/[0.06] hover:border-success/40"
															: "border-hairline bg-surface-2 hover:border-primary/35",
													)}
													data-testid={`permissions-user-toggle-${user.id}-${permission.key}`}
												>
													{isBusy ? (
														<Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
													) : allowed ? (
														<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
													) : (
														<ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
													)}
													<span className="min-w-0">
														<span className="block text-xs font-semibold text-foreground">
															{permission.label}
														</span>
														<span className="mt-0.5 block text-[11px] text-muted-foreground">
															{allowed ? "Allowed" : "Not allowed"}
															{isOverride ? " · override" : " · role default"}
														</span>
													</span>
												</button>
											);
										})}
									</div>
								</Panel>
							);
						})}

						<div
							className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-surface-1 px-4 py-3 text-sm"
							data-testid="permissions-pagination"
						>
							<p className="text-muted-foreground">
								{total === 0
									? "No people to show."
									: `Showing ${(page - 1) * pageSize + 1}–${Math.min(
											page * pageSize,
											total,
										)} of ${total}`}
							</p>
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={() => setPage((current) => Math.max(1, current - 1))}
									disabled={page <= 1 || isLoading}
									data-testid="permissions-prev-page"
								>
									<ChevronLeft className="h-3.5 w-3.5" /> Previous
								</Button>
								<span className="num text-xs text-muted-foreground">
									Page {page} of {pageCount}
								</span>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="h-7 gap-1 px-2 text-xs"
									onClick={() =>
										setPage((current) => Math.min(pageCount, current + 1))
									}
									disabled={page >= pageCount || isLoading}
									data-testid="permissions-next-page"
								>
									Next <ChevronRight className="h-3.5 w-3.5" />
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>

			<ConfirmDialog
				open={!!pendingUserReset}
				onOpenChange={(open) => !open && setPendingUserReset(null)}
				testId="permissions-reset-confirm"
				title="Reset permission overrides"
				description={`Reset all permission overrides for ${pendingUserReset?.name ?? ""}? Their permissions return to the role defaults.`}
				confirmLabel="Reset overrides"
				destructive
				busy={busyKey === `${pendingUserReset?.id}:reset`}
				onConfirm={() => pendingUserReset && void reset(pendingUserReset)}
			/>

			<ConfirmDialog
				open={!!pendingRoleReset}
				onOpenChange={(open) => !open && setPendingRoleReset(null)}
				testId="permissions-role-reset-confirm"
				title="Reset role permissions"
				description={`Reset ${pendingRoleReset?.role ?? ""} permissions to the built-in defaults?`}
				confirmLabel="Reset role"
				destructive
				busy={busyKey === `role:${pendingRoleReset?.role}:reset`}
				onConfirm={() => pendingRoleReset && void resetRole(pendingRoleReset)}
			/>
		</div>
	);
}
