import { Sparkles } from "lucide-react";

interface SellingPointBannerProps {
	onOpenPricing: () => void;
}

export function SellingPointBanner({ onOpenPricing }: SellingPointBannerProps) {
	return (
		<section className="my-10 w-full py-10 text-center">
			<div className="mx-auto max-w-2xl px-4 sm:px-6">
				<h2 className="font-extrabold text-3xl text-neutral-950 tracking-tight sm:text-4xl dark:text-white">
					Access all 663,962 screens.
				</h2>
				<p className="mt-3 text-neutral-600 text-sm dark:text-neutral-400">
					Get unlimited access to the full library &amp; pro features from{" "}
					<strong className="font-semibold text-neutral-900 dark:text-white">
						$10/month
					</strong>{" "}
					— cancel anytime.
				</p>

				{/* Primary Get Pro CTA */}
				<div className="mt-6 flex justify-center">
					<button
						type="button"
						onClick={onOpenPricing}
						className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-6 py-2.5 font-semibold text-white text-xs shadow-md transition-all hover:bg-neutral-800 hover:shadow-lg active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						<span>Get Pro</span>
						<Sparkles className="h-3.5 w-3.5 text-amber-400" />
					</button>
				</div>

				{/* Social Proof Stacked Avatars */}
				<div className="mt-6 flex items-center justify-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
					<div className="flex -space-x-2">
						{[
							"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
							"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
							"https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=80&auto=format&fit=crop",
							"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop",
						].map((avatarUrl, idx) => (
							<img
								key={idx}
								src={avatarUrl}
								alt="Designer avatar"
								className="inline-block h-6 w-6 rounded-full border-2 border-white object-cover shadow-2xs dark:border-neutral-950"
							/>
						))}
					</div>
					<span className="font-medium text-[11.5px] text-neutral-600 dark:text-neutral-400">
						Supporting over 1M designers worldwide
					</span>
				</div>
			</div>
		</section>
	);
}
