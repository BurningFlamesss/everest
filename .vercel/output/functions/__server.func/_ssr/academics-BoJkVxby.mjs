import { todayKey } from "./format-BBWmN55e.mjs";
import { db, latency, matches, nowIso, persist, uid } from "./db-CgIvOOZs.mjs";
import { recordAudit } from "./audit-CP1EiZ6i.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/academics-BoJkVxby.js
async function listClasses(query = {}) {
	await latency(220);
	const { search = "", grade = "all", branchId = "all", academicYearId = "all" } = query;
	return db().classes.filter((c) => {
		if (!matches(search, c.name, c.roomNo, c.grade)) return false;
		if (grade !== "all" && c.grade !== grade) return false;
		if (branchId !== "all" && c.branchId !== branchId) return false;
		if (academicYearId !== "all" && c.academicYearId !== academicYearId) return false;
		return true;
	});
}
async function getClassDetail(id) {
	await latency(240);
	const cls = db().classes.find((c) => c.id === id);
	if (!cls) return null;
	const students = db().students.filter((s) => s.classId === cls.id);
	const today = todayKey();
	const records = db().attendance.filter((a) => a.classId === cls.id && a.date === today);
	const count = (state) => records.filter((r) => r.state === state).length;
	const present = count("present");
	return {
		cls,
		teacher: db().staff.find((s) => s.id === cls.classTeacherId) ?? null,
		students,
		courses: db().courses.filter((c) => cls.courseIds.includes(c.id)),
		attendance: {
			rate: records.length ? Math.round((present + count("late")) / records.length * 100) : 0,
			present,
			absent: count("absent"),
			late: count("late"),
			excused: count("excused")
		}
	};
}
async function createClass(input, actor) {
	await latency(380);
	const cls = {
		id: uid("cls"),
		name: `${input.grade} · ${input.section}`,
		grade: input.grade,
		section: input.section,
		classTeacherId: input.classTeacherId,
		roomNo: input.roomNo,
		capacity: input.capacity,
		studentCount: 0,
		courseIds: db().courses.filter((c) => !c.isElective).slice(0, 6).map((c) => c.id),
		academicYearId: input.academicYearId,
		branchId: input.branchId,
		schedule: [],
		attendanceRate: 0
	};
	db().classes.push(cls);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "class",
		resourceId: cls.id,
		resourceLabel: cls.name,
		summary: `Created class ${cls.name} in room ${cls.roomNo}`
	});
	return cls;
}
async function listCourses(query = {}) {
	await latency(220);
	const { search = "", department = "all", elective = "all" } = query;
	return db().courses.filter((c) => {
		if (!matches(search, c.name, c.code, c.department)) return false;
		if (department !== "all" && c.department !== department) return false;
		if (elective !== "all" && String(c.isElective) !== elective) return false;
		return true;
	});
}
async function getCourseDetail(id) {
	await latency(220);
	const course = db().courses.find((c) => c.id === id);
	if (!course) return null;
	return {
		course,
		teachers: db().staff.filter((s) => course.teacherIds.includes(s.id)),
		classes: db().classes.filter((c) => course.classIds.includes(c.id))
	};
}
async function createCourse(input, actor) {
	await latency(380);
	const course = {
		id: uid("crs"),
		...input,
		classIds: [],
		syllabus: [],
		createdAt: nowIso()
	};
	db().courses.unshift(course);
	persist();
	recordAudit({
		actor,
		action: "created",
		resourceType: "course",
		resourceId: course.id,
		resourceLabel: course.name,
		summary: `Created subject ${course.name} (${course.code})`
	});
	return course;
}
function courseDepartments() {
	return Array.from(new Set(db().courses.map((c) => c.department))).sort();
}
async function getClassRegister(classId, date) {
	await latency(240);
	const cls = db().classes.find((c) => c.id === classId);
	if (!cls) return null;
	const students = db().students.filter((s) => s.classId === classId && s.status === "active");
	const records = db().attendance.filter((a) => a.classId === classId && a.date === date);
	return {
		cls,
		date,
		entries: students.sort((a, b) => a.rollNo - b.rollNo).map((student) => {
			const record = records.find((r) => r.personId === student.id);
			return {
				student,
				state: record?.state ?? null,
				note: record?.note
			};
		}),
		marked: records.length > 0,
		markedBy: records[0]?.markedBy,
		markedAt: records[0]?.markedAt
	};
}
async function saveClassRegister(classId, date, entries, actor) {
	await latency(460);
	const cls = db().classes.find((c) => c.id === classId);
	if (!cls) throw new Error("Class not found");
	const collection = db().attendance;
	entries.forEach((entry) => {
		const existing = collection.find((a) => a.personId === entry.studentId && a.date === date && a.personType === "student");
		if (existing) {
			existing.state = entry.state;
			existing.note = entry.note;
			existing.markedBy = actor.name;
			existing.markedAt = nowIso();
		} else collection.push({
			id: uid("att"),
			date,
			personType: "student",
			personId: entry.studentId,
			classId,
			state: entry.state,
			note: entry.note,
			markedBy: actor.name,
			markedAt: nowIso()
		});
	});
	db().students.filter((s) => s.classId === classId).forEach((s) => {
		const own = collection.filter((a) => a.personId === s.id && a.personType === "student");
		if (own.length) {
			const good = own.filter((a) => a.state === "present" || a.state === "late").length;
			s.attendanceRate = Math.round(good / own.length * 100);
		}
	});
	const dayRecords = collection.filter((a) => a.classId === classId && a.date === date);
	const good = dayRecords.filter((a) => a.state === "present" || a.state === "late").length;
	cls.attendanceRate = dayRecords.length ? Math.round(good / dayRecords.length * 100) : cls.attendanceRate;
	persist();
	recordAudit({
		actor,
		action: "marked_attendance",
		resourceType: "class",
		resourceId: classId,
		resourceLabel: cls.name,
		summary: `Marked attendance for ${cls.name} (${entries.length} students)`
	});
	return entries.length;
}
async function getAttendanceOverview(date = todayKey()) {
	await latency(280);
	const activeStudents = db().students.filter((s) => s.status === "active");
	const records = db().attendance.filter((a) => a.date === date && a.personType === "student");
	const count = (state) => records.filter((r) => r.state === state).length;
	const present = count("present");
	const late = count("late");
	const classes = db().classes.map((cls) => {
		const own = records.filter((r) => r.classId === cls.id);
		const total = activeStudents.filter((s) => s.classId === cls.id).length;
		const p = own.filter((r) => r.state === "present").length;
		const l = own.filter((r) => r.state === "late").length;
		return {
			cls,
			marked: own.length > 0,
			present: p,
			absent: own.filter((r) => r.state === "absent").length,
			late: l,
			excused: own.filter((r) => r.state === "excused").length,
			total,
			rate: own.length ? Math.round((p + l) / own.length * 100) : 0
		};
	});
	return {
		date,
		total: activeStudents.length,
		present,
		absent: count("absent"),
		late,
		excused: count("excused"),
		unmarked: Math.max(0, activeStudents.length - records.length),
		rate: records.length ? Math.round((present + late) / records.length * 1e3) / 10 : 0,
		classes
	};
}
async function getAttendanceTrend() {
	await latency(200);
	return db().attendanceTrend;
}
async function getStaffRegister(date = todayKey()) {
	await latency(240);
	const records = db().attendance.filter((a) => a.date === date && a.personType === "staff");
	return db().staff.filter((s) => s.employmentStatus === "active").map((staff) => ({
		staff,
		state: records.find((r) => r.personId === staff.id)?.state ?? null
	}));
}
async function saveStaffRegister(date, entries, actor) {
	await latency(420);
	const collection = db().attendance;
	entries.forEach((entry) => {
		const existing = collection.find((a) => a.personId === entry.staffId && a.date === date && a.personType === "staff");
		if (existing) {
			existing.state = entry.state;
			existing.markedBy = actor.name;
			existing.markedAt = nowIso();
		} else collection.push({
			id: uid("att"),
			date,
			personType: "staff",
			personId: entry.staffId,
			state: entry.state,
			markedBy: actor.name,
			markedAt: nowIso()
		});
	});
	persist();
	recordAudit({
		actor,
		action: "marked_attendance",
		resourceType: "staff",
		resourceId: "bulk",
		resourceLabel: `${entries.length} staff`,
		summary: `Marked staff attendance for ${entries.length} employees`
	});
	return entries.length;
}
async function getStudentAttendance(studentId) {
	await latency(220);
	const records = db().attendance.filter((a) => a.personId === studentId && a.personType === "student").sort((a, b) => a.date < b.date ? 1 : -1);
	const count = (state) => records.filter((r) => r.state === state).length;
	const present = count("present");
	const late = count("late");
	return {
		rate: records.length ? Math.round((present + late) / records.length * 100) : 0,
		present,
		absent: count("absent"),
		late,
		excused: count("excused"),
		records
	};
}
async function getAttendanceStats() {
	await latency(300);
	return {
		byGrade: Array.from(new Set(db().classes.map((c) => c.grade))).map((grade) => {
			const students = db().students.filter((s) => s.grade === grade && s.status === "active");
			return {
				grade,
				rate: students.length ? Math.round(students.reduce((sum, s) => sum + s.attendanceRate, 0) / students.length) : 0,
				students: students.length
			};
		}),
		chronic: db().students.filter((s) => s.status === "active" && s.attendanceRate < 82).sort((a, b) => a.attendanceRate - b.attendanceRate).slice(0, 8).map((student) => ({
			student,
			rate: student.attendanceRate
		})),
		weekly: db().attendanceTrend.slice(-5).map((point) => ({
			day: new Date(point.date).toLocaleDateString(void 0, { weekday: "short" }),
			rate: point.rate
		}))
	};
}
//#endregion
export { courseDepartments, createClass, createCourse, getAttendanceOverview, getAttendanceStats, getAttendanceTrend, getClassDetail, getClassRegister, getCourseDetail, getStaffRegister, getStudentAttendance, listClasses, listCourses, saveClassRegister, saveStaffRegister };
