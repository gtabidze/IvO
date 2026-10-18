import {
	Dialog,
	DialogDescription,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { AlertTriangle, ArrowRight, Check, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";
import { AgentAvatar } from "./agent-avatar";

export interface AgentCheckResult {
	id: string;
	agentName: string;
	agentEmoji: string;
	agentSlug: string;
	status: "success" | "warning" | "failure";
	duration: string;
	headline: string;
	oneLiner: string;
	detailedFeedback: string;
	heuristics: string[];
	recommendation?: string;
	score?: string;
}

export function computeAgentChecks(
	flow: DashboardFlow,
	screenIndex?: number,
): AgentCheckResult[] {
	const currentScreen: FlowScreen | undefined =
		screenIndex !== undefined ? flow.screens[screenIndex] : undefined;

	const hasIssues = flow.usabilityIssues && flow.usabilityIssues.length > 0;
	const primaryIssue = hasIssues ? flow.usabilityIssues[0] : null;

	const screenContext = currentScreen ? ` on "${currentScreen.title}"` : "";

	return [
		{
			id: "check-heuristic",
			agentName: "Heuristic Auditor",
			agentEmoji: "🧭",
			agentSlug: "heuristic",
			status: hasIssues ? "warning" : "success",
			duration: "1.2s",
			headline: hasIssues
				? `Heuristic warning${screenContext}: ${primaryIssue?.title}`
				: `Nielsen 10 Heuristics compliance verified${screenContext}`,
			oneLiner: hasIssues
				? `${primaryIssue?.heuristic} - Potential drop-off point flagged.`
				: "Zero critical usability violations. Error prevention & visibility verified.",
			detailedFeedback: hasIssues
				? `${primaryIssue?.description} Drop-off impact: ${primaryIssue?.dropOffImpact}. Recommend proactive visual affordance or assistive inline messaging.`
				: `Evaluated flow steps against Nielsen Norman usability heuristics. Heuristic score: ${flow.seqScore}. Mental model alignment is strong with zero user confusion cues.`,
			heuristics: hasIssues
				? [primaryIssue?.heuristic || "Nielsen #5"]
				: [
						"Visibility of System Status (Nielsen #1)",
						"Match Between System & Real World (Nielsen #2)",
						"User Control and Freedom (Nielsen #3)",
						"Error Prevention (Nielsen #5)",
					],
			recommendation: hasIssues
				? "Add a subtle inline helper or micro-copy hint before user initiates this action."
				: undefined,
			score: flow.seqScore,
		},
		{
			id: "check-researcher",
			agentName: "UX Researcher",
			agentEmoji: "🔎",
			agentSlug: "researcher",
			status: "success",
			duration: "850ms",
			headline: `Benchmark success rate ${flow.taskSuccessRate} (${flow.seqRating})`,
			oneLiner: `Completed in avg ${flow.timeOnTask} with ${flow.taskSuccessRate} task completion.`,
			detailedFeedback: `Empirical usability metrics indicate high ease of completion. Time-on-task is well within competitive standard benchmarks (${flow.timeOnTask}). SEQ score places this in the ${flow.seqRating}.`,
			heuristics: [
				"Task Completion Rate",
				"Time-on-Task Benchmarks",
				"SEQ Rating",
			],
			score: flow.taskSuccessRate,
		},
		{
			id: "check-pixel",
			agentName: "Visual Copilot",
			agentEmoji: "🎨",
			agentSlug: "pixel",
			status: "success",
			duration: "420ms",
			headline: `Component consistency and visual rhythm verified across ${flow.screens.length} screens`,
			oneLiner:
				"Strict spacing hierarchy, brand color balance, and typography tokens passed.",
			detailedFeedback:
				"Visual design inspection passed with zero spacing anomalies. Color contrast for primary interactive elements meets APCA bronze standard. Visual weight flows naturally from headline to primary CTA.",
			heuristics: [
				"Visual Hierarchy",
				"Spacing Tokens",
				"Color Contrast Ratio",
			],
			score: "100%",
		},
		{
			id: "check-wordsmith",
			agentName: "UX Wordsmith",
			agentEmoji: "✍️",
			agentSlug: "wordsmith",
			status: "success",
			duration: "650ms",
			headline: "Action-oriented microcopy with clear cognitive labels",
			oneLiner:
				"Button copy uses specific verbs; zero jargon or ambiguous confirmations.",
			detailedFeedback:
				"Microcopy audit reveals concise, respectful, and direct button labels. Error copy provides immediate recovery pathways. Readability index is at 6th-grade comprehension level for global clarity.",
			heuristics: [
				"Microcopy Clarity",
				"Tone of Voice",
				"Cognitive Load Reduction",
			],
			score: "Grade 6",
		},
		{
			id: "check-tester",
			agentName: "A11y & QA Tester",
			agentEmoji: "🧪",
			agentSlug: "tester",
			status: "success",
			duration: "1.1s",
			headline: "WCAG 2.1 AA compliance & 48px touch targets verified",
			oneLiner:
				"All primary tap targets meet minimum 48x48px boundaries with haptic feedback.",
			detailedFeedback:
				"Automated accessibility audit confirmed appropriate semantic roles, accessible labels for screen readers, and adequate target sizing for one-handed thumb interaction.",
			heuristics: [
				"WCAG 2.1 AA",
				"Touch Target Size (48px+)",
				"Screen Reader Labels",
			],
			score: "WCAG AA",
		},
	];
}

/**
 * GitHub Actions Check Status Badge (Matching Screenshot 1)
 */
export function AgentChecksBadge({
	flow,
	screenIndex,
	onOpenChecks,
	className = "",
}: {
	flow: DashboardFlow;
	screenIndex?: number;
	onOpenChecks: () => void;
	className?: string;
}) {
	const checks = useMemo(
		() => computeAgentChecks(flow, screenIndex),
		[flow, screenIndex],
	);

	const hasWarning = checks.some((c) => c.status === "warning");
	const hasFailure = checks.some((c) => c.status === "failure");

	return (
		<div className="group/badge relative inline-flex items-center">
			<button
				type="button"
				onClick={(e) => {
					e.stopPropagation();
					onOpenChecks();
				}}
				className={`group flex cursor-pointer items-center justify-center rounded-md p-1 transition-all active:scale-90 ${
					hasFailure
						? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
						: hasWarning
							? "text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/50"
							: "text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/50"
				} ${className}`}
				title={
					hasFailure
						? "Checks failed"
						: hasWarning
							? "Checks passed with warnings"
							: "All checks have passed"
				}
				aria-label="Agent checks status"
			>
				{hasFailure ? (
					<XCircle className="h-4 w-4" />
				) : hasWarning ? (
					<AlertTriangle className="h-4 w-4" />
				) : (
					<Check className="h-4 w-4 stroke-[2.5px]" />
				)}
			</button>

			{/* Tooltip on hover (matching screenshot 1 "success") */}
			<div className="pointer-events-none absolute -top-8 left-1/2 z-50 hidden -translate-x-1/2 items-center whitespace-nowrap rounded-lg bg-neutral-900 px-2.5 py-1 font-semibold text-[11px] text-white shadow-md group-hover/badge:flex dark:bg-neutral-800">
				{hasFailure ? "failed" : hasWarning ? "warning" : "success"}
			</div>
		</div>
	);
}

/**
 * GitHub Actions Style Checks Popover / Dialog (Matching Screenshot 2)
 */
export function AgentChecksDialog({
	flow,
	screenIndex,
	open,
	onOpenChange,
	onInspectFlow,
}: {
	flow: DashboardFlow | null;
	screenIndex?: number;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onInspectFlow?: (flow: DashboardFlow, screenIndex: number) => void;
}) {
	const [selectedDetail, setSelectedDetail] = useState<AgentCheckResult | null>(
		null,
	);

	const checks = useMemo(() => {
		if (!flow) return [];
		return computeAgentChecks(flow, screenIndex);
	}, [flow, screenIndex]);

	if (!flow) return null;

	const warningCount = checks.filter((c) => c.status === "warning").length;
	const successCount = checks.filter((c) => c.status === "success").length;
	const allPassed = warningCount === 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-xl overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-0 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
				{/* Header (Matching Screenshot 2) */}
				<div className="border-neutral-200/80 border-b p-4 sm:p-5 dark:border-neutral-800">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							{allPassed ? (
								<Check className="h-5 w-5 stroke-[2.5px] text-emerald-600 dark:text-emerald-400" />
							) : (
								<AlertTriangle className="h-5 w-5 text-amber-500" />
							)}
							<DialogTitle className="font-bold text-base text-neutral-950 dark:text-white">
								{allPassed
									? "All checks have passed"
									: `${successCount} checks passed, ${warningCount} warning`}
							</DialogTitle>
						</div>
					</div>
					<DialogDescription className="mt-1 text-neutral-500 text-xs">
						{warningCount > 0 ? `${warningCount} warning and ` : ""}
						{successCount} successful checks by your Workspace AI Team
					</DialogDescription>
				</div>

				{/* Single-Line Checks List (Matching Screenshot 2) */}
				<div className="max-h-[58vh] divide-y divide-neutral-100 overflow-y-auto dark:divide-neutral-800/80">
					{checks.map((check) => (
						<div key={check.id} className="flex flex-col">
							{/* Single line row */}
							<div className="flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-neutral-50/70 sm:px-5 dark:hover:bg-neutral-900/40">
								{/* Left: Status Icon + Agent Emoji Avatar */}
								<div className="flex min-w-0 flex-1 items-center gap-2.5">
									<div className="shrink-0">
										{check.status === "success" && (
											<Check className="h-4 w-4 stroke-[2.5px] text-emerald-600 dark:text-emerald-400" />
										)}
										{check.status === "warning" && (
											<AlertTriangle className="h-4 w-4 text-amber-500" />
										)}
										{check.status === "failure" && (
											<XCircle className="h-4 w-4 text-red-500" />
										)}
									</div>

									<div className="flex shrink-0 items-center justify-center text-sm">
										<AgentAvatar
											emoji={check.agentEmoji}
											name={check.agentName}
											size="sm"
										/>
									</div>

									{/* Agent Name + Brief Verdict (One line) */}
									<div className="min-w-0 flex-1 truncate text-neutral-800 text-xs dark:text-neutral-200">
										<span className="font-bold text-neutral-950 dark:text-white">
											{check.agentName}
										</span>
										<span className="mx-1.5 text-neutral-400">·</span>
										<span className="text-[11px] text-neutral-500">
											Successful in {check.duration} -
										</span>
										<span className="ml-1 text-neutral-700 dark:text-neutral-300">
											{check.oneLiner}
										</span>
									</div>
								</div>

								{/* Right: Details Link (Matching screenshot 2) */}
								<button
									type="button"
									onClick={() =>
										setSelectedDetail((prev) =>
											prev?.id === check.id ? null : check,
										)
									}
									className="shrink-0 cursor-pointer font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
								>
									{selectedDetail?.id === check.id ? "Hide" : "Details"}
								</button>
							</div>

							{/* In-depth expanded details card */}
							{selectedDetail?.id === check.id && (
								<div className="border-neutral-200/80 border-t bg-neutral-50/70 px-5 py-4 text-xs dark:border-neutral-800 dark:bg-neutral-900/60">
									<div className="space-y-3">
										<div>
											<span className="font-semibold text-neutral-900 dark:text-white">
												{check.headline}
											</span>
											<p className="mt-1 text-neutral-600 text-xs leading-relaxed dark:text-neutral-300">
												{check.detailedFeedback}
											</p>
										</div>

										{/* Evaluated Heuristics Pills */}
										<div className="flex flex-wrap items-center gap-1.5 pt-1">
											<span className="font-semibold text-[10px] text-neutral-400 uppercase tracking-wider">
												Standards Evaluated:
											</span>
											{check.heuristics.map((h) => (
												<span
													key={h}
													className="rounded-full border border-neutral-200 bg-white px-2.5 py-0.5 font-medium text-[10px] text-neutral-700 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
												>
													{h}
												</span>
											))}
										</div>

										{check.recommendation && (
											<div className="rounded-xl border border-amber-200/70 bg-amber-50/80 p-2.5 text-[11px] text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
												<strong>Recommendation: </strong>
												{check.recommendation}
											</div>
										)}
									</div>
								</div>
							)}
						</div>
					))}
				</div>

				{/* Footer actions */}
				<div className="flex items-center justify-between border-neutral-200/80 border-t bg-neutral-50/50 p-3.5 px-5 dark:border-neutral-800 dark:bg-neutral-900/40">
					<span className="text-[11px] text-neutral-500">
						Automated design QA for {flow.app} · {flow.flowName}
					</span>
					{onInspectFlow && (
						<button
							type="button"
							onClick={() => {
								onOpenChange(false);
								onInspectFlow(flow, screenIndex ?? 0);
							}}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-1.5 font-semibold text-white text-xs hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							<span>Open in Flow Studio</span>
							<ArrowRight className="h-3 w-3" />
						</button>
					)}
				</div>
			</DialogPopup>
		</Dialog>
	);
}
