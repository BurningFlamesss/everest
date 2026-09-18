import { hashPassword, verifyPassword } from "../_libs/better-auth__utils.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/password-CkficvoI.js
/**
* `@better-auth/utils/password` uses the "node" export condition in package.json
* to automatically pick the right implementation:
*   - Node.js / Bun / Deno → `node:crypto scrypt` (libuv thread pool, non-blocking)
*   - Unsupported runtimes → `@noble/hashes scrypt` (pure JS fallback)
*/
var hashPassword$1 = hashPassword;
var verifyPassword$1 = async ({ hash, password }) => {
	return verifyPassword(hash, password);
};
//#endregion
export { hashPassword$1, verifyPassword$1 };
