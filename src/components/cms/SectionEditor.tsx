import { MousePointerClick, Plus, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	BLOCK_FIELDS,
	type FieldDef,
	type ItemFieldDef,
	rows,
	str,
	tags,
} from "#/components/cms/block-fields";
import { EmptyState } from "#/components/common/EmptyState";
import { ImageUploader } from "#/components/common/ImageUploader";
import { Panel } from "#/components/common/Panel";
import { RichTextEditor } from "#/components/common/RichTextEditor";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Switch } from "#/components/ui/switch";
import { Textarea } from "#/components/ui/textarea";
import { sectionLabel } from "#/lib/cms-sections";
import type { BlockType } from "#/types";

interface SectionEditorProps {
	sectionType: BlockType | null;
	/** Current saved fields, or the section defaults when it has not been saved yet. */
	fields: Record<string, unknown> | undefined;
	canManage: boolean;
	saving: boolean;
	onSave: (fields: Record<string, unknown>) => void;
	/**
	 * Restrict the rendered fields to these keys. The full field set is still
	 * submitted on save, so a page-skeleton editor can edit one visual block
	 * without overwriting the rest of the section.
	 */
	onlyKeys?: string[];
	/** Optional panel heading; defaults to the section label. */
	title?: string;
}

type ListField =
	| Extract<FieldDef, { kind: "list" }>
	| {
			key: string;
			label: string;
			kind: "list";
			addLabel?: string;
			itemLabel?: string;
			itemFields: ItemFieldDef[];
			help?: string;
			collapsible?: boolean;
	  };

/**
 * Content-only editor for a fixed CMS section. Renders every field kind the
 * schema supports (text/textarea/richtext/image/number/date/url/tags/list) so
 * sections backed by repeatable content (chapters, cards, fact rows) are fully
 * editable. Lists can nest further lists and tag fields, which is what makes
 * timetable rows editable. Style/visibility/duplicate stay with the free-form
 * block inspector.
 */
