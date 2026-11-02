import { randomUUID, scryptSync } from "node:crypto";
import {
	type APIRequest,
	type APIRequestContext,
	expect,
	type Page,
	test,
} from "@playwright/test";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client.ts";

const runId = randomUUID();
const legacyPassword = "Legacy-café-Password-2026!";
// 1.6.19 delegates to @better-auth/utils 0.4.2: NFKC, scrypt N=16384/r=16/p=1,
// 64 bytes, and a 16-byte hex salt passed as TEXT (not decoded hex bytes).
// https://github.com/better-auth/better-auth/blob/v1.6.19/pnpm-workspace.yaml
// https://unpkg.com/@better-auth/utils@0.4.2/dist/password.node.mjs
const legacyHash =
	"00112233445566778899aabbccddeeff:78096377dfb03c306f170e14516a5c06d28d640b1e22c8693b057b75c9264227d229adf22c089fd04c11d772a9b95cbd37953f0842244625b2eec9dbef5aded8";
const resetPrefix = "reset-password:";
const fixtureUserIds: Array<string> = [];
const clients: Array<APIRequestContext> = [];
let prisma: PrismaClient;
let organizationId: string | undefined;
let clientNumber = 1;

type CookieState = Awaited<ReturnType<APIRequestContext["storageState"]>>;
interface AuthSession {
	user: { id: string };
	session: { id: string; token: string };
}

function localOrigin(baseURL: string | undefined) {
	if (!baseURL) throw new Error("A Playwright baseURL is required.");
	const url = new URL(baseURL);
	if (
		!["http:", "https:"].includes(url.protocol) ||
		!["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
		url.username ||
		url.password
	) {
		throw new Error("Auth security E2E tests require a loopback app URL.");
	}
	return url.origin;
}

function ingressHeaders(origin: string) {
	// Simulate controlled LOCAL ingress with a single reserved benchmark address.
	// This is not a production proxy trust configuration; the limiter stays on.
	return {
		Origin: origin,
		"X-Forwarded-For": `198.18.${Number.parseInt(runId.slice(0, 2), 16)}.${clientNumber++}`,
	};
}

async function preparePage(page: Page, baseURL: string | undefined) {
	const origin = localOrigin(baseURL);
	await page.context().setExtraHTTPHeaders(ingressHeaders(origin));
	await page
		.context()
		.route("**/*", (route) =>
			new URL(route.request().url()).origin === origin
				? route.continue()
				: route.abort(),
		);
}

async function apiClient(
	request: APIRequest,
	baseURL: string | undefined,
	storageState?: CookieState,
) {
	const origin = localOrigin(baseURL);
	const client = await request.newContext({
		baseURL: origin,
		extraHTTPHeaders: ingressHeaders(origin),
		storageState,
	});
	clients.push(client);
	return client;
}

async function createUser(label: string, withCredential = true) {
	if (!organizationId)
		throw new Error("The fixture organization is not ready.");
	const id = randomUUID();
	const email = `auth-${label}-${id}@example.test`;
	fixtureUserIds.push(id);
	return prisma.user.create({
		data: {
			id,
			name: `Auth security ${label}`,
			email,
			emailVerified: withCredential,
			userRoles: {
				create: { organizationId, role: "SUPERADMIN" },
			},
			...(withCredential && {
				accounts: {
					create: {
						id: randomUUID(),
						accountId: id,
						providerId: "credential",
						password: legacyHash,
					},
				},
			}),
		},
	});
}

async function sessionFor(
	client: APIRequestContext,
): Promise<AuthSession | null> {
	const response = await client.get("/api/auth/get-session", {
		maxRedirects: 0,
	});
	expect(response.status()).toBe(200);
	return response.json();
}

async function signedInSession(client: APIRequestContext, userId: string) {
	const session = await sessionFor(client);
	expect(session).toMatchObject({ user: { id: userId } });
	if (!session) throw new Error("Expected an authenticated fixture session.");
	return session;
}

async function signIn(
	client: APIRequestContext,
	user: { id: string; email: string },
	password: string,
) {
	const response = await client.post("/api/auth/sign-in/email", {
		data: { email: user.email, password },
		maxRedirects: 0,
	});
	expect(response.status()).toBe(200);
	return signedInSession(client, user.id);
}

async function requestReset(
	client: APIRequestContext,
	user: { id: string; email: string },
) {
	const response = await client.post("/api/auth/request-password-reset", {
		data: { email: user.email },
		maxRedirects: 0,
	});
	expect(response.status()).toBe(200);
	expect(await response.json()).toMatchObject({ status: true });
	// Better Auth 1.7.15 password.ts stores the raw token in the identifier and
	// the user ID in value. Never scan or recover another user's reset tokens.
	const records = await prisma.verification.findMany({
		where: { value: user.id, identifier: { startsWith: resetPrefix } },
	});
	expect(records).toHaveLength(1);
	const record = records[0];
	if (!record) throw new Error("No reset record for the fixture user.");
	const lifetime = record.expiresAt.getTime() - record.createdAt.getTime();
	expect(Math.abs(lifetime - 20 * 60 * 1_000)).toBeLessThan(2_000);
	const token = record.identifier.slice(resetPrefix.length);
	expect(token.length).toBeGreaterThan(0);
	return { record, token };
}

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
	// The separately started app must also have neither mail variable configured.
	if (process.env.MAIL_APP_USER || process.env.MAIL_APP_PASSWORD) {
		throw new Error("Run the app and E2E runner without mail credentials.");
	}
	prisma = new PrismaClient({
		adapter: new PrismaPg({ connectionString: databaseUrl }),
	});
	const organization = await prisma.organization.create({
		data: { name: "Auth security verification", slug: `auth-${runId}` },
	});
	organizationId = organization.id;
});

