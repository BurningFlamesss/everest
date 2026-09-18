import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowRight, Paperclip, Pin } from "../_libs/lucide-react.mjs";
import { PageFrame, PageHeader, Reveal, Route$45, Section, SectionHeading, useNotices, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { notices } from "./notices-C5VFH4Yw.mjs";
import { Dialog, DialogContent, DialogDescription, DialogTitle, Separator } from "./kit-Cq_igxhQ.mjs";
import { EmptyState } from "./EmptyState-CpUK2QdS.mjs";
import { FilterChips } from "./FilterChips-CvLOSi1H.mjs";
import { DownloadButton, downloadOfficialPdf, formatAd, noticeDoc, relativeDay } from "./DownloadButton-BvKdJ2gw.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notices-DIi5iR30.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Chip = ({ children }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
	className: "rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground",
	children
});
var NoticeReader = ({ notice }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-center gap-2.5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: notice.category }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "t-meta",
			children: notice.ref
		})]
	}),
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, {
		className: "mt-4 pr-8 font-display text-[23px] font-semibold leading-snug text-foreground sm:text-[27px]",
		"data-testid": "notice-detail-title",
		children: notice.title
	}),
	/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, {
		className: "mt-3 text-[13px] leading-relaxed text-muted-foreground",
		children: [
			notice.dateBs,
			" BS · ",
			formatAd(notice.dateAd),
			" · issued by",
			" ",
			notice.issuedBy,
			" · for ",
			notice.audience
		]
	}),
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, { className: "my-7" }),
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-4",
		children: notice.body.map((paragraph) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-[14.5px] leading-[1.75] text-foreground",
			children: paragraph
		}, paragraph.slice(0, 40)))
	}),
	notice.bullets ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "t-eyebrow",
			children: "Points to note"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3.5 space-y-2.5",
			children: notice.bullets.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "mt-[9px] h-1 w-1 shrink-0 rounded-full bg-accent",
					"aria-hidden": "true"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[13.5px] leading-relaxed text-foreground",
					children: item
				})]
			}, item))
		})]
	}) : null,
	notice.table ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-8 overflow-hidden rounded-card border border-border",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "rail-scroll overflow-x-auto",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[600px] border-collapse text-left",
				"data-testid": "notice-detail-table",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("caption", {
						className: "sr-only",
						children: notice.table.caption
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: "border-b border-border bg-secondary",
						children: notice.table.columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							scope: "col",
							className: "px-3.5 py-3 text-[10.5px] font-medium uppercase tracking-[0.12em] text-muted-foreground",
							children: column
						}, column))
					}) }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: notice.table.rows.map((row, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", {
						className: `border-b border-rule-soft last:border-b-0 ${index % 2 === 1 ? "bg-secondary/40" : ""}`,
						children: row.map((cell, cellIndex) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: ["px-3.5 py-3 align-top text-[12.5px]", cellIndex < 2 ? "whitespace-nowrap font-mono text-[10.5px] tabular-nums text-muted-foreground" : "text-foreground"].join(" "),
							children: cell
						}, `${cell}-${cellIndex}`))
					}, row.join("-"))) })
				]
			})
		})
	}) : null,
	notice.attachments.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-8",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "t-eyebrow",
			children: "Attachments"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-3.5 divide-y divide-rule-soft border-y border-border",
			children: notice.attachments.map((file) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
				className: "flex items-center justify-between gap-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "flex min-w-0 items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Paperclip, {
						className: "h-3.5 w-3.5 shrink-0 text-muted-foreground",
						"aria-hidden": "true"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "truncate font-mono text-[11.5px] text-foreground",
						children: file.name
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "t-meta shrink-0",
					children: file.size
				})]
			}, file.name))
		})]
	}) : null,
	/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mt-9 border-t border-rule-soft pt-7",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
			label: "Download this notice",
			meta: `PDF · true copy of ${notice.ref}`,
			stamp: "Official",
			testId: "notice-download-pdf-button",
			onDownload: () => downloadOfficialPdf(noticeDoc(notice))
		})
	})
] });
function RouteComponent() {
	(useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$45.useLoaderData();
	useWebsitePageContent("notices");
	const dbNotices = useNotices();
	const notices$1 = dbNotices && dbNotices.length > 0 ? dbNotices : notices;
	const noticeCategories = Array.from(new Set(notices$1.map((n) => n.category))).sort();
	const [category, setCategory] = (0, import_react.useState)("all");
	const [open, setOpen] = (0, import_react.useState)(null);
	const byDateDesc = (a, b) => b.dateAd.localeCompare(a.dateAd);
	/** The single pinned notice, or failing that the most recent one. */
	const pinned = (0, import_react.useMemo)(() => {
		return notices$1.filter((n) => n.pinned).sort(byDateDesc)[0] ?? [...notices$1].sort(byDateDesc)[0];
	}, [notices$1]);
	/** Everything else, newest first. */
	const rest = (0, import_react.useMemo)(() => notices$1.filter((n) => n.id !== pinned.id).sort(byDateDesc), [notices$1, pinned.id]);
	const filtered = (0, import_react.useMemo)(() => category === "all" ? rest : rest.filter((n) => n.category === category), [rest, category]);
	const chipOptions = (0, import_react.useMemo)(() => [{
		value: "all",
		label: "All",
		count: rest.length
	}, ...noticeCategories.filter((c) => rest.some((n) => n.category === c)).map((c) => ({
		value: c,
		label: c,
		count: rest.filter((n) => n.category === c).length
	}))], [rest, noticeCategories]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "notices-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
				testId: "notices-page-header",
				eyebrow: "Notice board",
				title: "Notices & Announcements",
				subtitle: "Everything the school has published this session, newest first. Open any notice to read it in full.",
				meta: [{
					label: "Published",
					value: String(notices$1.length)
				}, {
					label: "Latest",
					value: formatAd(rest[0]?.dateAd ?? pinned.dateAd)
				}]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				testId: "notice-pinned-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
					eyebrow: "Pinned by the office",
					title: "Read this first",
					testId: "notice-pinned-heading"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					"data-testid": "notice-pinned-card",
					className: "mt-8 rounded-card border border-border bg-card p-6 shadow-sm sm:p-9",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/12 px-2.5 py-0.5 text-[11.5px] font-medium leading-normal text-accent",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pin, {
										className: "h-3 w-3",
										"aria-hidden": "true"
									}), "Pinned"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: pinned.category }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "t-meta",
									children: [
										pinned.dateBs,
										" BS · ",
										relativeDay(pinned.dateAd)
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "mt-5 max-w-[30ch] font-display text-[25px] font-semibold leading-[1.18] tracking-[-0.01em] text-foreground sm:text-[30px]",
							"data-testid": "notice-pinned-title",
							children: pinned.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-[62ch] text-[15px] leading-[1.7] text-muted-foreground",
							"data-testid": "notice-pinned-summary",
							children: pinned.summary
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
							className: "mt-8 flex flex-wrap gap-x-12 gap-y-5 border-t border-rule-soft pt-6",
							children: [
								{
									label: "Reference",
									value: pinned.ref
								},
								{
									label: "Issued by",
									value: pinned.issuedBy
								},
								{
									label: "Concerns",
									value: pinned.audience
								}
							].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "t-eyebrow",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-2 text-[13.5px] leading-relaxed text-foreground",
									children: item.value
								})]
							}, item.label))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setOpen(pinned),
							"data-testid": "notice-pinned-read-button",
							className: "mt-8 inline-flex h-11 items-center gap-2 rounded-field bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors duration-fast hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
							children: ["Read the full notice", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
								className: "h-4 w-4",
								"aria-hidden": "true"
							})]
						})
					]
				}) })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				testId: "notice-list-section",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: "Archive",
						title: "Every other notice",
						description: "Select any line to read the notice in full, along with its attachments and a printable copy.",
						testId: "notice-list-heading",
						aside: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "t-meta",
							"data-testid": "notice-result-count",
							children: [
								filtered.length,
								" of ",
								rest.length
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-7",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChips, {
							label: "Notice category",
							testId: "notice-category-filter",
							options: chipOptions,
							value: category,
							onChange: setCategory
						})
					}),
					filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-9",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
							eyebrow: "No notices",
							title: "Nothing published under that heading",
							description: "Choose another category to see the notices filed there.",
							actionLabel: "Show all notices",
							onAction: () => setCategory("all"),
							testId: "notices-empty-state"
						})
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						"data-testid": "notice-list",
						className: "mt-8 divide-y divide-rule-soft",
						children: filtered.map((notice) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							id: notice.id,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setOpen(notice),
								"data-testid": "notice-row",
								className: "group grid w-full grid-cols-1 gap-x-8 gap-y-2.5 py-6 text-left transition-colors duration-fast !border-0 !bg-transparent hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-0 sm:grid-cols-[110px_1fr_auto] sm:items-start",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "sm:pt-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-mono text-[12px] tabular-nums leading-none text-foreground",
											children: formatAd(notice.dateAd)
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "mt-2 block font-mono text-[10.5px] leading-none text-muted-foreground",
											children: [notice.dateBs.replace(", 2083", ""), " BS"]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block max-w-[54ch] font-display text-[17px] font-semibold leading-snug text-foreground",
												children: notice.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "mt-2.5 block max-w-[62ch] text-[13.5px] leading-relaxed text-muted-foreground",
												children: notice.summary
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "mt-3.5 flex flex-wrap items-center gap-2.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, { children: notice.category }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "t-meta",
													children: notice.ref
												})]
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "hidden shrink-0 items-center gap-1.5 pt-1 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground sm:flex",
										children: ["Read", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											className: "h-3.5 w-3.5",
											"aria-hidden": "true"
										})]
									})
								]
							})
						}, notice.id))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: open !== null,
				onOpenChange: (isOpen) => {
					if (!isOpen) setOpen(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogContent, {
					"data-testid": "notice-detail-dialog",
					className: "max-h-[88vh] max-w-3xl overflow-y-auto border-border bg-card p-6 sm:p-8",
					children: open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NoticeReader, { notice: open }) : null
				})
			})
		]
	});
}
//#endregion
export { RouteComponent as component };
