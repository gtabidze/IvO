import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
	question: string;
	answer: string;
}

const FAQS: FAQItem[] = [
	{
		question:
			"How does IvO capture competitor flows behind KYC gates and region locks?",
		answer:
			"Our research network holds verified residency credentials, corporate entities, and active funded accounts across 46 jurisdictions. This allows us to record live production flows behind NFC passport scans, accredited investor checks, and deposit gates that standard product teams cannot access.",
	},
	{
		question:
			"What specific UX metrics does IvO evaluate during a studio audit?",
		answer:
			"We measure four primary quantitative dimensions: (1) Time on Task (split-second user latency per step), (2) Task Success Rate (first-attempt vs abandoned paths), (3) User Error Rate (validation trigger counts and biometric failure loops), and (4) Cognitive Friction Score (based on Nielsen-Norman 10 Usability Heuristics).",
	},
	{
		question: "How does IvO differ from static screenshot tools like Mobbin?",
		answer:
			"Mobbin offers static screenshot galleries. IvO pairs full-resolution interactive flow recordings with quantitative telemetry, drop-off heuristics, and comparative benchmark data. Furthermore, our product agency Intent V. Outcome provides custom audits and continuous release evaluations for your own platform.",
	},
	{
		question:
			"What is the timeline for the non-finance sectors (Gambling, E-Commerce, MedTech)?",
		answer:
			"We are currently 100% focused on depth in Finance & Banking (71+ apps indexed). iGaming & Gambling launches in Q2, followed by E-Commerce in Q3 and Digital Health in Q4. All annual subscribers automatically receive new sectors as they go live.",
	},
	{
		question: "How does a studio engagement with Intent V. Outcome work?",
		answer:
			"We invite your team into your private studio space on IvO, instrument your target user flows, and recruit 15 verified cohort participants matching your exact ICP. Within 10 business days, we deliver a BuiltForMars-grade interactive teardown, benchmark metrics, video annotations, and production-ready Figma component redesigns.",
	},
];

export default function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(0);

	const toggle = (idx: number) => {
		setOpenIndex(openIndex === idx ? null : idx);
	};

	return (
		<section className="border-neutral-200/80 border-b bg-neutral-50/50 py-24 sm:py-32">
			<div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
				<div className="mb-16 space-y-3 text-center">
					<span className="font-mono font-semibold text-neutral-600 text-xs uppercase tracking-widest">
						FREQUENTLY ASKED QUESTIONS
					</span>
					<h2 className="font-semibold text-3xl text-neutral-950 tracking-[-0.03em] sm:text-5xl">
						Everything you need to know
					</h2>
				</div>

				<div className="space-y-4">
					{FAQS.map((faq, idx) => {
						const isOpen = openIndex === idx;
						return (
							<div
								key={idx}
								className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all"
							>
								<button
									type="button"
									onClick={() => toggle(idx)}
									className="flex w-full cursor-pointer items-center justify-between gap-4 p-6 text-left"
								>
									<span className="font-semibold text-base text-neutral-950 tracking-tight">
										{faq.question}
									</span>
									<ChevronDown
										className={`h-4 w-4 shrink-0 text-neutral-600 transition-transform duration-200 ${
											isOpen ? "rotate-180 text-neutral-950" : ""
										}`}
									/>
								</button>
								{isOpen && (
									<div className="fade-in animate-in border-neutral-100 border-t px-6 pt-4 pb-6 text-neutral-600 text-sm leading-relaxed duration-200">
										{faq.answer}
									</div>
								)}
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}
