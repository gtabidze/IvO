import { ArrowRight, Check, Sparkles } from "lucide-react";
import { useState } from "react";

export default function PricingSection() {
	const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">(
		"annual",
	);

	return (
		<section
			id="pricing"
			className="border-neutral-200/80 border-b bg-white py-24 sm:py-32"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
					<div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 font-medium font-mono text-neutral-800 text-xs">
						<span>TRANSPARENT PRICING • DIRECTORY &amp; STUDIO</span>
					</div>

					<h2 className="font-semibold text-4xl text-neutral-950 leading-[1.05] tracking-[-0.035em] sm:text-6xl">
						Predictable investment. Compounding conversion.
					</h2>

					<p className="font-normal text-base text-neutral-600 leading-relaxed sm:text-xl">
						Access our indexed library of gated competitor flows, or engage our
						senior design engineering studio to evaluate and elevate your
						critical paths.
					</p>

					{/* Billing Cycle Toggle */}
					<div className="flex items-center justify-center pt-4">
						<div className="flex items-center gap-1 rounded-full border border-neutral-200 bg-neutral-100 p-1 font-medium text-xs">
							<button
								type="button"
								onClick={() => setBillingCycle("annual")}
								className={`cursor-pointer rounded-full px-4 py-1.5 transition-all ${
									billingCycle === "annual"
										? "bg-white font-semibold text-neutral-950 shadow-xs"
										: "text-neutral-600 hover:text-neutral-900"
								}`}
							>
								Billed annually{" "}
								<span className="ml-1 font-mono text-[10px] text-emerald-600">
									Save 20%
								</span>
							</button>
							<button
								type="button"
								onClick={() => setBillingCycle("monthly")}
								className={`cursor-pointer rounded-full px-4 py-1.5 transition-all ${
									billingCycle === "monthly"
										? "bg-white font-semibold text-neutral-950 shadow-xs"
										: "text-neutral-600 hover:text-neutral-900"
								}`}
							>
								Billed monthly
							</button>
						</div>
					</div>
				</div>

				{/* 3 Pricing Cards (Matching Mobbin Finance+ Screenshot 4 & Studio Agency model) */}
				<div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-3">
					{/* Card 1: Directory Pass (Mobbin Finance+ exact model) */}
					<div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-[#fbfbfc] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-neutral-300">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-neutral-950 text-xl">
									Finance+ Directory
								</h3>
								<span className="rounded-full border border-neutral-200 bg-neutral-100 px-2.5 py-0.5 font-mono text-[11px] text-neutral-700">
									All Access
								</span>
							</div>

							<div>
								<div className="flex items-baseline gap-2">
									<span className="font-bold font-mono text-5xl text-neutral-950 tracking-tight">
										{billingCycle === "annual" ? "$399" : "$499"}
									</span>
									<span className="font-mono text-neutral-600 text-xs">
										/ month
									</span>
								</div>
								<p className="mt-1 font-mono text-neutral-600 text-xs">
									{billingCycle === "annual"
										? "billed $4,788 yearly"
										: "billed monthly, cancel anytime"}
								</p>
							</div>

							<p className="text-neutral-600 text-xs leading-relaxed">
								For product designers and PMs studying competitor flows behind
								KYC gates, region locks, and deposit minimums.
							</p>

							<div className="space-y-3 border-neutral-200/80 border-t pt-4 text-neutral-700 text-xs">
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										<strong>71+ apps</strong>, all exclusive to Finance+
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										<strong>12+ categories</strong> — banking, crypto, lending,
										prediction markets
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										Full screen recordings &amp; high-res step exports
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										Quantitative UX benchmarks (Time on Task, Error Rate)
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>New apps added weekly by subscriber request</span>
								</div>
							</div>
						</div>

						<div className="pt-8">
							<a
								href="/login"
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 font-medium text-white text-xs shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] sm:text-sm"
							>
								<span>Get Finance+</span>
								<ArrowRight className="h-4 w-4" />
							</a>
						</div>
					</div>

					{/* Card 2: Studio Sprint Audit (Featured BuiltForMars Tier) */}
					<div className="relative flex scale-[1.02] flex-col justify-between rounded-3xl border-2 border-blue-600 bg-white p-8 shadow-xl">
						<div className="absolute -top-3.5 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-blue-600 px-3 py-0.5 font-bold font-mono text-[10px] text-white uppercase tracking-wider shadow-sm">
							<Sparkles className="h-3 w-3" /> MOST POPULAR FOR LAUNCHES
						</div>

						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-neutral-950 text-xl">
									Studio UX Audit
								</h3>
								<span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 font-mono text-[11px] text-blue-700">
									One-Time Sprint
								</span>
							</div>

							<div>
								<div className="flex items-baseline gap-2">
									<span className="font-bold font-mono text-5xl text-neutral-950 tracking-tight">
										$4,800
									</span>
									<span className="font-mono text-neutral-600 text-xs">
										/ flow sprint
									</span>
								</div>
								<p className="mt-1 font-mono text-neutral-600 text-xs">
									Delivered in 10 business days
								</p>
							</div>

							<p className="text-neutral-600 text-xs leading-relaxed">
								A comprehensive, BuiltForMars-grade usability evaluation of your
								critical path (KYC, onboarding, checkout, or deposit) by senior
								design engineers.
							</p>

							<div className="space-y-3 border-neutral-100 border-t pt-4 text-neutral-700 text-xs">
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>
										<strong>
											End-to-end flow capture &amp; telemetry instrumentation
										</strong>
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>
										Usability test with{" "}
										<strong>15 verified target cohort users</strong>
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>
										Nielsen-Norman heuristic scoring &amp; severity ratings
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>
										Interactive video teardown with timestamped friction tags
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>Figma-ready redesign component specifications</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-blue-600" />
									<span>
										Executive debrief presentation with engineering roadmap
									</span>
								</div>
							</div>
						</div>

						<div className="pt-8">
							<a
								href="#studio"
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0052ff] py-3 font-medium text-white text-xs shadow-md transition-all hover:bg-[#0047e0] active:scale-[0.98] sm:text-sm"
							>
								<span>Book a Studio Audit</span>
								<ArrowRight className="h-4 w-4" />
							</a>
						</div>
					</div>

					{/* Card 3: Continuous Evals Retainer */}
					<div className="flex flex-col justify-between rounded-3xl border border-neutral-200/90 bg-[#fbfbfc] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.02)] transition-all hover:border-neutral-300">
						<div className="space-y-6">
							<div className="flex items-center justify-between">
								<h3 className="font-bold text-neutral-950 text-xl">
									Continuous Evals
								</h3>
								<span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 font-mono text-[11px] text-emerald-700">
									Studio Retainer
								</span>
							</div>

							<div>
								<div className="flex items-baseline gap-2">
									<span className="font-bold font-mono text-5xl text-neutral-950 tracking-tight">
										$8,500
									</span>
									<span className="font-mono text-neutral-600 text-xs">
										/ month
									</span>
								</div>
								<p className="mt-1 font-mono text-neutral-600 text-xs">
									Continuous CI/CD for UX &amp; conversion
								</p>
							</div>

							<p className="text-neutral-600 text-xs leading-relaxed">
								For scale-up product teams that ship weekly and need continuous
								usability testing, regression detection, and ongoing competitor
								monitoring.
							</p>

							<div className="space-y-3 border-neutral-200/80 border-t pt-4 text-neutral-700 text-xs">
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>Full access to IvO Observability Platform</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										Monthly usability regression audits on every major release
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>
										Continuous competitor release alerts &amp; diff teardowns
									</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>Dedicated senior design engineer on Slack</span>
								</div>
								<div className="flex items-center gap-2.5">
									<Check className="h-4 w-4 shrink-0 text-emerald-600" />
									<span>Unlimited team seats &amp; Figma library sync</span>
								</div>
							</div>
						</div>

						<div className="pt-8">
							<a
								href="#studio"
								className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 font-medium text-white text-xs shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] sm:text-sm"
							>
								<span>Contact studio partners</span>
								<ArrowRight className="h-4 w-4" />
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
