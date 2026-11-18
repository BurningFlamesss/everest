import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { plusTwoStreams } from "#/content/courses";
import type { QuizStreamId } from "#/content/types";
import { Segmented } from "../Segmented";
import { Eyebrow, WidgetCaption } from "../Text";
import { duration, easing } from "../tokens";

const OPTIONS = plusTwoStreams.map((s) => ({
	value: s.id as QuizStreamId,
	label: s.name,
}));

/**
 * SIGNATURE INTERACTION - Courses
 * +2 stream comparison. Two streams are picked and the subject lists resolve
 * into a side-by-side diff: shared subjects settle onto a centre column on
 * hairlines, unique subjects push out left and right.
 */
export function StreamCompare({
	left,
	right,
	onLeft,
	onRight,
}: {
	left: QuizStreamId;
	right: QuizStreamId;
	onLeft: (v: QuizStreamId) => void;
	onRight: (v: QuizStreamId) => void;
}) {
	const reduced = Boolean(useReducedMotion());

	const a = plusTwoStreams.find((s) => s.id === left);
	const b = plusTwoStreams.find((s) => s.id === right);

	if (!a || !b) return null;

	// Subject lists are a handful of rows, so this is cheaper to derive on each
	// render than to memoise — and it keeps the early return above from making
	// the hook order conditional.
	const aIds = new Set(a.subjects.map((s) => s.id));
	const bIds = new Set(b.subjects.map((s) => s.id));
	const shared = a.subjects.filter((s) => bIds.has(s.id));
	const onlyA = a.subjects.filter((s) => !bIds.has(s.id));
	const onlyB = b.subjects.filter((s) => !aIds.has(s.id));

	const same = left === right;
	const key = left + "-" + right;

	const anim = reduced
		? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
		: {
				initial: { opacity: 0, y: 12 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, y: -12 },
			};

	return (
		<div
			className="flex flex-col gap-8"
			data-testid="stream-compare"
			id="stream-compare"
		>
			<div className="flex flex-col gap-2">
				<Eyebrow tone="muted">Compare two streams</Eyebrow>
				<WidgetCaption>
					Shared subjects sit in the middle; the differences push outward.
				</WidgetCaption>
			</div>

			<div className="flex flex-wrap gap-8 border-y border-border py-6">
				<Segmented
					label="Left stream"
					options={OPTIONS}
					value={left}
					onChange={onLeft}
					testId="compare-left"
				/>
				<Segmented
					label="Right stream"
					options={OPTIONS}
					value={right}
					onChange={onRight}
					testId="compare-right"
				/>
			</div>

			{same ? (
				<p
					className="border-y border-border py-8 text-body-l text-foreground"
					data-testid="compare-same"
				>
					Both sides are set to {a.name}. Choose a different stream on one side
					to see what changes.
				</p>
			) : (
				<AnimatePresence mode="wait">
					<motion.div
						key={key}
						{...anim}
						transition={{
							duration: (reduced ? 160 : duration.standard) / 1000,
							ease: easing.state,
						}}
						className="grid gap-6 lg:grid-cols-12"
					>
						<div className="lg:col-span-4" data-testid="compare-only-left">
							<h3 className="u-display mb-4 text-display-m text-foreground">
								{a.name}
							</h3>
							<p className="u-label mb-4 text-red-dark">Only in {a.name}</p>
							<ul className="flex flex-col">
								{onlyA.map((s) => (
									<li
										key={s.id}
										className="border-t border-border py-3 last:border-b"
									>
										<p className="text-body-m text-foreground">{s.name}</p>
										<p className="u-label tnum text-muted-foreground">
											{s.creditHours} credit hours · {s.theory} + {s.practical}
										</p>
									</li>
								))}
								{onlyA.length === 0 ? (
									<li className="u-label border-y border-border py-3 text-muted-foreground">
										Nothing unique to this side
									</li>
								) : null}
							</ul>
							<p className="u-label mt-6 mb-2 text-muted-foreground">
								Career directions
							</p>
							<ul className="flex flex-wrap gap-2">
								{a.careers.map((c) => (
									<li
										key={c}
										className="u-label rounded-pill border border-border px-3 py-1 text-muted-foreground"
									>
										{c}
									</li>
								))}
							</ul>
						</div>

						<div className="lg:col-span-4" data-testid="compare-shared">
							<h3 className="u-display mb-4 text-display-m text-foreground">
								Shared
							</h3>
							<p className="u-label mb-4 text-muted-foreground">
								Taken by both streams
							</p>
							<ul className="flex flex-col rounded-card border border-border px-4">
								{shared.map((s) => (
									<li
										key={s.id}
										className="border-t border-border py-3 first:border-t-0"
									>
										<p className="text-body-m text-foreground">{s.name}</p>
										<p className="u-label tnum text-muted-foreground">
											{s.creditHours} credit hours · {s.theory} + {s.practical}
										</p>
									</li>
								))}
							</ul>
						</div>

						<div className="lg:col-span-4" data-testid="compare-only-right">
							<h3 className="u-display mb-4 text-display-m text-foreground">
								{b.name}
							</h3>
							<p className="u-label mb-4 text-red-dark">Only in {b.name}</p>
							<ul className="flex flex-col">
								{onlyB.map((s) => (
									<li
										key={s.id}
										className="border-t border-border py-3 last:border-b"
									>
										<p className="text-body-m text-foreground">{s.name}</p>
										<p className="u-label tnum text-muted-foreground">
											{s.creditHours} credit hours · {s.theory} + {s.practical}
										</p>
									</li>
								))}
								{onlyB.length === 0 ? (
									<li className="u-label border-y border-border py-3 text-muted-foreground">
										Nothing unique to this side
									</li>
								) : null}
							</ul>
							<p className="u-label mt-6 mb-2 text-muted-foreground">
								Career directions
							</p>
							<ul className="flex flex-wrap gap-2">
								{b.careers.map((c) => (
									<li
										key={c}
										className="u-label rounded-pill border border-border px-3 py-1 text-muted-foreground"
									>
										{c}
									</li>
								))}
							</ul>
						</div>
					</motion.div>
				</AnimatePresence>
			)}
		</div>
	);
}
