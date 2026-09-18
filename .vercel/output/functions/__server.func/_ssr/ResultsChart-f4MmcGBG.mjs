import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Eyebrow, WidgetCaption } from "./router-dKngB4cM.mjs";
import { Segmented } from "./Segmented-DUXR0cXM.mjs";
import { nebResults, seeResults } from "./extras-Ul1C4gDV.mjs";
import { BarElement, CategoryScale, Chart, LinearScale, plugin_legend, plugin_tooltip } from "../_libs/chart.js.mjs";
import { Bar } from "../_libs/react-chartjs-2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ResultsChart-f4MmcGBG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Colour tokens — the ONLY place a hex value may appear in this codebase.
* Red, Yellow, Black, White colour scheme.
* Roles and restrictions are enforced by /styleguide, which measures every
* ratio at runtime from these values rather than quoting them from a doc.
*/
var color = {
	/** Red - Primary action color, errors, focus rings */
	red: "#DC2626",
	/** Darker red for hover states */
	redDark: "#B91C1C",
	/** Light red for backgrounds */
	redLight: "#FEF2F2",
	/** Yellow - Accent color, highlights, selection */
	yellow: "#EAB308",
	/** Darker yellow for hover states */
	yellowDark: "#F59E0B",
	/** Light yellow for backgrounds */
	yellowLight: "#FEFCE8",
	/** Black - Primary text, borders, high contrast elements */
	black: "#000000",
	/** White - Backgrounds, surfaces, text on dark */
	white: "#FFFFFF",
	/** Near-white surface */
	gray50: "#FAFAFA",
	/** Light surface */
	gray100: "#F5F5F5",
	/** Default border, subtle separators */
	gray200: "#E5E5E5",
	/** Stronger borders, input borders */
	gray300: "#D4D4D4",
	/** Disabled elements, placeholder text */
	gray400: "#A3A3A3",
	/** Muted text, secondary information */
	gray500: "#737373",
	/** Body text alternative */
	gray600: "#525252",
	/** Stronger text */
	gray700: "#404040",
	/** Near-black text */
	gray800: "#262626",
	/** Almost black */
	gray900: "#171717"
};
/**
* Typography tokens. Three Latin faces: Inter, Manrope, Playfair Display.
* Weights: Regular (400) and Medium (500) only.
* Every clamp() below is computed for a 360px → 1440px range.
*/
var font = {
	display: "'Playfair Display', Georgia, serif",
	body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
	label: "'Manrope', system-ui, -apple-system, 'Segoe UI', sans-serif",
	mono: "'JetBrains Mono', ui-monospace, 'SFMono-Regular', monospace"
};
Chart.register(CategoryScale, LinearScale, BarElement, plugin_tooltip, plugin_legend);
/**
* B6.2 - Board results. A chart for the shape of it, and a real data table
* beneath as the accessible equivalent rather than an afterthought.
*/
function ResultsChart({ dbResults }) {
	const [board, setBoard] = (0, import_react.useState)("see");
	const activeFallback = board === "see" ? seeResults : nebResults;
	const rows = (0, import_react.useMemo)(() => {
		let source = activeFallback;
		if (dbResults && dbResults.length > 0) source = dbResults.filter((r) => r.board.toLowerCase() === board);
		return [...source].sort((a, b) => Number(b.year) - Number(a.year));
	}, [
		dbResults,
		board,
		activeFallback
	]);
	const data = (0, import_react.useMemo)(() => ({
		labels: rows.map((r) => r.year),
		datasets: [
			{
				label: "Second division",
				data: rows.map((r) => r.secondDivision),
				backgroundColor: color.gray300,
				borderWidth: 0
			},
			{
				label: "First division",
				data: rows.map((r) => r.firstDivision),
				backgroundColor: color.yellow,
				borderWidth: 0
			},
			{
				label: "Distinction",
				data: rows.map((r) => r.distinction),
				backgroundColor: color.red,
				borderWidth: 0
			}
		]
	}), [rows]);
	const options = {
		responsive: true,
		maintainAspectRatio: false,
		scales: {
			x: {
				stacked: true,
				grid: { display: false },
				ticks: {
					color: color.gray600,
					font: {
						family: font.label,
						size: 11
					}
				},
				border: { color: color.gray300 }
			},
			y: {
				stacked: true,
				grid: { color: color.gray100 },
				ticks: {
					color: color.gray600,
					font: {
						family: font.label,
						size: 11
					}
				},
				border: { display: false }
			}
		},
		plugins: {
			legend: {
				position: "bottom",
				reverse: true,
				labels: {
					color: color.gray600,
					font: {
						family: font.label,
						size: 11
					},
					boxWidth: 10,
					boxHeight: 10
				}
			},
			tooltip: {
				backgroundColor: color.black,
				titleFont: {
					family: font.label,
					size: 11
				},
				bodyFont: {
					family: font.body,
					size: 13
				},
				padding: 12,
				cornerRadius: 12
			}
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		"data-testid": "results-chart",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Board results" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "Division splits over the last five sessions." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
				label: "Board",
				value: board,
				onChange: setBoard,
				testId: "results-board",
				options: [{
					value: "see",
					label: "SEE · Grade 10"
				}, {
					value: "neb",
					label: "NEB · Grade 12"
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-[320px] w-full",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
					data,
					options
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto u-edge-fade",
				tabIndex: 0,
				role: "region",
				"aria-label": "Board results by year, scrolls horizontally",
				"data-testid": "results-table-scroll",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] border-collapse text-left",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("caption", {
							className: "u-label pb-4 text-left text-n-600",
							children: [
								board === "see" ? "Secondary Education Examination" : "National Examinations Board, grade 12",
								" ",
								"· appeared, passed and division split by session"
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: [
							"Session",
							"Appeared",
							"Passed",
							"Pass rate",
							"Distinction",
							"First",
							"Second"
						].map((h) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "u-label border-b-hair border-n-300 py-3 pr-6 text-n-600",
							children: h
						}, h)) }) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							"data-testid": "results-row-" + r.yearBs,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									scope: "row",
									className: "u-label border-b-hair border-n-200 py-3 pr-6 text-ink",
									children: r.year
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: r.appeared
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: r.passed
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: [Math.round(r.passed / r.appeared * 1e3) / 10, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: r.distinction
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: r.firstDivision
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tnum border-b-hair border-n-200 py-3 pr-6 text-body-m text-ink",
									children: r.secondDivision
								})
							]
						}, r.year)) })
					]
				})
			})
		]
	});
}
//#endregion
export { ResultsChart };
