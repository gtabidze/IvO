import {
	Camera,
	ChevronLeft,
	ChevronRight,
	RotateCcw,
	Wifi,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DashboardFlow } from "@/data/dashboard-flows";

interface MobilePrototypeDeviceProps {
	flow: DashboardFlow;
	currentStep: number;
	onStepChange: (step: number) => void;
	isCompared?: boolean;
	onRemove?: () => void;
}

export function MobilePrototypeDevice({
	flow,
	currentStep,
	onStepChange,
	isCompared = false,
	onRemove,
}: MobilePrototypeDeviceProps) {
	const [hotspotHint, setHotspotHint] = useState(false);

	const totalSteps = flow.screens.length;
	const safeIndex = Math.min(Math.max(0, currentStep), totalSteps - 1);
	const screen = flow.screens[safeIndex] || flow.screens[0];
	const details = screen?.wireframeDetails;

	const handleAdvance = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (safeIndex < totalSteps - 1) {
			onStepChange(safeIndex + 1);
		} else {
			toast.success(`Completed ${flow.app} prototype!`, {
				description: "You've reached the end of this user flow.",
			});
		}
	};

	const handlePrevious = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (safeIndex > 0) {
			onStepChange(safeIndex - 1);
		}
	};

	const handleReset = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		onStepChange(0);
		toast.info(`Reset ${flow.app} to Step 1`);
	};

	const handleCanvasClick = () => {
		setHotspotHint(true);
		setTimeout(() => setHotspotHint(false), 500);
	};

	return (
		<div className="flex flex-col items-center">
			{/* Top Header: App Branding (Icon at top) + Screen Title & Step Number */}
			<div className="mb-2.5 flex w-[250px] flex-col gap-1.5 px-1 sm:w-[270px]">
				{/* Row 1: App Icon & Name */}
				<div className="flex items-center justify-between">
					<div className="flex min-w-0 items-center gap-2">
						{flow.appLogoUrl ? (
							<img
								src={flow.appLogoUrl}
								alt={flow.app}
								className="h-5 w-5 shrink-0 rounded-md object-cover shadow-2xs"
							/>
						) : (
							<span
								style={{ backgroundColor: flow.appColor }}
								className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-bold text-[10px] text-white shadow-2xs"
							>
								{flow.appLogoText}
							</span>
						)}
						<span className="truncate font-semibold text-neutral-900 text-xs sm:text-sm dark:text-white">
							{flow.app}
						</span>
					</div>

					{isCompared && onRemove && (
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onRemove();
							}}
							className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
							title={`Remove ${flow.app} comparison`}
							aria-label={`Remove ${flow.app} comparison`}
						>
							<X className="h-3.5 w-3.5" />
						</button>
					)}
				</div>

				{/* Row 2: Screen Title & Step Counter */}
				<div className="flex items-center justify-between gap-2 text-xs">
					<span
						className="truncate font-semibold text-neutral-800 dark:text-neutral-200"
						title={screen.title}
					>
						{screen.title}
					</span>
					<span className="shrink-0 font-mono text-[11px] text-neutral-400 dark:text-neutral-500">
						{safeIndex + 1} of {totalSteps}
					</span>
				</div>
			</div>

			{/* iPhone Mobile Frame */}
			{/* biome-ignore lint/a11y/noStaticElementInteractions: flash hotspot hint on unhandled clicks */}
			<div
				onClick={handleCanvasClick}
				className={`relative flex h-[530px] w-[250px] select-none flex-col justify-between overflow-hidden rounded-[2.4rem] border-[5px] border-neutral-900 shadow-[0_20px_50px_rgba(0,0,0,0.12)] ring-1 ring-black/10 transition-all sm:h-[575px] sm:w-[270px] sm:rounded-[2.6rem] dark:border-neutral-800 dark:shadow-[0_20px_60px_rgba(0,0,0,0.6)] dark:ring-white/10 ${
					screen.isDark
						? "bg-black text-white"
						: "bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white"
				} ${hotspotHint ? "ring-4 ring-blue-500/80" : ""}`}
			>
				{screen.imageUrl ? (
					<button
						type="button"
						onClick={handleAdvance}
						className="relative flex h-full w-full cursor-pointer items-center justify-center overflow-hidden bg-transparent p-0"
						aria-label={`Advance from ${screen.title}`}
					>
						<img
							src={screen.imageUrl}
							alt={`${flow.app} - ${screen.title}`}
							draggable={false}
							className="h-full w-full select-none object-contain object-top"
						/>
					</button>
				) : (
					<>
						{/* Top Status Bar */}
						<div
							className={`flex h-10 w-full select-none items-center justify-between px-7 pt-2 font-semibold text-[11px] ${
								screen.isDark
									? "bg-neutral-950 text-white"
									: "bg-white text-neutral-900"
							}`}
						>
							<span>9:41</span>
							{/* Dynamic Island */}
							<div className="h-3.5 w-18 rounded-full bg-neutral-900 dark:bg-neutral-800" />
							<div className="flex items-center gap-1.5 opacity-80">
								<Wifi className="h-3 w-3" />
								<div className="h-2.5 w-4 rounded-xs border border-current p-0.5">
									<div className="h-full w-full rounded-2xs bg-current" />
								</div>
							</div>
						</div>

						{/* Screen Content Wireframes */}
						<div
							className={`relative flex flex-1 flex-col px-5 pt-5 pb-3 ${
								screen.isDark
									? "bg-neutral-950 text-white"
									: "bg-white text-neutral-900"
							}`}
						>
							{screen.screenType === "splash" && (
								<div className="flex flex-1 flex-col items-center justify-center text-center">
									<div
										style={{ backgroundColor: flow.appColor }}
										className="flex h-16 w-16 items-center justify-center rounded-2xl font-black text-3xl text-white shadow-lg"
									>
										{flow.app.charAt(0)}
									</div>
									<h3 className="mt-5 font-bold text-2xl tracking-tight">
										{details?.headlineText || flow.app}
									</h3>
									<p className="mt-1.5 px-2 text-neutral-400 text-xs">
										{details?.subText || "Tap to begin user journey"}
									</p>

									<button
										type="button"
										onClick={handleAdvance}
										className={`mt-8 w-full cursor-pointer rounded-xl bg-neutral-900 py-3 font-semibold text-white text-xs shadow-md transition-all ${
											hotspotHint ? "animate-pulse ring-4 ring-blue-500/80" : ""
										}`}
									>
										{details?.buttonText || "Get Started"}
									</button>
								</div>
							)}

							{screen.screenType === "welcome" && (
								<div className="flex flex-1 flex-col justify-between py-2">
									<div className="space-y-2">
										<span className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
											{details?.headerText || flow.app}
										</span>
										<h3 className="font-extrabold text-lg uppercase leading-tight tracking-tight">
											{details?.headlineText}
										</h3>
										<p className="text-neutral-400 text-xs leading-relaxed">
											{details?.subText}
										</p>
									</div>

									<div className="my-auto flex h-36 w-full items-center justify-center rounded-2xl bg-neutral-100/10 p-4 ring-1 ring-white/10">
										<div className="relative flex h-24 w-24 items-center justify-center rounded-full border border-neutral-700/50 bg-neutral-800/60 shadow-inner">
											<div
												style={{ borderColor: flow.appColor }}
												className="h-16 w-16 animate-spin rounded-full border-2 border-dashed duration-10000"
											/>
											<span className="absolute font-bold font-mono text-sm">
												{flow.app.charAt(0)}
											</span>
										</div>
									</div>

									<button
										type="button"
										onClick={handleAdvance}
										className={`w-full cursor-pointer rounded-xl bg-white py-3 font-semibold text-neutral-950 text-xs shadow-md transition-all ${
											hotspotHint ? "animate-pulse ring-4 ring-blue-500/80" : ""
										}`}
									>
										{details?.buttonText || "Continue"}
									</button>
								</div>
							)}

							{screen.screenType === "phone-input" && (
								<div className="flex flex-1 flex-col justify-between py-2">
									<div>
										<span className="font-semibold text-neutral-400 text-xs">
											{details?.headerText}
										</span>
										<h3 className="mt-1 font-bold text-base text-neutral-900 dark:text-white">
											{details?.headlineText}
										</h3>
										<p className="mt-1 text-neutral-500 text-xs">
											{details?.subText}
										</p>

										<div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-xs dark:border-neutral-800 dark:bg-neutral-800">
											<span className="rounded-md bg-white px-2 py-0.5 font-bold text-xs shadow-2xs dark:bg-neutral-700">
												🇸🇬 +65
											</span>
											<span className="font-mono font-semibold text-neutral-900 text-sm dark:text-neutral-100">
												9036 6027
											</span>
										</div>
									</div>

									<div className="grid grid-cols-3 gap-2 border-neutral-100 border-t pt-3 text-center dark:border-neutral-800">
										{[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((k) => (
											<button
												key={k}
												type="button"
												onClick={handleAdvance}
												className="cursor-pointer rounded-xl bg-neutral-100/80 py-2 font-medium text-neutral-800 text-xs transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
											>
												{k}
											</button>
										))}
									</div>

									<button
										type="button"
										onClick={handleAdvance}
										style={{ backgroundColor: flow.appColor }}
										className={`w-full cursor-pointer rounded-xl py-2.5 font-semibold text-white text-xs shadow-xs ${
											hotspotHint ? "animate-pulse ring-4 ring-blue-500/80" : ""
										}`}
									>
										{details?.buttonText || "Sign up"}
									</button>
								</div>
							)}

							{screen.screenType === "otp" && (
								<div className="flex flex-1 flex-col justify-between py-2">
									<div>
										<span className="font-semibold text-neutral-400 text-xs">
											{details?.headerText}
										</span>
										<h3 className="mt-1 font-bold text-base text-neutral-900 dark:text-white">
											{details?.headlineText}
										</h3>
										<p className="mt-1 text-neutral-500 text-xs">
											{details?.subText}
										</p>

										<div className="mt-6 flex justify-between gap-2">
											{[6, 4, 2, 8, "•", "•"].map((char, i) => (
												<div
													key={i}
													className={`flex h-11 w-9 items-center justify-center rounded-xl border font-bold text-sm ${
														i < 4
															? "border-neutral-900 bg-white text-neutral-900 dark:border-white dark:bg-neutral-800 dark:text-white"
															: "border-neutral-200 bg-neutral-50 text-neutral-400 dark:border-neutral-800 dark:bg-neutral-900"
													}`}
												>
													{char}
												</div>
											))}
										</div>
									</div>

									<div className="grid grid-cols-3 gap-2 border-neutral-100 border-t pt-3 text-center dark:border-neutral-800">
										{[1, 2, 3, 4, 5, 6, 7, 8, 9, "", 0, "⌫"].map((k, i) => (
											<button
												key={i}
												type="button"
												onClick={handleAdvance}
												className="cursor-pointer rounded-xl bg-neutral-100/80 py-2 font-medium text-neutral-800 text-xs transition-colors hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
											>
												{k}
											</button>
										))}
									</div>
								</div>
							)}

							{screen.screenType === "kyc-scan" && (
								<div className="flex flex-1 flex-col justify-between py-2 text-center">
									<div>
										<span className="font-semibold text-neutral-400 text-xs">
											{details?.headerText}
										</span>
										<h3 className="mt-1 font-bold text-base text-neutral-900 dark:text-white">
											{details?.headlineText}
										</h3>
									</div>

									<div className="relative mx-auto my-3 flex h-40 w-full items-center justify-center rounded-2xl border-2 border-blue-400 border-dashed bg-blue-50/20 p-2 dark:border-blue-500/40">
										<Camera className="h-8 w-8 animate-pulse text-blue-500" />
										<div className="absolute top-2 left-2 h-3.5 w-3.5 border-blue-600 border-t-2 border-l-2" />
										<div className="absolute top-2 right-2 h-3.5 w-3.5 border-blue-600 border-t-2 border-r-2" />
										<div className="absolute bottom-2 left-2 h-3.5 w-3.5 border-blue-600 border-b-2 border-l-2" />
										<div className="absolute right-2 bottom-2 h-3.5 w-3.5 border-blue-600 border-r-2 border-b-2" />
									</div>

									<p className="px-2 text-neutral-500 text-xs">
										{details?.subText}
									</p>

									<button
										type="button"
										onClick={handleAdvance}
										className={`mt-3 w-full cursor-pointer rounded-xl bg-neutral-950 py-3 font-semibold text-white text-xs shadow-xs dark:bg-white dark:text-neutral-950 ${
											hotspotHint ? "animate-pulse ring-4 ring-blue-500/80" : ""
										}`}
									>
										{details?.buttonText || "Take photo"}
									</button>
								</div>
							)}

							{![
								"splash",
								"welcome",
								"phone-input",
								"otp",
								"kyc-scan",
							].includes(screen.screenType) && (
								<div className="flex flex-1 flex-col justify-between py-2">
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<span className="font-semibold text-neutral-400 text-xs">
												{details?.headerText || flow.app}
											</span>
											<span className="h-2 w-2 rounded-full bg-emerald-500" />
										</div>
										<h3 className="font-bold text-base text-neutral-900 dark:text-white">
											{details?.headlineText}
										</h3>
										<p className="text-neutral-500 text-xs leading-normal">
											{details?.subText}
										</p>

										<div className="space-y-2 pt-2">
											<div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-3 dark:border-neutral-800 dark:bg-neutral-800/60">
												<div className="flex items-center gap-2.5">
													<div className="h-7 w-7 rounded-full bg-neutral-200 dark:bg-neutral-700" />
													<div className="flex-1 space-y-1">
														<div className="h-2 w-24 rounded-full bg-neutral-300 dark:bg-neutral-600" />
														<div className="h-1.5 w-16 rounded-full bg-neutral-200 dark:bg-neutral-700" />
													</div>
												</div>
											</div>
										</div>
									</div>

									<button
										type="button"
										onClick={handleAdvance}
										className={`mt-4 w-full cursor-pointer rounded-xl bg-neutral-950 py-3 font-semibold text-white text-xs shadow-xs dark:bg-white dark:text-neutral-950 ${
											hotspotHint ? "animate-pulse ring-4 ring-blue-500/80" : ""
										}`}
									>
										{details?.buttonText || "Continue"}
									</button>
								</div>
							)}
						</div>

						{/* Bottom Home Indicator Bar */}
						<div className="flex h-5 w-full items-center justify-center pb-1">
							<div
								className={`h-1 w-24 rounded-full ${
									screen.isDark ? "bg-white/40" : "bg-neutral-300"
								}`}
							/>
						</div>
					</>
				)}
			</div>

			{/* Per-Flow Control Bar: Single Line Navigation (< dots > ↻) */}
			<div className="mt-3 flex w-[250px] items-center gap-1.5 sm:w-[270px] sm:gap-2">
				<button
					type="button"
					disabled={safeIndex === 0}
					onClick={handlePrevious}
					className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-2xs transition-all hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
					aria-label="Previous screen"
					title="Previous screen"
				>
					<ChevronLeft className="h-4 w-4" />
				</button>

				{/* Step Progress Segments */}
				<div className="flex flex-1 items-center gap-1">
					{flow.screens.map((_, idx) => (
						<button
							key={idx}
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onStepChange(idx);
							}}
							className={`h-1.5 flex-1 cursor-pointer rounded-full transition-all ${
								idx === safeIndex
									? "bg-blue-600 ring-1 ring-blue-500/50"
									: idx < safeIndex
										? "bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-600 dark:hover:bg-neutral-500"
										: "bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700"
							}`}
							title={`Jump to step ${idx + 1}`}
							aria-label={`Jump to step ${idx + 1}`}
						/>
					))}
				</div>

				<button
					type="button"
					disabled={safeIndex === totalSteps - 1}
					onClick={handleAdvance}
					className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-2xs transition-all hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
					aria-label="Next screen"
					title="Next screen"
				>
					<ChevronRight className="h-4 w-4" />
				</button>

				{/* Reset Button (only icon, placed after > icon on the same single line) */}
				<button
					type="button"
					onClick={handleReset}
					className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-700 shadow-2xs transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-95 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
					aria-label={`Reset ${flow.app} prototype to Step 1 (R)`}
					title={`Reset ${flow.app} prototype to Step 1 (R)`}
				>
					<RotateCcw className="h-3.5 w-3.5" />
				</button>
			</div>
		</div>
	);
}

