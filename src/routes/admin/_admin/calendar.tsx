import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	CalendarDays,
	CalendarRange,
	Filter,
	Loader2,
	Plus,
	Power,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adToBs, bsToAd } from "#/lib/nepaliDate.ts";
import { cn } from "#/lib/utils";
import {
	activateAcademicYearAction,
	createAcademicYearAction,
	createCalendarEventAction,
	createTermAction,
	deleteCalendarEventAction,
	deleteTermAction,
	getCalendarDataFn,
	seedCalendarEventsAction,
} from "#/packages/academics/calendar-server.ts";

export const Route = createFileRoute("/admin/_admin/calendar")({
	beforeLoad: ({ context }) => {
		if (
			!context.viewer.permissions.includes("MANAGE_ACADEMICS") &&
			!context.viewer.permissions.includes("MANAGE_CONTENT")
		) {
			throw redirect({ to: "/admin" });
		}
	},
	component: AdminCalendar,
});

interface TermRow {
	id: string;
	name: string;
	startsOn: string | Date;
	endsOn: string | Date;
}

interface YearRow {
	id: string;
	name: string;
	startsOn: string | Date;
	endsOn: string | Date;
	isActive: boolean;
	terms: Array<TermRow>;
	_count: { timetableSlots: number };
}

interface CalendarEventRow {
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
	category?: string | null;
	term?: string | null;
}

const EVENT_KINDS = [
	{
		id: "holiday",
		label: "Holiday",
		color: "bg-red-100 text-red-800 border-red-200",
	},
	{
		id: "festival",
		label: "Festival",
		color: "bg-amber-100 text-amber-800 border-amber-200",
	},
	{
		id: "exam",
		label: "Examination",
		color: "bg-purple-100 text-purple-800 border-purple-200",
	},
	{
		id: "admission",
		label: "Admission",
		color: "bg-blue-100 text-blue-800 border-blue-200",
	},
	{
		id: "event",
		label: "School Event",
		color: "bg-emerald-100 text-emerald-800 border-emerald-200",
	},
];

function toInput(value: string | Date) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return date.toISOString().slice(0, 10);
}

