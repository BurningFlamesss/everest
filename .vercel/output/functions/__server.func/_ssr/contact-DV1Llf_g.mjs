import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { CircleAlert } from "../_libs/lucide-react.mjs";
import { Input, Label, Route$51, useWebsitePageContent } from "./router-dKngB4cM.mjs";
import { Segmented } from "./Segmented-DUXR0cXM.mjs";
import { Button } from "./kit-Cq_igxhQ.mjs";
import { departments, school } from "./site-D2pkIopk.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/contact-DV1Llf_g.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var kathmandu = () => new Intl.DateTimeFormat("en-GB", {
	timeZone: "Asia/Kathmandu",
	weekday: "long",
	hour: "2-digit",
	minute: "2-digit"
}).format(/* @__PURE__ */ new Date());
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$51.useLoaderData();
	useWebsitePageContent("contact");
	const [route, setRoute] = (0, import_react.useState)("Admissions");
	const [time, setTime] = (0, import_react.useState)(kathmandu());
	const [errors, setErrors] = (0, import_react.useState)({});
	const [count, setCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => setTime(kathmandu()), 6e4);
		return () => clearInterval(id);
	}, []);
	const validate = (e) => {
		const { id, value } = e.currentTarget;
		setErrors((x) => ({
			...x,
			[id]: value.trim() ? "" : "This field is required."
		}));
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "contact-layout content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "devanagari",
					children: school.nepali
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "t-page-title text-foreground",
					children: school.name
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: school.address }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "time-card mt-8 rounded-card border border-border bg-transparent p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "flex items-center gap-2 mb-4",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", {
								"data-testid": "contact-open-state",
								className: "font-display text-base tracking-wider uppercase text-foreground",
								children: "OPEN TODAY · 09:00–16:00"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							"data-testid": "kathmandu-time",
							className: "block text-base text-muted-foreground mb-6 pb-4 border-b border-rule-soft",
							children: [time, " · ASIA/KATHMANDU"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "space-y-3 mb-6 pb-6 border-b border-rule-soft",
							children: [
								["SUNDAY", "09:00–16:00"],
								["MONDAY", "09:00–16:00"],
								["TUESDAY", "09:00–16:00"],
								["WEDNESDAY", "09:00–16:00"],
								["THURSDAY", "09:00–16:00"],
								["FRIDAY", "09:00–16:00"],
								["SATURDAY", "CLOSED"]
							].map(([day, hours]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "flex justify-between text-base",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-medium text-muted-foreground",
									children: day
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-foreground",
									children: hours
								})]
							}, day))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `tel:${school.phoneNtc}`,
									"data-testid": "contact-ntc-link",
									className: "flex justify-between items-center text-base font-medium hover:text-accent transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "NTC"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.phoneNtc })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: `tel:${school.phoneNcell}`,
									"data-testid": "contact-ncell-link",
									className: "flex justify-between items-center text-base font-medium hover:text-accent transition-colors",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: "NCELL"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: school.phoneNcell })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
									href: "https://maps.google.com/?q=Pokhara+5+Nepal",
									"data-testid": "contact-directions-link",
									className: "inline-flex mt-2 items-center justify-center font-medium text-base text-accent hover:text-accent/80 transition-colors",
									children: ["GET DIRECTIONS ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ml-1 text-lg leading-none",
										children: "↗"
									})]
								})
							]
						})
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				onSubmit: (e) => e.preventDefault(),
				"data-testid": "contact-form",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "t-h2 text-foreground",
						children: "DIRECT YOUR ENQUIRY"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Segmented, {
						label: "Direct your enquiry",
						options: [
							"Admissions",
							"Accounts",
							"Principal's Office",
							"General"
						].map((v) => ({
							value: v,
							label: v
						})),
						value: route,
						onChange: setRoute
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `form-control ${errors["contact-name"] ? "form-control--error" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact-name",
								style: { color: "var(--c-ink)" },
								children: "Full name"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "text",
								id: "contact-name",
								name: "name",
								onBlur: validate,
								"aria-invalid": !!errors["contact-name"],
								className: "editorial-input"
							}),
							errors["contact-name"] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "field-error",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors["contact-name"]]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `form-control ${errors["contact-email"] ? "form-control--error" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact-email",
								style: { color: "var(--c-ink)" },
								children: "Email address"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								id: "contact-email",
								name: "email",
								onBlur: validate,
								"aria-invalid": !!errors["contact-email"],
								className: "editorial-input"
							}),
							errors["contact-email"] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "field-error",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors["contact-email"]]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `form-control ${errors["contact-phone"] ? "form-control--error" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "contact-phone",
								style: { color: "var(--c-ink)" },
								children: "Phone number"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "tel",
								id: "contact-phone",
								name: "phone",
								onBlur: validate,
								"aria-invalid": !!errors["contact-phone"],
								className: "editorial-input"
							}),
							errors["contact-phone"] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "field-error",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors["contact-phone"]]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `form-control ${errors["contact-message"] ? "form-control--error" : ""}`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "label-line flex justify-between w-full",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
									htmlFor: "contact-message",
									style: { color: "var(--c-ink)" },
									children: "Message"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									id: "contact-message-count",
									"data-testid": "contact-message-count",
									style: {
										color: "var(--c-n-500)",
										fontSize: "14px"
									},
									children: [count, " / 600"]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
								id: "contact-message",
								name: "message",
								maxLength: 600,
								onBlur: validate,
								onChange: (e) => setCount(e.target.value.length),
								"data-testid": "contact-message-input",
								"aria-describedby": "contact-message-count",
								className: "editorial-input"
							}),
							errors["contact-message"] && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "field-error",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { "aria-hidden": "true" }), errors["contact-message"]]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						testId: "contact-submit-button",
						className: "institution-button institution-button--full w-full py-3 mt-6",
						children: "Send enquiry"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "form-note",
						children: "This preview validates the form but does not transmit messages."
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
			className: "map-panel content",
			"aria-label": "School map placeholder",
			"data-testid": "school-map",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				src: "https://www.google.com/maps?q=Butwal-8+Sukkhanagar&output=embed",
				width: "100%",
				height: "400",
				style: { border: 0 },
				allowFullScreen: true,
				loading: "lazy",
				referrerPolicy: "no-referrer-when-downgrade"
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "departments content",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "t-h2 text-foreground",
				children: "WHO TO ASK"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: departments.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				"data-testid": `department-${d.id}`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: d.name }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "font-display text-xl text-foreground font-semibold",
						children: d.contact
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: `mailto:${d.email}`,
						children: d.email
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: d.hours })
				]
			}, d.id)) })]
		})
	] });
}
//#endregion
export { RouteComponent as component };
