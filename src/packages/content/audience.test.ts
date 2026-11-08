import { beforeEach, describe, expect, it, vi } from "vitest";
import { listNotices } from "./content-service.ts";

const mocks = vi.hoisted(() => ({
	findMany: vi.fn(),
}));

vi.mock("#/packages/db/index.ts", () => ({
	prisma: { scmsNotice: { findMany: mocks.findMany } },
}));

// content-service only needs slugify from this module; the rest of it reaches
// for env and mail, which are irrelevant to audience filtering.
vi.mock("#/packages/invite/invite-service.ts", () => ({
	slugify: (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
}));

beforeEach(() => {
	vi.resetAllMocks();
	mocks.findMany.mockResolvedValue([]);
});

describe("notice audience scoping", () => {
	it.each([
		"STUDENTS",
		"STAFF",
		"GUARDIANS",
	] as const)("includes ALL plus %s notices", async (audience) => {
		await listNotices({ audience });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					audience: { in: ["ALL", audience] },
				}),
			}),
		);
	});

	it("does not add an audience filter for ALL or when omitted", async () => {
		await listNotices({ audience: "ALL" });
		await listNotices();

		for (const call of mocks.findMany.mock.calls) {
			expect(call[0].where).not.toHaveProperty("audience");
		}
	});

	it("keeps only published, in-window notices in the feed", async () => {
		await listNotices({ audience: "STUDENTS" });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: expect.objectContaining({
					isPublished: true,
					publishedAt: { lte: expect.any(Date) },
				}),
			}),
		);
	});
});
