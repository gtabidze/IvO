import type { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";

export type DecisionType = "choice" | "prioritization";
export type Phase =
	| "preparation"
	| "round1"
	| "discussion"
	| "round2"
	| "ready"
	| "decided"
	| "changes_requested";
export const PHASE_LABELS: Record<Phase, string> = {
	preparation: "Preparation",
	round1: "Round 1 · blind",
	discussion: "Discussion",
	round2: "Round 2 · blind",
	ready: "Ready to decide",
	decided: "Decided",
	changes_requested: "Changes requested",
};
export const TEAM = [
	{ id: "you", name: "You", role: "Product lead" },
	{ id: "sara", name: "Sara Kim", role: "Designer" },
	{ id: "marcus", name: "Marcus Lee", role: "Engineer" },
	{ id: "nina", name: "Nina Patel", role: "Researcher" },
];
export type SnapshotScreen = FlowScreen & { assetId?: string };
export interface Version {
	id: string;
	name: string;
	description: string;
	screens: SnapshotScreen[];
	frozenAt?: string;
}
export interface Evidence {
	id: string;
	source: string;
	title: string;
	observation: string;
	interpretation: string;
	recommendation: string;
	period: string;
	sample: string;
	details: string;
	screenIds: string[];
}
export interface Brief {
	revision: number;
	publishedAt: string;
	frozenAt?: string;
	summary: string;
	summaryEvidenceIds: string[];
	items: Evidence[];
	gaps: string[];
}
export interface Proposal {
	id: string;
	title: string;
	description: string;
	contributors: string[];
	evidenceIds: string[];
	screenIds: string[];
	benefit: string;
	effort: "Small" | "Medium" | "Large" | "Unknown";
}
export interface Discussion {
	id: string;
	authorId: string;
	optionId: string;
	kind: "pro" | "con" | "comment";
	text: string;
	screenId?: string;
	createdAt: string;
}
export type Ballot = {
	abstain: boolean;
	optionId?: string;
	allocations?: Record<string, number>;
};
export interface Round {
	ballots: Record<string, Ballot>;
	closedAt?: string;
}
export interface Outcome {
	actorId: string;
	createdAt: string;
	rationale: string;
	selectedId?: string;
	ranking: string[];
	cutoff: number;
	communicatedOn: string;
	communicatedTo: string;
}
export interface Attempt {
	number: number;
	phase: Phase;
	versions: Version[];
	context: Version;
	brief: Brief;
	proposals: Proposal[];
	rounds: [Round, Round];
	opened: Record<string, string[]>;
	discussions: Discussion[];
	outcome?: Outcome;
	changesRationale?: string;
	changesRequestedBy?: string;
	changesRequestedAt?: string;
	electorate: string[];
	voteBudget: number;
	deciders: string[];
}
export interface Decision {
	schemaVersion: 1;
	flowId: string;
	type: DecisionType;
	question: string;
	dueDate: string;
	deciders: string[];
	providers: string[];
	affected: string;
	commitmentDays: string;
	revisitDate: string;
	voteBudget: number;
	attempt: Attempt;
	history: Attempt[];
	incoming: Evidence[];
	appliedSnapshotId?: string;
}
export const copy = <T>(value: T): T => structuredClone(value);
export const uid = () => crypto.randomUUID();
export const electorate = (d: Decision) => [
	...new Set([...d.deciders, ...d.providers]),
];
export const isDecider = (d: Decision, actor: string) =>
	(d.attempt.phase === "preparation"
		? d.deciders
		: d.attempt.deciders
	).includes(actor);
export const optionIds = (d: Decision) =>
	d.type === "choice"
		? d.attempt.versions.map((v) => v.id)
		: d.attempt.proposals.map((p) => p.id);
export function setupErrors(d: Decision): string[] {
	const errors: string[] = [];
	if (!d.question.trim()) errors.push("Add a decision question.");
	if (!d.deciders.length) errors.push("Assign at least one decision maker.");
	if (electorate(d).some((id) => !TEAM.some((p) => p.id === id)))
		errors.push("Choose participants from the simulated team.");
	if (!Number.isInteger(d.voteBudget) || d.voteBudget < 1)
		errors.push("Use a positive whole-number vote allowance.");
	if (
		d.type === "choice" &&
		(d.attempt.versions.length !== 2 ||
			d.attempt.versions.some((v) => !v.name.trim() || !v.screens.length))
	)
		errors.push("Name both versions and add at least one screen to each.");
	if (
		d.type === "prioritization" &&
		(d.attempt.proposals.length < 2 ||
			d.attempt.proposals.some((p) => !p.title.trim()))
	)
		errors.push("Add at least two named improvement proposals.");
	return errors;
}
function requireDecider(d: Decision, actor: string) {
	if (!isDecider(d, actor))
		throw new Error("Only a decision maker can perform this action.");
}
export function validateBallot(
	d: Decision,
	actor: string,
	ballot: Ballot,
): void {
	if (!["round1", "round2"].includes(d.attempt.phase))
		throw new Error("There is no open voting round.");
	if (!d.attempt.electorate.includes(actor))
		throw new Error("This participant is not eligible to vote.");
	if (
		d.type === "choice" &&
		!d.attempt.versions.every((v) => d.attempt.opened[actor]?.includes(v.id))
	)
		throw new Error("Open both snapshots before voting.");
	if (ballot.abstain) {
		if (
			ballot.optionId ||
			Object.values(ballot.allocations || {}).some((v) => v !== 0)
		)
			throw new Error("Abstention cannot include votes.");
		return;
	}
	if (d.type === "choice") {
		if (
			!ballot.optionId ||
			!optionIds(d).includes(ballot.optionId) ||
			ballot.allocations
		)
			throw new Error("Choose one version or abstain.");
	} else {
		if (ballot.optionId) throw new Error("Allocate votes to proposals.");
		const entries = Object.entries(ballot.allocations || {});
		if (
			entries.some(
				([id, n]) =>
					!optionIds(d).includes(id) || !Number.isInteger(n) || n < 0,
			)
		)
			throw new Error(
				"Votes must be nonnegative whole numbers for existing proposals.",
			);
		if (entries.reduce((sum, [, n]) => sum + n, 0) > d.attempt.voteBudget)
			throw new Error("This ballot exceeds the vote allowance.");
	}
}
export type Action =
	| { type: "start" }
	| { type: "submit"; ballot: Ballot }
	| { type: "close"; confirmMissing?: boolean }
	| { type: "second" }
	| { type: "finalize"; outcome: Omit<Outcome, "actorId" | "createdAt"> }
	| { type: "request_changes"; rationale: string }
	| { type: "restart"; incorporate?: boolean }
	| { type: "open"; versionId: string }
	| {
			type: "discuss";
			entry: Omit<Discussion, "id" | "authorId" | "createdAt">;
	  };
export function transition(
	original: Decision,
	actor: string,
	action: Action,
	now = new Date().toISOString(),
): Decision {
	const d = copy(original);
	const a = d.attempt;
	switch (action.type) {
		case "start":
			requireDecider(d, actor);
			if (a.phase !== "preparation")
				throw new Error("Prepare the decision before starting.");
			if (setupErrors(d).length) throw new Error(setupErrors(d).join(" "));
			a.electorate = electorate(d);
			a.deciders = [...d.deciders];
			a.voteBudget = d.type === "choice" ? 1 : d.voteBudget;
			a.opened = {};
			a.versions.forEach((v) => {
				v.frozenAt = now;
			});
			a.context.frozenAt = now;
			a.brief.frozenAt = now;
			a.phase = "round1";
			break;
		case "submit":
			validateBallot(d, actor, action.ballot);
			a.rounds[a.phase === "round1" ? 0 : 1].ballots[actor] = copy(
				action.ballot,
			);
			break;
		case "close": {
			requireDecider(d, actor);
			if (a.phase !== "round1" && a.phase !== "round2")
				throw new Error("There is no open round.");
			const round = a.rounds[a.phase === "round1" ? 0 : 1];
			if (
				a.electorate.some((id) => !round.ballots[id]) &&
				!action.confirmMissing
			)
				throw new Error("Confirm closing with missing ballots.");
			round.closedAt = now;
			a.phase = a.phase === "round1" ? "discussion" : "ready";
			break;
		}
		case "second":
			requireDecider(d, actor);
			if (a.phase !== "discussion") throw new Error("Close round one first.");
			a.phase = "round2";
			break;
		case "finalize": {
			requireDecider(d, actor);
			if (a.phase !== "ready")
				throw new Error("Close both rounds before deciding.");
			const o = action.outcome;
			const ids = optionIds(d);
			if (!o.rationale.trim()) throw new Error("Explain the final decision.");
			if (d.type === "choice" && (!o.selectedId || !ids.includes(o.selectedId)))
				throw new Error("Select the chosen snapshot.");
			if (
				d.type === "prioritization" &&
				(o.ranking.length !== ids.length ||
					new Set(o.ranking).size !== ids.length ||
					o.ranking.some((id) => !ids.includes(id)) ||
					!Number.isInteger(o.cutoff) ||
					o.cutoff < 1 ||
					o.cutoff > ids.length)
			)
				throw new Error("Rank each proposal once and commit at least one.");
			a.outcome = { ...copy(o), actorId: actor, createdAt: now };
			a.phase = "decided";
			break;
		}
		case "request_changes":
			requireDecider(d, actor);
			if (a.phase !== "ready")
				throw new Error("Complete both voting rounds first.");
			if (!action.rationale.trim())
				throw new Error("Explain the requested changes.");
			a.changesRationale = action.rationale;
			a.changesRequestedBy = actor;
			a.changesRequestedAt = now;
			a.phase = "changes_requested";
			break;
		case "restart":
			requireDecider(d, actor);
			if (a.phase === "preparation")
				throw new Error("This decision is already in preparation.");
			d.history.push(copy(a));
			a.number += 1;
			a.phase = "preparation";
			a.rounds = [{ ballots: {} }, { ballots: {} }];
			a.opened = {};
			a.outcome = undefined;
			a.changesRationale = undefined;
			delete a.changesRequestedBy;
			delete a.changesRequestedAt;
			a.discussions = [];
			a.electorate = [];
			a.deciders = [];
			delete a.brief.frozenAt;
			a.versions.forEach((v) => {
				delete v.frozenAt;
			});
			delete a.context.frozenAt;
			if (action.incorporate) {
				a.brief.items.push(...d.incoming);
				a.brief.revision += 1;
				a.brief.publishedAt = now;
				d.incoming = [];
			}
			break;
		case "open":
			if (
				![...a.versions.map((v) => v.id), a.context.id].includes(
					action.versionId,
				)
			)
				throw new Error("Snapshot not found.");
			a.opened[actor] = [
				...new Set([...(a.opened[actor] || []), action.versionId]),
			];
			break;
		case "discuss":
			if (
				!electorate(d).includes(actor) ||
				["decided", "changes_requested"].includes(a.phase)
			)
				throw new Error("Discussion is read-only.");
			if (
				!action.entry.text.trim() ||
				![...optionIds(d), a.context.id].includes(action.entry.optionId)
			)
				throw new Error("Choose an option and add a note.");
			a.discussions.push({
				...action.entry,
				id: uid(),
				authorId: actor,
				createdAt: now,
			});
			break;
	}
	return d;
}
export function visibleRound(d: Decision, index: number, actor: string): Round {
	const round = d.attempt.rounds[index];
	return round.closedAt
		? copy(round)
		: {
				ballots: round.ballots[actor]
					? { [actor]: copy(round.ballots[actor]) }
					: {},
			};
}
export function totals(d: Decision, index: number): Record<string, number> {
	const round = d.attempt.rounds[index];
	if (!round.closedAt) return {};
	const result = Object.fromEntries(optionIds(d).map((id) => [id, 0]));
	for (const ballot of Object.values(round.ballots)) {
		if (ballot.abstain) continue;
		if (d.type === "choice" && ballot.optionId) result[ballot.optionId] += 1;
		else
			for (const [id, n] of Object.entries(ballot.allocations || {}))
				result[id] += n;
	}
	return result;
}
export function mergeProposals(
	d: Decision,
	actor: string,
	targetId: string,
	sourceId: string,
): Decision {
	requireDecider(d, actor);
	if (d.attempt.phase !== "preparation" || targetId === sourceId)
		throw new Error("Merge distinct proposals during preparation.");
	const next = copy(d);
	const target = next.attempt.proposals.find((p) => p.id === targetId);
	const source = next.attempt.proposals.find((p) => p.id === sourceId);
	if (!target || !source) throw new Error("Proposal not found.");
	target.description += `\n\n${source.description}`;
	target.contributors = [
		...new Set([...target.contributors, ...source.contributors]),
	];
	target.evidenceIds = [
		...new Set([...target.evidenceIds, ...source.evidenceIds]),
	];
	target.screenIds = [...new Set([...target.screenIds, ...source.screenIds])];
	next.attempt.discussions = next.attempt.discussions.map((n) =>
		n.optionId === sourceId ? { ...n, optionId: targetId } : n,
	);
	next.attempt.proposals = next.attempt.proposals.filter(
		(p) => p.id !== sourceId,
	);
	return next;
}
export function editPreparation(
	original: Decision,
	actor: string,
	edit: (draft: Decision) => void,
): Decision {
	requireDecider(original, actor);
	if (original.attempt.phase !== "preparation")
		throw new Error("Restart voting before editing the decision.");
	const d = copy(original);
	edit(d);
	if (!d.deciders.length)
		throw new Error("Keep at least one decision maker assigned.");
	return d;
}
export function addProposal(
	original: Decision,
	actor: string,
	proposal: Proposal,
): Decision {
	if (
		original.attempt.phase !== "preparation" ||
		!electorate(original).includes(actor)
	)
		throw new Error("Only participants can propose during preparation.");
	const d = copy(original);
	d.attempt.proposals.push({
		...copy(proposal),
		contributors: [TEAM.find((p) => p.id === actor)?.name || actor],
	});
	return d;
}
export function snapshotFlow(
	flow: DashboardFlow,
	version: Version,
): DashboardFlow {
	return {
		...flow,
		id: `${flow.id}:snapshot:${version.id}`,
		initialComments: [],
		screens: version.screens,
		screensCount: version.screens.length,
		isLocked: false,
	};
}
