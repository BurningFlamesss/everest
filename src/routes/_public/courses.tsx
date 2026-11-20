import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { ArrowUpRight, GraduationCap, Minus } from "lucide-react";
import { useMemo, useState } from "react";
import { str } from "#/components/cms/block-fields";
import { CmsSectionBox } from "#/components/cms/CmsSectionBox";
import { school } from "#/content/school";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import { academicProspectusDoc, programProspectusDoc } from "#/lib/documents";
import { formatNpr } from "#/lib/fees";
import { STAGGER } from "#/lib/motion";
import { downloadOfficialPdf } from "#/lib/pdf";
import {
	levels,
	levelsFromFields,
	programs as staticPrograms,
} from "#/lib/programs";
import { routineByKey } from "#/lib/routines";
import {
	getProgramsServer,
	getWebsitePagePreviewServer,
} from "#/packages/content/server/content.ts";
import { useWebsitePageContent } from "#/packages/school/hook.tsx";
import {
	PageFrame,
	PageHeader,
	Reveal,
	Section,
	SectionHeading,
} from "#/templates/modern/components/chrome/PageFrame";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
	Separator,
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "#/templates/modern/components/kit";
import { DownloadButton } from "#/templates/modern/components/shared/DownloadButton";
import { EditorialImage } from "#/templates/modern/components/shared/EditorialImage";
import type { BlockType, Level, LevelId, Program } from "#/types";

interface ProgramDetailLabels {
	tabOverview: string;
	tabSubjects: string;
	tabFees: string;
	tabPathways: string;
	eligibility: string;
	medium: string;
	duration: string;
	board: string;
	distinctive: string;
	prospectusLabel: string;
	prospectusMeta: string;
	prospectusStamp: string;
	subjectCode: string;
	subjectName: string;
	subjectCredit: string;
	subjectType: string;
	totalCredit: string;
	feeParticular: string;
	feeAmount: string;
	feeFrequency: string;
	annualCharges: string;
	monthlyTuition: string;
	learningOutcomes: string;
}

