import { describe, expect, it } from "vitest";
import { quizQuestions } from "../content/courses";
import { STREAM_IDS, scoreQuiz } from "./quiz";

/** Answer every question with the option that carries the heaviest weight for `stream`. */
function answerFor(stream: (typeof STREAM_IDS)[number]) {
	const answers: Record<string, string> = {};
	for (const q of quizQuestions) {
		const best = q.options
			.slice()
			.sort((a, b) => (b.weights[stream] ?? 0) - (a.weights[stream] ?? 0))[0];
		answers[q.id] = best.id;
	}
	return answers;
}

describe("scoreQuiz", () => {
	it("ranks the stream the answers pointed at first", () => {
		for (const stream of STREAM_IDS) {
			const result = scoreQuiz(answerFor(stream));
			expect(result.ranked[0].streamId).toBe(stream);
			expect(result.complete).toBe(true);
			expect(result.answered).toBe(quizQuestions.length);
		}
	});

	it("returns different rankings for different answers", () => {
		const science = scoreQuiz(answerFor("science"));
		const humanities = scoreQuiz(answerFor("humanities"));

		expect(science.ranked.map((r) => r.streamId)).not.toEqual(
			humanities.ranked.map((r) => r.streamId),
		);
	});

	it("always ranks all three streams, with the leader at 100% share", () => {
		const result = scoreQuiz(answerFor("management"));

		expect(result.ranked).toHaveLength(3);
		expect(new Set(result.ranked.map((r) => r.streamId))).toEqual(
			new Set(STREAM_IDS),
		);
		expect(result.ranked[0].share).toBe(100);
	});

	it("attributes each answer to the streams it scored", () => {
		const result = scoreQuiz({ q1: "q1a" });
		const science = result.ranked.find((r) => r.streamId === "science");

		expect(science?.score).toBe(3);
		expect(science?.reasons[0]).toMatchObject({
			questionId: "q1",
			weight: 3,
		});
	});

	it("ignores answers to questions or options that do not exist", () => {
		const result = scoreQuiz({ q1: "q1a", nope: "q1b", q2: "not-an-option" });

		expect(result.answered).toBe(1);
		expect(result.complete).toBe(false);
		expect(result.ranked.find((r) => r.streamId === "science")?.score).toBe(3);
	});

	it("returns a tie-broken ranking for an empty answer set", () => {
		const result = scoreQuiz({});

		expect(result.ranked).toHaveLength(3);
		expect(result.answered).toBe(0);
		for (const ranked of result.ranked) expect(ranked.score).toBe(0);
	});
});