export function SectionEditor({
	sectionType,
	fields,
	canManage,
	saving,
	onSave,
	onlyKeys,
	title,
}: SectionEditorProps) {
	const [draft, setDraft] = useState<Record<string, unknown>>({});

	useEffect(() => {
		setDraft(fields ? JSON.parse(JSON.stringify(fields)) : {});
	}, [fields]);

	const dirty = useMemo(
		() => (fields ? JSON.stringify(draft) !== JSON.stringify(fields) : false),
		[draft, fields],
	);

	if (!sectionType) {
		return (
			<Panel
				eyebrow="Section editor"
				title="Nothing selected"
				testId="cms-section-editor"
			>
				<EmptyState
					compact
					icon={MousePointerClick}
					title="Click a section to edit it"
					description="Choose a section from the list, or click one directly in the live preview."
					testId="cms-section-editor-empty"
				/>
			</Panel>
		);
	}

	const allDefs = BLOCK_FIELDS[sectionType] ?? [];
	const defs = onlyKeys
		? allDefs.filter((field) => onlyKeys.includes(field.key))
		: allDefs;
	const set = (key: string, value: unknown) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const renderField = (field: FieldDef) => {
		const inputId = `cms-section-${sectionType}-${field.key}`;

		if (field.kind === "list") {
			return (
				<ListEditor
					key={field.key}
					field={field}
					items={rows(draft, field.key)}
					canManage={canManage}
					testIdRoot={field.key}
					onChange={(items) => set(field.key, items)}
				/>
			);
		}

		if (field.kind === "tags") {
			return (
				<TagsEditor
					key={field.key}
					id={inputId}
					label={field.label}
					values={tags(draft, field.key)}
					placeholder={field.placeholder}
					help={field.help}
					canManage={canManage}
					testId={field.key}
					onChange={(values) => set(field.key, values)}
				/>
			);
		}

		if (field.kind === "image") {
			return (
				<ImageUploader
					key={field.key}
					value={str(draft, field.key) || undefined}
					label={field.label}
					testId={`cms-section-image-${field.key}`}
					onChange={(url: string | undefined) => set(field.key, url ?? "")}
				/>
			);
		}

		if (field.kind === "richtext") {
			return (
				<div key={field.key} className="space-y-1.5">
					<Label className="text-xs">{field.label}</Label>
					<RichTextEditor
						value={str(draft, field.key, "<p></p>")}
						minHeight="min-h-[160px]"
						placeholder={field.placeholder ?? "Write this section's content…"}
						testId={`cms-section-richtext-${field.key}`}
						onChange={(html: string) => set(field.key, html)}
					/>
				</div>
			);
		}

		if (field.kind === "textarea") {
			return (
				<div key={field.key} className="space-y-1.5">
					<Label className="text-xs" htmlFor={inputId}>
						{field.label}
					</Label>
					<Textarea
						id={inputId}
						rows={3}
						value={str(draft, field.key)}
						disabled={!canManage}
						data-testid={`cms-section-input-${field.key}`}
						onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
							set(field.key, event.target.value)
						}
					/>
					{field.help && (
						<p className="text-[11px] text-muted-foreground">{field.help}</p>
					)}
				</div>
			);
		}

		return (
			<div key={field.key} className="space-y-1.5">
				<Label className="text-xs" htmlFor={inputId}>
					{field.label}
				</Label>
				<Input
					id={inputId}
					type={
						field.kind === "number"
							? "number"
							: field.kind === "date"
								? "date"
								: "text"
					}
					value={str(draft, field.key)}
					placeholder={
						field.kind === "text" || field.kind === "url"
							? field.placeholder
							: undefined
					}
					disabled={!canManage}
					className="h-9 text-sm"
					data-testid={`cms-section-input-${field.key}`}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						set(
							field.key,
							field.kind === "number"
								? Number(event.target.value)
								: event.target.value,
						)
					}
				/>
				{field.help && (
					<p className="text-[11px] text-muted-foreground">{field.help}</p>
				)}
			</div>
		);
	};

	return (
		<Panel
			eyebrow="Section editor"
			title={title ?? sectionLabel(sectionType)}
			description={sectionType.replace(/_/g, " ")}
			testId="cms-section-editor"
			bodyClassName="p-0"
			footer={
				canManage ? (
					<div className="flex items-center justify-between gap-2">
						<p
							className="text-[11px] text-muted-foreground"
							data-testid="cms-section-editor-dirty"
						>
							{dirty ? "Unsaved changes" : "All changes saved"}
						</p>
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								data-testid="cms-section-editor-reset"
								onClick={() =>
									fields && setDraft(JSON.parse(JSON.stringify(fields)))
								}
							>
								<RotateCcw className="h-3 w-3" /> Reset
							</Button>
							<Button
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								data-testid="cms-section-editor-save"
								onClick={() => onSave(draft)}
							>
								<Save className="h-3 w-3" />{" "}
								{saving ? "Saving…" : "Save section"}
							</Button>
						</div>
					</div>
				) : (
					<p className="text-[11px] text-muted-foreground">
						Your role can view but not edit website content.
					</p>
				)
			}
		>
			{defs.length === 0 ? (
				<p className="p-4 text-sm text-muted-foreground">
					This section has no editable fields.
				</p>
			) : (
				<div className="space-y-4 p-4">{defs.map(renderField)}</div>
			)}
		</Panel>
	);
}

/* ------------------------------------------------------------------------- */
/* Repeatable fields                                                          */
/* ------------------------------------------------------------------------- */

