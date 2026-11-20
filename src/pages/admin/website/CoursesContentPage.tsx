import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	CloudUpload,
	ExternalLink,
	Loader2,
	MousePointerClick,
	Pin,
	PinOff,
	Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { str } from "#/components/cms/block-fields";
import { SectionEditor } from "#/components/cms/SectionEditor";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import {
	levelsFromFields,
	levels as staticLevels,
	programs as staticPrograms,
} from "#/lib/programs";
import { routinesFromFields } from "#/lib/routines";
import {
	getWebsitePage,
	publishPage,
	saveSectionFields,
	unpublishPage,
} from "#/lib/website-admin-api";
import { getProgramsServer } from "#/packages/content/server/content";
import {
	pinProgramServer,
	saveProgramServer,
} from "#/packages/content/server/mutations";
import {
	ProgrammeTabEditor,
	type ProgrammeTabKey,
} from "#/pages/admin/website/ProgrammeTabEditor";
import { RoutineEditor } from "#/pages/admin/website/RoutineEditor";
import { useAuth } from "#/providers/AuthProvider";
import type { BlockType, Program, Routine, WebsitePageKey } from "#/types";

type SkeletonBlockKey =
	| "header"
	| "meta"
	| "levels"
	| "spotlight"
	| "index"
	| "overview"
	| "subjects"
	| "fees"
	| "pathways"
	| "routine";

interface BlockDefinition {
	key: SkeletonBlockKey;
	label: string;
	hint: string;
	/** Which fixed CMS section holds this block's copy. */
	section: BlockType;
	/** Fields shown when this block is selected; omit for all fields. */
	fields?: string[];
}

const PAGE_KEY: WebsitePageKey = "courses";

const BLOCKS: BlockDefinition[] = [
	{
		key: "header",
		label: "Page header",
		hint: "Eyebrow, title and the intro paragraph under it.",
		section: "headline",
	},
	{
		key: "meta",
		label: "Header meta & prospectus",
		hint: "The fact strip and the academic prospectus button.",
		section: "academics",
		fields: [
			"metaProgrammesLabel",
			"metaProgrammesValue",
			"metaLevelsLabel",
			"metaLevelsValue",
			"metaStreamsLabel",
			"metaStreamsValue",
			"metaSessionLabel",
			"metaSessionValue",
			"prospectusLabel",
			"prospectusMeta",
			"prospectusStamp",
		],
	},
	{
		key: "levels",
		label: "Level rail & level copy",
		hint: "The level switcher labels, level metadata and each level's tagline and description.",
		section: "academics",
		fields: [
			"chooseLevelLabel",
			"levelAriaLabel",
			"levelGradesLabel",
			"levelBoardLabel",
			"levelProgrammesLabel",
			"levelSeatsLabel",
			"levels",
		],
	},
	{
		key: "spotlight",
		label: "Most-chosen programme",
		hint: "The pinned programme card and its labels. Pin a programme from this block.",
		section: "academics",
		fields: [
			"featuredEyebrow",
			"spotlightDurationLabel",
			"spotlightSeatsLabel",
			"spotlightMediumLabel",
			"spotlightProspectusLabel",
			"spotlightProspectusMeta",
		],
	},
	{
		key: "index",
		label: "Programme index",
		hint: "The index heading and the seats suffix on each programme row.",
		section: "academics",
		fields: ["title", "body", "programmeIndexEyebrow", "seatsSuffix"],
	},
	{
		key: "overview",
		label: "Overview tab",
		hint: "Tab label, the profile labels and the programme prospectus button.",
		section: "academics",
		fields: [
			"tabOverview",
			"eligibilityLabel",
			"mediumLabel",
			"durationLabel",
			"boardLabel",
			"distinctiveLabel",
			"programmeProspectusLabel",
			"programmeProspectusMeta",
		],
	},
	{
		key: "subjects",
		label: "Subjects tab",
		hint: "Tab label and the subject table headings.",
		section: "academics",
		fields: [
			"tabSubjects",
			"subjectCodeLabel",
			"subjectNameLabel",
			"subjectCreditLabel",
			"subjectTypeLabel",
			"totalCreditLabel",
		],
	},
	{
		key: "fees",
		label: "Fees tab",
		hint: "Tab label, fee table headings, totals and the fee disclaimer.",
		section: "academics",
		fields: [
			"tabFees",
			"feeParticularLabel",
			"feeAmountLabel",
			"feeFrequencyLabel",
			"annualChargesLabel",
			"monthlyTuitionLabel",
			"feeNote",
		],
	},
	{
		key: "pathways",
		label: "Pathways tab",
		hint: "Tab label, the empty-state copy and the learning-outcomes heading.",
		section: "academics",
		fields: ["tabPathways", "pathwaysEmpty", "learningOutcomesLabel"],
	},
	{
		key: "routine",
		label: "Weekly routine",
		hint: "Routine wording and every published routine grid.",
		section: "academics",
		fields: [
			"routineEyebrow",
			"routineTitlePrefix",
			"routineDescription",
			"routineShiftLabel",
			"routineRoomsLabel",
			"routineEffectiveFromLabel",
			"routineShowOnlyPrefix",
			"routineShowFullWeek",
			"routinePdfLabel",
			"routineNowLabel",
			"routinePeriodPrefix",
			"routineNoPeriodText",
			"routineHolidayText",
			"routineDayLabel",
			"routineTodayLabel",
			"routineCaptionSuffix",
			"routineFooter",
			"routines",
		],
	},
];

