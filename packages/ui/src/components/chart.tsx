"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@IvO/ui/components/tooltip";
import { cn } from "@IvO/ui/lib/utils";
import * as React from "react";

export type ChartConfig = {
	[k in string]: {
		label?: React.ReactNode;
		color?: string;
	};
};

type ChartContextProps = {
	config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
	const context = React.useContext(ChartContext);
	if (!context) {
		throw new Error("useChart must be used within a <ChartContainer />");
	}
	return context;
}

export function ChartContainer({
	id,
	className,
	children,
	config,
	...props
}: React.ComponentProps<"div"> & {
	config: ChartConfig;
}) {
	const uniqueId = React.useId();
	const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

	const cssVars = React.useMemo(() => {
		const vars: Record<string, string> = {};
		for (const [key, item] of Object.entries(config)) {
			if (item.color) {
				vars[`--color-${key}`] = item.color;
			}
		}
		return vars as React.CSSProperties;
	}, [config]);

	return (
		<ChartContext.Provider value={{ config }}>
			<TooltipProvider delay={60}>
				<div
					data-slot="chart"
					data-chart={chartId}
					style={cssVars}
					className={cn("flex w-full flex-col text-xs", className)}
					{...props}
				>
					{children}
				</div>
			</TooltipProvider>
		</ChartContext.Provider>
	);
}

export function ChartLegend({
	className,
	...props
}: React.ComponentProps<"div">) {
	const { config } = useChart();

	return (
		<div
			data-slot="chart-legend"
			className={cn("flex flex-wrap items-center gap-3 text-[11px]", className)}
			{...props}
		>
			{Object.entries(config).map(([key, item]) => (
				<div key={key} className="flex items-center gap-1.5">
					<span
						className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
						style={{ backgroundColor: item.color }}
					/>
					<span className="truncate font-medium text-neutral-700 dark:text-neutral-300">
						{item.label}
					</span>
				</div>
			))}
		</div>
	);
}

export interface ChartSeriesPoint {
	key: string;
	label: string;
	rawValue: number;
	formattedValue: string;
	/** Normalized 0..100 position or percentage along the axis */
	normalizedPercent: number;
	color: string;
	isWinner?: boolean;
	subLabel?: string;
}

/**
 * 1. Discrete Segmented Step-Block (Waffle Bar) Chart — Ideal for Total Clicks / Tap Counts
 */
