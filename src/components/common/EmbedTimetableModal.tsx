import { CalendarClock, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Label } from "#/components/ui/label";
import { routines } from "#/lib/routines";

interface EmbedTimetableModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInsert: (html: string) => void;
}

export function generateRoutineHtml(options: {
	title: string;
	shift?: string;
	room?: string;
	effective?: string;
	periods: Array<{ label: string; time?: string; isBreak?: boolean }>;
	rows: Array<{ day: string; slots: string[] }>;
}): string {
	const headerCols = options.periods
		.map(
			(p) =>
				`<th style="padding: 8px 10px; font-weight: 600; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">
					${p.label}
					${p.time ? `<div style="font-size: 10px; font-weight: normal; color: #64748b; font-family: monospace;">${p.time}</div>` : ""}
				</th>`,
		)
		.join("");

	const bodyRows = options.rows
		.map(
			(row) =>
				`<tr>
					<td style="padding: 8px 10px; font-weight: 600; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px; white-space: nowrap;">${row.day}</td>
					${row.slots
						.map(
							(slot) =>
								`<td style="padding: 8px 10px; border: 1px solid #e2e8f0; font-size: 12px; ${
									slot.toLowerCase().includes("tiffin") ||
									slot.toLowerCase().includes("break")
										? "background: #f1f5f9; color: #64748b; font-style: italic;"
										: "color: #0f172a;"
								}">${slot}</td>`,
						)
						.join("")}
				</tr>`,
		)
		.join("");

	return `
<div class="embedded-routine-widget not-prose" style="margin: 20px 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; background: #ffffff; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
	<div class="routine-header" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-family: inherit;">
		<div style="display: flex; align-items: center; gap: 8px;">
			<strong style="font-size: 14px; color: #0f172a;">${options.title}</strong>
			${options.shift ? `<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background: rgba(220,38,38,0.1); color: #dc2626; font-size: 10px; font-weight: 600;">${options.shift}</span>` : ""}
		</div>
		${options.effective ? `<span style="font-size: 11px; color: #64748b;">Effective: ${options.effective}</span>` : ""}
	</div>
	<div style="overflow-x: auto; width: 100%;">
		<table style="width: 100%; border-collapse: collapse; text-align: left; margin: 0; font-family: inherit;">
			<thead>
				<tr>
					<th style="padding: 8px 10px; font-weight: 600; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; font-size: 11px;">Day</th>
					${headerCols}
				</tr>
			</thead>
			<tbody>
				${bodyRows}
			</tbody>
		</table>
	</div>
	${options.room ? `<div style="padding: 8px 16px; font-size: 11px; color: #64748b; background: #f8fafc; border-top: 1px solid #e2e8f0;">Venue: ${options.room}</div>` : ""}
</div>
<p></p>
`.trim();
}

export function EmbedTimetableModal({
	open,
	onOpenChange,
	onInsert,
}: EmbedTimetableModalProps) {
	const [selectedRoutineKey, setSelectedRoutineKey] = useState<string>(
		routines[0]?.key ?? "grade-11-12-science",
	);
	const [customTitle, setCustomTitle] = useState("");
	const [customShift, setCustomShift] = useState("Morning shift");

	const selectedRoutine =
		routines.find((r) => r.key === selectedRoutineKey) ?? routines[0];

	const handleInsert = () => {
		if (!selectedRoutine) return;

		const html = generateRoutineHtml({
			title: customTitle.trim() || selectedRoutine.label,
			shift: customShift || selectedRoutine.shift,
			room: selectedRoutine.room,
			effective: selectedRoutine.effectiveFrom,
			periods: selectedRoutine.periods.map((p) => ({
				label: p.label,
				time: `${p.start}–${p.end}`,
				isBreak: p.isBreak,
			})),
			rows: selectedRoutine.rows,
		});

		onInsert(html);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="sm:max-w-2xl max-h-[85vh] overflow-y-auto"
				data-testid="embed-timetable-modal"
			>
				<DialogHeader>
					<div className="flex items-center gap-2 text-primary">
						<CalendarClock className="h-5 w-5" />
						<DialogTitle className="text-lg">
							Embed Class Timetable / Routine
						</DialogTitle>
					</div>
					<DialogDescription>
						Insert an authentic school routine or examination timetable into
						this notice. Readers will see an interactive, responsive schedule.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-2">
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="space-y-1.5">
							<Label className="text-xs">Select Routine Preset</Label>
							<select
								value={selectedRoutineKey}
								onChange={(e) => {
									setSelectedRoutineKey(e.target.value);
									const found = routines.find((r) => r.key === e.target.value);
									if (found) {
										setCustomTitle(found.label);
										setCustomShift(found.shift || "Morning shift");
									}
								}}
								className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
								data-testid="embed-routine-select"
							>
								{routines.map((r) => (
									<option key={r.key} value={r.key}>
										{r.label}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-1.5">
							<Label className="text-xs">Shift / Timing Label</Label>
							<input
								type="text"
								value={customShift}
								onChange={(e) => setCustomShift(e.target.value)}
								placeholder="e.g. Morning shift / Day shift"
								className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="text-xs">Schedule Title</Label>
						<input
							type="text"
							value={customTitle}
							onChange={(e) => setCustomTitle(e.target.value)}
							placeholder={selectedRoutine?.label ?? "Routine Title"}
							className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary"
						/>
					</div>

					{/* Live Preview */}
					{selectedRoutine && (
						<div className="space-y-1.5 pt-2">
							<Label className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
								Preview
							</Label>
							<div className="rounded-lg border border-hairline bg-surface-2/40 p-3 overflow-hidden">
								<div className="flex items-center justify-between border-b border-hairline pb-2 mb-2 text-xs">
									<span className="font-semibold text-foreground">
										{customTitle || selectedRoutine.label}
									</span>
									<span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
										{customShift}
									</span>
								</div>

								<div className="overflow-x-auto">
									<table className="w-full text-[11px] border-collapse text-left">
										<thead>
											<tr className="border-b border-hairline bg-surface-2">
												<th className="p-1.5 font-semibold text-muted-foreground">
													Day
												</th>
												{selectedRoutine.periods.slice(0, 5).map((p) => (
													<th
														key={p.label}
														className="p-1.5 font-semibold text-muted-foreground"
													>
														{p.label}
													</th>
												))}
												{selectedRoutine.periods.length > 5 && (
													<th className="p-1.5 text-muted-foreground font-semibold">
														+{selectedRoutine.periods.length - 5} more…
													</th>
												)}
											</tr>
										</thead>
										<tbody>
											{selectedRoutine.rows.slice(0, 3).map((row) => (
												<tr
													key={row.day}
													className="border-b border-hairline/60"
												>
													<td className="p-1.5 font-semibold text-foreground">
														{row.day}
													</td>
													{row.slots.slice(0, 5).map((s, idx) => (
														<td key={idx} className="p-1.5 text-foreground/80">
															{s}
														</td>
													))}
													{row.slots.length > 5 && (
														<td className="p-1.5 text-muted-foreground">…</td>
													)}
												</tr>
											))}
										</tbody>
									</table>
								</div>
								<p className="mt-2 text-[10px] text-muted-foreground italic">
									Showing preview snippet · Full schedule with all days and
									periods will be embedded.
								</p>
							</div>
						</div>
					)}
				</div>

				<DialogFooter className="gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="button"
						size="sm"
						className="gap-1.5"
						onClick={handleInsert}
						data-testid="embed-timetable-confirm"
					>
						<Check className="h-3.5 w-3.5" />
						Insert Timetable into Notice
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