function AdminCalendar() {
	const [activeTab, setActiveTab] = useState<"events" | "academic">("events");
	const [years, setYears] = useState<Array<YearRow>>([]);
	const [events, setEvents] = useState<Array<CalendarEventRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [termYearId, setTermYearId] = useState("");
	const [termVersion, setTermVersion] = useState(0);
	const [kindFilter, setKindFilter] = useState("all");

	// Two-way date syncing for calendar events form
	const [adStartDate, setAdStartDate] = useState("");
	const [adEndDate, setAdEndDate] = useState("");
	const [bsStartDate, setBsStartDate] = useState("");
	const [bsEndDate, setBsEndDate] = useState("");

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getCalendarDataFn();

		if (!response.success) {
			setError(response.error);
		} else {
			setYears(response.years as Array<YearRow>);
			setEvents((response.events ?? []) as Array<CalendarEventRow>);
			setError("");
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const handleAdStartChange = (val: string) => {
		setAdStartDate(val);
		if (val) {
			const bs = adToBs(val);
			if (bs) setBsStartDate(bs);
		}
	};

	const handleBsStartChange = (val: string) => {
		setBsStartDate(val);
		if (val.length === 10) {
			const ad = bsToAd(val);
			if (ad) setAdStartDate(ad);
		}
	};

	const handleAdEndChange = (val: string) => {
		setAdEndDate(val);
		if (val) {
			const bs = adToBs(val);
			if (bs) setBsEndDate(bs);
		}
	};

	const handleBsEndChange = (val: string) => {
		setBsEndDate(val);
		if (val.length === 10) {
			const ad = bsToAd(val);
			if (ad) setAdEndDate(ad);
		}
	};

	const createEvent = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);

		const title = String(data.get("title") ?? "").trim();
		const titleNe = String(data.get("titleNe") ?? "").trim();
		const kind = String(data.get("kind") ?? "event");
		const startDate = adStartDate || String(data.get("startDate") ?? "");
		const endDate = adEndDate || startDate;
		const startBs = bsStartDate || String(data.get("startBs") ?? "").trim();
		const endBs = bsEndDate || String(data.get("endBs") ?? "").trim();
		const description = String(data.get("description") ?? "").trim();
		const term = String(data.get("term") ?? "").trim();

		const response = await createCalendarEventAction({
			data: {
				title,
				titleNe: titleNe || undefined,
				kind,
				startDate,
				endDate,
				startBs: startBs || undefined,
				endBs: endBs || undefined,
				description: description || undefined,
				term: term || undefined,
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setAdStartDate("");
		setAdEndDate("");
		setBsStartDate("");
		setBsEndDate("");
		setEvents(response.events as Array<CalendarEventRow>);
		setNotice(
			"Calendar event created. It is now live on the public /calendar page.",
		);
	};

	const removeEvent = async (id: string) => {
		if (!confirm("Are you sure you want to delete this calendar event?"))
			return;

		setError("");
		const response = await deleteCalendarEventAction({ data: { id } });

		if (!response.success) {
			setError(response.error);
		} else {
			setEvents(response.events as Array<CalendarEventRow>);
			setNotice("Calendar event deleted.");
		}
	};

	const seedEvents = async () => {
		if (
			!confirm(
				"Populate standard school calendar events (48 events across all 12 Bikram Sambat months) into the database?",
			)
		) {
			return;
		}

		setIsSubmitting(true);
		setError("");
		const response = await seedCalendarEventsAction();
		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
		} else {
			setEvents(response.events as Array<CalendarEventRow>);
			setNotice("Default calendar events loaded successfully.");
		}
	};

	const createYear = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const response = await createAcademicYearAction({
			data: {
				name: String(data.get("name") ?? ""),
				startsOn: String(data.get("startsOn") ?? ""),
				endsOn: String(data.get("endsOn") ?? ""),
				isActive: data.get("isActive") === "on",
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setYears(response.years as Array<YearRow>);
		setNotice("Academic year created.");
	};

	const activate = async (id: string) => {
		setError("");
		const response = await activateAcademicYearAction({ data: { id } });

		if (!response.success) setError(response.error);
		else {
			setYears(response.years as Array<YearRow>);
			setNotice("Active year updated.");
		}
	};

	const createTerm = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		const response = await createTermAction({
			data: {
				academicYearId: termYearId,
				name: String(data.get("termName") ?? ""),
				startsOn: String(data.get("termStartsOn") ?? ""),
				endsOn: String(data.get("termEndsOn") ?? ""),
			},
		});

		setIsSubmitting(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		form.reset();
		setTermVersion((version) => version + 1);
		setYears(response.years as Array<YearRow>);
		setNotice("Term added.");
	};

	const removeTerm = async (id: string) => {
		if (!confirm("Delete this term?")) return;

		setError("");
		const response = await deleteTermAction({ data: { id } });

		if (!response.success) setError(response.error);
		else {
			setYears(response.years as Array<YearRow>);
			setNotice("Term deleted.");
		}
	};

	const allTerms = useMemo(() => {
		const result: Array<{ id: string; name: string; yearName: string }> = [];
		for (const y of years) {
			for (const t of y.terms) {
				result.push({ id: t.id, name: t.name, yearName: y.name });
			}
		}
		return result;
	}, [years]);

	const filteredEvents = useMemo(() => {
		if (kindFilter === "all") return events;
		return events.filter((e) => e.kind === kindFilter);
	}, [events, kindFilter]);

	return (
		<div className="space-y-8">
			{/* Top Header & Navigation Tabs */}
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-gray-200 pb-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">
						Calendar & Academic Cycles
					</h1>
					<p className="mt-1 text-sm text-gray-500">
						Manage dates for the public /calendar page, as well as operational
						academic years and terms.
					</p>
				</div>
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => setActiveTab("events")}
						data-testid="tab-calendar-events"
						className={cn(
							"flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
							activeTab === "events"
								? "bg-primary text-primary-foreground shadow-sm"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200",
						)}
					>
						<CalendarDays className="h-4 w-4" />
						Public Events ({events.length})
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("academic")}
						data-testid="tab-academic-cycles"
						className={cn(
							"flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
							activeTab === "academic"
								? "bg-primary text-primary-foreground shadow-sm"
								: "bg-gray-100 text-gray-700 hover:bg-gray-200",
						)}
					>
						<CalendarRange className="h-4 w-4" />
						Years & Terms ({years.length})
					</button>
				</div>
			</div>

			{/* Feedback banners */}
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

			{/* TAB 1: CALENDAR EVENTS */}
			{activeTab === "events" ? (
				<div className="space-y-8">
					{/* Add Calendar Event Form */}
					<section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-primary" /> Add Calendar Event /
							Date
						</h2>
						<form
							onSubmit={(event) => void createEvent(event)}
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
						>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Event Title (English) *
								</span>
								<input
									name="title"
									required
									placeholder="e.g. Nepali New Year 2083"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Title in Nepali (Optional)
								</span>
								<input
									name="titleNe"
									placeholder="e.g. नयाँ वर्ष २०८३"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Event Category / Kind *
								</span>
								<select
									name="kind"
									required
									defaultValue="holiday"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								>
									{EVENT_KINDS.map((k) => (
										<option key={k.id} value={k.id}>
											{k.label}
										</option>
									))}
								</select>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Start Date (AD) *
								</span>
								<input
									type="date"
									name="startDate"
									required
									value={adStartDate}
									onChange={(e) => handleAdStartChange(e.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Start Date (BS){" "}
									<span className="text-xs text-gray-400 font-normal">
										(auto-syncs)
									</span>
								</span>
								<input
									name="startBs"
									placeholder="YYYY-MM-DD (e.g. 2083-01-01)"
									value={bsStartDate}
									onChange={(e) => handleBsStartChange(e.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Associated Term (Optional)
								</span>
								<select
									name="term"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								>
									<option value="">No specific term</option>
									{allTerms.map((t) => (
										<option key={t.id} value={t.name}>
											{t.name} ({t.yearName})
										</option>
									))}
								</select>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									End Date (AD) (Optional range)
								</span>
								<input
									type="date"
									name="endDate"
									value={adEndDate}
									onChange={(e) => handleAdEndChange(e.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									End Date (BS){" "}
									<span className="text-xs text-gray-400 font-normal">
										(auto-syncs)
									</span>
								</span>
								<input
									name="endBs"
									placeholder="YYYY-MM-DD (e.g. 2083-01-05)"
									value={bsEndDate}
									onChange={(e) => handleBsEndChange(e.target.value)}
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<label className="text-sm md:col-span-2 lg:col-span-1">
								<span className="mb-1 block font-medium text-gray-700">
									Details / Note (Optional)
								</span>
								<input
									name="description"
									placeholder="e.g. School closed, or 10:00 to 14:00"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>

							<div className="md:col-span-2 lg:col-span-3 pt-2">
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-sm"
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<Plus className="h-4 w-4" />
									)}
									{isSubmitting ? "Saving…" : "Save Event to Calendar"}
								</button>
							</div>
						</form>
					</section>

					{/* Events List & Filter */}
					<section className="space-y-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div className="flex items-center gap-2">
								<Filter className="h-4 w-4 text-gray-400" />
								<span className="text-sm font-medium text-gray-700">
									Filter:
								</span>
								<button
									type="button"
									onClick={() => setKindFilter("all")}
									className={cn(
										"rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
										kindFilter === "all"
											? "bg-gray-800 text-white"
											: "bg-gray-100 text-gray-600 hover:bg-gray-200",
									)}
								>
									All ({events.length})
								</button>
								{EVENT_KINDS.map((k) => {
									const count = events.filter((e) => e.kind === k.id).length;
									return (
										<button
											key={k.id}
											type="button"
											onClick={() => setKindFilter(k.id)}
											className={cn(
												"rounded-md px-2.5 py-1 text-xs font-semibold transition-colors",
												kindFilter === k.id
													? "bg-gray-800 text-white"
													: "bg-gray-100 text-gray-600 hover:bg-gray-200",
											)}
										>
											{k.label} ({count})
										</button>
									);
								})}
							</div>

							{events.length === 0 && (
								<button
									type="button"
									onClick={() => void seedEvents()}
									disabled={isSubmitting}
									className="inline-flex items-center gap-1.5 rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors"
								>
									<Sparkles className="h-3.5 w-3.5" />
									Load Standard School Calendar Events
								</button>
							)}
						</div>

						{isLoading ? (
							<p className="flex items-center gap-2 text-sm text-gray-500">
								<Loader2 className="h-4 w-4 animate-spin" /> Loading calendar
								events…
							</p>
						) : filteredEvents.length === 0 ? (
							<div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500 space-y-3">
								<p>
									{events.length === 0
										? "No calendar events in the database yet. The public /calendar page is currently rendering default static events."
										: "No events match this filter."}
								</p>
								{events.length === 0 && (
									<button
										type="button"
										onClick={() => void seedEvents()}
										disabled={isSubmitting}
										className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
									>
										<Sparkles className="h-4 w-4" /> Load Default School
										Calendar Events
									</button>
								)}
							</div>
						) : (
							<div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
								<table className="w-full text-left text-sm text-gray-700">
									<thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase font-semibold text-gray-600">
										<tr>
											<th className="px-4 py-3">Event</th>
											<th className="px-4 py-3">Type</th>
											<th className="px-4 py-3">Date (Bikram Sambat)</th>
											<th className="px-4 py-3">Date (AD)</th>
											<th className="px-4 py-3">Details / Term</th>
											<th className="px-4 py-3 text-right">Actions</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-100">
										{filteredEvents.map((ev) => {
											const kindMeta = EVENT_KINDS.find(
												(k) => k.id === ev.kind,
											) ?? {
												label: ev.kind ?? "Event",
												color: "bg-gray-100 text-gray-800 border-gray-200",
											};
											const startBs =
												ev.startBs || adToBs(toInput(ev.startDate));
											const endBs =
												ev.endBs ||
												(ev.endDate ? adToBs(toInput(ev.endDate)) : null);
											const hasRange = endBs && endBs !== startBs;

											return (
												<tr
													key={ev.id}
													className="hover:bg-gray-50/80 transition-colors"
												>
													<td className="px-4 py-3 font-medium text-gray-900">
														<div>{ev.title}</div>
														{ev.titleNe && (
															<div className="text-xs text-gray-500 font-normal">
																{ev.titleNe}
															</div>
														)}
													</td>
													<td className="px-4 py-3">
														<span
															className={cn(
																"inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
																kindMeta.color,
															)}
														>
															{kindMeta.label}
														</span>
													</td>
													<td className="px-4 py-3 font-mono text-xs">
														{startBs}
														{hasRange ? ` → ${endBs}` : ""}
													</td>
													<td className="px-4 py-3 text-xs text-gray-600">
														{toInput(ev.startDate)}
														{toInput(ev.endDate) !== toInput(ev.startDate)
															? ` → ${toInput(ev.endDate)}`
															: ""}
													</td>
													<td className="px-4 py-3 text-xs text-gray-600">
														{ev.term && (
															<span className="mr-2 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-700">
																{ev.term}
															</span>
														)}
														{ev.description || "—"}
													</td>
													<td className="px-4 py-3 text-right">
														<button
															type="button"
															onClick={() => void removeEvent(ev.id)}
															className="inline-flex items-center gap-1 rounded p-1 text-xs font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors"
															title="Delete event"
														>
															<Trash2 className="h-4 w-4" />
															<span className="sr-only">Delete</span>
														</button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</section>
				</div>
			) : (
				/* TAB 2: ACADEMIC YEARS & TERMS */
				<div className="space-y-8">
					<section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
							<Plus className="h-5 w-5 text-primary" /> New Academic Year
						</h2>
						<form
							onSubmit={(event) => void createYear(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Year Name *
								</span>
								<input
									name="name"
									required
									placeholder="2026-27"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<label className="flex items-end gap-2 pb-2.5 text-sm text-gray-700">
								<input
									type="checkbox"
									name="isActive"
									className="rounded border-gray-300 text-primary"
								/>{" "}
								Make this the active year
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Starts on *
								</span>
								<input
									type="date"
									name="startsOn"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Ends on *
								</span>
								<input
									type="date"
									name="endsOn"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<div className="md:col-span-2">
								<button
									type="submit"
									disabled={isSubmitting}
									className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-sm"
								>
									{isSubmitting ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<CalendarRange className="h-4 w-4" />
									)}
									{isSubmitting ? "Saving…" : "Create Academic Year"}
								</button>
							</div>
						</form>
					</section>

					<section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
						<h2 className="mb-4 text-lg font-semibold text-gray-900">
							Add Term to Academic Year
						</h2>
						<form
							key={`${termYearId}-${termVersion}`}
							onSubmit={(event) => void createTerm(event)}
							className="grid gap-4 md:grid-cols-4"
						>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Academic Year *
								</span>
								<select
									value={termYearId}
									onChange={(event) => setTermYearId(event.target.value)}
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								>
									<option value="">Select a year…</option>
									{years.map((year) => (
										<option key={year.id} value={year.id}>
											{year.name}
										</option>
									))}
								</select>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Term Name *
								</span>
								<input
									name="termName"
									required
									placeholder="e.g. First Term"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Starts *
								</span>
								<input
									type="date"
									name="termStartsOn"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Ends *
								</span>
								<input
									type="date"
									name="termEndsOn"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
								/>
							</label>
							<div className="md:col-span-4">
								<button
									type="submit"
									disabled={isSubmitting || !termYearId}
									className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60 shadow-sm"
								>
									Add Term
								</button>
							</div>
						</form>
					</section>

					<section className="space-y-4">
						{isLoading ? (
							<p className="flex items-center gap-2 text-sm text-gray-500">
								<Loader2 className="h-4 w-4 animate-spin" /> Loading academic
								years…
							</p>
						) : years.length === 0 ? (
							<p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
								No academic years yet. Create one above.
							</p>
						) : (
							years.map((year) => (
								<article
									key={year.id}
									className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
								>
									<header className="flex flex-wrap items-center justify-between gap-3">
										<div>
											<h2 className="text-lg font-semibold text-gray-900">
												{year.name}
												{year.isActive ? (
													<span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700">
														Active
													</span>
												) : null}
											</h2>
											<p className="text-xs text-gray-500">
												{toInput(year.startsOn)} → {toInput(year.endsOn)} ·{" "}
												{year._count.timetableSlots} timetable slot
												{year._count.timetableSlots === 1 ? "" : "s"}
											</p>
										</div>
										{!year.isActive ? (
											<button
												type="button"
												onClick={() => void activate(year.id)}
												className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
											>
												<Power className="h-3.5 w-3.5" /> Make active
											</button>
										) : null}
									</header>

									{year.terms.length === 0 ? (
										<p className="mt-3 text-sm text-gray-500">
											No terms yet for this year.
										</p>
									) : (
										<ul className="mt-4 divide-y divide-gray-100">
											{year.terms.map((term) => (
												<li
													key={term.id}
													className="flex flex-wrap items-center justify-between gap-3 py-2"
												>
													<div>
														<p className="text-sm font-medium text-gray-900">
															{term.name}
														</p>
														<p className="text-xs text-gray-500">
															{toInput(term.startsOn)} → {toInput(term.endsOn)}
														</p>
													</div>
													<button
														type="button"
														onClick={() => void removeTerm(term.id)}
														className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
													>
														<Trash2 className="h-3.5 w-3.5" /> Delete
													</button>
												</li>
											))}
										</ul>
									)}
								</article>
							))
						)}
					</section>
				</div>
			)}
		</div>
	);
}
