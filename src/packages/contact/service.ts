import { ERROR_CODES } from "#/lib/error-codes.ts";
import { prisma } from "#/packages/db/index.ts";

export interface ContactMessageInput {
	name: string;
	email: string;
	phone?: string;
	subject: string;
	message: string;
	ipHash?: string;
}

export const CONTACT_RATE_WINDOW_MS = 60 * 60 * 1000;
/** Same address may write at most this often per hour. */
export const CONTACT_MAX_PER_EMAIL = 3;
/** A shared school network must still allow several families per hour. */
export const CONTACT_MAX_PER_IP = 8;

function clean(value?: string | null) {
	return value?.trim() || null;
}

/**
 * Persists a contact enquiry after a flood check.
 *
 * The check is database-backed (no in-process counters) so it keeps working
 * across multiple app instances, matching the no-in-process-timers rule.
 */
export async function createContactMessage(input: ContactMessageInput) {
	const email = input.email.trim().toLowerCase();
	const since = new Date(Date.now() - CONTACT_RATE_WINDOW_MS);

	const [emailCount, ipCount] = await Promise.all([
		prisma.contactMessage.count({
			where: { email, createdAt: { gte: since } },
		}),
		input.ipHash
			? prisma.contactMessage.count({
					where: { ipHash: input.ipHash, createdAt: { gte: since } },
				})
			: Promise.resolve(0),
	]);

	if (emailCount >= CONTACT_MAX_PER_EMAIL || ipCount >= CONTACT_MAX_PER_IP) {
		throw new Error(ERROR_CODES.CONTACT_RATE_LIMITED);
	}

	return prisma.contactMessage.create({
		data: {
			name: input.name.trim(),
			email,
			phone: clean(input.phone),
			subject: input.subject.trim(),
			message: input.message.trim(),
			ipHash: input.ipHash ?? null,
		},
	});
}

export async function listContactMessages(options?: {
	status?: "NEW" | "HANDLED";
	limit?: number;
}) {
	return prisma.contactMessage.findMany({
		where: options?.status ? { status: options.status } : undefined,
		include: {
			handledBy: { select: { id: true, name: true, email: true } },
		},
		orderBy: [{ status: "asc" }, { createdAt: "desc" }],
		take: Math.min(Math.max(options?.limit ?? 100, 1), 200),
	});
}

export async function markContactMessageHandled(input: {
	id: string;
	handled: boolean;
	handledById: string;
}) {
	const existing = await prisma.contactMessage.findUnique({
		where: { id: input.id },
		select: { id: true },
	});

	if (!existing) {
		throw new Error("CONTACT_MESSAGE_NOT_FOUND");
	}

	return prisma.contactMessage.update({
		where: { id: input.id },
		data: input.handled
			? {
					status: "HANDLED",
					handledAt: new Date(),
					handledById: input.handledById,
				}
			: { status: "NEW", handledAt: null, handledById: null },
	});
}
