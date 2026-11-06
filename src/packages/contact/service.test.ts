import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	CONTACT_MAX_PER_EMAIL,
	CONTACT_MAX_PER_IP,
	CONTACT_RATE_WINDOW_MS,
	createContactMessage,
	listContactMessages,
	markContactMessageHandled,
} from "./service.ts";

const mocks = vi.hoisted(() => ({
	count: vi.fn(),
	create: vi.fn(),
	findMany: vi.fn(),
	findUnique: vi.fn(),
	update: vi.fn(),
}));

vi.mock("#/packages/db/index.ts", () => ({
	prisma: {
		contactMessage: {
			count: mocks.count,
			create: mocks.create,
			findMany: mocks.findMany,
			findUnique: mocks.findUnique,
			update: mocks.update,
		},
	},
}));

const input = {
	name: "  Sita Sharma  ",
	email: "  SITA@Example.test ",
	phone: " +977 9800000000 ",
	subject: "  Admission for Grade 6  ",
	message: "  We would like to know about seats and fees.  ",
	ipHash: "hashed-ip",
};

beforeEach(() => {
	vi.resetAllMocks();
	mocks.count.mockResolvedValue(0);
	mocks.create.mockResolvedValue({ id: "message-1" });
	mocks.findUnique.mockResolvedValue({ id: "message-1" });
	mocks.update.mockResolvedValue({ id: "message-1", status: "HANDLED" });
});

describe("contact message service", () => {
	it("normalizes and persists a valid enquiry", async () => {
		const result = await createContactMessage(input);

		expect(result).toEqual({ id: "message-1" });
		expect(mocks.create).toHaveBeenCalledWith({
			data: {
				name: "Sita Sharma",
				email: "sita@example.test",
				phone: "+977 9800000000",
				subject: "Admission for Grade 6",
				message: "We would like to know about seats and fees.",
				ipHash: "hashed-ip",
			},
		});
	});

	it("counts the address and IP inside one rolling window", async () => {
		await createContactMessage(input);

		expect(mocks.count).toHaveBeenCalledTimes(2);
		const [emailQuery, ipQuery] = mocks.count.mock.calls;
		expect(emailQuery[0].where.email).toBe("sita@example.test");
		expect(ipQuery[0].where.ipHash).toBe("hashed-ip");
		expect(
			Date.now() - emailQuery[0].where.createdAt.gte.getTime(),
		).toBeLessThanOrEqual(CONTACT_RATE_WINDOW_MS + 1000);
	});

	it("rejects once the email allowance for the hour is used", async () => {
		mocks.count
			.mockResolvedValueOnce(CONTACT_MAX_PER_EMAIL)
			.mockResolvedValueOnce(0);

		await expect(createContactMessage(input)).rejects.toThrow(
			"CONTACT_RATE_LIMITED",
		);
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it("rejects once the shared-IP allowance for the hour is used", async () => {
		mocks.count
			.mockResolvedValueOnce(0)
			.mockResolvedValueOnce(CONTACT_MAX_PER_IP);

		await expect(createContactMessage(input)).rejects.toThrow(
			"CONTACT_RATE_LIMITED",
		);
		expect(mocks.create).not.toHaveBeenCalled();
	});

	it("skips the IP query when no IP hash is available", async () => {
		await createContactMessage({ ...input, ipHash: undefined });

		expect(mocks.count).toHaveBeenCalledTimes(1);
		expect(mocks.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ ipHash: null }),
			}),
		);
	});

	it("marks a message handled and stores the reviewer", async () => {
		await markContactMessageHandled({
			id: "message-1",
			handled: true,
			handledById: "admin-1",
		});

		expect(mocks.update).toHaveBeenCalledWith({
			where: { id: "message-1" },
			data: {
				status: "HANDLED",
				handledAt: expect.any(Date),
				handledById: "admin-1",
			},
		});
	});

	it("reopens a message by clearing its handler", async () => {
		await markContactMessageHandled({
			id: "message-1",
			handled: false,
			handledById: "admin-1",
		});

		expect(mocks.update).toHaveBeenCalledWith({
			where: { id: "message-1" },
			data: { status: "NEW", handledAt: null, handledById: null },
		});
	});

	it("refuses to update a message that does not exist", async () => {
		mocks.findUnique.mockResolvedValue(null);

		await expect(
			markContactMessageHandled({
				id: "missing",
				handled: true,
				handledById: "admin-1",
			}),
		).rejects.toThrow("CONTACT_MESSAGE_NOT_FOUND");
		expect(mocks.update).not.toHaveBeenCalled();
	});

	it("caps the inbox page size", async () => {
		await listContactMessages({ limit: 5000 });

		expect(mocks.findMany).toHaveBeenCalledWith(
			expect.objectContaining({ take: 200 }),
		);
	});
});
