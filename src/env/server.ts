import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
	server: {
		DATABASE_URL: z.string().min(1),

		APP_URL: z.string().min(1),
		BETTER_AUTH_SECRET: z.string().min(1),

		SUPER_ADMIN_EMAIL: z.string().min(1),
		SUPER_ADMIN_NAME: z.string().min(1),

		ORGANIZATION_NAME: z.string().min(1),
		ORGANIZATION_SLUG: z.string().min(1),

		DEFAULT_BRANCH_NAME: z.string().min(1),
		DEFAULT_BRANCH_SLUG: z.string().min(1),

		MAIL_APP_USER: z.string().optional(),
		MAIL_APP_PASSWORD: z.string().optional(),

		STORAGE_DRIVER: z.enum(["local", "s3"]).default("local"),
		STORAGE_LOCAL_DIR: z.string().default(".data/uploads"),
		S3_ENDPOINT: z.string().default("localhost"),
		S3_PORT: z.coerce.number().int().positive().default(9000),
		S3_USE_SSL: z
			.enum(["true", "false"])
			.default("false")
			.transform((value) => value === "true"),
		S3_ACCESS_KEY: z.string().default("scms"),
		S3_SECRET_KEY: z.string().default("scms-secret"),
		S3_BUCKET: z.string().default("scms"),
		S3_REGION: z.string().trim().min(1).optional(),

		// Required to call the scheduled upload-cleanup endpoint. Leave unset to
		// disable the endpoint entirely.
		CRON_SECRET: z.string().trim().min(16).optional(),
	},

	runtimeEnv: process.env,
	emptyStringAsUndefined: true,

	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) =>
			console.error(`  ${issue.path?.join(".")}: ${issue.message}`),
		);
		process.exit(1);
	},
});
