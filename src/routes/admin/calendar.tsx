import { createFileRoute, redirect } from "@tanstack/react-router";
import { CalendarRange, Loader2, Plus, Power, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
	activateAcademicYearAction,
	createAcademicYearAction,
	createTermAction,
	deleteTermAction,
	getCalendarDataFn,
} from "#/packages/academics/calendar-server.ts";

export const Route = createFileRoute("/admin/calendar")({
	beforeLoad: ({ context }) => {
		if (!context.viewer.permissions.includes("MANAGE_ACADEMICS")) {
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

function toInput(value: string | Date) {
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "";

	return date.toISOString().slice(0, 10);
}

function AdminCalendar() {
	const [years, setYears] = useState<Array<YearRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [termYearId, setTermYearId] = useState("");
	const [termVersion, setTermVersion] = useState(0);

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getCalendarDataFn();

		if (!response.success) {
			setError(response.error);
		} else {
			setYears(response.years as Array<YearRow>);
			setError("");
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

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

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Academic calendar</h1>
				<p className="mt-1 text-sm text-gray-500">
					One year is active at a time. Terms define the windows used by exams
					and fee structures.
				</p>
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

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Plus className="h-5 w-5 text-red-500" /> New academic year
				</h2>
				<form
					onSubmit={(event) => void createYear(event)}
					className="grid gap-4 md:grid-cols-2"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Name</span>
						<input
							name="name"
							required
							placeholder="2026-27"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="flex items-end gap-2 pb-2.5 text-sm text-gray-700">
						<input type="checkbox" name="isActive" /> Make this the active year
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Starts on
						</span>
						<input
							type="date"
							name="startsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">
							Ends on
						</span>
						<input
							type="date"
							name="endsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-2">
						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							{isSubmitting ? (
								<Loader2 className="h-4 w-4 animate-spin" />
							) : (
								<CalendarRange className="h-4 w-4" />
							)}
							{isSubmitting ? "Saving…" : "Create year"}
						</button>
					</div>
				</form>
			</section>

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 text-lg font-semibold text-gray-900">Add a term</h2>
				<form
					key={`${termYearId}-${termVersion}`}
					onSubmit={(event) => void createTerm(event)}
					className="grid gap-4 md:grid-cols-4"
				>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Year</span>
						<select
							value={termYearId}
							onChange={(event) => setTermYearId(event.target.value)}
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
						<span className="mb-1 block font-medium text-gray-700">Name</span>
						<input
							name="termName"
							required
							placeholder="Term 1"
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Starts</span>
						<input
							type="date"
							name="termStartsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<label className="text-sm">
						<span className="mb-1 block font-medium text-gray-700">Ends</span>
						<input
							type="date"
							name="termEndsOn"
							required
							className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
						/>
					</label>
					<div className="md:col-span-4">
						<button
							type="submit"
							disabled={isSubmitting || !termYearId}
							className="rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
						>
							Add term
						</button>
					</div>
				</form>
			</section>

			<section className="space-y-4">
				{isLoading ? (
					<p className="flex items-center gap-2 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading calendar…
					</p>
				) : years.length === 0 ? (
					<p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
						No academic years yet. Create one above.
					</p>
				) : (
					years.map((year) => (
						<article
							key={year.id}
							className="rounded-2xl border border-gray-200 bg-white p-6"
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
										className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
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
	);
}
