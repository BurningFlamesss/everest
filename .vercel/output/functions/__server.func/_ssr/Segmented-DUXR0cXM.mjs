import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Segmented-DUXR0cXM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Segmented control with radiogroup semantics and roving tab order.
* Selection is never signalled by colour alone - the active segment inverts and
* carries a check glyph.
*/
function Segmented({ label, options, value, onChange, className, testId, size = "md" }) {
	const id = (0, import_react.useId)();
	const refs = (0, import_react.useRef)([]);
	const move = (dir, from) => {
		const next = (from + dir + options.length) % options.length;
		onChange(options[next].value);
		refs.current[next]?.focus();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("flex flex-col gap-3", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			id,
			className: "t-eyebrow text-muted-foreground",
			children: label
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			role: "radiogroup",
			"aria-labelledby": id,
			"data-testid": testId,
			className: "flex flex-wrap gap-2",
			children: options.map((o, i) => {
				const active = o.value === value;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					ref: (el) => {
						refs.current[i] = el;
					},
					type: "button",
					role: "radio",
					"aria-checked": active,
					tabIndex: active ? 0 : -1,
					"data-testid": testId ? testId + "-" + o.value : void 0,
					"data-active": active,
					onClick: () => onChange(o.value),
					onKeyDown: (e) => {
						if (e.key === "ArrowRight" || e.key === "ArrowDown") {
							e.preventDefault();
							move(1, i);
						} else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
							e.preventDefault();
							move(-1, i);
						}
					},
					className: [
						"inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] transition-colors duration-fast",
						"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
						active ? "border-accent/40 bg-accent/12 font-medium text-foreground" : "border-border bg-background text-muted-foreground hover:bg-secondary hover:text-foreground"
					].join(" "),
					children: o.label
				}, o.value);
			})
		})]
	});
}
//#endregion
export { Segmented };
