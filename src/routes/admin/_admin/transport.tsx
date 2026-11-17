import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	Bus,
	CheckCircle2,
	Loader2,
	MapPin,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
	UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { StudentSearchInput } from "#/components/people/StudentSearchInput.tsx";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { cn } from "#/lib/utils.ts";
import {
	createTransportRouteAction,
	createTransportStopAction,
	deleteTransportAssignmentAction,
	deleteTransportRouteAction,
	deleteTransportStopAction,
	getTransportDataFn,
	saveTransportAssignmentAction,
	updateTransportRouteAction,
	updateTransportStopAction,
} from "#/packages/transport/server.ts";

export const Route = createFileRoute("/admin/_admin/transport")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_TRANSPORT")) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminTransport,
});

type Tab = "routes" | "assignments";

interface StopRow {
	id: string;
	routeId: string;
	name: string;
	sortOrder: number;
	pickupTime: string | null;
	dropoffTime: string | null;
}

interface RouteRow {
	id: string;
	name: string;
	code: string | null;
	description: string | null;
	driverName: string | null;
	driverPhone: string | null;
	vehicleNumber: string | null;
	capacity: number | null;
	isActive: boolean;
	stops: Array<StopRow>;
	_count: { assignments: number };
}

interface AssignmentRow {
	id: string;
	direction: string;
	isActive: boolean;
	route: { id: string; name: string; code: string | null };
	stop: { id: string; name: string } | null;
	student: { id: string; user: { name: string; email: string } };
}

const FIELD_CLASS =
	"h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 py-1 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring";

