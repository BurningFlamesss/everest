import {
	CreateBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	NoSuchBucket,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { S3StorageDriver } from "./s3.ts";

const clientMock = vi.hoisted(() => ({
	instances: [] as Array<{
		send: ReturnType<typeof vi.fn>;
		destroy: ReturnType<typeof vi.fn>;
	}>,
	send: vi.fn(),
	headBucket: vi.fn(),
	createBucket: vi.fn(),
	putObject: vi.fn(),
	getObject: vi.fn(),
	deleteObject: vi.fn(),
}));

vi.mock("@aws-sdk/client-s3", async (importOriginal) => {
	const sdk = await importOriginal<typeof import("@aws-sdk/client-s3")>();

	function StubClient() {
		const client = {
			send: vi.fn((command: unknown) => clientMock.send(command)),
			destroy: vi.fn(),
		};
		clientMock.instances.push(client);
		return client;
	}

	return { ...sdk, S3Client: vi.fn(StubClient) };
});

const serverEnvMock = vi.hoisted(() => ({
	S3_BUCKET: "scms",
	S3_ENDPOINT: "minio.local",
	S3_PORT: 9000,
	S3_USE_SSL: false,
	S3_ACCESS_KEY: "access",
	S3_SECRET_KEY: "secret",
	S3_REGION: undefined as string | undefined,
}));

vi.mock("#/env/server.ts", () => ({ serverEnv: serverEnvMock }));

beforeEach(() => {
	vi.clearAllMocks();
	serverEnvMock.S3_USE_SSL = false;
	serverEnvMock.S3_REGION = undefined;
	clientMock.instances.length = 0;
	clientMock.headBucket.mockReset().mockResolvedValue({});
	clientMock.createBucket.mockReset().mockResolvedValue({});
	clientMock.putObject.mockReset().mockResolvedValue({});
	clientMock.getObject.mockReset().mockResolvedValue({});
	clientMock.deleteObject.mockReset().mockResolvedValue({});
	clientMock.send.mockReset().mockImplementation((command: unknown) => {
		if (command instanceof HeadBucketCommand) {
			return clientMock.headBucket(command.input);
		}
		if (command instanceof CreateBucketCommand) {
			return clientMock.createBucket(command.input);
		}
		if (command instanceof PutObjectCommand) {
			return clientMock.putObject(command.input);
		}
		if (command instanceof GetObjectCommand) {
			return clientMock.getObject(command.input);
		}
		if (command instanceof DeleteObjectCommand) {
			return clientMock.deleteObject(command.input);
		}
		throw new Error("Unexpected S3 command");
	});
});

const missingBucketErrors = [
	{ name: "NoSuchBucket" },
	{ name: "NotFound" },
	{ $metadata: { httpStatusCode: 404 } },
];
const missingObjectErrors = [
	{ name: "NoSuchKey" },
	{ name: "NotFound" },
	{ $metadata: { httpStatusCode: 404 } },
];
const storageErrors = [
	{ name: "AccessDenied", $metadata: { httpStatusCode: 403 } },
	{ name: "InvalidAccessKeyId", $metadata: { httpStatusCode: 403 } },
	{ name: "AccessDenied", $metadata: { httpStatusCode: 404 } },
	{ $metadata: { httpStatusCode: 500 } },
	new Error("storage offline"),
];

describe("S3StorageDriver", () => {
	it.each([
		false,
		true,
	])("configures the path-style S3 client with SSL=%s without I/O", (useSSL) => {
		serverEnvMock.S3_USE_SSL = useSSL;
		new S3StorageDriver();

		expect(vi.mocked(S3Client)).toHaveBeenCalledWith({
			endpoint: `${useSSL ? "https" : "http"}://minio.local:9000`,
			region: "us-east-1",
			forcePathStyle: true,
			followRegionRedirects: true,
			credentials: { accessKeyId: "access", secretAccessKey: "secret" },
		});
		expect(clientMock.send).not.toHaveBeenCalled();
	});

	it("binds all subsequent commands to the discovered bucket region", async () => {
		clientMock.headBucket.mockResolvedValue({ BucketRegion: "eu-west-1" });
		const driver = new S3StorageDriver();

		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		await driver.get("content/a.pdf");
		await driver.delete("content/a.pdf");

		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(S3Client)).toHaveBeenLastCalledWith({
			...vi.mocked(S3Client).mock.calls[0][0],
			region: "eu-west-1",
		});
		const [initial, regional] = clientMock.instances;
		expect(initial.send).toHaveBeenCalledExactlyOnceWith(
			expect.any(HeadBucketCommand),
		);
		expect(initial.destroy).toHaveBeenCalledTimes(1);
		expect(regional.send).toHaveBeenNthCalledWith(
			1,
			expect.any(PutObjectCommand),
		);
		expect(regional.send).toHaveBeenNthCalledWith(
			2,
			expect.any(GetObjectCommand),
		);
		expect(regional.send).toHaveBeenNthCalledWith(
			3,
			expect.any(DeleteObjectCommand),
		);
		expect(regional.destroy).not.toHaveBeenCalled();
	});

	it("keeps the initial client when the discovered region is unchanged", async () => {
		clientMock.headBucket.mockResolvedValue({ BucketRegion: "us-east-1" });
		await new S3StorageDriver().get("content/a.pdf");

		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(1);
		expect(clientMock.instances[0].destroy).not.toHaveBeenCalled();
	});

	it.each([
		{ name: "AuthorizationHeaderMalformed", Region: "eu-west-1" },
		{
			name: "AuthorizationHeaderMalformed",
			$response: { headers: { "x-amz-bucket-region": "eu-west-1" } },
		},
	])("retries the initial region mismatch once using the returned region: %j", async (error) => {
		clientMock.headBucket
			.mockRejectedValueOnce(error)
			.mockResolvedValueOnce({ BucketRegion: "eu-west-1" });
		const driver = new S3StorageDriver();

		await driver.get("content/a.pdf");

		expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(vi.mocked(S3Client)).toHaveBeenLastCalledWith(
			expect.objectContaining({
				region: "eu-west-1",
				endpoint: "http://minio.local:9000",
			}),
		);
		expect(clientMock.instances[0].destroy).toHaveBeenCalledTimes(1);
		expect(clientMock.instances[1].send).toHaveBeenNthCalledWith(
			1,
			expect.any(HeadBucketCommand),
		);
		expect(clientMock.instances[1].send).toHaveBeenNthCalledWith(
			2,
			expect.any(GetObjectCommand),
		);
	});

	it("limits region mismatch retries and allows a later initialization attempt", async () => {
		const error = {
			name: "AuthorizationHeaderMalformed",
			Region: "ap-south-1",
		};
		clientMock.headBucket
			.mockRejectedValueOnce({
				name: "AuthorizationHeaderMalformed",
				Region: "eu-west-1",
			})
			.mockRejectedValueOnce(error);
		const driver = new S3StorageDriver();

		await expect(driver.get("content/a.pdf")).rejects.toBe(error);
		expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(clientMock.getObject).not.toHaveBeenCalled();
		expect(clientMock.createBucket).not.toHaveBeenCalled();

		await driver.get("content/a.pdf");
		expect(clientMock.headBucket).toHaveBeenCalledTimes(3);
	});

	it("shares a failed region retry across concurrent operations and recovers on the next initialization", async () => {
		const error = {
			name: "AuthorizationHeaderMalformed",
			Region: "ap-south-1",
		};
		let failRetry = (_error: unknown) => {};
		clientMock.headBucket
			.mockRejectedValueOnce({
				name: "AuthorizationHeaderMalformed",
				Region: "eu-west-1",
			})
			.mockReturnValueOnce(
				new Promise<never>((_resolve, reject) => {
					failRetry = reject;
				}),
			);
		const driver = new S3StorageDriver();
		const pending = Promise.allSettled([
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
			driver.get("content/a.pdf"),
			driver.delete("content/a.pdf"),
		]);

		await vi.waitFor(() => {
			expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
		});
		failRetry(error);
		expect(await pending).toEqual([
			{ status: "rejected", reason: error },
			{ status: "rejected", reason: error },
			{ status: "rejected", reason: error },
		]);
		expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
		expect(clientMock.putObject).not.toHaveBeenCalled();
		expect(clientMock.getObject).not.toHaveBeenCalled();
		expect(clientMock.deleteObject).not.toHaveBeenCalled();

		clientMock.headBucket.mockResolvedValueOnce({ BucketRegion: "eu-west-1" });
		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		expect(clientMock.headBucket).toHaveBeenCalledTimes(3);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(clientMock.putObject).toHaveBeenCalledTimes(1);
	});

	it.each([
		{ name: "AuthorizationHeaderMalformed" },
		{ name: "AuthorizationHeaderMalformed", Region: " " },
		{ name: "AuthorizationHeaderMalformed", Region: "us-east-1" },
		{ name: "AccessDenied", Region: "eu-west-1" },
	])("does not retry non-actionable region errors: %j", async (error) => {
		clientMock.headBucket.mockRejectedValue(error);

		await expect(new S3StorageDriver().get("content/a.pdf")).rejects.toBe(
			error,
		);
		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(1);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
	});

	it("respects an explicit region instead of rebinding to a discovered region", async () => {
		serverEnvMock.S3_REGION = "ap-south-1";
		clientMock.headBucket.mockResolvedValue({ BucketRegion: "eu-west-1" });

		await new S3StorageDriver().get("content/a.pdf");

		expect(vi.mocked(S3Client)).toHaveBeenCalledExactlyOnceWith(
			expect.objectContaining({ region: "ap-south-1" }),
		);
		expect(clientMock.instances[0].destroy).not.toHaveBeenCalled();
	});

	it("propagates an explicit region mismatch without overriding configuration", async () => {
		serverEnvMock.S3_REGION = "ap-south-1";
		const error = { name: "AuthorizationHeaderMalformed", Region: "eu-west-1" };
		clientMock.headBucket.mockRejectedValue(error);

		await expect(new S3StorageDriver().get("content/a.pdf")).rejects.toBe(
			error,
		);
		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(1);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
	});

	it("creates missing buckets in an explicitly configured non-default region", async () => {
		serverEnvMock.S3_REGION = "eu-west-1";
		clientMock.headBucket.mockRejectedValue({ name: "NotFound" });

		await new S3StorageDriver().put(
			"content/a.pdf",
			Buffer.from("a"),
			"application/pdf",
		);

		expect(clientMock.createBucket).toHaveBeenCalledExactlyOnceWith({
			Bucket: "scms",
			CreateBucketConfiguration: { LocationConstraint: "eu-west-1" },
		});
	});

	it("shares region discovery and client replacement across concurrent operations", async () => {
		let finishHead = (_result: { BucketRegion: string }) => {};
		clientMock.headBucket.mockReturnValueOnce(
			new Promise<{ BucketRegion: string }>((resolve) => {
				finishHead = resolve;
			}),
		);
		const driver = new S3StorageDriver();
		const first = driver.put(
			"content/a.pdf",
			Buffer.from("a"),
			"application/pdf",
		);
		const second = driver.get("content/a.pdf");
		const third = driver.delete("content/a.pdf");

		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(1);
		expect(clientMock.putObject).not.toHaveBeenCalled();
		expect(clientMock.getObject).not.toHaveBeenCalled();
		expect(clientMock.deleteObject).not.toHaveBeenCalled();
		finishHead({ BucketRegion: "eu-west-1" });
		await Promise.all([first, second, third]);

		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(vi.mocked(S3Client)).toHaveBeenCalledTimes(2);
		expect(clientMock.instances[0].destroy).toHaveBeenCalledTimes(1);
		expect(clientMock.instances[1].send).toHaveBeenCalledTimes(3);
		expect(clientMock.instances[1].destroy).not.toHaveBeenCalled();
	});

	it("stores object bytes with their content type and length", async () => {
		const driver = new S3StorageDriver();
		const body = Buffer.from([0, 1, 127, 128, 255]);

		await driver.put("content/a.pdf", body, "application/pdf");

		expect(clientMock.putObject).toHaveBeenCalledWith({
			Bucket: "scms",
			Key: "content/a.pdf",
			Body: body,
			ContentLength: body.length,
			ContentType: "application/pdf",
		});
	});

	it("checks an existing bucket only once across operations", async () => {
		const driver = new S3StorageDriver();

		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		await driver.get("content/a.pdf");
		await driver.delete("content/a.pdf");

		expect(clientMock.headBucket).toHaveBeenCalledExactlyOnceWith({
			Bucket: "scms",
		});
		expect(clientMock.createBucket).not.toHaveBeenCalled();
	});

	it.each(
		missingBucketErrors,
	)("creates a missing bucket once for %j", async (error) => {
		clientMock.headBucket.mockRejectedValue(error);
		const driver = new S3StorageDriver();

		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		await driver.put("content/b.pdf", Buffer.from("b"), "application/pdf");

		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(clientMock.createBucket).toHaveBeenCalledExactlyOnceWith({
			Bucket: "scms",
		});
	});

	it("shares pending bucket initialization between concurrent operations", async () => {
		clientMock.headBucket.mockRejectedValue({ name: "NotFound" });
		let finishCreate = () => {};
		clientMock.createBucket.mockReturnValueOnce(
			new Promise<void>((resolve) => {
				finishCreate = resolve;
			}),
		);
		const driver = new S3StorageDriver();
		const first = driver.put(
			"content/a.pdf",
			Buffer.from("a"),
			"application/pdf",
		);
		const second = driver.put(
			"content/b.pdf",
			Buffer.from("b"),
			"application/pdf",
		);

		await vi.waitFor(() => {
			expect(clientMock.createBucket).toHaveBeenCalledTimes(1);
		});
		expect(clientMock.headBucket).toHaveBeenCalledTimes(1);
		expect(clientMock.putObject).not.toHaveBeenCalled();

		finishCreate();
		await Promise.all([first, second]);
		expect(clientMock.putObject).toHaveBeenCalledTimes(2);
	});

	it.each(
		storageErrors,
	)("does not create a bucket after a check error: %j", async (error) => {
		clientMock.headBucket.mockRejectedValueOnce(error);
		const driver = new S3StorageDriver();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toBe(error);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
		expect(clientMock.putObject).not.toHaveBeenCalled();

		await driver.put("content/a.pdf", Buffer.from("a"), "application/pdf");
		expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
	});

	it("retries bucket creation after a failure", async () => {
		clientMock.headBucket.mockRejectedValue({ name: "NotFound" });
		clientMock.createBucket.mockRejectedValueOnce(new Error("storage offline"));
		const driver = new S3StorageDriver();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toThrow("storage offline");
		expect(clientMock.putObject).not.toHaveBeenCalled();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).resolves.toBeUndefined();
		expect(clientMock.headBucket).toHaveBeenCalledTimes(2);
		expect(clientMock.createBucket).toHaveBeenCalledTimes(2);
	});

	it("tolerates concurrent creation of a bucket owned by us", async () => {
		clientMock.headBucket.mockRejectedValue({ name: "NotFound" });
		clientMock.createBucket.mockRejectedValue({
			name: "BucketAlreadyOwnedByYou",
		});
		const driver = new S3StorageDriver();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).resolves.toBeUndefined();
		expect(clientMock.putObject).toHaveBeenCalledTimes(1);
	});

	it.each([
		{ name: "BucketAlreadyExists" },
		{ name: "AccessDenied" },
		{ $metadata: { httpStatusCode: 409 } },
	])("does not ignore unsafe bucket creation errors: %j", async (error) => {
		clientMock.headBucket.mockRejectedValue({ name: "NotFound" });
		clientMock.createBucket.mockRejectedValue(error);
		const driver = new S3StorageDriver();

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toBe(error);
		expect(clientMock.putObject).not.toHaveBeenCalled();
	});

	it("reads object bytes and preserves the content type", async () => {
		const bytes = Uint8Array.from([0, 1, 127, 128, 255]);
		const transformToByteArray = vi.fn().mockResolvedValue(bytes);
		clientMock.getObject.mockResolvedValue({
			Body: { transformToByteArray },
			ContentType: "application/pdf",
		});
		const driver = new S3StorageDriver();

		await expect(driver.get("content/a.pdf")).resolves.toEqual({
			body: Buffer.from(bytes),
			contentType: "application/pdf",
		});
		expect(transformToByteArray).toHaveBeenCalledTimes(1);
		expect(clientMock.getObject).toHaveBeenCalledWith({
			Bucket: "scms",
			Key: "content/a.pdf",
		});
	});

	it("preserves an empty object without a content type", async () => {
		clientMock.getObject.mockResolvedValue({
			Body: {
				transformToByteArray: vi.fn().mockResolvedValue(new Uint8Array()),
			},
		});

		await expect(new S3StorageDriver().get("content/empty")).resolves.toEqual({
			body: Buffer.alloc(0),
			contentType: undefined,
		});
	});

	it("handles a response with no body as an empty object", async () => {
		await expect(new S3StorageDriver().get("content/empty")).resolves.toEqual({
			body: Buffer.alloc(0),
			contentType: undefined,
		});
	});

	it("propagates body read failures", async () => {
		const error = new Error("stream interrupted");
		clientMock.getObject.mockResolvedValue({
			Body: { transformToByteArray: vi.fn().mockRejectedValue(error) },
		});

		await expect(new S3StorageDriver().get("content/a.pdf")).rejects.toBe(
			error,
		);
	});

	it.each(
		missingObjectErrors,
	)("returns null for a missing object: %j", async (error) => {
		clientMock.getObject.mockRejectedValue(error);

		await expect(
			new S3StorageDriver().get("content/missing.pdf"),
		).resolves.toBeNull();
	});

	it.each(
		storageErrors,
	)("propagates object operation errors: %j", async (error) => {
		const driver = new S3StorageDriver();
		clientMock.putObject.mockRejectedValue(error);
		clientMock.getObject.mockRejectedValue(error);
		clientMock.deleteObject.mockRejectedValue(error);

		await expect(
			driver.put("content/a.pdf", Buffer.from("a"), "application/pdf"),
		).rejects.toBe(error);
		await expect(driver.get("content/a.pdf")).rejects.toBe(error);
		await expect(driver.delete("content/a.pdf")).rejects.toBe(error);
	});

	it.each([
		new NoSuchBucket({
			message: "Bucket no longer exists",
			$metadata: { httpStatusCode: 404 },
		}),
		{ name: "InvalidObjectState", $metadata: { httpStatusCode: 404 } },
	])("propagates named service errors despite a 404 status: %j", async (error) => {
		const driver = new S3StorageDriver();
		clientMock.getObject.mockRejectedValue(error);
		clientMock.deleteObject.mockRejectedValue(error);

		await expect(driver.get("content/a.pdf")).rejects.toBe(error);
		await expect(driver.delete("content/a.pdf")).rejects.toBe(error);
	});

	it("does not create a bucket for a named non-bucket 404 error", async () => {
		const error = { name: "NoSuchKey", $metadata: { httpStatusCode: 404 } };
		clientMock.headBucket.mockRejectedValue(error);

		await expect(new S3StorageDriver().get("content/a.pdf")).rejects.toBe(
			error,
		);
		expect(clientMock.createBucket).not.toHaveBeenCalled();
	});

	it("deletes objects idempotently", async () => {
		const driver = new S3StorageDriver();

		await driver.delete("content/a.pdf");
		await driver.delete("content/a.pdf");

		expect(clientMock.deleteObject).toHaveBeenCalledTimes(2);
		expect(clientMock.deleteObject).toHaveBeenCalledWith({
			Bucket: "scms",
			Key: "content/a.pdf",
		});
	});

	it.each(
		missingObjectErrors,
	)("ignores missing-object delete errors: %j", async (error) => {
		clientMock.deleteObject.mockRejectedValue(error);

		await expect(
			new S3StorageDriver().delete("content/missing.pdf"),
		).resolves.toBeUndefined();
	});

	it.each([
		"../secret.pdf",
		"..%2Fsecret.pdf",
		"content/../../etc/passwd",
		"content\\..\\secret.pdf",
		"",
		".hidden",
		"content/a?b.pdf",
	])("rejects unsafe key %j before any I/O", async (key) => {
		const driver = new S3StorageDriver();

		await expect(
			driver.put(key, Buffer.from("a"), "application/pdf"),
		).rejects.toThrow("INVALID_STORAGE_KEY");
		await expect(driver.get(key)).rejects.toThrow("INVALID_STORAGE_KEY");
		await expect(driver.delete(key)).rejects.toThrow("INVALID_STORAGE_KEY");
		expect(clientMock.send).not.toHaveBeenCalled();
	});

	it("uses normalized safe keys for all object operations", async () => {
		const driver = new S3StorageDriver();

		await driver.put("/content\\a.pdf", Buffer.from("a"), "application/pdf");
		await driver.get("/content\\a.pdf");
		await driver.delete("/content\\a.pdf");

		for (const operation of [
			clientMock.putObject,
			clientMock.getObject,
			clientMock.deleteObject,
		]) {
			expect(operation).toHaveBeenCalledWith(
				expect.objectContaining({ Bucket: "scms", Key: "content/a.pdf" }),
			);
		}
	});
});
