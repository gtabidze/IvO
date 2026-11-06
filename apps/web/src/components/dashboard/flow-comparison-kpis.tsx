import { Clock3 } from "lucide-react";
import type { DashboardFlow } from "@/data/dashboard-flows";

/** Small multiples use identical scales across every compared flow. */
export function FlowComparisonKpis({ flow }: { flow: DashboardFlow }) {
	const success = Number.parseFloat(flow.taskSuccessRate);
	const ease = Number.parseFloat(flow.seqScore);
	const percent = Number.isFinite(success)
		? Math.max(0, Math.min(100, success))
		: 0;
	const score = Number.isFinite(ease) ? Math.max(1, Math.min(7, ease)) : 0;
	const color = flow.appColor;
	return (
		<dl
			aria-label={`${flow.app} flow reference metrics`}
			className="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-2.5"
		>
			<div
				className="flex items-center gap-2.5"
				title="Reference time on task from this flow's demo data."
			>
				<span className="flex size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
					<Clock3 className="size-4 text-neutral-500" aria-hidden="true" />
				</span>
				<div>
					<dt className="text-[10px] text-neutral-500">Time on task</dt>
					<dd className="mt-0.5 font-semibold text-neutral-900 text-sm tabular-nums dark:text-white">
						{flow.timeOnTask || "—"}
					</dd>
				</div>
			</div>
			<div
				className="flex items-center gap-2.5"
				title="Reference task success rate. Ring shows the share of successful tasks, from 0 to 100%."
			>
				<svg
					className="size-8 -rotate-90"
					viewBox="0 0 36 36"
					aria-hidden="true"
				>
					<circle
						cx="18"
						cy="18"
						r="14"
						fill="none"
						className="stroke-neutral-100 dark:stroke-neutral-800"
						strokeWidth="4"
					/>
					<circle
						cx="18"
						cy="18"
						r="14"
						fill="none"
						stroke={color}
						strokeWidth="4"
						strokeLinecap="round"
						pathLength="100"
						strokeDasharray={`${percent} 100`}
					/>
				</svg>
				<div>
					<dt className="text-[10px] text-neutral-500">Task success</dt>
					<dd className="mt-0.5 font-semibold text-neutral-900 text-sm tabular-nums dark:text-white">
						{Number.isFinite(success) ? flow.taskSuccessRate : "—"}
					</dd>
				</div>
			</div>
			<div title="Single Ease Question: 1 is very difficult, 7 is very easy. Reference demo data.">
				<dt className="text-[10px] text-neutral-500">Ease of completion</dt>
				<dd className="mt-0.5 flex items-center gap-2">
					<span className="font-semibold text-neutral-900 text-sm tabular-nums dark:text-white">
						{Number.isFinite(ease) ? score : "—"}
						<span className="font-normal text-[10px] text-neutral-400">
							{" "}
							/ 7
						</span>
					</span>
					<span className="flex gap-0.5" aria-hidden="true">
						{Array.from({ length: 7 }, (_, i) => (
							<span
								key={i}
								className="h-3 w-1.5 rounded-sm bg-neutral-100 dark:bg-neutral-800"
								style={{
									backgroundImage: `linear-gradient(to top, ${color} ${Math.max(0, Math.min(1, score - i)) * 100}%, transparent ${Math.max(0, Math.min(1, score - i)) * 100}%)`,
								}}
							/>
						))}
					</span>
				</dd>
			</div>
		</dl>
	);
}
