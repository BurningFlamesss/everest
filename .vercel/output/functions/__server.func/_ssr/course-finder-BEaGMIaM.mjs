import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowLeft, ArrowRight, RotateCcw } from "../_libs/lucide-react.mjs";
import { AnimatePresence, useReducedMotion } from "../_libs/framer-motion+[...].mjs";
import { motion } from "../_libs/motion.mjs";
import { Button, Eyebrow, PageFrame, PageHeader, RailFill, WidgetCaption, duration, easing } from "./router-dKngB4cM.mjs";
import { quizQuestions } from "./courses-BOU_zwBC.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/course-finder-BEaGMIaM.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STREAM_IDS = [
	"science",
	"management",
	"humanities"
];
var STREAM_NAMES = {
	science: "Science",
	management: "Management",
	humanities: "Humanities"
};
/**
* Weighted scoring with full attribution. The result screen has to be able to
* say which answers pushed each stream up, otherwise it is a verdict rather
* than guidance. Answers are held in component state and never transmitted.
*/
function scoreQuiz(answers) {
	const totals = {
		science: 0,
		management: 0,
		humanities: 0
	};
	const why = {
		science: [],
		management: [],
		humanities: []
	};
	for (const [qid, oid] of Object.entries(answers)) {
		const q = quizQuestions.find((x) => x.id === qid);
		const o = q?.options.find((x) => x.id === oid);
		if (!q || !o) continue;
		for (const sid of STREAM_IDS) {
			const w = o.weights[sid] ?? 0;
			totals[sid] += w;
			if (w > 0) why[sid].push({
				questionId: qid,
				prompt: q.prompt,
				answer: o.label,
				weight: w
			});
		}
	}
	const max = Math.max(...STREAM_IDS.map((sid) => totals[sid]));
	const denom = max > 0 ? max : 1;
	const ranked = STREAM_IDS.map((sid) => ({
		streamId: sid,
		score: totals[sid],
		share: Math.round(totals[sid] / denom * 100),
		reasons: why[sid].slice().sort((a, b) => b.weight - a.weight)
	})).sort((a, b) => b.score - a.score || a.streamId.localeCompare(b.streamId));
	const answered = Object.keys(answers).filter((qid) => quizQuestions.some((q) => q.id === qid && q.options.some((o) => o.id === answers[qid]))).length;
	return {
		ranked,
		answered,
		total: quizQuestions.length,
		complete: answered === quizQuestions.length
	};
}
/**
* SIGNATURE INTERACTION - Courses
* Stream chooser. Guidance, not a personality quiz: six plain questions, one at
* a time, then a ranked result that shows WHICH answers pushed each stream up.
* Answers live in component state and are never stored or transmitted.
*/
function StreamChooser({ onHandoff, onSeeAll }) {
	const reduced = Boolean(useReducedMotion());
	const [step, setStep] = (0, import_react.useState)(0);
	const [answers, setAnswers] = (0, import_react.useState)({});
	const [done, setDone] = (0, import_react.useState)(false);
	const headingRef = (0, import_react.useRef)(null);
	const optionRefs = (0, import_react.useRef)([]);
	const q = quizQuestions[step];
	const result = scoreQuiz(answers);
	const progress = done ? 1 : step / quizQuestions.length;
	const advance = () => {
		if (step + 1 < quizQuestions.length) {
			setStep(step + 1);
			window.setTimeout(() => headingRef.current?.focus(), 60);
		} else setDone(true);
	};
	const anim = reduced ? {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 }
	} : {
		initial: {
			opacity: 0,
			x: 24
		},
		animate: {
			opacity: 1,
			x: 0
		},
		exit: {
			opacity: 0,
			x: -24
		}
	};
	const restart = () => {
		setAnswers({});
		setStep(0);
		setDone(false);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-8",
		"data-testid": "stream-chooser",
		id: "stream-chooser",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eyebrow, { children: "Which stream" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WidgetCaption, { children: "Six questions. The result shows all three streams and why each one ranked where it did." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 border-y border-border py-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "u-label tnum shrink-0 text-accent",
					"data-testid": "chooser-progress-label",
					children: done ? "RESULT" : String(step + 1).padStart(2, "0") + " / " + String(quizQuestions.length).padStart(2, "0")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RailFill, {
					progress,
					orientation: "horizontal",
					label: "Question " + (step + 1) + " of " + quizQuestions.length
				})]
			}),
			!done ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AnimatePresence, {
				mode: "wait",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(motion.fieldset, {
					...anim,
					transition: {
						duration: (reduced ? 120 : duration.standard) / 1e3,
						ease: easing.state
					},
					className: "flex flex-col gap-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("legend", {
							className: "contents",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								ref: headingRef,
								tabIndex: -1,
								className: "u-display max-w-measure text-display-m text-foreground outline-none",
								"data-testid": "chooser-question",
								children: q.prompt
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							role: "radiogroup",
							"aria-label": q.prompt,
							className: "flex flex-col",
							children: q.options.map((o, i) => {
								const checked = answers[q.id] === o.id;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "flex cursor-pointer items-center gap-4 border-t border-border py-4 last:border-b " + (checked ? "text-foreground" : "text-muted-foreground"),
									"data-testid": "chooser-option-" + o.id,
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											ref: (el) => {
												optionRefs.current[i] = el;
											},
											type: "radio",
											name: q.id,
											value: o.id,
											checked,
											onChange: () => setAnswers({
												...answers,
												[q.id]: o.id
											}),
											onKeyDown: (e) => {
												if (e.key === "ArrowDown" || e.key === "ArrowRight") {
													e.preventDefault();
													const n = (i + 1) % q.options.length;
													setAnswers({
														...answers,
														[q.id]: q.options[n].id
													});
													optionRefs.current[n]?.focus();
												} else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
													e.preventDefault();
													const n = (i - 1 + q.options.length) % q.options.length;
													setAnswers({
														...answers,
														[q.id]: q.options[n].id
													});
													optionRefs.current[n]?.focus();
												}
											},
											className: "h-4 w-4 shrink-0 accent-[var(--c-yellow)]"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "u-label tnum w-6 shrink-0 text-accent",
											children: String.fromCharCode(65 + i)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-body-l",
											children: o.label
										})
									]
								}, o.id);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "secondary",
									onClick: () => setStep(Math.max(0, step - 1)),
									disabled: step === 0,
									testId: "chooser-back",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, {
										"aria-hidden": "true",
										size: 14
									}), "Back"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									onClick: advance,
									disabled: !answers[q.id],
									testId: "chooser-next",
									children: [step + 1 === quizQuestions.length ? "See the result" : "Next question", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"aria-hidden": "true",
										size: 14
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									onClick: restart,
									testId: "chooser-restart",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
										"aria-hidden": "true",
										size: 14
									}), "Start again"]
								})
							]
						})
					]
				}, q.id)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-8",
				"data-testid": "chooser-result",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "u-display max-w-measure text-display-m text-foreground",
						children: "All three, ranked — and the answers behind each one"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "flex flex-col",
						children: result.ranked.map((r, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "border-t border-border py-6 last:border-b",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-wrap items-baseline gap-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "u-label tnum text-accent",
											children: String(i + 1).padStart(2, "0")
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h4", {
											className: "u-display text-display-m text-foreground",
											children: STREAM_NAMES[r.streamId]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "u-label tnum text-muted-foreground",
											"data-testid": "chooser-score-" + r.streamId,
											children: [
												r.score,
												" points · ",
												r.share,
												"%"
											]
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 h-2 w-full bg-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: i === 0 ? "h-2 bg-accent" : "h-2 bg-border",
										style: { width: Math.max(2, r.share) + "%" },
										"aria-hidden": "true"
									})
								}),
								r.reasons.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-4 flex flex-col gap-2",
									children: r.reasons.slice(0, 3).map((why) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "max-w-measure text-body-s text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "u-label text-muted-foreground",
												children: ["+", why.weight]
											}),
											" ",
											why.answer
										]
									}, why.questionId))
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 text-body-s text-muted-foreground",
									children: "None of your answers pointed here."
								})
							]
						}, r.streamId))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => onHandoff([result.ranked[0].streamId, result.ranked[1].streamId]),
								testId: "chooser-handoff",
								children: [
									"Compare ",
									STREAM_NAMES[result.ranked[0].streamId],
									" and",
									" ",
									STREAM_NAMES[result.ranked[1].streamId],
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
										"aria-hidden": "true",
										size: 14
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: onSeeAll,
								testId: "chooser-see-all",
								children: "See all three streams in full"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								onClick: restart,
								testId: "chooser-restart-result",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
									"aria-hidden": "true",
									size: 14
								}), "Start again"]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "u-label text-muted-foreground",
				"data-testid": "chooser-privacy",
				children: "Your answers stay in this browser tab. Nothing is saved or sent anywhere."
			})
		]
	});
}
function RouteComponent() {
	const navigate = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
		eyebrow: "COURSE FINDER",
		title: "Which stream",
		lead: "Six questions. The result shows all three streams and why each one ranked where it did."
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-10",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StreamChooser, {
			onHandoff: () => {},
			onSeeAll: () => navigate({ to: "/" })
		})
	})] });
}
//#endregion
export { RouteComponent as component };
