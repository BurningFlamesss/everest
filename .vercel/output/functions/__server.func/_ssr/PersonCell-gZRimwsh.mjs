import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/PersonCell-gZRimwsh.js
var import_jsx_runtime = require_jsx_runtime();
var SIZES = {
	sm: "h-7 w-7",
	md: "h-8 w-8",
	lg: "h-11 w-11"
};
function PersonCell({ name, subtitle, avatarUrl, to, size = "md", mono = false, testId }) {
	const content = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: "flex min-w-0 items-center gap-2.5",
		children: [avatarUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
			src: avatarUrl,
			alt: "",
			className: cn("shrink-0 rounded-full border border-hairline object-cover", SIZES[size]),
			loading: "lazy"
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: cn("grid shrink-0 place-items-center rounded-full border border-hairline bg-surface-2 text-[11px] font-semibold text-muted-foreground", SIZES[size]),
			children: name.split(" ").slice(0, 2).map((p) => p[0]).join("")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "block truncate text-sm font-medium text-foreground",
				children: name
			}), subtitle && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: cn("block truncate text-xs text-muted-foreground", mono && "font-mono text-[11px]"),
				children: subtitle
			})]
		})]
	});
	if (to) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to,
		className: "inline-flex min-w-0 max-w-full rounded transition-colors hover:text-primary focus-ring",
		"data-testid": testId,
		onClick: (e) => e.stopPropagation(),
		children: content
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "inline-flex min-w-0 max-w-full",
		"data-testid": testId,
		children: content
	});
}
//#endregion
export { PersonCell };
