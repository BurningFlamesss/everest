import { randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

const runId = randomUUID();
const managerId = randomUUID();
const viewerId = randomUUID();
const activationToken = randomUUID();
const password = `Verification-${runId}`;
const managerEmail = `manager-${runId}@example.test`;
const viewerEmail = `viewer-${runId}@example.test`;
const clubName = `Verification Club ${runId}`;
let prisma: PrismaClient;
let organizationId: string;

// Only fixture-owned users/content are removed, and the URL must be explicitly test-only.
test.beforeAll(async () => {
	const databaseUrl = process.env.SCMS_E2E_DATABASE_URL;
	if (
		!databaseUrl ||
		!/(?:_test|_verification)$/.test(new URL(databaseUrl).pathname)
	) {
		throw new Error(
			"Set SCMS_E2E_DATABASE_URL to the running app's disposable, migrated PostgreSQL database ending in _test or _verification.",
		);
	}
	prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: databaseUrl }),
	});
	const organization = await prisma.organization.create({
		data: { name: "Browser verification", slug: `browser-${runId}` },
	});
	organizationId = organization.id;
	await prisma.user.create({
		data: {
			id: managerId,
			name: "Browser Manager",
			email: managerEmail,
			emailVerified: true,
		},
	});
	await prisma.userRole.create({
		data: { userId: managerId, organizationId, role: "SUPERADMIN" },
	});
	await prisma.invite.create({
		data: {
			token: activationToken,
			userId: managerId,
			type: "STAFF",
			expiresAt: new Date(Date.now() + 3_600_000),
		},
	});
	await prisma.user.create({
		data: {
			id: viewerId,
			name: "Browser Viewer",
			email: viewerEmail,
			emailVerified: true,
			accounts: {
				create: {
					id: randomUUID(),
					accountId: viewerId,
					providerId: "credential",
					password: await hashPassword(password),
				},
			},
		},
	});
});

test.afterAll(async () => {
	if (!prisma) return;
	try {
		await prisma.club.deleteMany({ where: { name: clubName } });

		await prisma.user.deleteMany({
			where: { id: { in: [managerId, viewerId] } },
		});
		if (organizationId)
			await prisma.organization.delete({ where: { id: organizationId } });
	} finally {
		await prisma.$disconnect();
	}
});

