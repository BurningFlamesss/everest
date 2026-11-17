import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Loader2, UploadCloud, Users } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { type Column, DataTable } from "#/components/common/DataTable";
import { EmptyState } from "#/components/common/EmptyState";
import { FilterBar } from "#/components/common/FilterBar";
import { PageHeader } from "#/components/common/PageHeader";
import { PersonCell } from "#/components/common/PersonCell";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
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

const TAB_LABELS: Record<DirectoryTab, string> = {
	students: "Students",
	staff: "Staff",
	guardians: "Guardians",
};

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

	const studentColumns: Column<DirectoryStudentRow>[] = [
		{
			key: "student",
			header: "Student",
			render: (student) => (
				<PersonCell name={student.name} subtitle={student.email} />
			),
		},
		{
			key: "admission",
			header: "Admission",
			render: (student) => student.admissionNo ?? "—",
		},
		{
			key: "class",
			header: "Class",
			render: (student) =>
				[student.grade, student.section].filter(Boolean).join(" · ") || "—",
		},
		{
			key: "account",
			header: "Account",
			render: (student) => (
				<StatusBadge
					value={student.activatedAt ? "active" : "invited"}
					testId={`directory-account-${student.id}`}
				/>
			),
		},
	];

	const staffColumns: Column<DirectoryStaffRow>[] = [
		{
			key: "staff",
			header: "Staff member",
			render: (member) => (
				<PersonCell name={member.name} subtitle={member.email} />
			),
		},
		{
			key: "employee",
			header: "Employee",
			render: (member) => member.employeeId ?? "—",
		},
		{
			key: "role",
			header: "Role",
			render: (member) =>
				[member.designation, member.department].filter(Boolean).join(" · ") ||
				"—",
		},
		{
			key: "account",
			header: "Account",
			render: (member) => (
				<StatusBadge
					value={member.activatedAt ? "active" : "invited"}
					testId={`directory-account-${member.id}`}
				/>
			),
		},
	];

	const guardianColumns: Column<DirectoryGuardianRow>[] = [
		{
			key: "guardian",
			header: "Guardian",
			render: (guardian) => (
				<PersonCell name={guardian.name} subtitle={guardian.email} />
			),
		},
		{
			key: "students",
			header: "Students",
			render: (guardian) =>
				guardian.students
					.map((student) => `${student.name} (${student.relation})`)
					.join(", ") || "—",
		},
		{
			key: "account",
			header: "Account",
			render: (guardian) => (
				<StatusBadge
					value={guardian.activatedAt ? "active" : "invited"}
					testId={`directory-account-${guardian.id}`}
				/>
			),
		},
	];

	return (
		<div data-testid="directory-page">
			<PageHeader
				eyebrow="People"
				title="Directory"
				description="Students, staff and guardians currently registered in the school."
				testId="directory-page-header"
				actions={
					<Button asChild variant="outline" size="sm" className="gap-1.5">
						<Link to="/admin/invites" data-testid="directory-invite-link">
							<UploadCloud className="h-3.5 w-3.5" /> Import or invite
						</Link>
					</Button>
				}
			/>

			<div className="space-y-5">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<Tabs
						value={tab}
						onValueChange={(value: string) => changeTab(value as DirectoryTab)}
					>
						<TabsList className="h-9" data-testid="directory-tabs">
							{TABS.map((item) => (
								<TabsTrigger
									key={item}
									value={item}
									className="text-xs"
									data-testid={`directory-tab-${item}`}
								>
									{TAB_LABELS[item]}
								</TabsTrigger>
							))}
						</TabsList>
					</Tabs>
					{isLoading ? (
						<Loader2
							className="h-3.5 w-3.5 animate-spin text-muted-foreground"
							data-testid="directory-loading-spinner"
						/>
					) : null}
				</div>

				<FilterBar
					search={search}
					onSearchChange={(value) => {
						setSearch(value);
						setPage(1);
					}}
					placeholder="Search name, email, ID…"
					testId="directory-filters"
				/>

				{error ? (
					<div
						className="flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
						data-testid="directory-error-banner"
					>
						<AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
						<p className="min-w-0 break-words">{error}</p>
					</div>
				) : null}

				{tab === "students" ? (
					<DataTable
						columns={studentColumns}
						rows={students}
						rowId={(student) => student.id}
						rowTestId={(student) => `directory-student-${student.id}`}
						testId="directory-students-table"
						loading={isLoading && !result}
						page={result?.page ?? 1}
						pageSize={result?.pageSize ?? 25}
						total={result?.tab === "students" ? (result?.total ?? 0) : 0}
						onPageChange={setPage}
						empty={
							<EmptyState
								icon={Users}
								title="No students found"
								description="No students match this search. Try a different name, email or admission number."
								testId="directory-students-empty"
							/>
						}
					/>
				) : tab === "staff" ? (
					<DataTable
						columns={staffColumns}
						rows={staff}
						rowId={(member) => member.id}
						rowTestId={(member) => `directory-staff-${member.id}`}
						testId="directory-staff-table"
						loading={isLoading && !result}
						page={result?.page ?? 1}
						pageSize={result?.pageSize ?? 25}
						total={result?.tab === "staff" ? (result?.total ?? 0) : 0}
						onPageChange={setPage}
						empty={
							<EmptyState
								icon={Users}
								title="No staff found"
								description="No staff members match this search. Try a different name, email or employee ID."
								testId="directory-staff-empty"
							/>
						}
					/>
				) : (
					<DataTable
						columns={guardianColumns}
						rows={guardians}
						rowId={(guardian) => guardian.id}
						rowTestId={(guardian) => `directory-guardian-${guardian.id}`}
						testId="directory-guardians-table"
						loading={isLoading && !result}
						page={result?.page ?? 1}
						pageSize={result?.pageSize ?? 25}
						total={result?.tab === "guardians" ? (result?.total ?? 0) : 0}
						onPageChange={setPage}
						empty={
							<EmptyState
								icon={Users}
								title="No guardians found"
								description="No guardians match this search. Try a different name, email or student name."
								testId="directory-guardians-empty"
							/>
						}
					/>
				)}
			</div>
		</div>
	);
}
