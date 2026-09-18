import { require_jsx_runtime } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { Outlet } from "./_libs/@tanstack/react-router+[...].mjs";
import { PageShell } from "./_ssr/router-dKngB4cM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_onboard-CnXN4kv7.js
var import_jsx_runtime = require_jsx_runtime();
/**
* The onboarding cluster (signup, activate, public login). Uses the same frame
* as the public and /user layouts so the sidebar, ticker and footer appear
* consistently everywhere outside the admin shell.
*/
function OnboardLayoutRoute() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) });
}
//#endregion
export { OnboardLayoutRoute as component };
