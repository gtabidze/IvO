import type { DashboardFlow } from "@/data/dashboard-flows";
import {
	type Brief,
	copy,
	type Decision,
	type DecisionType,
	type Evidence,
	type Proposal,
	type Version,
} from "./model";

export function makeBrief(flow: DashboardFlow, revision = 1): Brief {
	const screen = flow.screens[Math.min(2, flow.screens.length - 1)];
	const title = screen?.title || "the main decision step";
	const screenIds = screen ? [screen.id] : [];
	const item = (
		id: string,
		source: string,
		title: string,
		observation: string,
		interpretation: string,
		recommendation: string,
		sample: string,
		details: string,
	): Evidence => ({
		id,
		source,
		title,
		observation,
		interpretation,
		recommendation,
		sample,
		details,
		period: "Demo period · 1–28 October 2026",
		screenIds,
	});
	return {
		revision,
		publishedAt: new Date().toISOString(),
		summary: `The ${flow.flowLabel || flow.flowName} journey needs clearer expectations at its decision points. Funnel and research signals suggest investigating clarity before removing safeguards. These are illustrative findings, not measured results for this flow.`,
		summaryEvidenceIds: ["amplitude-funnel", "research-tasks", "cx-recovery"],
		gaps: [
			"No retention or long-term revenue evidence is available.",
			"The research sample is small and not representative of every cohort.",
			"Higher completion can conflict with research reports of uncertainty; neither establishes causation.",
			"Demo sources are simulated. No analytics or research connector is connected.",
		],
		items: [
			item(
				"amplitude-funnel",
				"Amplitude · simulated",
				"Journey completion and drop-off",
				"680 of 1,000 demo journeys completed (68%); the largest step drop-off is 18%.",
				`Investigate hesitation around “${title}”; the funnel alone cannot explain intent.`,
				`Compare the current and proposed “${title}” experience.`,
				"1,000 demo journeys",
				"Local mock funnel report\nStarted: 1,000\nReached decision step: 850\nPassed decision step: 697\nCompleted: 680\nMedian completion time: 2m 14s\nNew users: 61% completion (n=600)\nReturning users: 78.5% completion (n=400)\nThese are fixed fictional values, not a live query.",
			),
			item(
				"business-impact",
				"Business metrics · simulated",
				"Conversion and support guardrails",
				"Demo completion is 68%; 14 support contacts per 1,000 starts reference unclear next steps.",
				"Reducing uncertainty may reduce avoidable support, but impact has not been measured.",
				"Track completion and support contacts together; do not optimize speed alone.",
				"1,000 demo starts · 14 fictional contacts",
				"Local mock business report\nCompletion: 68%\nSupport contacts: 14 per 1,000 starts\nIllustrative handling cost: $6/contact\nPotential cost is not a validated saving.\nRevenue attribution: unavailable.",
			),
			item(
				"research-tasks",
				"Research · simulated",
				"Users hesitate before commitment",
				"Five of eight demo participants completed without help; three asked what would happen next.",
				"The uncertainty may concern consequences rather than button visibility.",
				"Explain the consequence before commitment and validate with task sessions.",
				"8 fictional moderated sessions",
				"Local mock research report\nTask success without help: 5/8\nQuote: “Will this happen immediately, or can I check it first?” — fictional participant P03\nRecruitment: convenience sample\nNo statistical significance is claimed.",
			),
			item(
				"writing-clarity",
				"Writing agent · simulated",
				"Action labels need clearer consequences",
				`The flow includes a screen titled “${title}”.`,
				"Screen titles are a limited proxy for actual interface copy.",
				"Use specific action labels and explain what happens next.",
				"Screen metadata only",
				"Local specialist report\nObservation source: available screen labels.\nActual screenshot copy has not been automatically read.\nRecommendation requires human verification.",
			),
			item(
				"cx-recovery",
				"CX agent · simulated",
				"Make recovery discoverable",
				"The demo support themes include uncertainty after an interruption.",
				"A visible retry or resume path may reduce repeated attempts.",
				"Clarify recovery and preserve progress when possible.",
				"14 fictional support contacts",
				"Local specialist report\nExample themes: status unclear, repeated attempt, interrupted journey.\nThese themes are mocked, not imported support tickets.",
			),
			item(
				"ui-hierarchy",
				"UI agent · simulated",
				"Clarify the primary action",
				`The current flow contains ${flow.screens.length} screens.`,
				"Visual hierarchy and accessibility require inspection of each screen.",
				"Review focus order, action hierarchy, and error visibility.",
				"Flow structure and demo review notes",
				"Local specialist report\nAudit suggestions are simulated.\nNo automated accessibility scan or image analysis has run.\nScreen count is structural context, not a business performance metric.",
			),
		],
	};
}
export function makeProposals(flow: DashboardFlow): Proposal[] {
	const ids = flow.screens.slice(0, 3).map((s) => s.id);
	return [
		{
			id: "clarity",
			title: "Explain the commitment before the primary action",
			description:
				"Make fees, timing, and consequences clear before users continue. Consolidates overlapping research, writing, and UI suggestions.",
			contributors: ["Research", "Writing", "UI"],
			evidenceIds: ["research-tasks", "writing-clarity", "ui-hierarchy"],
			screenIds: ids.slice(1),
			benefit:
				"Reduce uncertainty and avoidable backtracking; validate with users.",
			effort: "Small",
		},
		{
			id: "recovery",
			title: "Add a clear retry and resume path",
			description:
				"Explain interrupted states, preserve progress, and make the next recovery action discoverable.",
			contributors: ["CX", "UI"],
			evidenceIds: ["cx-recovery", "business-impact"],
			screenIds: ids.slice(-1),
			benefit: "Reduce repeated attempts and support contacts.",
			effort: "Medium",
		},
		{
			id: "expectations",
			title: "Set expectations at the start of the journey",
			description:
				"Preview the information users need and explain why key steps are required.",
			contributors: ["Research", "Writing"],
			evidenceIds: ["amplitude-funnel", "research-tasks"],
			screenIds: ids.slice(0, 1),
			benefit: "Help new users enter the flow prepared.",
			effort: "Small",
		},
		{
			id: "accessibility",
			title: "Improve action hierarchy and keyboard access",
			description:
				"Verify focus order, labels, contrast, and error announcements throughout the journey.",
			contributors: ["UI"],
			evidenceIds: ["ui-hierarchy"],
			screenIds: ids,
			benefit: "Improve usability for keyboard and assistive-technology users.",
			effort: "Medium",
		},
	];
}
export function createDecision(
	flow: DashboardFlow,
	type: DecisionType,
	demo = false,
): Decision {
	const base: Version = {
		id: "version-a",
		name: "Version A · Current",
		description: "Captured from the current flow.",
		screens: copy(flow.screens),
	};
	const alternative: Version = {
		...copy(base),
		id: "version-b",
		name: "Version B · Proposed",
		description: "Editable copy of the current flow.",
	};
	if (demo) {
		alternative.description =
			"Simulated alternative: adds an expectations screen and clarifies the final confirmation. These changes are illustrative.";
		alternative.screens.unshift({
			id: "demo-expectations",
			title: "Before you begin",
			screenType: "generic-wireframe",
			wireframeDetails: {
				headerText: flow.app,
				headlineText: "Know what happens next",
				subText:
					"Review the details before you commit. You can check everything on the next step.",
				buttonText: "Review details",
			},
		});
		const last = alternative.screens.at(-1);
		if (last) {
			last.imageUrl = undefined;
			last.screenType = "generic-wireframe";
			last.title = "Review and confirm";
			last.wireframeDetails = {
				headlineText: "You're in control",
				subText: "Check your details. Nothing happens until you confirm.",
				buttonText: "Confirm and continue",
			};
		}
	}
	return {
		schemaVersion: 1,
		flowId: flow.id,
		type,
		question: demo
			? type === "choice"
				? `Which ${flow.flowLabel.toLowerCase()} version should move forward?`
				: `What should we improve in ${flow.flowLabel.toLowerCase()} next quarter?`
			: "",
		dueDate: "",
		deciders: ["you"],
		providers: ["sara", "marcus", "nina"],
		affected: "Product team and customers",
		commitmentDays: "",
		revisitDate: "",
		voteBudget: type === "choice" ? 1 : 5,
		history: [],
		incoming: [],
		attempt: {
			number: 1,
			phase: "preparation",
			versions: type === "choice" ? [base, alternative] : [],
			context: { ...copy(base), id: "context" },
			brief: makeBrief(flow),
			proposals: type === "prioritization" ? makeProposals(flow) : [],
			rounds: [{ ballots: {} }, { ballots: {} }],
			opened: {},
			discussions: [],
			electorate: [],
			voteBudget: type === "choice" ? 1 : 5,
			deciders: [],
		},
	};
}
