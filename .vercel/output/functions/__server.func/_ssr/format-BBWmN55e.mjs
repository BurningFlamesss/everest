//#region node_modules/.nitro/vite/services/ssr/assets/format-BBWmN55e.js
var MONTHS = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec"
];
function toDateKey(date) {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
function todayKey() {
	return toDateKey(/* @__PURE__ */ new Date());
}
function parseKey(key) {
	const [y, m, d] = key.split("-").map(Number);
	return new Date(y, (m || 1) - 1, d || 1);
}
function formatDate(value, opts = {}) {
	if (!value) return "—";
	const date = typeof value === "string" ? value.length <= 10 ? parseKey(value) : new Date(value) : value;
	if (Number.isNaN(date.getTime())) return "—";
	const base = `${MONTHS[date.getMonth()]} ${date.getDate()}`;
	return opts.withYear === false ? base : `${base}, ${date.getFullYear()}`;
}
function formatDateTime(value) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "—";
	return `${formatDate(date)} · ${date.toLocaleTimeString(void 0, {
		hour: "numeric",
		minute: "2-digit"
	})}`;
}
function relativeTime(value) {
	if (!value) return "—";
	const then = new Date(value).getTime();
	if (Number.isNaN(then)) return "—";
	const diff = Date.now() - then;
	const mins = Math.round(diff / 6e4);
	if (Math.abs(mins) < 1) return "just now";
	if (Math.abs(mins) < 60) return `${mins < 0 ? "in " : ""}${Math.abs(mins)}m${mins < 0 ? "" : " ago"}`;
	const hours = Math.round(mins / 60);
	if (Math.abs(hours) < 24) return `${hours < 0 ? "in " : ""}${Math.abs(hours)}h${hours < 0 ? "" : " ago"}`;
	const days = Math.round(hours / 24);
	if (Math.abs(days) < 30) return `${days < 0 ? "in " : ""}${Math.abs(days)}d${days < 0 ? "" : " ago"}`;
	return formatDate(value);
}
function dayLabel(key) {
	const date = parseKey(key);
	if (key === todayKey()) return "Today";
	const yesterday = /* @__PURE__ */ new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	if (key === toDateKey(yesterday)) return "Yesterday";
	return date.toLocaleDateString(void 0, {
		weekday: "long",
		month: "short",
		day: "numeric"
	});
}
function formatCurrency(amount, currency = "USD") {
	return new Intl.NumberFormat("en-US", {
		style: "currency",
		currency,
		maximumFractionDigits: 0
	}).format(amount);
}
function formatNumber(value) {
	return new Intl.NumberFormat("en-US").format(value);
}
function pluralize(count, singular, plural) {
	return `${count} ${count === 1 ? singular : plural ?? `${singular}s`}`;
}
function avatarFor(name) {
	return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundType=gradientLinear&fontWeight=600`;
}
function photoFor(seed, w = 800, h = 600) {
	return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${w}/${h}`;
}
function addDays(date, days) {
	const next = new Date(date);
	next.setDate(next.getDate() + days);
	return next;
}
/** Last N weekdays (most recent first), skipping weekends. */
function recentWeekdays(count, from = /* @__PURE__ */ new Date()) {
	const out = [];
	const cursor = new Date(from);
	while (out.length < count) {
		const day = cursor.getDay();
		if (day !== 0 && day !== 6) out.push(toDateKey(cursor));
		cursor.setDate(cursor.getDate() - 1);
	}
	return out;
}
function downloadTextFile(filename, content, mime = "text/csv") {
	const blob = new Blob([content], { type: `${mime};charset=utf-8;` });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}
function toCsv(rows, columns) {
	if (!rows.length) return "";
	const keys = columns ?? Object.keys(rows[0]);
	const escape = (value) => {
		const str = value === null || value === void 0 ? "" : String(value);
		return /[",\n]/.test(str) ? `"${str.replace(/"/g, "\"\"")}"` : str;
	};
	return [keys.join(","), ...rows.map((row) => keys.map((k) => escape(row[k])).join(","))].join("\n");
}
//#endregion
export { addDays, avatarFor, dayLabel, downloadTextFile, formatCurrency, formatDate, formatDateTime, formatNumber, parseKey, photoFor, pluralize, recentWeekdays, relativeTime, toCsv, toDateKey, todayKey };
