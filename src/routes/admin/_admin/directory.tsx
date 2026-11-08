import { createFileRoute, Link } from "@tanstack/react-router";
import {
	ChevronLeft,
	ChevronRight,
	Loader2,
	Search,
	UploadCloud,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "#/lib/utils.ts";
import { listDirectoryAction } from "#/packages/invite/server.ts";
import type {
	DirectoryGuardianRow,
	DirectoryPage,
	DirectoryStaffRow,
	DirectoryStudentRow,
	DirectoryTab,
} from "#/packages/people/directory-service.ts";

export const Route = createFileRoute("/admin/_admin/directory")({
	component: AdminDirectory,
});

const TABS: Array<DirectoryTab> = ["students", "staff", "guardians"];

function AdminDirectory() {
	const [tab, setTab] = useState<DirectoryTab>("students");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [result, setResult] = useState<DirectoryPage | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const requestId = useRef(0);

	const load = useCallback(
		async (params: { tab: DirectoryTab; search: string; page: number }) => {
			const currentRequest = ++requestId.current;
			setIsLoading(true);

			const response = await listDirectoryAction({
				data: {
					tab: params.tab,
					search: params.search.trim() || undefined,
					page: params.page,
				},
			});

			// Ignore responses that arrive after a newer request.
			if (currentRequest !== requestId.current) return;

			if (!response.success) {
				setError(response.error);
				setIsLoading(false);
				return;
			}

			setResult(response);
			// The server clamps out-of-range pages; keep the pager in sync so the
			// Previous button moves instead of asking for another invalid page.
			if (response.page !== params.page) setPage(response.page);
			setError("");
			setIsLoading(false);
		},
		[],
	);

	useEffect(() => {
		const timer = setTimeout(() => {
			void load({ tab, search, page });
		}, 250);

		return () => clearTimeout(timer);
	}, [load, search, tab, page]);

	const changeTab = (next: DirectoryTab) => {
		setTab(next);
		setPage(1);
	};

	const rows = result?.rows ?? [];
	const students =
		result?.tab === "students" ? (rows as Array<DirectoryStudentRow>) : [];
	const staff =
		result?.tab === "staff" ? (rows as Array<DirectoryStaffRow>) : [];
	const guardians =
		result?.tab === "guardians" ? (rows as Array<DirectoryGuardianRow>) : [];

	return (
		<div className="space-y-8">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Directory</h1>
					<p className="mt-1 text-sm text-gray-500">
						Students, staff and guardians currently registered in the school.
					</p>
				</div>
				<Link
					to="/admin/invites"
					className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
				>
					<UploadCloud className="h-4 w-4" /> Import or invite
				</Link>
			</div>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1">
					{TABS.map((item) => (
						<button
							key={item}
							type="button"
							onClick={() => changeTab(item)}
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
					{isLoading ? (
						<Loader2 className="mx-2 h-4 w-4 animate-spin text-gray-400" />
					) : null}
				</div>

				<label className="relative block w-full max-w-xs">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						value={search}
						onChange={(event) => {
							setSearch(event.target.value);
							setPage(1);
						}}
						placeholder="Search name, email, ID…"
						className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
					/>
				</label>
			</div>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
					{error}
				</div>
			) : null}

			<section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
				{isLoading && !result ? (
					<p className="flex items-center gap-2 p-6 text-sm text-gray-500">
						<Loader2 className="h-4 w-4 animate-spin" /> Loading…
					</p>
				) : tab === "students" ? (
					<PeopleTable
						headers={["Student", "Admission", "Class", "Account"]}
						rows={students.map((student) => ({
							id: student.id,
							cells: [
								<PersonCell
									key={student.id}
									name={student.name}
									email={student.email}
								/>,
								student.admissionNo ?? "—",
								[student.grade, student.section].filter(Boolean).join(" · ") ||
									"—",
								<AccountStatus
									key={`${student.id}-status`}
									activatedAt={student.activatedAt}
								/>,
							],
						}))}
						empty="No students found."
					/>
				) : tab === "staff" ? (
					<PeopleTable
						headers={["Staff member", "Employee", "Role", "Account"]}
						rows={staff.map((member) => ({
							id: member.id,
							cells: [
								<PersonCell
									key={member.id}
									name={member.name}
									email={member.email}
								/>,
								member.employeeId ?? "—",
								[member.designation, member.department]
									.filter(Boolean)
									.join(" · ") || "—",
								<AccountStatus
									key={`${member.id}-status`}
									activatedAt={member.activatedAt}
								/>,
							],
						}))}
						empty="No staff found."
					/>
				) : (
					<PeopleTable
						headers={["Guardian", "Students", "Account"]}
						rows={guardians.map((guardian) => ({
							id: guardian.id,
							cells: [
								<PersonCell
									key={guardian.id}
									name={guardian.name}
									email={guardian.email}
								/>,
								guardian.students
									.map((student) => `${student.name} (${student.relation})`)
									.join(", ") || "—",
								<AccountStatus
									key={`${guardian.id}-status`}
									activatedAt={guardian.activatedAt}
								/>,
							],
						}))}
						empty="No guardians found."
					/>
				)}

				{result && result.total > 0 ? (
					<div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
						<span>
							Showing {(result.page - 1) * result.pageSize + 1}–
							{Math.min(result.page * result.pageSize, result.total)} of{" "}
							{result.total}
						</span>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setPage((current) => Math.max(current - 1, 1))}
								disabled={result.page <= 1 || isLoading}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
							>
								<ChevronLeft className="h-3.5 w-3.5" /> Previous
							</button>
							<span>
								Page {result.page} of {result.pageCount}
							</span>
							<button
								type="button"
								onClick={() =>
									setPage((current) => Math.min(current + 1, result.pageCount))
								}
								disabled={result.page >= result.pageCount || isLoading}
								className="inline-flex items-center gap-1 rounded-lg border border-gray-300 px-2.5 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
							>
								Next <ChevronRight className="h-3.5 w-3.5" />
							</button>
						</div>
					</div>
				) : null}
			</section>
		</div>
	);
}

function PersonCell({ name, email }: { name: string; email: string }) {
	return (
		<div>
			<p className="font-medium text-gray-900">{name}</p>
			<p className="text-xs text-gray-500">{email}</p>
		</div>
	);
}

function AccountStatus({ activatedAt }: { activatedAt: string | Date | null }) {
	return (
		<span
			className={cn(
				"rounded-full px-2 py-0.5 text-xs font-semibold",
				activatedAt
					? "bg-green-100 text-green-700"
					: "bg-amber-100 text-amber-700",
			)}
		>
			{activatedAt ? "Active" : "Invited"}
		</span>
	);
}

function PeopleTable({
	headers,
	rows,
	empty,
}: {
	headers: Array<string>;
	rows: Array<{ id: string; cells: Array<React.ReactNode> }>;
	empty: string;
}) {
	if (rows.length === 0) {
		return <p className="p-8 text-center text-sm text-gray-500">{empty}</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="min-w-full text-left text-sm">
				<thead className="bg-gray-50 text-xs uppercase text-gray-500">
					<tr>
						{headers.map((header) => (
							<th key={header} className="px-5 py-3 font-semibold">
								{header}
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.id} className="border-t border-gray-100">
							{row.cells.map((cell, cellIndex) => (
								<td
									key={`${row.id}-${headers[cellIndex] ?? cellIndex}`}
									className="px-5 py-3"
								>
									{cell}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}
