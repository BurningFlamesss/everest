import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/packages/auth/auth.ts";
import { prisma } from "#/packages/db/index.ts";

function startOfToday() {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

async function attendanceRate(studentId: string) {
	const rows = await prisma.attendanceRecord.groupBy({
		by: ["status"],
		where: { studentId },
		_count: { _all: true },
	});

	const counts = Object.fromEntries(
		rows.map((row) => [row.status, row._count._all]),
	) as Record<string, number>;

	const total = rows.reduce((sum, row) => sum + row._count._all, 0);
	const present = counts.PRESENT ?? 0;

	return {
		total,
		present,
		rate: total > 0 ? Math.round((present / total) * 100) : null,
	};
}

async function dues(studentId: string) {
	const invoices = await prisma.invoice.findMany({
		where: { studentId },
		select: { amount: true, payments: { select: { amount: true } } },
	});

	return invoices.reduce(
		(sum, invoice) =>
			sum +
			(invoice.amount -
				invoice.payments.reduce((inner, payment) => inner + payment.amount, 0)),
		0,
	);
}

async function studentDigest(studentId: string) {
	const [attendance, balance, nextExam] = await Promise.all([
		attendanceRate(studentId),
		dues(studentId),
		prisma.examSchedule.findFirst({
			where: {
				date: { gte: new Date() },
				exam: { isPublished: false },
				course: {
					enrollments: { some: { studentId, status: "ACTIVE" } },
				},
			},
			include: {
				course: { select: { code: true, name: true } },
				exam: { select: { name: true } },
			},
			orderBy: { date: "asc" },
		}),
	]);

	return { attendance, balance, nextExam };
}

export const getDashboardSummaryFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return null;

	const roles = await prisma.userRole.findMany({
		where: { userId: session.user.id },
		select: { role: true },
		orderBy: { createdAt: "asc" },
	});

	const isManagement = roles.some(
		(entry) => entry.role === "ADMIN" || entry.role === "SUPERADMIN",
	);

	if (isManagement) {
		const [pendingInvites, newEnquiries, unpaid, upcomingEvents] =
			await Promise.all([
				prisma.invite.count({
					where: { usedAt: null, expiresAt: { gt: new Date() } },
				}),
				prisma.contactMessage.count({ where: { status: "NEW" } }),
				prisma.invoice.findMany({
					where: { status: { in: ["UNPAID", "PARTIAL"] } },
					select: { amount: true, payments: { select: { amount: true } } },
				}),
				prisma.event.count({
					where: { isPublished: true, startsAt: { gte: new Date() } },
				}),
			]);

		const unpaidTotal = unpaid.reduce(
			(sum, invoice) =>
				sum +
				(invoice.amount -
					invoice.payments.reduce(
						(inner, payment) => inner + payment.amount,
						0,
					)),
			0,
		);

		return {
			role: "ADMIN",
			admin: {
				pendingInvites,
				newEnquiries,
				unpaidTotal,
				upcomingEvents,
			},
		};
	}

	const staff = await prisma.staff.findUnique({
		where: { userId: session.user.id },
		select: { id: true },
	});

	if (staff) {
		const weekday = new Date().getDay() === 0 ? 7 : new Date().getDay();

		const [todaySlots, registers] = await Promise.all([
			prisma.timetableSlot.count({
				where: { staffId: staff.id, weekday },
			}),
			prisma.attendanceSession.count({
				where: {
					takenById: staff.id,
					date: { gte: startOfToday() },
				},
			}),
		]);

		return { role: "STAFF", staff: { todaySlots, registers } };
	}

	const student = await prisma.student.findUnique({
		where: { userId: session.user.id },
		select: { id: true, user: { select: { name: true } } },
	});

	if (student) {
		return {
			role: "STUDENT",
			student: {
				name: student.user.name,
				...(await studentDigest(student.id)),
			},
		};
	}

	const guardian = await prisma.guardian.findUnique({
		where: { userId: session.user.id },
		select: {
			guardianStudents: {
				select: {
					student: {
						select: { id: true, user: { select: { name: true } } },
					},
				},
			},
		},
	});

	if (guardian) {
		const children = await Promise.all(
			guardian.guardianStudents.map(async (entry) => ({
				name: entry.student.user.name,
				...(await studentDigest(entry.student.id)),
			})),
		);

		return { role: "GUARDIAN", children };
	}

	return { role: "USER" as const };
});
