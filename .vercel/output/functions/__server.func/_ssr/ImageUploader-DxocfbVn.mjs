import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { CloudUpload, ImagePlus, Link2, LoaderCircle, Trash2 } from "../_libs/lucide-react.mjs";
import { toast } from "../_libs/sonner.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs-CWtZ7hop.mjs";
import { STOCK_LIBRARY, fileToDataUrl } from "./image-C7_1Gwhh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ImageUploader-DxocfbVn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ImageUploader({ value, onChange, label = "Featured image", aspect = "aspect-[16/9]", testId = "image-uploader" }) {
	const inputRef = (0, import_react.useRef)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [url, setUrl] = (0, import_react.useState)("");
	const [dragging, setDragging] = (0, import_react.useState)(false);
	const handleFiles = async (files) => {
		const file = files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			toast.error("Please choose an image file (PNG, JPG or WebP).");
			return;
		}
		setBusy(true);
		try {
			onChange(await fileToDataUrl(file));
			toast.success("Image ready");
		} catch (error) {
			toast.error(error instanceof Error ? error.message : "Upload failed");
		} finally {
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		"data-testid": testId,
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mb-1.5 text-xs font-medium text-foreground",
				children: label
			}),
			value ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "group relative overflow-hidden rounded-lg border border-hairline",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: value,
					alt: "",
					className: `w-full object-cover ${aspect}`
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "absolute right-2 top-2 flex gap-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						className: "h-7 gap-1 px-2 text-xs",
						"data-testid": `${testId}-replace`,
						onClick: () => inputRef.current?.click(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudUpload, { className: "h-3.5 w-3.5" }), " Replace"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						size: "sm",
						variant: "secondary",
						className: "h-7 gap-1 px-2 text-xs text-destructive",
						"data-testid": `${testId}-remove`,
						onClick: () => onChange(void 0),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "h-3.5 w-3.5" }), " Remove"]
					})]
				})]
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "upload",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "h-8",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "upload",
								className: "h-6 text-xs",
								"data-testid": `${testId}-tab-upload`,
								children: "Upload"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "url",
								className: "h-6 text-xs",
								"data-testid": `${testId}-tab-url`,
								children: "From URL"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
								value: "library",
								className: "h-6 text-xs",
								"data-testid": `${testId}-tab-library`,
								children: "Library"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "upload",
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => inputRef.current?.click(),
							onDragOver: (e) => {
								e.preventDefault();
								setDragging(true);
							},
							onDragLeave: () => setDragging(false),
							onDrop: (e) => {
								e.preventDefault();
								setDragging(false);
								handleFiles(e.dataTransfer.files);
							},
							"data-testid": `${testId}-dropzone`,
							className: `flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-7 text-center transition-colors focus-ring ${dragging ? "border-primary bg-primary/5" : "border-hairline bg-surface-2 hover:border-primary/40"}`,
							children: [
								busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "h-5 w-5 animate-spin text-primary" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImagePlus, { className: "h-5 w-5 text-muted-foreground" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-medium text-foreground",
									children: "Drop an image or click to browse"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] text-muted-foreground",
									children: "PNG, JPG or WebP · resized automatically"
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "url",
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link2, { className: "pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									value: url,
									placeholder: "https://…",
									className: "h-9 pl-8 text-sm",
									"data-testid": `${testId}-url-input`,
									onChange: (e) => setUrl(e.target.value)
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "sm",
								className: "h-9",
								"data-testid": `${testId}-url-apply`,
								disabled: !url.trim(),
								onClick: () => {
									onChange(url.trim());
									setUrl("");
								},
								children: "Use image"
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsContent, {
						value: "library",
						className: "mt-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-4 gap-2",
							children: STOCK_LIBRARY.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								title: item.label,
								"data-testid": `${testId}-library-item`,
								onClick: () => onChange(item.url),
								className: "overflow-hidden rounded-md border border-hairline transition-transform hover:scale-[1.02] focus-ring",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: item.url,
									alt: item.label,
									className: "aspect-[4/3] w-full object-cover",
									loading: "lazy"
								})
							}, item.url))
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				ref: inputRef,
				type: "file",
				accept: "image/*",
				className: "hidden",
				"data-testid": `${testId}-file-input`,
				onChange: (e) => void handleFiles(e.target.files)
			})
		]
	});
}
//#endregion
export { ImageUploader };
