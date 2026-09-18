import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CircleDashed, Hammer } from "../_libs/lucide-react.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ModulePlaceholder-DfEVKITo.js
var import_jsx_runtime = require_jsx_runtime();
/**
* Interim surface for modules whose data layer is already seeded but whose
* workspace UI is scheduled for the next build pass. It intentionally shows
* real numbers from the mock repository so the module never feels empty.
*/
function ModulePlaceholder({ eyebrow, title, description, icon: Icon, stats = [], capabilities, backTo, testId }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": testId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow,
				title,
				description,
				testId: `${testId}-header`,
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent",
					"data-testid": `${testId}-status-chip`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Hammer, { className: "h-3 w-3" }), " Workspace UI scheduled next"]
				}),
				actions: backTo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: backTo.to,
						"data-testid": `${testId}-back`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }),
							" ",
							backTo.label
						]
					})
				}) : null
			}),
			stats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-5 grid grid-cols-2 gap-2 md:grid-cols-4",
				"data-testid": `${testId}-stats`,
				children: stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-lg border border-hairline bg-surface-1 px-3 py-2.5",
					"data-testid": `${testId}-stat-${stat.key}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-[11px] font-medium text-muted-foreground",
							children: stat.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "num mt-1 font-display text-lg font-semibold leading-none text-foreground",
							children: stat.value
						}),
						stat.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 truncate text-[11px] text-muted-foreground",
							children: stat.hint
						})
					]
				}, stat.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 lg:grid-cols-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					className: "lg:col-span-2",
					eyebrow: "Planned",
					title: "What this workspace will do",
					description: "Data is already seeded — only the screens are pending",
					testId: `${testId}-capabilities`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "space-y-2.5",
						children: capabilities.map((capability) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex items-start gap-2.5 text-sm text-foreground",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleDashed, { className: "mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "leading-relaxed text-muted-foreground",
								children: capability
							})]
						}, capability))
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					eyebrow: "Context",
					title: "Why you're seeing this",
					testId: `${testId}-note`,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col items-start gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-10 w-10 place-items-center rounded-xl border border-hairline bg-surface-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "h-4 w-4 text-muted-foreground" })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted-foreground",
								children: "This build focused on the five priority modules: Overview, Website Content, Notices, Events and Students. This module keeps its route, permissions and seeded records so the rest of the product stays coherent."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								size: "sm",
								className: "gap-1.5",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/admin/overview",
									"data-testid": `${testId}-to-overview`,
									children: "Back to Overview"
								})
							})
						]
					})
				})]
			})
		]
	});
}
//#endregion
export { ModulePlaceholder };
