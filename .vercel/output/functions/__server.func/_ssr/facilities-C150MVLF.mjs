import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Clock3, Expand, MapPin, Quote, UserRound } from "../_libs/lucide-react.mjs";
import { PageFrame, PageHeader, Reveal, Route$48, SectionHeading, school, useWebsitePageContent } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./kit-Cq_igxhQ.mjs";
import { EditorialImage, photo, thumb } from "./media-CDFoNHKI.mjs";
import { EmptyState } from "./EmptyState-CpUK2QdS.mjs";
import { FilterChips } from "./FilterChips-CvLOSi1H.mjs";
import { DownloadButton, downloadOfficialPdf, facilityBriefDoc, facilityIndexDoc } from "./DownloadButton-DFu4Krfj.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/facilities-C150MVLF.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var facilities = [
	{
		id: "central-library",
		name: "Central Library & Reading Hall",
		category: "Academic",
		block: "Academic Block · First floor",
		blurb: "14,200 catalogued titles, a silent reading hall, and a reference desk staffed through every period.",
		description: "The library occupies the whole first floor of the academic block and is deliberately split in two: an open browsing area where talking is allowed, and a silent reading hall with forty individual carrels. The NEB reference section holds past papers going back fourteen years, and the librarian keeps a running waitlist for the most-requested titles so nothing sits unavailable for long.",
		image: photo("libraryHall"),
		gallery: [
			thumb("bookshelves"),
			thumb("libraryShelf"),
			thumb("studentLibrary")
		],
		stats: [
			{
				label: "Catalogued titles",
				value: "14,200"
			},
			{
				label: "Reading seats",
				value: "96"
			},
			{
				label: "Silent carrels",
				value: "40"
			},
			{
				label: "Past papers archive",
				value: "14 years"
			}
		],
		hours: "Sunday – Friday, 06:15 – 17:30",
		inCharge: "Manju Limbu, Librarian",
		studentsLove: "The silent hall stays open until half past five, so hostel and day students both get a quiet hour before going home.",
		since: "Renovated 2081 BS"
	},
	{
		id: "physics-chemistry-lab",
		name: "Physics & Chemistry Laboratories",
		category: "Laboratory",
		block: "Science Block · Ground floor",
		blurb: "Two full-size laboratories with fume extraction, running one practical group per period.",
		description: "The Physics and Chemistry laboratories sit side by side with a shared preparation room between them. Both are sized for a full practical group of twenty-four, which is why the +2 timetable can guarantee three practical periods a week rather than rotating students through a single shared room. Chemistry has bench-level fume extraction at every station and an eyewash point at both ends.",
		image: photo("laboratory"),
		gallery: [
			thumb("labGlassware"),
			thumb("colouredFlasks"),
			thumb("molecule")
		],
		stats: [
			{
				label: "Work stations",
				value: "24 per lab"
			},
			{
				label: "Practical periods",
				value: "3 weekly"
			},
			{
				label: "Fume extraction",
				value: "Bench-level"
			},
			{
				label: "Prescribed practicals",
				value: "100% covered"
			}
		],
		hours: "Sunday – Friday, 06:30 – 15:45",
		inCharge: "Nabin Chaudhary & Sunita Adhikari",
		studentsLove: "Nothing is demonstrated from the front. Every student handles the apparatus, every week, with their own record book.",
		since: "Expanded 2080 BS"
	},
	{
		id: "biology-microscopy",
		name: "Biology & Microscopy Laboratory",
		category: "Laboratory",
		block: "Science Block · First floor",
		blurb: "Thirty compound microscopes and a maintained specimen collection for the Biology group.",
		description: "A dedicated microscopy room means Biology group students never share an eyepiece. The specimen collection — botanical mounts, preserved zoological samples and a set of prepared slides — is audited each session and replenished from the annual laboratory budget. A cold cabinet keeps fresh material usable across a full week of practicals.",
		image: photo("microscope"),
		gallery: [
			thumb("dnaHelix"),
			thumb("colouredFlasks"),
			thumb("labGlassware")
		],
		stats: [
			{
				label: "Compound microscopes",
				value: "30"
			},
			{
				label: "Prepared slides",
				value: "420+"
			},
			{
				label: "Preserved specimens",
				value: "180+"
			},
			{
				label: "Students per scope",
				value: "1"
			}
		],
		hours: "Sunday – Friday, 06:30 – 15:00",
		inCharge: "Prakash Bhandari, Head of Biology",
		studentsLove: "You get your own microscope for the whole period — which matters when you are learning to focus and stain at the same time.",
		since: "Established 2079 BS"
	},
	{
		id: "computer-robotics-lab",
		name: "Computer & Robotics Laboratory",
		category: "Technology",
		block: "Technology Wing · Second floor",
		blurb: "Sixty workstations, fibre internet, and a robotics bench that stays open after school.",
		description: "Two adjoining rooms hold sixty workstations on a wired network, backed by a 200 Mbps fibre line and an inverter that keeps the lab running through load-shedding. The robotics bench along the far wall is stocked with microcontroller kits, a 3D printer and hand tools, and it is the one facility on campus that stays unlocked until half past four for club work.",
		image: photo("computerLab"),
		gallery: [
			thumb("studentsTeamwork"),
			thumb("studentGroup"),
			thumb("lectureRoom")
		],
		stats: [
			{
				label: "Workstations",
				value: "60"
			},
			{
				label: "Internet",
				value: "200 Mbps fibre"
			},
			{
				label: "Backup power",
				value: "Full inverter"
			},
			{
				label: "3D printers",
				value: "2"
			}
		],
		hours: "Sunday – Friday, 06:30 – 16:30",
		inCharge: "Sabin Rana Magar, Head of Computer Science",
		studentsLove: "The robotics bench is open after class, and the exhibition builds genuinely get finished there rather than at home.",
		since: "Upgraded 2082 BS"
	},
	{
		id: "smart-classrooms",
		name: "Smart Classrooms",
		category: "Academic",
		block: "Main Block · All floors",
		blurb: "Thirty-two classrooms with projection, capped at 32 desks, all naturally cross-ventilated.",
		description: "Every teaching room has a ceiling-mounted projector, a whiteboard sized for worked solutions, and windows on two walls — a deliberate choice for the Butwal summer. Enrolment per section is capped at thirty-two so that the back row is still within speaking distance of the board. Recorded lessons from the +2 mock series are replayed here during revision weeks.",
		image: photo("lectureRoom"),
		gallery: [
			thumb("emptyClassroom"),
			thumb("classroomTeens"),
			thumb("equations")
		],
		stats: [
			{
				label: "Classrooms",
				value: "32"
			},
			{
				label: "Desks per section",
				value: "32 max"
			},
			{
				label: "Projection",
				value: "All rooms"
			},
			{
				label: "Ventilation",
				value: "Cross, two-wall"
			}
		],
		hours: "Sunday – Friday, 06:15 – 16:00",
		inCharge: "Kabita Shrestha, Secondary Level Coordinator",
		studentsLove: "Thirty-two to a room means the teacher actually reaches your desk during a problem set.",
		since: "Fitted 2081 BS"
	},
	{
		id: "auditorium",
		name: "Auditorium & Assembly Hall",
		category: "Campus",
		block: "Central Block · Ground floor",
		blurb: "A 620-seat hall used for assembly, debate finals, results ceremonies and parent meetings.",
		description: "The auditorium is the one room large enough to hold two full levels at once, and it earns its keep: morning assembly, the inter-house debate finals, the SEE felicitation programme and every parent-teacher meeting happen here. Acoustic panelling was added along the side walls in 2082 after complaints that the back rows could not follow the debate.",
		image: photo("auditoriumAudience"),
		gallery: [
			thumb("auditoriumSeats"),
			thumb("assemblyCrowd"),
			thumb("performingArts")
		],
		stats: [
			{
				label: "Seating",
				value: "620"
			},
			{
				label: "Stage width",
				value: "11 m"
			},
			{
				label: "Acoustic panelling",
				value: "Added 2082 BS"
			},
			{
				label: "Events per year",
				value: "40+"
			}
		],
		hours: "By schedule · Assembly daily at 09:45",
		inCharge: "Ramesh Kumar Thapa, Vice Principal (Administration)",
		studentsLove: "Debate finals in a full hall are the loudest thing that happens on campus all year.",
		since: "Built 2074 BS"
	},
	{
		id: "athletics-ground",
		name: "Athletics Ground & Practice Track",
		category: "Sports",
		block: "South Campus",
		blurb: "A full-size football pitch with a four-lane practice track around it.",
		description: "The south ground carries a full-size football pitch, a four-lane 200-metre practice track and a long-jump pit at the far end. It drains well enough to stay usable through most of the monsoon, which is why the inter-house athletics meet is scheduled in Shrawan rather than waiting for the dry season.",
		image: photo("athleticsTrack"),
		gallery: [
			thumb("pitchLine"),
			thumb("basketball"),
			thumb("himalaya")
		],
		stats: [
			{
				label: "Football pitch",
				value: "Full size"
			},
			{
				label: "Practice track",
				value: "4 lanes · 200 m"
			},
			{
				label: "Long jump pit",
				value: "1"
			},
			{
				label: "Houses competing",
				value: "4"
			}
		],
		hours: "Sunday – Friday, 06:00 – 18:00",
		inCharge: "Tek Bahadur Rai, Head of Physical Education",
		studentsLove: "It drains fast. You can be back on the pitch the same afternoon it stops raining.",
		since: "Levelled 2078 BS"
	},
	{
		id: "indoor-sports",
		name: "Indoor Sports & Basketball Court",
		category: "Sports",
		block: "South Campus · Covered court",
		blurb: "A covered court for basketball, volleyball, badminton and table tennis — usable in any weather.",
		description: "The covered court is what keeps sport running from Ashadh through Bhadra. Its markings serve basketball and volleyball, four badminton courts can be set up across it, and six table tennis boards live along the side. Because it is roofed rather than walled, it stays cool without air conditioning.",
		image: photo("basketball"),
		gallery: [
			thumb("indoorGym"),
			thumb("athleticsTrack"),
			thumb("pitchLine")
		],
		stats: [
			{
				label: "Basketball courts",
				value: "1 full"
			},
			{
				label: "Badminton courts",
				value: "4"
			},
			{
				label: "Table tennis boards",
				value: "6"
			},
			{
				label: "Monsoon usable",
				value: "Yes"
			}
		],
		hours: "Sunday – Friday, 06:00 – 18:30",
		inCharge: "Tek Bahadur Rai, Head of Physical Education",
		studentsLove: "Table tennis during the lunch break, every single day, rain or not.",
		since: "Roofed 2080 BS"
	},
	{
		id: "hostel",
		name: "Residential Hostel Blocks",
		category: "Residential",
		block: "East Campus · Separate boys & girls blocks",
		blurb: "Four-bed rooms, a supervised evening study hall, and a resident warden in each block.",
		description: "Boarding students live in two separate blocks, each with a resident warden and a matron. Rooms hold four beds with individual study desks and lockable storage. The supervised study hall runs 19:00 to 21:00 with a subject teacher on duty, and lights-out is 22:00 for junior and 22:30 for +2 residents.",
		image: photo("schoolBuilding"),
		gallery: [
			thumb("hostelRoom"),
			thumb("diningHall"),
			thumb("seedlings")
		],
		stats: [
			{
				label: "Capacity",
				value: "240 residents"
			},
			{
				label: "Beds per room",
				value: "4"
			},
			{
				label: "Supervised study",
				value: "19:00 – 21:00"
			},
			{
				label: "Resident staff",
				value: "8"
			}
		],
		hours: "Residential · Visiting hours Saturday 10:00 – 16:00",
		inCharge: "Sarita Gurung, Vice Principal (Academics)",
		studentsLove: "A subject teacher is on duty during evening study, so a stuck question does not have to wait until morning.",
		since: "Rebuilt 2077 BS"
	},
	{
		id: "dining-hall",
		name: "Dining Hall & Nutrition Centre",
		category: "Residential",
		block: "East Campus · Ground floor",
		blurb: "A 280-seat hall with a published weekly menu and a dietitian-reviewed rotation.",
		description: "The dining hall seats 280 in one sitting and runs four services a day for residents plus a lunch service for day students. The weekly menu is published on the notice board every Friday and reviewed each term by a visiting dietitian; the kitchen keeps a separate vegetarian line and accommodates documented allergies on written request.",
		image: photo("diningHall"),
		gallery: [
			thumb("nutritionBowl"),
			thumb("assemblyCrowd"),
			thumb("hostelRoom")
		],
		stats: [
			{
				label: "Seating",
				value: "280"
			},
			{
				label: "Services daily",
				value: "4"
			},
			{
				label: "Menu published",
				value: "Weekly"
			},
			{
				label: "Vegetarian line",
				value: "Separate"
			}
		],
		hours: "Breakfast 06:00 · Lunch 12:15 · Snack 16:30 · Dinner 19:45",
		inCharge: "Dinesh Gharti, Accounts & Services Officer",
		studentsLove: "The menu goes up on Friday, so you know exactly which day is worth being early for.",
		since: "Refitted 2081 BS"
	},
	{
		id: "health-counselling",
		name: "Health & Counselling Centre",
		category: "Wellbeing",
		block: "Main Block · Ground floor, west end",
		blurb: "A full-time nurse, a four-bed sick bay, and a counsellor available by appointment or drop-in.",
		description: "The centre keeps a registered nurse on campus through the whole school day and a four-bed sick bay for students who need to lie down before a parent arrives. A qualified counsellor holds three days a week, with a drop-in hour after lunch that requires no appointment and no teacher's note — a deliberate design decision.",
		image: photo("healthRoom"),
		gallery: [
			thumb("readingSupport"),
			thumb("teacherPortrait"),
			thumb("seedlings")
		],
		stats: [
			{
				label: "Sick bay beds",
				value: "4"
			},
			{
				label: "Nurse on campus",
				value: "Full school day"
			},
			{
				label: "Counsellor days",
				value: "3 weekly"
			},
			{
				label: "Drop-in hour",
				value: "No appointment"
			}
		],
		hours: "Sunday – Friday, 06:15 – 16:30 · Drop-in 13:00 – 14:00",
		inCharge: "Aarati KC, Wellbeing Lead",
		studentsLove: "You can walk into the drop-in hour without asking a teacher first. That is the whole point of it.",
		since: "Established 2080 BS"
	},
	{
		id: "music-studio",
		name: "Music & Performing Arts Studio",
		category: "Arts",
		block: "Arts Wing · First floor",
		blurb: "An acoustically treated room with madal, tabla, harmonium, guitars and a small recording setup.",
		description: "The studio is treated for sound so that practice does not carry into the classrooms below. It holds both a classical Nepali set — madal, tabla, harmonium, sarangi — and a modern corner with guitars, a keyboard and a drum kit. A two-microphone recording setup lets the school choir and the annual programme rehearsals be recorded and reviewed.",
		image: photo("musicStage"),
		gallery: [
			thumb("performingArts"),
			thumb("auditoriumAudience"),
			thumb("abstractArt")
		],
		stats: [
			{
				label: "Instruments",
				value: "40+"
			},
			{
				label: "Acoustic treatment",
				value: "Full room"
			},
			{
				label: "Recording mics",
				value: "2"
			},
			{
				label: "Practice slots",
				value: "Daily, bookable"
			}
		],
		hours: "Sunday – Friday, 13:00 – 17:00",
		inCharge: "Arts & Culture Committee",
		studentsLove: "You can book a practice slot on your own name — you do not need to be in the school band to use the room.",
		since: "Opened 2082 BS"
	},
	{
		id: "art-studio",
		name: "Art & Design Studio",
		category: "Arts",
		block: "Arts Wing · Ground floor",
		blurb: "North-lit studio with drawing boards, a kiln and wall space that stays up all year.",
		description: "The studio faces north for even light through the day and is deliberately left slightly untidy: work in progress stays on the boards between sessions rather than being packed away. A small kiln handles ceramics, and the corridor outside functions as a permanent gallery with work rotated each term.",
		image: photo("craftSupplies"),
		gallery: [
			thumb("paintBrushes"),
			thumb("illustration"),
			thumb("abstractArt")
		],
		stats: [
			{
				label: "Drawing boards",
				value: "30"
			},
			{
				label: "Kiln",
				value: "1 small"
			},
			{
				label: "Gallery wall",
				value: "18 m corridor"
			},
			{
				label: "Light",
				value: "North-facing"
			}
		],
		hours: "Sunday – Friday, 13:00 – 17:00",
		inCharge: "Arts & Culture Committee",
		studentsLove: "Your work stays on the board between sessions, so a large piece can actually take three weeks.",
		since: "Opened 2082 BS"
	},
	{
		id: "transport",
		name: "School Transport Fleet",
		category: "Campus",
		block: "Gate 2 · Transport bay",
		blurb: "Twelve buses on nine routes across Butwal, Bhairahawa and Tilottama, all GPS-tracked.",
		description: "Nine routes cover Butwal city, Tilottama, Bhairahawa and the Manigram corridor. Every bus carries a conductor in addition to the driver, and all twelve vehicles are GPS-tracked with route timings published each term. Monsoon timing changes are notified through the notices page before they take effect, not after.",
		image: photo("coachBus"),
		gallery: [
			thumb("busFront"),
			thumb("schoolBuilding"),
			thumb("himalaya")
		],
		stats: [
			{
				label: "Buses",
				value: "12"
			},
			{
				label: "Routes",
				value: "9"
			},
			{
				label: "GPS tracked",
				value: "All vehicles"
			},
			{
				label: "Conductor on board",
				value: "Every bus"
			}
		],
		hours: "Pick-up from 05:40 · Drop by 17:15",
		inCharge: "Ramesh Kumar Thapa, Vice Principal (Administration)",
		studentsLove: "Route timing changes are posted before the change, so nobody is left standing at the stop.",
		since: "Fleet renewed 2082 BS"
	},
	{
		id: "campus-green",
		name: "Campus Green & Botanical Corner",
		category: "Campus",
		block: "Central courtyard",
		blurb: "A shaded courtyard with a labelled botanical corner maintained by the Eco Club.",
		description: "The central courtyard is the only part of campus with no scheduled use — which is exactly why students end up there. Along its north edge, the Eco Club maintains a labelled botanical corner of eighty local species used directly in Grade 9 and 11 Biology practicals, with a compost pit and a rainwater collection tank behind it.",
		image: photo("seedlings"),
		gallery: [
			thumb("gardening"),
			thumb("himalaya"),
			thumb("schoolBuilding")
		],
		stats: [
			{
				label: "Labelled species",
				value: "80"
			},
			{
				label: "Shade trees",
				value: "22"
			},
			{
				label: "Rainwater tank",
				value: "12,000 L"
			},
			{
				label: "Maintained by",
				value: "Eco Club"
			}
		],
		hours: "Open through the school day",
		inCharge: "Eco Club · Aarati KC, Faculty Advisor",
		studentsLove: "It is the one place on campus with nothing timetabled in it. That is the best thing about it.",
		since: "Planted 2075 BS"
	}
];
Array.from(new Set(facilities.map((f) => f.category)));
var CATEGORY_ORDER = [
	"Academic",
	"Laboratory",
	"Technology",
	"Sports",
	"Residential",
	"Wellbeing",
	"Arts",
	"Campus"
];
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$48.useLoaderData();
	useWebsitePageContent("facilities");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [activeId, setActiveId] = (0, import_react.useState)(facilities[0].id);
	const [lightbox, setLightbox] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		if (category === "all") return facilities;
		return facilities.filter((f) => f.category === category);
	}, [category]);
	const active = (0, import_react.useMemo)(() => filtered.find((f) => f.id === activeId) ?? filtered[0], [filtered, activeId]);
	const chipOptions = (0, import_react.useMemo)(() => [{
		value: "all",
		label: "All spaces",
		count: facilities.length
	}, ...CATEGORY_ORDER.filter((c) => facilities.some((f) => f.category === c)).map((c) => ({
		value: c,
		label: c,
		count: facilities.filter((f) => f.category === c).length
	}))], []);
	const handleCategory = (next) => {
		setCategory(next);
		const first = next === "all" ? facilities[0] : facilities.find((f) => f.category === next);
		if (first) setActiveId(first.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "facilities-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				testId: "facilities-page-header",
				eyebrow: "Campus",
				title: "Facilities & Infrastructure",
				subtitle: "Capacity, opening hours and the member of staff who holds the key, for every space on the Butwal-8 campus.",
				meta: [
					{
						label: "Facilities",
						value: String(facilities.length)
					},
					{
						label: "Laboratories",
						value: "3"
					},
					{
						label: "Hostel",
						value: "240 beds"
					},
					{
						label: "Campus",
						value: "Butwal-8"
					}
				],
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
					label: "Campus facilities index",
					meta: `PDF · ${facilities.length} facilities · ${school.session}`,
					stamp: "Official",
					testId: "facilities-download-index-button",
					onDownload: () => downloadOfficialPdf(facilityIndexDoc(facilities))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChips, {
					label: "Facility category",
					testId: "facility-category-filter",
					options: chipOptions,
					value: category,
					onChange: handleCategory
				})
			}),
			!active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No space matches that category",
					description: "Try a different category, or view every space on the campus index.",
					actionLabel: "Show all spaces",
					onAction: () => handleCategory("all"),
					testId: "facilities-empty-state"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 flex flex-col-reverse gap-10 lg:grid lg:grid-cols-[1.55fr_0.85fr] lg:gap-14",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						"data-testid": "facility-featured",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
								src: active.image,
								alt: active.name,
								ratio: "feature",
								caption: `${active.name} · ${active.block}`,
								testId: "facility-featured-image",
								onClick: () => setLightbox({
									src: active.image,
									alt: active.name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8 border-l-2 border-accent/35 pl-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "t-eyebrow",
										children: active.category
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "t-h2 mt-2.5 text-foreground",
										"data-testid": "facility-featured-title",
										children: active.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "t-body mt-4 max-w-measure text-muted-foreground",
										children: active.description
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								"data-testid": "facility-specs-strip",
								className: "mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4",
								children: active.stats.map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "bg-card px-4 py-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
										className: "t-eyebrow",
										children: stat.label
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
										className: "mt-2 font-display text-xl font-semibold leading-tight text-foreground",
										children: stat.value
									})]
								}, stat.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "mt-8 grid gap-x-10 gap-y-5 sm:grid-cols-2",
								children: [
									{
										icon: MapPin,
										label: "Location",
										value: active.block
									},
									{
										icon: Clock3,
										label: "Open hours",
										value: active.hours
									},
									{
										icon: UserRound,
										label: "In charge",
										value: active.inCharge
									},
									{
										icon: Expand,
										label: "In service since",
										value: active.since
									}
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, {
										className: "mt-[3px] h-4 w-4 shrink-0 text-muted-foreground",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
											className: "t-eyebrow",
											children: item.label
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
											className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
											children: item.value
										})]
									})]
								}, item.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("blockquote", {
								"data-testid": "facility-students-love",
								className: "mt-9 rounded-card bg-secondary/60 px-6 py-6",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Quote, {
										className: "h-4 w-4 text-accent",
										"aria-hidden": "true"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-3 max-w-measure font-display text-lg italic leading-snug text-foreground",
										children: active.studentsLove
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
										className: "t-meta mt-3",
										children: "What students say about this space"
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-14",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
									eyebrow: "Gallery",
									title: "Inside the space",
									testId: "facility-gallery-title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-7 grid grid-cols-3 gap-4",
									children: active.gallery.map((src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
										src,
										alt: `${active.name}, view ${index + 1}`,
										ratio: "square",
										testId: `facility-gallery-item-${index}`,
										onClick: () => setLightbox({
											src,
											alt: `${active.name}, view ${index + 1}`
										})
									}, src))
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-10 border-t border-rule-soft pt-7",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
									label: "Facility brief",
									meta: `PDF · ${active.name} · specifications and hours`,
									stamp: "Facility brief",
									testId: "facility-download-brief-button",
									onDownload: () => downloadOfficialPdf(facilityBriefDoc(active))
								})
							})
						]
					})
				}, active.id), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "min-w-0 lg:sticky lg:top-24 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-baseline justify-between gap-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "t-eyebrow",
								children: "Facility index"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "t-meta",
								children: [filtered.length, " spaces"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							"data-testid": "facility-rail",
							className: "rail-scroll mt-4 overflow-y-auto rounded-card border border-border bg-secondary/50 lg:max-h-[68vh]",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: filtered.map((facility, index) => {
								const isActive = facility.id === active.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setActiveId(facility.id),
									"aria-current": isActive ? "true" : void 0,
									"data-active": isActive,
									"data-testid": "facility-rail-item",
									className: [
										"flex w-full items-start gap-3.5 border-b border-border/70 px-4 py-3.5 text-left transition-colors duration-fast",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40",
										index === filtered.length - 1 ? "border-b-0" : "",
										isActive ? "bg-accent/[0.08]" : "hover:bg-background/60"
									].join(" "),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: ["mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full transition-colors duration-fast", isActive ? "bg-accent" : "bg-rule-strong"].join(" "),
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: ["block text-[13px] leading-snug", isActive ? "font-medium text-foreground" : "text-muted-foreground"].join(" "),
											children: facility.name
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground",
											children: facility.category
										})]
									})]
								}) }, facility.id);
							}) })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "t-meta mt-4 leading-relaxed",
							children: [school.fullAddress, ". Visiting hours for prospective families are Saturday, 10:00 to 16:00."]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: lightbox !== null,
				onOpenChange: (open) => {
					if (!open) setLightbox(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-testid": "facility-lightbox",
					className: "max-w-4xl border-border bg-card p-3 sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "sr-only",
							children: lightbox?.alt ?? "Facility image"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "sr-only",
							children: "Enlarged photograph of the selected campus facility."
						}),
						lightbox ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "overflow-hidden rounded-field border border-border",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: lightbox.src,
								alt: lightbox.alt,
								className: "max-h-[74vh] w-full object-contain"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "t-meta mt-3 px-1",
							children: lightbox.alt
						})] }) : null
					]
				})
			})
		]
	});
}
//#endregion
export { RouteComponent as component };
