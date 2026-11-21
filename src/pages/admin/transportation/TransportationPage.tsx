import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowDown,
	ArrowUp,
	Bus,
	Car,
	Clock,
	DollarSign,
	MapPin,
	Pencil,
	Phone,
	Plus,
	Trash2,
	User,
	Users,
} from "lucide-react";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getBusRoutesServer } from "#/packages/content/server/content";
import {
	deleteBusRouteServer,
	saveBusRouteServer,
} from "#/packages/content/server/mutations";
import type { BusRoute, BusRouteStop } from "#/types/index";

type FormState = {
	id?: string;
	busNumber: string;
	vehicleType: "Bus" | "Van" | "Custom" | string;
	customVehicleType?: string;
	capacity: number;
	driverName: string;
	driverPhone: string;
	feeMonthly: number;
	stops: BusRouteStop[];
};

function normalizeStops(rawStops: any): BusRouteStop[] {
	if (!Array.isArray(rawStops)) return [];
	return rawStops.map((s, idx): BusRouteStop => {
		if (typeof s === "string") {
			return {
				name: s,
				pickupTime: `07:${String(idx * 10).padStart(2, "0")}`,
				dropoffTime: `16:${String(idx * 10).padStart(2, "0")}`,
				fare: undefined,
				landmark: "",
			};
		}
		return {
			name: s.name || `Stop ${idx + 1}`,
			nameNe: s.nameNe || "",
			landmark: s.landmark || "",
			pickupTime: s.pickupTime || s.pickup || "07:00",
			dropoffTime: s.dropoffTime || s.drop || "16:00",
			fare: typeof s.fare === "number" ? s.fare : undefined,
		};
	});
}

function getFareDisplay(stops: BusRouteStop[], baseFee?: number): string {
	const fares = stops
		.map((s) => s.fare)
		.filter((f): f is number => typeof f === "number" && !Number.isNaN(f));

	if (fares.length === 0) {
		return baseFee ? `Rs. ${baseFee.toLocaleString()} / mo` : "-";
	}
	const min = Math.min(...fares);
	const max = Math.max(...fares);
	if (min === max) {
		return `Rs. ${min.toLocaleString()} / mo`;
	}
	return `Rs. ${min.toLocaleString()} – ${max.toLocaleString()} / mo`;
}

