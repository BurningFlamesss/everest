import { useRouter } from "@tanstack/react-router";
import {
	Eye,
	FileEdit,
	Globe,
	Image as ImageIcon,
	Lock,
	Pin,
	Send,
	Tag,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { RichTextEditor } from "#/components/common/RichTextEditor";
import { Badge } from "#/components/ui/badge";
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
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "#/components/ui/tabs";
import { Textarea } from "#/components/ui/textarea";
import {
	createClubPostAction,
	updateClubPostAction,
} from "#/packages/clubs/server.ts";

export interface EditingPostData {
	id: string;
	title: string;
	body: string;
	excerpt?: string | null;
	coverImage?: string | null;
	category?: string | null;
	visibility?: string | null;
	isPinned?: boolean;
	allowComments?: boolean;
}

interface ClubPostComposerDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	clubSlug: string;
	clubName?: string;
	canPin?: boolean;
	editingPost?: EditingPostData | null;
	onSuccess?: () => void;
}

const CATEGORIES = [
	"Announcement",
	"Workshop",
	"Tournament",
	"Exhibition",
	"Achievement",
	"Meeting Recap",
	"General",
];

const PRESET_IMAGES = [
	{
		label: "Science Lab",
		url: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
	},
	{
		label: "Robotics & Tech",
		url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80",
	},
	{
		label: "Debate & Books",
		url: "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80",
	},
	{
		label: "Sports & Athletics",
		url: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80",
	},
	{
		label: "Eco & Green",
		url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
	},
];

