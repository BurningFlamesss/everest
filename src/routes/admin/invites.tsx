import { createFileRoute, Link } from "@tanstack/react-router";
import {
	Check,
	Copy,
	Loader2,
	MailPlus,
	RefreshCw,
	Trash2,
	UploadCloud,
	X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
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
	listDirectoryAction,
	listInvitesAction,
	revokeInviteAction,
} from "#/packages/invite/server.ts";
import { StaffImport } from "#/packages/invite/staff-import.tsx";
import { StudentImport } from "#/packages/invite/student-import.tsx";

export const Route = createFileRoute("/admin/invites")({
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

interface StudentOption {
	id: string;
	name: string;
	email: string;
	grade: string | null;
	section: string | null;
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
	const [students, setStudents] = useState<Array<StudentOption>>([]);
	const [requests, setRequests] = useState<Array<InviteRequestRow>>([]);
	const [isLoadingRequests, setIsLoadingRequests] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [createdLink, setCreatedLink] = useState("");
	const [copied, setCopied] = useState("");

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

	useEffect(() => {
		if (type !== "GUARDIAN" || students.length > 0) return;

		void listDirectoryAction({ data: {} }).then((response) => {
			if (response.success) {
				setStudents(
					response.students.map((student) => ({
						id: student.id,
						name: student.name,
						email: student.email,
						grade: student.grade,
						section: student.section,
					})),
				);
			}
		});
	}, [type, students.length]);

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
				`Invitation created for ${response.invite.user.name}. Email ${
					response.invite.emailSent ? "sent" : "not sent"
				}.`,
			);
			form.reset();
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
		if (!confirm(`Revoke the invitation for ${invite.user.email}?`)) return;

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
		const note = window.prompt(
			`Reason for rejecting ${request.name}? (optional)`,
			"",
		);

		if (note === null) return;

		setError("");
		const response = await rejectInviteRequestAction({
			data: { id: request.id, note: note.trim() || undefined },
		});

		if (!response.success) {
			setError(response.error);
			return;
		}

		setNotice(`Rejected the request from ${request.name}.`);
		await loadRequests();
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
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Invitations</h1>
					<p className="mt-1 text-sm text-gray-500">
						Create single invitations or import a whole CSV. Links expire after
						seven days.
					</p>
				</div>
				<div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
					<button
						type="button"
						onClick={() => setTab("single")}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium",
							tab === "single"
								? "bg-red-500 text-white"
								: "text-gray-600 hover:bg-gray-100",
						)}
					>
						One person
					</button>
					<button
						type="button"
						onClick={() => setTab("import")}
						className={cn(
							"rounded-md px-3 py-1.5 text-sm font-medium",
							tab === "import"
								? "bg-red-500 text-white"
								: "text-gray-600 hover:bg-gray-100",
						)}
					>
						CSV import
					</button>
					<button
						type="button"
						onClick={() => setTab("requests")}
						className={cn(
							"inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium",
							tab === "requests"
								? "bg-red-500 text-white"
								: "text-gray-600 hover:bg-gray-100",
						)}
					>
						Requests
						{pendingRequests.length > 0 ? (
							<span
								className={cn(
									"rounded-full px-1.5 py-0.5 text-[10px] font-bold",
									tab === "requests"
										? "bg-white/20 text-white"
										: "bg-red-100 text-red-700",
								)}
							>
								{pendingRequests.length}
							</span>
						) : null}
					</button>
				</div>
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}
			{notice ? (
				<div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
					<p>{notice}</p>
					{createdLink ? (
						<div className="mt-2 flex flex-wrap items-center gap-2">
							<code className="break-all rounded bg-white px-2 py-1 text-xs text-gray-700">
								{createdLink}
							</code>
							<button
								type="button"
								onClick={() => void copy(createdLink)}
								className="inline-flex items-center gap-1 rounded border border-green-300 bg-white px-2 py-1 text-xs font-semibold"
							>
								<Copy className="h-3 w-3" />
								{copied === createdLink ? "Copied" : "Copy"}
							</button>
						</div>
					) : null}
				</div>
			) : null}

			{tab === "import" ? (
				<div className="space-y-6">
					<div className="grid gap-6 xl:grid-cols-2">
						<StudentImport />
						<StaffImport />
					</div>
				</div>
			) : tab === "requests" ? (
				<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
					<header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
						<div>
							<h2 className="font-semibold text-gray-900">
								Invitation requests
							</h2>
							<p className="text-xs text-gray-500">
								{pendingRequests.length} pending · {requests.length} total
							</p>
						</div>
						<button
							type="button"
							onClick={() => void loadRequests()}
							className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
						>
							<RefreshCw
								className={cn(
									"h-3.5 w-3.5",
									isLoadingRequests && "animate-spin",
								)}
							/>
							Refresh
						</button>
					</header>

					{isLoadingRequests ? (
						<p className="p-5 text-sm text-gray-500">Loading requests…</p>
					) : requests.length === 0 ? (
						<div className="p-8 text-center">
							<MailPlus className="mx-auto h-8 w-8 text-gray-300" />
							<p className="mt-3 text-sm text-gray-500">
								No invitation requests yet. Public requests from the signup page
								appear here.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-gray-100">
							{requests.map((request) => (
								<li key={request.id} className="px-5 py-4">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div className="min-w-0">
											<p className="font-medium text-gray-900">
												{request.name}{" "}
												<span className="ml-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
													{request.type}
												</span>
											</p>
											<p className="text-xs text-gray-500">{request.email}</p>
											{request.message ? (
												<p className="mt-2 max-w-2xl text-sm text-gray-600">
													{request.message}
												</p>
											) : null}
											<p className="mt-2 text-[11px] text-gray-400">
												Requested {new Date(request.createdAt).toLocaleString()}
												{request.reviewedBy
													? ` · reviewed by ${request.reviewedBy.name}`
													: ""}
											</p>
											{request.reviewNote ? (
												<p className="mt-1 text-[11px] text-gray-500">
													Note: {request.reviewNote}
												</p>
											) : null}
										</div>

										<div className="flex items-center gap-2">
											<span
												className={cn(
													"rounded-full px-2.5 py-1 text-xs font-semibold",
													request.status === "PENDING"
														? "bg-amber-100 text-amber-700"
														: request.status === "APPROVED"
															? "bg-green-100 text-green-700"
															: "bg-gray-100 text-gray-600",
												)}
											>
												{request.status}
											</span>
											{request.status === "PENDING" ? (
												<>
													<button
														type="button"
														onClick={() => void approveRequest(request)}
														className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
													>
														<Check className="h-3.5 w-3.5" /> Approve
													</button>
													<button
														type="button"
														onClick={() => void rejectRequest(request)}
														className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
													>
														<X className="h-3.5 w-3.5" /> Reject
													</button>
												</>
											) : null}
										</div>
									</div>
								</li>
							))}
						</ul>
					)}
				</section>
			) : (
				<>
					<section className="rounded-2xl border border-gray-200 bg-white p-6">
						<div className="mb-5 flex flex-wrap items-center gap-2">
							<span className="text-sm font-semibold text-gray-900">
								Invite a
							</span>
							{(["STAFF", "STUDENT", "GUARDIAN"] as Array<InviteType>).map(
								(item) => (
									<button
										key={item}
										type="button"
										onClick={() => setType(item)}
										className={cn(
											"rounded-full border px-3 py-1 text-xs font-semibold",
											type === item
												? "border-red-300 bg-red-50 text-red-700"
												: "border-gray-200 text-gray-600 hover:bg-gray-50",
										)}
									>
										{item.toLowerCase()}
									</button>
								),
							)}
						</div>

						<form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Full name
								</span>
								<input
									name="name"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
								/>
							</label>
							<label className="text-sm">
								<span className="mb-1 block font-medium text-gray-700">
									Email
								</span>
								<input
									name="email"
									type="email"
									required
									className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
								/>
							</label>

							{type === "STAFF" ? (
								<>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Designation
										</span>
										<input
											name="designation"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Department
										</span>
										<input
											name="department"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Role
										</span>
										<select
											name="role"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										>
											<option value="STAFF">Staff</option>
											<option value="ADMIN">Administrator</option>
										</select>
									</label>
								</>
							) : null}

							{type === "STUDENT" ? (
								<>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Admission number
										</span>
										<input
											name="admissionNo"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Roll number
										</span>
										<input
											name="rollNo"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Grade / class
										</span>
										<input
											name="grade"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Section
										</span>
										<input
											name="section"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
								</>
							) : null}

							{type === "GUARDIAN" ? (
								<>
									<label className="text-sm md:col-span-2">
										<span className="mb-1 block font-medium text-gray-700">
											Student
										</span>
										<select
											name="studentId"
											required
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										>
											<option value="">Select a student…</option>
											{students.map((student) => (
												<option key={student.id} value={student.id}>
													{student.name} ({student.grade ?? "no grade"}
													{student.section ? `-${student.section}` : ""})
												</option>
											))}
										</select>
									</label>
									<label className="text-sm">
										<span className="mb-1 block font-medium text-gray-700">
											Relationship
										</span>
										<input
											name="relation"
											defaultValue="Guardian"
											className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
										/>
									</label>
									<label className="flex items-center gap-2 self-end text-sm text-gray-700">
										<input type="checkbox" name="isPrimary" /> Primary guardian
									</label>
								</>
							) : null}

							<label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
								<input type="checkbox" name="sendEmail" /> Email the activation
								link (requires mail settings)
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
										<MailPlus className="h-4 w-4" />
									)}
									{isSubmitting ? "Creating…" : "Create invitation"}
								</button>
							</div>
						</form>
					</section>

					<section className="rounded-2xl border border-gray-200 bg-white">
						<header className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
							<div>
								<h2 className="font-semibold text-gray-900">
									Active invitations
								</h2>
								<p className="text-xs text-gray-500">
									{invites.length} unused invitation
									{invites.length === 1 ? "" : "s"}
								</p>
							</div>
							<button
								type="button"
								onClick={() => void loadInvites()}
								className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
							>
								<RefreshCw
									className={cn("h-3.5 w-3.5", isLoading && "animate-spin")}
								/>
								Refresh
							</button>
						</header>

						{isLoading ? (
							<p className="p-5 text-sm text-gray-500">Loading invitations…</p>
						) : invites.length === 0 ? (
							<div className="p-8 text-center">
								<UploadCloud className="mx-auto h-8 w-8 text-gray-300" />
								<p className="mt-3 text-sm text-gray-500">
									No active invitations. Create one above or import a CSV.
								</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="min-w-full text-left text-sm">
									<thead className="bg-gray-50 text-xs uppercase text-gray-500">
										<tr>
											<th className="px-5 py-3">Person</th>
											<th className="px-5 py-3">Type</th>
											<th className="px-5 py-3">Expires</th>
											<th className="px-5 py-3">Link</th>
											<th className="px-5 py-3" />
										</tr>
									</thead>
									<tbody>
										{invites.map((invite) => (
											<tr key={invite.id} className="border-t border-gray-100">
												<td className="px-5 py-3">
													<p className="font-medium text-gray-900">
														{invite.user.name}
													</p>
													<p className="text-xs text-gray-500">
														{invite.user.email}
													</p>
													{invite.student ? (
														<p className="text-xs text-gray-400">
															Guardian of {invite.student.name}
														</p>
													) : null}
												</td>
												<td className="px-5 py-3">
													<span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
														{invite.type}
													</span>
												</td>
												<td className="px-5 py-3 text-xs text-gray-500">
													{new Date(invite.expiresAt).toLocaleDateString()}
												</td>
												<td className="px-5 py-3">
													<button
														type="button"
														onClick={() => void copy(invite.url)}
														className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-900"
													>
														<Copy className="h-3.5 w-3.5" />
														{copied === invite.url ? "Copied" : "Copy"}
													</button>
												</td>
												<td className="px-5 py-3 text-right">
													<button
														type="button"
														onClick={() => void handleRevoke(invite)}
														className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
													>
														<Trash2 className="h-3.5 w-3.5" /> Revoke
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</section>

					<p className="text-sm text-gray-500">
						Need a full list of people already in the school?{" "}
						<Link
							to="/admin/directory"
							className="font-semibold text-red-600 hover:text-red-700"
						>
							Open the directory
						</Link>
						.
					</p>
				</>
			)}
		</div>
	);
}
