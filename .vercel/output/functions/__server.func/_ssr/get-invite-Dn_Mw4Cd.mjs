import { string$1 as string } from "../_libs/@better-auth/core+[...].mjs";
import { createServerFn } from "./ssr.mjs";
import { prisma } from "./db-D_nP_VlF.mjs";
import { createServerRpc } from "./createServerRpc-DPX_ndmm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/get-invite-Dn_Mw4Cd.js
var TokenSchema = string().min(1);
var getInvite_createServerFn_handler = createServerRpc({
	id: "65fb0672cf45a7fdf8383c5f852d4ce20bbde40aeec6c2adf8feb392e0874571",
	name: "getInvite",
	filename: "src/packages/auth/server/get-invite.ts"
}, (opts) => getInvite.__executeServer(opts));
var getInvite = createServerFn().validator(TokenSchema).handler(getInvite_createServerFn_handler, async ({ data: token }) => {
	const cleanToken = decodeURIComponent(token.trim()).replace(/\/+$/, "");
	return prisma.invite.findFirst({
		where: { token: cleanToken },
		include: { user: true }
	});
});
//#endregion
export { getInvite_createServerFn_handler };
