import { photos } from "./router-B6FnglFX.mjs";
import "./courses-BOU_zwBC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fees-CfgHNLg2.js
photos.classroomLesson, photos.classroomEmpty, photos.classroomStudents, photos.labGlass, photos.labWork, photos.labPour, photos.computerLab, photos.computerDesks, photos.laptopWork, photos.hostelRoom, photos.hostelWash, photos.libraryGroup, photos.library, photos.libraryAisle, photos.libraryReading, photos.libraryStacks, photos.canteenInterior, photos.canteenCounter, photos.canteenMeal, photos.medicalRoom, photos.medicalNurse, photos.sportsTrack, photos.sportsField, photos.sportsCourt, photos.sportsTeam, photos.road, photos.campusFacade;
/**
* Bus routes. This is the ONLY place a transport fare is authored anywhere on
* the site — the fee estimator reads `monthlyFare` from this same record, which
* is why the two widgets cannot disagree.
*/
var busRoutes = [
	{
		id: "route-lakeside",
		name: "Lakeside – Bagar Loop",
		busNo: "GA 2 KHA 4821",
		monthlyFare: 1650,
		band: "under3",
		path: "M 30 120 L 140 104 L 250 112 L 360 92 L 470 100 L 580 78 L 690 84",
		stops: [
			{
				id: "st-prithvi",
				name: "Prithvi Chowk",
				nameNe: "पृथ्वी चोक",
				landmark: "Pokhara Bus Park",
				pickup: "06:52",
				drop: "16:18",
				order: 1
			},
			{
				id: "st-nadipur",
				name: "Nadipur",
				nameNe: "नदीपुर",
				landmark: "Nadipur Patan",
				pickup: "06:57",
				drop: "16:13",
				order: 2
			},
			{
				id: "st-chipledhunga",
				name: "Chipledhunga",
				nameNe: "चिप्लेढुङ्गा",
				landmark: "Mahendrapul",
				pickup: "07:03",
				drop: "16:07",
				order: 3
			},
			{
				id: "st-bagar",
				name: "Bagar",
				nameNe: "बागर",
				landmark: "Bagar Chautari",
				pickup: "07:09",
				drop: "16:01",
				order: 4
			},
			{
				id: "st-baidam",
				name: "Baidam",
				nameNe: "बैदाम",
				landmark: "Barahi Chowk",
				pickup: "07:15",
				drop: "15:55",
				order: 5
			},
			{
				id: "st-lakeside",
				name: "Lakeside",
				nameNe: "लेकसाईड",
				landmark: "Hallan Chowk",
				pickup: "07:21",
				drop: "15:49",
				order: 6
			}
		]
	},
	{
		id: "route-amarsingh",
		name: "Amarsingh – Birauta Line",
		busNo: "GA 1 KHA 2290",
		monthlyFare: 2400,
		band: "3to6",
		path: "M 30 60 L 140 78 L 250 66 L 360 88 L 470 74 L 580 96 L 690 82",
		stops: [
			{
				id: "st-amarsingh",
				name: "Amarsingh Chowk",
				nameNe: "अमरसिंह चोक",
				landmark: "Amarsingh Gate",
				pickup: "06:40",
				drop: "16:30",
				order: 1
			},
			{
				id: "st-simalchaur",
				name: "Simalchaur",
				nameNe: "सिमलचौर",
				landmark: "Simalchaur Ground",
				pickup: "06:46",
				drop: "16:24",
				order: 2
			},
			{
				id: "st-ranipauwa",
				name: "Ranipauwa",
				nameNe: "रानीपौवा",
				landmark: "Ranipauwa Gate",
				pickup: "06:52",
				drop: "16:18",
				order: 3
			},
			{
				id: "st-bijayapur",
				name: "Bijayapur",
				nameNe: "बिजयपुर",
				landmark: "Bijayapur Bridge",
				pickup: "06:59",
				drop: "16:11",
				order: 4
			},
			{
				id: "st-deep",
				name: "Deep",
				nameNe: "दीप",
				landmark: "Deep Chowk",
				pickup: "07:06",
				drop: "16:04",
				order: 5
			},
			{
				id: "st-birauta",
				name: "Birauta",
				nameNe: "बिरौटा",
				landmark: "Birauta Chowk",
				pickup: "07:13",
				drop: "15:57",
				order: 6
			}
		]
	},
	{
		id: "route-hemja",
		name: "Hemja – Batulechaur Line",
		busNo: "GA 2 KHA 5514",
		monthlyFare: 3100,
		band: "over6",
		path: "M 30 170 L 140 150 L 250 162 L 360 140 L 470 152 L 580 132 L 690 142",
		stops: [
			{
				id: "st-hemja",
				name: "Hemja",
				nameNe: "हेम्जा",
				landmark: "Hemja Bazaar",
				pickup: "06:15",
				drop: "16:52",
				order: 1
			},
			{
				id: "st-dhungesanghu",
				name: "Dhungesanghu",
				nameNe: "ढुङ्गेसाँघु",
				landmark: "Dhungesanghu Bridge",
				pickup: "06:22",
				drop: "16:45",
				order: 2
			},
			{
				id: "st-milanchowk",
				name: "Milanchowk",
				nameNe: "मिलनचोक",
				landmark: "Milanchowk Gate",
				pickup: "06:31",
				drop: "16:36",
				order: 3
			},
			{
				id: "st-batulechaur",
				name: "Batulechaur",
				nameNe: "बटुलेचौर",
				landmark: "Batulechaur Temple",
				pickup: "06:40",
				drop: "16:27",
				order: 4
			},
			{
				id: "st-vindhyabasini",
				name: "Vindhyabasini",
				nameNe: "बिन्ध्यबासिनी",
				landmark: "Temple Steps",
				pickup: "06:49",
				drop: "16:18",
				order: 5
			},
			{
				id: "st-miruwa",
				name: "Miruwa",
				nameNe: "मिरुवा",
				landmark: "Miruwa Tole",
				pickup: "06:58",
				drop: "16:09",
				order: 6
			}
		]
	}
];
/** Which stop belongs to which searchable area. */
var stopArea = {
	"st-prithvi": "prithvi",
	"st-nadipur": "nadipur",
	"st-chipledhunga": "chipledhunga",
	"st-bagar": "bagar",
	"st-baidam": "lakeside",
	"st-lakeside": "lakeside",
	"st-amarsingh": "amarsingh",
	"st-simalchaur": "simalchaur",
	"st-ranipauwa": "ranipauwa",
	"st-bijayapur": "bijayapur",
	"st-deep": "deep",
	"st-birauta": "birauta",
	"st-hemja": "hemja",
	"st-dhungesanghu": "dhungesanghu",
	"st-milanchowk": "milanchowk",
	"st-batulechaur": "batulechaur",
	"st-vindhyabasini": "vindhyabasini",
	"st-miruwa": "miruwa"
};
var areaAliases = [
	{
		areaId: "prithvi",
		ward: 8,
		aliases: [
			"Prithvi Chowk",
			"पृथ्वी चोक",
			"Bus Park",
			"Prithbi Chowk"
		]
	},
	{
		areaId: "nadipur",
		ward: 3,
		aliases: [
			"Nadipur",
			"नदीपुर",
			"Nadipur Patan"
		]
	},
	{
		areaId: "chipledhunga",
		ward: 8,
		aliases: [
			"Chipledhunga",
			"चिप्लेढुङ्गा",
			"Mahendrapul",
			"New Road"
		]
	},
	{
		areaId: "bagar",
		ward: 1,
		aliases: [
			"Bagar",
			"बागर",
			"Bagar Chautari"
		]
	},
	{
		areaId: "lakeside",
		ward: 6,
		aliases: [
			"Lakeside",
			"लेकसाईड",
			"Baidam",
			"बैदाम",
			"Hallan Chowk",
			"Barahi Chowk"
		]
	},
	{
		areaId: "amarsingh",
		ward: 11,
		aliases: [
			"Amarsingh Chowk",
			"अमरसिंह चोक",
			"Amarsingh"
		]
	},
	{
		areaId: "simalchaur",
		ward: 12,
		aliases: [
			"Simalchaur",
			"सिमलचौर",
			"Simalchaur Ground"
		]
	},
	{
		areaId: "ranipauwa",
		ward: 16,
		aliases: ["Ranipauwa", "रानीपौवा"]
	},
	{
		areaId: "bijayapur",
		ward: 15,
		aliases: [
			"Bijayapur",
			"बिजयपुर",
			"Bijayapur Bridge"
		]
	},
	{
		areaId: "deep",
		ward: 17,
		aliases: [
			"Deep",
			"दीप",
			"Deep Chowk"
		]
	},
	{
		areaId: "birauta",
		ward: 17,
		aliases: [
			"Birauta",
			"बिरौटा",
			"Birauta Chowk"
		]
	},
	{
		areaId: "hemja",
		ward: 25,
		aliases: [
			"Hemja",
			"हेम्जा",
			"Hemja Bazaar"
		]
	},
	{
		areaId: "dhungesanghu",
		ward: 24,
		aliases: ["Dhungesanghu", "ढुङ्गेसाँघु"]
	},
	{
		areaId: "milanchowk",
		ward: 22,
		aliases: [
			"Milanchowk",
			"मिलनचोक",
			"Milan Chowk"
		]
	},
	{
		areaId: "batulechaur",
		ward: 2,
		aliases: ["Batulechaur", "बटुलेचौर"]
	},
	{
		areaId: "vindhyabasini",
		ward: 3,
		aliases: [
			"Vindhyabasini",
			"बिन्ध्यबासिनी",
			"Bindhyabasini",
			"Temple Steps"
		]
	},
	{
		areaId: "miruwa",
		ward: 26,
		aliases: [
			"Miruwa",
			"मिरुवा",
			"Miruwa Tole"
		]
	}
];
/** Shown as chips beneath the search field so the finder is usable without typing. */
var popularAreas = [
	"Lakeside",
	"Bagar",
	"Amarsingh Chowk",
	"Bijayapur",
	"Hemja",
	"Batulechaur"
];
var npr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
/** Nepali convention: lakh grouping, e.g. NPR 1,23,456. */
function formatNpr(n) {
	if (n === null || n === void 0 || !Number.isFinite(n)) return "—";
	return `NPR ${npr.format(n)}`;
}
//#endregion
export { areaAliases, busRoutes, formatNpr, popularAreas, stopArea };
