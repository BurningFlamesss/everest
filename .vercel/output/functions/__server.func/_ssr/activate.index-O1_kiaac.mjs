import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Link, useNavigate, useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CircleAlert } from "../_libs/lucide-react.mjs";
import { Button, ImageReveal, Input, Label, Route$21, SectionLabel, useWebsitePageContent } from "./router-dKngB4cM.mjs";
import { pageCopy } from "./site-D2pkIopk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate.index-O1_kiaac.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function pick(blocks, type) {
	return blocks.find((b) => b.type === type);
}
function CmsSectionBox({ type, children, onSelect, active }) {
	if (!onSelect) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		onClick: (e) => {
			e.stopPropagation();
			onSelect(type);
		},
		className: `relative cursor-pointer ring-inset transition-all hover:ring-2 hover:ring-primary ${active ? "ring-2 ring-primary" : "ring-0 ring-transparent"}`,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "pointer-events-none absolute inset-0 z-50 bg-primary/0 transition-colors hover:bg-primary/5" }), children]
	});
}
function RouteComponent() {
	const cms = (useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$21.useLoaderData();
	const published = useWebsitePageContent("activate");
	const preview = String(cms ?? "") === "1";
	const blocks = (preview ? previewPage : published)?.blocks || [];
	const onSelectSection = preview ? (sectionType) => {
		window.parent?.postMessage({
			source: "scms-cms",
			type: "select-section",
			pageKey: "activate",
			sectionType
		}, "*");
	} : void 0;
	const visual = pick(blocks, "auth_visual");
	const intro = pick(blocks, "auth_intro");
	const formBlock = pick(blocks, "auth_form");
	const [token, setToken] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const navigate = useNavigate();
	const submit = (e) => {
		e.preventDefault();
		if (!token.trim()) {
			setError("Please enter your activation code.");
			return;
		}
		const safe = encodeURIComponent(token.trim()).replace(/\/+$/, "");
		navigate({ to: `/_onboard/activate/${safe}` });
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "auth-page overflow-x-hidden min-w-0",
		"aria-labelledby": "activate-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
			type: "auth_visual",
			onSelect: onSelectSection,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-visual min-w-0",
				style: {
					height: "100%",
					width: "100%",
					position: "absolute",
					top: 0,
					left: 0
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageReveal, {
					src: (visual?.fields?.image)?.url || "/public/schools/everest/landing-footage/frame_0001.jpeg",
					alt: "School architecture",
					eager: true,
					testId: "activate-visual-image"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "auth-visual__overlay",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
							number: String(visual?.fields?.kicker || "04"),
							inverse: true,
							children: String(visual?.fields?.title || "Welcome")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: String(visual?.fields?.subtitle || "Account Activation") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: String(visual?.fields?.description || "One community / connected responsibly") })
					]
				})]
			})
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel",
			style: { zIndex: 1 },
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "auth-back",
				"data-testid": "activate-back-home-link",
				style: { color: "var(--c-black)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
					"aria-hidden": "true",
					style: { color: "var(--c-red)" }
				}), "Public website"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-panel__inner",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
					type: "auth_intro",
					onSelect: onSelectSection,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "auth-kicker",
							children: String(intro?.fields?.title || pageCopy.activate.eyebrow)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							id: "activate-title",
							className: "t-page-title text-foreground",
							children: String(intro?.fields?.body || pageCopy.activate.title).split("\n").map((line, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [line, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {})] }, i))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "auth-lead",
							"data-testid": "activate-support-copy",
							children: String(intro?.fields?.callToAction || pageCopy.activate.support)
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
					type: "auth_form",
					onSelect: onSelectSection,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: submit,
						className: "auth-form",
						noValidate: true,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "t-label mt-8 mb-4 border-b pb-2 text-foreground",
								children: String(formBlock?.fields?.title || "Security verification")
							}),
							error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								role: "alert",
								className: "mb-4 flex items-start gap-2 text-sm font-medium text-red-600",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, {
									className: "mt-0.5 h-4 w-4 shrink-0",
									"aria-hidden": "true"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: error })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "auth-field",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "token",
									className: "sr-only",
									children: "Code"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "token",
									type: "text",
									placeholder: "EXV-894-ABC",
									value: token,
									onChange: (e) => {
										setToken(e.target.value.toUpperCase());
										setError("");
									},
									autoFocus: true,
									required: true
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "auth-submits mt-8",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									type: "submit",
									className: "w-full justify-between",
									testId: "activate-submit-btn",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Verify code" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "→"
									})]
								})
							})
						]
					})
				})]
			})]
		})]
	});
}
//#endregion
export { RouteComponent as component };
