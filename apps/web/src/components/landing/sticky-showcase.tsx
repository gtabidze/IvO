import {
	ArrowRight,
	Check,
	ChevronLeft,
	ChevronRight,
	Play,
} from "lucide-react";
import { useState } from "react";

export default function StickyShowcase() {
	const [activePillar, setActivePillar] = useState("WORKFLOW");
	const [carouselOffset, setCarouselOffset] = useState(0);

	const pillars = [
		{ id: "WORKFLOW", label: "WORKFLOW", anchor: "#workflow" },
		{ id: "PLATFORM", label: "PLATFORM", anchor: "#platform" },
		{ id: "SCALE", label: "SCALE", anchor: "#scale" },
		{ id: "SECURITY", label: "SECURITY", anchor: "#security" },
		{ id: "CUSTOMERS", label: "CUSTOMERS", anchor: "#customers" },
	];

	const handlePrev = () => {
		setCarouselOffset((prev) => Math.max(prev - 1, 0));
	};

	const handleNext = () => {
		setCarouselOffset((prev) => Math.min(prev + 1, 1));
	};

	return (
		<section
			id="observability"
			className="border-neutral-200/80 border-b bg-white py-20 sm:py-28"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
					{/* Left Sticky Sidebar (Braintrust Nav Style) */}
					<div className="lg:col-span-3">
						<div className="space-y-4 lg:sticky lg:top-24">
							<span className="mb-6 block font-mono font-semibold text-[11px] text-neutral-600 uppercase tracking-[0.2em]">
								PILLARS
							</span>

							<div className="flex flex-row gap-4 overflow-x-auto pb-2 lg:flex-col lg:pb-0">
								{pillars.map((p) => {
									const isActive = activePillar === p.id;
									return (
										<button
											key={p.id}
											type="button"
											onClick={() => setActivePillar(p.id)}
											className="group flex cursor-pointer items-center gap-3 whitespace-nowrap text-left"
										>
											<div
												className={`h-[2px] transition-all duration-200 ${
													isActive
														? "w-4 bg-neutral-900"
														: "w-0 bg-transparent group-hover:w-2 group-hover:bg-neutral-400"
												}`}
											/>
											<span
												className={`font-mono text-xs tracking-wider transition-colors ${
													isActive
														? "font-bold text-neutral-950"
														: "text-neutral-600 group-hover:text-neutral-800"
												}`}
											>
												{p.label}
											</span>
										</button>
									);
								})}
							</div>

							<div className="hidden pt-10 text-neutral-600 text-xs leading-relaxed lg:block">
								A unified observability pipeline connecting user intent
								telemetry to production outcome metrics.
							</div>
						</div>
					</div>

					{/* Right Content Area: Header & Carousel Cards */}
					<div className="lg:col-span-9">
						<div className="mb-8 flex items-center justify-between">
							<h2 className="font-semibold text-2xl text-neutral-950 tracking-[-0.03em] sm:text-4xl">
								Everything you need to build smarter, faster
							</h2>

							{/* Carousel Control Buttons */}
							<div className="hidden items-center gap-2 sm:flex">
								<button
									type="button"
									onClick={handlePrev}
									disabled={carouselOffset === 0}
									className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:border-neutral-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
									aria-label="Previous card"
								>
									<ChevronLeft className="h-4 w-4" />
								</button>
								<button
									type="button"
									onClick={handleNext}
									disabled={carouselOffset >= 1}
									className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:border-neutral-400 hover:text-neutral-950 disabled:cursor-not-allowed disabled:opacity-30"
									aria-label="Next card"
								>
									<ChevronRight className="h-4 w-4" />
								</button>
							</div>
						</div>

						{/* 3 Interactive Cards (Braintrust Screenshot 2 Layout) */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
							{/* Card 1: Loop Agent */}
							<div className="group flex flex-col">
								<div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/60 bg-gradient-to-b from-[#e5e9f7] to-[#d6def7] p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
									{/* Floating Dark Card (Emil Kowalski micro-craft) */}
									<div className="w-full max-w-[260px] space-y-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-white shadow-xl">
										<div className="flex items-center justify-between">
											<div className="inline-flex items-center gap-1.5 rounded-md bg-neutral-800 px-2 py-0.5 font-mono text-[10px] text-purple-300">
												<span>⚡️</span>
												<span>Checkout flow prompt</span>
											</div>
										</div>
										<p className="font-normal text-[11.5px] text-neutral-300 leading-snug">
											Optimize KYC drop-off step based on automated user
											telemetry &amp; latency scores
										</p>
										<div className="flex items-center justify-between border-neutral-800 border-t pt-1 font-mono text-[10px] text-neutral-600">
											<span>Claude 4.5 Sonnet</span>
											<span>↑</span>
										</div>
										<button
											type="button"
											className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] py-1.5 font-medium text-white text-xs shadow-md transition-colors hover:bg-[#0047e0]"
										>
											<span>Loop agent</span>
											<span className="text-[10px]">♾️</span>
										</button>
									</div>
								</div>

								{/* Metadata below Card 1 */}
								<div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
									<div>
										<h3 className="font-semibold text-base text-neutral-950">
											Loop agent
										</h3>
										<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
											AI that helps you improve product flows. Describe what you
											want to optimize, and Loop generates better UX copy,
											micro-interactions, and evals automatically.
										</p>
									</div>
									<div>
										<a
											href="#evals"
											className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 text-xs transition-colors hover:text-neutral-950"
										>
											<span>Optimize your evals</span>
											<ArrowRight className="h-3 w-3" />
										</a>
									</div>
								</div>
							</div>

							{/* Card 2: Pattern Automations */}
							<div className="group flex flex-col">
								<div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950 p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
									{/* Subtle stipple / grain pattern */}
									<div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-25 [background-size:16px_16px]" />

									{/* Floating Light Card */}
									<div className="relative w-full max-w-[260px] space-y-3 rounded-xl border border-neutral-200 bg-white p-4 text-neutral-950 shadow-xl">
										<div className="flex items-center justify-between font-mono text-[10px]">
											<span className="flex items-center gap-1 font-semibold text-blue-600">
												<span>[⊞]</span> Patterns
											</span>
											<span className="text-neutral-600">Example</span>
										</div>
										<div>
											<h4 className="font-bold text-neutral-950 text-xs leading-tight">
												User abandons at SMS 2FA
											</h4>
											<p className="mt-0.5 font-mono text-[10px] text-neutral-600">
												24 affected sessions • Last 48 hrs
											</p>
										</div>
										<div className="space-y-1 rounded-lg border border-neutral-200/80 bg-neutral-50 p-2 font-mono text-[10px] text-neutral-700">
											<div className="text-neutral-600">Evidence:</div>
											<div className="font-medium text-rose-600">
												otp_delivery_latency: 48.2s
											</div>
											<div className="text-neutral-600">
												auth_status: "timeout"
											</div>
										</div>
										<div className="text-[10px] text-neutral-600">
											<strong className="text-neutral-900">
												Suggested fix:
											</strong>{" "}
											Switch to WhatsApp OTP fallback after 15s.
										</div>
									</div>
								</div>

								{/* Metadata below Card 2 */}
								<div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
									<div>
										<h3 className="font-semibold text-base text-neutral-950">
											Pattern automations
										</h3>
										<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
											Patterns is an automation that identifies recurring
											drop-off friction across production traces. Discover
											behavioral bottlenecks before they hurt revenue.
										</p>
									</div>
									<div>
										<a
											href="#evals"
											className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 text-xs transition-colors hover:text-neutral-950"
										>
											<span>Investigate your traces</span>
											<ArrowRight className="h-3 w-3" />
										</a>
									</div>
								</div>
							</div>

							{/* Card 3: Task-Specific Trace Views */}
							<div className="group flex flex-col">
								<div className="relative flex h-80 items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-[#3b1523] p-4 shadow-sm transition-transform duration-300 group-hover:-translate-y-1">
									{/* Floating Trace & Video Annotation Card */}
									<div className="w-full max-w-[260px] space-y-2.5 rounded-xl border border-neutral-200 bg-white p-3 text-neutral-950 shadow-2xl">
										<div className="flex items-center justify-between">
											<span className="rounded bg-purple-100 px-1.5 py-0.5 font-medium font-mono text-[10px] text-purple-800">
												Active session trace
											</span>
											<span className="font-mono text-[10px] text-neutral-600">
												00:42
											</span>
										</div>

										{/* Video Preview with Overlay */}
										<div className="group/vid relative flex h-24 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
											<img
												src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
												alt="User Session Telemetry Walkthrough"
												className="h-full w-full object-cover opacity-60"
											/>
											<div className="absolute flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-lg transition-transform group-hover/vid:scale-110">
												<Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
											</div>
											<div className="absolute right-1 bottom-1 rounded bg-black/75 px-1 font-mono text-[9px] text-white">
												0:42
											</div>
										</div>

										{/* Review Actions (BuiltForMars / Braintrust style) */}
										<div className="flex items-center gap-1.5 pt-1">
											<button
												type="button"
												className="flex flex-1 items-center justify-center gap-1 rounded-md bg-[#004d33] py-1 font-medium text-[10px] text-white"
											>
												<Check className="h-3 w-3" /> Approve
											</button>
											<button
												type="button"
												className="rounded-md border border-neutral-200 px-2 py-1 font-medium text-[10px] text-neutral-700"
											>
												Reject
											</button>
										</div>
										<div className="rounded border border-neutral-100 bg-neutral-50 p-1.5 text-[10px] text-neutral-600 italic">
											"Reduce KYC camera glare warning threshold."
										</div>
									</div>
								</div>

								{/* Metadata below Card 3 */}
								<div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
									<div>
										<h3 className="font-semibold text-base text-neutral-950">
											Task-specific trace views
										</h3>
										<p className="mt-1 text-neutral-600 text-xs leading-relaxed">
											Build annotation interfaces that match your design team's
											workflow. Review onboarding flows differently than
											payments, with zero frontend engineering required.
										</p>
									</div>
									<div>
										<a
											href="#studio"
											className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 font-medium text-neutral-700 text-xs transition-colors hover:text-neutral-950"
										>
											<span>Build custom views</span>
											<ArrowRight className="h-3 w-3" />
										</a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
