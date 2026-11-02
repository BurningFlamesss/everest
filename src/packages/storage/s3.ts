import { Client } from "minio";
import { serverEnv } from "#/env/server.ts";
import {
	assertSafeObjectKey,
	type StorageDriver,
	type StoredObject,
} from "./local.ts";

export class S3StorageDriver implements StorageDriver {
	private readonly client: Client;
	private readonly bucket: string;
	private bucketReady: Promise<void> | null = null;

	constructor() {
		this.bucket = serverEnv.S3_BUCKET;
		this.client = new Client({
			endPoint: serverEnv.S3_ENDPOINT,
			port: serverEnv.S3_PORT,
			useSSL: serverEnv.S3_USE_SSL,
			accessKey: serverEnv.S3_ACCESS_KEY,
			secretKey: serverEnv.S3_SECRET_KEY,
		});
	}

	private async ensureBucket() {
		if (!this.bucketReady) {
			this.bucketReady = (async () => {
				if (!(await this.client.bucketExists(this.bucket))) {
					await this.client.makeBucket(this.bucket, "us-east-1");
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
		await this.client.putObject(this.bucket, safeKey, body, body.length, {
			"Content-Type": contentType,
		});
	}

	async get(key: string): Promise<StoredObject | null> {
		const safeKey = assertSafeObjectKey(key);
		await this.ensureBucket();

		try {
			const stream = await this.client.getObject(this.bucket, safeKey);
			const chunks: Array<Buffer> = [];

			for await (const chunk of stream) {
				chunks.push(Buffer.from(chunk));
			}

			return {
				body: Buffer.concat(chunks),
				contentType: (stream as { headers?: Record<string, string> }).headers?.[
					"content-type"
				],
			};
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				(error.code === "NoSuchKey" || error.code === "NotFound")
			) {
				return null;
			}

			throw error;
		}
	}

	async delete(key: string) {
		const safeKey = assertSafeObjectKey(key);
		await this.ensureBucket();
		await this.client.removeObject(this.bucket, safeKey);
	}
}