const ProgramDetail = ({
	program,
	feeNote,
	pathwaysEmpty,
	labels,
}: {
	program: Program;
	feeNote: string;
	pathwaysEmpty: string;
	labels: ProgramDetailLabels;
}) => {
	const level = levels.find((l) => l.id === program.level) ?? levels[0];
	const totalCredits = program.subjects.reduce((sum, s) => sum + s.credit, 0);
	const annual = program.fees
		.filter((f) => f.frequency === "Annual")
		.reduce((sum, f) => sum + f.amount, 0);
	const monthly = program.fees
		.filter((f) => f.frequency === "Monthly")
		.reduce((sum, f) => sum + f.amount, 0);

	return (
		<Tabs defaultValue="overview" className="w-full">
			<TabsList
				data-testid={`program-tabs-${program.id}`}
				className="h-auto flex-wrap justify-start gap-1 rounded-full bg-transparent p-1"
			>
				{[
					{ value: "overview", label: labels.tabOverview },
					{ value: "subjects", label: labels.tabSubjects },
					{ value: "fees", label: labels.tabFees },
					{ value: "pathways", label: labels.tabPathways },
				].map((tab) => (
					<TabsTrigger
						key={tab.value}
						value={tab.value}
						data-testid={`program-tab-${program.id}-${tab.value}`}
						className="!border-none !outline-none !ring-0 rounded-full px-3.5 py-1.5 text-[13px] transition-colors duration-fast data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
					>
						{tab.label}
					</TabsTrigger>
				))}
			</TabsList>

			<TabsContent value="overview" className="mt-6 focus-visible:outline-none">
				<div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
					<div className="min-w-0">
						<p className="t-body max-w-measure text-muted-foreground">
							{program.description}
						</p>
						<dl className="mt-7 grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
							{[
								{ label: labels.eligibility, value: program.eligibility },
								{ label: labels.medium, value: program.medium },
								{ label: labels.duration, value: program.duration },
								{ label: labels.board, value: level.board },
							].map((item) => (
								<div key={item.label}>
									<dt className="t-eyebrow">{item.label}</dt>
									<dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
										{item.value}
									</dd>
								</div>
							))}
						</dl>
					</div>

					<div className="min-w-0  bg-transparent p-5">
						<p className="t-eyebrow">{labels.distinctive}</p>
						<ul className="mt-4 space-y-3">
							{program.highlights.map((item) => (
								<li key={item} className="flex gap-3">
									<Minus
										className="mt-[7px] h-3 w-3 shrink-0 text-accent"
										aria-hidden="true"
									/>
									<span className="text-[13px] leading-relaxed text-foreground">
										{item}
									</span>
								</li>
							))}
						</ul>
					</div>
				</div>

				<div className="mt-8  pt-6">
					<DownloadButton
						label={labels.prospectusLabel}
						meta={labels.prospectusMeta.replace("{code}", program.code)}
						stamp={labels.prospectusStamp}
						size="sm"
						testId={`program-download-prospectus-${program.id}`}
						onDownload={() =>
							downloadOfficialPdf(programProspectusDoc(program, level))
						}
					/>
				</div>
			</TabsContent>

			<TabsContent value="subjects" className="mt-6 focus-visible:outline-none">
				<div className="overflow-hidden ">
					<div className="rail-scroll overflow-x-auto">
						<table
							className="w-full min-w-[520px] border-collapse text-left"
							data-testid={`program-subjects-table-${program.id}`}
						>
							<thead>
								<tr className=" bg-transparent">
									<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.subjectCode}
									</th>
									<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.subjectName}
									</th>
									<th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.subjectCredit}
									</th>
									<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.subjectType}
									</th>
								</tr>
							</thead>
							<tbody>
								{program.subjects.map((subject, index) => (
									<tr
										key={subject.code}
										className={` ${index % 2 === 1 ? "bg-transparent" : ""}`}
									>
										<td className="px-4 py-3 font-mono text-[11px] tabular-nums text-muted-foreground">
											{subject.code}
										</td>
										<td className="px-4 py-3 text-[13px] text-foreground">
											{subject.name}
										</td>
										<td className="px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground">
											{subject.credit}
										</td>
										<td className="px-4 py-3">
											<span className="inline-flex rounded-full bg-transparent px-2 py-0.5 text-[11px] text-muted-foreground">
												{subject.kind}
											</span>
										</td>
									</tr>
								))}
							</tbody>
							<tfoot>
								<tr className=" bg-transparent">
									<td className="px-4 py-3" />
									<td className="px-4 py-3 text-[12px] uppercase tracking-[0.12em] text-muted-foreground">
										{labels.totalCredit}
									</td>
									<td className="px-4 py-3 text-right font-mono text-[13px] font-semibold tabular-nums text-foreground">
										{totalCredits}
									</td>
									<td className="px-4 py-3" />
								</tr>
							</tfoot>
						</table>
					</div>
				</div>
			</TabsContent>

			<TabsContent value="fees" className="mt-6 focus-visible:outline-none">
				<div className="overflow-hidden ">
					<div className="rail-scroll overflow-x-auto">
						<table
							className="w-full min-w-[560px] border-collapse text-left"
							data-testid={`program-fees-table-${program.id}`}
						>
							<thead>
								<tr className=" bg-transparent">
									<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.feeParticular}
									</th>
									<th className="px-4 py-3 text-right text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.feeAmount}
									</th>
									<th className="px-4 py-3 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
										{labels.feeFrequency}
									</th>
								</tr>
							</thead>
							<tbody>
								{program.fees.map((fee, index) => (
									<tr
										key={fee.label}
										className={` ${index % 2 === 1 ? "bg-transparent" : ""}`}
									>
										<td className="px-4 py-3 text-[13px] text-foreground">
											{fee.label}
											{fee.note ? (
												<span className="mt-1 block t-meta">{fee.note}</span>
											) : null}
										</td>
										<td className="whitespace-nowrap px-4 py-3 text-right font-mono text-[13px] tabular-nums text-foreground">
											{formatNpr(fee.amount)}
										</td>
										<td className="px-4 py-3 text-[12px] text-muted-foreground">
											{fee.frequency}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				<dl className="mt-5 flex flex-wrap gap-x-10 gap-y-3">
					<div>
						<dt className="t-eyebrow">{labels.annualCharges}</dt>
						<dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
							{formatNpr(annual)}
						</dd>
					</div>
					<div>
						<dt className="t-eyebrow">{labels.monthlyTuition}</dt>
						<dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
							{formatNpr(monthly)}
						</dd>
					</div>
				</dl>
				<p className="t-meta mt-4 max-w-measure leading-relaxed">
					{feeNote ||
						"Figures are indicative for session 2083 BS. Any approved scholarship is applied at the accounts desk before the term invoice is issued."}
				</p>
			</TabsContent>

			<TabsContent value="pathways" className="mt-6 focus-visible:outline-none">
				{program.careers.length > 0 ? (
					<ul className="grid gap-3 sm:grid-cols-2">
						{program.careers.map((career) => (
							<li
								key={career}
								className="flex items-start gap-3  bg-transparent px-4 py-3.5"
							>
								<ArrowUpRight
									className="mt-0.5 h-4 w-4 shrink-0 text-accent"
									aria-hidden="true"
								/>
								<span className="text-[13px] leading-relaxed text-foreground">
									{career}
								</span>
							</li>
						))}
					</ul>
				) : (
					<p className="t-body max-w-measure text-muted-foreground">
						{pathwaysEmpty ||
							"This programme feeds directly into the next level within the school rather than into external pathways. Progression is automatic on completion, and no separate application is required."}
					</p>
				)}

				<div className="mt-8  pt-6">
					<p className="t-eyebrow">{labels.learningOutcomes}</p>
					<ul className="mt-4 space-y-3">
						{program.outcomes.map((outcome) => (
							<li key={outcome} className="flex gap-3">
								<span
									className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
									aria-hidden="true"
								/>
								<span className="text-[13px] leading-relaxed text-foreground">
									{outcome}
								</span>
							</li>
						))}
					</ul>
				</div>
			</TabsContent>
		</Tabs>
	);
};

export const Route = createFileRoute("/_public/courses")({
	validateSearch: (
		search: Record<string, unknown>,
	): { cms?: string; level?: string } => ({
		cms: search.cms as string | undefined,
		level: search.level as string | undefined,
	}),
	loader: async ({ location }) => {
		const search = location.search as { cms?: string };
		let previewPage = null;
		if (String(search.cms) === "1") {
			previewPage = await getWebsitePagePreviewServer({
				data: { key: "courses" },
			});
		}
		const dbPrograms = await getProgramsServer();
		return { previewPage, dbPrograms };
	},
	component: RouteComponent,
});

function RouteComponent() {
	const search = useSearch({ from: "/_public/courses" }) as {
		cms?: string;
		level?: string;
	};
	const cms = search.cms;
	const { previewPage, dbPrograms } = Route.useLoaderData();
	const publishedContent = useWebsitePageContent("courses");
	const preview = String(cms ?? "") === "1";
	const cmsData = (preview ? previewPage : publishedContent) as {
		blocks?: NonNullable<Parameters<typeof getSectionFields>[0]>;
	} | null;

	const activePrograms =
		dbPrograms && dbPrograms.length > 0 ? dbPrograms : staticPrograms;

	const headerSection = {
		...sectionDefaults("headline", "courses"),
		...getSectionFields(cmsData?.blocks, "headline"),
	};

	const academicsSection = {
		...sectionDefaults("academics"),
		...getSectionFields(cmsData?.blocks, "academics"),
	};

	const txt = (key: string, fallback = "") =>
		str(academicsSection, key) || fallback;

	const programLabels: ProgramDetailLabels = {
		tabOverview: txt("tabOverview", "Overview"),
		tabSubjects: txt("tabSubjects", "Subjects"),
		tabFees: txt("tabFees", "Fees"),
		tabPathways: txt("tabPathways", "Pathways"),
		eligibility: txt("eligibilityLabel", "Eligibility"),
		medium: txt("mediumLabel", "Medium"),
		duration: txt("durationLabel", "Duration"),
		board: txt("boardLabel", "Board"),
		distinctive: txt("distinctiveLabel", "What makes it distinctive"),
		prospectusLabel: txt("programmeProspectusLabel", "Programme prospectus"),
		prospectusMeta: txt(
			"programmeProspectusMeta",
			"PDF · {code} · Session 2083 BS",
		),
		prospectusStamp: txt("prospectusStamp", "Official"),
		subjectCode: txt("subjectCodeLabel", "Code"),
		subjectName: txt("subjectNameLabel", "Subject"),
		subjectCredit: txt("subjectCreditLabel", "Credit"),
		subjectType: txt("subjectTypeLabel", "Type"),
		totalCredit: txt("totalCreditLabel", "Total credit hours"),
		feeParticular: txt("feeParticularLabel", "Particular"),
		feeAmount: txt("feeAmountLabel", "Amount"),
		feeFrequency: txt("feeFrequencyLabel", "Frequency"),
		annualCharges: txt("annualChargesLabel", "Annual charges"),
		monthlyTuition: txt("monthlyTuitionLabel", "Monthly tuition"),
		learningOutcomes: txt("learningOutcomesLabel", "Learning outcomes"),
	};

	// Level copy is editable per page; saved rows override the built-in level
	// data field by field, and an empty image keeps the bundled photograph.
	const displayLevels: Level[] = levelsFromFields(academicsSection);

	const onSelectSection = (sectionType: BlockType) => {
		window.parent?.postMessage(
			{
				source: "scms-cms",
				type: "select-section",
				pageKey: "courses",
				sectionType,
			},
			"*",
		);
	};

	// Deep-linkable level: /courses?level=plus2-management lands straight on
	// that stream (the course-finder quiz hands off here with the visitor's
	// top-ranked stream). Unknown or missing values fall back to science.
	const requestedLevel = displayLevels.some((l) => l.id === search.level)
		? (search.level as LevelId)
		: undefined;
	const [levelId, setLevelId] = useState<LevelId>(
		requestedLevel ?? "plus2-science",
	);
	// The tab is local state once the visitor starts clicking, but a new URL
	// (back/forward, or a shared link while already here) must win again — so
	// re-seat the level whenever the requested one changes.
	const [lastRequested, setLastRequested] = useState(requestedLevel);
	if (requestedLevel !== lastRequested) {
		setLastRequested(requestedLevel);
		if (requestedLevel) setLevelId(requestedLevel);
	}

	const level = useMemo(
		() => displayLevels.find((l) => l.id === levelId) ?? displayLevels[0],
		[levelId, displayLevels],
	);

	const levelPrograms = useMemo(
		() => activePrograms.filter((p) => p.level === level.id),
		[level.id, activePrograms],
	);

	const spotlight = useMemo(
		() => levelPrograms.find((p) => p.spotlight) ?? levelPrograms[0],
		[levelPrograms],
	);

	const totalSeats = levelPrograms.reduce((sum, p) => sum + p.seats, 0);

	return (
		<PageFrame testId="courses-page">
			<CmsSectionBox
				preview={preview}
				sectionType="headline"
				onSelect={onSelectSection}
				testId="cms-section-hit-courses-headline"
			>
				<PageHeader
					testId="courses-page-header"
					eyebrow={str(headerSection, "eyebrow") || "Academics"}
					title={str(headerSection, "title") || "Courses & Academic Programmes"}
					subtitle={
						str(headerSection, "body") ||
						"Subject lists, credit hours, fee structures and weekly routines for every programme from Nursery to Grade 12."
					}
					meta={[
						{
							label: txt("metaProgrammesLabel", "Programmes"),
							value:
								txt("metaProgrammesValue") || String(activePrograms.length),
						},
						{
							label: txt("metaLevelsLabel", "Levels"),
							value: txt("metaLevelsValue") || String(displayLevels.length),
						},
						{
							label: txt("metaStreamsLabel", "+2 streams"),
							value: txt("metaStreamsValue", "Science, Management, Humanities"),
						},
						{
							label: txt("metaSessionLabel", "Session"),
							value: txt("metaSessionValue", "2083 BS"),
						},
					]}
					actions={
						<DownloadButton
							label={txt("prospectusLabel", "Full academic prospectus")}
							meta={txt(
								"prospectusMeta",
								"PDF · {count} programmes · 2083 BS",
							).replace("{count}", String(activePrograms.length))}
							stamp={txt("prospectusStamp", "Official")}
							testId="courses-download-prospectus-button"
							onDownload={() =>
								downloadOfficialPdf(
									academicProspectusDoc(levels, activePrograms),
								)
							}
						/>
					}
				/>
			</CmsSectionBox>

			<div className="mt-16 grid gap-12 lg:grid-cols-[236px_1fr] lg:gap-16">
				{/* Level rail — vertical index on desktop, snap rail on mobile */}
				<aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
					<p className="t-eyebrow">
						{str(academicsSection, "chooseLevelLabel") || "Choose a level"}
					</p>
					<div
						role="group"
						aria-label={txt("levelAriaLabel", "Academic level")}
						data-testid="program-level-switcher"
						className="no-scrollbar -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:mt-5 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0"
					>
						{displayLevels.map((item) => {
							const active = item.id === level.id;
							return (
								<button
									key={item.id}
									type="button"
									onClick={() => setLevelId(item.id)}
									aria-pressed={active}
									data-active={active}
									data-testid={`program-level-switcher-item-${item.id}`}
									className={[
										"shrink-0 min-h-11 rounded-field border px-3.5 py-2.5 text-left transition-colors duration-fast",
										"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
										"lg:w-full lg:rounded-none lg:border-0 lg:border-l-2 lg:px-0 lg:pl-4",
										active
											? "border-accent/40 bg-accent/[0.08] lg:border-accent lg:bg-transparent"
											: "border-border bg-background hover:bg-secondary lg:border-transparent lg:bg-transparent lg:hover:border-border",
									].join(" ")}
								>
									<span
										className={[
											"block whitespace-nowrap text-[13px] lg:whitespace-normal",
											active
												? "font-medium text-foreground"
												: "text-muted-foreground",
										].join(" ")}
									>
										{item.label}
									</span>
									<span className="mt-1 hidden font-mono text-[10px] tabular-nums text-muted-foreground lg:block">
										{item.grades}
									</span>
								</button>
							);
						})}
					</div>

					<Separator className="my-7 hidden lg:block" />

					<dl className="hidden gap-y-5 lg:grid">
						{[
							{
								label: str(academicsSection, "levelGradesLabel") || "Grades",
								value: level.grades,
							},
							{
								label: str(academicsSection, "levelBoardLabel") || "Board",
								value: level.board,
							},
							{
								label:
									str(academicsSection, "levelProgrammesLabel") || "Programmes",
								value: String(levelPrograms.length),
							},
							{
								label:
									str(academicsSection, "levelSeatsLabel") ||
									"Seats this session",
								value: String(totalSeats),
							},
						].map((item) => (
							<div key={item.label}>
								<dt className="t-eyebrow">{item.label}</dt>
								<dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
									{item.value}
								</dd>
							</div>
						))}
					</dl>
				</aside>

				{/* Main editorial column */}
				<div className="min-w-0">
					<Reveal key={`intro-${level.id}`}>
						<section className="grid gap-8 lg:grid-cols-[1fr_0.82fr] lg:gap-12">
							<div className="min-w-0">
								<p className="t-eyebrow">{level.grades}</p>
								<h2
									className="t-h2 mt-2.5 text-foreground"
									data-testid="level-title"
								>
									{level.label}
								</h2>
								<p className="mt-4 font-display text-lg italic leading-snug text-red-dark">
									{level.tagline}
								</p>
								<p className="t-body mt-5 max-w-measure text-muted-foreground">
									{level.description}
								</p>
								<p className="t-meta mt-6 flex items-center gap-2">
									<GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
									{level.board}
								</p>
							</div>
							<EditorialImage
								src={level.image}
								alt={`${level.label} at ${school.nameEn}`}
								ratio="feature"
								caption={`${level.short} · ${school.address.line1}`}
								testId="level-image"
							/>
						</section>
					</Reveal>

					{/* Flagship programme — editorial featured block */}
					<Reveal key={`spotlight-${spotlight.id}`} delay={STAGGER}>
						<article
							data-testid="featured-block"
							className="mt-section overflow-hidden  bg-transparent shadow-sm lg:mt-section-lg"
						>
							<div className="grid lg:grid-cols-[1fr_0.8fr]">
								<div className="border-y border-transparent p-6 sm:p-8">
									<p className="t-eyebrow">
										{str(academicsSection, "featuredEyebrow") ||
											"Most-chosen programme at this level"}
									</p>
									<h3
										className="t-h2 mt-2.5 text-foreground"
										data-testid="featured-block-title"
									>
										{spotlight.title}
									</h3>
									<p className="t-meta mt-2.5">
										{spotlight.code}
										{spotlight.stream ? ` · ${spotlight.stream}` : ""}
									</p>
									<p className="t-body mt-5 max-w-measure text-muted-foreground">
										{spotlight.summary}
									</p>
									<dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
										{[
											{
												label: txt("spotlightDurationLabel", "Duration"),
												value: spotlight.duration,
											},
											{
												label: txt("spotlightSeatsLabel", "Seats"),
												value: String(spotlight.seats),
											},
											{
												label: txt("spotlightMediumLabel", "Medium"),
												value: spotlight.medium,
											},
										].map((item) => (
											<div key={item.label}>
												<dt className="t-eyebrow">{item.label}</dt>
												<dd className="mt-1.5 text-[13px] leading-relaxed text-foreground">
													{item.value}
												</dd>
											</div>
										))}
									</dl>
									<div className="mt-8">
										<DownloadButton
											label={txt(
												"spotlightProspectusLabel",
												"Prospectus for this programme",
											)}
											meta={txt(
												"spotlightProspectusMeta",
												"PDF · {code} · signed by the Principal",
											).replace("{code}", spotlight.code)}
											stamp={txt("prospectusStamp", "Official")}
											testId="featured-block-download-button"
											onDownload={() =>
												downloadOfficialPdf(
													programProspectusDoc(spotlight, level),
												)
											}
										/>
									</div>
								</div>

								<div className=" p-6 sm:p-8 lg:border-y lg:border-t-0">
									<EditorialImage
										src={spotlight.image}
										alt={spotlight.title}
										ratio="square"
										testId="featured-block-image"
									/>
									<ul className="mt-6 space-y-3">
										{spotlight.highlights.slice(0, 3).map((item) => (
											<li key={item} className="flex gap-3">
												<span
													className="mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent"
													aria-hidden="true"
												/>
												<span className="text-[13px] leading-relaxed text-foreground">
													{item}
												</span>
											</li>
										))}
									</ul>
								</div>
							</div>
						</article>
					</Reveal>

					{/* Programme index — stacked editorial rows, not a card grid */}
					<Section>
						<CmsSectionBox
							preview={preview}
							sectionType="academics"
							onSelect={onSelectSection}
							testId="cms-section-hit-courses-academics"
						>
							<SectionHeading
								eyebrow={
									str(academicsSection, "programmeIndexEyebrow") ||
									"Programme index"
								}
								title={
									str(academicsSection, "title") ||
									`${levelPrograms.length} programmes at ${level.short}`
								}
								description={
									str(academicsSection, "body") ||
									"Each row opens into the full subject list, credit hours, fee table and progression routes for that programme."
								}
								testId="program-index-title"
							/>
						</CmsSectionBox>
						<Accordion
							type="single"
							collapsible
							className="mt-8 border-y border-border bg-transparent"
							data-testid="program-index"
						>
							{levelPrograms.map((program) => (
								<AccordionItem
									key={program.id}
									value={program.id}
									data-testid="program-row"
									className="border-b border-rule-soft last:border-b-0"
								>
									<AccordionTrigger className="!border-0 !border-none !outline-none !ring-0 !shadow-none bg-transparent gap-4 py-5 text-left hover:no-underline [&[data-state=open]>svg]:text-accent">
										<div className="grid min-w-0 flex-1 gap-1 text-left sm:grid-cols-[108px_1fr] sm:items-baseline sm:gap-x-5">
											<span className="t-meta">{program.code}</span>
											<span className="min-w-0">
												<span className="block font-display text-[17px] font-semibold leading-snug text-foreground">
													{program.title}
												</span>
												{program.stream ? (
													<span className="mt-1 block t-caption">
														{program.stream}
													</span>
												) : null}
											</span>
										</div>
										<div className="hidden shrink-0 items-center gap-7 pr-3 lg:flex">
											<span className="t-meta">{program.duration}</span>
											<span className="t-meta">
												{program.seats} {txt("seatsSuffix", "seats")}
											</span>
										</div>
									</AccordionTrigger>
									<AccordionContent className="bg-transparent pb-10 pt-1">
										<ProgramDetail
											program={program}
											feeNote={str(academicsSection, "feeNote")}
											pathwaysEmpty={str(academicsSection, "pathwaysEmpty")}
											labels={programLabels}
										/>
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</Section>

					{/* Weekly routine lives on the calendar; this page only links to it. */}
					<Section>
						<SectionHeading
							eyebrow={str(academicsSection, "routineEyebrow") || "Timetable"}
							title={
								str(academicsSection, "routineTitlePrefix") ||
								"Weekly timetable"
							}
							description={
								str(academicsSection, "routineDescription") ||
								"The published section timetable, as it runs from Sunday to Friday."
							}
							testId="routine-section-title"
						/>
						<div className="mt-8">
							<Link
								to="/calendar"
								search={{ routine: spotlight.routineKey }}
								data-testid="courses-see-timetable"
								className="inline-flex min-h-11 items-center gap-2 rounded-field border border-border px-5 py-3 text-[13px] font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
							>
								See the {routineByKey(spotlight.routineKey)?.label ?? "section"}{" "}
								timetable
								<ArrowUpRight className="h-3.5 w-3.5" />
							</Link>
						</div>
					</Section>
				</div>
			</div>
		</PageFrame>
	);
}
