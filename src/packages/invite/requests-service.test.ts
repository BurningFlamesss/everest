import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	type CreatedInvite,
	createStaffInvite,
	createStudentInvite,
} from "./invite-service.ts";
import {
	approveInviteRequest,
	createInviteRequest,
	rejectInviteRequest,
} from "./requests-service.ts";

const txMock = vi.hoisted(() => ({
	$executeRaw: vi.fn(),
	inviteRequest: { findFirst: vi.fn(), create: vi.fn() },
}));

const prismaMock = vi.hoisted(() => ({
	$transaction: vi.fn(),
	inviteRequest: {
		findUnique: vi.fn(),
		updateMany: vi.fn(),
		findUniqueOrThrow: vi.fn(),
	},
}));

const sendMailMock = vi.hoisted(() => vi.fn());

vi.mock("#/packages/db/index.ts", () => ({ prisma: prismaMock }));
vi.mock("#/env/server.ts", () => ({
	serverEnv: {
		SUPER_ADMIN_EMAIL: "office@example.test",
		ORGANIZATION_NAME: "Test School",
		APP_URL: "http://app.example.test/",
	},
}));
vi.mock("#/packages/notifications/mail.ts", () => ({
	sendMail: sendMailMock,
	renderMailTemplate: (input: {
		title: string;
		body: Array<string> | string;
		actionLabel?: string;
		actionUrl?: string;
	}) =>
		`${input.title}|${Array.isArray(input.body) ? input.body.join("|") : input.body}|${input.actionLabel}|${input.actionUrl}`,
}));
vi.mock("./invite-service.ts", async (importOriginal) => {
	const actual = await importOriginal<typeof import("./invite-service.ts")>();

	return {
		...actual,
		createStaffInvite: vi.fn(),
		createStudentInvite: vi.fn(),
	};
});

const pendingRequest = {
	id: "request_1",
	name: "Ada Lovelace",
	email: "ada@example.com",
	type: "STUDENT" as const,
	message: "Please add me",
	status: "PENDING" as const,
	reviewedById: null,
	reviewedAt: null,
	reviewNote: null,
	createdAt: new Date("2026-05-01T00:00:00.000Z"),
	updatedAt: new Date("2026-05-01T00:00:00.000Z"),
};

function inviteFixture(type: "STUDENT" | "STAFF"): CreatedInvite {
	return {
		id: `invite_${type}`,
		token: "token-123",
		type,
		expiresAt: new Date("2026-05-08T00:00:00.000Z"),
		url: "http://app.example.test/activate/token-123",
		user: { id: "user_1", name: "Ada Lovelace", email: "ada@example.com" },
		emailSent: false,
	};
}

let sql = "";
let sqlValues: Array<unknown> = [];

beforeEach(() => {
	vi.clearAllMocks();
	sql = "";
	sqlValues = [];

	prismaMock.$transaction.mockImplementation(
		(callback: (client: typeof txMock) => Promise<unknown>) => callback(txMock),
	);
	txMock.$executeRaw.mockImplementation(
		(strings: TemplateStringsArray, ...values: Array<unknown>) => {
			sql = strings.join("?");
			sqlValues = values;
			return Promise.resolve(1);
		},
	);
	txMock.inviteRequest.findFirst.mockResolvedValue(null);
	txMock.inviteRequest.create.mockResolvedValue({ id: "request_1" });

	prismaMock.inviteRequest.findUnique.mockResolvedValue(null);
	prismaMock.inviteRequest.updateMany.mockResolvedValue({ count: 1 });
	prismaMock.inviteRequest.findUniqueOrThrow.mockResolvedValue(pendingRequest);

	vi.mocked(createStudentInvite).mockResolvedValue(inviteFixture("STUDENT"));
	vi.mocked(createStaffInvite).mockResolvedValue(inviteFixture("STAFF"));
	sendMailMock.mockResolvedValue({ success: true, message: "ok" });
});

