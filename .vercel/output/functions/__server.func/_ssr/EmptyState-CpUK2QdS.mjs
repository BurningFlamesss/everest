import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { SearchX } from "../_libs/lucide-react.mjs";
import { Button } from "./kit-Cq_igxhQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-CpUK2QdS.js
var import_jsx_runtime = require_jsx_runtime();
var EmptyState = ({ eyebrow = "Nothing here", title, description, actionLabel, onAction, testId = "empty-state" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	"data-testid": testId,
	className: "rounded-card border border-dashed border-rule-strong bg-card/60 px-6 py-14",
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-secondary text-muted-foreground",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchX, {
					className: "h-4 w-4",
					"aria-hidden": "true"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "t-eyebrow mt-5",
				children: eyebrow
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "t-h3 mt-2 text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "t-body mt-2.5 text-muted-foreground",
				children: description
			}),
			actionLabel && onAction ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				type: "button",
				variant: "outline",
				onClick: onAction,
				"data-testid": `${testId}-action`,
				className: "mt-6 h-10 rounded-field border-border bg-background transition-colors duration-fast hover:bg-secondary",
				children: actionLabel
			}) : null
		]
	})
});
//#endregion
export { EmptyState };
