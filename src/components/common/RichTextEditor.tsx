import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
	AlignCenter,
	AlignJustify,
	AlignLeft,
	AlignRight,
	Bold,
	CalendarClock,
	Code,
	Highlighter,
	Image as ImageIcon,
	Italic,
	Link2,
	List,
	ListOrdered,
	Minus,
	Plus,
	Quote,
	Redo2,
	RemoveFormatting,
	Sparkles,
	Strikethrough,
	Table as TableIcon,
	Trash2,
	Underline as UnderlineIcon,
	Undo2,
	Unlink,
} from "lucide-react";
import { useEffect, useState } from "react";
import { EmbedTimetableModal } from "#/components/common/EmbedTimetableModal";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "#/components/ui/popover";
import { cn } from "#/lib/utils";

interface RichTextEditorProps {
	value: string;
	onChange: (html: string) => void;
	placeholder?: string;
	minHeight?: string;
	testId?: string;
	allowEmbeds?: boolean;
}

export function RichTextEditor({
	value,
	onChange,
	placeholder = "Write notice content…",
	minHeight = "min-h-[240px]",
	testId = "rich-text-editor",
	allowEmbeds = true,
}: RichTextEditorProps) {
	const [linkUrl, setLinkUrl] = useState("");
	const [linkPopoverOpen, setLinkPopoverOpen] = useState(false);
	const [imageUrl, setImageUrl] = useState("");
	const [imagePopoverOpen, setImagePopoverOpen] = useState(false);
	const [embedModalOpen, setEmbedModalOpen] = useState(false);

	const editor = useEditor({
		extensions: [
			StarterKit.configure({
				heading: { levels: [1, 2, 3] },
				codeBlock: false,
			}),
			Underline,
			Link.configure({
				openOnClick: false,
				HTMLAttributes: {
					class: "text-primary underline hover:text-primary/80",
				},
			}),
			Placeholder.configure({ placeholder }),
			Table.configure({
				resizable: true,
				HTMLAttributes: {
					class:
						"border-collapse table-auto w-full border border-hairline my-4 rounded-lg overflow-hidden",
				},
			}),
			TableRow,
			TableHeader.configure({
				HTMLAttributes: {
					class:
						"border border-hairline bg-surface-2 p-2.5 font-semibold text-xs text-left",
				},
			}),
			TableCell.configure({
				HTMLAttributes: {
					class: "border border-hairline p-2 text-xs",
				},
			}),
			TextAlign.configure({
				types: ["heading", "paragraph"],
			}),
			Highlight.configure({
				multicolor: true,
			}),
			Image.configure({
				inline: true,
				allowBase64: true,
				HTMLAttributes: {
					class: "rounded-lg max-w-full my-3",
				},
			}),
		],
		content: value,
		onUpdate: ({ editor: instance }) => onChange(instance.getHTML()),
	});

	useEffect(() => {
		if (editor && value !== editor.getHTML()) {
			editor.commands.setContent(value || "", { emitUpdate: false });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [editor, value]);

	if (!editor) {
		return (
			<div
				className={cn(
					"rounded-xl border border-hairline bg-surface-1",
					minHeight,
				)}
			/>
		);
	}

	const applyLink = () => {
		if (!linkUrl.trim()) {
			editor.chain().focus().unsetLink().run();
		} else {
			const formatted = linkUrl.startsWith("http")
				? linkUrl
				: `https://${linkUrl}`;
			editor
				.chain()
				.focus()
				.extendMarkRange("link")
				.setLink({ href: formatted })
				.run();
		}
		setLinkPopoverOpen(false);
		setLinkUrl("");
	};

	const applyImage = () => {
		if (imageUrl.trim()) {
			editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
		}
		setImagePopoverOpen(false);
		setImageUrl("");
	};

	const insertCallout = () => {
		editor
			.chain()
			.focus()
			.insertContent(
				`<div class="embedded-callout-widget not-prose" style="margin: 16px 0; border-left: 4px solid #dc2626; background: rgba(220,38,38,0.04); border-radius: 8px; padding: 12px 16px;">
					<strong style="color: #dc2626; font-size: 13px; display: block; margin-bottom: 4px;">Important Notice</strong>
					<p style="margin: 0; font-size: 13px; color: #334155;">Please note the guidelines and arrival timings specified above.</p>
				</div><p></p>`,
			)
			.run();
	};

	const wordCount = editor.storage?.characterCount?.words
		? editor.storage.characterCount.words()
		: (editor.getText().trim().match(/\S+/g) || []).length;
	const charCount = editor.getText().length;

	return (
		<div
			className="tiptap-shell flex flex-col rounded-xl border border-hairline bg-surface-1 shadow-sm transition-all focus-within:border-primary/40 focus-within:ring-1 focus-within:ring-primary/20"
			data-testid={testId}
		>
			{/* Toolbar Header */}
			<div className="flex flex-wrap items-center gap-1 border-b border-hairline bg-surface-2/60 p-1.5 text-foreground">
				{/* Typography Style Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							className="inline-flex h-7 items-center gap-1 rounded px-2 text-xs font-medium text-foreground hover:bg-secondary focus-ring"
							title="Text Style"
							data-testid={`${testId}-style-dropdown`}
						>
							<span>
								{editor.isActive("heading", { level: 1 })
									? "Heading 1"
									: editor.isActive("heading", { level: 2 })
										? "Heading 2"
										: editor.isActive("heading", { level: 3 })
											? "Heading 3"
											: "Paragraph"}
							</span>
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-36">
						<DropdownMenuItem
							onClick={() => editor.chain().focus().setParagraph().run()}
							className={cn(
								"text-xs",
								editor.isActive("paragraph") && "font-semibold text-primary",
							)}
						>
							Paragraph
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 1 }).run()
							}
							className={cn(
								"text-xs font-semibold font-display",
								editor.isActive("heading", { level: 1 }) && "text-primary",
							)}
						>
							Heading 1
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 2 }).run()
							}
							className={cn(
								"text-xs font-semibold font-display",
								editor.isActive("heading", { level: 2 }) && "text-primary",
							)}
						>
							Heading 2
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() =>
								editor.chain().focus().toggleHeading({ level: 3 }).run()
							}
							className={cn(
								"text-xs font-semibold font-display",
								editor.isActive("heading", { level: 3 }) && "text-primary",
							)}
						>
							Heading 3
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				<div className="mx-0.5 h-4 w-px bg-hairline" />

				{/* Text Formatting */}
				<button
					type="button"
					title="Bold (Ctrl+B)"
					aria-label="Bold"
					data-testid={`${testId}-bold`}
					onClick={() => editor.chain().focus().toggleBold().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("bold") && "bg-primary/12 font-bold text-primary",
					)}
				>
					<Bold className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Italic (Ctrl+I)"
					aria-label="Italic"
					data-testid={`${testId}-italic`}
					onClick={() => editor.chain().focus().toggleItalic().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("italic") && "bg-primary/12 text-primary",
					)}
				>
					<Italic className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Underline (Ctrl+U)"
					aria-label="Underline"
					data-testid={`${testId}-underline`}
					onClick={() => editor.chain().focus().toggleUnderline().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("underline") && "bg-primary/12 text-primary",
					)}
				>
					<UnderlineIcon className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Strikethrough"
					aria-label="Strikethrough"
					onClick={() => editor.chain().focus().toggleStrike().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("strike") && "bg-primary/12 text-primary",
					)}
				>
					<Strikethrough className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Highlight text"
					aria-label="Highlight"
					onClick={() => editor.chain().focus().toggleHighlight().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("highlight") && "bg-primary/12 text-primary",
					)}
				>
					<Highlighter className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Inline Code"
					aria-label="Code"
					onClick={() => editor.chain().focus().toggleCode().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("code") && "bg-primary/12 text-primary",
					)}
				>
					<Code className="h-3.5 w-3.5" />
				</button>

				<div className="mx-0.5 h-4 w-px bg-hairline" />

				{/* Text Alignment */}
				<button
					type="button"
					title="Align Left"
					aria-label="Align Left"
					onClick={() => editor.chain().focus().setTextAlign("left").run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive({ textAlign: "left" }) &&
							"bg-primary/12 text-primary",
					)}
				>
					<AlignLeft className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Align Center"
					aria-label="Align Center"
					onClick={() => editor.chain().focus().setTextAlign("center").run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive({ textAlign: "center" }) &&
							"bg-primary/12 text-primary",
					)}
				>
					<AlignCenter className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Align Right"
					aria-label="Align Right"
					onClick={() => editor.chain().focus().setTextAlign("right").run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive({ textAlign: "right" }) &&
							"bg-primary/12 text-primary",
					)}
				>
					<AlignRight className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Justify"
					aria-label="Justify"
					onClick={() => editor.chain().focus().setTextAlign("justify").run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive({ textAlign: "justify" }) &&
							"bg-primary/12 text-primary",
					)}
				>
					<AlignJustify className="h-3.5 w-3.5" />
				</button>

				<div className="mx-0.5 h-4 w-px bg-hairline" />

				{/* Lists and Quotes */}
				<button
					type="button"
					title="Bullet List"
					aria-label="Bullet list"
					data-testid={`${testId}-bullet-list`}
					onClick={() => editor.chain().focus().toggleBulletList().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("bulletList") && "bg-primary/12 text-primary",
					)}
				>
					<List className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Numbered List"
					aria-label="Numbered list"
					data-testid={`${testId}-ordered-list`}
					onClick={() => editor.chain().focus().toggleOrderedList().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("orderedList") && "bg-primary/12 text-primary",
					)}
				>
					<ListOrdered className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Blockquote"
					aria-label="Blockquote"
					data-testid={`${testId}-blockquote`}
					onClick={() => editor.chain().focus().toggleBlockquote().run()}
					className={cn(
						"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
						editor.isActive("blockquote") && "bg-primary/12 text-primary",
					)}
				>
					<Quote className="h-3.5 w-3.5" />
				</button>

				<button
					type="button"
					title="Horizontal Rule"
					aria-label="Horizontal rule"
					onClick={() => editor.chain().focus().setHorizontalRule().run()}
					className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
				>
					<Minus className="h-3.5 w-3.5" />
				</button>

				<div className="mx-0.5 h-4 w-px bg-hairline" />

				{/* Link Popover */}
				<Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							title="Insert / Edit Link"
							aria-label="Link"
							data-testid={`${testId}-link`}
							onClick={() => {
								setLinkUrl(editor.getAttributes("link").href ?? "");
								setLinkPopoverOpen(true);
							}}
							className={cn(
								"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
								editor.isActive("link") && "bg-primary/12 text-primary",
							)}
						>
							<Link2 className="h-3.5 w-3.5" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-72 p-3" align="start">
						<div className="space-y-2">
							<p className="text-xs font-semibold text-foreground">
								Insert or Edit Link
							</p>
							<input
								type="url"
								placeholder="https://example.com"
								value={linkUrl}
								onChange={(e) => setLinkUrl(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && applyLink()}
								className="h-8 w-full rounded border border-hairline bg-surface-2 px-2.5 text-xs outline-none focus:border-primary"
								autoFocus
							/>
							<div className="flex items-center justify-between pt-1">
								{editor.isActive("link") ? (
									<button
										type="button"
										onClick={() => {
											editor.chain().focus().unsetLink().run();
											setLinkPopoverOpen(false);
										}}
										className="inline-flex items-center gap-1 text-[11px] text-destructive hover:underline"
									>
										<Unlink className="h-3 w-3" /> Remove
									</button>
								) : (
									<span />
								)}
								<div className="flex items-center gap-1">
									<button
										type="button"
										onClick={() => setLinkPopoverOpen(false)}
										className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
									>
										Cancel
									</button>
									<button
										type="button"
										onClick={applyLink}
										className="rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
									>
										Apply
									</button>
								</div>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Image Popover */}
				<Popover open={imagePopoverOpen} onOpenChange={setImagePopoverOpen}>
					<PopoverTrigger asChild>
						<button
							type="button"
							title="Insert Image"
							aria-label="Insert Image"
							className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
						>
							<ImageIcon className="h-3.5 w-3.5" />
						</button>
					</PopoverTrigger>
					<PopoverContent className="w-80 p-3" align="start">
						<div className="space-y-2">
							<p className="text-xs font-semibold text-foreground">
								Insert Image
							</p>
							<input
								type="url"
								placeholder="Paste Image URL (https://…)"
								value={imageUrl}
								onChange={(e) => setImageUrl(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && applyImage()}
								className="h-8 w-full rounded border border-hairline bg-surface-2 px-2.5 text-xs outline-none focus:border-primary"
								autoFocus
							/>
							<div className="flex items-center justify-end gap-1 pt-1">
								<button
									type="button"
									onClick={() => setImagePopoverOpen(false)}
									className="rounded px-2 py-1 text-[11px] text-muted-foreground hover:bg-secondary"
								>
									Cancel
								</button>
								<button
									type="button"
									onClick={applyImage}
									className="rounded bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
								>
									Insert Image
								</button>
							</div>
						</div>
					</PopoverContent>
				</Popover>

				{/* Table Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<button
							type="button"
							title="Table tools"
							aria-label="Table tools"
							className={cn(
								"rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
								editor.isActive("table") && "bg-primary/12 text-primary",
							)}
							data-testid={`${testId}-table-menu`}
						>
							<TableIcon className="h-3.5 w-3.5" />
						</button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="start" className="w-48">
						<DropdownMenuItem
							onClick={() =>
								editor
									.chain()
									.focus()
									.insertTable({ rows: 3, cols: 3, withHeaderRow: true })
									.run()
							}
							className="text-xs"
						>
							<Plus className="mr-2 h-3.5 w-3.5" /> Insert 3×3 Table
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addColumnBefore().run()}
							disabled={!editor.isActive("table")}
							className="text-xs"
						>
							Add Column Before
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addColumnAfter().run()}
							disabled={!editor.isActive("table")}
							className="text-xs"
						>
							Add Column After
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteColumn().run()}
							disabled={!editor.isActive("table")}
							className="text-xs text-destructive"
						>
							Delete Column
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addRowBefore().run()}
							disabled={!editor.isActive("table")}
							className="text-xs"
						>
							Add Row Before
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().addRowAfter().run()}
							disabled={!editor.isActive("table")}
							className="text-xs"
						>
							Add Row After
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteRow().run()}
							disabled={!editor.isActive("table")}
							className="text-xs text-destructive"
						>
							Delete Row
						</DropdownMenuItem>
						<DropdownMenuSeparator />
						<DropdownMenuItem
							onClick={() => editor.chain().focus().deleteTable().run()}
							disabled={!editor.isActive("table")}
							className="text-xs text-destructive"
						>
							<Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Entire Table
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>

				{/* Embed Menu (Timetable & Widgets) */}
				{allowEmbeds && (
					<>
						<div className="mx-0.5 h-4 w-px bg-hairline" />

						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									type="button"
									className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-1 text-xs font-semibold text-primary hover:bg-primary/20 focus-ring"
									title="Embed school systems & widgets"
									data-testid={`${testId}-embed-menu`}
								>
									<CalendarClock className="h-3.5 w-3.5" />
									<span>Embed</span>
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="start" className="w-56">
								<DropdownMenuItem
									onClick={() => setEmbedModalOpen(true)}
									className="gap-2 text-xs font-medium"
									data-testid={`${testId}-embed-timetable`}
								>
									<CalendarClock className="h-4 w-4 text-primary" />
									<div>
										<p className="font-semibold">Timetable / Routine</p>
										<p className="text-[10px] text-muted-foreground">
											Class schedules & routines
										</p>
									</div>
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={insertCallout}
									className="gap-2 text-xs font-medium"
								>
									<Sparkles className="h-4 w-4 text-amber-500" />
									<div>
										<p className="font-semibold">Important Notice Box</p>
										<p className="text-[10px] text-muted-foreground">
											Highlighted callout container
										</p>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</>
				)}

				{/* History (Undo / Redo / Clear) */}
				<div className="ml-auto flex items-center gap-0.5">
					<button
						type="button"
						aria-label="Clear formatting"
						title="Clear formatting"
						onClick={() =>
							editor.chain().focus().clearNodes().unsetAllMarks().run()
						}
						className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
					>
						<RemoveFormatting className="h-3.5 w-3.5" />
					</button>

					<button
						type="button"
						aria-label="Undo"
						title="Undo"
						onClick={() => editor.chain().focus().undo().run()}
						className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
					>
						<Undo2 className="h-3.5 w-3.5" />
					</button>
					<button
						type="button"
						aria-label="Redo"
						title="Redo"
						onClick={() => editor.chain().focus().redo().run()}
						className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring"
					>
						<Redo2 className="h-3.5 w-3.5" />
					</button>
				</div>
			</div>

			{/* Main TipTap Prose Editor Content */}
			<EditorContent
				editor={editor}
				className={cn(
					"prose-editor px-4 py-3.5 outline-none font-body",
					minHeight,
				)}
			/>

			{/* Status Bar */}
			<div className="flex items-center justify-between border-t border-hairline/60 bg-surface-2/30 px-3 py-1.5 text-[10px] text-muted-foreground">
				<div className="flex items-center gap-3">
					<span>{wordCount} words</span>
					<span>·</span>
					<span>{charCount} characters</span>
				</div>
				<span className="font-mono text-muted-foreground/60">
					Rich Text Content Editor
				</span>
			</div>

			{/* Embed Timetable Modal */}
			<EmbedTimetableModal
				open={embedModalOpen}
				onOpenChange={setEmbedModalOpen}
				onInsert={(html) => {
					editor.chain().focus().insertContent(html).run();
				}}
			/>
		</div>
	);
}
