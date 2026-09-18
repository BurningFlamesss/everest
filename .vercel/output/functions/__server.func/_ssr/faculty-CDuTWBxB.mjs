import { __toESM } from "../_runtime.mjs";
import { require_react } from "../_libs/dnd-kit__accessibility+react.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { useSearch } from "../_libs/@tanstack/react-router+[...].mjs";
import { ArrowRight, Mail, Phone, Search, X } from "../_libs/lucide-react.mjs";
import { toast } from "../_libs/sonner.mjs";
import { CmsSectionBox, PageFrame, PageHeader, Reveal, Route$47, STAGGER, Section, SectionHeading, getSectionFields, school, sectionDefaults, str, useFacultyDirectory, useWebsitePageContent } from "./router-B6FnglFX.mjs";
import { MonogramAvatar, people } from "./MonogramAvatar-ozrFwXVY.mjs";
import { Input, Sheet, SheetContent, SheetDescription, SheetTitle } from "./kit-Cq_igxhQ.mjs";
import { EmptyState } from "./EmptyState-CpUK2QdS.mjs";
import { FilterChips } from "./FilterChips-CvLOSi1H.mjs";
import { DownloadButton, downloadOfficialPdf, facultyDirectoryDoc, personProfileDoc } from "./DownloadButton-BvKdJ2gw.mjs";
import { copyText } from "./calendar-BHpicza7.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/faculty-CDuTWBxB.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SearchField = ({ value, onChange, placeholder, testId, label, className = "" }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
	className: `relative ${className}`,
	children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
			className: "sr-only",
			htmlFor: testId,
			children: label
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, {
			className: "pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
			"aria-hidden": "true"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
			id: testId,
			type: "search",
			value,
			onChange: (event) => onChange(event.target.value),
			placeholder,
			"data-testid": testId,
			className: "h-11 rounded-field border-input bg-background pl-10 pr-10 text-sm transition-colors duration-fast placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden"
		}),
		value ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
			type: "button",
			onClick: () => onChange(""),
			"aria-label": "Clear search",
			"data-testid": `${testId}-clear`,
			className: "absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors duration-fast hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
				className: "h-3.5 w-3.5",
				"aria-hidden": "true"
			})
		}) : null
	]
});
var QuickAction = ({ icon: Icon, label, onClick, testId }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
	type: "button",
	onClick,
	"data-testid": testId,
	className: "inline-flex min-h-[40px] items-center gap-2 rounded-field border border-border bg-background px-3 py-2 text-[13px] text-foreground transition-colors duration-fast hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, {
		className: "h-3.5 w-3.5 text-muted-foreground",
		"aria-hidden": "true"
	}), label]
});
function RouteComponent() {
	const cms = (useSearch({ strict: false }) || {}).cms;
	const { previewPage } = Route$47.useLoaderData();
	const publishedContent = useWebsitePageContent("faculty");
	const preview = String(cms ?? "") === "1";
	const facultyContent = preview ? previewPage : publishedContent;
	const headerSection = {
		...sectionDefaults("faculty_header"),
		...getSectionFields(facultyContent?.blocks, "faculty_header")
	};
	const leadershipSection = {
		...sectionDefaults("faculty_leadership"),
		...getSectionFields(facultyContent?.blocks, "faculty_leadership")
	};
	const directorySection = {
		...sectionDefaults("faculty_directory"),
		...getSectionFields(facultyContent?.blocks, "faculty_directory")
	};
	const onSelectSection = (sectionType) => {
		window.parent?.postMessage({
			source: "scms-cms",
			type: "select-section",
			pageKey: "faculty",
			sectionType
		}, "*");
	};
	const dbPeople = useFacultyDirectory();
	const people$1 = dbPeople && dbPeople.length > 0 ? dbPeople : people;
	const leadership = people$1.filter((person) => person.leadership).sort((a, b) => (a.rank ?? 99) - (b.rank ?? 99));
	const faculty = people$1.filter((person) => !person.leadership);
	const facultyDepartments = Array.from(new Set(people$1.map((person) => person.department))).sort();
	const [query, setQuery] = (0, import_react.useState)("");
	const [department, setDepartment] = (0, import_react.useState)("all");
	const [selected, setSelected] = (0, import_react.useState)(null);
	const filtered = (0, import_react.useMemo)(() => {
		const needle = query.trim().toLowerCase();
		return faculty.filter((person) => {
			if (!(department === "all" || person.department === department)) return false;
			if (!needle) return true;
			return [
				person.name,
				person.role,
				person.department,
				person.qualification,
				person.subjects.join(" ")
			].join(" ").toLowerCase().includes(needle);
		});
	}, [
		query,
		department,
		faculty
	]);
	const chipOptions = (0, import_react.useMemo)(() => [{
		value: "all",
		label: "All departments",
		count: faculty.length
	}, ...facultyDepartments.filter((dept) => faculty.some((p) => p.department === dept)).map((dept) => ({
		value: dept,
		label: dept,
		count: faculty.filter((p) => p.department === dept).length
	}))], [faculty, facultyDepartments]);
	const handleCopy = async (value, description) => {
		if (await copyText(value)) toast.success("Copied to clipboard", { description });
		else toast.error("Could not copy", { description: value });
	};
	const resetFilters = () => {
		setQuery("");
		setDepartment("all");
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(PageFrame, {
		testId: "faculty-page",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
				preview,
				sectionType: "faculty_header",
				onSelect: onSelectSection,
				testId: "cms-section-hit-faculty_header",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PageHeader, {
					testId: "faculty-page-header",
					eyebrow: str(headerSection, "eyebrow"),
					title: str(headerSection, "title"),
					subtitle: str(headerSection, "subtitle"),
					meta: [
						{
							label: "Total staff",
							value: String(people$1.length)
						},
						{
							label: "Leadership",
							value: String(leadership.length)
						},
						{
							label: "Departments",
							value: String(facultyDepartments.length)
						},
						{
							label: "Main line",
							value: school.phone
						}
					],
					actions: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
						label: "Staff contact directory",
						meta: `PDF · ${people$1.length} entries · extensions and office hours`,
						stamp: "Official",
						testId: "faculty-download-directory-button",
						onDownload: () => downloadOfficialPdf(facultyDirectoryDoc(people$1))
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				testId: "leadership-section",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
					preview,
					sectionType: "faculty_leadership",
					onSelect: onSelectSection,
					testId: "cms-section-hit-faculty_leadership",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: str(leadershipSection, "eyebrow"),
						title: str(leadershipSection, "title"),
						description: str(leadershipSection, "description"),
						testId: "leadership-title"
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"data-testid": "leadership-grid",
					className: "mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3",
					children: leadership.map((person, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
						className: "min-w-0",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Reveal, {
							delay: Math.min(index, 6) * STAGGER,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(person),
								"data-testid": "leadership-card",
								className: "group flex h-full w-full flex-col rounded-card border border-border bg-card p-6 text-left shadow-xs transition-colors duration-fast hover:border-rule-strong hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonogramAvatar, {
										name: person.name,
										department: person.department,
										size: "lg"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "t-eyebrow mt-6",
										children: person.role
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-2 font-display text-[19px] font-semibold leading-snug text-foreground",
										"data-testid": "leadership-card-name",
										children: person.name
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2.5 text-[13px] leading-relaxed text-muted-foreground",
										children: person.qualification
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-rule-soft pt-4",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "rounded-full border border-border bg-background px-2.5 py-0.5 text-[11.5px] leading-normal text-muted-foreground",
											children: person.department
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "t-meta",
											children: ["Ext. ", person.extension]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "mt-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors duration-fast group-hover:text-foreground",
										children: ["View profile", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {
											className: "h-3.5 w-3.5",
											"aria-hidden": "true"
										})]
									})
								]
							})
						})
					}, person.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CmsSectionBox, {
					preview,
					sectionType: "faculty_directory",
					onSelect: onSelectSection,
					testId: "cms-section-hit-faculty_directory",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SectionHeading, {
						eyebrow: str(directorySection, "eyebrow"),
						title: str(directorySection, "title"),
						description: str(directorySection, "description"),
						testId: "directory-title",
						aside: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "t-meta",
							"data-testid": "faculty-result-count",
							children: [
								filtered.length,
								" of ",
								faculty.length
							]
						})
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-7 grid gap-4 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start lg:gap-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchField, {
						value: query,
						onChange: setQuery,
						label: "Search faculty by name, subject or qualification",
						placeholder: "Search name, subject, qualification…",
						testId: "faculty-search-input"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FilterChips, {
						label: "Department",
						testId: "faculty-department-filter",
						options: chipOptions,
						value: department,
						onChange: setDepartment
					})]
				}),
				filtered.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-9",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
						eyebrow: "No match",
						title: "Nobody matches that search",
						description: "Try a shorter search term, or clear the filters to see the whole faculty list again.",
						actionLabel: "Clear filters",
						onAction: resetFilters,
						testId: "faculty-empty-state"
					})
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					"data-testid": "faculty-directory",
					className: "mt-9 divide-y divide-rule-soft",
					children: filtered.map((person) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => setSelected(person),
						"data-testid": "faculty-directory-row",
						className: "group flex w-full items-center gap-4 py-4 text-left transition-colors duration-fast !border-0 !bg-transparent hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonogramAvatar, {
								name: person.name,
								department: person.department,
								size: "md"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "block font-display text-[15px] font-semibold leading-snug text-foreground",
									children: person.name
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "mt-1 block text-[13px] text-muted-foreground",
									children: person.role
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden min-w-0 flex-1 lg:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "t-caption line-clamp-1",
									children: person.subjects.join(" · ")
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden shrink-0 sm:block",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground",
									children: person.department
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "t-meta w-[74px] shrink-0 text-right",
								children: ["Ext. ", person.extension]
							})
						]
					}) }, person.id))
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open: selected !== null,
				onOpenChange: (open) => {
					if (!open) setSelected(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetContent, {
					"data-testid": "faculty-detail-sheet",
					className: "w-full overflow-y-auto border-border bg-card sm:max-w-lg",
					children: selected ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-b border-border pb-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "t-eyebrow",
								children: [selected.department, " department"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetTitle, {
								className: "mt-2 font-display text-2xl font-semibold leading-tight text-foreground",
								"data-testid": "faculty-detail-name",
								children: selected.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SheetDescription, {
								className: "mt-2 text-[13px] text-muted-foreground",
								children: selected.role
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-5 flex items-center gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MonogramAvatar, {
									name: selected.name,
									department: selected.department,
									size: "lg",
									testId: "faculty-detail-avatar"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-meta leading-relaxed",
									children: selected.qualification
								})]
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-7 pt-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "t-eyebrow",
								children: "Profile"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "t-body mt-3 text-muted-foreground",
								children: selected.bio
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "t-eyebrow",
								children: "Teaches"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-wrap gap-2",
								children: selected.subjects.map((subject) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
									className: "rounded-full border border-border bg-background px-2.5 py-1 text-[12px] text-foreground",
									children: subject
								}, subject))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dl", {
								className: "grid gap-x-8 gap-y-5 sm:grid-cols-2",
								children: [
									{
										label: "Office hours",
										value: selected.officeHours
									},
									{
										label: "Experience",
										value: selected.experience
									},
									{
										label: "At Everest since",
										value: selected.joined
									},
									{
										label: "Extension",
										value: selected.extension
									}
								].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
									className: "t-eyebrow",
									children: item.label
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
									className: "mt-1.5 text-[13px] leading-relaxed text-foreground",
									children: item.value
								})] }, item.label))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-eyebrow",
									children: "Quick actions"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 flex flex-wrap gap-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
										icon: Mail,
										label: "Copy email",
										testId: "faculty-detail-copy-email",
										onClick: () => handleCopy(selected.email, selected.email)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuickAction, {
										icon: Phone,
										label: "Copy extension",
										testId: "faculty-detail-copy-extension",
										onClick: () => handleCopy(`${school.phone} ext ${selected.extension}`, `${school.phone} ext ${selected.extension}`)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "t-meta mt-3",
									children: selected.email
								})
							] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "border-t border-rule-soft pt-6",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DownloadButton, {
									label: "Staff profile PDF",
									meta: `PDF · ${selected.name} · ${selected.department}`,
									stamp: "Staff profile",
									size: "sm",
									testId: "faculty-detail-download-profile",
									onDownload: () => downloadOfficialPdf(personProfileDoc(selected))
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onClick: () => setSelected(null),
								"data-testid": "faculty-detail-close",
								className: "inline-flex items-center gap-2 text-[13px] text-muted-foreground transition-colors duration-fast hover:text-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, {
									className: "h-3.5 w-3.5",
									"aria-hidden": "true"
								}), "Close profile"]
							})
						]
					})] }) : null
				})
			})
		]
	});
}
//#endregion
export { RouteComponent as component };
