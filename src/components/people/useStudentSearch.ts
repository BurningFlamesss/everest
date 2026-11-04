import { useEffect, useState } from "react";
import type { StudentOption } from "#/packages/people/directory-service.ts";
import { searchStudentsFn } from "#/packages/people/server.ts";

/**
 * Debounced, server-side student lookup.
 *
 * Keeping the list on the server means an administrator can find any student
 * in a school of a thousand or more without the page shipping every record.
 */
export function useStudentSearch(
	query: string,
	options?: { limit?: number; enabled?: boolean },
) {
	const limit = options?.limit ?? 20;
	const enabled = options?.enabled ?? true;
	const [students, setStudents] = useState<Array<StudentOption>>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!enabled) return;

		let cancelled = false;
		setIsLoading(true);

		const timer = setTimeout(() => {
			void searchStudentsFn({
				data: { search: query.trim() || undefined, limit },
			}).then((response) => {
				if (cancelled) return;

				if (response.success) {
					setStudents(response.students as Array<StudentOption>);
					setError("");
				} else {
					setError(response.error);
				}

				setIsLoading(false);
			});
		}, 200);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [enabled, limit, query]);

	return { students, isLoading, error };
}
