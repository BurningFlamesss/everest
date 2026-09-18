import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { CircleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate._token-CjQSwrbn.js
var import_jsx_runtime = require_jsx_runtime();
var SplitNotFoundComponent = () => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: "flex flex-col items-center justify-center min-h-screen",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md p-8 text-center bg-card border border-border shadow-sm rounded-xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "w-12 h-12 mx-auto text-red-500 mb-4" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-xl font-semibold mb-2",
				children: "Invite Not Found"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground mb-6",
				children: "This activation link appears to be invalid or incorrectly formatted. Please check the URL and try again."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "text-accent hover:underline font-medium",
				children: "Return to homepage"
			})
		]
	})
});
//#endregion
export { SplitNotFoundComponent as notFoundComponent };