function ListEditor({
	field,
	items,
	canManage,
	testIdRoot,
	onChange,
}: {
	field: ListField;
	items: Record<string, unknown>[];
	canManage: boolean;
	testIdRoot: string;
	onChange: (items: Record<string, unknown>[]) => void;
}) {
	const [openItems, setOpenItems] = useState<Record<number, boolean>>({});
	const collapsible = Boolean(field.collapsible);
	const addLabel = field.addLabel ?? "Add item";
	const itemLabel = field.itemLabel ?? "Item";

	const setItem = (index: number, key: string, value: unknown) => {
		onChange(
			items.map((item, itemIndex) =>
				itemIndex === index ? { ...item, [key]: value } : item,
			),
		);
	};
	const addItem = () => {
		const blank: Record<string, unknown> = {};
		field.itemFields.forEach((itemField) => {
			blank[itemField.key] = itemField.kind === "boolean" ? false : "";
		});
		onChange([...items, blank]);
	};
	const removeItem = (index: number) => {
		onChange(items.filter((_, itemIndex) => itemIndex !== index));
	};
	const moveItem = (index: number, direction: -1 | 1) => {
		const target = index + direction;
		if (target < 0 || target >= items.length) return;
		const next = [...items];
		[next[index], next[target]] = [next[target], next[index]];
		onChange(next);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between gap-2">
				<Label className="text-xs">{field.label}</Label>
				<Button
					variant="outline"
					size="sm"
					className="h-6 gap-1 px-1.5 text-[11px]"
					disabled={!canManage}
					data-testid={`cms-section-list-add-${testIdRoot}`}
					onClick={addItem}
				>
					<Plus className="h-3 w-3" /> {addLabel}
				</Button>
			</div>
			{field.help && (
				<p className="text-[11px] text-muted-foreground">{field.help}</p>
			)}
			{items.length === 0 && (
				<p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
					No {field.label.toLowerCase()} yet.
				</p>
			)}
			<div className="space-y-2">
				{items.map((item, index) => {
					const expanded = !collapsible || Boolean(openItems[index]);
					return (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: list rows are positional and editable
							key={index}
							className="rounded-lg border border-hairline bg-surface-2 p-2.5"
							data-testid={`cms-section-list-item-${testIdRoot}-${index}`}
						>
							<div className="mb-2 flex items-center justify-between gap-2">
								<button
									type="button"
									className="min-w-0 flex-1 text-left"
									disabled={!collapsible}
									onClick={() =>
										collapsible &&
										setOpenItems((current) => ({
											...current,
											[index]: !current[index],
										}))
									}
								>
									<p className="num truncate text-[11px] font-semibold text-muted-foreground">
										{str(item, "label") ||
										str(item, "title") ||
										str(item, "day")
											? `${itemLabel} ${index + 1} · ${
													str(item, "label") ||
													str(item, "title") ||
													str(item, "day")
												}`
											: `${itemLabel} ${index + 1}`}
									</p>
									{collapsible ? (
										<span className="text-[10px] text-muted-foreground">
											{expanded ? "Hide details" : "Show details"}
										</span>
									) : null}
								</button>
								<div className="flex items-center gap-0.5">
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5 text-[10px]"
										aria-label="Move up"
										disabled={index === 0 || !canManage}
										onClick={() => moveItem(index, -1)}
									>
										↑
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5 text-[10px]"
										aria-label="Move down"
										disabled={index === items.length - 1 || !canManage}
										onClick={() => moveItem(index, 1)}
									>
										↓
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-5 w-5 text-destructive"
										aria-label="Remove item"
										disabled={!canManage}
										data-testid={`cms-section-list-remove-${testIdRoot}-${index}`}
										onClick={() => removeItem(index)}
									>
										<X className="h-3 w-3" />
									</Button>
								</div>
							</div>
							{expanded && (
								<div className="space-y-2">
									{field.itemFields.map((itemField) => (
										<ItemFieldControl
											key={itemField.key}
											field={itemField}
											value={item[itemField.key]}
											path={`${testIdRoot}-${index}`}
											canManage={canManage}
											onChange={(value) => setItem(index, itemField.key, value)}
										/>
									))}
								</div>
							)}
						</div>
					);
				})}
			</div>
		</div>
	);
}

