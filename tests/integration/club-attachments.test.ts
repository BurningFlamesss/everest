import { randomUUID } from "node:crypto";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";

type ContentService =
	typeof import("../../src/packages/content/content-service.ts");
type Database = typeof import("../../src/packages/db/index.ts")["prisma"];
type Storage = ReturnType<
	typeof import("../../src/packages/storage/index.ts")["getStorage"]
>;

let prisma: Database;
let content: ContentService;
let storage: Storage;
let collectOrphanedFileAssets: typeof import("../../src/packages/storage/cleanup.ts")["collectOrphanedFileAssets"];
let storageDirectory: string;
let fixturesReady = false;
const uploadedKeys = new Set<string>();
let removeTestBucket: (() => Promise<void>) | undefined;

async function clearContent() {
	await prisma.attachment.deleteMany();
	await prisma.club.deleteMany();
	await prisma.notice.deleteMany();
	await prisma.event.deleteMany();
	await prisma.fileAsset.deleteMany();
}

beforeAll(async () => {
	const databaseUrl = process.env.SCMS_TEST_DATABASE_URL;
	if (
		!databaseUrl ||
		!/(?:_test|_verification)$/.test(new URL(databaseUrl).pathname)
	) {
		throw new Error(
			"Set SCMS_TEST_DATABASE_URL to a migrated, disposable PostgreSQL database ending in _test or _verification. This suite deletes its content and file-asset rows; it never falls back to DATABASE_URL.",
		);
	}

	const storageDriver = process.env.SCMS_TEST_STORAGE_DRIVER ?? "local";
	if (storageDriver !== "local" && storageDriver !== "s3") {
		throw new Error("SCMS_TEST_STORAGE_DRIVER must be local or s3.");
	}
	const s3Environment: Record<string, string> = {};
	if (storageDriver === "s3") {
		for (const key of [
			"S3_ENDPOINT",
			"S3_PORT",
			"S3_ACCESS_KEY",
			"S3_SECRET_KEY",
		]) {
			const value = process.env[`SCMS_TEST_${key}`];
			if (!value)
				throw new Error(`Set SCMS_TEST_${key} for S3 integration tests.`);
			s3Environment[key] = value;
		}
		s3Environment.S3_USE_SSL = process.env.SCMS_TEST_S3_USE_SSL ?? "false";
		s3Environment.S3_BUCKET = `scms-test-${randomUUID()}`;
	}

	await mkdir(".data", { recursive: true });
	storageDirectory = await mkdtemp(
		path.resolve(".data/club-attachments-test-"),
	);
	for (const [key, value] of Object.entries({
		DATABASE_URL: databaseUrl,
		APP_URL: "http://localhost:3000",
		BETTER_AUTH_SECRET: "integration-tests-only-not-a-production-secret",
		SUPER_ADMIN_EMAIL: "admin@example.test",
		SUPER_ADMIN_NAME: "Integration Admin",
		ORGANIZATION_NAME: "Integration School",
		ORGANIZATION_SLUG: "integration-school",
		DEFAULT_BRANCH_NAME: "Integration Branch",
		DEFAULT_BRANCH_SLUG: "integration-branch",
		STORAGE_DRIVER: storageDriver,
		STORAGE_LOCAL_DIR: storageDirectory,
		...s3Environment,
	})) {
		vi.stubEnv(key, value);
	}

	({ prisma } = await import("../../src/packages/db/index.ts"));
	content = await import("../../src/packages/content/content-service.ts");
	({ collectOrphanedFileAssets } = await import(
		"../../src/packages/storage/cleanup.ts"
	));
	const { getStorage } = await import("../../src/packages/storage/index.ts");
	storage = getStorage();
	await prisma.$connect();
	// Verify the new relation exists before allowing any destructive fixture setup.
	await prisma.attachment.findMany({ select: { clubId: true }, take: 1 });
	fixturesReady = true;
	if (storageDriver === "s3") {
		const { S3Client, DeleteBucketCommand } = await import(
			"@aws-sdk/client-s3"
		);
		const client = new S3Client({
			endpoint: `${s3Environment.S3_USE_SSL === "true" ? "https" : "http"}://${s3Environment.S3_ENDPOINT}:${s3Environment.S3_PORT}`,
			region: "us-east-1",
			forcePathStyle: true,
			credentials: {
				accessKeyId: s3Environment.S3_ACCESS_KEY,
				secretAccessKey: s3Environment.S3_SECRET_KEY,
			},
		});
		removeTestBucket = async () => {
			try {
				await client.send(
					new DeleteBucketCommand({ Bucket: s3Environment.S3_BUCKET }),
				);
			} finally {
				client.destroy();
			}
		};
	}
});

