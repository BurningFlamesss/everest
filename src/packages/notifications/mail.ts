import * as nodemailer from "nodemailer";
import { serverEnv } from "#/env/server.ts";
import { recordMailDelivery } from "./mail-log.ts";

export interface MailAttachment {
	filename: string;
	content: string | Buffer;
	contentType?: string;
}

export interface SendMailInput {
	to: string | Array<string>;
	subject: string;
	html?: string;
	text?: string;
	from?: string;
	cc?: string | Array<string>;
	bcc?: string | Array<string>;
	replyTo?: string;
	attachments?: Array<MailAttachment>;
}

export interface SendMailResult {
	success: boolean;
	message: string;
	details?: {
		subject?: string;
		messageId?: string;
		accepted?: Array<string>;
		rejected?: Array<string>;
		error?: string;
	};
}

export function isMailConfigured(): boolean {
	return Boolean(serverEnv.MAIL_APP_USER && serverEnv.MAIL_APP_PASSWORD);
}

function createTransport() {
	return nodemailer.createTransport({
		host: serverEnv.MAIL_SMTP_HOST,
		port: serverEnv.MAIL_SMTP_PORT,
		secure: serverEnv.MAIL_SMTP_SECURE,
		auth: {
			user: serverEnv.MAIL_APP_USER,
			pass: serverEnv.MAIL_APP_PASSWORD,
		},
	});
}

function toAddressList(
	value?: string | Array<string>,
): Array<string> | undefined {
	if (!value) return undefined;
	const list = Array.isArray(value) ? value : [value];
	const cleaned = list.map((item) => item.trim()).filter(Boolean);
	return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Sends a transactional email through the configured SMTP account.
 *
 * The function never throws: callers (auth hooks, invitation actions, ...)
 * receive a structured result so a mail outage cannot break the main flow.
 */
async function deliverMail(input?: SendMailInput): Promise<SendMailResult> {
	if (!input) {
		return {
			success: false,
			message: "No email payload was provided",
		};
	}

	const to = toAddressList(input.to);

	if (!to || to.length === 0) {
		return {
			success: false,
			message: "At least one recipient is required",
			details: { subject: input.subject },
		};
	}

	if (!input.subject.trim()) {
		return {
			success: false,
			message: "A subject is required",
		};
	}

	if (!input.html && !input.text) {
		return {
			success: false,
			message: "An HTML or text body is required",
			details: { subject: input.subject },
		};
	}

	if (!isMailConfigured()) {
		console.warn(
			`[mail] Skipping "${input.subject}" to ${to.join(", ")}: MAIL_APP_USER / MAIL_APP_PASSWORD are not configured.`,
		);

		return {
			success: false,
			message: "Email service is not configured",
			details: { subject: input.subject },
		};
	}

	try {
		const transporter = createTransport();

		const info = await transporter.sendMail({
			from: input.from ?? serverEnv.MAIL_FROM ?? serverEnv.MAIL_APP_USER,
			to,
			cc: toAddressList(input.cc),
			bcc: toAddressList(input.bcc),
			replyTo: input.replyTo,
			subject: input.subject,
			text: input.text,
			html: input.html ?? input.text,
			attachments: input.attachments,
		});

		return {
			success: true,
			message: "Email sent successfully",
			details: {
				subject: input.subject,
				messageId: info.messageId,
				accepted: (info.accepted ?? []).map(String),
				rejected: (info.rejected ?? []).map(String),
			},
		};
	} catch (error) {
		console.error("Email service error:", error);

		return {
			success: false,
			message: "Failed to send email",
			details: {
				subject: input.subject,
				error: error instanceof Error ? error.message : String(error),
			},
		};
	}
}

export async function sendMail(input?: SendMailInput): Promise<SendMailResult> {
	const result = await deliverMail(input);

	void recordMailDelivery({
		recipient: Array.isArray(input?.to)
			? input.to.join(", ")
			: (input?.to ?? "unknown"),
		subject: input?.subject?.trim() || "(no subject)",
		ok: result.success,
		error: result.success ? null : (result.details?.error ?? result.message),
	});

	return result;
}

export function renderMailTemplate({
	title,
	body,
	actionLabel,
	actionUrl,
	footer,
}: {
	title: string;
	body: Array<string> | string;
	actionLabel?: string;
	actionUrl?: string;
	footer?: string;
}): string {
	const paragraphs = (Array.isArray(body) ? body : [body])
		.map((paragraph) => `<p style="margin:0 0 16px">${paragraph}</p>`)
		.join("");

	const action =
		actionLabel && actionUrl
			? `<p style="margin:24px 0"><a href="${actionUrl}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;display:inline-block">${actionLabel}</a></p><p style="font-size:12px;color:#666;word-break:break-all">${actionUrl}</p>`
			: "";

	return `<!doctype html>
<html>
  <body style="font-family:Arial,Helvetica,sans-serif;line-height:1.6;color:#111;max-width:560px;margin:0 auto;padding:32px 20px">
    <h1 style="font-size:24px;margin:0 0 20px">${title}</h1>
    ${paragraphs}
    ${action}
    <hr style="border:none;border-top:1px solid #e5e5e5;margin:24px 0" />
    <p style="font-size:12px;color:#666">${footer ?? "This is an automated message from the school management system."}</p>
  </body>
</html>`;
}
