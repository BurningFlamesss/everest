import { serverEnv } from "#/env/server.ts";
import { LocalStorageDriver, type StorageDriver } from "./local.ts";
import { S3StorageDriver } from "./s3.ts";

let driver: StorageDriver | null = null;

export function getStorage(): StorageDriver {
	if (driver) return driver;

	driver =
		serverEnv.STORAGE_DRIVER === "s3"
			? new S3StorageDriver()
			: new LocalStorageDriver(serverEnv.STORAGE_LOCAL_DIR);

	return driver;
}

export {
	assertSafeObjectKey,
	createObjectKey,
	getObjectUrl,
	type StorageDriver,
	type StoredObject,
} from "./local.ts";
