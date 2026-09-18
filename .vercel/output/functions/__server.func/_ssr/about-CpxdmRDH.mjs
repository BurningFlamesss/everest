import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { Expand, MapPin, Quote, UserRound } from "../_libs/lucide-react.mjs";
import { PageFrame, PageHeader, Reveal, Route$53, SectionHeading, school, useWebsitePageContent } from "./router-dKngB4cM.mjs";
import { Dialog, DialogContent, DialogDescription, DialogTitle, Separator } from "./kit-Cq_igxhQ.mjs";
import { EditorialImage, photo } from "./media-CDFoNHKI.mjs";
import { EmptyState } from "./EmptyState-CpUK2QdS.mjs";
import { FilterChips } from "./FilterChips-CvLOSi1H.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-CpxdmRDH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var chapters = [
	{
		id: "overview",
		name: "Our Story",
		category: "Foundation",
		description: "Welcome to Everest English Boarding Secondary School, a premier institution dedicated to nurturing young minds. For over three decades, we have provided an environment that balances rigorous academic standards with holistic personal development.",
		image: photo("schoolBuilding"),
		stats: [
			{
				label: "Established",
				value: school.establishedAd
			},
			{
				label: "Students",
				value: "1,200+"
			},
			{
				label: "Pass Rate",
				value: "98%"
			}
		],
		inCharge: "School Board",
		since: "1995",
		block: "Overall Campus",
		studentsLove: "A home away from home where every student is known, valued, and inspired to succeed.",
		gallery: [
			photo("assemblyCrowd"),
			photo("youngLearners"),
			photo("studyPair")
		]
	},
	{
		id: "vision-mission",
		name: "Vision & Mission",
		category: "Foundation",
		description: "Our vision is to be a center of excellence that shapes global citizens. Our mission is to foster academic excellence while developing strong character and integrity in every student, making disciplined learning feel personal and connected.",
		image: photo("assemblyCrowd"),
		stats: [
			{
				label: "Core Focus",
				value: "Academics"
			},
			{
				label: "Approach",
				value: "Holistic"
			},
			{
				label: "Values",
				value: "Integrity"
			}
		],
		inCharge: "Academic Council",
		since: "1995",
		block: "Institutional Policy",
		studentsLove: "Education is not just about filling minds, but igniting curiosity that lasts a lifetime.",
		gallery: [
			photo("classroomTeens"),
			photo("studentsWithBooks"),
			photo("lectureRoom")
		]
	},
	{
		id: "principal-message",
		name: "Principal's Message",
		category: "Leadership",
		description: "Education is a shared commitment between dedicated teachers, motivated students, and enthusiastic parents. We strive to create a dynamic environment where every child is empowered to discover their potential and achieve their dreams.",
		image: photo("teacherPortrait"),
		stats: [
			{
				label: "Leadership",
				value: "Dr. Thapa"
			},
			{
				label: "Experience",
				value: "25+ Years"
			},
			{
				label: "Focus",
				value: "Excellence"
			}
		],
		inCharge: "Principal's Office",
		since: "2010",
		block: "Administration",
		studentsLove: "The principal's door is always open—leadership here is about listening and guiding.",
		gallery: [
			photo("teacherPortrait"),
			photo("readingSupport"),
			photo("auditoriumAudience")
		]
	},
	{
		id: "history",
		name: "Legacy & Heritage",
		category: "History",
		description: "What started as a small cohort of dedicated educators has blossomed into a vibrant, multi-building campus. Everest EBSS has consistently ranked among the top educational institutions in the Gandaki Province, shaping regional standards.",
		image: photo("schoolBuilding"),
		stats: [
			{
				label: "Alumni Network",
				value: "4,500+"
			},
			{
				label: "Academic Rank",
				value: "Top 10"
			},
			{
				label: "Campus Expanse",
				value: "2 Blocks"
			}
		],
		inCharge: "Founding Members",
		since: "1995",
		block: "Legacy & Timeline",
		studentsLove: "The history of our school is reflected in every brick and every lesson.",
		gallery: [
			photo("libraryHall"),
			photo("schoolBuilding"),
			photo("himalaya")
		]
	},
	{
		id: "values",
		name: "Core Values",
		category: "Student Life",
		description: "We are guided by respect, responsibility, curiosity, and resilience. Everest encourages active participation in extracurricular activities, social service programs, and leadership councils to ensure students grow both inside and outside the classroom.",
		image: photo("studentGroup"),
		stats: [
			{
				label: "Student Clubs",
				value: 12
			},
			{
				label: "School Houses",
				value: 4
			},
			{
				label: "Yearly Events",
				value: "20+"
			}
		],
		inCharge: "Student Council",
		since: "2000",
		block: "Student Governance",
		studentsLove: "The strength of Everest lies in the diversity of its community and the shared commitment to excellence.",
		gallery: [
			photo("coachBus"),
			photo("basketball"),
			photo("studentsTeamwork")
		]
	},
	{
		id: "affiliations",
		name: "Accreditations",
		category: "Academics",
		description: "Fully accredited by the National Examinations Board (NEB) and the Ministry of Education, Nepal. We maintain rigorous standards across all our primary, secondary, and +2 programs ensuring our students are prepared for higher education globally.",
		image: photo("booksStacked"),
		stats: [
			{
				label: "Board",
				value: "NEB Nepal"
			},
			{
				label: "Curriculum",
				value: "National"
			},
			{
				label: "Programs",
				value: "PG to +2"
			}
		],
		inCharge: "Examination Board",
		since: "1995",
		block: "Academic Quality",
		studentsLove: "Knowing our education is recognized everywhere gives us the confidence to aim high.",
		gallery: [
			photo("libraryShelf"),
			photo("equations"),
			photo("labCoat")
		]
	}
];
var CATEGORY_ORDER = [
	"Foundation",
	"Leadership",
	"History",
	"Student Life",
	"Academics"
];
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$53.useLoaderData();
	useWebsitePageContent("about");
	const [category, setCategory] = (0, import_react.useState)("all");
	const [activeId, setActiveId] = (0, import_react.useState)(chapters[0].id);
	const [lightbox, setLightbox] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		if (category === "all") return chapters;
		return chapters.filter((f) => f.category === category);
	}, [category]);
	const active = (0, import_react.useMemo)(() => filtered.find((f) => f.id === activeId) ?? filtered[0], [filtered, activeId]);
	const chipOptions = (0, import_react.useMemo)(() => [{
		value: "all",
		label: "All chapters",
		count: chapters.length
	}, ...CATEGORY_ORDER.filter((c) => chapters.some((f) => f.category === c)).map((c) => ({
		value: c,
		label: c,
		count: chapters.filter((f) => f.category === c).length
	}))], []);
	const handleCategory = (next) => {
		setCategory(next);
		const first = next === "all" ? chapters[0] : chapters.find((f) => f.category === next);
		if (first) setActiveId(first.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "about-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				testId: "about-page-header",
				eyebrow: "ABOUT EVEREST",
				title: "A place where curiosity becomes capability.",
				subtitle: "An institutional story told through the people, spaces, and principles that shape each school day."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChips, {
					label: "Chapter category",
					testId: "chapter-category-filter",
					options: chipOptions,
					value: category,
					onChange: handleCategory
				})
			}),
			!active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					title: "No chapters matches that category",
					description: "Try a different category, or view all chapters.",
					actionLabel: "Show all chapters",
					onAction: () => handleCategory("all"),
					testId: "about-empty-state"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-10 grid gap-12 lg:grid-cols-[236px_1fr] lg:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
					className: "min-w-0 lg:sticky lg:top-24 lg:self-start",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "t-eyebrow",
							children: "Contents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "group",
							"aria-label": "Chapters",
							"data-testid": "about-chapter-switcher",
							className: "no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0",
							children: filtered.map((item) => {
								const isActive = item.id === active.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setActiveId(item.id),
									"aria-pressed": isActive,
									"data-active": isActive,
									"data-testid": `about-chapter-switcher-item-${item.id}`,
									className: [
										"shrink-0 rounded-field border px-3.5 py-2.5 text-left transition-colors duration-fast",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
										"lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4",
										isActive ? "border-accent/40 bg-accent/[0.08] lg:border-accent lg:bg-transparent" : "border-border bg-background hover:bg-secondary lg:border-transparent lg:bg-transparent lg:hover:border-border"
									].join(" "),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: ["block whitespace-nowrap text-[13px] lg:whitespace-normal", isActive ? "font-medium text-foreground" : "text-muted-foreground"].join(" "),
										children: item.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-1 hidden font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground lg:block",
										children: item.category
									})]
								}, item.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-7 hidden lg:block" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "hidden gap-y-5 lg:grid",
							children: [
								{
									label: "Category",
									value: active.category
								},
								{
									label: "Since",
									value: active.since
								},
								{
									label: "Block",
									value: active.block
								},
								{
									label: "Focus",
									value: active.inCharge
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "t-eyebrow",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
								children: item.value
							})] }, item.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "t-meta mt-7 leading-relaxed hidden lg:block",
							children: [
								school.address.line1,
								", ",
								school.address.line2,
								". Visiting hours for prospective families are Sunday to Friday, 10:00 to 16:00."
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						"data-testid": "chapter-featured",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
								src: active.image,
								alt: active.name,
								ratio: "feature",
								caption: `${active.name} · ${active.block}`,
								testId: "chapter-featured-image",
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
										"data-testid": "chapter-featured-title",
										children: active.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "t-body mt-4 max-w-measure text-muted-foreground",
										children: active.description
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								"data-testid": "chapter-specs-strip",
								className: "mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3",
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
										label: "Focus Area",
										value: active.block
									},
									{
										icon: UserRound,
										label: "Key Stakeholders",
										value: active.inCharge
									},
									{
										icon: Expand,
										label: "Initiated Since",
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
								"data-testid": "chapter-students-love",
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
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
										className: "t-meta mt-3",
										children: ["A note on ", active.name.toLowerCase()]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-14",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
									eyebrow: "Glimpses",
									title: "In Context",
									testId: "chapter-gallery-title"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-7 grid grid-cols-3 gap-4",
									children: active.gallery.map((src, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
										src,
										alt: `${active.name}, view ${index + 1}`,
										ratio: "square",
										testId: `chapter-gallery-item-${index}`,
										onClick: () => setLightbox({
											src,
											alt: `${active.name}, view ${index + 1}`
										})
									}, src))
								})]
							})
						]
					})
				}, active.id)]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: lightbox !== null,
				onOpenChange: (open) => {
					if (!open) setLightbox(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					"data-testid": "chapter-lightbox",
					className: "max-w-4xl border-border bg-card p-3 sm:p-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "sr-only",
							children: lightbox?.alt ?? "Chapter image"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
							className: "sr-only",
							children: "Enlarged photograph illustrating our story."
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
