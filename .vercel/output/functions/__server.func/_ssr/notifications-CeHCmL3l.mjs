import { db, latency, persist, uid } from "./db-CgIvOOZs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CeHCmL3l.js
function pushNotification(input) {
	const notification = {
		id: uid("ntf"),
		read: false,
		createdAt: (/* @__PURE__ */ new Date()).toISOString(),
		...input
	};
	db().notifications.unshift(notification);
	persist();
	return notification;
}
async function listNotifications(filter = "all") {
	await latency(180);
	const all = db().notifications;
	if (filter === "all") return all;
	if (filter === "unread") return all.filter((n) => !n.read);
	return all.filter((n) => n.kind === filter);
}
async function unreadCount() {
	await latency(120);
	return db().notifications.filter((n) => !n.read).length;
}
async function markNotificationRead(id) {
	await latency(140);
	const notification = db().notifications.find((n) => n.id === id);
	if (notification) notification.read = true;
	persist();
}
async function markAllNotificationsRead() {
	await latency(220);
	let count = 0;
	db().notifications.forEach((n) => {
		if (!n.read) {
			n.read = true;
			count += 1;
		}
	});
	persist();
	return count;
}
async function clearNotification(id) {
	await latency(160);
	const index = db().notifications.findIndex((n) => n.id === id);
	if (index >= 0) db().notifications.splice(index, 1);
	persist();
}
//#endregion
export { clearNotification, listNotifications, markAllNotificationsRead, markNotificationRead, pushNotification, unreadCount };
