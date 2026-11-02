import { createFileRoute } from "@tanstack/react-router";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import { cn } from "#/lib/utils.ts";
import {
	createClubAction,
	createEventAction,
	createNoticeAction,
	deleteClubAction,
	deleteEventAction,
	deleteNoticeAction,
	getContentAdminDataFn,
	updateClubAction,
	updateEventAction,
	updateNoticeAction,
} from "#/packages/content/server.ts";

export const Route = createFileRoute("/admin/content")({
	component: AdminContent,
});

type Tab = "notices" | "events" | "clubs";

interface NoticeRow {
	id: string;
	title: string;
	summary: string | null;
	body: string;
	category: string | null;
	coverImage: string | null;
	audience: string;
	isPublished: boolean;
	publishedAt: string | Date | null;
	expiresAt: string | Date | null;
}

interface EventRow {
	id: string;
	title: string;
	description: string | null;
	location: string | null;
	coverImage: string | null;
	startsAt: string | Date;
	endsAt: string | Date | null;
	isPublished: boolean;
}

interface ClubRow {
	id: string;
	name: string;
	description: string | null;
	meetingSchedule: string | null;
	coverImage: string | null;
	isActive: boolean;
}

function AdminContent() {
	const [tab, setTab] = useState<Tab>("notices");
	const [notices, setNotices] = useState<Array<NoticeRow>>([]);
	const [events, setEvents] = useState<Array<EventRow>>([]);
	const [clubs, setClubs] = useState<Array<ClubRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [noticeMessage, setNoticeMessage] = useState("");

	const load = useCallback(async () => {
		setIsLoading(true);
		const response = await getContentAdminDataFn();

		if (!response.success) {
			setError(response.error);
			setIsLoading(false);
			return;
		}

		setNotices(response.notices as Array<NoticeRow>);
		setEvents(response.events as Array<EventRow>);
		setClubs(response.clubs as Array<ClubRow>);
		setError("");
		setIsLoading(false);
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const submit = async (event: React.FormEvent<HTMLFormElement>, kind: Tab) => {
		event.preventDefault();
		setError("");
		setNoticeMessage("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);

		try {
			const response =
				kind === "notices"
					? await createNoticeAction({
							data: {
								title: String(data.get("title") ?? ""),
								summary: String(data.get("summary") ?? ""),
								body: String(data.get("body") ?? ""),
								category: String(data.get("category") ?? ""),
								coverImage: String(data.get("coverImage") ?? ""),
								audience: String(data.get("audience") ?? "ALL") as "ALL",
								isPublished: data.get("isPublished") === "on",
								expiresAt: String(data.get("expiresAt") ?? ""),
							},
						})
					: kind === "events"
						? await createEventAction({
								data: {
									title: String(data.get("title") ?? ""),
									description: String(data.get("description") ?? ""),
									location: String(data.get("location") ?? ""),
									coverImage: String(data.get("coverImage") ?? ""),
									startsAt: String(data.get("startsAt") ?? ""),
									endsAt: String(data.get("endsAt") ?? ""),
									isPublished: data.get("isPublished") === "on",
								},
							})
						: await createClubAction({
								data: {
									name: String(data.get("name") ?? ""),
									description: String(data.get("description") ?? ""),
									meetingSchedule: String(data.get("meetingSchedule") ?? ""),
									coverImage: String(data.get("coverImage") ?? ""),
									isActive: data.get("isActive") === "on",
								},
							});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setNoticeMessage(
				`${kind === "notices" ? "Notice" : kind === "events" ? "Event" : "Club"} created.`,
			);
			form.reset();
			await load();
		} catch (createError) {
			setError(
				createError instanceof Error
					? createError.message
					: "Could not save this item.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const toggleNotice = async (notice: NoticeRow) => {
		const response = await updateNoticeAction({
			data: { id: notice.id, isPublished: !notice.isPublished },
		});
		if (!response.success) setError(response.error);
		else await load();
	};

	const toggleEvent = async (event: EventRow) => {
		const response = await updateEventAction({
			data: { id: event.id, isPublished: !event.isPublished },
		});
		if (!response.success) setError(response.error);
		else await load();
	};

	const toggleClub = async (club: ClubRow) => {
		const response = await updateClubAction({
			data: { id: club.id, isActive: !club.isActive },
		});
		if (!response.success) setError(response.error);
		else await load();
	};

	const remove = async (kind: Tab, id: string) => {
		if (!confirm("Delete this item permanently?")) return;

		const response =
			kind === "notices"
				? await deleteNoticeAction({ data: { id } })
				: kind === "events"
					? await deleteEventAction({ data: { id } })
					: await deleteClubAction({ data: { id } });

		if (!response.success) setError(response.error);
		else await load();
	};

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Website content</h1>
				<p className="mt-1 text-sm text-gray-500">
					Publish notices, add calendar events and manage the clubs shown to
					families.
				</p>
			</div>

			<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
				{(["notices", "events", "clubs"] as Array<Tab>).map((item) => (
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

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{noticeMessage ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					{noticeMessage}
				</div>
			) : null}

			<section className="rounded-2xl border border-gray-200 bg-white p-6">
				<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
					<Plus className="h-5 w-5 text-red-500" /> New{" "}
					{tab === "notices" ? "notice" : tab === "events" ? "event" : "club"}
				</h2>

				<form
					onSubmit={(event) => void submit(event, tab)}
					className="grid gap-4 md:grid-cols-2"
				>
					{tab === "notices" ? (
						<>
							<Input label="Title" name="title" required />
							<Input label="Category" name="category" />
							<Input label="Summary" name="summary" className="md:col-span-2" />
							<Textarea
								label="Body"
								name="body"
								required
								className="md:col-span-2"
							/>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Audience
								</span>
								<select
									name="audience"
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
								>
									<option value="ALL">Everyone</option>
									<option value="STUDENTS">Students</option>
									<option value="STAFF">Staff</option>
									<option value="GUARDIANS">Guardians</option>
								</select>
							</label>
							<Input label="Expires at" name="expiresAt" type="date" />
							<ImageUploadField
								name="coverImage"
								prefix="notices"
								className="md:col-span-2"
							/>
						</>
					) : tab === "events" ? (
						<>
							<Input label="Title" name="title" required />
							<Input label="Location" name="location" />
							<Input
								label="Starts at"
								name="startsAt"
								type="datetime-local"
								required
							/>
							<Input label="Ends at" name="endsAt" type="datetime-local" />
							<Textarea
								label="Description"
								name="description"
								className="md:col-span-2"
							/>
							<ImageUploadField
								name="coverImage"
								prefix="events"
								className="md:col-span-2"
							/>
						</>
					) : (
						<>
							<Input label="Name" name="name" required />
							<Input label="Meeting schedule" name="meetingSchedule" />
							<Textarea
								label="Description"
								name="description"
								className="md:col-span-2"
							/>
							<ImageUploadField
								name="coverImage"
								prefix="clubs"
								className="md:col-span-2"
							/>
						</>
					)}

					<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
						<input
							type="checkbox"
							name={tab === "clubs" ? "isActive" : "isPublished"}
							defaultChecked
						/>
						{tab === "clubs" ? "Active" : "Publish immediately"}
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
								<Plus className="h-4 w-4" />
							)}
							Save
						</button>
					</div>
				</form>
			</section>

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				<header className="border-b border-gray-200 px-5 py-4">
					<h2 className="font-semibold capitalize text-gray-900">All {tab}</h2>
				</header>

				{isLoading ? (
					<p className="p-5 text-sm text-gray-500">Loading…</p>
				) : tab === "notices" ? (
					<ContentList
						items={notices.map((notice) => ({
							id: notice.id,
							title: notice.title,
							subtitle: notice.summary ?? notice.category ?? "",
							active: notice.isPublished,
							meta: new Date(
								notice.publishedAt ?? Date.now(),
							).toLocaleDateString(),
						}))}
						activeLabel="Published"
						inactiveLabel="Draft"
						onToggle={(id) => {
							const notice = notices.find((item) => item.id === id);
							if (notice) void toggleNotice(notice);
						}}
						onDelete={(id) => void remove("notices", id)}
					/>
				) : tab === "events" ? (
					<ContentList
						items={events.map((event) => ({
							id: event.id,
							title: event.title,
							subtitle: event.location ?? event.description ?? "",
							active: event.isPublished,
							meta: new Date(event.startsAt).toLocaleString(),
						}))}
						activeLabel="Published"
						inactiveLabel="Draft"
						onToggle={(id) => {
							const event = events.find((item) => item.id === id);
							if (event) void toggleEvent(event);
						}}
						onDelete={(id) => void remove("events", id)}
					/>
				) : (
					<ContentList
						items={clubs.map((club) => ({
							id: club.id,
							title: club.name,
							subtitle: club.meetingSchedule ?? club.description ?? "",
							active: club.isActive,
							meta: "",
						}))}
						activeLabel="Active"
						inactiveLabel="Inactive"
						onToggle={(id) => {
							const club = clubs.find((item) => item.id === id);
							if (club) void toggleClub(club);
						}}
						onDelete={(id) => void remove("clubs", id)}
					/>
				)}
			</section>
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
				rows={4}
				className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
			/>
		</label>
	);
}

function ContentList({
	items,
	activeLabel,
	inactiveLabel,
	onToggle,
	onDelete,
}: {
	items: Array<{
		id: string;
		title: string;
		subtitle: string;
		active: boolean;
		meta: string;
	}>;
	activeLabel: string;
	inactiveLabel: string;
	onToggle: (id: string) => void;
	onDelete: (id: string) => void;
}) {
	if (items.length === 0) {
		return (
			<p className="p-8 text-center text-sm text-gray-500">Nothing here yet.</p>
		);
	}

	return (
		<ul className="divide-y divide-gray-100">
			{items.map((item) => (
				<li
					key={item.id}
					className="flex flex-wrap items-center gap-4 px-5 py-4"
				>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-gray-900">{item.title}</p>
						{item.subtitle ? (
							<p className="truncate text-xs text-gray-500">{item.subtitle}</p>
						) : null}
					</div>
					{item.meta ? (
						<span className="text-xs text-gray-400">{item.meta}</span>
					) : null}
					<button
						type="button"
						onClick={() => onToggle(item.id)}
						className={cn(
							"rounded-full px-2.5 py-1 text-xs font-semibold",
							item.active
								? "bg-green-100 text-green-700"
								: "bg-gray-100 text-gray-600",
						)}
					>
						{item.active ? activeLabel : inactiveLabel}
					</button>
					<button
						type="button"
						onClick={() => onDelete(item.id)}
						className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
					>
						<Trash2 className="h-3.5 w-3.5" /> Delete
					</button>
				</li>
			))}
		</ul>
	);
}
