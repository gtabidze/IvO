import { Bubble, BubbleContent, BubbleGroup } from "@IvO/ui/components/bubble";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@IvO/ui/components/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartRadialGauges,
	ChartScorerDistribution,
	ChartSegmentedSteps,
	ChartSeqLikertScale,
	type ChartSeriesPoint,
	ChartTimelineLollipop,
	ChartZoomedBullet,
} from "@IvO/ui/components/chart";
import {
	InputGroup,
	InputGroupButton,
	InputGroupInput,
} from "@IvO/ui/components/input-group";
import {
	ArrowRightToLine,
	CheckCircle2,
	ChevronDown,
	Layers,
	ScanSearch,
	Send,
	Sparkles,
	Tag,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";

interface FlowMetricsProfile {
	flow: DashboardFlow;
	seriesKey: string;
	color: string;
	shortLabel: string;
	totalClicks: number;
	timeSeconds: number;
	timeFormatted: string;
	taskSuccessRate: number;
	seqScore: number;
	uxWritingScore: number;
	readingGrade: string;
	contrastIssues: number;
	contrastStatus: string;
	accessibilityScore: number;
}

interface PatternAiMessage {
	id: string;
	sender: "user" | "ai";
	text: string;
	timestamp: string;
}

const PROMPT_CHIPS = [
	"Explain drop-off pattern",
	"Compare vs benchmarks",
	"UX improvement tips",
];

const SERIES_COLORS = [
	"#ff600a", // BOG Orange (Baseline)
	"#0075eb", // TBC Blue (Compared Flow 2)
	"#111111", // Silk Black (Compared Flow 3)
];

function resolveComparisonColor(flow: DashboardFlow, idx: number): string {
	const appLower = flow.app.toLowerCase();
	if (appLower.includes("bog") || flow.id.startsWith("bog")) {
		return "#ff600a"; // Orange for BOG
	}
	if (appLower.includes("tbc") || flow.id.startsWith("tbc")) {
		return "#0075eb"; // Blue for TBC
	}
	if (appLower.includes("silk") || flow.id.startsWith("silk")) {
		return "#111111"; // Black for Silk
	}
	return (
		flow.appColor || SERIES_COLORS[idx % SERIES_COLORS.length] || "#ff600a"
	);
}

function parseSeconds(timeStr: string): number {
	const minMatch = timeStr.match(/(\d+)\s*m/);
	const secMatch = timeStr.match(/(\d+)\s*s/);
	const mins = minMatch ? Number.parseInt(minMatch[1], 10) : 0;
	const secs = secMatch ? Number.parseInt(secMatch[1], 10) : 0;
	return mins * 60 + secs || 45;
}

function parsePercent(pctStr: string): number {
	const m = pctStr.match(/([\d.]+)/);
	return m ? Number.parseFloat(m[1]) : 97.5;
}

function parseSeq(seqStr: string): number {
	const m = seqStr.match(/([\d.]+)/);
	return m ? Number.parseFloat(m[1]) : 6.5;
}

function buildFlowMetrics(
	flow: DashboardFlow,
	idx: number,
): FlowMetricsProfile {
	const isBogCard =
		flow.id === "bog-order-card" || flow.id === "monzo-order-card";
	const isTbcCard =
		flow.id === "tbc-order-card" || flow.id === "revolut-order-card-compare";
	const isSilkCard =
		flow.id === "silk-order-card" || flow.id === "stripe-issuing-card";

	const totalClicks = isBogCard
		? 5
		: isTbcCard
			? 7
			: isSilkCard
				? 6
				: flow.screens.length + 2 + idx;

	const timeSeconds = parseSeconds(flow.timeOnTask);
	const taskSuccessRate = parsePercent(flow.taskSuccessRate);
	const seqScore = parseSeq(flow.seqScore);

	const uxWritingScore = isBogCard
		? 96
		: isTbcCard
			? 89
			: isSilkCard
				? 94
				: Math.max(84, 95 - idx * 4);

	const readingGrade = isBogCard
		? "Grade 6"
		: isTbcCard
			? "Grade 8"
			: "Grade 7";

	const contrastIssues = isBogCard
		? 1
		: isTbcCard
			? 2
			: isSilkCard
				? 0
				: flow.usabilityIssues.length;

	const contrastStatus =
		contrastIssues === 0
			? "AAA Pass"
			: contrastIssues === 1
				? "1 Low warn"
				: `${contrastIssues} Med warns`;

	const accessibilityScore = isBogCard
		? 98
		: isTbcCard
			? 91
			: isSilkCard
				? 96
				: Math.max(88, 97 - idx * 3);

	return {
		flow,
		seriesKey: `flow_${idx + 1}`,
		color: resolveComparisonColor(flow, idx),
		shortLabel: `${flow.app} (${flow.flowLabel})`,
		totalClicks,
		timeSeconds,
		timeFormatted: flow.timeOnTask,
		taskSuccessRate,
		seqScore,
		uxWritingScore,
		readingGrade,
		contrastIssues,
		contrastStatus,
		accessibilityScore,
	};
}

export function FlowComparisonSidebar({
	primaryFlow,
	comparedFlows,
	onClose,
}: {
	primaryFlow: DashboardFlow;
	comparedFlows: DashboardFlow[];
	onClose: () => void;
}) {
	const [selectorExpanded, setSelectorExpanded] = useState(true);
	const allFlows = useMemo(
		() => [primaryFlow, ...comparedFlows],
		[primaryFlow, comparedFlows],
	);

	const profiles = useMemo(
		() => allFlows.map((f, i) => buildFlowMetrics(f, i)),
		[allFlows],
	);

	const chartConfig = useMemo<ChartConfig>(() => {
		const cfg: ChartConfig = {};
		for (const p of profiles) {
			cfg[p.seriesKey] = {
				label: p.shortLabel,
				color: p.color,
			};
		}
		return cfg;
	}, [profiles]);

	// Determine executive summary insights
	const fastestProfile = useMemo(
		() =>
			[...profiles].sort((a, b) => a.timeSeconds - b.timeSeconds)[0] ??
			profiles[0],
		[profiles],
	);
	const fewestClicksProfile = useMemo(
		() =>
			[...profiles].sort((a, b) => a.totalClicks - b.totalClicks)[0] ??
			profiles[0],
		[profiles],
	);
	const highestSuccessProfile = useMemo(
		() =>
			[...profiles].sort((a, b) => b.taskSuccessRate - a.taskSuccessRate)[0] ??
			profiles[0],
		[profiles],
	);
	const highestA11yProfile = useMemo(
		() =>
			[...profiles].sort(
				(a, b) =>
					b.accessibilityScore - a.accessibilityScore ||
					a.contrastIssues - b.contrastIssues,
			)[0] ?? profiles[0],
		[profiles],
	);

	// Build chart points for all 7 scorers
	const [aiMessages, setAiMessages] = useState<PatternAiMessage[]>([
		{
			id: "msg-init",
			sender: "ai",
			text: `Pattern summary for ${primaryFlow.flowName}: ${primaryFlow.taskSuccessRate} task success rate across ${primaryFlow.screens.length} steps. Median time on task is ${primaryFlow.timeOnTask} with an ease score (SEQ) of ${primaryFlow.seqScore}/7. Tap a prompt below or ask any question about these patterns!`,
			timestamp: "Just now",
		},
	]);
	const [userQuery, setUserQuery] = useState("");
	const [isAiLoading, setIsAiLoading] = useState(false);

	const handleTriggerPrompt = (promptText: string) => {
		const userMsg: PatternAiMessage = {
			id: `u-${Date.now()}`,
			sender: "user",
			text: promptText,
			timestamp: "Just now",
		};

		let aiReplyText = "";
		if (promptText.toLowerCase().includes("drop-off")) {
			const issues = primaryFlow.usabilityIssues || [];
			if (issues.length > 0) {
				aiReplyText =
					`Drop-off analysis for ${primaryFlow.flowName}:\n` +
					issues
						.map(
							(i, idx) =>
								`• Issue ${idx + 1} (${i.dropOffImpact}): ${i.title} - ${i.description}`,
						)
						.join("\n") +
					`\n\nRecommendation: Addressing "${issues[0]?.title}" will recover up to ${issues[0]?.dropOffImpact || "15%"} user retention.`;
			} else {
				aiReplyText = `Drop-off analysis: ${primaryFlow.flowName} maintains a strong ${primaryFlow.taskSuccessRate} completion rate with minimal drop-off friction across ${primaryFlow.screens.length} steps.`;
			}
		} else if (
			promptText.toLowerCase().includes("compare") ||
			promptText.toLowerCase().includes("benchmark")
		) {
			aiReplyText =
				"Benchmark telemetry breakdown:\n" +
				profiles
					.map(
						(p) =>
							`• ${p.flow.app} (${p.shortLabel}): ${p.taskSuccessRate}% success, ${p.timeFormatted} completion, ${p.totalClicks} clicks, SEQ ${p.seqScore}/7`,
					)
					.join("\n") +
				`\n\nFastest flow is ${fastestProfile.flow.app} (${fastestProfile.timeFormatted}). Highest success rate is ${highestSuccessProfile.flow.app} (${highestSuccessProfile.taskSuccessRate}%).`;
		} else if (
			promptText.toLowerCase().includes("ux") ||
			promptText.toLowerCase().includes("tip")
		) {
			aiReplyText =
				`UX optimization opportunities for ${primaryFlow.flowName}:\n` +
				"1. Progressive disclosure: group card configuration settings into a single confirmation screen.\n" +
				"2. Touch targets: ensure all actionable buttons adhere to min 48px hit area.\n" +
				`3. Telemetry goal: target median time reduction from ${primaryFlow.timeOnTask} toward benchmark target (~18s).`;
		} else {
			aiReplyText = `Analyzing pattern query: "${promptText}". Based on ${primaryFlow.flowName} telemetry (${primaryFlow.taskSuccessRate} success, ${primaryFlow.timeOnTask} duration, ${primaryFlow.screens.length} steps), interaction density is well-balanced across the flow with primary friction isolated to verification steps.`;
		}

		setAiMessages((prev) => [...prev, userMsg]);
		setIsAiLoading(true);

		setTimeout(() => {
			const aiMsg: PatternAiMessage = {
				id: `ai-${Date.now()}`,
				sender: "ai",
				text: aiReplyText,
				timestamp: "Just now",
			};
			setAiMessages((prev) => [...prev, aiMsg]);
			setIsAiLoading(false);
		}, 350);
	};

	const handleSendQuery = (e: React.FormEvent) => {
		e.preventDefault();
		if (!userQuery.trim() || isAiLoading) return;
		const q = userQuery.trim();
		setUserQuery("");
		handleTriggerPrompt(q);
	};

	const maxClicks = Math.max(...profiles.map((p) => p.totalClicks), 10);
	const minClicks = Math.min(...profiles.map((p) => p.totalClicks));
	const clicksPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.totalClicks,
		formattedValue: `${p.totalClicks} clicks`,
		normalizedPercent: (p.totalClicks / maxClicks) * 100,
		color: p.color,
		isWinner: p.totalClicks === minClicks,
	}));

	const maxTime = Math.max(...profiles.map((p) => p.timeSeconds), 75);
	const minTime = Math.min(...profiles.map((p) => p.timeSeconds));
	const timePoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.timeSeconds,
		formattedValue: `${p.timeFormatted} (${p.timeSeconds}s)`,
		normalizedPercent: (p.timeSeconds / maxTime) * 100,
		color: p.color,
		isWinner: p.timeSeconds === minTime,
	}));

	const maxSuccess = Math.max(...profiles.map((p) => p.taskSuccessRate));
	const successPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.taskSuccessRate,
		formattedValue: `${p.taskSuccessRate.toFixed(1)}%`,
		normalizedPercent: p.taskSuccessRate,
		color: p.color,
		isWinner: p.taskSuccessRate === maxSuccess,
	}));

	const maxSeq = Math.max(...profiles.map((p) => p.seqScore));
	const seqPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.seqScore,
		formattedValue: `${p.seqScore.toFixed(1)} / 7`,
		normalizedPercent: (p.seqScore / 7) * 100,
		color: p.color,
		isWinner: p.seqScore === maxSeq,
	}));

	const maxWriting = Math.max(...profiles.map((p) => p.uxWritingScore));
	const writingPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.uxWritingScore,
		formattedValue: `${p.uxWritingScore}%`,
		normalizedPercent: p.uxWritingScore,
		color: p.color,
		isWinner: p.uxWritingScore === maxWriting,
		subLabel: p.readingGrade,
	}));

	const minContrast = Math.min(...profiles.map((p) => p.contrastIssues));
	const contrastPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.contrastIssues,
		formattedValue: `${p.contrastIssues} ${p.contrastIssues === 1 ? "issue" : "issues"}`,
		normalizedPercent: Math.max(12, (p.contrastIssues / 4) * 100),
		color: p.color,
		isWinner: p.contrastIssues === minContrast,
		subLabel: p.contrastStatus,
	}));

	const maxA11y = Math.max(...profiles.map((p) => p.accessibilityScore));
	const a11yPoints: ChartSeriesPoint[] = profiles.map((p) => ({
		key: p.seriesKey,
		label: p.flow.app,
		rawValue: p.accessibilityScore,
		formattedValue: `${p.accessibilityScore}%`,
		normalizedPercent: p.accessibilityScore,
		color: p.color,
		isWinner: p.accessibilityScore === maxA11y,
	}));

	return (
		<aside
			aria-label="Flow comparison telemetry and executive summary"
			className="z-30 flex h-full w-88 shrink-0 flex-col border-neutral-200 border-l bg-white text-neutral-900 shadow-xl sm:w-96 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
		>
			{/* Top Header: Patterns & Telemetry + Collapse Button */}
			<div className="border-neutral-200 border-b px-5 py-3.5 dark:border-neutral-800">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-2">
						<ScanSearch className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						<span className="font-semibold text-neutral-900 text-xs sm:text-sm dark:text-white">
							{comparedFlows.length > 0
								? `Patterns & Benchmark Insights (${allFlows.length} flows)`
								: "Patterns & Flow KPIs"}
						</span>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
						aria-label="Collapse patterns sidebar"
						title="Hide patterns sidebar"
					>
						<ArrowRightToLine className="h-3.5 w-3.5" />
					</button>
				</div>

				{/* Active Comparison Flows Dropdown Pill */}
				<button
					type="button"
					onClick={() => setSelectorExpanded((prev) => !prev)}
					className="mt-2 flex w-full cursor-pointer items-center justify-between rounded-lg py-1 text-left transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
				>
					<div className="flex min-w-0 items-center gap-2">
						<span
							className="h-2.5 w-2.5 shrink-0 rounded-full ring-2 ring-orange-500/20"
							style={{ backgroundColor: profiles[0]?.color || "#ff600a" }}
						/>
						<span className="truncate font-semibold text-neutral-900 text-xs dark:text-white">
							{comparedFlows.length > 0
								? profiles.map((p) => p.flow.app).join(" vs ")
								: `${primaryFlow.app} · ${primaryFlow.flowLabel}`}
						</span>
					</div>
					<ChevronDown
						className={`h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform duration-150 ${
							selectorExpanded ? "rotate-180" : ""
						}`}
					/>
				</button>

				{selectorExpanded && (
					<div className="mt-2.5 space-y-1.5 rounded-xl bg-neutral-50/90 p-2.5 ring-1 ring-neutral-200/70 dark:bg-neutral-800/50 dark:ring-neutral-800">
						{profiles.map((p, idx) => (
							<div
								key={p.flow.id}
								className="flex items-center justify-between gap-2 text-xs"
							>
								<div className="flex min-w-0 items-center gap-2">
									<span
										className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
										style={{ backgroundColor: p.color }}
									/>
									<span className="truncate font-medium text-neutral-800 dark:text-neutral-200">
										{p.flow.app} · {p.flow.flowLabel}
									</span>
								</div>
								<span className="shrink-0 font-mono text-[10px] text-neutral-400">
									{comparedFlows.length === 0
										? "Active Flow"
										: idx === 0
											? "Baseline"
											: `Flow ${idx + 1}`}
								</span>
							</div>
						))}
					</div>
				)}
			</div>

			{/* Scrollable Body with explicit full-bleed dividers */}
			<div className="scrollbar-none flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{/* ================================================================= */}
				{/* AI PATTERN COPILOT SECTION (shadcn AI Elements)                   */}
				{/* ================================================================= */}
				<section className="space-y-3 border-neutral-200 border-b bg-gradient-to-b from-blue-50/40 to-transparent px-5 py-4 dark:border-neutral-800 dark:from-blue-950/20">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5 font-semibold text-blue-950 text-xs dark:text-blue-200">
							<Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
							<span>Ask AI About Patterns</span>
						</div>
						<span className="rounded-full bg-blue-100 px-2 py-0.5 font-medium text-[10px] text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
							AI Elements
						</span>
					</div>

					{/* Quick Smart Prompt Chips */}
					<div className="flex flex-wrap gap-1.5">
						{PROMPT_CHIPS.map((chip) => (
							<button
								key={chip}
								type="button"
								onClick={() => handleTriggerPrompt(chip)}
								className="cursor-pointer rounded-full border border-blue-200/80 bg-white px-2.5 py-1 font-medium text-[11px] text-blue-800 shadow-2xs transition-all hover:bg-blue-50 active:scale-96 dark:border-blue-900/70 dark:bg-neutral-900 dark:text-blue-300 dark:hover:bg-blue-950/60"
							>
								{chip}
							</button>
						))}
					</div>

					{/* Conversational Stream using Bubble & BubbleGroup */}
					<div className="max-h-56 space-y-2 overflow-y-auto pr-1">
						<BubbleGroup className="gap-2">
							{aiMessages.map((msg) => (
								<Bubble
									key={msg.id}
									align={msg.sender === "user" ? "end" : "start"}
									variant={msg.sender === "user" ? "secondary" : "outline"}
								>
									<BubbleContent className="whitespace-pre-line rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-xs leading-relaxed shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
										{msg.text}
									</BubbleContent>
								</Bubble>
							))}
							{isAiLoading && (
								<Bubble align="start" variant="outline">
									<BubbleContent className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-white px-3 py-2 text-neutral-500 text-xs shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
										<Sparkles className="h-3 w-3 animate-spin text-blue-600" />
										<span>Synthesizing telemetry & patterns...</span>
									</BubbleContent>
								</Bubble>
							)}
						</BubbleGroup>
					</div>

					{/* InputGroup Question Bar */}
					<form onSubmit={handleSendQuery} className="pt-0.5">
						<InputGroup className="rounded-xl border border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
							<InputGroupInput
								value={userQuery}
								onChange={(e) => setUserQuery(e.target.value)}
								placeholder="Ask about drop-offs, clicks, or benchmarks..."
								className="text-xs"
							/>
							<InputGroupButton
								type="submit"
								size="icon-xs"
								disabled={!userQuery.trim() || isAiLoading}
								className="mr-1 cursor-pointer rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-900"
							>
								<Send className="size-3.5" />
							</InputGroupButton>
						</InputGroup>
					</form>
				</section>
				{/* ================================================================= */}
				{/* 1. EXECUTIVE SUMMARY SECTION (Readable, easy to scan)              */}
				{/* ================================================================= */}
				<section className="space-y-3 border-neutral-200 border-b px-5 py-4 dark:border-neutral-800">
					<div className="flex items-center justify-between">
						<span className="font-medium text-neutral-500 text-xs dark:text-neutral-400">
							Executive summary
						</span>
						<span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
							<Sparkles className="h-2.5 w-2.5" />
							AI Benchmark Synthesis
						</span>
					</div>

					<Card
						size="sm"
						className="rounded-xl bg-neutral-50/70 shadow-none ring-1 ring-neutral-200/80 dark:bg-neutral-800/40 dark:ring-neutral-800"
					>
						<CardHeader className="pb-1">
							<CardTitle className="flex items-center gap-1.5 font-semibold text-neutral-950 text-xs dark:text-white">
								<CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
								<span>
									{comparedFlows.length > 0
										? `${fastestProfile.flow.app} leads completion speed & ease`
										: `${primaryFlow.app} Telemetry & Usability Analysis`}
								</span>
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2.5 text-neutral-600 text-xs leading-relaxed dark:text-neutral-300">
							<ul className="space-y-2 divide-y divide-neutral-200/60 dark:divide-neutral-800/70">
								<li className="flex items-start gap-2 pt-1 first:pt-0">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900 dark:bg-white" />
									<span>
										<strong className="font-semibold text-neutral-900 dark:text-white">
											Interaction cost:
										</strong>{" "}
										{fewestClicksProfile.flow.app} requires{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{fewestClicksProfile.totalClicks} clicks
										</strong>{" "}
										({fastestProfile.timeFormatted} median time), cutting extra
										confirmations.
									</span>
								</li>
								<li className="flex items-start gap-2 pt-2">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900 dark:bg-white" />
									<span>
										<strong className="font-semibold text-neutral-900 dark:text-white">
											Conversion &amp; clarity:
										</strong>{" "}
										{highestSuccessProfile.flow.app} reaches{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{highestSuccessProfile.taskSuccessRate.toFixed(1)}%
										</strong>{" "}
										success with{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{highestSuccessProfile.seqScore}/7 SEQ
										</strong>{" "}
										and{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{highestSuccessProfile.uxWritingScore}%
										</strong>{" "}
										microcopy clarity.
									</span>
								</li>
								<li className="flex items-start gap-2 pt-2">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-900 dark:bg-white" />
									<span>
										<strong className="font-semibold text-neutral-900 dark:text-white">
											Visual &amp; accessibility QA:
										</strong>{" "}
										{highestA11yProfile.flow.app} scores{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{highestA11yProfile.accessibilityScore}%
										</strong>{" "}
										WCAG AA with{" "}
										<strong className="font-mono font-semibold text-neutral-900 dark:text-white">
											{highestA11yProfile.contrastIssues}{" "}
											{highestA11yProfile.contrastIssues === 1
												? "contrast issue"
												: "contrast issues"}
										</strong>
										.
									</span>
								</li>
							</ul>
						</CardContent>
					</Card>
				</section>

				{/* ================================================================= */}
				{/* 2. DATASET & SERIES LEGEND HEADER                                 */}
				{/* ================================================================= */}
				<section className="space-y-2.5 border-neutral-200 border-b bg-neutral-50/40 px-5 py-3.5 dark:border-neutral-800 dark:bg-neutral-900/40">
					<div className="flex items-center justify-between">
						<span className="font-medium text-neutral-500 text-xs dark:text-neutral-400">
							Scorers and distribution
						</span>
						<span className="inline-flex items-center gap-1 font-mono text-[10px] text-neutral-400">
							<Layers className="h-3 w-3" />7 metrics
						</span>
					</div>
					<ChartContainer config={chartConfig}>
						<ChartLegend />
					</ChartContainer>
				</section>

				{/* ================================================================= */}
				{/* 3. SEVEN PURPOSE-BUILT SCORER CHARTS (Separated by full dividers) */}
				{/* ================================================================= */}
				<ChartContainer
					config={chartConfig}
					className="divide-y divide-neutral-200 dark:divide-neutral-800"
				>
					{/* Scorer 01: Total clicks -> Segmented Waffle Step-Blocks */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									01
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Total clicks
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								Discrete step blocks · Lower is better
							</span>
						</div>
						<ChartSegmentedSteps points={clicksPoints} maxSlots={10} />
					</div>

					{/* Scorer 02: Time on task -> Lollipop Timeline with 60s Benchmark */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									02
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Time on task
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								Duration lollipop · 60s target
							</span>
						</div>
						<ChartTimelineLollipop
							points={timePoints}
							maxSeconds={Math.max(maxTime, 75)}
							benchmarkSeconds={60}
						/>
					</div>

					{/* Scorer 03: Task success rate -> Zoomed-Domain Bullet Chart [90%..100%] */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									03
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Task success rate
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								Bullet chart (90–100%)
							</span>
						</div>
						<ChartZoomedBullet
							points={successPoints}
							minDomain={90}
							maxDomain={100}
							targetValue={97}
						/>
					</div>

					{/* Scorer 04: Single Ease Question (SEQ) -> 1..7 Likert Spectrum Gauge */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									04
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Single Ease Question (SEQ)
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								1–7 Likert scale
							</span>
						</div>
						<ChartSeqLikertScale points={seqPoints} />
					</div>

					{/* Scorer 05: UX writing assessment score -> Radial Ring Gauges + Reading Grade */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									05
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									UX writing assessment score
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								Radial gauge · Readability
							</span>
						</div>
						<ChartRadialGauges points={writingPoints} />
					</div>

					{/* Scorer 06: Contrast ratio issues -> Severity Bar + APCA Status Badge */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									06
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Contrast ratio issues
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								APCA / WCAG · 0 is best
							</span>
						</div>
						<ChartScorerDistribution
							points={contrastPoints}
							mode="horizontal-bars"
						/>
					</div>

					{/* Scorer 07: Accessibility score -> 0%–50%–100% Distribution Plot (Reference style) */}
					<div className="space-y-2 px-5 py-4">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono font-semibold text-[10px] text-neutral-500 dark:bg-neutral-800">
									07
								</span>
								<span className="font-semibold text-neutral-900 text-xs dark:text-white">
									Accessibility score
								</span>
							</div>
							<span className="font-mono text-[10px] text-neutral-400">
								WCAG 2.1 AA distribution
							</span>
						</div>
						<ChartScorerDistribution
							points={a11yPoints}
							axisLabels={["0%", "50%", "100%"]}
							mode="distribution"
						/>
					</div>
				</ChartContainer>

				{/* ================================================================= */}
				{/* 4. METADATA & TAGS (Matching reference screenshot)                */}
				{/* ================================================================= */}
				<section className="space-y-2.5 border-neutral-200 border-t px-5 py-4 dark:border-neutral-800">
					<span className="font-medium text-neutral-500 text-xs dark:text-neutral-400">
						Metadata
					</span>
					<div className="rounded-xl border border-neutral-200/80 bg-neutral-50/70 p-3 font-mono text-[11px] leading-relaxed dark:border-neutral-800 dark:bg-neutral-800/40">
						<div className="mb-1.5 font-medium font-sans text-[11px] text-neutral-400">
							YAML ⌄
						</div>
						<div>
							<span className="select-none text-neutral-400">1 &nbsp;</span>
							<span className="text-indigo-600 dark:text-indigo-400">
								dataset:
							</span>{" "}
							<span className="text-neutral-800 dark:text-neutral-200">
								{primaryFlow.flowLabel} Cohort
							</span>
						</div>
						<div>
							<span className="select-none text-neutral-400">2 &nbsp;</span>
							<span className="text-indigo-600 dark:text-indigo-400">
								flows_compared:
							</span>{" "}
							<span className="text-neutral-800 dark:text-neutral-200">
								{profiles.length}
							</span>
						</div>
						<div>
							<span className="select-none text-neutral-400">3 &nbsp;</span>
							<span className="text-indigo-600 dark:text-indigo-400">
								standard:
							</span>{" "}
							<span className="text-neutral-800 dark:text-neutral-200">
								WCAG_2.1_AA + Nielsen_10
							</span>
						</div>
						<div>
							<span className="select-none text-neutral-400">4 &nbsp;</span>
							<span className="text-indigo-600 dark:text-indigo-400">
								viewport:
							</span>{" "}
							<span className="text-neutral-800 dark:text-neutral-200">
								iOS_375x812
							</span>
						</div>
					</div>
				</section>

				<section className="space-y-2 border-neutral-200 border-t px-5 py-3.5 dark:border-neutral-800">
					<div className="flex items-center justify-between">
						<span className="font-medium text-neutral-500 text-xs dark:text-neutral-400">
							Tags
						</span>
						<Tag className="h-3.5 w-3.5 text-neutral-400" />
					</div>
					<div className="flex flex-wrap gap-1.5">
						{(primaryFlow.tags ?? [primaryFlow.flowType]).map((t) => (
							<span
								key={t}
								className="rounded-md border border-neutral-200 bg-neutral-50 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
							>
								#{t}
							</span>
						))}
					</div>
				</section>
			</div>

			{/* Footer ID */}
			<div className="border-neutral-200 border-t px-5 py-2.5 font-mono text-[10px] text-neutral-400 dark:border-neutral-800">
				ID cmp-{primaryFlow.id.slice(0, 8)}-{profiles.length}x
			</div>
		</aside>
	);
}
