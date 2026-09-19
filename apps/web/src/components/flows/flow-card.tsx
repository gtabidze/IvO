import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import {
	Eye,
	Globe,
	Layers,
	MoreVertical,
	Smartphone,
	Trash2,
	UploadCloud,
} from "lucide-react";
import type { UserCustomFlow } from "@/lib/flow-store";

interface FlowCardProps {
	flow: UserCustomFlow;
	onToggleStatus: (id: string) => void;
	onDelete: (id: string) => void;
	onPreview: (flow: UserCustomFlow) => void;
}

export function FlowCard({
	flow,
	onToggleStatus,
	onDelete,
	onPreview,
}: FlowCardProps) {
	const isPublished = flow.status === "published";
	const screenCount = flow.screens?.length || flow.screensCount || 0;
	const firstScreen = flow.screens?.[0];

	return (
		<div className="group relative flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-xs transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
			{/* Top Preview Canvas (Concentric radius: outer rounded-2xl, inner rounded-xl) */}
			<button
				type="button"
				onClick={() => onPreview(flow)}
				aria-label={`Preview flow sequence for ${flow.name}`}
				className="relative flex aspect-4/3 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-neutral-100/80 transition-transform duration-200 group-hover:scale-[1.01] dark:bg-neutral-800/60"
			>
				{/* Visual Mockup Stack (resembling screenshot 1 & 3) */}
				{firstScreen?.imageUrl ? (
					<img
						src={firstScreen.imageUrl}
						alt={flow.name}
						className="h-full w-full rounded-xl object-cover"
					/>
				) : (
					<div className="relative flex items-center justify-center">
						{/* Stack Layer 1 (Back Left) */}
						<div className="absolute -top-2 -left-6 h-28 w-20 -rotate-12 rounded-xl border border-neutral-300/60 bg-white/70 shadow-xs dark:border-neutral-700/60 dark:bg-neutral-800/70" />
						{/* Stack Layer 2 (Back Right) */}
						<div className="absolute -top-2 -right-6 h-28 w-20 rotate-12 rounded-xl border border-neutral-300/60 bg-white/70 shadow-xs dark:border-neutral-700/60 dark:bg-neutral-800/70" />
						{/* Stack Layer 3 (Center Foreground) */}
						<div className="relative flex h-32 w-22 flex-col items-center justify-between rounded-xl border border-neutral-300 bg-white p-2 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
							<div className="flex w-full items-center justify-between">
								<div
									style={{ backgroundColor: flow.appColor || "#0075eb" }}
									className="h-2 w-2 rounded-full"
								/>
								<div className="h-1 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
							</div>
							<div className="flex flex-col items-center gap-1">
								<Layers className="h-5 w-5 text-neutral-400 dark:text-neutral-500" />
								<span className="font-mono text-[9px] text-neutral-400">
									{screenCount} {screenCount === 1 ? "screen" : "screens"}
								</span>
							</div>
							<div className="h-1.5 w-12 rounded-full bg-neutral-200 dark:bg-neutral-700" />
						</div>
					</div>
				)}

				{/* Floating Status Badge (Draft vs Published) */}
				<div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
					<span
						className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold text-[10px] shadow-2xs backdrop-blur-md ${
							isPublished
								? "bg-emerald-500/90 text-white"
								: "bg-amber-500/90 text-white"
						}`}
					>
						<span
							className={`h-1.5 w-1.5 rounded-full ${
								isPublished ? "animate-pulse bg-white" : "bg-white"
							}`}
						/>
						{isPublished ? "Published" : "Draft"}
					</span>
				</div>

				{/* Platform Indicator */}
				<div className="absolute top-2.5 right-2.5 rounded-full bg-black/60 p-1 text-white backdrop-blur-md">
					{flow.platform === "ios" ? (
						<Smartphone className="h-3 w-3" />
					) : (
						<Globe className="h-3 w-3" />
					)}
				</div>
			</button>

			{/* Flow Card Details */}
			<div className="mt-3 flex items-start justify-between gap-2 px-1">
				<div className="min-w-0 flex-1">
					<button
						type="button"
						onClick={() => onPreview(flow)}
						className="block w-full cursor-pointer truncate text-left font-semibold text-neutral-900 text-xs transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
						title={flow.name}
					>
						{flow.name}
					</button>
					<div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
						<span className="flex items-center gap-1 font-medium text-neutral-700 dark:text-neutral-300">
							<span
								style={{ backgroundColor: flow.appColor || "#0075eb" }}
								className="h-1.5 w-1.5 rounded-full"
							/>
							<span>{flow.productName || flow.appName}</span>
						</span>
						<span>•</span>
						<span>{flow.appCategory}</span>
						<span>•</span>
						<span>
							{screenCount === 0 ? "No items" : `${screenCount} screens`}
						</span>
					</div>
				</div>

				{/* Options Dropdown Menu */}
				<DropdownMenu>
					<DropdownMenuTrigger
						render={
							<button
								type="button"
								className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
								aria-label="Flow actions"
							>
								<MoreVertical className="h-4 w-4" />
							</button>
						}
					/>
					<DropdownMenuContent
						align="end"
						className="w-44 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
					>
						<DropdownMenuItem
							onClick={() => onPreview(flow)}
							className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 text-neutral-700 text-xs hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
						>
							<Eye className="h-3.5 w-3.5 text-neutral-500" />
							<span>Preview sequence</span>
						</DropdownMenuItem>

						<DropdownMenuItem
							onClick={() => onToggleStatus(flow.id)}
							className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-neutral-700 text-xs hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
						>
							<UploadCloud className="h-3.5 w-3.5 text-neutral-500" />
							<span>{isPublished ? "Revert to Draft" : "Publish Flow"}</span>
						</DropdownMenuItem>

						<DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />

						<DropdownMenuItem
							onClick={() => onDelete(flow.id)}
							className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-red-600 text-xs hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
						>
							<Trash2 className="h-3.5 w-3.5 text-red-600" />
							<span>Delete flow</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	);
}
