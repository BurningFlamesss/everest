import { prisma } from "#/packages/db/index.ts";

/**
 * Persists every mail outcome so a failure is visible in the admin mail log
 * instead of only appearing in server logs. Never throws: logging must not
 * break the caller's flow.
 */
export async function recordMailDelivery(input: {
	recipient: string | Array<string>;
	subject: string;
	template?: string | null;
	ok: boolean;
	error?: string | null;
}) {
	try {
		await prisma.mailLog.create({
			data: {
				recipient: Array.isArray(input.recipient)
					? input.recipient.join(", ")
					: input.recipient,
				subject: input.subject.slice(0, 300),
				template: input.template ?? null,
				ok: input.ok,
				error: input.error?.slice(0, 1000) ?? null,
			},
		});
	} catch (error) {
		console.error("[mail] Could not record delivery:", error);
	}
}
