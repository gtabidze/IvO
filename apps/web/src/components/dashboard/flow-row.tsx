import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import { useRef, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { ScreenMockup } from "./screen-mockup";

interface FlowRowProps {
	flow: DashboardFlow;
	onOpenPricing: () => void;
	onSelectFlowScreen?: (flow: DashboardFlow, screenIndex: number) => void;
}

export function FlowRow({
	flow,
	onOpenPricing,
	onSelectFlowScreen,
}: FlowRowProps) {
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	const checkScroll = () => {
		if (!scrollContainerRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
		setCanScrollLeft(scrollLeft > 20);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
	};

	const scroll = (direction: "left" | "right") => {
		if (!scrollContainerRef.current) return;
		const offset = direction === "left" ? -480 : 480;
		scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
	};

	return (
		<div className="group/row relative w-full py-6">
			{/* Screens Horizontal Scrollable Container */}
			<div className="relative">
				{/* Floating Left Arrow */}
				{canScrollLeft && (
					<button
						type="button"
						onClick={() => scroll("left")}
						className="absolute top-1/2 left-3 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 dark:bg-neutral-900/95 dark:text-white dark:ring-white/10"
						aria-label="Scroll left"
					>
						<ChevronLeft className="h-5 w-5" />
					</button>
				)}

				{/* Floating Right Arrow */}
				{canScrollRight && (
					<button
						type="button"
						onClick={() => scroll("right")}
						className="absolute top-1/2 right-3 z-30 flex h-10 w-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-[0_4px_16px_rgba(0,0,0,0.12)] ring-1 ring-black/5 backdrop-blur-xs transition-all hover:scale-105 active:scale-95 dark:bg-neutral-900/95 dark:text-white dark:ring-white/10"
						aria-label="Scroll right"
					>
						<ChevronRight className="h-5 w-5" />
					</button>
				)}

				{/* Horizontal Screens Track */}
				<div
					ref={scrollContainerRef}
					onScroll={checkScroll}
					className="scrollbar-none flex gap-4 overflow-x-auto scroll-smooth px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 lg:px-8 [&::-webkit-scrollbar]:hidden"
				>
					{flow.screens.map((screen, idx) => (
						<ScreenMockup
							key={screen.id}
							screen={screen}
							index={idx}
							appColor={flow.appColor}
							appName={flow.app}
							isLocked={flow.isLocked}
							onLockedClick={onOpenPricing}
							onScreenClick={(screenIdx) =>
								onSelectFlowScreen?.(flow, screenIdx)
							}
						/>
					))}
				</div>
			</div>

			{/* Flow Meta Footer */}
			<div className="mt-3 flex items-center justify-between px-4 sm:px-6 lg:px-8">
				<div className="flex items-center gap-2">
					<span className="font-semibold text-neutral-900 text-xs dark:text-white">
						{flow.flowLabel} in
					</span>
					<div className="flex items-center gap-1.5">
						<span
							style={{ backgroundColor: flow.appColor }}
							className="flex h-4 w-4 items-center justify-center rounded-sm font-bold text-[9px] text-white"
						>
							{flow.appLogoText}
						</span>
						<span className="font-semibold text-neutral-900 text-xs dark:text-white">
							{flow.app}
						</span>
					</div>
				</div>

				<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
					<span>{flow.screensCount} screens</span>
					{flow.isLocked && (
						<span className="flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-[11px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
							<Lock className="h-3 w-3" />
							Pro
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
