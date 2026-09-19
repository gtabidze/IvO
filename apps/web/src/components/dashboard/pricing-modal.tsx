import { Button } from "@IvO/ui/components/button";
import { Dialog, DialogPopup } from "@IvO/ui/components/dialog";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PricingModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function PricingModal({ open, onOpenChange }: PricingModalProps) {
	const [billingCycle, setBillingCycle] = useState<"yearly" | "quarterly">(
		"yearly",
	);

	const isYearly = billingCycle === "yearly";

	const handleCheckout = (tier: string) => {
		toast.success(`Redirecting to ${tier} checkout...`, {
			description: `Billing cycle: ${billingCycle}. Unlimited access unlocking.`,
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-4xl rounded-3xl border border-neutral-200/80 p-8 shadow-2xl sm:p-10 dark:border-neutral-800">
				{/* Top Badge & Header */}
				<div className="flex flex-col items-center text-center">
					<div className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-3.5 py-1 font-semibold text-white text-xs tracking-wide shadow-xs dark:bg-neutral-100 dark:text-neutral-950">
						<span>PRO</span>
						<Sparkles className="h-3.5 w-3.5 text-amber-400" />
					</div>

					<h2 className="mt-4 font-bold text-2xl text-neutral-950 tracking-tight sm:text-3xl dark:text-white">
						Unlock all apps, sites, and features.
					</h2>
					<p className="mt-2 text-neutral-500 text-sm dark:text-neutral-400">
						Starting from only ${isYearly ? "10" : "15"} per month — Cancel
						anytime.
					</p>

					{/* Billing Cycle Pill Toggle */}
					<div className="mt-6 flex items-center rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200/70 dark:bg-neutral-800 dark:ring-neutral-700">
						<button
							type="button"
							onClick={() => setBillingCycle("yearly")}
							className={`rounded-full px-4 py-1.5 font-medium text-xs transition-all ${
								isYearly
									? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
							}`}
						>
							Yearly
						</button>
						<button
							type="button"
							onClick={() => setBillingCycle("quarterly")}
							className={`rounded-full px-4 py-1.5 font-medium text-xs transition-all ${
								!isYearly
									? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400"
							}`}
						>
							Quarterly
						</button>
					</div>

					{isYearly && (
						<p className="mt-2.5 font-medium text-blue-600 text-xs dark:text-blue-400">
							Save 33% on a yearly subscription
						</p>
					)}
				</div>

				{/* Two Tier Cards Grid */}
				<div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
					{/* Pro Plan */}
					<div className="flex flex-col justify-between rounded-2xl border border-neutral-200/90 bg-neutral-50/50 p-6 sm:p-7 dark:border-neutral-800 dark:bg-neutral-900/60">
						<div>
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg text-neutral-950 dark:text-white">
									Pro
								</h3>
							</div>
							<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
								For individuals and freelancers
							</p>

							<div className="mt-5 flex items-baseline gap-1">
								<span className="font-extrabold text-3xl text-neutral-950 tracking-tight sm:text-4xl dark:text-white">
									${isYearly ? "10" : "15"}
								</span>
								<span className="text-neutral-500 text-xs">
									per month {isYearly ? "billed yearly" : "billed quarterly"}
								</span>
							</div>

							<Button
								type="button"
								variant="outline"
								onClick={() => handleCheckout("Pro")}
								className="mt-6 w-full rounded-full border-neutral-300 bg-white py-2.5 font-medium text-neutral-900 text-xs shadow-xs transition-all hover:border-neutral-400 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
							>
								Get Pro
							</Button>

							<ul className="mt-6 space-y-3 text-neutral-700 text-xs dark:text-neutral-300">
								{[
									"All apps & sites",
									"Flows",
									"Animations",
									"Unlimited collections",
									"Deep Search",
									"MCP integration",
									"Hide screen footers",
								].map((feature) => (
									<li key={feature} className="flex items-center gap-2.5">
										<Check className="h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100" />
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</div>

					{/* Team Plan */}
					<div className="relative flex flex-col justify-between rounded-2xl border border-neutral-900 bg-white p-6 shadow-lg sm:p-7 dark:border-neutral-600 dark:bg-neutral-900">
						<div>
							<div className="flex items-center justify-between">
								<h3 className="font-semibold text-lg text-neutral-950 dark:text-white">
									Team
								</h3>
								<span className="rounded-full border border-neutral-300 bg-neutral-100 px-2.5 py-0.5 font-medium text-[11px] text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
									Recommended
								</span>
							</div>
							<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
								For teams & agencies
							</p>

							<div className="mt-5 flex items-baseline gap-1">
								<span className="font-extrabold text-3xl text-neutral-950 tracking-tight sm:text-4xl dark:text-white">
									${isYearly ? "16" : "24"}
								</span>
								<span className="text-neutral-500 text-xs">
									per member/month{" "}
									{isYearly ? "billed yearly" : "billed quarterly"}
								</span>
							</div>

							<Button
								type="button"
								onClick={() => handleCheckout("Team")}
								className="mt-6 w-full rounded-full bg-neutral-950 py-2.5 font-medium text-white text-xs shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								Create team
							</Button>

							<div className="mt-6 font-medium text-neutral-900 text-xs dark:text-neutral-100">
								Everything in Pro plus
							</div>

							<ul className="mt-3 space-y-3 text-neutral-700 text-xs dark:text-neutral-300">
								{[
									"Invite teammates",
									"Shared collections & comments",
									"Team management",
									"Centralized billing",
									"Slack integration",
									"API access",
									"SOC 2 Reports",
								].map((feature) => (
									<li key={feature} className="flex items-center gap-2.5">
										<Check className="h-4 w-4 shrink-0 text-neutral-900 dark:text-neutral-100" />
										<span>{feature}</span>
										{feature === "Slack integration" && (
											<span className="rounded-md bg-neutral-100 px-1.5 py-0.2 font-semibold text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
												Soon
											</span>
										)}
									</li>
								))}
							</ul>
						</div>

						{/* Finance+ Addon strip */}
						<div className="mt-6 flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/60 px-3.5 py-2.5 text-blue-900 text-xs transition-colors hover:bg-blue-50 dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-blue-200">
							<div className="flex items-center gap-2">
								<span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 font-bold text-[11px] text-white">
									$
								</span>
								<span className="font-medium">Optional Finance+ add-on</span>
							</div>
							<ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
						</div>
					</div>
				</div>
			</DialogPopup>
		</Dialog>
	);
}
