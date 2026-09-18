import { cn } from "./utils-OyjWw23L.mjs";
import { require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { Button } from "./button-CcyykU5Y.mjs";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from "../_libs/lucide-react.mjs";
import { TableSkeleton } from "./Skeletons-CyC1V-yb.mjs";
import { ErrorState } from "./ErrorState-WljNVn4W.mjs";
import { Checkbox } from "./checkbox-BjdMCqoU.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/DataTable-DqD2icP_.js
var import_jsx_runtime = require_jsx_runtime();
function DataTable({ columns, rows, rowId, loading = false, error, onRetry, empty, onRowClick, selectable = false, selected = [], onSelectedChange, bulkActions, sort, onSortChange, page = 1, pageSize = 10, total = 0, onPageChange, testId, rowTestId, footNote }) {
	const allSelected = rows.length > 0 && rows.every((row) => selected.includes(rowId(row)));
	const pageCount = Math.max(1, Math.ceil(total / pageSize));
	const toggleAll = () => {
		if (!onSelectedChange) return;
		onSelectedChange(allSelected ? [] : rows.map(rowId));
	};
	const toggleOne = (id) => {
		if (!onSelectedChange) return;
		onSelectedChange(selected.includes(id) ? selected.filter((s) => s !== id) : [...selected, id]);
	};
	const changeSort = (key) => {
		if (!onSortChange) return;
		onSortChange({
			key,
			dir: sort?.key === key && sort.dir === "asc" ? "desc" : "asc"
		});
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "panel overflow-hidden",
		"data-testid": testId,
		children: [
			selectable && selected.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-14 z-20 flex flex-wrap items-center gap-3 border-b border-hairline bg-primary/[0.06] px-4 py-2.5",
				"data-testid": `${testId}-bulk-bar`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "num text-xs font-medium text-foreground",
						children: [selected.length, " selected"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "text-xs text-muted-foreground underline-offset-2 hover:underline",
						"data-testid": `${testId}-clear-selection`,
						onClick: () => onSelectedChange?.([]),
						children: "Clear"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "ml-auto flex flex-wrap items-center gap-1.5",
						children: bulkActions
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ErrorState, { onRetry }) : loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TableSkeleton, {
				rows: Math.min(pageSize, 6),
				columns: columns.length
			}) : rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children: empty }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] border-collapse text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "bg-surface-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-b border-hairline",
							children: [selectable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "w-9 px-4 py-2",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
									checked: allSelected,
									onCheckedChange: toggleAll,
									"aria-label": "Select all rows",
									"data-testid": `${testId}-select-all`
								})
							}), columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: cn("whitespace-nowrap px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground", column.align === "right" && "text-right", column.align === "center" && "text-center", column.headClassName),
								children: column.sortable && onSortChange ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => changeSort(column.key),
									"data-testid": `${testId}-sort-${column.key}`,
									className: "inline-flex items-center gap-1 transition-colors hover:text-foreground focus-ring",
									children: [column.header, sort?.key === column.key ? sort.dir === "asc" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, { className: "h-3 w-3" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "h-3 w-3 opacity-25" })]
								}) : column.header
							}, column.key))]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
						className: "divide-y divide-hairline",
						children: rows.map((row) => {
							const id = rowId(row);
							const isSelected = selected.includes(id);
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								"data-testid": rowTestId ? rowTestId(row) : `${testId}-row-${id}`,
								onClick: onRowClick ? () => onRowClick(row) : void 0,
								className: cn("group transition-colors duration-150", onRowClick && "cursor-pointer", isSelected ? "bg-primary/[0.05]" : "hover:bg-surface-2"),
								children: [selectable && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-2.5",
									onClick: (e) => e.stopPropagation(),
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
										checked: isSelected,
										onCheckedChange: () => toggleOne(id),
										"aria-label": "Select row",
										"data-testid": `${testId}-select-${id}`
									})
								}), columns.map((column) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: cn("px-4 py-2.5 align-middle", column.align === "right" && "text-right", column.align === "center" && "text-center", column.cellClassName),
									children: column.render(row)
								}, column.key))]
							}, id);
						})
					})]
				})
			}),
			(total > 0 || footNote) && !loading && !error && rows.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-4 py-2.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "num text-xs text-muted-foreground",
					"data-testid": `${testId}-summary`,
					children: footNote ?? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						"Showing ",
						(page - 1) * pageSize + 1,
						"–",
						Math.min(page * pageSize, total),
						" of ",
						total
					] })
				}), onPageChange && pageCount > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "h-7 gap-1 px-2 text-xs",
							disabled: page <= 1,
							"data-testid": `${testId}-prev-page`,
							onClick: () => onPageChange(page - 1),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "h-3.5 w-3.5" }), " Prev"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "num px-2 text-xs text-muted-foreground",
							"data-testid": `${testId}-page-indicator`,
							children: [
								page,
								" / ",
								pageCount
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							className: "h-7 gap-1 px-2 text-xs",
							disabled: page >= pageCount,
							"data-testid": `${testId}-next-page`,
							onClick: () => onPageChange(page + 1),
							children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "h-3.5 w-3.5" })]
						})
					]
				})]
			})
		]
	});
}
//#endregion
export { DataTable };
