import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CloudUpload,
	ExternalLink,
	ImageIcon,
	MousePointerClick,
	Pencil,
	Plus,
	Trash2,
	Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { rows, str } from "#/components/cms/block-fields";
import { SectionEditor } from "#/components/cms/SectionEditor";
import { EmptyState } from "#/components/common/EmptyState";
import { ImageUploader } from "#/components/common/ImageUploader";
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
import { Textarea } from "#/components/ui/textarea";
import { getSectionFields, sectionDefaults } from "#/lib/cms-sections";
import {
	getWebsitePage,
	publishPage,
	saveSectionFields,
	unpublishPage,
} from "#/lib/website-admin-api";
import { useAuth } from "#/providers/AuthProvider";
import type { WebsitePageKey } from "#/types";

type AboutBlockKey = "intro" | "gallery" | "visiting" | "empty";

const PAGE_KEY: WebsitePageKey = "about";

const GROUPS: Record<
	AboutBlockKey,
	{ label: string; hint: string; fields: string[] }
> = {
	intro: {
		label: "Header & chapter intro",
		hint: "The page eyebrow, title, intro paragraph and the chapter filter labels.",
		fields: ["eyebrow", "title", "body", "filterLabel", "contentsLabel"],
	},
	gallery: {
		label: "Chapter gallery",
		hint: "The heading above the photos shown inside a chapter.",
		fields: ["galleryEyebrow", "galleryTitle"],
	},
	visiting: {
		label: "Visiting note",
		hint: "Shown beneath the chapter contents with the school address prefixed.",
		fields: ["visitingNote"],
	},
	empty: {
		label: "Empty state",
		hint: "Shown when a chapter category has no matches.",
		fields: ["emptyTitle", "emptyDescription", "showAllLabel"],
	},
};

const CHAPTER_FIELDS = [
	{ key: "name", label: "Name", kind: "text" },
	{ key: "category", label: "Category", kind: "text" },
	{ key: "description", label: "Description", kind: "textarea" },
	{ key: "inCharge", label: "In charge", kind: "text" },
	{ key: "since", label: "Since", kind: "text" },
	{ key: "block", label: "Block", kind: "text" },
	{ key: "studentsLove", label: "Why students love it", kind: "textarea" },
	{
		key: "stats",
		label: "Stats (one “Label | Value” per line)",
		kind: "textarea",
	},
	{
		key: "gallery",
		label: "Gallery image URLs (one per line)",
		kind: "textarea",
	},
] as const;

