import {
	AlertTriangle,
	CheckCircle2,
	Loader2,
	MoreHorizontal,
	Paperclip,
	Pencil,
	Plus,
	Trash2,
	Users,
	UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { FilterBar } from "#/components/common/FilterBar";
import { PageHeader } from "#/components/common/PageHeader";
import { ListSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { AttachmentUploadField } from "#/components/content/AttachmentUploadField.tsx";
import { ImageUploadField } from "#/components/content/ImageUploadField.tsx";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import { pluralize } from "#/lib/format.ts";
import { CLUB_PERMISSIONS } from "#/packages/clubs/permissions.ts";
import {
	getClubBoardFn,
	saveClubMembersAction,
	saveClubRolesAction,
} from "#/packages/clubs/server.ts";
import {
	createClubAction,
	deleteClubAction,
	getContentAdminDataFn,
	updateClubAction,
} from "#/packages/content/server.ts";

interface ContentAttachment {
	id: string;
	fileAssetId: string;
	label: string | null;
	fileAsset: {
		url: string;
		originalName: string;
	};
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
interface BoardRole {
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

function parseAttachments(
	raw: FormDataEntryValue | null,
): Array<AttachmentPayload> {
	if (typeof raw !== "string" || raw.trim() === "") return [];

	try {
		const parsed: unknown = JSON.parse(raw);

		if (!Array.isArray(parsed)) return [];

		return parsed
			.filter(
				(entry): entry is { fileAssetId: string; label?: unknown } =>
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

export default function ClubsPage() {
	const [clubs, setClubs] = useState<Array<ClubRow>>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [noticeMessage, setNoticeMessage] = useState("");
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");

	const [createOpen, setCreateOpen] = useState(false);
	const [formVersion, setFormVersion] = useState(0);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);

	const [editingClub, setEditingClub] = useState<ClubRow | null>(null);
	const [editingClubDetails, setEditingClubDetails] = useState<ClubRow | null>(
		null,
	);
	const [isSavingAttachments, setIsSavingAttachments] = useState(false);
	const [isSavingContent, setIsSavingContent] = useState(false);
	const [isEditingUpload, setIsEditingUpload] = useState(false);

	const [pendingDelete, setPendingDelete] = useState<ClubRow | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const [boardClub, setBoardClub] = useState<ClubRow | null>(null);
	const [boardRoles, setBoardRoles] = useState<Array<BoardRole>>([]);
	const [boardMembers, setBoardMembers] = useState<Array<BoardMember>>([]);
	const [isLoadingBoard, setIsLoadingBoard] = useState(false);
	const [isSavingBoard, setIsSavingBoard] = useState(false);
	// Stable key source for unsaved board roles (see addBoardRole).
	const roleKeyCounter = useRef(0);

	const load = useCallback(async () => {
		setIsLoading(true);
		try {
			const response = await getContentAdminDataFn();

			if (!response.success) {
				setError(response.error);
				return;
			}

			setClubs(response.clubs as Array<ClubRow>);
			setError("");
		} catch (loadError) {
			setError(
				loadError instanceof Error
					? loadError.message
					: "Could not load clubs.",
			);
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		void load();
	}, [load]);

	const createClub = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isUploading || isSubmitting) return;
		setError("");
		setNoticeMessage("");
		setIsSubmitting(true);
		const data = new FormData(event.currentTarget);

		try {
			const response = await createClubAction({
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

			setNoticeMessage("Club created.");
			setFormVersion((version) => version + 1);
			setCreateOpen(false);
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

	const toggleClub = async (club: ClubRow) => {
		setError("");
		try {
			const response = await updateClubAction({
				data: { id: club.id, isActive: !club.isActive },
			});
			if (!response.success) setError(response.error);
			else await load();
		} catch (toggleError) {
			setError(
				toggleError instanceof Error
					? toggleError.message
					: "Could not update this club.",
			);
		}
	};

	const removeClub = async () => {
		if (!pendingDelete || isDeleting) return;

		setIsDeleting(true);
		try {
			const response = await deleteClubAction({
				data: { id: pendingDelete.id },
			});

			if (!response.success) {
				// Close the dialog so the error banner behind it is visible.
				setError(response.error);
				setPendingDelete(null);
			} else {
				setEditingClub((current) =>
					current?.id === pendingDelete.id ? null : current,
				);
				setEditingClubDetails((current) =>
					current?.id === pendingDelete.id ? null : current,
				);
				setPendingDelete(null);
				await load();
			}
		} catch (deleteError) {
			setError(
				deleteError instanceof Error
					? deleteError.message
					: "Could not delete this club.",
			);
			setPendingDelete(null);
		} finally {
			setIsDeleting(false);
		}
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
			setBoardMembers([
				...result.roles.flatMap((role) =>
					role.members.map((member) => ({
						id: member.id,
						name: member.name,
						grade: member.grade,
						section: member.section,
						roleName: role.name,
					})),
				),
				// Members without a role must stay in the list; otherwise the next
				// save would remove them from the club entirely.
				...(result.unassignedMembers ?? []).map((member) => ({
					id: member.id,
					name: member.name,
					grade: member.grade,
					section: member.section,
					roleName: null,
				})),
			]);
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
		// Monotonic counter: a length-based key would collide after a removal
		// (remove index 0, add again -> duplicate "new-0").
		roleKeyCounter.current += 1;
		const key = `new-${roleKeyCounter.current}`;
		setBoardRoles((current) => [
			...current,
			{
				id: "",
				key,
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

	const visibleClubs = useMemo(() => {
		const query = search.trim().toLowerCase();
		return clubs.filter((club) => {
			const matchesSearch =
				query === "" ||
				[club.name, club.description ?? "", club.meetingSchedule ?? ""].some(
					(field) => field.toLowerCase().includes(query),
				);
			const matchesStatus =
				status === "all" ||
				(status === "active" ? club.isActive : !club.isActive);
			return matchesSearch && matchesStatus;
		});
	}, [clubs, search, status]);

	const activeCount = clubs.filter((club) => club.isActive).length;
	const attachmentCount = clubs.reduce(
		(sum, club) => sum + club.attachments.length,
		0,
	);

	const columns: Column<ClubRow>[] = [
		{
			key: "club",
			header: "Club",
			render: (club) => (
				<div className="min-w-0">
					<p className="font-medium text-foreground">{club.name}</p>
					{(club.meetingSchedule ?? club.description) && (
						<p className="truncate text-xs text-muted-foreground">
							{club.meetingSchedule ?? club.description}
						</p>
					)}
				</div>
			),
		},
		{
			key: "status",
			header: "Status",
			render: (club) => (
				<StatusBadge
					value={club.isActive ? "active" : "inactive"}
					testId={`club-status-${club.id}`}
				/>
			),
		},
		{
			key: "attachments",
			header: "Attachments",
			render: (club) => (
				<span
					className="num inline-flex items-center gap-1 text-xs text-muted-foreground"
					data-testid={`club-attachments-${club.id}`}
				>
					<Paperclip className="h-3 w-3" /> {club.attachments.length}
				</span>
			),
		},
		{
			key: "actions",
			header: "",
			align: "right",
			render: (club) => (
				<div className="flex items-center justify-end gap-1">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8"
								aria-label={`Club actions for ${club.name}`}
								data-testid={`club-actions-${club.id}`}
							>
								<MoreHorizontal className="h-4 w-4" />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align="end" className="w-52 bg-popover">
							<DropdownMenuLabel className="truncate text-xs">
								{club.name}
							</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								data-testid={`club-edit-${club.id}`}
								onClick={() => {
									setEditingClubDetails(club);
									setEditingClub(null);
								}}
							>
								<Pencil className="mr-2 h-3.5 w-3.5" /> Edit details
							</DropdownMenuItem>
							<DropdownMenuItem
								data-testid={`club-edit-attachments-${club.id}`}
								disabled={isSavingAttachments || isEditingUpload}
								onClick={() => {
									setEditingClub(club);
									setEditingClubDetails(null);
								}}
							>
								<Paperclip className="mr-2 h-3.5 w-3.5" /> Edit attachments
							</DropdownMenuItem>
							<DropdownMenuItem
								data-testid={`club-roles-${club.id}`}
								disabled={!club.isActive}
								title={
									club.isActive
										? undefined
										: "Activate the club to manage its roles and members"
								}
								onClick={() => {
									setEditingClub(null);
									setEditingClubDetails(null);
									void openClubBoard(club);
								}}
							>
								<Users className="mr-2 h-3.5 w-3.5" /> Roles &amp; members
							</DropdownMenuItem>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								data-testid={`club-toggle-${club.id}`}
								onClick={() => void toggleClub(club)}
							>
								{club.isActive ? "Deactivate" : "Activate"}
							</DropdownMenuItem>
							<DropdownMenuItem
								className="text-destructive focus:text-destructive"
								data-testid={`club-delete-${club.id}`}
								onClick={() => setPendingDelete(club)}
							>
								<Trash2 className="mr-2 h-3.5 w-3.5" /> Delete club
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			),
		},
	];

	return (
		<div data-testid="clubs-page">
			<PageHeader
				eyebrow="Website"
				title="Clubs"
				description="Student clubs shown on the public website — details, attachments, roles and members."
				meta={
					<>
						<span data-testid="clubs-count">
							{pluralize(clubs.length, "club")}
						</span>
						<span data-testid="clubs-active-count">
							{pluralize(activeCount, "active club", "active clubs")}
						</span>
						<span data-testid="clubs-attachment-count">
							{pluralize(attachmentCount, "attachment")}
						</span>
					</>
				}
				actions={
					<Button
						size="sm"
						className="gap-1.5"
						data-testid="clubs-new-club"
						onClick={() => setCreateOpen(true)}
					>
						<Plus className="h-3.5 w-3.5" /> New club
					</Button>
				}
				testId="clubs-page-header"
			/>

			<FilterBar
				testId="clubs-filters"
				search={search}
				onSearchChange={setSearch}
				placeholder="Search clubs by name, description or schedule…"
				filters={[
					{
						key: "status",
						label: "Status",
						value: status,
						options: [
							{ value: "all", label: "Any status" },
							{ value: "active", label: "Active" },
							{ value: "inactive", label: "Inactive" },
						],
						onChange: setStatus,
						width: "w-[150px]",
					},
				]}
				onReset={() => {
					setSearch("");
					setStatus("all");
				}}
			/>

			{error ? (
				<div
					className="mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
					data-testid="clubs-error-banner"
				>
					<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{error}</p>
				</div>
			) : null}
			{noticeMessage ? (
				<div
					className="mb-4 flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
					data-testid="clubs-notice-banner"
				>
					<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
					<p className="min-w-0 break-words">{noticeMessage}</p>
				</div>
			) : null}

			<DataTable
				columns={columns}
				rows={visibleClubs}
				rowId={(club) => club.id}
				testId="clubs-table"
				loading={isLoading}
				empty={
					clubs.length === 0 ? (
						<EmptyState
							icon={UsersRound}
							title="No clubs yet"
							description="Create your first club to showcase activities on the website."
							primaryLabel="New club"
							onPrimary={() => setCreateOpen(true)}
							testId="clubs-empty"
						/>
					) : (
						<EmptyState
							icon={UsersRound}
							title="No matching clubs"
							description="No clubs match your search or status filter."
							actionLabel="Clear filters"
							onAction={() => {
								setSearch("");
								setStatus("all");
							}}
							testId="clubs-empty-filtered"
						/>
					)
				}
			/>

			<Dialog open={createOpen} onOpenChange={setCreateOpen}>
				<DialogContent
					className="max-h-[85vh] overflow-y-auto border-hairline bg-popover sm:max-w-xl"
					data-testid="club-create-dialog"
				>
					<DialogHeader>
						<DialogTitle>New club</DialogTitle>
						<DialogDescription>
							Clubs appear on the public website with their board and feed.
						</DialogDescription>
					</DialogHeader>
					<form
						key={formVersion}
						onSubmit={(event) => void createClub(event)}
						className="grid gap-4 sm:grid-cols-2"
					>
						<div className="space-y-2">
							<Label htmlFor="club-create-name" className="text-xs">
								Name
							</Label>
							<Input
								id="club-create-name"
								name="name"
								required
								data-testid="club-create-name"
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="club-create-schedule" className="text-xs">
								Meeting schedule
							</Label>
							<Input id="club-create-schedule" name="meetingSchedule" />
						</div>
						<div className="space-y-2 sm:col-span-2">
							<Label htmlFor="club-create-description" className="text-xs">
								Description
							</Label>
							<Textarea
								id="club-create-description"
								name="description"
								rows={4}
							/>
						</div>
						<ImageUploadField
							name="coverImage"
							prefix="clubs"
							className="sm:col-span-2"
						/>
						<AttachmentUploadField
							name="attachments"
							prefix="clubs"
							disabled={isSubmitting}
							onUploadingChange={setIsUploading}
							className="sm:col-span-2"
						/>
						<label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
							<input
								type="checkbox"
								name="isActive"
								defaultChecked
								className="h-4 w-4 rounded border-hairline accent-primary focus-ring"
								data-testid="club-create-active"
							/>
							Active
						</label>
						<DialogFooter className="sm:col-span-2">
							<Button
								variant="outline"
								type="button"
								onClick={() => setCreateOpen(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || isUploading}
								data-testid="club-create-submit"
							>
								{isSubmitting ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Plus className="h-3.5 w-3.5" />
								)}
								{isSubmitting ? "Creating…" : "Create club"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!editingClubDetails}
				onOpenChange={(open: boolean) => !open && setEditingClubDetails(null)}
			>
				<DialogContent
					className="max-h-[85vh] overflow-y-auto border-hairline bg-popover sm:max-w-xl"
					data-testid="club-details-dialog"
				>
					<DialogHeader>
						<DialogTitle>Edit club</DialogTitle>
						<DialogDescription>
							{editingClubDetails?.name} — details shown on the public club
							page.
						</DialogDescription>
					</DialogHeader>
					{editingClubDetails && (
						<form
							key={editingClubDetails.id}
							onSubmit={(event) => void saveClubDetails(event)}
							className="grid gap-4 sm:grid-cols-2"
						>
							<div className="space-y-2">
								<Label htmlFor="club-details-name" className="text-xs">
									Name
								</Label>
								<Input
									id="club-details-name"
									name="name"
									defaultValue={editingClubDetails.name}
									required
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="club-details-schedule" className="text-xs">
									Meeting schedule
								</Label>
								<Input
									id="club-details-schedule"
									name="meetingSchedule"
									defaultValue={editingClubDetails.meetingSchedule ?? ""}
								/>
							</div>
							<div className="space-y-2 sm:col-span-2">
								<Label htmlFor="club-details-description" className="text-xs">
									Description
								</Label>
								<Textarea
									id="club-details-description"
									name="description"
									rows={4}
									defaultValue={editingClubDetails.description ?? ""}
								/>
							</div>
							<ImageUploadField
								name="coverImage"
								prefix="clubs"
								defaultUrl={editingClubDetails.coverImage}
								className="sm:col-span-2"
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
								className="sm:col-span-2"
							/>
							<label className="flex items-center gap-2 text-sm text-muted-foreground sm:col-span-2">
								<input
									type="checkbox"
									name="isActive"
									defaultChecked={editingClubDetails.isActive}
									className="h-4 w-4 rounded border-hairline accent-primary focus-ring"
									data-testid="club-details-active"
								/>
								Active
							</label>
							<DialogFooter className="sm:col-span-2">
								<Button
									variant="outline"
									type="button"
									disabled={isSavingContent || isEditingUpload}
									onClick={() => setEditingClubDetails(null)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSavingContent || isEditingUpload}
									data-testid="club-details-submit"
								>
									{isSavingContent ? (
										<Loader2 className="h-3.5 w-3.5 animate-spin" />
									) : (
										<Pencil className="h-3.5 w-3.5" />
									)}
									{isSavingContent ? "Saving…" : "Save changes"}
								</Button>
							</DialogFooter>
						</form>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!editingClub}
				onOpenChange={(open: boolean) => !open && setEditingClub(null)}
			>
				<DialogContent
					className="border-hairline bg-popover sm:max-w-md"
					data-testid="club-attachments-dialog"
				>
					<DialogHeader>
						<DialogTitle>Attachments</DialogTitle>
						<DialogDescription>
							Files for {editingClub?.name}, shown on the public club page.
						</DialogDescription>
					</DialogHeader>
					{editingClub && (
						<form
							key={editingClub.id}
							onSubmit={(event) => void saveClubAttachments(event)}
							className="space-y-3.5"
						>
							<AttachmentUploadField
								name="attachments"
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
							<DialogFooter>
								<Button
									variant="outline"
									type="button"
									disabled={isSavingAttachments || isEditingUpload}
									onClick={() => setEditingClub(null)}
								>
									Cancel
								</Button>
								<Button
									type="submit"
									disabled={isSavingAttachments || isEditingUpload}
									data-testid="club-attachments-submit"
								>
									{isSavingAttachments ? "Saving…" : "Save attachments"}
								</Button>
							</DialogFooter>
						</form>
					)}
				</DialogContent>
			</Dialog>

			<Dialog
				open={!!boardClub}
				onOpenChange={(open: boolean) => !open && setBoardClub(null)}
			>
				<DialogContent
					className="max-h-[85vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl"
					data-testid="club-board-dialog"
				>
					<DialogHeader>
						<DialogTitle>Roles &amp; members — {boardClub?.name}</DialogTitle>
						<DialogDescription>
							A plain Member role with no permissions cannot publish posts. The
							President and officers can — permissions are editable here.
						</DialogDescription>
					</DialogHeader>
					<form
						onSubmit={(event) => void saveClubBoard(event)}
						className="space-y-5"
					>
						<div className="space-y-4">
							{isLoadingBoard ? (
								<ListSkeleton rows={3} />
							) : (
								boardRoles.map((role, index) => (
									<div
										key={role.key}
										data-testid={`club-role-${role.key}`}
										className="space-y-3 rounded-lg border border-hairline bg-surface-1 p-4 transition-colors duration-150"
									>
										<div className="flex flex-wrap items-end gap-3">
											<div className="min-w-[200px] flex-1 space-y-2">
												<Label
													htmlFor={`club-role-name-${role.key}`}
													className="text-xs"
												>
													Role name
												</Label>
												<Input
													id={`club-role-name-${role.key}`}
													value={role.name}
													onChange={(
														event: React.ChangeEvent<HTMLInputElement>,
													) =>
														setBoardRoles((current) =>
															current.map((item, itemIndex) =>
																itemIndex === index
																	? {
																			...item,
																			name: event.target.value,
																		}
																	: item,
															),
														)
													}
												/>
											</div>
											<Button
												variant="outline"
												size="sm"
												className="gap-1.5 text-destructive hover:text-destructive"
												disabled={isSavingBoard}
												onClick={() => removeBoardRole(index)}
												data-testid={`club-role-remove-${role.key}`}
											>
												<Trash2 className="h-3.5 w-3.5" /> Remove role
											</Button>
										</div>
										<label className="flex items-center gap-2 text-sm text-muted-foreground">
											<input
												type="checkbox"
												checked={role.isBoard}
												onChange={(event) =>
													setBoardRoles((current) =>
														current.map((item, itemIndex) =>
															itemIndex === index
																? {
																		...item,
																		isBoard: event.target.checked,
																	}
																: item,
														),
													)
												}
												className="h-4 w-4 rounded border-hairline accent-primary focus-ring"
												data-testid={`club-role-board-${role.key}`}
											/>
											Show on the public club board
										</label>
										<fieldset>
											<legend className="eyebrow-label mb-2">
												Permissions
											</legend>
											<div className="grid gap-2 sm:grid-cols-2">
												{CLUB_PERMISSIONS.map((permission) => (
													<label
														key={permission.key}
														className="flex items-start gap-2.5 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5 transition-colors duration-150 hover:border-primary/35"
													>
														<input
															type="checkbox"
															className="mt-0.5 h-4 w-4 rounded border-hairline accent-primary focus-ring"
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
															data-testid={`club-role-permission-${role.key}-${permission.key}`}
														/>
														<span className="min-w-0">
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
								))
							)}
						</div>

						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							type="button"
							disabled={isSavingBoard || isLoadingBoard}
							onClick={addBoardRole}
							data-testid="club-add-role"
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
											data-testid={`club-member-${member.id}`}
											className="flex flex-wrap items-center gap-3 rounded-lg border border-hairline bg-surface-1 px-3 py-2"
										>
											<span className="min-w-0 flex-1 text-sm font-medium text-foreground">
												{member.name}
												{member.grade ? (
													<span className="ml-2 text-xs font-normal text-muted-foreground">
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
												className="h-8 rounded-lg border border-hairline bg-surface-1 px-2.5 text-xs text-foreground transition-colors duration-150 focus-ring"
												aria-label={`Role for ${member.name}`}
												data-testid={`club-member-role-${member.id}`}
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

						<DialogFooter>
							<Button
								variant="outline"
								type="button"
								disabled={isSavingBoard}
								onClick={() => setBoardClub(null)}
							>
								Close
							</Button>
							<Button
								type="submit"
								disabled={isSavingBoard || isLoadingBoard}
								data-testid="club-board-submit"
							>
								{isSavingBoard ? (
									<Loader2 className="h-3.5 w-3.5 animate-spin" />
								) : (
									<Pencil className="h-3.5 w-3.5" />
								)}
								{isSavingBoard ? "Saving…" : "Save roles & members"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<ConfirmDialog
				open={!!pendingDelete}
				onOpenChange={(open) => !open && setPendingDelete(null)}
				testId="clubs-delete-confirm"
				title="Delete club"
				description={`Are you sure you want to delete "${pendingDelete?.name}"? This cannot be undone.`}
				confirmLabel="Delete club"
				destructive
				onConfirm={() => void removeClub()}
				busy={isDeleting}
			/>
		</div>
	);
}
