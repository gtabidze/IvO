import { Eye, Lock, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { FINTECH_FLOWS, type FintechFlow } from "../../data/fintech-flows";

export default function DarkVaultSection() {
	const [activeCategory, setActiveCategory] = useState<string>("All");
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedFlow, setSelectedFlow] = useState<FintechFlow | null>(null);

	const categories = [
		"All",
		"Banking",
		"Crypto & Web3",
		"Investing",
		"Prediction Markets",
		"Payments",
		"Lending",
	];

	const filteredFlows = FINTECH_FLOWS.filter((flow) => {
		const matchesCategory =
			activeCategory === "All" || flow.category === activeCategory;
		const matchesSearch =
			flow.app.toLowerCase().includes(searchQuery.toLowerCase()) ||
			flow.flowName.toLowerCase().includes(searchQuery.toLowerCase()) ||
			flow.tags.some((t) =>
				t.toLowerCase().includes(searchQuery.toLowerCase()),
			);
		return matchesCategory && matchesSearch;
	});

	return (
		<section
			id="directory"
			className="border-neutral-200/80 border-b bg-white py-24 sm:py-32"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Top Headline Section (Matching Mobbin Finance+ Screenshot 4 & 5) */}
				<div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 font-medium font-mono text-neutral-800 text-xs">
						<span>DIRECTORY • FINANCE+</span>
					</div>

					<h2 className="font-semibold text-4xl text-neutral-950 leading-[1.05] tracking-[-0.035em] sm:text-6xl">
						Stop building in the dark.
					</h2>

					<p className="font-normal text-base text-neutral-600 leading-relaxed tracking-tight sm:text-xl">
						The screens you need to study are behind region locks, KYC gates,
						and account tiers you'll never qualify for. IvO makes them
						searchable, metric-scored, and reproducible.
					</p>
				</div>

				{/* 3 Value Pillars (Matching Screenshot 5) */}
				<div className="mb-16 grid grid-cols-1 gap-6 md:grid-cols-3">
					{/* Card 1: Apps you can't access */}
					<div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-neutral-50 p-6">
						<div className="flex h-28 items-center justify-around overflow-hidden rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0052ff] font-bold text-lg text-white shadow-sm">
								R
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#26a69a] font-bold text-lg text-white shadow-sm">
								eT
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-900 font-bold text-lg text-white shadow-sm">
								M
							</div>
							<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-600 font-bold text-lg text-white shadow-sm">
								P
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-base text-neutral-950">
								Apps you can't access yourself
							</h3>
							<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
								Banking, payments, crypto, high-net-worth tiers, and prediction
								markets. Real flows recorded with verified resident credentials.
							</p>
						</div>
					</div>

					{/* Card 2: Filter to what you need */}
					<div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-neutral-50 p-6">
						<div className="flex h-28 flex-col justify-center space-y-1.5 rounded-xl bg-neutral-900 p-3 font-mono text-white text-xs shadow-sm">
							<div className="text-[10px] text-neutral-600 uppercase tracking-wider">
								FILTER CRITERIA
							</div>
							<div className="flex items-center justify-between text-neutral-300">
								<span>Subcategory:</span>
								<span className="text-blue-400">Crypto &amp; Web3</span>
							</div>
							<div className="flex items-center justify-between text-neutral-300">
								<span>Gate Type:</span>
								<span className="text-emerald-400">KYC Passport Scan</span>
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-base text-neutral-950">
								Filter to exactly what you need
							</h3>
							<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
								Filter down to onboarding screens for US neobanks, or biometric
								face-scans for offshore crypto brokerages.
							</p>
						</div>
					</div>

					{/* Card 3: New apps every week */}
					<div className="flex flex-col justify-between space-y-6 rounded-2xl border border-neutral-200/80 bg-neutral-50 p-6">
						<div className="flex h-28 items-center rounded-xl border border-neutral-200/60 bg-white p-4 shadow-sm">
							<div className="flex w-full items-center gap-3 rounded-lg border border-neutral-200/80 bg-neutral-50 p-2.5">
								<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs">
									🔔
								</div>
								<div className="text-left">
									<div className="font-semibold text-[11px] text-neutral-950">
										New Finance+ release
									</div>
									<div className="text-[10px] text-neutral-600">
										Featuring Polymarket, Current &amp; Ramp
									</div>
								</div>
							</div>
						</div>
						<div>
							<h3 className="font-semibold text-base text-neutral-950">
								New apps every single week
							</h3>
							<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
								Coverage driven by what subscribers request. Continuously
								re-recorded when competitors ship major releases.
							</p>
						</div>
					</div>
				</div>

				{/* Interactive Directory Search & Filter Bar */}
				<div className="space-y-6">
					<div className="flex flex-col items-center justify-between gap-4 md:flex-row">
						{/* Category Pills */}
						<div className="flex w-full items-center gap-1.5 overflow-x-auto pb-2 md:w-auto md:pb-0">
							{categories.map((cat) => (
								<button
									key={cat}
									type="button"
									onClick={() => setActiveCategory(cat)}
									className={`cursor-pointer whitespace-nowrap rounded-full px-3.5 py-1.5 font-medium text-xs tracking-tight transition-all ${
										activeCategory === cat
											? "bg-neutral-950 text-white shadow-sm"
											: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200/70 hover:text-neutral-900"
									}`}
								>
									{cat}
								</button>
							))}
						</div>

						{/* Search Input */}
						<div className="relative w-full md:w-72">
							<Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-neutral-600" />
							<input
								type="text"
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								placeholder="Search 4,800+ screens..."
								className="w-full rounded-lg border border-neutral-200 bg-neutral-50/50 py-1.5 pr-4 pl-9 font-mono text-neutral-900 text-xs transition-all placeholder:text-neutral-600 focus:border-neutral-400 focus:bg-white focus:outline-none"
							/>
						</div>
					</div>

					{/* Flow Cards Grid */}
					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
						{filteredFlows.map((flow) => (
							<div
								key={flow.id}
								className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] transition-all duration-200 hover:border-neutral-300 hover:shadow-md"
							>
								{/* Card Image Banner */}
								<div className="relative h-44 overflow-hidden bg-neutral-100">
									<img
										src={flow.heroImage}
										alt={`${flow.app} ${flow.flowName}`}
										className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
									/>
									<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-neutral-950/70 via-transparent to-transparent" />

									{/* Badges on Image */}
									<div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
										<span className="rounded-md bg-neutral-900/80 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
											{flow.category}
										</span>
										{flow.isKycGated && (
											<span className="flex items-center gap-1 rounded-md bg-rose-950/80 px-2 py-0.5 font-mono text-[10px] text-rose-300 backdrop-blur-md">
												<Lock className="h-2.5 w-2.5" /> KYC Gated
											</span>
										)}
									</div>

									{/* Bottom App Title Overlay */}
									<div className="absolute right-2.5 bottom-2.5 left-2.5 flex items-center justify-between text-white">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-sm drop-shadow">
												{flow.app}
											</span>
										</div>
										<span className="rounded bg-neutral-900/60 px-1.5 py-0.5 font-mono text-[10px] text-neutral-300 backdrop-blur-sm">
											{flow.screensCount} screens
										</span>
									</div>
								</div>

								{/* Card Details */}
								<div className="flex flex-1 flex-col justify-between space-y-4 p-4">
									<div>
										<h4 className="font-semibold text-neutral-900 text-sm leading-snug transition-colors group-hover:text-blue-600">
											{flow.flowName}
										</h4>
										<p className="mt-1 line-clamp-2 text-[11px] text-neutral-600 leading-relaxed">
											{flow.highlight}
										</p>
									</div>

									{/* Quantitative UX Telemetry Box */}
									<div className="grid grid-cols-3 gap-2 border-neutral-100 border-t pt-3 text-center">
										<div className="rounded border border-neutral-100 bg-neutral-50 p-1.5">
											<div className="font-mono text-[9px] text-neutral-600 uppercase">
												Task Time
											</div>
											<div className="font-mono font-semibold text-neutral-900 text-xs">
												{flow.timeOnTask}
											</div>
										</div>
										<div className="rounded border border-neutral-100 bg-neutral-50 p-1.5">
											<div className="font-mono text-[9px] text-neutral-600 uppercase">
												Success
											</div>
											<div className="font-mono font-semibold text-emerald-600 text-xs">
												{flow.successRate}
											</div>
										</div>
										<div className="rounded border border-neutral-100 bg-neutral-50 p-1.5">
											<div className="font-mono text-[9px] text-neutral-600 uppercase">
												Friction
											</div>
											<div className="font-mono font-semibold text-blue-600 text-xs">
												{flow.frictionScore}/10
											</div>
										</div>
									</div>

									{/* Action Button */}
									<button
										type="button"
										onClick={() => setSelectedFlow(flow)}
										className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg bg-neutral-100 py-1.5 font-medium text-neutral-800 text-xs transition-all hover:bg-neutral-950 hover:text-white"
									>
										<Eye className="h-3.5 w-3.5" />
										<span>Inspect flow teardown</span>
									</button>
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Modal / Drawer for Inspecting a Selected Flow */}
				{selectedFlow && (
					<div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm">
						<div className="fade-in zoom-in-95 max-h-[90vh] w-full max-w-2xl animate-in space-y-6 overflow-y-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl duration-200">
							<div className="flex items-center justify-between border-neutral-100 border-b pb-4">
								<div>
									<span className="font-mono font-semibold text-blue-600 text-xs uppercase tracking-wider">
										{selectedFlow.category} • {selectedFlow.regionLock}
									</span>
									<h3 className="mt-0.5 font-bold text-neutral-950 text-xl">
										{selectedFlow.app}: {selectedFlow.flowName}
									</h3>
								</div>
								<button
									type="button"
									onClick={() => setSelectedFlow(null)}
									className="rounded-lg p-1.5 text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
								>
									✕
								</button>
							</div>

							<div className="relative h-64 overflow-hidden rounded-xl bg-neutral-900">
								<img
									src={selectedFlow.heroImage}
									alt={selectedFlow.flowName}
									className="h-full w-full object-cover"
								/>
								<div className="absolute top-3 right-3 rounded bg-black/80 px-2.5 py-1 font-mono text-white text-xs backdrop-blur-md">
									{selectedFlow.screensCount} Total Screens Indexed
								</div>
							</div>

							<div className="grid grid-cols-4 gap-3">
								<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
									<div className="font-mono text-[10px] text-neutral-600">
										AVG TASK TIME
									</div>
									<div className="font-bold font-mono text-lg text-neutral-950">
										{selectedFlow.timeOnTask}
									</div>
								</div>
								<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
									<div className="font-mono text-[10px] text-neutral-600">
										SUCCESS RATE
									</div>
									<div className="font-bold font-mono text-emerald-600 text-lg">
										{selectedFlow.successRate}
									</div>
								</div>
								<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
									<div className="font-mono text-[10px] text-neutral-600">
										ERROR RATE
									</div>
									<div className="font-bold font-mono text-lg text-rose-600">
										{selectedFlow.errorRate}
									</div>
								</div>
								<div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
									<div className="font-mono text-[10px] text-neutral-600">
										UX FRICTION SCORE
									</div>
									<div className="font-bold font-mono text-blue-600 text-lg">
										{selectedFlow.frictionScore}/10
									</div>
								</div>
							</div>

							<div className="space-y-1 rounded-xl border border-blue-200/80 bg-blue-50/70 p-4 text-blue-950 text-xs">
								<div className="flex items-center gap-1.5 font-semibold">
									<Sparkles className="h-3.5 w-3.5 text-blue-600" /> Studio
									Teardown Insight:
								</div>
								<p className="leading-relaxed">{selectedFlow.highlight}</p>
							</div>

							<div className="flex items-center justify-end gap-3 pt-2">
								<button
									type="button"
									onClick={() => setSelectedFlow(null)}
									className="rounded-lg border border-neutral-200 px-4 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-50"
								>
									Close preview
								</button>
								<button
									type="button"
									onClick={() => {
										setSelectedFlow(null);
										document
											.getElementById("pricing")
											?.scrollIntoView({ behavior: "smooth" });
									}}
									className="cursor-pointer rounded-lg bg-[#0052ff] px-4 py-2 font-medium text-white text-xs shadow-sm hover:bg-[#0047e0]"
								>
									Unlock Full Flow in Finance+
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
