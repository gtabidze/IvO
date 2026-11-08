import { z } from "zod";

const strings = z.array(z.string());
const screen = z.object({
	id: z.string(),
	title: z.string(),
	subtitle: z.string().optional(),
	imageUrl: z.string().optional(),
	assetId: z.string().optional(),
	screenType: z.enum([
		"splash",
		"welcome",
		"phone-input",
		"otp",
		"kyc-scan",
		"pin",
		"account-ready",
		"transfer-amount",
		"recipient-select",
		"confirmation",
		"switch-profile",
		"workspace-picker",
		"generic-wireframe",
	]),
	badge: z.string().optional(),
	accentColor: z.string().optional(),
	isDark: z.boolean().optional(),
	wireframeDetails: z
		.object({
			headerText: z.string().optional(),
			headlineText: z.string().optional(),
			subText: z.string().optional(),
			buttonText: z.string().optional(),
			inputsCount: z.number().optional(),
			hasKeypad: z.boolean().optional(),
			hasCards: z.boolean().optional(),
			hasChart: z.boolean().optional(),
			avatarRow: z.boolean().optional(),
		})
		.optional(),
});
export const versionSchema = z.object({
	id: z.string(),
	name: z.string(),
	description: z.string(),
	screens: z.array(screen),
	frozenAt: z.string().optional(),
});
const evidence = z.object({
	id: z.string(),
	source: z.string(),
	title: z.string(),
	observation: z.string(),
	interpretation: z.string(),
	recommendation: z.string(),
	period: z.string(),
	sample: z.string(),
	details: z.string(),
	screenIds: strings,
});
const brief = z.object({
	revision: z.number().int().positive(),
	publishedAt: z.string(),
	frozenAt: z.string().optional(),
	summary: z.string(),
	summaryEvidenceIds: strings.default([
		"amplitude-funnel",
		"research-tasks",
		"cx-recovery",
	]),
	items: z.array(evidence),
	gaps: strings,
});
const proposal = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	contributors: strings,
	evidenceIds: strings,
	screenIds: strings,
	benefit: z.string(),
	effort: z.enum(["Small", "Medium", "Large", "Unknown"]),
});
const ballot = z.object({
	abstain: z.boolean(),
	optionId: z.string().optional(),
	allocations: z.record(z.string(), z.number().int().nonnegative()).optional(),
});
const round = z.object({
	ballots: z.record(z.string(), ballot),
	closedAt: z.string().optional(),
});
const outcome = z.object({
	actorId: z.string(),
	createdAt: z.string(),
	rationale: z.string(),
	selectedId: z.string().optional(),
	ranking: strings,
	cutoff: z.number().int().nonnegative(),
	communicatedOn: z.string(),
	communicatedTo: z.string(),
});
const attempt = z.object({
	number: z.number().int().positive(),
	phase: z.enum([
		"preparation",
		"round1",
		"discussion",
		"round2",
		"ready",
		"decided",
		"changes_requested",
	]),
	versions: z.array(versionSchema),
	context: versionSchema,
	brief,
	proposals: z.array(proposal),
	rounds: z.tuple([round, round]),
	opened: z.record(z.string(), strings),
	discussions: z.array(
		z.object({
			id: z.string(),
			authorId: z.string(),
			optionId: z.string(),
			kind: z.enum(["pro", "con", "comment"]),
			text: z.string(),
			screenId: z.string().optional(),
			createdAt: z.string(),
		}),
	),
	outcome: outcome.optional(),
	changesRationale: z.string().optional(),
	changesRequestedBy: z.string().optional(),
	changesRequestedAt: z.string().optional(),
	electorate: strings,
	voteBudget: z.number().int().positive(),
	deciders: strings,
});
export const decisionSchema = z.object({
	schemaVersion: z.literal(1),
	flowId: z.string(),
	type: z.enum(["choice", "prioritization"]),
	question: z.string(),
	dueDate: z.string(),
	deciders: strings,
	providers: strings,
	affected: z.string(),
	commitmentDays: z.string(),
	revisitDate: z.string(),
	voteBudget: z.number().int().positive(),
	attempt,
	history: z.array(attempt),
	incoming: z.array(evidence),
	appliedSnapshotId: z.string().optional(),
});
