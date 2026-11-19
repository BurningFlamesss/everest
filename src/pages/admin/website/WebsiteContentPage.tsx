import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import {
	ArrowUpRight,
	CloudUpload,
	Database,
	ExternalLink,
	Globe,
	Info,
	Pencil,
	RefreshCw,
	Search,
	Undo2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionEditor } from "#/components/cms/SectionEditor";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import {
	type CmsPageKey,
	pageSectionTypes,
	sectionDefaults,
	sectionLabel,
} from "#/lib/cms-sections";
import { formatDateTime, relativeTime } from "#/lib/format";
import { cn } from "#/lib/utils";
import {
	getWebsitePage,
	listWebsitePages,
	publishPage,
	saveSectionFields,
	unpublishPage,
	updatePageSeo,
} from "#/lib/website-admin-api";
import { useAuth } from "#/providers/AuthProvider";
import type { BlockType, WebsitePage, WebsitePageKey } from "#/types";

export interface PublicPageMeta {
	key: WebsitePageKey;
	title: string;
	path: string;
	group:
		| "Core & Institutional"
		| "Academics & Admissions"
		| "Campus Life & Community"
		| "Portal & Authentication";
	description: string;
	dedicatedCms?: {
		label: string;
		to: string;
		description: string;
	};
}