function ItemFieldControl({
	field,
	value,
	path,
	canManage,
	onChange,
}: {
	field: ItemFieldDef;
	value: unknown;
	path: string;
	canManage: boolean;
	onChange: (value: unknown) => void;
}) {
	if (field.kind === "list") {
		return (
			<ListEditor
				field={{
					key: field.key,
					label: field.label,
					kind: "list",
					addLabel: field.addLabel,
					itemLabel: field.itemLabel,
					itemFields: field.itemFields ?? [],
					help: field.help,
					collapsible: field.collapsible,
				}}
				items={Array.isArray(value) ? (value as Record<string, unknown>[]) : []}
				canManage={canManage}
				testIdRoot={`${path}-${field.key}`}
				onChange={onChange}
			/>
		);
	}

	if (field.kind === "tags") {
		return (
			<TagsEditor
				label={field.label}
				values={Array.isArray(value) ? (value as string[]) : []}
				placeholder={field.placeholder}
				help={field.help}
				canManage={canManage}
				testId={`${path}-${field.key}`}
				onChange={onChange}
			/>
		);
	}

	if (field.kind === "boolean") {
		return (
			<div className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface-1 px-2.5 py-2">
				<div>
					<Label className="text-[11px]">{field.label}</Label>
					{field.help ? (
						<p className="text-[10px] text-muted-foreground">{field.help}</p>
					) : null}
				</div>
				<Switch
					checked={value === true || value === "true"}
					disabled={!canManage}
					onCheckedChange={(checked: boolean) => onChange(checked)}
				/>
			</div>
		);
	}

	if (field.kind === "image") {
		return (
			<ImageUploader
				value={typeof value === "string" ? value || undefined : undefined}
				label={field.label}
				aspect="aspect-[16/9]"
				testId={`cms-section-item-image-${path}-${field.key}`}
				onChange={(url: string | undefined) => onChange(url ?? "")}
			/>
		);
	}

	if (field.kind === "textarea") {
		return (
			<div className="space-y-1">
				<Label className="text-[11px]">{field.label}</Label>
				<Textarea
					rows={2}
					value={typeof value === "string" ? value : ""}
					disabled={!canManage}
					data-testid={`cms-section-item-input-${path}-${field.key}`}
					onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
						onChange(event.target.value)
					}
				/>
				{field.help ? (
					<p className="text-[10px] text-muted-foreground">{field.help}</p>
				) : null}
			</div>
		);
	}

	return (
		<div className="space-y-1">
			<Label className="text-[11px]">{field.label}</Label>
			<Input
				value={typeof value === "string" ? value : ""}
				placeholder={field.placeholder}
				disabled={!canManage}
				className="h-8 text-sm"
				data-testid={`cms-section-item-input-${path}-${field.key}`}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
					onChange(event.target.value)
				}
			/>
			{field.help ? (
				<p className="text-[10px] text-muted-foreground">{field.help}</p>
			) : null}
		</div>
	);
}

function TagsEditor({
	id,
	label,
	values,
	placeholder,
	help,
	canManage,
	testId,
	onChange,
}: {
	id?: string;
	label: string;
	values: string[];
	placeholder?: string;
	help?: string;
	canManage: boolean;
	testId: string;
	onChange: (values: string[]) => void;
}) {
	const [input, setInput] = useState("");

	const add = () => {
		const value = input.trim();
		if (!value || values.includes(value)) {
			setInput("");
			return;
		}
		onChange([...values, value]);
		setInput("");
	};

	return (
		<div className="space-y-1.5">
			<Label className="text-[11px]" htmlFor={id}>
				{label}
			</Label>
			<div className="flex gap-2">
				<Input
					id={id}
					value={input}
					placeholder={placeholder}
					disabled={!canManage}
					className="h-8 text-sm"
					data-testid={`cms-section-tag-input-${testId}`}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
						setInput(event.target.value)
					}
					onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
						if (event.key === "Enter") {
							event.preventDefault();
							add();
						}
					}}
				/>
				<Button
					variant="outline"
					size="sm"
					className="h-8"
					disabled={!canManage || !input.trim()}
					data-testid={`cms-section-tag-add-${testId}`}
					onClick={add}
				>
					Add
				</Button>
			</div>
			{help ? (
				<p className="text-[10px] text-muted-foreground">{help}</p>
			) : null}
			<div className="flex flex-wrap gap-1.5">
				{values.map((value) => (
					<span
						key={value}
						className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-2 px-2 py-0.5 text-[11px] text-foreground"
					>
						{value}
						<button
							type="button"
							aria-label={`Remove ${value}`}
							disabled={!canManage}
							data-testid={`cms-section-tag-remove-${testId}-${value}`}
							onClick={() => onChange(values.filter((item) => item !== value))}
							className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-destructive focus-ring"
						>
							<X className="h-2.5 w-2.5" />
						</button>
					</span>
				))}
			</div>
		</div>
	);
}
