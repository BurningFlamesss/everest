import { createFileRoute, redirect } from "@tanstack/react-router";
import {
	AlertTriangle,
	CalendarClock,
	CalendarDays,
	CalendarRange,
	CheckCircle2,
	Loader2,
	Plus,
	Power,
	Sparkles,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import { Label } from "#/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
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
	{ id: "holiday", label: "Holiday" },
	{ id: "festival", label: "Festival" },
	{ id: "exam", label: "Examination" },
	{ id: "admission", label: "Admission" },
	{ id: "event", label: "School Event" },
] as const;

function kindLabel(kind?: string | null) {
	return EVENT_KINDS.find((k) => k.id === kind)?.label ?? kind ?? "Event";
}

const fieldClasses =
	"h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring";

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
	const [isDeletingEvent, setIsDeletingEvent] = useState(false);
	const [isSeeding, setIsSeeding] = useState(false);
	const [isDeletingTerm, setIsDeletingTerm] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [termYearId, setTermYearId] = useState("");
	const [termVersion, setTermVersion] = useState(0);
	const [kindFilter, setKindFilter] = useState("all");

	const [pendingEventDelete, setPendingEventDelete] =
		useState<CalendarEventRow | null>(null);
	const [pendingSeed, setPendingSeed] = useState(false);
	const [pendingTermDelete, setPendingTermDelete] = useState<{
		term: TermRow;
		yearName: string;
	} | null>(null);

	// Two-way date syncing for calendar events form
	const [adStartDate, setAdStartDate] = useState("");
	const [adEndDate, setAdEndDate] = useState("");
	const [bsStartDate, setBsStartDate] = useState("");
	const [bsEndDate, setBsEndDate] = useState("");

	const load = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getCalendarDataFn();

			if (!response.success) {
				setError(response.error);
			} else {
				setYears(response.years as Array<YearRow>);
				setEvents((response.events ?? []) as Array<CalendarEventRow>);
				setError("");
			}
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Could not load the calendar.",
			);
		} finally {
			setIsLoading(false);
		}
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

		try {
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
		} catch (createError) {
			setError(
				createError instanceof Error
					? createError.message
					: "Could not create this event.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeEvent = async (row: CalendarEventRow) => {
		setIsDeletingEvent(true);
		setError("");
		try {
			const response = await deleteCalendarEventAction({
				data: { id: row.id },
			});

			if (!response.success) {
				setError(response.error);
				setPendingEventDelete(null);
			} else {
				setEvents(response.events as Array<CalendarEventRow>);
				setPendingEventDelete(null);
				setNotice("Calendar event deleted.");
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this event.",
			);
			setPendingEventDelete(null);
		} finally {
			setIsDeletingEvent(false);
		}
	};

	const seedEvents = async () => {
		setIsSeeding(true);
		setError("");
		try {
			const response = await seedCalendarEventsAction();

			if (!response.success) {
				setError(response.error);
				setPendingSeed(false);
			} else {
				setEvents(response.events as Array<CalendarEventRow>);
				setPendingSeed(false);
				setNotice("Default calendar events loaded successfully.");
			}
		} catch (seedError) {
			setError(
				seedError instanceof Error
					? seedError.message
					: "Could not load the default events.",
			);
			setPendingSeed(false);
		} finally {
			setIsSeeding(false);
		}
	};

	const createYear = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		try {
			const response = await createAcademicYearAction({
				data: {
					name: String(data.get("name") ?? ""),
					startsOn: String(data.get("startsOn") ?? ""),
					endsOn: String(data.get("endsOn") ?? ""),
					isActive: data.get("isActive") === "on",
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			form.reset();
			setYears(response.years as Array<YearRow>);
			setNotice("Academic year created.");
		} catch (yearError) {
			setError(
				yearError instanceof Error
					? yearError.message
					: "Could not create this academic year.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const activate = async (id: string) => {
		setError("");
		try {
			const response = await activateAcademicYearAction({ data: { id } });

			if (!response.success) setError(response.error);
			else {
				setYears(response.years as Array<YearRow>);
				setNotice("Active year updated.");
			}
		} catch (activateError) {
			setError(
				activateError instanceof Error
					? activateError.message
					: "Could not activate this year.",
			);
		}
	};

	const createTerm = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);
		try {
			const response = await createTermAction({
				data: {
					academicYearId: termYearId,
					name: String(data.get("termName") ?? ""),
					startsOn: String(data.get("termStartsOn") ?? ""),
					endsOn: String(data.get("termEndsOn") ?? ""),
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			form.reset();
			setTermVersion((version) => version + 1);
			setYears(response.years as Array<YearRow>);
			setNotice("Term added.");
		} catch (termError) {
			setError(
				termError instanceof Error
					? termError.message
					: "Could not add this term.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const removeTerm = async (id: string) => {
		setIsDeletingTerm(true);
		setError("");
		try {
			const response = await deleteTermAction({ data: { id } });

			if (!response.success) {
				setError(response.error);
				setPendingTermDelete(null);
			} else {
				setYears(response.years as Array<YearRow>);
				setPendingTermDelete(null);
				setNotice("Term deleted.");
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this term.",
			);
			setPendingTermDelete(null);
		} finally {
			setIsDeletingTerm(false);
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

	const eventsEmpty = events.length === 0;

	return (
		<div className="space-y-5" data-testid="calendar-page">
			<PageHeader
				eyebrow="Academics"
				title="Calendar &amp; academic cycles"
				description="Manage dates for the public /calendar page, as well as operational academic years and terms."
				meta={
					<>
						<span data-testid="calendar-event-count">
							{events.length} event{events.length === 1 ? "" : "s"}
						</span>
						<span data-testid="calendar-year-count">
							{years.length} academic year{years.length === 1 ? "" : "s"}
						</span>
					</>
				}
				testId="calendar-page-header"
			/>

			<Tabs
				value={activeTab}
				onValueChange={(value: string) =>
					setActiveTab(value as "events" | "academic")
				}
			>
				<TabsList className="h-9" data-testid="calendar-tabs">
					<TabsTrigger value="events" data-testid="tab-calendar-events">
						<CalendarDays className="mr-1.5 h-3.5 w-3.5" />
						Public events ({events.length})
					</TabsTrigger>
					<TabsTrigger value="academic" data-testid="tab-academic-cycles">
						<CalendarRange className="mr-1.5 h-3.5 w-3.5" />
						Years &amp; terms ({years.length})
					</TabsTrigger>
				</TabsList>
			</Tabs>

			{error ? (
				<div
					className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
					data-testid="calendar-error-banner"
				>
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{error}</p>
				</div>
			) : null}
			{notice ? (
				<div
					className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
					data-testid="calendar-notice-banner"
				>
					<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{notice}</p>
				</div>
			) : null}

			{activeTab === "events" ? (
				<div className="space-y-5">
					<Panel
						title="Add calendar event"
						description="Dates publish straight to the public /calendar page."
						testId="calendar-new-event-panel"
						bodyClassName="p-5"
					>
						<form
							onSubmit={(event) => void createEvent(event)}
							className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
						>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-title" className="text-xs">
									Event title (English) *
								</Label>
								<input
									id="calendar-event-title"
									name="title"
									required
									placeholder="e.g. Nepali New Year 2083"
									className={fieldClasses}
									data-testid="calendar-event-title"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-title-ne" className="text-xs">
									Title in Nepali (optional)
								</Label>
								<input
									id="calendar-event-title-ne"
									name="titleNe"
									placeholder="e.g. नयाँ वर्ष २०८३"
									className={fieldClasses}
									data-testid="calendar-event-title-ne"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-kind" className="text-xs">
									Event category / kind *
								</Label>
								<select
									id="calendar-event-kind"
									name="kind"
									required
									defaultValue="holiday"
									className={fieldClasses}
									data-testid="calendar-event-kind"
								>
									{EVENT_KINDS.map((k) => (
										<option key={k.id} value={k.id}>
											{k.label}
										</option>
									))}
								</select>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-start" className="text-xs">
									Start date (AD) *
								</Label>
								<input
									id="calendar-event-start"
									type="date"
									name="startDate"
									required
									value={adStartDate}
									onChange={(e) => handleAdStartChange(e.target.value)}
									className={fieldClasses}
									data-testid="calendar-event-start"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-start-bs" className="text-xs">
									Start date (BS){" "}
									<span className="font-normal text-muted-foreground">
										(auto-syncs)
									</span>
								</Label>
								<input
									id="calendar-event-start-bs"
									name="startBs"
									placeholder="YYYY-MM-DD (e.g. 2083-01-01)"
									value={bsStartDate}
									onChange={(e) => handleBsStartChange(e.target.value)}
									className={fieldClasses}
									data-testid="calendar-event-start-bs"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-term" className="text-xs">
									Associated term (optional)
								</Label>
								<select
									id="calendar-event-term"
									name="term"
									className={fieldClasses}
									data-testid="calendar-event-term"
								>
									<option value="">No specific term</option>
									{allTerms.map((t) => (
										<option key={t.id} value={t.name}>
											{t.name} ({t.yearName})
										</option>
									))}
								</select>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-end" className="text-xs">
									End date (AD) (optional range)
								</Label>
								<input
									id="calendar-event-end"
									type="date"
									name="endDate"
									value={adEndDate}
									onChange={(e) => handleAdEndChange(e.target.value)}
									className={fieldClasses}
									data-testid="calendar-event-end"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-end-bs" className="text-xs">
									End date (BS){" "}
									<span className="font-normal text-muted-foreground">
										(auto-syncs)
									</span>
								</Label>
								<input
									id="calendar-event-end-bs"
									name="endBs"
									placeholder="YYYY-MM-DD (e.g. 2083-01-05)"
									value={bsEndDate}
									onChange={(e) => handleBsEndChange(e.target.value)}
									className={fieldClasses}
									data-testid="calendar-event-end-bs"
								/>
							</label>

							<label className="space-y-1.5">
								<Label htmlFor="calendar-event-note" className="text-xs">
									Details / note (optional)
								</Label>
								<input
									id="calendar-event-note"
									name="description"
									placeholder="e.g. School closed, or 10:00 to 14:00"
									className={fieldClasses}
									data-testid="calendar-event-note"
								/>
							</label>

							<div className="pt-2 md:col-span-2 lg:col-span-3">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSubmitting}
									data-testid="calendar-event-submit"
								>
									{isSubmitting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Plus className="h-3.5 w-3.5" />
									)}
									{isSubmitting ? "Saving…" : "Save event to calendar"}
								</Button>
							</div>
						</form>
					</Panel>

					<Panel
						title="Calendar events"
						description="Everything published on the public /calendar page."
						actions={
							eventsEmpty ? (
								<Button
									type="button"
									variant="outline"
									size="sm"
									className="gap-1.5"
									disabled={isSubmitting || isSeeding}
									onClick={() => setPendingSeed(true)}
									data-testid="calendar-seed"
								>
									{isSeeding ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Sparkles className="h-3.5 w-3.5" />
									)}
									Load standard events
								</Button>
							) : null
						}
						testId="calendar-events-panel"
						bodyClassName="p-0"
					>
						<div
							className="flex flex-wrap items-center gap-1.5 border-b border-hairline px-5 py-3"
							data-testid="calendar-kind-filter"
						>
							<span className="mr-1 text-xs font-medium text-muted-foreground">
								Filter:
							</span>
							{["all", ...EVENT_KINDS.map((k) => k.id)].map((id) => {
								const count =
									id === "all"
										? events.length
										: events.filter((e) => e.kind === id).length;
								return (
									<button
										key={id}
										type="button"
										onClick={() => setKindFilter(id)}
										className={cn(
											"rounded-full border px-2.5 py-1 text-xs font-medium transition-colors duration-150",
											kindFilter === id
												? "border-primary/40 bg-primary/12 text-primary"
												: "border-hairline bg-surface-1 text-muted-foreground hover:text-foreground",
										)}
										data-testid={`calendar-filter-${id}`}
									>
										{id === "all" ? "All" : kindLabel(id)} ({count})
									</button>
								);
							})}
						</div>

						{isLoading ? (
							<div className="p-5" data-testid="calendar-events-loading">
								<ListSkeleton rows={5} />
							</div>
						) : filteredEvents.length === 0 ? (
							<EmptyState
								icon={CalendarClock}
								title={
									eventsEmpty ? "No calendar events" : "No matching events"
								}
								description={
									eventsEmpty
										? "The public /calendar page is currently rendering default static events."
										: "No events match this filter."
								}
								{...(eventsEmpty
									? {
											primaryLabel: "Load standard events",
											onPrimary: () => setPendingSeed(true),
										}
									: {})}
								testId="calendar-events-empty"
							/>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full min-w-[720px] border-collapse text-sm">
									<thead className="bg-surface-2">
										<tr className="border-b border-hairline">
											<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Event
											</th>
											<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Type
											</th>
											<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Date (Bikram Sambat)
											</th>
											<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Date (AD)
											</th>
											<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Details / term
											</th>
											<th className="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Actions
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-hairline">
										{filteredEvents.map((ev) => {
											const startBs =
												ev.startBs || adToBs(toInput(ev.startDate));
											const endBs =
												ev.endBs ||
												(ev.endDate ? adToBs(toInput(ev.endDate)) : null);
											const hasRange = endBs && endBs !== startBs;

											return (
												<tr
													key={ev.id}
													data-testid={`calendar-event-${ev.id}`}
													className="transition-colors duration-150 hover:bg-surface-2"
												>
													<td className="px-4 py-2.5 font-medium text-foreground">
														<div>{ev.title}</div>
														{ev.titleNe && (
															<div className="text-xs font-normal text-muted-foreground">
																{ev.titleNe}
															</div>
														)}
													</td>
													<td className="px-4 py-2.5">
														<StatusBadge
															value={ev.kind ?? "event"}
															testId={`calendar-event-kind-${ev.id}`}
														/>
													</td>
													<td className="num px-4 py-2.5 text-xs text-foreground">
														{startBs}
														{hasRange ? ` → ${endBs}` : ""}
													</td>
													<td className="num px-4 py-2.5 text-xs text-muted-foreground">
														{toInput(ev.startDate)}
														{toInput(ev.endDate) !== toInput(ev.startDate)
															? ` → ${toInput(ev.endDate)}`
															: ""}
													</td>
													<td className="px-4 py-2.5 text-xs text-muted-foreground">
														{ev.term && (
															<span className="mr-2 inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium text-muted-foreground">
																{ev.term}
															</span>
														)}
														{ev.description || "—"}
													</td>
													<td className="px-4 py-2.5 text-right">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
															onClick={() => setPendingEventDelete(ev)}
															data-testid={`calendar-event-delete-${ev.id}`}
														>
															<Trash2 className="h-3.5 w-3.5" /> Delete
														</Button>
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						)}
					</Panel>
				</div>
			) : (
				<div className="space-y-5">
					<Panel
						title="New academic year"
						description="Operational years group terms and timetable slots."
						testId="calendar-new-year-panel"
						bodyClassName="p-5"
					>
						<form
							onSubmit={(event) => void createYear(event)}
							className="grid gap-4 md:grid-cols-2"
						>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-year-name" className="text-xs">
									Year name *
								</Label>
								<input
									id="calendar-year-name"
									name="name"
									required
									placeholder="2026-27"
									className={fieldClasses}
									data-testid="calendar-year-name"
								/>
							</label>
							<label className="flex items-end gap-2 pb-2.5 text-sm text-muted-foreground">
								<input
									type="checkbox"
									name="isActive"
									className="h-4 w-4 rounded border-hairline accent-primary focus-ring"
									data-testid="calendar-year-active"
								/>
								Make this the active year
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-year-start" className="text-xs">
									Starts on *
								</Label>
								<input
									id="calendar-year-start"
									type="date"
									name="startsOn"
									required
									className={fieldClasses}
									data-testid="calendar-year-start"
								/>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-year-end" className="text-xs">
									Ends on *
								</Label>
								<input
									id="calendar-year-end"
									type="date"
									name="endsOn"
									required
									className={fieldClasses}
									data-testid="calendar-year-end"
								/>
							</label>
							<div className="md:col-span-2">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSubmitting}
									data-testid="calendar-year-submit"
								>
									{isSubmitting ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<CalendarRange className="h-3.5 w-3.5" />
									)}
									{isSubmitting ? "Saving…" : "Create academic year"}
								</Button>
							</div>
						</form>
					</Panel>

					<Panel
						title="Add term to academic year"
						description="Terms drive fees, exams and report cards."
						testId="calendar-new-term-panel"
						bodyClassName="p-5"
					>
						<form
							key={`${termYearId}-${termVersion}`}
							onSubmit={(event) => void createTerm(event)}
							className="grid gap-4 md:grid-cols-4"
						>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-term-year" className="text-xs">
									Academic year *
								</Label>
								<select
									id="calendar-term-year"
									value={termYearId}
									onChange={(event) => setTermYearId(event.target.value)}
									required
									className={fieldClasses}
									data-testid="calendar-term-year"
								>
									<option value="">Select a year…</option>
									{years.map((year) => (
										<option key={year.id} value={year.id}>
											{year.name}
										</option>
									))}
								</select>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-term-name" className="text-xs">
									Term name *
								</Label>
								<input
									id="calendar-term-name"
									name="termName"
									required
									placeholder="e.g. First Term"
									className={fieldClasses}
									data-testid="calendar-term-name"
								/>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-term-start" className="text-xs">
									Starts *
								</Label>
								<input
									id="calendar-term-start"
									type="date"
									name="termStartsOn"
									required
									className={fieldClasses}
									data-testid="calendar-term-start"
								/>
							</label>
							<label className="space-y-1.5">
								<Label htmlFor="calendar-term-end" className="text-xs">
									Ends *
								</Label>
								<input
									id="calendar-term-end"
									type="date"
									name="termEndsOn"
									required
									className={fieldClasses}
									data-testid="calendar-term-end"
								/>
							</label>
							<div className="md:col-span-4">
								<Button
									type="submit"
									size="sm"
									disabled={isSubmitting || !termYearId}
									data-testid="calendar-term-submit"
								>
									Add term
								</Button>
							</div>
						</form>
					</Panel>

					{isLoading ? (
						<div className="panel p-5" data-testid="calendar-years-loading">
							<ListSkeleton rows={4} />
						</div>
					) : years.length === 0 ? (
						<div className="panel">
							<EmptyState
								icon={CalendarRange}
								title="No academic years"
								description="No academic years yet. Create one above."
								testId="calendar-years-empty"
							/>
						</div>
					) : (
						<div className="space-y-4">
							{years.map((year) => (
								<Panel
									key={year.id}
									title={year.name}
									description={`${toInput(year.startsOn)} → ${toInput(year.endsOn)} · ${year._count.timetableSlots} timetable slot${year._count.timetableSlots === 1 ? "" : "s"}`}
									actions={
										<div className="flex items-center gap-2">
											{year.isActive ? (
												<StatusBadge
													value="active"
													testId={`calendar-year-status-${year.id}`}
												/>
											) : (
												<Button
													type="button"
													variant="outline"
													size="sm"
													className="h-7 gap-1 px-2 text-xs"
													onClick={() => void activate(year.id)}
													data-testid={`calendar-year-activate-${year.id}`}
												>
													<Power className="h-3.5 w-3.5" /> Make active
												</Button>
											)}
										</div>
									}
									testId={`calendar-year-${year.id}`}
									bodyClassName="p-0"
								>
									{year.terms.length === 0 ? (
										<p
											className="px-5 py-4 text-sm text-muted-foreground"
											data-testid={`calendar-year-terms-empty-${year.id}`}
										>
											No terms yet for this year.
										</p>
									) : (
										<ul className="divide-y divide-hairline/60">
											{year.terms.map((term) => (
												<li
													key={term.id}
													data-testid={`calendar-term-${term.id}`}
													className="flex flex-wrap items-center justify-between gap-3 px-5 py-3"
												>
													<div className="min-w-0">
														<p className="text-sm font-medium text-foreground">
															{term.name}
														</p>
														<p className="num mt-0.5 text-xs text-muted-foreground">
															{toInput(term.startsOn)} → {toInput(term.endsOn)}
														</p>
													</div>
													<Button
														type="button"
														variant="ghost"
														size="sm"
														className="h-7 shrink-0 gap-1 px-2 text-xs text-destructive hover:text-destructive"
														onClick={() =>
															setPendingTermDelete({
																term,
																yearName: year.name,
															})
														}
														data-testid={`calendar-term-delete-${term.id}`}
													>
														<Trash2 className="h-3.5 w-3.5" /> Delete
													</Button>
												</li>
											))}
										</ul>
									)}
								</Panel>
							))}
						</div>
					)}
				</div>
			)}

			<ConfirmDialog
				open={!!pendingEventDelete}
				onOpenChange={(open) => !open && setPendingEventDelete(null)}
				testId="calendar-event-delete-confirm"
				title="Delete this calendar event?"
				description={`Delete "${pendingEventDelete?.title ?? ""}"? It disappears from the public /calendar page immediately.`}
				confirmLabel="Delete event"
				destructive
				busy={isDeletingEvent}
				onConfirm={() =>
					pendingEventDelete && void removeEvent(pendingEventDelete)
				}
			/>

			<ConfirmDialog
				open={pendingSeed}
				onOpenChange={(open) => !open && setPendingSeed(false)}
				testId="calendar-seed-confirm"
				title="Load standard school calendar events?"
				description="This populates 48 standard events across all 12 Bikram Sambat months into the database."
				confirmLabel="Load events"
				busy={isSeeding}
				onConfirm={() => void seedEvents()}
			/>

			<ConfirmDialog
				open={!!pendingTermDelete}
				onOpenChange={(open) => !open && setPendingTermDelete(null)}
				testId="calendar-term-delete-confirm"
				title="Delete this term?"
				description={`Delete ${pendingTermDelete?.term.name ?? "this term"} from ${pendingTermDelete?.yearName ?? "this year"}?`}
				confirmLabel="Delete term"
				destructive
				busy={isDeletingTerm}
				onConfirm={() =>
					pendingTermDelete && void removeTerm(pendingTermDelete.term.id)
				}
			/>
		</div>
	);
}
