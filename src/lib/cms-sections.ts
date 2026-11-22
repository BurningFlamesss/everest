import type { BlockType, ContentBlock } from "@/types";
import { photo } from "./media";
import { routines as builtInRoutines } from "./routines";

// ---------------------------------------------------------------------------
// Fixed-section model for the two live-preview pages.
//
// The faculty and sign-in pages are no longer assembled from drag-and-drop
// blocks. Each page has a fixed list of sections; admins click a section in a
// live preview and edit its fields, which upsert a per-type content block on
// the page. This module is the single source of truth for which sections exist
// per page, their labels and the default copy shown when a section has not
// been saved yet.
// ---------------------------------------------------------------------------

export type CmsPageKey =
	| "home"
	| "about"
	| "courses"
	| "facilities"
	| "gallery"
	| "calendar"
	| "contact"
	| "resources"
	| "result"
	| "transportation"
	| "notices"
	| "scholarship"
	| "faculty"
	| "login"
	| "activate"
	| "course_finder"
	| "posts"
	| "admissions"
	| "clubs"
	| "events";

export const LOGIN_SECTION_TYPES: BlockType[] = [
	"auth_visual",
	"auth_intro",
	"auth_form",
	"auth_contact",
];

export const ACTIVATE_SECTION_TYPES: BlockType[] = [
	"auth_visual",
	"auth_intro",
	"auth_form",
];

export const FACULTY_SECTION_TYPES: BlockType[] = [
	"faculty_header",
	"faculty_leadership",
	"faculty_directory",
];

export function pageSectionTypes(pageKey: CmsPageKey): BlockType[] {
	switch (pageKey) {
		case "faculty":
			return FACULTY_SECTION_TYPES;
		case "login":
			return LOGIN_SECTION_TYPES;
		case "activate":
			return ACTIVATE_SECTION_TYPES;
		case "home":
			return [
				"landing_hero",
				"hero",
				"landing_facts",
				"discover_cards",
				"landing_section_headings",
			];
		case "about":
			return ["chapters"];
		case "contact":
			return [
				"contact_details",
				"department_list",
				"office_hours",
				"map",
				"social_links",
			];
		case "courses":
			return ["headline", "academics"];
		case "course_finder":
			return ["headline"];
		case "facilities":
			return ["facilities"];
		case "gallery":
			return ["headline", "gallery_grid"];
		case "calendar":
			return ["headline", "featured_events"];
		case "resources":
			return ["headline", "rich_text"];
		case "result":
			return ["headline", "stats"];
		case "transportation":
			return ["headline", "contact_details"];
		case "notices":
			return ["headline"];
		case "scholarship":
			return ["headline"];
		case "posts":
			return ["headline"];
		case "admissions":
			return ["hero", "admissions_info", "cta"];
		case "clubs":
			return ["headline"];
		case "events":
			return ["headline"];
		default:
			return ["rich_text"];
	}
}

export const SECTION_LABELS: Partial<Record<BlockType, string>> = {
	auth_visual: "Visual column",
	auth_intro: "Intro",
	auth_form: "Form",
	auth_contact: "Footer",
	faculty_header: "Header",
	faculty_leadership: "Leadership heading",
	faculty_directory: "Directory heading",
	landing_hero: "Hero overlays & footage",
	landing_facts: "Institution facts",
	discover_cards: "Discover cards",
	chapters: "Chapters",
	department_list: "Departments",
	landing_section_headings: "Headings & Landing Curation",
	stats: "Results chart",
	featured_events: "Featured events",
	featured_notices: "Featured notices",
	gallery_grid: "Gallery section",
	social_links: "Social links",
	rich_text: "Rich text",
	history: "History",
	mission_vision: "Mission & vision",
	principal_message: "Principal's message",
	academics: "Academics",
	facilities: "Facilities section",
	headline: "Headline",
	hero: "Hero",
	cta: "Call to action",
	contact_details: "Contact details",
	office_hours: "Office hours",
	map: "Map & directions",
	admissions_info: "Application steps",
	announcements: "Announcements",
	intro: "Intro",
	achievements: "Achievements",
};

