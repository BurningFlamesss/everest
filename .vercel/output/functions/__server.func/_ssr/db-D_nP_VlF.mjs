import { string$1 as string } from "../_libs/@better-auth/core+[...].mjs";
import { PrismaClient } from "./client-DobAeP1g.mjs";
import { createEnv } from "../_libs/t3-oss__env-core.mjs";
import { PrismaPgAdapterFactory } from "../_libs/@prisma/adapter-pg.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/db-D_nP_VlF.js
var serverEnv = createEnv({
	server: {
		DATABASE_URL: string().min(1),
		APP_URL: string().min(1),
		BETTER_AUTH_SECRET: string().min(1),
		SUPER_ADMIN_EMAIL: string().min(1),
		SUPER_ADMIN_NAME: string().min(1),
		ORGANIZATION_NAME: string().min(1),
		ORGANIZATION_SLUG: string().min(1),
		DEFAULT_BRANCH_NAME: string().min(1),
		DEFAULT_BRANCH_SLUG: string().min(1),
		MAIL_APP_USER: string(),
		MAIL_APP_PASSWORD: string()
	},
	runtimeEnv: process.env,
	emptyStringAsUndefined: true,
	onValidationError(issues) {
		console.error("Invalid Environment Variable");
		issues.map((issue) => console.error(`  ${issue.path?.join(".")}: ${issue.message}`));
		process.exit(1);
	}
});
var adapter = new PrismaPgAdapterFactory({ connectionString: serverEnv.DATABASE_URL });
var prisma = globalThis.__prisma || new PrismaClient({ adapter });
//#endregion
export { prisma, serverEnv };
