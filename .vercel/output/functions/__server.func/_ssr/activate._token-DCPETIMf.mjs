import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { ERROR } from "./router-B6FnglFX.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate._token-DCPETIMf.js
var import_jsx_runtime = require_jsx_runtime();
var SplitErrorComponent = ({ error }) => {
	if (error.message === ERROR.INVITATION_USED) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "This invitation has already been used." });
	if (error.message === ERROR.INVITATION_EXPIRED) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "This invitation has expired." });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Something went wrong." });
};
//#endregion
export { SplitErrorComponent as errorComponent };
