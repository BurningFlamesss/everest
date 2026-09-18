import { avatarFor, todayKey } from "./format-BBWmN55e.mjs";
import { db, latency, matches, nowIso, paginate, persist, uid } from "./db-CgIvOOZs.mjs";
import { recordAudit } from "./audit-CP1EiZ6i.mjs";
import { pushNotification } from "./notifications-CeHCmL3l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/operations-gGGfOgxw.js
async function listApplications(query = {}) {
	await latency(240);
	const { search = "", status = "all", grade = "all", source = "all", page = 1, pageSize = 10 } = query;
	const filtered = db().applications.filter((a) => {
		if (!matches(search, a.applicantName, a.applicationNo, a.guardian.name)) return false;
		if (status !== "all" && a.status !== status) return false;
		if (grade !== "all" && a.gradeApplied !== grade) return false;
		if (source !== "all" && a.source !== source) return false;
		return true;
	}).sort((a, b) => a.submittedAt < b.submittedAt ? 1 : -1);
	return paginate(filtered, page, pageSize);
}
async function getApplication(id) {
	await latency(200);
	return db().applications.find((a) => a.id === id) ?? null;
}
var STATUS_TONE = {
	pending: "neutral",
	accepted: "positive",
	converted: "positive",
	rejected: "negative",
	waitlisted: "accent"
};
async function setApplicationStatus(id, status, actor, reason) {
	await latency(380);
	const app = db().applications.find((a) => a.id === id);
	if (!app) throw new Error("Application not found");
	app.status = status;
	app.timeline.push({
		id: uid("tl"),
		label: `Application ${status}`,
		description: reason || `Status changed to ${status} by ${actor.name}.`,
		actor: actor.name,
		at: nowIso(),
		tone: STATUS_TONE[status]
	});
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "application",
		resourceId: app.id,
		resourceLabel: app.applicantName,
		summary: `Marked ${app.applicantName}’s application as ${status}`
	});
	pushNotification({
		kind: "admission",
		title: `Application ${status}`,
		body: `${app.applicantName} · ${app.gradeApplied}`,
		severity: status === "rejected" ? "warning" : "success",
		href: `/admissions/${app.id}`,
		actorName: actor.name
	});
	return app;
}
async function addApplicationNote(id, text, actor) {
	await latency(280);
	const app = db().applications.find((a) => a.id === id);
	if (!app) throw new Error("Application not found");
	app.notes.unshift({
		id: uid("apn"),
		author: actor.name,
		text,
		createdAt: nowIso()
	});
	persist();
	return app;
}
async function requestApplicationInfo(id, message, actor) {
	await latency(360);
	const app = db().applications.find((a) => a.id === id);
	if (!app) throw new Error("Application not found");
	app.timeline.push({
		id: uid("tl"),
		label: "Information requested",
		description: message,
		actor: actor.name,
		at: nowIso(),
		tone: "accent"
	});
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "application",
		resourceId: app.id,
		resourceLabel: app.applicantName,
		summary: `Requested additional information from ${app.guardian.name}`
	});
	return app;
}
async function convertApplicant(id, classId, actor) {
	await latency(620);
	const app = db().applications.find((a) => a.id === id);
	const cls = db().classes.find((c) => c.id === classId);
	if (!app || !cls) throw new Error("Application or class not found");
	const [firstName, ...rest] = app.applicantName.split(" ");
	const lastName = rest.join(" ") || "—";
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const student = {
		id: uid("stu"),
		admissionNo: `NFA-${year}-${String(1e3 + db().students.length + 1).slice(-4)}`,
		firstName,
		lastName,
		avatarUrl: app.avatarUrl || avatarFor(app.applicantName),
		gender: app.gender,
		dateOfBirth: app.dateOfBirth,
		grade: cls.grade,
		section: cls.section,
		classId: cls.id,
		rollNo: db().students.filter((s) => s.classId === cls.id).length + 1,
		branchId: app.branchId,
		admissionYear: year,
		admissionDate: todayKey(),
		status: "active",
		email: app.email,
		phone: app.phone,
		address: app.address,
		city: "Northfield",
		bloodGroup: "O+",
		nationality: "American",
		guardian: app.guardian,
		emergencyContact: app.guardian.phone,
		houseName: [
			"Aurora",
			"Meridian",
			"Summit",
			"Vanguard"
		][db().students.length % 4],
		attendanceRate: 100,
		feeBalance: 0,
		documents: app.documents,
		createdAt: nowIso(),
		updatedAt: nowIso()
	};
	db().students.unshift(student);
	app.status = "converted";
	app.convertedStudentId = student.id;
	app.timeline.push({
		id: uid("tl"),
		label: "Converted to student",
		description: `Enrolled into ${cls.name} with admission number ${student.admissionNo}.`,
		actor: actor.name,
		at: nowIso(),
		tone: "positive"
	});
	db().classes.forEach((c) => {
		c.studentCount = db().students.filter((s) => s.classId === c.id && s.status === "active").length;
	});
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "student",
		resourceId: student.id,
		resourceLabel: app.applicantName,
		summary: `Converted applicant ${app.applicantName} into a student in ${cls.name}`
	});
	pushNotification({
		kind: "admission",
		title: "Applicant enrolled",
		body: `${app.applicantName} is now a student in ${cls.name}.`,
		severity: "success",
		href: `/students/${student.id}`,
		actorName: actor.name
	});
	return {
		application: app,
		student
	};
}
async function listRoutes(search = "") {
	await latency(220);
	return db().routes.filter((r) => matches(search, r.name, r.code));
}
async function listVehicles(search = "") {
	await latency(220);
	return db().vehicles.filter((v) => matches(search, v.code, v.regNo, v.model));
}
async function listInvoices(query = {}) {
	await latency(240);
	const { search = "", status = "all", grade = "all", page = 1, pageSize = 10 } = query;
	const filtered = db().invoices.filter((i) => {
		if (!matches(search, i.studentName, i.invoiceNo)) return false;
		if (status !== "all" && i.status !== status) return false;
		if (grade !== "all" && i.grade !== grade) return false;
		return true;
	}).sort((a, b) => a.dueDate < b.dueDate ? -1 : 1);
	return paginate(filtered, page, pageSize);
}
async function listPayments(query = {}) {
	await latency(240);
	const { search = "", method = "all", status = "all", page = 1, pageSize = 10 } = query;
	const filtered = db().payments.filter((p) => {
		if (!matches(search, p.studentName, p.receiptNo, p.reference, p.invoiceNo)) return false;
		if (method !== "all" && p.method !== method) return false;
		if (status !== "all" && p.status !== status) return false;
		return true;
	}).sort((a, b) => a.paidAt < b.paidAt ? 1 : -1);
	return paginate(filtered, page, pageSize);
}
async function listFeeStructures() {
	await latency(200);
	return db().feeStructures;
}
function paymentsSummary() {
	const invoices = db().invoices;
	const billed = invoices.reduce((sum, i) => sum + i.amount, 0);
	const collected = invoices.reduce((sum, i) => sum + i.amountPaid, 0);
	const overdue = invoices.filter((i) => i.status === "overdue");
	return {
		billed,
		collected,
		outstanding: billed - collected,
		collectionRate: billed ? Math.round(collected / billed * 100) : 0,
		overdueCount: overdue.length,
		overdueAmount: overdue.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0),
		paidCount: invoices.filter((i) => i.status === "paid").length,
		partialCount: invoices.filter((i) => i.status === "partial").length,
		unpaidCount: invoices.filter((i) => i.status === "unpaid" || i.status === "overdue").length
	};
}
async function studentBalances(limit = 8) {
	await latency(220);
	return db().students.filter((s) => s.feeBalance > 0).sort((a, b) => b.feeBalance - a.feeBalance).slice(0, limit);
}
async function recordPayment(invoiceId, amount, method, reference, actor) {
	await latency(480);
	const invoice = db().invoices.find((i) => i.id === invoiceId);
	if (!invoice) throw new Error("Invoice not found");
	invoice.amountPaid = Math.min(invoice.amount, invoice.amountPaid + amount);
	invoice.status = invoice.amountPaid >= invoice.amount ? "paid" : "partial";
	const student = db().students.find((s) => s.id === invoice.studentId);
	if (student) student.feeBalance = invoice.amount - invoice.amountPaid;
	const payment = {
		id: uid("pay"),
		receiptNo: `RCP-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(5e3 + db().payments.length)}`,
		invoiceId: invoice.id,
		invoiceNo: invoice.invoiceNo,
		studentId: invoice.studentId,
		studentName: invoice.studentName,
		amount,
		method,
		reference: reference || `MANUAL-${Date.now().toString().slice(-6)}`,
		status: "succeeded",
		paidAt: nowIso(),
		recordedBy: actor.name
	};
	db().payments.unshift(payment);
	persist();
	recordAudit({
		actor,
		action: "recorded_payment",
		resourceType: "invoice",
		resourceId: invoice.id,
		resourceLabel: invoice.invoiceNo,
		summary: `Recorded a payment of ${amount} for ${invoice.studentName} (${invoice.invoiceNo})`
	});
	pushNotification({
		kind: "payment",
		title: "Payment recorded",
		body: `${invoice.studentName} · ${invoice.invoiceNo}`,
		severity: "success",
		href: "/payments",
		actorName: actor.name
	});
	return payment;
}
async function createApplication(input, actor) {
	await latency(460);
	const year = (/* @__PURE__ */ new Date()).getFullYear();
	const application = {
		id: uid("app"),
		applicationNo: `ADM-${year}-${String(100 + db().applications.length)}`,
		applicantName: input.applicantName,
		avatarUrl: avatarFor(input.applicantName),
		gradeApplied: input.gradeApplied,
		status: "pending",
		submittedAt: nowIso(),
		dateOfBirth: input.dateOfBirth,
		gender: input.gender,
		email: input.email,
		phone: input.phone,
		address: input.address,
		guardian: {
			id: uid("gdn"),
			name: input.guardianName,
			relation: input.guardianRelation,
			phone: input.guardianPhone,
			email: input.guardianEmail
		},
		previousSchool: input.previousSchool,
		previousGrade: input.previousGrade,
		entranceScore: input.entranceScore,
		branchId: input.branchId,
		source: input.source,
		documents: [],
		notes: [],
		timeline: [{
			id: uid("tl"),
			label: "Application created",
			description: `Recorded by ${actor.name} (${input.source.replace(/_/g, " ")}).`,
			actor: actor.name,
			at: nowIso(),
			tone: "neutral"
		}]
	};
	db().applications.unshift(application);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "application",
		resourceId: application.id,
		resourceLabel: application.applicantName,
		summary: `Created application ${application.applicationNo} for ${application.gradeApplied}`
	});
	pushNotification({
		kind: "admission",
		title: "New application",
		body: `${application.applicantName} · ${application.gradeApplied}`,
		severity: "info",
		href: `/admissions/${application.id}`,
		actorName: actor.name
	});
	return application;
}
async function updateApplication(id, patch, actor) {
	await latency(340);
	const app = db().applications.find((a) => a.id === id);
	if (!app) throw new Error("Application not found");
	Object.assign(app, patch);
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "application",
		resourceId: app.id,
		resourceLabel: app.applicantName,
		summary: `Updated application ${app.applicationNo}`
	});
	return app;
}
async function deleteApplication(id, actor) {
	await latency(340);
	const app = db().applications.find((a) => a.id === id);
	if (!app) throw new Error("Application not found");
	db().applications = db().applications.filter((a) => a.id !== id);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "application",
		resourceId: id,
		resourceLabel: app.applicantName,
		summary: `Deleted application ${app.applicationNo}`
	});
}
function applicationFilterOptions() {
	const apps = db().applications;
	return {
		grades: Array.from(new Set(apps.map((a) => a.gradeApplied))).sort(),
		sources: Array.from(new Set(apps.map((a) => a.source))).sort()
	};
}
async function createFeeStructure(input, actor) {
	await latency(420);
	const structure = {
		id: uid("fee"),
		...input,
		amount: input.components.reduce((sum, c) => sum + c.amount, 0),
		active: true
	};
	db().feeStructures.push(structure);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "fee_structure",
		resourceId: structure.id,
		resourceLabel: structure.name,
		summary: `Created fee structure ${structure.name}`
	});
	return structure;
}
async function updateFeeStructure(id, patch, actor) {
	await latency(360);
	const structure = db().feeStructures.find((f) => f.id === id);
	if (!structure) throw new Error("Fee structure not found");
	Object.assign(structure, patch);
	if (patch.components) structure.amount = patch.components.reduce((sum, c) => sum + c.amount, 0);
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "fee_structure",
		resourceId: structure.id,
		resourceLabel: structure.name,
		summary: `Updated fee structure ${structure.name}`
	});
	return structure;
}
async function deleteFeeStructure(id, actor) {
	await latency(320);
	const structure = db().feeStructures.find((f) => f.id === id);
	if (!structure) throw new Error("Fee structure not found");
	db().feeStructures = db().feeStructures.filter((f) => f.id !== id);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "fee_structure",
		resourceId: id,
		resourceLabel: structure.name,
		summary: `Deleted fee structure ${structure.name}`
	});
}
async function createInvoice(input, actor) {
	await latency(460);
	const student = db().students.find((s) => s.id === input.studentId);
	if (!student) throw new Error("Student not found");
	const invoice = {
		id: uid("inv"),
		invoiceNo: `INV-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(2e3 + db().invoices.length)}`,
		studentId: student.id,
		studentName: `${student.firstName} ${student.lastName}`,
		studentAvatar: student.avatarUrl,
		grade: student.grade,
		feeStructureId: input.feeStructureId,
		term: input.term,
		amount: input.amount,
		amountPaid: 0,
		issuedDate: todayKey(),
		dueDate: input.dueDate,
		status: "unpaid"
	};
	db().invoices.unshift(invoice);
	student.feeBalance += input.amount;
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "invoice",
		resourceId: invoice.id,
		resourceLabel: invoice.invoiceNo,
		summary: `Issued ${invoice.invoiceNo} to ${invoice.studentName}`
	});
	return invoice;
}
async function voidInvoice(id, actor) {
	await latency(360);
	const invoice = db().invoices.find((i) => i.id === id);
	if (!invoice) throw new Error("Invoice not found");
	invoice.status = "void";
	const student = db().students.find((s) => s.id === invoice.studentId);
	if (student) student.feeBalance = Math.max(0, student.feeBalance - (invoice.amount - invoice.amountPaid));
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "invoice",
		resourceId: invoice.id,
		resourceLabel: invoice.invoiceNo,
		summary: `Voided ${invoice.invoiceNo}`
	});
	return invoice;
}
async function deleteInvoice(id, actor) {
	await latency(320);
	const invoice = db().invoices.find((i) => i.id === id);
	if (!invoice) throw new Error("Invoice not found");
	db().invoices = db().invoices.filter((i) => i.id !== id);
	db().payments = db().payments.filter((p) => p.invoiceId !== id);
	persist();
	recordAudit({
		actor,
		action: "deleted",
		resourceType: "invoice",
		resourceId: id,
		resourceLabel: invoice.invoiceNo,
		summary: `Deleted ${invoice.invoiceNo}`
	});
}
async function refundPayment(id, actor) {
	await latency(420);
	const payment = db().payments.find((p) => p.id === id);
	if (!payment) throw new Error("Receipt not found");
	payment.status = "refunded";
	const invoice = db().invoices.find((i) => i.id === payment.invoiceId);
	if (invoice) {
		invoice.amountPaid = Math.max(0, invoice.amountPaid - payment.amount);
		invoice.status = invoice.amountPaid <= 0 ? "unpaid" : "partial";
		const student = db().students.find((s) => s.id === invoice.studentId);
		if (student) student.feeBalance = invoice.amount - invoice.amountPaid;
	}
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "payment",
		resourceId: payment.id,
		resourceLabel: payment.receiptNo,
		summary: `Refunded ${payment.receiptNo} for ${payment.studentName}`
	});
	return payment;
}
var MONTH_LABELS = [
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
async function getPaymentsAnalytics() {
	await latency(300);
	const invoices = db().invoices;
	const payments = db().payments;
	const months = [];
	const cursor = /* @__PURE__ */ new Date();
	cursor.setDate(1);
	for (let i = 5; i >= 0; i -= 1) {
		const date = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
		months.push({
			key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
			month: MONTH_LABELS[date.getMonth()]
		});
	}
	const collections = months.map(({ key, month }) => ({
		month,
		collected: payments.filter((p) => p.status === "succeeded" && p.paidAt.slice(0, 7) === key).reduce((sum, p) => sum + p.amount, 0),
		billed: invoices.filter((i) => i.issuedDate.slice(0, 7) === key).reduce((sum, i) => sum + i.amount, 0)
	}));
	const byGrade = Array.from(new Set(invoices.map((i) => i.grade))).sort().map((grade) => {
		const own = invoices.filter((i) => i.grade === grade);
		const billed = own.reduce((sum, i) => sum + i.amount, 0);
		const collected = own.reduce((sum, i) => sum + i.amountPaid, 0);
		return {
			grade,
			billed,
			collected,
			rate: billed ? Math.round(collected / billed * 100) : 0
		};
	});
	const today = /* @__PURE__ */ new Date();
	const ageing = [
		{
			bucket: "Due soon",
			min: -9999,
			max: 0
		},
		{
			bucket: "1–15 days",
			min: 1,
			max: 15
		},
		{
			bucket: "16–30 days",
			min: 16,
			max: 30
		},
		{
			bucket: "31+ days",
			min: 31,
			max: 9999
		}
	].map(({ bucket, min, max }) => {
		const rows = invoices.filter((i) => {
			if (i.status === "paid" || i.status === "void") return false;
			const days = Math.round((today.getTime() - new Date(i.dueDate).getTime()) / 864e5);
			return days >= min && days <= max;
		});
		return {
			bucket,
			count: rows.length,
			amount: rows.reduce((sum, i) => sum + (i.amount - i.amountPaid), 0)
		};
	});
	const methodLabels = {
		card: "Card",
		bank_transfer: "Bank transfer",
		cash: "Cash",
		cheque: "Cheque",
		wallet: "Wallet"
	};
	return {
		collections,
		byGrade,
		ageing,
		methods: Object.keys(methodLabels).map((method) => {
			const rows = payments.filter((p) => p.method === method && p.status !== "refunded");
			return {
				method,
				label: methodLabels[method],
				count: rows.length,
				amount: rows.reduce((sum, p) => sum + p.amount, 0)
			};
		})
	};
}
function invoiceFilterOptions() {
	return {
		grades: Array.from(new Set(db().invoices.map((i) => i.grade))).sort(),
		terms: Array.from(new Set(db().invoices.map((i) => i.term))).sort()
	};
}
/** Everything the invoice detail + checkout screens need in one read. */
async function getInvoiceDetail(id) {
	await latency(220);
	const invoice = db().invoices.find((i) => i.id === id);
	if (!invoice) return null;
	return {
		invoice,
		student: db().students.find((s) => s.id === invoice.studentId) ?? null,
		structure: db().feeStructures.find((f) => f.id === invoice.feeStructureId) ?? null,
		payments: db().payments.filter((p) => p.invoiceId === invoice.id).sort((a, b) => a.paidAt < b.paidAt ? 1 : -1)
	};
}
//#endregion
export { addApplicationNote, applicationFilterOptions, convertApplicant, createApplication, createFeeStructure, createInvoice, deleteApplication, deleteFeeStructure, deleteInvoice, getApplication, getInvoiceDetail, getPaymentsAnalytics, invoiceFilterOptions, listApplications, listFeeStructures, listInvoices, listPayments, listRoutes, listVehicles, paymentsSummary, recordPayment, refundPayment, requestApplicationInfo, setApplicationStatus, studentBalances, updateApplication, updateFeeStructure, voidInvoice };
