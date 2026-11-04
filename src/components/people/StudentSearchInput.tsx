import { Loader2, Search, X } from "lucide-react";
import { useState } from "react";
import { cn } from "#/lib/utils.ts";
import type { StudentOption } from "#/packages/people/directory-service.ts";
import { useStudentSearch } from "./useStudentSearch.ts";

interface StudentSearchInputProps {
	name: string;
	placeholder?: string;
	required?: boolean;
	disabled?: boolean;
	className?: string;
	ariaLabel?: string;
}

function describe(student: StudentOption) {
	return (
		[
			[student.grade, student.section].filter(Boolean).join(" · "),
			student.admissionNo ? `#${student.admissionNo}` : null,
		]
			.filter(Boolean)
			.join(" · ") || "Active student"
	);
}

/**
 * Single-student picker that searches the server instead of rendering one
 * `<option>` per student. The chosen id is submitted through a hidden input so
 * it works inside the existing plain `<form>` handlers.
 */
export function StudentSearchInput({
	name,
	placeholder = "Search by name, admission or email…",
	required = false,
	disabled = false,
	className,
	ariaLabel = "Student",
}: StudentSearchInputProps) {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const [selected, setSelected] = useState<StudentOption | null>(null);
	const { students, isLoading, error } = useStudentSearch(query, {
		enabled: isOpen,
		limit: 20,
	});

	const select = (student: StudentOption) => {
		setSelected(student);
		setQuery("");
		setIsOpen(false);
	};

	return (
		<div className={cn("relative text-sm", className)}>
			<input type="hidden" name={name} value={selected?.id ?? ""} />

			{selected ? (
				<div className="flex items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2">
					<div className="min-w-0">
						<p className="truncate font-medium text-gray-900">
							{selected.name}
						</p>
						<p className="truncate text-xs text-gray-500">
							{describe(selected)}
						</p>
					</div>
					<button
						type="button"
						disabled={disabled}
						onClick={() => {
							setSelected(null);
							setIsOpen(true);
						}}
						className="inline-flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-red-600"
						aria-label="Clear selected student"
					>
						<X className="h-3.5 w-3.5" /> Change
					</button>
				</div>
			) : (
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<input
						value={query}
						aria-label={ariaLabel}
						required={required}
						disabled={disabled}
						placeholder={placeholder}
						onFocus={() => setIsOpen(true)}
						onChange={(event) => {
							setQuery(event.target.value);
							setIsOpen(true);
						}}
						onKeyDown={(event) => {
							if (event.key === "Escape") setIsOpen(false);
						}}
						onBlur={() => {
							// Selecting a result uses `mousedown` + preventDefault, so this
							// only closes the list when focus really leaves the picker.
							window.setTimeout(() => setIsOpen(false), 120);
						}}
						className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
					/>
				</div>
			)}

			{isOpen && !selected ? (
				<div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
					{isLoading ? (
						<p className="flex items-center gap-2 px-3 py-2 text-xs text-gray-500">
							<Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
						</p>
					) : error ? (
						<p className="px-3 py-2 text-xs text-red-600">{error}</p>
					) : students.length === 0 ? (
						<p className="px-3 py-2 text-xs text-gray-500">
							No active students match that search.
						</p>
					) : (
						<ul>
							{students.map((student) => (
								<li key={student.id}>
									<button
										type="button"
										onMouseDown={(event) => {
											event.preventDefault();
											select(student);
										}}
										className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left hover:bg-gray-50"
									>
										<span className="min-w-0">
											<span className="block truncate font-medium text-gray-900">
												{student.name}
											</span>
											<span className="block truncate text-xs text-gray-500">
												{describe(student)}
											</span>
										</span>
									</button>
								</li>
							))}
						</ul>
					)}
				</div>
			) : null}
		</div>
	);
}
