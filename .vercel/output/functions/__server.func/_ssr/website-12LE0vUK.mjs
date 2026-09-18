import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { CloudUpload, Globe, MousePointerClick, Pencil, RefreshCw, RotateCcw, Save, Search, Undo2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { BLOCK_FIELDS, pageSectionTypes, sectionDefaults, sectionLabel, str, useAuth } from "./router-BSCuBY6S.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Tabs, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { formatDateTime, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { PanelSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
import { ImageUploader } from "./ImageUploader-DxocfbVn.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/website-12LE0vUK.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Content-only editor for a fixed CMS section (text and image fields).
* The fixed-section pages have no style, visibility, duplicate or delete
* controls, so this intentionally stays leaner than the generic BlockInspector.
*/
function SectionEditor({ sectionType, fields, canManage, saving, onSave }) {
	const [draft, setDraft] = (0, import_react.useState)({});
	(0, import_react.useEffect)(() => {
		setDraft(fields ? JSON.parse(JSON.stringify(fields)) : {});
	}, [fields]);
	const dirty = (0, import_react.useMemo)(() => fields ? JSON.stringify(draft) !== JSON.stringify(fields) : false, [draft, fields]);
	if (!sectionType) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		eyebrow: "Section editor",
		title: "Nothing selected",
		testId: "cms-section-editor",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			compact: true,
			icon: MousePointerClick,
			title: "Click a section to edit it",
			description: "Choose a section from the list, or click one directly in the live preview.",
			testId: "cms-section-editor-empty"
		})
	});
	const defs = BLOCK_FIELDS[sectionType] ?? [];
	const set = (key, value) => setDraft((current) => ({
		...current,
		[key]: value
	}));
	const renderField = (field) => {
		const inputId = `cms-section-${sectionType}-${field.key}`;
		if (field.kind === "image") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageUploader, {
			value: str(draft, field.key) || void 0,
			label: field.label,
			testId: `cms-section-image-${field.key}`,
			onChange: (url) => set(field.key, url ?? "")
		}, field.key);
		if (field.kind === "textarea") return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					htmlFor: inputId,
					children: field.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					id: inputId,
					rows: 3,
					value: str(draft, field.key),
					disabled: !canManage,
					"data-testid": `cms-section-input-${field.key}`,
					onChange: (event) => set(field.key, event.target.value)
				}),
				field.help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: field.help
				})
			]
		}, field.key);
		return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-1.5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					htmlFor: inputId,
					children: field.label
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: inputId,
					type: field.kind === "number" ? "number" : field.kind === "date" ? "date" : "text",
					value: str(draft, field.key),
					placeholder: field.kind === "text" ? field.placeholder : void 0,
					disabled: !canManage,
					className: "h-9 text-sm",
					"data-testid": `cms-section-input-${field.key}`,
					onChange: (event) => set(field.key, field.kind === "number" ? Number(event.target.value) : event.target.value)
				}),
				field.help && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-[11px] text-muted-foreground",
					children: field.help
				})
			]
		}, field.key);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
		eyebrow: "Section editor",
		title: sectionLabel(sectionType),
		description: sectionType.replace(/_/g, " "),
		testId: "cms-section-editor",
		bodyClassName: "p-0",
		footer: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] text-muted-foreground",
				"data-testid": "cms-section-editor-dirty",
				children: dirty ? "Unsaved changes" : "All changes saved"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					className: "h-7 gap-1.5 px-2 text-xs",
					disabled: !dirty || saving,
					"data-testid": "cms-section-editor-reset",
					onClick: () => fields && setDraft(JSON.parse(JSON.stringify(fields))),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "h-3 w-3" }), " Reset"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "h-7 gap-1.5 px-2 text-xs",
					disabled: !dirty || saving,
					"data-testid": "cms-section-editor-save",
					onClick: () => onSave(draft),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "h-3 w-3" }),
						" ",
						saving ? "Saving…" : "Save section"
					]
				})]
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[11px] text-muted-foreground",
			children: "Your role can view but not edit website content."
		}),
		children: defs.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "p-4 text-sm text-muted-foreground",
			children: "This section has no editable fields."
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-4 p-4",
			children: defs.map(renderField)
		})
	});
}
/**
* HTTP client for the Prisma-backed website CMS.
*
* The admin panel used to read/write a localStorage mock via `@/services/website`.
* This module exposes the same function signatures but talks to the `/api/website/**`
* routes, which persist to Postgres. Swap the import in a page and annotations, audit
* and notifications now write to the real database (see `src/lib/website-content.ts`).
*/
async function api(url, init) {
	const headers = new Headers(init?.headers);
	if (init?.body) headers.set("Content-Type", "application/json");
	const response = await fetch(url, {
		...init,
		headers,
		credentials: "include"
	});
	if (!response.ok) {
		let message = `Request failed (${response.status})`;
		try {
			const data = await response.json();
			if (data?.error) message = String(data.error);
		} catch {}
		throw new Error(message);
	}
	return await response.json();
}
async function listWebsitePages() {
	const { pages } = await api("/api/website/pages");
	return pages;
}
async function getWebsitePage(key) {
	const response = await fetch(`/api/website/pages/${key}`, { credentials: "include" });
	if (response.status === 404) return null;
	if (!response.ok) throw new Error(`Failed to fetch page (${response.status})`);
	const { page } = await response.json();
	return page;
}
async function saveSectionFields(key, sectionType, fields, actor) {
	const { page } = await api(`/api/website/pages/${key}/sections/${sectionType}`, {
		method: "PATCH",
		body: JSON.stringify({
			fields,
			actor
		})
	});
	return page;
}
async function updatePageSeo(key, seo, actor) {
	const { page } = await api(`/api/website/pages/${key}`, {
		method: "PATCH",
		body: JSON.stringify({
			seo,
			actor
		})
	});
	return page;
}
async function publishPage(key, actor) {
	const { page } = await api(`/api/website/pages/${key}/publish`, {
		method: "POST",
		body: JSON.stringify({ actor })
	});
	return page;
}
async function unpublishPage(key, actor) {
	const { page } = await api(`/api/website/pages/${key}/unpublish`, {
		method: "POST",
		body: JSON.stringify({ actor })
	});
	return page;
}
var PAGE_KEYS = [
	"home",
	"about",
	"courses",
	"facilities",
	"gallery",
	"calendar",
	"contact",
	"resources",
	"result",
	"transportation",
	"notices",
	"scholarship",
	"faculty",
	"login",
	"activate"
];
function clone(value) {
	return JSON.parse(JSON.stringify(value));
}
function WebsiteContentPage() {
	const { actor, can } = useAuth();
	const canManage = can("website.manage");
	const qc = useQueryClient();
	const navigate = useNavigate();
	const rawKey = (useSearch({ strict: false }) || {}).page;
	const pageKey = rawKey && PAGE_KEYS.includes(rawKey) ? rawKey : "faculty";
	const [selectedType, setSelectedType] = (0, import_react.useState)(null);
	const [iframeVersion, setIframeVersion] = (0, import_react.useState)(0);
	const [seoOpen, setSeoOpen] = (0, import_react.useState)(false);
	const [seoDraft, setSeoDraft] = (0, import_react.useState)({
		title: "",
		description: "",
		keywords: ""
	});
	const { data: pages = [] } = useQuery({
		queryKey: ["website-pages"],
		queryFn: async () => clone(await listWebsitePages())
	});
	const { data: page, isLoading } = useQuery({
		queryKey: ["website-page", pageKey],
		queryFn: async () => {
			const found = await getWebsitePage(pageKey);
			return found ? clone(found) : null;
		}
	});
	(0, import_react.useEffect)(() => {
		setSelectedType(null);
	}, [pageKey]);
	(0, import_react.useEffect)(() => {
		if (page) setSeoDraft({
			title: page.seoTitle,
			description: page.seoDescription,
			keywords: page.seoKeywords
		});
	}, [page]);
	(0, import_react.useEffect)(() => {
		const onMessage = (event) => {
			const data = event.data;
			if (data?.source !== "scms-cms" || data?.type !== "select-section") return;
			if (typeof data.sectionType === "string") setSelectedType(data.sectionType);
		};
		window.addEventListener("message", onMessage);
		return () => window.removeEventListener("message", onMessage);
	}, []);
	const sectionTypes = (0, import_react.useMemo)(() => pageSectionTypes(pageKey), [pageKey]);
	const selectedBlock = page?.blocks.find((block) => block.type === selectedType) ?? null;
	const selectedFields = selectedType ? selectedBlock?.fields ?? sectionDefaults(selectedType) : void 0;
	const applyPage = (next) => {
		qc.setQueryData(["website-page", next.key], clone(next));
		qc.invalidateQueries({ queryKey: ["website-pages"] });
		qc.invalidateQueries({ queryKey: ["overview"] });
		qc.invalidateQueries({ queryKey: ["activity"] });
	};
	const saveSection = useMutation({
		mutationFn: (fields) => {
			if (!selectedType) throw new Error("No section selected");
			return saveSectionFields(pageKey, selectedType, fields, actor);
		},
		onSuccess: (next) => {
			applyPage(next);
			setIframeVersion((version) => version + 1);
			toast.success("Section saved");
		},
		onError: (error) => toast.error(error.message)
	});
	const seoMutation = useMutation({
		mutationFn: () => updatePageSeo(pageKey, seoDraft, actor),
		onSuccess: (next) => {
			applyPage(next);
			setSeoOpen(false);
			toast.success("Search settings saved");
		},
		onError: (error) => toast.error(error.message)
	});
	const publishMutation = useMutation({
		mutationFn: () => publishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			qc.invalidateQueries({ queryKey: ["notifications"] });
			toast.success(`${next.title} is live`);
		},
		onError: (error) => toast.error(error.message)
	});
	const unpublishMutation = useMutation({
		mutationFn: () => unpublishPage(pageKey, actor),
		onSuccess: (next) => {
			applyPage(next);
			toast.success(`${next.title} reverted to draft`);
		},
		onError: (error) => toast.error(error.message)
	});
	const changePage = (value) => {
		navigate({
			search: (prev) => {
				const next = { ...prev };
				next.page = value;
				return next;
			},
			replace: true
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "website-content-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				wash: true,
				eyebrow: "Website",
				title: "Website Content",
				description: "Preview each page and click a section to edit its content — changes are saved to the database and shown to visitors after publishing.",
				meta: page ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: page.status,
						testId: "cms-page-status"
					}),
					page.hasUnpublishedChanges && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "inline-flex items-center gap-1.5 rounded-full bg-accent/14 px-2 py-0.5 text-accent",
						"data-testid": "cms-unpublished-chip",
						children: "Unpublished changes"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-mono text-[11px]",
						"data-testid": "cms-page-path",
						children: page.path
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "cms-page-updated",
						children: [
							"Updated ",
							relativeTime(page.updatedAt),
							" by ",
							page.updatedBy
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-testid": "cms-page-published",
						children: page.publishedAt ? `Published ${formatDateTime(page.publishedAt)}` : "Never published"
					})
				] }) : null,
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "cms-seo-open",
						onClick: () => setSeoOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "h-3.5 w-3.5" }), " Search settings"]
					}),
					canManage && page?.status === "published" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						disabled: unpublishMutation.isPending,
						"data-testid": "cms-unpublish-button",
						onClick: () => unpublishMutation.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Undo2, { className: "h-3.5 w-3.5" }), " Unpublish"]
					}),
					canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						disabled: publishMutation.isPending,
						"data-testid": "cms-publish-button",
						onClick: () => publishMutation.mutate(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-3.5 w-3.5" }), publishMutation.isPending ? "Publishing…" : "Publish"]
					})
				] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-4 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tabs, {
					value: pageKey,
					onValueChange: changePage,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsList, {
						className: "h-9",
						"data-testid": "cms-page-tabs",
						children: PAGE_KEYS.map((key) => {
							const entry = pages.find((item) => item.key === key);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
								value: key,
								className: "h-7 gap-1.5 px-3 text-xs",
								"data-testid": `cms-page-tab-${key}`,
								children: [entry?.title ?? key, entry?.hasUnpublishedChanges && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-1.5 w-1.5 rounded-full bg-accent" })]
							}, key);
						})
					})
				})
			}),
			isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-80" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-80" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelSkeleton, { height: "h-80" })
					})
				]
			}) : !page ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Globe,
					title: "That page isn't set up yet",
					description: "Choose Faculty & Administration or Sign in from the tabs above.",
					testId: "cms-page-missing"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-5 xl:grid-cols-12",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Page sections",
							title: `${sectionTypes.length} fixed sections`,
							description: "Sections are defined by the page design",
							testId: "cms-outline",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "space-y-1.5",
								"data-testid": "cms-section-list",
								children: sectionTypes.map((type) => {
									const saved = page.blocks.some((block) => block.type === type);
									const active = type === selectedType;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => setSelectedType(type),
										className: cn("flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors", active ? "border-accent bg-accent/10" : "border-hairline bg-surface-2 hover:bg-surface-1"),
										"data-testid": `cms-section-button-${type}`,
										"data-active": active,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-xs font-medium text-foreground",
												children: sectionLabel(type)
											})]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("rounded-full px-2 py-0.5 text-[10px] leading-normal", saved ? "bg-accent/14 text-accent" : "border border-dashed border-hairline text-muted-foreground"),
											children: saved ? "Saved" : "Default"
										})]
									}) }, type);
								})
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-6",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
							eyebrow: "Live preview",
							title: page.title,
							description: page.path,
							testId: "cms-preview",
							bodyClassName: "p-0",
							actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								className: "h-7 gap-1.5 px-2 text-xs",
								"data-testid": "cms-preview-reload",
								onClick: () => setIframeVersion((version) => version + 1),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "h-3 w-3" }), " Reload"]
							}),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
								src: `${page.path}?cms=1`,
								title: `Live preview: ${page.title}`,
								"data-testid": "cms-live-preview",
								className: "h-[calc(100vh-240px)] min-h-[560px] w-full border-0 bg-[#FEF2F2]"
							}, iframeVersion)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "xl:col-span-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionEditor, {
							sectionType: selectedType,
							fields: selectedFields,
							canManage,
							saving: saveSection.isPending,
							onSave: (fields) => saveSection.mutate(fields)
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: seoOpen,
				onOpenChange: setSeoOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-lg",
					"data-testid": "cms-seo-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Search settings"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "How this page appears in search results and link previews." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										htmlFor: "cms-seo-title",
										children: "Meta title"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "cms-seo-title",
										value: seoDraft.title,
										disabled: !canManage,
										"data-testid": "cms-seo-title",
										onChange: (event) => setSeoDraft({
											...seoDraft,
											title: event.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										htmlFor: "cms-seo-description",
										children: "Meta description"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
										id: "cms-seo-description",
										rows: 3,
										value: seoDraft.description,
										disabled: !canManage,
										"data-testid": "cms-seo-description",
										onChange: (event) => setSeoDraft({
											...seoDraft,
											description: event.target.value
										})
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										className: "text-xs",
										htmlFor: "cms-seo-keywords",
										children: "Keywords"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "cms-seo-keywords",
										value: seoDraft.keywords,
										disabled: !canManage,
										"data-testid": "cms-seo-keywords",
										onChange: (event) => setSeoDraft({
											...seoDraft,
											keywords: event.target.value
										})
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							"data-testid": "cms-seo-cancel",
							onClick: () => setSeoOpen(false),
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: !canManage || seoMutation.isPending,
							"data-testid": "cms-seo-save",
							onClick: () => seoMutation.mutate(),
							children: seoMutation.isPending ? "Saving…" : "Save settings"
						})] })
					]
				})
			})
		]
	});
}
var SplitComponent = WebsiteContentPage;
//#endregion
export { SplitComponent as component };
