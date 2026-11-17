import { createFileRoute, Link } from "@tanstack/react-router";
import {
	AlertTriangle,
	Check,
	CheckCircle2,
	Copy,
	Loader2,
	MailPlus,
	RefreshCw,
	Trash2,
	UploadCloud,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ConfirmDialog } from "#/components/common/ConfirmDialog";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PersonCell } from "#/components/common/PersonCell";
import { ListSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { StudentSearchInput } from "#/components/people/StudentSearchInput.tsx";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Textarea } from "#/components/ui/textarea";
import { cn } from "#/lib/utils.ts";
import {
	approveInviteRequestAction,
	listInviteRequestsAction,
	rejectInviteRequestAction,
} from "#/packages/invite/requests-server.ts";
import {
	createGuardianInviteAction,
	createStaffInviteAction,
	createStudentInviteAction,
	getMailStatusFn,
	listInvitesAction,
	resendInviteAction,
	revokeInviteAction,
} from "#/packages/invite/server.ts";
import { StaffImport } from "#/packages/invite/staff-import.tsx";
import { StudentImport } from "#/packages/invite/student-import.tsx";

export const Route = createFileRoute("/admin/_admin/invites")({
	component: AdminInvites,
});

type InviteType = "STAFF" | "STUDENT" | "GUARDIAN";

interface InviteEntry {
	id: string;
	token: string;
	type: InviteType;
	expiresAt: string | Date;
	usedAt: string | Date | null;
	createdAt: string | Date;
	url: string;
	user: {
		id: string;
		name: string;
		email: string;
		activatedAt: string | Date | null;
	};
	student: {
		id: string;
		name: string;
		grade: string | null;
		section: string | null;
	} | null;
}

interface InviteRequestRow {
	id: string;
	name: string;
	email: string;
	type: InviteType;
	message: string | null;
	status: "PENDING" | "APPROVED" | "REJECTED";
	reviewNote: string | null;
	reviewedAt: string | Date | null;
	createdAt: string | Date;
	reviewedBy: { name: string; email: string } | null;
}

