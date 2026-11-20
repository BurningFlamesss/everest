import { Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Panel } from "#/components/common/Panel";
import { Button } from "#/components/ui/button";
import { Input } from "#/components/ui/input";
import { Label } from "#/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "#/components/ui/select";
import { Textarea } from "#/components/ui/textarea";
import type { FeeLine, Program, Subject } from "#/types";

export type ProgrammeTabKey = "overview" | "subjects" | "fees" | "pathways";

const SUBJECT_KINDS: Subject["kind"][] = [
	"Compulsory",
	"Optional",
	"Elective",
	"Co-curricular",
];

const FEE_FREQUENCIES: FeeLine["frequency"][] = [
	"Annual",
	"Monthly",
	"One-time",
	"Per term",
];

const TAB_LABELS: Record<ProgrammeTabKey, string> = {
	overview: "Overview content",
	subjects: "Subjects content",
	fees: "Fees content",
	pathways: "Pathways content",
};

function clone(program: Program): Program {
	return JSON.parse(JSON.stringify(program)) as Program;
}

function lineList(values: string[] | undefined) {
	return (values ?? []).join("\n");
}

/**
 * Edits the record-backed content behind one programme tab. The public courses
 * page reads these fields from the programme record, so saving here is the same
 * write the Programmes screen performs.
 */
