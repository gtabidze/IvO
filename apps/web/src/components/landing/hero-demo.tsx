import { useState } from "react";
import { FlowDetailModal } from "@/components/dashboard/flow-detail-modal";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { DASHBOARD_FLOWS } from "@/data/dashboard-flows";

export default function HeroDemo() {
	const defaultFlow = DASHBOARD_FLOWS[0];
	const [pricingOpen, setPricingOpen] = useState(false);

	if (!defaultFlow) return null;

	return (
		<section
			aria-label="Interactive product flow demo"
			className="relative w-full pb-12 sm:pb-16"
		>
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				{/* Mobbin-style outer gray showcase frame */}
				<div className="mx-auto w-full max-w-[1280px] rounded-[28px] bg-[#f2f2f4] p-2.5 ring-1 ring-black/[0.05] sm:rounded-[36px] sm:p-4 dark:bg-neutral-900/60 dark:ring-white/[0.08]">
					{/* Embedded Flow Workspace & Prototype view */}
					<FlowDetailModal
						flow={defaultFlow}
						embedded
						open={true}
						onClose={() => {}}
						onOpenPricing={() => setPricingOpen(true)}
					/>
				</div>
			</div>

			<PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
		</section>
	);
}
