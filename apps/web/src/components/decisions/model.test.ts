import { describe, expect, it } from "vitest";
import { DASHBOARD_FLOWS } from "../../data/dashboard-flows";
import { createDecision } from "./fixtures";
import {
	addProposal,
	copy,
	type Decision,
	editPreparation,
	electorate,
	mergeProposals,
	totals,
	transition,
	validateBallot,
	visibleRound,
} from "./model";
import { loadDecision, type StorageLike, saveDecision } from "./storage";

const flow = DASHBOARD_FLOWS[0];
function create(type: "choice" | "prioritization" = "choice") {
	return createDecision(flow, type, true);
}
function start(type: "choice" | "prioritization" = "choice") {
	return transition(create(type), "you", { type: "start" });
}
function opened(original: Decision, actor = "you") {
	let d = original;
	for (const v of d.attempt.versions)
		d = transition(d, actor, { type: "open", versionId: v.id });
	return d;
}
function ready(type: "choice" | "prioritization" = "choice") {
	let d = start(type);
	d = transition(d, "you", { type: "close", confirmMissing: true });
	d = transition(d, "you", { type: "second" });
	return transition(d, "you", { type: "close", confirmMissing: true });
}
const outcome = {
	selectedId: "version-b",
	ranking: [],
	cutoff: 0,
	rationale: "Clearer consequences before commitment.",
	communicatedOn: "",
	communicatedTo: "",
};
describe("decision lifecycle", () => {
	it("deduplicates overlapping human roles", () => {
		const d = create();
		d.providers.push("you");
		expect(electorate(d)).toEqual(["you", "sara", "marcus", "nina"]);
	});
	it("requires a question and a decider", () => {
		const d = create();
		d.question = "";
		expect(() => transition(d, "you", { type: "start" })).toThrow("question");
		d.question = "Question";
		d.deciders = [];
		expect(() => transition(d, "you", { type: "start" })).toThrow();
	});
	it("does not permit participants to start or close rounds", () => {
		expect(() => transition(create(), "sara", { type: "start" })).toThrow(
			"decision maker",
		);
		expect(() =>
			transition(start(), "sara", { type: "close", confirmMissing: true }),
		).toThrow("decision maker");
	});
	it("requires opening both frozen snapshots", () => {
		const d = start();
		expect(() =>
			validateBallot(d, "you", { abstain: false, optionId: "version-a" }),
		).toThrow("Open both");
		expect(() =>
			validateBallot(opened(d), "you", {
				abstain: false,
				optionId: "version-a",
			}),
		).not.toThrow();
	});
	it("resets draft opened checks at freeze time", () => {
		let d = opened(create());
		d = transition(d, "you", { type: "start" });
		expect(d.attempt.opened).toEqual({});
	});
	it("accepts one choice or explicit abstention", () => {
		const d = opened(start());
		expect(() => validateBallot(d, "you", { abstain: true })).not.toThrow();
		expect(() => validateBallot(d, "you", { abstain: false })).toThrow();
		expect(() =>
			validateBallot(d, "you", { abstain: true, optionId: "version-a" }),
		).toThrow();
		expect(() =>
			validateBallot(d, "you", { abstain: false, optionId: "other" }),
		).toThrow();
	});
	it.each([-1, 1.5, 6])("rejects invalid prioritization allocation %s", (n) => {
		expect(() =>
			validateBallot(start("prioritization"), "you", {
				abstain: false,
				allocations: { clarity: n },
			}),
		).toThrow();
	});
	it("accepts unused votes and validates total budget", () => {
		const d = start("prioritization");
		expect(() =>
			validateBallot(d, "you", { abstain: false, allocations: { clarity: 3 } }),
		).not.toThrow();
		expect(() =>
			validateBallot(d, "you", {
				abstain: false,
				allocations: { clarity: 3, recovery: 3 },
			}),
		).toThrow("allowance");
	});
	it("hides others' open ballots and totals, then reveals closed results", () => {
		let d = opened(start());
		d = transition(d, "you", {
			type: "submit",
			ballot: { abstain: false, optionId: "version-a" },
		});
		expect(visibleRound(d, 0, "sara").ballots).toEqual({});
		expect(totals(d, 0)).toEqual({});
		expect(visibleRound(d, 0, "you").ballots.you).toBeTruthy();
		d = transition(d, "you", { type: "close", confirmMissing: true });
		expect(totals(d, 0)["version-a"]).toBe(1);
		expect(visibleRound(d, 0, "sara").ballots.you).toBeTruthy();
	});
	it("does not treat missing ballots as abstentions", () => {
		let d = opened(start());
		d = transition(d, "you", { type: "submit", ballot: { abstain: true } });
		expect(() => transition(d, "you", { type: "close" })).toThrow(
			"missing ballots",
		);
		d = transition(d, "you", { type: "close", confirmMissing: true });
		expect(d.attempt.rounds[0].ballots.sara).toBeUndefined();
		expect(d.attempt.rounds[0].ballots.you.abstain).toBe(true);
	});
	it("keeps rounds independent", () => {
		let d = opened(start());
		d = transition(d, "you", {
			type: "submit",
			ballot: { abstain: false, optionId: "version-a" },
		});
		d = transition(d, "you", { type: "close", confirmMissing: true });
		d = transition(d, "you", { type: "second" });
		expect(d.attempt.rounds[1].ballots).toEqual({});
		d = transition(d, "you", {
			type: "submit",
			ballot: { abstain: false, optionId: "version-b" },
		});
		expect(d.attempt.rounds[0].ballots.you.optionId).toBe("version-a");
	});
	it("freezes copies without mutating the source record", () => {
		const original = create();
		const d = transition(
			original,
			"you",
			{ type: "start" },
			"2026-11-08T12:00:00Z",
		);
		original.attempt.versions[0].screens[0].title = "Changed";
		original.attempt.brief.items[0].observation = "Changed";
		expect(d.attempt.versions[0].screens[0].title).not.toBe("Changed");
		expect(d.attempt.brief.items[0].observation).not.toBe("Changed");
		expect(d.attempt.brief.frozenAt).toBe("2026-11-08T12:00:00Z");
	});
	it("archives attempts and clears ballots on restart", () => {
		let d = opened(start());
		d = transition(d, "you", { type: "submit", ballot: { abstain: true } });
		d = transition(d, "you", { type: "restart" });
		expect(d.history[0].rounds[0].ballots.you.abstain).toBe(true);
		expect(d.attempt.rounds[0].ballots).toEqual({});
		expect(d.attempt.number).toBe(2);
		expect(d.attempt.brief.frozenAt).toBeUndefined();
	});
	it("incorporates new evidence only on explicit restart", () => {
		const d = start();
		d.incoming.push({ ...copy(d.attempt.brief.items[0]), id: "new" });
		const next = transition(d, "you", { type: "restart", incorporate: true });
		expect(next.incoming).toEqual([]);
		expect(next.attempt.brief.items.at(-1)?.id).toBe("new");
		expect(next.history[0].brief.items.some((i) => i.id === "new")).toBe(false);
	});
	it("requires both rounds and a rationale before finalizing", () => {
		expect(() =>
			transition(start(), "you", { type: "finalize", outcome }),
		).toThrow("both rounds");
		expect(() =>
			transition(ready(), "you", {
				type: "finalize",
				outcome: { ...outcome, rationale: "" },
			}),
		).toThrow("Explain");
		const d = transition(ready(), "you", { type: "finalize", outcome });
		expect(d.attempt.phase).toBe("decided");
		expect(d.attempt.outcome?.actorId).toBe("you");
		expect(() =>
			transition(ready(), "sara", { type: "finalize", outcome }),
		).toThrow("decision maker");
	});
	it("validates ranked outcomes and commitment cutoffs", () => {
		const d = ready("prioritization");
		const ranking = d.attempt.proposals.map((p) => p.id);
		const valid = { ...outcome, ranking, cutoff: 2 };
		expect(() =>
			transition(d, "you", { type: "finalize", outcome: valid }),
		).not.toThrow();
		for (const invalid of [
			{ ...valid, cutoff: 0 },
			{ ...valid, cutoff: 1.5 },
			{ ...valid, ranking: [ranking[0], ...ranking.slice(0, -1)] },
		])
			expect(() =>
				transition(d, "you", { type: "finalize", outcome: invalid }),
			).toThrow();
	});
	it("keeps finalized data read-only and permits explicit reopening", () => {
		const d = transition(ready(), "you", { type: "finalize", outcome });
		expect(() =>
			editPreparation(d, "you", (draft) => {
				draft.question = "Changed";
			}),
		).toThrow("Restart");
		expect(transition(d, "you", { type: "restart" }).attempt.phase).toBe(
			"preparation",
		);
	});
	it("records changes requested without a winner", () => {
		const d = transition(ready(), "you", {
			type: "request_changes",
			rationale: "Both versions need clearer pricing.",
		});
		expect(d.attempt.outcome).toBeUndefined();
		expect(d.attempt.phase).toBe("changes_requested");
	});
	it("merges attribution, references, and discussion", () => {
		let d = create("prioritization");
		d = transition(d, "sara", {
			type: "discuss",
			entry: { optionId: "recovery", kind: "pro", text: "Useful" },
		});
		d = mergeProposals(d, "you", "clarity", "recovery");
		const p = d.attempt.proposals.find((p) => p.id === "clarity");
		expect(p?.contributors).toContain("CX");
		expect(p?.evidenceIds).toContain("cx-recovery");
		expect(d.attempt.discussions[0].optionId).toBe("clarity");
	});
	it("allows input providers to propose only during preparation", () => {
		const proposal = copy(create("prioritization").attempt.proposals[0]);
		expect(
			addProposal(create("prioritization"), "sara", {
				...proposal,
				id: "new",
			}).attempt.proposals.at(-1)?.contributors,
		).toEqual(["Sara Kim"]);
		expect(() =>
			addProposal(start("prioritization"), "sara", proposal),
		).toThrow();
	});
});
describe("local persistence", () => {
	function memory(): StorageLike {
		const data = new Map<string, string>();
		return {
			getItem: (key) => data.get(key) || null,
			setItem: (key, value) => {
				data.set(key, value);
			},
			removeItem: (key) => {
				data.delete(key);
			},
		};
	}
	it("isolates decisions by flow and reloads them", () => {
		const target = memory();
		const first = create();
		const second = { ...copy(first), flowId: "other" };
		saveDecision(first, target);
		saveDecision(second, target);
		expect(loadDecision(flow.id, target)).toEqual(first);
		expect(loadDecision("other", target)?.flowId).toBe("other");
	});
	it("surfaces write failures", () => {
		const target = memory();
		target.setItem = () => {
			throw new Error("quota");
		};
		expect(() => saveDecision(create(), target)).toThrow("quota");
	});
	it("rejects corrupt and incompatible records", () => {
		const target = memory();
		target.setItem(`alignment-decision-v1:${flow.id}`, "{}");
		expect(() => loadDecision(flow.id, target)).toThrow();
	});
});
