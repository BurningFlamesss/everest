import type { BlockType } from "@/types";

// ---------------------------------------------------------------------------
// Field schema per content block.
//
// The inspector renders itself from this schema, which keeps the CMS generic:
// adding a new block type only requires a library entry (services/website.ts)
// plus a field list here.
// ---------------------------------------------------------------------------

export type FieldKind =
	| "text"
	| "textarea"
	| "richtext"
	| "image"
	| "number"
	| "date"
	| "url";

export interface ItemFieldDef {
	key: string;
	label: string;
	kind: "text" | "textarea" | "image" | "tags" | "boolean" | "list";
	placeholder?: string;
	help?: string;
	/** list-only */
	addLabel?: string;
	itemLabel?: string;
	itemFields?: ItemFieldDef[];
	collapsible?: boolean;
}

export type FieldDef =
	| {
			key: string;
			label: string;
			kind: FieldKind;
			placeholder?: string;
			help?: string;
	  }
	| {
			key: string;
			label: string;
			kind: "tags";
			placeholder?: string;
			help?: string;
	  }
	| {
			key: string;
			label: string;
			kind: "list";
			addLabel: string;
			itemLabel: string;
			itemFields: ItemFieldDef[];
			help?: string;
			collapsible?: boolean;
	  };

export const BLOCK_FIELDS: Record<BlockType, FieldDef[]> = {
	hero: [
		{
			key: "eyebrow",
			label: "Eyebrow",
			kind: "text",
			placeholder: "Admissions open",
		},
		{ key: "headline", label: "Headline", kind: "text" },
		{ key: "subheadline", label: "Supporting text", kind: "textarea" },
		{
			key: "image",
			label: "Closing hero image",
			kind: "image",
		},
		{ key: "primaryCtaLabel", label: "Primary button label", kind: "text" },
		{
			key: "primaryCtaHref",
			label: "Primary button link",
			kind: "url",
			placeholder: "/admissions",
		},
		{ key: "secondaryCtaLabel", label: "Secondary button label", kind: "text" },
		{
			key: "secondaryCtaHref",
			label: "Secondary button link",
			kind: "url",
			placeholder: "/contact",
		},
	],
	headline: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
	],
	intro: [
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
		{ key: "image", label: "Image", kind: "image" },
	],
	stats: [
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
	],
	cta: [
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
		{ key: "buttonLabel", label: "Button label", kind: "text" },
		{ key: "buttonHref", label: "Button link", kind: "url" },
	],
	featured_events: [
		{ key: "title", label: "Section title", kind: "text" },
		{
			key: "count",
			label: "How many to show",
			kind: "number",
			help: "Pulled live from the events calendar",
		},
	],
	featured_notices: [
		{ key: "title", label: "Section title", kind: "text" },
		{
			key: "count",
			label: "How many to show",
			kind: "number",
			help: "Pulled live from published notices",
		},
	],
	rich_text: [
		{ key: "title", label: "Section title", kind: "text" },
		{ key: "html", label: "Content", kind: "richtext" },
	],
	history: [
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Narrative", kind: "textarea" },
		{ key: "image", label: "Image", kind: "image" },
	],
	mission_vision: [
		{ key: "mission", label: "Mission", kind: "textarea" },
		{ key: "vision", label: "Vision", kind: "textarea" },
		{
			key: "values",
			label: "Core values",
			kind: "tags",
			placeholder: "Add a value and press Enter",
		},
	],
	principal_message: [
		{ key: "name", label: "Name", kind: "text" },
		{ key: "role", label: "Role", kind: "text" },
		{ key: "message", label: "Message", kind: "textarea" },
		{ key: "photo", label: "Portrait", kind: "image" },
	],
	facilities: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
		{ key: "allSpacesLabel", label: "“All spaces” filter label", kind: "text" },
		{ key: "indexLabel", label: "Facility index heading", kind: "text" },
		{ key: "galleryEyebrow", label: "Gallery eyebrow", kind: "text" },
		{ key: "galleryTitle", label: "Gallery heading", kind: "text" },
		{
			key: "studentsLoveLabel",
			label: "Student quote caption",
			kind: "text",
		},
		{
			key: "visitingNote",
			label: "Visiting note",
			kind: "textarea",
			help: "Address is prepended automatically.",
		},
		{ key: "emptyTitle", label: "Empty state title", kind: "text" },
		{
			key: "emptyDescription",
			label: "Empty state description",
			kind: "textarea",
		},
		{ key: "showAllLabel", label: "Empty state button", kind: "text" },
	],
	achievements: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
	],
	contact_details: [
		{ key: "phone", label: "Phone", kind: "text" },
		{ key: "secondaryPhone", label: "Secondary phone", kind: "text" },
		{ key: "email", label: "Email", kind: "text" },
		{ key: "admissionsEmail", label: "Admissions email", kind: "text" },
		{ key: "address", label: "Address", kind: "textarea" },
	],
	office_hours: [
		{ key: "weekdays", label: "Weekdays", kind: "text" },
		{ key: "saturday", label: "Saturday", kind: "text" },
		{ key: "sunday", label: "Sunday", kind: "text" },
		{ key: "note", label: "Note", kind: "textarea" },
	],
	social_links: [
		{ key: "facebook", label: "Facebook", kind: "url" },
		{ key: "instagram", label: "Instagram", kind: "url" },
		{ key: "x", label: "X", kind: "url" },
		{ key: "youtube", label: "YouTube", kind: "url" },
		{ key: "linkedin", label: "LinkedIn", kind: "url" },
	],
	map: [
		{ key: "label", label: "Location label", kind: "text" },
		{ key: "latitude", label: "Latitude", kind: "text" },
		{ key: "longitude", label: "Longitude", kind: "text" },
		{
			key: "embedUrl",
			label: "Map embed URL",
			kind: "url",
			help: "Google Maps embed URL shown on the page",
		},
		{ key: "directions", label: "Directions", kind: "textarea" },
	],
	announcements: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
	],
	gallery_grid: [
		{
			key: "title",
			label: "Section title",
			kind: "text",
			help: "Albums are pulled from the gallery",
		},
	],
	faculty: [
		{ key: "title", label: "Section title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
	],
	academics: [
		// Header meta strip
		{
			key: "metaProgrammesLabel",
			label: "Header meta · programmes label",
			kind: "text",
		},
		{
			key: "metaProgrammesValue",
			label: "Header meta · programmes value",
			kind: "text",
			help: "Leave empty to use the live programme count.",
		},
		{
			key: "metaLevelsLabel",
			label: "Header meta · levels label",
			kind: "text",
		},
		{
			key: "metaLevelsValue",
			label: "Header meta · levels value",
			kind: "text",
			help: "Leave empty to use the live level count.",
		},
		{
			key: "metaStreamsLabel",
			label: "Header meta · streams label",
			kind: "text",
		},
		{
			key: "metaStreamsValue",
			label: "Header meta · streams value",
			kind: "text",
		},
		{
			key: "metaSessionLabel",
			label: "Header meta · session label",
			kind: "text",
		},
		{
			key: "metaSessionValue",
			label: "Header meta · session value",
			kind: "text",
		},
		{
			key: "prospectusLabel",
			label: "Full prospectus · button label",
			kind: "text",
		},
		{
			key: "prospectusMeta",
			label: "Full prospectus · meta line",
			kind: "text",
			help: "Use {count} for the live programme count.",
		},
		{ key: "prospectusStamp", label: "Prospectus stamp", kind: "text" },

		// Level rail
		{ key: "chooseLevelLabel", label: "Level rail label", kind: "text" },
		{
			key: "levelAriaLabel",
			label: "Level switcher accessible label",
			kind: "text",
		},
		{ key: "levelGradesLabel", label: "Level meta: grades", kind: "text" },
		{ key: "levelBoardLabel", label: "Level meta: board", kind: "text" },
		{
			key: "levelProgrammesLabel",
			label: "Level meta: programmes",
			kind: "text",
		},
		{
			key: "levelSeatsLabel",
			label: "Level meta: seats",
			kind: "text",
		},

		// Featured programme
		{
			key: "featuredEyebrow",
			label: "Featured programme eyebrow",
			kind: "text",
		},
		{
			key: "spotlightDurationLabel",
			label: "Featured programme · duration label",
			kind: "text",
		},
		{
			key: "spotlightSeatsLabel",
			label: "Featured programme · seats label",
			kind: "text",
		},
		{
			key: "spotlightMediumLabel",
			label: "Featured programme · medium label",
			kind: "text",
		},
		{
			key: "spotlightProspectusLabel",
			label: "Featured programme · prospectus button",
			kind: "text",
		},
		{
			key: "spotlightProspectusMeta",
			label: "Featured programme · prospectus meta",
			kind: "text",
			help: "Use {code} for the programme code.",
		},

		// Programme index
		{ key: "title", label: "Programme index title", kind: "text" },
		{ key: "body", label: "Programme index intro", kind: "textarea" },
		{
			key: "programmeIndexEyebrow",
			label: "Programme index eyebrow",
			kind: "text",
		},
		{ key: "seatsSuffix", label: "Programme row · seats suffix", kind: "text" },

		// Programme detail tabs
		{ key: "tabOverview", label: "Programme tab · overview", kind: "text" },
		{ key: "tabSubjects", label: "Programme tab · subjects", kind: "text" },
		{ key: "tabFees", label: "Programme tab · fees", kind: "text" },
		{ key: "tabPathways", label: "Programme tab · pathways", kind: "text" },

		// Programme detail copy
		{
			key: "eligibilityLabel",
			label: "Programme detail · eligibility",
			kind: "text",
		},
		{ key: "mediumLabel", label: "Programme detail · medium", kind: "text" },
		{
			key: "durationLabel",
			label: "Programme detail · duration",
			kind: "text",
		},
		{ key: "boardLabel", label: "Programme detail · board", kind: "text" },
		{
			key: "distinctiveLabel",
			label: "Programme detail · distinctive heading",
			kind: "text",
		},
		{
			key: "programmeProspectusLabel",
			label: "Programme detail · prospectus button",
			kind: "text",
		},
		{
			key: "programmeProspectusMeta",
			label: "Programme detail · prospectus meta",
			kind: "text",
			help: "Use {code} for the programme code.",
		},

		// Subjects table
		{
			key: "subjectCodeLabel",
			label: "Subjects table · code header",
			kind: "text",
		},
		{
			key: "subjectNameLabel",
			label: "Subjects table · subject header",
			kind: "text",
		},
		{
			key: "subjectCreditLabel",
			label: "Subjects table · credit header",
			kind: "text",
		},
		{
			key: "subjectTypeLabel",
			label: "Subjects table · type header",
			kind: "text",
		},
		{
			key: "totalCreditLabel",
			label: "Subjects table · total row",
			kind: "text",
		},

		// Fees table
		{
			key: "feeParticularLabel",
			label: "Fees table · particular header",
			kind: "text",
		},
		{
			key: "feeAmountLabel",
			label: "Fees table · amount header",
			kind: "text",
		},
		{
			key: "feeFrequencyLabel",
			label: "Fees table · frequency header",
			kind: "text",
		},
		{
			key: "annualChargesLabel",
			label: "Fees · annual total label",
			kind: "text",
		},
		{
			key: "monthlyTuitionLabel",
			label: "Fees · monthly total label",
			kind: "text",
		},
		{ key: "feeNote", label: "Fee disclaimer", kind: "textarea" },

		// Pathways
		{
			key: "pathwaysEmpty",
			label: "Pathways fallback copy",
			kind: "textarea",
			help: "Shown when a programme has no external career pathways.",
		},
		{
			key: "learningOutcomesLabel",
			label: "Pathways · learning outcomes heading",
			kind: "text",
		},

		// Routine
		{ key: "routineEyebrow", label: "Routine eyebrow", kind: "text" },
		{
			key: "routineTitlePrefix",
			label: "Routine title prefix",
			kind: "text",
			help: "The level name is appended after a middle dot.",
		},
		{
			key: "routineDescription",
			label: "Routine description",
			kind: "textarea",
		},
		{ key: "routineShiftLabel", label: "Routine · shift label", kind: "text" },
		{ key: "routineRoomsLabel", label: "Routine · rooms label", kind: "text" },
		{
			key: "routineEffectiveFromLabel",
			label: "Routine · effective-from label",
			kind: "text",
		},
		{
			key: "routineShowOnlyPrefix",
			label: "Routine · focus-today prefix",
			kind: "text",
		},
		{
			key: "routineShowFullWeek",
			label: "Routine · show full week label",
			kind: "text",
		},
		{
			key: "routinePdfLabel",
			label: "Routine · PDF button label",
			kind: "text",
		},
		{
			key: "routineNowLabel",
			label: "Routine · live period label",
			kind: "text",
		},
		{
			key: "routinePeriodPrefix",
			label: "Routine · live period prefix",
			kind: "text",
		},
		{
			key: "routineNoPeriodText",
			label: "Routine · no live period text",
			kind: "textarea",
		},
		{
			key: "routineHolidayText",
			label: "Routine · holiday text",
			kind: "textarea",
		},
		{
			key: "routineDayLabel",
			label: "Routine · day column header",
			kind: "text",
		},
		{ key: "routineTodayLabel", label: "Routine · today marker", kind: "text" },
		{
			key: "routineCaptionSuffix",
			label: "Routine · table caption suffix",
			kind: "text",
		},
		{ key: "routineFooter", label: "Routine · footer note", kind: "textarea" },

		// Academic level tabs
		{
			key: "levels",
			label: "Academic levels",
			kind: "list",
			addLabel: "Add level",
			itemLabel: "Level",
			help: "Label, copy and image for each level tab. Leave an image empty to keep the built-in photo.",
			itemFields: [
				{ key: "id", label: "Level id (basic, secondary…)", kind: "text" },
				{ key: "label", label: "Label", kind: "text" },
				{ key: "short", label: "Short label", kind: "text" },
				{ key: "grades", label: "Grades", kind: "text" },
				{ key: "board", label: "Board", kind: "text" },
				{ key: "tagline", label: "Tagline", kind: "text" },
				{ key: "description", label: "Description", kind: "textarea" },
				{ key: "image", label: "Image", kind: "image" },
			],
		},

		// Timetables shown on the page
		{
			key: "routines",
			label: "Weekly routines",
			kind: "list",
			addLabel: "Add routine",
			itemLabel: "Routine",
			collapsible: true,
			help: "The routine whose key matches the featured programme's routine key is shown on the page.",
			itemFields: [
				{ key: "key", label: "Routine key", kind: "text" },
				{ key: "label", label: "Routine label", kind: "text" },
				{ key: "shift", label: "Shift", kind: "text" },
				{ key: "room", label: "Rooms", kind: "text" },
				{ key: "effectiveFrom", label: "Effective from", kind: "text" },
				{
					key: "periods",
					label: "Periods",
					kind: "list",
					addLabel: "Add period",
					itemLabel: "Period",
					itemFields: [
						{ key: "label", label: "Label", kind: "text" },
						{ key: "start", label: "Start (HH:MM)", kind: "text" },
						{ key: "end", label: "End (HH:MM)", kind: "text" },
						{ key: "isBreak", label: "Break period", kind: "boolean" },
					],
				},
				{
					key: "rows",
					label: "Days",
					kind: "list",
					addLabel: "Add day",
					itemLabel: "Day",
					itemFields: [
						{ key: "day", label: "Day name", kind: "text" },
						{
							key: "slots",
							label: "Subjects (one per period)",
							kind: "tags",
							placeholder: "Subject or activity",
						},
					],
				},
			],
		},
	],
	admissions_info: [
		{ key: "title", label: "Section title", kind: "text" },
		{ key: "body", label: "Body", kind: "textarea" },
		{ key: "deadline", label: "Deadline", kind: "date" },
		{
			key: "steps",
			label: "Application steps",
			kind: "list",
			addLabel: "Add step",
			itemLabel: "Step",
			help: "Shown as numbered cards, in order.",
			itemFields: [
				{ key: "title", label: "Step title", kind: "text" },
				{ key: "description", label: "Description", kind: "textarea" },
			],
		},
	],
	// The sign-in page is composed from these four section types; each one maps
	// to a region of the auth layout (visual column, panel intro, form, footer).
	auth_visual: [
		{ key: "image", label: "Image", kind: "image" },
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "headline", label: "Headline", kind: "text" },
		{ key: "subheadline", label: "Supporting text", kind: "textarea" },
	],
	auth_intro: [
		{ key: "kicker", label: "Kicker", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "intro", label: "Intro", kind: "textarea" },
	],
	auth_form: [
		{ key: "backLabel", label: "Back link label", kind: "text" },
		{ key: "emailLabel", label: "Email field label", kind: "text" },
		{ key: "passwordLabel", label: "Password field label", kind: "text" },
		{ key: "forgotLabel", label: "Forgot password label", kind: "text" },
		{ key: "submitLabel", label: "Submit button label", kind: "text" },
	],
	auth_contact: [
		{ key: "title", label: "Title", kind: "text" },
		{ key: "linkLabel", label: "Link label", kind: "text" },
		{ key: "linkHref", label: "Link", kind: "url", placeholder: "/contact" },
	],
	// The faculty & administration page sections: header plus the two heading
	// strips above the leadership cards and the directory. The cards and rows
	// under them stay data-driven (managed on the Teachers & Staffs tab).
	faculty_header: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "subtitle", label: "Subtitle", kind: "textarea" },
	],
	faculty_leadership: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "description", label: "Intro copy", kind: "textarea" },
	],
	faculty_directory: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "description", label: "Intro copy", kind: "textarea" },
	],
	// Landing page (/) — the scroll-driven hero and the editorial sections under it.
	landing_hero: [
		{ key: "text1Title", label: "Overlay 1 headline", kind: "text" },
		{ key: "text1Body", label: "Overlay 1 supporting text", kind: "textarea" },
		{ key: "text2Title", label: "Overlay 2 headline", kind: "text" },
		{ key: "text2Body", label: "Overlay 2 supporting text", kind: "textarea" },
		{ key: "text3Title", label: "Overlay 3 headline", kind: "text" },
		{ key: "text3Body", label: "Overlay 3 supporting text", kind: "textarea" },
		{
			key: "footageBase",
			label: "Footage folder",
			kind: "text",
			placeholder: "/schools/everest/landing-footage/",
			help: "Public URL folder holding the hero scroll frames. Keep the trailing slash.",
		},
		{
			key: "footagePrefix",
			label: "Frame filename prefix",
			kind: "text",
			placeholder: "frame_",
			help: "Frames are named <prefix>0001.jpeg, <prefix>0002.jpeg… (4-digit zero-padded).",
		},
		{
			key: "footageExtension",
			label: "Frame file extension",
			kind: "text",
			placeholder: ".jpeg",
			help: "Include the leading dot, e.g. .jpeg or .webp.",
		},
		{
			key: "footageFrameCount",
			label: "Number of frames",
			kind: "number",
			help: "Frames must be numbered 0001 up to this count. The scroll maps onto them.",
		},
		{
			key: "autoplaySeconds",
			label: "Auto-play duration (seconds)",
			kind: "number",
			help: "How long the hero takes to play by itself when the visitor is idle. 0 disables auto-play; scroll always works.",
		},
	],
	landing_facts: [
		{ key: "title", label: "Section title", kind: "text" },
		{ key: "body", label: "Intro paragraph", kind: "textarea" },
		{
			key: "facts",
			label: "Fact rows",
			kind: "list",
			addLabel: "Add fact",
			itemLabel: "Fact",
			itemFields: [
				{ key: "label", label: "Label", kind: "text" },
				{ key: "value", label: "Value", kind: "text" },
			],
		},
	],
	discover_cards: [
		{
			key: "cards",
			label: "Cards",
			kind: "list",
			addLabel: "Add card",
			itemLabel: "Card",
			itemFields: [
				{ key: "eyebrow", label: "Eyebrow", kind: "text" },
				{ key: "title", label: "Title", kind: "text" },
				{ key: "body", label: "Body", kind: "textarea" },
				{ key: "href", label: "Link", kind: "text" },
				{ key: "image", label: "Image", kind: "image" },
				{ key: "ctaLabel", label: "Button label", kind: "text" },
			],
		},
	],
	landing_section_headings: [
		{ key: "resultsEyebrow", label: "Results eyebrow", kind: "text" },
		{ key: "resultsTitle", label: "Results title", kind: "text" },
		{ key: "resultsDesc", label: "Results description", kind: "textarea" },
		{ key: "discoverEyebrow", label: "Discover eyebrow", kind: "text" },
		{ key: "discoverTitle", label: "Discover title", kind: "text" },
		{ key: "discoverDesc", label: "Discover description", kind: "textarea" },
		{
			key: "featuredFacilities",
			label: "Featured Facilities Cards",
			kind: "tags",
			placeholder: "e.g. central-library, physics-chemistry-lab, computer-suites",
			help: "Specific campus facility IDs or titles to feature. If empty, cards from Discover cards block are displayed.",
		},
		{ key: "galleryEyebrow", label: "Gallery eyebrow", kind: "text" },
		{ key: "galleryTitle", label: "Gallery title", kind: "text" },
		{ key: "galleryDesc", label: "Gallery description", kind: "textarea" },
		{
			key: "featuredGallery",
			label: "Featured Gallery Albums",
			kind: "tags",
			placeholder: "e.g. a-sports, a-science, a-cultural",
			help: "Specific album IDs or event titles to feature on landing page. If empty, first 3 albums are shown.",
		},
		{ key: "updatesEyebrow", label: "Updates eyebrow", kind: "text" },
		{ key: "updatesTitle", label: "Updates title", kind: "text" },
		{ key: "updatesDesc", label: "Updates description", kind: "textarea" },
		{ key: "facultyEyebrow", label: "Faculty eyebrow", kind: "text" },
		{ key: "facultyTitle", label: "Faculty title", kind: "text" },
		{ key: "facultyDesc", label: "Faculty description", kind: "textarea" },
		{
			key: "featuredFaculty",
			label: "Featured Administrators & Faculty",
			kind: "tags",
			placeholder: "e.g. krishna-neupane, umesh-regmi, bhimsen-gautam",
			help: "Specific administrator IDs or names to feature on landing page. If empty, top leadership is shown.",
		},
		{ key: "activitiesEyebrow", label: "Activities eyebrow", kind: "text" },
		{ key: "activitiesTitle", label: "Activities title", kind: "text" },
		{ key: "activitiesDesc", label: "Activities description", kind: "textarea" },
		{
			key: "featuredClubs",
			label: "Featured Clubs & Societies",
			kind: "tags",
			placeholder: "e.g. science-club, robotics-club, literature-club",
			help: "Specific club slugs or titles to feature on landing page. If empty, first 3 active clubs are shown.",
		},
		{
			key: "featuredActivities",
			label: "Featured Society Activities / Dispatches",
			kind: "tags",
			placeholder: "e.g. basketball, extempore, arduino",
			help: "Specific activity post IDs or title search keywords to feature. If empty, latest 3 dispatches are shown.",
		},
	],
	// About page (/about) — the chapter index cards.
	chapters: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{ key: "body", label: "Intro copy", kind: "textarea" },
		{ key: "filterLabel", label: "Category filter label", kind: "text" },
		{ key: "contentsLabel", label: "Contents rail heading", kind: "text" },
		{ key: "galleryEyebrow", label: "Gallery eyebrow", kind: "text" },
		{ key: "galleryTitle", label: "Gallery heading", kind: "text" },
		{
			key: "visitingNote",
			label: "Visiting note",
			kind: "textarea",
			help: "Address is prepended automatically.",
		},
		{ key: "emptyTitle", label: "Empty state title", kind: "text" },
		{
			key: "emptyDescription",
			label: "Empty state description",
			kind: "textarea",
		},
		{ key: "showAllLabel", label: "Empty state button", kind: "text" },
		{
			key: "chapters",
			label: "Chapters",
			kind: "list",
			addLabel: "Add chapter",
			itemLabel: "Chapter",
			itemFields: [
				{ key: "name", label: "Name", kind: "text" },
				{ key: "category", label: "Category", kind: "text" },
				{ key: "description", label: "Description", kind: "textarea" },
				{ key: "image", label: "Image", kind: "image" },
				{ key: "inCharge", label: "In charge", kind: "text" },
				{ key: "since", label: "Since", kind: "text" },
				{ key: "block", label: "Block", kind: "text" },
				{
					key: "studentsLove",
					label: "Why students love it",
					kind: "textarea",
				},
				{
					key: "stats",
					label: "Stats strip (Label | Value per line)",
					kind: "textarea",
				},
				{
					key: "gallery",
					label: "Gallery image URLs (one per line)",
					kind: "textarea",
				},
			],
		},
	],
	// Contact page (/contact) — the department contact list.
	department_list: [
		{ key: "eyebrow", label: "Eyebrow", kind: "text" },
		{ key: "title", label: "Title", kind: "text" },
		{
			key: "departments",
			label: "Departments",
			kind: "list",
			addLabel: "Add department",
			itemLabel: "Department",
			itemFields: [
				{ key: "name", label: "Name", kind: "text" },
				{ key: "contact", label: "Contact person", kind: "text" },
				{ key: "email", label: "Email", kind: "text" },
				{ key: "hours", label: "Hours", kind: "text" },
			],
		},
	],
};