describe("createInviteRequest", () => {
	it("creates the request inside a lock transaction", async () => {
		const request = await createInviteRequest({
			name: "  Ada Lovelace  ",
			email: " ADA@Example.com ",
			type: "STUDENT",
			message: "  Please add me  ",
		});

		expect(request).toEqual({ id: "request_1" });
		expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
		expect(sql).toContain("pg_advisory_xact_lock");
		expect(sqlValues).toEqual(["invite-request:STUDENT:ada@example.com"]);
		expect(txMock.inviteRequest.findFirst).toHaveBeenCalledWith({
			where: { email: "ada@example.com", type: "STUDENT", status: "PENDING" },
			select: { id: true },
		});
		expect(txMock.inviteRequest.create).toHaveBeenCalledWith({
			data: {
				name: "Ada Lovelace",
				email: "ada@example.com",
				type: "STUDENT",
				message: "Please add me",
			},
		});
	});

	it("rejects a duplicate pending request without creating another", async () => {
		txMock.inviteRequest.findFirst.mockResolvedValue({ id: "existing" });

		await expect(
			createInviteRequest({
				name: "Ada",
				email: "ada@example.com",
				type: "STUDENT",
			}),
		).rejects.toMatchObject({
			name: "InviteError",
			code: "REQUEST_ALREADY_PENDING",
		});

		expect(txMock.inviteRequest.create).not.toHaveBeenCalled();
		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("uses a different lock key per request type", async () => {
		await createInviteRequest({
			name: "A",
			email: "a@example.com",
			type: "STUDENT",
		});
		const studentKey = sqlValues[0];

		await createInviteRequest({
			name: "A",
			email: "a@example.com",
			type: "STAFF",
		});
		const staffKey = sqlValues[0];

		expect(studentKey).toBe("invite-request:STUDENT:a@example.com");
		expect(staffKey).toBe("invite-request:STAFF:a@example.com");
		expect(studentKey).not.toBe(staffKey);
	});

	it("normalises an empty message to null", async () => {
		await createInviteRequest({
			name: "Ada",
			email: "ada@example.com",
			type: "STAFF",
			message: "   ",
		});

		expect(
			txMock.inviteRequest.create.mock.calls[0][0].data.message,
		).toBeNull();
	});

	it("notifies the school office after the request is stored", async () => {
		await createInviteRequest({
			name: "Ada",
			email: "ada@example.com",
			type: "STUDENT",
			message: "Hello",
		});

		expect(txMock.inviteRequest.create).toHaveBeenCalledTimes(1);
		expect(sendMailMock).toHaveBeenCalledTimes(1);

		const mail = sendMailMock.mock.calls[0][0];
		expect(mail.to).toBe("office@example.test");
		expect(mail.subject).toContain("student");
		expect(String(mail.html)).toContain("ada@example.com");
		expect(String(mail.html)).toContain("Hello");
		expect(String(mail.html)).toContain(
			"http://app.example.test/admin/invites",
		);
	});

	it("propagates a transaction failure without emailing the office", async () => {
		txMock.inviteRequest.create.mockRejectedValue(new Error("insert failed"));

		await expect(
			createInviteRequest({
				name: "Ada",
				email: "ada@example.com",
				type: "STUDENT",
			}),
		).rejects.toThrow("insert failed");

		expect(sendMailMock).not.toHaveBeenCalled();
	});
});

describe("approveInviteRequest", () => {
	it("creates one invite and sends one decision email with the activation link", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.findUniqueOrThrow.mockResolvedValue({
			...pendingRequest,
			status: "APPROVED",
			reviewedById: "admin_1",
		});

		const result = await approveInviteRequest({
			id: "request_1",
			reviewerId: "admin_1",
		});

		expect(prismaMock.inviteRequest.updateMany).toHaveBeenCalledWith({
			where: { id: "request_1", status: "PENDING" },
			data: {
				status: "APPROVED",
				reviewedById: "admin_1",
				reviewedAt: expect.any(Date),
			},
		});
		expect(createStudentInvite).toHaveBeenCalledWith({
			name: "Ada Lovelace",
			email: "ada@example.com",
			sendEmail: false,
		});
		expect(createStaffInvite).not.toHaveBeenCalled();
		expect(sendMailMock).toHaveBeenCalledTimes(1);

		const mail = sendMailMock.mock.calls[0][0];
		expect(mail.to).toBe("ada@example.com");
		expect(mail.subject).toMatch(/approved/i);
		expect(String(mail.html)).toContain(
			"http://app.example.test/activate/token-123",
		);

		expect(result.decisionEmailSent).toBe(true);
		expect(result.invite.url).toBe(
			"http://app.example.test/activate/token-123",
		);
	});

	it("uses staff invite creation for a staff request", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue({
			...pendingRequest,
			type: "STAFF",
		});

		await approveInviteRequest({ id: "request_1", reviewerId: "admin_1" });

		expect(createStaffInvite).toHaveBeenCalledTimes(1);
		expect(createStudentInvite).not.toHaveBeenCalled();
	});

	it("escapes the requester name in the email", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue({
			...pendingRequest,
			name: "Ada <script>alert(1)</script>",
		});

		await approveInviteRequest({ id: "request_1", reviewerId: "admin_1" });

		const html = String(sendMailMock.mock.calls[0][0].html);
		expect(html).not.toContain("<script>");
		expect(html).toContain("&lt;script&gt;");
	});

	it("refuses a request that was already reviewed", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue({
			...pendingRequest,
			status: "REJECTED",
		});

		await expect(
			approveInviteRequest({ id: "request_1", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_ALREADY_REVIEWED" });

		expect(prismaMock.inviteRequest.updateMany).not.toHaveBeenCalled();
		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("loses the atomic claim when another reviewer wins the race", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.updateMany.mockResolvedValue({ count: 0 });

		await expect(
			approveInviteRequest({ id: "request_1", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_ALREADY_REVIEWED" });

		expect(createStudentInvite).not.toHaveBeenCalled();
		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("releases the claim when invite creation fails", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		vi.mocked(createStudentInvite).mockRejectedValue(new Error("smtp down"));

		await expect(
			approveInviteRequest({ id: "request_1", reviewerId: "admin_1" }),
		).rejects.toThrow("smtp down");

		expect(prismaMock.inviteRequest.updateMany).toHaveBeenLastCalledWith({
			where: {
				id: "request_1",
				status: "APPROVED",
				reviewedById: "admin_1",
			},
			data: { status: "PENDING", reviewedById: null, reviewedAt: null },
		});
		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("still approves when mail is unavailable", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.findUniqueOrThrow.mockResolvedValue({
			...pendingRequest,
			status: "APPROVED",
		});
		sendMailMock.mockResolvedValue({
			success: false,
			message: "Email service is not configured",
		});

		const result = await approveInviteRequest({
			id: "request_1",
			reviewerId: "admin_1",
		});

		expect(result.request.status).toBe("APPROVED");
		expect(result.decisionEmailSent).toBe(false);
	});

	it("reports a missing request", async () => {
		await expect(
			approveInviteRequest({ id: "missing", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_NOT_FOUND" });
	});
});

describe("rejectInviteRequest", () => {
	it("sends one decision email with the escaped reviewer note", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.findUniqueOrThrow.mockResolvedValue({
			...pendingRequest,
			status: "REJECTED",
		});

		const result = await rejectInviteRequest({
			id: "request_1",
			reviewerId: "admin_1",
			note: "  Use <b>PDF</b> & reapply  ",
		});

		expect(prismaMock.inviteRequest.updateMany).toHaveBeenCalledWith({
			where: { id: "request_1", status: "PENDING" },
			data: {
				status: "REJECTED",
				reviewedById: "admin_1",
				reviewedAt: expect.any(Date),
				reviewNote: "Use <b>PDF</b> & reapply",
			},
		});
		expect(sendMailMock).toHaveBeenCalledTimes(1);

		const mail = sendMailMock.mock.calls[0][0];
		expect(mail.to).toBe("ada@example.com");
		expect(mail.subject).toMatch(/not approved/i);
		expect(String(mail.html)).toContain(
			"Use &lt;b&gt;PDF&lt;/b&gt; &amp; reapply",
		);
		expect(String(mail.html)).not.toContain("<b>PDF</b>");
		expect(result.decisionEmailSent).toBe(true);
	});

	it("falls back to generic text when no note is supplied", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);

		await rejectInviteRequest({ id: "request_1", reviewerId: "admin_1" });

		expect(prismaMock.inviteRequest.updateMany).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ reviewNote: null }),
			}),
		);
		expect(String(sendMailMock.mock.calls[0][0].html)).toContain(
			"Contact the school office",
		);
	});

	it("refuses a request that was already reviewed", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue({
			...pendingRequest,
			status: "APPROVED",
		});

		await expect(
			rejectInviteRequest({ id: "request_1", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_ALREADY_REVIEWED" });

		expect(prismaMock.inviteRequest.updateMany).not.toHaveBeenCalled();
		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("loses the atomic claim when another reviewer wins the race", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.updateMany.mockResolvedValue({ count: 0 });

		await expect(
			rejectInviteRequest({ id: "request_1", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_ALREADY_REVIEWED" });

		expect(sendMailMock).not.toHaveBeenCalled();
	});

	it("still rejects when mail is unavailable", async () => {
		prismaMock.inviteRequest.findUnique.mockResolvedValue(pendingRequest);
		prismaMock.inviteRequest.findUniqueOrThrow.mockResolvedValue({
			...pendingRequest,
			status: "REJECTED",
		});
		sendMailMock.mockResolvedValue({
			success: false,
			message: "Email service is not configured",
		});

		const result = await rejectInviteRequest({
			id: "request_1",
			reviewerId: "admin_1",
		});

		expect(result.request.status).toBe("REJECTED");
		expect(result.decisionEmailSent).toBe(false);
	});

	it("reports a missing request", async () => {
		await expect(
			rejectInviteRequest({ id: "missing", reviewerId: "admin_1" }),
		).rejects.toMatchObject({ code: "REQUEST_NOT_FOUND" });
	});
});