beforeEach(clearContent);

afterAll(async () => {
	try {
		if (prisma) {
			try {
				if (fixturesReady) {
					for (const key of uploadedKeys) await storage.delete(key);
					if (uploadedKeys.size > 0) await removeTestBucket?.();
					await clearContent();
				}
			} finally {
				await prisma.$disconnect();
			}
		}
	} finally {
		if (storageDirectory)
			await rm(storageDirectory, { recursive: true, force: true });
		vi.unstubAllEnvs();
	}
});

async function document(name: string, old = true) {
	const key = `clubs/${name}.txt`;
	const body = Buffer.from(`Contents of ${name}`);
	await storage.put(key, body, "text/plain");
	uploadedKeys.add(key);
	return prisma.fileAsset.create({
		data: {
			key,
			url: `/uploads/${key}`,
			originalName: `${name}.txt`,
			mimeType: "text/plain",
			size: body.length,
			...(old ? { createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000) } : {}),
		},
	});
}

describe("club attachments with PostgreSQL and real storage", () => {
	it("round-trips binary object contents and deletes missing keys idempotently", async () => {
		const key = "clubs/binary.pdf";
		const body = Buffer.from([0, 1, 127, 128, 255, 13, 10]);
		await storage.put(key, body, "application/pdf");
		uploadedKeys.add(key);

		const stored = await storage.get(key);
		expect(stored?.body).toEqual(body);
		if (process.env.SCMS_TEST_STORAGE_DRIVER === "s3") {
			expect(stored?.contentType).toBe("application/pdf");
		}
		await storage.delete(key);
		await storage.delete(key);
		expect(await storage.get(key)).toBeNull();
	});

	it("persists attachment metadata and only lists active clubs publicly", async () => {
		const handbook = await document("handbook");
		const schedule = await document("schedule");
		const club = await content.createClub({
			name: "  Robotics Club  ",
			attachments: [
				{ fileAssetId: handbook.id, label: "  Club handbook  " },
				{ fileAssetId: schedule.id, label: "  " },
			],
		});
		await content.createClub({ name: "Inactive Club", isActive: false });

		const listed = await content.listClubs();

		expect(listed).toHaveLength(1);
		expect(listed[0]).toMatchObject({ id: club.id, name: "Robotics Club" });
		expect(listed[0].attachments).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					fileAssetId: handbook.id,
					label: "Club handbook",
					fileAsset: {
						url: handbook.url,
						originalName: handbook.originalName,
						mimeType: handbook.mimeType,
						size: handbook.size,
					},
				}),
				expect.objectContaining({ fileAssetId: schedule.id, label: null }),
			]),
		);
		expect(await content.listClubs({ includeInactive: true })).toHaveLength(2);
	});

	it("preserves existing links when only status or description changes", async () => {
		const asset = await document("status-handbook");
		const club = await content.createClub({
			name: "Robotics",
			attachments: [{ fileAssetId: asset.id }],
		});
		const original = await prisma.attachment.findMany({
			where: { clubId: club.id },
		});

		await content.updateClub(club.id, {
			isActive: false,
			description: "Updated",
		});

		expect(
			await prisma.attachment.findMany({ where: { clubId: club.id } }),
		).toEqual(original);
		expect(await content.listClubs()).toEqual([]);
	});

	it("replaces and clears links without deleting either uploaded document", async () => {
		const oldAsset = await document("old-handbook");
		const newAsset = await document("new-handbook");
		const club = await content.createClub({
			name: "Robotics",
			attachments: [{ fileAssetId: oldAsset.id }],
		});

		await content.updateClub(club.id, {
			attachments: [{ fileAssetId: newAsset.id, label: "New handbook" }],
		});
		expect(
			await prisma.attachment.findMany({ where: { clubId: club.id } }),
		).toEqual([
			expect.objectContaining({
				fileAssetId: newAsset.id,
				label: "New handbook",
			}),
		]);
		await content.updateClub(club.id, { attachments: [] });

		expect(await prisma.attachment.count({ where: { clubId: club.id } })).toBe(
			0,
		);
		expect(await prisma.fileAsset.count()).toBe(2);
		expect(await storage.get(oldAsset.key)).not.toBeNull();
		expect(await storage.get(newAsset.key)).not.toBeNull();
	});

	it("rolls back all changes if an attachment replacement violates its foreign key", async () => {
		const asset = await document("original-handbook");
		const club = await content.createClub({
			name: "Robotics",
			attachments: [{ fileAssetId: asset.id }],
		});
		const original = await prisma.attachment.findMany({
			where: { clubId: club.id },
		});

		await expect(
			content.updateClub(club.id, {
				description: "This must roll back too",
				attachments: [{ fileAssetId: "nonexistent-file-asset" }],
			}),
		).rejects.toMatchObject({ code: "P2003" });

		expect(
			await prisma.attachment.findMany({ where: { clubId: club.id } }),
		).toEqual(original);
		expect(
			await prisma.club.findUnique({ where: { id: club.id } }),
		).toMatchObject({ description: null });
		expect(await storage.get(asset.key)).not.toBeNull();
	});

	it("cascades club links but preserves a shared asset until its final notice/event link is removed", async () => {
		const asset = await document("shared-handbook");
		const attachments = [{ fileAssetId: asset.id }];
		const club = await content.createClub({ name: "Robotics", attachments });
		const notice = await content.createNotice({
			title: "Handbook",
			body: "Read this",
			attachments,
		});
		const event = await content.createEvent({
			title: "Club meeting",
			startsAt: new Date(),
			attachments,
		});

		await content.deleteClub(club.id);

		expect(await prisma.attachment.count({ where: { clubId: club.id } })).toBe(
			0,
		);
		expect(await prisma.attachment.count()).toBe(2);
		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 0,
			deleted: 0,
			failed: 0,
		});
		expect(await storage.get(asset.key)).not.toBeNull();
		await content.deleteNotice(notice.id);
		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 0,
			deleted: 0,
			failed: 0,
		});
		await content.deleteEvent(event.id);

		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 1,
			deleted: 1,
			failed: 0,
		});
		expect(
			await prisma.fileAsset.findUnique({ where: { id: asset.id } }),
		).toBeNull();
		expect(await storage.get(asset.key)).toBeNull();
	});

	it("retains a club-only attachment, then collects its file after unlinking", async () => {
		const asset = await document("club-only");
		const club = await content.createClub({
			name: "Robotics",
			attachments: [{ fileAssetId: asset.id }],
		});

		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 0,
			deleted: 0,
			failed: 0,
		});
		await content.updateClub(club.id, { attachments: [] });

		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 1,
			deleted: 1,
			failed: 0,
		});
		expect(await storage.get(asset.key)).toBeNull();
	});

	it("honors the cleanup grace period for newly uploaded, unlinked files", async () => {
		const asset = await document("new-upload", false);

		expect(await collectOrphanedFileAssets()).toEqual({
			candidates: 0,
			deleted: 0,
			failed: 0,
		});
		expect(
			await prisma.fileAsset.findUnique({ where: { id: asset.id } }),
		).not.toBeNull();
		expect(await storage.get(asset.key)).not.toBeNull();
	});
});
