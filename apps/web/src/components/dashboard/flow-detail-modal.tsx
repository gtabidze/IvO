import {
	BarChart3,
	ChevronLeft,
	ChevronRight,
	Copy,
	Link2,
	MessageSquare,
	MoreHorizontal,
	Save,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { FlowSidebarPanel } from "./flow-sidebar-panel";
import { PrototypeCanvas } from "./prototype-canvas";
import { ScreenMockup } from "./screen-mockup";

interface FlowDetailModalProps {
	flow: DashboardFlow | null;
	initialScreenIndex?: number;
	open: boolean;
	onClose: () => void;
	onOpenPricing: () => void;
}

export function FlowDetailModal({
	flow,
	initialScreenIndex = 0,
	open,
	onClose,
	onOpenPricing,
}: FlowDetailModalProps) {
	const [viewMode, setViewMode] = useState<"screens" | "prototype">("screens");
	const [activeScreenIndex, setActiveScreenIndex] =
		useState(initialScreenIndex);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [sidebarTab, setSidebarTab] = useState<"usability" | "comments">(
		"usability",
	);

	const screensScrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	// Synchronize when initialScreenIndex or flow changes
	useEffect(() => {
		setActiveScreenIndex(initialScreenIndex);
		setViewMode("screens");
	}, [initialScreenIndex, flow?.id]);

	// Auto scroll to clicked screen
	useEffect(() => {
		if (open && viewMode === "screens" && screensScrollRef.current) {
			const targetChild = screensScrollRef.current.children[
				activeScreenIndex
			] as HTMLElement;
			if (targetChild) {
				targetChild.scrollIntoView({
					behavior: "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		}
	}, [open, viewMode, activeScreenIndex]);

	if (!open || !flow) return null;

	const checkScroll = () => {
		if (!screensScrollRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = screensScrollRef.current;
		setCanScrollLeft(scrollLeft > 20);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
	};

	const scrollScreens = (direction: "left" | "right") => {
		if (!screensScrollRef.current) return;
		const offset = direction === "left" ? -480 : 480;
		screensScrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
	};

	const handleCopyFlow = () => {
		const shareUrl = `${window.location.origin}/dashboard?flow=${flow.id}&step=${activeScreenIndex + 1}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success("Shareable flow link copied!", {
			description: `Link to ${flow.flowName} (Step ${activeScreenIndex + 1}) copied to clipboard.`,
		});
	};

	const handleSaveFlow = () => {
		toast.success(`Saved "${flow.flowName}" to your collection!`);
	};

	return (
		<div className="fade-in-0 fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-2 backdrop-blur-xs transition-all duration-200 sm:p-4 md:p-6">
			{/* Main Modal Shell */}
			<div
				className={`relative flex h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl border shadow-2xl transition-all duration-200 ${
					viewMode === "prototype"
						? "border-neutral-800 bg-[#141414] text-white"
						: "border-neutral-200/90 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
				}`}
			>
				{/* Top Modal Header Bar (Matches Screenshots 1, 2, 3) */}
				<header
					className={`flex h-15 shrink-0 items-center justify-between border-b px-5 transition-colors sm:px-6 ${
						viewMode === "prototype"
							? "border-neutral-800/90 bg-[#181818]"
							: "border-neutral-200/80 bg-white dark:border-neutral-800 dark:bg-neutral-900"
					}`}
				>
					{/* Left: Flow Name & App */}
					<div className="flex items-center gap-2.5">
						<span className="font-semibold text-neutral-500 text-xs dark:text-neutral-400">
							{flow.flowLabel} in
						</span>
						<div className="flex items-center gap-1.5">
							<span
								style={{ backgroundColor: flow.appColor }}
								className="flex h-5 w-5 items-center justify-center rounded-md font-bold text-[10px] text-white shadow-2xs"
							>
								{flow.appLogoText}
							</span>
							<span className="font-bold text-sm tracking-tight">
								{flow.app}
							</span>
						</div>
					</div>

					{/* Center: View Switcher Pill Toggle ([Screens] [Prototype]) */}
					<div
						className={`flex items-center rounded-full p-1 ring-1 ${
							viewMode === "prototype"
								? "bg-neutral-800 ring-neutral-700"
								: "bg-neutral-100 ring-neutral-200/70 dark:bg-neutral-800 dark:ring-neutral-700"
						}`}
					>
						<button
							type="button"
							onClick={() => setViewMode("screens")}
							className={`cursor-pointer rounded-full px-4 py-1 font-semibold text-xs transition-all ${
								viewMode === "screens"
									? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Screens
						</button>
						<button
							type="button"
							onClick={() => setViewMode("prototype")}
							className={`cursor-pointer rounded-full px-4 py-1 font-semibold text-xs transition-all ${
								viewMode === "prototype"
									? "bg-neutral-950 text-white shadow-xs dark:bg-neutral-900"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Prototype
						</button>
					</div>

					{/* Right: Collaborators, Telemetry, Comments, Share & Close */}
					<div className="flex items-center gap-2 sm:gap-2.5">
						{/* Viewers stack */}
						<div className="hidden items-center -space-x-1.5 pr-1 sm:flex">
							{[
								"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
								"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
							].map((url, i) => (
								<img
									key={i}
									src={url}
									alt="Viewer"
									className="h-6 w-6 rounded-full border border-white object-cover dark:border-neutral-900"
								/>
							))}
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-200 font-bold text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
								+30
							</span>
						</div>

						{/* Usability Telemetry Button */}
						<button
							type="button"
							onClick={() => {
								if (isSidebarOpen && sidebarTab === "usability") {
									setIsSidebarOpen(false);
								} else {
									setSidebarTab("usability");
									setIsSidebarOpen(true);
								}
							}}
							className={`relative flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 font-semibold text-xs transition-all ${
								isSidebarOpen && sidebarTab === "usability"
									? "bg-blue-600 text-white shadow-xs"
									: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
							}`}
							aria-label="Usability telemetry"
						>
							<BarChart3 className="h-4 w-4" />
							<span className="hidden font-mono text-[11px] sm:inline">
								{flow.seqScore}
							</span>
						</button>

						{/* Comments Drawer Button */}
						<button
							type="button"
							onClick={() => {
								if (isSidebarOpen && sidebarTab === "comments") {
									setIsSidebarOpen(false);
								} else {
									setSidebarTab("comments");
									setIsSidebarOpen(true);
								}
							}}
							className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
								isSidebarOpen && sidebarTab === "comments"
									? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
									: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
							}`}
							aria-label="Toggle comments"
						>
							<MessageSquare className="h-4 w-4" />
							{flow.initialComments?.length > 0 && (
								<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
							)}
						</button>

						{/* Copy Flow Link */}
						<button
							type="button"
							onClick={handleCopyFlow}
							className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
							aria-label="Copy flow share link"
						>
							<Link2 className="h-4 w-4" />
						</button>

						{/* Close Dialog (X) */}
						<button
							type="button"
							onClick={onClose}
							className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
							aria-label="Close dialog"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</header>

				{/* Middle Body Area (Screens / Prototype Canvas + Optional Right Sidebar) */}
				<div className="relative flex flex-1 overflow-hidden">
					{/* Main View Area */}
					{viewMode === "screens" ? (
						<div className="relative flex flex-1 flex-col justify-between overflow-hidden bg-neutral-50/50 p-6 dark:bg-neutral-950/50">
							{/* Floating Screen Scroll Controls */}
							{canScrollLeft && (
								<button
									type="button"
									onClick={() => scrollScreens("left")}
									className="absolute top-1/2 left-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white"
									aria-label="Scroll left"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
							)}

							{canScrollRight && (
								<button
									type="button"
									onClick={() => scrollScreens("right")}
									className="absolute top-1/2 right-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white"
									aria-label="Scroll right"
								>
									<ChevronRight className="h-6 w-6" />
								</button>
							)}

							{/* Horizontal Screens Carousel */}
							<div
								ref={screensScrollRef}
								onScroll={checkScroll}
								className="scrollbar-none my-auto flex gap-6 overflow-x-auto scroll-smooth px-4 py-6 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
							>
								{flow.screens.map((screen, idx) => (
									<ScreenMockup
										key={screen.id}
										screen={screen}
										index={idx}
										appColor={flow.appColor}
										appName={flow.app}
										isLocked={flow.isLocked}
										isSelected={idx === activeScreenIndex}
										onLockedClick={onOpenPricing}
										onScreenClick={(clickedIdx) =>
											setActiveScreenIndex(clickedIdx)
										}
									/>
								))}
							</div>

							{/* Bottom Floating Bar (Matches Screenshot 1 & 3) */}
							<div className="flex w-full items-center justify-between pt-2">
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={handleSaveFlow}
										className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 font-semibold text-white text-xs shadow-sm hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-950"
									>
										<Save className="h-3.5 w-3.5" />
										<span>Save</span>
									</button>

									<button
										type="button"
										onClick={handleCopyFlow}
										className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 font-semibold text-neutral-800 text-xs shadow-2xs hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
									>
										<Copy className="h-3.5 w-3.5" />
										<span>Copy</span>
									</button>

									<button
										type="button"
										onClick={() =>
											toast.info("Export options: Export to Figma, PDF, JSON")
										}
										className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-300 bg-white text-neutral-800 shadow-2xs hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
										aria-label="More options"
									>
										<MoreHorizontal className="h-4 w-4" />
									</button>
								</div>

								{/* Spec & More info */}
								<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
									<span>iOS (375x812)</span>
									<button
										type="button"
										onClick={() =>
											toast.info("Native iOS Retina capture • 60fps teardown")
										}
										className="cursor-pointer font-medium underline hover:text-neutral-900 dark:hover:text-white"
									>
										More info
									</button>
								</div>
							</div>
						</div>
					) : (
						/* Prototype Canvas Mode (Screenshot 2) */
						<PrototypeCanvas
							flow={flow}
							currentStep={activeScreenIndex}
							onStepChange={setActiveScreenIndex}
						/>
					)}

					{/* Right Side Panel (Usability Evals & Comments) */}
					{isSidebarOpen && (
						<FlowSidebarPanel
							flow={flow}
							activeTab={sidebarTab}
							onTabChange={setSidebarTab}
							onClose={() => setIsSidebarOpen(false)}
							activeScreenIndex={activeScreenIndex}
						/>
					)}
				</div>
			</div>
		</div>
	);
}
