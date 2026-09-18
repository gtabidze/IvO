import { CheckCircle2, HelpCircle, Sparkles, XCircle } from "lucide-react";
import { useState } from "react";
import { AUDIT_CASE_STUDY } from "../../data/audit-demo";

export default function AuditTeardown() {
	const [activeStepId, setActiveStepId] = useState(1);
	const activeStep =
		AUDIT_CASE_STUDY.steps.find((s) => s.id === activeStepId) ||
		AUDIT_CASE_STUDY.steps[0];

	return (
		<section
			id="studio"
			className="border-neutral-200/80 border-b bg-neutral-50/70 py-24 sm:py-32"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<div className="mb-16 max-w-3xl">
					<div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50 px-3 py-1 font-mono font-semibold text-blue-700 text-xs">
						<span>INTENT V. OUTCOME STUDIO • BUILTFORMARS-GRADE AUDITS</span>
					</div>

					<h2 className="font-semibold text-4xl text-neutral-950 leading-[1.05] tracking-[-0.035em] sm:text-6xl">
						Usability evaluations with surgical precision.
					</h2>

					<p className="mt-4 font-normal text-base text-neutral-600 leading-relaxed sm:text-xl">
						We invite your team into IvO, instrument your user flows, and run
						rigorous usability evaluations with live user cohorts. You get
						quantified telemetry and Figma-ready teardown recommendations.
					</p>
				</div>

				{/* Interactive Studio Teardown Showcase Card */}
				<div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-xl">
					{/* Header bar of the Teardown */}
					<div className="flex flex-col justify-between gap-6 bg-neutral-950 p-6 text-white sm:p-8 md:flex-row md:items-center">
						<div className="space-y-1">
							<div className="flex items-center gap-2 font-mono text-emerald-400 text-xs">
								<span>● LIVE CASE STUDY</span>
								<span className="text-neutral-600">/</span>
								<span className="text-neutral-400">
									{AUDIT_CASE_STUDY.industry}
								</span>
							</div>
							<h3 className="font-bold text-white text-xl tracking-tight sm:text-2xl">
								{AUDIT_CASE_STUDY.title}
							</h3>
							<p className="max-w-2xl text-neutral-400 text-xs sm:text-sm">
								{AUDIT_CASE_STUDY.subtitle}
							</p>
						</div>

						{/* Quick Benchmark Comparison Pills */}
						<div className="flex items-center gap-4 border-neutral-800 border-t pt-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
							<div className="text-left">
								<div className="font-mono text-[10px] text-neutral-600 uppercase">
									REVOLUT AVG TIME
								</div>
								<div className="font-bold font-mono text-emerald-400 text-lg">
									{AUDIT_CASE_STUDY.benchmarkSummary.revolutAvgTime}
								</div>
								<div className="font-mono text-[10px] text-neutral-400">
									{AUDIT_CASE_STUDY.benchmarkSummary.revolutSuccessRate} success
								</div>
							</div>
							<div className="h-8 w-[1px] bg-neutral-800" />
							<div className="text-left">
								<div className="font-mono text-[10px] text-neutral-600 uppercase">
									MONZO AVG TIME
								</div>
								<div className="font-bold font-mono text-lg text-neutral-300">
									{AUDIT_CASE_STUDY.benchmarkSummary.monzoAvgTime}
								</div>
								<div className="font-mono text-[10px] text-neutral-400">
									{AUDIT_CASE_STUDY.benchmarkSummary.monzoSuccessRate} success
								</div>
							</div>
						</div>
					</div>

					{/* Step Navigation Bar */}
					<div className="flex items-center gap-2 overflow-x-auto border-neutral-200 border-b bg-neutral-50/60 px-6 py-3">
						{AUDIT_CASE_STUDY.steps.map((step) => {
							const isActive = step.id === activeStepId;
							return (
								<button
									key={step.id}
									type="button"
									onClick={() => setActiveStepId(step.id)}
									className={`flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2 font-medium text-xs tracking-tight transition-all ${
										isActive
											? "border border-neutral-200 bg-white font-semibold text-neutral-950 shadow-sm"
											: "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-950"
									}`}
								>
									<span
										className={`flex h-5 w-5 items-center justify-center rounded-full font-bold font-mono text-[10px] ${
											isActive
												? "bg-blue-600 text-white"
												: "bg-neutral-200 text-neutral-700"
										}`}
									>
										{step.id}
									</span>
									<span>{step.title}</span>
								</button>
							);
						})}
					</div>

					{/* Active Step Teardown Body */}
					<div className="space-y-8 p-6 sm:p-8">
						<div className="flex items-center justify-between">
							<span className="font-mono text-neutral-600 text-xs uppercase tracking-wider">
								{activeStep.flowStage}
							</span>
							<span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-blue-600 text-xs">
								Telemetry timestamp: {activeStep.timestamp}
							</span>
						</div>

						{/* Side-by-side Flow Comparison */}
						<div className="grid grid-cols-1 gap-8 md:grid-cols-2">
							{/* App A: Revolut */}
							<div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0052ff] font-bold text-white text-xs">
											R
										</div>
										<span className="font-semibold text-neutral-950 text-sm">
											{activeStep.appA.name}
										</span>
									</div>
									<div className="flex items-center gap-3 font-mono text-xs">
										<span className="text-neutral-600">Task time:</span>
										<strong className="font-bold text-neutral-900">
											{activeStep.appA.timeOnTask}
										</strong>
										<span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-[10px] text-emerald-800">
											{activeStep.appA.heuristicsRating} / 10
										</span>
									</div>
								</div>

								<div className="relative h-52 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900">
									<img
										src={activeStep.appA.screenImage}
										alt={activeStep.appA.name}
										className="h-full w-full object-cover"
									/>
									<div className="absolute top-2 left-2 rounded bg-neutral-950/80 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
										Production UI Screen
									</div>
								</div>

								{/* Friction / Heuristic Points */}
								<div className="space-y-2 pt-2">
									{activeStep.appA.frictionPoints.map((fp, i) => (
										<div
											key={i}
											className="flex items-start gap-2.5 rounded-xl border border-emerald-200/60 bg-white p-3 shadow-xs"
										>
											<CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
											<div>
												<div className="font-semibold text-neutral-900 text-xs">
													{fp.label}
												</div>
												<div className="mt-0.5 text-[11px] text-neutral-600 leading-relaxed">
													{fp.description}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* App B: Monzo */}
							<div className="space-y-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/40 p-6">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-2">
										<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 font-bold text-white text-xs">
											M
										</div>
										<span className="font-semibold text-neutral-950 text-sm">
											{activeStep.appB.name}
										</span>
									</div>
									<div className="flex items-center gap-3 font-mono text-xs">
										<span className="text-neutral-600">Task time:</span>
										<strong className="font-bold text-neutral-900">
											{activeStep.appB.timeOnTask}
										</strong>
										<span className="rounded bg-amber-100 px-2 py-0.5 font-semibold text-[10px] text-amber-800">
											{activeStep.appB.heuristicsRating} / 10
										</span>
									</div>
								</div>

								<div className="relative h-52 overflow-hidden rounded-xl border border-neutral-200 bg-neutral-900">
									<img
										src={activeStep.appB.screenImage}
										alt={activeStep.appB.name}
										className="h-full w-full object-cover"
									/>
									<div className="absolute top-2 left-2 rounded bg-neutral-950/80 px-2 py-0.5 font-mono text-[10px] text-white backdrop-blur-md">
										Production UI Screen
									</div>
								</div>

								{/* Friction / Heuristic Points */}
								<div className="space-y-2 pt-2">
									{activeStep.appB.frictionPoints.map((fp, i) => (
										<div
											key={i}
											className={`flex items-start gap-2.5 rounded-xl bg-white p-3 shadow-xs ${
												fp.severity === "critical"
													? "border border-rose-200"
													: "border border-amber-200"
											}`}
										>
											{fp.severity === "critical" ? (
												<XCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" />
											) : (
												<HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
											)}
											<div>
												<div className="font-semibold text-neutral-900 text-xs">
													{fp.label}
												</div>
												<div className="mt-0.5 text-[11px] text-neutral-600 leading-relaxed">
													{fp.description}
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						</div>

						{/* Studio Takeaway Banner (BuiltForMars Recommendation style) */}
						<div className="flex flex-col justify-between gap-4 rounded-2xl bg-neutral-950 p-5 text-white sm:flex-row sm:items-center">
							<div className="flex items-start gap-3">
								<div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
									<Sparkles className="h-4 w-4" />
								</div>
								<div>
									<span className="font-mono font-semibold text-[11px] text-blue-400 uppercase tracking-wide">
										STUDIO RECOMMENDATION
									</span>
									<p className="mt-0.5 font-normal text-neutral-200 text-xs leading-relaxed sm:text-sm">
										{activeStep.studioTakeaway}
									</p>
								</div>
							</div>
							<a
								href="#pricing"
								className="whitespace-nowrap rounded-lg bg-white px-4 py-2 font-medium text-neutral-950 text-xs shadow-sm transition-all hover:bg-neutral-100"
							>
								Audit your app
							</a>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
