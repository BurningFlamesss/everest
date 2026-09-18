import { db, latency, persist, uid } from "./db-CgIvOOZs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit-CP1EiZ6i.js
/** Synchronous on purpose: every mutation writes its own audit trail. */
function recordAudit(input) {
	const event = {
		id: uid("aud"),
		actorId: input.actor.id,
		actorName: input.actor.name,
		actorRole: input.actor.role,
		action: input.action,
		resourceType: input.resourceType,
		resourceId: input.resourceId,
		resourceLabel: input.resourceLabel,
		summary: input.summary,
		createdAt: (/* @__PURE__ */ new Date()).toISOString()
	};
	db().auditEvents.unshift(event);
	persist();
	return event;
}
async function listAudit(query = {}) {
	await latency(200);
	const { search = "", action = "all", actorId = "all", resourceType = "all", limit = 60 } = query;
	const term = search.trim().toLowerCase();
	return db().auditEvents.filter((e) => {
		if (term && !`${e.summary} ${e.actorName} ${e.resourceLabel}`.toLowerCase().includes(term)) return false;
		if (action !== "all" && e.action !== action) return false;
		if (actorId !== "all" && e.actorId !== actorId) return false;
		if (resourceType !== "all" && e.resourceType !== resourceType) return false;
		return true;
	}).slice(0, limit);
}
function auditActors() {
	const seen = /* @__PURE__ */ new Map();
	db().auditEvents.forEach((e) => seen.set(e.actorId, e.actorName));
	return Array.from(seen, ([id, name]) => ({
		id,
		name
	}));
}
function auditResourceTypes() {
	return Array.from(new Set(db().auditEvents.map((e) => e.resourceType)));
}
//#endregion
export { auditActors, auditResourceTypes, listAudit, recordAudit };
