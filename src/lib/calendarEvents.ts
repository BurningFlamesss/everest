import type { CalEvent, EventKind } from "#/content/types";
import { adToBs } from "#/lib/nepaliDate";

/**
 * Shape of a calendar event row as returned by getCalendarEventsServer
 * (dates already serialized to ISO strings).
 */
export interface CalendarEventRow {
	id: string;
	slug?: string | null;
	title: string;
	titleNe?: string | null;
	description?: string | null;
	startDate: string;
	endDate: string;
	startBs?: string | null;
	endBs?: string | null;
	kind?: string | null;
}

const EVENT_KINDS: EventKind[] = [
	"exam",
	"holiday",
	"festival",
	"event",
	"admission",
];

function toEventKind(value: string | null | undefined): EventKind {
	return EVENT_KINDS.includes(value as EventKind)
		? (value as EventKind)
		: "event";
}

/** Date portion ("YYYY-MM-DD") of an ISO datetime, in UTC to avoid TZ drift. */
function isoDateOnly(iso: string): string {
	return iso.slice(0, 10);
}

/**
 * Adapt a DB calendar-event row to the CalEvent shape the public calendar
 * renders. BS dates come from the authored startBs/endBs columns when present,
 * otherwise derived from the Gregorian startDate via the verified table.
 */
export function toCalEvent(row: CalendarEventRow): CalEvent {
	const startAd = isoDateOnly(row.startDate);
	const startBs = row.startBs ?? adToBs(startAd) ?? "";

	// A stored end date that lands on the same day as the start is treated as
	// "no range" (single-day event), matching the static CalEvent convention.
	const endAd = isoDateOnly(row.endDate);
	const hasRange =
		(row.endBs != null && row.endBs !== row.startBs) ||
		(row.endBs == null && endAd !== startAd);
	const endBs = hasRange ? (row.endBs ?? adToBs(endAd) ?? "") : undefined;

	return {
		id: row.slug ?? row.id,
		kind: toEventKind(row.kind),
		title: row.title,
		titleNe: row.titleNe ?? undefined,
		date: { bs: startBs, ad: startAd },
		endDate: hasRange && endBs ? { bs: endBs, ad: endAd } : undefined,
		detail: row.description ?? undefined,
		allDay: true,
	};
}

export function toCalEvents(
	rows: CalendarEventRow[] | null | undefined,
): CalEvent[] {
	return (rows ?? []).map(toCalEvent);
}
