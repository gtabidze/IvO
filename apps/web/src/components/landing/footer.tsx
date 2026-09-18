import { ArrowRight } from "lucide-react";

export default function Footer() {
	return (
		<footer className="bg-neutral-950 pt-20 pb-12 text-white">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Pre-footer Call to Action Banner */}
				<div className="relative mb-20 space-y-6 overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 p-8 text-center sm:p-14">
					<div className="mx-auto max-w-2xl space-y-4">
						<span className="font-mono font-semibold text-blue-400 text-xs uppercase tracking-widest">
							GET STARTED TODAY
						</span>
						<h3 className="font-semibold text-3xl text-white leading-tight tracking-tight sm:text-5xl">
							Ready to eliminate the gap between Intent and Outcome?
						</h3>
						<p className="text-neutral-400 text-sm leading-relaxed sm:text-base">
							Join top product and design engineers studying competitor user
							flows and running surgical usability evaluations.
						</p>
					</div>

					<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
						<a
							href="#directory"
							className="inline-flex items-center gap-2 rounded-lg bg-[#0052ff] px-6 py-3 font-medium text-sm text-white shadow-md transition-all hover:bg-[#0047e0] active:scale-[0.98]"
						>
							<span>Explore Finance+ Directory</span>
							<ArrowRight className="h-4 w-4" />
						</a>
						<a
							href="#studio"
							className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 bg-neutral-800 px-6 py-3 font-medium text-sm text-white transition-all hover:bg-neutral-700 active:scale-[0.98]"
						>
							<span>Book a Studio Usability Audit</span>
						</a>
					</div>
				</div>

				{/* Footer Links Grid */}
				<div className="grid grid-cols-2 gap-8 border-neutral-800 border-b pb-16 text-xs md:grid-cols-5">
					{/* Brand Column */}
					<div className="col-span-2 space-y-4">
						<div className="flex items-center gap-2.5">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 font-bold font-mono text-white text-xs">
								I
							</div>
							<span className="font-bold text-base text-white tracking-tight">
								IvO
							</span>
						</div>
						<p className="max-w-sm text-neutral-400 text-xs leading-relaxed">
							One platform for user behavior observability, competitive UX
							benchmarking, and studio usability evaluations. Operated by
							product design studio Intent V. Outcome.
						</p>
						<div className="flex items-center gap-2 pt-2">
							<span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
							<span className="font-mono text-[11px] text-neutral-400">
								All Systems Operational • 4,820 Flows Indexed
							</span>
						</div>
					</div>

					{/* Platform */}
					<div className="space-y-3">
						<div className="font-mono font-semibold text-[11px] text-neutral-500 uppercase tracking-wider">
							Platform
						</div>
						<ul className="space-y-2 text-neutral-400">
							<li>
								<a
									href="#directory"
									className="transition-colors hover:text-white"
								>
									Directory (Finance+)
								</a>
							</li>
							<li>
								<a
									href="#observability"
									className="transition-colors hover:text-white"
								>
									Observability Engine
								</a>
							</li>
							<li>
								<a href="#evals" className="transition-colors hover:text-white">
									UX Evals Pipeline
								</a>
							</li>
							<li>
								<a
									href="#benchmarks"
									className="transition-colors hover:text-white"
								>
									Comparative Benchmarks
								</a>
							</li>
							<li>
								<a
									href="#pricing"
									className="transition-colors hover:text-white"
								>
									Pricing &amp; Plans
								</a>
							</li>
						</ul>
					</div>

					{/* Sectors */}
					<div className="space-y-3">
						<div className="font-mono font-semibold text-[11px] text-neutral-500 uppercase tracking-wider">
							Sectors
						</div>
						<ul className="space-y-2 text-neutral-400">
							<li>
								<span className="font-medium text-white">
									Finance &amp; Banking
								</span>{" "}
								<span className="font-mono text-[10px] text-emerald-400">
									Live
								</span>
							</li>
							<li>
								<span className="text-neutral-400">iGaming &amp; Gambling</span>{" "}
								<span className="font-mono text-[10px] text-neutral-400">
									Q2
								</span>
							</li>
							<li>
								<span className="text-neutral-400">
									E-Commerce &amp; Retail
								</span>{" "}
								<span className="font-mono text-[10px] text-neutral-400">
									Q3
								</span>
							</li>
							<li>
								<span className="text-neutral-400">Health &amp; Medical</span>{" "}
								<span className="font-mono text-[10px] text-neutral-400">
									Q4
								</span>
							</li>
						</ul>
					</div>

					{/* Agency */}
					<div className="space-y-3">
						<div className="font-mono font-semibold text-[11px] text-neutral-500 uppercase tracking-wider">
							IvO Studio
						</div>
						<ul className="space-y-2 text-neutral-400">
							<li>
								<a
									href="#studio"
									className="transition-colors hover:text-white"
								>
									BuiltForMars Audits
								</a>
							</li>
							<li>
								<a
									href="#studio"
									className="transition-colors hover:text-white"
								>
									Continuous Retainers
								</a>
							</li>
							<li>
								<a
									href="#studio"
									className="transition-colors hover:text-white"
								>
									Cohort Recruitment
								</a>
							</li>
							<li>
								<a
									href="#pricing"
									className="transition-colors hover:text-white"
								>
									Request Teardown
								</a>
							</li>
							<li>
								<a href="/login" className="transition-colors hover:text-white">
									Client Portal Sign in
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Copyright Bottom Bar */}
				<div className="flex flex-col items-center justify-between gap-4 pt-8 font-mono text-[11px] text-neutral-400 sm:flex-row">
					<div>
						&copy; {new Date().getFullYear()} Intent V. Outcome Ltd. All rights
						reserved.
					</div>
					<div className="flex items-center gap-6">
						<a href="#privacy" className="transition-colors hover:text-white">
							Privacy Policy
						</a>
						<a href="#terms" className="transition-colors hover:text-white">
							Terms of Service
						</a>
						<a href="#security" className="transition-colors hover:text-white">
							Security &amp; Compliance
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
