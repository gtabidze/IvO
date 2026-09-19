import {
	Camera,
	ChevronLeft,
	ChevronRight,
	MoreHorizontal,
	RotateCcw,
	Wifi,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DashboardFlow } from "@/data/dashboard-flows";

interface PrototypeCanvasProps {
	flow: DashboardFlow;
	currentStep: number;
	onStepChange: (step: number) => void;
}

export function PrototypeCanvas({
	flow,
	currentStep,
	onStepChange,
}: PrototypeCanvasProps) {
	const [hotspotHint, setHotspotHint] = useState(false);

	const screen = flow.screens[currentStep] || flow.screens[0];
	const totalSteps = flow.screens.length;
	const details = screen.wireframeDetails;

	const handleAdvance = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (currentStep < totalSteps - 1) {
			onStepChange(currentStep + 1);
		} else {
			toast.success("Completed flow prototype!", {
				description: "You've reached the end of this user flow.",
			});
		}
	};

	const handlePrevious = (e?: React.MouseEvent) => {
		e?.stopPropagation();
		if (currentStep > 0) {
			onStepChange(currentStep - 1);
		}
	};

	const handleCanvasClick = () => {
		// Flash hotspot hint
		setHotspotHint(true);
		setTimeout(() => setHotspotHint(false), 500);
	};

	return (
		<div
			onClick={handleCanvasClick}
			className="relative flex flex-1 select-none flex-col items-center justify-between overflow-hidden bg-[#121212] p-6 sm:p-10"
		>
			{/* Left & Right Floating Step Chevrons */}
			{currentStep > 0 && (
				<button
					type="button"
					onClick={handlePrevious}
					className="absolute top-1/2 left-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-neutral-800/80 text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-neutral-700 active:scale-95 sm:left-12"
					aria-label="Previous screen"
				>
					<ChevronLeft className="h-6 w-6" />
				</button>
			)}

			{currentStep < totalSteps - 1 && (
				<button
					type="button"
					onClick={handleAdvance}
					className="absolute top-1/2 right-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-neutral-800/80 text-white shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-neutral-700 active:scale-95 sm:right-12"
					aria-label="Next screen"
				>
					<ChevronRight className="h-6 w-6" />
				</button>
			)}

			{/* Center: iPhone Device Frame */}
			<div className="relative my-auto flex h-[540px] w-[260px] flex-col justify-between overflow-hidden rounded-[2.8rem] border-[6px] border-neutral-800 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] ring-1 ring-white/10 transition-transform sm:h-[580px] sm:w-[280px] dark:bg-neutral-900">
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

				{/* Screen Content */}
				<div
					className={`relative flex flex-1 flex-col px-5 pt-5 pb-3 ${
						screen.isDark
							? "bg-neutral-950 text-white"
							: "bg-white text-neutral-900"
					}`}
				>
					{/* Interactive Hotspot Affordance Ring */}
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

							{/* Keypad */}
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

								{/* OTP Boxes */}
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

							{/* Keypad */}
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

					{!["splash", "welcome", "phone-input", "otp", "kyc-scan"].includes(
						screen.screenType,
					) && (
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
			</div>

			{/* Bottom Controls Bar (Screenshot 2) */}
			<div className="relative mt-4 flex w-full max-w-4xl items-center justify-between text-neutral-400 text-xs">
				{/* Step Counter */}
				<span className="font-mono text-neutral-400">
					{currentStep + 1} of {totalSteps}
				</span>

				{/* Center: Restart prototype & More pills */}
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onStepChange(0);
							toast.info("Prototype reset to Step 1");
						}}
						className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-800/90 px-4 py-1.5 font-medium text-white text-xs shadow-sm hover:bg-neutral-700 active:scale-95"
					>
						<RotateCcw className="h-3.5 w-3.5" />
						<span>Restart prototype</span>
					</button>

					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							toast.info("Prototype settings: 60fps WebGL transitions active");
						}}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-800/90 text-white shadow-sm hover:bg-neutral-700"
						aria-label="More prototype settings"
					>
						<MoreHorizontal className="h-4 w-4" />
					</button>
				</div>

				{/* Spec info */}
				<div className="flex items-center gap-1.5 text-neutral-400">
					<span>iOS (375x812)</span>
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							toast.info("iPhone 15 Pro • Retina Display • 3x Assets");
						}}
						className="cursor-pointer font-medium underline hover:text-white"
					>
						More info
					</button>
				</div>
			</div>
		</div>
	);
}