test("activates a manager, uploads, edits, downloads and cleans up club documents", async ({
	page,
	browser,
}) => {
	const browserErrors: Array<string> = [];
	page.on("pageerror", (error) => browserErrors.push(error.message));
	await page.goto(`/activate/${activationToken}`);
	await page.getByLabel("New password", { exact: true }).fill(password);
	await page.getByLabel("Confirm password", { exact: true }).fill(password);
	await page
		.getByRole("button", { name: "Activate account", exact: true })
		.click();
	await expect(page).toHaveURL("/");

	// Exercise the page whose server import boundary caused the build warnings.
	await page.goto("/admin/permissions");
	await expect(
		page.getByRole("heading", { name: "Permissions", exact: true }),
	).toBeVisible();
	await expect(
		page.getByRole("heading", { name: "Role defaults", exact: true }),
	).toBeVisible();
	await page.goto("/admin/content");
	await page.getByRole("button", { name: "clubs", exact: true }).click();
	const createForm = page.locator('form:has(input[name="name"])');
	await createForm.getByLabel("Name", { exact: true }).fill(clubName);
	await createForm.locator('input[type="file"][accept*=".pdf"]').setInputFiles({
		name: "handbook.txt",
		mimeType: "text/plain",
		buffer: Buffer.from("Club handbook contents"),
	});
	await expect(
		createForm.getByRole("link", { name: "handbook.txt" }),
	).toBeVisible();
	await createForm.getByRole("button", { name: "Save", exact: true }).click();
	await expect(page.getByText("Club created.", { exact: true })).toBeVisible();
	await expect(createForm.getByRole("link")).toHaveCount(0);

	const publicContext = await browser.newContext();
	const publicPage = await publicContext.newPage();
	try {
		await publicPage.goto(new URL("/clubs", page.url()).href);
		const publicCard = publicPage
			.getByRole("article")
			.filter({ hasText: clubName });
		const handbookLink = publicCard.getByRole("link", {
			name: /handbook\.txt/,
		});
		await expect(handbookLink).toBeVisible();
		const handbookUrl = await handbookLink.getAttribute("href");
		expect(handbookUrl).toBeTruthy();
		const downloaded = await publicPage.request.get(
			new URL(handbookUrl ?? "", page.url()).href,
		);
		expect(downloaded.status()).toBe(200);
		expect(await downloaded.text()).toBe("Club handbook contents");

		const row = page.getByRole("listitem").filter({ hasText: clubName });
		await row.getByRole("button", { name: "Edit attachments" }).click();
		const editor = page.locator("section").filter({
			has: page.getByRole("heading", {
				name: `Attachments for ${clubName}`,
				exact: true,
			}),
		});
		await editor.getByRole("button", { name: "Remove handbook.txt" }).click();
		await editor.locator('input[type="file"]').setInputFiles({
			name: "rules.txt",
			mimeType: "text/plain",
			buffer: Buffer.from("Updated club rules"),
		});
		await expect(editor.getByRole("link", { name: "rules.txt" })).toBeVisible();
		await editor.getByRole("button", { name: "Save attachments" }).click();
		await expect(
			page.getByText("Club attachments updated.", { exact: true }),
		).toBeVisible();
		await publicPage.reload();
		await expect(
			publicCard.getByRole("link", { name: /rules\.txt/ }),
		).toBeVisible();
		await expect(
			publicCard.getByRole("link", { name: /handbook\.txt/ }),
		).toHaveCount(0);

		await row.getByRole("button", { name: "Active", exact: true }).click();
		await expect(
			row.getByRole("button", { name: "Inactive", exact: true }),
		).toBeVisible();
		await publicPage.reload();
		await expect(publicCard).toHaveCount(0);
		await row.getByRole("button", { name: "Inactive", exact: true }).click();
		await expect(
			row.getByRole("button", { name: "Active", exact: true }),
		).toBeVisible();
		await publicPage.reload();
		await expect(
			publicCard.getByRole("link", { name: /rules\.txt/ }),
		).toBeVisible();

		const assets = await prisma.fileAsset.findMany({
			where: { uploadedById: managerId },
		});
		expect(assets).toHaveLength(2);
		page.once("dialog", (dialog) => dialog.accept());
		await row.getByRole("button", { name: "Delete", exact: true }).click();
		await expect(row).toHaveCount(0);
		await prisma.fileAsset.updateMany({
			where: { uploadedById: managerId },
			data: { createdAt: new Date(Date.now() - 48 * 3_600_000) },
		});
		await page.getByRole("button", { name: "Clean up unused uploads" }).click();
		await expect(
			page.getByText("Removed 2 unused uploads.", { exact: true }),
		).toBeVisible();
		for (const asset of assets) {
			const response = await publicPage.request.get(
				new URL(asset.url, page.url()).href,
			);
			expect(response.status()).toBe(404);
		}
		expect(
			await prisma.fileAsset.count({ where: { uploadedById: managerId } }),
		).toBe(0);
	} finally {
		await publicContext.close();
	}
	expect(browserErrors).toEqual([]);
});

test("rejects anonymous uploads and users without content-management permission", async ({
	page,
}) => {
	const anonymous = await page.request.post("/api/uploads");
	expect(anonymous.status()).toBe(401);
	await page.goto("/admin/content");
	await expect(page).toHaveURL(/\/login$/);
	await page.getByLabel("Email address", { exact: true }).fill(viewerEmail);
	await page.getByLabel("Password", { exact: true }).fill(password);
	await page.getByRole("button", { name: "Sign in", exact: true }).click();
	await expect(page).toHaveURL("/");
	const denied = await page.request.post("/api/uploads");
	expect(denied.status()).toBe(403);
	await page.goto("/admin/content");
	await expect(page).toHaveURL(/\/dashboard$/);
});