export function ProgrammeTabEditor({
	tab,
	program,
	canManage,
	saving,
	onSave,
}: {
	tab: ProgrammeTabKey;
	program: Program;
	canManage: boolean;
	saving: boolean;
	onSave: (program: Program) => void;
}) {
	const [draft, setDraft] = useState<Program>(() => clone(program));

	// Re-seat the draft when a different programme or tab is selected.
	// biome-ignore lint/correctness/useExhaustiveDependencies: program object identity changes per save; tab resets the form
	useEffect(() => {
		setDraft(clone(program));
	}, [program.id, tab, program]);

	const dirty = useMemo(
		() => JSON.stringify(draft) !== JSON.stringify(program),
		[draft, program],
	);

	const set = <K extends keyof Program>(key: K, value: Program[K]) =>
		setDraft((current) => ({ ...current, [key]: value }));

	const subjects = draft.subjects ?? [];
	const fees = draft.fees ?? [];

	return (
		<Panel
			eyebrow="Programme"
			title={`${program.title} · ${TAB_LABELS[tab]}`}
			description="These fields are read from the programme record by the public courses page."
			testId={`programme-tab-editor-${tab}`}
			footer={
				canManage ? (
					<div className="flex items-center justify-between gap-2">
						<p className="text-[11px] text-muted-foreground">
							{dirty ? "Unsaved changes" : "All changes saved"}
						</p>
						<div className="flex items-center gap-1.5">
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								onClick={() => setDraft(clone(program))}
							>
								<RotateCcw className="h-3 w-3" /> Reset
							</Button>
							<Button
								size="sm"
								className="h-7 gap-1.5 px-2 text-xs"
								disabled={!dirty || saving}
								data-testid={`programme-tab-save-${tab}`}
								onClick={() => onSave(draft)}
							>
								<Save className="h-3 w-3" />
								{saving ? "Saving…" : "Save programme"}
							</Button>
						</div>
					</div>
				) : (
					<p className="text-[11px] text-muted-foreground">
						Your role can view but not edit programme records.
					</p>
				)
			}
		>
			<div className="space-y-4">
				{tab === "overview" ? (
					<>
						<div className="space-y-1.5">
							<Label className="text-xs">Overview description</Label>
							<Textarea
								rows={4}
								value={draft.description}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set("description", event.target.value)
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Featured card summary</Label>
							<Textarea
								rows={2}
								value={draft.summary}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set("summary", event.target.value)
								}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label className="text-xs">Duration</Label>
								<Input
									value={draft.duration}
									disabled={!canManage}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set("duration", event.target.value)
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Seats</Label>
								<Input
									type="number"
									value={draft.seats}
									disabled={!canManage}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set("seats", Number(event.target.value))
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Medium</Label>
								<Input
									value={draft.medium}
									disabled={!canManage}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set("medium", event.target.value)
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label className="text-xs">Stream</Label>
								<Input
									value={draft.stream ?? ""}
									disabled={!canManage}
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set("stream", event.target.value)
									}
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">Eligibility</Label>
							<Textarea
								rows={2}
								value={draft.eligibility}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set("eligibility", event.target.value)
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">
								What makes it distinctive (one per line)
							</Label>
							<Textarea
								rows={4}
								value={lineList(draft.highlights)}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set(
										"highlights",
										event.target.value.split("\n").filter(Boolean),
									)
								}
							/>
						</div>
					</>
				) : null}

				{tab === "subjects" ? (
					<div className="space-y-3">
						<div className="flex items-center justify-between gap-2">
							<p className="text-[11px] text-muted-foreground">
								{subjects.length} subject{subjects.length === 1 ? "" : "s"} ·{" "}
								{subjects.reduce((sum, subject) => sum + subject.credit, 0)}{" "}
								credit hours
							</p>
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1 px-2 text-xs"
								disabled={!canManage}
								onClick={() =>
									set("subjects", [
										...subjects,
										{
											code: "",
											name: "",
											credit: 0,
											kind: "Compulsory",
										},
									])
								}
							>
								<Plus className="h-3 w-3" /> Add subject
							</Button>
						</div>
						{subjects.map((subject, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: subject rows are positional and editable
								key={index}
								className="grid grid-cols-[1fr_1.4fr_64px_130px_32px] items-center gap-1.5"
							>
								<Input
									value={subject.code}
									placeholder="Code"
									disabled={!canManage}
									className="h-8 text-xs"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set(
											"subjects",
											subjects.map((row, rowIndex) =>
												rowIndex === index
													? { ...row, code: event.target.value }
													: row,
											),
										)
									}
								/>
								<Input
									value={subject.name}
									placeholder="Subject name"
									disabled={!canManage}
									className="h-8 text-xs"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set(
											"subjects",
											subjects.map((row, rowIndex) =>
												rowIndex === index
													? { ...row, name: event.target.value }
													: row,
											),
										)
									}
								/>
								<Input
									type="number"
									value={subject.credit}
									aria-label="Credit hours"
									disabled={!canManage}
									className="h-8 text-xs"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set(
											"subjects",
											subjects.map((row, rowIndex) =>
												rowIndex === index
													? { ...row, credit: Number(event.target.value) }
													: row,
											),
										)
									}
								/>
								<Select
									value={subject.kind}
									disabled={!canManage}
									onValueChange={(value: string) =>
										set(
											"subjects",
											subjects.map((row, rowIndex) =>
												rowIndex === index
													? { ...row, kind: value as Subject["kind"] }
													: row,
											),
										)
									}
								>
									<SelectTrigger className="h-8 text-xs">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{SUBJECT_KINDS.map((kind) => (
											<SelectItem key={kind} value={kind}>
												{kind}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<Button
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-destructive"
									aria-label={`Remove subject ${index + 1}`}
									disabled={!canManage}
									onClick={() =>
										set(
											"subjects",
											subjects.filter((_, rowIndex) => rowIndex !== index),
										)
									}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						))}
						{subjects.length === 0 ? (
							<p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
								No subjects yet.
							</p>
						) : null}
					</div>
				) : null}

				{tab === "fees" ? (
					<div className="space-y-3">
						<div className="flex items-center justify-between gap-2">
							<p className="text-[11px] text-muted-foreground">
								{fees.length} fee line{fees.length === 1 ? "" : "s"}
							</p>
							<Button
								variant="outline"
								size="sm"
								className="h-7 gap-1 px-2 text-xs"
								disabled={!canManage}
								onClick={() =>
									set("fees", [
										...fees,
										{
											label: "",
											amount: 0,
											frequency: "Annual",
											note: "",
										},
									])
								}
							>
								<Plus className="h-3 w-3" /> Add fee line
							</Button>
						</div>
						{fees.map((fee, index) => (
							<div
								// biome-ignore lint/suspicious/noArrayIndexKey: fee rows are positional and editable
								key={index}
								className="space-y-1.5 rounded-md border border-hairline bg-surface-2 p-2"
							>
								<div className="grid grid-cols-[1.4fr_100px_130px_32px] items-center gap-1.5">
									<Input
										value={fee.label}
										placeholder="Particular"
										disabled={!canManage}
										className="h-8 text-xs"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											set(
												"fees",
												fees.map((row, rowIndex) =>
													rowIndex === index
														? { ...row, label: event.target.value }
														: row,
												),
											)
										}
									/>
									<Input
										type="number"
										value={fee.amount}
										aria-label="Amount"
										disabled={!canManage}
										className="h-8 text-xs"
										onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
											set(
												"fees",
												fees.map((row, rowIndex) =>
													rowIndex === index
														? { ...row, amount: Number(event.target.value) }
														: row,
												),
											)
										}
									/>
									<Select
										value={fee.frequency}
										disabled={!canManage}
										onValueChange={(value: string) =>
											set(
												"fees",
												fees.map((row, rowIndex) =>
													rowIndex === index
														? {
																...row,
																frequency: value as FeeLine["frequency"],
															}
														: row,
												),
											)
										}
									>
										<SelectTrigger className="h-8 text-xs">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{FEE_FREQUENCIES.map((frequency) => (
												<SelectItem key={frequency} value={frequency}>
													{frequency}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<Button
										variant="ghost"
										size="icon"
										className="h-8 w-8 text-destructive"
										aria-label={`Remove fee line ${index + 1}`}
										disabled={!canManage}
										onClick={() =>
											set(
												"fees",
												fees.filter((_, rowIndex) => rowIndex !== index),
											)
										}
									>
										<Trash2 className="h-3.5 w-3.5" />
									</Button>
								</div>
								<Input
									value={fee.note ?? ""}
									placeholder="Note (optional)"
									disabled={!canManage}
									className="h-8 text-xs"
									onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
										set(
											"fees",
											fees.map((row, rowIndex) =>
												rowIndex === index
													? { ...row, note: event.target.value }
													: row,
											),
										)
									}
								/>
							</div>
						))}
						{fees.length === 0 ? (
							<p className="rounded-lg border border-dashed border-hairline px-3 py-3 text-[11px] text-muted-foreground">
								No fee lines yet.
							</p>
						) : null}
					</div>
				) : null}

				{tab === "pathways" ? (
					<>
						<div className="space-y-1.5">
							<Label className="text-xs">Career pathways (one per line)</Label>
							<Textarea
								rows={5}
								value={lineList(draft.careers)}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set("careers", event.target.value.split("\n").filter(Boolean))
								}
							/>
						</div>
						<div className="space-y-1.5">
							<Label className="text-xs">
								Learning outcomes (one per line)
							</Label>
							<Textarea
								rows={5}
								value={lineList(draft.outcomes)}
								disabled={!canManage}
								onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) =>
									set(
										"outcomes",
										event.target.value.split("\n").filter(Boolean),
									)
								}
							/>
						</div>
					</>
				) : null}
			</div>
		</Panel>
	);
}
