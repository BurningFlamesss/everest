import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError } from "#/packages/auth/permissions.ts";
import {
	createCourseAction,
	deleteCourseAction,
	enrollStudentsAction,
	getAcademicsDataFn,
} from "./server.ts";

const mocks = vi.hoisted(() => ({
	getSession: vi.fn(),
	requirePermission: vi.fn(),
	createCourse: vi.fn(),
	deleteCourse: vi.fn(),
	enrollStudents: vi.fn(),
	listCourses: vi.fn(),
	listClassrooms: vi.fn(),
	listStaffForCourses: vi.fn(),
}));

vi.mock("@tanstack/react-start", () => ({
	createServerFn: () => {
		let validator: { parse: (input: unknown) => unknown } | undefined;
		const builder = {
			validator(schema: typeof validator) {
				validator = schema;
				return builder;
			},
			handler(handler: (context: { data: unknown }) => unknown) {
				return async (options?: { data?: unknown }) =>
					handler({ data: validator?.parse(options?.data) });
			},
		};
		return builder;
	},
}));

vi.mock("@tanstack/react-start/server", () => ({
	getRequestHeaders: () => new Headers(),
}));

vi.mock("#/packages/auth/auth.ts", () => ({
	auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("#/packages/auth/permissions.ts", () => ({
	AuthorizationError: class AuthorizationError extends Error {},
	requirePermission: mocks.requirePermission,
}));

vi.mock("./courses-service.ts", () => ({
	createClassroom: vi.fn(),
	createCourse: mocks.createCourse,
	deleteClassroom: vi.fn(),
	deleteCourse: mocks.deleteCourse,
	enrollStudents: mocks.enrollStudents,
	getCourse: vi.fn(),
	listClassrooms: mocks.listClassrooms,
	listCourses: mocks.listCourses,
	listStaffForCourses: mocks.listStaffForCourses,
	removeEnrollment: vi.fn(),
	updateClassroom: vi.fn(),
	updateCourse: vi.fn(),
}));

beforeEach(() => {
	vi.resetAllMocks();
	mocks.getSession.mockResolvedValue({ user: { id: "manager" } });
	mocks.requirePermission.mockResolvedValue(undefined);
	mocks.createCourse.mockResolvedValue({ id: "course-1" });
	mocks.deleteCourse.mockResolvedValue({ id: "course-1" });
	mocks.enrollStudents.mockResolvedValue(42);
	mocks.listCourses.mockResolvedValue([]);
	mocks.listClassrooms.mockResolvedValue([]);
	mocks.listStaffForCourses.mockResolvedValue([]);
});

describe("academics server actions", () => {
	it("gates reads behind MANAGE_ACADEMICS", async () => {
		const result = await getAcademicsDataFn();

		expect(result.success).toBe(true);
		expect(mocks.requirePermission).toHaveBeenCalledWith(
			"manager",
			"MANAGE_ACADEMICS",
		);
	});

	it("normalizes course input and returns the created row", async () => {
		const result = await createCourseAction({
			data: { code: "  mth101  ", name: "  Mathematics  " },
		});

		expect(result).toMatchObject({ success: true, course: { id: "course-1" } });
		expect(mocks.createCourse).toHaveBeenCalledWith({
			code: "mth101",
			name: "Mathematics",
		});
	});

	it("turns the duplicate-code error into a readable message", async () => {
		mocks.createCourse.mockRejectedValue(new Error("COURSE_CODE_TAKEN"));

		const result = await createCourseAction({
			data: { code: "MTH101", name: "Mathematics" },
		});

		expect(result).toMatchObject({
			success: false,
			error: "Another course already uses that code.",
			code: "INTERNAL_ERROR",
		});
	});

	it("rejects an enrolment batch over 500 students before touching the service", async () => {
		await expect(
			enrollStudentsAction({
				data: {
					courseId: "course-1",
					studentIds: Array.from({ length: 501 }, (_, index) => `s-${index}`),
				},
			}),
		).rejects.toThrow();
		expect(mocks.enrollStudents).not.toHaveBeenCalled();
	});

	it("accepts a full 500-student batch and returns the course total", async () => {
		const result = await enrollStudentsAction({
			data: {
				courseId: "course-1",
				studentIds: Array.from({ length: 500 }, (_, index) => `s-${index}`),
			},
		});

		expect(result).toEqual({ success: true, count: 42 });
		expect(mocks.enrollStudents).toHaveBeenCalledOnce();
	});

	it("blocks signed-out users before any permission check", async () => {
		mocks.getSession.mockResolvedValue(null);

		const result = await deleteCourseAction({ data: { id: "course-1" } });

		expect(result).toMatchObject({ success: false, code: "UNAUTHORIZED" });
		expect(mocks.requirePermission).not.toHaveBeenCalled();
		expect(mocks.deleteCourse).not.toHaveBeenCalled();
	});

	it("blocks users without MANAGE_ACADEMICS", async () => {
		mocks.requirePermission.mockRejectedValue(
			new AuthorizationError("You cannot manage academics"),
		);

		const result = await createCourseAction({
			data: { code: "MTH101", name: "Mathematics" },
		});

		expect(result).toMatchObject({ success: false, code: "UNAUTHORIZED" });
		expect(mocks.createCourse).not.toHaveBeenCalled();
	});
});
