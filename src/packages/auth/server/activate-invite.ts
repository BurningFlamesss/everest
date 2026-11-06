import { createServerFn } from "@tanstack/react-start";
import { hashPassword } from "better-auth/crypto";
import { z } from "zod";
import { ERROR_CODES } from "#/lib/error-codes.ts";
import { prisma } from "../../db";

const ActivationSchema = z.object({
	token: z.string().min(1),
	password: z.string().min(8),
});

export const activateInvite = createServerFn()
	.validator(ActivationSchema)
	.handler(async ({ data }) => {
		const { token, password } = data;

		const invite = await prisma.invite.findUnique({
			where: {
				token,
			},
			include: {
				user: true,
			},
		});

		if (!invite) {
			throw new Error(ERROR_CODES.INVITE_NOT_FOUND);
		}

		if (invite.usedAt) {
			throw new Error(ERROR_CODES.INVITE_ALREADY_USED);
		}

		if (invite.expiresAt < new Date()) {
			throw new Error(ERROR_CODES.INVITE_EXPIRED);
		}

		const user = invite.user;

		const existingAccount = await prisma.account.findFirst({
			where: {
				userId: user.id,
				providerId: "credential",
			},
		});

		if (existingAccount) {
			throw new Error(ERROR_CODES.ACCOUNT_ALREADY_ACTIVATED);
		}

		const hashedPassword = await hashPassword(password);

		await prisma.$transaction([
			prisma.account.create({
				data: {
					id: crypto.randomUUID(),
					accountId: user.id,
					providerId: "credential",
					userId: user.id,
					password: hashedPassword,
					createdAt: new Date(),
					updatedAt: new Date(),
				},
			}),
			prisma.user.update({
				where: { id: invite.userId },
				data: {
					activatedAt: new Date(),
					emailVerified: true,
				},
			}),
			prisma.invite.update({
				where: { id: invite.id },
				data: {
					usedAt: new Date(),
				},
			}),
		]);

		return {
			success: true,
		};
	});
