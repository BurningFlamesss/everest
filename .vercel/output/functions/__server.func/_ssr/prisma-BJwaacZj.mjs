import { PrismaClient } from "./client-DobAeP1g.mjs";
import { PrismaPgAdapterFactory } from "../_libs/@prisma/adapter-pg.mjs";
import "../_libs/dotenv.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/prisma-BJwaacZj.js
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
var globalForPrisma = globalThis;
var connectionString = process.env.DATABASE_URL;
var adapter = new PrismaPgAdapterFactory({ connectionString });
var prisma = globalForPrisma.prisma || new PrismaClient({
	adapter,
	log: ["error"]
});
//#endregion
export { prisma };
