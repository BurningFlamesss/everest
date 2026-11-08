import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMyRecords } from "./service.ts";

const prismaMock = vi.hoisted(() => ({
	student: { findUnique: vi.fn(), findMany: vi.fn() },
	guardian: { findUnique: vi.fn() },
	attendanceRecord: { groupBy: vi.fn(), findMany: vi.fn() },
}));

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));

interface StudentRowOptions {
	name?: string;
	email?: string;
	enrollments?: Array<Record<string, unknown>>;
	transportAssignments?: Array<Record<string, unknown>>;
}

function studentRow(id: string, options: StudentRowOptions = {}) {
	return {
		id,
		grade: "5",
		section: "A",
		rollNo: `R-${id}`,
		admissionNo: `ADM-${id}`,
		user: {
			name: options.name ?? `Student ${id}`,
			email: options.email ?? `${id}@example.test`,
		},
		enrollments: options.enrollments ?? [],
		transportAssignments: options.transportAssignments ?? [],
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.student.findUnique.mockResolvedValue(null);
	prismaMock.guardian.findUnique.mockResolvedValue(null);
	prismaMock.student.findMany.mockResolvedValue([]);
	prismaMock.attendanceRecord.groupBy.mockResolvedValue([]);
	prismaMock.attendanceRecord.findMany.mockResolvedValue([]);
});