export function ClubPostComposerDialog({
	open,
	onOpenChange,
	clubSlug,
	clubName,
	canPin = false,
	editingPost = null,
	onSuccess,
}: ClubPostComposerDialogProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

	const [title, setTitle] = useState("");
	const [body, setBody] = useState("");
	const [excerpt, setExcerpt] = useState("");
	const [category, setCategory] = useState("Announcement");
	const [visibility, setVisibility] = useState("PUBLIC");
	const [coverImage, setCoverImage] = useState("");
	const [isPinned, setIsPinned] = useState(false);
	const [allowComments, setAllowComments] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (editingPost) {
			setTitle(editingPost.title || "");
			setBody(editingPost.body || "");
			setExcerpt(editingPost.excerpt || "");
			setCategory(editingPost.category || "Announcement");
			setVisibility(editingPost.visibility || "PUBLIC");
			setCoverImage(editingPost.coverImage || "");
			setIsPinned(Boolean(editingPost.isPinned));
			setAllowComments(editingPost.allowComments !== false);
		} else {
			setTitle("");
			setBody("");
			setExcerpt("");
			setCategory("Announcement");
			setVisibility("PUBLIC");
			setCoverImage("");
			setIsPinned(false);
			setAllowComments(true);
		}
		setError("");
		setActiveTab("write");
	}, [editingPost, open]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isSubmitting) return;

		const trimmedTitle = title.trim();
		const trimmedBody = body.trim();

		if (!trimmedTitle) {
			setError("Please enter a title for the post.");
			return;
		}
		if (!trimmedBody || trimmedBody === "<p></p>") {
			setError("Please enter content in the editor.");
			return;
		}

		setError("");
		setIsSubmitting(true);

		try {
			if (editingPost) {
				const res = await updateClubPostAction({
					data: {
						postId: editingPost.id,
						title: trimmedTitle,
						body: trimmedBody,
						excerpt: excerpt.trim() || undefined,
						coverImage: coverImage.trim() || undefined,
						category,
						visibility,
						allowComments,
						isPinned: canPin ? isPinned : undefined,
					},
				});
				if (!res.success) {
					setError(res.error || "Failed to update post");
					return;
				}
				toast.success("Post updated successfully");
			} else {
				const res = await createClubPostAction({
					data: {
						slug: clubSlug,
						title: trimmedTitle,
						body: trimmedBody,
						excerpt: excerpt.trim() || undefined,
						coverImage: coverImage.trim() || undefined,
						category,
						visibility,
						allowComments,
						isPinned: canPin ? isPinned : false,
					},
				});
				if (!res.success) {
					setError(res.error || "Failed to publish post");
					return;
				}
				toast.success("Post published successfully");
			}

			onOpenChange(false);
			onSuccess?.();
			await router.invalidate();
		} catch (err: any) {
			setError(err?.message || "An error occurred");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="border-border bg-popover sm:max-w-4xl max-h-[92vh] flex flex-col p-0">
				<DialogHeader className="p-6 pb-4 border-b border-border">
					<div className="flex items-center justify-between">
						<div>
							<DialogTitle className="text-xl font-bold flex items-center gap-2">
								<FileEdit className="h-5 w-5 text-primary" />
								{editingPost ? "Edit Club Post / Story" : "Create Club Post / Article"}
							</DialogTitle>
							<DialogDescription className="text-xs mt-1">
								{clubName ? `Publishing to ${clubName}` : "Create rich announcements and activities."}
							</DialogDescription>
						</div>
						<div className="flex items-center gap-2">
							<Tabs
								value={activeTab}
								onValueChange={(v: string) => setActiveTab(v as "write" | "preview")}
								className="w-auto"
							>
								<TabsList className="h-8">
									<TabsTrigger value="write" className="text-xs px-2.5">
										<FileEdit className="mr-1 h-3 w-3" /> Edit
									</TabsTrigger>
									<TabsTrigger value="preview" className="text-xs px-2.5">
										<Eye className="mr-1 h-3 w-3" /> Preview
									</TabsTrigger>
								</TabsList>
							</Tabs>
						</div>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
					<div className="flex-1 overflow-y-auto p-6 space-y-6">
						{error && (
							<div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
								{error}
							</div>
						)}

						{activeTab === "write" ? (
							<>
								{/* Title & Category & Visibility Row */}
								<div className="space-y-4">
									<div className="space-y-1.5">
										<Label className="text-xs font-semibold">Post Title *</Label>
										<Input
											placeholder="e.g. Annual Inter-School Science Fair 2083 Schedule & Registrations"
											value={title}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setTitle(e.target.value)
											}
											className="text-base font-medium h-10"
											required
											maxLength={200}
										/>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
										{/* Category */}
										<div className="space-y-1.5">
											<Label className="text-xs font-semibold flex items-center gap-1.5">
												<Tag className="h-3.5 w-3.5 text-primary" /> Category
											</Label>
											<Select value={category} onValueChange={setCategory}>
												<SelectTrigger className="w-full h-9 text-xs">
													<SelectValue placeholder="Select category" />
												</SelectTrigger>
												<SelectContent>
													{CATEGORIES.map((cat) => (
														<SelectItem key={cat} value={cat}>
															{cat}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>

										{/* Visibility */}
										<div className="space-y-1.5">
											<Label className="text-xs font-semibold flex items-center gap-1.5">
												<Globe className="h-3.5 w-3.5 text-primary" /> Visibility & Audience
											</Label>
											<Select value={visibility} onValueChange={setVisibility}>
												<SelectTrigger className="w-full h-9 text-xs">
													<SelectValue placeholder="Visibility" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="PUBLIC">
														Public (Landing Page, Activities & Website)
													</SelectItem>
													<SelectItem value="MEMBERS_ONLY">
														Members Only (Enrolled Club Members)
													</SelectItem>
													<SelectItem value="DRAFT">
														Draft (Private to Officers)
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>

								{/* Excerpt / Short Summary */}
								<div className="space-y-1.5">
									<div className="flex items-center justify-between">
										<Label className="text-xs font-semibold">
											Excerpt / Teaser Summary (Optional)
										</Label>
										<span className="text-[11px] text-muted-foreground font-mono">
											{excerpt.length}/280
										</span>
									</div>
									<Textarea
										placeholder="Brief 1-2 sentence overview to tease the story on cards and search listings…"
										value={excerpt}
										onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
											setExcerpt(e.target.value.slice(0, 280))
										}
										rows={2}
										className="text-xs"
									/>
								</div>

								{/* Cover Image */}
								<div className="space-y-2">
									<Label className="text-xs font-semibold flex items-center gap-1.5">
										<ImageIcon className="h-3.5 w-3.5 text-primary" /> Featured Cover Image (URL)
									</Label>
									<div className="flex gap-2">
										<Input
											placeholder="https://images.unsplash.com/photo-..."
											value={coverImage}
											onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
												setCoverImage(e.target.value)
											}
											className="text-xs h-9"
										/>
										{coverImage && (
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="text-xs shrink-0"
												onClick={() => setCoverImage("")}
											>
												Remove
											</Button>
										)}
									</div>
									{/* Presets */}
									<div className="flex flex-wrap items-center gap-1.5 pt-1">
										<span className="text-[10px] text-muted-foreground mr-1">Presets:</span>
										{PRESET_IMAGES.map((preset) => (
											<button
												key={preset.label}
												type="button"
												onClick={() => setCoverImage(preset.url)}
												className="rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10.5px] hover:bg-secondary transition-colors"
											>
												{preset.label}
											</button>
										))}
									</div>
								</div>

								{/* Rich Text Editor */}
								<div className="space-y-1.5">
									<Label className="text-xs font-semibold">
										Article Body (Rich Text Editor) *
									</Label>
									<div className="border border-border rounded-xl overflow-hidden">
										<RichTextEditor
											value={body}
											onChange={setBody}
											placeholder="Write your article, add headings, lists, tables, images and embeds…"
											minHeight="min-h-[260px]"
											allowEmbeds={true}
										/>
									</div>
								</div>

								{/* Toggles: Pin and Comments */}
								<div className="flex flex-wrap items-center gap-6 pt-2 border-t border-border/80">
									{canPin && (
										<label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
											<input
												type="checkbox"
												checked={isPinned}
												onChange={(e) => setIsPinned(e.target.checked)}
												className="size-4 accent-primary rounded cursor-pointer"
											/>
											<span className="flex items-center gap-1">
												<Pin className="h-3 w-3 text-amber-500" /> Pin to top of feed
											</span>
										</label>
									)}

									<label className="inline-flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer select-none">
										<input
											type="checkbox"
											checked={allowComments}
											onChange={(e) => setAllowComments(e.target.checked)}
											className="size-4 accent-primary rounded cursor-pointer"
										/>
										<span>Allow student comments &amp; questions</span>
									</label>
								</div>
							</>
						) : (
							/* PREVIEW TAB */
							<div className="space-y-6">
								<div className="border-b border-border pb-4">
									<div className="flex items-center gap-2 mb-2">
										<Badge variant="outline" className="text-xs">
											{category}
										</Badge>
										<Badge variant="secondary" className="text-xs">
											{visibility}
										</Badge>
										{isPinned && (
											<Badge className="bg-amber-500/10 text-amber-600 border border-amber-500/30 text-xs">
												Pinned
											</Badge>
										)}
									</div>
									<h2 className="text-2xl sm:text-3xl font-bold font-display text-foreground">
										{title || "Untitled Article"}
									</h2>
									{excerpt && (
										<p className="mt-2 text-sm text-muted-foreground italic font-serif border-l-2 border-primary pl-3">
											{excerpt}
										</p>
									)}
								</div>

								{coverImage && (
									<div className="h-64 w-full overflow-hidden rounded-xl bg-secondary">
										<img
											src={coverImage}
											alt=""
											className="h-full w-full object-cover"
										/>
									</div>
								)}

								<div
									className="prose prose-neutral max-w-none dark:prose-invert text-foreground leading-relaxed"
									dangerouslySetInnerHTML={{
										__html: body || "<p><em>No content yet.</em></p>",
									}}
								/>
							</div>
						)}
					</div>

					<DialogFooter className="p-4 border-t border-border bg-card/40 flex items-center justify-between">
						<span className="text-xs text-muted-foreground flex items-center gap-1.5">
							{visibility === "PUBLIC" ? (
								<>
									<Globe className="h-3 w-3 text-emerald-500" /> Public to all
								</>
							) : visibility === "MEMBERS_ONLY" ? (
								<>
									<Lock className="h-3 w-3 text-amber-500" /> Members only
								</>
							) : (
								<>
									<FileEdit className="h-3 w-3 text-blue-500" /> Private draft
								</>
							)}
						</span>
						<div className="flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !title.trim()}
								className="gap-1.5 font-semibold"
							>
								<Send className="h-3.5 w-3.5" />
								{isSubmitting
									? "Saving…"
									: editingPost
										? "Save Changes"
										: "Publish Article"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
