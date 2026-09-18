import { photoFor } from "./format-BBWmN55e.mjs";
import { db, latency, matches, nowIso, paginate, persist, uid } from "./db-CgIvOOZs.mjs";
import { recordAudit } from "./audit-CP1EiZ6i.mjs";
import { pushNotification } from "./notifications-CeHCmL3l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/communications-D6qF7rY7.js
async function listNotices(query = {}) {
	await latency(240);
	const { search = "", status = "all", priority = "all", page = 1, pageSize = 8 } = query;
	const filtered = db().notices.filter((n) => {
		if (!matches(search, n.title, n.summary, n.authorName)) return false;
		if (status !== "all" && n.status !== status) return false;
		if (priority !== "all" && n.priority !== priority) return false;
		return true;
	}).sort((a, b) => {
		if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
		return a.publishAt < b.publishAt ? 1 : -1;
	});
	return paginate(filtered, page, pageSize);
}
async function getNotice(id) {
	await latency(200);
	return db().notices.find((n) => n.id === id) ?? null;
}
function noticeCounts() {
	const notices = db().notices;
	return {
		all: notices.length,
		published: notices.filter((n) => n.status === "published").length,
		scheduled: notices.filter((n) => n.status === "scheduled").length,
		draft: notices.filter((n) => n.status === "draft").length,
		archived: notices.filter((n) => n.status === "archived").length
	};
}
async function createNotice(input, actor) {
	await latency(460);
	const notice = {
		id: uid("not"),
		...input,
		attachments: [],
		authorId: actor.id,
		authorName: actor.name,
		views: 0,
		createdAt: nowIso(),
		updatedAt: nowIso()
	};
	db().notices.unshift(notice);
	persist();
	recordAudit({
		actor,
		action: input.status === "published" ? "published" : "created",
		resourceType: "notice",
		resourceId: notice.id,
		resourceLabel: notice.title,
		summary: input.status === "published" ? `Published notice “${notice.title}”` : `Created a ${input.status} notice “${notice.title}”`
	});
	if (input.status === "published") pushNotification({
		kind: "notice",
		title: "Notice published",
		body: `“${notice.title}” is now visible to ${notice.audience.map((a) => a.label).join(", ")}.`,
		severity: "success",
		href: `/notices/${notice.id}`,
		actorName: actor.name
	});
	return notice;
}
async function updateNotice(id, patch, actor) {
	await latency(400);
	const notice = db().notices.find((n) => n.id === id);
	if (!notice) throw new Error("Notice not found");
	Object.assign(notice, patch, { updatedAt: nowIso() });
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "notice",
		resourceId: notice.id,
		resourceLabel: notice.title,
		summary: `Updated notice “${notice.title}”`
	});
	return notice;
}
async function setNoticeStatus(id, status, actor) {
	await latency(340);
	const notice = db().notices.find((n) => n.id === id);
	if (!notice) throw new Error("Notice not found");
	notice.status = status;
	notice.updatedAt = nowIso();
	if (status === "published") notice.publishAt = nowIso();
	persist();
	recordAudit({
		actor,
		action: status === "published" ? "published" : status === "archived" ? "archived" : "status_changed",
		resourceType: "notice",
		resourceId: notice.id,
		resourceLabel: notice.title,
		summary: `${status === "published" ? "Published" : status === "archived" ? "Archived" : `Moved to ${status}`} notice “${notice.title}”`
	});
	if (status === "published") pushNotification({
		kind: "notice",
		title: "Notice published",
		body: `“${notice.title}” is now live.`,
		severity: "success",
		href: `/notices/${notice.id}`,
		actorName: actor.name
	});
	return notice;
}
async function deleteNotice(id, actor) {
	await latency(300);
	const index = db().notices.findIndex((n) => n.id === id);
	if (index === -1) return;
	const [removed] = db().notices.splice(index, 1);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "notice",
		resourceId: removed.id,
		resourceLabel: removed.title,
		summary: `Deleted notice “${removed.title}”`
	});
}
function audienceOptions() {
	return [
		{
			kind: "everyone",
			label: "Everyone"
		},
		{
			kind: "students",
			label: "Students"
		},
		{
			kind: "guardians",
			label: "Guardians"
		},
		{
			kind: "staff",
			label: "Staff"
		},
		...Array.from(new Set(db().classes.map((c) => c.grade))).map((g) => ({
			kind: "grade",
			value: g,
			label: g
		})),
		...db().classes.slice(0, 12).map((c) => ({
			kind: "class",
			value: c.id,
			label: c.name
		}))
	];
}
function audienceReach(audience) {
	const students = db().students.filter((s) => s.status === "active");
	const staffCount = db().staff.filter((s) => s.employmentStatus === "active").length;
	let reach = 0;
	audience.forEach((target) => {
		if (target.kind === "everyone") reach += students.length * 2 + staffCount;
		if (target.kind === "students") reach += students.length;
		if (target.kind === "guardians") reach += students.length;
		if (target.kind === "staff") reach += staffCount;
		if (target.kind === "grade") reach += students.filter((s) => s.grade === target.value).length;
		if (target.kind === "class") reach += students.filter((s) => s.classId === target.value).length;
	});
	return reach;
}
async function listEvents(query = {}) {
	await latency(240);
	const { search = "", category = "all", status = "all", from, to } = query;
	return db().events.filter((e) => {
		if (!matches(search, e.title, e.location, e.organizerName)) return false;
		if (category !== "all" && e.category !== category) return false;
		if (status !== "all" && e.status !== status) return false;
		if (from && e.endDate < from) return false;
		if (to && e.startDate > to) return false;
		return true;
	}).sort((a, b) => a.startDate < b.startDate ? -1 : 1);
}
async function getEvent(id) {
	await latency(200);
	return db().events.find((e) => e.id === id) ?? null;
}
async function createEvent(input, actor) {
	await latency(440);
	const event = {
		id: uid("evt"),
		...input,
		coverImage: input.coverImage || photoFor(`event-new-${Date.now()}`, 1400, 700),
		organizerId: actor.id,
		organizerName: actor.name,
		participants: [{
			label: "All grades",
			count: 0
		}],
		registrationCount: 0,
		createdAt: nowIso(),
		updatedAt: nowIso()
	};
	db().events.unshift(event);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "event",
		resourceId: event.id,
		resourceLabel: event.title,
		summary: `Created event “${event.title}” on ${event.startDate}`
	});
	pushNotification({
		kind: "event",
		title: "Event created",
		body: `${event.title} · ${event.location}`,
		severity: "info",
		href: `/events/${event.id}`,
		actorName: actor.name
	});
	return event;
}
async function updateEvent(id, patch, actor) {
	await latency(380);
	const event = db().events.find((e) => e.id === id);
	if (!event) throw new Error("Event not found");
	Object.assign(event, patch, { updatedAt: nowIso() });
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "event",
		resourceId: event.id,
		resourceLabel: event.title,
		summary: `Updated event “${event.title}”`
	});
	return event;
}
async function setEventStatus(id, status, actor) {
	await latency(320);
	const event = db().events.find((e) => e.id === id);
	if (!event) throw new Error("Event not found");
	event.status = status;
	event.updatedAt = nowIso();
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "event",
		resourceId: event.id,
		resourceLabel: event.title,
		summary: `Set “${event.title}” to ${status}`
	});
	return event;
}
async function deleteEvent(id, actor) {
	await latency(300);
	const index = db().events.findIndex((e) => e.id === id);
	if (index === -1) return;
	const [removed] = db().events.splice(index, 1);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "event",
		resourceId: removed.id,
		resourceLabel: removed.title,
		summary: `Deleted event “${removed.title}”`
	});
}
async function listAlbums(search = "") {
	await latency(240);
	return db().albums.filter((a) => matches(search, a.title, a.description));
}
async function getAlbum(id) {
	await latency(200);
	return db().albums.find((a) => a.id === id) ?? null;
}
async function createAlbum(input, actor) {
	await latency(400);
	const album = {
		id: uid("alb"),
		...input,
		images: [],
		createdAt: nowIso(),
		updatedAt: nowIso()
	};
	db().albums.unshift(album);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "album",
		resourceId: album.id,
		resourceLabel: album.title,
		summary: `Created gallery album “${album.title}”`
	});
	return album;
}
async function updateAlbum(id, patch, actor) {
	await latency(320);
	const album = db().albums.find((a) => a.id === id);
	if (!album) throw new Error("Album not found");
	Object.assign(album, patch, { updatedAt: nowIso() });
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "album",
		resourceId: album.id,
		resourceLabel: album.title,
		summary: `Updated album “${album.title}”`
	});
	return album;
}
async function deleteAlbum(id, actor) {
	await latency(300);
	const index = db().albums.findIndex((a) => a.id === id);
	if (index === -1) return;
	const [removed] = db().albums.splice(index, 1);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "album",
		resourceId: removed.id,
		resourceLabel: removed.title,
		summary: `Deleted album “${removed.title}”`
	});
}
async function addAlbumImages(albumId, items, actor) {
	await latency(520);
	const album = db().albums.find((a) => a.id === albumId);
	if (!album) throw new Error("Album not found");
	items.forEach((item, i) => {
		const image = {
			id: uid("img"),
			url: item.url,
			caption: item.caption,
			order: album.images.length + i,
			featured: album.images.length === 0 && i === 0,
			uploadedAt: nowIso()
		};
		album.images.push(image);
		if (!album.coverImageId) album.coverImageId = image.id;
	});
	album.updatedAt = nowIso();
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "album",
		resourceId: album.id,
		resourceLabel: album.title,
		summary: `Uploaded ${items.length} image${items.length === 1 ? "" : "s"} to “${album.title}”`
	});
	return album;
}
async function updateAlbumImage(albumId, imageId, patch) {
	await latency(240);
	const album = db().albums.find((a) => a.id === albumId);
	if (!album) throw new Error("Album not found");
	const image = album.images.find((i) => i.id === imageId);
	if (!image) throw new Error("Image not found");
	Object.assign(image, patch);
	album.updatedAt = nowIso();
	persist();
	return album;
}
async function deleteAlbumImage(albumId, imageId) {
	await latency(260);
	const album = db().albums.find((a) => a.id === albumId);
	if (!album) throw new Error("Album not found");
	album.images = album.images.filter((i) => i.id !== imageId).map((img, i) => ({
		...img,
		order: i
	}));
	if (album.coverImageId === imageId) album.coverImageId = album.images[0]?.id;
	album.updatedAt = nowIso();
	persist();
	return album;
}
async function reorderAlbumImages(albumId, orderedIds) {
	await latency(200);
	const album = db().albums.find((a) => a.id === albumId);
	if (!album) throw new Error("Album not found");
	album.images = orderedIds.map((id, index) => {
		const image = album.images.find((i) => i.id === id);
		return image ? {
			...image,
			order: index
		} : null;
	}).filter(Boolean);
	album.updatedAt = nowIso();
	persist();
	return album;
}
async function setAlbumCover(albumId, imageId) {
	await latency(200);
	const album = db().albums.find((a) => a.id === albumId);
	if (!album) throw new Error("Album not found");
	album.coverImageId = imageId;
	album.images = album.images.map((i) => ({
		...i,
		featured: i.id === imageId
	}));
	album.updatedAt = nowIso();
	persist();
	return album;
}
//#endregion
export { addAlbumImages, audienceOptions, audienceReach, createAlbum, createEvent, createNotice, deleteAlbum, deleteAlbumImage, deleteEvent, deleteNotice, getAlbum, getEvent, getNotice, listAlbums, listEvents, listNotices, noticeCounts, reorderAlbumImages, setAlbumCover, setEventStatus, setNoticeStatus, updateAlbum, updateAlbumImage, updateEvent, updateNotice };
