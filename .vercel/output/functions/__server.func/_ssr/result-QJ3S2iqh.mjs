import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { PageFrame, PageHeader, Route$43, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { ResultsChart } from "./ResultsChart-VqZpA6a5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/result-QJ3S2iqh.js
var import_jsx_runtime = require_jsx_runtime();
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$43.useLoaderData();
	useWebsitePageContent("result");
	const { results } = Route$43.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "RESULT",
		title: "Board results",
		lead: "Division splits over the last five sessions for secondary education exams."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-10 mb-16",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultsChart, { dbResults: results })
	})] });
}
//#endregion
export { RouteComponent as component };
