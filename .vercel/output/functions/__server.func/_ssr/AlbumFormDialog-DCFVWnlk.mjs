import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { useMutation, useQueryClient } from "../_libs/tanstack__react-query.mjs";
import { toast } from "../_libs/sonner.mjs";
import { useAuth } from "./router-BSCuBY6S.mjs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./dialog-ST9L4J-Q.mjs";
import { Input } from "./input-BfuYswMi.mjs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select-D_cet0ff.mjs";
import { Label } from "./label-Cg_kTAc9.mjs";
import { Textarea } from "./textarea-BsWKtZCO.mjs";
import { createAlbum, updateAlbum } from "./communications-D6qF7rY7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/AlbumFormDialog-DCFVWnlk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var EMPTY = {
	title: "",
	description: "",
	visibility: "internal",
	eventId: void 0
};
function AlbumFormDialog({ open, onOpenChange, album, events, onSaved }) {
	const { actor } = useAuth();
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)(EMPTY);
	const [error, setError] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		if (!open) return;
		setError("");
		setForm(album ? {
			title: album.title,
			description: album.description,
			visibility: album.visibility,
			eventId: album.eventId
		} : EMPTY);
	}, [open, album]);
	const mutation = useMutation({
		mutationFn: () => album ? updateAlbum(album.id, form, actor) : createAlbum(form, actor),
		onSuccess: (saved) => {
			toast.success(album ? "Album updated" : `Album “${saved.title}” created`);
			qc.invalidateQueries({ queryKey: ["albums"] });
			qc.invalidateQueries({ queryKey: ["album", saved.id] });
			onOpenChange(false);
			onSaved?.(saved);
		},
		onError: (err) => setError(err.message)
	});
	const submit = () => {
		if (!form.title.trim()) {
			setError("Give the album a title so staff can find it later.");
			return;
		}
		mutation.mutate();
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
			className: "border-hairline bg-popover sm:max-w-lg",
			"data-testid": "album-form-dialog",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
					className: "font-display",
					children: album ? "Edit album" : "New album"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Albums group photos for events, campus life and achievements. Public albums can be surfaced on the website gallery block." })] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "album-title",
								className: "text-xs",
								children: "Title"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "album-title",
								value: form.title,
								placeholder: "Annual Sports Day 2026",
								"data-testid": "album-form-title",
								onChange: (event) => setForm((prev) => ({
									...prev,
									title: event.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "album-description",
								className: "text-xs",
								children: "Description"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								id: "album-description",
								value: form.description,
								rows: 3,
								placeholder: "Track finals, house relays and the closing ceremony.",
								"data-testid": "album-form-description",
								onChange: (event) => setForm((prev) => ({
									...prev,
									description: event.target.value
								}))
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-3.5 sm:grid-cols-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Visibility"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.visibility,
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										visibility: value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "album-form-visibility",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "bg-popover",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "public",
												"data-testid": "album-form-visibility-public",
												children: "Public — shown on the website"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "internal",
												"data-testid": "album-form-visibility-internal",
												children: "Internal — staff and guardians"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "private",
												"data-testid": "album-form-visibility-private",
												children: "Private — admin only"
											})
										]
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									className: "text-xs",
									children: "Linked event"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: form.eventId ?? "none",
									onValueChange: (value) => setForm((prev) => ({
										...prev,
										eventId: value === "none" ? void 0 : value
									})),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										"data-testid": "album-form-event",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Not linked" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, {
										className: "bg-popover",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "none",
											children: "Not linked"
										}), events.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: event.id,
											children: event.title
										}, event.id))]
									})]
								})]
							})]
						}),
						error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive",
							"data-testid": "album-form-error",
							children: error
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: () => onOpenChange(false),
					"data-testid": "album-form-cancel",
					children: "Cancel"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					disabled: mutation.isPending,
					onClick: submit,
					"data-testid": "album-form-submit",
					children: mutation.isPending ? "Saving…" : album ? "Save album" : "Create album"
				})] })
			]
		})
	});
}
//#endregion
export { AlbumFormDialog };
