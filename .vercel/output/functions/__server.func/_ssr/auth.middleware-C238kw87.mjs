import { createMiddleware, createServerFn } from "./ssr.mjs";
import { createServerRpc } from "./createServerRpc-DPX_ndmm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth.middleware-C238kw87.js
var getSessionMiddleware = createMiddleware({ type: "request" }).server(async ({ next }) => {
	const { getRequestHeaders } = await import("./ssr.mjs").then((n) => n.ssr_exports).then((n) => n.server_exports);
	const headers = getRequestHeaders();
	let session = null;
	try {
		const { auth } = await import("./auth-BkRB4J9m.mjs").then((n) => n.auth_exports);
		session = await auth.api.getSession({ headers });
	} catch {
		session = null;
	}
	if (!session) {
		const match = (headers.get("cookie") || "").match(/scms_demo_session=([^;]+)/);
		if (match) try {
			const decoded = JSON.parse(decodeURIComponent(match[1]));
			if (decoded && decoded.user) session = {
				user: decoded.user,
				session: {
					id: "demo-session-id",
					userId: decoded.user.id,
					expiresAt: new Date(Date.now() + 864e5).toISOString()
				}
			};
		} catch {
			session = null;
		}
	}
	return await next({ context: { session } });
});
var getSessionFn_createServerFn_handler = createServerRpc({
	id: "5a8af6680063df0c7f974c51333c10362bdfc0fa2fb194e30206b917b36b4413",
	name: "getSessionFn",
	filename: "src/packages/auth/middleware/auth.middleware.ts"
}, (opts) => getSessionFn.__executeServer(opts));
var getSessionFn = createServerFn().middleware([getSessionMiddleware]).handler(getSessionFn_createServerFn_handler, ({ context }) => context.session);
//#endregion
export { getSessionFn_createServerFn_handler };
