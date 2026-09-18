import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { BadgeCheck, CalendarPlus, Circle, CircleCheck, Clock, Users } from "../_libs/lucide-react.mjs";
import { toast } from "../_libs/sonner.mjs";
import { PageFrame, PageHeader, Reveal, Route$42, STAGGER, SectionHeading, school, useScholarships, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { Progress, Separator, Tabs, TabsContent, TabsList, TabsTrigger } from "./kit-Cq_igxhQ.mjs";
import { FilterChips } from "./FilterChips-CvLOSi1H.mjs";
import { DownloadButton, countdownTo, daysUntil, downloadOfficialPdf, formatAd, formatNpr, scholarshipChecklistDoc, scholarshipFormDoc, scholarshipIndexDoc } from "./DownloadButton-BvKdJ2gw.mjs";
import { downloadIcs } from "./calendar-BHpicza7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/scholarship-BcPg0kje.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var scholarships = [
	{
		id: "everest-merit",
		ref: "SCH/2083/MER/01",
		name: "Everest Merit Chhatrabritti",
		nepaliName: "एभरेस्ट प्रतिभा छात्रवृत्ति",
		category: "Merit",
		coverage: 100,
		award: "Full tuition, examination and laboratory fees for two years",
		amountNpr: 172800,
		seats: 12,
		deadlineAd: "2026-10-05",
		deadlineBs: "Ashwin 19, 2083",
		appliesTo: "+2 Science and +2 Management · Grade 11 entry",
		summary: `The school's flagship award for the twelve strongest SEE candidates entering +2, renewable into Grade 12 on performance.`,
		description: `The Merit Chhatrabritti is decided almost entirely on the SEE grade sheet, with a written test and interview used only to separate closely placed candidates. It covers tuition, examination and laboratory fees in full for both years of the +2 programme and carries no bond or service condition. Twelve places are divided as seven Science and five Management.`,
		eligibility: [
			{
				id: "gpa",
				label: "SEE GPA of 3.60 or above",
				detail: "Computed on the full eight-subject grade sheet, not a subject subset."
			},
			{
				id: "core",
				label: "Minimum A grade in Mathematics, Science and English",
				detail: "All three core subjects must independently meet the threshold."
			},
			{
				id: "first-attempt",
				label: "SEE cleared in the first attempt",
				detail: "Candidates who sat a supplementary or re-examination are not eligible for this scheme."
			},
			{
				id: "admission",
				label: "Confirmed admission to Grade 11 at this institution",
				detail: "A provisional admission receipt is acceptable at the point of application."
			},
			{
				id: "no-other",
				label: "Not holding another full-tuition scholarship",
				detail: "This award cannot be combined with the Government Free Studentship quota."
			}
		],
		benefits: [
			"100% tuition waiver for Grade 11 and Grade 12",
			"Full waiver of examination and laboratory fees",
			"Complimentary textbook and lab manual set each year",
			"Priority allocation in the +2 mock examination series",
			"Named mention on the annual academic shield"
		],
		documents: [
			"Completed scholarship application form",
			"Original SEE grade sheet and two attested copies",
			"Character certificate from the previous school",
			"Citizenship certificate or birth registration copy",
			"Four passport-size photographs, white background",
			"Provisional admission receipt for Grade 11"
		],
		process: [
			"Collect or download the application form and complete it in full",
			"Submit the file at the admissions desk and collect a dated receipt",
			"Sit the shortlisting written test if called (Ashwin 24)",
			"Attend the committee interview (Ashwin 26)",
			"Receive the written decision within seven working days"
		],
		renewal: `Continues into Grade 12 provided the holder maintains a Grade 11 GPA of 3.40 or above with no subject below a B grade, and attendance of at least 85 percent.`,
		contact: "Nisha Baral, Admissions Officer · admissions@everestbutwal.edu.np · Ext. 110",
		spotlight: true
	},
	{
		id: "see-distinction",
		ref: "SCH/2083/MER/02",
		name: "SEE Distinction Scholarship",
		nepaliName: "एस.ई.ई. विशिष्ट श्रेणी छात्रवृत्ति",
		category: "Merit",
		coverage: 75,
		award: "75% tuition waiver for the first year, renewable",
		amountNpr: 64800,
		seats: 20,
		deadlineAd: "2026-09-28",
		deadlineBs: "Ashwin 12, 2083",
		appliesTo: "+2 Science and +2 Management · Grade 11 entry",
		summary: `A broader merit award for strong SEE candidates who fall just below the Merit Chhatrabritti threshold.`,
		description: `The Distinction Scholarship exists so that the merit cliff is not so steep. It covers three quarters of tuition for Grade 11 and is renewed into Grade 12 on the same performance condition. Twenty places are available and allocation is strictly in descending order of SEE grade point average.`,
		eligibility: [
			{
				id: "gpa",
				label: "SEE GPA between 3.20 and 3.59",
				detail: "Candidates at 3.60 and above should apply to the Merit Chhatrabritti instead."
			},
			{
				id: "core",
				label: "Minimum B+ grade in Mathematics and Science",
				detail: "English must be at least a B grade."
			},
			{
				id: "first-attempt",
				label: "SEE cleared in the first attempt",
				detail: "Supplementary candidates are not eligible."
			},
			{
				id: "admission",
				label: "Confirmed or provisional Grade 11 admission",
				detail: "Applies to both the Science and Management streams."
			}
		],
		benefits: [
			"75% tuition waiver for Grade 11",
			"Renewable at the same rate for Grade 12 on performance",
			"Complimentary lab manual set for Science candidates",
			"Free access to the +2 mock examination series"
		],
		documents: [
			"Completed scholarship application form",
			"SEE grade sheet with two attested copies",
			"Character certificate",
			"Citizenship certificate or birth registration copy",
			"Three passport-size photographs"
		],
		process: [
			"Submit the completed form at the admissions desk",
			"Collect the dated acknowledgement receipt",
			"Await the merit list publication on Ashwin 18",
			"Confirm acceptance in writing within five working days"
		],
		renewal: `Renewed for Grade 12 if the holder maintains a Grade 11 GPA of 3.00 or above and attendance of at least 80 percent.`,
		contact: "Nisha Baral, Admissions Officer · admissions@everestbutwal.edu.np · Ext. 110"
	},
	{
		id: "government-quota",
		ref: "SCH/2083/GOV/03",
		name: "Government Free Studentship Quota",
		nepaliName: "सरकारी नि:शुल्क छात्रवृत्ति कोटा",
		category: "Government",
		coverage: 100,
		award: "Full waiver of tuition and examination fees",
		amountNpr: 148e3,
		seats: 33,
		deadlineAd: "2026-11-10",
		deadlineBs: "Kartik 24, 2083",
		appliesTo: "All levels · Grade 1 to Grade 12",
		summary: `The statutory free studentship quota allocated under Ministry of Education directives, published openly each session.`,
		description: `Every institution of this category is required to reserve free studentship places, and this school allocates thirty-three across all levels. Allocation follows the categories set out in the Ministry directive and the full list — names and categories — is published on the notice board and filed with the District Education Coordination Unit. Every declaration is verified, and the committee may conduct a home visit.`,
		eligibility: [
			{
				id: "category",
				label: "Falls within a prescribed directive category",
				detail: "Dalit or marginalised community, student with disability, child of a martyr or conflict victim, or family below the recognised income threshold."
			},
			{
				id: "attestation",
				label: "Ward-office attested category and income declaration",
				detail: "Self-declarations without ward attestation cannot be processed."
			},
			{
				id: "residency",
				label: "Resident within Rupandehi district",
				detail: "Verified against the ward recommendation letter."
			},
			{
				id: "single-claim",
				label: "No other institutional scholarship held",
				detail: "This quota cannot be combined with the Merit or Distinction awards."
			},
			{
				id: "attendance",
				label: "Attendance of 75 percent to retain the place",
				detail: "Reviewed at the end of each term."
			}
		],
		benefits: [
			"100% tuition fee waiver",
			"Full examination and board fee waiver",
			"Free textbook set from the school library stock",
			"Uniform grant of Rs 6,000 in the first year",
			"Free access to all support and clinic sessions"
		],
		documents: [
			"Prescribed free studentship application form",
			"Ward-office recommendation and income declaration",
			"Category certificate as applicable",
			"Previous academic transcript or transfer certificate",
			"Citizenship or birth registration copy of student and guardian",
			"Two passport-size photographs"
		],
		process: [
			"Obtain the ward-office recommendation and income declaration first",
			"Submit the completed prescribed form with all attachments",
			"Cooperate with committee verification, including a possible home visit",
			"Check the publicly posted allocation list on Mangsir 10",
			"File any written complaint within fifteen days of publication"
		],
		renewal: `Continues year to year as long as the category conditions still apply and attendance remains at or above 75 percent. Re-declaration is required each session.`,
		contact: "Dinesh Gharti, Accounts & Services Officer · accounts@everestbutwal.edu.np · Ext. 111",
		spotlight: true
	},
	{
		id: "girls-education",
		ref: "SCH/2083/NED/04",
		name: "Lumbini Girls' Education Grant",
		nepaliName: "लुम्बिनी छात्रा शिक्षा अनुदान",
		category: "Need-based",
		coverage: 60,
		award: "60% tuition waiver plus an annual materials grant",
		amountNpr: 58400,
		seats: 15,
		deadlineAd: "2026-10-20",
		deadlineBs: "Kartik 3, 2083",
		appliesTo: "Grade 9 to Grade 12 · female students",
		summary: `Support for girls from low-income households in Rupandehi and neighbouring districts to complete secondary and +2 education.`,
		description: `This grant exists because the drop-off in female enrolment between Grade 8 and Grade 11 is the sharpest transition in the district's figures. It combines a sixty percent tuition waiver with an annual materials grant covering books, stationery and uniform, and holders are paired with a female faculty mentor for the duration of the award.`,
		eligibility: [
			{
				id: "gender",
				label: "Female student entering or continuing Grade 9 to 12",
				detail: "Open to both new applicants and continuing students."
			},
			{
				id: "income",
				label: "Annual household income below Rs 400,000",
				detail: "Supported by a ward-office income declaration."
			},
			{
				id: "academic",
				label: "Minimum GPA 2.40 in the last completed year",
				detail: "A lower GPA may be considered where the committee sees clear circumstance."
			},
			{
				id: "district",
				label: "Resident of Rupandehi, Nawalparasi, Kapilvastu or Palpa",
				detail: "Hostel residents from these districts are eligible."
			}
		],
		benefits: [
			"60% tuition waiver, renewable annually",
			"Annual materials grant of Rs 12,000 for books, stationery and uniform",
			"Paired female faculty mentor for the award period",
			"Priority hostel allocation for out-of-city holders",
			"Free enrolment in all support and clinic sessions"
		],
		documents: [
			"Completed application form",
			"Ward-office income declaration",
			"Last completed academic transcript",
			"Guardian's citizenship copy and student's birth registration",
			"Two passport-size photographs"
		],
		process: [
			"Submit the application with the income declaration attached",
			"Attend a short interview with the committee's female members",
			"Await the written decision by Kartik 18",
			"Meet your assigned mentor in the first week of the award"
		],
		renewal: `Renewed annually on continued income eligibility, a GPA of 2.20 or above, and attendance of at least 80 percent.`,
		contact: "Sarita Gurung, Vice Principal (Academics) · vp.academics@everestbutwal.edu.np · Ext. 102"
	},
	{
		id: "community-support",
		ref: "SCH/2083/COM/05",
		name: "Dalit and Marginalised Community Support",
		nepaliName: "दलित तथा सीमान्तकृत समुदाय सहयोग छात्रवृत्ति",
		category: "Community",
		coverage: 100,
		award: "Full tuition waiver with a monthly transport and meal stipend",
		amountNpr: 164e3,
		seats: 10,
		deadlineAd: "2026-11-25",
		deadlineBs: "Mangsir 9, 2083",
		appliesTo: "Grade 6 to Grade 12",
		summary: `An institutional award over and above the government quota, adding a stipend because tuition alone is rarely the whole barrier.`,
		description: `The committee found that students admitted on a full tuition waiver were still dropping out over transport and meal costs. This award therefore pairs a hundred percent tuition waiver with a monthly stipend of Rs 3,000 towards bus fare and the dining hall lunch service. Ten places are available across Grades 6 to 12.`,
		eligibility: [
			{
				id: "community",
				label: "Belongs to a Dalit or officially marginalised community",
				detail: "Evidenced by the ward-office community certificate."
			},
			{
				id: "income",
				label: "Annual household income below Rs 350,000",
				detail: "Ward-office attested declaration required."
			},
			{
				id: "academic",
				label: "Passed the previous grade",
				detail: "No minimum GPA is applied to this scheme by design."
			},
			{
				id: "not-gov",
				label: "Not already holding a government quota place",
				detail: "Applicants not selected in the quota are automatically considered here."
			}
		],
		benefits: [
			"100% tuition fee waiver",
			"Monthly stipend of Rs 3,000 for transport and lunch",
			"Free textbook, stationery and uniform set",
			"Examination and board fee waiver",
			"Assigned faculty mentor and termly review conversation"
		],
		documents: [
			"Completed application form",
			"Ward-office community certificate",
			"Ward-office income declaration",
			"Previous grade transcript or transfer certificate",
			"Guardian's citizenship copy",
			"Two passport-size photographs"
		],
		process: [
			"Submit the form with community and income certificates",
			"Committee verification, which may include a home visit",
			"Written decision issued by Mangsir 22",
			"Stipend disbursement begins from the following month at the accounts desk"
		],
		renewal: `Continues year to year on passing the grade and maintaining 75 percent attendance. Re-declaration of income is required each session.`,
		contact: "Dr. Bishnu Prasad Sharma, Principal · principal@everestbutwal.edu.np · Ext. 101"
	},
	{
		id: "sports-excellence",
		ref: "SCH/2083/SPT/06",
		name: "Everest Sports Excellence Award",
		nepaliName: "एभरेस्ट खेलकुद उत्कृष्टता छात्रवृत्ति",
		category: "Sports",
		coverage: 50,
		award: "50% tuition waiver plus kit and travel support",
		amountNpr: 48600,
		seats: 8,
		deadlineAd: "2026-12-05",
		deadlineBs: "Mangsir 19, 2083",
		appliesTo: "Grade 9 to Grade 12",
		summary: `For students competing at district level or above, with a timetable adjustment built into the award rather than negotiated later.`,
		description: `Athletes who train seriously lose class time, and pretending otherwise is how sports scholarships fail. This award carries a formal timetable accommodation: holders get a documented catch-up arrangement with each subject teacher, plus kit and travel support for representative fixtures. Selection is by trial with the Head of Physical Education and a district association representative.`,
		eligibility: [
			{
				id: "level",
				label: "Represented at district level or above in a recognised sport",
				detail: "Certificate from the district or provincial sports association required."
			},
			{
				id: "trial",
				label: "Cleared the school selection trial",
				detail: "Held on Mangsir 14 on the south ground."
			},
			{
				id: "academic",
				label: "Passed the previous grade with no failed subject",
				detail: "Academic progress is monitored termly rather than at entry only."
			},
			{
				id: "commitment",
				label: "Commits to school squad representation",
				detail: "Holders represent the school at inter-school and district fixtures."
			}
		],
		benefits: [
			"50% tuition waiver, renewable annually",
			"Full sports kit and footwear each session",
			"Travel and accommodation support for representative fixtures",
			"Documented catch-up arrangement with every subject teacher",
			"Priority access to the covered court and ground outside class hours"
		],
		documents: [
			"Completed application form",
			"District or provincial association participation certificate",
			"Previous grade transcript",
			"Medical fitness note from a registered practitioner",
			"Two passport-size photographs in sports attire"
		],
		process: [
			"Submit the form with the association certificate",
			"Attend the selection trial on Mangsir 14",
			"Panel assessment with the district association representative",
			"Written decision and catch-up plan issued together by Mangsir 25"
		],
		renewal: `Renewed annually on continued representation, passing all subjects, and attendance of at least 70 percent counting authorised fixture absence as present.`,
		contact: "Tek Bahadur Rai, Head of Physical Education · t.rai@everestbutwal.edu.np · Ext. 270"
	},
	{
		id: "arts-grant",
		ref: "SCH/2083/ART/07",
		name: "Performing and Visual Arts Grant",
		nepaliName: "प्रदर्शन तथा दृश्य कला अनुदान",
		category: "Arts",
		coverage: 40,
		award: "40% tuition waiver with studio access and materials",
		amountNpr: 38900,
		seats: 6,
		deadlineAd: "2026-12-20",
		deadlineBs: "Poush 5, 2083",
		appliesTo: "Grade 9 to Grade 12",
		summary: `A portfolio- or audition-based award for students working seriously in music, dramatics, or visual art.`,
		description: `Selection is on the strength of a submitted portfolio or a live audition — not on academic ranking. Holders receive booked studio time in their own name, a materials allowance, and a commitment to lead at least one public performance or exhibition each session. Six places are shared between performing and visual arts.`,
		eligibility: [
			{
				id: "portfolio",
				label: "Portfolio of ten works or a live audition",
				detail: "Visual art: ten pieces. Music and dramatics: a ten-minute live audition."
			},
			{
				id: "academic",
				label: "Passed the previous grade",
				detail: "No minimum GPA is applied to this scheme by design."
			},
			{
				id: "contribution",
				label: "Commits to one public performance or exhibition per session",
				detail: "Counted as part of the award, not as an extra obligation."
			}
		],
		benefits: [
			"40% tuition waiver, renewable annually",
			"Materials allowance of Rs 9,000 per session",
			"Bookable studio time in the holder's own name",
			"Mentoring from the Arts and Culture Committee",
			"Guaranteed slot in the annual programme and gallery rotation"
		],
		documents: [
			"Completed application form",
			"Portfolio of ten works, or an audition booking slip",
			"Previous grade transcript",
			"A one-page statement of intent written by the student",
			"Two passport-size photographs"
		],
		process: [
			"Submit the form with the portfolio or book an audition slot",
			"Portfolio review or live audition in the week of Poush 8",
			"Short conversation with the Arts and Culture Committee",
			"Written decision issued by Poush 18"
		],
		renewal: `Renewed annually on completing the public performance or exhibition commitment and passing all subjects.`,
		contact: "Rekha Subedi, Head of English & Arts Committee · r.subedi@everestbutwal.edu.np · Ext. 230"
	},
	{
		id: "single-parent-support",
		ref: "SCH/2083/NED/08",
		name: "Single-Parent and Martyr Family Support",
		nepaliName: "एकल अभिभावक तथा शहीद परिवार सहयोग",
		category: "Need-based",
		coverage: 85,
		award: "85% tuition waiver with examination fee cover",
		amountNpr: 122400,
		seats: 9,
		deadlineAd: "2027-01-10",
		deadlineBs: "Poush 26, 2083",
		appliesTo: "All levels · Grade 1 to Grade 12",
		summary: `For students being raised by a single parent or guardian, and for children of martyrs and conflict victims.`,
		description: `This scheme is intentionally documentation-light: a death or divorce certificate, or a martyr family certificate, plus an income declaration. There is no academic threshold and no interview for the student — the conversation is with the guardian only, and it is short. Nine places are available across all levels.`,
		eligibility: [
			{
				id: "status",
				label: "Raised by a single parent or guardian, or child of a martyr or conflict victim",
				detail: "Evidenced by a death certificate, divorce decree, or martyr family certificate."
			},
			{
				id: "income",
				label: "Annual household income below Rs 500,000",
				detail: "Ward-office attested declaration required."
			},
			{
				id: "passed",
				label: "Passed the previous grade",
				detail: "No minimum GPA is applied to this scheme."
			}
		],
		benefits: [
			"85% tuition waiver, renewable annually",
			"Full examination and board fee cover",
			"Free textbook set from library stock",
			"Counselling centre priority appointments",
			"Flexible fee scheduling through the accounts desk"
		],
		documents: [
			"Completed application form",
			"Death certificate, divorce decree, or martyr family certificate",
			"Ward-office income declaration",
			"Previous grade transcript or transfer certificate",
			"Guardian's citizenship copy",
			"Two passport-size photographs"
		],
		process: [
			"Submit the form with the status and income documents",
			"Short conversation with the guardian only — no student interview",
			"Written decision issued by Magh 8",
			"Fee schedule agreed at the accounts desk before the next invoice"
		],
		renewal: `Renewed annually on continued status and income eligibility and on passing the grade. No re-interview is required.`,
		contact: "Nisha Baral, Admissions Officer · admissions@everestbutwal.edu.np · Ext. 110"
	},
	{
		id: "municipality-talent",
		ref: "SCH/2083/COM/09",
		name: "Butwal Municipality Local Talent Scholarship",
		nepaliName: "बुटवल उपमहानगरपालिका स्थानीय प्रतिभा छात्रवृत्ति",
		category: "Community",
		coverage: 45,
		award: "45% tuition waiver, part-funded by the municipality",
		amountNpr: 43700,
		seats: 14,
		deadlineAd: "2026-10-30",
		deadlineBs: "Kartik 13, 2083",
		appliesTo: "Grade 6 to Grade 12 · Butwal Sub-Metropolitan residents",
		summary: `A jointly funded award for students resident in Butwal Sub-Metropolitan City, with a light local-contribution expectation.`,
		description: `Half of this award is funded by Butwal Sub-Metropolitan City and half by the school. It is open to residents of any ward within the sub-metropolitan area and carries a modest expectation of local contribution — twenty hours a session with the Eco Club, the community reading programme, or a municipal campaign. Fourteen places are available.`,
		eligibility: [
			{
				id: "residency",
				label: "Resident of any ward in Butwal Sub-Metropolitan City",
				detail: "Ward recommendation letter required as proof of residence."
			},
			{
				id: "academic",
				label: "Minimum GPA 2.80 in the last completed year",
				detail: "Or a demonstrated strength in a co-curricular field."
			},
			{
				id: "income",
				label: "Annual household income below Rs 700,000",
				detail: "Ward-office attested declaration required."
			},
			{
				id: "service",
				label: "Twenty hours of local contribution per session",
				detail: "Eco Club, community reading programme, or a municipal campaign. Logged by the faculty advisor."
			}
		],
		benefits: [
			"45% tuition waiver, renewable annually",
			"Municipal certificate of recognition each session",
			"Free library membership and priority carrel access",
			"Community leadership record on the school transcript"
		],
		documents: [
			"Completed application form",
			"Ward recommendation letter confirming residence",
			"Ward-office income declaration",
			"Last completed academic transcript",
			"Two passport-size photographs"
		],
		process: [
			"Obtain the ward recommendation letter",
			"Submit the form at the admissions desk before the deadline",
			"Joint review by the school committee and a municipal representative",
			"Written decision issued by Mangsir 2",
			"Register your contribution activity with the faculty advisor"
		],
		renewal: `Renewed annually on completing the twenty logged contribution hours, maintaining GPA 2.60, and continued residence in the sub-metropolitan area.`,
		contact: "Kabita Shrestha, Coordinator (Secondary Level) · coord.secondary@everestbutwal.edu.np · Ext. 120"
	}
];
Array.from(new Set(scholarships.map((s) => s.category))).sort();
scholarships.reduce((sum, s) => sum + s.seats, 0);
var Countdown = ({ deadline }) => {
	const [state, setState] = (0, import_react.useState)(() => countdownTo(deadline));
	(0, import_react.useEffect)(() => {
		setState(countdownTo(deadline));
		const id = window.setInterval(() => setState(countdownTo(deadline)), 1e3);
		return () => window.clearInterval(id);
	}, [deadline]);
	if (state.closed) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "scholarship-countdown",
		className: "rounded-card border border-border bg-secondary/60 px-5 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "t-eyebrow",
			children: "Applications closed"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-[13px] text-muted-foreground",
			children: "This window has passed for the current session. The scheme reopens with the next academic session."
		})]
	});
	const units = [
		{
			label: "Days",
			value: state.days
		},
		{
			label: "Hours",
			value: state.hours
		},
		{
			label: "Minutes",
			value: state.minutes
		},
		{
			label: "Seconds",
			value: state.seconds
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "scholarship-countdown",
		className: "rounded-card border border-accent/35 bg-accent/[0.07] px-5 py-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
			className: "t-eyebrow flex items-center gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, {
				className: "h-3.5 w-3.5",
				"aria-hidden": "true"
			}), "Time remaining to apply"]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
			className: "mt-3 flex flex-wrap gap-x-8 gap-y-3",
			children: units.map((unit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
				className: "font-mono text-2xl font-semibold tabular-nums leading-none text-foreground",
				children: String(unit.value).padStart(2, "0")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
				className: "t-eyebrow mt-1.5",
				children: unit.label
			})] }, unit.label))
		})]
	});
};
var EligibilitySelfCheck = ({ item }) => {
	const [checked, setChecked] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setChecked({});
	}, [item.id]);
	const met = item.eligibility.filter((c) => checked[c.id]).length;
	const total = item.eligibility.length;
	const complete = met === total;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "scholarship-eligibility-check",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-eyebrow",
						children: "Check yourself against the criteria"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-caption mt-1.5 max-w-measure",
						children: "Tick each condition you meet. Nothing is submitted or stored — this is here so you know before you queue at the admissions desk."
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "t-meta shrink-0",
					"data-testid": "scholarship-eligibility-progress",
					children: [
						met,
						" of ",
						total,
						" confirmed"
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
				value: total === 0 ? 0 : met / total * 100,
				className: "mt-4 h-1.5 bg-secondary [&>div]:bg-accent"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-6 divide-y divide-rule-soft",
				children: item.eligibility.map((criterion) => {
					const isChecked = Boolean(checked[criterion.id]);
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setChecked((prev) => ({
							...prev,
							[criterion.id]: !prev[criterion.id]
						})),
						"aria-pressed": isChecked,
						"data-testid": "scholarship-eligibility-item",
						className: "flex w-full items-start gap-3.5 py-4 text-left transition-colors duration-fast !border-0 !bg-transparent hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-0",
						children: [isChecked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, {
							className: "mt-0.5 h-4 w-4 shrink-0 text-accent",
							"aria-hidden": "true"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Circle, {
							className: "mt-0.5 h-4 w-4 shrink-0 text-muted-foreground",
							"aria-hidden": "true"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: ["block text-[13.5px] leading-snug", isChecked ? "font-medium text-foreground" : "text-foreground"].join(" "),
								children: criterion.label
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "t-caption mt-1.5 block leading-relaxed",
								children: criterion.detail
							})]
						})]
					}) }, criterion.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				"data-testid": "scholarship-eligibility-verdict",
				className: ["mt-6 flex items-start gap-3 rounded-card border px-5 py-4", complete ? "border-accent/40 bg-accent/[0.08]" : "border-border bg-secondary/50"].join(" "),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
					className: ["mt-0.5 h-4 w-4 shrink-0", complete ? "text-accent" : "text-muted-foreground"].join(" "),
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[13px] leading-relaxed text-foreground",
					children: complete ? "On these criteria you appear eligible. Download the checklist below, gather the documents, and submit before the deadline — the committee verifies every declaration." : `${total - met} condition${total - met === 1 ? "" : "s"} still to confirm. A condition you cannot meet does not always end the application — speak to the contact listed below before assuming.`
				})]
			})
		]
	});
};
var ScholarshipDetail = ({ item }) => {
	const handleCalendar = () => {
		const name = downloadIcs({
			uid: `scholarship-${item.id}`,
			title: `Deadline: ${item.name}`,
			description: `${item.summary}\n\nRef: ${item.ref}\nCoverage: ${item.coverage}%\nContact: ${item.contact}`,
			date: item.deadlineAd,
			remindDaysBefore: 7
		}, `Everest-Scholarship-${item.id}`);
		toast.success("Deadline saved to calendar file", { description: name });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-w-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-l-2 border-accent/35 pl-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "t-eyebrow",
						children: [
							item.category,
							" · ",
							item.ref
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "t-h2 mt-2.5 text-foreground",
						"data-testid": "scholarship-detail-title",
						children: item.name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2.5 font-display text-lg leading-snug text-muted-foreground",
						children: item.nepaliName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-body mt-5 max-w-measure text-muted-foreground",
						children: item.description
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
				className: "mt-9 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-4",
				children: [
					{
						label: "Tuition covered",
						value: `${item.coverage}%`
					},
					{
						label: "Indicative value",
						value: formatNpr(item.amountNpr)
					},
					{
						label: "Places",
						value: String(item.seats)
					},
					{
						label: "Closes",
						value: item.deadlineBs
					}
				].map((stat) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
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
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: item.coverage,
					className: "h-1.5 bg-secondary [&>div]:bg-accent",
					"aria-label": `Tuition coverage ${item.coverage} percent`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "t-meta mt-2.5",
					children: [
						item.award,
						" · Applies to ",
						item.appliesTo
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-9 grid gap-5 sm:grid-cols-[1fr_auto] sm:items-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-eyebrow",
						children: "Deadline"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 font-mono text-sm tabular-nums text-foreground",
						"data-testid": "scholarship-deadline",
						children: [
							item.deadlineBs,
							" BS · ",
							formatAd(item.deadlineAd)
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: handleCalendar,
					"data-testid": "scholarship-add-calendar-button",
					className: "inline-flex h-11 items-center justify-center gap-2 rounded-field border border-border bg-background px-4 text-sm text-foreground transition-colors duration-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, {
						className: "h-4 w-4 text-muted-foreground",
						"aria-hidden": "true"
					}), "Add deadline to calendar"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Countdown, { deadline: item.deadlineAd })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-11",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "eligibility",
					className: "w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
							"data-testid": "scholarship-tabs",
							className: "h-auto flex-wrap justify-start gap-1 rounded-full bg-secondary p-1",
							children: [
								{
									value: "eligibility",
									label: "Eligibility"
								},
								{
									value: "benefits",
									label: "Benefits"
								},
								{
									value: "documents",
									label: "Documents"
								},
								{
									value: "process",
									label: "How to apply"
								}
							].map((tab) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: tab.value,
								"data-testid": `scholarship-tab-${tab.value}`,
								className: "rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-fast data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs",
								children: tab.label
							}, tab.value))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "eligibility",
							className: "mt-7 focus-visible:outline-none",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EligibilitySelfCheck, { item })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "benefits",
							className: "mt-7 focus-visible:outline-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "divide-y divide-rule-soft border-y border-border",
								children: item.benefits.map((benefit) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-3.5 py-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BadgeCheck, {
										className: "mt-0.5 h-4 w-4 shrink-0 text-accent",
										"aria-hidden": "true"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13.5px] leading-relaxed text-foreground",
										children: benefit
									})]
								}, benefit))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-7",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-eyebrow",
									children: "Renewal"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-body mt-2.5 max-w-measure text-muted-foreground",
									children: item.renewal
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "documents",
							className: "mt-7 focus-visible:outline-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "divide-y divide-rule-soft border-y border-border",
								"data-testid": "scholarship-documents-list",
								children: item.documents.map((doc, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-4 py-3.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "t-meta mt-0.5 w-5 shrink-0 text-right",
										children: index + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13.5px] leading-relaxed text-foreground",
										children: doc
									})]
								}, doc))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-7",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
									label: "Printable document checklist",
									meta: `PDF · ${item.documents.length} documents · tick as you gather them`,
									stamp: "Checklist",
									size: "sm",
									testId: "scholarship-download-checklist-button",
									onDownload: () => downloadOfficialPdf(scholarshipChecklistDoc(item))
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "process",
							className: "mt-7 focus-visible:outline-none",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
								className: "space-y-5",
								children: item.process.map((step, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-secondary font-mono text-[11px] tabular-nums text-foreground",
										children: index + 1
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[13.5px] leading-relaxed text-foreground",
										children: step
									})]
								}, step))
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-8",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-eyebrow",
									children: "Who to ask"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-body mt-2.5 max-w-measure text-muted-foreground",
									children: item.contact
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-11 rounded-card border border-border bg-card p-6 shadow-sm sm:p-7",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-eyebrow",
						children: "Apply"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "t-h3 mt-2 text-foreground",
						children: "Download the form, fill it by hand, submit it at the desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "t-body mt-3 max-w-measure text-muted-foreground",
						children: "The form below is generated with the school masthead, this scheme's reference number and its full document checklist. Bring it to the admissions desk with the enclosures and collect a dated receipt."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7 flex flex-wrap gap-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
							label: "Application form",
							meta: `PDF · ${item.ref} · four sections and a declaration`,
							stamp: "Application form",
							variant: "default",
							testId: "scholarship-download-form-button",
							onDownload: () => downloadOfficialPdf(scholarshipFormDoc(item))
						})
					})
				]
			})
		]
	});
};
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$42.useLoaderData();
	useWebsitePageContent("scholarship");
	const dbScholarships = useScholarships();
	const scholarships$1 = dbScholarships && dbScholarships.length > 0 ? dbScholarships : scholarships;
	const scholarshipCategories = Array.from(new Set(scholarships$1.map((s) => s.category))).sort();
	const totalScholarshipSeats = scholarships$1.reduce((sum, s) => sum + s.seats, 0);
	const [category, setCategory] = (0, import_react.useState)("all");
	const [activeId, setActiveId] = (0, import_react.useState)(scholarships$1[0].id);
	const filtered = (0, import_react.useMemo)(() => {
		if (category === "all") return scholarships$1;
		return scholarships$1.filter((s) => s.category === category);
	}, [category, scholarships$1]);
	const active = (0, import_react.useMemo)(() => filtered.find((s) => s.id === activeId) ?? filtered[0], [filtered, activeId]);
	const chipOptions = (0, import_react.useMemo)(() => [{
		value: "all",
		label: "All schemes",
		count: scholarships$1.length
	}, ...scholarshipCategories.map((c) => ({
		value: c,
		label: c,
		count: scholarships$1.filter((s) => s.category === c).length
	}))], [scholarships$1, scholarshipCategories]);
	const nextDeadline = (0, import_react.useMemo)(() => {
		return [...scholarships$1].filter((s) => daysUntil(s.deadlineAd) >= 0).sort((a, b) => daysUntil(a.deadlineAd) - daysUntil(b.deadlineAd))[0];
	}, [scholarships$1]);
	const handleCategory = (next) => {
		setCategory(next);
		const first = next === "all" ? scholarships$1[0] : scholarships$1.find((s) => s.category === next);
		if (first) setActiveId(first.id);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "scholarships-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				testId: "scholarships-page-header",
				eyebrow: "Scholarships",
				title: "Chhatrabritti & Free Studentship",
				subtitle: "Every criterion, document and deadline published in full. Check yourself against a scheme, then download the form the desk asks for.",
				meta: [
					{
						label: "Schemes",
						value: String(scholarships$1.length)
					},
					{
						label: "Places",
						value: String(totalScholarshipSeats)
					},
					{
						label: "Max relief",
						value: "100%"
					},
					{
						label: "Next close",
						value: nextDeadline ? `${formatAd(nextDeadline.deadlineAd)} · ${daysUntil(nextDeadline.deadlineAd)}d` : "Closed"
					}
				],
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
					label: "All schemes and deadlines",
					meta: `PDF · ${scholarships$1.length} schemes · ${school.session}`,
					stamp: "Official",
					testId: "scholarships-download-index-button",
					onDownload: () => downloadOfficialPdf(scholarshipIndexDoc(scholarships$1))
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChips, {
					label: "Scholarship category",
					testId: "scholarship-category-filter",
					options: chipOptions,
					value: category,
					onChange: handleCategory
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-12 grid gap-12 lg:grid-cols-[0.78fr_1.45fr] lg:gap-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "lg:sticky lg:top-24",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
								eyebrow: "Schemes",
								title: "Open this session",
								testId: "scholarship-list-title",
								aside: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "t-meta",
									"data-testid": "scholarship-result-count",
									children: filtered.length
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								"data-testid": "scholarship-list",
								className: "rail-scroll mt-6 divide-y divide-rule-soft lg:max-h-[70vh] lg:overflow-y-auto",
								children: filtered.map((item, index) => {
									const isActive = active && item.id === active.id;
									const days = daysUntil(item.deadlineAd);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
										delay: Math.min(index, 8) * STAGGER,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											onClick: () => setActiveId(item.id),
											"aria-current": isActive ? "true" : void 0,
											"data-active": isActive,
											"data-testid": "scholarship-row",
											className: [
												"flex w-full items-start gap-4 py-4 pl-3 pr-2 text-left transition-colors duration-fast !border-0 !bg-transparent border-l-2",
												"focus-visible:outline-none focus-visible:ring-0",
												isActive ? "bg-accent/[0.08] border-accent/70" : "border-transparent hover:bg-secondary/60 hover:border-border"
											].join(" "),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "w-11 shrink-0 text-right",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block font-mono text-base font-semibold tabular-nums leading-none text-foreground",
													children: item.coverage
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "mt-1 block font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground",
													children: "percent"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: ["block text-[13.5px] leading-snug", isActive ? "font-semibold text-foreground" : "font-medium text-foreground"].join(" "),
														children: item.name
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
														className: "mt-1.5 flex flex-wrap items-center gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "rounded-full border border-border bg-background px-2 py-0.5 text-[10.5px] text-muted-foreground",
															children: item.category
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "t-meta inline-flex items-center gap-1",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, {
																className: "h-3 w-3",
																"aria-hidden": "true"
															}), item.seats]
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: ["mt-2 block font-mono text-[10.5px] tabular-nums", days < 0 ? "text-muted-foreground" : days <= 21 ? "text-accent" : "text-muted-foreground"].join(" "),
														children: days < 0 ? "Closed for this session" : `${days} days left · ${item.deadlineBs} BS`
													})
												]
											})]
										})
									}) }, item.id);
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "t-meta mt-5 leading-relaxed",
								children: "Selection is made by the committee chaired by the Principal and is final. Results are posted on the notice board and sent in writing."
							})
						]
					})
				}), active ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
					className: "min-w-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScholarshipDetail, { item: active })
				}, active.id) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "mt-section lg:mt-section-lg" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "t-meta mt-6 max-w-measure leading-relaxed",
				children: [
					school.name,
					", ",
					school.fullAddress,
					". ",
					school.affiliation,
					". Registration number ",
					school.regNo,
					"."
				]
			})
		]
	});
}
//#endregion
export { RouteComponent as component };
