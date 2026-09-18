import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Panel-DSd1zziT.js
var import_jsx_runtime = require_jsx_runtime();
function Panel({ title, description, eyebrow, actions, footer, children, className, bodyClassName, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: cn("panel flex flex-col overflow-hidden", className),
		"data-testid": testId,
		children: [
			(title || actions) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "panel-header",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [
						eyebrow && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "eyebrow-label mb-0.5",
							children: eyebrow
						}),
						title && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "panel-title truncate",
							children: title
						}),
						description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-0.5 truncate text-xs text-muted-foreground",
							children: description
						})
					]
				}), actions && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex shrink-0 items-center gap-1.5",
					children: actions
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("min-w-0 flex-1", bodyClassName ?? "p-4"),
				children
			}),
			footer && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-hairline px-4 py-2.5",
				children: footer
			})
		]
	});
}
function KeyValue({ label, value, mono = false, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
			className: "text-[11px] uppercase tracking-[0.06em] text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
			className: cn("mt-0.5 truncate text-sm text-foreground", mono && "font-mono text-[13px]"),
			"data-testid": testId,
			children: value ?? "—"
		})]
	});
}
//#endregion
export { KeyValue, Panel };
