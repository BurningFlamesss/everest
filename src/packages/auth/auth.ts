import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { serverEnv } from "#/env/server.ts";
import { prisma } from "#/packages/db/index.ts";
import { sendMail } from "#/packages/notifications/mail.ts";

const SCHOOL_NAME = serverEnv.ORGANIZATION_NAME;

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
				subject: `Reset your ${SCHOOL_NAME} password`,
				html: `<p>Hello ${user.name ?? ""},</p>
<p>We received a request to reset your password. Click the link below to choose a new one. The link expires shortly.</p>
<p><a href="${url}">Reset password</a></p>
<p>If you didn't request this, you can ignore this email.</p>`,
			});
		},
		resetPasswordTokenExpiresIn: 1000 * 60 * 20,

		onExistingUserSignUp: async ({ user }) => {
			await sendMail({
				to: user.email,
				subject: `Sign-up attempt with your ${SCHOOL_NAME} email`,
				html: `<p>Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.</p>`,
			});
		},
	},

	emailVerification: {
		autoSignInAfterVerification: true,
		sendOnSignUp: true,
		async sendVerificationEmail({ user, url }) {
			await sendMail({
				to: user.email,
				subject: `Verify your ${SCHOOL_NAME} email`,
				html: `<p>Hello ${user.name ?? ""},</p>
<p>Please confirm your email address by clicking the link below.</p>
<p><a href="${url}">Verify email</a></p>`,
			});
		},
		expiresIn: 1000 * 60 * 20,
	},

	baseURL: serverEnv.APP_URL,

	plugins: [tanstackStartCookies()],
});
