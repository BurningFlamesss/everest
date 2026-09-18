import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Skeleton } from "./skeleton-Dhh7pexn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/Skeletons-CyC1V-yb.js
var import_jsx_runtime = require_jsx_runtime();
function TableSkeleton({ rows = 6, columns = 5 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "divide-y divide-hairline",
		"data-testid": "table-skeleton",
		children: Array.from({ length: rows }).map((_, r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-4 px-4 py-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-8 shrink-0 rounded-full" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-[22%]" }),
				Array.from({ length: Math.max(0, columns - 2) }).map((__, c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-[12%]" }, c)),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "ml-auto h-3 w-12" })
			]
		}, r))
	});
}
function PanelSkeleton({ height = "h-52" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel p-4",
		"data-testid": "panel-skeleton",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-3 h-3.5 w-32" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: `w-full ${height}` })]
	});
}
function MetricsSkeleton({ count = 8 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8",
		"data-testid": "metrics-skeleton",
		children: Array.from({ length: count }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel p-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-2 h-2.5 w-16" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mb-2 h-5 w-12" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-6 w-full" })
			]
		}, i))
	});
}
function ListSkeleton({ rows = 4 }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2.5",
		"data-testid": "list-skeleton",
		children: Array.from({ length: rows }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-8 rounded-md" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-2.5 w-1/3" })]
			})]
		}, i))
	});
}
function DetailSkeleton() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		"data-testid": "detail-skeleton",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "panel flex items-center gap-4 p-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 w-16 rounded-xl" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex-1 space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-4 w-56" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-40" })]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4 lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-32" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-64" })]
		})]
	});
}
//#endregion
export { DetailSkeleton, ListSkeleton, MetricsSkeleton, PanelSkeleton, TableSkeleton };
