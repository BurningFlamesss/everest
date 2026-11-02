import type { BetterAuthOptions } from "better-auth";
import { describe, expect, it, vi } from "vitest";
import { auth } from "./auth.ts";

// Inspect the actual configuration without initializing auth, a database, or mail.
vi.mock("better-auth", () => ({
	betterAuth: (options: BetterAuthOptions) => ({ options }),
}));
vi.mock("better-auth/adapters/prisma", () => ({
	prismaAdapter: vi.fn(() => ({})),
}));
vi.mock("better-auth/tanstack-start", () => ({
	tanstackStartCookies: vi.fn(() => ({ id: "tanstack-start-cookies" })),
}));
vi.mock("../db/index", () => ({ prisma: {} }));
vi.mock("#/env/server.ts", () => ({
	serverEnv: { APP_URL: "http://localhost:3000" },
}));
vi.mock("#/packages/notifications/mail.ts", () => ({
	renderMailTemplate: vi.fn(),
	sendMail: vi.fn(),
}));

describe("auth token lifetime units", () => {
	it("configures password reset expiry as 20 minutes in seconds, not milliseconds", () => {
		expect(auth.options.emailAndPassword?.resetPasswordTokenExpiresIn).toBe(
			1_200,
		);
	});

	it("configures email verification expiry as 20 minutes in seconds, not milliseconds", () => {
		expect(auth.options.emailVerification?.expiresIn).toBe(1_200);
	});
});
