import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface SchoolStore {
	hydrated: boolean;
	activeSchoolId: string | null;
}

export const useSchoolStore = create<SchoolStore>()(
	immer(() => ({
		hydrated: false,
		activeSchoolId: null,
	})),
);
