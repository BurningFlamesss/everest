import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { RotateCcw, TriangleAlert } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ErrorState-WljNVn4W.js
var import_jsx_runtime = require_jsx_runtime();
function ErrorState({ title = "Something went wrong", description = "We couldn't load this section. Retry, or continue working elsewhere — nothing was lost.", onRetry, testId = "error-state" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col items-center justify-center px-6 py-14 text-center",
		"data-testid": testId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-3 grid h-11 w-11 place-items-center rounded-xl bg-destructive/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "h-5 w-5 text-destructive" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-sm font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground",
				children: description
			}),
			onRetry && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				className: "mt-4 gap-1.5",
				onClick: onRetry,
				"data-testid": `${testId}-retry`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3.5 w-3.5" }), " Try again"]
			})
		]
	});
}
//#endregion
export { ErrorState };
