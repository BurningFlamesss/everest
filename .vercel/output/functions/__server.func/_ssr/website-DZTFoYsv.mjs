import { photoFor } from "./format-BBWmN55e.mjs";
import { db, latency } from "./db-CgIvOOZs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/website-DZTFoYsv.js
photoFor("cms-new-hero", 1600, 900), photoFor("cms-new-intro", 1200, 800), photoFor("cms-new-facility", 800, 600), (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
async function getSettings() {
	await latency(200);
	return db().settings;
}
async function listBranches() {
	await latency(160);
	return db().branches;
}
async function listAcademicYears() {
	await latency(160);
	return db().academicYears;
}
//#endregion
export { getSettings, listAcademicYears, listBranches };
