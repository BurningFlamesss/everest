import { avatarFor } from "./format-BBWmN55e.mjs";
import { db, latency, matches, nowIso, paginate, persist, sortRows, uid } from "./db-CgIvOOZs.mjs";
import { recordAudit } from "./audit-CP1EiZ6i.mjs";
import { pushNotification } from "./notifications-CeHCmL3l.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/staff---BJ4xh4.js
var name = (s) => `${s.firstName} ${s.lastName}`;
async function listStaff(query = {}) {
	await latency();
	const { search = "", department = "all", designation = "all", employmentStatus = "all", branchId = "all", sort = "firstName", dir = "asc", page = 1, pageSize = 10 } = query;
	const filtered = db().staff.filter((s) => {
		if (!matches(search, name(s), s.employeeId, s.email, s.designation)) return false;
		if (department !== "all" && s.department !== department) return false;
		if (designation !== "all" && s.designation !== designation) return false;
		if (employmentStatus !== "all" && s.employmentStatus !== employmentStatus) return false;
		if (branchId !== "all" && s.branchId !== branchId) return false;
		return true;
	});
	return paginate(sortRows(filtered, sort, dir), page, pageSize);
}
async function getStaff(id) {
	await latency(200);
	return db().staff.find((s) => s.id === id) ?? null;
}
function staffFilterOptions() {
	const staff = db().staff;
	return {
		departments: Array.from(new Set(staff.map((s) => s.department))).sort(),
		designations: Array.from(new Set(staff.map((s) => s.designation))).sort(),
		branches: db().branches.map((b) => ({
			value: b.id,
			label: b.name
		}))
	};
}
async function createStaff(input, actor) {
	await latency(440);
	const full = `${input.firstName} ${input.lastName}`;
	const member = {
		id: uid("stf"),
		employeeId: `EMP-${String(1e3 + db().staff.length * 7).slice(-4)}`,
		firstName: input.firstName.trim(),
		lastName: input.lastName.trim(),
		avatarUrl: avatarFor(full),
		gender: input.gender,
		email: input.email.trim().toLowerCase(),
		phone: input.phone,
		department: input.department,
		designation: input.designation,
		employmentStatus: "probation",
		employmentType: input.employmentType,
		joiningDate: input.joiningDate,
		branchId: input.branchId,
		role: input.role,
		qualification: input.qualification,
		experienceYears: 0,
		address: "—",
		dateOfBirth: "—",
		assignedClassIds: [],
		assignedCourseIds: [],
		attendanceRate: 100,
		isClassTeacher: false,
		documents: [],
		createdAt: nowIso(),
		updatedAt: nowIso()
	};
	db().staff.unshift(member);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "staff",
		resourceId: member.id,
		resourceLabel: full,
		summary: `Added ${full} as ${member.designation} · ${member.department}`
	});
	return member;
}
async function setStaffStatus(id, status, actor) {
	await latency(320);
	const member = db().staff.find((s) => s.id === id);
	if (!member) throw new Error("Staff member not found");
	member.employmentStatus = status;
	member.updatedAt = nowIso();
	const account = db().users.find((u) => u.profileId === member.id);
	if (account && (status === "terminated" || status === "retired")) account.accountStatus = "deactivated";
	persist();
	recordAudit({
		actor,
		action: "status_changed",
		resourceType: "staff",
		resourceId: member.id,
		resourceLabel: name(member),
		summary: `Set ${name(member)}’s employment status to ${status.replace(/_/g, " ")}`
	});
	return member;
}
async function changeStaffRole(id, role, actor) {
	await latency(300);
	const member = db().staff.find((s) => s.id === id);
	if (!member) throw new Error("Staff member not found");
	member.role = role;
	member.updatedAt = nowIso();
	const account = db().users.find((u) => u.profileId === member.id);
	if (account) account.role = role;
	persist();
	recordAudit({
		actor,
		action: "updated",
		resourceType: "user",
		resourceId: member.id,
		resourceLabel: name(member),
		summary: `Changed ${name(member)}’s application role to ${role.replace(/_/g, " ")}`
	});
	return member;
}
async function inviteStaff(id, actor) {
	await latency(400);
	const member = db().staff.find((s) => s.id === id);
	if (!member) throw new Error("Staff member not found");
	const existing = db().users.find((u) => u.email === member.email);
	if (existing) {
		existing.accountStatus = "invited";
		existing.invitationStatus = "pending";
		existing.invitedAt = nowIso();
		existing.invitationExpiresAt = new Date(Date.now() + 6048e5).toISOString();
	} else db().users.unshift({
		id: uid("usr"),
		name: name(member),
		email: member.email,
		avatarUrl: member.avatarUrl,
		role: member.role,
		profileType: "staff",
		profileId: member.id,
		profileLabel: `${member.designation} · ${member.department}`,
		accountStatus: "invited",
		invitationStatus: "pending",
		invitedAt: nowIso(),
		invitationExpiresAt: new Date(Date.now() + 6048e5).toISOString(),
		emailVerified: false,
		branchId: member.branchId,
		createdAt: nowIso()
	});
	persist();
	recordAudit({
		actor,
		action: "invited",
		resourceType: "user",
		resourceId: member.id,
		resourceLabel: name(member),
		summary: `Sent an account invitation to ${name(member)}`
	});
	pushNotification({
		kind: "invitation",
		title: "Staff invitation sent",
		body: `${name(member)} was invited to activate their account.`,
		severity: "info",
		href: "/users",
		actorName: actor.name
	});
	return member;
}
function staffDirectorySummary() {
	const staff = db().staff;
	return {
		total: staff.length,
		active: staff.filter((s) => s.employmentStatus === "active").length,
		onLeave: staff.filter((s) => s.employmentStatus === "on_leave").length,
		departments: new Set(staff.map((s) => s.department)).size
	};
}
//#endregion
export { changeStaffRole, createStaff, getStaff, inviteStaff, listStaff, setStaffStatus, staffDirectorySummary, staffFilterOptions };
