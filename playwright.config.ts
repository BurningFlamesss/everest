import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	fullyParallel: false,
	workers: 1,
	timeout: 60_000,
	reporter: "list",
	outputDir: ".data/playwright-results",
	use: {
		baseURL: process.env.SCMS_E2E_BASE_URL ?? "http://localhost:3000",
		browserName: "chromium",
		trace: "retain-on-failure",
		launchOptions: {
			executablePath: process.env.SCMS_CHROMIUM_EXECUTABLE,
		},
	},
});
