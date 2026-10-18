import type { DashboardFlow } from "@/data/dashboard-flows";
import { toDashboardFlow } from "@/lib/flow-adapter";
import type { UserCustomFlow } from "@/lib/flow-store";
import { timeAgo } from "@/lib/time";
import { ScreenThumb } from "./screen-thumb";

/** Vertical list of flows, each with a horizontal strip of its screens. */
export function FlowStripList({
	flows,
	onOpenFlow,
}: {
	flows: UserCustomFlow[];
	onOpenFlow: (flow: DashboardFlow, screenIndex: number) => void;
}) {
	return (
		<div className="space-y-6">
			{flows.map((cf) => {
				const flow = toDashboardFlow(cf);
				return (
					<div
						key={cf.id}
						className="rounded-[2.25rem] border border-neutral-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] sm:p-7 dark:border-neutral-800 dark:bg-neutral-900"
					>
						<div className="mb-4 flex items-center justify-between gap-4">
							<button
								type="button"
								onClick={() => onOpenFlow(flow, 0)}
								className="min-w-0 cursor-pointer text-left"
							>
								<span className="block truncate font-bold text-lg text-neutral-950 tracking-tight transition-colors hover:text-blue-600 sm:text-xl dark:text-white dark:hover:text-blue-400">
									{cf.name}
								</span>
								<span className="mt-1 block font-medium text-neutral-400 text-xs">
									{cf.productName || cf.appName} · {cf.screens.length} screens ·
									updated {timeAgo(cf.updatedAt)}
								</span>
							</button>
							<span
								className={`shrink-0 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider ${
									cf.status === "published"
										? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
										: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
								}`}
							>
								{cf.status}
							</span>
						</div>
						<div className="scrollbar-none flex gap-5 overflow-x-auto px-1 pt-2 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
							{flow.screens.map((s, i) => (
								<ScreenThumb
									key={s.id}
									flow={flow}
									screen={s}
									index={i}
									scale={0.72}
									className="cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
									onClick={(idx) => onOpenFlow(flow, idx)}
								/>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
