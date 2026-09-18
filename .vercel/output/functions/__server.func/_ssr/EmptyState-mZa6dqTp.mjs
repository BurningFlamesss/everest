import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Inbox } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/EmptyState-mZa6dqTp.js
var import_jsx_runtime = require_jsx_runtime();
function EmptyState({ icon: Icon = Inbox, title, description, primaryLabel, onPrimary, secondaryLabel, onSecondary, testId = "empty-state", compact = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `flex flex-col items-center justify-center px-6 text-center ${compact ? "py-10" : "py-16"}`,
		"data-testid": testId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mb-3 grid h-11 w-11 place-items-center rounded-xl border border-hairline bg-surface-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-5 w-5 text-muted-foreground" })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-sm font-semibold text-foreground",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground",
				children: description
			}),
			(primaryLabel || secondaryLabel) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4 flex flex-wrap items-center justify-center gap-2",
				children: [primaryLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: onPrimary,
					"data-testid": `${testId}-primary`,
					children: primaryLabel
				}), secondaryLabel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					variant: "outline",
					onClick: onSecondary,
					"data-testid": `${testId}-secondary`,
					children: secondaryLabel
				})]
			})
		]
	});
}
//#endregion
export { EmptyState };