export default function TransportationPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [form, setForm] = useState<FormState>({
		busNumber: "",
		vehicleType: "Bus",
		customVehicleType: "",
		capacity: 30,
		driverName: "",
		driverPhone: "",
		feeMonthly: 1500,
		stops: [],
	});
	const [pendingDelete, setPendingDelete] = useState<BusRoute | null>(null);

	const { data: routes = [], isLoading } = useQuery({
		queryKey: ["bus-routes"],
		queryFn: async () => {
			const rows = await getBusRoutesServer();
			return rows.map((r): BusRoute => {
				const stops = normalizeStops(r.stops);
				return {
					id: r.id,
					busNumber: r.busNumber,
					driverName: r.driverName,
					driverPhone: r.driverPhone,
					vehicleType: r.vehicleType || "Bus",
					capacity: r.capacity ?? 30,
					stops,
					feeMonthly: r.feeMonthly ?? undefined,
					order: r.order,
				};
			});
		},
	});

	const saveMutation = useMutation({
		mutationFn: (data: FormState) => {
			const resolvedVehicleType =
				data.vehicleType === "Custom"
					? data.customVehicleType || "Custom"
					: data.vehicleType;

			// Clean up stops: ensure each stop has valid data and numeric fares if set
			const cleanStops = data.stops
				.filter((s) => s.name.trim().length > 0)
				.map((s) => ({
					name: s.name.trim(),
					nameNe: s.nameNe?.trim() || undefined,
					landmark: s.landmark?.trim() || undefined,
					pickupTime: s.pickupTime?.trim() || "07:00",
					dropoffTime: s.dropoffTime?.trim() || "16:00",
					fare:
						typeof s.fare === "number" && !Number.isNaN(s.fare)
							? s.fare
							: data.feeMonthly || undefined,
				}));

			return saveBusRouteServer({
				data: {
					id: data.id,
					busNumber: data.busNumber.trim(),
					vehicleType: resolvedVehicleType,
					capacity: Number(data.capacity) || 30,
					driverName: data.driverName.trim(),
					driverPhone: data.driverPhone.trim(),
					feeMonthly: data.feeMonthly ? Number(data.feeMonthly) : null,
					stops: cleanStops,
				},
			});
		},
		onSuccess: () => {
			toast.success("Transportation route saved successfully");
			qc.invalidateQueries({ queryKey: ["bus-routes"] });
			setOpen(false);
		},
		onError: (err: any) =>
			toast.error(err?.message || "Failed to save transportation route"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteBusRouteServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Route deleted successfully");
			qc.invalidateQueries({ queryKey: ["bus-routes"] });
			setPendingDelete(null);
		},
		onError: () => toast.error("Failed to delete route"),
	});

	const openCreateDialog = () => {
		setForm({
			busNumber: "",
			vehicleType: "Bus",
			customVehicleType: "",
			capacity: 32,
			driverName: "",
			driverPhone: "",
			feeMonthly: 1500,
			stops: [
				{
					name: "Starting Depot",
					pickupTime: "06:45",
					dropoffTime: "16:45",
					fare: 1500,
					landmark: "Main Highway",
				},
				{
					name: "School Campus",
					pickupTime: "07:30",
					dropoffTime: "16:00",
					fare: 1500,
					landmark: "Sukkhanagar Gate",
				},
			],
		});
		setOpen(true);
	};

	const openEditDialog = (route: BusRoute) => {
		const stops = normalizeStops(route.stops);
		const isStandardType =
			route.vehicleType === "Bus" || route.vehicleType === "Van";
		setForm({
			id: route.id,
			busNumber: route.busNumber,
			vehicleType: isStandardType ? (route.vehicleType as any) : "Custom",
			customVehicleType: !isStandardType ? route.vehicleType : "",
			capacity: route.capacity ?? 30,
			driverName: route.driverName,
			driverPhone: route.driverPhone,
			feeMonthly: route.feeMonthly ?? 1500,
			stops:
				stops.length > 0
					? stops
					: [
							{
								name: "Pickup Stop",
								pickupTime: "07:00",
								dropoffTime: "16:00",
								fare: route.feeMonthly ?? 1500,
							},
						],
		});
		setOpen(true);
	};

	const addStop = () => {
		const prev = form.stops[form.stops.length - 1];
		let nextPickup = "07:30";
		let nextDropoff = "16:30";
		if (prev?.pickupTime) {
			const [h, m] = prev.pickupTime.split(":").map(Number);
			if (!Number.isNaN(h) && !Number.isNaN(m)) {
				const total = h * 60 + m + 10;
				const nh = Math.floor(total / 60) % 24;
				const nm = total % 60;
				nextPickup = `${String(nh).padStart(2, "0")}:${String(nm).padStart(2, "0")}`;
			}
		}
		setForm((prevForm) => ({
			...prevForm,
			stops: [
				...prevForm.stops,
				{
					name: "",
					pickupTime: nextPickup,
					dropoffTime: nextDropoff,
					fare: prevForm.feeMonthly || 1500,
					landmark: "",
				},
			],
		}));
	};

	const updateStop = (idx: number, patch: Partial<BusRouteStop>) => {
		setForm((prevForm) => {
			const newStops = [...prevForm.stops];
			newStops[idx] = { ...newStops[idx], ...patch };
			return { ...prevForm, stops: newStops };
		});
	};

	const removeStop = (idx: number) => {
		setForm((prevForm) => ({
			...prevForm,
			stops: prevForm.stops.filter((_, i) => i !== idx),
		}));
	};

	const moveStop = (idx: number, direction: "up" | "down") => {
		setForm((prevForm) => {
			const targetIdx = direction === "up" ? idx - 1 : idx + 1;
			if (targetIdx < 0 || targetIdx >= prevForm.stops.length) return prevForm;
			const newStops = [...prevForm.stops];
			const [item] = newStops.splice(idx, 1);
			newStops.splice(targetIdx, 0, item);
			return { ...prevForm, stops: newStops };
		});
	};

	const columns: Column<BusRoute>[] = [
		{
			key: "vehicle",
			header: "Vehicle & Fleet",
			render: (row: BusRoute) => {
				const vType = row.vehicleType || "Bus";
				const isBus = vType.toLowerCase() === "bus";
				const isVan = vType.toLowerCase() === "van";
				return (
					<div className="flex flex-col gap-1">
						<div className="flex items-center gap-2">
							<span className="font-semibold text-foreground tracking-tight">
								{row.busNumber}
							</span>
							<Badge
								variant={isBus ? "default" : isVan ? "secondary" : "outline"}
								className="text-[10px] px-1.5 py-0 uppercase font-mono tracking-wider"
							>
								{isBus ? (
									<Bus className="mr-1 h-2.5 w-2.5" />
								) : (
									<Car className="mr-1 h-2.5 w-2.5" />
								)}
								{vType}
							</Badge>
						</div>
						<span className="text-xs text-muted-foreground flex items-center gap-1">
							<Users className="h-3 w-3" />
							{row.capacity ? `${row.capacity} seats capacity` : "Capacity N/A"}
						</span>
					</div>
				);
			},
		},
		{
			key: "driver",
			header: "Driver Contact",
			render: (row: BusRoute) => (
				<div className="flex flex-col gap-0.5 text-xs">
					<span className="font-medium text-foreground flex items-center gap-1.5">
						<User className="h-3 w-3 text-muted-foreground" />
						{row.driverName || "Not assigned"}
					</span>
					{row.driverPhone ? (
						<a
							href={`tel:${row.driverPhone}`}
							className="text-primary hover:underline flex items-center gap-1.5 text-muted-foreground font-mono"
						>
							<Phone className="h-3 w-3" />
							{row.driverPhone}
						</a>
					) : (
						<span className="text-muted-foreground italic">No phone</span>
					)}
				</div>
			),
		},
		{
			key: "stops",
			header: "Stops & Timings",
			render: (row: BusRoute) => {
				const stops = normalizeStops(row.stops);
				if (stops.length === 0) {
					return <span className="text-xs text-muted-foreground italic">No stops defined</span>;
				}
				const first = stops[0];
				const last = stops[stops.length - 1];
				return (
					<div className="flex flex-col gap-1 max-w-sm">
						<div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
							<MapPin className="h-3 w-3 text-primary shrink-0" />
							<span className="truncate">{first?.name}</span>
							{stops.length > 1 && (
								<>
									<span className="text-muted-foreground">→</span>
									<span className="truncate">{last?.name}</span>
								</>
							)}
							<Badge variant="outline" className="text-[10px] ml-1 shrink-0 py-0 px-1">
								{stops.length} {stops.length === 1 ? "stop" : "stops"}
							</Badge>
						</div>
						<div className="flex items-center gap-2 text-[11px] text-muted-foreground">
							<Clock className="h-3 w-3 shrink-0" />
							<span>
								{first?.pickupTime || "07:00"} AM pickup
								{stops.length > 1 && ` · ${last?.pickupTime || "07:45"} AM campus arrival`}
							</span>
						</div>
					</div>
				);
			},
		},
		{
			key: "fee",
			header: "Pricing",
			render: (row: BusRoute) => {
				const stops = normalizeStops(row.stops);
				return (
					<div className="flex flex-col text-xs">
						<span className="font-medium text-foreground">
							{getFareDisplay(stops, row.feeMonthly)}
						</span>
						{row.feeMonthly && stops.some((s) => s.fare && s.fare !== row.feeMonthly) && (
							<span className="text-[10px] text-muted-foreground">
								Base: Rs. {row.feeMonthly.toLocaleString()}
							</span>
						)}
					</div>
				);
			},
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (row: BusRoute) => (
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-muted-foreground hover:text-foreground"
						aria-label={`Edit ${row.busNumber}`}
						data-testid={`route-edit-${row.id}`}
						onClick={() => openEditDialog(row)}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive hover:bg-destructive/10"
						aria-label={`Delete ${row.busNumber}`}
						data-testid={`route-delete-${row.id}`}
						onClick={() => setPendingDelete(row)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<div data-testid="transportation-page" className="space-y-6">
			<PageHeader
				eyebrow="Fleet & Logistics"
				title="Transportation Routes"
				description="Manage school buses, microbuses, vans, seating capacity, per-stop pricing, and estimated pickup/dropoff schedules."
				actions={
					<Button size="sm" className="gap-1.5" onClick={openCreateDialog}>
						<Plus className="h-3.5 w-3.5" /> Add Route
					</Button>
				}
			/>

			<DataTable
				columns={columns}
				rows={routes}
				rowId={(r) => r.id}
				testId="transportation-table"
				loading={isLoading}
				empty={
					<EmptyState
						icon={Bus}
						title="No transportation routes"
						description="Add your first vehicle route to start managing stops, fleet capacity, and schedules."
						primaryLabel="Add Route"
						onPrimary={openCreateDialog}
					/>
				}
			/>

			{/* Add/Edit Route Modal */}
			<Dialog open={open} onOpenChange={setOpen}>
				<DialogContent className="border-border bg-popover sm:max-w-3xl max-h-[90vh] flex flex-col p-0">
					<DialogHeader className="p-6 pb-4 border-b border-border">
						<DialogTitle className="text-xl font-semibold">
							{form.id ? "Edit Vehicle Route" : "Add Vehicle Route"}
						</DialogTitle>
						<DialogDescription>
							Configure vehicle type, capacity, driver contact, per-stop pricing, and estimated timings.
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						{/* SECTION 1: Vehicle & Fleet Specs */}
						<div>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
								<Bus className="h-3.5 w-3.5 text-primary" /> Vehicle & Fleet Details
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Bus / Plate Number *</Label>
									<Input
										placeholder="e.g. BA 2 KHA 4028"
										value={form.busNumber}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({ ...p, busNumber: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Vehicle Type</Label>
									<Select
										value={form.vehicleType}
										onValueChange={(val: string) =>
											setForm((p) => ({
												...p,
												vehicleType: val,
												capacity:
													val === "Van" && p.capacity === 32 ? 14 : p.capacity,
											}))
										}
									>
										<SelectTrigger className="w-full">
											<SelectValue placeholder="Select type" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="Bus">Bus (Large / Standard)</SelectItem>
											<SelectItem value="Van">Van (Microbus / Minivan)</SelectItem>
											<SelectItem value="Custom">Custom Vehicle</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Capacity (Seats)</Label>
									<Input
										type="number"
										min={1}
										max={120}
										placeholder="e.g. 32"
										value={form.capacity}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({
												...p,
												capacity: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>
							{form.vehicleType === "Custom" && (
								<div className="mt-3 space-y-1.5">
									<Label className="text-xs font-medium">Custom Vehicle Type Label</Label>
									<Input
										placeholder="e.g. Electric Shuttle, Coaster Bus, 4WD Cruiser"
										value={form.customVehicleType}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({
												...p,
												customVehicleType: e.target.value,
											}))
										}
									/>
								</div>
							)}
						</div>

						{/* SECTION 2: Driver & Base Fare */}
						<div>
							<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
								<User className="h-3.5 w-3.5 text-primary" /> Driver & Standard Fee
							</h3>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Driver Full Name</Label>
									<Input
										placeholder="e.g. Ram Bahadur Thapa"
										value={form.driverName}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({ ...p, driverName: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Driver Phone Number</Label>
									<Input
										placeholder="e.g. +977 9847000000"
										value={form.driverPhone}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({ ...p, driverPhone: e.target.value }))
										}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs font-medium">Base Monthly Fee (NPR)</Label>
									<Input
										type="number"
										step={50}
										placeholder="1500"
										value={form.feeMonthly}
										onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
											setForm((p) => ({
												...p,
												feeMonthly: Number(e.target.value),
											}))
										}
									/>
								</div>
							</div>
						</div>

						{/* SECTION 3: Stops, Estimated Timings & Per-Stop Pricing */}
						<div>
							<div className="flex items-center justify-between mb-3">
								<div>
									<h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
										<MapPin className="h-3.5 w-3.5 text-primary" /> Route Stops, Timings & Pricing
									</h3>
									<p className="text-[11px] text-muted-foreground mt-0.5">
										Configure morning pickup, afternoon dropoff, and individual per-stop pricing.
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="gap-1 text-xs"
									onClick={addStop}
								>
									<Plus className="h-3.5 w-3.5" /> Add Stop
								</Button>
							</div>

							{form.stops.length === 0 ? (
								<div className="border border-dashed border-border rounded-lg p-6 text-center text-xs text-muted-foreground">
									No stops added yet. Click &ldquo;Add Stop&rdquo; above to add pickup points.
								</div>
							) : (
								<div className="space-y-2.5">
									{form.stops.map((stop, idx) => (
										<div
											key={idx}
											className="border border-border rounded-lg p-3 bg-card/60 flex flex-col sm:flex-row gap-3 items-start sm:items-center"
										>
											<div className="flex items-center gap-1.5 shrink-0">
												<span className="w-6 h-6 rounded-full bg-primary/10 text-primary font-mono text-xs flex items-center justify-center font-bold">
													{idx + 1}
												</span>
												<div className="flex flex-col">
													<button
														type="button"
														disabled={idx === 0}
														onClick={() => moveStop(idx, "up")}
														className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
														aria-label="Move stop up"
													>
														<ArrowUp className="h-3 w-3" />
													</button>
													<button
														type="button"
														disabled={idx === form.stops.length - 1}
														onClick={() => moveStop(idx, "down")}
														className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
														aria-label="Move stop down"
													>
														<ArrowDown className="h-3 w-3" />
													</button>
												</div>
											</div>

											{/* Stop Name & Landmark */}
											<div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 min-w-0">
												<div className="space-y-1">
													<Label className="text-[10px] text-muted-foreground">
														Stop Name *
													</Label>
													<Input
														className="h-8 text-xs"
														placeholder="e.g. Kalikanagar Chowk"
														value={stop.name}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
															updateStop(idx, { name: e.target.value })
														}
													/>
												</div>
												<div className="space-y-1">
													<Label className="text-[10px] text-muted-foreground">
														Landmark / Area
													</Label>
													<Input
														className="h-8 text-xs"
														placeholder="e.g. Near Siddhartha Bank"
														value={stop.landmark || ""}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
															updateStop(idx, { landmark: e.target.value })
														}
													/>
												</div>
											</div>

											{/* Timings & Price */}
											<div className="grid grid-cols-3 gap-2 w-full sm:w-auto shrink-0">
												<div className="space-y-1">
													<Label className="text-[10px] text-muted-foreground flex items-center gap-1">
														<Clock className="h-2.5 w-2.5" /> Pickup
													</Label>
													<Input
														className="h-8 text-xs font-mono w-20"
														type="text"
														placeholder="07:15"
														value={stop.pickupTime || ""}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
															updateStop(idx, { pickupTime: e.target.value })
														}
													/>
												</div>
												<div className="space-y-1">
													<Label className="text-[10px] text-muted-foreground flex items-center gap-1">
														<Clock className="h-2.5 w-2.5" /> Dropoff
													</Label>
													<Input
														className="h-8 text-xs font-mono w-20"
														type="text"
														placeholder="16:00"
														value={stop.dropoffTime || ""}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
															updateStop(idx, { dropoffTime: e.target.value })
														}
													/>
												</div>
												<div className="space-y-1">
													<Label className="text-[10px] text-muted-foreground flex items-center gap-1">
														<DollarSign className="h-2.5 w-2.5" /> Fare (NPR)
													</Label>
													<Input
														className="h-8 text-xs font-mono w-24"
														type="number"
														step={50}
														placeholder={String(form.feeMonthly || 1500)}
														value={stop.fare ?? ""}
														onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
															updateStop(idx, {
																fare: e.target.value ? Number(e.target.value) : undefined,
															})
														}
													/>
												</div>
											</div>

											{/* Delete Stop */}
											<Button
												type="button"
												variant="ghost"
												size="icon"
												className="h-8 w-8 text-destructive hover:bg-destructive/10 shrink-0 self-center"
												onClick={() => removeStop(idx)}
												aria-label="Remove stop"
											>
												<Trash2 className="h-3.5 w-3.5" />
											</Button>
										</div>
									))}
								</div>
							)}
						</div>
					</div>

					<DialogFooter className="p-4 border-t border-border bg-card/40 flex justify-between sm:justify-between items-center">
						<span className="text-xs text-muted-foreground">
							{form.stops.length} stops configured ·{" "}
							{form.capacity} seats on {form.vehicleType}
						</span>
						<div className="flex items-center gap-2">
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => saveMutation.mutate(form)}
								disabled={saveMutation.isPending || !form.busNumber.trim()}
							>
								{saveMutation.isPending ? "Saving..." : "Save Route"}
							</Button>
						</div>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(op) => !op && setPendingDelete(null)}
				testId="transportation-delete-confirm"
				title="Delete Route"
				description={`Are you sure you want to delete bus route ${pendingDelete?.busNumber}? This cannot be undone.`}
				destructive
				onConfirm={() =>
					pendingDelete && deleteMutation.mutate(pendingDelete.id)
				}
				busy={deleteMutation.isPending}
			/>
		</div>
	);
}
