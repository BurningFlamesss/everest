import { createHash } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { serverEnv } from "#/env/server.ts";
import { ERROR_CODES } from "#/lib/error-codes.ts";
import { auth } from "#/packages/auth/auth.ts";
import {
	AuthorizationError,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	createContactMessage,
	listContactMessages,
	markContactMessageHandled,
} from "./service.ts";

/** Enquiries opened less than this long before submit are treated as bots. */
const MIN_FILL_TIME_MS = 2500;

function escapeHtml(value: string) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;");
}

function hashIp(ip: string | null) {
	if (!ip) return undefined;

	return createHash("sha256")
		.update(`${ip}:${serverEnv.BETTER_AUTH_SECRET}`)
		.digest("hex");
}

async function currentIp() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const headers = getRequestHeaders();
	const forwarded = headers.get("x-forwarded-for");

	return forwarded?.split(",")[0]?.trim() || headers.get("x-real-ip") || null;
}

const contactSchema = z.object({
	name: z.string().trim().min(2, "Enter your name").max(120),
	email: z.string().trim().email("Enter a valid email address").max(200),
	phone: z.string().trim().max(40).optional(),
	subject: z.string().trim().min(3, "Add a subject").max(160),
	message: z
		.string()
		.trim()
		.min(10, "Tell us a little more")
		.max(4000, "Keep the message under 4000 characters"),
	/** Honeypot: real users never see or fill this field. */
	website: z.string().max(0).optional(),
	/** Epoch ms when the form mounted, used for the minimum fill time. */
	formOpenedAt: z.number().int().positive().optional(),
});

export const submitContactMessageAction = createServerFn()
	.validator(contactSchema)
	.handler(async ({ data }) => {
		try {
			// Honeypot hit: pretend success so bots get no feedback.
			if (data.website) {
				return { success: true as const, emailSent: false };
			}

			if (
				data.formOpenedAt &&
				Date.now() - data.formOpenedAt < MIN_FILL_TIME_MS
			) {
				return {
					success: false as const,
					error:
						"That was a little too quick — check your message and try again.",
					code: ERROR_CODES.CONTACT_INVALID_SUBMISSION,
				};
			}

			const ipHash = hashIp(await currentIp());
			const message = await createContactMessage({
				name: data.name,
				email: data.email,
				phone: data.phone,
				subject: data.subject,
				message: data.message,
				ipHash,
			});

			const { renderMailTemplate, sendMail } = await import(
				"#/packages/notifications/mail.ts"
			);

			const notification = await sendMail({
				to: serverEnv.SUPER_ADMIN_EMAIL,
				replyTo: message.email,
				subject: `Contact form: ${message.subject}`,
				html: renderMailTemplate({
					title: "New contact-form message",
					body: [
						`<strong>${escapeHtml(message.name)}</strong> &lt;${escapeHtml(message.email)}&gt;`,
						...(message.phone ? [`Phone: ${escapeHtml(message.phone)}`] : []),
						escapeHtml(message.message).replaceAll("\n", "<br />"),
						"Reply from the admin inbox to keep the thread together.",
					],
					actionLabel: "Open the inbox",
					actionUrl: `${serverEnv.APP_URL.replace(/\/$/, "")}/admin/inbox`,
				}),
			});

			return {
				success: true as const,
				emailSent: notification.success,
			};
		} catch (error) {
			if (
				error instanceof Error &&
				error.message === ERROR_CODES.CONTACT_RATE_LIMITED
			) {
				return {
					success: false as const,
					error:
						"We have received several messages from you recently. Please try again later or call the school office.",
					code: ERROR_CODES.CONTACT_RATE_LIMITED,
				};
			}

			console.error("Contact form failed:", error);

			return {
				success: false as const,
				error: "Could not send your message. Please try again.",
				code: ERROR_CODES.INTERNAL_ERROR,
			};
		}
	});

async function requireInboxManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_INBOX");

	return session.user;
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: ERROR_CODES.UNAUTHORIZED,
		};
	}

	console.error("Inbox action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: ERROR_CODES.INTERNAL_ERROR,
	};
}

const inboxSchema = z
	.object({
		status: z.enum(["NEW", "HANDLED"]).optional(),
	})
	.optional();

export const getContactInboxFn = createServerFn()
	.validator(inboxSchema)
	.handler(async ({ data }) => {
		try {
			await requireInboxManager();
			const messages = await listContactMessages(data ?? {});

			return { success: true as const, messages };
		} catch (error) {
			return failure(error);
		}
	});

export const markContactMessageHandledAction = createServerFn()
	.validator(
		z.object({
			id: z.string().min(1),
			handled: z.boolean(),
		}),
	)
	.handler(async ({ data }) => {
		try {
			const user = await requireInboxManager();
			const message = await markContactMessageHandled({
				id: data.id,
				handled: data.handled,
				handledById: user.id,
			});

			return { success: true as const, message };
		} catch (error) {
			return failure(error);
		}
	});
