import { object, string$1 as string } from "../_libs/@better-auth/core+[...].mjs";
import { createServerFn } from "./ssr.mjs";
import { hashPassword$1 } from "./password-CkficvoI.mjs";
import { prisma } from "./db-D_nP_VlF.mjs";
import { createServerRpc } from "./createServerRpc-DPX_ndmm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate-invite-D2XNVnWD.js
var ActivationSchema = object({
	token: string().min(1),
	password: string().min(8)
});
var activateInvite_createServerFn_handler = createServerRpc({
	id: "22e10330cdd9b9c18e53d021c52866c04fc49d201f78b3494a659e9f5a6d65e3",
	name: "activateInvite",
	filename: "src/packages/auth/server/activate-invite.ts"
}, (opts) => activateInvite.__executeServer(opts));
var activateInvite = createServerFn().validator(ActivationSchema).handler(activateInvite_createServerFn_handler, async ({ data }) => {
	const { token, password } = data;
	const invite = await prisma.invite.findUnique({
		where: { token },
		include: { user: true }
	});
	if (!invite) throw new Error("INVITE_NOT_FOUND");
	if (invite.usedAt) throw new Error("INVITE_ALREADY_USED");
	if (invite.expiresAt < /* @__PURE__ */ new Date()) throw new Error("INVITE_EXPIRED");
	const user = invite.user;
	if (await prisma.account.findFirst({ where: {
		userId: user.id,
		providerId: "credential"
	} })) throw new Error("Account already has a password");
	const hashedPassword = await hashPassword$1(password);
	await prisma.$transaction([
		prisma.account.create({ data: {
			id: crypto.randomUUID(),
			accountId: user.id,
			providerId: "credential",
			userId: user.id,
			password: hashedPassword,
			createdAt: /* @__PURE__ */ new Date(),
			updatedAt: /* @__PURE__ */ new Date()
		} }),
		prisma.user.update({
			where: { id: invite.userId },
			data: {
				activatedAt: /* @__PURE__ */ new Date(),
				emailVerified: true
			}
		}),
		prisma.invite.update({
			where: { id: invite.id },
			data: { usedAt: /* @__PURE__ */ new Date() }
		})
	]);
	return { success: true };
});
//#endregion
export { activateInvite_createServerFn_handler };
