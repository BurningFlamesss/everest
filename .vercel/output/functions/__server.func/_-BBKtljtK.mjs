import { require_jsx_runtime } from "./_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./_ssr/button-CcyykU5Y.mjs";
import { Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { Compass } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_-BBKtljtK.js
var import_jsx_runtime = require_jsx_runtime();
function NotFoundPage() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel flex flex-col items-center justify-center px-6 py-20 text-center",
		"data-testid": "not-found",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-4 grid h-12 w-12 place-items-center rounded-xl border border-hairline bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Compass, { className: "h-5 w-5 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-lg font-semibold text-foreground",
				children: "That page isn't part of the console"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 max-w-md text-sm text-muted-foreground",
				children: "The link may be out of date. Use the sidebar, or press ⌘K to jump straight to a student, notice or page."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "mt-5",
				"data-testid": "not-found-home",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin/overview",
					children: "Back to overview"
				})
			})
		]
	});
}
var SplitComponent = NotFoundPage;
//#endregion
export { SplitComponent as component };
