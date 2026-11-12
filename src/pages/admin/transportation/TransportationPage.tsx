import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bus, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
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
import { getBusRoutesServer } from "#/packages/content/server/content";
import {
	deleteBusRouteServer,
	saveBusRouteServer,
} from "#/packages/content/server/mutations";
import type { BusRoute } from "#/types/index";

export default function TransportationPage() {
	const qc = useQueryClient();
	const [open, setOpen] = useState(false);
	const [editing, setEditing] = useState<Partial<BusRoute> | null>(null);
	const [pendingDelete, setPendingDelete] = useState<BusRoute | null>(null);

	const { data: routes = [], isLoading } = useQuery({
		queryKey: ["bus-routes"],
		queryFn: async () => {
			const rows = await getBusRoutesServer();
			return rows.map(
				(r): BusRoute => ({
					id: r.id,
					busNumber: r.busNumber,
					driverName: r.driverName,
					driverPhone: r.driverPhone,
					stops: Array.isArray(r.stops) ? (r.stops as string[]) : [],
					feeMonthly: r.feeMonthly ?? undefined,
					order: r.order,
				}),
			);
		},
	});

	const saveMutation = useMutation({
		mutationFn: (data: any) => saveBusRouteServer({ data }),
		onSuccess: () => {
			toast.success("Bus route saved");
			qc.invalidateQueries({ queryKey: ["bus-routes"] });
			setOpen(false);
			setEditing(null);
		},
		onError: () => toast.error("Failed to save bus route"),
	});

	const deleteMutation = useMutation({
		mutationFn: (id: string) => deleteBusRouteServer({ data: { id } }),
		onSuccess: () => {
			toast.success("Bus route deleted");
			qc.invalidateQueries({ queryKey: ["bus-routes"] });
			setPendingDelete(null);
		},
		onError: () => toast.error("Failed to delete bus route"),
	});

	const columns: Column<BusRoute>[] = [
		{
			key: "busNumber",
			header: "Bus Number",
			render: (row: BusRoute) => (
				<div className="font-medium">{row.busNumber}</div>
			),
		},
		{
			key: "driver",
			header: "Driver Info",
			render: (row: BusRoute) => `${row.driverName} (${row.driverPhone})`,
		},
		{
			key: "stops",
			header: "Stops",
			render: (row: BusRoute) =>
				`${Array.isArray(row.stops) ? row.stops.join(", ") : "N/A"}`,
		},
		{
			key: "fee",
			header: "Monthly Fee",
			render: (row: BusRoute) =>
				row.feeMonthly ? `Rs. ${row.feeMonthly}` : "-",
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
						className="h-8 w-8"
						onClick={() => {
							setEditing(row);
							setOpen(true);
						}}
					>
						<Pencil className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						className="h-8 w-8 text-destructive"
						onClick={() => setPendingDelete(row)}
					>
						<Trash2 className="h-4 w-4" />
					</Button>
				</div>
			),
		},
	];

	return (
		<main className="flex-1 overflow-y-auto bg-surface-base px-6 py-8">
			<div className="mx-auto max-w-5xl space-y-6">
				<PageHeader
					eyebrow="Operations"
					title="Transportation"
					description="Manage school bus routes and stops."
					actions={
						<Button
							onClick={() => {
								setEditing({ stops: [] });
								setOpen(true);
							}}
						>
							<Plus className="mr-2 h-4 w-4" /> Add Route
						</Button>
					}
				/>

				{routes.length > 0 ? (
					<DataTable
						columns={columns}
						rows={routes}
						rowId={(r) => r.id}
						testId="transportation-table"
					/>
				) : (
					!isLoading && (
						<EmptyState
							icon={Bus}
							title="No transportation routes"
							description="Add your first bus route to begin managing transport."
							primaryLabel="Add route"
							onPrimary={() => {
								setEditing({ stops: [] });
								setOpen(true);
							}}
						/>
					)
				)}

				<Dialog open={open} onOpenChange={setOpen}>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>
								{editing?.id ? "Edit Route" : "Add Route"}
							</DialogTitle>
							<DialogDescription>
								Configure bus number, driver info, and stops.
							</DialogDescription>
						</DialogHeader>
						<div className="grid gap-4 py-4">
							<div className="space-y-2">
								<Label>Bus Number / Plate</Label>
								<Input
									value={editing?.busNumber || ""}
									onChange={(e: any) =>
										setEditing((prev) => ({
											...prev,
											busNumber: e.target.value,
										}))
									}
								/>
							</div>
							<div className="grid grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label>Driver Name</Label>
									<Input
										value={editing?.driverName || ""}
										onChange={(e: any) =>
											setEditing((prev) => ({
												...prev,
												driverName: e.target.value,
											}))
										}
									/>
								</div>
								<div className="space-y-2">
									<Label>Driver Phone</Label>
									<Input
										value={editing?.driverPhone || ""}
										onChange={(e: any) =>
											setEditing((prev) => ({
												...prev,
												driverPhone: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							<div className="space-y-2">
								<Label>Monthly Fee (NPR)</Label>
								<Input
									type="number"
									value={editing?.feeMonthly || ""}
									onChange={(e: any) =>
										setEditing((prev) => ({
											...prev,
											feeMonthly: Number(e.target.value),
										}))
									}
								/>
							</div>
							<div className="space-y-2">
								<Label>Stops (comma-separated)</Label>
								<Input
									value={
										Array.isArray(editing?.stops)
											? editing?.stops.join(", ")
											: ""
									}
									onChange={(e: any) =>
										setEditing((prev) => ({
											...prev,
											stops: e.target.value.split(",").map((s: string) => s.trim()),
										}))
									}
									placeholder="E.g. Bus Park, Hospital, Base Camp"
								/>
							</div>
						</div>
						<DialogFooter>
							<Button variant="outline" onClick={() => setOpen(false)}>
								Cancel
							</Button>
							<Button
								onClick={() => saveMutation.mutate(editing)}
								disabled={saveMutation.isPending || !editing?.busNumber}
							>
								Save Route
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>

				<ConfirmDialog
					open={!!pendingDelete}
					onOpenChange={(op) => !op && setPendingDelete(null)}
					title="Delete Route"
					description={`Are you sure you want to delete bus route ${pendingDelete?.busNumber}?`}
					destructive
					onConfirm={() =>
						pendingDelete && deleteMutation.mutate(pendingDelete.id)
					}
					busy={deleteMutation.isPending}
				/>
			</div>
		</main>
	);
}
