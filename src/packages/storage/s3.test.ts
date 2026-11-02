import { Client } from "minio";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { S3StorageDriver } from "./s3.ts";

const clientMock = vi.hoisted(() => ({
	bucketExists: vi.fn(),
	makeBucket: vi.fn(),
	putObject: vi.fn(),
	getObject: vi.fn(),
	removeObject: vi.fn(),
}));

vi.mock("minio", () => {
	function StubClient() {
		return clientMock;
	}

	return { Client: vi.fn(StubClient) };
});

vi.mock("#/env/server.ts", () => ({
	serverEnv: {
		S3_BUCKET: "scms",
		S3_ENDPOINT: "minio.local",
		S3_PORT: 9000,
		S3_USE_SSL: false,
		S3_ACCESS_KEY: "access",
		S3_SECRET_KEY: "secret",
	},
}));

function streamOf(...chunks: Array<string>) {
	async function* generate() {
		for (const chunk of chunks) {
			yield Buffer.from(chunk);
		}
	}

	return Object.assign(generate(), {
		headers: { "content-type": "application/pdf" },
	});
}

beforeEach(() => {
	vi.clearAllMocks();
	clientMock.bucketExists.mockResolvedValue(true);
	clientMock.makeBucket.mockResolvedValue(undefined);
	clientMock.putObject.mockResolvedValue(undefined);
	clientMock.removeObject.mockResolvedValue(undefined);
});

describe("S3StorageDriver", () => {
	it("configures the MinIO client from the environment", () => {
		new S3StorageDriver();

		expect(vi.mocked(Client)).toHaveBeenCalledWith({
			endPoint: "minio.local",
			port: 9000,
			useSSL: false,
			accessKey: "access",
			secretKey: "secret",
		});
	});

	it("stores objects with their content type", async () => {
		const driver = new S3StorageDriver();
		const body = Buffer.from("hello");

		await driver.put("content/a.pdf", body, "application/pdf");

		expect(clientMock.putObject).toHaveBeenCalledWith(
			"scms",
			"content/a.pdf",
			body,
			body.length,
			{ "Content-Type": "application/pdf" },
		);
	});

	it("creates the bucket once when it is missing", async () => {
		clientMock.bucketExists.mockResolvedValue(false);
		const driver = new S3StorageDriver();

		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		await driver.put("content/b.pdf", Buffer.from("b"), "application/pdf");

		expect(clientMock.bucketExists).toHaveBeenCalledTimes(1);
		expect(clientMock.makeBucket).toHaveBeenCalledTimes(1);
		expect(clientMock.makeBucket).toHaveBeenCalledWith("scms", "us-east-1");
	});

	it("retries bucket creation after a failure", async () => {
		clientMock.bucketExists.mockResolvedValue(false);
		clientMock.makeBucket
			.mockRejectedValueOnce(new Error("storage offline"))
			.mockResolvedValueOnce(undefined);
		const driver = new S3StorageDriver();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toThrow("storage offline");

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).resolves.toBeUndefined();
		expect(clientMock.makeBucket).toHaveBeenCalledTimes(2);
	});

	it("reads an object and concatenates the stream", async () => {
		const driver = new S3StorageDriver();
		clientMock.getObject.mockResolvedValue(streamOf("ab", "cd"));

		const object = await driver.get("content/a.pdf");

		expect(object?.body.toString()).toBe("abcd");
		expect(object?.contentType).toBe("application/pdf");
		expect(clientMock.getObject).toHaveBeenCalledWith("scms", "content/a.pdf");
	});

	it("returns null for a missing object", async () => {
		const driver = new S3StorageDriver();
		clientMock.getObject.mockRejectedValueOnce({ code: "NoSuchKey" });
		clientMock.getObject.mockRejectedValueOnce({ code: "NotFound" });

		await expect(driver.get("content/missing.pdf")).resolves.toBeNull();
		await expect(driver.get("content/missing.pdf")).resolves.toBeNull();
	});

	it("rethrows unexpected storage errors", async () => {
		const driver = new S3StorageDriver();
		clientMock.getObject.mockRejectedValue({ code: "AccessDenied" });

		await expect(driver.get("content/a.pdf")).rejects.toEqual({
			code: "AccessDenied",
		});
	});

	it("deletes objects", async () => {
		const driver = new S3StorageDriver();

		await driver.delete("content/a.pdf");

		expect(clientMock.removeObject).toHaveBeenCalledWith(
			"scms",
			"content/a.pdf",
		);
	});

	it("rejects unsafe keys before touching the bucket", async () => {
		const driver = new S3StorageDriver();

		await expect(
			driver.put("../secret.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toThrow("INVALID_STORAGE_KEY");
		await expect(driver.get("..%2Fsecret.pdf")).rejects.toThrow(
			"INVALID_STORAGE_KEY",
		);
		await expect(driver.delete("content/../../etc/passwd")).rejects.toThrow(
			"INVALID_STORAGE_KEY",
		);

		expect(clientMock.bucketExists).not.toHaveBeenCalled();
		expect(clientMock.putObject).not.toHaveBeenCalled();
		expect(clientMock.getObject).not.toHaveBeenCalled();
		expect(clientMock.removeObject).not.toHaveBeenCalled();
	});
});
