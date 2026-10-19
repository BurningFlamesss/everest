import * as nodemailer from "nodemailer";
import { serverEnv } from "#/env/server.ts";

export interface MailMessage {
	to: string | string[];
	subject: string;
	html: string;
	text?: string;
}

export interface MailResult {
	success: boolean;
	/** Why the send failed or was skipped (e.g. unconfigured). */
	reason?: string;
	/** True when credentials are present, so callers know real delivery is possible. */
	configured: boolean;
}

function buildTransporter() {
	const user = serverEnv.MAIL_APP_USER;
	const pass = serverEnv.MAIL_APP_PASSWORD;
	if (!user || !pass) return null;
	return nodemailer.createTransport({
		service: "gmail",
		host: "smtp.gmail.com",
		port: 587,
		secure: false,
		auth: { user, pass },
	});
}

/**
 * Send an email via Gmail SMTP. Never throws — returns a result object so the
 * invite flows can fall back to showing a copyable link when mail is not
 * configured or the send fails.
 */
export async function sendMail(message: MailMessage): Promise<MailResult> {
	const transporter = buildTransporter();
	if (!transporter) {
		return {
			success: false,
			configured: false,
			reason:
				"Mail is not configured (MAIL_APP_USER / MAIL_APP_PASSWORD missing).",
		};
	}

	const from = serverEnv.MAIL_APP_USER;
	const to = Array.isArray(message.to) ? message.to : [message.to];
	if (to.length === 0 || to.every((t) => !t || !t.trim())) {
		return {
			success: false,
			configured: true,
			reason: "No recipient address.",
		};
	}

	try {
		await transporter.sendMail({
			from,
			to,
			subject: message.subject,
			html: message.html,
			text: message.text,
		});
		return { success: true, configured: true };
	} catch (error) {
		console.error("Email send failed:", error);
		return {
			success: false,
			configured: true,
			reason: error instanceof Error ? error.message : String(error),
		};
	}
}

/** Whether SMTP credentials are present (does not verify connectivity). */
export function isMailConfigured(): boolean {
	return Boolean(serverEnv.MAIL_APP_USER && serverEnv.MAIL_APP_PASSWORD);
}

/** Branded invite email body. */
export function inviteEmailHtml(args: {
	recipientName: string;
	schoolName: string;
	roleLabel: string;
	inviteUrl: string;
}): string {
	const { recipientName, schoolName, roleLabel, inviteUrl } = args;
	return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f6f6f4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f4;padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e7e5e0;">
          <tr><td style="padding:32px 32px 8px;">
            <p style="margin:0;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a8577;">${escapeHtml(schoolName)}</p>
            <h1 style="margin:16px 0 8px;font-size:24px;color:#1a1a2e;">You're invited</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#44423a;">
              Hello ${escapeHtml(recipientName)}, you have been invited to join
              <strong>${escapeHtml(schoolName)}</strong> as ${escapeHtml(roleLabel)}.
              Click the button below to set your password and activate your account.
            </p>
            <p style="margin:24px 0;">
              <a href="${inviteUrl}" style="display:inline-block;background:#1a1a2e;color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:8px;font-size:15px;">Activate your account</a>
            </p>
            <p style="margin:0 0 8px;font-size:13px;color:#8a8577;">
              This link expires in 7 days. If the button doesn't work, paste this URL into your browser:
            </p>
            <p style="margin:0 0 24px;font-size:12px;word-break:break-all;color:#44423a;">${inviteUrl}</p>
            <p style="margin:0 0 24px;font-size:12px;color:#8a8577;">
              If you weren't expecting this invitation you can safely ignore it.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
}
