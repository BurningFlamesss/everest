import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	DEFAULT_PERMISSION_PAGE_SIZE,
	listPermissionUsers,
	MAX_PERMISSION_PAGE_SIZE,
} from "./permissions-service.ts";

const prismaMock = vi.hoisted(() => ({
	user: { count: vi.fn(), findMany: vi.fn() },
	rolePermission: { findMany: vi.fn() },
}));

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));

function userRow(
	id: string,
	role: "STAFF" | "STUDENT" = "STAFF",
	permissions: Array<{ permission: string; granted: boolean }> = [],
) {
	return {
		id,
		name: `User ${id}`,
		email: `${id}@example.test`,
		activatedAt: new Date("2026-01-01T00:00:00.000Z"),
		userRoles: [{ role, branchId: null }],
		permissions,
	};
}

beforeEach(() => {
	vi.clearAllMocks();
	prismaMock.user.count.mockResolvedValue(0);
	prismaMock.user.findMany.mockResolvedValue([]);
	prismaMock.rolePermission.findMany.mockResolvedValue([]);
});

describe("listPermissionUsers", () => {
	it("returns the first page with 25 rows by default", async () => {
		prismaMock.user.count.mockResolvedValue(60);

		const result = await listPermissionUsers();

		expect(result).toMatchObject({
			total: 60,
			page: 1,
			pageSize: DEFAULT_PERMISSION_PAGE_SIZE,
			pageCount: 3,
		});
		expect(prismaMock.user.findMany.mock.calls[0][0]).toMatchObject({
			skip: 0,
			take: DEFAULT_PERMISSION_PAGE_SIZE,
			orderBy: [{ name: "asc" }, { id: "asc" }],
		});
		expect(prismaMock.user.findMany.mock.calls[0][0].where).toBeUndefined();
	});

	it("returns the requested page", async () => {
		prismaMock.user.count.mockResolvedValue(60);

		const result = await listPermissionUsers({ page: 2 });

		expect(result.page).toBe(2);
		expect(prismaMock.user.findMany.mock.calls[0][0].skip).toBe(25);
	});

	it("clamps a page beyond the last page", async () => {
		prismaMock.user.count.mockResolvedValue(10);

		const result = await listPermissionUsers({ page: 99 });

		expect(result.page).toBe(1);
		expect(result.pageCount).toBe(1);
		expect(prismaMock.user.findMany.mock.calls[0][0].skip).toBe(0);
	});

	it("clamps the page size", async () => {
		await listPermissionUsers({ pageSize: 0 });
		await listPermissionUsers({ pageSize: 5_000 });

		const [smallest, largest] = prismaMock.user.findMany.mock.calls;

		expect(smallest[0].take).toBe(1);
		expect(largest[0].take).toBe(MAX_PERMISSION_PAGE_SIZE);
	});

	it("searches name and email with a trimmed term", async () => {
		prismaMock.user.count.mockResolvedValue(1);

		await listPermissionUsers({ search: "  ada  " });

		const where = {
			OR: [
				{ name: { contains: "ada", mode: "insensitive" } },
				{ email: { contains: "ada", mode: "insensitive" } },
			],
		};

		expect(prismaMock.user.count).toHaveBeenCalledWith({ where });
		expect(prismaMock.user.findMany.mock.calls[0][0].where).toEqual(where);
	});

	it("caps the search term at 100 characters", async () => {
		await listPermissionUsers({ search: "a".repeat(150) });

		const term =
			prismaMock.user.count.mock.calls[0][0].where.OR[0].name.contains;

		expect(term).toHaveLength(100);
	});

	it("resolves role defaults and per-user overrides", async () => {
		prismaMock.user.count.mockResolvedValue(1);
		prismaMock.user.findMany.mockResolvedValue([
			userRow("u1", "STAFF", [
				{ permission: "MANAGE_ATTENDANCE", granted: false },
				{ permission: "MANAGE_TRANSPORT", granted: true },
			]),
		]);

		const result = await listPermissionUsers();

		expect(result.users[0].rolePermissions).toEqual([
			"MANAGE_DASHBOARD",
			"MANAGE_ATTENDANCE",
		]);
		expect(result.users[0].effectivePermissions).toEqual([
			"MANAGE_DASHBOARD",
			"MANAGE_TRANSPORT",
		]);
		expect(result.users[0].overrides).toEqual([
			{ permission: "MANAGE_ATTENDANCE", granted: false },
			{ permission: "MANAGE_TRANSPORT", granted: true },
		]);
	});

	it("never asks the database for more than one page", async () => {
		await listPermissionUsers({ pageSize: 100 });

		expect(prismaMock.user.findMany.mock.calls[0][0].take).toBe(100);
	});
});