test.afterEach(async () => {
	try {
		await Promise.all(clients.splice(0).map((client) => client.dispose()));
	} finally {
		if (prisma && fixtureUserIds.length > 0) {
			await prisma.verification.deleteMany({
				where: {
					value: { in: fixtureUserIds },
					identifier: { startsWith: resetPrefix },
				},
			});
			await prisma.user.deleteMany({ where: { id: { in: fixtureUserIds } } });
			fixtureUserIds.length = 0;
		}
	}
});

test.afterAll(async () => {
	if (!prisma) return;
	try {
		if (organizationId) {
			await prisma.organization.delete({ where: { id: organizationId } });
		}
	} finally {
		await prisma.$disconnect();
	}
});

test("accepts a legacy 1.6 credential, persists login across reload, and revokes logout server-side", async ({
	page,
	playwright,
	baseURL,
}) => {
	const [salt, key] = legacyHash.split(":");
	expect(
		scryptSync(legacyPassword.normalize("NFKC"), salt, 64, {
			N: 16384,
			r: 16,
			p: 1,
			maxmem: 128 * 16384 * 16 * 2,
		}).toString("hex"),
	).toBe(key);
	const user = await createUser("legacy");
	await preparePage(page, baseURL);
	await page.goto("/login");
	await page.getByLabel("Email address", { exact: true }).fill(user.email);
	// Canonically equivalent input also exercises the legacy NFKC contract.
	await page
		.getByLabel("Password", { exact: true })
		.fill(legacyPassword.normalize("NFD"));
	await page.getByRole("button", { name: "Sign in", exact: true }).click();
	await expect(page).toHaveURL("/");
	const initial = await signedInSession(page.request, user.id);
	await page.reload();
	expect((await signedInSession(page.request, user.id)).session.id).toBe(
		initial.session.id,
	);
	expect(
		await prisma.account.findMany({ where: { userId: user.id } }),
	).toMatchObject([
		{ accountId: user.id, providerId: "credential", password: legacyHash },
	]);

	// Retain the original signed cookie independently: clearing the browser's
	// cookie alone must not make this test pass as server-side revocation.
	const captured = await apiClient(
		playwright.request,
		baseURL,
		await page.context().storageState(),
	);
	await signedInSession(captured, user.id);
	const [response] = await Promise.all([
		page.waitForResponse(
			(response) =>
				new URL(response.url()).pathname === "/api/auth/sign-out" &&
				response.request().method() === "POST",
		),
		page.getByRole("button", { name: "Sign out", exact: true }).first().click(),
	]);
	expect(response.status()).toBe(200);
	expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
	expect(await sessionFor(captured)).toBeNull();
	await page.reload();
	expect(await sessionFor(page.request)).toBeNull();
});