function blockDefinition(key: SkeletonBlockKey) {
	return BLOCKS.find((block) => block.key === key) ?? BLOCKS[0];
}

function tabSummary(
	key: ProgrammeTabKey,
	programme: Program | undefined,
): string {
	if (!programme) return "Add a programme record to edit this tab.";
	switch (key) {
		case "overview":
			return programme.description || "No overview copy yet.";
		case "subjects": {
			const credits = programme.subjects.reduce(
				(sum, subject) => sum + subject.credit,
				0,
			);
			return `${programme.subjects.length} subjects · ${credits} credit hours`;
		}
		case "fees":
			return `${programme.fees.length} fee lines · ${
				programme.fees.filter((fee) => fee.frequency === "Annual").length
			} annual`;
		case "pathways":
			return `${programme.careers.length} career pathways · ${programme.outcomes.length} learning outcomes`;
	}
}

function isProgrammeTab(key: SkeletonBlockKey): key is ProgrammeTabKey {
	return (
		key === "overview" ||
		key === "subjects" ||
		key === "fees" ||
		key === "pathways"
	);
}

export default function CoursesContentPage() {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const canPin = can("courses.manage");
	const qc = useQueryClient();

	const [selectedKey, setSelectedKey] = useState<SkeletonBlockKey | null>(
		"header",
	);
	const [programmeId, setProgrammeId] = useState<string | null>(null);
	const [levelId, setLevelId] = useState<string>(
		staticLevels.find((level) => level.id === "plus2-science")?.id ??
			staticLevels[0]?.id ??
			"plus2-science",
	);

	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", PAGE_KEY],
		queryFn: () => getWebsitePage(PAGE_KEY),
	});

	const { data: programs = [] } = useQuery({
		queryKey: ["programs"],
		queryFn: () => getProgramsServer(),
	});

	const headline = useMemo(
		() => ({
			...sectionDefaults("headline", "courses"),
			...getSectionFields(page?.blocks, "headline"),
		}),
		[page],
	);

	const academics = useMemo(
		() => ({
			...sectionDefaults("academics"),
			...getSectionFields(page?.blocks, "academics"),
		}),
		[page],
	);

	const txt = (key: string, fallback = "") => str(academics, key) || fallback;

	const routines = useMemo<Routine[]>(
		() => routinesFromFields(academics),
		[academics],
	);

	const levelOptions = useMemo(
		() =>
			levelsFromFields(academics).map((level) => ({
				id: level.id,
				label: level.label,
			})),
		[academics],
	);

	const activeLevel =
		levelOptions.find((level) => level.id === levelId) ?? levelOptions[0];

	const levelPrograms: Program[] = useMemo(
		() => (programs as Program[]).filter((p) => p.level === levelId),
		[programs, levelId],
	);

	const fallbackLevelPrograms = useMemo(
		() =>
			(staticPrograms as Program[]).filter(
				(program) => program.level === levelId,
			),
		[levelId],
	);

	const pinnedInDb = (program: Program | undefined) =>
		Boolean(program && levelPrograms.some((item) => item.id === program.id));

	const spotlight =
		levelPrograms.find((program) => program.spotlight) ??
		levelPrograms[0] ??
		fallbackLevelPrograms.find((program) => program.spotlight) ??
		fallbackLevelPrograms[0];

	const programme =
		levelPrograms.find((item) => item.id === programmeId) ??
		levelPrograms.find((item) => item.spotlight) ??
		levelPrograms[0];

	const selectedBlock = selectedKey ? blockDefinition(selectedKey) : null;
	const selectedFields =
		selectedBlock?.section === "headline" ? headline : academics;

	const saveMutation = useMutation({
		mutationFn: ({
			section,
			fields,
		}: {
			section: BlockType;
			fields: Record<string, unknown>;
		}) => saveSectionFields(PAGE_KEY, section, fields, actor),
		onSuccess: (next) => {
			qc.setQueryData(["website-page", PAGE_KEY], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success("Section saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const saveProgrammeMutation = useMutation({
		mutationFn: (next: Program) =>
			saveProgramServer({
				data: {
					...next,
					stream: next.stream ?? null,
					spotlight: Boolean(next.spotlight),
					order: next.order ?? 0,
				},
			}),
		onSuccess: (_saved, next) => {
			qc.invalidateQueries({ queryKey: ["programs"] });
			qc.invalidateQueries({ queryKey: ["content"] });
			setProgrammeId(next.id);
			toast.success("Programme content saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const pinMutation = useMutation({
		mutationFn: ({ id, spotlight: pin }: { id: string; spotlight: boolean }) =>
			pinProgramServer({ data: { id, spotlight: pin } }),
		onSuccess: (_program, variables) => {
			qc.invalidateQueries({ queryKey: ["programs"] });
			qc.invalidateQueries({ queryKey: ["content"] });
			toast.success(
				variables.spotlight ? "Programme pinned" : "Programme unpinned",
			);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPage(PAGE_KEY, actor),
		onSuccess: (next) => {
			qc.setQueryData(["website-page", PAGE_KEY], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success("Courses page is live");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(PAGE_KEY, actor),
		onSuccess: (next) => {
			qc.setQueryData(["website-page", PAGE_KEY], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success("Courses page reverted to draft");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const selectBlock = (key: SkeletonBlockKey) => setSelectedKey(key);

	return (
		<div data-testid="courses-content-page">
			<PageHeader
				eyebrow="Website"
				title="Courses Page"
				description="Double-click any block in the page skeleton to edit exactly that part of the public courses page. Programme, subject and fee records still live under Programmes."
				meta={
					page ? (
						<>
							<StatusBadge value={page.status} testId="page-content-status" />
							{page.hasUnpublishedChanges && (
								<span className="inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent">
									Unpublished changes
								</span>
							)}
							<span className="font-mono text-[11px]">{page.path}</span>
						</>
					) : null
				}
				actions={
					<>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							onClick={() =>
								window.open("/courses?cms=1", "_blank", "noopener,noreferrer")
							}
						>
							<ExternalLink className="h-3.5 w-3.5" /> View page
						</Button>
						{canManage && page?.status === "published" && (
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={unpublishMutation.isPending}
								onClick={() => unpublishMutation.mutate()}
							>
								<Undo2 className="h-3.5 w-3.5" /> Unpublish
							</Button>
						)}
						{canManage && (
							<Button
								size="sm"
								className="gap-1.5"
								disabled={publishMutation.isPending}
								onClick={() => publishMutation.mutate()}
							>
								<CloudUpload className="h-3.5 w-3.5" />
								{publishMutation.isPending ? "Publishing…" : "Publish"}
							</Button>
						)}
					</>
				}
			/>

			{isLoading ? (
				<div className="grid gap-5 lg:grid-cols-12">
					<div className="lg:col-span-7">
						<PanelSkeleton height="h-[36rem]" />
					</div>
					<div className="lg:col-span-5">
						<PanelSkeleton height="h-[36rem]" />
					</div>
				</div>
			) : !page ? (
				<div className="panel">
					<EmptyState
						icon={MousePointerClick}
						title="Preparing page…"
						description="The public page content model is being initialized."
						actionLabel="Reload"
						onAction={() =>
							qc.invalidateQueries({ queryKey: ["website-page", PAGE_KEY] })
						}
					/>
				</div>
			) : (
				<div className="grid gap-5 lg:grid-cols-12">
					{/* Page skeleton — a wireframe of the public page */}
					<div className="lg:col-span-7">
						<Panel
							eyebrow="Page skeleton"
							title="Courses page"
							description="Double-click a block to edit it. The selected block opens on the right."
							bodyClassName="p-4"
						>
							<div className="space-y-3">
								<SkeletonBlock
									blockKey="header"
									label="Page header"
									selected={selectedKey}
									saved={page.blocks.some((block) => block.type === "headline")}
									onSelect={selectBlock}
								>
									<p className="t-eyebrow">
										{str(headline, "eyebrow") || "Academics"}
									</p>
									<h3 className="mt-1 font-display text-xl font-semibold text-foreground">
										{str(headline, "title") || "Courses & Academic Programmes"}
									</h3>
									<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
										{str(headline, "body") ||
											"Subject lists, credit hours, fee structures and weekly routines."}
									</p>
								</SkeletonBlock>

								<SkeletonBlock
									blockKey="meta"
									label="Header meta & prospectus"
									selected={selectedKey}
									saved={page.blocks.some(
										(block) => block.type === "academics",
									)}
									onSelect={selectBlock}
								>
									<div className="flex flex-wrap gap-1.5">
										{[
											`${txt("metaProgrammesLabel", "Programmes")}: ${
												txt("metaProgrammesValue") || programs.length || "—"
											}`,
											`${txt("metaLevelsLabel", "Levels")}: ${
												txt("metaLevelsValue") || levelOptions.length
											}`,
											`${txt("metaStreamsLabel", "+2 streams")}: ${txt(
												"metaStreamsValue",
												"—",
											)}`,
											`${txt("metaSessionLabel", "Session")}: ${txt(
												"metaSessionValue",
												"—",
											)}`,
										].map((chip) => (
											<span
												key={chip}
												className="rounded-full border border-hairline bg-surface-1 px-2 py-0.5 text-[10px] text-muted-foreground"
											>
												{chip}
											</span>
										))}
										<span className="rounded-full border border-dashed border-hairline px-2 py-0.5 text-[10px] text-muted-foreground">
											{txt("prospectusLabel", "Full academic prospectus")}
										</span>
									</div>
								</SkeletonBlock>

								<div className="grid gap-3 sm:grid-cols-[150px_1fr]">
									<SkeletonBlock
										blockKey="levels"
										label="Level rail"
										selected={selectedKey}
										saved={page.blocks.some(
											(block) => block.type === "academics",
										)}
										onSelect={selectBlock}
									>
										<ul className="space-y-1">
											{levelOptions.map((level) => (
												<li key={level.id}>
													<button
														type="button"
														onClick={() => setLevelId(level.id)}
														className={[
															"w-full rounded-md px-2 py-1.5 text-left text-[11px] transition-colors",
															level.id === levelId
																? "bg-accent/12 font-medium text-foreground"
																: "text-muted-foreground hover:bg-surface-2",
														].join(" ")}
													>
														{level.label}
													</button>
												</li>
											))}
										</ul>
									</SkeletonBlock>

									<div className="space-y-3">
										<SkeletonBlock
											blockKey="spotlight"
											label="Most-chosen programme"
											selected={selectedKey}
											saved={page.blocks.some(
												(block) => block.type === "academics",
											)}
											onSelect={selectBlock}
										>
											<p className="t-eyebrow">
												{txt(
													"featuredEyebrow",
													"Most-chosen programme at this level",
												)}
											</p>
											<div className="mt-1 flex flex-wrap items-center justify-between gap-2">
												<h4 className="font-display text-base font-semibold text-foreground">
													{spotlight?.title ?? "No programme at this level yet"}
												</h4>
												{spotlight && canPin ? (
													<Button
														variant={spotlight.spotlight ? "outline" : "ghost"}
														size="sm"
														className="h-6 gap-1 px-2 text-[10px]"
														disabled={
															pinMutation.isPending || !pinnedInDb(spotlight)
														}
														onClick={(
															event: React.MouseEvent<HTMLButtonElement>,
														) => {
															event.stopPropagation();
															pinMutation.mutate({
																id: spotlight.id,
																spotlight: !spotlight.spotlight,
															});
														}}
													>
														{spotlight.spotlight ? (
															<>
																<PinOff className="h-3 w-3" /> Unpin
															</>
														) : (
															<>
																<Pin className="h-3 w-3" /> Pin
															</>
														)}
													</Button>
												) : null}
											</div>
											<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
												{spotlight?.summary ??
													"Add a programme to see the card."}
											</p>
											<div className="mt-2 grid grid-cols-3 gap-1.5">
												{[
													["Duration", spotlight?.duration],
													["Seats", spotlight?.seats],
													["Medium", spotlight?.medium],
												].map(([label, value]) => (
													<div
														key={String(label)}
														className="rounded-md border border-hairline bg-surface-1 px-2 py-1"
													>
														<p className="text-[9px] uppercase tracking-wider text-muted-foreground">
															{label}
														</p>
														<p className="truncate text-[11px] text-foreground">
															{value || "—"}
														</p>
													</div>
												))}
											</div>
											<p className="mt-2 text-[10px] text-muted-foreground">
												Showing {activeLevel?.label ?? levelId} ·{" "}
												{levelPrograms.length} programme
												{levelPrograms.length === 1 ? "" : "s"} in the database
											</p>
										</SkeletonBlock>

										<SkeletonBlock
											blockKey="index"
											label="Programme index"
											selected={selectedKey}
											saved={page.blocks.some(
												(block) => block.type === "academics",
											)}
											onSelect={selectBlock}
										>
											<p className="t-eyebrow">
												{txt("programmeIndexEyebrow", "Programme index")}
											</p>
											<h4 className="mt-1 font-display text-base font-semibold text-foreground">
												{txt("title", "Programme index")}
											</h4>
											<p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
												{txt(
													"body",
													"Each row opens into the full programme detail.",
												)}
											</p>
											<ul className="mt-2 divide-y divide-hairline rounded-md border border-hairline">
												{(levelPrograms.length > 0
													? levelPrograms
													: fallbackLevelPrograms
												)
													.slice(0, 3)
													.map((program) => (
														<li
															key={program.id ?? program.code}
															className="flex items-center justify-between gap-2 px-2 py-1.5"
														>
															<span className="truncate text-[11px] text-foreground">
																<span className="font-mono text-[10px] text-muted-foreground">
																	{program.code}
																</span>{" "}
																{program.title}
															</span>
															<span className="shrink-0 text-[10px] text-muted-foreground">
																{program.seats} {txt("seatsSuffix", "seats")}
															</span>
														</li>
													))}
											</ul>
										</SkeletonBlock>
									</div>
								</div>

								<div className="rounded-lg border border-hairline bg-surface-1 p-2">
									<div className="mb-2 flex flex-wrap items-center justify-between gap-2">
										<span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
											Programme detail tabs
										</span>
										{levelPrograms.length > 0 && programme ? (
											<Select
												value={programme.id}
												onValueChange={(value: string) => setProgrammeId(value)}
											>
												<SelectTrigger className="h-7 w-[220px] text-[11px]">
													<SelectValue placeholder="Choose programme" />
												</SelectTrigger>
												<SelectContent>
													{levelPrograms.map((item) => (
														<SelectItem key={item.id} value={item.id}>
															{item.title}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										) : null}
									</div>
									<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
										{(
											[
												["overview", "tabOverview", "Overview"],
												["subjects", "tabSubjects", "Subjects"],
												["fees", "tabFees", "Fees"],
												["pathways", "tabPathways", "Pathways"],
											] as const
										).map(([key, labelKey, fallback]) => (
											<SkeletonBlock
												key={key}
												blockKey={key}
												label="Programme detail tab"
												selected={selectedKey}
												saved={page.blocks.some(
													(block) => block.type === "academics",
												)}
												onSelect={selectBlock}
												compact
											>
												<p className="text-[11px] font-medium text-foreground">
													{txt(labelKey, fallback)}
												</p>
												<p className="mt-1 line-clamp-2 text-[9px] leading-tight text-muted-foreground">
													{tabSummary(key, programme)}
												</p>
											</SkeletonBlock>
										))}
									</div>
								</div>

								<SkeletonBlock
									blockKey="routine"
									label="Weekly routine"
									selected={selectedKey}
									saved={page.blocks.some(
										(block) => block.type === "academics",
									)}
									onSelect={selectBlock}
								>
									<p className="t-eyebrow">
										{txt("routineEyebrow", "Timetable")}
									</p>
									<h4 className="mt-1 font-display text-base font-semibold text-foreground">
										{txt("routineTitlePrefix", "Weekly routine")} ·{" "}
										{routines.length} sections
									</h4>
									<div className="mt-2 flex flex-wrap gap-1">
										{routines.map((routine) => (
											<span
												key={routine.key}
												className="rounded border border-hairline px-1.5 py-0.5 text-[9px] text-muted-foreground"
											>
												{routine.label || routine.key}
											</span>
										))}
									</div>
									<div className="mt-2 overflow-hidden rounded-md border border-hairline">
										<div className="grid grid-cols-6 bg-surface-2">
											{["Day", "P1", "P2", "P3", "P4", "P5"].map((cell) => (
												<span
													key={cell}
													className="px-1.5 py-1 text-center text-[9px] uppercase tracking-wider text-muted-foreground"
												>
													{cell}
												</span>
											))}
										</div>
										{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
											<div
												key={day}
												className="grid grid-cols-6 border-t border-hairline"
											>
												<span className="px-1.5 py-1 text-[10px] font-medium text-foreground">
													{day}
												</span>
												{Array.from({ length: 5 }).map((_, index) => (
													<span
														// biome-ignore lint/suspicious/noArrayIndexKey: skeleton grid cells are positional
														key={index}
														className="border-l border-hairline px-1.5 py-1 text-[10px] text-muted-foreground"
													>
														—
													</span>
												))}
											</div>
										))}
									</div>
								</SkeletonBlock>
							</div>

							<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-hairline pt-3">
								<Link
									to="/admin/programmes"
									className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-accent"
								>
									Manage programme records
									<ExternalLink className="h-3 w-3" />
								</Link>
								<p className="text-[10px] text-muted-foreground">
									Double-click a tab to edit that programme content and its
									labels.
								</p>
							</div>
						</Panel>
					</div>

					{/* Block editor */}
					<div className="space-y-4 lg:col-span-5">
						{selectedBlock ? (
							<>
								{selectedBlock.key === "spotlight" && canPin ? (
									<PinPanel
										levels={levelOptions}
										levelId={levelId}
										programs={programs as Program[]}
										busy={pinMutation.isPending}
										onLevelChange={setLevelId}
										onPin={(program) =>
											pinMutation.mutate({
												id: program.id,
												spotlight: !program.spotlight,
											})
										}
									/>
								) : null}
								{selectedBlock.key === "routine" ? (
									<RoutineEditor
										routines={routines}
										canManage={canManage}
										saving={saveMutation.isPending}
										onSave={(next) =>
											saveMutation.mutate({
												section: "academics",
												fields: { ...academics, routines: next },
											})
										}
									/>
								) : null}
								{isProgrammeTab(selectedBlock.key) && programme ? (
									<ProgrammeTabEditor
										tab={selectedBlock.key}
										program={programme}
										canManage={canPin}
										saving={saveProgrammeMutation.isPending}
										onSave={(next) => saveProgrammeMutation.mutate(next)}
									/>
								) : null}
								<SectionEditor
									key={selectedBlock.key}
									sectionType={selectedBlock.section}
									fields={selectedFields}
									canManage={canManage}
									saving={saveMutation.isPending}
									onlyKeys={selectedBlock.fields}
									title={
										isProgrammeTab(selectedBlock.key)
											? `${selectedBlock.label} labels & headings`
											: selectedBlock.label
									}
									onSave={(fields) =>
										saveMutation.mutate({
											section: selectedBlock.section,
											fields,
										})
									}
								/>
								<p className="px-1 text-[11px] text-muted-foreground">
									{selectedBlock.hint}
								</p>
							</>
						) : (
							<Panel
								eyebrow="Block editor"
								title="Nothing selected"
								testId="courses-block-editor-empty"
							>
								<EmptyState
									compact
									icon={MousePointerClick}
									title="Double-click a block to edit it"
									description="Every part of the courses page opens its own focused editor."
								/>
							</Panel>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function SkeletonBlock({
	blockKey,
	label,
	selected,
	saved,
	onSelect,
	children,
	compact = false,
}: {
	blockKey: SkeletonBlockKey;
	label: string;
	selected: SkeletonBlockKey | null;
	saved: boolean;
	onSelect: (key: SkeletonBlockKey) => void;
	children: React.ReactNode;
	compact?: boolean;
}) {
	const active = selected === blockKey;
	const definition = blockDefinition(blockKey);
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: the block also exposes a keyboard-reachable Edit button
		// biome-ignore lint/a11y/useKeyWithClickEvents: the block also exposes a keyboard-reachable Edit button
		<div
			onDoubleClick={() => onSelect(blockKey)}
			onClick={() => onSelect(blockKey)}
			title={`Double-click to edit ${definition.label}`}
			data-testid={`courses-skeleton-${blockKey}`}
			className={[
				"relative w-full cursor-pointer rounded-lg border text-left transition-colors",
				compact ? "p-2" : "p-3",
				active
					? "border-accent bg-accent/[0.06]"
					: "border-hairline bg-surface-1 hover:border-accent/50 hover:bg-surface-2",
			].join(" ")}
		>
			<div className="mb-1.5 flex items-center justify-between gap-2">
				<span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
					{definition.label}
				</span>
				<span className="flex items-center gap-1">
					<span
						className={[
							"rounded-full px-1.5 py-0.5 text-[9px]",
							saved
								? "bg-accent/14 text-accent"
								: "border border-dashed border-hairline text-muted-foreground",
						].join(" ")}
					>
						{saved ? "Saved" : "Default"}
					</span>
					<button
						type="button"
						aria-label={`Edit ${label}`}
						onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
							event.stopPropagation();
							onSelect(blockKey);
						}}
						className={[
							"rounded p-0.5 transition-colors",
							active
								? "text-accent"
								: "text-muted-foreground hover:text-accent",
						].join(" ")}
					>
						<MousePointerClick className="h-3 w-3" />
					</button>
				</span>
			</div>
			<div>{children}</div>
		</div>
	);
}

function PinPanel({
	levels,
	levelId,
	programs,
	busy,
	onLevelChange,
	onPin,
}: {
	levels: Array<{ id: string; label: string }>;
	levelId: string;
	programs: Program[];
	busy: boolean;
	onLevelChange: (level: string) => void;
	onPin: (program: Program) => void;
}) {
	const levelPrograms = programs.filter((program) => program.level === levelId);

	return (
		<Panel
			eyebrow="Pin"
			title="Most-chosen programme"
			description="Pin one programme per level. It becomes the featured card at the top of that level's public page."
			testId="courses-pin-panel"
		>
			<div className="mb-3 flex flex-wrap gap-1.5">
				{levels.map((level) => (
					<button
						key={level.id}
						type="button"
						onClick={() => onLevelChange(level.id)}
						className={[
							"rounded-full border px-2.5 py-1 text-[11px] transition-colors",
							level.id === levelId
								? "border-accent bg-accent/12 text-foreground"
								: "border-hairline text-muted-foreground hover:bg-surface-2",
						].join(" ")}
					>
						{level.label}
					</button>
				))}
			</div>

			{levelPrograms.length === 0 ? (
				<p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
					No programme records at this level yet.{" "}
					<Link
						to="/admin/programmes"
						className="font-medium text-foreground underline-offset-2 hover:underline"
					>
						Add one
					</Link>
					.
				</p>
			) : (
				<ul className="space-y-1.5">
					{levelPrograms.map((program) => (
						<li
							key={program.id}
							className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-2 px-2.5 py-2"
						>
							<span className="min-w-0">
								<span className="block truncate text-[12px] font-medium text-foreground">
									{program.title}
								</span>
								<span className="block truncate font-mono text-[10px] text-muted-foreground">
									{program.code}
								</span>
							</span>
							<Button
								variant={program.spotlight ? "outline" : "ghost"}
								size="sm"
								className="h-7 shrink-0 gap-1 px-2 text-[10px]"
								disabled={busy}
								onClick={() => onPin(program)}
							>
								{program.spotlight ? (
									<>
										<PinOff className="h-3 w-3" /> Unpin
									</>
								) : (
									<>
										<Pin className="h-3 w-3" /> Pin
									</>
								)}
							</Button>
						</li>
					))}
				</ul>
			)}
			{busy ? (
				<p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
					<Loader2 className="h-3 w-3 animate-spin" /> Saving pin…
				</p>
			) : null}
		</Panel>
	);
}