/** Default copy for every fixed section — mirrors the static public fallbacks. */
export const SECTION_DEFAULTS: Partial<
	Record<BlockType, Record<string, unknown>>
> = {
	auth_visual: {
		image: "/schools/everest/landing-footage/frame_0001.jpeg",
		eyebrow: "Everest entrance",
		headline: "The digital entrance to the school.",
		subheadline: "One community / connected responsibly",
	},
	auth_intro: {
		kicker: "SCHOOL MANAGEMENT SYSTEM",
		title: "Welcome back.",
		intro: "Enter the credentials issued by your school to continue.",
	},
	auth_form: {
		backLabel: "Public website",
		emailLabel: "Email",
		passwordLabel: "Password",
		forgotLabel: "Forgot password?",
		submitLabel: "Sign in",
	},
	auth_contact: {
		title: "Don't have access?",
		linkLabel: "Contact the school",
		linkHref: "/contact",
	},
	faculty_header: {
		eyebrow: "Administration",
		title: "Administration & Faculty",
		subtitle:
			"Every member of staff, with their qualification, the subjects they teach and the hours they keep an open door.",
	},
	faculty_leadership: {
		eyebrow: "Leadership",
		title: "Who runs what",
		description:
			"The four people who carry responsibility for the school. Select a card to see the full profile, office hours and contact details.",
	},
	faculty_directory: {
		eyebrow: "Directory",
		title: "Teaching and support faculty",
		description:
			"Search by name, subject or qualification, or narrow the list to a single department.",
	},
	// Landing page (/): seeds mirror the hardcoded LandingPage copy so the page
	// renders identically before any admin edit.
	landing_hero: {
		text1Title: "A place to grow.",
		text1Body: "Developing character, capability, and curiosity since 2050 BS.",
		text2Title: "Future ready.",
		text2Body:
			"Our state-of-the-art facilities and modern curriculums empower students to thrive in an evolving world.",
		text3Title: "Everest.",
		text3Body: "The summit of education.",
		// Scroll footage: frames live at <footageBase><footagePrefix>NNNN<footageExtension>.
		footageBase: "/schools/everest/landing-footage/",
		footagePrefix: "frame_",
		footageExtension: ".jpeg",
		footageFrameCount: 274,
		// Auto-play: the hero plays like a video when the visitor is idle, and
		// scrolling seeks. 0 disables auto-play.
		autoplaySeconds: 14,
	},
	landing_facts: {
		title: "Established in purpose.\nContemporary in outlook.",
		body: "Everest English Boarding Higher Secondary School is a learning institution in Nepal built around a simple conviction: students thrive when expectations are clear, relationships are strong, and curiosity has room to become practice.",
		facts: [
			{
				label: "Institution",
				value: "Everest English Boarding Higher Secondary School",
			},
			{ label: "Learning Spaces", value: "Everest Building + Canon Building" },
			{ label: "Streams", value: "Science (Computer/Biology), Management" },
			{ label: "Labs", value: "Computer, Biology, Physics, Chemistry" },
		],
	},
	discover_cards: {
		cards: [
			{
				eyebrow: "Academics",
				title: "Courses & Programs",
				body: "Explore subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12.",
				href: "/courses",
				image: "",
			},
			{
				eyebrow: "Campus",
				title: "Facilities",
				body: "Detailed overviews of our laboratories, libraries, spaces, and digital infrastructure across the campus.",
				href: "/facilities",
				image: "",
			},
			{
				eyebrow: "The Institution",
				title: "About Everest",
				body: "Our history, guiding principles, and the structural vision that builds the foundation of our institution.",
				href: "/about",
				image: "",
			},
		],
	},
	// About page (/about): seeds mirror the route's inline chapters array.
	chapters: {
		eyebrow: "About Everest",
		title: "Purpose held over time.",
		body: "An institution is not only what it has built. It is what it continues to protect, improve and pass forward.",
		filterLabel: "Chapter category",
		contentsLabel: "Contents",
		galleryEyebrow: "Glimpses",
		galleryTitle: "In Context",
		visitingNote:
			"Visiting hours for prospective families are Sunday to Friday, 10:00 to 16:00.",
		emptyTitle: "No chapters matches that category",
		emptyDescription: "Try a different category, or view all chapters.",
		showAllLabel: "Show all chapters",
		chapters: [
			{
				name: "Our Story",
				category: "Foundation",
				description:
					"Welcome to Everest English Boarding Secondary School, a premier institution dedicated to nurturing young minds. For over three decades, we have provided an environment that balances rigorous academic standards with holistic personal development.",
				image: photo("schoolBuilding"),
				inCharge: "School Board",
				since: "1995",
				block: "Overall Campus",
				studentsLove:
					"A home away from home where every student is known, valued, and inspired to succeed.",
				stats: "Established | 1995\nStudents | 1,200+\nPass Rate | 98%",
				gallery: `${photo("assemblyCrowd")}\n${photo("youngLearners")}\n${photo("studyPair")}`,
			},
			{
				name: "Vision & Mission",
				category: "Foundation",
				description:
					"Our vision is to be a center of excellence that shapes global citizens. Our mission is to foster academic excellence while developing strong character and integrity in every student, making disciplined learning feel personal and connected.",
				image: photo("assemblyCrowd"),
				inCharge: "Academic Council",
				since: "1995",
				block: "Institutional Policy",
				studentsLove:
					"Education is not just about filling minds, but igniting curiosity that lasts a lifetime.",
				stats: "Core Focus | Academics\nApproach | Holistic\nValues | Integrity",
				gallery: `${photo("classroomTeens")}\n${photo("studentsWithBooks")}\n${photo("lectureRoom")}`,
			},
			{
				name: "Principal's Message",
				category: "Leadership",
				description:
					"Education is a shared commitment between dedicated teachers, motivated students, and enthusiastic parents. We strive to create a dynamic environment where every child is empowered to discover their potential and achieve their dreams.",
				image: photo("teacherPortrait"),
				inCharge: "Principal's Office",
				since: "2010",
				block: "Administration",
				studentsLove:
					"The principal's door is always open—leadership here is about listening and guiding.",
				stats: "Leadership | Krishna Neupane\nExperience | 25+ Years\nFocus | Excellence",
				gallery: `${photo("teacherPortrait")}\n${photo("readingSupport")}\n${photo("auditoriumAudience")}`,
			},
			{
				name: "Legacy & Heritage",
				category: "History",
				description:
					"What started as a small cohort of dedicated educators has blossomed into a vibrant, multi-building campus. Everest EBSS has consistently ranked among the top educational institutions in the Lumbini Province, shaping regional standards.",
				image: photo("schoolBuilding"),
				inCharge: "Founding Members",
				since: "1995",
				block: "Legacy & Timeline",
				studentsLove:
					"The history of our school is reflected in every brick and every lesson.",
				stats: "Alumni Network | 4,500+\nAcademic Rank | Top 10\nCampus Expanse | 2 Blocks",
				gallery: `${photo("libraryHall")}\n${photo("schoolBuilding")}\n${photo("himalaya")}`,
			},
			{
				name: "Core Values",
				category: "Student Life",
				description:
					"We are guided by respect, responsibility, curiosity, and resilience. Everest encourages active participation in extracurricular activities, social service programs, and leadership councils to ensure students grow both inside and outside the classroom.",
				image: photo("studentGroup"),
				inCharge: "Student Council",
				since: "2000",
				block: "Student Governance",
				studentsLove:
					"The strength of Everest lies in the diversity of its community and the shared commitment to excellence.",
				stats: "Student Clubs | 12\nSchool Houses | 4\nYearly Events | 20+",
				gallery: `${photo("coachBus")}\n${photo("basketball")}\n${photo("studentsTeamwork")}`,
			},
			{
				name: "Accreditations",
				category: "Academics",
				description:
					"Fully accredited by the National Examinations Board (NEB) and the Ministry of Education, Nepal. We maintain rigorous standards across all our primary, secondary, and +2 programs ensuring our students are prepared for higher education globally.",
				image: photo("booksStacked"),
				inCharge: "Examination Board",
				since: "1995",
				block: "Academic Quality",
				studentsLove:
					"Knowing our education is recognized everywhere gives us the confidence to aim high.",
				stats: "Board | NEB Nepal\nCurriculum | National\nPrograms | PG to +2",
				gallery: `${photo("libraryShelf")}\n${photo("equations")}\n${photo("labCoat")}`,
			},
		],
	},
	// Contact page (/contact): seeds mirror lib/site.ts departments + school.
	contact_details: {
		phone: "+977 71 535962",
		secondaryPhone: "+977 71 531342",
		email: "everestbutwal@gmail.com",
		admissionsEmail: "admissions@everestbutwal.edu.np",
		address: "Butwal-8, Sukkhanagar, Rupandehi, Lumbini Province, Nepal",
	},
	department_list: {
		eyebrow: "Contact Everest",
		title: "Who to ask",
		departments: [
			{
				name: "Admissions Office",
				contact: "Admissions Office",
				email: "admissions@everestbutwal.edu.np",
				hours: "Sun–Fri, 09:00–16:00",
			},
			{
				name: "Accounts Office",
				contact: "Accounts Office",
				email: "accounts@everestbutwal.edu.np",
				hours: "Sun–Fri, 10:00–15:00",
			},
			{
				name: "Principal's Office",
				contact: "Krishna Neupane",
				email: "principal@everestbutwal.edu.np",
				hours: "By appointment",
			},
		],
	},
	office_hours: {
		weekdays: "Sunday – Friday · 09:00–16:00",
		saturday: "Closed",
		sunday: "Open",
		note: "Office hours follow the academic calendar.",
	},
	map: {
		label: "Main Campus",
		latitude: "27.7",
		longitude: "83.45",
		directions: "Butwal-8, Sukkhanagar — see the map below.",
		embedUrl: "https://www.google.com/maps?q=Butwal-8+Sukkhanagar&output=embed",
	},
	// Admissions page (/admissions): mirror the route's inline copy so the page
	// renders identically before any admin edit.
	admissions_info: {
		title: "How to apply",
		body: "The process is simple, and the school office will guide you at every step.",
		deadline: "",
		steps: [
			{
				title: "1. Start an enquiry",
				description:
					"Send the contact form with your child's current grade and the year you are applying for.",
			},
			{
				title: "2. Visit the campus",
				description:
					"The office arranges a tour and a short conversation with the year coordinator.",
			},
			{
				title: "3. Submit documents",
				description:
					"Bring the previous report card, transfer certificate, birth certificate and photographs.",
			},
		],
	},
	cta: {
		title: "Questions before you apply?",
		body: "We reply within one working day.",
		buttonLabel: "Contact the office",
		buttonHref: "/contact",
	},
	// Landing page editorial section headings & featured item curation.
	landing_section_headings: {
		resultsEyebrow: "Academic Excellence",
		resultsTitle: "Board Results",
		resultsDesc: "Consistent performance across all levels of examination.",
		discoverEyebrow: "Explore Everest",
		discoverTitle: "Discover the school",
		discoverDesc:
			"Learn more about our academic programs, state-of-the-art facilities, and the institution's history.",
		featuredFacilities: [],
		galleryEyebrow: "Campus Life",
		galleryTitle: "Gallery Highlights",
		galleryDesc:
			"Moments captured around the school grounds and during major events.",
		featuredGallery: [],
		updatesEyebrow: "Stay Updated",
		updatesTitle: "Latest Announcements",
		updatesDesc: "News and events from our community timeline.",
		facultyEyebrow: "Leadership",
		facultyTitle: "Our Faculty",
		facultyDesc:
			"The educators leading our academic departments and steering the school's vision.",
		featuredFaculty: [],
		activitiesEyebrow: "Student Life",
		activitiesTitle: "Clubs & Societies",
		activitiesDesc:
			"Every Friday afternoon, pupils move to society rooms for laboratory demonstrations, bilingual debates, computing workshops, and inter-house athletics.",
		featuredClubs: [],
		featuredActivities: [],
	},
	// Contact page (/contact): mirrors the route copy.
	social_links: {
		facebook: "https://www.facebook.com/eebssbutwal",
		instagram: "https://instagram.com/everestbutwal",
		linkedin: "https://linkedin.com/school/everestbutwal",
		x: "",
		youtube: "https://youtube.com/@everestbutwal",
	},
	// Courses page (/courses): mirrors the route copy.
	academics: {
		// Header meta strip
		metaProgrammesLabel: "Programmes",
		metaProgrammesValue: "",
		metaLevelsLabel: "Levels",
		metaLevelsValue: "",
		metaStreamsLabel: "+2 streams",
		metaStreamsValue: "Science, Management, Humanities",
		metaSessionLabel: "Session",
		metaSessionValue: "2083 BS",
		prospectusLabel: "Full academic prospectus",
		prospectusMeta: "PDF · {count} programmes · 2083 BS",
		prospectusStamp: "Official",

		chooseLevelLabel: "Choose a level",
		levelAriaLabel: "Academic level",
		levelGradesLabel: "Grades",
		levelBoardLabel: "Board",
		levelProgrammesLabel: "Programmes",
		levelSeatsLabel: "Seats this session",

		featuredEyebrow: "Most-chosen programme at this level",
		spotlightDurationLabel: "Duration",
		spotlightSeatsLabel: "Seats",
		spotlightMediumLabel: "Medium",
		spotlightProspectusLabel: "Prospectus for this programme",
		spotlightProspectusMeta: "PDF · {code} · signed by the Principal",

		title: "Programme index",
		body: "Each row opens into the full subject list, credit hours, fee table and progression routes for that programme.",
		programmeIndexEyebrow: "Programme index",
		seatsSuffix: "seats",

		tabOverview: "Overview",
		tabSubjects: "Subjects",
		tabFees: "Fees",
		tabPathways: "Pathways",

		eligibilityLabel: "Eligibility",
		mediumLabel: "Medium",
		durationLabel: "Duration",
		boardLabel: "Board",
		distinctiveLabel: "What makes it distinctive",
		programmeProspectusLabel: "Programme prospectus",
		programmeProspectusMeta: "PDF · {code} · Session 2083 BS",

		subjectCodeLabel: "Code",
		subjectNameLabel: "Subject",
		subjectCreditLabel: "Credit",
		subjectTypeLabel: "Type",
		totalCreditLabel: "Total credit hours",

		feeParticularLabel: "Particular",
		feeAmountLabel: "Amount",
		feeFrequencyLabel: "Frequency",
		annualChargesLabel: "Annual charges",
		monthlyTuitionLabel: "Monthly tuition",
		feeNote:
			"Figures are indicative for session 2083 BS. Any approved scholarship is applied at the accounts desk before the term invoice is issued.",

		pathwaysEmpty:
			"This programme feeds directly into the next level within the school rather than into external pathways. Progression is automatic on completion, and no separate application is required.",
		learningOutcomesLabel: "Learning outcomes",

		routineEyebrow: "Timetable",
		routineTitlePrefix: "Weekly routine",
		routineDescription:
			"The published timetable for this level, as it runs from Sunday to Friday.",
		routineShiftLabel: "Shift",
		routineRoomsLabel: "Rooms",
		routineEffectiveFromLabel: "Effective from",
		routineShowOnlyPrefix: "Show only",
		routineShowFullWeek: "Show full week",
		routinePdfLabel: "Routine PDF",
		routineNowLabel: "Right now",
		routinePeriodPrefix: "Period",
		routineNoPeriodText: "No period is running at this moment.",
		routineHolidayText: "Saturday is the weekly holiday — no classes today.",
		routineDayLabel: "Day",
		routineTodayLabel: "Today",
		routineCaptionSuffix: "weekly class routine",
		routineFooter:
			"Saturday is the weekly holiday. Practical and studio periods run in the final slot without interruption.",

		routines: builtInRoutines,
		levels: [
			{
				id: "basic",
				label: "Early Years & Primary",
				short: "Primary",
				grades: "Nursery – Grade 5",
				board: "CDC Basic Level Curriculum",
				tagline: "Where curiosity is given room to breathe.",
				description:
					"Our foundation years follow the Curriculum Development Centre basic-level framework, delivered through activity-first English medium teaching. Class sizes are capped at 28 so that every child is known by name, and reading fluency is tracked termly rather than annually.",
				image: "",
			},
			{
				id: "lower-secondary",
				label: "Lower Secondary",
				short: "Grade 6–8",
				grades: "Grade 6 – Grade 8",
				board: "CDC Basic Level Curriculum",
				tagline: "The years that decide how a student thinks.",
				description:
					"Grades six to eight are where habits harden. Students move into subject-specialist teaching, begin laboratory work, and choose an exploratory track so that the Grade 9 decision is made from experience rather than guesswork.",
				image: "",
			},
			{
				id: "secondary",
				label: "Secondary · SEE",
				short: "Grade 9–10",
				grades: "Grade 9 – Grade 10",
				board: "National Examinations Board · SEE",
				tagline: "Two years of deliberate preparation for the SEE.",
				description:
					"The secondary programme prepares candidates for the Secondary Education Examination with a concentration chosen in Grade 9. Optional Mathematics, Computer Science and Accountancy concentrations run in parallel, all sharing the same compulsory core.",
				image: "",
			},
			{
				id: "plus2-science",
				label: "+2 Science",
				short: "+2 Science",
				grades: "Grade 11 – Grade 12",
				board: "National Examinations Board · Science Stream",
				tagline: "Laboratory hours, not just lecture hours.",
				description:
					"The Science stream runs on a morning shift with mandatory weekly practical sessions in Physics, Chemistry and Biology. Students select either the Physical group or the Biology group at the point of admission, and both prepare candidates for national entrance examinations.",
				image: "",
			},
			{
				id: "plus2-management",
				label: "+2 Management",
				short: "+2 Management",
				grades: "Grade 11 – Grade 12",
				board: "National Examinations Board · Management Stream",
				tagline: "Commerce taught with real ledgers and real cases.",
				description:
					"Management students work through the NEB syllabus alongside a case-based practicum: quarterly business simulations, a compulsory bookkeeping portfolio, and an internship week with Butwal-based enterprises in Grade 12.",
				image: "",
			},
		],
	},
	// Facilities page (/facilities): mirrors the route copy.
	facilities: {
		eyebrow: "Campus",
		title: "Facilities & Infrastructure",
		body: "Capacity, opening hours and the member of staff who holds the key, for every space on the Butwal-8 campus.",
		allSpacesLabel: "All spaces",
		indexLabel: "Facility index",
		galleryEyebrow: "Gallery",
		galleryTitle: "Inside the space",
		studentsLoveLabel: "What students say about this space",
		visitingNote:
			"Visiting hours for prospective families are Saturday, 10:00 to 16:00.",
		emptyTitle: "No space matches that category",
		emptyDescription:
			"Try a different category, or view every space on the campus index.",
		showAllLabel: "Show all spaces",
	},
	// Gallery page (/gallery): mirrors the route copy.
	gallery_grid: {
		title: "Campus Photo Albums",
	},
	// Calendar page (/calendar): mirrors the route copy.
	featured_events: {
		count: 47,
		title: "Every date this session",
	},
	// Result page (/result): mirrors the route copy.
	stats: {
		title: "Board Examination Performance",
		body: "Division splits over the last five sessions for secondary education exams.",
	},
	// Rich text (resources, etc.): default prose block.
	rich_text: {
		title: "Academic Documentation & Policy",
		html: "<p>Important files and documents for students and guardians.</p>",
	},
	// Generic hero banner (admissions, etc.)
	hero: {
		eyebrow: "Admissions",
		headline: "A place to begin.",
		subheadline:
			"Admissions are open for the coming academic year. The process is simple, and the school office will guide you at every step.",
		primaryCtaLabel: "Send an enquiry",
		primaryCtaHref: "/contact",
		secondaryCtaLabel: "View courses",
		secondaryCtaHref: "/courses",
	},
	// Generic headline default
	headline: {
		eyebrow: "",
		title: "",
		body: "",
	},
};