test("activates an invite and resets its credential with a 20-minute single-use token, revoking every old session", async ({
	page,
	playwright,
	baseURL,
}) => {
	const user = await createUser("invited", false);
	const activationToken = randomUUID();
	const password = `Activated-${runId}`;
	const newPassword = `Reset-${runId}`;
	await prisma.invite.create({
		data: {
			token: activationToken,
			userId: user.id,
			type: "STAFF",
			expiresAt: new Date(Date.now() + 3_600_000),
		},
	});
	await preparePage(page, baseURL);
	await page.goto(`/activate/${activationToken}`);
	await page.getByLabel("New password", { exact: true }).fill(password);
	await page.getByLabel("Confirm password", { exact: true }).fill(password);
	await page
		.getByRole("button", { name: "Activate account", exact: true })
		.click();
	await expect(page).toHaveURL("/");
	const browserSession = await signedInSession(page.request, user.id);
	const otherDevice = await apiClient(playwright.request, baseURL);
	const otherSession = await signIn(otherDevice, user, password);
	expect(otherSession.session.id).not.toBe(browserSession.session.id);
	expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2);

	const recovery = await apiClient(playwright.request, baseURL);
	const { record, token } = await requestReset(recovery, user);
	const reset = await recovery.post("/api/auth/reset-password", {
		data: { token, newPassword },
		maxRedirects: 0,
	});
	expect(reset.status()).toBe(200);
	expect(await reset.json()).toMatchObject({ status: true });
	expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
	expect(await sessionFor(page.request)).toBeNull();
	expect(await sessionFor(otherDevice)).toBeNull();
	expect(
		await prisma.verification.count({
			where: { id: record.id, value: user.id },
		}),
	).toBe(0);

	const fresh = await apiClient(playwright.request, baseURL);
	const oldPassword = await fresh.post("/api/auth/sign-in/email", {
		data: { email: user.email, password },
		maxRedirects: 0,
	});
	expect(oldPassword.status()).toBe(401);
	expect(await oldPassword.json()).toMatchObject({
		code: "INVALID_EMAIL_OR_PASSWORD",
	});
	const newSession = await signIn(fresh, user, newPassword);
	const accounts = await prisma.account.findMany({
		where: { userId: user.id },
	});
	expect(accounts).toHaveLength(1);
	expect(accounts[0]).toMatchObject({
		accountId: user.id,
		providerId: "credential",
	});

	const replay = await recovery.post("/api/auth/reset-password", {
		data: { token, newPassword: `Replayed-${runId}` },
		maxRedirects: 0,
	});
	expect(replay.status()).toBe(400);
	expect(await replay.json()).toMatchObject({ code: "INVALID_TOKEN" });
	expect(await prisma.account.findMany({ where: { userId: user.id } })).toEqual(
		accounts,
	);
	expect((await signedInSession(fresh, user.id)).session.id).toBe(
		newSession.session.id,
	);
});

test("rejects an expired reset token without changing the existing credential or revoking its session", async ({
	playwright,
	baseURL,
}) => {
	const user = await createUser("expired");
	const device = await apiClient(playwright.request, baseURL);
	const initial = await signIn(device, user, legacyPassword);
	const recovery = await apiClient(playwright.request, baseURL);
	const { record, token } = await requestReset(recovery, user);
	await prisma.verification.update({
		where: { id: record.id, value: user.id },
		data: { expiresAt: new Date(Date.now() - 1_000) },
	});
	const reset = await recovery.post("/api/auth/reset-password", {
		data: { token, newPassword: `Expired-${runId}` },
		maxRedirects: 0,
	});
	expect(reset.status()).toBe(400);
	expect(await reset.json()).toMatchObject({ code: "INVALID_TOKEN" });
	expect((await signedInSession(device, user.id)).session.id).toBe(
		initial.session.id,
	);
	expect(
		await prisma.account.findMany({ where: { userId: user.id } }),
	).toMatchObject([{ password: legacyHash }]);
	const fresh = await apiClient(playwright.request, baseURL);
	await signIn(fresh, user, legacyPassword);
});
