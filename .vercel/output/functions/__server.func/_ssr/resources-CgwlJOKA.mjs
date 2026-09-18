import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Download, FileText } from "../_libs/lucide-react.mjs";
import { Chip, Eyebrow, PageFrame, PageHeader, Route$44, WidgetCaption, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { formatAd, formatBs } from "./nepaliDate-D2jed4L4.mjs";
import { downloadCategories, downloads } from "./extras-gjgEyLlN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/resources-CgwlJOKA.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function slugify(s) {
	return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
function formatSize(kb) {
	return kb >= 1024 ? (kb / 1024).toFixed(1) + " MB" : kb + " KB";
}
/**
* B6.3 - Downloads centre. Format and size are shown before the click, never
* after it. The documents themselves are held in the school office CMS; this
* build issues a plain-text record card in their place rather than a dead link.
*/
function DownloadsCentre({ dbResources }) {
	const [cat, setCat] = (0, import_react.useState)(null);
	const sourceDownloads = (0, import_react.useMemo)(() => {
		if (dbResources && dbResources.length > 0) return dbResources.map((r) => ({
			...r,
			sizeKb: parseInt(r.fileSize) || 120,
			dateAd: r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "2024-05-15",
			format: r.kind || "PDF"
		}));
		return downloads;
	}, [dbResources]);
	const sourceCategories = (0, import_react.useMemo)(() => {
		if (dbResources && dbResources.length > 0) return Array.from(new Set(sourceDownloads.map((d) => d.category)));
		return downloadCategories;
	}, [dbResources, sourceDownloads]);
	const list = (0, import_react.useMemo)(() => cat ? sourceDownloads.filter((d) => d.category === cat) : sourceDownloads, [cat, sourceDownloads]);
	const issue = (title, meta) => {
		const blob = new Blob([
			"EVEREST ENGLISH BOARDING SECONDARY SCHOOL\r\n",
			"Pokhara, Kaski, Nepal\r\n\r\n",
			title + "\r\n",
			meta + "\r\n\r\n",
			"This record card stands in for the document, which is published from the\r\n",
			"school office content system. Collect the signed copy from the front office\r\n",
			"or telephone +977-61-460218.\r\n"
		], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "everest-" + slugify(title) + ".txt";
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		"data-testid": "downloads-centre",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Downloads" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "Format and size are shown before you tap anything." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center gap-2",
				"data-testid": "downloads-filters",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "u-label mr-2 text-n-600",
						children: "Category"
					}),
					sourceCategories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						selected: cat === c,
						onClick: () => setCat(cat === c ? null : c),
						testId: "chip-dl-" + slugify(c),
						children: c
					}, c)),
					cat ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
						selected: false,
						onClick: () => setCat(null),
						testId: "chip-dl-clear",
						children: "Clear"
					}) : null
				]
			}),
			list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "border-y-hair border-n-300 py-8 text-body-l text-ink",
				"data-testid": "downloads-empty",
				children: "Nothing is filed under that category yet."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "flex flex-col",
				children: list.map((d) => {
					const meta = `${d.format} · ${formatSize(d.sizeKb)} · updated ${formatBs(d.updated.bs)} BS (${formatAd(d.updated.ad)})`;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "border-t-hair border-n-200 last:border-b-hair",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => issue(d.title, meta),
							"data-testid": "download-" + d.id,
							className: "group flex w-full flex-wrap items-center gap-x-6 gap-y-2 py-4 text-left transistion-colors duration-fast !border-0 !bg-transparent focus-visible:outline-none focus-visible:ring-0 hover:bg-secondary/50",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, {
									"aria-hidden": "true",
									size: 16,
									className: "shrink-0 text-accent"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "min-w-0 flex-1 text-body-m text-ink",
									children: d.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label text-n-600",
									children: d.category
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label tnum w-[72px] text-n-600",
									children: d.format
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "u-label tnum w-[84px] text-n-600",
									children: formatSize(d.sizeKb)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "u-label tnum hidden w-[168px] text-n-600 lg:block",
									children: [formatBs(d.updated.bs), " BS"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, {
									"aria-hidden": "true",
									size: 16,
									className: "shrink-0 text-ink transition-transform duration-micro ease-state group-hover:translate-y-[3px]"
								})
							]
						})
					}, d.id);
				})
			})
		]
	});
}
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$44.useLoaderData();
	useWebsitePageContent("resources");
	const { resources } = Route$44.useLoaderData();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "Resources",
		title: "Downloads and Materials",
		lead: "Access important files, forms, and documents for the academic session."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-10 mb-16",
		"data-testid": "resources-downloads",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadsCentre, { dbResources: resources })
	})] });
}
//#endregion
export { RouteComponent as component };
