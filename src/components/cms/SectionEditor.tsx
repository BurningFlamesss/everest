import { MousePointerClick, Plus, RotateCcw, Save, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
	BLOCK_FIELDS,
	type FieldDef,
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
}

/**
 * Content-only editor for a fixed CMS section. Renders every field kind the
 * schema supports (text/textarea/richtext/image/number/date/url/tags/list) so
 * sections backed by repeatable content (chapters, cards, fact rows) are fully
 * editable. Style/visibility/duplicate stay with the free-form block inspector.
 */
export function SectionEditor({
	sectionType,
	fields,
	canManage,
	saving,
	onSave,
}: SectionEditorProps) {
	const [draft, setDraft] = useState<Record<string, unknown>>({});
	const [tagInput, setTagInput] = useState("");

	useEffect(() => {
		setDraft(fields ? JSON.parse(JSON.stringify(fields)) : {});
		setTagInput("");
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

	const defs = BLOCK_FIELDS[sectionType] ?? [];
	const set = (key: string, value: unknown) =>
		setDraft((current) => ({ ...current, [key]: value }));

	// ---- list field helpers -------------------------------------------------
	const setItem = (
		listKey: string,
		index: number,
		itemKey: string,
		value: unknown,
	) => {
		setDraft((current) => {
			const list = Array.isArray(current[listKey])
				? [...(current[listKey] as Record<string, unknown>[])]
				: [];
			list[index] = { ...list[index], [itemKey]: value };
			return { ...current, [listKey]: list };
		});
	};
	const addItem = (field: Extract<FieldDef, { kind: "list" }>) => {
		setDraft((current) => {
			const list = Array.isArray(current[field.key])
				? [...(current[field.key] as Record<string, unknown>[])]
				: [];
			const blank: Record<string, unknown> = {};
			field.itemFields.forEach((itemField) => {
				blank[itemField.key] = "";
			});
			return { ...current, [field.key]: [...list, blank] };
		});
	};
	const removeItem = (listKey: string, index: number) => {
		setDraft((current) => {
			const list = Array.isArray(current[listKey])
				? [...(current[listKey] as Record<string, unknown>[])]
				: [];
			list.splice(index, 1);
			return { ...current, [listKey]: list };
		});
	};
	const moveItem = (listKey: string, index: number, direction: -1 | 1) => {
		setDraft((current) => {
			const list = Array.isArray(current[listKey])
				? [...(current[listKey] as Record<string, unknown>[])]
				: [];
			const target = index + direction;
			if (target < 0 || target >= list.length) return current;
			[list[index], list[target]] = [list[target], list[index]];
			return { ...current, [listKey]: list };
		});
	};

	// ---- tags field helpers -------------------------------------------------
	const addTag = (listKey: string) => {
		const value = tagInput.trim();
		if (!value) return;
		setDraft((current) => {
			const list = Array.isArray(current[listKey])
				? (current[listKey] as string[])
				: [];
			if (list.includes(value)) return current;
			return { ...current, [listKey]: [...list, value] };
		});
		setTagInput("");
	};
	const removeTag = (listKey: string, value: string) => {
		setDraft((current) => {
			const list = Array.isArray(current[listKey])
				? (current[listKey] as string[])
				: [];
			return { ...current, [listKey]: list.filter((item) => item !== value) };
		});
	};

	const renderField = (field: FieldDef) => {
		const inputId = `cms-section-${sectionType}-${field.key}`;

		if (field.kind === "list") {
			const items = rows(draft, field.key);
			return (
				<div key={field.key} className="space-y-2">
					<div className="flex items-center justify-between gap-2">
						<Label className="text-xs">{field.label}</Label>
						<Button
							variant="outline"
							size="sm"
							className="h-6 gap-1 px-1.5 text-[11px]"
							disabled={!canManage}
							data-testid={`cms-section-list-add-${field.key}`}
							onClick={() => addItem(field)}
						>
							<Plus className="h-3 w-3" /> {field.addLabel}
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
						{items.map((item, index) => (
							<div
								key={index}
								className="rounded-lg border border-hairline bg-surface-2 p-2.5"
								data-testid={`cms-section-list-item-${field.key}-${index}`}
							>
								<div className="mb-2 flex items-center justify-between gap-2">
									<p className="num text-[11px] font-semibold text-muted-foreground">
										{field.itemLabel} {index + 1}
									</p>
									<div className="flex items-center gap-0.5">
										<Button
											variant="ghost"
											size="icon"
											className="h-5 w-5 text-[10px]"
											aria-label="Move up"
											disabled={index === 0 || !canManage}
											onClick={() => moveItem(field.key, index, -1)}
										>
											↑
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-5 w-5 text-[10px]"
											aria-label="Move down"
											disabled={index === items.length - 1 || !canManage}
											onClick={() => moveItem(field.key, index, 1)}
										>
											↓
										</Button>
										<Button
											variant="ghost"
											size="icon"
											className="h-5 w-5 text-destructive"
											aria-label="Remove item"
											disabled={!canManage}
											data-testid={`cms-section-list-remove-${field.key}-${index}`}
											onClick={() => removeItem(field.key, index)}
										>
											<X className="h-3 w-3" />
										</Button>
									</div>
								</div>
								<div className="space-y-2">
									{field.itemFields.map((itemField) => {
										const value =
											typeof item[itemField.key] === "string"
												? (item[itemField.key] as string)
												: "";
										if (itemField.kind === "image") {
											return (
												<ImageUploader
													key={itemField.key}
													value={value || undefined}
													label={itemField.label}
													aspect="aspect-[16/9]"
													testId={`cms-section-item-image-${field.key}-${index}`}
													onChange={(url: string | undefined) =>
														setItem(field.key, index, itemField.key, url ?? "")
													}
												/>
											);
										}
										if (itemField.kind === "textarea") {
											return (
												<div key={itemField.key} className="space-y-1">
													<Label className="text-[11px]">
														{itemField.label}
													</Label>
													<Textarea
														rows={2}
														value={value}
														disabled={!canManage}
														data-testid={`cms-section-item-input-${field.key}-${index}-${itemField.key}`}
														onChange={(
															event: React.ChangeEvent<HTMLTextAreaElement>,
														) =>
															setItem(
																field.key,
																index,
																itemField.key,
																event.target.value,
															)
														}
													/>
												</div>
											);
										}
										return (
											<div key={itemField.key} className="space-y-1">
												<Label className="text-[11px]">{itemField.label}</Label>
												<Input
													value={value}
													disabled={!canManage}
													className="h-8 text-sm"
													data-testid={`cms-section-item-input-${field.key}-${index}-${itemField.key}`}
													onChange={(
														event: React.ChangeEvent<HTMLInputElement>,
													) =>
														setItem(
															field.key,
															index,
															itemField.key,
															event.target.value,
														)
													}
												/>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</div>
			);
		}

		if (field.kind === "tags") {
			const values = tags(draft, field.key);
			return (
				<div key={field.key} className="space-y-1.5">
					<Label className="text-xs" htmlFor={inputId}>
						{field.label}
					</Label>
					<div className="flex gap-2">
						<Input
							id={inputId}
							value={tagInput}
							placeholder={field.placeholder}
							disabled={!canManage}
							className="h-8 text-sm"
							data-testid={`cms-section-tag-input-${field.key}`}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
								setTagInput(event.target.value)
							}
							onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
								if (event.key === "Enter") {
									event.preventDefault();
									addTag(field.key);
								}
							}}
						/>
						<Button
							variant="outline"
							size="sm"
							className="h-8"
							disabled={!canManage || !tagInput.trim()}
							data-testid={`cms-section-tag-add-${field.key}`}
							onClick={() => addTag(field.key)}
						>
							Add
						</Button>
					</div>
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
									data-testid={`cms-section-tag-remove-${field.key}-${value}`}
									onClick={() => removeTag(field.key, value)}
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
			title={sectionLabel(sectionType)}
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
