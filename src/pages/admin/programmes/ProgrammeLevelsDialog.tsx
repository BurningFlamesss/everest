import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "#/components/ui/dialog";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import { Textarea } from "#/components/ui/textarea";
import type { Level } from "#/types";

function blankLevel(index: number): Level {
	const slug = `level-${Date.now().toString(36)}-${index + 1}`;
	return {
		id: slug,
		label: "",
		short: "",
		grades: "",
		board: "",
		tagline: "",
		description: "",
		image: "",
	};
}

/**
 * Programme levels are free-form groups (e.g. "Montessori · Nursery · KG" or
 * "Class 1–8"). Saving stores the complete ordered list in the courses CMS.
 */
export function ProgrammeLevelsDialog({
	open,
	levels,
	busy,
	onOpenChange,
	onSave,
}: {
	open: boolean;
	levels: Level[];
	busy: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (levels: Level[]) => void;
}) {
	const [draft, setDraft] = useState<Level[]>(levels);

	useEffect(() => {
		if (open) setDraft(levels.map((level) => ({ ...level })));
	}, [open, levels]);

	const update = (index: number, patch: Partial<Level>) =>
		setDraft((current) =>
			current.map((level, i) => (i === index ? { ...level, ...patch } : level)),
		);

	const move = (index: number, direction: -1 | 1) =>
		setDraft((current) => {
			const next = [...current];
			const target = index + direction;
			if (target < 0 || target >= next.length) return current;
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[92vh] overflow-y-auto border-hairline bg-popover sm:max-w-4xl">
				<DialogHeader>
					<DialogTitle>Programme levels</DialogTitle>
					<DialogDescription>
						Group grades into levels however the school runs them — for example
						Montessori, Nursery and KG as one level, Class 1–8 as another. The
						public courses page and the programme form both use this list.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-3">
					{draft.map((level, index) => (
						<div
							// biome-ignore lint/suspicious/noArrayIndexKey: level rows are positional and editable
							key={index}
							className="space-y-3 rounded-lg border border-hairline bg-surface-1 p-3.5"
						>
							<div className="flex items-center justify-between gap-2">
								<span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
									Level {index + 1}
								</span>
								<div className="flex items-center gap-1">
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										aria-label={`Move ${level.label || "level"} up`}
										disabled={index === 0}
										onClick={() => move(index, -1)}
									>
										<ArrowUp className="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7"
										aria-label={`Move ${level.label || "level"} down`}
										disabled={index === draft.length - 1}
										onClick={() => move(index, 1)}
									>
										<ArrowDown className="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										className="h-7 w-7 text-destructive"
										aria-label={`Remove ${level.label || "level"}`}
										onClick={() =>
											setDraft((current) =>
												current.filter((_, i) => i !== index),
											)
										}
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
							</div>
							<div className="grid gap-3 sm:grid-cols-3">
								<div className="space-y-1.5">
									<Label className="text-xs">Label</Label>
									<Input
										value={level.label}
										placeholder="Class 1–8"
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) => update(index, { label: event.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Short label</Label>
									<Input
										value={level.short}
										placeholder="Grade 1–8"
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) => update(index, { short: event.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Grades</Label>
									<Input
										value={level.grades}
										placeholder="Grade 1 – Grade 8"
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) => update(index, { grades: event.target.value })}
									/>
								</div>
							</div>
							<div className="grid gap-3 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label className="text-xs">Board / curriculum</Label>
									<Input
										value={level.board}
										placeholder="CDC Basic Level Curriculum"
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) => update(index, { board: event.target.value })}
									/>
								</div>
								<div className="space-y-1.5">
									<Label className="text-xs">Image URL</Label>
									<Input
										value={level.image}
										placeholder="/images/…"
										onChange={(
											event: React.ChangeEvent<
												HTMLInputElement | HTMLTextAreaElement
											>,
										) => update(index, { image: event.target.value })}
									/>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Tagline</Label>
								<Input
									value={level.tagline}
									placeholder="Where curiosity is given room to breathe."
									onChange={(
										event: React.ChangeEvent<
											HTMLInputElement | HTMLTextAreaElement
										>,
									) => update(index, { tagline: event.target.value })}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Description</Label>
								<Textarea
									rows={2}
									value={level.description}
									onChange={(
										event: React.ChangeEvent<
											HTMLInputElement | HTMLTextAreaElement
										>,
									) => update(index, { description: event.target.value })}
								/>
							</div>
						</div>
					))}

					<Button
						variant="outline"
						size="sm"
						className="gap-1.5"
						onClick={() =>
							setDraft((current) => [...current, blankLevel(current.length)])
						}
					>
						<Plus className="h-3.5 w-3.5" /> Add level
					</Button>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						disabled={busy || draft.some((level) => !level.label.trim())}
						onClick={() => onSave(draft)}
					>
						{busy ? "Saving…" : "Save levels"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
