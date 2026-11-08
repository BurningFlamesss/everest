/**
 * Upload policy in one place.
 *
 * The server accepts a file only if it appears in one of these sets, and the
 * admin upload fields render the same limits and `accept` values, so the UI can
 * never advertise something the API rejects (or vice versa).
 */

export const MAX_IMAGE_MB = 5;
export const MAX_DOCUMENT_MB = 10;

export const MAX_IMAGE_BYTES = MAX_IMAGE_MB * 1024 * 1024;
export const MAX_DOCUMENT_BYTES = MAX_DOCUMENT_MB * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: ReadonlySet<string> = new Set([
	"image/png",
	"image/jpeg",
	"image/webp",
	"image/gif",
]);

export const ALLOWED_DOCUMENT_TYPES: ReadonlySet<string> = new Set([
	"application/pdf",
	"application/msword",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"application/vnd.ms-excel",
	"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
	"text/csv",
	"text/plain",
]);

export const IMAGE_ACCEPT = [...ALLOWED_IMAGE_TYPES].join(",");
export const DOCUMENT_ACCEPT = ".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt";

export function isAllowedImageType(type: string) {
	return ALLOWED_IMAGE_TYPES.has(type);
}

export function isAllowedDocumentType(type: string) {
	return ALLOWED_DOCUMENT_TYPES.has(type);
}

export function isAllowedUploadType(type: string) {
	return isAllowedImageType(type) || isAllowedDocumentType(type);
}

export function maxUploadBytes(type: string) {
	return isAllowedImageType(type) ? MAX_IMAGE_BYTES : MAX_DOCUMENT_BYTES;
}

export const UNSUPPORTED_UPLOAD_MESSAGE =
	"Supported files are images (PNG, JPEG, WebP, GIF), PDF, Word, Excel, CSV and plain text.";
