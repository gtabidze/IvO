import { ArrowRight, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import TelemetryCanvas from "./telemetry-canvas";

export default function Hero() {
	const [activeSector, setActiveSector] = useState("Finance & Banking");
	const [dropdownOpen, setDropdownOpen] = useState(false);

	const sectors = [
		{
			id: "Finance & Banking",
			status: "Active (71 apps)",
			badge: "Live Directory",
			desc: "KYC gates, biometric auth, multi-currency wallets, instant ACH rails",
		},
		{
			id: "iGaming & Gambling",
			status: "Q2 Rollout",
			badge: "Coming Next",
			desc: "Geo-fencing, fast deposits, wager slips, instant withdrawal verification",
		},
		{
			id: "E-Commerce & High-Ticket",
			status: "Q3 Rollout",
			badge: "In Research",
			desc: "1-click checkouts, BNPL friction points, post-purchase upsell telemetry",
		},
		{
			id: "Health & Medical",
			status: "Q4 Rollout",
			badge: "In Pipeline",
			desc: "HIPAA compliance gates, prescription intake, patient portal onboarding",
		},
	];

	return (
		<section className="relative overflow-hidden pt-12 pb-8 sm:pt-20">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Status Pill (Braintrust Badge Style) */}
				<div className="mb-6 flex items-center">
					<a
						href="#directory"
						className="inline-flex items-center gap-2 rounded-full border border-[#d1f1e1] bg-[#edf9f3] px-3.5 py-1.5 font-medium text-[#0f764a] text-xs tracking-tight shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all hover:border-[#b4e6ce]"
					>
						<span>
							One platform for user behavior observability &amp; evals
						</span>
						<ArrowRight className="h-3 w-3 text-[#0f764a]" />
					</a>
				</div>

				{/* Primary Headline (Apple / Braintrust Style) */}
				<div className="max-w-4xl">
					<h1 className="text-balance font-semibold text-5xl text-neutral-950 leading-[1.02] tracking-[-0.04em] sm:text-7xl lg:text-[84px]">
						Ship valuable products at scale
					</h1>

					<p className="mt-6 max-w-3xl font-normal text-lg text-neutral-600 leading-relaxed tracking-[-0.015em] sm:text-2xl">
						Discover user behavior patterns, evaluate competitor benchmarks, and
						eliminate the gap between user intent and product outcome.
					</p>
				</div>

				{/* Dual CTA Buttons */}
				<div className="mt-8 flex flex-wrap items-center gap-3.5 sm:mt-10">
					<a
						href="#directory"
						className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0052ff] px-6 py-3 font-medium text-sm text-white shadow-sm transition-all hover:bg-[#0047e0] hover:shadow-[0_4px_16px_rgba(0,82,255,0.22)] active:scale-[0.98] sm:text-base"
					>
						<span>Start building</span>
					</a>

					<a
						href="#studio"
						className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-200/80 bg-[#f4f4f5] px-6 py-3 font-medium text-neutral-900 text-sm transition-all hover:bg-[#eaeaea] active:scale-[0.98] sm:text-base"
					>
						<span>Contact sales</span>
					</a>
				</div>

				{/* Quick Selector Dropdown (Matching Braintrust Screenshot 1: "Build with agents ⌵") */}
				<div className="relative mt-6 inline-block">
					<button
						type="button"
						onClick={() => setDropdownOpen(!dropdownOpen)}
						className="inline-flex items-center gap-2 py-1 font-medium text-neutral-600 text-xs transition-colors hover:text-neutral-950 focus:outline-none sm:text-sm"
					>
						<span className="flex items-center gap-1.5 text-neutral-700">
							<span className="font-bold text-blue-600">●</span>
							<span>Auditing for</span>
							<strong className="font-semibold text-neutral-900">
								{activeSector}
							</strong>
						</span>
						<ChevronDown
							className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
						/>
					</button>

					{/* Dropdown Menu */}
					{dropdownOpen && (
						<div className="fade-in zoom-in-95 absolute left-0 z-30 mt-2 w-80 animate-in rounded-xl border border-neutral-200 bg-white p-2 shadow-xl duration-150 sm:w-96">
							<div className="px-3 py-1.5 font-mono font-semibold text-[11px] text-neutral-600 uppercase tracking-wider">
								Market Sectors &amp; Coverage Roadmap
							</div>
							<div className="space-y-1">
								{sectors.map((s) => (
									<button
										key={s.id}
										type="button"
										onClick={() => {
											setActiveSector(s.id);
											setDropdownOpen(false);
										}}
										className={`flex w-full items-start justify-between rounded-lg p-2.5 text-left transition-colors ${
											activeSector === s.id
												? "bg-blue-50/70 text-neutral-950"
												: "text-neutral-700 hover:bg-neutral-50"
										}`}
									>
										<div>
											<div className="flex items-center gap-2 font-medium text-sm">
												{s.id}
												<span className="rounded border border-neutral-200 bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600">
													{s.badge}
												</span>
											</div>
											<p className="mt-0.5 text-neutral-600 text-xs leading-snug">
												{s.desc}
											</p>
										</div>
										{activeSector === s.id && (
											<Check className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
										)}
									</button>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* Generative Interactive Telemetry Rhythm / Barcode Matrix */}
			<div className="mt-8">
				<TelemetryCanvas />
			</div>
		</section>
	);
}
