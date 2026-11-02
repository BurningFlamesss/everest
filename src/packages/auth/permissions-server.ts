import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { auth } from "#/packages/auth/auth.ts";
import {
	ALL_PERMISSIONS,
	AuthorizationError,
	isPermissionKey,
	type PermissionKey,
	requirePermission,
} from "#/packages/auth/permissions.ts";
import {
	clearPermissionOverride,
	clearRolePermissionDefault,
	type EditablePermissionRole,
	getPermissionCatalog,
	isEditablePermissionRole,
	listPermissionUsers,
	listRolePermissions,
	resetRolePermissionDefaults,
	resetUserPermissions,
	setPermissionOverride,
	setRolePermissionDefault,
} from "#/packages/auth/permissions-service.ts";

async function requirePermissionManager() {
	const { getRequestHeaders } = await import("@tanstack/react-start/server");
	const session = await auth.api.getSession({ headers: getRequestHeaders() });

	if (!session?.user?.id) {
		throw new AuthorizationError("Please sign in to continue");
	}

	await requirePermission(session.user.id, "MANAGE_PERMISSIONS");

	return session.user;
}

function failure(error: unknown) {
	if (error instanceof AuthorizationError) {
		return {
			success: false as const,
			error: error.message,
			code: "UNAUTHORIZED",
		};
	}

	console.error("Permission action failed:", error);

	return {
		success: false as const,
		error: error instanceof Error ? error.message : "Something went wrong",
		code: "INTERNAL_ERROR",
	};
}

export const getPermissionsDataFn = createServerFn().handler(async () => {
	try {
		await requirePermissionManager();
		const users = await listPermissionUsers();

		const roles = await listRolePermissions();

		return {
			success: true as const,
			users,
			roles,
			catalog: getPermissionCatalog(),
		};
	} catch (error) {
		return failure(error);
	}
});

const permissionSchema = z.object({
	userId: z.string().min(1),
	permission: z.string().refine(isPermissionKey, "Unknown permission"),
	granted: z.boolean(),
});

export const setPermissionAction = createServerFn()
	.validator(permissionSchema)
	.handler(async ({ data }) => {
		try {
			const actor = await requirePermissionManager();
			const permission = data.permission as PermissionKey;
			const user = await listPermissionUsers();

			if (
				actor.id === data.userId &&
				permission === "MANAGE_PERMISSIONS" &&
				!data.granted
			) {
				return {
					success: false as const,
					error: "You cannot remove your own permission management access.",
					code: "SELF_LOCKOUT",
				};
			}

			if (!user.some((entry) => entry.id === data.userId)) {
				return {
					success: false as const,
					error: "User not found.",
					code: "USER_NOT_FOUND",
				};
			}

			await setPermissionOverride({
				userId: data.userId,
				permission,
				granted: data.granted,
			});

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const clearSchema = z.object({
	userId: z.string().min(1),
	permission: z.string().refine(isPermissionKey, "Unknown permission"),
});

export const clearPermissionAction = createServerFn()
	.validator(clearSchema)
	.handler(async ({ data }) => {
		try {
			await requirePermissionManager();

			await clearPermissionOverride({
				userId: data.userId,
				permission: data.permission as PermissionKey,
			});

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const resetUserPermissionsAction = createServerFn()
	.validator(z.object({ userId: z.string().min(1) }))
	.handler(async ({ data }) => {
		try {
			await requirePermissionManager();
			await resetUserPermissions(data.userId);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

const roleSchema = z.object({
	role: z
		.string()
		.refine(isEditablePermissionRole, "That role cannot be edited"),
	permission: z.string().refine(isPermissionKey, "Unknown permission"),
});

export const setRolePermissionAction = createServerFn()
	.validator(roleSchema.extend({ granted: z.boolean() }))
	.handler(async ({ data }) => {
		try {
			await requirePermissionManager();
			await setRolePermissionDefault({
				role: data.role as EditablePermissionRole,
				permission: data.permission as PermissionKey,
				granted: data.granted,
			});

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const clearRolePermissionAction = createServerFn()
	.validator(roleSchema)
	.handler(async ({ data }) => {
		try {
			await requirePermissionManager();
			await clearRolePermissionDefault({
				role: data.role as EditablePermissionRole,
				permission: data.permission as PermissionKey,
			});

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export const resetRolePermissionsAction = createServerFn()
	.validator(
		z.object({
			role: z
				.string()
				.refine(isEditablePermissionRole, "That role cannot be edited"),
		}),
	)
	.handler(async ({ data }) => {
		try {
			await requirePermissionManager();
			await resetRolePermissionDefaults(data.role);

			return { success: true as const };
		} catch (error) {
			return failure(error);
		}
	});

export { ALL_PERMISSIONS };
