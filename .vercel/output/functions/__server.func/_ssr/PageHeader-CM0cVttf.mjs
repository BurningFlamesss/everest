import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PageHeader-CM0cVttf.js
var import_jsx_runtime = require_jsx_runtime();
function PageHeader({ eyebrow, title, description, meta, actions, wash = false, className, testId = "page-header" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("relative mb-6", wash && "header-wash -mx-4 px-4 pt-1 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8", className),
		"data-testid": testId,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "eyebrow-label mb-1.5",
						children: eyebrow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "truncate font-display text-xl font-semibold tracking-[-0.02em] text-foreground sm:text-2xl",
						children: title
					}),
					description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 max-w-2xl text-sm text-muted-foreground",
						children: description
					}),
					meta && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground",
						children: meta
					})
				]
			}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex shrink-0 flex-wrap items-center gap-2",
				children: actions
			})]
		})
	});
}
//#endregion
export { PageHeader };
