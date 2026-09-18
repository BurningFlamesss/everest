import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowUpRight, GraduationCap, Minus } from "../_libs/lucide-react.mjs";
import { PageFrame, PageHeader, Reveal, Route$49, STAGGER, Section, SectionHeading, school, useWebsitePageContent } from "./router-dKngB4cM.mjs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from "./kit-Cq_igxhQ.mjs";
import { EditorialImage, photo } from "./media-CDFoNHKI.mjs";
import { DownloadButton, academicProspectusDoc, downloadOfficialPdf, programProspectusDoc } from "./DownloadButton-DFu4Krfj.mjs";
import { RoutineTable, routineByKey } from "./RoutineTable-BGTmWFeD.mjs";
import { formatNpr } from "./fees-Dt1EXS-9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/courses-GIlPTAVY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var levels = [
	{
		id: "basic",
		label: "Early Years & Primary",
		short: "Primary",
		grades: "Nursery – Grade 5",
		board: "CDC Basic Level Curriculum",
		tagline: "Where curiosity is given room to breathe.",
		description: "Our foundation years follow the Curriculum Development Centre basic-level framework, delivered through activity-first English medium teaching. Class sizes are capped at 28 so that every child is known by name, and reading fluency is tracked termly rather than annually.",
		image: photo("primaryClassroom")
	},
	{
		id: "lower-secondary",
		label: "Lower Secondary",
		short: "Grade 6–8",
		grades: "Grade 6 – Grade 8",
		board: "CDC Basic Level Curriculum",
		tagline: "The years that decide how a student thinks.",
		description: "Grades six to eight are where habits harden. Students move into subject-specialist teaching, begin laboratory work, and choose an exploratory track so that the Grade 9 decision is made from experience rather than guesswork.",
		image: photo("studyPair")
	},
	{
		id: "secondary",
		label: "Secondary · SEE",
		short: "Grade 9–10",
		grades: "Grade 9 – Grade 10",
		board: "National Examinations Board · SEE",
		tagline: "Two years of deliberate preparation for the SEE.",
		description: "The secondary programme prepares candidates for the Secondary Education Examination with a concentration chosen in Grade 9. Optional Mathematics, Computer Science and Accountancy concentrations run in parallel, all sharing the same compulsory core.",
		image: photo("equations")
	},
	{
		id: "plus2-science",
		label: "+2 Science",
		short: "+2 Science",
		grades: "Grade 11 – Grade 12",
		board: "National Examinations Board · Science Stream",
		tagline: "Laboratory hours, not just lecture hours.",
		description: "The Science stream runs on a morning shift with mandatory weekly practical sessions in Physics, Chemistry and Biology. Students select either the Physical group or the Biology group at the point of admission, and both prepare candidates for national entrance examinations.",
		image: photo("laboratory")
	},
	{
		id: "plus2-management",
		label: "+2 Management",
		short: "+2 Management",
		grades: "Grade 11 – Grade 12",
		board: "National Examinations Board · Management Stream",
		tagline: "Commerce taught with real ledgers and real cases.",
		description: "Management students work through the NEB syllabus alongside a case-based practicum: quarterly business simulations, a compulsory bookkeeping portfolio, and an internship week with Butwal-based enterprises in Grade 12.",
		image: photo("computerLab")
	}
];
var programs = [
	{
		id: "early-years",
		level: "basic",
		code: "EY-100",
		title: "Early Years Foundation",
		stream: "Nursery · LKG · UKG",
		duration: "3 years",
		seats: 84,
		medium: "English (Nepali supported)",
		eligibility: "Age 3+ as of Baisakh 1; informal readiness conversation with parents",
		summary: "A play-led, phonics-anchored start where literacy and numeracy grow out of structured play rather than worksheets.",
		description: "The Early Years Foundation is built around six learning corners — language, number, discovery, art, movement and quiet reading. Children rotate through corners daily, and each term closes with a portfolio review shared with parents instead of a ranked report card. Two teachers and one caregiver are assigned to every section.",
		highlights: [
			"Two teachers plus one caregiver for every section of 24 children",
			"Jolly Phonics sequence completed before Grade 1 entry",
			"Termly learning portfolio replaces ranked report cards",
			"Dedicated indoor play hall for monsoon months"
		],
		outcomes: [
			"Reads simple decodable texts independently by the end of UKG",
			"Writes numerals to 100 and adds within 20 without prompts",
			"Settles into a full school day without separation distress"
		],
		careers: [],
		subjects: [
			{
				code: "EY-ENG",
				name: "English Language & Phonics",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "EY-NEP",
				name: "Nepali Language",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "EY-MAT",
				name: "Early Mathematics",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "EY-DIS",
				name: "Discovery of Environment",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "EY-ART",
				name: "Art, Music & Movement",
				credit: 2,
				kind: "Co-curricular"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 9500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 3200,
				frequency: "Monthly"
			},
			{
				label: "Learning materials & portfolio",
				amount: 6800,
				frequency: "Annual"
			}
		],
		image: photo("earlyLearning"),
		routineKey: "grade-1-5"
	},
	{
		id: "primary-years",
		level: "basic",
		code: "PR-200",
		title: "Primary Years Programme",
		stream: "Grade 1 – Grade 3",
		duration: "3 years",
		seats: 96,
		medium: "English",
		eligibility: "Completion of UKG or an equivalent placement assessment",
		summary: "Reading fluency, mental arithmetic and handwriting are tracked every term, with intervention groups running inside the timetable.",
		description: "Grades one to three concentrate ruthlessly on the fundamentals. Every child is assessed on oral reading fluency three times a year, and those below benchmark join a thirty-minute daily support group led by the same class teacher — not an external tutor. Science and Social Studies are taught through a single integrated Environment paper as prescribed by the CDC.",
		highlights: [
			"Daily 30-minute reading intervention block inside school hours",
			"Mental mathematics ladder assessed fortnightly",
			"Library period twice weekly with take-home reading log",
			"No homework on Fridays, by policy"
		],
		outcomes: [
			"Reads age-appropriate chapter books with comprehension",
			"Completes four-operation arithmetic accurately",
			"Writes a structured paragraph with correct punctuation"
		],
		careers: [],
		subjects: [
			{
				code: "PR-ENG",
				name: "English",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "PR-NEP",
				name: "Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "PR-MAT",
				name: "Mathematics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "PR-ENV",
				name: "Our Environment (Science & Social)",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "PR-CMP",
				name: "Computer Basics",
				credit: 2,
				kind: "Compulsory"
			},
			{
				code: "PR-HPE",
				name: "Health & Physical Education",
				credit: 2,
				kind: "Co-curricular"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 11e3,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 3600,
				frequency: "Monthly"
			},
			{
				label: "Books & stationery",
				amount: 8400,
				frequency: "Annual"
			},
			{
				label: "Library & laboratory",
				amount: 2400,
				frequency: "Annual"
			}
		],
		image: photo("youngLearners"),
		routineKey: "grade-1-5"
	},
	{
		id: "upper-primary",
		level: "basic",
		code: "UP-300",
		title: "Upper Primary Programme",
		stream: "Grade 4 – Grade 5",
		duration: "2 years",
		seats: 72,
		medium: "English",
		eligibility: "Promotion from Grade 3 or transfer certificate with placement test",
		summary: "The bridge years: subject teachers replace the single class teacher and the first formal laboratory sessions begin.",
		description: "Grades four and five introduce specialist teaching without losing pastoral continuity — each section keeps a named mentor who follows the cohort for both years. Students begin using the junior science laboratory, sit their first structured terminal examinations, and take on house responsibilities.",
		highlights: [
			"Named two-year mentor for every section",
			"First supervised junior laboratory sessions",
			"Project-based Social Studies with a Lumbini heritage unit",
			"Inter-house quiz and spelling league"
		],
		outcomes: [
			"Manages a multi-subject timetable and homework diary independently",
			"Records a simple scientific observation with a labelled diagram",
			"Presents a short researched talk to the class"
		],
		careers: [],
		subjects: [
			{
				code: "UP-ENG",
				name: "English",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "UP-NEP",
				name: "Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "UP-MAT",
				name: "Mathematics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "UP-SCI",
				name: "Science & Technology",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "UP-SOC",
				name: "Social Studies & Human Values",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "UP-CMP",
				name: "Computer Science",
				credit: 2,
				kind: "Compulsory"
			},
			{
				code: "UP-ART",
				name: "Creative Arts",
				credit: 2,
				kind: "Optional"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 12500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 4100,
				frequency: "Monthly"
			},
			{
				label: "Books & stationery",
				amount: 9600,
				frequency: "Annual"
			},
			{
				label: "Library & laboratory",
				amount: 3200,
				frequency: "Annual"
			}
		],
		image: photo("primaryClassroom"),
		routineKey: "grade-1-5"
	},
	{
		id: "lower-secondary-core",
		level: "lower-secondary",
		code: "LS-400",
		title: "Lower Secondary Core",
		stream: "Grade 6 – Grade 8",
		duration: "3 years",
		seats: 108,
		medium: "English",
		eligibility: "Promotion from Grade 5 or entrance assessment in English, Mathematics and Science",
		summary: "The full CDC basic-level core taught by subject specialists, closing with the Grade 8 Basic Level Examination.",
		description: "The core programme carries every student through the compulsory basic-level syllabus while an exploratory track runs alongside it. Assessment shifts to the NEB pattern early — two terminals and one final, with internal marks for practical work — so that the Grade 10 examination format is familiar long before it matters.",
		highlights: [
			"Subject-specialist teaching from Grade 6 onward",
			"Weekly laboratory session in the junior science block",
			"Grade 8 Basic Level Examination preparation from Shrawan",
			"Compulsory annual research poster in Science or Social Studies"
		],
		outcomes: [
			"Sits the Basic Level Examination with the district's syllabus fully covered",
			"Writes a structured five-paragraph essay under timed conditions",
			"Chooses a Grade 9 concentration based on tracked evidence"
		],
		careers: [],
		subjects: [
			{
				code: "LS-ENG",
				name: "English",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "LS-NEP",
				name: "Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "LS-MAT",
				name: "Mathematics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "LS-SCI",
				name: "Science & Technology",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "LS-SOC",
				name: "Social Studies",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "LS-CMP",
				name: "Computer Science",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "LS-HPE",
				name: "Health, Physical & Creative Arts",
				credit: 2,
				kind: "Compulsory"
			},
			{
				code: "LS-MOR",
				name: "Moral Education",
				credit: 2,
				kind: "Compulsory"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 14e3,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 4600,
				frequency: "Monthly"
			},
			{
				label: "Books & stationery",
				amount: 11200,
				frequency: "Annual"
			},
			{
				label: "Laboratory & computer",
				amount: 4200,
				frequency: "Annual"
			}
		],
		image: photo("studyPair"),
		routineKey: "grade-6-8"
	},
	{
		id: "stem-foundation",
		level: "lower-secondary",
		code: "LS-410",
		title: "STEM Foundation Track",
		stream: "Exploratory track · Grade 6–8",
		duration: "3 years (2 periods weekly)",
		seats: 48,
		medium: "English",
		eligibility: "Open to all Grade 6 entrants; selection by interest form and teacher note",
		summary: "An in-timetable track for students who want more laboratory and build time before choosing a Grade 9 concentration.",
		description: "The STEM Foundation Track replaces two general periods a week with sustained project work: sensor-based measurement, simple electronics, structural models and an annual entry to the Everest Science Exhibition. Every student leaves the track with a documented build log rather than a certificate.",
		highlights: [
			"Runs inside the school timetable — no extra hours, no extra fee",
			"Arduino and sensor kits shared one between two students",
			"Compulsory entry to the annual Science Exhibition",
			"Build log reviewed by the +2 Science coordinator"
		],
		outcomes: [
			"Designs and documents a fair test with controlled variables",
			"Wires and debugs a simple microcontroller circuit",
			"Presents a project to an external panel at exhibition"
		],
		careers: [],
		subjects: [
			{
				code: "ST-MEA",
				name: "Measurement & Instrumentation",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "ST-ELE",
				name: "Introductory Electronics",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "ST-COD",
				name: "Block & Python Coding",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "ST-PRJ",
				name: "Exhibition Project Studio",
				credit: 3,
				kind: "Elective"
			}
		],
		fees: [{
			label: "Track materials (consumables)",
			amount: 2600,
			frequency: "Annual",
			note: "Waived for scholarship holders"
		}],
		image: photo("molecule"),
		routineKey: "grade-6-8"
	},
	{
		id: "language-communication",
		level: "lower-secondary",
		code: "LS-420",
		title: "Language & Communication Track",
		stream: "Exploratory track · Grade 6–8",
		duration: "3 years (2 periods weekly)",
		seats: 48,
		medium: "English & Nepali",
		eligibility: "Open to all Grade 6 entrants; selection by interest form",
		summary: "Debate, dramatics and long-form writing for students whose strength is language rather than laboratory.",
		description: "This track treats speaking and writing as trainable skills. Students rotate through parliamentary debate, radio-style script writing, Nepali literary appreciation and a supervised long-form essay. The track feeds the school's debate squad and the annual literary magazine, Sagarmatha Patra.",
		highlights: [
			"Termly parliamentary debate ladder with published rankings",
			"Editorial roles on the school literary magazine",
			"One supervised 1,500-word essay per year",
			"Bilingual public-speaking assessment"
		],
		outcomes: [
			"Argues a prepared and an impromptu motion confidently",
			"Edits peer writing against a shared rubric",
			"Publishes at least one piece in the school magazine"
		],
		careers: [],
		subjects: [
			{
				code: "LC-DEB",
				name: "Debate & Public Speaking",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "LC-WRI",
				name: "Long-form Writing Studio",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "LC-LIT",
				name: "Nepali Literary Appreciation",
				credit: 2,
				kind: "Elective"
			},
			{
				code: "LC-DRA",
				name: "Dramatics & Voice",
				credit: 2,
				kind: "Elective"
			}
		],
		fees: [{
			label: "Track materials & magazine",
			amount: 1800,
			frequency: "Annual",
			note: "Waived for scholarship holders"
		}],
		image: photo("booksSpines"),
		routineKey: "grade-6-8"
	},
	{
		id: "secondary-science-maths",
		level: "secondary",
		code: "SEC-510",
		title: "Secondary Programme — Science & Optional Mathematics",
		stream: "Grade 9–10 concentration",
		duration: "2 years",
		seats: 64,
		medium: "English",
		eligibility: "Grade 8 Basic Level pass with a minimum B grade in Mathematics and Science",
		summary: "The concentration chosen by most future +2 Science candidates: Optional Mathematics alongside the compulsory SEE core.",
		description: "This is the most demanding of the three secondary concentrations and the natural feeder into the Physical group at +2. Optional Mathematics is taught by two teachers across the cohort, and Science practical work is logged in a bound record book that carries internal marks into the SEE.",
		highlights: [
			"Optional Mathematics taught as a full six-period subject",
			"Bound practical record book assessed for SEE internal marks",
			"Saturday problem-solving clinic in Falgun and Chaitra",
			"Direct counselling link to the +2 Science coordinator"
		],
		outcomes: [
			"Sits the SEE with Optional Mathematics as the fourth paper",
			"Completes all prescribed Science practicals with a verified record",
			"Qualifies for the Physical group at +2 without a bridge course"
		],
		careers: [
			"+2 Science · Physical group",
			"Engineering entrance preparation (IOE)",
			"Pre-medical preparation with a Biology bridge"
		],
		subjects: [
			{
				code: "SEC-ENG",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-NEP",
				name: "Compulsory Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-MAT",
				name: "Compulsory Mathematics",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SCI",
				name: "Science & Technology",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SOC",
				name: "Social Studies & Population",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-OMA",
				name: "Optional Mathematics",
				credit: 4,
				kind: "Optional"
			},
			{
				code: "SEC-HPE",
				name: "Health & Physical Education",
				credit: 2,
				kind: "Co-curricular"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 16500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 5400,
				frequency: "Monthly"
			},
			{
				label: "Books & stationery",
				amount: 13400,
				frequency: "Annual"
			},
			{
				label: "Laboratory & practical record",
				amount: 5600,
				frequency: "Annual"
			},
			{
				label: "SEE registration & board fee",
				amount: 2800,
				frequency: "One-time"
			}
		],
		image: photo("equations"),
		routineKey: "grade-9-10",
		spotlight: true
	},
	{
		id: "secondary-computer",
		level: "secondary",
		code: "SEC-520",
		title: "Secondary Programme — Computer Science",
		stream: "Grade 9–10 concentration",
		duration: "2 years",
		seats: 48,
		medium: "English",
		eligibility: "Grade 8 Basic Level pass; Computer Science aptitude interview",
		summary: "Computer Science as the optional SEE subject, taught in a lab with one machine per student.",
		description: "Students take Computer Science as their fourth paper and work through structured programming, database fundamentals and web basics. All practical assessment happens on individual machines, and the cohort maintains a shared repository of solved problems that is handed down each year.",
		highlights: [
			"One workstation per student for every practical period",
			"Programming portfolio in C and Python",
			"Annual inter-school coding relay hosted on campus",
			"Robotics club priority access"
		],
		outcomes: [
			"Sits the SEE with Computer Science as the optional paper",
			"Builds and documents a small database-backed project",
			"Progresses to +2 Science or Management with Computer Science"
		],
		careers: [
			"+2 Science with Computer Science",
			"+2 Management with Computer Science",
			"CSIT / BIT undergraduate pathways"
		],
		subjects: [
			{
				code: "SEC-ENG",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-NEP",
				name: "Compulsory Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-MAT",
				name: "Compulsory Mathematics",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SCI",
				name: "Science & Technology",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SOC",
				name: "Social Studies & Population",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-CMP",
				name: "Computer Science (Optional)",
				credit: 4,
				kind: "Optional"
			},
			{
				code: "SEC-HPE",
				name: "Health & Physical Education",
				credit: 2,
				kind: "Co-curricular"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 16500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 5400,
				frequency: "Monthly"
			},
			{
				label: "Books & stationery",
				amount: 12800,
				frequency: "Annual"
			},
			{
				label: "Computer laboratory",
				amount: 6400,
				frequency: "Annual"
			},
			{
				label: "SEE registration & board fee",
				amount: 2800,
				frequency: "One-time"
			}
		],
		image: photo("computerLab"),
		routineKey: "grade-9-10"
	},
	{
		id: "secondary-business",
		level: "secondary",
		code: "SEC-530",
		title: "Secondary Programme — Business & Accountancy",
		stream: "Grade 9–10 concentration",
		duration: "2 years",
		seats: 40,
		medium: "English",
		eligibility: "Grade 8 Basic Level pass",
		summary: "Accountancy as the optional SEE paper, with double-entry bookkeeping practised on real ledger stationery.",
		description: "The business concentration is deliberately practical. Students keep a hand-written ledger through both years, prepare final accounts for a fictional Butwal trading house, and visit a local cooperative to see the books they have been studying. It is the standard route into the +2 Management stream.",
		highlights: [
			"Hand-written ledger portfolio maintained across two years",
			"Field visit to a Butwal savings cooperative in Grade 10",
			"Weekly numerical reasoning drill",
			"Direct counselling link to the +2 Management coordinator"
		],
		outcomes: [
			"Sits the SEE with Accountancy as the optional paper",
			"Prepares a trial balance and final accounts unaided",
			"Qualifies for the Accountancy & Finance group at +2"
		],
		careers: [
			"+2 Management · Accountancy & Finance group",
			"BBS / BBA undergraduate pathways",
			"Chartered accountancy foundation"
		],
		subjects: [
			{
				code: "SEC-ENG",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-NEP",
				name: "Compulsory Nepali",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-MAT",
				name: "Compulsory Mathematics",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SCI",
				name: "Science & Technology",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-SOC",
				name: "Social Studies & Population",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "SEC-ACC",
				name: "Accountancy (Optional)",
				credit: 4,
				kind: "Optional"
			},
			{
				code: "SEC-HPE",
				name: "Health & Physical Education",
				credit: 2,
				kind: "Co-curricular"
			}
		],
		fees: [
			{
				label: "Admission (one-time)",
				amount: 15500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 5100,
				frequency: "Monthly"
			},
			{
				label: "Books, ledgers & stationery",
				amount: 12200,
				frequency: "Annual"
			},
			{
				label: "Field visit & practicum",
				amount: 3400,
				frequency: "Annual"
			},
			{
				label: "SEE registration & board fee",
				amount: 2800,
				frequency: "One-time"
			}
		],
		image: photo("studentsTeamwork"),
		routineKey: "grade-9-10"
	},
	{
		id: "plus2-physical",
		level: "plus2-science",
		code: "NEB-SCI-PHY",
		title: "+2 Science — Physical Group",
		stream: "Physics · Chemistry · Mathematics · Computer Science",
		duration: "2 years · 4 semesters of internal assessment",
		seats: 96,
		medium: "English",
		eligibility: "SEE with minimum GPA 2.4 and a C grade in Compulsory Mathematics and Science",
		summary: "The engineering-facing group: Mathematics and Computer Science alongside Physics and Chemistry, on a morning shift.",
		description: "The Physical group is designed for candidates heading towards engineering and computing entrance examinations. Classes run 06:30 to 11:20 so that students can attend afternoon entrance coaching, and the school runs its own IOE-pattern mock series in Grade 12 at no additional cost.",
		highlights: [
			"Morning shift (06:30–11:20) leaves afternoons free for entrance preparation",
			"Three timetabled practical periods weekly across Physics and Chemistry",
			"Six in-house IOE-pattern mock examinations in Grade 12",
			"Mathematics taught in two ability-paced sections"
		],
		outcomes: [
			"Completes the NEB Grade 11 and 12 Science syllabus with verified practicals",
			"Sits engineering and computing entrance examinations with mock experience",
			"Holds a documented project or exhibition entry on the transcript"
		],
		careers: [
			"Bachelor of Engineering (Civil, Computer, Electronics)",
			"BSc CSIT / BIT",
			"BSc Physics or Mathematics",
			"Architecture and applied sciences"
		],
		subjects: [
			{
				code: "ENG-101",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "NEP-101",
				name: "Compulsory Nepali",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "PHY-101",
				name: "Physics (with practical)",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "CHE-101",
				name: "Chemistry (with practical)",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "MAT-101",
				name: "Mathematics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "CMP-101",
				name: "Computer Science",
				credit: 5,
				kind: "Elective"
			},
			{
				code: "SOS-101",
				name: "Social Studies & Life Skills",
				credit: 2,
				kind: "Compulsory"
			}
		],
		fees: [
			{
				label: "Admission & registration",
				amount: 21500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 7200,
				frequency: "Monthly"
			},
			{
				label: "Laboratory & practical",
				amount: 9800,
				frequency: "Annual"
			},
			{
				label: "Books & lab manuals",
				amount: 15600,
				frequency: "Annual"
			},
			{
				label: "NEB board & examination fee",
				amount: 4200,
				frequency: "Annual"
			},
			{
				label: "Mock series & counselling",
				amount: 3600,
				frequency: "Annual",
				note: "Included — not charged separately"
			}
		],
		image: photo("labGlassware"),
		routineKey: "grade-11-12-science",
		spotlight: true
	},
	{
		id: "plus2-biology",
		level: "plus2-science",
		code: "NEB-SCI-BIO",
		title: "+2 Science — Biology Group",
		stream: "Physics · Chemistry · Biology",
		duration: "2 years · 4 semesters of internal assessment",
		seats: 72,
		medium: "English",
		eligibility: "SEE with minimum GPA 2.4 and a C+ grade in Science",
		summary: "The medical-facing group, with a dedicated microscopy laboratory and a structured dissection and specimen syllabus.",
		description: "Biology group students work in a separate microscopy laboratory with thirty compound microscopes and a maintained specimen collection. Grade 12 includes a supervised MECEE-pattern mock series and a hospital observation day arranged with a Butwal teaching hospital.",
		highlights: [
			"Thirty compound microscopes — one per student in practical periods",
			"Maintained botanical and zoological specimen collection",
			"MECEE-pattern mock series in Grade 12",
			"Hospital observation day for the Grade 12 cohort"
		],
		outcomes: [
			"Completes the NEB Biology syllabus with a verified practical record",
			"Sits medical entrance examinations with mock experience",
			"Handles laboratory microscopy and staining independently"
		],
		careers: [
			"MBBS / BDS entrance (MECEE)",
			"BSc Nursing and allied health sciences",
			"B Pharm, BSc Microbiology, Biotechnology",
			"Agriculture and veterinary sciences"
		],
		subjects: [
			{
				code: "ENG-101",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "NEP-101",
				name: "Compulsory Nepali",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "PHY-101",
				name: "Physics (with practical)",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "CHE-101",
				name: "Chemistry (with practical)",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "BIO-101",
				name: "Biology (Botany & Zoology)",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "MAT-102",
				name: "Mathematics",
				credit: 5,
				kind: "Elective"
			},
			{
				code: "SOS-101",
				name: "Social Studies & Life Skills",
				credit: 2,
				kind: "Compulsory"
			}
		],
		fees: [
			{
				label: "Admission & registration",
				amount: 21500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 7400,
				frequency: "Monthly"
			},
			{
				label: "Laboratory, microscopy & specimens",
				amount: 11200,
				frequency: "Annual"
			},
			{
				label: "Books & lab manuals",
				amount: 16200,
				frequency: "Annual"
			},
			{
				label: "NEB board & examination fee",
				amount: 4200,
				frequency: "Annual"
			}
		],
		image: photo("microscope"),
		routineKey: "grade-11-12-science"
	},
	{
		id: "plus2-accountancy",
		level: "plus2-management",
		code: "NEB-MGT-ACC",
		title: "+2 Management — Accountancy & Finance Group",
		stream: "Accountancy · Economics · Business Studies",
		duration: "2 years · 4 semesters of internal assessment",
		seats: 96,
		medium: "English",
		eligibility: "SEE with minimum GPA 1.6 and a D+ grade in Compulsory Mathematics",
		summary: "Double-entry accounting taught to professional standard, with a compulsory bookkeeping portfolio in both years.",
		description: "This group prepares candidates for BBS, BBA and chartered accountancy foundation routes. Alongside the NEB syllabus, students maintain a bookkeeping portfolio, run a quarterly business simulation against other sections, and complete an internship week with a Butwal enterprise in Grade 12.",
		highlights: [
			"Compulsory bookkeeping portfolio assessed each semester",
			"Quarterly inter-section business simulation",
			"Internship week with a Butwal enterprise in Grade 12",
			"Tally and spreadsheet accounting taught in the computer laboratory"
		],
		outcomes: [
			"Completes the NEB Management syllabus with internal marks secured",
			"Prepares company final accounts and interprets ratios",
			"Holds a documented internship report on the transcript"
		],
		careers: [
			"BBS / BBA / BBM",
			"Chartered Accountancy (CAP-I) foundation",
			"Banking and cooperative sector entry",
			"BA Economics"
		],
		subjects: [
			{
				code: "ENG-101",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "NEP-101",
				name: "Compulsory Nepali",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "ACC-101",
				name: "Accountancy",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "ECO-101",
				name: "Economics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "BST-101",
				name: "Business Studies",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "BMA-101",
				name: "Business Mathematics",
				credit: 5,
				kind: "Elective"
			},
			{
				code: "SOS-101",
				name: "Social Studies & Life Skills",
				credit: 2,
				kind: "Compulsory"
			}
		],
		fees: [
			{
				label: "Admission & registration",
				amount: 18500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 6200,
				frequency: "Monthly"
			},
			{
				label: "Practicum, ledgers & simulation",
				amount: 6800,
				frequency: "Annual"
			},
			{
				label: "Books & stationery",
				amount: 13200,
				frequency: "Annual"
			},
			{
				label: "NEB board & examination fee",
				amount: 4200,
				frequency: "Annual"
			}
		],
		image: photo("studentGroup"),
		routineKey: "grade-11-12-management",
		spotlight: true
	},
	{
		id: "plus2-computer-business",
		level: "plus2-management",
		code: "NEB-MGT-CMP",
		title: "+2 Management — Computer & Business Studies Group",
		stream: "Computer Science · Business Studies · Economics",
		duration: "2 years · 4 semesters of internal assessment",
		seats: 64,
		medium: "English",
		eligibility: "SEE with minimum GPA 1.8; preference to Computer Science optional candidates",
		summary: "For students who want commerce and computing together — the standard route into BIM, BIT and BCA programmes.",
		description: "Computer Science replaces Accountancy as the fourth paper, giving students a commerce foundation with genuine technical depth. The group builds a working web application in Grade 12 and presents it at the annual showcase alongside the Science exhibition entries.",
		highlights: [
			"Computer Science as a full five-credit paper",
			"Grade 12 capstone: a working web application, presented publicly",
			"Spreadsheet modelling and data visualisation module",
			"Shared access to the robotics and computing laboratory"
		],
		outcomes: [
			"Completes the NEB Management syllabus with Computer Science",
			"Ships and documents a functioning software capstone",
			"Qualifies for BIM, BIT, BCA and BBA entrance routes"
		],
		careers: [
			"BIM / BIT / BCA",
			"BBA with information systems",
			"Digital marketing and analytics",
			"Financial technology roles"
		],
		subjects: [
			{
				code: "ENG-101",
				name: "Compulsory English",
				credit: 4,
				kind: "Compulsory"
			},
			{
				code: "NEP-101",
				name: "Compulsory Nepali",
				credit: 3,
				kind: "Compulsory"
			},
			{
				code: "CMP-101",
				name: "Computer Science",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "BST-101",
				name: "Business Studies",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "ECO-101",
				name: "Economics",
				credit: 5,
				kind: "Compulsory"
			},
			{
				code: "BMA-101",
				name: "Business Mathematics",
				credit: 5,
				kind: "Elective"
			},
			{
				code: "SOS-101",
				name: "Social Studies & Life Skills",
				credit: 2,
				kind: "Compulsory"
			}
		],
		fees: [
			{
				label: "Admission & registration",
				amount: 19500,
				frequency: "One-time"
			},
			{
				label: "Tuition",
				amount: 6600,
				frequency: "Monthly"
			},
			{
				label: "Computer laboratory & capstone",
				amount: 8400,
				frequency: "Annual"
			},
			{
				label: "Books & stationery",
				amount: 12800,
				frequency: "Annual"
			},
			{
				label: "NEB board & examination fee",
				amount: 4200,
				frequency: "Annual"
			}
		],
		image: photo("studentLibrary"),
		routineKey: "grade-11-12-management"
	}
];
var ProgramDetail = ({ program }) => {
	const level = levels.find((l) => l.id === program.level) ?? levels[0];
	const totalCredits = program.subjects.reduce((sum, s) => sum + s.credit, 0);
	const annual = program.fees.filter((f) => f.frequency === "Annual").reduce((sum, f) => sum + f.amount, 0);
	const monthly = program.fees.filter((f) => f.frequency === "Monthly").reduce((sum, f) => sum + f.amount, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
		defaultValue: "overview",
		className: "w-full",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
				"data-testid": `program-tabs-${program.id}`,
				className: "h-auto flex-wrap justify-start gap-1 rounded-full bg-transparent p-1",
				children: [
					{
						value: "overview",
						label: "Overview"
					},
					{
						value: "subjects",
						label: "Subjects"
					},
					{
						value: "fees",
						label: "Fees"
					},
					{
						value: "pathways",
						label: "Pathways"
					}
				].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
					value: tab.value,
					"data-testid": `program-tab-${program.id}-${tab.value}`,
					className: "!border-none !outline-none !ring-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-fast data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
					children: tab.label
				}, tab.value))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "overview",
				className: "mt-6 focus-visible:outline-none",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-8 lg:grid-cols-[1.15fr_0.85fr]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "t-body max-w-measure text-muted-foreground",
							children: program.description
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2",
							children: [
								{
									label: "Eligibility",
									value: program.eligibility
								},
								{
									label: "Medium",
									value: program.medium
								},
								{
									label: "Duration",
									value: program.duration
								},
								{
									label: "Board",
									value: level.board
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "t-eyebrow",
								children: item.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
								children: item.value
							})] }, item.label))
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0  bg-transparent p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "t-eyebrow",
							children: "What makes it distinctive"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-4 space-y-3",
							children: program.highlights.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Minus, {
									className: "mt-[7px] h-3 w-3 shrink-0 text-accent",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[13px] leading-relaxed text-foreground",
									children: item
								})]
							}, item))
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-8  pt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
						label: "Programme prospectus",
						meta: `PDF · ${program.code} · Session 2083 BS`,
						stamp: "Official",
						size: "sm",
						testId: `program-download-prospectus-${program.id}`,
						onDownload: () => downloadOfficialPdf(programProspectusDoc(program, level))
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
				value: "subjects",
				className: "mt-6 focus-visible:outline-none",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-hidden ",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rail-scroll overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[520px] border-collapse text-left",
							"data-testid": `program-subjects-table-${program.id}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: " bg-transparent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Code"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Subject"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Credit"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Type"
										})
									]
								}) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: program.subjects.map((subject, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: ` ${index % 2 === 1 ? "bg-transparent" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 font-mono text-[11px] tabular-nums text-muted-foreground",
											children: subject.code
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-[13px] text-foreground",
											children: subject.name
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground",
											children: subject.credit
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "inline-flex rounded-full bg-transparent px-2 py-0.5 text-[11px] text-muted-foreground",
												children: subject.kind
											})
										})
									]
								}, subject.code)) }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tfoot", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: " bg-transparent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-4 py-3" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-[12px] uppercase tracking-[0.12em] text-muted-foreground",
											children: "Total credit hours"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground",
											children: totalCredits
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { className: "px-4 py-3" })
									]
								}) })
							]
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "fees",
				className: "mt-6 focus-visible:outline-none",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-hidden ",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "rail-scroll overflow-x-auto",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "w-full min-w-[560px] border-collapse text-left",
								"data-testid": `program-fees-table-${program.id}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: " bg-transparent",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Particular"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Amount"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground",
											children: "Frequency"
										})
									]
								}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: program.fees.map((fee, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: ` ${index % 2 === 1 ? "bg-transparent" : ""}`,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "px-4 py-3 text-[13px] text-foreground",
											children: [fee.label, fee.note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-1 block t-meta",
												children: fee.note
											}) : null]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground",
											children: formatNpr(fee.amount)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-3 text-[12px] text-muted-foreground",
											children: fee.frequency
										})
									]
								}, fee.label)) })]
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-5 flex flex-wrap gap-x-10 gap-y-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: "Annual charges"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-mono text-sm tabular-nums text-foreground",
							children: formatNpr(annual)
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: "Monthly tuition"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1 font-mono text-sm tabular-nums text-foreground",
							children: formatNpr(monthly)
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-meta mt-4 max-w-measure leading-relaxed",
						children: "Figures are indicative for session 2083 BS. Any approved scholarship is applied at the accounts desk before the term invoice is issued."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
				value: "pathways",
				className: "mt-6 focus-visible:outline-none",
				children: [program.careers.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "grid gap-3 sm:grid-cols-2",
					children: program.careers.map((career) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start gap-3  bg-transparent px-4 py-3.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUpRight, {
							className: "mt-0.5 h-4 w-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[13px] leading-relaxed text-foreground",
							children: career
						})]
					}, career))
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "t-body max-w-measure text-muted-foreground",
					children: "This programme feeds directly into the next level within the school rather than into external pathways. Progression is automatic on completion, and no separate application is required."
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8  pt-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-eyebrow",
						children: "Learning outcomes"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-4 space-y-3",
						children: program.outcomes.map((outcome) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent",
								"aria-hidden": "true"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[13px] leading-relaxed text-foreground",
								children: outcome
							})]
						}, outcome))
					})]
				})]
			})
		]
	});
};
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$49.useLoaderData();
	useWebsitePageContent("courses");
	const [levelId, setLevelId] = (0, import_react.useState)("plus2-science");
	const level = (0, import_react.useMemo)(() => levels.find((l) => l.id === levelId) ?? levels[0], [levelId]);
	const levelPrograms = (0, import_react.useMemo)(() => programs.filter((p) => p.level === level.id), [level.id]);
	const spotlight = (0, import_react.useMemo)(() => levelPrograms.find((p) => p.spotlight) ?? levelPrograms[0], [levelPrograms]);
	const routine = routineByKey(spotlight.routineKey);
	const totalSeats = levelPrograms.reduce((sum, p) => sum + p.seats, 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "courses-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			testId: "courses-page-header",
			eyebrow: "Academics",
			title: "Courses & Academic Programmes",
			subtitle: "Subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12.",
			meta: [
				{
					label: "Programmes",
					value: String(programs.length)
				},
				{
					label: "Levels",
					value: "5"
				},
				{
					label: "+2 streams",
					value: "Science, Management"
				},
				{
					label: "Session",
					value: "2083 BS"
				}
			],
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
				label: "Full academic prospectus",
				meta: `PDF · ${programs.length} programmes · ${school.session}`,
				stamp: "Official",
				testId: "courses-download-prospectus-button",
				onDownload: () => downloadOfficialPdf(academicProspectusDoc(levels, programs))
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-16 grid gap-12 lg:grid-cols-[236px_1fr] lg:gap-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: "min-w-0 lg:sticky lg:top-24 lg:self-start",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-eyebrow",
						children: "Choose a level"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						role: "group",
						"aria-label": "Academic level",
						"data-testid": "program-level-switcher",
						className: "no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0",
						children: levels.map((item) => {
							const active = item.id === level.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setLevelId(item.id),
								"aria-pressed": active,
								"data-active": active,
								"data-testid": `program-level-switcher-item-${item.id}`,
								className: [
									"shrink-0 rounded-field border px-3.5 py-2.5 text-left transition-colors duration-fast",
									"focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
									"lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4",
									active ? "border-accent/40 bg-accent/[0.08] lg:border-accent lg:bg-transparent" : "border-border bg-background hover:bg-secondary lg:border-transparent lg:bg-transparent lg:hover:border-border"
								].join(" "),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: ["block whitespace-nowrap text-[13px] lg:whitespace-normal", active ? "font-medium text-foreground" : "text-muted-foreground"].join(" "),
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 hidden font-mono text-[10px] tabular-nums text-muted-foreground lg:block",
									children: item.grades
								})]
							}, item.id);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-7 hidden lg:block" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
						className: "hidden gap-y-5 lg:grid",
						children: [
							{
								label: "Grades",
								value: level.grades
							},
							{
								label: "Board",
								value: level.board
							},
							{
								label: "Programmes",
								value: String(levelPrograms.length)
							},
							{
								label: "Seats this session",
								value: String(totalSeats)
							}
						].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
							className: "t-eyebrow",
							children: item.label
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
							className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
							children: item.value
						})] }, item.label))
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:gap-12",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-eyebrow",
									children: level.grades
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "t-h2 mt-2.5 text-foreground",
									"data-testid": "level-title",
									children: level.label
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 font-display text-lg italic leading-snug text-accent",
									children: level.tagline
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-body mt-5 max-w-measure text-muted-foreground",
									children: level.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "t-meta mt-6 flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, {
										className: "h-3.5 w-3.5",
										"aria-hidden": "true"
									}), level.board]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
							src: level.image,
							alt: `${level.label} at ${school.name}`,
							ratio: "feature",
							caption: `${level.short} · ${school.address}`,
							testId: "level-image"
						})]
					}) }, `intro-${level.id}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
						delay: STAGGER,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
							"data-testid": "featured-block",
							className: "mt-section overflow-hidden  bg-transparent shadow-sm lg:mt-section-lg",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid lg:grid-cols-[1fr_0.8fr]",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "border-y border-transparent p-6 sm:p-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "t-eyebrow",
											children: "Most-chosen programme at this level"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "t-h2 mt-2.5 text-foreground",
											"data-testid": "featured-block-title",
											children: spotlight.title
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "t-meta mt-2.5",
											children: [spotlight.code, spotlight.stream ? ` · ${spotlight.stream}` : ""]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "t-body mt-5 max-w-measure text-muted-foreground",
											children: spotlight.summary
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
											className: "mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3",
											children: [
												{
													label: "Duration",
													value: spotlight.duration
												},
												{
													label: "Seats",
													value: String(spotlight.seats)
												},
												{
													label: "Medium",
													value: spotlight.medium
												}
											].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
												className: "t-eyebrow",
												children: item.label
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
												className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
												children: item.value
											})] }, item.label))
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "mt-8",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
												label: "Prospectus for this programme",
												meta: `PDF · ${spotlight.code} · signed by the Principal`,
												stamp: "Official",
												testId: "featured-block-download-button",
												onDownload: () => downloadOfficialPdf(programProspectusDoc(spotlight, level))
											})
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: " p-6 sm:p-8 lg:border-y lg:border-t-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorialImage, {
										src: spotlight.image,
										alt: spotlight.title,
										ratio: "square",
										testId: "featured-block-image"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-6 space-y-3",
										children: spotlight.highlights.slice(0, 3).map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent",
												"aria-hidden": "true"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[13px] leading-relaxed text-foreground",
												children: item
											})]
										}, item))
									})]
								})]
							})
						})
					}, `spotlight-${spotlight.id}`),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: "Programme index",
						title: `${levelPrograms.length} programmes at ${level.short}`,
						description: "Each row opens into the full subject list, credit hours, fee table and progression routes for that programme.",
						testId: "program-index-title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Accordion, {
						type: "single",
						collapsible: true,
						className: "mt-8 border-y border-border bg-transparent",
						"data-testid": "program-index",
						children: levelPrograms.map((program) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
							value: program.id,
							"data-testid": "program-row",
							className: "border-b border-rule-soft last:border-b-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionTrigger, {
								className: "!border-0 !border-none !outline-none !ring-0 !shadow-none bg-transparent gap-4 py-5 text-left hover:no-underline [&[data-state=open]>svg]:text-accent",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid min-w-0 flex-1 gap-1 text-left sm:grid-cols-[108px_1fr] sm:items-baseline sm:gap-x-5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "t-meta",
										children: program.code
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-display text-[17px] font-semibold leading-snug text-foreground",
											children: program.title
										}), program.stream ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "mt-1 block t-caption",
											children: program.stream
										}) : null]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "hidden shrink-0 items-center gap-7 pr-3 lg:flex",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "t-meta",
										children: program.duration
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "t-meta",
										children: [program.seats, " seats"]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, {
								className: "bg-transparent pb-10 pt-1",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ProgramDetail, { program })
							})]
						}, program.id))
					})] }),
					routine ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: "Timetable",
						title: `Weekly routine · ${routine.label}`,
						description: "The published timetable for this level, as it runs from Sunday to Friday.",
						testId: "routine-section-title"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RoutineTable, { routine })
					})] }) : null
				]
			})]
		})]
	});
}
//#endregion
export { RouteComponent as component };
