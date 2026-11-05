import {
	ChartContainer,
	ChartSegmentedSteps,
	ChartSeqLikertScale,
	type ChartSeriesPoint,
	ChartTimelineLollipop,
	ChartZoomedBullet,
} from "@IvO/ui/components/chart";
import type { DashboardFlow } from "@/data/dashboard-flows";

export function specialistExamples(flow: DashboardFlow) {
	const note = (id: string, screen: number, text: string) => ({
		id: `${flow.id}-${id}`,
		screen,
		text,
		replies: [] as string[],
	});
	const cardStep = flow.screens.findIndex((s) =>
		/select|catalog|tier/i.test(s.title),
	);
	return [
		{
			id: "reference-researcher",
			name: "UX Researcher",
			agent: true,
			overall: `The recorded journey contains ${flow.screens.length} screens. Reference completion time is ${flow.timeOnTask || "unavailable"}, task success is ${flow.taskSuccessRate || "unavailable"}, and ease of completion is ${flow.seqScore || "unavailable"}. Validate these demo values with observed task sessions before using them to prioritize changes.`,
			observations: [
				note(
					"research-journey",
					Math.max(0, cardStep),
					`Review the decision point at “${flow.screens[Math.max(0, cardStep)]?.title}”. Ask participants to explain which option meets their goal before proceeding; record hesitation, backtracking and completion time.`,
				),
				...flow.usabilityIssues
					.slice(0, 2)
					.map((issue, i) =>
						note(
							`research-issue-${i}`,
							Math.min(
								Number(issue.description.match(/step\s+(\d+)/i)?.[1] || 1) - 1,
								flow.screens.length - 1,
							),
							`${issue.title}: ${issue.description} Reference impact: ${issue.dropOffImpact}. Validate this reported issue in a task-based session; the issue record does not identify an exact screen position.`,
						),
					),
			],
		},
		{
			id: "reference-writer",
			name: "UX Writer",
			agent: true,
			overall:
				"Lead with the action users are trying to complete. Use consistent card terminology, make confirmation explicit, and explain the consequence before commitment. The suggestions below use flow screen labels as their source; verify the actual on-screen copy before applying them.",
			observations: flow.screens
				.map((screen, i) => ({ screen, i }))
				.filter(({ screen }) =>
					/catalog|select|summary|issued|processing|terms/i.test(screen.title),
				)
				.slice(0, 3)
				.map(({ screen, i }) =>
					note(
						`writer-${i}`,
						i,
						`Use an action-led label for “${screen.title}” so the next step is easier to predict.`,
					),
				),
		},
	];
}
function point(
	flow: DashboardFlow,
	value: number,
	formatted: string,
): ChartSeriesPoint[] {
	return [
		{
			key: flow.id,
			label: flow.app,
			rawValue: value,
			formattedValue: formatted,
			normalizedPercent: value,
			color: flow.appColor,
		},
	];
}
export function ResearchExhibits({ flow }: { flow: DashboardFlow }) {
	const duration = flow.timeOnTask.match(
		/(?:(\d+(?:\.\d+)?)\s*m)?\s*(\d+(?:\.\d+)?)\s*s/,
	);
	const seconds = duration
		? Number(duration[1] || 0) * 60 + Number(duration[2])
		: Number.NaN;
	const success = Number.parseFloat(flow.taskSuccessRate);
	const seq = Number.parseFloat(flow.seqScore);
	return (
		<section className="space-y-5 rounded-xl border border-neutral-200 p-3">
			<div>
				<h4 className="font-semibold text-xs">Journey evidence</h4>
				<p className="mt-1 text-[10px] text-neutral-500">
					Demo flow data · collection date unavailable
				</p>
			</div>
			<ChartContainer
				config={{ [flow.id]: { label: flow.app, color: flow.appColor } }}
				className="space-y-5"
			>
				<div>
					<h5 className="mb-2 font-medium text-xs">Screen count</h5>
					<ChartSegmentedSteps
						points={point(
							flow,
							flow.screens.length,
							`${flow.screens.length} screens`,
						)}
						maxSlots={Math.max(1, flow.screens.length)}
					/>
				</div>
				<div>
					<h5 className="mb-2 font-medium text-xs">Time on task</h5>
					{Number.isFinite(seconds) ? (
						<ChartTimelineLollipop
							points={point(flow, seconds, flow.timeOnTask)}
							maxSeconds={Math.max(75, seconds * 1.2)}
							benchmarkSeconds={60}
						/>
					) : (
						<p className="text-xs">Unavailable</p>
					)}
					<p className="mt-1 text-[10px] text-neutral-500">
						60s reference line · not a validated target
					</p>
				</div>
				<div>
					<h5 className="mb-2 font-medium text-xs">Task success</h5>
					{Number.isFinite(success) ? (
						<ChartZoomedBullet
							points={point(flow, success, flow.taskSuccessRate)}
							minDomain={0}
							maxDomain={100}
							targetValue={97}
						/>
					) : (
						<p className="text-xs">Unavailable</p>
					)}
					<p className="mt-1 text-[10px] text-neutral-500">
						97% reference line · not a validated target
					</p>
				</div>
				<div>
					<h5 className="mb-2 font-medium text-xs">Ease of completion · SEQ</h5>
					{Number.isFinite(seq) ? (
						<ChartSeqLikertScale points={point(flow, seq, flow.seqScore)} />
					) : (
						<p className="text-xs">Unavailable</p>
					)}
				</div>
			</ChartContainer>
		</section>
	);
}
export function WriterExhibit({
	flow,
	screen,
}: {
	flow: DashboardFlow;
	screen: number;
}) {
	const before = flow.screens[screen]?.title || "";
	const after = /terms/i.test(before)
		? "Review the card terms"
		: /processing/i.test(before)
			? "We're preparing your digital card"
			: /issued/i.test(before)
				? "Your digital card is ready"
				: /summary/i.test(before)
					? "Review and order your card"
					: /select/i.test(before)
						? "Choose your digital card"
						: "Explore available cards";
	return (
		<div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 text-xs">
			<div className="bg-neutral-50 p-3">
				<span className="text-[10px] text-neutral-500">
					BEFORE · FLOW LABEL
				</span>
				<p className="mt-1">{before}</p>
			</div>
			<div className="border-neutral-200 border-t bg-blue-50/50 p-3">
				<span className="text-[10px] text-blue-600">
					AFTER · SUGGESTED COPY
				</span>
				<p className="mt-1 font-medium">{after}</p>
			</div>
		</div>
	);
}
