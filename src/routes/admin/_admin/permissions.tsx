import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	RotateCcw,
	Search,
	ShieldCheck,
	ShieldOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
		if (!confirm(`Reset all permission overrides for ${user.name}?`)) return;

		setBusyKey(`${user.id}:reset`);
		const response = await resetUserPermissionsAction({
			data: { userId: user.id },
		});
		setBusyKey("");

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(`Permission overrides cleared for ${user.name}.`);
		await load();
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
		if (!confirm(`Reset ${role.role} permissions to the built-in defaults?`)) {
			return;
		}

		setBusyKey(`role:${role.role}:reset`);
		const response = await resetRolePermissionsAction({
			data: { role: role.role },
		});
		setBusyKey("");

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(`${role.role} permissions reset to the built-in defaults.`);
		await load();
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
					<p className="mt-1 text-sm text-gray-500">
						Roles provide a baseline. Toggle a permission to grant or deny it
						for one person.
					</p>
				</div>
				<label className="relative block w-full max-w-xs">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						placeholder="Search people…"
						className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
					/>
				</label>
			</div>

			<div className="grid gap-3 rounded-2xl border border-gray-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-4">
				{catalog.map((permission) => (
					<div key={permission.key} className="rounded-xl bg-gray-50 p-3">
						<p className="text-xs font-semibold text-gray-900">
							{permission.label}
						</p>
						<p className="mt-1 text-[11px] leading-relaxed text-gray-500">
							{permission.description}
						</p>
					</div>
				))}
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{notice ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					{notice}
				</div>
			) : null}

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<header className="border-b border-gray-200 px-5 py-4">
					<h2 className="font-semibold text-gray-900">Role defaults</h2>
					<p className="mt-1 text-sm text-gray-500">
						Change the baseline every person with a role receives. Individual
						overrides still win. SUPERADMIN always keeps every permission.
					</p>
				</header>

				<div className="divide-y divide-gray-100">
					{roles.map((role) => (
						<div key={role.role} className="p-4">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="flex items-center gap-2">
									<span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
										{role.role}
									</span>
									{role.overrides.length > 0 ? (
										<span className="text-xs text-gray-500">
											{role.overrides.length} customised
										</span>
									) : null}
								</div>
								{role.editable ? (
									<button
										type="button"
										onClick={() => void resetRole(role)}
										disabled={busyKey === `role:${role.role}:reset`}
										className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
									>
										{busyKey === `role:${role.role}:reset` ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<RotateCcw className="h-3.5 w-3.5" />
										)}
										Reset
									</button>
								) : (
									<span className="text-xs font-medium text-gray-400">
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
												"flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
												allowed
													? "border-green-200 bg-green-50/60 hover:bg-green-50"
													: "border-gray-200 bg-gray-50 hover:bg-gray-100",
											)}
										>
											{isBusy ? (
												<Loader2 className="h-4 w-4 shrink-0 animate-spin text-gray-500" />
											) : allowed ? (
												<ShieldCheck className="h-4 w-4 shrink-0 text-green-600" />
											) : (
												<ShieldOff className="h-4 w-4 shrink-0 text-gray-400" />
											)}
											<span className="text-xs font-medium text-gray-900">
												{permission.label}
											</span>
										</button>
									);
								})}
							</div>
						</div>
					))}
				</div>
			</section>

			{isLoading ? (
				<p className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
					<Loader2 className="h-4 w-4 animate-spin" /> Loading people…
				</p>
			) : users.length === 0 ? (
				<p className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
					{search.trim() ? "No matching people." : "No people yet."}
				</p>
			) : (
				<div className="space-y-4">
					{users.map((user) => {
						const hasOverrides = user.overrides.length > 0;

						return (
							<section
								key={user.id}
								className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
							>
								<header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
									<div>
										<p className="font-semibold text-gray-900">{user.name}</p>
										<p className="text-xs text-gray-500">{user.email}</p>
									</div>
									<div className="flex flex-wrap items-center gap-2">
										<span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
											{user.primaryRole ?? "No role"}
										</span>
										{user.roles.length > 1 ? (
											<span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600">
												{user.roles.map((role) => role.role).join(" · ")}
											</span>
										) : null}
										{!user.activatedAt ? (
											<span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
												Invited
											</span>
										) : null}
										{hasOverrides ? (
											<button
												type="button"
												onClick={() => void reset(user)}
												disabled={busyKey === `${user.id}:reset`}
												className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
											>
												{busyKey === `${user.id}:reset` ? (
													<Loader2 className="h-3.5 w-3.5 animate-spin" />
												) : (
													<RotateCcw className="h-3.5 w-3.5" />
												)}
												Reset overrides
											</button>
										) : null}
									</div>
								</header>

								<div className="grid gap-2 p-4 sm:grid-cols-2 xl:grid-cols-4">
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
													"flex items-start gap-2 rounded-xl border p-3 text-left transition-colors disabled:opacity-60",
													allowed
														? "border-green-200 bg-green-50/60 hover:bg-green-50"
														: "border-gray-200 bg-gray-50 hover:bg-gray-100",
												)}
											>
												{isBusy ? (
													<Loader2 className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-gray-500" />
												) : allowed ? (
													<ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
												) : (
													<ShieldOff className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
												)}
												<span className="min-w-0">
													<span className="block text-xs font-semibold text-gray-900">
														{permission.label}
													</span>
													<span className="mt-0.5 block text-[11px] text-gray-500">
														{allowed ? "Allowed" : "Not allowed"}
														{isOverride ? " · override" : " · role default"}
													</span>
												</span>
											</button>
										);
									})}
								</div>
							</section>
						);
					})}

					<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm">
						<p className="text-gray-500">
							{total === 0
								? "No people to show."
								: `Showing ${(page - 1) * pageSize + 1}–${Math.min(
										page * pageSize,
										total,
									)} of ${total}`}
						</p>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPage((current) => Math.max(1, current - 1))}
								disabled={page <= 1 || isLoading}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								<ChevronLeft className="h-3.5 w-3.5" /> Previous
							</button>
							<span className="text-xs text-gray-500">
								Page {page} of {pageCount}
							</span>
							<button
								type="button"
								onClick={() =>
									setPage((current) => Math.min(pageCount, current + 1))
								}
								disabled={page >= pageCount || isLoading}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
							>
								Next <ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
