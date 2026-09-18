//#region node_modules/.nitro/vite/services/ssr/assets/site-D2pkIopk.js
var ph = (label, w = 1200, h = 800) => ({
	src: `/images/placeholder-campus.svg`,
	alt: `Temporary placeholder for ${label}; final school photograph pending`,
	width: w,
	height: h
});
var subject = (id, name, theory = 75, practical = 25) => ({
	id,
	name,
	creditHours: 5,
	theory,
	practical,
	outline: [
		`Foundations of ${name}`,
		`Applied ${name} projects`,
		`Term assessment and review`
	]
});
var school = {
	name: "Everest English Boarding Secondary School",
	nepali: "एभरेष्ट इङ्लिस बोर्डिङ सेकेन्डरी स्कुल",
	short: "EVEREST",
	tagline: "SCHOOL TAGLINE — EDIT IN CMS",
	address: "Butwal-8, Sukkhanagar, Rupandehi, Lumbini Province, Nepal",
	registration: "REG. NO. EEBSS/Rup/2048",
	phoneNtc: "+977 71 535962",
	phoneNcell: "+977 71 531342",
	email: "everestbutwal@gmail.com"
};
[
	"morning campus",
	"morning assembly",
	"classroom lesson",
	"science laboratory",
	"sports field at closing"
].map((alt) => ({
	...ph(alt, 1920, 1080),
	caption: alt
}));
[
	[
		"p1",
		"01 / Institution",
		"About Everest",
		"The purpose, people and principles behind our school.",
		"/about",
		"school community"
	],
	[
		"p2",
		"02 / Learning",
		"Courses",
		"A clear path from foundational learning to +2.",
		"/courses",
		"students learning"
	],
	[
		"p3",
		"03 / Campus",
		"Facilities",
		"Spaces designed for focus, curiosity and care.",
		"/facilities",
		"school facilities"
	],
	[
		"p4",
		"04 / Life",
		"Gallery",
		"The school year gathered in photographs.",
		"/gallery",
		"school events"
	]
].map(([id, label, title, blurb, href, img]) => ({
	id,
	label,
	title,
	blurb,
	href,
	image: ph(img)
}));
ph("school foundation"), ph("school growth"), ph("school today");
ph("principal portrait", 600, 800), ph("vice principal portrait", 600, 800), ph("coordinator portrait", 600, 800);
var common = [
	subject("eng", "English"),
	subject("nep", "Nepali"),
	subject("soc", "Social Studies", 100, 0)
];
[
	...common,
	subject("math", "Mathematics", 100, 0),
	subject("sci", "Science")
], [
	...common,
	subject("math2", "Mathematics", 100, 0),
	subject("science2", "Science and Technology")
], [
	...common,
	subject("physics", "Physics"),
	subject("chem", "Chemistry"),
	subject("biology", "Biology")
], [
	...common,
	subject("accounts", "Accountancy", 75, 25),
	subject("economics", "Economics", 100, 0),
	subject("business", "Business Studies", 100, 0)
], [
	...common,
	subject("sociology", "Sociology", 100, 0),
	subject("psychology", "Psychology"),
	subject("mass", "Mass Communication")
];
[
	[
		"library",
		"Library",
		"ROOM L–01"
	],
	[
		"science",
		"Science Laboratories",
		"LAB S–02"
	],
	[
		"computer",
		"Computer Lab",
		"LAB C–01"
	],
	[
		"class",
		"Smart Classrooms",
		"BLOCK A"
	],
	[
		"hostel",
		"Student Hostel",
		"BLOCK H"
	],
	[
		"canteen",
		"Canteen",
		"BLOCK C"
	],
	[
		"transport",
		"Transport",
		"GATE 02"
	],
	[
		"sports",
		"Sports Ground",
		"FIELD 01"
	],
	[
		"medical",
		"Medical Room",
		"ROOM M–01"
	]
].map(([id, name, room], i) => ({
	id,
	name,
	room,
	specs: [
		"Supervised during school hours",
		`${24 + i * 4} learner capacity`,
		"Maintained each academic term"
	],
	images: [ph(name), ph(`${name} activity`)],
	block: {
		id,
		d: `M${20 + i % 3 * 110} ${25 + Math.floor(i / 3) * 82}h90v58h-90z`,
		cx: 65 + i % 3 * 110,
		cy: 55 + Math.floor(i / 3) * 82
	}
}));
[
	[
		"sports",
		"Annual Sports Day",
		"2082 B.S.",
		"Sports"
	],
	[
		"science",
		"Science Exhibition",
		"2082 B.S.",
		"Academic"
	],
	[
		"culture",
		"Cultural Programme",
		"2081 B.S.",
		"Culture"
	],
	[
		"graduation",
		"Grade 12 Farewell",
		"2081 B.S.",
		"Community"
	]
].map(([id, event, year, category], a) => ({
	id,
	event,
	year,
	category,
	photos: Array.from({ length: 5 }, (_, i) => ph(`${event}, photograph ${i + 1}`, 900 + i % 2 * 300, 700 + i % 3 * 100))
}));
var departments = [
	{
		id: "admissions",
		name: "Admissions Office",
		contact: "Anita Shrestha",
		phones: [school.phoneNtc],
		email: "admissions@everestpokhara.edu.np",
		hours: "Sun–Fri, 09:00–16:00"
	},
	{
		id: "accounts",
		name: "Accounts Office",
		contact: "Bikash Rana",
		phones: [school.phoneNcell],
		email: "accounts@everestpokhara.edu.np",
		hours: "Sun–Fri, 10:00–15:00"
	},
	{
		id: "principal",
		name: "Principal's Office",
		contact: "Maya Gurung",
		phones: [school.phoneNtc],
		email: "principal@everestpokhara.edu.np",
		hours: "By appointment"
	}
];
var pageCopy = {
	home: {
		eyebrow: "EST. 2048 B.S. / 1991 A.D. · POKHARA, NEPAL",
		title: "LEARNING WITH\nPURPOSE. GROWING\nWITH CONFIDENCE.",
		support: "A complete school journey in Pokhara, built on close teaching, clear standards and care for every learner.",
		admissions: "ADMISSIONS 2083 B.S. / 2026 A.D."
	},
	about: {
		eyebrow: "ABOUT EVEREST",
		title: "PURPOSE HELD\nOVER TIME.",
		support: "An institution is not only what it has built. It is what it continues to protect, improve and pass forward."
	},
	courses: {
		eyebrow: "ACADEMIC PATHWAYS",
		title: "EVERY STAGE\nBUILDS THE NEXT.",
		support: "From the first classroom to +2, learning rises in clarity, independence and possibility."
	},
	facilities: {
		eyebrow: "THE CAMPUS",
		title: "SPACES THAT\nMAKE WORK POSSIBLE.",
		support: "Explore the rooms, grounds and support services that shape an ordinary school day."
	},
	gallery: {
		eyebrow: "THE SCHOOL YEAR",
		title: "MOMENTS,\nGATHERED.",
		support: "A growing visual record of learning, celebration, effort and community."
	},
	contact: {
		eyebrow: "CONTACT EVEREST",
		title: "THE RIGHT PERSON.\nA CLEAR ANSWER.",
		support: "Choose a department and your enquiry reaches the team best placed to help."
	},
	login: {
		eyebrow: "SCHOOL PORTAL",
		title: "WELCOME\nBACK.",
		support: "Choose your role and enter your school-issued details."
	},
	activate: {
		eyebrow: "ACCOUNT ACTIVATION",
		title: "BEGIN\nSECURELY.",
		support: "Use the six-character code issued by the school office."
	},
	styleguide: {
		eyebrow: "DESIGN SYSTEM",
		title: "EVEREST,\nBY THE RULES.",
		support: "The approved visual foundation for every public page and CMS view."
	}
};
//#endregion
export { departments, pageCopy, school };
