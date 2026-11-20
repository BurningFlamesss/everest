import { useEffect, useMemo, useState } from "react";
import type { Routine } from "#/types";
import { RoutineTable } from "../shared/RoutineTable";
import { Eyebrow, WidgetCaption } from "../Text";

/**
 * Public section routine. The timetable is section-specific, so the selector
 * lists the same routines the school publishes (grades 1–5, 6–8, 9–10, +2
 * Science, +2 Management and any admin-defined sections).
 */
export function RoutineViewer({
	routines,
	initialKey,
}: {
	routines: Routine[];
	initialKey?: string;
}) {
	const [selectedKey, setSelectedKey] = useState(
		initialKey && routines.some((routine) => routine.key === initialKey)
			? initialKey
			: (routines[0]?.key ?? ""),
	);

	useEffect(() => {
		if (initialKey && routines.some((routine) => routine.key === initialKey)) {
			setSelectedKey(initialKey);
		}
	}, [initialKey, routines]);

	const routine = useMemo(
		() => routines.find((item) => item.key === selectedKey) ?? routines[0],
		[routines, selectedKey],
	);

	if (!routine) {
		return (
			<div className="flex flex-col gap-2" data-testid="routine-viewer">
				<Eyebrow tone="muted">Class routine</Eyebrow>
				<WidgetCaption>
					No section routines have been published yet.
				</WidgetCaption>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-8" data-testid="routine-viewer">
			<div className="flex flex-col gap-2">
				<Eyebrow tone="muted">Class routine</Eyebrow>
				<WidgetCaption>
					The period running right now is highlighted, in Nepal time.
				</WidgetCaption>
			</div>

			<label className="flex max-w-sm flex-col gap-1.5 text-sm font-medium text-foreground">
				Class
				<select
					value={routine.key}
					onChange={(event) => setSelectedKey(event.target.value)}
					data-testid="routine-class-select"
					className="flex min-h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{routines.map((item) => (
						<option
							key={item.key}
							value={item.key}
							className="text-foreground bg-background"
						>
							{item.label || item.key}
						</option>
					))}
				</select>
			</label>

			<div className="-mx-2 sm:-mx-0">
				<RoutineTable routine={routine} />
			</div>
		</div>
	);
}
