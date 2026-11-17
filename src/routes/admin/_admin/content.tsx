import { createFileRoute } from "@tanstack/react-router";
import {
	CalendarDays,
	Inbox,
	Loader2,
	type LucideIcon,
	Megaphone,
	Paperclip,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
	Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { ListSkeleton } from "#/components/common/Skeletons";
import { AttachmentUploadField } from "#/components/content/AttachmentUploadField.tsx";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import { Button } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { cn } from "#/lib/utils.ts";
import { CLUB_PERMISSIONS } from "#/packages/clubs/permissions.ts";
import {
	getClubBoardFn,
	saveClubMembersAction,
	saveClubRolesAction,
} from "#/packages/clubs/server.ts";
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
	slug: string;
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

/** Shape of one role as returned by `getClubBoardFn`. */
export interface BoardRole {
	id: string;
	/** Stable React key for roles that are not saved yet (id is ""). */
	key: string;
	name: string;
	description: string | null;
	permissions: Array<string>;
	isBoard: boolean;
	sortOrder: number;
	members: Array<{
		id: string;
		name: string;
		grade: string | null;
		section: string | null;
	}>;
}

interface BoardMember {
	id: string;
	name: string;
	grade: string | null;
	section: string | null;
	/** Role assigned to this member; matched by name when saving. */
	roleName: string | null;
}

function permissionsToKeys(raw: string): Array<string> {
	return raw
		.split(",")
		.map((key) => key.trim())
		.filter(Boolean);
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
	const [boardClub, setBoardClub] = useState<ClubRow | null>(null);
	const [boardRoles, setBoardRoles] = useState<Array<BoardRole>>([]);
	const [boardMembers, setBoardMembers] = useState<Array<BoardMember>>([]);
	const [isLoadingBoard, setIsLoadingBoard] = useState(false);
	const [isSavingBoard, setIsSavingBoard] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<{
		kind: Tab;
		id: string;
	} | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

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

	const openClubBoard = async (club: ClubRow) => {
		setError("");
		setNoticeMessage("");
		setBoardClub(club);
		setBoardRoles([]);
		setBoardMembers([]);
		setIsLoadingBoard(true);

		try {
			const result = await getClubBoardFn({ data: { slug: club.slug } });
			if (!result.success) {
				setError(result.error);
				return;
			}
			setBoardRoles(
				result.roles.map((role) => ({
					...role,
					key: role.id,
					permissions: permissionsToKeys(role.permissions),
				})),
			);
			setBoardMembers(
				result.roles.flatMap((role) =>
					role.members.map((member) => ({
						id: member.id,
						name: member.name,
						grade: member.grade,
						section: member.section,
						roleName: role.name,
					})),
				),
			);
		} catch (boardError) {
			setError(
				boardError instanceof Error
					? boardError.message
					: "Could not load club roles.",
			);
		} finally {
			setIsLoadingBoard(false);
		}
	};

	const saveClubBoard = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!boardClub || isSavingBoard) return;

		setError("");
		setNoticeMessage("");
		for (const role of boardRoles) {
			if (!role.name.trim()) {
				setError("Every role needs a name.");
				return;
			}
		}

		setIsSavingBoard(true);
		try {
			const rolesResult = await saveClubRolesAction({
				data: {
					slug: boardClub.slug,
					roles: boardRoles.map((role_, index) => ({
						id: role_.id || undefined,
						name: role_.name,
						description: role_.description ?? "",
						permissions: role_.permissions,
						isBoard: role_.isBoard,
						sortOrder: index,
					})),
				},
			});

			if (!rolesResult.success) {
				setError(rolesResult.error);
				return;
			}

			// Re-read the roles so members moving to a newly created role get its
			// real id, and members left in deleted roles are dropped.
			const refreshed = await getClubBoardFn({
				data: { slug: boardClub.slug },
			});
			if (!refreshed.success) {
				setError(refreshed.error);
				return;
			}

			const freshRoles = refreshed.roles.map((role) => ({
				...role,
				key: role.id,
				permissions: permissionsToKeys(role.permissions),
			}));
			// A member's role is matched by name: renamed roles and roles that were
			// just created (and therefore have no id yet) resolve correctly.
			const freshIdByName = new Map(
				freshRoles.map((role) => [role.name.trim().toLowerCase(), role.id]),
			);

			const membersResult = await saveClubMembersAction({
				data: {
					slug: boardClub.slug,
					members: boardMembers.map((member) => ({
						studentId: member.id,
						roleId:
							freshIdByName.get(member.roleName?.trim().toLowerCase() ?? "") ??
							null,
					})),
				},
			});

			if (!membersResult.success) {
				setError(membersResult.error);
				return;
			}

			setNoticeMessage("Club roles and members saved.");
			setBoardClub(null);
			await load();
		} catch (saveError) {
			setError(
				saveError instanceof Error
					? saveError.message
					: "Could not save club roles.",
			);
		} finally {
			setIsSavingBoard(false);
		}
	};

	const toggleRolePermission = (
		roleIndex: number,
		key: string,
		enabled: boolean,
	) => {
		setBoardRoles((current) =>
			current.map((role, index) =>
				index === roleIndex
					? {
							...role,
							permissions: enabled
								? [...new Set([...role.permissions, key])]
								: role.permissions.filter((item) => item !== key),
						}
					: role,
			),
		);
	};

	const addBoardRole = () => {
		setBoardRoles((current) => [
			...current,
			{
				id: "",
				key: `new-${current.length}`,
				name: "New role",
				description: "",
				permissions: [],
				isBoard: false,
				sortOrder: current.length,
				members: [],
			},
		]);
	};

	const removeBoardRole = (index: number) => {
		const removedName = boardRoles[index]?.name.trim().toLowerCase();
		setBoardRoles((current) =>
			current.filter((_, itemIndex) => itemIndex !== index),
		);
		// Members in a removed role fall back to no role until reassigned.
		if (removedName) {
			setBoardMembers((current) =>
				current.map((member) =>
					member.roleName?.trim().toLowerCase() === removedName
						? { ...member, roleName: null }
						: member,
				),
			);
		}
	};

	const remove = async (kind: Tab, id: string) => {
		setIsDeleting(true);
		try {
			const response =
				kind === "notices"
					? await deleteNoticeAction({ data: { id } })
					: kind === "events"
						? await deleteEventAction({ data: { id } })
						: await deleteClubAction({ data: { id } });

			if (!response.success) {
				setError(response.error);
				return;
			}

			setEditingClub((current) => (current?.id === id ? null : current));
			setEditingNotice((current) => (current?.id === id ? null : current));
			setEditingEvent((current) => (current?.id === id ? null : current));
			setEditingClubDetails((current) => (current?.id === id ? null : current));
			setPendingDelete(null);
			await load();
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this item.",
			);
		} finally {
			setIsDeleting(false);
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
		<div data-testid="content-page">
			<PageHeader
				testId="content-page-header"
				eyebrow="Website"
				title="Website content"
				description="Publish notices, add calendar events and manage the clubs shown to families."
				meta={
					isLoading ? null : (
						<>
							<span className="num">
								{notices.length} notice{notices.length === 1 ? "" : "s"}
							</span>
							<span className="num">
								{events.length} event{events.length === 1 ? "" : "s"}
							</span>
							<span className="num">
								{clubs.length} club{clubs.length === 1 ? "" : "s"}
							</span>
						</>
					)
				}
				actions={
					<Button
						type="button"
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={() => void runCleanup()}
						disabled={isCleaning}
						data-testid="content-cleanup"
					>
						{isCleaning ? (
							<Loader2 className="h-3.5 w-3.5 animate-spin" />
						) : (
							<RefreshCw className="h-3.5 w-3.5" />
						)}
						Clean up unused uploads
					</Button>
				}
			/>

			<div className="space-y-6">
				<Tabs
					value={tab}
					onValueChange={(value: string) => {
						setTab(value as Tab);
						setEditingClub(null);
						setEditingNotice(null);
						setEditingEvent(null);
						setEditingClubDetails(null);
					}}
				>
					<TabsList className="h-9" data-testid="content-tabs">
						{(["notices", "events", "clubs"] as Array<Tab>).map((item) => (
							<TabsTrigger
								key={item}
								value={item}
								disabled={
									isUploading ||
									isSubmitting ||
									isEditingUpload ||
									isSavingAttachments ||
									isSavingContent
								}
								className="capitalize"
								data-testid={`content-tab-${item}`}
							>
								{item}
							</TabsTrigger>
						))}
					</TabsList>
				</Tabs>

				{error ? (
					<div
						className="rounded-xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive"
						data-testid="content-error"
					>
						{error}
					</div>
				) : null}
				{noticeMessage ? (
					<div
						className="rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm text-success"
						data-testid="content-notice"
					>
						{noticeMessage}
					</div>
				) : null}

				<Panel
					title={`New ${tab === "notices" ? "notice" : tab === "events" ? "event" : "club"}`}
					testId="content-new-panel"
				>
					<form
						key={`${tab}-${formVersion}`}
						onSubmit={(event) => void submit(event, tab)}
						className="grid gap-4 md:grid-cols-2"
					>
						{tab === "notices" ? (
							<>
								<Input label="Title" name="title" required />
								<Input label="Category" name="category" />
								<Input
									label="Summary"
									name="summary"
									className="md:col-span-2"
								/>
								<Textarea
									label="Body"
									name="body"
									required
									className="md:col-span-2"
								/>
								<label className="text-sm">
									<span className="mb-1.5 block text-xs font-medium text-muted-foreground">
										Audience
									</span>
									<select
										name="audience"
										className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm outline-none transition-colors duration-150 focus-ring"
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

						<label className="flex items-center gap-2.5 text-sm text-foreground md:col-span-2">
							<input
								type="checkbox"
								name={tab === "clubs" ? "isActive" : "isPublished"}
								defaultChecked
								className="h-4 w-4 accent-primary"
							/>
							{tab === "clubs" ? "Active" : "Publish immediately"}
						</label>

						<div className="md:col-span-2">
							<Button
								type="submit"
								size="sm"
								className="gap-1.5"
								disabled={isSubmitting || isUploading}
								data-testid="content-form-save"
							>
								{isSubmitting ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Plus className="h-3.5 w-3.5" />
								)}
								Save
							</Button>
						</div>
					</form>
				</Panel>

				{tab === "notices" && editingNotice ? (
					<Panel title="Edit notice" testId="content-edit-notice-panel">
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
								<span className="mb-1.5 block text-xs font-medium text-muted-foreground">
									Audience
								</span>
								<select
									name="audience"
									defaultValue={editingNotice.audience}
									className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm outline-none transition-colors duration-150 focus-ring"
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
							<label className="flex items-center gap-2.5 text-sm text-foreground md:col-span-2">
								<input
									type="checkbox"
									name="isPublished"
									defaultChecked={editingNotice.isPublished}
									className="h-4 w-4 accent-primary"
								/>{" "}
								Published
							</label>
							<div className="flex gap-3 md:col-span-2">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSavingContent || isEditingUpload}
								>
									{isSavingContent ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Pencil className="h-3.5 w-3.5" />
									)}
									{isSavingContent ? "Saving…" : "Save changes"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSavingContent || isEditingUpload}
									onClick={() => setEditingNotice(null)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Panel>
				) : null}

				{tab === "events" && editingEvent ? (
					<Panel title="Edit event" testId="content-edit-event-panel">
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
							<label className="flex items-center gap-2.5 text-sm text-foreground md:col-span-2">
								<input
									type="checkbox"
									name="isPublished"
									defaultChecked={editingEvent.isPublished}
									className="h-4 w-4 accent-primary"
								/>{" "}
								Published
							</label>
							<div className="flex gap-3 md:col-span-2">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSavingContent || isEditingUpload}
								>
									{isSavingContent ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Pencil className="h-3.5 w-3.5" />
									)}
									{isSavingContent ? "Saving…" : "Save changes"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSavingContent || isEditingUpload}
									onClick={() => setEditingEvent(null)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Panel>
				) : null}

				{tab === "clubs" && editingClubDetails ? (
					<Panel title="Edit club" testId="content-edit-club-panel">
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
							<label className="flex items-center gap-2.5 text-sm text-foreground md:col-span-2">
								<input
									type="checkbox"
									name="isActive"
									defaultChecked={editingClubDetails.isActive}
									className="h-4 w-4 accent-primary"
								/>{" "}
								Active
							</label>
							<div className="flex gap-3 md:col-span-2">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSavingContent || isEditingUpload}
								>
									{isSavingContent ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Pencil className="h-3.5 w-3.5" />
									)}
									{isSavingContent ? "Saving…" : "Save changes"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSavingContent || isEditingUpload}
									onClick={() => setEditingClubDetails(null)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Panel>
				) : null}

				{tab === "clubs" && editingClub ? (
					<Panel
						title={`Attachments for ${editingClub.name}`}
						testId="content-attachments-panel"
					>
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
								<Button
									type="submit"
									size="sm"
									disabled={isSavingAttachments || isEditingUpload}
								>
									{isSavingAttachments ? "Saving…" : "Save attachments"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSavingAttachments || isEditingUpload}
									onClick={() => setEditingClub(null)}
								>
									Cancel
								</Button>
							</div>
						</form>
					</Panel>
				) : null}

				{tab === "clubs" && boardClub ? (
					<Panel
						title={`Roles & permissions — ${boardClub.name}`}
						description="A plain Member role with no permissions cannot publish posts. The President and officers can — permissions are editable here."
						testId="content-board-panel"
					>
						<form
							onSubmit={(event) => void saveClubBoard(event)}
							className="space-y-6"
						>
							<div className="space-y-4">
								{boardRoles.map((role, index) => (
									<div
										key={role.key}
										className="rounded-xl border border-hairline bg-surface-1 p-4"
										data-testid={`content-board-role-${role.key}`}
									>
										<div className="flex flex-wrap items-center gap-3">
											<Input
												label="Role name"
												className="min-w-[200px] flex-1"
												value={role.name}
												onChange={(event) =>
													setBoardRoles((current) =>
														current.map((item, itemIndex) =>
															itemIndex === index
																? { ...item, name: event.target.value }
																: item,
														),
													)
												}
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="mt-6 gap-1.5 text-destructive hover:text-destructive"
												disabled={isSavingBoard}
												onClick={() => removeBoardRole(index)}
											>
												<Trash2 className="h-3.5 w-3.5" /> Remove role
											</Button>
										</div>
										<label className="mt-3 flex items-center gap-2.5 text-sm text-foreground">
											<input
												type="checkbox"
												checked={role.isBoard}
												onChange={(event) =>
													setBoardRoles((current) =>
														current.map((item, itemIndex) =>
															itemIndex === index
																? { ...item, isBoard: event.target.checked }
																: item,
														),
													)
												}
												className="h-4 w-4 accent-primary"
											/>
											Show on the public club board
										</label>
										<fieldset className="mt-3">
											<legend className="text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
												Permissions
											</legend>
											<div className="mt-2 grid gap-2 sm:grid-cols-2">
												{CLUB_PERMISSIONS.map((permission) => (
													<label
														key={permission.key}
														className="flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-sm transition-colors duration-150 hover:border-primary/35"
													>
														<input
															type="checkbox"
															className="mt-0.5 h-4 w-4 accent-primary"
															checked={role.permissions.includes(
																permission.key,
															)}
															onChange={(event) =>
																toggleRolePermission(
																	index,
																	permission.key,
																	event.target.checked,
																)
															}
														/>
														<span>
															<span className="block text-xs font-medium text-foreground">
																{permission.label}
															</span>
															<span className="block text-[11px] text-muted-foreground">
																{permission.description}
															</span>
														</span>
													</label>
												))}
											</div>
										</fieldset>
									</div>
								))}
							</div>

							<Button
								type="button"
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={isSavingBoard || isLoadingBoard}
								onClick={addBoardRole}
							>
								<Plus className="h-3.5 w-3.5" /> Add role
							</Button>

							<div className="border-t border-hairline pt-4">
								<h3 className="text-sm font-semibold text-foreground">
									Members &amp; assignments
								</h3>
								<p className="mb-3 text-xs text-muted-foreground">
									{isLoadingBoard
										? "Loading members…"
										: `${boardMembers.length} member${boardMembers.length === 1 ? "" : "s"}. Members without a role can read the club but cannot publish.`}
								</p>
								{boardMembers.length === 0 ? (
									<p className="text-sm text-muted-foreground">
										No members yet. Students join a club from the member area.
									</p>
								) : (
									<ul className="space-y-2">
										{boardMembers.map((member, memberIndex) => (
											<li
												key={member.id}
												className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface-1 px-3 py-2"
											>
												<span className="min-w-0 flex-1 text-sm font-medium text-foreground">
													{member.name}
													{member.grade ? (
														<span className="ml-2 text-xs text-muted-foreground">
															Grade {member.grade}
															{member.section ? ` · ${member.section}` : ""}
														</span>
													) : null}
												</span>
												<select
													value={member.roleName ?? ""}
													onChange={(event) =>
														setBoardMembers((current) =>
															current.map((item, itemIndex) =>
																itemIndex === memberIndex
																	? {
																			...item,
																			roleName: event.target.value || null,
																		}
																	: item,
															),
														)
													}
													className="h-8 rounded-md border border-hairline bg-surface-1 px-2 text-sm outline-none transition-colors duration-150 focus-ring"
												>
													<option value="">No role (cannot publish)</option>
													{boardRoles.map((role) => (
														<option key={role.key} value={role.name}>
															{role.name}
														</option>
													))}
												</select>
											</li>
										))}
									</ul>
								)}
							</div>

							<div className="flex gap-3">
								<Button
									type="submit"
									size="sm"
									className="gap-1.5"
									disabled={isSavingBoard || isLoadingBoard}
								>
									{isSavingBoard ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Pencil className="h-3.5 w-3.5" />
									)}
									{isSavingBoard ? "Saving…" : "Save roles & members"}
								</Button>
								<Button
									type="button"
									variant="outline"
									size="sm"
									disabled={isSavingBoard}
									onClick={() => setBoardClub(null)}
								>
									Close
								</Button>
							</div>
						</form>
					</Panel>
				) : null}

				<section className="panel overflow-hidden" data-testid="content-list">
					<header className="panel-header">
						<h2 className="panel-title capitalize">All {tab}</h2>
					</header>

					{isLoading ? (
						<div className="p-5" data-testid="content-list-loading">
							<ListSkeleton rows={4} />
						</div>
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
							emptyIcon={Megaphone}
							emptyTitle="No notices yet"
							emptyDescription="Publish your first notice to share news with students, guardians and staff."
							onToggle={(id) => {
								const notice = notices.find((item) => item.id === id);
								if (notice) void toggleNotice(notice);
							}}
							onDelete={(id) => setPendingDelete({ kind: "notices", id })}
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
							emptyIcon={CalendarDays}
							emptyTitle="No events yet"
							emptyDescription="Add a calendar event to show upcoming activities to families."
							onToggle={(id) => {
								const event = events.find((item) => item.id === id);
								if (event) void toggleEvent(event);
							}}
							onDelete={(id) => setPendingDelete({ kind: "events", id })}
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
							emptyIcon={Users}
							emptyTitle="No clubs yet"
							emptyDescription="Create your first club to showcase activities on the website."
							disabled={isSavingAttachments || isEditingUpload}
							onToggle={(id) => {
								const club = clubs.find((item) => item.id === id);
								if (club) void toggleClub(club);
							}}
							onDelete={(id) => setPendingDelete({ kind: "clubs", id })}
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
							onEditRoles={(id) => {
								const club = clubs.find((item) => item.id === id);
								if (club) {
									setEditingClub(null);
									setEditingClubDetails(null);
									void openClubBoard(club);
								}
							}}
						/>
					)}
				</section>
			</div>

			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(open) => !open && setPendingDelete(null)}
				testId="content-delete-confirm"
				title="Delete this item permanently?"
				description="This removes the item and cannot be undone."
				confirmLabel="Delete"
				destructive
				busy={isDeleting}
				onConfirm={() =>
					pendingDelete && void remove(pendingDelete.kind, pendingDelete.id)
				}
			/>
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
			<span className="mb-1.5 block text-xs font-medium text-muted-foreground">
				{label}
			</span>
			<input
				{...props}
				className="h-9 w-full rounded-md border border-hairline bg-surface-1 px-3 py-1 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring disabled:opacity-50"
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
			<span className="mb-1.5 block text-xs font-medium text-muted-foreground">
				{label}
			</span>
			<textarea
				{...props}
				rows={4}
				className="w-full rounded-md border border-hairline bg-surface-1 px-3 py-2 text-sm outline-none transition-colors duration-150 placeholder:text-muted-foreground focus-ring disabled:opacity-50"
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
	onEditRoles,
	emptyIcon,
	emptyTitle,
	emptyDescription,
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
	onEditRoles?: (id: string) => void;
	emptyIcon?: LucideIcon;
	emptyTitle?: string;
	emptyDescription?: string;
	disabled?: boolean;
}) {
	if (items.length === 0) {
		return (
			<EmptyState
				icon={emptyIcon ?? Inbox}
				title={emptyTitle ?? "Nothing here yet"}
				description={
					emptyDescription ?? "Create your first item with the form above."
				}
				testId="content-list-empty"
			/>
		);
	}

	return (
		<ul className="divide-y divide-hairline">
			{items.map((item) => (
				<li
					key={item.id}
					className="flex flex-wrap items-center gap-4 px-5 py-4 transition-colors duration-150 hover:bg-surface-2"
					data-testid={`content-row-${item.id}`}
				>
					<div className="min-w-0 flex-1">
						<p className="font-medium text-foreground">{item.title}</p>
						{item.subtitle ? (
							<p className="truncate text-xs text-muted-foreground">
								{item.subtitle}
							</p>
						) : null}
					</div>
					{item.meta ? (
						<span className="num text-xs text-muted-foreground">
							{item.meta}
						</span>
					) : null}
					<button
						type="button"
						onClick={() => onToggle(item.id)}
						disabled={disabled}
						className={cn(
							"rounded-full px-2.5 py-1 text-xs font-medium transition-colors duration-150 focus-ring disabled:opacity-50",
							item.active
								? "bg-success/12 text-success"
								: "bg-muted text-muted-foreground",
						)}
						data-testid={`content-toggle-${item.id}`}
					>
						{item.active ? activeLabel : inactiveLabel}
					</button>
					{onEdit ? (
						<button
							type="button"
							onClick={() => onEdit(item.id)}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-ring disabled:opacity-50"
							data-testid={`content-edit-${item.id}`}
						>
							<Pencil className="h-3.5 w-3.5" /> Edit
						</button>
					) : null}
					{onEditAttachments ? (
						<button
							type="button"
							onClick={() => onEditAttachments(item.id)}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-ring disabled:opacity-50"
							data-testid={`content-edit-attachments-${item.id}`}
						>
							<Paperclip className="h-3.5 w-3.5" /> Edit attachments
						</button>
					) : null}
					{onEditRoles ? (
						<button
							type="button"
							onClick={() => onEditRoles(item.id)}
							disabled={disabled}
							className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-ring disabled:opacity-50"
							data-testid={`content-edit-roles-${item.id}`}
						>
							<Users className="h-3.5 w-3.5" /> Roles
						</button>
					) : null}
					<button
						type="button"
						onClick={() => onDelete(item.id)}
						disabled={disabled}
						className="inline-flex items-center gap-1 text-xs font-medium text-destructive transition-colors duration-150 hover:text-destructive/80 focus-ring disabled:opacity-50"
						data-testid={`content-delete-${item.id}`}
					>
						<Trash2 className="h-3.5 w-3.5" /> Delete
					</button>
				</li>
			))}
		</ul>
	);
}
