import { ArrowRight } from "lucide-react";

export default function Hero() {
	return (
		<section className="relative overflow-hidden pt-16 pb-10 sm:pt-[110px] sm:pb-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Primary Headline (Left-aligned, 2-line break) */}
				<div className="max-w-4xl text-left sm:max-w-5xl">
					<h1 className="font-semibold text-4xl text-neutral-950 leading-[1.12] tracking-[-0.035em] sm:text-6xl md:text-[64px] lg:text-[70px] dark:text-white">
						<span className="block">Where teams and agents</span>
						<span className="block">decide what to ship.</span>
					</h1>
				</div>

				{/* Dual CTA Buttons (Left-aligned) */}
				<div className="mt-8 flex flex-wrap items-center justify-start gap-3 sm:mt-9">
					<a
						href="/login"
						className="inline-flex items-center justify-center rounded-full bg-neutral-950 px-6 py-2.5 font-medium text-[13.5px] text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.98] sm:text-sm dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						<span>Join waitlist</span>
					</a>

					<a
						href="/login"
						className="group inline-flex items-center justify-center gap-1.5 rounded-full bg-[#f4f4f5] px-5 py-2.5 font-medium text-[13.5px] text-neutral-800 transition-all hover:bg-[#eaeaea] hover:text-neutral-950 active:scale-[0.98] sm:px-6 sm:text-sm dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-white"
					>
						<span>Request demo</span>
						<ArrowRight className="h-3.5 w-3.5 text-neutral-400 transition-all group-hover:translate-x-0.5 group-hover:text-neutral-800 dark:text-neutral-500 dark:group-hover:text-white" />
					</a>
				</div>
			</div>
		</section>
	);
}
