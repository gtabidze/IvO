import { ArrowRight } from "lucide-react";

export default function Hero() {
	return (
		<section className="relative overflow-hidden pt-16 pb-12 sm:pt-[120px] sm:pb-[60px]">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Primary Headline (Mobbin Reference Style) */}
				<div className="mx-auto max-w-4xl text-center sm:max-w-5xl">
					<h1 className="font-semibold text-3xl leading-[1.14] tracking-[-0.035em] text-neutral-950 sm:text-5xl md:text-[56px] lg:text-[62px]">
						<span className="block">A new native workspace for</span>
						<span className="sm:whitespace-nowrap">
							product builders + agent teams
						</span>
					</h1>

					<p className="mx-auto mt-5 max-w-xl font-normal text-sm leading-relaxed tracking-[-0.01em] text-neutral-500 sm:text-base md:text-[17px]">
						Humans review the work, competence agents do the checks, and improve
						product quality with every release.
					</p>
				</div>

				{/* Dual CTA Buttons (Matching Mobbin Reference) */}
				<div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:mt-9">
					<a
						href="/login"
						className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-2.5 font-medium text-[13.5px] text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.98] sm:text-sm"
					>
						<span>Start building</span>
					</a>

					<a
						href="/login"
						className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f4f4f5] px-5 py-2.5 font-medium text-[13.5px] text-neutral-800 transition-all hover:bg-[#eaeaea] hover:text-neutral-950 active:scale-[0.98] sm:px-6 sm:text-sm"
					>
						<span>Contact team</span>
						<ArrowRight className="h-3.5 w-3.5 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-800" />
					</a>
				</div>
			</div>
		</section>
	);
}
