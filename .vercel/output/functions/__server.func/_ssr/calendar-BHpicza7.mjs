import { bsToAd } from "./nepaliDate-D2jed4L4.mjs";
import { countdownTo } from "./DownloadButton-BvKdJ2gw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/calendar-BHpicza7.js
/**
* Events are authored in Bikram Sambat only. The Gregorian reading is derived
* from the verified conversion table, so the two can never drift apart.
*/
function d(bs) {
	return {
		bs,
		ad: bsToAd(bs) ?? ""
	};
}
function ev(id, kind, title, bs, extra = {}) {
	return {
		id,
		kind,
		title,
		titleNe: extra.titleNe,
		date: d(bs),
		endDate: extra.endBs ? d(extra.endBs) : void 0,
		detail: extra.detail,
		allDay: true
	};
}
var ACADEMIC_YEAR_BS = 2083;
var calendarEvents = [
	ev("e-newyear", "festival", "Nepali New Year 2083", "2083-01-01", {
		titleNe: "नयाँ वर्ष २०८३",
		detail: "School closed"
	}),
	ev("e-session-open", "event", "Session begins · all levels", "2083-01-02", { detail: "Classes resume at 07:00" }),
	ev("e-loktantra", "holiday", "Loktantra Diwas", "2083-01-11", { titleNe: "लोकतन्त्र दिवस" }),
	ev("e-buddha", "festival", "Buddha Jayanti", "2083-01-18", { titleNe: "बुद्ध जयन्ती" }),
	ev("e-late-admission", "admission", "Late admission closes · grades 1 to 9", "2083-01-19", { detail: "Front office, until 16:00" }),
	ev("e-parents-basic", "event", "Parents’ day · basic level", "2083-02-02", { detail: "10:00 to 13:00 in the hall" }),
	ev("e-republic", "holiday", "Republic Day", "2083-02-15", { titleNe: "गणतन्त्र दिवस" }),
	ev("e-unit-1", "exam", "First unit test · grades 1 to 10", "2083-02-20", { endBs: "2083-02-24" }),
	ev("e-asar15", "festival", "Asar Pandhra · Ropain", "2083-03-15", { titleNe: "असार पन्ध्र" }),
	ev("e-plantation", "event", "Plantation day", "2083-03-25", { detail: "Whole school, second period onward" }),
	ev("e-quiz", "event", "Inter-house quiz", "2083-04-05"),
	ev("e-janai", "festival", "Janai Purnima and Rakshya Bandhan", "2083-04-24", { titleNe: "जनै पूर्णिमा" }),
	ev("e-gaijatra", "festival", "Gai Jatra", "2083-04-25", { titleNe: "गाई जात्रा" }),
	ev("e-krishna", "festival", "Krishna Janmashtami", "2083-05-04", { titleNe: "कृष्ण जन्माष्टमी" }),
	ev("e-term-1", "exam", "First terminal examination", "2083-05-18", {
		endBs: "2083-05-24",
		detail: "Grades 1 to 10, 08:00 start"
	}),
	ev("e-result-1", "event", "Result publication · first terminal", "2083-05-28"),
	ev("e-constitution", "holiday", "Constitution Day", "2083-06-03", { titleNe: "संविधान दिवस" }),
	ev("e-sci-expo", "event", "Science exhibition", "2083-06-10", { detail: "Open to families from 11:00" }),
	ev("e-dashain", "holiday", "Dashain holiday", "2083-06-24", {
		titleNe: "दसैं बिदा",
		endBs: "2083-07-05"
	}),
	ev("e-reopen", "event", "School reopens after Dashain", "2083-07-06"),
	ev("e-tihar", "festival", "Tihar", "2083-07-22", {
		titleNe: "तिहार",
		endBs: "2083-07-26"
	}),
	ev("e-chhath", "festival", "Chhath Parva", "2083-07-28", { titleNe: "छठ पर्व" }),
	ev("e-sports", "event", "Annual sports meet", "2083-08-03", { endBs: "2083-08-05" }),
	ev("e-term-2", "exam", "Second terminal examination", "2083-08-15", { endBs: "2083-08-21" }),
	ev("e-parents-sec", "event", "Parents’ day · secondary level", "2083-08-28"),
	ev("e-winter", "event", "Winter timings begin · 07:45 start", "2083-09-01"),
	ev("e-yomari", "festival", "Yomari Punhi", "2083-09-10", { titleNe: "योमरी पुन्हि" }),
	ev("e-tamu", "festival", "Tamu Lhosar", "2083-09-15", {
		titleNe: "तमु ल्होसार",
		detail: "School closed"
	}),
	ev("e-christmas", "holiday", "Christmas Day", "2083-09-25"),
	ev("e-prithvi", "holiday", "Prithvi Jayanti and National Unity Day", "2083-09-27", { titleNe: "पृथ्वी जयन्ती" }),
	ev("e-maghe", "festival", "Maghe Sankranti", "2083-10-01", { titleNe: "माघे संक्रान्ति" }),
	ev("e-sonam", "festival", "Sonam Lhosar", "2083-10-11", { titleNe: "सोनाम ल्होसार" }),
	ev("e-saraswati", "festival", "Saraswati Puja · Basanta Panchami", "2083-10-14", { titleNe: "सरस्वती पूजा" }),
	ev("e-adm-open", "admission", "Admissions open · 2084 BS session", "2083-10-20", { detail: "Forms at the front office and online enquiry" }),
	ev("e-pre-see", "exam", "Pre-SEE examination · grade 10", "2083-10-26", { endBs: "2083-11-02" }),
	ev("e-adm-forms", "admission", "Admission forms available · all levels", "2083-11-01"),
	ev("e-prajatantra", "holiday", "Prajatantra Diwas", "2083-11-07", { titleNe: "प्रजातन्त्र दिवस" }),
	ev("e-shivaratri", "festival", "Maha Shivaratri", "2083-11-11", { titleNe: "महाशिवरात्री" }),
	ev("e-gyalpo", "festival", "Gyalpo Lhosar", "2083-11-16", { titleNe: "ग्याल्पो ल्होसार" }),
	ev("e-holi", "festival", "Fagu Purnima · Holi", "2083-11-26", { titleNe: "फागु पूर्णिमा" }),
	ev("e-term-3", "exam", "Third terminal examination · grades 1 to 9", "2083-11-29", { endBs: "2083-12-05" }),
	ev("e-see", "exam", "SEE examination · grade 10", "2083-12-08", {
		endBs: "2083-12-19",
		detail: "National Examinations Board centre"
	}),
	ev("e-ghodejatra", "holiday", "Ghode Jatra", "2083-12-11", { titleNe: "घोडेजात्रा" }),
	ev("e-ramnavami", "festival", "Ram Navami", "2083-12-14", { titleNe: "राम नवमी" }),
	ev("e-adm-close", "admission", "Admission closes · grade 11", "2083-12-20"),
	ev("e-annual-day", "event", "Annual day and prize distribution", "2083-12-25"),
	ev("e-closing", "event", "Result publication and session closing", "2083-12-28")
];
var terms = [
	{
		id: "term-1",
		name: "Term 1 · Baishakh to Bhadra",
		start: d("2083-01-02"),
		end: d("2083-05-28")
	},
	{
		id: "term-2",
		name: "Term 2 · Ashwin to Mangsir",
		start: d("2083-06-01"),
		end: d("2083-08-28")
	},
	{
		id: "term-3",
		name: "Term 3 · Poush to Chaitra",
		start: d("2083-09-01"),
		end: d("2083-12-28")
	}
];
var eventKindMeta = {
	exam: {
		label: "Examination",
		glyph: "square"
	},
	holiday: {
		label: "Holiday",
		glyph: "circle"
	},
	festival: {
		label: "Festival",
		glyph: "diamond"
	},
	event: {
		label: "School event",
		glyph: "triangle"
	},
	admission: {
		label: "Admission deadline",
		glyph: "bar"
	}
};
var calendarIntro = {
	eyebrow: "ACADEMIC CALENDAR · 2083 BS · 2026 – 27 AD",
	statement: [
		"THE YEAR,",
		"IN BOTH",
		"CALENDARS."
	],
	support: "Every date is printed in Bikram Sambat and in the Gregorian calendar at the same time. Choose which one leads; the other never disappears."
};
var esc = (value) => value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
var compact = (iso) => iso.replace(/-/g, "");
var nextDay = (iso) => {
	const d = /* @__PURE__ */ new Date(`${iso}T00:00:00`);
	d.setDate(d.getDate() + 1);
	return compact(d.toISOString().slice(0, 10));
};
function buildIcs(event) {
	const stamp = `${(/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
	return [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		"PRODID:-//Everest English Boarding Secondary School//Notices//EN",
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		"BEGIN:VEVENT",
		`UID:${event.uid}@everestbutwal.edu.np`,
		`DTSTAMP:${stamp}`,
		`DTSTART;VALUE=DATE:${compact(event.date)}`,
		`DTEND;VALUE=DATE:${nextDay(event.date)}`,
		`SUMMARY:${esc(event.title)}`,
		`DESCRIPTION:${esc(event.description)}`,
		`LOCATION:${esc(event.location ?? "Everest English Boarding Secondary School, Butwal-8")}`,
		"STATUS:CONFIRMED",
		"TRANSP:TRANSPARENT",
		"BEGIN:VALARM",
		`TRIGGER:-P${event.remindDaysBefore ?? 3}D`,
		"ACTION:DISPLAY",
		`DESCRIPTION:${esc(`Reminder: ${event.title}`)}`,
		"END:VALARM",
		"END:VEVENT",
		"END:VCALENDAR"
	].join("\r\n");
}
function downloadIcs(events, fileName) {
	const icsContent = (Array.isArray(events) ? events : [events]).map((e) => {
		if ("uid" in e) return e;
		const ce = e;
		return {
			uid: ce.id,
			title: ce.title,
			description: ce.detail ?? ce.title,
			date: ce.date.ad
		};
	}).map(buildIcs).join("\r\n");
	const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	const name = fileName.endsWith(".ics") ? fileName : `${fileName}.ics`;
	anchor.href = url;
	anchor.download = name;
	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	setTimeout(() => URL.revokeObjectURL(url), 2e3);
	return name;
}
/** Copy helper with a graceful fallback for non-secure contexts. */
async function copyText(value) {
	try {
		if (navigator.clipboard && window.isSecureContext) {
			await navigator.clipboard.writeText(value);
			return true;
		}
	} catch {}
	try {
		const area = document.createElement("textarea");
		area.value = value;
		area.style.position = "fixed";
		area.style.opacity = "0";
		document.body.appendChild(area);
		area.select();
		const ok = document.execCommand("copy");
		document.body.removeChild(area);
		return ok;
	} catch {
		return false;
	}
}
/** Returns "X days Y hours" or "Closed" for a deadline. */
function countdownLabel(deadlineAd) {
	const { days, hours, closed } = countdownTo(deadlineAd);
	if (closed) return "Closed";
	return `${days}d ${hours}h`;
}
/** Returns events that fall within a given term. */
function eventsInTerm(termId) {
	const term = terms.find((t) => t.id === termId);
	if (!term) return [];
	return calendarEvents.filter((e) => {
		const ad = e.date.ad;
		return ad >= term.start.ad && ad <= term.end.ad;
	});
}
/** Returns events that occur on a specific Bikram Sambat date. */
function eventsOnBs(bsDate) {
	return calendarEvents.filter((e) => e.date.bs === bsDate);
}
/** Finds the next event of given kind(s) after today. */
function nextOfKind(kinds) {
	const todayAd = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
	return calendarEvents.filter((e) => kinds.includes(e.kind) && e.date.ad >= todayAd).sort((a, b) => a.date.ad.localeCompare(b.date.ad))[0] ?? null;
}
/** Returns today's date in YYYY-MM-DD format. */
function today() {
	return (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
}
//#endregion
export { ACADEMIC_YEAR_BS, calendarEvents, calendarIntro, copyText, countdownLabel, downloadIcs, eventKindMeta, eventsInTerm, eventsOnBs, nextOfKind, terms, today };
