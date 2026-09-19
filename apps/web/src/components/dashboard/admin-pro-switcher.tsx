import { Sparkles, UserCheck } from "lucide-react";
import { usePro } from "@/context/pro-context";

export function AdminProSwitcher() {
	const { isPro, setPro } = usePro();

	return (
		<div
			className="flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-100/90 p-0.5 shadow-2xs backdrop-blur-xs transition-all dark:border-neutral-800 dark:bg-neutral-900/90"
			role="group"
			aria-label="Admin tier simulator"
			title="Admin platform testing simulator: Switch user tier"
		>
			<span className="hidden select-none pr-1 pl-2 font-mono font-semibold text-[10px] text-neutral-400 uppercase tracking-wider xl:inline-block dark:text-neutral-500">
				Mode
			</span>

			<button
				type="button"
				onClick={() => setPro(false)}
				className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[11px] transition-all duration-150 active:scale-[0.96] ${
					!isPro
						? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
						: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
				}`}
				aria-pressed={!isPro}
				aria-label="Switch to Free User mode"
			>
				<UserCheck className="h-3 w-3 stroke-[2]" />
				<span>Free</span>
			</button>

			<button
				type="button"
				onClick={() => setPro(true)}
				className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 font-semibold text-[11px] transition-all duration-150 active:scale-[0.96] ${
					isPro
						? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
						: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
				}`}
				aria-pressed={isPro}
				aria-label="Switch to Pro Member mode"
			>
				<Sparkles className="h-3 w-3 fill-current stroke-[1.5]" />
				<span>Pro</span>
			</button>
		</div>
	);
}
