import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { ImageOff } from "../_libs/lucide-react.mjs";
import { Skeleton } from "./kit-Cq_igxhQ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/media-CDFoNHKI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var RATIO_CLASS = {
	feature: "aspect-[16/10]",
	wide: "aspect-[16/9]",
	square: "aspect-square",
	portrait: "aspect-[4/5]"
};
/**
* Image with genuine loading and error states, a warm tonal overlay,
* and an optional monospaced caption under a hairline.
*/
var EditorialImage = ({ src, alt, ratio = "feature", caption, className = "", imageClassName = "", testId, onClick }) => {
	const [state, setState] = (0, import_react.useState)("loading");
	const frame = /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: `relative overflow-hidden rounded-card border border-border bg-secondary ${RATIO_CLASS[ratio]} ${className}`,
		children: [
			state === "loading" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, {
				className: "absolute inset-0 rounded-none",
				"data-testid": "loading-skeleton"
			}) : null,
			state === "error" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "absolute inset-0 flex flex-col items-center justify-center gap-2 bg-secondary text-muted-foreground",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOff, {
					className: "h-5 w-5",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "t-caption",
					children: "Image unavailable"
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src,
				alt,
				loading: "lazy",
				decoding: "async",
				onLoad: () => setState("ready"),
				onError: () => setState("error"),
				className: `h-full w-full object-cover transition-opacity duration-slow ${state === "ready" ? "opacity-100" : "opacity-0"} ${imageClassName}`
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": "true",
				className: "pointer-events-none absolute inset-0 bg-[#FEF2F2]-1/10 mix-blend-multiply dark:bg-transparent"
			})
		]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		"data-testid": testId,
		className: "min-w-0",
		children: [onClick ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick,
			"aria-label": `Open larger view: ${alt}`,
			className: "group block w-full cursor-zoom-in rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
			children: frame
		}) : frame, caption ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figcaption", {
			className: "mt-3 flex items-start gap-2.5 border-t border-rule-soft pt-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mt-[7px] h-1 w-1 shrink-0 rounded-full bg-accent",
				"aria-hidden": "true"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "t-meta leading-relaxed",
				children: caption
			})]
		}) : null]
	});
};
/**
* Verified image manifest.
*
* Every id below was HTTP-200 validated AND visually inspected on a contact
* sheet before being committed, so the key names describe what the photograph
* actually shows. Use `photo()` / `thumb()` so sizing stays consistent.
*/
var BASE = "https://images.unsplash.com";
var ID = {
	classroomTeens: "photo-1509062522246-3755977927d7",
	emptyClassroom: "photo-1580582932707-520aed937b7b",
	primaryClassroom: "photo-1577896851231-70ef18881754",
	youngLearners: "photo-1588072432836-e10032774350",
	earlyLearning: "photo-1503676260728-1c00da094a0b",
	lectureRoom: "photo-1524178232363-1fb2b075b655",
	equations: "photo-1509228468518-180dd4864904",
	writingHands: "photo-1503428593586-e225b39bddfe",
	libraryHall: "photo-1568667256549-094345857637",
	bookshelves: "photo-1481627834876-b7833e8f5570",
	libraryShelf: "photo-1521587760476-6c12a4b040da",
	booksStacked: "photo-1533669955142-6a73332af4db",
	booksSpines: "photo-1497633762265-9d179a990aa6",
	studentLibrary: "photo-1567168539593-59673ababaae",
	readingSupport: "photo-1583468982228-19f19164aee2",
	laboratory: "photo-1579154204601-01588f351e67",
	labGlassware: "photo-1532094349884-543bc11b234d",
	colouredFlasks: "photo-1554475900-0a0350e3fc7b",
	microscope: "photo-1582719471384-894fbb16e074",
	dnaHelix: "photo-1628595351029-c2bf17511435",
	molecule: "photo-1594026112284-02bb6f3352fe",
	labCoat: "photo-1576091160399-112ba8d25d1d",
	computerLab: "photo-1531482615713-2afd69097998",
	studyPair: "photo-1522202176988-66273c2fd55f",
	studentsTeamwork: "photo-1543269865-cbf427effbad",
	studentGroup: "photo-1517486808906-6ca8b3f04846",
	studentsWithBooks: "photo-1571260899304-425eee4c7efc",
	teacherPortrait: "photo-1580894732444-8ecded7900cd",
	athleticsTrack: "photo-1461896836934-ffe607ba8211",
	pitchLine: "photo-1459865264687-595d652de67e",
	basketball: "photo-1546519638-68e109498ffc",
	indoorGym: "photo-1571902943202-507ec2618e8f",
	schoolBuilding: "photo-1562774053-701939374585",
	auditoriumAudience: "photo-1540575467063-178a50c2df87",
	auditoriumSeats: "photo-1519452575417-564c1401ecc0",
	assemblyCrowd: "photo-1517457373958-b7bdd4587205",
	hostelRoom: "photo-1555854877-bab0e564b8d5",
	diningHall: "photo-1567521464027-f127ff144326",
	nutritionBowl: "photo-1546069901-ba9599a7e63c",
	healthRoom: "photo-1519494026892-80bbd2d6fd0d",
	coachBus: "photo-1570125909232-eb263c188f7e",
	busFront: "photo-1557223562-6c77ef16210f",
	seedlings: "photo-1523348837708-15d4a09cfac2",
	gardening: "photo-1416879595882-3373a0480b5b",
	himalaya: "photo-1544735716-392fe2489ffa",
	musicStage: "photo-1514320291840-2e0a9bf2a9ae",
	performingArts: "photo-1493225457124-a3eb161ffa5f",
	craftSupplies: "photo-1452860606245-08befc0ff44b",
	paintBrushes: "photo-1460661419201-fd4cecdf8a8b",
	paintBrush: "photo-1513364776144-60967b0f800f",
	illustration: "photo-1596548438137-d51ea5c83ca5",
	abstractArt: "photo-1541961017774-22349e4a1262"
};
/** Wide editorial image (feature panels, programme headers). */
var photo = (key, width = 1600) => `${BASE}/${ID[key]}?auto=format&fit=crop&w=${width}&q=80`;
/** Square thumbnail (rails, gallery tiles). */
var thumb = (key, size = 480) => `${BASE}/${ID[key]}?auto=format&fit=crop&w=${size}&h=${size}&q=75`;
//#endregion
export { EditorialImage, photo, thumb };