export default function AboutContentPage() {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();

	const [selectedKey, setSelectedKey] = useState<AboutBlockKey | null>("intro");
	const [editingChapter, setEditingChapter] = useState<number | null>(null);
	const [chapterDraft, setChapterDraft] = useState<Record<string, unknown>>({});

	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", PAGE_KEY],
		queryFn: () => getWebsitePage(PAGE_KEY),
	});

	const fields = useMemo(
		() => ({
			...sectionDefaults("chapters"),
			...getSectionFields(page?.blocks, "chapters"),
		}),
		[page],
	);

	const chapters = rows(fields, "chapters");

	const applyPage = (next: Awaited<ReturnType<typeof saveSectionFields>>) => {
		qc.setQueryData(["website-page", PAGE_KEY], next);
		qc.invalidateQueries({ queryKey: ["website-pages"] });
	};

	const saveMutation = useMutation({
		mutationFn: (nextFields: Record<string, unknown>) =>
			saveSectionFields(PAGE_KEY, "chapters", nextFields, actor),
		onSuccess: (next) => {
			applyPage(next);
			setEditingChapter(null);
			toast.success("About page saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPage(PAGE_KEY, actor),
		onSuccess: (next) => {
			applyPage(next);
			toast.success("About page is live");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(PAGE_KEY, actor),
		onSuccess: (next) => {
			applyPage(next);
			toast.success("About page reverted to draft");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const openChapter = (index: number) => {
		setChapterDraft({ ...chapters[index] });
		setEditingChapter(index);
	};

	const addChapter = () => {
		const blank = {
			name: "New chapter",
			category: "Foundation",
			description: "",
			image: "",
			inCharge: "",
			since: "",
			block: "",
			studentsLove: "",
			stats: "",
			gallery: "",
		};
		setChapterDraft(blank);
		setEditingChapter(chapters.length);
	};

	const removeChapter = (index: number) => {
		saveMutation.mutate({
			...fields,
			chapters: chapters.filter((_, itemIndex) => itemIndex !== index),
		});
	};

	const saveChapter = () => {
		if (editingChapter === null) return;
		const next = [...chapters];
		next[editingChapter] = chapterDraft;
		saveMutation.mutate({ ...fields, chapters: next });
	};

	const selectedGroup = selectedKey ? GROUPS[selectedKey] : null;

	return (
		<div data-testid="about-content-page">
			<PageHeader
				eyebrow="Website"
				title="About Page"
				description="Double-click any block in the page skeleton to edit that part of the public about page. Chapters open in their own focused editor."
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
								window.open("/about?cms=1", "_blank", "noopener,noreferrer")
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
						<PanelSkeleton height="h-[34rem]" />
					</div>
					<div className="lg:col-span-5">
						<PanelSkeleton height="h-[34rem]" />
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
					<div className="lg:col-span-7">
						<Panel
							eyebrow="Page skeleton"
							title="About page"
							description="Double-click a block to edit it. Chapter cards open their own editor."
							bodyClassName="p-4"
						>
							<div className="space-y-3">
								<SkeletonBlock
									blockKey="intro"
									label={GROUPS.intro.label}
									selected={selectedKey}
									saved={page.blocks.some((block) => block.type === "chapters")}
									onSelect={setSelectedKey}
								>
									<p className="t-eyebrow">
										{str(fields, "eyebrow") || "About Everest"}
									</p>
									<h3 className="mt-1 font-display text-xl font-semibold text-foreground">
										{str(fields, "title") || "Purpose held over time."}
									</h3>
									<p className="mt-1 line-clamp-3 text-xs text-muted-foreground">
										{str(fields, "body") ||
											"An institution is not only what it has built."}
									</p>
								</SkeletonBlock>

								<div className="rounded-lg border border-hairline bg-surface-1 p-3">
									<div className="mb-2 flex items-center justify-between gap-2">
										<span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
											Chapters · {chapters.length}
										</span>
										{canManage && (
											<Button
												variant="outline"
												size="sm"
												className="h-6 gap-1 px-2 text-[10px]"
												onClick={addChapter}
											>
												<Plus className="h-3 w-3" /> Add chapter
											</Button>
										)}
									</div>
									{chapters.length === 0 ? (
										<p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
											No chapters yet. Add one to build the about page.
										</p>
									) : (
										<div className="grid gap-2 sm:grid-cols-2">
											{chapters.map((chapter, index) => (
												<div
													// biome-ignore lint/suspicious/noArrayIndexKey: chapter rows are positional and editable
													key={`${str(chapter, "name")}-${index}`}
													className="group relative rounded-lg border border-hairline bg-surface-2 p-2.5"
													data-testid={`about-chapter-${index}`}
												>
													<button
														type="button"
														onDoubleClick={() => openChapter(index)}
														onClick={() => openChapter(index)}
														className="block w-full text-left"
														title={`Edit ${str(chapter, "name") || `chapter ${index + 1}`}`}
													>
														<p className="text-[9px] uppercase tracking-wider text-muted-foreground">
															{str(chapter, "category") || "Uncategorised"}
														</p>
														<p className="mt-0.5 truncate text-[12px] font-semibold text-foreground">
															{str(chapter, "name") || `Chapter ${index + 1}`}
														</p>
														<p className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
															{str(chapter, "description") ||
																"No description yet."}
														</p>
													</button>
													{canManage && (
														<button
															type="button"
															aria-label={`Remove ${str(chapter, "name") || "chapter"}`}
															onClick={() => removeChapter(index)}
															disabled={saveMutation.isPending}
															className="absolute right-1.5 top-1.5 rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
														>
															<Trash2 className="h-3 w-3" />
														</button>
													)}
												</div>
											))}
										</div>
									)}
									<p className="mt-2 text-[10px] text-muted-foreground">
										Double-click a chapter to edit all of its content.
									</p>
								</div>

								<div className="grid gap-3 sm:grid-cols-2">
									<SkeletonBlock
										blockKey="gallery"
										label={GROUPS.gallery.label}
										selected={selectedKey}
										saved={page.blocks.some(
											(block) => block.type === "chapters",
										)}
										onSelect={setSelectedKey}
									>
										<p className="t-eyebrow">
											{str(fields, "galleryEyebrow") || "Glimpses"}
										</p>
										<p className="mt-1 text-[12px] font-semibold text-foreground">
											{str(fields, "galleryTitle") || "In Context"}
										</p>
										<div className="mt-1.5 grid grid-cols-3 gap-1">
											{Array.from({ length: 3 }).map((_, index) => (
												<span
													// biome-ignore lint/suspicious/noArrayIndexKey: skeleton tiles are positional
													key={index}
													className="flex aspect-[4/3] items-center justify-center rounded border border-hairline bg-surface-2"
												>
													<ImageIcon className="h-3 w-3 text-muted-foreground" />
												</span>
											))}
										</div>
									</SkeletonBlock>

									<div className="space-y-3">
										<SkeletonBlock
											blockKey="visiting"
											label={GROUPS.visiting.label}
											selected={selectedKey}
											saved={page.blocks.some(
												(block) => block.type === "chapters",
											)}
											onSelect={setSelectedKey}
										>
											<p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground">
												{str(fields, "visitingNote") || "Visiting note"}
											</p>
										</SkeletonBlock>

										<SkeletonBlock
											blockKey="empty"
											label={GROUPS.empty.label}
											selected={selectedKey}
											saved={page.blocks.some(
												(block) => block.type === "chapters",
											)}
											onSelect={setSelectedKey}
										>
											<p className="text-[11px] font-medium text-foreground">
												{str(fields, "emptyTitle") || "No chapters match"}
											</p>
											<p className="mt-0.5 line-clamp-2 text-[10px] text-muted-foreground">
												{str(fields, "emptyDescription") ||
													"Try another category."}
											</p>
										</SkeletonBlock>
									</div>
								</div>
							</div>
						</Panel>
					</div>

					<div className="lg:col-span-5">
						{selectedGroup ? (
							<>
								<SectionEditor
									key={selectedKey}
									sectionType="chapters"
									fields={fields}
									canManage={canManage}
									saving={saveMutation.isPending}
									onlyKeys={selectedGroup.fields}
									title={selectedGroup.label}
									onSave={(next) => saveMutation.mutate(next)}
								/>
								<p className="mt-2 px-1 text-[11px] text-muted-foreground">
									{selectedGroup.hint}
								</p>
							</>
						) : (
							<Panel eyebrow="Block editor" title="Nothing selected">
								<EmptyState
									compact
									icon={MousePointerClick}
									title="Double-click a block to edit it"
									description="Every part of the about page opens its own focused editor."
								/>
							</Panel>
						)}
					</div>
				</div>
			)}

			<Dialog
				open={editingChapter !== null}
				onOpenChange={(open: boolean) => !open && setEditingChapter(null)}
			>
				<DialogContent className="max-h-[92vh] overflow-y-auto border-hairline bg-popover sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle>
							{editingChapter !== null && editingChapter < chapters.length
								? "Edit chapter"
								: "Add chapter"}
						</DialogTitle>
						<DialogDescription>
							Every field below is rendered on the public about page.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-3">
						<div className="grid grid-cols-2 gap-3">
							{CHAPTER_FIELDS.slice(0, 2).map((field) => (
								<div key={field.key} className="space-y-1.5">
									<Label className="text-xs">{field.label}</Label>
									<Input
										value={String(chapterDraft[field.key] ?? "")}
										disabled={!canManage}
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) =>
											setChapterDraft((current) => ({
												...current,
												[field.key]: event.target.value,
											}))
										}
									/>
								</div>
							))}
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Description</Label>
							<Textarea
								rows={4}
								value={String(chapterDraft.description ?? "")}
								disabled={!canManage}
								onChange={(
									event: React.ChangeEvent<
										HTMLInputElement | HTMLTextAreaElement
									>,
								) =>
									setChapterDraft((current) => ({
										...current,
										description: event.target.value,
									}))
								}
							/>
						</div>
						<ImageUploader
							value={
								typeof chapterDraft.image === "string" && chapterDraft.image
									? chapterDraft.image
									: undefined
							}
							label="Chapter image"
							aspect="aspect-[16/9]"
							onChange={(url: string | undefined) =>
								setChapterDraft((current) => ({ ...current, image: url ?? "" }))
							}
						/>
						<div className="grid grid-cols-3 gap-3">
							{CHAPTER_FIELDS.slice(3, 6).map((field) => (
								<div key={field.key} className="space-y-1.5">
									<Label className="text-xs">{field.label}</Label>
									<Input
										value={String(chapterDraft[field.key] ?? "")}
										disabled={!canManage}
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) =>
											setChapterDraft((current) => ({
												...current,
												[field.key]: event.target.value,
											}))
										}
									/>
								</div>
							))}
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Why students love it</Label>
							<Textarea
								rows={2}
								value={String(chapterDraft.studentsLove ?? "")}
								disabled={!canManage}
								onChange={(
									event: React.ChangeEvent<
										HTMLInputElement | HTMLTextAreaElement
									>,
								) =>
									setChapterDraft((current) => ({
										...current,
										studentsLove: event.target.value,
									}))
								}
							/>
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							{CHAPTER_FIELDS.slice(7).map((field) => (
								<div key={field.key} className="space-y-1.5">
									<Label className="text-xs">{field.label}</Label>
									<Textarea
										rows={4}
										value={String(chapterDraft[field.key] ?? "")}
										disabled={!canManage}
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) =>
											setChapterDraft((current) => ({
												...current,
												[field.key]: event.target.value,
											}))
										}
									/>
								</div>
							))}
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setEditingChapter(null)}
							disabled={saveMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							className="gap-1.5"
							disabled={!canManage || saveMutation.isPending}
							onClick={saveChapter}
						>
							<Pencil className="h-3.5 w-3.5" />
							{saveMutation.isPending ? "Saving…" : "Save chapter"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
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
}: {
	blockKey: AboutBlockKey;
	label: string;
	selected: AboutBlockKey | null;
	saved: boolean;
	onSelect: (key: AboutBlockKey) => void;
	children: React.ReactNode;
}) {
	const active = selected === blockKey;
	return (
		// biome-ignore lint/a11y/noStaticElementInteractions: the block also exposes a keyboard-reachable Edit button
		// biome-ignore lint/a11y/useKeyWithClickEvents: the block also exposes a keyboard-reachable Edit button
		<div
			onDoubleClick={() => onSelect(blockKey)}
			onClick={() => onSelect(blockKey)}
			title={`Double-click to edit ${label}`}
			data-testid={`about-skeleton-${blockKey}`}
			className={[
				"w-full cursor-pointer rounded-lg border p-3 text-left transition-colors",
				active
					? "border-accent bg-accent/[0.06]"
					: "border-hairline bg-surface-1 hover:border-accent/50 hover:bg-surface-2",
			].join(" ")}
		>
			<div className="mb-1.5 flex items-center justify-between gap-2">
				<span className="text-[9px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
					{label}
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