export function ChartSegmentedSteps({
	points,
	maxSlots = 10,
	className,
}: {
	points: ChartSeriesPoint[];
	maxSlots?: number;
	className?: string;
}) {
	return (
		<div className={cn("space-y-2.5 pt-1", className)}>
			{points.map((pt) => {
				const count = Math.round(pt.rawValue);
				return (
					<Tooltip key={pt.key}>
						<TooltipTrigger
							render={
								<div className="group/step cursor-default space-y-1">
									<div className="flex items-center justify-between text-[11px]">
										<div className="flex items-center gap-1.5">
											<span
												className="h-2 w-2 rounded-[2px]"
												style={{ backgroundColor: pt.color }}
											/>
											<span className="font-medium text-neutral-700 dark:text-neutral-300">
												{pt.label}
											</span>
										</div>
										<span
											className={cn(
												"font-mono text-[11px] tabular-nums",
												pt.isWinner
													? "font-bold text-neutral-950 dark:text-white"
													: "font-medium text-neutral-500 dark:text-neutral-400",
											)}
										>
											{pt.formattedValue}
										</span>
									</div>
									<div className="grid grid-cols-10 gap-1">
										{Array.from({ length: maxSlots }).map((_, idx) => {
											const active = idx < count;
											return (
												<div
													key={idx}
													className={cn(
														"h-2.5 rounded-[2px] transition-all duration-200",
														active
															? "group-hover/step:opacity-85"
															: "bg-neutral-100 dark:bg-neutral-800/80",
													)}
													style={
														active ? { backgroundColor: pt.color } : undefined
													}
												/>
											);
										})}
									</div>
								</div>
							}
						/>
						<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
							<span className="font-semibold">{pt.label}:</span>{" "}
							<span className="font-mono">
								{pt.formattedValue} to complete flow
							</span>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}

/**
 * 2. Lollipop Timeline Chart with Industry Target Threshold — Ideal for Time on Task
 */
export function ChartTimelineLollipop({
	points,
	maxSeconds = 75,
	benchmarkSeconds = 60,
	className,
}: {
	points: ChartSeriesPoint[];
	maxSeconds?: number;
	benchmarkSeconds?: number;
	className?: string;
}) {
	const benchmarkPct = Math.min(95, (benchmarkSeconds / maxSeconds) * 100);

	return (
		<div className={cn("pt-1.5", className)}>
			<div className="relative space-y-3 rounded-lg bg-neutral-50/80 p-3 ring-1 ring-neutral-200/60 dark:bg-neutral-800/40 dark:ring-neutral-800">
				{/* Vertical dashed benchmark threshold line */}
				<div
					style={{ left: `${benchmarkPct}%` }}
					className="pointer-events-none absolute inset-y-2 z-10 border-amber-500/60 border-l border-dashed"
				>
					<span className="absolute -top-1 right-1 font-mono text-[9px] text-amber-600 dark:text-amber-400">
						{benchmarkSeconds}s avg
					</span>
				</div>

				{points.map((pt) => {
					const pct = Math.max(
						8,
						Math.min(96, (pt.rawValue / maxSeconds) * 100),
					);
					return (
						<Tooltip key={pt.key}>
							<TooltipTrigger
								render={
									<div className="relative z-20 space-y-1">
										<div className="flex items-center justify-between text-[11px]">
											<span className="font-medium text-neutral-700 dark:text-neutral-300">
												{pt.label}
											</span>
											<span
												className={cn(
													"font-mono text-[11px] tabular-nums",
													pt.isWinner
														? "font-bold text-neutral-950 dark:text-white"
														: "text-neutral-500 dark:text-neutral-400",
												)}
											>
												{pt.formattedValue}
											</span>
										</div>
										<div className="relative flex h-3 w-full items-center">
											<div className="h-1 w-full rounded-full bg-neutral-200/80 dark:bg-neutral-700/70" />
											{/* Lollipop stem */}
											<div
												className="absolute left-0 h-1.5 rounded-l-full transition-all duration-300"
												style={{
													width: `${pct}%`,
													backgroundColor: pt.color,
												}}
											/>
											{/* Lollipop dot node */}
											<div
												className="absolute h-3 w-3 -translate-x-1/2 rounded-full border-2 border-white shadow-xs dark:border-neutral-900"
												style={{
													left: `${pct}%`,
													backgroundColor: pt.color,
												}}
											/>
										</div>
									</div>
								}
							/>
							<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
								<span className="font-semibold">{pt.label}:</span>{" "}
								<span className="font-mono">{pt.formattedValue}</span>
							</TooltipContent>
						</Tooltip>
					);
				})}

				{/* X-Axis scale */}
				<div className="flex justify-between pt-0.5 font-mono text-[9.5px] text-neutral-400 tabular-nums">
					<span>0s</span>
					<span>{Math.round(maxSeconds / 2)}s</span>
					<span>{maxSeconds}s</span>
				</div>
			</div>
		</div>
	);
}

/**
 * 3. Zoomed-Domain Bullet Chart [85%..100%] — Ideal for High-Percentile Task Success Rate
 */
export function ChartZoomedBullet({
	points,
	minDomain = 90,
	maxDomain = 100,
	targetValue = 97,
	className,
}: {
	points: ChartSeriesPoint[];
	minDomain?: number;
	maxDomain?: number;
	targetValue?: number;
	className?: string;
}) {
	const span = maxDomain - minDomain || 10;
	const targetPct = Math.max(
		0,
		Math.min(100, ((targetValue - minDomain) / span) * 100),
	);

	return (
		<div className={cn("space-y-2.5 pt-1", className)}>
			{points.map((pt) => {
				const zoomedPct = Math.max(
					6,
					Math.min(100, ((pt.rawValue - minDomain) / span) * 100),
				);
				const dropOffRate = Math.max(0, 100 - pt.rawValue).toFixed(1);

				return (
					<Tooltip key={pt.key}>
						<TooltipTrigger
							render={
								<div className="space-y-1">
									<div className="flex items-center justify-between text-[11px]">
										<div className="flex items-center gap-1.5">
											<span
												className="h-2 w-2 rounded-[2px]"
												style={{ backgroundColor: pt.color }}
											/>
											<span className="font-medium text-neutral-700 dark:text-neutral-300">
												{pt.label}
											</span>
										</div>
										<div className="flex items-center gap-2 font-mono text-[11px] tabular-nums">
											<span className="text-[10px] text-rose-500/90">
												{dropOffRate}% drop
											</span>
											<span
												className={cn(
													pt.isWinner
														? "font-bold text-neutral-950 dark:text-white"
														: "font-medium text-neutral-600 dark:text-neutral-400",
												)}
											>
												{pt.formattedValue}
											</span>
										</div>
									</div>

									{/* Bullet bar with zoomed domain + target tick */}
									<div className="relative h-3 w-full overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
										{/* Qualitative high-zone shading */}
										<div
											style={{ left: `${targetPct}%` }}
											className="pointer-events-none absolute inset-y-0 right-0 bg-emerald-500/10"
										/>
										{/* Target threshold marker */}
										<div
											style={{ left: `${targetPct}%` }}
											className="pointer-events-none absolute inset-y-0 z-10 w-0.5 bg-neutral-400 dark:bg-neutral-500"
										/>
										{/* Actual score fill */}
										<div
											className="h-full rounded-sm transition-all duration-300"
											style={{
												width: `${zoomedPct}%`,
												backgroundColor: pt.color,
											}}
										/>
									</div>
								</div>
							}
						/>
						<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
							<span className="font-semibold">{pt.label}:</span>{" "}
							<span className="font-mono">
								{pt.formattedValue} success ({dropOffRate}% drop-off)
							</span>
						</TooltipContent>
					</Tooltip>
				);
			})}
			<div className="flex items-center justify-between font-mono text-[9.5px] text-neutral-400 tabular-nums">
				<span>{minDomain}%</span>
				<span>Target {targetValue}%</span>
				<span>{maxDomain}%</span>
			</div>
		</div>
	);
}

/**
 * 4. 7-Point Likert Interval Scale Gauge — Ideal for Single Ease Question (SEQ 1..7)
 */
export function ChartSeqLikertScale({
	points,
	className,
}: {
	points: ChartSeriesPoint[];
	className?: string;
}) {
	// Industry average SEQ is 5.5 on a 1..7 scale
	const avgPct = ((5.5 - 1) / 6) * 100;

	return (
		<div className={cn("space-y-2.5 pt-1.5", className)}>
			{/* 1..7 Segmented Spectrum Track */}
			<div className="relative pt-5 pb-2">
				{/* Industry Avg 5.5 Marker */}
				<div
					style={{ left: `${avgPct}%` }}
					className="pointer-events-none absolute top-0 bottom-1 -translate-x-1/2"
				>
					<span className="block -translate-x-1/2 font-mono text-[9px] text-neutral-400">
						Avg 5.5
					</span>
					<div className="mx-auto h-full w-px border-neutral-400 border-l border-dashed" />
				</div>

				{/* Colored qualitative spectrum bar */}
				<div className="grid h-2.5 w-full grid-cols-6 gap-0.5 overflow-hidden rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
					<div className="rounded-l-full bg-rose-300/60 dark:bg-rose-900/50" />
					<div className="bg-rose-200/60 dark:bg-rose-900/30" />
					<div className="bg-amber-200/70 dark:bg-amber-900/40" />
					<div className="bg-amber-100/80 dark:bg-amber-900/30" />
					<div className="bg-emerald-200/70 dark:bg-emerald-900/40" />
					<div className="rounded-r-full bg-emerald-300/80 dark:bg-emerald-800/60" />
				</div>

				{/* Plotted Flow Pins on 1..7 scale */}
				{points.map((pt, idx) => {
					const pct = Math.max(4, Math.min(98, ((pt.rawValue - 1) / 6) * 100));
					const overlapOffset = idx * -6;
					return (
						<Tooltip key={pt.key}>
							<TooltipTrigger
								render={
									<div
										style={{
											left: `${pct}%`,
											transform: `translateX(calc(-50% + ${overlapOffset}px))`,
										}}
										className="absolute top-3.5 z-10 flex cursor-pointer flex-col items-center"
									>
										<div
											style={{ backgroundColor: pt.color }}
											className="h-4 w-4 rounded-full border-2 border-white shadow-md transition-transform hover:scale-125 dark:border-neutral-900"
										/>
									</div>
								}
							/>
							<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
								<span className="font-semibold">{pt.label}:</span>{" "}
								<span className="font-mono">{pt.formattedValue}</span>
							</TooltipContent>
						</Tooltip>
					);
				})}

				{/* 1..7 Scale Ticks */}
				<div className="mt-2 flex justify-between font-mono text-[9.5px] text-neutral-400 tabular-nums">
					<span>1 (Hard)</span>
					<span>4 (Neutral)</span>
					<span>7 (Very Easy)</span>
				</div>
			</div>

			{/* Readout pills */}
			<div className="flex flex-wrap gap-1.5">
				{points.map((pt) => (
					<div
						key={pt.key}
						className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100/90 px-2 py-0.5 text-[11px] dark:bg-neutral-800"
					>
						<span
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: pt.color }}
						/>
						<span className="text-neutral-600 dark:text-neutral-400">
							{pt.label}:
						</span>
						<span
							className={cn(
								"font-mono tabular-nums",
								pt.isWinner
									? "font-bold text-neutral-950 dark:text-white"
									: "font-medium text-neutral-700 dark:text-neutral-300",
							)}
						>
							{pt.formattedValue}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}

/**
 * 5. Radial Ring Gauges — Ideal for UX Writing Assessment Score & Readability Grade
 */
export function ChartRadialGauges({
	points,
	className,
}: {
	points: ChartSeriesPoint[];
	className?: string;
}) {
	const radius = 20;
	const circumference = 2 * Math.PI * radius;

	return (
		<div
			className={cn(
				"grid gap-2 pt-1.5",
				points.length === 3 ? "grid-cols-3" : "grid-cols-2",
				className,
			)}
		>
			{points.map((pt) => {
				const strokeDashoffset =
					circumference - (pt.normalizedPercent / 100) * circumference;

				return (
					<Tooltip key={pt.key}>
						<TooltipTrigger
							render={
								<div
									className={cn(
										"flex flex-col items-center rounded-xl border p-2.5 text-center transition-colors",
										pt.isWinner
											? "border-neutral-300 bg-neutral-50/90 dark:border-neutral-700 dark:bg-neutral-800/60"
											: "border-neutral-200/70 bg-white dark:border-neutral-800 dark:bg-neutral-900",
									)}
								>
									<div className="relative flex h-13 w-13 items-center justify-center">
										<svg
											className="h-full w-full -rotate-90"
											viewBox="0 0 48 48"
											aria-hidden="true"
										>
											<circle
												cx="24"
												cy="24"
												r={radius}
												fill="none"
												stroke="currentColor"
												strokeWidth="4.5"
												className="text-neutral-100 dark:text-neutral-800"
											/>
											<circle
												cx="24"
												cy="24"
												r={radius}
												fill="none"
												stroke={pt.color}
												strokeWidth="4.5"
												strokeLinecap="round"
												strokeDasharray={circumference}
												strokeDashoffset={strokeDashoffset}
											/>
										</svg>
										<span className="absolute font-bold font-mono text-[11px] text-neutral-900 tabular-nums dark:text-white">
											{pt.formattedValue}
										</span>
									</div>
									<span className="mt-1 truncate font-semibold text-[11px] text-neutral-800 dark:text-neutral-200">
										{pt.label}
									</span>
									{pt.subLabel && (
										<span className="font-mono text-[9.5px] text-neutral-400">
											{pt.subLabel}
										</span>
									)}
								</div>
							}
						/>
						<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
							<span className="font-semibold">{pt.label}:</span>{" "}
							<span className="font-mono">
								{pt.formattedValue} ({pt.subLabel ?? "Microcopy clarity"})
							</span>
						</TooltipContent>
					</Tooltip>
				);
			})}
		</div>
	);
}

/**
 * 6 & 7. Shadcn-style Scorer & Distribution Bar Chart (matching the 0% - 50% - 100% reference chart)
 */
export function ChartScorerDistribution({
	points,
	axisLabels = ["0%", "50%", "100%"],
	mode = "distribution",
	className,
}: {
	points: ChartSeriesPoint[];
	axisLabels?: [string, string, string];
	mode?: "distribution" | "horizontal-bars";
	className?: string;
}) {
	if (mode === "horizontal-bars") {
		return (
			<div className={cn("space-y-2.5 pt-1", className)}>
				{points.map((pt) => (
					<Tooltip key={pt.key}>
						<TooltipTrigger
							render={
								<div className="group/bar cursor-default space-y-1">
									<div className="flex items-center justify-between text-[11px]">
										<div className="flex items-center gap-1.5">
											<span
												className="h-2 w-2 rounded-[2px]"
												style={{ backgroundColor: pt.color }}
											/>
											<span className="font-medium text-neutral-700 dark:text-neutral-300">
												{pt.label}
											</span>
										</div>
										<div className="flex items-center gap-1.5">
											{pt.subLabel && (
												<span className="rounded bg-neutral-100 px-1.5 py-0.2 font-mono text-[9.5px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
													{pt.subLabel}
												</span>
											)}
											<span
												className={cn(
													"font-mono text-[11px] tabular-nums",
													pt.isWinner
														? "font-bold text-neutral-950 dark:text-white"
														: "font-medium text-neutral-600 dark:text-neutral-400",
												)}
											>
												{pt.formattedValue}
											</span>
										</div>
									</div>
									<div className="h-2.5 w-full overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
										<div
											className="h-full rounded-sm transition-all duration-300 group-hover/bar:opacity-85"
											style={{
												width: `${Math.max(8, Math.min(100, pt.normalizedPercent))}%`,
												backgroundColor: pt.color,
											}}
										/>
									</div>
								</div>
							}
						/>
						<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
							<span className="font-semibold">{pt.label}:</span>{" "}
							<span className="font-mono">{pt.formattedValue}</span>
						</TooltipContent>
					</Tooltip>
				))}
			</div>
		);
	}

	return (
		<div className={cn("pt-2", className)}>
			{/* Vertical Distribution Plot (0% -- 50% -- 100%) */}
			<div className="relative h-12 w-full border-neutral-200 border-b dark:border-neutral-800">
				{/* Subtle grid tick marks at 0%, 50%, 100% */}
				<div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between">
					<span className="h-1.5 w-px bg-neutral-200 dark:bg-neutral-700" />
					<span className="h-1.5 w-px bg-neutral-200 dark:bg-neutral-700" />
					<span className="h-1.5 w-px bg-neutral-200 dark:bg-neutral-700" />
				</div>

				{/* Baseline tick indicator on left */}
				<div className="pointer-events-none absolute bottom-1 left-0 h-0.5 w-3 bg-neutral-400/70" />

				{/* Plotted vertical bars along the 0%..100% distribution axis */}
				{points.map((pt, idx) => {
					const clamped = Math.max(6, Math.min(96, pt.normalizedPercent));
					const sameBucketCount = points
						.slice(0, idx)
						.filter(
							(other) => Math.abs(other.normalizedPercent - clamped) < 7,
						).length;
					const offsetPx = sameBucketCount * -18;

					return (
						<Tooltip key={pt.key}>
							<TooltipTrigger
								render={
									<div
										style={{
											left: `${clamped}%`,
											transform: `translateX(calc(-50% + ${offsetPx}px))`,
										}}
										className="group/vbar absolute bottom-1 flex cursor-pointer flex-col items-center"
									>
										<div
											style={{
												backgroundColor: pt.color,
												height: pt.isWinner ? "34px" : "26px",
											}}
											className="w-3.5 rounded-[2px] shadow-2xs transition-transform duration-150 group-hover/vbar:scale-y-110"
										/>
									</div>
								}
							/>
							<TooltipContent className="rounded-md bg-neutral-900 px-2.5 py-1.5 text-[11px] text-white shadow-lg">
								<div className="flex items-center gap-1.5">
									<span
										className="h-2 w-2 rounded-full"
										style={{ backgroundColor: pt.color }}
									/>
									<span className="font-semibold">{pt.label}:</span>
									<span className="font-mono">{pt.formattedValue}</span>
								</div>
							</TooltipContent>
						</Tooltip>
					);
				})}
			</div>

			{/* Axis Labels (0%, 50%, 100%) */}
			<div className="mt-1.5 flex items-center justify-between font-mono text-[10px] text-neutral-400 tabular-nums">
				<span>{axisLabels[0]}</span>
				<span>{axisLabels[1]}</span>
				<span>{axisLabels[2]}</span>
			</div>

			{/* Compact value readout pills below chart */}
			<div className="mt-2 flex flex-wrap items-center gap-1.5">
				{points.map((pt) => (
					<div
						key={pt.key}
						className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100/90 px-2 py-0.5 text-[11px] dark:bg-neutral-800/80"
					>
						<span
							className="h-2 w-2 rounded-full"
							style={{ backgroundColor: pt.color }}
						/>
						<span className="text-neutral-600 dark:text-neutral-400">
							{pt.label}:
						</span>
						<span
							className={cn(
								"font-mono tabular-nums",
								pt.isWinner
									? "font-bold text-neutral-950 dark:text-white"
									: "font-medium text-neutral-700 dark:text-neutral-300",
							)}
						>
							{pt.formattedValue}
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
