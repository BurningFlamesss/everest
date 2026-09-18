import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, Bold, Check, ChevronDown, Heading2, Heading3, Italic, Link2, List, ListOrdered, Quote, Redo2, Save, Send, Underline, Undo2, Users, X } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-B6FnglFX.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Separator } from "./separator-CW0Ij8xK.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { formatDateTime, formatNumber } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { ScrollArea } from "./scroll-area-Uy1QVTEG.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
import { Popover, PopoverContent, PopoverTrigger } from "./popover-BTFlDfBT.mjs";
import { audienceOptions, audienceReach, createNotice, getNotice, updateNotice } from "./communications-D6qF7rY7.mjs";
import { ImageUploader } from "./ImageUploader-DxocfbVn.mjs";
import { Switch } from "./switch-CJPnMvU4.mjs";
import { EditorContent, useEditor } from "../_libs/fast-equals+tiptap__react.mjs";
import { src_default } from "../_libs/@tiptap/extension-link+[...].mjs";
import { src_default as src_default$1 } from "../_libs/tiptap__extension-underline.mjs";
import { src_default as src_default$2 } from "../_libs/@tiptap/extension-placeholder+[...].mjs";
import { src_default as src_default$3 } from "../_libs/tiptap__starter-kit.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/NoticeEditorPage-iGhtBZRG.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function RichTextEditor({ value, onChange, placeholder = "Write the notice content…", minHeight = "min-h-[220px]", testId = "rich-text-editor" }) {
	const editor = useEditor({
		extensions: [
			src_default$3.configure({ heading: { levels: [2, 3] } }),
			src_default$1,
			src_default.configure({ openOnClick: false }),
			src_default$2.configure({ placeholder })
		],
		content: value,
		onUpdate: ({ editor: instance }) => onChange(instance.getHTML())
	});
	(0, import_react.useEffect)(() => {
		if (editor && value !== editor.getHTML()) editor.commands.setContent(value || "", false);
	}, [editor]);
	if (!editor) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("rounded-lg border border-hairline bg-surface-1", minHeight) });
	const actions = [
		{
			icon: Bold,
			label: "Bold",
			run: () => editor.chain().focus().toggleBold().run(),
			active: editor.isActive("bold")
		},
		{
			icon: Italic,
			label: "Italic",
			run: () => editor.chain().focus().toggleItalic().run(),
			active: editor.isActive("italic")
		},
		{
			icon: Underline,
			label: "Underline",
			run: () => editor.chain().focus().toggleUnderline().run(),
			active: editor.isActive("underline")
		},
		{
			icon: Heading2,
			label: "Heading 2",
			run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			active: editor.isActive("heading", { level: 2 })
		},
		{
			icon: Heading3,
			label: "Heading 3",
			run: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			active: editor.isActive("heading", { level: 3 })
		},
		{
			icon: List,
			label: "Bullet list",
			run: () => editor.chain().focus().toggleBulletList().run(),
			active: editor.isActive("bulletList")
		},
		{
			icon: ListOrdered,
			label: "Numbered list",
			run: () => editor.chain().focus().toggleOrderedList().run(),
			active: editor.isActive("orderedList")
		},
		{
			icon: Quote,
			label: "Quote",
			run: () => editor.chain().focus().toggleBlockquote().run(),
			active: editor.isActive("blockquote")
		},
		{
			icon: Link2,
			label: "Link",
			run: () => {
				const href = window.prompt("Link URL", editor.getAttributes("link").href ?? "https://");
				if (href === null) return;
				if (!href) {
					editor.chain().focus().unsetLink().run();
					return;
				}
				editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
			},
			active: editor.isActive("link")
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "tiptap-shell overflow-hidden rounded-lg border border-hairline bg-surface-1",
		"data-testid": testId,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-center gap-0.5 border-b border-hairline bg-surface-2 px-1.5 py-1.5",
			children: [actions.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				title: action.label,
				"aria-label": action.label,
				"data-testid": `${testId}-${action.label.toLowerCase().replace(/\s+/g, "-")}`,
				onClick: action.run,
				className: cn("rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring", action.active && "bg-primary/12 text-primary"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(action.icon, { className: "h-3.5 w-3.5" })
			}, action.label)), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "ml-auto flex items-center gap-0.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Undo",
					onClick: () => editor.chain().focus().undo().run(),
					className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": "Redo",
					onClick: () => editor.chain().focus().redo().run(),
					className: "rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Redo2, { className: "h-3.5 w-3.5" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorContent, {
			editor,
			className: cn("prose-editor px-4 py-3", minHeight)
		})]
	});
}
var PRIORITIES = [
	{
		value: "low",
		label: "Low",
		hint: "Informational only"
	},
	{
		value: "normal",
		label: "Normal",
		hint: "Standard announcement"
	},
	{
		value: "high",
		label: "High",
		hint: "Highlighted in lists"
	},
	{
		value: "urgent",
		label: "Urgent",
		hint: "Pushed to the top with accent styling"
	}
];
var STATUSES = [
	{
		value: "draft",
		label: "Draft"
	},
	{
		value: "scheduled",
		label: "Scheduled"
	},
	{
		value: "published",
		label: "Published"
	},
	{
		value: "archived",
		label: "Archived"
	}
];
function targetKey(target) {
	return `${target.kind}:${target.value ?? ""}`;
}
function toLocalInput(iso) {
	if (!iso) return "";
	const date = new Date(iso);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (value) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function fromLocalInput(value) {
	if (!value) return (/* @__PURE__ */ new Date()).toISOString();
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? (/* @__PURE__ */ new Date()).toISOString() : date.toISOString();
}
var EMPTY_FORM = {
	title: "",
	summary: "",
	content: "<p></p>",
	featuredImage: void 0,
	audience: [{
		kind: "everyone",
		label: "Everyone"
	}],
	priority: "normal",
	status: "draft",
	publishAt: (/* @__PURE__ */ new Date()).toISOString(),
	expiresAt: void 0,
	pinned: false
};
function NoticeEditorPage() {
	const { id } = useParams();
	const isEdit = Boolean(id);
	const { actor, can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(EMPTY_FORM);
	const [audienceOpen, setAudienceOpen] = (0, import_react.useState)(false);
	const { data: existing, isLoading } = useQuery({
		queryKey: ["notice", id],
		queryFn: () => getNotice(id),
		enabled: isEdit
	});
	(0, import_react.useEffect)(() => {
		if (!existing) return;
		setForm({
			title: existing.title,
			summary: existing.summary,
			content: existing.content,
			featuredImage: existing.featuredImage,
			audience: existing.audience,
			priority: existing.priority,
			status: existing.status,
			publishAt: existing.publishAt,
			expiresAt: existing.expiresAt,
			pinned: existing.pinned
		});
	}, [existing]);
	const options = (0, import_react.useMemo)(() => audienceOptions(), []);
	const selectedKeys = new Set(form.audience.map(targetKey));
	const reach = (0, import_react.useMemo)(() => audienceReach(form.audience), [form.audience]);
	const patch = (next) => setForm((current) => ({
		...current,
		...next
	}));
	const toggleTarget = (target) => {
		const key = targetKey(target);
		setForm((current) => ({
			...current,
			audience: current.audience.some((t) => targetKey(t) === key) ? current.audience.filter((t) => targetKey(t) !== key) : [...current.audience, target]
		}));
	};
	const saveMutation = useMutation({
		mutationFn: async (status) => {
			const payload = {
				...form,
				status,
				publishAt: status === "published" ? (/* @__PURE__ */ new Date()).toISOString() : form.publishAt
			};
			if (isEdit && id) return updateNotice(id, payload, actor);
			return createNotice(payload, actor);
		},
		onSuccess: (notice) => {
			qc.invalidateQueries({ queryKey: ["notices"] });
			qc.invalidateQueries({ queryKey: ["notice", notice.id] });
			qc.invalidateQueries({ queryKey: ["overview"] });
			qc.invalidateQueries({ queryKey: ["notifications"] });
			toast.success(notice.status === "published" ? `“${notice.title}” published to ${formatNumber(reach)} recipients` : `“${notice.title}” saved as ${notice.status}`);
			navigate(`/admin/notices/${notice.id}`);
		},
		onError: (error) => toast.error(error.message)
	});
	const invalid = !form.title.trim() || !form.summary.trim() || form.audience.length === 0;
	const submit = (status) => {
		if (invalid) {
			toast.error("Add a title, a one-line summary and at least one audience.");
			return;
		}
		saveMutation.mutate(status);
	};
	if (isEdit && isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "notice-editor-page",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
			eyebrow: isEdit ? "Edit notice" : "New notice",
			title: form.title || (isEdit ? "Edit notice" : "Write a notice"),
			description: "Compose the announcement, choose who should see it, then save as a draft or publish.",
			meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
				value: form.status,
				testId: "notice-editor-status-chip"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
				className: "inline-flex items-center gap-1.5",
				"data-testid": "notice-editor-reach",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "h-3 w-3" }),
					" ",
					formatNumber(reach),
					" recipients"
				]
			})] }),
			actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "ghost",
					size: "sm",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/notices",
						"data-testid": "notice-editor-cancel",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " Cancel"]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					disabled: saveMutation.isPending,
					"data-testid": "notice-editor-save-draft",
					onClick: () => submit(form.status === "published" ? "published" : "draft"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3.5 w-3.5" }),
						" ",
						isEdit ? "Save changes" : "Save draft"
					]
				}),
				can("notices.publish") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					disabled: saveMutation.isPending,
					"data-testid": "notice-editor-publish",
					onClick: () => submit("published"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "h-3.5 w-3.5" }),
						" ",
						saveMutation.isPending ? "Working…" : "Publish now"
					]
				})
			] })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "grid gap-5 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-5 lg:col-span-2",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
					defaultValue: "write",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
							className: "mb-4 h-9",
							"data-testid": "notice-editor-tabs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "write",
								className: "h-7 px-3 text-xs",
								"data-testid": "notice-editor-tab-write",
								children: "Write"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "preview",
								className: "h-7 px-3 text-xs",
								"data-testid": "notice-editor-tab-preview",
								children: "Preview"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
							value: "write",
							className: "mt-0 space-y-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Content",
								testId: "notice-editor-content-panel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs",
												htmlFor: "notice-title",
												children: "Title *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												id: "notice-title",
												value: form.title,
												placeholder: "e.g. Parent–teacher meetings for Term 2",
												"data-testid": "notice-title-input",
												onChange: (event) => patch({ title: event.target.value })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs",
												htmlFor: "notice-summary",
												children: "Summary *"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												id: "notice-summary",
												rows: 2,
												value: form.summary,
												placeholder: "One line shown in lists, notifications and the website feed.",
												"data-testid": "notice-summary-input",
												onChange: (event) => patch({ summary: event.target.value })
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
												className: "text-xs",
												children: "Body"
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RichTextEditor, {
												value: form.content,
												onChange: (html) => patch({ content: html }),
												testId: "notice-content-editor"
											})]
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Featured image",
								description: "Optional — shown on the website and notice detail",
								testId: "notice-editor-image-panel",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
									value: form.featuredImage,
									onChange: (url) => patch({ featuredImage: url }),
									label: "Notice image",
									testId: "notice-image-uploader"
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
							value: "preview",
							className: "mt-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
								title: "Preview",
								description: "How recipients will read this notice",
								testId: "notice-editor-preview",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mb-2 flex flex-wrap items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: form.priority }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { value: form.status }),
													form.pinned && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "rounded-full bg-accent/14 px-2 py-0.5 text-xs font-medium text-accent",
														children: "Pinned"
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
												className: "font-display text-xl font-semibold tracking-[-0.02em] text-foreground",
												"data-testid": "notice-preview-title",
												children: form.title || "Untitled notice"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1.5 text-sm leading-relaxed text-muted-foreground",
												"data-testid": "notice-preview-summary",
												children: form.summary || "Add a summary to describe this notice in one line."
											})
										] }),
										form.featuredImage && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: form.featuredImage,
											alt: "",
											className: "aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "prose-editor",
											"data-testid": "notice-preview-body",
											dangerouslySetInnerHTML: { __html: form.content || "<p></p>" }
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs text-muted-foreground",
											children: ["Visible to: ", form.audience.map((target) => target.label).join(" · ")]
										})
									]
								})
							})
						})
					]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Publishing",
					testId: "notice-editor-publishing-panel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Status"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.status,
									onValueChange: (value) => patch({ status: value }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "notice-status-select",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "bg-popover",
										children: STATUSES.map((status) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: status.value,
											className: "text-xs",
											children: status.label
										}, status.value))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										htmlFor: "notice-publish-at",
										children: "Publish at"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "notice-publish-at",
										type: "datetime-local",
										value: toLocalInput(form.publishAt),
										"data-testid": "notice-publish-at",
										onChange: (event) => patch({ publishAt: fromLocalInput(event.target.value) })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "text-[11px] text-muted-foreground",
										children: [
											"Scheduled notices go live automatically at ",
											formatDateTime(form.publishAt),
											"."
										]
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									htmlFor: "notice-expires-at",
									children: "Expires (optional)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "notice-expires-at",
									type: "datetime-local",
									value: toLocalInput(form.expiresAt),
									"data-testid": "notice-expires-at",
									onChange: (event) => patch({ expiresAt: event.target.value ? fromLocalInput(event.target.value) : void 0 })
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Priority"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.priority,
									onValueChange: (value) => patch({ priority: value }),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "notice-priority-select",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, {
										className: "bg-popover",
										children: PRIORITIES.map((priority) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
											value: priority.value,
											className: "text-xs",
											children: [
												priority.label,
												" — ",
												priority.hint
											]
										}, priority.value))
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3 rounded-lg border border-hairline bg-surface-2 px-3 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-medium text-foreground",
										children: "Pin to top"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] text-muted-foreground",
										children: "Keeps this notice above the rest"
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
									checked: form.pinned,
									onCheckedChange: (checked) => patch({ pinned: checked }),
									"aria-label": "Pin notice to top",
									"data-testid": "notice-pinned-switch"
								})]
							})
						]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
					title: "Audience",
					description: `${formatNumber(reach)} people will receive this`,
					testId: "notice-editor-audience-panel",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popover, {
								open: audienceOpen,
								onOpenChange: setAudienceOpen,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverTrigger, {
									asChild: true,
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "w-full justify-between gap-2",
										"data-testid": "notice-audience-trigger",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "truncate text-xs",
											children: form.audience.length === 0 ? "Choose an audience" : `${form.audience.length} audience${form.audience.length === 1 ? "" : "s"} selected`
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "h-3.5 w-3.5 shrink-0" })]
									})
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PopoverContent, {
									align: "start",
									className: "w-[280px] bg-popover p-0",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
										className: "h-[280px]",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-1.5",
											children: options.map((option) => {
												const active = selectedKeys.has(targetKey(option));
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
													type: "button",
													"data-testid": `notice-audience-option-${targetKey(option)}`,
													onClick: () => toggleTarget(option),
													className: `flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-xs transition-colors focus-ring ${active ? "bg-primary/[0.08] text-foreground" : "text-muted-foreground hover:bg-secondary"}`,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
														className: "min-w-0 truncate",
														children: option.label
													}), active && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-3.5 w-3.5 shrink-0 text-primary" })]
												}, targetKey(option));
											})
										})
									})
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-wrap gap-1.5",
								"data-testid": "notice-audience-chips",
								children: [form.audience.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "No audience selected yet."
								}), form.audience.map((target) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground",
									children: [target.label, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-label": `Remove ${target.label}`,
										"data-testid": `notice-audience-remove-${targetKey(target)}`,
										onClick: () => toggleTarget(target),
										className: "rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-ring",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-2.5 w-2.5" })
									})]
								}, targetKey(target)))]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-[11px] leading-relaxed text-muted-foreground",
								children: ["Visible to: ", form.audience.length ? form.audience.map((t) => t.label).join(" · ") : "nobody yet"]
							})
						]
					})
				})]
			})]
		})]
	});
}
//#endregion
export { NoticeEditorPage };
