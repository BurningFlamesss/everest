import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { prisma } from "../../db";

const TokenSchema = z.string().min(1);

export const getGuardianInvite = createServerFn()
	.validator(TokenSchema)
	.handler(async ({ data: token }) => {
		return prisma.guardianInvite.findUnique({
			where: { token },
			include: {
				user: true,
				student: { include: { user: true } },
			},
		});
	});
