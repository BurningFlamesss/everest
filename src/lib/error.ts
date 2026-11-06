import { ERROR_CODES } from "./error-codes.ts";

/**
 * Client-facing labels for errors thrown by the invitation loaders.
 *
 * The values are the shared server codes so a loader and an activation action
 * can never drift apart.
 */
export const ERROR = {
	INVITATION_USED: ERROR_CODES.INVITE_ALREADY_USED,
	INVITATION_EXPIRED: ERROR_CODES.INVITE_EXPIRED,
} as const;
