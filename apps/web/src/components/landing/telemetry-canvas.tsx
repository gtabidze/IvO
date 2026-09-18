import { useState } from "react";

interface TelemetryPoint {
	id: number;
	type: "tick" | "dot" | "star" | "tall";
	app: string;
	action: string;
	latency: string;
	successRate: string;
	friction: "low" | "medium" | "high";
}

const SAMPLE_TELEMETRY: TelemetryPoint[] = [
	{
		id: 1,
		type: "tick",
		app: "Revolut",
		action: "NFC Passport Chip Scan",
		latency: "1.2s",
		successRate: "98.4%",
		friction: "low",
	},
	{
		id: 2,
		type: "dot",
		app: "Monzo",
		action: "Instant Overdraft Slider",
		latency: "0.4s",
		successRate: "99.1%",
		friction: "low",
	},
	{
		id: 3,
		type: "tick",
		app: "Robinhood",
		action: "Margin Agreement Sign",
		latency: "3.8s",
		successRate: "88.2%",
		friction: "medium",
	},
	{
		id: 4,
		type: "star",
		app: "Polymarket",
		action: "Gasless Relayer Order",
		latency: "0.3s",
		successRate: "96.5%",
		friction: "low",
	},
	{
		id: 5,
		type: "tall",
		app: "Mercury",
		action: "Treasury Sweep Activation",
		latency: "0.6s",
		successRate: "99.8%",
		friction: "low",
	},
	{
		id: 6,
		type: "tick",
		app: "Ramp",
		action: "Virtual Card Push to Apple Pay",
		latency: "0.8s",
		successRate: "99.0%",
		friction: "low",
	},
	{
		id: 7,
		type: "dot",
		app: "Stripe",
		action: "Plaid Instant Micro-Deposit",
		latency: "2.1s",
		successRate: "94.7%",
		friction: "medium",
	},
	{
		id: 8,
		type: "tick",
		app: "eToro",
		action: "CopyTrader Stop-Loss Adjust",
		latency: "0.7s",
		successRate: "97.3%",
		friction: "low",
	},
	{
		id: 9,
		type: "tall",
		app: "Coinbase",
		action: "State ID Selfie Liveness",
		latency: "2.8s",
		successRate: "91.2%",
		friction: "medium",
	},
	{
		id: 10,
		type: "star",
		app: "Wise",
		action: "SEPA Instant Rail Routing",
		latency: "0.5s",
		successRate: "99.4%",
		friction: "low",
	},
	{
		id: 11,
		type: "tick",
		app: "Brex",
		action: "Multi-Entity Limit Allocation",
		latency: "1.1s",
		successRate: "98.1%",
		friction: "low",
	},
	{
		id: 12,
		type: "dot",
		app: "Cash App",
		action: "Bitcoin Lightning Invoice Pay",
		latency: "0.4s",
		successRate: "98.9%",
		friction: "low",
	},
];

export default function TelemetryCanvas() {
	const [activePoint, setActivePoint] = useState<TelemetryPoint | null>(
		SAMPLE_TELEMETRY[0],
	);
	const [hoverIndex, setHoverIndex] = useState<number | null>(null);

	const totalColumns = 72;

	return (
		<div className="relative my-2 w-full select-none overflow-hidden py-6">
			{/* Active Telemetry Inspection Tooltip / Pill */}
			<div className="mb-4 flex min-h-[36px] items-center justify-center">
				{activePoint ? (
					<div className="fade-in inline-flex animate-in items-center gap-3 rounded-full border border-neutral-700/60 bg-neutral-900 px-3.5 py-1.5 font-mono text-white text-xs shadow-md duration-150">
						<span className="flex items-center gap-1.5 font-semibold text-blue-400">
							<span className="h-2 w-2 animate-ping rounded-full bg-blue-500" />
							{activePoint.app}
						</span>
						<span className="text-neutral-300">{activePoint.action}</span>
						<span className="text-neutral-500">•</span>
						<span className="font-medium text-emerald-400">
							{activePoint.latency}
						</span>
						<span className="text-neutral-500">•</span>
						<span className="text-neutral-300">
							{activePoint.successRate} success
						</span>
					</div>
				) : (
					<div className="font-mono text-neutral-600 text-xs">
						Hover across the telemetry stream to inspect flow spans
					</div>
				)}
			</div>

			{/* Rhythmic Matrix Grid */}
			<div className="relative mx-auto max-w-6xl px-4">
				<div
					className="group flex h-28 cursor-crosshair items-center justify-between gap-[3px] sm:gap-[5px]"
					role="img"
					aria-label="Interactive flow telemetry barcode visualization"
				>
					{Array.from({ length: totalColumns }).map((_, colIdx) => {
						// Deterministic rhythm matching Braintrust pattern
						const isSpecial = colIdx % 6 === 0;
						const isDot = colIdx % 11 === 3;
						const isStar = colIdx % 17 === 7;
						const isTall = colIdx % 7 === 1;
						const heightClass = isTall
							? "h-20"
							: isSpecial
								? "h-14"
								: colIdx % 2 === 0
									? "h-8"
									: "h-5";

						const matchedTelemetry =
							SAMPLE_TELEMETRY[colIdx % SAMPLE_TELEMETRY.length];

						return (
							<button
								key={colIdx}
								type="button"
								onMouseEnter={() => {
									setActivePoint(matchedTelemetry);
									setHoverIndex(colIdx);
								}}
								onFocus={() => {
									setActivePoint(matchedTelemetry);
									setHoverIndex(colIdx);
								}}
								aria-label={`Inspect ${matchedTelemetry.app} telemetry: ${matchedTelemetry.action}`}
								className="flex h-full w-full cursor-crosshair flex-col items-center justify-center border-0 bg-transparent p-0 py-2 transition-opacity hover:opacity-100 focus:outline-none"
							>
								{isStar ? (
									<div className="transform font-bold text-[#0052ff] text-[11px] leading-none transition-transform hover:scale-150">
										✦
									</div>
								) : isDot ? (
									<div className="h-2.5 w-2.5 rounded-full bg-[#0052ff] shadow-[0_0_8px_rgba(0,82,255,0.4)] transition-transform hover:scale-150" />
								) : (
									<div
										className={`w-[2px] rounded-full bg-[#0052ff] transition-all duration-150 ${
											hoverIndex === colIdx
												? "h-24 scale-y-110 bg-blue-400 shadow-[0_0_12px_rgba(0,82,255,0.8)]"
												: `${heightClass} opacity-85 hover:opacity-100`
										}`}
									/>
								)}
							</button>
						);
					})}
				</div>

				{/* Subtle background glow effect behind the telemetry stream */}
				<div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/0 via-blue-500/[0.03] to-blue-500/0 blur-2xl" />
			</div>
		</div>
	);
}