function AdminInvites() {
	const [tab, setTab] = useState<"single" | "import" | "requests">("single");
	const [type, setType] = useState<InviteType>("STAFF");
	const [invites, setInvites] = useState<Array<InviteEntry>>([]);
	const [formVersion, setFormVersion] = useState(0);
	const [requests, setRequests] = useState<Array<InviteRequestRow>>([]);
	const [isLoadingRequests, setIsLoadingRequests] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [createdLink, setCreatedLink] = useState("");
	const [copied, setCopied] = useState("");
	// `null` while we have not heard back, so we never disable email by accident.
	const [mailConfigured, setMailConfigured] = useState<boolean | null>(null);
	const [resendingId, setResendingId] = useState("");
	const [pendingRevoke, setPendingRevoke] = useState<InviteEntry | null>(null);
	const [pendingReject, setPendingReject] = useState<InviteRequestRow | null>(
		null,
	);
	const [rejectNote, setRejectNote] = useState("");
	const [isRejecting, setIsRejecting] = useState(false);

	useEffect(() => {
		let cancelled = false;

		void (async () => {
			const response = await getMailStatusFn();

			if (!cancelled && response.success) {
				setMailConfigured(response.mailConfigured);
			}
		})();

		return () => {
			cancelled = true;
		};
	}, []);

	const loadInvites = useCallback(async () => {
		setIsLoading(true);
		const response = await listInvitesAction({ data: { includeUsed: false } });

		if (response.success) {
			setInvites(response.invites as Array<InviteEntry>);
			setError("");
		} else {
			setError(response.error);
		}

		setIsLoading(false);
	}, []);

	useEffect(() => {
		void loadInvites();
	}, [loadInvites]);

	const loadRequests = useCallback(async () => {
		setIsLoadingRequests(true);
		const response = await listInviteRequestsAction({ data: {} });

		if (response.success) {
			setRequests(response.requests as Array<InviteRequestRow>);
		}

		setIsLoadingRequests(false);
	}, []);

	useEffect(() => {
		void loadRequests();
	}, [loadRequests]);

	const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setNotice("");
		setCreatedLink("");
		setIsSubmitting(true);

		const form = event.currentTarget;
		const data = new FormData(form);

		try {
			const common = {
				name: String(data.get("name") ?? "").trim(),
				email: String(data.get("email") ?? "").trim(),
				sendEmail: data.get("sendEmail") === "on",
			};

			const response =
				type === "STAFF"
					? await createStaffInviteAction({
							data: {
								...common,
								designation: String(data.get("designation") ?? "").trim(),
								department: String(data.get("department") ?? "").trim(),
								role: data.get("role") === "ADMIN" ? "ADMIN" : "STAFF",
							},
						})
					: type === "STUDENT"
						? await createStudentInviteAction({
								data: {
									...common,
									admissionNo: String(data.get("admissionNo") ?? "").trim(),
									rollNo: String(data.get("rollNo") ?? "").trim(),
									grade: String(data.get("grade") ?? "").trim(),
									section: String(data.get("section") ?? "").trim(),
								},
							})
						: await createGuardianInviteAction({
								data: {
									...common,
									studentId: String(data.get("studentId") ?? ""),
									relation: String(data.get("relation") ?? "").trim(),
									isPrimary: data.get("isPrimary") === "on",
								},
							});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setCreatedLink(response.invite.url);
			setNotice(
				response.invite.emailSent
					? `Invitation created for ${response.invite.user.name}. Activation email sent.`
					: `Invitation created for ${response.invite.user.name}. Email not sent${
							response.invite.emailError
								? ` — ${response.invite.emailError}`
								: ""
						} — copy the link below to share it.`,
			);
			// Remount the form so the searchable picker and every input reset.
			setFormVersion((version) => version + 1);
			await loadInvites();
		} catch (createError) {
			setError(
				createError instanceof Error
					? createError.message
					: "Could not create the invitation.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleRevoke = async (invite: InviteEntry) => {
		setPendingRevoke(null);

		const response = await revokeInviteAction({
			data: { id: invite.id, type: invite.type },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice("Invitation revoked.");
		await loadInvites();
	};

	const handleResend = async (invite: InviteEntry) => {
		setError("");
		setNotice("");
		setResendingId(invite.id);

		try {
			const response = await resendInviteAction({
				data: { id: invite.id, type: invite.type },
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			if (response.emailSent) {
				setNotice(`Activation email re-sent to ${invite.user.email}.`);
			} else {
				setCreatedLink(response.url);
				setNotice(
					`Could not email ${invite.user.email}${
						response.reason ? ` — ${response.reason}` : ""
					}. Copy the link below and send it manually.`,
				);
			}
		} catch (resendError) {
			setError(
				resendError instanceof Error
					? resendError.message
					: "Could not resend the invitation.",
			);
		} finally {
			setResendingId("");
		}
	};

	const approveRequest = async (request: InviteRequestRow) => {
		setError("");
		setNotice("");
		setCreatedLink("");

		const response = await approveInviteRequestAction({
			data: { id: request.id, sendEmail: true },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setCreatedLink(response.invite.url);
		setNotice(
			`Approved ${request.name}. Invitation created. Decision email ${
				response.decisionEmailSent
					? "sent"
					: "not sent (mail may not be configured)"
			}.`,
		);
		await Promise.all([loadRequests(), loadInvites()]);
	};

	const rejectRequest = async (request: InviteRequestRow) => {
		setIsRejecting(true);
		try {
			const response = await rejectInviteRequestAction({
				data: { id: request.id, note: rejectNote.trim() || undefined },
			});

			if (!response.success) {
				setError(response.error);
				return;
			}

			setNotice(`Rejected the request from ${request.name}.`);
			setPendingReject(null);
			setRejectNote("");
			await loadRequests();
		} catch (rejectError) {
			setError(
				rejectError instanceof Error
					? rejectError.message
					: "Could not reject this request.",
			);
		} finally {
			setIsRejecting(false);
		}
	};

	const pendingRequests = requests.filter(
		(request) => request.status === "PENDING",
	);

	const copy = async (url: string) => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(url);
			setTimeout(() => setCopied(""), 1800);
		} catch {
			setCopied("");
		}
	};

	return (
		<div data-testid="invites-page">
			<PageHeader
				eyebrow="People"
				title="Invitations"
				description="Create single invitations or import a whole CSV. Links expire after seven days."
				testId="invites-page-header"
			/>

			<div className="space-y-5">
				<Tabs
					value={tab}
					onValueChange={(value: string) =>
						setTab(value as "single" | "import" | "requests")
					}
				>
					<TabsList className="h-9" data-testid="invites-tabs">
						<TabsTrigger
							value="single"
							className="text-xs"
							data-testid="invites-tab-single"
						>
							One person
						</TabsTrigger>
						<TabsTrigger
							value="import"
							className="text-xs"
							data-testid="invites-tab-import"
						>
							CSV import
						</TabsTrigger>
						<TabsTrigger
							value="requests"
							className="text-xs"
							data-testid="invites-tab-requests"
						>
							Requests
							{pendingRequests.length > 0 ? (
								<span
									className="num rounded-full bg-primary/12 px-1.5 py-0.5 text-[11px] font-semibold text-primary"
									data-testid="invites-pending-count"
								>
									{pendingRequests.length}
								</span>
							) : null}
						</TabsTrigger>
					</TabsList>
				</Tabs>

				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="invites-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}
				{notice ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-success/20 bg-success/10 p-4 text-sm text-success"
						data-testid="invites-notice-banner"
					>
						<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
						<div className="min-w-0 flex-1">
							<p className="min-w-0 break-words">{notice}</p>
							{createdLink ? (
								<div className="mt-2 flex flex-wrap items-center gap-2">
									<code className="num break-all rounded border border-hairline bg-surface-2 px-2 py-1 text-xs text-foreground">
										{createdLink}
									</code>
									<Button
										variant="outline"
										size="xs"
										className="gap-1"
										data-testid="invites-copy-link"
										onClick={() => void copy(createdLink)}
									>
										<Copy className="h-3 w-3" />
										{copied === createdLink ? "Copied" : "Copy"}
									</Button>
								</div>
							) : null}
						</div>
					</div>
				) : null}

				{tab === "import" ? (
					<div className="space-y-5">
						<div className="grid gap-5 xl:grid-cols-2">
							<StudentImport mailConfigured={mailConfigured ?? true} />
							<StaffImport mailConfigured={mailConfigured ?? true} />
						</div>
					</div>
				) : tab === "requests" ? (
					<Panel
						title="Invitation requests"
						description={`${pendingRequests.length} pending · ${requests.length} total`}
						testId="invites-requests-panel"
						bodyClassName="p-0"
						actions={
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								data-testid="invites-requests-refresh"
								onClick={() => void loadRequests()}
							>
								<RefreshCw
									className={cn(
										"h-3.5 w-3.5",
										isLoadingRequests && "animate-spin",
									)}
								/>
								Refresh
							</Button>
						}
					>
						{isLoadingRequests ? (
							<div className="p-5" data-testid="invites-requests-loading">
								<ListSkeleton rows={4} />
							</div>
						) : requests.length === 0 ? (
							<EmptyState
								icon={MailPlus}
								title="No invitation requests yet"
								description="Public requests from the signup page appear here."
								testId="invites-requests-empty"
							/>
						) : (
							<ul className="divide-y divide-hairline">
								{requests.map((request) => (
									<li
										key={request.id}
										className="px-5 py-4"
										data-testid={`invites-request-${request.id}`}
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="min-w-0">
												<p className="text-sm font-medium text-foreground">
													{request.name}{" "}
													<span
														className="num ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
														data-testid={`invites-request-type-${request.id}`}
													>
														{request.type}
													</span>
												</p>
												<p className="text-xs text-muted-foreground">
													{request.email}
												</p>
												{request.message ? (
													<p className="mt-2 max-w-2xl text-sm leading-relaxed text-foreground/80">
														{request.message}
													</p>
												) : null}
												<p className="num mt-2 text-[11px] text-muted-foreground">
													Requested{" "}
													{new Date(request.createdAt).toLocaleString()}
													{request.reviewedBy
														? ` · reviewed by ${request.reviewedBy.name}`
														: ""}
												</p>
												{request.reviewNote ? (
													<p className="mt-1 text-[11px] text-muted-foreground">
														Note: {request.reviewNote}
													</p>
												) : null}
											</div>

											<div className="flex items-center gap-2">
												<StatusBadge
													value={
														request.status === "PENDING"
															? "pending"
															: request.status === "APPROVED"
																? "active"
																: "rejected"
													}
													label={request.status}
													testId={`invites-request-status-${request.id}`}
												/>
												{request.status === "PENDING" ? (
													<>
														<Button
															size="sm"
															className="gap-1"
															data-testid={`invites-request-approve-${request.id}`}
															onClick={() => void approveRequest(request)}
														>
															<Check className="h-3.5 w-3.5" /> Approve
														</Button>
														<Button
															variant="ghost"
															size="sm"
															className="gap-1 text-destructive hover:text-destructive"
															data-testid={`invites-request-reject-${request.id}`}
															onClick={() => {
																setPendingReject(request);
																setRejectNote("");
															}}
														>
															<X className="h-3.5 w-3.5" /> Reject
														</Button>
													</>
												) : null}
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</Panel>
				) : (
					<>
						<Panel
							title="Invite a person"
							description="Choose who the invitation is for, then send it or share the link."
							testId="invites-create-panel"
						>
							<div className="mb-5 flex flex-wrap items-center gap-2">
								<span className="text-sm font-medium text-foreground">
									Invite a
								</span>
								{(["STAFF", "STUDENT", "GUARDIAN"] as Array<InviteType>).map(
									(item) => (
										<Button
											key={item}
											type="button"
											variant="outline"
											size="xs"
											className={cn(
												"rounded-full capitalize transition-colors duration-150",
												type === item
													? "border-primary/35 bg-primary/[0.06] font-semibold text-primary hover:text-primary"
													: "text-muted-foreground hover:text-foreground",
											)}
											data-testid={`invites-type-${item.toLowerCase()}`}
											onClick={() => setType(item)}
										>
											{item.toLowerCase()}
										</Button>
									),
								)}
							</div>

							<form
								key={formVersion}
								onSubmit={handleCreate}
								className="grid gap-4 md:grid-cols-2"
							>
								<div className="space-y-2">
									<Label htmlFor="invite-name" className="text-xs">
										Full name
									</Label>
									<Input
										id="invite-name"
										name="name"
										required
										data-testid="invite-name"
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="invite-email" className="text-xs">
										Email
									</Label>
									<Input
										id="invite-email"
										name="email"
										type="email"
										required
										data-testid="invite-email"
									/>
								</div>

								{type === "STAFF" ? (
									<>
										<div className="space-y-2">
											<Label htmlFor="invite-designation" className="text-xs">
												Designation
											</Label>
											<Input
												id="invite-designation"
												name="designation"
												data-testid="invite-designation"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-department" className="text-xs">
												Department
											</Label>
											<Input
												id="invite-department"
												name="department"
												data-testid="invite-department"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-role" className="text-xs">
												Role
											</Label>
											<select
												id="invite-role"
												name="role"
												data-testid="invite-role"
												className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
											>
												<option value="STAFF">Staff</option>
												<option value="ADMIN">Administrator</option>
											</select>
										</div>
									</>
								) : null}

								{type === "STUDENT" ? (
									<>
										<div className="space-y-2">
											<Label htmlFor="invite-admission-no" className="text-xs">
												Admission number
											</Label>
											<Input
												id="invite-admission-no"
												name="admissionNo"
												data-testid="invite-admission-no"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-roll-no" className="text-xs">
												Roll number
											</Label>
											<Input
												id="invite-roll-no"
												name="rollNo"
												data-testid="invite-roll-no"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-grade" className="text-xs">
												Grade / class
											</Label>
											<Input
												id="invite-grade"
												name="grade"
												data-testid="invite-grade"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-section" className="text-xs">
												Section
											</Label>
											<Input
												id="invite-section"
												name="section"
												data-testid="invite-section"
											/>
										</div>
									</>
								) : null}

								{type === "GUARDIAN" ? (
									<>
										<div className="space-y-2 md:col-span-2">
											<Label htmlFor="invite-student" className="text-xs">
												Student
											</Label>
											<StudentSearchInput
												name="studentId"
												required
												ariaLabel="Student"
												placeholder="Search by name, admission or email…"
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="invite-relation" className="text-xs">
												Relationship
											</Label>
											<Input
												id="invite-relation"
												name="relation"
												defaultValue="Guardian"
												data-testid="invite-relation"
											/>
										</div>
										<label className="flex items-center gap-2 self-end text-sm text-foreground">
											<input
												type="checkbox"
												name="isPrimary"
												className="h-4 w-4 accent-primary focus-ring"
											/>{" "}
											Primary guardian
										</label>
									</>
								) : null}

								<label className="flex items-start gap-2 text-sm text-foreground md:col-span-2">
									<input
										type="checkbox"
										name="sendEmail"
										disabled={mailConfigured === false}
										className="mt-0.5 h-4 w-4 accent-primary focus-ring"
									/>
									<span>
										Email the activation link
										{mailConfigured === false ? (
											<span className="block text-xs text-warning">
												Email is not configured yet — the link will be shown so
												you can send it yourself.
											</span>
										) : (
											<span className="block text-xs text-muted-foreground">
												Uses your mail settings. Leave off to copy the link
												instead.
											</span>
										)}
									</span>
								</label>

								<div className="md:col-span-2">
									<Button
										type="submit"
										size="sm"
										className="gap-1.5"
										disabled={isSubmitting}
										data-testid="invite-submit"
									>
										{isSubmitting ? (
											<Loader2 className="h-3.5 w-3.5 animate-spin" />
										) : (
											<MailPlus className="h-3.5 w-3.5" />
										)}
										{isSubmitting ? "Creating…" : "Create invitation"}
									</Button>
								</div>
							</form>
						</Panel>

						<Panel
							title="Active invitations"
							description={`${invites.length} unused invitation${
								invites.length === 1 ? "" : "s"
							}`}
							testId="invites-active-panel"
							bodyClassName="p-0"
							actions={
								<Button
									variant="outline"
									size="sm"
									className="gap-1.5"
									data-testid="invites-refresh"
									onClick={() => void loadInvites()}
								>
									<RefreshCw
										className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
									/>
									Refresh
								</Button>
							}
						>
							{isLoading ? (
								<div className="p-5" data-testid="invites-loading">
									<ListSkeleton rows={4} />
								</div>
							) : invites.length === 0 ? (
								<EmptyState
									icon={UploadCloud}
									title="No active invitations"
									description="Create one above or import a CSV."
									testId="invites-active-empty"
								/>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full min-w-[720px] border-collapse text-sm">
										<thead className="bg-surface-2">
											<tr className="border-b border-hairline">
												<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
													Person
												</th>
												<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
													Type
												</th>
												<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
													Expires
												</th>
												<th className="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
													Link
												</th>
												<th className="px-4 py-2" />
											</tr>
										</thead>
										<tbody className="divide-y divide-hairline">
											{invites.map((invite) => (
												<tr
													key={invite.id}
													data-testid={`invites-invite-${invite.id}`}
													className="transition-colors duration-150 hover:bg-surface-2"
												>
													<td className="px-4 py-2.5 align-middle">
														<PersonCell
															name={invite.user.name}
															subtitle={invite.user.email}
														/>
														{invite.student ? (
															<p className="mt-0.5 text-xs text-muted-foreground">
																Guardian of {invite.student.name}
															</p>
														) : null}
													</td>
													<td className="px-4 py-2.5 align-middle">
														<span className="num rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted-foreground">
															{invite.type}
														</span>
													</td>
													<td className="num px-4 py-2.5 align-middle text-xs text-muted-foreground">
														{new Date(invite.expiresAt).toLocaleDateString()}
													</td>
													<td className="px-4 py-2.5 align-middle">
														<Button
															variant="ghost"
															size="sm"
															className="h-7 gap-1 px-2 text-xs text-muted-foreground"
															data-testid={`invites-copy-${invite.id}`}
															onClick={() => void copy(invite.url)}
														>
															<Copy className="h-3.5 w-3.5" />
															{copied === invite.url ? "Copied" : "Copy"}
														</Button>
													</td>
													<td className="px-4 py-2.5 text-right align-middle">
														<div className="inline-flex items-center gap-1">
															<Button
																variant="ghost"
																size="sm"
																className="h-7 gap-1 px-2 text-xs text-muted-foreground"
																data-testid={`invites-resend-${invite.id}`}
																onClick={() => void handleResend(invite)}
																disabled={resendingId === invite.id}
																title={
																	mailConfigured === false
																		? "Mail is not configured — the link will be shown to send manually"
																		: "Re-send the activation email"
																}
															>
																<RefreshCw
																	className={cn(
																		"h-3.5 w-3.5",
																		resendingId === invite.id && "animate-spin",
																	)}
																/>
																Resend
															</Button>
															<Button
																variant="ghost"
																size="sm"
																className="h-7 gap-1 px-2 text-xs text-destructive hover:text-destructive"
																data-testid={`invites-revoke-${invite.id}`}
																onClick={() => setPendingRevoke(invite)}
															>
																<Trash2 className="h-3.5 w-3.5" /> Revoke
															</Button>
														</div>
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							)}
						</Panel>

						<p className="text-sm text-muted-foreground">
							Need a full list of people already in the school?{" "}
							<Link
								to="/admin/directory"
								className="font-medium text-primary transition-colors duration-150 hover:text-primary/80 focus-ring"
								data-testid="invites-directory-link"
							>
								Open the directory
							</Link>
							.
						</p>
					</>
				)}
			</div>

			<ConfirmDialog
				open={pendingRevoke !== null}
				onOpenChange={(open) => !open && setPendingRevoke(null)}
				title="Revoke this invitation?"
				description={`The invitation for ${pendingRevoke?.user.email ?? ""} will stop working immediately. The person cannot activate their account with the link.`}
				confirmLabel="Revoke invitation"
				destructive
				onConfirm={() => {
					if (!pendingRevoke) return;
					void handleRevoke(pendingRevoke);
				}}
				testId="invites-revoke-confirm"
			/>

			<Dialog
				open={pendingReject !== null}
				onOpenChange={(open: boolean) => {
					if (!open) {
						setPendingReject(null);
						setRejectNote("");
					}
				}}
			>
				<DialogContent
					className="border-hairline bg-popover sm:max-w-md"
					data-testid="invites-reject-dialog"
				>
					<DialogHeader>
						<DialogTitle>Reject this request?</DialogTitle>
						<DialogDescription>
							{pendingReject
								? `${pendingReject.name} will not be able to activate an account from this request. A reason is optional and is shown to them in the review note.`
								: ""}
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-1.5">
						<Label htmlFor="invite-reject-note" className="text-xs">
							Reason (optional)
						</Label>
						<Textarea
							id="invite-reject-note"
							rows={3}
							value={rejectNote}
							placeholder="Why is this request being rejected?"
							data-testid="invites-reject-note"
							onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
								setRejectNote(event.target.value)
							}
						/>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							type="button"
							onClick={() => {
								setPendingReject(null);
								setRejectNote("");
							}}
							data-testid="invites-reject-cancel"
						>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={isRejecting}
							data-testid="invites-reject-submit"
							onClick={() => pendingReject && void rejectRequest(pendingReject)}
						>
							{isRejecting ? "Rejecting…" : "Reject request"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
