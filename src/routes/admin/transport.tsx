import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	Bus,
	Loader2,
	MapPin,
	Plus,
	RefreshCw,
	Trash2,
	UserPlus,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { cn } from "#/lib/utils.ts";
import {
	createTransportRouteAction,
	createTransportStopAction,
	deleteTransportAssignmentAction,
	deleteTransportRouteAction,
	deleteTransportStopAction,
	getTransportDataFn,
	saveTransportAssignmentAction,
} from "#/packages/transport/server.ts";

export const Route = createFileRoute("/admin/transport")({
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

interface StudentRow {
	id: string;
	user: { name: string; email: string };
}

function AdminTransport() {
	const [tab, setTab] = useState<Tab>("routes");
	const [routes, setRoutes] = useState<Array<RouteRow>>([]);
	const [assignments, setAssignments] = useState<Array<AssignmentRow>>([]);
	const [students, setStudents] = useState<Array<StudentRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [assignmentRouteId, setAssignmentRouteId] = useState("");

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
		setStudents(response.students as Array<StudentRow>);
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

	const removeRoute = async (route: RouteRow) => {
		if (
			!confirm(
				`Delete route ${route.name}? Stops and assignments will be removed.`,
			)
		) {
			return;
		}

		const response = await deleteTransportRouteAction({
			data: { id: route.id },
		});

		if (!response.success) setError(response.error);
		else {
			setNotice("Route deleted.");
			await load();
		}
	};

	const removeStop = async (stop: StopRow) => {
		const response = await deleteTransportStopAction({ data: { id: stop.id } });

		if (!response.success) setError(response.error);
		else await load();
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
		setAssignmentRouteId("");
		await load();
	};

	const removeAssignment = async (assignment: AssignmentRow) => {
		const response = await deleteTransportAssignmentAction({
			data: { id: assignment.id },
		});

		if (!response.success) setError(response.error);
		else {
			setNotice("Assignment removed.");
			await load();
		}
	};

	const selectedRoute = routes.find((route) => route.id === assignmentRouteId);

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Transport</h1>
					<p className="mt-1 text-sm text-gray-500">
						Create bus routes, add stops and assign students to a pickup or
						drop-off.
					</p>
				</div>
				<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
					{(["routes", "assignments"] as Array<Tab>).map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => setTab(item)}
							className={cn(
								"rounded-md px-3 py-1.5 text-sm font-medium capitalize",
								tab === item
									? "bg-red-500 text-white"
									: "text-gray-600 hover:bg-gray-100",
							)}
						>
							{item}
						</button>
					))}
				</div>
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

			{tab === "routes" ? (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-red-500" /> New route
						</h2>
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
							<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
								<input type="checkbox" name="isActive" defaultChecked /> Active
							</label>
							<div className="md:col-span-2">
								<SubmitButton isSubmitting={isSubmitting} label="Create route" />
							</div>
						</form>
					</section>

					<section className="space-y-4">
						<header className="flex items-center justify-between gap-3">
							<h2 className="text-lg font-semibold text-gray-900">Routes</h2>
							<button
								type="button"
								onClick={() => void load()}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
							>
								<RefreshCw
									className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
								/>
								Refresh
							</button>
						</header>

						{isLoading ? (
							<LoadingRow />
						) : routes.length === 0 ? (
							<div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
								<Bus className="mx-auto h-8 w-8 text-gray-300" />
								<p className="mt-3 text-sm text-gray-500">
									No transport routes have been created yet.
								</p>
							</div>
						) : (
							<div className="grid gap-4 xl:grid-cols-2">
								{routes.map((route) => (
									<article
										key={route.id}
										className="rounded-2xl border border-gray-200 bg-white p-5"
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div>
												<h3 className="font-semibold text-gray-900">
													{route.name}
													{route.code ? (
														<span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
															{route.code}
														</span>
													) : null}
												</h3>
												<p className="text-xs text-gray-500">
													{route.vehicleNumber ?? "No vehicle"} ·{" "}
													{route.driverName ?? "No driver"}
													{route.driverPhone ? ` (${route.driverPhone})` : ""}
												</p>
												<p className="mt-1 text-xs text-gray-400">
													{route.stops.length} stop
													{route.stops.length === 1 ? "" : "s"} ·{" "}
													{route._count.assignments} student
													{route._count.assignments === 1 ? "" : "s"}
												</p>
											</div>
											<button
												type="button"
												onClick={() => void removeRoute(route)}
												className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
											>
												<Trash2 className="h-3.5 w-3.5" /> Delete
											</button>
										</div>

										{route.description ? (
											<p className="mt-3 text-sm text-gray-600">
												{route.description}
											</p>
										) : null}

										<ul className="mt-4 space-y-2">
											{route.stops.map((stop) => (
												<li
													key={stop.id}
													className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm"
												>
													<MapPin className="h-3.5 w-3.5 text-red-500" />
													<span className="flex-1 text-gray-800">{stop.name}</span>
													<span className="text-xs text-gray-500">
														{[stop.pickupTime, stop.dropoffTime]
															.filter(Boolean)
															.join(" / ") || "No times"}
													</span>
													<button
														type="button"
														onClick={() => void removeStop(stop)}
														className="rounded p-1 text-red-500 hover:bg-red-50"
														aria-label="Remove stop"
													>
														<Trash2 className="h-3.5 w-3.5" />
													</button>
												</li>
											))}
										</ul>

										<form
											onSubmit={(event) => void addStop(event, route)}
											className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]"
										>
											<input
												name="name"
												required
												placeholder="New stop name"
												className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
											/>
											<input
												name="pickupTime"
												placeholder="Pickup"
												className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
											/>
											<input
												name="dropoffTime"
												placeholder="Drop-off"
												className="w-24 rounded-lg border border-gray-300 px-2 py-1.5 text-sm"
											/>
											<button
												type="submit"
												className="inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
											>
												<Plus className="h-3.5 w-3.5" /> Add
											</button>
										</form>
									</article>
								))}
							</div>
						)}
					</section>
				</>
			) : (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<UserPlus className="h-5 w-5 text-red-500" /> Assign a student
						</h2>
						<form
							onSubmit={(event) => void saveAssignment(event)}
							className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
						>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Route
								</span>
								<select
									name="routeId"
									required
									value={assignmentRouteId}
									onChange={(event) => setAssignmentRouteId(event.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Select a route…</option>
									{routes.map((route) => (
										<option key={route.id} value={route.id}>
											{route.name}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">Stop</span>
								<select
									name="stopId"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Any stop</option>
									{selectedRoute?.stops.map((stop) => (
										<option key={stop.id} value={stop.id}>
											{stop.name}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Student
								</span>
								<select
									name="studentId"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="">Select a student…</option>
									{students.map((student) => (
										<option key={student.id} value={student.id}>
											{student.user.name} · {student.user.email}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Direction
								</span>
								<select
									name="direction"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
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
					</section>

					<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
						<header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
							<h2 className="font-semibold text-gray-900">
								Student assignments
							</h2>
							<span className="text-xs text-gray-500">
								{assignments.length} assignment
								{assignments.length === 1 ? "" : "s"}
							</span>
						</header>

						{isLoading ? (
							<LoadingRow />
						) : assignments.length === 0 ? (
							<p className="p-8 text-center text-sm text-gray-500">
								No students have been assigned to transport yet.
							</p>
						) : (
							<ul className="divide-y divide-gray-100">
								{assignments.map((assignment) => (
									<li
										key={assignment.id}
										className="flex flex-wrap items-center gap-3 px-5 py-4"
									>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-gray-900">
												{assignment.student.user.name}
											</p>
											<p className="text-xs text-gray-500">
												{assignment.student.user.email}
											</p>
										</div>
										<div className="text-xs text-gray-600">
											<p className="font-semibold">
												{assignment.route.code ?? assignment.route.name}
											</p>
											<p>
												{assignment.stop?.name ?? "Any stop"} ·{" "}
												{assignment.direction.toLowerCase()}
											</p>
										</div>
										<button
											type="button"
											onClick={() => void removeAssignment(assignment)}
											className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
										>
											<Trash2 className="h-3.5 w-3.5" /> Remove
										</button>
									</li>
								))}
							</ul>
						)}
					</section>
				</>
			)}
		</div>
	);
}

function Input({
	label,
	className,
	...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
	return (
		<label className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<input
				{...props}
				className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
			/>
		</label>
	);
}

function Textarea({
	label,
	className,
	...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }) {
	return (
		<label className={cn("text-sm", className)}>
			<span className="mb-1 block font-medium text-gray-700">{label}</span>
			<textarea
				{...props}
				rows={3}
				className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
			/>
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
		<button
			type="submit"
			disabled={isSubmitting}
			className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
		>
			{isSubmitting ? (
				<Loader2 className="h-4 w-4 animate-spin" />
			) : (
				<Plus className="h-4 w-4" />
			)}
			{isSubmitting ? "Saving…" : label}
		</button>
	);
}

function LoadingRow() {
	return (
		<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
			<Loader2 className="h-4 w-4 animate-spin" /> Loading…
		</p>
	);
}
