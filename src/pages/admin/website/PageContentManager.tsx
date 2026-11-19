import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
	CloudUpload,
	ExternalLink,
	Globe,
	Loader2,
	Pencil,
	Undo2,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { SectionEditor } from "#/components/cms/SectionEditor";
import { EmptyState } from "#/components/common/EmptyState";
import { PageHeader } from "#/components/common/PageHeader";
import { Panel } from "#/components/common/Panel";
import { PanelSkeleton } from "#/components/common/Skeletons";
import { StatusBadge } from "#/components/common/StatusBadge";
import { Button } from "#/components/ui/button";
import {
	type CmsPageKey,
	sectionDefaults,
	sectionLabel,
} from "#/lib/cms-sections";
import {
	getWebsitePage,
	publishPage,
	saveSectionFields,
	unpublishPage,
} from "#/lib/website-admin-api";
import { useAuth } from "#/providers/AuthProvider";
import type { BlockType, WebsitePageKey } from "#/types";

interface PageContentManagerProps {
	pageKey: WebsitePageKey;
	title: string;
	description: string;
	publicPath: string;
	sectionTypes: BlockType[];
	recordsLink?: { to: string; label: string };
}

/**
 * Focused editor for one public page. It exposes the same fixed sections as
 * Website Content, without the multi-page picker and iframe, so each page has
 * a dedicated admin destination of its own.
 */
export function PageContentManager({
	pageKey,
	title,
	description,
	publicPath,
	sectionTypes,
	recordsLink,
}: PageContentManagerProps) {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();

	const [selectedType, setSelectedType] = useState<BlockType | null>(
		sectionTypes[0] ?? null,
	);

	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", pageKey],
		queryFn: () => getWebsitePage(pageKey),
	});

	const selectedBlock =
		page?.blocks.find((block) => block.type === selectedType) ?? null;

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

	const saveMutation = useMutation({
		mutationFn: (fields: Record<string, unknown>) => {
			if (!selectedType) throw new Error("No section selected");
			return saveSectionFields(pageKey, selectedType, fields, actor);
		},
		onSuccess: (next) => {
			qc.setQueryData(["website-page", pageKey], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success("Section saved");
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const publishMutation = useMutation({
		mutationFn: () => publishPage(pageKey, actor),
		onSuccess: (next) => {
			qc.setQueryData(["website-page", pageKey], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success(`${next.title} is live`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(pageKey, actor),
		onSuccess: (next) => {
			qc.setQueryData(["website-page", pageKey], next);
			qc.invalidateQueries({ queryKey: ["website-pages"] });
			toast.success(`${next.title} reverted to draft`);
		},
		onError: (error: Error) => toast.error(error.message),
	});

	const openPublicPage = () =>
		window.open(`${publicPath}?cms=1`, "_blank", "noopener,noreferrer");

	return (
		<div data-testid={`page-content-manager-${pageKey}`}>
			<PageHeader
				eyebrow="Website"
				title={title}
				description={description}
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
							onClick={openPublicPage}
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
								data-testid="page-content-publish"
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
					<div className="lg:col-span-4">
						<PanelSkeleton height="h-64" />
					</div>
					<div className="lg:col-span-8">
						<PanelSkeleton height="h-96" />
					</div>
				</div>
			) : !page ? (
				<div className="panel">
					<EmptyState
						icon={Globe}
						title="Preparing page…"
						description="The public page content model is being initialized."
						actionLabel="Reload"
						onAction={() =>
							qc.invalidateQueries({ queryKey: ["website-page", pageKey] })
						}
					/>
				</div>
			) : (
				<div className="grid gap-5 lg:grid-cols-12">
					<div className="lg:col-span-4">
						<Panel
							eyebrow="Sections"
							title={`${sectionTypes.length} editable sections`}
							description="Choose a section, edit its copy, then publish."
						>
							<ul className="space-y-1.5">
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
												data-testid={`page-content-section-${type}`}
												data-active={active}
												className={[
													"flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
													active
														? "border-accent bg-accent/10"
														: "border-hairline bg-surface-2 hover:bg-surface-1",
												].join(" ")}
											>
												<span className="flex items-center gap-2">
													<Pencil className="h-3.5 w-3.5 text-muted-foreground" />
													<span className="text-xs font-medium text-foreground">
														{sectionLabel(type)}
													</span>
												</span>
												<span
													className={[
														"rounded-full px-2 py-0.5 text-[10px]",
														saved
															? "bg-accent/14 text-accent"
															: "border border-dashed border-hairline text-muted-foreground",
													].join(" ")}
												>
													{saved ? "Saved" : "Default"}
												</span>
											</button>
										</li>
									);
								})}
							</ul>

							<div className="mt-5 space-y-2 border-t border-hairline pt-3.5">
								{recordsLink ? (
									<Link
										to={recordsLink.to}
										className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-1"
									>
										{recordsLink.label}
										<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
									</Link>
								) : null}
								<a
									href={`${publicPath}?cms=1`}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between gap-2 rounded-lg border border-hairline bg-surface-2 px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-surface-1"
								>
									Open page preview
									<ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
								</a>
							</div>

							{page.hasUnpublishedChanges ? (
								<p className="mt-4 flex items-center gap-1.5 text-[11px] text-muted-foreground">
									<Loader2 className="h-3 w-3" /> Saved changes are visible
									after publishing.
								</p>
							) : null}
						</Panel>
					</div>

					<div className="lg:col-span-8">
						<SectionEditor
							sectionType={selectedType}
							fields={selectedFields}
							canManage={canManage}
							saving={saveMutation.isPending}
							onSave={(fields) => saveMutation.mutate(fields)}
						/>
					</div>
				</div>
			)}
		</div>
	);
}
