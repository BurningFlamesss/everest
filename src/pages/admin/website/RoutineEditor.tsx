import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Panel } from "#/components/common/Panel";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import type { Routine, RoutinePeriod } from "#/types";

function clone(routines: Routine[]): Routine[] {
	return routines.map((routine) => ({
		...routine,
		periods: routine.periods.map((period) => ({ ...period })),
		rows: routine.rows.map((row) => ({ ...row, slots: [...row.slots] })),
	}));
}

/**
 * Edits the section routines shown on the public courses page and calendar.
 * One routine per section (grades 1–5, 6–8, 9–10, +2 Science, +2 Management);
 * periods and the day grid are edited together so a period always has a slot
 * in every weekday row.
 */
export function RoutineEditor({
	routines,
	canManage,
	saving,
	onSave,
}: {
	routines: Routine[];
	canManage: boolean;
	saving: boolean;
	onSave: (next: Routine[]) => void;
}) {
	const [draft, setDraft] = useState<Routine[]>(() => clone(routines));
	const [activeKey, setActiveKey] = useState(routines[0]?.key ?? "");

	useEffect(() => {
		setDraft(clone(routines));
		setActiveKey((current) =>
			routines.some((routine) => routine.key === current)
				? current
				: (routines[0]?.key ?? ""),
		);
	}, [routines]);

	const activeIndex = draft.findIndex((routine) => routine.key === activeKey);
	const active = activeIndex >= 0 ? draft[activeIndex] : draft[0];

	const updateActive = (patch: Partial<Routine>) => {
		if (!active) return;
		setDraft((current) =>
			current.map((routine) =>
				routine.key === active.key ? { ...routine, ...patch } : routine,
			),
		);
	};

	const updatePeriod = (index: number, patch: Partial<RoutinePeriod>) => {
		if (!active) return;
		updateActive({
			periods: active.periods.map((period, periodIndex) =>
				periodIndex === index ? { ...period, ...patch } : period,
			),
		});
	};

	const addPeriod = () => {
		if (!active) return;
		updateActive({
			periods: [
				...active.periods,
				{ label: `P${active.periods.length + 1}`, start: "", end: "" },
			],
			rows: active.rows.map((row) => ({
				...row,
				slots: [...row.slots, ""],
			})),
		});
	};

	const removePeriod = (index: number) => {
		if (!active) return;
		updateActive({
			periods: active.periods.filter((_, periodIndex) => periodIndex !== index),
			rows: active.rows.map((row) => ({
				...row,
				slots: row.slots.filter((_, slotIndex) => slotIndex !== index),
			})),
		});
	};

	const updateSlot = (rowIndex: number, slotIndex: number, value: string) => {
		if (!active) return;
		updateActive({
			rows: active.rows.map((row, index) =>
				index === rowIndex
					? {
							...row,
							slots: row.slots.map((slot, currentSlot) =>
								currentSlot === slotIndex ? value : slot,
							),
						}
					: row,
			),
		});
	};

	return (
		<Panel
			eyebrow="Routine"
			title="Section routines"
			description="Each section has its own weekly routine. Changes apply to the courses page and the calendar."
			testId="courses-routine-editor"
		>
			<div className="mb-4 flex flex-wrap gap-1.5">
				{draft.map((routine) => (
					<button
						key={routine.key}
						type="button"
						onClick={() => setActiveKey(routine.key)}
						className={[
							"rounded-full border px-2.5 py-1 text-[11px] transition-colors",
							routine.key === activeKey
								? "border-accent bg-accent/12 text-foreground"
								: "border-hairline text-muted-foreground hover:bg-surface-2",
						].join(" ")}
					>
						{routine.label || routine.key}
					</button>
				))}
			</div>

			{active ? (
				<div className="space-y-5">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Section label</Label>
							<Input
								value={active.label}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									updateActive({ label: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Shift</Label>
							<Input
								value={active.shift}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									updateActive({ shift: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Rooms</Label>
							<Input
								value={active.room}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									updateActive({ room: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Effective from</Label>
							<Input
								value={active.effectiveFrom}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									updateActive({ effectiveFrom: event.target.value })
								}
							/>
						</div>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between gap-2">
							<p className="text-[11px] font-medium text-foreground">
								Periods ({active.periods.length})
							</p>
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1 px-2 text-[10px]"
								disabled={!canManage}
								onClick={addPeriod}
							>
								<Plus className="h-3 w-3" /> Add period
							</Button>
						</div>
						<div className="space-y-1.5">
							{active.periods.map((period, index) => (
								<div
									// biome-ignore lint/suspicious/noArrayIndexKey: period order is the identity of the column
									key={index}
									className="grid grid-cols-[1fr_1fr_1fr_auto_auto] items-center gap-1.5 rounded-md border border-hairline bg-surface-2 px-2 py-1.5"
								>
									<Input
										aria-label={`Period ${index + 1} label`}
										value={period.label}
										disabled={!canManage}
										className="h-7 text-[11px]"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											updatePeriod(index, { label: event.target.value })
										}
									/>
									<Input
										aria-label={`Period ${index + 1} start`}
										value={period.start}
										disabled={!canManage}
										className="h-7 text-[11px]"
										placeholder="06:30"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											updatePeriod(index, { start: event.target.value })
										}
									/>
									<Input
										aria-label={`Period ${index + 1} end`}
										value={period.end}
										disabled={!canManage}
										className="h-7 text-[11px]"
										placeholder="07:15"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											updatePeriod(index, { end: event.target.value })
										}
									/>
									<label className="flex items-center gap-1 text-[10px] text-muted-foreground">
										<input
											type="checkbox"
											checked={Boolean(period.isBreak)}
											disabled={!canManage}
											onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
												updatePeriod(index, {
													isBreak: event.target.checked,
												})
											}
										/>
										Break
									</label>
									<button
										type="button"
										aria-label={`Remove period ${index + 1}`}
										className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive disabled:opacity-40"
										disabled={!canManage}
										onClick={() => removePeriod(index)}
									>
										<Trash2 className="h-3.5 w-3.5" />
									</button>
								</div>
							))}
							{active.periods.length === 0 ? (
								<p className="rounded-md border border-dashed border-hairline px-2.5 py-2 text-[11px] text-muted-foreground">
									No periods yet. Add one to start building the grid.
								</p>
							) : null}
						</div>
					</div>

					<div>
						<p className="mb-2 text-[11px] font-medium text-foreground">
							Weekly grid
						</p>
						<div className="overflow-x-auto rounded-md border border-hairline">
							<table className="w-full border-collapse text-[11px]">
								<thead>
									<tr className="bg-surface-2">
										<th className="border-b border-hairline px-2 py-1.5 text-left font-medium text-muted-foreground">
											Day
										</th>
										{active.periods.map((period, index) => (
											<th
												// biome-ignore lint/suspicious/noArrayIndexKey: period order is the identity of the column
												key={index}
												className="min-w-[96px] border-b border-l border-hairline px-2 py-1.5 text-left font-medium text-muted-foreground"
											>
												{period.label || `P${index + 1}`}
												{period.isBreak ? " · break" : ""}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{active.rows.map((row, rowIndex) => (
										<tr key={row.day}>
											<th className="border-t border-hairline px-2 py-1 text-left font-medium text-foreground">
												{row.day}
											</th>
											{active.periods.map((_, slotIndex) => (
												<td
													// biome-ignore lint/suspicious/noArrayIndexKey: grid cell position is stable per period
													key={slotIndex}
													className="border-l border-t border-hairline p-1"
												>
													<Input
														aria-label={`${row.day} period ${slotIndex + 1}`}
														value={row.slots[slotIndex] ?? ""}
														disabled={!canManage}
														className="h-7 min-w-[88px] text-[11px]"
														onChange={(
															event: React.ChangeEvent<HTMLInputElement>,
														) =>
															updateSlot(
																rowIndex,
																slotIndex,
																event.target.value,
															)
														}
													/>
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<Button
							size="sm"
							className="gap-1.5"
							disabled={!canManage || saving}
							onClick={() => onSave(draft)}
						>
							<Save className="h-3.5 w-3.5" />
							{saving ? "Saving…" : "Save routines"}
						</Button>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							disabled={!canManage || saving}
							onClick={() => setDraft(clone(routines))}
						>
							<RotateCcw className="h-3.5 w-3.5" /> Discard changes
						</Button>
					</div>
				</div>
			) : (
				<p className="text-[11px] text-muted-foreground">
					No routines are available yet.
				</p>
			)}
		</Panel>
	);
}
