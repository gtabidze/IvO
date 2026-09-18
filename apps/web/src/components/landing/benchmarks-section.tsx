import { ArrowRight } from "lucide-react";
import { useState } from "react";

interface SectorBenchmark {
	name: string;
	headline: string;
	highlight: string;
	description: string;
	metrics: {
		label: string;
		multiplier: string;
		subtitle: string;
		compVal: string;
		compWidth: string;
		ivoVal: string;
		ivoWidth: string;
	}[];
}

const SECTOR_DATA: Record<string, SectorBenchmark> = {
	finance: {
		name: "Finance & Banking",
		headline:
			"IvO Benchmarks, the telemetry engine built for high-stakes flows.",
		highlight: "Designed for complex user journeys.",
		description:
			"Financial journeys are multi-tiered and strictly regulated. Traditional analytics can't diagnose why users drop off at KYC or IBAN lookup. IvO benchmarks measure exact friction across 4,800+ indexed neobank and fintech flows.",
		metrics: [
			{
				label: "Time on Task",
				multiplier: "2.4x",
				subtitle: "Faster verification & onboarding completion",
				compVal: "74.2 SEC",
				compWidth: "85%",
				ivoVal: "31.0 SEC",
				ivoWidth: "35%",
			},
			{
				label: "Task Success Rate",
				multiplier: "98.4%",
				subtitle: "First-attempt deposit & KYC completion",
				compVal: "81.2%",
				compWidth: "75%",
				ivoVal: "98.4%",
				ivoWidth: "98%",
			},
			{
				label: "Friction & Error Rate",
				multiplier: "6.1x",
				subtitle: "Lower input validation & biometric retries",
				compVal: "9.4%",
				compWidth: "70%",
				ivoVal: "1.5%",
				ivoWidth: "15%",
			},
		],
	},
	gambling: {
		name: "iGaming & Gambling",
		headline: "Fast-wagering telemetry designed for high-frequency bets.",
		highlight: "Engineered for zero-latency deposit flows.",
		description:
			"Bettors churn when bet slip confirmation or geolocation lags by even 3 seconds. IvO tracks the split-second latency between slip selection, odds change acceptance, and wallet settlement.",
		metrics: [
			{
				label: "Deposit to First Wager",
				multiplier: "3.2x",
				subtitle: "Faster settlement from card to live bet",
				compVal: "48.5 SEC",
				compWidth: "80%",
				ivoVal: "15.2 SEC",
				ivoWidth: "28%",
			},
			{
				label: "Slip Submission Rate",
				multiplier: "96.8%",
				subtitle: "Zero-error multi-leg parlay execution",
				compVal: "78.4%",
				compWidth: "72%",
				ivoVal: "96.8%",
				ivoWidth: "96%",
			},
			{
				label: "Geolocation Verification",
				multiplier: "4.8x",
				subtitle: "Faster state boundary fence validation",
				compVal: "11.2 SEC",
				compWidth: "75%",
				ivoVal: "2.3 SEC",
				ivoWidth: "20%",
			},
		],
	},
	ecommerce: {
		name: "E-Commerce & High-Ticket",
		headline: "Checkout telemetry calibrated for cart conversion.",
		highlight: "Optimized for frictionless checkout loops.",
		description:
			"High-ticket checkout flows suffer high cart abandonment from unexpected shipping gates and confusing address parsers. IvO measures micro-friction at each checkout step to maximize GMV.",
		metrics: [
			{
				label: "1-Click Checkout Speed",
				multiplier: "2.8x",
				subtitle: "Faster payment authorization and order placement",
				compVal: "52.0 SEC",
				compWidth: "78%",
				ivoVal: "18.5 SEC",
				ivoWidth: "30%",
			},
			{
				label: "Address Parse Accuracy",
				multiplier: "99.1%",
				subtitle: "Zero delivery re-route tickets",
				compVal: "84.5%",
				compWidth: "76%",
				ivoVal: "99.1%",
				ivoWidth: "99%",
			},
			{
				label: "BNPL Adoption Lift",
				multiplier: "3.4x",
				subtitle: "Higher installment loan click-through rate",
				compVal: "6.2%",
				compWidth: "60%",
				ivoVal: "21.1%",
				ivoWidth: "22%",
			},
		],
	},
	health: {
		name: "Health & Medical",
		headline: "Clinical intake telemetry calibrated for HIPAA compliance.",
		highlight: "Built for sensitive patient onboarding.",
		description:
			"Patient drop-off during digital triage or insurance card uploads causes missed appointments and care delays. IvO benchmarks intake completion rates across telemedicine platforms.",
		metrics: [
			{
				label: "Insurance Card Scan",
				multiplier: "4.1x",
				subtitle: "Faster OCR optical card group/member parsing",
				compVal: "65.0 SEC",
				compWidth: "82%",
				ivoVal: "15.8 SEC",
				ivoWidth: "24%",
			},
			{
				label: "Intake Form Completion",
				multiplier: "94.5%",
				subtitle: "First-pass medical questionnaire submit",
				compVal: "72.0%",
				compWidth: "68%",
				ivoVal: "94.5%",
				ivoWidth: "94%",
			},
			{
				label: "Identity Verification Gate",
				multiplier: "2.9x",
				subtitle: "Faster state pharmacy prescription verify",
				compVal: "120 SEC",
				compWidth: "85%",
				ivoVal: "41.0 SEC",
				ivoWidth: "35%",
			},
		],
	},
};

