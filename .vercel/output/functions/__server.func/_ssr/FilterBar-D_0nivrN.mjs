import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Search, SlidersHorizontal, X } from "../_libs/lucide-react.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FilterBar-D_0nivrN.js
var import_jsx_runtime = require_jsx_runtime();
function FilterBar({ search, onSearchChange, placeholder = "Search…", filters = [], onReset, actions, testId = "filter-bar" }) {
	const dirty = Boolean(search) || filters.some((f) => f.value !== "all");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-4 flex flex-col gap-2.5 rounded-xl border border-hairline bg-surface-1 p-2.5 sm:flex-row sm:items-center",
		"data-testid": testId,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative min-w-0 flex-1",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: search,
					placeholder,
					onChange: (e) => onSearchChange(e.target.value),
					className: "h-9 border-hairline bg-surface-1 pl-8 text-sm",
					"data-testid": `${testId}-search`
				}),
				search && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Clear search",
					"data-testid": `${testId}-clear-search`,
					onClick: () => onSearchChange(""),
					className: "absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-2",
			children: [
				filters.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SlidersHorizontal, { className: "hidden h-3.5 w-3.5 text-muted-foreground sm:block" }),
				filters.map((filter) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: filter.value,
					onValueChange: filter.onChange,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: `h-9 border-hairline bg-surface-1 text-xs ${filter.width ?? "w-[140px]"}`,
						"data-testid": `${testId}-${filter.key}`,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: filter.label })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
						className: "bg-popover",
						children: filter.options.map((option) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: option.value,
							className: "text-xs",
							"data-testid": `${testId}-${filter.key}-${option.value}`,
							children: option.label
						}, option.value))
					})]
				}, filter.key)),
				dirty && onReset && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "sm",
					className: "h-9 text-xs text-muted-foreground",
					onClick: onReset,
					"data-testid": `${testId}-reset`,
					children: "Reset"
				}),
				actions
			]
		})]
	});
}
function toOptions(values, allLabel = "All") {
	return [{
		value: "all",
		label: allLabel
	}, ...values.map((v) => ({
		value: v,
		label: v
	}))];
}
//#endregion
export { FilterBar, toOptions };
