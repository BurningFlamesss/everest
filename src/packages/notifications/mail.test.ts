import { createTransport, type SendMailOptions } from "nodemailer";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isMailConfigured, sendMail } from "./mail.ts";

const mocks = vi.hoisted(() => ({
	serverEnv: {
		MAIL_APP_USER: "scms@example.test" as string | undefined,
		MAIL_APP_PASSWORD: "not-a-real-password" as string | undefined,
		MAIL_SMTP_HOST: "smtp.gmail.com" as string | undefined,
		MAIL_SMTP_PORT: 587 as number | undefined,
		MAIL_SMTP_SECURE: false as boolean | undefined,
		MAIL_FROM: undefined as string | undefined,
	},
	createTransport: vi.fn(),
}));

vi.mock("#/env/server.ts", () => ({ serverEnv: mocks.serverEnv }));

vi.mock("#/packages/db/index.ts", () => ({
	prisma: { mailLog: { create: vi.fn().mockResolvedValue({}) } },
}));

vi.mock("nodemailer", async (importOriginal) => ({
	...(await importOriginal<typeof import("nodemailer")>()),
	createTransport: mocks.createTransport,
}));

// Use the real named export: Nodemailer 10 need not provide a default export.
const nodemailer =
	await vi.importActual<typeof import("nodemailer")>("nodemailer");
const makeStreamTransport = () =>
	nodemailer.createTransport({
		streamTransport: true,
		buffer: true,
		newline: "windows",
	});
let transport: ReturnType<typeof makeStreamTransport>;
const send = vi.fn((options: SendMailOptions) => transport.sendMail(options));

const payload = {
	to: "recipient@example.test",
	subject: "SCMS notification",
	html: "<p>Your notification is ready.</p>",
};

async function composedMail() {
	const info = await send.mock.results[0]?.value;
	expect(info).toBeDefined();
	if (!info) throw new Error("Expected a composed message");
	expect(Buffer.isBuffer(info.message)).toBe(true);
	return {
		...info,
		mime: info.message.toString("utf8").replace(/\r\n/g, "\n"),
	};
}