function AdminTransport() {
	const [tab, setTab] = useState<Tab>("routes");
	const [routes, setRoutes] = useState<Array<RouteRow>>([]);
	const [assignments, setAssignments] = useState<Array<AssignmentRow>>([]);
	const [studentPickerKey, setStudentPickerKey] = useState(0);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [assignmentRouteId, setAssignmentRouteId] = useState("");
	const [editingRoute, setEditingRoute] = useState<RouteRow | null>(null);
	const [editingStop, setEditingStop] = useState<StopRow | null>(null);
	const [pendingRouteDelete, setPendingRouteDelete] = useState<RouteRow | null>(
		null,
	);
	const [pendingStopDelete, setPendingStopDelete] = useState<StopRow | null>(
		null,
	);
	const [pendingAssignmentDelete, setPendingAssignmentDelete] =
		useState<AssignmentRow | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getTransportDataFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setRoutes(response.routes as Array<RouteRow>);
		setAssignments(response.assignments as Array<AssignmentRow>);
		setError("");
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createRoute = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const capacity = String(data.get("capacity") ?? "").trim();

		const response = await createTransportRouteAction({
			data: {
				name: String(data.get("name") ?? ""),
				code: String(data.get("code") ?? ""),
				description: String(data.get("description") ?? ""),
				driverName: String(data.get("driverName") ?? ""),
				driverPhone: String(data.get("driverPhone") ?? ""),
				vehicleNumber: String(data.get("vehicleNumber") ?? ""),
				capacity: capacity ? Number(capacity) : null,
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Route created.");
		form.reset();
		await load();
	};

	const addStop = async (
		event: React.FormEvent<HTMLFormElement>,
		route: RouteRow,
	) => {
		event.preventDefault();
		setError("");
		setNotice("");

		const form = event.currentTarget;
		const data = new FormData(form);

		const response = await createTransportStopAction({
			data: {
				routeId: route.id,
				name: String(data.get("name") ?? ""),
				sortOrder: route.stops.length,
				pickupTime: String(data.get("pickupTime") ?? ""),
				dropoffTime: String(data.get("dropoffTime") ?? ""),
			},
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		await load();
	};

	const saveRoute = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingRoute) return;

		setError("");
		setNotice("");
		setIsSubmitting(true);

		const data = new FormData(event.currentTarget);
		const capacity = String(data.get("capacity") ?? "").trim();
		const response = await updateTransportRouteAction({
			data: {
				id: editingRoute.id,
				name: String(data.get("name") ?? ""),
				code: String(data.get("code") ?? ""),
				description: String(data.get("description") ?? ""),
				driverName: String(data.get("driverName") ?? ""),
				driverPhone: String(data.get("driverPhone") ?? ""),
				vehicleNumber: String(data.get("vehicleNumber") ?? ""),
				capacity: capacity ? Number(capacity) : null,
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Route updated.");
		setEditingRoute(null);
		await load();
	};

	const saveStop = async (
		event: React.FormEvent<HTMLFormElement>,
		stop: StopRow,
	) => {
		event.preventDefault();
		setError("");
		setNotice("");

		const data = new FormData(event.currentTarget);
		const sortOrder = Number(data.get("sortOrder"));
		const response = await updateTransportStopAction({
			data: {
				id: stop.id,
				name: String(data.get("name") ?? ""),
				sortOrder: Number.isFinite(sortOrder) ? sortOrder : stop.sortOrder,
				pickupTime: String(data.get("pickupTime") ?? ""),
				dropoffTime: String(data.get("dropoffTime") ?? ""),
			},
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Stop updated.");
		setEditingStop(null);
		await load();
	};

	const removeRoute = async (route: RouteRow) => {
		setIsDeleting(true);
		try {
			const response = await deleteTransportRouteAction({
				data: { id: route.id },
			});

			if (!response.success) setError(response.error);
			else {
				setNotice("Route deleted.");
				setPendingRouteDelete(null);
				await load();
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this route.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const removeStop = async (stop: StopRow) => {
		setIsDeleting(true);
		try {
			const response = await deleteTransportStopAction({
				data: { id: stop.id },
			});

			if (!response.success) setError(response.error);
			else {
				setPendingStopDelete(null);
				await load();
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this stop.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const saveAssignment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);

		const response = await saveTransportAssignmentAction({
			data: {
				routeId: String(data.get("routeId") ?? ""),
				stopId: String(data.get("stopId") ?? "") || null,
				studentId: String(data.get("studentId") ?? ""),
				direction: String(data.get("direction") ?? "BOTH") as "BOTH",
				isActive: true,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Student assignment saved.");
		form.reset();
		setStudentPickerKey((key) => key + 1);
		setAssignmentRouteId("");
		await load();
	};

	const removeAssignment = async (assignment: AssignmentRow) => {
		setIsDeleting(true);
		try {
			const response = await deleteTransportAssignmentAction({
				data: { id: assignment.id },
			});

			if (!response.success) setError(response.error);
			else {
				setNotice("Assignment removed.");
				setPendingAssignmentDelete(null);
				await load();
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not remove this assignment.",
			);
		} finally {
			setIsDeleting(false);
		}
	};

	const selectedRoute = routes.find((route) => route.id === assignmentRouteId);

	return (
		<div data-testid="transport-page">
			<PageHeader
				eyebrow="Operations"
				title="Transport"
				description="Create bus routes, add stops and assign students to a pickup or drop-off."
				meta={
					<>
						<span data-testid="transport-route-count">
							{routes.length} route{routes.length === 1 ? "" : "s"}
						</span>
						<span data-testid="transport-assignment-count">
							{assignments.length} assignment
							{assignments.length === 1 ? "" : "s"}
						</span>
					</>
				}
				actions={
					<Button
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={() => void load()}
						data-testid="transport-refresh"
					>
						<RefreshCw
							className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
						/>
						Refresh
					</Button>
				}
				testId="transport-page-header"
			/>

			<div className="space-y-5">
				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="transport-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
						data-testid="transport-notice-banner"
					>
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{notice}</p>
					</div>
				) : null}

				<Tabs
					value={tab}
					onValueChange={(value: string) => setTab(value as Tab)}
				>
					<TabsList className="h-9" data-testid="transport-tabs">
						<TabsTrigger value="routes" data-testid="transport-tab-routes">
							Routes
						</TabsTrigger>
						<TabsTrigger
							value="assignments"
							data-testid="transport-tab-assignments"
						>
							Assignments
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{tab === "routes" ? (
					<>
						<Panel
							title="New route"
							description="Name the route, then add its stops below once created."
							testId="transport-new-route-panel"
							bodyClassName="p-5"
						>
							<form
								onSubmit={(event) => void createRoute(event)}
								className="grid gap-4 md:grid-cols-2"
							>
								<Input label="Route name" name="name" required />
								<Input label="Route code" name="code" />
								<Input label="Driver name" name="driverName" />
								<Input label="Driver phone" name="driverPhone" />
								<Input label="Vehicle number" name="vehicleNumber" />
								<Input label="Capacity" name="capacity" type="number" min={1} />
								<Textarea
									label="Description"
									name="description"
									className="md:col-span-2"
								/>
								<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
									<input
										type="checkbox"
										name="isActive"
										defaultChecked
										className="h-4 w-4 accent-primary"
									/>{" "}
									Active
								</label>
								<div className="md:col-span-2">
									<SubmitButton
										isSubmitting={isSubmitting}
										label="Create route"
									/>
								</div>
							</form>
						</Panel>

						{editingRoute ? (
							<Panel
								title="Edit route"
								description={`Updating ${editingRoute.name}.`}
								testId="transport-edit-route-panel"
								bodyClassName="p-5"
							>
								<form
									key={editingRoute.id}
									onSubmit={(event) => void saveRoute(event)}
									className="grid gap-4 md:grid-cols-2"
								>
									<Input
										label="Route name"
										name="name"
										defaultValue={editingRoute.name}
										required
									/>
									<Input
										label="Route code"
										name="code"
										defaultValue={editingRoute.code ?? ""}
									/>
									<Input
										label="Driver name"
										name="driverName"
										defaultValue={editingRoute.driverName ?? ""}
									/>
									<Input
										label="Driver phone"
										name="driverPhone"
										defaultValue={editingRoute.driverPhone ?? ""}
									/>
									<Input
										label="Vehicle number"
										name="vehicleNumber"
										defaultValue={editingRoute.vehicleNumber ?? ""}
									/>
									<Input
										label="Capacity"
										name="capacity"
										type="number"
										min={1}
										defaultValue={editingRoute.capacity ?? ""}
									/>
									<Textarea
										label="Description"
										name="description"
										defaultValue={editingRoute.description ?? ""}
										className="md:col-span-2"
									/>
									<label className="flex items-center gap-2 text-sm text-foreground md:col-span-2">
										<input
											type="checkbox"
											name="isActive"
											defaultChecked={editingRoute.isActive}
											className="h-4 w-4 accent-primary"
										/>{" "}
										Active
									</label>
									<div className="flex gap-2 md:col-span-2">
										<Button
											type="submit"
											size="sm"
											className="gap-1.5"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<Loader2 className="h-3.5 w-3.5 animate-spin" />
											) : (
												<Pencil className="h-3.5 w-3.5" />
											)}
											{isSubmitting ? "Saving…" : "Save changes"}
										</Button>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => setEditingRoute(null)}
										>
											Cancel
										</Button>
									</div>
								</form>
							</Panel>
						) : null}

						<section className="space-y-4">
							{isLoading ? (
								<div
									className="panel p-5"
									data-testid="transport-routes-loading"
								>
									<ListSkeleton rows={4} />
								</div>
							) : routes.length === 0 ? (
								<div className="panel">
									<EmptyState
										icon={Bus}
										title="No transport routes"
										description="No transport routes have been created yet."
										testId="transport-routes-empty"
									/>
								</div>
							) : (
								<div className="grid gap-4 xl:grid-cols-2">
									{routes.map((route) => (
										<article
											key={route.id}
											className="panel p-5 transition-colors duration-150 hover:border-primary/35"
											data-testid={`transport-route-${route.id}`}
										>
											<div className="flex flex-wrap items-start justify-between gap-3">
												<div className="min-w-0">
													<h3 className="font-display text-[15px] font-semibold tracking-tight text-foreground">
														{route.name}
														{route.code ? (
															<span className="num ml-2 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
																{route.code}
															</span>
														) : null}
													</h3>
													<p className="mt-0.5 text-xs text-muted-foreground">
														{route.vehicleNumber ?? "No vehicle"} ·{" "}
														{route.driverName ?? "No driver"}
														{route.driverPhone ? ` (${route.driverPhone})` : ""}
													</p>
													<p className="num mt-1 text-xs text-muted-foreground/80">
														{route.stops.length} stop
														{route.stops.length === 1 ? "" : "s"} ·{" "}
														{route._count.assignments} student
														{route._count.assignments === 1 ? "" : "s"}
													</p>
												</div>
												<div className="flex shrink-0 items-center gap-1">
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-7 gap-1 px-2 text-xs"
														onClick={() => setEditingRoute(route)}
														data-testid={`transport-route-edit-${route.id}`}
													>
														<Pencil className="h-3.5 w-3.5" /> Edit
													</Button>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
														onClick={() => setPendingRouteDelete(route)}
														data-testid={`transport-route-delete-${route.id}`}
													>
														<Trash2 className="h-3.5 w-3.5" /> Delete
													</Button>
												</div>
											</div>

											{route.description ? (
												<p className="mt-3 text-sm text-muted-foreground">
													{route.description}
												</p>
											) : null}

											<ul className="mt-4 space-y-2">
												{route.stops.map((stop) =>
													editingStop?.id === stop.id ? (
														<li
															key={stop.id}
															className="rounded-lg border border-hairline bg-surface-2 p-3"
														>
															<form
																onSubmit={(event) => void saveStop(event, stop)}
																className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto_auto]"
															>
																<input
																	name="name"
																	required
																	defaultValue={stop.name}
																	aria-label="Stop name"
																	className={FIELD_CLASS}
																/>
																<input
																	name="sortOrder"
																	type="number"
																	min={0}
																	defaultValue={stop.sortOrder}
																	aria-label="Stop order"
																	title="Stop order"
																	className={`${FIELD_CLASS} w-16`}
																/>
																<input
																	name="pickupTime"
																	defaultValue={stop.pickupTime ?? ""}
																	placeholder="Pickup"
																	className={`${FIELD_CLASS} w-24`}
																/>
																<input
																	name="dropoffTime"
																	defaultValue={stop.dropoffTime ?? ""}
																	placeholder="Drop-off"
																	className={`${FIELD_CLASS} w-24`}
																/>
																<Button type="submit" size="sm">
																	Save changes
																</Button>
																<Button
																	type="button"
																	variant="outline"
																	size="sm"
																	onClick={() => setEditingStop(null)}
																>
																	Cancel
																</Button>
															</form>
														</li>
													) : (
														<li
															key={stop.id}
															className="flex items-center gap-2 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-sm"
														>
															<MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
															<span className="min-w-0 flex-1 truncate text-foreground">
																{stop.name}
															</span>
															<span className="num shrink-0 text-xs text-muted-foreground">
																{[stop.pickupTime, stop.dropoffTime]
																	.filter(Boolean)
																	.join(" / ") || "No times"}
															</span>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																className="h-7 w-7 text-muted-foreground"
																onClick={() => setEditingStop(stop)}
																aria-label="Edit stop"
																data-testid={`transport-stop-edit-${stop.id}`}
															>
																<Pencil className="h-3.5 w-3.5" />
															</Button>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																className="h-7 w-7 text-destructive hover:text-destructive"
																onClick={() => setPendingStopDelete(stop)}
																aria-label="Remove stop"
																data-testid={`transport-stop-delete-${stop.id}`}
															>
																<Trash2 className="h-3.5 w-3.5" />
															</Button>
														</li>
													),
												)}
											</ul>

											<form
												onSubmit={(event) => void addStop(event, route)}
												className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]"
											>
												<input
													name="name"
													required
													placeholder="New stop name"
													className={FIELD_CLASS}
												/>
												<input
													name="pickupTime"
													placeholder="Pickup"
													className={`${FIELD_CLASS} w-24`}
												/>
												<input
													name="dropoffTime"
													placeholder="Drop-off"
													className={`${FIELD_CLASS} w-24`}
												/>
												<Button
													type="submit"
													variant="outline"
													size="sm"
													className="gap-1.5"
												>
													<Plus className="h-3.5 w-3.5" /> Add
												</Button>
											</form>
										</article>
									))}
								</div>
							)}
						</section>
					</>
				) : (
					<>
						<Panel
							title="Assign a student"
							description="Pick a route and stop, then search for the student."
							testId="transport-assign-panel"
							bodyClassName="p-5"
						>
							<form
								onSubmit={(event) => void saveAssignment(event)}
								className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
							>
								<label className="grid gap-2">
									<span className="text-xs font-medium text-foreground">
										Route
									</span>
									<select
										name="routeId"
										required
										value={assignmentRouteId}
										onChange={(event) =>
											setAssignmentRouteId(event.target.value)
										}
										className={FIELD_CLASS}
									>
										<option value="">Select a route…</option>
										{routes.map((route) => (
											<option key={route.id} value={route.id}>
												{route.name}
											</option>
										))}
									</select>
								</label>
								<label className="grid gap-2">
									<span className="text-xs font-medium text-foreground">
										Stop
									</span>
									<select name="stopId" className={FIELD_CLASS}>
										<option value="">Any stop</option>
										{selectedRoute?.stops.map((stop) => (
											<option key={stop.id} value={stop.id}>
												{stop.name}
											</option>
										))}
									</select>
								</label>
								<div className="grid gap-2">
									<span className="text-xs font-medium text-foreground">
										Student
									</span>
									<StudentSearchInput
										key={studentPickerKey}
										name="studentId"
										required
										ariaLabel="Student"
										placeholder="Search by name, admission or email…"
									/>
								</div>
								<label className="grid gap-2">
									<span className="text-xs font-medium text-foreground">
										Direction
									</span>
									<select name="direction" className={FIELD_CLASS}>
										<option value="BOTH">Both ways</option>
										<option value="PICKUP">Pickup only</option>
										<option value="DROPOFF">Drop-off only</option>
									</select>
								</label>
								<div className="md:col-span-2 xl:col-span-4">
									<SubmitButton
										isSubmitting={isSubmitting}
										label="Save assignment"
									/>
								</div>
							</form>
						</Panel>

						<Panel
							title="Student assignments"
							description="Everyone currently riding a transport route."
							actions={
								<span className="num rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
									{assignments.length} assignment
									{assignments.length === 1 ? "" : "s"}
								</span>
							}
							testId="transport-assignments-panel"
							bodyClassName="p-0"
						>
							{isLoading ? (
								<div
									className="p-5"
									data-testid="transport-assignments-loading"
								>
									<ListSkeleton rows={4} />
								</div>
							) : assignments.length === 0 ? (
								<EmptyState
									compact
									icon={UserPlus}
									title="No assignments yet"
									description="No students have been assigned to transport yet."
									testId="transport-assignments-empty"
								/>
							) : (
								<ul className="divide-y divide-hairline/60">
									{assignments.map((assignment) => (
										<li
											key={assignment.id}
											className="flex flex-wrap items-center gap-3 px-5 py-4"
											data-testid={`transport-assignment-${assignment.id}`}
										>
											<div className="min-w-0 flex-1">
												<p className="text-sm font-medium text-foreground">
													{assignment.student.user.name}
												</p>
												<p className="text-xs text-muted-foreground">
													{assignment.student.user.email}
												</p>
											</div>
											<div className="min-w-0 text-xs text-muted-foreground">
												<p className="font-semibold text-foreground">
													{assignment.route.code ?? assignment.route.name}
												</p>
												<p className="num">
													{assignment.stop?.name ?? "Any stop"} ·{" "}
													{assignment.direction.toLowerCase()}
												</p>
											</div>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
												onClick={() => setPendingAssignmentDelete(assignment)}
												data-testid={`transport-assignment-remove-${assignment.id}`}
											>
												<Trash2 className="h-3.5 w-3.5" /> Remove
											</Button>
										</li>
									))}
								</ul>
							)}
						</Panel>
					</>
				)}
			</div>

			<ConfirmDialog
				open={!!pendingRouteDelete}
				onOpenChange={(open) => !open && setPendingRouteDelete(null)}
				testId="transport-route-delete-confirm"
				title="Delete route"
				description={`Delete ${pendingRouteDelete?.name ?? "this route"}? Stops and assignments will be removed.`}
				confirmLabel="Delete route"
				destructive
				busy={isDeleting}
				onConfirm={() =>
					pendingRouteDelete && void removeRoute(pendingRouteDelete)
				}
			/>

			<ConfirmDialog
				open={!!pendingStopDelete}
				onOpenChange={(open) => !open && setPendingStopDelete(null)}
				testId="transport-stop-delete-confirm"
				title="Remove stop"
				description={`Remove ${pendingStopDelete?.name ?? "this stop"} from its route?`}
				confirmLabel="Remove stop"
				destructive
				busy={isDeleting}
				onConfirm={() =>
					pendingStopDelete && void removeStop(pendingStopDelete)
				}
			/>

			<ConfirmDialog
				open={!!pendingAssignmentDelete}
				onOpenChange={(open) => !open && setPendingAssignmentDelete(null)}
				testId="transport-assignment-remove-confirm"
				title="Remove assignment"
				description={`Stop transporting ${pendingAssignmentDelete?.student.user.name ?? "this student"} on this route?`}
				confirmLabel="Remove"
				destructive
				busy={isDeleting}
				onConfirm={() =>
					pendingAssignmentDelete &&
					void removeAssignment(pendingAssignmentDelete)
				}
			/>
		</div>
	);
}

function Input({
	label,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
	return (
		<label className={cn("space-y-1.5", className)}>
			<Label className="text-xs">{label}</Label>
			<input {...props} className={FIELD_CLASS} />
		</label>
	);
}

function Textarea({
	label,
	className,
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
	return (
		<label className={cn("space-y-1.5", className)}>
			<Label className="text-xs">{label}</Label>
			<textarea {...props} rows={3} className={`${FIELD_CLASS} h-auto py-2`} />
		</label>
	);
}

function SubmitButton({
	isSubmitting,
	label,
}: {
	isSubmitting: boolean;
	label: string;
}) {
	return (
		<Button type="submit" size="sm" className="gap-1.5" disabled={isSubmitting}>
			{isSubmitting ? (
				<Loader2 className="h-3.5 w-3.5 animate-spin" />
			) : (
				<Plus className="h-3.5 w-3.5" />
			)}
			{isSubmitting ? "Saving…" : label}
		</Button>
	);
}
