import type { BlockType, ContentBlock } from "@/types";

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
		case "faculty": return FACULTY_SECTION_TYPES;
		case "login": return LOGIN_SECTION_TYPES;
		case "activate": return ACTIVATE_SECTION_TYPES;
		case "home": return ["landing_hero", "landing_facts", "discover_cards", "landing_section_headings"];
		case "about": return ["chapters"];
		case "contact": return ["contact_details", "department_list", "office_hours", "map", "social_links"];
		case "courses": return ["headline", "academics"];
		case "course_finder": return ["headline"];
		case "facilities": return ["facilities"];
		case "gallery": return ["headline", "gallery_grid"];
		case "calendar": return ["headline", "featured_events"];
		case "resources": return ["headline", "rich_text"];
		case "result": return ["headline", "stats"];
		case "transportation": return ["headline", "contact_details"];
		case "notices": return ["headline"];
		case "scholarship": return ["headline"];
		case "posts": return ["headline"];
		case "admissions": return ["hero", "admissions_info", "cta"];
		case "clubs": return ["headline"];
		case "events": return ["headline"];
		default: return ["rich_text"];
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
	landing_hero: "Hero overlays",
	landing_facts: "Institution facts",
	discover_cards: "Discover cards",
	chapters: "Chapters",
	department_list: "Departments",
	landing_section_headings: "Section headings",
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
		disclosure:
			"Frontend demonstration — no credentials are transmitted or stored.",
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
		text1Body:
			"Developing character, capability, and curiosity since 2050 BS.",
		text2Title: "Future ready.",
		text2Body:
			"Our state-of-the-art facilities and modern curriculums empower students to thrive in an evolving world.",
		text3Title: "Everest.",
		text3Body: "The summit of education.",
	},
	landing_facts: {
		title: "Established in purpose.\nContemporary in outlook.",
		body: "Everest English Boarding Higher Secondary School is a learning institution in Nepal built around a simple conviction: students thrive when expectations are clear, relationships are strong, and curiosity has room to become practice.",
		facts: [
			{ label: "Institution", value: "Everest English Boarding Higher Secondary School" },
			{ label: "Learning Spaces", value: "Everest Building + Canon Building" },
			{ label: "Streams", value: "Science (Computer/Biology), Management" },
			{ label: "Labs", value: "Computer, Biology, Physics, Chemistry" },
		],
	},
	discover_cards: {
		cards: [
			{ eyebrow: "Academics", title: "Courses & Programs", body: "Explore subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12.", href: "/courses", image: "" },
			{ eyebrow: "Campus", title: "Facilities", body: "Detailed overviews of our laboratories, libraries, spaces, and digital infrastructure across the campus.", href: "/facilities", image: "" },
			{ eyebrow: "The Institution", title: "About Everest", body: "Our history, guiding principles, and the structural vision that builds the foundation of our institution.", href: "/about", image: "" },
		],
	},
	// About page (/about): seeds mirror the route's inline chapters array.
	chapters: {
		eyebrow: "About Everest",
		title: "Purpose held over time.",
		body: "An institution is not only what it has built. It is what it continues to protect, improve and pass forward.",
		chapters: [
			{ name: "Our Story", category: "Foundation", description: "Welcome to Everest English Boarding Secondary School, a premier institution dedicated to nurturing young minds. For over three decades, we have provided an environment that balances rigorous academic standards with holistic personal development.", image: "", inCharge: "School Board", since: "1995", block: "Overall Campus", studentsLove: "A home away from home where every student is known, valued, and inspired to succeed." },
			{ name: "Vision & Mission", category: "Foundation", description: "Our vision is to be a center of excellence that shapes global citizens. Our mission is to foster academic excellence while developing strong character and integrity in every student, making disciplined learning feel personal and connected.", image: "", inCharge: "Academic Council", since: "1995", block: "Institutional Policy", studentsLove: "Education is not just about filling minds, but igniting curiosity that lasts a lifetime." },
			{ name: "Principal's Message", category: "Leadership", description: "Education is a shared commitment between dedicated teachers, motivated students, and enthusiastic parents. We strive to create a dynamic environment where every child is empowered to discover their potential and achieve their dreams.", image: "", inCharge: "Principal's Office", since: "2010", block: "Administration", studentsLove: "The principal's door is always open—leadership here is about listening and guiding." },
			{ name: "Legacy & Heritage", category: "History", description: "What started as a small cohort of dedicated educators has blossomed into a vibrant, multi-building campus. Everest EBSS has consistently ranked among the top educational institutions in the Lumbini Province, shaping regional standards.", image: "", inCharge: "Founding Members", since: "1995", block: "Legacy & Timeline", studentsLove: "The history of our school is reflected in every brick and every lesson." },
			{ name: "Core Values", category: "Student Life", description: "We are guided by respect, responsibility, curiosity, and resilience. Everest encourages active participation in extracurricular activities, social service programs, and leadership councils to ensure students grow both inside and outside the classroom.", image: "", inCharge: "Student Council", since: "2000", block: "Student Governance", studentsLove: "The strength of Everest lies in the diversity of its community and the shared commitment to excellence." },
			{ name: "Accreditations", category: "Academics", description: "Fully accredited by the National Examinations Board (NEB) and the Ministry of Education, Nepal. We maintain rigorous standards across all our primary, secondary, and +2 programs ensuring our students are prepared for higher education globally.", image: "", inCharge: "Examination Board", since: "1995", block: "Academic Quality", studentsLove: "Knowing our education is recognized everywhere gives us the confidence to aim high." },
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
			{ name: "Admissions Office", contact: "Admissions Office", email: "admissions@everestbutwal.edu.np", hours: "Sun–Fri, 09:00–16:00" },
			{ name: "Accounts Office", contact: "Accounts Office", email: "accounts@everestbutwal.edu.np", hours: "Sun–Fri, 10:00–15:00" },
			{ name: "Principal's Office", contact: "Krishna Neupane", email: "principal@everestbutwal.edu.np", hours: "By appointment" },
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
			{ title: "1. Start an enquiry", description: "Send the contact form with your child's current grade and the year you are applying for." },
			{ title: "2. Visit the campus", description: "The office arranges a tour and a short conversation with the year coordinator." },
			{ title: "3. Submit documents", description: "Bring the previous report card, transfer certificate, birth certificate and photographs." },
		],
	},
	cta: {
		title: "Questions before you apply?",
		body: "We reply within one working day.",
		buttonLabel: "Contact the office",
		buttonHref: "/contact",
	},
	// Landing page editorial section headings (the four SectionHeading strips).
	landing_section_headings: {
		resultsEyebrow: "Academic Excellence",
		resultsTitle: "Board Results",
		resultsDesc: "Consistent performance across all levels of examination.",
		discoverEyebrow: "Explore Everest",
		discoverTitle: "Discover the school",
		discoverDesc: "Learn more about our academic programs, state-of-the-art facilities, and the institution's history.",
		galleryEyebrow: "Campus Life",
		galleryTitle: "Gallery Highlights",
		galleryDesc: "Moments captured around the school grounds and during major events.",
		updatesEyebrow: "Stay Updated",
		updatesTitle: "Latest Announcements",
		updatesDesc: "News and events from our community timeline.",
		facultyEyebrow: "Leadership",
		facultyTitle: "Our Faculty",
		facultyDesc: "The educators leading our academic departments and steering the school's vision.",
	},
	// Contact page (/contact): mirrors the route copy.
	social_links: {
		facebook: "https://facebook.com/everestbutwal",
		instagram: "https://instagram.com/everestbutwal",
		linkedin: "https://linkedin.com/school/everestbutwal",
		x: "",
		youtube: "https://youtube.com/@everestbutwal",
	},
	// Courses page (/courses): mirrors the route copy.
	academics: {
		body: "Each row opens into the full subject list, credit hours, fee table and progression routes for that programme.",
		title: "",
	},
	// Facilities page (/facilities): mirrors the route copy.
	facilities: {
		eyebrow: "Campus",
		title: "Facilities & Infrastructure",
		body: "Capacity, opening hours and the member of staff who holds the key, for every space on the Butwal-8 campus.",
	},
	// Gallery page (/gallery): mirrors the route copy.
	gallery_grid: {
		title: "",
	},
	// Calendar page (/calendar): mirrors the route copy.
	featured_events: {
		count: 47,
		title: "Every date this session",
	},
	// Result page (/result): mirrors the route copy.
	stats: {
		title: "",
		body: "",
	},
};

export function sectionLabel(type: BlockType): string {
	return SECTION_LABELS[type] ?? type.replace(/_/g, " ");
}

/** Default fields for a section, used to seed the editor and create blocks. */
export function sectionDefaults(type: BlockType): Record<string, unknown> {
	return SECTION_DEFAULTS[type] ?? {};
}

/** Fields for a section on a page, if a block of that type has been saved. */
export function getSectionFields(
	blocks: ContentBlock[] | null | undefined,
	type: BlockType,
): Record<string, unknown> | undefined {
	return blocks?.find((block) => block.type === type)?.fields;
}