export const PUBLIC_PAGES: PublicPageMeta[] = [
	{
		key: "home",
		title: "Home",
		path: "/",
		group: "Core & Institutional",
		description:
			"Landing page, scroll hero footage, institution facts, and section headings",
	},
	{
		key: "about",
		title: "About Us",
		path: "/about",
		group: "Core & Institutional",
		description:
			"School heritage, mission & vision, leadership, and institutional chapters",
		dedicatedCms: {
			label: "About Page Editor",
			to: "/admin/about",
			description:
				"Edit the about header and every chapter, stat and gallery in a focused editor",
		},
	},
	{
		key: "contact",
		title: "Contact Us",
		path: "/contact",
		group: "Core & Institutional",
		description:
			"Contact details, office hours, departmental directory, map embed, and socials",
	},
	{
		key: "facilities",
		title: "Facilities",
		path: "/facilities",
		group: "Core & Institutional",
		description: "Campus facilities heading and spaces",
		dedicatedCms: {
			label: "Facilities Records",
			to: "/admin/facilities",
			description:
				"Manage physical rooms, laboratories, hostels, and facility specifications",
		},
	},
	{
		key: "faculty",
		title: "Faculty & Administration",
		path: "/faculty",
		group: "Core & Institutional",
		description: "Leadership headings and faculty directory copy",
		dedicatedCms: {
			label: "Staff Directory CMS",
			to: "/admin/staff",
			description:
				"Manage teacher profiles, qualifications, and department roles",
		},
	},
	{
		key: "courses",
		title: "Courses & Programmes",
		path: "/courses",
		group: "Academics & Admissions",
		description:
			"Academic levels, curriculum overviews, fee tables, and programme index",
		dedicatedCms: {
			label: "Courses Page Editor",
			to: "/admin/courses",
			description:
				"Edit level copy, headings and page notes; subject records live under Subjects & Programmes",
		},
	},
	{
		key: "course_finder",
		title: "Course Finder",
		path: "/course-finder",
		group: "Academics & Admissions",
		description:
			"Interactive stream guidance questions and recommendations header",
	},
	{
		key: "admissions",
		title: "Admissions",
		path: "/admissions",
		group: "Academics & Admissions",
		description:
			"Admissions banner, application steps guide, and call to action",
		dedicatedCms: {
			label: "Admissions Desk",
			to: "/admin/admissions",
			description: "Review applicant submissions, statuses, and documents",
		},
	},
	{
		key: "scholarship",
		title: "Scholarships",
		path: "/scholarship",
		group: "Academics & Admissions",
		description:
			"Scholarship scheme guidelines, criteria overview, and application instructions",
		dedicatedCms: {
			label: "Scholarships CMS",
			to: "/admin/scholarships",
			description: "Configure scholarship quotas, grants, and eligibility",
		},
	},
	{
		key: "calendar",
		title: "Academic Calendar",
		path: "/calendar",
		group: "Academics & Admissions",
		description:
			"Bikram Sambat (BS) & Gregorian (AD) academic schedule and term dates",
		dedicatedCms: {
			label: "Calendar Events CMS",
			to: "/admin/calendar",
			description:
				"Add, edit, or delete school holidays, exam dates, and academic terms",
		},
	},
	{
		key: "result",
		title: "Board Results",
		path: "/result",
		group: "Academics & Admissions",
		description: "SEE and +2 board performance charts and historical metrics",
		dedicatedCms: {
			label: "Board Results Ledger",
			to: "/admin/results",
			description: "Manage examination results and division score sheets",
		},
	},
	{
		key: "clubs",
		title: "Clubs & Activities",
		path: "/clubs",
		group: "Campus Life & Community",
		description: "Extracurricular student clubs and society announcements",
		dedicatedCms: {
			label: "Clubs CMS",
			to: "/admin/clubs",
			description: "Manage student clubs, executives, and club boards",
		},
	},
	{
		key: "events",
		title: "School Events",
		path: "/events",
		group: "Campus Life & Community",
		description:
			"School celebrations, sports meets, exhibitions, and programme schedules",
		dedicatedCms: {
			label: "Events CMS",
			to: "/admin/events",
			description: "Publish school events, dates, images, and schedules",
		},
	},
	{
		key: "gallery",
		title: "Photo Gallery",
		path: "/gallery",
		group: "Campus Life & Community",
		description: "Photo gallery page header and album grid copy",
		dedicatedCms: {
			label: "Gallery CMS",
			to: "/admin/gallery",
			description: "Upload photo albums, tags, and campus imagery",
		},
	},
	{
		key: "notices",
		title: "Notices & Circulars",
		path: "/notices",
		group: "Campus Life & Community",
		description:
			"Official school announcements, circulars, and archive headline",
		dedicatedCms: {
			label: "Notices CMS",
			to: "/admin/notices",
			description: "Create, schedule, pin, and attach PDFs to notices",
		},
	},
	{
		key: "posts",
		title: "Community Timeline / Posts",
		path: "/posts",
		group: "Campus Life & Community",
		description: "Social media and community timeline updates feed headline",
	},
	{
		key: "transportation",
		title: "Transportation",
		path: "/transportation",
		group: "Campus Life & Community",
		description: "Transport office contact details and route finder headline",
		dedicatedCms: {
			label: "Transportation CMS",
			to: "/admin/transportation",
			description: "Manage bus routes, drivers, and pickup points",
		},
	},
	{
		key: "resources",
		title: "Downloads & Resources",
		path: "/resources",
		group: "Campus Life & Community",
		description:
			"Downloadable documents, forms, curriculum guides, and rich text note",
	},
	{
		key: "login",
		title: "Sign In / Portal Entry",
		path: "/login",
		group: "Portal & Authentication",
		description:
			"Visual entrance column, intro copy, sign-in form labels, and support footer",
	},
	{
		key: "activate",
		title: "Account Activation",
		path: "/activate",
		group: "Portal & Authentication",
		description:
			"First-time account activation visual column, intro kicker, and credential setup form",
	},
];

const PAGE_KEYS = PUBLIC_PAGES.map((p) => p.key);

const GROUPS = [
	"Core & Institutional",
	"Academics & Admissions",
	"Campus Life & Community",
	"Portal & Authentication",
] as const;

function clone<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}