/** Default headline copy tailored specifically per public page. */
export const SECTION_PAGE_HEADLINE_DEFAULTS: Partial<
	Record<CmsPageKey, { eyebrow: string; title: string; body: string }>
> = {
	courses: {
		eyebrow: "Academics",
		title: "Courses & Academic Programmes",
		body: "Subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12.",
	},
	course_finder: {
		eyebrow: "Course finder",
		title: "Which stream",
		body: "Six questions. The result shows all three streams and why each one ranked where it did.",
	},
	calendar: {
		eyebrow: "Calendar",
		title: "Academic calendar & routine",
		body: "Every holiday, exam date, fee deadline and assembly scheduled for the 2083 session.",
	},
	gallery: {
		eyebrow: "Gallery",
		title: "Life on the Butwal-8 campus",
		body: "Assembly, laboratory work, athletics and graduation across three decades of Everest EBSS.",
	},
	notices: {
		eyebrow: "Notices",
		title: "Official notices & circulars",
		body: "Every circular, date sheet and administrative order published for students, parents and staff.",
	},
	scholarship: {
		eyebrow: "Scholarships",
		title: "Chhatrabritti & Free Studentship",
		body: "Every criterion, document and deadline published in full. Check yourself against a scheme, then download the form the desk asks for.",
	},
	posts: {
		eyebrow: "Updates & News",
		title: "Community Timeline",
		body: "Live updates, achievements, and announcements from our official community channels.",
	},
	clubs: {
		eyebrow: "Student life",
		title: "Clubs",
		body: "Clubs give students a place to build skills, make friends and take on responsibility beyond the classroom.",
	},
	events: {
		eyebrow: "School calendar",
		title: "Events",
		body: "Programmes, examinations, sports and celebrations happening at the school.",
	},
	resources: {
		eyebrow: "Resources",
		title: "Downloads and Materials",
		body: "Access important files, forms, and documents for the academic session.",
	},
	result: {
		eyebrow: "RESULT",
		title: "Board results",
		body: "Division splits over the last five sessions for secondary education exams.",
	},
	transportation: {
		eyebrow: "TRANSPORTATION",
		title: "Bus route and pickup finder",
		body: "Three routes cover Rupandehi from Devdaha in the north-east to Sunauli in the south.",
	},
};

