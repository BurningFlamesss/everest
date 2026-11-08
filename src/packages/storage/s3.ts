import {
	type BucketLocationConstraint,
	CreateBucketCommand,
	DeleteObjectCommand,
	GetObjectCommand,
	HeadBucketCommand,
	PutObjectCommand,
	S3Client,
} from "@aws-sdk/client-s3";
import { serverEnv } from "#/env/server.ts";
import {
	assertSafeObjectKey,
	type StorageDriver,
	type StoredObject,
} from "./local.ts";

function isNotFound(error: unknown, name: "NoSuchBucket" | "NoSuchKey") {
	if (!error || typeof error !== "object") {
		return false;
	}

	if (
		"name" in error &&
		typeof error.name === "string" &&
		error.name !== "Error"
	) {
		return error.name === name || error.name === "NotFound";
	}

	return (
		"$metadata" in error &&
		error.$metadata !== null &&
		typeof error.$metadata === "object" &&
		"httpStatusCode" in error.$metadata &&
		error.$metadata.httpStatusCode === 404
	);
}

function mismatchRegion(error: unknown) {
	if (!error || typeof error !== "object") {
		return;
	}

	const { name, Region, $response } = error as {
		name?: string;
		Region?: unknown;
		$response?: { headers?: Record<string, unknown> };
	};
	if (name !== "AuthorizationHeaderMalformed") {
		return;
	}

	const region = Region ?? $response?.headers?.["x-amz-bucket-region"];
	return typeof region === "string" && region.trim()
		? region.trim()
		: undefined;
}

function createClient(region: string) {
	return new S3Client({
		endpoint: `${serverEnv.S3_USE_SSL ? "https" : "http"}://${serverEnv.S3_ENDPOINT}:${serverEnv.S3_PORT}`,
		region,
		forcePathStyle: true,
		followRegionRedirects: true,
		credentials: {
			accessKeyId: serverEnv.S3_ACCESS_KEY,
			secretAccessKey: serverEnv.S3_SECRET_KEY,
		},
	});
}

export class S3StorageDriver implements StorageDriver {
	private client: S3Client;
	private readonly bucket: string;
	private readonly configuredRegion: string | undefined;
	private region: string;
	private bucketReady: Promise<void> | null = null;

	constructor() {
		this.bucket = serverEnv.S3_BUCKET;
		this.configuredRegion = serverEnv.S3_REGION;
		this.region = this.configuredRegion ?? "us-east-1";
		this.client = createClient(this.region);
	}

	private bindDiscoveredRegion(region: string | undefined) {
		if (!this.configuredRegion && region && region !== this.region) {
			const previousClient = this.client;
			this.client = createClient(region);
			this.region = region;
			previousClient.destroy();
		}
	}

	private async headBucket() {
		try {
			return await this.client.send(
				new HeadBucketCommand({ Bucket: this.bucket }),
			);
		} catch (error) {
			const region = mismatchRegion(error);
			if (this.configuredRegion || !region || region === this.region) {
				throw error;
			}

			// Some S3-compatible servers return a region the SDK does not retry.
			this.bindDiscoveredRegion(region);
			return this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
		}
	}

	private async ensureBucket() {
		if (!this.bucketReady) {
			this.bucketReady = (async () => {
				try {
					const bucket = await this.headBucket();
					this.bindDiscoveredRegion(bucket.BucketRegion);
				} catch (error) {
					if (!isNotFound(error, "NoSuchBucket")) {
						throw error;
					}

					try {
						await this.client.send(
							new CreateBucketCommand({
								Bucket: this.bucket,
								...(this.region !== "us-east-1" && {
									CreateBucketConfiguration: {
										LocationConstraint: this.region as BucketLocationConstraint,
									},
								}),
							}),
						);
					} catch (error) {
						// A competing initializer is safe only if we own the bucket.
						if (
							!error ||
							typeof error !== "object" ||
							!("name" in error) ||
							error.name !== "BucketAlreadyOwnedByYou"
						) {
							throw error;
						}
					}
				}
			})().catch((error) => {
				this.bucketReady = null;
				throw error;
			});
		}

		return this.bucketReady;
	}

	async put(key: string, body: Buffer, contentType: string) {
		const safeKey = assertSafeObjectKey(key);
		await this.ensureBucket();
		await this.client.send(
			new PutObjectCommand({
				Bucket: this.bucket,
				Key: safeKey,
				Body: body,
				ContentLength: body.length,
				ContentType: contentType,
			}),
		);
	}

	async get(key: string): Promise<StoredObject | null> {
		const safeKey = assertSafeObjectKey(key);
		await this.ensureBucket();

		try {
			const object = await this.client.send(
				new GetObjectCommand({ Bucket: this.bucket, Key: safeKey }),
			);

			return {
				body: object.Body
					? Buffer.from(await object.Body.transformToByteArray())
					: Buffer.alloc(0),
				contentType: object.ContentType,
			};
		} catch (error) {
			if (isNotFound(error, "NoSuchKey")) {
				return null;
			}

			throw error;
		}
	}

	async delete(key: string) {
		const safeKey = assertSafeObjectKey(key);
		await this.ensureBucket();

		try {
			await this.client.send(
				new DeleteObjectCommand({ Bucket: this.bucket, Key: safeKey }),
			);
		} catch (error) {
			if (!isNotFound(error, "NoSuchKey")) {
				throw error;
			}
		}
	}
}
