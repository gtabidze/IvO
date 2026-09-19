import { Camera, Lock, Wifi } from "lucide-react";
import type { FlowScreen } from "@/data/dashboard-flows";

interface ScreenMockupProps {
	screen: FlowScreen;
	index: number;
	appColor: string;
	appName: string;
	isLocked?: boolean;
	isSelected?: boolean;
	onLockedClick?: () => void;
	onScreenClick?: (index: number) => void;
}

export function ScreenMockup({
	screen,
	index,
	appColor,
	appName,
	isLocked = false,
	isSelected = false,
	onLockedClick,
	onScreenClick,
}: ScreenMockupProps) {
	const details = screen.wireframeDetails;

	const handleClick = () => {
		if (isLocked) {
			onLockedClick?.();
		} else {
			onScreenClick?.(index);
		}
	};

	return (
		<div
			onClick={handleClick}
			className={`group relative flex shrink-0 cursor-pointer flex-col transition-all duration-200 ${
				isLocked
					? "hover:scale-[1.01]"
					: isSelected
						? "scale-[1.02] rounded-[2.35rem] shadow-xl ring-2 ring-blue-600"
						: "hover:scale-[1.02] hover:shadow-xl"
			}`}
		>
			{/* Device Frame */}
			<div
				className={`relative flex h-[480px] w-[230px] flex-col justify-between overflow-hidden rounded-[2.25rem] border border-neutral-300/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 dark:border-neutral-800 dark:bg-neutral-900 ${
					screen.isDark
						? "bg-neutral-950 text-white"
						: "bg-white text-neutral-900"
				}`}
			>
				{/* Top Status Bar */}
				<div className="flex h-9 w-full select-none items-center justify-between px-6 pt-2 font-semibold text-[11px]">
					<span>9:41</span>
					{/* Dynamic Island / Pill */}
					<div className="h-3 w-16 rounded-full bg-neutral-900 dark:bg-neutral-800" />
					<div className="flex items-center gap-1.5 opacity-80">
						<Wifi className="h-2.5 w-2.5" />
						<div className="h-2 w-4 rounded-xs border border-current p-0.5">
							<div className="h-full w-full rounded-2xs bg-current" />
						</div>
					</div>
				</div>

				{/* Screen Content Body */}
				<div className="relative flex flex-1 flex-col px-4 pt-4 pb-2">
					{/* Screen Type Variant 1: Splash */}
					{screen.screenType === "splash" && (
						<div className="flex flex-1 flex-col items-center justify-center text-center">
							<div
								style={{ backgroundColor: appColor }}
								className="flex h-14 w-14 items-center justify-center rounded-2xl font-black text-2xl text-white shadow-md"
							>
								{appName.charAt(0)}
							</div>
							<h3 className="mt-4 font-bold text-xl tracking-tight">
								{details?.headlineText || appName}
							</h3>
							<p className="mt-1 px-2 text-[11px] text-neutral-400">
								{details?.subText || "Seamless financial intelligence"}
							</p>
						</div>
					)}

					{/* Screen Type Variant 2: Welcome / Marketing Pitch */}
					{screen.screenType === "welcome" && (
						<div className="flex flex-1 flex-col justify-between py-2">
							<div className="space-y-2">
								<div className="flex items-center gap-1.5 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
									<div
										style={{ backgroundColor: appColor }}
										className="h-1.5 w-1.5 rounded-full"
									/>
									<span>{details?.headerText || appName}</span>
								</div>
								<h3 className="font-extrabold text-base uppercase leading-tight tracking-tight">
									{details?.headlineText}
								</h3>
								<p className="text-[10.5px] text-neutral-400 leading-relaxed">
									{details?.subText}
								</p>
							</div>

							{/* Abstract Wireframe Visual Element */}
							<div className="my-auto flex h-32 w-full items-center justify-center rounded-xl bg-neutral-100/10 p-4 ring-1 ring-white/10">
								<div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-neutral-700/50 bg-neutral-800/60 shadow-inner">
									<div
										style={{ borderColor: appColor }}
										className="h-14 w-14 animate-spin rounded-full border-2 border-dashed duration-10000"
									/>
									<span className="absolute font-bold font-mono text-xs">
										{appName.charAt(0)}
									</span>
								</div>
							</div>

							<div className="w-full">
								<button
									type="button"
									className="w-full rounded-xl bg-white py-2.5 font-semibold text-neutral-950 text-xs shadow-sm transition-all"
								>
									{details?.buttonText || "Continue"}
								</button>
							</div>
						</div>
					)}

					{/* Screen Type Variant 3: Phone / Auth Input */}
					{screen.screenType === "phone-input" && (
						<div className="flex flex-1 flex-col justify-between py-2">
							<div>
								<span className="font-semibold text-[10px] text-neutral-400">
									{details?.headerText}
								</span>
								<h3 className="mt-1 font-bold text-neutral-900 text-sm dark:text-white">
									{details?.headlineText}
								</h3>
								<p className="mt-1 text-[10px] text-neutral-500">
									{details?.subText}
								</p>

								{/* Input Field Wireframe */}
								<div className="mt-4 flex items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2 text-xs dark:border-neutral-800 dark:bg-neutral-800">
									<span className="rounded-md bg-white px-1.5 py-0.5 font-bold text-[10px] shadow-2xs dark:bg-neutral-700">
										🇸🇬 +65
									</span>
									<span className="font-mono text-neutral-700 dark:text-neutral-300">
										9036 6027
									</span>
								</div>
							</div>

							{/* Keypad Placeholder */}
							<div className="grid grid-cols-3 gap-2 border-neutral-100 border-t pt-3 text-center dark:border-neutral-800">
								{[1, 2, 3, 4, 5, 6, 7, 8, 9, "*", 0, "#"].map((k) => (
									<div
										key={k}
										className="rounded-lg bg-neutral-100/70 py-1.5 font-medium text-neutral-700 text-xs dark:bg-neutral-800 dark:text-neutral-300"
									>
										{k}
									</div>
								))}
							</div>

							<button
								type="button"
								style={{ backgroundColor: appColor }}
								className="mt-2 w-full rounded-xl py-2 font-semibold text-white text-xs shadow-xs"
							>
								{details?.buttonText || "Sign up"}
							</button>
						</div>
					)}

					{/* Screen Type Variant 4: OTP Verification */}
					{screen.screenType === "otp" && (
						<div className="flex flex-1 flex-col justify-between py-2">
							<div>
								<span className="font-semibold text-[10px] text-neutral-400">
									{details?.headerText}
								</span>
								<h3 className="mt-1 font-bold text-neutral-900 text-sm dark:text-white">
									{details?.headlineText}
								</h3>
								<p className="mt-1 text-[10px] text-neutral-500">
									{details?.subText}
								</p>

								{/* 6 OTP boxes */}
								<div className="mt-5 flex justify-between gap-1.5">
									{[6, 4, 2, "•", "•", "•"].map((char, i) => (
										<div
											key={i}
											className={`flex h-10 w-7 items-center justify-center rounded-lg border font-bold text-xs ${
												i < 3
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
									<div
										key={i}
										className="rounded-lg bg-neutral-100/70 py-1.5 font-medium text-neutral-700 text-xs dark:bg-neutral-800 dark:text-neutral-300"
									>
										{k}
									</div>
								))}
							</div>
						</div>
					)}

					{/* Screen Type Variant 5: KYC Biometric Scan */}
					{screen.screenType === "kyc-scan" && (
						<div className="flex flex-1 flex-col justify-between py-2 text-center">
							<div>
								<span className="font-semibold text-[10px] text-neutral-400">
									{details?.headerText}
								</span>
								<h3 className="mt-1 font-bold text-neutral-900 text-sm dark:text-white">
									{details?.headlineText}
								</h3>
							</div>

							{/* Scanner Frame Viewfinder */}
							<div className="relative mx-auto my-3 flex h-36 w-full items-center justify-center rounded-2xl border-2 border-blue-400 border-dashed bg-blue-50/20 p-2 dark:border-blue-500/40">
								<Camera className="h-7 w-7 animate-pulse text-blue-500" />
								<div className="absolute top-2 left-2 h-3 w-3 border-blue-600 border-t-2 border-l-2" />
								<div className="absolute top-2 right-2 h-3 w-3 border-blue-600 border-t-2 border-r-2" />
								<div className="absolute bottom-2 left-2 h-3 w-2 border-blue-600 border-b-2 border-l-2" />
								<div className="absolute right-2 bottom-2 h-3 w-3 border-blue-600 border-r-2 border-b-2" />
							</div>

							<p className="px-2 text-[10px] text-neutral-500">
								{details?.subText}
							</p>

							<button
								type="button"
								className="mt-2 w-full rounded-xl bg-neutral-950 py-2.5 font-semibold text-white text-xs shadow-xs dark:bg-white dark:text-neutral-950"
							>
								{details?.buttonText || "Continue"}
							</button>
						</div>
					)}

					{/* Default / Generic Wireframe State with realistic skeleton shapes */}
					{!["splash", "welcome", "phone-input", "otp", "kyc-scan"].includes(
						screen.screenType,
					) && (
						<div className="flex flex-1 flex-col justify-between py-2">
							<div className="space-y-2.5">
								<div className="flex items-center justify-between">
									<span className="font-semibold text-[10px] text-neutral-400">
										{details?.headerText || appName}
									</span>
									<span className="h-2 w-2 rounded-full bg-emerald-500" />
								</div>
								<h3 className="font-bold text-neutral-900 text-sm dark:text-white">
									{details?.headlineText}
								</h3>
								<p className="text-[10px] text-neutral-500 leading-normal">
									{details?.subText}
								</p>

								{/* Dynamic Mock Wireframe Cards */}
								<div className="space-y-2 pt-2">
									<div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
										<div className="flex items-center gap-2">
											<div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
											<div className="flex-1 space-y-1">
												<div className="h-2 w-20 rounded-full bg-neutral-300 dark:bg-neutral-600" />
												<div className="h-1.5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
											</div>
											<div className="h-3 w-8 rounded-full bg-neutral-300 dark:bg-neutral-600" />
										</div>
									</div>

									<div className="rounded-xl border border-neutral-200/80 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
										<div className="flex items-center gap-2">
											<div className="h-6 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
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
								className="mt-3 w-full rounded-xl bg-neutral-950 py-2.5 font-semibold text-white text-xs shadow-xs dark:bg-white dark:text-neutral-950"
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

				{/* Frosted Glass Lock Overlay for Paywalled Screens */}
				{isLocked && (
					<div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/40 p-4 backdrop-blur-md transition-all duration-300 hover:bg-white/30 dark:bg-neutral-950/50">
						<div className="flex h-11 w-11 items-center justify-center rounded-full bg-neutral-950 text-white shadow-xl ring-4 ring-white/80 dark:bg-white dark:text-neutral-950 dark:ring-neutral-900/80">
							<Lock className="h-4 w-4" />
						</div>
						<span className="mt-3 rounded-full bg-neutral-950/80 px-2.5 py-0.5 font-semibold text-[10px] text-white backdrop-blur-xs">
							PRO Only
						</span>
					</div>
				)}
			</div>

			{/* Screen Caption Footer */}
			<div className="mt-2.5 flex items-center justify-between px-2 text-[11px] text-neutral-500">
				<span className="font-medium text-neutral-800 dark:text-neutral-200">
					{screen.title}
				</span>
				<span className="font-mono text-[10px] text-neutral-400">
					{index + 1} of 26
				</span>
			</div>
		</div>
	);
}
