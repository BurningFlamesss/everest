import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { dayLabel, relativeTime } from "./format-BBWmN55e.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Timeline-D_bg-_gg.js
var import_jsx_runtime = require_jsx_runtime();
var TONE_DOT = {
	neutral: "bg-muted-foreground/50",
	positive: "bg-success",
	negative: "bg-destructive",
	accent: "bg-accent"
};
function Timeline({ items, groupByDay = false, testId = "timeline" }) {
	if (!groupByDay) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
		className: "relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-hairline",
		"data-testid": testId,
		children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineRow, { item }, item.id))
	});
	const groups = items.reduce((acc, item) => {
		const key = item.at.slice(0, 10);
		acc[key] = acc[key] ? [...acc[key], item] : [item];
		return acc;
	}, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		"data-testid": testId,
		children: Object.entries(groups).map(([day, group]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 last:mb-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "eyebrow-label mb-2.5",
				children: dayLabel(day)
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
				className: "relative space-y-4 pl-6 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-hairline",
				children: group.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TimelineRow, { item }, item.id))
			})]
		}, day))
	});
}
function TimelineRow({ item }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "relative",
		"data-testid": "timeline-item",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("absolute -left-6 top-1.5 h-[7px] w-[7px] rounded-full ring-4 ring-surface-1", TONE_DOT[item.tone ?? "neutral"]) }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-baseline gap-x-2 gap-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm leading-snug text-foreground",
					children: item.title
				}), item.chip && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "rounded border border-hairline bg-surface-2 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground",
					children: item.chip
				})]
			}),
			item.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-xs leading-relaxed text-muted-foreground",
				children: item.description
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground",
				children: [
					item.actorAvatar && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: item.actorAvatar,
						alt: "",
						className: "h-4 w-4 rounded-full border border-hairline"
					}),
					item.actor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item.actor }),
					item.actor && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"aria-hidden": true,
						children: "·"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("time", {
						dateTime: item.at,
						children: relativeTime(item.at)
					})
				]
			})
		]
	});
}
//#endregion
export { Timeline };
