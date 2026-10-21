import {
	ArrowUpRight,
	Camera,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Layers,
	MessageSquare,
	Play,
	ShieldCheck,
	Sliders,
	Sparkles,
	Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { HexAgentGlyph } from "@/components/agents/agent-avatar";

type SectionId = "workflow" | "platform" | "early-feedback";
type HubPill = "review" | "check" | "evaluate";

const SHIFT_PILLARS = [
	{
		id: "expand-clarity",
		title: "Expand contributors without losing clarity",
		description:
			"Let anyone ship AI-assisted changes while shared flow baselines keep product direction and intent locked in.",
		icon: Users,
	},
	{
		id: "deliberate-friction",
		title: "Deliberate friction over raw output",
		description:
			"Know when to slow down and require human sign-off on high-stakes UX decisions instead of optimizing for velocity alone.",
		icon: Sliders,
	},
	{
		id: "evolve-roles",
		title: "Evolve PM, Design, and Engineering roles",
		description:
			"Move from siloed handoffs to shared ownership—collaborating directly on live user flows in a single hub.",
		icon: Layers,
	},
	{
		id: "taste-moat",
		title: "Judgment, taste, and quality as the moat",
		description:
			"As building gets easier, design thinking, human taste, and rigorous technical verification become more valuable.",
		icon: Sparkles,
	},
] as const;

interface SidenavProps {
	activeSection: SectionId;
	onSelect: (id: SectionId) => void;
	isDark: boolean;
}

function Sidenav({ activeSection, onSelect, isDark }: SidenavProps) {
	const items: { id: SectionId; label: string }[] = [
		{ id: "workflow", label: "WORKFLOW" },
		{ id: "platform", label: "PLATFORM" },
		{ id: "early-feedback", label: "EARLY FEEDBACK" },
	];

	return (
		<nav aria-label="Showcase Pillars Navigation" className="space-y-4">
			<div className="flex flex-col gap-3">
				{items.map((item) => {
					const isActive = activeSection === item.id;
					return (
						<button
							key={item.id}
							type="button"
							onClick={() => onSelect(item.id)}
							className="group flex cursor-pointer items-center gap-2.5 text-start transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-neutral-900 focus-visible:outline-offset-2"
						>
							<span
								className={`font-bold font-mono text-xs transition-opacity duration-150 ${
									isActive
										? isDark
											? "text-white opacity-100"
											: "text-neutral-950 opacity-100"
										: "opacity-0"
								}`}
							>
								•
							</span>
							<span
								className={`font-mono text-xs uppercase tracking-[0.18em] transition-colors duration-150 ${
									isActive
										? isDark
											? "font-bold text-white"
											: "font-bold text-neutral-950"
										: isDark
											? "font-normal text-neutral-500 hover:text-neutral-300"
											: "font-normal text-neutral-400 hover:text-neutral-700"
								}`}
							>
								{item.label}
							</span>
						</button>
					);
				})}
			</div>
		</nav>
	);
}

interface FeatureCard {
	id: string;
	title: string;
	description: string;
	actionLabel: string;
	actionHref: string;
	mockType: "loop" | "pattern" | "video" | "evals" | "benchmark";
}

const FEATURES: FeatureCard[] = [
	{
		id: "loop-agent",
		title: "Loop agent",
		description:
			"AI that helps you improve agents. Describe what you want to optimize, and Loop generates better prompts, scorers, and datasets automatically.",
		actionLabel: "Optimize your evals",
		actionHref: "#evals",
		mockType: "loop",
	},
	{
		id: "pattern-automations",
		title: "Pattern automations",
		description:
			"Patterns is an automation that identifies recurring issues and opportunities across production traces. Find recurring behavior worth investigating.",
		actionLabel: "Investigate your traces",
		actionHref: "#traces",
		mockType: "pattern",
	},
	{
		id: "task-specific-views",
		title: "Task-specific trace views",
		description:
			"Build annotation interfaces that match your team's workflow. Review support conversations differently than code generation, with no frontend work required.",
		actionLabel: "Build custom views",
		actionHref: "#views",
		mockType: "video",
	},
	{
		id: "adversarial-testing",
		title: "Adversarial stress-testing",
		description:
			"Simulate edge cases, network drops, and compliance failures before pushing to production with autonomous synthetic cohorts.",
		actionLabel: "Run synthetic tests",
		actionHref: "#synthetic",
		mockType: "evals",
	},
	{
		id: "release-diff",
		title: "Release diff benchmarking",
		description:
			"Compare step counts, friction scores, and latencies across releases and benchmark directly against competitor flows.",
		actionLabel: "View benchmarks",
		actionHref: "#benchmarks",
		mockType: "benchmark",
	},
];

export default function LandingShowcase() {
	const [activeSection, setActiveSection] = useState<SectionId>("workflow");
	const [activePill, setActivePill] = useState<HubPill>("review");
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Subtle auto-cycle across Review / Check / Evaluate (respects reduced motion)
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			window.matchMedia("(prefers-reduced-motion: reduce)").matches
		) {
			return;
		}
		const order: HubPill[] = ["review", "check", "evaluate"];
		const timer = window.setInterval(() => {
			setActivePill((prev) => order[(order.indexOf(prev) + 1) % order.length]);
		}, 3600);
		return () => window.clearInterval(timer);
	}, []);

	// Single source-of-truth scroll spy
	useEffect(() => {
		const sectionIds: SectionId[] = ["workflow", "platform", "early-feedback"];

		const handleScroll = () => {
			const threshold = 180; // Distance from viewport top where section activates

			for (let i = sectionIds.length - 1; i >= 0; i--) {
				const id = sectionIds[i];
				const el = document.getElementById(id);
				if (el) {
					const rect = el.getBoundingClientRect();
					if (rect.top <= threshold) {
						setActiveSection(id);
						return;
					}
				}
			}
			setActiveSection("workflow");
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		handleScroll();
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const scrollToSection = (id: SectionId) => {
		const el = document.getElementById(id);
		if (el) {
			const topOffset = 80;
			const targetPos =
				el.getBoundingClientRect().top + window.scrollY - topOffset;
			window.scrollTo({
				top: targetPos,
				behavior: "smooth",
			});
			setActiveSection(id);
		}
	};

	const scrollPrev = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: -380, behavior: "smooth" });
		}
	};

	const scrollNext = () => {
		if (scrollContainerRef.current) {
			scrollContainerRef.current.scrollBy({ left: 380, behavior: "smooth" });
		}
	};

	const isDark = activeSection === "early-feedback";

	return (
		<div className="relative w-full">
			{/* Persistent Desktop Sidebar: Exactly ONE instance on the entire page! */}
			<div className="pointer-events-none absolute inset-0 z-30 mx-auto hidden max-w-7xl px-4 sm:px-6 lg:block lg:px-8">
				<div className="grid h-full grid-cols-12 gap-12">
					<div className="col-span-3 h-full">
						<div className="pointer-events-auto sticky top-24 pt-20 sm:pt-28">
							<Sidenav
								activeSection={activeSection}
								onSelect={scrollToSection}
								isDark={isDark}
							/>
						</div>
					</div>
				</div>
			</div>

			{/* ========================================================================= */}
			{/* SECTION 1: WORKFLOW — What this shift means for product teams             */}
			{/* ========================================================================= */}
			<section
				id="workflow"
				className="relative w-full border-neutral-200/80 border-b bg-white py-20 sm:py-28"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
						{/* Spacer on Desktop (where the single sidebar sticks); Mobile Nav on Mobile */}
						<div className="lg:col-span-3">
							<div className="block lg:hidden">
								<Sidenav
									activeSection={activeSection}
									onSelect={scrollToSection}
									isDark={false}
								/>
							</div>
						</div>

						{/* Right Content Area */}
						<div className="min-w-0 space-y-10 lg:col-span-9">
							{/* Concise Header Block */}
							<div className="max-w-3xl space-y-3">
								<div className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1 font-mono text-[11px] text-neutral-700 uppercase tracking-[0.14em]">
									<span className="h-1.5 w-1.5 rounded-full bg-[#831843]" />
									<span>What this shift means for product teams</span>
								</div>

								<h2 className="text-balance font-semibold text-3xl text-neutral-950 leading-[1.15] tracking-[-0.035em] sm:text-4xl md:text-[42px]">
									<span>
										Real humans review. Competence agents check &amp; evaluate.{" "}
									</span>
									<span className="text-[#831843]">
										Product increments in a single hub.
									</span>
								</h2>
							</div>

							{/* ===================================================================== */}
							{/* SIMPLIFIED LIGHT/GRAY ARCHITECTURE DIAGRAM                            */}
							{/* Code changes -> User Flow View (Review, Check, Evaluate) <- Actors   */}
							{/* ===================================================================== */}
							<div className="relative overflow-hidden rounded-3xl bg-[#f7f7f9] p-6 shadow-[0_0_0_1px_oklch(0_0_0/0.07),0_4px_20px_-4px_oklch(0_0_0/0.04)] sm:p-10">
								{/* Subtle structural column dividers on desktop (matching reference) */}
								<div
									aria-hidden="true"
									className="pointer-events-none absolute inset-y-8 left-[28%] hidden w-px bg-neutral-200/90 lg:block"
								/>
								<div
									aria-hidden="true"
									className="pointer-events-none absolute inset-y-8 left-[71%] hidden w-px bg-neutral-200/90 lg:block"
								/>

								{/* Top Return Loop Arrow (Desktop): Actors -> Central User Flow Hub */}
								<div className="relative mx-auto hidden h-12 max-w-4xl lg:block">
									<span className="absolute -top-1 left-[58%] -translate-x-1/2 bg-[#f7f7f9] px-2.5 font-medium text-neutral-600 text-xs">
										Observe · Evaluate · Improve
									</span>
									<svg
										className="h-full w-full overflow-visible"
										viewBox="0 0 800 48"
										fill="none"
										aria-hidden="true"
									>
										{/* Feedback line from right actors (x=660) curving back into center hub (x=400) */}
										<path
											d="M 660 46 L 660 18 Q 660 8 650 8 L 410 8 Q 400 8 400 18 L 400 42"
											stroke="#a3a3a3"
											strokeWidth="1.5"
											fill="none"
										/>
										{/* Arrowhead pointing down into center hub */}
										<path
											d="M 395 36 L 400 43 L 405 36"
											stroke="#a3a3a3"
											strokeWidth="1.5"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</div>

								{/* 3-Column Flow Layout */}
								<div className="relative z-10 grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-0">
									{/* --------------------------------------------------------------- */}
									{/* 1. LEFT: CODE CHANGES                                           */}
									{/* --------------------------------------------------------------- */}
									<div className="flex flex-col items-center lg:col-span-3">
										<div className="w-full max-w-[210px] rounded-xl bg-neutral-900 p-3.5 text-left font-mono text-[11px] shadow-md">
											<div className="mb-2.5 flex items-center gap-1.5">
												<span className="h-2 w-2 rounded-full bg-neutral-700" />
												<span className="h-2 w-2 rounded-full bg-neutral-700" />
												<span className="h-2 w-2 rounded-full bg-neutral-700" />
											</div>
											<div className="space-y-1.5 leading-snug">
												<div className="truncate text-rose-400">
													- old_flow_step(param);
												</div>
												<div className="h-px w-full bg-neutral-800" />
												<div className="text-emerald-400">
													+ new_flow_step(param,
													<br />
													&nbsp;&nbsp;verified_check);
												</div>
											</div>
										</div>
										<span className="mt-3 font-medium text-neutral-900 text-sm">
											Code changes
										</span>
									</div>

									{/* Arrow: Code changes -> User Flow View */}
									<div
										aria-hidden="true"
										className="hidden items-center justify-center lg:col-span-1 lg:flex"
									>
										<svg
											className="h-6 w-full overflow-visible"
											viewBox="0 0 60 24"
											fill="none"
										>
											<line
												x1="0"
												y1="12"
												x2="54"
												y2="12"
												stroke="#a3a3a3"
												strokeWidth="1.5"
											/>
											<path
												d="M 48 7 L 55 12 L 48 17"
												stroke="#a3a3a3"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>

									{/* --------------------------------------------------------------- */}
									{/* 2. CENTER: USER FLOW VIEW (OUR PRODUCT HUB)                     */}
									{/* --------------------------------------------------------------- */}
									<div className="lg:col-span-4">
										<div className="rounded-2xl bg-white p-5 shadow-[0_0_0_1px_oklch(0_0_0/0.08),0_10px_28px_-6px_oklch(0_0_0/0.07)]">
											{/* Top Row: Flow Graph + Title */}
											<div className="flex items-center justify-between gap-3">
												<div className="flex items-center gap-3">
													{/* Branching Flow Graph Icon (like reference) */}
													<svg
														className="h-11 w-16 shrink-0"
														viewBox="0 0 68 44"
														fill="none"
														aria-hidden="true"
													>
														<path
															d="M 16 14 L 46 14"
															stroke="#831843"
															strokeWidth="1.75"
														/>
														<path
															d="M 24 14 C 30 14, 28 32, 36 32 L 42 32"
															stroke="#831843"
															strokeWidth="1.75"
															fill="none"
														/>
														<path
															d="M 41 10 L 47 14 L 41 18"
															stroke="#831843"
															strokeWidth="1.75"
															strokeLinecap="round"
															strokeLinejoin="round"
														/>
														<circle
															cx="10"
															cy="14"
															r="5.5"
															fill="white"
															stroke="#831843"
															strokeWidth="1.75"
														/>
														<circle
															cx="55"
															cy="14"
															r="5.5"
															fill="#fce7ef"
															stroke="#831843"
															strokeWidth="1.75"
														/>
														<circle
															cx="48"
															cy="32"
															r="5.5"
															fill="white"
															stroke="#831843"
															strokeWidth="1.75"
														/>
													</svg>

													<div>
														<div className="font-semibold text-base text-neutral-950 tracking-tight sm:text-lg">
															User flow view
														</div>
														<div className="text-neutral-500 text-xs">
															Single product hub
														</div>
													</div>
												</div>
											</div>

											{/* Mini Product Screen Strip Preview */}
											<div className="my-4 grid grid-cols-3 gap-2 rounded-xl bg-neutral-50 p-2 shadow-[0_0_0_1px_oklch(0_0_0/0.05)]">
												{[
													{ step: "1. Entry", badge: "99%" },
													{ step: "2. Verify", badge: "Friction" },
													{ step: "3. Done", badge: "280ms" },
												].map((item, idx) => (
													<div
														key={item.step}
														className={`rounded-lg bg-white p-2 shadow-[0_0_0_1px_oklch(0_0_0/0.06)] ${
															idx === 1 ? "ring-1 ring-[#831843]/30" : ""
														}`}
													>
														<div className="flex items-center justify-between">
															<span className="font-mono text-[9.5px] text-neutral-500">
																{item.step}
															</span>
														</div>
														<div className="my-1.5 h-6 rounded bg-neutral-100/90" />
														<span
															className={`inline-block rounded px-1.5 py-0.5 font-mono text-[9px] tabular-nums ${
																idx === 1
																	? "bg-[#fce7ef] text-[#831843]"
																	: "bg-emerald-50 text-emerald-700"
															}`}
														>
															{item.badge}
														</span>
													</div>
												))}
											</div>

											{/* 3 Action Pills: Review · Check · Evaluate */}
											<div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
												{(
													[
														{
															id: "review",
															label: "Review",
															icon: MessageSquare,
														},
														{
															id: "check",
															label: "Check",
															icon: ShieldCheck,
														},
														{
															id: "evaluate",
															label: "Evaluate",
															icon: CheckCircle2,
														},
													] as const
												).map((pill) => {
													const Icon = pill.icon;
													const isSelected = activePill === pill.id;
													return (
														<button
															key={pill.id}
															type="button"
															onClick={() => setActivePill(pill.id)}
															className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-medium text-xs transition-colors duration-150 active:scale-[0.96] ${
																isSelected
																	? "bg-[#fce7ef] text-[#831843]"
																	: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70"
															}`}
														>
															<Icon className="h-3 w-3" />
															<span>{pill.label}</span>
														</button>
													);
												})}
											</div>
										</div>
									</div>

									{/* Bidirectional Arrows: User Flow View <-> Actors */}
									<div
										aria-hidden="true"
										className="hidden flex-col items-center justify-center gap-20 lg:col-span-1 lg:flex"
									>
										<svg
											className="h-6 w-full overflow-visible"
											viewBox="0 0 60 24"
											fill="none"
										>
											<line
												x1="6"
												y1="12"
												x2="54"
												y2="12"
												stroke="#a3a3a3"
												strokeWidth="1.5"
											/>
											<path
												d="M 11 7.5 L 5 12 L 11 16.5"
												stroke="#a3a3a3"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M 49 7.5 L 55 12 L 49 16.5"
												stroke="#a3a3a3"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
										<svg
											className="h-6 w-full overflow-visible"
											viewBox="0 0 60 24"
											fill="none"
										>
											<line
												x1="6"
												y1="12"
												x2="54"
												y2="12"
												stroke="#a3a3a3"
												strokeWidth="1.5"
											/>
											<path
												d="M 11 7.5 L 5 12 L 11 16.5"
												stroke="#a3a3a3"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
											<path
												d="M 49 7.5 L 55 12 L 49 16.5"
												stroke="#a3a3a3"
												strokeWidth="1.5"
												strokeLinecap="round"
												strokeLinejoin="round"
											/>
										</svg>
									</div>

									{/* --------------------------------------------------------------- */}
									{/* 3. RIGHT: TEAM MEMBERS <-> AGENTS                               */}
									{/* --------------------------------------------------------------- */}
									<div className="flex flex-col justify-center lg:col-span-3 lg:ps-3">
										{/* Real Humans: Team members */}
										<div className="flex items-center gap-3">
											<div className="flex shrink-0 -space-x-2">
												<img
													src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop"
													alt="Product designer"
													className="h-10 w-10 rounded-full object-cover outline outline-1 outline-black/10 -outline-offset-1 ring-2 ring-[#f7f7f9]"
												/>
												<img
													src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop"
													alt="Product manager"
													className="h-10 w-10 rounded-full object-cover outline outline-1 outline-black/10 -outline-offset-1 ring-2 ring-[#f7f7f9]"
												/>
											</div>
											<div>
												<div className="font-semibold text-neutral-950 text-sm">
													Team members
												</div>
												<div className="text-neutral-500 text-xs">
													Humans review &amp; direct
												</div>
											</div>
										</div>

										{/* Bidirectional Human <-> Agent Connector Line */}
										<div
											aria-hidden="true"
											className="my-1.5 flex items-center gap-2.5 ps-4"
										>
											<svg
												className="h-9 w-5 shrink-0 overflow-visible"
												viewBox="0 0 20 36"
												fill="none"
											>
												<line
													x1="10"
													y1="4"
													x2="10"
													y2="32"
													stroke="#a3a3a3"
													strokeWidth="1.5"
													strokeDasharray="2.5 2.5"
												/>
												<path
													d="M 6 8 L 10 3 L 14 8"
													stroke="#a3a3a3"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
												<path
													d="M 6 28 L 10 33 L 14 28"
													stroke="#a3a3a3"
													strokeWidth="1.5"
													strokeLinecap="round"
													strokeLinejoin="round"
												/>
											</svg>
											<span className="font-mono text-[10px] text-neutral-400">
												Ask &amp; reply
											</span>
										</div>

										{/* Agents */}
										<div className="flex items-center gap-3">
											<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#4f9cf9] via-[#6366f1] to-[#7c3aed] text-white shadow-xs">
												<HexAgentGlyph className="h-5 w-5" />
											</div>
											<div>
												<div className="font-semibold text-neutral-950 text-sm">
													Agents
												</div>
												<div className="text-neutral-500 text-xs">
													Product skills, Checks the flow
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>

							{/* ===================================================================== */}
							{/* 4 MINIMALIST SHIFT CARDS (4-Column Row matching reference layout)     */}
							{/* ===================================================================== */}
							<div className="grid grid-cols-1 gap-3.5 pt-2 sm:grid-cols-2 lg:grid-cols-4">
								{SHIFT_PILLARS.map((pillar) => {
									const Icon = pillar.icon;
									return (
										<div
											key={pillar.id}
											className="flex flex-col justify-between rounded-xl bg-white p-5 shadow-[0_0_0_1px_oklch(0_0_0/0.08)] transition-[box-shadow] duration-150 hover:shadow-[0_0_0_1px_oklch(0_0_0/0.14),0_2px_8px_0_oklch(0_0_0/0.04)]"
										>
											<div>
												<Icon
													className="h-4 w-4 text-neutral-700"
													strokeWidth={1.75}
													aria-hidden="true"
												/>
												<h3 className="mt-3.5 text-balance font-medium text-[15px] text-neutral-950 leading-snug tracking-[-0.015em]">
													{pillar.title}
												</h3>
											</div>

											<p className="mt-5 text-pretty text-[13px] text-neutral-500 leading-relaxed">
												{pillar.description}
											</p>
										</div>
									);
								})}
							</div>

							{/* Action Buttons (Optical alignment: ps-4 pe-3.5, active:scale-[0.96]) */}
							<div className="flex flex-wrap items-center gap-3 pt-1">
								<button
									type="button"
									onClick={() => scrollToSection("platform")}
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-950 py-2 ps-4 pe-3.5 font-medium text-white text-xs transition-[background-color,transform] duration-150 ease-out hover:bg-neutral-800 active:scale-[0.96]"
								>
									<span>Explore the single-hub platform</span>
									<ArrowUpRight className="h-3.5 w-3.5" />
								</button>

								<button
									type="button"
									onClick={() => scrollToSection("early-feedback")}
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-100 py-2 ps-4 pe-3.5 font-medium text-neutral-800 text-xs transition-[background-color,transform] duration-150 ease-out hover:bg-neutral-200 active:scale-[0.96]"
								>
									<span>See how product teams ship</span>
									<ArrowUpRight className="h-3.5 w-3.5" />
								</button>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* SECTION 2: PLATFORM FEATURES (White Background, Horizontal Scroll)         */}
			{/* ========================================================================= */}
			<section
				id="platform"
				className="relative w-full border-neutral-200/80 border-b bg-white py-20 sm:py-28"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
						{/* Spacer on Desktop */}
						<div className="lg:col-span-3">
							<div className="block lg:hidden">
								<Sidenav
									activeSection={activeSection}
									onSelect={scrollToSection}
									isDark={false}
								/>
							</div>
						</div>

						{/* Right Content Area */}
						<div className="min-w-0 lg:col-span-9">
							<div className="mb-8 flex items-center justify-between">
								<h2 className="font-semibold text-2xl text-neutral-950 tracking-[-0.03em] sm:text-3xl md:text-4xl">
									Everything you need to build smarter, faster
								</h2>

								<div className="flex shrink-0 items-center gap-2">
									<button
										type="button"
										onClick={scrollPrev}
										className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:border-neutral-400 hover:text-neutral-950 active:scale-[0.98]"
										aria-label="Previous card"
									>
										<ChevronLeft className="h-4 w-4" />
									</button>
									<button
										type="button"
										onClick={scrollNext}
										className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-200 text-neutral-600 transition-all hover:border-neutral-400 hover:text-neutral-950 active:scale-[0.98]"
										aria-label="Next card"
									>
										<ChevronRight className="h-4 w-4" />
									</button>
								</div>
							</div>

							<div
								ref={scrollContainerRef}
								className="scrollbar-none flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
								style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
							>
								{FEATURES.map((feature) => (
									<div
										key={feature.id}
										className="flex w-[310px] shrink-0 snap-start flex-col justify-between sm:w-[350px] md:w-[370px]"
									>
										{/* Mock Gray Image Area */}
										<div className="relative flex h-72 w-full items-center justify-center overflow-hidden rounded-2xl border border-neutral-200/80 bg-neutral-100 p-4 shadow-xs sm:h-80">
											<div className="absolute inset-0 bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] opacity-60 [background-size:16px_16px]" />

											{feature.mockType === "loop" && (
												<div className="relative w-full max-w-[250px] space-y-3 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
													<div className="inline-flex items-center gap-1.5 rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[10px] text-purple-700">
														<span>💬</span>
														<span>Customer support prompt</span>
													</div>
													<p className="text-[11.5px] text-neutral-600 leading-snug">
														Optimize this prompt based on human and automated
														scoring results
													</p>
													<div className="flex items-center justify-between border-neutral-100 border-t pt-1 font-mono text-[10px] text-neutral-500">
														<span>GPT-4.5 Preview</span>
														<span>↑</span>
													</div>
													<div className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0052ff] py-1.5 font-medium text-white text-xs shadow-xs">
														<span>Loop agent</span>
														<span className="text-[10px]">♾️</span>
													</div>
												</div>
											)}

											{feature.mockType === "pattern" && (
												<div className="relative w-full max-w-[250px] space-y-2.5 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
													<div>
														<div className="flex items-center justify-between font-semibold text-[11px] text-neutral-900">
															<span>Evaluation automation dominates</span>
															<span className="font-mono text-[10px] text-neutral-500">
																100%
															</span>
														</div>
														<div className="font-mono text-[9.5px] text-neutral-600">
															6 hours ago
														</div>
													</div>
													<div className="border-neutral-100 border-t pt-2">
														<div className="flex items-center justify-between font-semibold text-[11px] text-neutral-900">
															<span>Support replies advertise unsupported</span>
															<span className="font-mono text-[10px] text-neutral-500">
																46.2%
															</span>
														</div>
														<div className="font-mono text-[9.5px] text-neutral-600">
															4 hours ago
														</div>
													</div>
													<div className="border-neutral-100 border-t pt-2">
														<div className="flex items-center justify-between font-semibold text-[11px] text-neutral-900">
															<span>Return-policy answers invent timing</span>
															<span className="font-mono text-[10px] text-neutral-500">
																83.3%
															</span>
														</div>
														<div className="font-mono text-[9.5px] text-neutral-600">
															2 hours ago
														</div>
													</div>
												</div>
											)}

											{feature.mockType === "video" && (
												<div className="relative w-full max-w-[250px] space-y-2 rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-white shadow-xl">
													<div className="flex items-center justify-between font-mono text-[10px]">
														<span className="text-purple-300">
															Video annotation view
														</span>
														<span className="text-neutral-500">00:42</span>
													</div>
													<div className="relative flex h-24 items-center justify-center overflow-hidden rounded-lg bg-neutral-900">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-md">
															<Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
														</div>
													</div>
													<div className="flex items-center gap-1.5 pt-1">
														<button
															type="button"
															className="flex flex-1 items-center justify-center rounded-md bg-[#004d33] py-1 font-medium text-[10px] text-white"
														>
															Approve
														</button>
														<button
															type="button"
															className="rounded-md border border-neutral-700 px-2 py-1 font-medium text-[10px] text-neutral-300"
														>
															Reject
														</button>
													</div>
												</div>
											)}

											{feature.mockType === "evals" && (
												<div className="relative w-full max-w-[250px] space-y-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
													<div className="flex items-center justify-between font-mono text-[10px]">
														<span className="font-semibold text-emerald-600">
															Synthetic Cohort
														</span>
														<span className="text-neutral-500">Active</span>
													</div>
													<div className="space-y-1.5 rounded-lg bg-neutral-50 p-2 font-mono text-[10px]">
														<div className="text-neutral-600">
															Simulated runs: 1,420
														</div>
														<div className="text-emerald-600">
															Edge-case coverage: 99.4%
														</div>
													</div>
													<div className="font-mono text-[10px] text-neutral-500">
														Automated recovery verified
													</div>
												</div>
											)}

											{feature.mockType === "benchmark" && (
												<div className="relative w-full max-w-[250px] space-y-2.5 rounded-xl border border-neutral-200 bg-white p-4 shadow-lg">
													<div className="font-semibold text-[11px] text-neutral-900">
														Cross-Release Usability Delta
													</div>
													<div className="space-y-1.5 font-mono text-[10px]">
														<div className="flex justify-between">
															<span className="text-neutral-500">
																v2.8 latency:
															</span>
															<span className="text-neutral-700">1.8s</span>
														</div>
														<div className="flex justify-between">
															<span className="text-neutral-500">
																v2.9 latency:
															</span>
															<span className="font-semibold text-emerald-600">
																0.3s (-83%)
															</span>
														</div>
													</div>
												</div>
											)}

											<div className="absolute right-2 bottom-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-neutral-300">
												Mock Image Area
											</div>
										</div>

										{/* Content */}
										<div className="mt-4 flex flex-1 flex-col justify-between space-y-3">
											<div>
												<h3 className="font-semibold text-base text-neutral-950">
													{feature.title}
												</h3>
												<p className="mt-1 text-neutral-600 text-xs leading-relaxed sm:text-sm">
													{feature.description}
												</p>
											</div>

											<div>
												<a
													href={feature.actionHref}
													className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3.5 py-1.5 font-medium text-neutral-800 text-xs transition-colors hover:bg-neutral-200"
												>
													<span>{feature.actionLabel}</span>
													<ArrowUpRight className="h-3 w-3" />
												</a>
											</div>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ========================================================================= */}
			{/* SECTION 3: EARLY FEEDBACK (Black Background, Bento Grid)                   */}
			{/* ========================================================================= */}
			<section
				id="early-feedback"
				className="relative w-full border-neutral-800 border-b bg-black py-20 text-white sm:py-28"
			>
				<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
						{/* Spacer on Desktop */}
						<div className="lg:col-span-3">
							<div className="block lg:hidden">
								<Sidenav
									activeSection={activeSection}
									onSelect={scrollToSection}
									isDark={true}
								/>
							</div>
						</div>

						{/* Right Content Area */}
						<div className="min-w-0 lg:col-span-9">
							<div className="max-w-3xl space-y-2">
								<h2 className="font-semibold text-3xl text-white leading-[1.18] tracking-[-0.035em] sm:text-4xl md:text-[44px]">
									<span>Built for teams running agents in production. </span>
									<span className="text-neutral-500">
										From first ship to enterprise scale.
									</span>
								</h2>

								<div className="pt-3 pb-8">
									<a
										href="#early-feedback"
										className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900/90 px-3.5 py-1.5 font-medium text-neutral-300 text-xs transition-colors hover:border-neutral-700 hover:text-white"
									>
										<span>Meet all the teams</span>
										<ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
									</a>
								</div>
							</div>

							{/* Bento Grid */}
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
								{/* Card 1: Cloudflare */}
								<div className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-md">
									<img
										src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop"
										alt="Kylie Czajkowski at Cloudflare"
										className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-2">
											<svg
												className="h-5 w-auto text-white"
												viewBox="0 0 24 16"
												fill="currentColor"
												role="img"
												aria-label="Cloudflare logo"
											>
												<path d="M19.35 6.04C18.67 2.59 15.64 0 12 0 9.11 0 6.6 1.64 5.35 4.04 2.34 4.36 0 6.91 0 10c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
											</svg>
											<span className="font-bold text-white text-xs uppercase tracking-tight">
												CLOUDFLARE
											</span>
										</div>

										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs">
											<Camera className="h-3.5 w-3.5" />
										</div>
									</div>

									<div className="relative z-10 space-y-2">
										<div className="text-[11px] text-neutral-400">
											Kylie Czajkowski, Agent Experience Manager
										</div>
										<blockquote className="font-medium text-sm text-white leading-snug sm:text-base">
											“We get to iterate directly in development and then ship
											it to production.”
										</blockquote>
									</div>
								</div>

								{/* Card 2: Pylon */}
								<div className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-md">
									<img
										src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
										alt="Fred Zhao at Pylon"
										className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-1.5 font-semibold text-sm text-white">
											<span className="flex h-4 w-4 items-center justify-center rounded-full border border-white text-[10px]">
												◒
											</span>
											<span>Pylon</span>
										</div>

										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs">
											<Camera className="h-3.5 w-3.5" />
										</div>
									</div>

									<div className="relative z-10 space-y-2">
										<div className="text-[11px] text-neutral-400">
											Fred Zhao, Software Engineer
										</div>
										<blockquote className="font-medium text-sm text-white leading-snug sm:text-base">
											“This discipline is what Alignment was built for.”
										</blockquote>
									</div>
								</div>

								{/* Card 3: Eve */}
								<div className="relative flex h-[340px] flex-col justify-between rounded-2xl border border-neutral-800/80 bg-[#161618] p-6 shadow-md">
									<div className="flex items-center gap-1 font-semibold text-neutral-200 text-sm">
										<span className="text-neutral-400">@</span>
										<span>eve</span>
									</div>

									<blockquote className="font-normal text-neutral-300 text-sm leading-relaxed sm:text-[15px]">
										“When it comes to resolving issues for our agents, Patterns
										helped us become more{" "}
										<span className="font-semibold text-white">proactive</span>{" "}
										instead of reactive.”
									</blockquote>

									<div className="text-[11px] text-neutral-500">
										Torehan Sharman, ML Engineer
									</div>
								</div>

								{/* Card 4: Notion */}
								<div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white p-6 text-neutral-950 shadow-lg md:col-span-2">
									<div className="flex items-center gap-2">
										<div className="flex h-6 w-6 items-center justify-center rounded border border-neutral-300 bg-neutral-950 font-bold font-serif text-white text-xs">
											N
										</div>
										<span className="font-bold text-neutral-950 text-sm tracking-tight">
											Notion
										</span>
									</div>

									<div className="my-6 grid grid-cols-1 items-center gap-6 sm:grid-cols-12">
										<div className="space-y-6 sm:col-span-7">
											<h3 className="font-semibold text-lg text-neutral-950 leading-tight tracking-tight sm:text-xl md:text-2xl">
												How Notion evaluates AI at scale across 70 engineers
											</h3>

											<div className="space-y-1">
												<div className="font-bold text-3xl text-neutral-950 tracking-tight sm:text-4xl">
													&lt;24hrs
												</div>
												<div className="font-medium text-neutral-500 text-xs">
													To deploy a new frontier model
												</div>
											</div>
										</div>

										<div className="flex items-center justify-center sm:col-span-5">
											<div className="relative flex h-36 w-full max-w-[220px] items-center justify-center rounded-xl bg-neutral-50 p-3">
												<svg
													className="h-full w-full"
													viewBox="0 0 200 130"
													fill="none"
													role="img"
													aria-label="Notion AI evaluation team illustration"
												>
													<circle
														cx="45"
														cy="35"
														r="18"
														fill="#ef4444"
														fillOpacity="0.9"
													/>
													<path
														d="M40 32h10M45 27v10"
														stroke="white"
														strokeWidth="2.5"
														strokeLinecap="round"
													/>
													<circle
														cx="105"
														cy="70"
														r="38"
														fill="#f4f4f5"
														stroke="#18181b"
														strokeWidth="2.5"
													/>
													<path
														d="M75 55c5-15 25-22 45-18 10 2 18 10 22 18"
														stroke="#18181b"
														strokeWidth="3"
														strokeLinecap="round"
													/>
													<ellipse
														cx="94"
														cy="68"
														rx="2.5"
														ry="3.5"
														fill="#18181b"
													/>
													<ellipse
														cx="116"
														cy="68"
														rx="2.5"
														ry="3.5"
														fill="#18181b"
													/>
													<path
														d="M98 84c4 3 10 3 14 0"
														stroke="#18181b"
														strokeWidth="2"
														strokeLinecap="round"
													/>
													<path
														d="M30 85c0-10 10-18 24-18s24 8 24 18z"
														fill="#f59e0b"
													/>
													<circle cx="165" cy="85" r="16" fill="#0052ff" />
													<path
														d="M158 85l5 5 9-9"
														stroke="white"
														strokeWidth="2.5"
														strokeLinecap="round"
														strokeLinejoin="round"
													/>
												</svg>
											</div>
										</div>
									</div>

									<div className="border-neutral-100 border-t pt-3">
										<a
											href="#early-feedback"
											className="inline-flex items-center gap-1 font-semibold text-neutral-900 text-xs hover:text-blue-600"
										>
											<span>Read Notion story</span>
											<ArrowUpRight className="h-3 w-3" />
										</a>
									</div>
								</div>

								{/* Card 5: Box */}
								<div className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-md md:col-span-1">
									<img
										src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop"
										alt="Matt Terrell and Sidharth Srinivasan at Box"
										className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

									<div className="relative z-10 flex items-center justify-between">
										<span className="font-bold text-base text-white tracking-tight">
											box
										</span>

										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs">
											<Camera className="h-3.5 w-3.5" />
										</div>
									</div>

									<div className="relative z-10 space-y-2">
										<div className="text-[11px] text-neutral-400">
											Matt Terrell &amp; Sidharth Srinivasan, Product Management
										</div>
										<blockquote className="font-medium text-sm text-white leading-snug sm:text-base">
											“Alignment is our single source of truth for all of our
											datasets.”
										</blockquote>
									</div>
								</div>

								{/* Card 6: Replit */}
								<div className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-md">
									<img
										src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800&auto=format&fit=crop"
										alt="Luis Héctor Chávez at Replit"
										className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-1.5 font-bold text-sm text-white">
											<span className="text-[#f26207]">❖</span>
											<span>replit</span>
										</div>

										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs">
											<Camera className="h-3.5 w-3.5" />
										</div>
									</div>

									<div className="relative z-10 space-y-2">
										<div className="text-[11px] text-neutral-400">
											Luis Héctor Chávez, CTO
										</div>
										<blockquote className="font-medium text-sm text-white leading-snug sm:text-base">
											“Alignment helped us identify several patterns that we
											wouldn't have found.”
										</blockquote>
									</div>
								</div>

								{/* Card 7: Graphite */}
								<div className="relative flex h-[340px] flex-col justify-between rounded-2xl border border-neutral-800/80 bg-[#161618] p-6 shadow-md">
									<div className="flex items-center gap-2 font-semibold text-sm text-white">
										<span className="text-neutral-400">✦</span>
										<span>Graphite</span>
									</div>

									<div className="space-y-2">
										<h4 className="font-medium text-neutral-300 text-sm leading-snug">
											How Graphite builds reliable AI code review at scale
										</h4>
									</div>

									<div className="space-y-1">
										<div className="font-bold text-3xl text-white tracking-tight sm:text-4xl">
											5%
										</div>
										<div className="text-[11px] text-neutral-500">
											Reduction in negative rules
										</div>
									</div>
								</div>

								{/* Card 8: Retool */}
								<div className="group relative flex h-[340px] flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-md">
									<img
										src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=800&auto=format&fit=crop"
										alt="Allen Kleiner at Retool"
										className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-500 group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/20" />

									<div className="relative z-10 flex items-center justify-between">
										<div className="flex items-center gap-1.5 font-bold text-sm text-white">
											<span className="text-neutral-300">⊞</span>
											<span>Retool</span>
										</div>

										<div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-neutral-300 backdrop-blur-xs">
											<Camera className="h-3.5 w-3.5" />
										</div>
									</div>

									<div className="relative z-10 space-y-2">
										<div className="text-[11px] text-neutral-400">
											Allen Kleiner, AI Engineering Lead
										</div>
										<blockquote className="font-medium text-sm text-white leading-snug sm:text-base">
											“Loop helps us understand trace details that would be
											impossible to scan manually.”
										</blockquote>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