beforeEach(() => {
	mocks.serverEnv.MAIL_APP_USER = "scms@example.test";
	mocks.serverEnv.MAIL_APP_PASSWORD = "not-a-real-password";
	transport = makeStreamTransport();
	send.mockReset();
	send.mockImplementation((options) => transport.sendMail(options));
	// Only the wrapper's transport factory is replaced; MIME composition stays real.
	mocks.createTransport.mockReset().mockReturnValue({ sendMail: send });
	vi.spyOn(console, "warn").mockImplementation(() => {});
	vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("sendMail with Nodemailer stream transport", () => {
	it("preserves Gmail defaults and composes string recipients and HTML", async () => {
		const result = await sendMail({
			...payload,
			to: "  recipient@example.test  ",
			cc: "  copied@example.test  ",
			bcc: "  hidden@example.test  ",
			replyTo: "replies@example.test",
		});
		const info = await composedMail();

		expect(isMailConfigured()).toBe(true);
		expect(createTransport).toHaveBeenCalledExactlyOnceWith({
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: "scms@example.test",
				pass: "not-a-real-password",
			},
		});
		expect(send).toHaveBeenCalledTimes(1);
		expect(info.envelope).toEqual({
			from: "scms@example.test",
			to: [
				"recipient@example.test",
				"copied@example.test",
				"hidden@example.test",
			],
		});
		expect(info.mime).toContain("From: scms@example.test\n");
		expect(info.mime).toContain("To: recipient@example.test\n");
		expect(info.mime).toContain("Cc: copied@example.test\n");
		expect(info.mime).toContain("Reply-To: replies@example.test\n");

		expect(info.mime).toContain(`Subject: ${payload.subject}\n`);
		expect(info.mime).toContain("Content-Type: text/html; charset=utf-8");
		expect(info.mime).toContain(payload.html);
		expect(info.mime).not.toContain("Content-Type: text/plain");
		expect(info.messageId).toEqual(expect.stringMatching(/^<.+>$/));
		expect(info.mime).toContain(`Message-ID: ${info.messageId}\n`);
		// Stream transport has no accepted/rejected fields, unlike SMTP transport.
		expect(result).toEqual({
			success: true,
			message: "Email sent successfully",
			details: {
				subject: payload.subject,
				messageId: info.messageId,
				accepted: [],
				rejected: [],
			},
		});
	});

	it("cleans recipient arrays and composes text/HTML alternatives with a custom sender", async () => {
		await expect(
			sendMail({
				...payload,
				from: "SCMS Office <office@example.test>",
				to: [" first@example.test ", "", " \t ", "second@example.test"],
				cc: [" ", " copied@example.test "],
				bcc: [" hidden@example.test ", ""],
				text: "Your plain-text notification.",
			}),
		).resolves.toMatchObject({ success: true });
		const { envelope, mime } = await composedMail();

		expect(envelope).toEqual({
			from: "office@example.test",
			to: [
				"first@example.test",
				"second@example.test",
				"copied@example.test",
				"hidden@example.test",
			],
		});
		expect(mime).toContain("From: SCMS Office <office@example.test>\n");
		expect(mime).toContain("To: first@example.test, second@example.test\n");

		expect(mime).toContain("Content-Type: multipart/alternative;");
		expect(mime).toContain("Content-Type: text/plain; charset=utf-8");
		expect(mime).toContain("Your plain-text notification.");
		expect(mime).toContain("Content-Type: text/html; charset=utf-8");
		expect(mime).toContain(payload.html);
	});

	it("uses a text-only body as the HTML fallback and omits blank optional recipients", async () => {
		const text = "A text-only notification.";
		await expect(
			sendMail({
				to: payload.to,
				subject: payload.subject,
				text,
				cc: " \t ",
				bcc: ["", " "],
			}),
		).resolves.toMatchObject({ success: true });
		const { envelope, mime } = await composedMail();

		expect(send).toHaveBeenCalledWith(
			expect.objectContaining({
				text,
				html: text,
				cc: undefined,
				bcc: undefined,
			}),
		);
		expect(envelope.to).toEqual([payload.to]);
		expect(mime).not.toMatch(/^(?:Cc|Bcc):/m);
		expect(mime).toContain("Content-Type: text/plain; charset=utf-8");
		expect(mime).toContain("Content-Type: text/html; charset=utf-8");
		expect(mime.split(`\n\n${text}\n`)).toHaveLength(3);
	});

	it("composes Buffer and UTF-8 string attachments with filenames and content types", async () => {
		const binary = Buffer.from([0, 255, 1, 128, 13, 10, 42]);
		const text = "Attendance: present ✓";
		await expect(
			sendMail({
				...payload,
				attachments: [
					{
						filename: "report.bin",
						content: binary,
						contentType: "application/octet-stream",
					},
					{ filename: "notes.txt", content: text },
				],
			}),
		).resolves.toMatchObject({ success: true });
		const { mime } = await composedMail();

		expect(mime).toContain("Content-Type: multipart/mixed;");
		expect(mime).toContain(
			"Content-Type: application/octet-stream; name=report.bin",
		);
		expect(mime).toContain(
			"Content-Disposition: attachment; filename=report.bin",
		);
		expect(mime).toContain(
			"Content-Type: text/plain; charset=utf-8; name=notes.txt",
		);
		expect(mime).toContain(
			"Content-Disposition: attachment; filename=notes.txt",
		);
		const binaryPart = mime.match(
			/filename=report\.bin\n\n([A-Za-z0-9+/=\n]+)\n--/,
		);
		const textPart = mime.match(
			/filename=notes\.txt\n\n([A-Za-z0-9+/=\n]+)\n--/,
		);
		expect(binaryPart).not.toBeNull();
		expect(textPart).not.toBeNull();
		expect(Buffer.from(binaryPart?.[1] ?? "", "base64")).toEqual(binary);
		expect(Buffer.from(textPart?.[1] ?? "", "base64").toString("utf8")).toBe(
			text,
		);
	});

	it("preserves message IDs and populated SMTP accepted/rejected address lists", async () => {
		send.mockImplementationOnce(async (options) => ({
			...(await transport.sendMail(options)),
			accepted: [payload.to, "alias@example.test"],
			rejected: ["rejected@example.test"],
		}));

		const result = await sendMail(payload);
		const info = await composedMail();

		expect(result).toEqual({
			success: true,
			message: "Email sent successfully",
			details: {
				subject: payload.subject,
				messageId: info.messageId,
				accepted: [payload.to, "alias@example.test"],
				rejected: ["rejected@example.test"],
			},
		});
	});
});

describe("mail validation and configuration", () => {
	it("rejects a missing payload before creating a transport", async () => {
		await expect(sendMail()).resolves.toEqual({
			success: false,
			message: "No email payload was provided",
		});
		expect(createTransport).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it.each([
		{ to: "" },
		{ to: " \t " },
		{ to: [] },
		{ to: ["", " \n "] },
	])("rejects empty recipients ($to) before creating a transport", async ({
		to,
	}) => {
		await expect(sendMail({ ...payload, to })).resolves.toEqual({
			success: false,
			message: "At least one recipient is required",
			details: { subject: payload.subject },
		});
		expect(createTransport).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it.each(["", " \t\n "])("rejects a blank subject (%j)", async (subject) => {
		await expect(sendMail({ ...payload, subject })).resolves.toEqual({
			success: false,
			message: "A subject is required",
		});
		expect(createTransport).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it.each([
		{},
		{ html: "", text: "" },
	])("rejects missing or empty bodies (%j)", async (body) => {
		await expect(
			sendMail({ to: payload.to, subject: payload.subject, ...body }),
		).resolves.toEqual({
			success: false,
			message: "An HTML or text body is required",
			details: { subject: payload.subject },
		});
		expect(createTransport).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});

	it.each([
		{ user: undefined, password: "not-a-real-password" },
		{ user: "scms@example.test", password: undefined },
		{ user: "", password: "" },
	])("skips mail without complete credentials (%j)", async ({
		user,
		password,
	}) => {
		mocks.serverEnv.MAIL_APP_USER = user;
		mocks.serverEnv.MAIL_APP_PASSWORD = password;

		expect(isMailConfigured()).toBe(false);
		await expect(sendMail(payload)).resolves.toEqual({
			success: false,
			message: "Email service is not configured",
			details: { subject: payload.subject },
		});
		expect(console.warn).toHaveBeenCalledExactlyOnceWith(
			`[mail] Skipping "${payload.subject}" to ${payload.to}: MAIL_APP_USER / MAIL_APP_PASSWORD are not configured.`,
		);
		expect(createTransport).not.toHaveBeenCalled();
		expect(send).not.toHaveBeenCalled();
	});
});

describe("mail transport failures", () => {
	it("returns a structured failure when transport construction throws", async () => {
		const error = new Error("Transport initialization failed");
		mocks.createTransport.mockImplementationOnce(() => {
			throw error;
		});

		await expect(sendMail(payload)).resolves.toEqual({
			success: false,
			message: "Failed to send email",
			details: { subject: payload.subject, error: error.message },
		});
		expect(send).not.toHaveBeenCalled();
		expect(console.error).toHaveBeenCalledExactlyOnceWith(
			"Email service error:",
			error,
		);
	});

	it("catches a failure from the real stream transport", async () => {
		const error = new Error("MIME composition failed");
		transport.use("stream", (_mail, callback) => callback(error));

		await expect(sendMail(payload)).resolves.toEqual({
			success: false,
			message: "Failed to send email",
			details: { subject: payload.subject, error: error.message },
		});
		expect(send).toHaveBeenCalledTimes(1);
		expect(console.error).toHaveBeenCalledExactlyOnceWith(
			"Email service error:",
			error,
		);
	});

	it("stringifies non-Error send rejections without throwing", async () => {
		send.mockRejectedValueOnce("Transport unavailable");

		await expect(sendMail(payload)).resolves.toEqual({
			success: false,
			message: "Failed to send email",
			details: { subject: payload.subject, error: "Transport unavailable" },
		});
		expect(console.error).toHaveBeenCalledExactlyOnceWith(
			"Email service error:",
			"Transport unavailable",
		);
	});
});
