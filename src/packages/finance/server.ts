import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import { prisma } from "#/packages/db/index.ts";
import {
	createFeeStructure,
	deleteFeeStructure,
	generateInvoices,
	getFeesForUser,
	listFeeStructures,
	listInvoices,
	recordPayment,
} from "./fees-service.ts";

async function requireManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_FEES");

	const staff = await prisma.staff.findUnique({
		where: { userId: session.user.id },
		select: { id: true },
	});

	return { user: session.user, staffId: staff?.id ?? null };
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Fees action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

export const getFinanceDataFn = createServerFn().handler(async () => {
	try {
		await requireManager();

		const [structures, invoices, terms] = await Promise.all([
			listFeeStructures(),
			listInvoices(),
			prisma.term.findMany({
				where: { academicYear: { isActive: true } },
				include: { academicYear: { select: { name: true } } },
				orderBy: { startsOn: "asc" },
			}),
		]);

		return { success: true as const, structures, invoices, terms };
	} catch (error) {
		return failure(error);
	}
});

const structureSchema = z.object({
	termId: z.string().min(1),
	name: z.string().trim().min(1, "Name is required").max(120),
	grade: z.string().trim().optional(),
	section: z.string().trim().optional(),
	amount: z.number().int().min(0).max(100_000_000),
	dueDate: z.string().min(1),
});

export const createFeeStructureAction = createServerFn()
	.validator(structureSchema)
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const structure = await createFeeStructure({
				...data,
				dueDate: new Date(data.dueDate),
			});

			return { success: true as const, structure };
		} catch (error) {
			return failure(error);
		}
	});

export const deleteFeeStructureAction = createServerFn()
	.validator(z.object({ id: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			await deleteFeeStructure(data.id);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const generateInvoicesAction = createServerFn()
	.validator(z.object({ feeStructureId: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requireManager();
			const count = await generateInvoices(data.feeStructureId);

			return { success: true as const, count };
		} catch (error) {
			return failure(error);
		}
	});

const paymentSchema = z.object({
	invoiceId: z.string().min(1),
	amount: z.number().int().positive().max(100_000_000),
	method: z.string().trim().min(1, "Payment method is required").max(60),
	reference: z.string().trim().max(120).optional(),
});

export const recordPaymentAction = createServerFn()
	.validator(paymentSchema)
	.handler(async ({ data }) => {
		try {
			const { staffId } = await requireManager();
			const invoice = await recordPayment({ ...data, receivedById: staffId });

			return {
				success: true as const,
				invoice,
				invoices: await listInvoices(),
			};
		} catch (error) {
			return failure(error);
		}
	});

export const getMyFeesFn = createServerFn().handler(async () => {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) return [];

	return getFeesForUser(session.user.id);
});