/** Default hero copy tailored specifically per public page. */
export const SECTION_PAGE_HERO_DEFAULTS: Partial<
	Record<
		CmsPageKey,
		{
			eyebrow: string;
			headline: string;
			subheadline: string;
			primaryCtaLabel: string;
			primaryCtaHref: string;
			secondaryCtaLabel: string;
			secondaryCtaHref: string;
			image?: string;
		}
	>
> = {
	// Home (/): the closing panel that rises over the scroll footage. It is the
	// landing page's front door, so it carries the page's calls to action.
	home: {
		eyebrow: "Everest English Boarding · Butwal-8",
		headline: "Educated for\nthe climb ahead.",
		subheadline:
			"Three decades of Science and Management teaching in Rupandehi — small classes, working laboratories, and a faculty that knows every name in the room.",
		primaryCtaLabel: "Start an application",
		primaryCtaHref: "/admissions",
		secondaryCtaLabel: "Visit the campus",
		secondaryCtaHref: "/contact",
		image: "/schools/everest/landing-footage/frame_0139.jpeg",
	},
};

export function sectionLabel(type: BlockType): string {
	return SECTION_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Default fields for a section, optionally customized by target page. */
export function sectionDefaults(
	type: BlockType,
	pageKey?: CmsPageKey,
): Record<string, unknown> {
	if (type === "hero" && pageKey && SECTION_PAGE_HERO_DEFAULTS[pageKey]) {
		return SECTION_PAGE_HERO_DEFAULTS[pageKey];
	}
	if (
		type === "headline" &&
		pageKey &&
		SECTION_PAGE_HEADLINE_DEFAULTS[pageKey]
	) {
		return SECTION_PAGE_HEADLINE_DEFAULTS[pageKey];
	}
	return SECTION_DEFAULTS[type] ?? {};
}

/** Fields for a section on a page, if a block of that type has been saved. */
export function getSectionFields(
	blocks: ContentBlock[] | null | undefined,
	type: BlockType,
): Record<string, unknown> | undefined {
	return blocks?.find((block) => block.type === type)?.fields;
}