export default function WebsiteContentPage() {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();
	const navigate = useNavigate();
	const searchParams =
		(useSearch({ strict: false }) as Record<string, string | undefined>) || {};

	const rawKey = searchParams.page as WebsitePageKey | null;
	const pageKey: WebsitePageKey =
		rawKey && PAGE_KEYS.includes(rawKey) ? rawKey : "home";

	const currentMeta =
		PUBLIC_PAGES.find((p) => p.key === pageKey) ?? PUBLIC_PAGES[0];

	const [selectedType, setSelectedType] = useState<BlockType | null>(null);
	const [iframeVersion, setIframeVersion] = useState(0);
	const [seoOpen, setSeoOpen] = useState(false);
	const [seoDraft, setSeoDraft] = useState({
		title: "",
		description: "",
		keywords: "",
	});

	const { data: pages = [] } = useQuery({
		queryKey: ["website-pages"],
		queryFn: async () => clone(await listWebsitePages()),
	});

	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", pageKey],
		queryFn: async () => {
			const found = await getWebsitePage(pageKey);
			return found ? clone(found) : null;
		},
	});

	useEffect(() => {
		if (pageKey) {
			setSelectedType(null);
		}
	}, [pageKey]);

	useEffect(() => {
		if (page)
			setSeoDraft({
				title: page.seoTitle,
				description: page.seoDescription,
				keywords: page.seoKeywords,
			});
	}, [page]);

	useEffect(() => {
		const onMessage = (event: MessageEvent) => {
			const data = event.data as
				| { source?: string; type?: string; sectionType?: unknown }
				| undefined;
			if (data?.source !== "scms-cms" || data?.type !== "select-section")
				return;
			if (typeof data.sectionType === "string")
				setSelectedType(data.sectionType as BlockType);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);

	const sectionTypes = useMemo(
		() => pageSectionTypes(pageKey as CmsPageKey),
		[pageKey],
	);

	const selectedBlock =
		page?.blocks.find((block) => block.type === selectedType) ?? null;
	// Merge defaults under saved values so sections saved before a field was
	// added still expose (and can edit) the complete field set.
	const selectedFields = useMemo(
		() =>
			selectedType
				? {
						...sectionDefaults(selectedType, pageKey as CmsPageKey),
						...(selectedBlock?.fields ?? {}),
					}
				: undefined,
		[selectedType, selectedBlock, pageKey],
	);

	const applyPage = (next: WebsitePage) => {
		qc.setQueryData(["website-page", next.key], clone(next));
		void qc.invalidateQueries({ queryKey: ["website-pages"] });
		void qc.invalidateQueries({ queryKey: ["overview"] });
		void qc.invalidateQueries({ queryKey: ["activity"] });
	};

	const saveSection = useMutation({
		mutationFn: (fields: Record<string, unknown>) => {
			if (!selectedType) throw new Error("No section selected");
			return saveSectionFields(pageKey, selectedType, fields, actor);
		},
		onSuccess: (next) => {
			applyPage(next);
			setIframeVersion((version) => version + 1);
			toast.success("Section saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const seoMutation = useMutation({
		mutationFn: () => updatePageSeo(pageKey, seoDraft, actor),
		onSuccess: (next) => {
			applyPage(next);
			setSeoOpen(false);
			toast.success("Search settings saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			void qc.invalidateQueries({ queryKey: ["notifications"] });
			toast.success(`${next.title} is live`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			toast.success(`${next.title} reverted to draft`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const changePage = (value: string) => {
		navigate({
			search: (prev: Record<string, unknown>) => ({ ...prev, page: value }),
			replace: true,
		} as never);
	};

	return (
		<div data-testid="website-content-page">
			<PageHeader
				wash
				eyebrow="Website"
				title="Website Content"
				description="Preview each page and click a section to edit its content — changes are saved to the database and shown to visitors after publishing."
				meta={
					page ? (
						<>
							<StatusBadge value={page.status} testId="cms-page-status" />
							{page.hasUnpublishedChanges && (
								<span
									className="inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent"
									data-testid="cms-unpublished-chip"
								>
									Unpublished changes
								</span>
							)}
							<span
								className="font-mono text-[11px]"
								data-testid="cms-page-path"
							>
								{page.path}
							</span>
							<span data-testid="cms-page-updated">
								Updated {relativeTime(page.updatedAt)} by {page.updatedBy}
							</span>
							<span data-testid="cms-page-published">
								{page.publishedAt
									? `Published ${formatDateTime(page.publishedAt)}`
									: "Never published"}
							</span>
						</>
					) : null
				}
				actions={
					<>
						<Button
							variant="outline"
							size="sm"
							className="gap-1.5"
							data-testid="cms-seo-open"
							onClick={() => setSeoOpen(true)}
						>
							<Search className="h-3.5 w-3.5" /> Search settings
						</Button>
						{canManage && page?.status === "published" && (
							<Button
								variant="outline"
								size="sm"
								className="gap-1.5"
								disabled={unpublishMutation.isPending}
								data-testid="cms-unpublish-button"
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
								data-testid="cms-publish-button"
								onClick={() => publishMutation.mutate()}
							>
								<CloudUpload className="h-3.5 w-3.5" />
								{publishMutation.isPending ? "Publishing…" : "Publish"}
							</Button>
						)}
					</>
				}
			/>

			<div className="mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col sm:flex-row sm:items-center gap-3">
					<Select value={pageKey} onValueChange={changePage}>
						<SelectTrigger className="w-[320px]" data-testid="cms-page-select">
							<SelectValue placeholder="Select a page to edit" />
						</SelectTrigger>
						<SelectContent className="max-h-[380px]">
							{GROUPS.map((group) => {
								const groupPages = PUBLIC_PAGES.filter(
									(p) => p.group === group,
								);
								if (groupPages.length === 0) return null;
								return (
									<SelectGroup key={group}>
										<SelectLabel className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
											{group}
										</SelectLabel>
										{groupPages.map((p) => {
											const entry = pages.find((item) => item.key === p.key);
											return (
												<SelectItem
													key={p.key}
													value={p.key}
													data-testid={`cms-page-option-${p.key}`}
												>
													<span className="flex items-center justify-between gap-3 w-full">
														<span className="flex items-center gap-2">
															<span className="font-medium text-foreground">
																{p.title}
															</span>
															<span className="text-[11px] font-mono text-muted-foreground">
																{p.path}
															</span>
														</span>
														{entry?.hasUnpublishedChanges && (
															<span
																className="h-1.5 w-1.5 rounded-full bg-accent"
																title="Unpublished changes"
															/>
														)}
													</span>
												</SelectItem>
											);
										})}
									</SelectGroup>
								);
							})}
						</SelectContent>
					</Select>

					<span className="text-xs text-muted-foreground">
						{currentMeta.description}
					</span>
				</div>
			</div>

			{isLoading ? (
				<div className="grid gap-5 xl:grid-cols-12">
					<div className="xl:col-span-3">
						<PanelSkeleton height="h-80" />
					</div>
					<div className="xl:col-span-6">
						<PanelSkeleton height="h-80" />
					</div>
					<div className="xl:col-span-3">
						<PanelSkeleton height="h-80" />
					</div>
				</div>
			) : !page ? (
				<div className="panel">
					<EmptyState
						icon={Globe}
						title="Preparing page..."
						description="The public page content model is being initialized."
						actionLabel="Reload page"
						onAction={() => {
							void qc.invalidateQueries({ queryKey: ["website-pages"] });
							void qc.invalidateQueries({
								queryKey: ["website-page", pageKey],
							});
						}}
						testId="cms-page-missing"
					/>
				</div>
			) : (
				<div className="grid gap-5 xl:grid-cols-12">
					{/* Outline — fixed sections for this page */}
					<div className="xl:col-span-3">
						<Panel
							eyebrow="Page sections"
							title={`${sectionTypes.length} fixed sections`}
							description="Sections are defined by the page design"
							testId="cms-outline"
						>
							<ul className="space-y-1.5" data-testid="cms-section-list">
								{sectionTypes.map((type) => {
									const saved = page.blocks.some(
										(block) => block.type === type,
									);
									const active = type === selectedType;
									return (
										<li key={type}>
											<button
												type="button"
												onClick={() => setSelectedType(type)}
												className={cn(
													"flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
													active
														? "border-accent bg-accent/10"
														: "border-hairline bg-surface-2 hover:bg-surface-1",
												)}
												data-testid={`cms-section-button-${type}`}
												data-active={active}
											>
												<span className="flex items-center gap-2">
													<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-xs font-medium text-foreground">
														{sectionLabel(type)}
													</span>
												</span>
												<span
													className={cn(
														"rounded-full px-2 py-0.5 text-[10px] leading-normal",
														saved
															? "bg-accent/14 text-accent"
															: "border border-dashed border-hairline text-muted-foreground",
													)}
												>
													{saved ? "Saved" : "Default"}
												</span>
											</button>
										</li>
									);
								})}
							</ul>

							{currentMeta.dedicatedCms && (
								<div className="mt-5 border-t border-hairline pt-3.5">
									<p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
										Database Records
									</p>
									<Link
										to={currentMeta.dedicatedCms.to}
										className="flex w-full items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-1"
										data-testid="cms-dedicated-bridge-link"
									>
										<span className="flex items-center gap-2">
											<Database className="h-3.5 w-3.5 text-accent" />
											{currentMeta.dedicatedCms.label}
										</span>
										<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
									</Link>
								</div>
							)}
						</Panel>
					</div>

					{/* Live preview — the real public route in an iframe */}
					<div className="xl:col-span-6">
						{currentMeta.dedicatedCms && (
							<div
								className="mb-3 flex flex-col gap-2 rounded-xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-900 sm:flex-row sm:items-center sm:justify-between dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-200"
								data-testid="cms-dedicated-bridge-alert"
							>
								<div className="flex items-center gap-2">
									<Info className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
									<span>
										<strong>{currentMeta.dedicatedCms.label}:</strong>{" "}
										{currentMeta.dedicatedCms.description}
									</span>
								</div>
								<Link
									to={currentMeta.dedicatedCms.to}
									className="inline-flex shrink-0 items-center gap-1 font-semibold text-blue-700 hover:text-blue-800 hover:underline dark:text-blue-400"
								>
									Manage Records
									<ArrowUpRight className="h-3.5 w-3.5" />
								</Link>
							</div>
						)}

						<Panel
							eyebrow="Live preview"
							title={page.title}
							description={page.path}
							testId="cms-preview"
							bodyClassName="p-0"
							actions={
								<Button
									variant="outline"
									size="sm"
									className="h-7 gap-1.5 px-2 text-xs"
									data-testid="cms-preview-reload"
									onClick={() => setIframeVersion((version) => version + 1)}
								>
									<RefreshCw className="h-3 w-3" /> Reload
								</Button>
							}
						>
							<iframe
								key={iframeVersion}
								src={`${page.path}?cms=1`}
								title={`Live preview: ${page.title}`}
								data-testid="cms-live-preview"
								className="h-[calc(100vh-240px)] min-h-[560px] w-full border-0 bg-[#FEF2F2]"
							/>
						</Panel>
					</div>

					{/* Editor — content fields for the selected section */}
					<div className="xl:col-span-3">
						<SectionEditor
							sectionType={selectedType}
							fields={selectedFields}
							canManage={canManage}
							saving={saveSection.isPending}
							onSave={(fields) => saveSection.mutate(fields)}
						/>
					</div>
				</div>
			)}

			<Dialog open={seoOpen} onOpenChange={setSeoOpen}>
				<DialogContent
					className="bg-popover sm:max-w-lg"
					data-testid="cms-seo-dialog"
				>
					<DialogHeader>
						<DialogTitle className="font-display">Search settings</DialogTitle>
						<DialogDescription>
							How this page appears in search results and link previews.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-3.5">
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-title">
								Meta title
							</Label>
							<Input
								id="cms-seo-title"
								value={seoDraft.title}
								disabled={!canManage}
								data-testid="cms-seo-title"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setSeoDraft({ ...seoDraft, title: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-description">
								Meta description
							</Label>
							<Textarea
								id="cms-seo-description"
								rows={3}
								value={seoDraft.description}
								disabled={!canManage}
								data-testid="cms-seo-description"
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									setSeoDraft({ ...seoDraft, description: event.target.value })
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs" htmlFor="cms-seo-keywords">
								Keywords
							</Label>
							<Input
								id="cms-seo-keywords"
								value={seoDraft.keywords}
								disabled={!canManage}
								data-testid="cms-seo-keywords"
								onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
									setSeoDraft({ ...seoDraft, keywords: event.target.value })
								}
							/>
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							data-testid="cms-seo-cancel"
							onClick={() => setSeoOpen(false)}
						>
							Cancel
						</Button>
						<Button
							disabled={!canManage || seoMutation.isPending}
							data-testid="cms-seo-save"
							onClick={() => seoMutation.mutate()}
						>
							{seoMutation.isPending ? "Saving…" : "Save settings"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
