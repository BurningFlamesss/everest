import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

export interface StoredObject {
	body: Buffer;
	contentType?: string;
}

export interface StorageDriver {
	put(key: string, body: Buffer, contentType: string): Promise<void>;
	get(key: string): Promise<StoredObject | null>;
	delete(key: string): Promise<void>;
}

export function assertSafeObjectKey(key: string): string {
	const normalized = key.replaceAll("\\", "/").replace(/^\/+/, "");

	if (
		!normalized ||
		normalized.includes("..") ||
		normalized.startsWith(".") ||
		!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(normalized)
	) {
		throw new Error("INVALID_STORAGE_KEY");
	}

	return normalized;
}

export function createObjectKey(prefix: string, originalName: string): string {
	const extension = path.extname(originalName).toLowerCase().slice(0, 12);
	const safeExtension = /^\.[a-z0-9]+$/.test(extension) ? extension : "";
	const safePrefix = prefix
		.toLowerCase()
		.replace(/[^a-z0-9/-]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 60);

	return `${safePrefix || "files"}/${randomUUID()}${safeExtension}`;
}

export function getObjectUrl(key: string): string {
	return `/uploads/${assertSafeObjectKey(key)}`;
}

export class LocalStorageDriver implements StorageDriver {
	private readonly root: string;

	constructor(root: string) {
		this.root = path.resolve(process.cwd(), root);
	}

	private resolve(key: string): string {
		const safeKey = assertSafeObjectKey(key);
		const target = path.resolve(this.root, safeKey);

		if (!target.startsWith(`${this.root}${path.sep}`)) {
			throw new Error("INVALID_STORAGE_KEY");
		}

		return target;
	}

	async put(key: string, body: Buffer) {
		const target = this.resolve(key);
		await mkdir(path.dirname(target), { recursive: true });
		await writeFile(target, body);
	}

	async get(key: string): Promise<StoredObject | null> {
		try {
			const body = await readFile(this.resolve(key));
			return { body };
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "ENOENT"
			) {
				return null;
			}

			throw error;
		}
	}

	async delete(key: string) {
		try {
			await unlink(this.resolve(key));
		} catch (error) {
			if (
				error &&
				typeof error === "object" &&
				"code" in error &&
				error.code === "ENOENT"
			) {
				return;
			}

			throw error;
		}
	}
}
