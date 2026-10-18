import { useState } from "react";

interface AgentCheck {
	id: string;
	type: "pass" | "fail";
	text: string;
}

interface MatrixItem {
	type: "tick" | "dot" | "star" | "arrow" | "scan";
	height?: "sm" | "md" | "lg";
	check?: AgentCheck;
}

// 7 distinct rhythm rows modeled on the reference
// ONLY Row 0 (1st) and Row 2 (3rd) move. Rows 1, 3, 4, 5, 6 are completely static.
const ROWS_CONFIG: {
	isMoving: boolean;
	direction?: "left" | "right";
	speedSeconds?: number;
	items: MatrixItem[];
}[] = [
	// Row 0 (1st row) -> MOVES (drifts left)
	{
		isMoving: true,
		direction: "left",
		speedSeconds: 54,
		items: [
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "star" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{
				type: "dot",
				check: {
					id: "check-speed",
					type: "pass",
					text: "Sub-second token latency verified: 28ms",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "arrow" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "star" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
		],
	},
	// Row 1 (2nd row) -> STATIC (does NOT move)
	{
		isMoving: false,
		items: [
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{
				type: "dot",
				check: {
					id: "check-wrong-item",
					type: "fail",
					text: "Wrong item recommended",
				},
			},
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{
				type: "dot",
				check: {
					id: "check-kyc",
					type: "pass",
					text: "KYC biometric verification confirmed",
				},
			},
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "arrow" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "sm" },
		],
	},
	// Row 2 (3rd row) -> MOVES (drifts right)
	{
		isMoving: true,
		direction: "right",
		speedSeconds: 46,
		items: [
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{
				type: "scan",
				check: {
					id: "check-eval-range",
					type: "pass",
					text: "Evaluation range: 100% parity",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{
				type: "dot",
				check: {
					id: "check-discount",
					type: "fail",
					text: "Hallucinated promo code caught",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "arrow" },
			{ type: "tick", height: "sm" },
		],
	},
	// Row 3 (4th row) -> STATIC (does NOT move)
	{
		isMoving: false,
		items: [
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{
				type: "dot",
				check: {
					id: "check-refund",
					type: "pass",
					text: "Proper refund processed",
				},
			},
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "arrow" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{
				type: "dot",
				check: {
					id: "check-friction",
					type: "fail",
					text: "High friction drop-off detected",
				},
			},
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
		],
	},
	// Row 4 (5th row) -> STATIC (does NOT move)
	{
		isMoving: false,
		items: [
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{
				type: "dot",
				check: {
					id: "check-shipping",
					type: "pass",
					text: "Shipping address schema validated",
				},
			},
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "sm" },
			{ type: "arrow" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
		],
	},
	// Row 5 (6th row) -> STATIC (does NOT move)
	{
		isMoving: false,
		items: [
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "arrow" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{
				type: "dot",
				check: {
					id: "check-idempotency",
					type: "pass",
					text: "Order idempotency guaranteed",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "md" },
			{
				type: "dot",
				check: {
					id: "check-timeout",
					type: "fail",
					text: "Payment step timeout prevented",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
		],
	},
	// Row 6 (7th row) -> STATIC (does NOT move)
	{
		isMoving: false,
		items: [
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "star" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "md" },
			{
				type: "dot",
				check: {
					id: "check-cache",
					type: "pass",
					text: "Zero-latency cache hit: 18ms",
				},
			},
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "lg" },
			{ type: "tick", height: "sm" },
			{ type: "arrow" },
			{ type: "tick", height: "md" },
			{ type: "tick", height: "sm" },
			{ type: "tick", height: "sm" },
		],
	},
];

export default function AgentStreamMatrix() {
	const [activeUniqueKey, setActiveUniqueKey] = useState<string | null>(null);

	const renderGlyph = (item: MatrixItem, uniqueKey: string) => {
		const isHovered = item.check && activeUniqueKey === uniqueKey;

		if (item.type === "scan") {
			return (
				<div
					key={uniqueKey}
					onMouseEnter={() => {
						if (item.check) setActiveUniqueKey(uniqueKey);
					}}
					onMouseLeave={() => setActiveUniqueKey(null)}
					className="group relative flex cursor-pointer items-center py-2"
				>
					{/* Blue circle + horizontal scan bar from Image 3 */}
					<div className="flex items-center">
						<div className="h-2.5 w-2.5 rounded-full bg-[#2825fe] shadow-[0_0_8px_rgba(40,37,254,0.45)] transition-transform duration-200 group-hover:scale-125" />
						<div className="h-3 w-8 rounded-sm bg-[#2825fe] transition-all duration-300 group-hover:w-14" />
					</div>

					{/* Tooltip badge ONLY on hover */}
					{item.check && isHovered && (
						<div className="fade-in zoom-in-95 pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 animate-in whitespace-nowrap duration-150">
							<div className="flex items-center gap-1.5 rounded-full border border-emerald-900/60 bg-[#062e20] px-3.5 py-1 font-mono font-medium text-[11px] text-[#4ade80] shadow-2xl sm:text-xs">
								<span className="text-[10px] text-lime-400">▲</span>
								<span>{item.check.text}</span>
							</div>
						</div>
					)}
				</div>
			);
		}

		if (item.type === "dot") {
			const isFail = item.check?.type === "fail";
			return (
				<div
					key={uniqueKey}
					onMouseEnter={() => {
						if (item.check) setActiveUniqueKey(uniqueKey);
					}}
					onMouseLeave={() => setActiveUniqueKey(null)}
					className="group relative flex cursor-pointer items-center justify-center py-2"
				>
					{/* Dot */}
					<div
						className={`h-2.5 w-2.5 rounded-full bg-[#2825fe] transition-all duration-200 ${
							isHovered
								? "scale-140 shadow-[0_0_12px_rgba(40,37,254,0.7)] ring-4 ring-blue-500/20"
								: "shadow-[0_0_6px_rgba(40,37,254,0.35)] hover:scale-125"
						}`}
					/>

					{/* Agent Check Pill Badge (ONLY on hover) */}
					{item.check && isHovered && (
						<div className="fade-in zoom-in-95 pointer-events-none absolute top-full left-1/2 z-50 mt-2 -translate-x-1/2 animate-in whitespace-nowrap duration-150">
							{isFail ? (
								// Image 2: Plum/Maroon pill with downward pink triangle
								<div className="flex items-center gap-1.5 rounded-full border border-[#521727] bg-[#3c121e] px-3.5 py-1 font-mono font-medium text-[11px] text-[#fda4af] shadow-2xl sm:text-xs">
									<span className="text-[9px] text-rose-400">▼</span>
									<span>{item.check.text}</span>
								</div>
							) : (
								// Image 4: Dark green pill with upward lime triangle
								<div className="flex items-center gap-1.5 rounded-full border border-[#0d4a34] bg-[#062e20] px-3.5 py-1 font-mono font-medium text-[11px] text-[#4ade80] shadow-2xl sm:text-xs">
									<span className="text-[9px] text-lime-400">▲</span>
									<span>{item.check.text}</span>
								</div>
							)}
						</div>
					)}
				</div>
			);
		}

		if (item.type === "star") {
			return (
				<div
					key={uniqueKey}
					className="flex cursor-default items-center justify-center font-bold text-[#2825fe] text-xs transition-transform duration-150 hover:scale-135"
				>
					✦
				</div>
			);
		}

		if (item.type === "arrow") {
			return (
				<div
					key={uniqueKey}
					className="flex cursor-default items-center justify-center font-bold text-[#2825fe] text-xs transition-transform duration-150 hover:scale-135"
				>
					↗
				</div>
			);
		}

		// Standard vertical tick
		const heightMap = {
			sm: "h-3.5 sm:h-4",
			md: "h-4.5 sm:h-5",
			lg: "h-6 sm:h-7",
		};
		const tickHeight = heightMap[item.height || "md"];

		return (
			<div
				key={uniqueKey}
				className={`w-[2px] rounded-[1px] bg-[#2825fe] transition-all duration-150 hover:scale-y-125 hover:bg-blue-600 sm:w-[2.5px] ${tickHeight} opacity-90 hover:opacity-100`}
			/>
		);
	};

	return (
		<section
			aria-label="Real-time agent checks and telemetry matrix"
			className="relative w-full overflow-hidden border-neutral-100 border-b bg-white select-none"
			onMouseLeave={() => {
				setActiveUniqueKey(null);
			}}
		>
			<style>{`
				@keyframes agentStreamLeft {
					0% { transform: translate3d(0, 0, 0); }
					100% { transform: translate3d(-50%, 0, 0); }
				}
				@keyframes agentStreamRight {
					0% { transform: translate3d(-50%, 0, 0); }
					100% { transform: translate3d(0, 0, 0); }
				}
				.animate-stream-left {
					animation: agentStreamLeft linear infinite;
				}
				.animate-stream-right {
					animation: agentStreamRight linear infinite;
				}
			`}</style>

			{/* Full-width matrix container with edge fade masks */}
			<div
				className="relative w-full overflow-hidden"
				style={{
					maskImage:
						"linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
					WebkitMaskImage:
						"linear-gradient(to right, transparent 0%, black 5%, black 95%, transparent 100%)",
				}}
			>
				{/* 7 Rhythm Rows */}
				<div className="flex flex-col gap-3 py-6 sm:gap-4 sm:py-8">
					{ROWS_CONFIG.map((row, rowIdx) => {
						// Moving row (Row 0 or Row 2)
						if (row.isMoving) {
							const animClass =
								row.direction === "left"
									? "animate-stream-left"
									: "animate-stream-right";

							return (
								<div
									key={rowIdx}
									className="relative flex h-8 items-center overflow-visible sm:h-9"
								>
									{/* Infinite marquee track */}
									<div
										className={`flex items-center gap-4 sm:gap-6 ${animClass}`}
										style={{
											animationDuration: `${row.speedSeconds}s`,
											willChange: "transform",
										}}
									>
										{/* Segment 1 */}
										<div className="flex items-center gap-4 sm:gap-6">
											{row.items.map((item, itemIdx) =>
												renderGlyph(item, `r${rowIdx}-s1-${itemIdx}`),
											)}
										</div>
										{/* Segment 2 (seamless loop duplicate) */}
										<div className="flex items-center gap-4 sm:gap-6">
											{row.items.map((item, itemIdx) =>
												renderGlyph(item, `r${rowIdx}-s2-${itemIdx}`),
											)}
										</div>
										{/* Segment 3 (ultra-wide screen coverage) */}
										<div className="flex items-center gap-4 sm:gap-6">
											{row.items.map((item, itemIdx) =>
												renderGlyph(item, `r${rowIdx}-s3-${itemIdx}`),
											)}
										</div>
										{/* Segment 4 (4K coverage) */}
										<div className="flex items-center gap-4 sm:gap-6">
											{row.items.map((item, itemIdx) =>
												renderGlyph(item, `r${rowIdx}-s4-${itemIdx}`),
											)}
										</div>
									</div>
								</div>
							);
						}

						// Static row (Row 1, 3, 4, 5, 6) -> Completely still, no animation!
						return (
							<div
								key={rowIdx}
								className="relative flex h-8 items-center justify-center overflow-visible sm:h-9"
							>
								<div className="flex items-center justify-center gap-4 sm:gap-6">
									{/* Segment 1 */}
									<div className="flex items-center gap-4 sm:gap-6">
										{row.items.map((item, itemIdx) =>
											renderGlyph(item, `static-r${rowIdx}-s1-${itemIdx}`),
										)}
									</div>
									{/* Segment 2 to comfortably fill wide screens */}
									<div className="flex items-center gap-4 sm:gap-6">
										{row.items.map((item, itemIdx) =>
											renderGlyph(item, `static-r${rowIdx}-s2-${itemIdx}`),
										)}
									</div>
									{/* Segment 3 */}
									<div className="hidden items-center gap-4 sm:gap-6 lg:flex">
										{row.items.map((item, itemIdx) =>
											renderGlyph(item, `static-r${rowIdx}-s3-${itemIdx}`),
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
