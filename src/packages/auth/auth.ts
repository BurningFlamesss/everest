import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/server.ts";
import { renderMailTemplate, sendMail } from "#/packages/notifications/mail.ts";

const { prisma } = await import("../db/index");

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),

	emailAndPassword: {
		enabled: true,
		requireEmailVerification: false,
		revokeSessionsOnPasswordReset: true,

		async sendResetPassword({ user, url }) {
			await sendMail({
				to: user.email,
				subject: "Reset your password",
				html: renderMailTemplate({
					title: "Reset your password",
					body: [
						`Hi ${user.name},`,
						"We received a request to reset the password for your account.",
						"This link is valid for 20 minutes. If you did not request a reset, you can ignore this email.",
					],
					actionLabel: "Choose a new password",
					actionUrl: url,
				}),
			});
		},
		resetPasswordTokenExpiresIn: 1000 * 60 * 20,

		onExistingUserSignUp: async ({ user }) => {
			await sendMail({
				to: user.email,
				subject: "Sign-up attempt with your email",
				html: renderMailTemplate({
					title: "Sign-up attempt",
					body: [
						"Someone tried to create an account using your email address.",
						"If this was you, try signing in instead. If not, you can safely ignore this email.",
					],
				}),
			});
		},
	},

	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		async sendVerificationEmail({ user, url }) {
			await sendMail({
				to: user.email,
				subject: "Verify your email address",
				html: renderMailTemplate({
					title: `Welcome, ${user.name}`,
					body: [
						"Confirm your email address to finish setting up your account.",
						"This link is valid for 20 minutes.",
					],
					actionLabel: "Verify my email",
					actionUrl: url,
				}),
			});
		},
		expiresIn: 1000 * 60 * 20,
	},

	baseURL: serverEnv.APP_URL,

	plugins: [tanstackStartCookies()],
});
