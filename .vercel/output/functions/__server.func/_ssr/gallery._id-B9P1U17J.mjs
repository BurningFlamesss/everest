import { __toESM } from "../_runtime.mjs";
import { cn } from "./utils-OyjWw23L.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { Link, useNavigate, useParams } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ChevronLeft, ChevronRight, CloudUpload, GripVertical, ImagePlus, Images, LoaderCircle, Maximize2, Pencil, Star, Trash2, X } from "../_libs/lucide-react.mjs";
import { CSS, DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors } from "../_libs/@dnd-kit/core+[...].mjs";
import { useMutation, useQuery, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { formatDateTime, relativeTime } from "./format-BBWmN55e.mjs";
import { PageHeader } from "./PageHeader-CM0cVttf.mjs";
import { Panel } from "./Panel-DSd1zziT.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { DetailSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { EmptyState } from "./EmptyState-mZa6dqTp.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { StatusBadge } from "./StatusBadge-DB03URu0.mjs";
import { ConfirmDialog } from "./ConfirmDialog-DxqxYgln.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { STOCK_LIBRARY, fileToDataUrl } from "./image-C7_1Gwhh.mjs";
import { addAlbumImages, deleteAlbum, deleteAlbumImage, getAlbum, listEvents, reorderAlbumImages, setAlbumCover, updateAlbum, updateAlbumImage } from "./communications-D6qF7rY7.mjs";
import { AlbumFormDialog } from "./AlbumFormDialog-DCFVWnlk.mjs";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates, useSortable } from "../_libs/dnd-kit__sortable.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/gallery._id-B9P1U17J.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Focused image viewer. Deliberately hand-rolled rather than a Dialog so the
* image can fill the viewport while keeping keyboard paging cheap.
*/
function Lightbox({ images, index, onIndexChange, onClose, albumTitle }) {
	const open = index !== null && index >= 0 && index < images.length;
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const onKey = (event) => {
			if (event.key === "Escape") onClose();
			if (event.key === "ArrowRight") onIndexChange((index + 1) % images.length);
			if (event.key === "ArrowLeft") onIndexChange((index - 1 + images.length) % images.length);
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [
		open,
		index,
		images.length,
		onClose,
		onIndexChange
	]);
	if (!open) return null;
	const image = images[index];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-[200] flex flex-col bg-surface-0",
		role: "dialog",
		"aria-modal": "true",
		"aria-label": `${albumTitle} image viewer`,
		"data-testid": "gallery-lightbox",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-sm font-medium text-foreground",
					"data-testid": "gallery-lightbox-caption",
					children: image.caption || "Untitled"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "num truncate text-xs text-muted-foreground",
					children: [
						albumTitle,
						" · ",
						index + 1,
						" of ",
						images.length,
						" · ",
						formatDateTime(image.uploadedAt)
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-1.5",
				children: [image.featured && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-accent/14 px-2 py-0.5 text-xs text-accent",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3 w-3" }), " Cover"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": "Close viewer",
					"data-testid": "gallery-lightbox-close",
					onClick: onClose,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-4 w-4" })
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "relative flex min-h-0 flex-1 items-center justify-center p-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					className: "absolute left-4 top-1/2 -translate-y-1/2",
					"aria-label": "Previous image",
					"data-testid": "gallery-lightbox-prev",
					onClick: () => onIndexChange((index - 1 + images.length) % images.length),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-4 w-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image.url,
					alt: image.caption,
					className: "max-h-full max-w-full rounded-xl border border-hairline object-contain",
					"data-testid": "gallery-lightbox-image"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					size: "icon",
					className: "absolute right-4 top-1/2 -translate-y-1/2",
					"aria-label": "Next image",
					"data-testid": "gallery-lightbox-next",
					onClick: () => onIndexChange((index + 1) % images.length),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-4 w-4" })
				})
			]
		})]
	});
}
/** Masonry tile with hover-revealed actions and a drag handle. */
function SortableImageTile({ image, index, canManage, isCover, spanClass, onOpen, onEditCaption, onSetCover, onDelete }) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: image.id,
		disabled: !canManage
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("figure", {
		ref: setNodeRef,
		style: {
			transform: CSS.Transform.toString(transform),
			transition
		},
		"data-testid": `gallery-image-tile-${image.id}`,
		className: cn("group relative flex flex-col overflow-hidden rounded-xl border bg-surface-1", spanClass, isCover ? "border-accent/50" : "border-hairline", isDragging && "z-10 opacity-90 shadow-pop"),
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: onOpen,
				"aria-label": `Open ${image.caption || "image"}`,
				"data-testid": `gallery-image-open-${image.id}`,
				className: "min-h-0 w-full flex-1 overflow-hidden focus-ring",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: image.url,
					alt: image.caption,
					loading: "lazy",
					className: "h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "num rounded border border-hairline bg-surface-1 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground",
					children: String(index + 1).padStart(2, "0")
				}), isCover && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-2.5 w-2.5" }), " Cover"]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "row-actions absolute right-2 top-9 flex flex-col gap-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "icon",
					className: "h-7 w-7",
					"aria-label": "Open image",
					"data-testid": `gallery-image-expand-${image.id}`,
					onClick: onOpen,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize2, { className: "h-3.5 w-3.5" })
				}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						className: "h-7 w-7",
						"aria-label": "Edit caption",
						"data-testid": `gallery-image-caption-${image.id}`,
						onClick: onEditCaption,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						className: "h-7 w-7",
						"aria-label": "Set as cover",
						disabled: isCover,
						"data-testid": `gallery-image-cover-${image.id}`,
						onClick: onSetCover,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Star, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						size: "icon",
						className: "h-7 w-7 text-destructive",
						"aria-label": "Delete image",
						"data-testid": `gallery-image-delete-${image.id}`,
						onClick: onDelete,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						"aria-label": "Drag to reorder",
						"data-testid": `gallery-image-drag-${image.id}`,
						className: "grid h-7 w-7 cursor-grab place-items-center rounded-md border border-hairline bg-secondary text-muted-foreground transition-colors hover:text-foreground active:cursor-grabbing focus-ring",
						...attributes,
						...listeners,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GripVertical, { className: "h-3.5 w-3.5" })
					})
				] })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("figcaption", {
				className: "shrink-0 border-t border-hairline px-2.5 py-1.5",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "truncate text-[11px] text-foreground",
					"data-testid": `gallery-image-caption-text-${image.id}`,
					children: image.caption || "Untitled"
				})
			})
		]
	});
}
function AlbumDetailPage() {
	const { id = "" } = useParams();
	const navigate = useNavigate();
	const qc = useQueryClient();
	const { actor, can } = useAuth();
	const canManage = can("gallery.manage");
	const [uploadOpen, setUploadOpen] = (0, import_react.useState)(false);
	const [staged, setStaged] = (0, import_react.useState)([]);
	const [reading, setReading] = (0, import_react.useState)(false);
	const [editOpen, setEditOpen] = (0, import_react.useState)(false);
	const [captionTarget, setCaptionTarget] = (0, import_react.useState)(null);
	const [captionDraft, setCaptionDraft] = (0, import_react.useState)("");
	const [lightboxIndex, setLightboxIndex] = (0, import_react.useState)(null);
	const [imageToDelete, setImageToDelete] = (0, import_react.useState)(null);
	const [albumDeleteOpen, setAlbumDeleteOpen] = (0, import_react.useState)(false);
	const fileRef = (0, import_react.useRef)(null);
	const { data: album, isLoading, isError, refetch } = useQuery({
		queryKey: ["album", id],
		queryFn: () => getAlbum(id),
		enabled: Boolean(id)
	});
	const { data: events = [] } = useQuery({
		queryKey: ["events", "all"],
		queryFn: () => listEvents()
	});
	const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
	const invalidate = (saved) => {
		qc.invalidateQueries({ queryKey: ["album", id] });
		qc.invalidateQueries({ queryKey: ["albums"] });
		if (saved) qc.setQueryData(["album", id], saved);
	};
	const uploadMutation = useMutation({
		mutationFn: () => addAlbumImages(id, staged.map(({ url, caption }) => ({
			url,
			caption
		})), actor),
		onSuccess: (saved) => {
			toast.success(`${staged.length} image${staged.length === 1 ? "" : "s"} added to “${saved.title}”`);
			setStaged([]);
			setUploadOpen(false);
			invalidate(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const captionMutation = useMutation({
		mutationFn: () => updateAlbumImage(id, captionTarget.id, { caption: captionDraft }),
		onSuccess: (saved) => {
			toast.success("Caption updated");
			setCaptionTarget(null);
			invalidate(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const coverMutation = useMutation({
		mutationFn: (imageId) => setAlbumCover(id, imageId),
		onSuccess: (saved) => {
			toast.success("Album cover updated");
			invalidate(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteImageMutation = useMutation({
		mutationFn: (imageId) => deleteAlbumImage(id, imageId),
		onSuccess: (saved) => {
			toast.success("Image removed");
			setImageToDelete(null);
			invalidate(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const reorderMutation = useMutation({
		mutationFn: (orderedIds) => reorderAlbumImages(id, orderedIds),
		onSuccess: (saved) => invalidate(saved),
		onError: (error) => toast.error(error.message)
	});
	const visibilityMutation = useMutation({
		mutationFn: (visibility) => updateAlbum(id, { visibility }, actor),
		onSuccess: (saved) => {
			toast.success(`Album is now ${saved.visibility}`);
			invalidate(saved);
		},
		onError: (error) => toast.error(error.message)
	});
	const deleteAlbumMutation = useMutation({
		mutationFn: () => deleteAlbum(id, actor),
		onSuccess: () => {
			toast.success("Album deleted");
			qc.invalidateQueries({ queryKey: ["albums"] });
			navigate("/admin/gallery");
		},
		onError: (error) => toast.error(error.message)
	});
	const images = (0, import_react.useMemo)(() => album?.images ?? [], [album]);
	const onDragEnd = (event) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;
		const ids = images.map((image) => image.id);
		const from = ids.indexOf(String(active.id));
		const to = ids.indexOf(String(over.id));
		if (from < 0 || to < 0) return;
		reorderMutation.mutate(arrayMove(ids, from, to));
	};
	const stageFiles = async (files) => {
		if (!files?.length) return;
		setReading(true);
		try {
			const next = [];
			for (const file of Array.from(files)) {
				if (!file.type.startsWith("image/")) continue;
				const url = await fileToDataUrl(file, 1400, .72);
				next.push({
					id: `${file.name}-${next.length}-${Date.now()}`,
					url,
					caption: file.name.replace(/\.[^.]+$/, "")
				});
			}
			if (!next.length) toast.error("Those files were not readable images.");
			setStaged((prev) => [...prev, ...next]);
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setReading(false);
		}
	};
	if (isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DetailSkeleton, {});
	if (isError) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, {
			onRetry: () => refetch(),
			testId: "album-detail-error"
		})
	});
	if (!album) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "panel",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
			icon: Images,
			title: "Album not found",
			description: "This album may have been deleted. Head back to the gallery to pick another one.",
			primaryLabel: "Back to gallery",
			onPrimary: () => navigate("/admin/gallery"),
			testId: "album-detail-missing"
		})
	});
	const linkedEvent = events.find((event) => event.id === album.eventId);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": "album-detail-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				eyebrow: "Gallery",
				title: album.title,
				description: album.description || "No description yet.",
				meta: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						"data-testid": "album-image-count",
						children: [album.images.length, " images"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Updated ", relativeTime(album.updatedAt)] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, {
						value: album.visibility,
						testId: "album-visibility-badge"
					}),
					linkedEvent && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: `/admin/events/${linkedEvent.id}`,
						className: "text-primary hover:underline",
						"data-testid": "album-event-link",
						children: linkedEvent.title
					})
				] }),
				actions: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					className: "gap-1.5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
						to: "/admin/gallery",
						"data-testid": "album-back",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "h-3.5 w-3.5" }), " All albums"]
					})
				}), canManage && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: album.visibility,
						onValueChange: (value) => visibilityMutation.mutate(value),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-9 w-[140px] border-hairline bg-surface-1 text-xs",
							"data-testid": "album-visibility-select",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
							className: "bg-popover",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "public",
									className: "text-xs",
									children: "Public"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "internal",
									className: "text-xs",
									children: "Internal"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "private",
									className: "text-xs",
									children: "Private"
								})
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5",
						"data-testid": "album-edit",
						onClick: () => setEditOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "h-3.5 w-3.5" }), " Edit"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "gap-1.5 text-destructive",
						"data-testid": "album-delete",
						onClick: () => setAlbumDeleteOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Delete"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						className: "gap-1.5",
						"data-testid": "album-upload-open",
						onClick: () => setUploadOpen(true),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-3.5 w-3.5" }), " Upload images"]
					})
				] })] })
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Panel, {
				eyebrow: "Photos",
				title: "Album contents",
				description: canManage ? "Drag the handle to reorder · hover a photo for actions" : "Hover a photo to open it",
				bodyClassName: "p-4",
				testId: "album-images-panel",
				children: images.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
					icon: ImagePlus,
					title: "No photos in this album",
					description: "Upload photos from your device or pick a few from the sample library to get started.",
					primaryLabel: canManage ? "Upload images" : void 0,
					onPrimary: () => setUploadOpen(true),
					testId: "album-images-empty"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DndContext, {
					sensors,
					collisionDetection: closestCenter,
					onDragEnd,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableContext, {
						items: images.map((image) => image.id),
						strategy: rectSortingStrategy,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid auto-rows-[130px] grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4",
							"data-testid": "album-masonry",
							children: images.map((image, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SortableImageTile, {
								image,
								index,
								canManage,
								isCover: album.coverImageId === image.id,
								spanClass: index % 7 === 0 || index % 7 === 4 ? "row-span-3" : "row-span-2",
								onOpen: () => setLightboxIndex(index),
								onEditCaption: () => {
									setCaptionTarget(image);
									setCaptionDraft(image.caption);
								},
								onSetCover: () => coverMutation.mutate(image.id),
								onDelete: () => setImageToDelete(image)
							}, image.id))
						})
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: uploadOpen,
				onOpenChange: (open) => {
					setUploadOpen(open);
					if (!open) setStaged([]);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[90vh] overflow-y-auto bg-popover sm:max-w-2xl",
					"data-testid": "album-upload-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "font-display",
							children: [
								"Upload to “",
								album.title,
								"”"
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Images are resized in the browser and stored with this demo dataset — nothing is sent to a server." })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => fileRef.current?.click(),
									onDragOver: (event) => event.preventDefault(),
									onDrop: (event) => {
										event.preventDefault();
										stageFiles(event.dataTransfer.files);
									},
									"data-testid": "album-upload-dropzone",
									className: "flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-hairline bg-surface-2 px-6 py-8 text-center transition-colors hover:border-primary/45 focus-ring",
									children: [
										reading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-5 w-5 text-muted-foreground" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-sm font-medium text-foreground",
											children: "Drop photos or click to browse"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-xs text-muted-foreground",
											children: "Multiple files supported · PNG, JPG or WebP"
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mb-2 text-xs font-medium text-muted-foreground",
									children: "Or add from the sample library"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-4 gap-2 sm:grid-cols-8",
									children: STOCK_LIBRARY.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										title: item.label,
										"data-testid": "album-upload-library-item",
										onClick: () => setStaged((prev) => [...prev, {
											id: `${item.url}-${prev.length}`,
											url: item.url,
											caption: item.label
										}]),
										className: "overflow-hidden rounded-md border border-hairline transition-transform duration-150 hover:scale-[1.03] focus-ring",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
											src: item.url,
											alt: item.label,
											className: "aspect-square w-full object-cover",
											loading: "lazy"
										})
									}, item.url))
								})] }),
								staged.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "rounded-xl border border-hairline",
									"data-testid": "album-upload-staged",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center justify-between border-b border-hairline px-3 py-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs font-medium text-foreground",
											children: [staged.length, " ready to upload — captions are editable"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "button",
											className: "text-xs text-muted-foreground underline-offset-2 hover:underline",
											"data-testid": "album-upload-clear",
											onClick: () => setStaged([]),
											children: "Clear"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "max-h-[240px] divide-y divide-hairline overflow-y-auto",
										children: staged.map((item, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "flex items-center gap-3 px-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
													src: item.url,
													alt: "",
													className: "h-10 w-14 shrink-0 rounded border border-hairline object-cover"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: item.caption,
													className: "h-8 flex-1 border-hairline bg-surface-1 text-xs",
													"data-testid": `album-upload-caption-${index}`,
													onChange: (event) => setStaged((prev) => prev.map((row) => row.id === item.id ? {
														...row,
														caption: event.target.value
													} : row))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													"aria-label": "Remove from upload",
													className: "rounded p-1 text-muted-foreground hover:text-destructive focus-ring",
													"data-testid": `album-upload-remove-${index}`,
													onClick: () => setStaged((prev) => prev.filter((row) => row.id !== item.id)),
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "h-3.5 w-3.5" })
												})
											]
										}, item.id))
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								setUploadOpen(false);
								setStaged([]);
							},
							"data-testid": "album-upload-cancel",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: staged.length === 0 || uploadMutation.isPending,
							"data-testid": "album-upload-submit",
							onClick: () => uploadMutation.mutate(),
							children: uploadMutation.isPending ? "Uploading…" : `Upload ${staged.length || ""} image${staged.length === 1 ? "" : "s"}`
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: fileRef,
				type: "file",
				accept: "image/*",
				multiple: true,
				className: "hidden",
				"data-testid": "album-upload-file-input",
				onChange: (event) => void stageFiles(event.target.files)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: Boolean(captionTarget),
				onOpenChange: (open) => !open && setCaptionTarget(null),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "bg-popover sm:max-w-md",
					"data-testid": "album-caption-dialog",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
							className: "font-display",
							children: "Edit caption"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Captions appear under the photo in the gallery and on the public website." })] }),
						captionTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: captionTarget.url,
									alt: "",
									className: "aspect-[16/9] w-full rounded-lg border border-hairline object-cover"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "caption-input",
										className: "text-xs",
										children: "Caption"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "caption-input",
										value: captionDraft,
										"data-testid": "album-caption-input",
										onChange: (event) => setCaptionDraft(event.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground",
									children: ["Uploaded ", formatDateTime(captionTarget.uploadedAt)]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setCaptionTarget(null),
							"data-testid": "album-caption-cancel",
							children: "Cancel"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							disabled: captionMutation.isPending,
							"data-testid": "album-caption-save",
							onClick: () => captionMutation.mutate(),
							children: captionMutation.isPending ? "Saving…" : "Save caption"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlbumFormDialog, {
				open: editOpen,
				album,
				events,
				onOpenChange: setEditOpen
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lightbox, {
				images,
				index: lightboxIndex,
				albumTitle: album.title,
				onIndexChange: setLightboxIndex,
				onClose: () => setLightboxIndex(null)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: Boolean(imageToDelete),
				onOpenChange: (open) => !open && setImageToDelete(null),
				title: "Remove this image?",
				description: "The photo will be removed from this album. If it was the cover, the next image becomes the cover.",
				confirmLabel: "Remove image",
				destructive: true,
				busy: deleteImageMutation.isPending,
				onConfirm: () => imageToDelete && deleteImageMutation.mutate(imageToDelete.id),
				testId: "album-image-delete-confirm"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConfirmDialog, {
				open: albumDeleteOpen,
				onOpenChange: setAlbumDeleteOpen,
				title: "Delete this album?",
				description: `“${album.title}” and its ${album.images.length} images will be removed. This cannot be undone.`,
				confirmLabel: "Delete album",
				destructive: true,
				busy: deleteAlbumMutation.isPending,
				onConfirm: () => deleteAlbumMutation.mutate(),
				testId: "album-delete-confirm"
			})
		]
	});
}
var SplitComponent = AlbumDetailPage;
//#endregion
export { SplitComponent as component };
