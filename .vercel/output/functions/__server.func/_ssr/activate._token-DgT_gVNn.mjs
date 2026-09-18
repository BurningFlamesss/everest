import { __toESM } from "../_runtime.mjs";
import { object, string$1 as string } from "../_libs/@better-auth/core+[...].mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Link, useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, CircleAlert, LoaderCircle } from "../_libs/lucide-react.mjs";
import { createServerFn } from "./ssr.mjs";
import { Button, ImageReveal, Input, Label, Route$20, SectionLabel, authClient, createSsrRpc } from "./router-B6FnglFX.mjs";
import { pageCopy } from "./site-D2pkIopk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate._token-DgT_gVNn.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var ActivationSchema = object({
	token: string().min(1),
	password: string().min(8)
});
var activateInvite = createServerFn().validator(ActivationSchema).handler(createSsrRpc("22e10330cdd9b9c18e53d021c52866c04fc49d201f78b3494a659e9f5a6d65e3"));
function RouteComponent() {
	const invite = Route$20.useLoaderData();
	const navigate = useNavigate();
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirmPassword, setConfirmPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const handleSubmit = async (e) => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Passwords do not match");
			return;
		}
		if (password.length < 8) {
			setError("Password must be at least 8 characters");
			return;
		}
		setBusy(true);
		try {
			if (!(await activateInvite({ data: {
				token: invite.token,
				password
			} })).success) {
				setError("Failed to activate account");
				setBusy(false);
				return;
			}
			const signInRes = await authClient.signIn.email({
				email: invite.user.email,
				password
			});
			if (signInRes.error) {
				setError(signInRes.error.message || "Login failed");
				setBusy(false);
				return;
			}
			navigate({ to: "/" });
		} catch (error) {
			setError("Something went wrong");
			setBusy(false);
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "auth-page overflow-x-hidden min-w-0",
		"aria-labelledby": "activate-title",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-visual min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageReveal, {
				src: "/public/schools/everest/landing-footage/frame_0001.jpeg",
				alt: "School architecture marking the entrance to Everest",
				eager: true,
				testId: "activate-visual-image"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-visual__overlay",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionLabel, {
						number: "04",
						inverse: true,
						children: "Welcome"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Account Activation" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "One community / connected responsibly" })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "auth-panel w-full",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/",
				className: "auth-back",
				style: { color: "var(--c-black)" },
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
					"aria-hidden": "true",
					style: { color: "var(--c-red)" }
				}), "Public website"]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "auth-panel__inner",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "auth-kicker",
						children: pageCopy.activate.eyebrow
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
						id: "activate-title",
						className: "t-page-title text-foreground",
						children: [
							"SET YOUR",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("br", {}),
							"PASSWORD."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "auth-intro text-foreground mt-4 font-medium break-all",
						children: ["Creating account for ", invite.user.email]
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleSubmit,
					className: "auth-form",
					noValidate: true,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `form-control ${error ? "form-control--error" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "password",
								children: "Password"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "password",
								type: "password",
								value: password,
								onChange: (e) => {
									setPassword(e.target.value);
									setError("");
								},
								className: "editorial-input text-foreground"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: `form-control ${error ? "form-control--error" : ""}`,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "confirmPassword",
									children: "Confirm Password"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									id: "confirmPassword",
									type: "password",
									value: confirmPassword,
									onChange: (e) => {
										setConfirmPassword(e.target.value);
										setError("");
									},
									className: "editorial-input text-foreground"
								}),
								error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "field-error",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), error]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "submit",
							disabled: busy,
							className: "institution-button institution-button--full",
							children: [busy ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, {
								className: "spin",
								"aria-hidden": "true"
							}) : null, busy ? "Activating..." : "Activate Account"]
						})
					]
				})]
			})]
		})]
	});
}
//#endregion
export { RouteComponent as component };
