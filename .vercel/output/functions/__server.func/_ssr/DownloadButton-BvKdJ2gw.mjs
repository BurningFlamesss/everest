import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Download, FileText } from "../_libs/lucide-react.mjs";
import { toast } from "../_libs/sonner.mjs";
import { school } from "./router-B6FnglFX.mjs";
import { Button } from "./kit-Cq_igxhQ.mjs";
import { require_jspdf_node_min } from "../_libs/jspdf.mjs";
import { autoTable } from "../_libs/jspdf-autotable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DownloadButton-BvKdJ2gw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_jspdf_node_min = require_jspdf_node_min();
var WEEKDAYS = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday"
];
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
var toDate = (iso) => /* @__PURE__ */ new Date(`${iso}T00:00:00`);
/** "2026-09-01" -> "01 Sep 2026" */
function formatAd(iso) {
	const d = toDate(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
/** Today's weekday, clamped to the six-day Nepali school week. */
function todaySchoolWeekday() {
	const idx = (/* @__PURE__ */ new Date()).getDay();
	if (idx === 6) return null;
	return WEEKDAYS[idx];
}
/** Whole days from now until the given date (negative once past). */
function daysUntil(iso) {
	const target = toDate(iso).getTime();
	const now = /* @__PURE__ */ new Date();
	const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	return Math.round((target - startOfToday) / 864e5);
}
/** Live countdown parts to 23:59:59 of the deadline day. */
function countdownTo(iso) {
	const end = (/* @__PURE__ */ new Date(`${iso}T23:59:59`)).getTime();
	const diff = end - Date.now();
	if (Number.isNaN(end) || diff <= 0) return {
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
		closed: true,
		totalMs: 0
	};
	return {
		days: Math.floor(diff / 864e5),
		hours: Math.floor(diff / 36e5 % 24),
		minutes: Math.floor(diff / 6e4 % 60),
		seconds: Math.floor(diff / 1e3 % 60),
		closed: false,
		totalMs: diff
	};
}
/** "Today", "Yesterday", "4 days ago", "in 6 days" */
function relativeDay(iso) {
	const diff = daysUntil(iso);
	if (diff === 0) return "Today";
	if (diff === 1) return "Tomorrow";
	if (diff === -1) return "Yesterday";
	if (diff < 0) {
		const n = Math.abs(diff);
		if (n < 30) return `${n} days ago`;
		const months = Math.round(n / 30);
		return months <= 1 ? "Last month" : `${months} months ago`;
	}
	if (diff < 30) return `in ${diff} days`;
	const months = Math.round(diff / 30);
	return months <= 1 ? "next month" : `in ${months} months`;
}
function formatNpr(amount) {
	return `Rs ${amount.toLocaleString("en-IN")}`;
}
/** "08:45" -> minutes since midnight */
function minutesOfDay(hhmm) {
	const [h, m] = hhmm.split(":").map((n) => Number.parseInt(n, 10));
	if (Number.isNaN(h) || Number.isNaN(m)) return -1;
	return h * 60 + m;
}
function nowMinutes() {
	const d = /* @__PURE__ */ new Date();
	return d.getHours() * 60 + d.getMinutes();
}
var issuedLine = () => `Issued ${formatAd((/* @__PURE__ */ new Date()).toISOString().slice(0, 10))}`;
var slug = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
function programProspectusDoc(program, level) {
	const blocks = [
		{
			type: "keyvalues",
			items: [
				["Programme code", program.code],
				["Level", `${level.label} · ${level.grades}`],
				["Board", level.board],
				["Duration", program.duration],
				["Seats", `${program.seats}`],
				["Medium of instruction", program.medium],
				["Eligibility", program.eligibility]
			]
		},
		{
			type: "heading",
			text: "About this programme"
		},
		{
			type: "paragraph",
			text: program.description
		},
		{
			type: "heading",
			text: "What makes it distinctive"
		},
		{
			type: "bullets",
			items: program.highlights
		},
		{
			type: "heading",
			text: "Subjects and credit hours"
		},
		{
			type: "table",
			columns: [
				"Code",
				"Subject",
				"Credit",
				"Type"
			],
			rows: program.subjects.map((s) => [
				s.code,
				s.name,
				`${s.credit}`,
				s.kind
			]),
			caption: `Total credit hours: ${program.subjects.reduce((n, s) => n + s.credit, 0)}`
		},
		{
			type: "heading",
			text: "Fee structure (NPR)"
		},
		{
			type: "table",
			columns: [
				"Particular",
				"Amount",
				"Frequency",
				"Note"
			],
			rows: program.fees.map((f) => [
				f.label,
				formatNpr(f.amount),
				f.frequency,
				f.note ?? "—"
			]),
			caption: "Fees are indicative for session 2083 BS and are reduced by any approved scholarship before invoicing."
		},
		{
			type: "heading",
			text: "Learning outcomes"
		},
		{
			type: "bullets",
			items: program.outcomes
		}
	];
	if (program.careers.length > 0) {
		blocks.push({
			type: "heading",
			text: "Onward pathways"
		});
		blocks.push({
			type: "bullets",
			items: program.careers
		});
	}
	blocks.push({ type: "rule" });
	blocks.push({
		type: "paragraph",
		text: `${school.affiliation}. Registration number ${school.regNo}. For admission enquiries contact the admissions desk at ${school.phone} or ${school.email}.`
	});
	blocks.push({
		type: "signature",
		name: school.principal,
		role: "Principal"
	});
	return {
		fileName: `Prospectus-${slug(program.title)}-2083`,
		eyebrow: "Programme prospectus · Session 2083 BS",
		title: program.title,
		refNo: program.code,
		dateLine: issuedLine(),
		stamp: "Official",
		blocks,
		footNote: `${school.name} · ${school.address} · ${school.motto}`
	};
}
function academicProspectusDoc(levels, programs) {
	const blocks = [
		{
			type: "paragraph",
			text: `This prospectus summarises every academic programme offered by ${school.name} for the session 2083 BS, from the Early Years Foundation through to the Grade 12 Science and Management streams of the National Examinations Board.`
		},
		{
			type: "keyvalues",
			items: [
				["Institution", school.name],
				["Address", school.fullAddress],
				["Established", school.established],
				["Levels offered", school.levels],
				["+2 streams", school.streams.join(" and ")],
				["Registration", school.regNo]
			]
		},
		{
			type: "heading",
			text: "Programme index"
		},
		{
			type: "table",
			columns: [
				"Code",
				"Programme",
				"Level",
				"Duration",
				"Seats"
			],
			rows: programs.map((p) => [
				p.code,
				p.title,
				levels.find((l) => l.id === p.level)?.short ?? p.level,
				p.duration,
				`${p.seats}`
			]),
			caption: `${programs.length} programmes across ${levels.length} levels.`
		}
	];
	levels.forEach((level) => {
		blocks.push({
			type: "heading",
			text: `${level.label} · ${level.grades}`
		});
		blocks.push({
			type: "paragraph",
			text: level.description
		});
		blocks.push({
			type: "bullets",
			items: programs.filter((p) => p.level === level.id).map((p) => `${p.title} (${p.code}) — ${p.summary}`)
		});
	});
	blocks.push({ type: "rule" });
	blocks.push({
		type: "signature",
		name: school.principal,
		role: "Principal"
	});
	return {
		fileName: "Everest-Academic-Prospectus-2083",
		eyebrow: "Academic prospectus · Session 2083 BS",
		title: "Academic Programmes and Streams",
		refNo: "EEBSS/2083/PRO/001",
		dateLine: issuedLine(),
		stamp: "Official",
		blocks,
		footNote: `${school.name} · ${school.affiliation}`
	};
}
function routineDoc(routine) {
	const columns = ["Day", ...routine.periods.map((p) => `${p.label}\n${p.start}-${p.end}`)];
	const rows = routine.rows.map((row) => [row.day, ...row.slots]);
	return {
		fileName: `Class-Routine-${slug(routine.label)}-2083`,
		eyebrow: "Weekly class routine · Session 2083 BS",
		title: `${routine.label} — Weekly Routine`,
		refNo: `EEBSS/2083/RTN/${routine.key.toUpperCase()}`,
		dateLine: `Effective from ${routine.effectiveFrom}`,
		stamp: "Official",
		blocks: [
			{
				type: "keyvalues",
				items: [
					["Shift", routine.shift],
					["Rooms", routine.room],
					["Working days", `${routine.rows.length} (Sunday to Friday)`],
					["Periods per day", `${routine.periods.length}`],
					["Effective from", routine.effectiveFrom]
				]
			},
			{
				type: "table",
				columns,
				rows,
				caption: "Saturday is the weekly holiday."
			},
			{
				type: "heading",
				text: "Notes"
			},
			{
				type: "bullets",
				items: [
					"Students must be seated before the first bell of their shift.",
					"Practical and studio periods are held in the final slot of the day and run without interruption.",
					"Any change to this routine is notified on the Notices board before it takes effect."
				]
			},
			{
				type: "signature",
				name: "Sarita Gurung",
				role: "Vice Principal (Academics)"
			}
		],
		footNote: `${school.name} · ${school.address}`
	};
}
function noticeDoc(notice) {
	const blocks = [
		{
			type: "keyvalues",
			items: [
				["Category", notice.category],
				["Audience", notice.audience],
				["Date", `${notice.dateBs} BS  /  ${formatAd(notice.dateAd)}`],
				["Issued by", notice.issuedBy]
			]
		},
		{ type: "rule" },
		...notice.body.map((paragraph) => ({
			type: "paragraph",
			text: paragraph
		}))
	];
	if (notice.bullets && notice.bullets.length > 0) {
		blocks.push({
			type: "heading",
			text: "Points to note"
		});
		blocks.push({
			type: "bullets",
			items: notice.bullets
		});
	}
	if (notice.table) {
		blocks.push({
			type: "heading",
			text: "Schedule"
		});
		blocks.push({
			type: "table",
			columns: notice.table.columns,
			rows: notice.table.rows,
			caption: notice.table.caption
		});
	}
	blocks.push({ type: "rule" });
	blocks.push({
		type: "paragraph",
		text: "This is a true copy of the notice published on the official school notice board. Queries may be addressed to the issuing office during published office hours."
	});
	blocks.push({
		type: "signature",
		name: notice.issuedBy.split(",")[0],
		role: notice.issuedBy.split(",").slice(1).join(",").trim() || "Issuing office"
	});
	return {
		fileName: `Notice-${notice.ref.replace(/\//g, "-")}`,
		eyebrow: `${notice.category} notice`,
		title: notice.title,
		refNo: notice.ref,
		dateLine: `${notice.dateBs} BS  /  ${formatAd(notice.dateAd)}`,
		stamp: notice.pinned ? "Pinned" : "Official",
		blocks,
		footNote: `${school.name} · ${school.address} · ${school.phone}`
	};
}
function scholarshipFormDoc(item) {
	return {
		fileName: `Scholarship-Application-${slug(item.name)}-2083`,
		eyebrow: "Scholarship application form · Session 2083 BS",
		title: item.name,
		refNo: item.ref,
		dateLine: `Applications close ${item.deadlineBs} BS  /  ${formatAd(item.deadlineAd)}`,
		stamp: "Application form",
		blocks: [
			{
				type: "keyvalues",
				items: [
					["Scheme", `${item.name} (${item.nepaliName})`],
					["Category", item.category],
					["Coverage", `${item.coverage}% — ${item.award}`],
					["Indicative value", `${formatNpr(item.amountNpr)} over the award period`],
					["Places available", `${item.seats}`],
					["Applies to", item.appliesTo],
					["Deadline", `${item.deadlineBs} BS / ${formatAd(item.deadlineAd)}`]
				]
			},
			{
				type: "heading",
				text: "Section A · Applicant particulars"
			},
			{
				type: "keyvalues",
				items: [
					["Full name of student", ""],
					["Date of birth (BS / AD)", ""],
					["Grade applied for", ""],
					["Stream or concentration", ""],
					["Previous school", ""],
					["Last GPA or percentage", ""]
				]
			},
			{
				type: "heading",
				text: "Section B · Guardian particulars"
			},
			{
				type: "keyvalues",
				items: [
					["Name of guardian", ""],
					["Relationship to student", ""],
					["Occupation", ""],
					["Annual household income (NPR)", ""],
					["Ward, municipality and district", ""],
					["Contact number", ""]
				]
			},
			{
				type: "heading",
				text: "Section C · Eligibility conditions"
			},
			{
				type: "table",
				columns: [
					"Condition",
					"Detail",
					"Met (Y/N)"
				],
				rows: item.eligibility.map((c) => [
					c.label,
					c.detail,
					""
				])
			},
			{
				type: "heading",
				text: "Section D · Documents enclosed"
			},
			{
				type: "checklist",
				items: item.documents
			},
			{
				type: "heading",
				text: "Declaration"
			},
			{
				type: "paragraph",
				text: "I declare that the particulars given above are true to the best of my knowledge, and I understand that any false declaration will result in the withdrawal of the award and of admission. I consent to verification of the declared information, including a home visit where the committee considers it necessary."
			},
			{
				type: "spacer",
				size: 18
			},
			{
				type: "keyvalues",
				items: [
					["Signature of student", ""],
					["Signature of guardian", ""],
					["Date of submission", ""]
				]
			},
			{ type: "rule" },
			{
				type: "paragraph",
				text: `For office use only — received by: ______________  Receipt no: ______________  Enquiries: ${item.contact}`
			}
		],
		footNote: `${school.name} · Scholarship Selection Committee · ${school.address}`
	};
}
function scholarshipChecklistDoc(item) {
	return {
		fileName: `Scholarship-Checklist-${slug(item.name)}`,
		eyebrow: "Applicant document checklist",
		title: `${item.name} — What to bring`,
		refNo: item.ref,
		dateLine: `Deadline ${item.deadlineBs} BS  /  ${formatAd(item.deadlineAd)}`,
		stamp: "Checklist",
		blocks: [
			{
				type: "paragraph",
				text: item.summary
			},
			{
				type: "heading",
				text: "Documents to enclose"
			},
			{
				type: "checklist",
				items: item.documents
			},
			{
				type: "heading",
				text: "Conditions you must meet"
			},
			{
				type: "checklist",
				items: item.eligibility.map((c) => c.label)
			},
			{
				type: "heading",
				text: "How the process runs"
			},
			{
				type: "bullets",
				items: item.process
			},
			{
				type: "heading",
				text: "Renewal"
			},
			{
				type: "paragraph",
				text: item.renewal
			},
			{ type: "rule" },
			{
				type: "paragraph",
				text: `Questions: ${item.contact}`
			}
		],
		footNote: `${school.name} · Bring this checklist with you to the admissions desk`
	};
}
function scholarshipIndexDoc(items) {
	return {
		fileName: "Scholarship-Schemes-Index-2083",
		eyebrow: "Scholarship index · Session 2083 BS",
		title: "Chhatrabritti Schemes and Deadlines",
		refNo: "EEBSS/2083/SCH/000",
		dateLine: issuedLine(),
		stamp: "Official",
		blocks: [
			{
				type: "paragraph",
				text: `${items.length} schemes are open for the session 2083 BS, covering ${items.reduce((n, s) => n + s.seats, 0)} places in total. Each scheme carries its own deadline, criteria and document list.`
			},
			{
				type: "table",
				columns: [
					"Ref",
					"Scheme",
					"Category",
					"Coverage",
					"Places",
					"Deadline (BS)"
				],
				rows: items.map((s) => [
					s.ref,
					s.name,
					s.category,
					`${s.coverage}%`,
					`${s.seats}`,
					s.deadlineBs
				])
			},
			{
				type: "heading",
				text: "General conditions"
			},
			{
				type: "bullets",
				items: [
					"Incomplete files are returned rather than held; check the document list before submitting.",
					"A scholarship claim cannot be added after the admission interview has taken place.",
					"Full-tuition awards cannot be combined with the Government Free Studentship quota.",
					"Renewal is never automatic — a renewal declaration is required each session."
				]
			},
			{
				type: "signature",
				name: school.principal,
				role: "Chair, Scholarship Selection Committee"
			}
		],
		footNote: `${school.name} · ${school.address}`
	};
}
function facultyDirectoryDoc(list) {
	return {
		fileName: "Everest-Faculty-Directory-2083",
		eyebrow: "Administration and faculty directory",
		title: "Staff Contact Directory 2083",
		refNo: "EEBSS/2083/DIR/001",
		dateLine: issuedLine(),
		stamp: "Official",
		blocks: [
			{
				type: "paragraph",
				text: `Contact directory for the ${list.length} members of the administration and teaching faculty. Extension numbers connect through the main line ${school.phone}.`
			},
			{
				type: "table",
				columns: [
					"Name",
					"Role",
					"Department",
					"Extension",
					"Email"
				],
				rows: list.map((p) => [
					p.name,
					p.role,
					p.department,
					p.extension,
					p.email
				])
			},
			{
				type: "heading",
				text: "Office hours"
			},
			{
				type: "table",
				columns: ["Name", "Office hours"],
				rows: list.map((p) => [p.name, p.officeHours])
			},
			{
				type: "signature",
				name: "Ramesh Kumar Thapa",
				role: "Vice Principal (Administration)"
			}
		],
		footNote: `${school.name} · ${school.address} · ${school.phone}`
	};
}
function personProfileDoc(person) {
	return {
		fileName: `Profile-${slug(person.name)}`,
		eyebrow: `${person.department} department`,
		title: person.name,
		refNo: `EXT-${person.extension}`,
		dateLine: issuedLine(),
		stamp: "Staff profile",
		blocks: [
			{
				type: "keyvalues",
				items: [
					["Role", person.role],
					["Department", person.department],
					["Qualification", person.qualification],
					["Experience", person.experience],
					["Teaches", person.subjects.join(", ")],
					["Office hours", person.officeHours],
					["Email", person.email],
					["Extension", person.extension],
					["Joined", person.joined]
				]
			},
			{
				type: "heading",
				text: "Profile"
			},
			{
				type: "paragraph",
				text: person.bio
			},
			{ type: "rule" },
			{
				type: "paragraph",
				text: `Appointments outside published office hours may be requested through the school office on ${school.phone}.`
			}
		],
		footNote: `${school.name} · ${school.address}`
	};
}
function facilityBriefDoc(facility) {
	return {
		fileName: `Facility-Brief-${slug(facility.name)}`,
		eyebrow: `${facility.category} facility`,
		title: facility.name,
		refNo: `EEBSS/2083/FAC/${slug(facility.id).toUpperCase()}`,
		dateLine: issuedLine(),
		stamp: "Facility brief",
		blocks: [
			{
				type: "keyvalues",
				items: [
					["Location", facility.block],
					["Open hours", facility.hours],
					["In charge", facility.inCharge],
					["In service since", facility.since]
				]
			},
			{
				type: "heading",
				text: "Description"
			},
			{
				type: "paragraph",
				text: facility.description
			},
			{
				type: "heading",
				text: "At a glance"
			},
			{
				type: "table",
				columns: ["Measure", "Value"],
				rows: facility.stats.map((s) => [s.label, s.value])
			},
			{
				type: "heading",
				text: "What students say"
			},
			{
				type: "paragraph",
				text: facility.studentsLove
			},
			{
				type: "signature",
				name: "Ramesh Kumar Thapa",
				role: "Vice Principal (Administration)"
			}
		],
		footNote: `${school.name} · ${school.address}`
	};
}
function facilityIndexDoc(list) {
	return {
		fileName: "Everest-Campus-Facilities-Index",
		eyebrow: "Campus facilities index",
		title: "Facilities and Infrastructure 2083",
		refNo: "EEBSS/2083/FAC/000",
		dateLine: issuedLine(),
		stamp: "Official",
		blocks: [
			{
				type: "paragraph",
				text: `${list.length} facilities are maintained across the Butwal-8 campus, from laboratories and the central library to residential, sporting and wellbeing provision.`
			},
			{
				type: "table",
				columns: [
					"Facility",
					"Category",
					"Location",
					"Open hours"
				],
				rows: list.map((f) => [
					f.name,
					f.category,
					f.block,
					f.hours
				])
			},
			{
				type: "signature",
				name: school.principal,
				role: "Principal"
			}
		],
		footNote: `${school.name} · ${school.fullAddress}`
	};
}
var INK = [
	20,
	27,
	52
];
var INK_SOFT = [
	96,
	104,
	122
];
var ACCENT = [
	44,
	99,
	89
];
var RULE = [
	206,
	199,
	187
];
var PAPER = [
	243,
	240,
	233
];
var SCHOOL = {
	name: "Everest English Boarding Secondary School",
	address: "Butwal-8, Rupandehi, Lumbini Province, Nepal",
	contact: "+977 71 540 118  ·  info@everestbutwal.edu.np",
	motto: "Climb Higher, Reason Deeper"
};
var PAGE = {
	w: 595.28,
	h: 841.89
};
var M = {
	left: 54,
	right: 54,
	top: 52,
	bottom: 62
};
var CONTENT_W = PAGE.w - M.left - M.right;
function ensureSpace(ctx, needed) {
	if (ctx.y + needed > PAGE.h - M.bottom) {
		ctx.doc.addPage();
		ctx.y = M.top;
		drawRunningHeader(ctx);
	}
}
function drawRunningHeader(ctx) {
	const { doc } = ctx;
	doc.setFont("times", "normal");
	doc.setFontSize(9);
	doc.setTextColor(...INK_SOFT);
	doc.text(SCHOOL.name, M.left, ctx.y);
	doc.setDrawColor(...RULE);
	doc.setLineWidth(.5);
	doc.line(M.left, ctx.y + 7, PAGE.w - M.right, ctx.y + 7);
	ctx.y += 26;
}
function drawMasthead(ctx, meta) {
	const { doc } = ctx;
	doc.setFillColor(...ACCENT);
	doc.rect(M.left, ctx.y, 34, 3, "F");
	ctx.y += 20;
	doc.setFont("times", "bold");
	doc.setFontSize(17);
	doc.setTextColor(...INK);
	doc.text(SCHOOL.name, M.left, ctx.y);
	ctx.y += 15;
	doc.setFont("helvetica", "normal");
	doc.setFontSize(8.5);
	doc.setTextColor(...INK_SOFT);
	doc.text(SCHOOL.address, M.left, ctx.y);
	ctx.y += 11;
	doc.text(SCHOOL.contact, M.left, ctx.y);
	ctx.y += 16;
	doc.setDrawColor(...INK);
	doc.setLineWidth(1.1);
	doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
	ctx.y += 4;
	doc.setDrawColor(...RULE);
	doc.setLineWidth(.5);
	doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
	ctx.y += 28;
	if (meta.stamp) {
		doc.setDrawColor(...ACCENT);
		doc.setLineWidth(.7);
		doc.setFont("helvetica", "bold");
		doc.setFontSize(7.5);
		doc.setCharSpace(1.1);
		const label = meta.stamp.toUpperCase();
		const w = doc.getTextWidth(label) + 18;
		doc.roundedRect(PAGE.w - M.right - w, M.top + 4, w, 18, 9, 9, "S");
		doc.setTextColor(...ACCENT);
		doc.text(label, PAGE.w - M.right - w + 9, M.top + 16);
		doc.setCharSpace(0);
	}
	doc.setFont("helvetica", "bold");
	doc.setFontSize(7.5);
	doc.setTextColor(...ACCENT);
	doc.setCharSpace(1.6);
	doc.text(meta.eyebrow.toUpperCase(), M.left, ctx.y);
	doc.setCharSpace(0);
	ctx.y += 20;
	doc.setFont("times", "bold");
	doc.setFontSize(21);
	doc.setTextColor(...INK);
	doc.splitTextToSize(meta.title, CONTENT_W).forEach((line) => {
		doc.text(line, M.left, ctx.y);
		ctx.y += 24;
	});
	ctx.y += 2;
	const bits = [];
	if (meta.refNo) bits.push(`Ref. ${meta.refNo}`);
	if (meta.dateLine) bits.push(meta.dateLine);
	if (bits.length) {
		doc.setFont("courier", "normal");
		doc.setFontSize(8.5);
		doc.setTextColor(...INK_SOFT);
		doc.text(bits.join("   |   "), M.left, ctx.y);
		ctx.y += 16;
	}
	doc.setDrawColor(...RULE);
	doc.setLineWidth(.5);
	doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
	ctx.y += 22;
}
function renderBlock(ctx, block) {
	const { doc } = ctx;
	switch (block.type) {
		case "heading":
			ensureSpace(ctx, 40);
			doc.setFont("times", "bold");
			doc.setFontSize(12.5);
			doc.setTextColor(...INK);
			doc.text(block.text, M.left, ctx.y);
			ctx.y += 8;
			doc.setDrawColor(...RULE);
			doc.setLineWidth(.5);
			doc.line(M.left, ctx.y, M.left + 42, ctx.y);
			ctx.y += 16;
			break;
		case "paragraph":
			doc.setFont("helvetica", "normal");
			doc.setFontSize(9.5);
			doc.setTextColor(...INK);
			doc.splitTextToSize(block.text, CONTENT_W).forEach((line) => {
				ensureSpace(ctx, 16);
				doc.text(line, M.left, ctx.y);
				ctx.y += 14;
			});
			ctx.y += 8;
			break;
		case "bullets":
		case "checklist": {
			const isCheck = block.type === "checklist";
			block.items.forEach((item) => {
				doc.setFont("helvetica", "normal");
				doc.setFontSize(9.5);
				const lines = doc.splitTextToSize(item, CONTENT_W - 22);
				ensureSpace(ctx, lines.length * 14 + 6);
				if (isCheck) {
					doc.setDrawColor(...INK_SOFT);
					doc.setLineWidth(.6);
					doc.rect(M.left + 1, ctx.y - 7.5, 8.5, 8.5, "S");
				} else {
					doc.setFillColor(...ACCENT);
					doc.circle(M.left + 4, ctx.y - 3.2, 1.6, "F");
				}
				doc.setTextColor(...INK);
				lines.forEach((line, i) => {
					doc.text(line, M.left + 20, ctx.y + i * 14);
				});
				ctx.y += lines.length * 14 + 4;
			});
			ctx.y += 6;
			break;
		}
		case "keyvalues":
			block.items.forEach(([k, v]) => {
				ensureSpace(ctx, 20);
				doc.setFont("helvetica", "bold");
				doc.setFontSize(7.5);
				doc.setTextColor(...INK_SOFT);
				doc.setCharSpace(.9);
				doc.text(k.toUpperCase(), M.left, ctx.y);
				doc.setCharSpace(0);
				doc.setFont("helvetica", "normal");
				doc.setFontSize(9.5);
				doc.setTextColor(...INK);
				const lines = doc.splitTextToSize(v, CONTENT_W - 150);
				lines.forEach((line, i) => doc.text(line, M.left + 150, ctx.y + i * 13));
				ctx.y += Math.max(18, lines.length * 13 + 5);
			});
			ctx.y += 6;
			break;
		case "table": {
			ensureSpace(ctx, 90);
			autoTable(doc, {
				head: [block.columns],
				body: block.rows,
				startY: ctx.y,
				margin: {
					left: M.left,
					right: M.right
				},
				theme: "grid",
				styles: {
					font: "helvetica",
					fontSize: 8.5,
					cellPadding: 6,
					textColor: INK,
					lineColor: RULE,
					lineWidth: .4,
					overflow: "linebreak"
				},
				headStyles: {
					fillColor: PAPER,
					textColor: INK_SOFT,
					fontStyle: "bold",
					fontSize: 7.5
				},
				alternateRowStyles: { fillColor: [
					250,
					249,
					246
				] }
			});
			const last = doc.lastAutoTable;
			ctx.y = (last ? last.finalY : ctx.y) + 14;
			if (block.caption) {
				doc.setFont("courier", "normal");
				doc.setFontSize(7.5);
				doc.setTextColor(...INK_SOFT);
				doc.text(block.caption, M.left, ctx.y);
				ctx.y += 16;
			}
			break;
		}
		case "rule":
			ensureSpace(ctx, 20);
			doc.setDrawColor(...RULE);
			doc.setLineWidth(.5);
			doc.line(M.left, ctx.y, PAGE.w - M.right, ctx.y);
			ctx.y += 18;
			break;
		case "spacer":
			ctx.y += block.size ?? 12;
			break;
		case "signature":
			ensureSpace(ctx, 70);
			ctx.y += 26;
			doc.setDrawColor(...INK_SOFT);
			doc.setLineWidth(.6);
			doc.line(PAGE.w - M.right - 170, ctx.y, PAGE.w - M.right, ctx.y);
			ctx.y += 13;
			doc.setFont("times", "bold");
			doc.setFontSize(10);
			doc.setTextColor(...INK);
			doc.text(block.name, PAGE.w - M.right - 170, ctx.y);
			ctx.y += 12;
			doc.setFont("helvetica", "normal");
			doc.setFontSize(8.5);
			doc.setTextColor(...INK_SOFT);
			doc.text(block.role, PAGE.w - M.right - 170, ctx.y);
			ctx.y += 14;
	}
}
function drawFooters(doc, footNote) {
	const total = doc.getNumberOfPages();
	for (let page = 1; page <= total; page += 1) {
		doc.setPage(page);
		const y = PAGE.h - 38;
		doc.setDrawColor(...RULE);
		doc.setLineWidth(.5);
		doc.line(M.left, y - 12, PAGE.w - M.right, y - 12);
		doc.setFont("helvetica", "normal");
		doc.setFontSize(7.5);
		doc.setTextColor(...INK_SOFT);
		doc.text(footNote ?? SCHOOL.motto, M.left, y);
		doc.setFont("courier", "normal");
		doc.setFontSize(7.5);
		const label = `Page ${page} of ${total}`;
		doc.text(label, PAGE.w - M.right - doc.getTextWidth(label), y);
	}
}
/** Build and download the document. Returns the final filename. */
function downloadOfficialPdf(meta) {
	const doc = new import_jspdf_node_min.jsPDF({
		unit: "pt",
		format: "a4",
		compress: true
	});
	doc.setLineHeightFactor(1.35);
	const ctx = {
		doc,
		y: M.top
	};
	drawMasthead(ctx, meta);
	meta.blocks.forEach((block) => renderBlock(ctx, block));
	drawFooters(doc, meta.footNote);
	const fileName = meta.fileName.endsWith(".pdf") ? meta.fileName : `${meta.fileName}.pdf`;
	doc.save(fileName);
	return fileName;
}
/**
* Download affordance styled as an official document request:
* label, monospaced file metadata, optional authenticity stamp.
*/
var DownloadButton = ({ label, meta, stamp, onDownload, testId, variant = "outline", size = "default", className = "", icon = "download" }) => {
	const [busy, setBusy] = (0, import_react.useState)(false);
	const Icon = icon === "file" ? FileText : Download;
	const handleClick = () => {
		setBusy(true);
		try {
			const fileName = onDownload();
			toast.success("Document prepared", { description: fileName });
		} catch {
			toast.error("Could not prepare the document", { description: "Please try again in a moment." });
		} finally {
			window.setTimeout(() => setBusy(false), 350);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `min-w-0 ${className}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				variant,
				onClick: handleClick,
				disabled: busy,
				"data-testid": testId,
				className: [
					"gap-2 rounded-field font-medium transition-colors duration-fast",
					size === "sm" ? "h-9 px-3 text-[13px]" : "h-11 px-4 text-sm",
					variant === "outline" ? "border-border bg-background hover:bg-secondary" : ""
				].join(" "),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				}), busy ? "Preparing…" : label]
			}), stamp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex items-center rounded-full border border-accent/35 bg-accent/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-accent",
				children: stamp
			}) : null]
		}), meta ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "t-meta mt-2",
			children: meta
		}) : null]
	});
};
//#endregion
export { DownloadButton, academicProspectusDoc, countdownTo, daysUntil, downloadOfficialPdf, facilityBriefDoc, facilityIndexDoc, facultyDirectoryDoc, formatAd, formatNpr, minutesOfDay, noticeDoc, nowMinutes, personProfileDoc, programProspectusDoc, relativeDay, routineDoc, scholarshipChecklistDoc, scholarshipFormDoc, scholarshipIndexDoc, todaySchoolWeekday };
