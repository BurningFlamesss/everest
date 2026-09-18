import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/FilterChips-CvLOSi1H.js
var import_jsx_runtime = require_jsx_runtime();
/** Outline chips used for every filter surface on the site. */
var FilterChips = ({ options, value, onChange, testId, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	role: "group",
	"aria-label": label,
	"data-testid": testId,
	className: "flex flex-wrap gap-2",
	children: options.map((option) => {
		const active = option.value === value;
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onChange(option.value),
			"aria-pressed": active,
			"data-testid": `${testId}-${option.value}`,
			"data-active": active,
			className: [
				"group inline-flex min-h-[36px] items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
				active ? "border-accent bg-accent/10 font-medium text-foreground" : "border-border bg-background text-muted-foreground hover:border-accent/40 hover:bg-secondary hover:text-foreground"
			].join(" "),
			children: [option.label, typeof option.count === "number" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "inline-flex items-center justify-center rounded-full bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-accent group-data-[active=true]:bg-background group-data-[active=true]:text-foreground",
				children: option.count
			}) : null]
		}, option.value);
	})
});
//#endregion
export { FilterChips };