describe("getMyRecords", () => {
	it("returns nothing for an account without a student or guardian profile", async () => {
		const result = await getMyRecords("user-1");

		expect(result).toEqual({ viewer: "OTHER", students: [] });
		expect(prismaMock.student.findMany).not.toHaveBeenCalled();
		expect(prismaMock.attendanceRecord.groupBy).not.toHaveBeenCalled();
	});

	it("returns only the signed-in student's own record", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.student.findMany.mockResolvedValue([studentRow("s1")]);

		const result = await getMyRecords("user-1");

		expect(result.viewer).toBe("STUDENT");
		expect(result.students.map((student) => student.id)).toEqual(["s1"]);
		expect(prismaMock.student.findMany.mock.calls[0][0].where).toEqual({
			id: { in: ["s1"] },
		});
	});

	it("returns every child linked to a guardian", async () => {
		prismaMock.guardian.findUnique.mockResolvedValue({
			guardianStudents: [{ studentId: "s1" }, { studentId: "s2" }],
		});
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1", { name: "Alice" }),
			studentRow("s2", { name: "Bob" }),
		]);

		const result = await getMyRecords("guardian-1");

		expect(result.viewer).toBe("GUARDIAN");
		expect(result.students.map((student) => student.name)).toEqual([
			"Alice",
			"Bob",
		]);
		expect(prismaMock.student.findMany.mock.calls[0][0].where).toEqual({
			id: { in: ["s1", "s2"] },
		});
	});

	it("combines both sides when an account is a student and a guardian", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.guardian.findUnique.mockResolvedValue({
			guardianStudents: [{ studentId: "s1" }, { studentId: "s2" }],
		});
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1"),
			studentRow("s2"),
		]);

		const result = await getMyRecords("user-1");

		expect(result.viewer).toBe("STUDENT");
		expect(prismaMock.student.findMany.mock.calls[0][0].where).toEqual({
			id: { in: ["s1", "s2"] },
		});
		expect(result.students).toHaveLength(2);
	});

	it("summarises attendance per status and defaults to zero", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1"),
			studentRow("s2"),
		]);
		prismaMock.attendanceRecord.groupBy.mockResolvedValue([
			{ studentId: "s1", state: "PRESENT", _count: { _all: 3 } },
			{ studentId: "s1", state: "ABSENT", _count: { _all: 1 } },
			{ studentId: "s1", state: "LATE", _count: { _all: 2 } },
			{ studentId: "s1", state: "EXCUSED", _count: { _all: 1 } },
		]);

		const result = await getMyRecords("user-1");

		expect(result.students[0].attendance).toEqual({
			present: 3,
			absent: 1,
			late: 2,
			excused: 1,
			total: 7,
		});
		expect(result.students[1].attendance).toEqual({
			present: 0,
			absent: 0,
			late: 0,
			excused: 0,
			total: 0,
		});
	});

	it("maps course, teacher and classroom details", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1", {
				enrollments: [
					{
						id: "e1",
						status: "ACTIVE",
						course: {
							code: "M1",
							name: "Maths",
							schedule: "Mon 9:00",
							teacher: null,
							classroom: { name: "Room 1", building: null },
						},
					},
					{
						id: "e2",
						status: "COMPLETED",
						course: {
							code: "S1",
							name: "Science",
							schedule: null,
							teacher: { user: { name: "Ms. Teacher" } },
							classroom: { name: "Lab", building: "Block B" },
						},
					},
				],
			}),
		]);

		const [student] = (await getMyRecords("user-1")).students;

		expect(student.courses).toEqual([
			{
				id: "e1",
				code: "M1",
				name: "Maths",
				schedule: "Mon 9:00",
				status: "ACTIVE",
				teacher: null,
				classroom: "Room 1",
			},
			{
				id: "e2",
				code: "S1",
				name: "Science",
				schedule: null,
				status: "COMPLETED",
				teacher: "Ms. Teacher",
				classroom: "Block B · Lab",
			},
		]);
	});

	it("fetches recent attendance per student so siblings cannot crowd each other out (regression)", async () => {
		prismaMock.guardian.findUnique.mockResolvedValue({
			guardianStudents: [{ studentId: "s1" }, { studentId: "s2" }],
		});
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1"),
			studentRow("s2"),
		]);
		prismaMock.attendanceRecord.findMany.mockImplementation(
			async ({ where }: { where: { studentId: string } }) => {
				if (where.studentId === "s1") {
					return [
						{
							id: "r1",
							state: "PRESENT",
							note: null,
							session: {
								date: new Date("2026-04-30T00:00:00.000Z"),
								course: { code: "M1", name: "Maths" },
							},
						},
					];
				}

				return [
					{
						id: "r2",
						state: "LATE",
						note: "Traffic",
						session: {
							date: new Date("2026-04-29T00:00:00.000Z"),
							course: { code: "S1", name: "Science" },
						},
					},
				];
			},
		);

		const result = await getMyRecords("guardian-1");

		expect(prismaMock.attendanceRecord.findMany).toHaveBeenCalledTimes(2);
		expect(prismaMock.attendanceRecord.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { studentId: "s1" },
				take: 10,
				orderBy: { session: { date: "desc" } },
			}),
		);
		expect(result.students[0].recentAttendance).toEqual([
			{
				id: "r1",
				date: new Date("2026-04-30T00:00:00.000Z"),
				status: "PRESENT",
				note: null,
				courseCode: "M1",
				courseName: "Maths",
			},
		]);
		expect(result.students[1].recentAttendance).toEqual([
			{
				id: "r2",
				date: new Date("2026-04-29T00:00:00.000Z"),
				status: "LATE",
				note: "Traffic",
				courseCode: "S1",
				courseName: "Science",
			},
		]);
	});

	it("maps transport assignments and tolerates a missing stop", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.student.findMany.mockResolvedValue([
			studentRow("s1", {
				transportAssignments: [
					{
						id: "t1",
						direction: "BOTH",
						route: {
							name: "Route 7",
							code: "R7",
							driverName: "Dan",
							driverPhone: "555",
							vehicleNumber: "BUS-1",
						},
						stop: { name: "Elm", pickupTime: "07:30", dropoffTime: "15:30" },
					},
					{
						id: "t2",
						direction: "PICKUP",
						route: {
							name: "Route 8",
							code: null,
							driverName: null,
							driverPhone: null,
							vehicleNumber: null,
						},
						stop: null,
					},
				],
			}),
		]);

		const [student] = (await getMyRecords("user-1")).students;

		expect(student.transport).toEqual([
			{
				id: "t1",
				route: "Route 7",
				code: "R7",
				stop: "Elm",
				direction: "BOTH",
				driverName: "Dan",
				driverPhone: "555",
				vehicleNumber: "BUS-1",
				pickupTime: "07:30",
				dropoffTime: "15:30",
			},
			{
				id: "t2",
				route: "Route 8",
				code: null,
				stop: null,
				direction: "PICKUP",
				driverName: null,
				driverPhone: null,
				vehicleNumber: null,
				pickupTime: null,
				dropoffTime: null,
			},
		]);
	});

	it("only considers active transport assignments and enrollments", async () => {
		prismaMock.student.findUnique.mockResolvedValue({ id: "s1" });
		prismaMock.student.findMany.mockResolvedValue([studentRow("s1")]);

		await getMyRecords("user-1");

		const query = prismaMock.student.findMany.mock.calls[0][0];

		expect(query.select.enrollments.where).toEqual({
			status: { in: ["ACTIVE", "COMPLETED"] },
		});
		expect(query.select.transportAssignments.where).toEqual({ isActive: true });
		expect(query.orderBy).toEqual({ user: { name: "asc" } });
	});
});