export default function BenchmarksSection() {
	const [selectedSector, setSelectedSector] = useState<
		"finance" | "gambling" | "ecommerce" | "health"
	>("finance");
	const data = SECTOR_DATA[selectedSector];

	return (
		<section
			id="benchmarks"
			className="relative overflow-hidden bg-[#051c14] py-24 text-white sm:py-32"
		>
			{/* Subtle decorative mesh / background glow */}
			<div className="pointer-events-none absolute -top-40 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
			<div className="pointer-events-none absolute -bottom-40 left-0 h-96 w-96 rounded-full bg-lime-500/5 blur-3xl" />

			<div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Sub-Navigation / Industry Switcher */}
				<div className="mb-12 flex flex-wrap items-center gap-2 border-emerald-900/60 border-b pb-4">
					<span className="mr-4 font-mono font-semibold text-emerald-400 text-xs uppercase tracking-widest">
						SECTORS:
					</span>
					{(["finance", "gambling", "ecommerce", "health"] as const).map(
						(key) => {
							const isActive = selectedSector === key;
							return (
								<button
									key={key}
									type="button"
									onClick={() => setSelectedSector(key)}
									className={`cursor-pointer rounded-full px-3.5 py-1.5 font-medium text-xs tracking-tight transition-all ${
										isActive
											? "border border-emerald-400/40 bg-emerald-500/20 text-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.25)]"
											: "border border-transparent text-emerald-200/70 hover:bg-emerald-950/40 hover:text-white"
									}`}
								>
									{SECTOR_DATA[key].name}
								</button>
							);
						},
					)}
				</div>

				<div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
					{/* Left Header & Copy (Braintrust Screenshot 3 Style) */}
					<div className="space-y-6 lg:col-span-6">
						<h2 className="font-semibold text-3xl leading-[1.08] tracking-[-0.03em] sm:text-5xl lg:text-6xl">
							{data.headline}{" "}
							<span className="block text-emerald-400 sm:inline">
								{data.highlight}
							</span>
						</h2>

						<p className="max-w-xl font-normal text-base text-emerald-100/75 leading-relaxed sm:text-lg">
							{data.description}
						</p>

						<div className="pt-2">
							<a
								href="#studio"
								className="group inline-flex items-center gap-2 rounded-full border border-emerald-700/50 bg-emerald-950/80 px-4 py-2 font-medium text-emerald-300 text-xs shadow-sm transition-all hover:bg-emerald-900 sm:text-sm"
							>
								<span>Learn more about IvO Benchmarks</span>
								<ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
							</a>
						</div>
					</div>

					{/* Right Comparative Metric Bars (Exact Braintrust Style) */}
					<div className="space-y-10 pt-4 lg:col-span-6 lg:pt-0">
						{data.metrics.map((metric, idx) => (
							<div key={idx} className="space-y-3">
								<div className="flex items-baseline justify-between">
									<div>
										<div className="font-mono font-semibold text-4xl text-white tracking-tight sm:text-5xl">
											{metric.multiplier}
										</div>
										<div className="mt-0.5 font-medium text-emerald-200/70 text-xs sm:text-sm">
											{metric.subtitle}
										</div>
									</div>
								</div>

								{/* Dual Comparison Bars (Hatched Competition vs Lime IvO) */}
								<div className="space-y-2 pt-2">
									{/* Competition Bar */}
									<div className="flex items-center gap-4 font-mono text-[11px] text-emerald-300/80">
										<span className="w-24 shrink-0 text-emerald-400/60 uppercase tracking-wider">
											INDUSTRY AVG
										</span>
										<span className="w-20 shrink-0 text-right font-semibold text-emerald-200/90">
											{metric.compVal}
										</span>
										<div className="h-3 flex-1 overflow-hidden rounded-full border border-emerald-800/40 bg-emerald-950/60 p-0.5">
											<div
												className="h-full rounded-full bg-[repeating-linear-gradient(45deg,rgba(52,211,153,0.2),rgba(52,211,153,0.2)_4px,rgba(16,185,129,0.4)_4px,rgba(16,185,129,0.4)_8px)]"
												style={{ width: metric.compWidth }}
											/>
										</div>
									</div>

									{/* IvO Bar */}
									<div className="flex items-center gap-4 font-mono text-[11px]">
										<span className="w-24 shrink-0 font-bold text-lime-400 uppercase tracking-wider">
											IVO BENCHMARK
										</span>
										<span className="w-20 shrink-0 text-right font-bold text-lime-400">
											{metric.ivoVal}
										</span>
										<div className="h-3 flex-1 overflow-hidden rounded-full bg-emerald-950/80 p-0.5">
											<div
												className="h-full rounded-full bg-[#a3e635] shadow-[0_0_10px_rgba(163,230,53,0.7)] transition-all duration-500"
												style={{ width: metric.ivoWidth }}
											/>
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
