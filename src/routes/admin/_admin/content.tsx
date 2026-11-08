import { createFileRoute } from "@tanstack/react-router";
import {
	Loader2,
	Paperclip,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { AttachmentUploadField } from "#/components/content/AttachmentUploadField.tsx";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import { cn } from "#/lib/utils.ts";
import {
	collectOrphanedAssetsAction,
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

export const Route = createFileRoute("/admin/_admin/content")({
	component: AdminContent,
});

type Tab = "notices" | "events" | "clubs";

interface ContentAttachment {
	id: string;
	fileAssetId: string;
	label: string | null;
	fileAsset: {
		url: string;
		originalName: string;
	};
}

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
	attachments: Array<ContentAttachment>;
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
	attachments: Array<ContentAttachment>;
}

interface ClubRow {
	id: string;
	name: string;
	description: string | null;
	meetingSchedule: string | null;
	coverImage: string | null;
	isActive: boolean;
	attachments: Array<ContentAttachment>;
}

interface AttachmentPayload {
	fileAssetId: string;
	label?: string;
}

function pad(value: number) {
	return String(value).padStart(2, "0");
}

function toDateInput(value: string | Date | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "";

	// Date-only fields are stored as UTC midnight, so use UTC parts to avoid
	// showing the previous day in timezones behind UTC.
	return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
		date.getUTCDate(),
	)}`;
}

function toDateTimeLocal(value: string | Date | null | undefined): string {
	if (!value) return "";
	const date = new Date(value);

	if (Number.isNaN(date.getTime())) return "";

	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate(),
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function parseAttachments(
	raw: FormDataEntryValue | null,
): Array<AttachmentPayload> {
	if (typeof raw !== "string" || raw.trim() === "") return [];

	try {
		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter(
				(entry: unknown): entry is { fileAssetId: string; label?: unknown } =>
					Boolean(entry) &&
					typeof entry === "object" &&
					typeof (entry as { fileAssetId?: unknown }).fileAssetId === "string",
			)
			.map((entry) => ({
				fileAssetId: entry.fileAssetId,
				...(typeof entry.label === "string" && entry.label.trim()
					? { label: entry.label.trim() }
					: {}),
			}));
	} catch {
		return [];
	}
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
	const [isCleaning, setIsCleaning] = useState(false);
	const [formVersion, setFormVersion] = useState(0);
	const [isUploading, setIsUploading] = useState(false);
	const [editingClub, setEditingClub] = useState<ClubRow | null>(null);
	const [editingNotice, setEditingNotice] = useState<NoticeRow | null>(null);
	const [editingEvent, setEditingEvent] = useState<EventRow | null>(null);
	const [editingClubDetails, setEditingClubDetails] = useState<ClubRow | null>(
		null,
	);
	const [isSavingAttachments, setIsSavingAttachments] = useState(false);
	const [isSavingContent, setIsSavingContent] = useState(false);
	const [isEditingUpload, setIsEditingUpload] = useState(false);

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
		if (isUploading || isSubmitting) return;
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
								attachments: parseAttachments(data.get("attachments")),
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
									attachments: parseAttachments(data.get("attachments")),
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
									attachments: parseAttachments(data.get("attachments")),
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
			setFormVersion((version) => version + 1);
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

	const saveClubAttachments = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!editingClub || isEditingUpload || isSavingAttachments) return;

		setError("");
		setNoticeMessage("");
		setIsSavingAttachments(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await updateClubAction({
				data: {
					id: editingClub.id,
					attachments: parseAttachments(data.get("attachments")),
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setEditingClub(null);
			setNoticeMessage("Club attachments updated.");
			await load();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not save club attachments.",
			);
		} finally {
			setIsSavingAttachments(false);
		}
	};

	const saveNotice = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingNotice || isSavingContent || isEditingUpload) return;

		setError("");
		setNoticeMessage("");
		setIsSavingContent(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await updateNoticeAction({
				data: {
					id: editingNotice.id,
					title: String(data.get("title") ?? ""),
					summary: String(data.get("summary") ?? ""),
					body: String(data.get("body") ?? ""),
					category: String(data.get("category") ?? ""),
					coverImage: String(data.get("coverImage") ?? ""),
					attachments: parseAttachments(data.get("attachments")),
					audience: String(data.get("audience") ?? "ALL") as "ALL",
					isPublished: data.get("isPublished") === "on",
					expiresAt: String(data.get("expiresAt") ?? ""),
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setEditingNotice(null);
			setNoticeMessage("Notice updated.");
			await load();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not update this notice.",
			);
		} finally {
			setIsSavingContent(false);
		}
	};

	const saveEvent = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingEvent || isSavingContent || isEditingUpload) return;

		setError("");
		setNoticeMessage("");
		setIsSavingContent(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await updateEventAction({
				data: {
					id: editingEvent.id,
					title: String(data.get("title") ?? ""),
					description: String(data.get("description") ?? ""),
					location: String(data.get("location") ?? ""),
					coverImage: String(data.get("coverImage") ?? ""),
					attachments: parseAttachments(data.get("attachments")),
					startsAt: String(data.get("startsAt") ?? ""),
					endsAt: String(data.get("endsAt") ?? ""),
					isPublished: data.get("isPublished") === "on",
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setEditingEvent(null);
			setNoticeMessage("Event updated.");
			await load();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not update this event.",
			);
		} finally {
			setIsSavingContent(false);
		}
	};

	const saveClubDetails = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingClubDetails || isSavingContent || isEditingUpload) return;

		setError("");
		setNoticeMessage("");
		setIsSavingContent(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await updateClubAction({
				data: {
					id: editingClubDetails.id,
					name: String(data.get("name") ?? ""),
					description: String(data.get("description") ?? ""),
					meetingSchedule: String(data.get("meetingSchedule") ?? ""),
					coverImage: String(data.get("coverImage") ?? ""),
					attachments: parseAttachments(data.get("attachments")),
					isActive: data.get("isActive") === "on",
				},
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setEditingClubDetails(null);
			setNoticeMessage("Club updated.");
			await load();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not update this club.",
			);
		} finally {
			setIsSavingContent(false);
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
		else {
			setEditingClub((current) => (current?.id === id ? null : current));
			setEditingNotice((current) => (current?.id === id ? null : current));
			setEditingEvent((current) => (current?.id === id ? null : current));
			setEditingClubDetails((current) => (current?.id === id ? null : current));
			await load();
		}
	};

	const runCleanup = async () => {
		setError("");
		setNoticeMessage("");
		setIsCleaning(true);

		const response = await collectOrphanedAssetsAction();

		setIsCleaning(false);

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNoticeMessage(
			`Removed ${response.deleted} unused upload${response.deleted === 1 ? "" : "s"}${
				response.failed > 0 ? ` (${response.failed} could not be removed)` : ""
			}.`,
		);
		await load();
	};

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Website content</h1>
					<p className="mt-1 text-sm text-gray-500">
						Publish notices, add calendar events and manage the clubs shown to
						families.
					</p>
				</div>
				<button
					type="button"
					onClick={() => void runCleanup()}
					disabled={isCleaning}
					className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
				>
					{isCleaning ? (
						<Loader2 className="h-3.5 w-3.5 animate-spin" />
					) : (
						<RefreshCw className="h-3.5 w-3.5" />
					)}
					Clean up unused uploads
				</button>
			</div>

			<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
				{(["notices", "events", "clubs"] as Array<Tab>).map((item) => (
					<button
						key={item}
						type="button"
						disabled={
							isUploading ||
							isSubmitting ||
							isEditingUpload ||
							isSavingAttachments ||
							isSavingContent
						}
						onClick={() => {
							setTab(item);
							setEditingClub(null);
							setEditingNotice(null);
							setEditingEvent(null);
							setEditingClubDetails(null);
						}}
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
					key={`${tab}-${formVersion}`}
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
							<AttachmentUploadField
								name="attachments"
								disabled={isSubmitting}
								onUploadingChange={setIsUploading}
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
							<AttachmentUploadField
								name="attachments"
								disabled={isSubmitting}
								onUploadingChange={setIsUploading}
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
							<AttachmentUploadField
								name="attachments"
								prefix="clubs"
								disabled={isSubmitting}
								onUploadingChange={setIsUploading}
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
							disabled={isSubmitting || isUploading}
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

			{tab === "notices" && editingNotice ? (
				<section className="rounded-2xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Pencil className="h-5 w-5 text-red-500" /> Edit notice
					</h2>
					<form
						key={editingNotice.id}
						onSubmit={(event) => void saveNotice(event)}
						className="grid gap-4 md:grid-cols-2"
					>
						<Input
							label="Title"
							name="title"
							defaultValue={editingNotice.title}
							required
						/>
						<Input
							label="Category"
							name="category"
							defaultValue={editingNotice.category ?? ""}
						/>
						<Input
							label="Summary"
							name="summary"
							defaultValue={editingNotice.summary ?? ""}
							className="md:col-span-2"
						/>
						<Textarea
							label="Body"
							name="body"
							defaultValue={editingNotice.body}
							required
							className="md:col-span-2"
						/>
						<label className="text-sm">
							<span className="mb-1 block font-medium text-gray-700">
								Audience
							</span>
							<select
								name="audience"
								defaultValue={editingNotice.audience}
								className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
							>
								<option value="ALL">Everyone</option>
								<option value="STUDENTS">Students</option>
								<option value="STAFF">Staff</option>
								<option value="GUARDIANS">Guardians</option>
							</select>
						</label>
						<Input
							label="Expires at"
							name="expiresAt"
							type="date"
							defaultValue={toDateInput(editingNotice.expiresAt)}
						/>
						<ImageUploadField
							name="coverImage"
							prefix="notices"
							defaultUrl={editingNotice.coverImage}
							className="md:col-span-2"
						/>
						<AttachmentUploadField
							name="attachments"
							prefix="notices"
							initialEntries={editingNotice.attachments.map((attachment) => ({
								fileAssetId: attachment.fileAssetId,
								url: attachment.fileAsset.url,
								name: attachment.fileAsset.originalName,
								label: attachment.label ?? "",
							}))}
							disabled={isSavingContent}
							onUploadingChange={setIsEditingUpload}
							className="md:col-span-2"
						/>
						<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
							<input
								type="checkbox"
								name="isPublished"
								defaultChecked={editingNotice.isPublished}
							/>{" "}
							Published
						</label>
						<div className="flex gap-3 md:col-span-2">
							<button
								type="submit"
								disabled={isSavingContent || isEditingUpload}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSavingContent ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Pencil className="h-4 w-4" />
								)}
								{isSavingContent ? "Saving…" : "Save changes"}
							</button>
							<button
								type="button"
								disabled={isSavingContent || isEditingUpload}
								onClick={() => setEditingNotice(null)}
								className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
							>
								Cancel
							</button>
						</div>
					</form>
				</section>
			) : null}

			{tab === "events" && editingEvent ? (
				<section className="rounded-2xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Pencil className="h-5 w-5 text-red-500" /> Edit event
					</h2>
					<form
						key={editingEvent.id}
						onSubmit={(event) => void saveEvent(event)}
						className="grid gap-4 md:grid-cols-2"
					>
						<Input
							label="Title"
							name="title"
							defaultValue={editingEvent.title}
							required
						/>
						<Input
							label="Location"
							name="location"
							defaultValue={editingEvent.location ?? ""}
						/>
						<Input
							label="Starts at"
							name="startsAt"
							type="datetime-local"
							defaultValue={toDateTimeLocal(editingEvent.startsAt)}
							required
						/>
						<Input
							label="Ends at"
							name="endsAt"
							type="datetime-local"
							defaultValue={toDateTimeLocal(editingEvent.endsAt)}
						/>
						<Textarea
							label="Description"
							name="description"
							defaultValue={editingEvent.description ?? ""}
							className="md:col-span-2"
						/>
						<ImageUploadField
							name="coverImage"
							prefix="events"
							defaultUrl={editingEvent.coverImage}
							className="md:col-span-2"
						/>
						<AttachmentUploadField
							name="attachments"
							prefix="events"
							initialEntries={editingEvent.attachments.map((attachment) => ({
								fileAssetId: attachment.fileAssetId,
								url: attachment.fileAsset.url,
								name: attachment.fileAsset.originalName,
								label: attachment.label ?? "",
							}))}
							disabled={isSavingContent}
							onUploadingChange={setIsEditingUpload}
							className="md:col-span-2"
						/>
						<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
							<input
								type="checkbox"
								name="isPublished"
								defaultChecked={editingEvent.isPublished}
							/>{" "}
							Published
						</label>
						<div className="flex gap-3 md:col-span-2">
							<button
								type="submit"
								disabled={isSavingContent || isEditingUpload}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSavingContent ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Pencil className="h-4 w-4" />
								)}
								{isSavingContent ? "Saving…" : "Save changes"}
							</button>
							<button
								type="button"
								disabled={isSavingContent || isEditingUpload}
								onClick={() => setEditingEvent(null)}
								className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
							>
								Cancel
							</button>
						</div>
					</form>
				</section>
			) : null}

			{tab === "clubs" && editingClubDetails ? (
				<section className="rounded-2xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
						<Pencil className="h-5 w-5 text-red-500" /> Edit club
					</h2>
					<form
						key={editingClubDetails.id}
						onSubmit={(event) => void saveClubDetails(event)}
						className="grid gap-4 md:grid-cols-2"
					>
						<Input
							label="Name"
							name="name"
							defaultValue={editingClubDetails.name}
							required
						/>
						<Input
							label="Meeting schedule"
							name="meetingSchedule"
							defaultValue={editingClubDetails.meetingSchedule ?? ""}
						/>
						<Textarea
							label="Description"
							name="description"
							defaultValue={editingClubDetails.description ?? ""}
							className="md:col-span-2"
						/>
						<ImageUploadField
							name="coverImage"
							prefix="clubs"
							defaultUrl={editingClubDetails.coverImage}
							className="md:col-span-2"
						/>
						<AttachmentUploadField
							name="attachments"
							prefix="clubs"
							initialEntries={editingClubDetails.attachments.map(
								(attachment) => ({
									fileAssetId: attachment.fileAssetId,
									url: attachment.fileAsset.url,
									name: attachment.fileAsset.originalName,
									label: attachment.label ?? "",
								}),
							)}
							disabled={isSavingContent}
							onUploadingChange={setIsEditingUpload}
							className="md:col-span-2"
						/>
						<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
							<input
								type="checkbox"
								name="isActive"
								defaultChecked={editingClubDetails.isActive}
							/>{" "}
							Active
						</label>
						<div className="flex gap-3 md:col-span-2">
							<button
								type="submit"
								disabled={isSavingContent || isEditingUpload}
								className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSavingContent ? (
									<Loader2 className="h-4 w-4 animate-spin" />
								) : (
									<Pencil className="h-4 w-4" />
								)}
								{isSavingContent ? "Saving…" : "Save changes"}
							</button>
							<button
								type="button"
								disabled={isSavingContent || isEditingUpload}
								onClick={() => setEditingClubDetails(null)}
								className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-60"
							>
								Cancel
							</button>
						</div>
					</form>
				</section>
			) : null}

			{tab === "clubs" && editingClub ? (
				<section className="rounded-2xl border border-gray-200 bg-white p-6">
					<h2 className="mb-4 text-lg font-semibold text-gray-900">
						Attachments for {editingClub.name}
					</h2>
					<form
						key={editingClub.id}
						onSubmit={(event) => void saveClubAttachments(event)}
						className="space-y-4"
					>
						<AttachmentUploadField
							prefix="clubs"
							initialEntries={editingClub.attachments.map((attachment) => ({
								fileAssetId: attachment.fileAssetId,
								url: attachment.fileAsset.url,
								name: attachment.fileAsset.originalName,
								label: attachment.label ?? "",
							}))}
							disabled={isSavingAttachments}
							onUploadingChange={setIsEditingUpload}
						/>
						<div className="flex gap-3">
							<button
								type="submit"
								disabled={isSavingAttachments || isEditingUpload}
								className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
							>
								{isSavingAttachments ? "Saving…" : "Save attachments"}
							</button>
							<button
								type="button"
								disabled={isSavingAttachments || isEditingUpload}
								onClick={() => setEditingClub(null)}
								className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 disabled:opacity-60"
							>
								Cancel
							</button>
						</div>
					</form>
				</section>
			) : null}

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
						onEdit={(id) =>
							setEditingNotice(notices.find((item) => item.id === id) ?? null)
						}
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
						onEdit={(id) =>
							setEditingEvent(events.find((item) => item.id === id) ?? null)
						}
					/>
				) : (
					<ContentList
						items={clubs.map((club) => ({
							id: club.id,
							title: club.name,
							subtitle: club.meetingSchedule ?? club.description ?? "",
							active: club.isActive,
							meta: `${club.attachments.length} attachment${club.attachments.length === 1 ? "" : "s"}`,
						}))}
						activeLabel="Active"
						inactiveLabel="Inactive"
						disabled={isSavingAttachments || isEditingUpload}
						onToggle={(id) => {
							const club = clubs.find((item) => item.id === id);
							if (club) void toggleClub(club);
						}}
						onDelete={(id) => void remove("clubs", id)}
						onEdit={(id) => {
							setEditingClubDetails(
								clubs.find((club) => club.id === id) ?? null,
							);
							setEditingClub(null);
						}}
						onEditAttachments={(id) => {
							if (isSavingAttachments || isEditingUpload) return;
							setEditingClub(clubs.find((club) => club.id === id) ?? null);
							setEditingClubDetails(null);
						}}
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
	onEdit,
	onEditAttachments,
	disabled = false,
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
	onEdit?: (id: string) => void;
	onEditAttachments?: (id: string) => void;
	disabled?: boolean;
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
						disabled={disabled}
						className={cn(
							"rounded-full px-2.5 py-1 text-xs font-semibold",
							item.active
								? "bg-green-100 text-green-700"
								: "bg-gray-100 text-gray-600",
						)}
					>
						{item.active ? activeLabel : inactiveLabel}
					</button>
					{onEdit ? (
						<button
							type="button"
							onClick={() => onEdit(item.id)}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-red-600"
						>
							<Pencil className="h-3.5 w-3.5" /> Edit
						</button>
					) : null}
					{onEditAttachments ? (
						<button
							type="button"
							onClick={() => onEditAttachments(item.id)}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-red-600"
						>
							<Paperclip className="h-3.5 w-3.5" /> Edit attachments
						</button>
					) : null}
					<button
						type="button"
						onClick={() => onDelete(item.id)}
						disabled={disabled}
						className="inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:text-red-700"
					>
						<Trash2 className="h-3.5 w-3.5" /> Delete
					</button>
				</li>
			))}
		</ul>
	);
}