/** Section types that only make sense on the sign-in page. */
export const AUTH_BLOCK_TYPES: BlockType[] = [
	"auth_visual",
	"auth_intro",
	"auth_form",
	"auth_contact",
];

// -------------------------------------------------------------- style presets

export const STYLE_BACKGROUNDS = [
	{ value: "default", label: "Plain" },
	{ value: "subtle", label: "Subtle tint" },
	{ value: "wash", label: "Brand wash" },
];

export const STYLE_SPACING = [
	{ value: "compact", label: "Compact" },
	{ value: "normal", label: "Normal" },
	{ value: "spacious", label: "Spacious" },
];

export const STYLE_ALIGNMENT = [
	{ value: "left", label: "Left" },
	{ value: "center", label: "Centred" },
];

export const BACKGROUND_CLASS: Record<string, string> = {
	default: "bg-surface-1",
	subtle: "bg-surface-2",
	wash: "header-wash bg-surface-1",
};

export const SPACING_CLASS: Record<string, string> = {
	compact: "px-4 py-4",
	normal: "px-5 py-6",
	spacious: "px-6 py-10",
};

// ------------------------------------------------------------------- helpers

export function str(
	fields: Record<string, unknown>,
	key: string,
	fallback = "",
): string {
	const value = fields[key];
	if (typeof value === "string") return value;
	if (typeof value === "number") return String(value);
	return fallback;
}

export function num(
	fields: Record<string, unknown>,
	key: string,
	fallback = 0,
): number {
	const value = fields[key];
	if (typeof value === "number") return value;
	if (
		typeof value === "string" &&
		value.trim() !== "" &&
		!Number.isNaN(Number(value))
	)
		return Number(value);
	return fallback;
}

export function rows(
	fields: Record<string, unknown>,
	key: string,
): Record<string, unknown>[] {
	const value = fields[key];
	return Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
}

export function tags(fields: Record<string, unknown>, key: string): string[] {
	const value = fields[key];
	if (Array.isArray(value)) {
		return value.filter((item): item is string => typeof item === "string");
	}
	if (typeof value === "string" && value.trim()) {
		return value
			.split(/[,;\n]+/)
			.map((s) => s.trim())
			.filter(Boolean);
	}
	return [];
}