interface PrototypeCanvasProps {
	flow: DashboardFlow;
	currentStep: number;
	onStepChange: (step: number) => void;
	comparedFlows?: DashboardFlow[];
	comparedSteps?: Record<string, number>;
	onComparedStepChange?: (flowId: string, step: number) => void;
	onRemoveComparedFlow?: (flowId: string) => void;
}

export function PrototypeCanvas({
	flow,
	currentStep,
	onStepChange,
	comparedFlows = [],
	comparedSteps = {},
	onComparedStepChange,
	onRemoveComparedFlow,
}: PrototypeCanvasProps) {
	const isComparing = comparedFlows.length > 0;

	// Keyboard Shortcut: "r" or "R" resets prototype to Step 1
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (
				(e.key === "r" || e.key === "R") &&
				!e.metaKey &&
				!e.ctrlKey &&
				!e.altKey
			) {
				e.preventDefault();
				onStepChange(0);
				for (const cf of comparedFlows) {
					onComparedStepChange?.(cf.id, 0);
				}
				toast.info(`Reset ${flow.app} prototype to Step 1`);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [flow.app, onStepChange, comparedFlows, onComparedStepChange]);

	return (
		<div
			className={`scrollbar-none relative flex flex-1 select-none flex-col overflow-auto p-4 sm:p-6 ${
				isComparing
					? "bg-[#f8f9fa] bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] dark:bg-neutral-950"
					: "bg-neutral-50/50 dark:bg-neutral-950/50"
			}`}
		>
			{/* Phones Area (Single Flow or Side-by-Side Compared Flows in Mobile Single Mode) */}
			<div className="my-auto flex min-h-min items-start justify-center gap-8 py-2 sm:gap-12">
				{/* Flow 1 Mobile Phone */}
				<MobilePrototypeDevice
					flow={flow}
					currentStep={currentStep}
					onStepChange={onStepChange}
					isCompared={false}
				/>

				{/* Flow 2 (+ Flow 3) Compared Mobile Phone(s) */}
				{comparedFlows.map((comparedFlow) => (
					<MobilePrototypeDevice
						key={comparedFlow.id}
						flow={comparedFlow}
						currentStep={comparedSteps[comparedFlow.id] ?? 0}
						onStepChange={(step) =>
							onComparedStepChange?.(comparedFlow.id, step)
						}
						isCompared={true}
						onRemove={() => onRemoveComparedFlow?.(comparedFlow.id)}
					/>
				))}
			</div>
		</div>
	);
}
