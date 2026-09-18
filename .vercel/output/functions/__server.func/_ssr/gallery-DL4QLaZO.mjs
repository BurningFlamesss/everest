import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { CalendarDays, Ellipsis, ImagePlus, Images, Pencil, Trash2 } from "../_libs/lucide-react.mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-dKngB4cM.mjs";
import { Skeleton } from "./skeleton-Dhh7pexn.mjs";
import { formatDate, pluralize, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { FilterBar } from "./FilterBar-D_0nivrN.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./dropdown-menu-DcvOZRA8.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { deleteAlbum, listAlbums, listEvents } from "./communications-D6qF7rY7.mjs";
import { AlbumFormDialog } from "./AlbumFormDialog-DCFVWnlk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gallery-DL4QLaZO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function GalleryPage() {
	const { can } = useAuth();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor } = useAuth();
	const [search, setSearch] = (0, import_react.useState)("");
	const [visibility, setVisibility] = (0, import_react.useState)("all");
	const [formOpen, setFormOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)(null);
	const [pendingDelete, setPendingDelete] = (0, import_react.useState)(null);
	const canManage = can("gallery.manage");
	const { data: albums = [], isLoading, isError, refetch } = useQuery({
		queryKey: ["albums", search],
		queryFn: () => listAlbums(search)
	});
	const { data: events = [] } = useQuery({
		queryKey: ["events", "all"],
		queryFn: () => listEvents()
	});
	const removeMutation = useMutation({
		mutationFn: (id) => deleteAlbum(id, actor),
		onSuccess: () => {
			toast.success("Album deleted");
			setPendingDelete(null);
			qc.invalidateQueries({ queryKey: ["albums"] });
		},
		onError: (error) => toast.error(error.message)
	});
	const rows = (0, import_react.useMemo)(() => albums.filter((album) => visibility === "all" || album.visibility === visibility), [albums, visibility]);
	const totals = (0, import_react.useMemo)(() => {
		const images = albums.reduce((sum, album) => sum + album.images.length, 0);
		return {
			albums: albums.length,
			images,
			publicAlbums: albums.filter((album) => album.visibility === "public").length,
			linked: albums.filter((album) => album.eventId).length
		};
	}, [albums]);
	const eventName = (id) => events.find((event) => event.id === id)?.title;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "gallery-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Communications",
				title: "Gallery",
				description: "Photo albums for events, campus life and achievements — ready to publish to the school website.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-testid": "gallery-album-count",
						children: pluralize(totals.albums, "album")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						"data-testid": "gallery-image-count",
						children: pluralize(totals.images, "image")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [totals.publicAlbums, " public"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [totals.linked, " linked to events"] })
				] }),
				actions: canManage ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					className: "gap-1.5",
					"data-testid": "gallery-new-album",
					onClick: () => {
						setEditing(null);
						setFormOpen(true);
					},
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-3.5 w-3.5" }), " New album"]
				}) : null
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterBar, {
				testId: "gallery-filters",
				search,
				onSearchChange: setSearch,
				placeholder: "Search albums by title or description…",
				filters: [{
					key: "visibility",
					label: "Visibility",
					value: visibility,
					options: [
						{
							value: "all",
							label: "Any visibility"
						},
						{
							value: "public",
							label: "Public"
						},
						{
							value: "internal",
							label: "Internal"
						},
						{
							value: "private",
							label: "Private"
						}
					],
					onChange: setVisibility,
					width: "w-[160px]"
				}],
				onReset: () => {
					setSearch("");
					setVisibility("all");
				}
			}),
			isError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
					onRetry: () => refetch(),
					testId: "gallery-error"
				})
			}) : isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				"data-testid": "gallery-loading",
				children: Array.from({ length: 8 }).map((_, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "panel overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "aspect-[4/3] w-full rounded-none" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2 p-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3.5 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-3 w-1/3" })]
					})]
				}, index))
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "panel",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: Images,
					title: search || visibility !== "all" ? "No albums match these filters" : "No albums yet",
					description: search || visibility !== "all" ? "Try another search term or clear the visibility filter." : "Create your first album, then upload photos from an event or around the campus.",
					primaryLabel: canManage && !search && visibility === "all" ? "Create album" : void 0,
					onPrimary: () => {
						setEditing(null);
						setFormOpen(true);
					},
					secondaryLabel: search || visibility !== "all" ? "Clear filters" : void 0,
					onSecondary: () => {
						setSearch("");
						setVisibility("all");
					},
					testId: "gallery-empty"
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
				"data-testid": "gallery-album-grid",
				children: rows.map((album) => {
					const cover = album.images.find((image) => image.id === album.coverImageId) ?? album.images[0];
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "panel group flex flex-col overflow-hidden transition-colors duration-150 hover:border-primary/35",
						"data-testid": `gallery-album-card-${album.id}`,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => navigate(`/admin/gallery/${album.id}`),
							"aria-label": `Open ${album.title}`,
							"data-testid": `gallery-album-open-${album.id}`,
							className: "relative block aspect-[4/3] w-full overflow-hidden bg-surface-2 focus-ring",
							children: cover ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: cover.url,
								alt: "",
								loading: "lazy",
								className: "h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "grid h-full w-full place-items-center",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "h-6 w-6 text-muted-foreground" })
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 flex-1 flex-col p-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: `/admin/gallery/${album.id}`,
										className: "min-w-0 flex-1 rounded focus-ring",
										"data-testid": `gallery-album-link-${album.id}`,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
											className: "truncate font-display text-sm font-semibold text-foreground",
											children: album.title
										})
									}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenu, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuTrigger, {
										asChild: true,
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											"aria-label": "Album actions",
											"data-testid": `gallery-album-actions-${album.id}`,
											className: "shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-ring",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ellipsis, { className: "h-4 w-4" })
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuContent, {
										align: "end",
										className: "w-48 bg-popover",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuLabel, {
												className: "truncate text-xs",
												children: album.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuItem, {
												onClick: () => navigate(`/admin/gallery/${album.id}`),
												children: "Open album"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												"data-testid": `gallery-album-edit-${album.id}`,
												onClick: () => {
													setEditing(album);
													setFormOpen(true);
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "mr-2 h-3.5 w-3.5" }), " Edit details"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DropdownMenuSeparator, {}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DropdownMenuItem, {
												className: "text-destructive focus:text-destructive",
												"data-testid": `gallery-album-delete-${album.id}`,
												onClick: () => setPendingDelete(album),
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "mr-2 h-3.5 w-3.5" }), " Delete album"]
											})
										]
									})] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground",
									children: album.description || "No description yet."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-2.5 flex flex-wrap items-center gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "num inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground",
											"data-testid": `gallery-album-photos-${album.id}`,
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Images, { className: "h-3 w-3" }),
												" ",
												album.images.length
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
											value: album.visibility,
											testId: `gallery-album-visibility-${album.id}`
										}),
										album.eventId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: cn("inline-flex items-center gap-1 rounded-full border border-hairline px-2 py-0.5 text-[11px] text-muted-foreground"),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarDays, { className: "h-3 w-3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "max-w-[110px] truncate",
												children: eventName(album.eventId) ?? "Event"
											})]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-2.5 border-t border-hairline pt-2 text-[11px] text-muted-foreground",
									children: [
										"Updated ",
										relativeTime(album.updatedAt),
										" · created ",
										formatDate(album.createdAt)
									]
								})
							]
						})]
					}, album.id);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumFormDialog, {
				open: formOpen,
				album: editing,
				events,
				onOpenChange: (open) => {
					setFormOpen(open);
					if (!open) setEditing(null);
				},
				onSaved: (album) => {
					if (!editing) navigate(`/admin/gallery/${album.id}`);
				}
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(pendingDelete),
				onOpenChange: (open) => !open && setPendingDelete(null),
				title: "Delete this album?",
				description: `“${pendingDelete?.title}” and its ${pendingDelete?.images.length ?? 0} images will be removed from the gallery and the website. This cannot be undone.`,
				confirmLabel: "Delete album",
				destructive: true,
				busy: removeMutation.isPending,
				onConfirm: () => pendingDelete && removeMutation.mutate(pendingDelete.id),
				testId: "gallery-delete-confirm"
			})
		]
	});
}
var SplitComponent = GalleryPage;
//#endregion
export { SplitComponent as component };
