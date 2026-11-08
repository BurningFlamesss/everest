import { prisma } from "#/packages/db/index.ts";

export async function listFeeStructures(termId?: string) {
	return prisma.feeStructure.findMany({
		where: termId ? { termId } : undefined,
		include: {
			term: {
				select: { name: true, academicYear: { select: { name: true } } },
			},
			_count: { select: { invoices: true } },
		},
		orderBy: { dueDate: "asc" },
	});
}

export async function createFeeStructure(input: {
	termId: string;
	name: string;
	grade?: string;
	section?: string;
	amount: number;
	dueDate: Date;
}) {
	if (!Number.isInteger(input.amount) || input.amount < 0) {
		throw new Error("Enter the amount in whole currency units.");
	}

	return prisma.feeStructure.create({
		data: {
			termId: input.termId,
			name: input.name.trim(),
			grade: input.grade?.trim() || null,
			section: input.section?.trim() || null,
			amount: input.amount,
			dueDate: input.dueDate,
		},
	});
}

export async function deleteFeeStructure(id: string) {
	const invoices = await prisma.invoice.count({
		where: { feeStructureId: id },
	});

	if (invoices > 0) {
		throw new Error(
			"This fee structure already has invoices and cannot be deleted.",
		);
	}

	return prisma.feeStructure.delete({ where: { id } });
}

/** Issues an invoice for every active student matching the structure. */
export async function generateInvoices(feeStructureId: string) {
	const structure = await prisma.feeStructure.findUnique({
		where: { id: feeStructureId },
	});

	if (!structure) throw new Error("FEE_STRUCTURE_NOT_FOUND");

	const students = await prisma.student.findMany({
		where: {
			status: "ACTIVE",
			...(structure.grade ? { grade: structure.grade } : {}),
			...(structure.section ? { section: structure.section } : {}),
		},
		select: { id: true },
	});

	if (students.length === 0) return 0;

	const result = await prisma.invoice.createMany({
		data: students.map((student) => ({
			studentId: student.id,
			termId: structure.termId,
			feeStructureId: structure.id,
			amount: structure.amount,
			dueDate: structure.dueDate,
		})),
		skipDuplicates: true,
	});

	return result.count;
}

export async function listInvoices(options?: {
	status?: string;
	search?: string;
}) {
	const search = options?.search?.trim();

	return prisma.invoice.findMany({
		where: {
			...(options?.status ? { status: options.status as "UNPAID" } : {}),
			...(search
				? {
						student: {
							user: {
								OR: [
									{ name: { contains: search, mode: "insensitive" as const } },
									{ email: { contains: search, mode: "insensitive" as const } },
								],
							},
						},
					}
				: {}),
		},
		include: {
			student: {
				select: { id: true, user: { select: { name: true, email: true } } },
			},
			term: { select: { name: true } },
			feeStructure: { select: { name: true } },
			payments: {
				include: {
					receivedBy: { select: { user: { select: { name: true } } } },
				},
				orderBy: { paidAt: "desc" },
			},
		},
		orderBy: [{ status: "asc" }, { dueDate: "asc" }],
		take: 300,
	});
}

/**
 * Records a payment and recomputes the invoice status atomically. Overpayment
 * is rejected so the ledger always matches the invoice amount.
 */
export async function recordPayment(input: {
	invoiceId: string;
	amount: number;
	method: string;
	reference?: string;
	receivedById?: string | null;
}) {
	if (!Number.isInteger(input.amount) || input.amount <= 0) {
		throw new Error("Enter a payment amount greater than zero.");
	}

	return prisma.$transaction(async (tx) => {
		const invoice = await tx.invoice.findUnique({
			where: { id: input.invoiceId },
			include: { payments: { select: { amount: true } } },
		});

		if (!invoice) throw new Error("INVOICE_NOT_FOUND");

		const paid = invoice.payments.reduce(
			(sum, payment) => sum + payment.amount,
			0,
		);

		if (paid + input.amount > invoice.amount) {
			throw new Error("The payment is more than the outstanding balance.");
		}

		await tx.payment.create({
			data: {
				invoiceId: invoice.id,
				amount: input.amount,
				method: input.method.trim(),
				reference: input.reference?.trim() || null,
				receivedById: input.receivedById ?? null,
			},
		});

		const total = paid + input.amount;

		return tx.invoice.update({
			where: { id: invoice.id },
			data: {
				status:
					total >= invoice.amount ? "PAID" : total > 0 ? "PARTIAL" : "UNPAID",
			},
			include: { payments: true },
		});
	});
}

export async function getFeesForUser(userId: string) {
	const student = await prisma.student.findUnique({
		where: { userId },
		select: { id: true, user: { select: { name: true } } },
	});

	const guardian = await prisma.guardian.findUnique({
		where: { userId },
		select: {
			guardianStudents: {
				select: {
					student: { select: { id: true, user: { select: { name: true } } } },
				},
			},
		},
	});

	const children = student
		? [student]
		: (guardian?.guardianStudents.map((entry) => entry.student) ?? []);

	return Promise.all(
		children.map(async (child) => {
			const invoices = await prisma.invoice.findMany({
				where: { studentId: child.id },
				include: {
					term: { select: { name: true } },
					feeStructure: { select: { name: true } },
					payments: { orderBy: { paidAt: "desc" } },
				},
				orderBy: { dueDate: "asc" },
			});

			const total = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
			const paid = invoices.reduce(
				(sum, invoice) =>
					sum +
					invoice.payments.reduce(
						(inner, payment) => inner + payment.amount,
						0,
					),
				0,
			);

			return {
				student: { id: child.id, name: child.user.name },
				total,
				paid,
				balance: total - paid,
				invoices,
			};
		}),
	);
}
