import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import { ChevronDown, X } from "lucide-react";

export type PlatformType = "ios" | "web";

export type FlowFilterType =
	| "all"
	| "creating-account"
	| "onboarding"
	| "switching-account"
	| "transfer-money";

interface DashboardToolbarProps {
	platform: PlatformType;
	onPlatformChange: (p: PlatformType) => void;
	selectedCategory: string;
	onCategoryChange: (cat: string) => void;
	selectedFlow: FlowFilterType;
	onFlowChange: (flow: FlowFilterType) => void;
	totalFlowsCount: number;
	sortBy: "popular" | "latest" | "rated";
	onSortByChange: (sort: "popular" | "latest" | "rated") => void;
}

const CATEGORIES = [
	"All Categories",
	"Banking",
	"Crypto & Web3",
	"Investing",
	"Payments",
	"Lending",
	"SaaS",
];

const FLOW_OPTIONS: { id: FlowFilterType; label: string }[] = [
	{ id: "creating-account", label: "Creating Account" },
	{ id: "onboarding", label: "Onboarding" },
	{ id: "switching-account", label: "Switching Account" },
	{ id: "transfer-money", label: "Transfer Money" },
];

export function DashboardToolbar({
	platform,
	onPlatformChange,
	selectedCategory,
	onCategoryChange,
	selectedFlow,
	onFlowChange,
	totalFlowsCount,
	sortBy,
	onSortByChange,
}: DashboardToolbarProps) {
	return (
		<div className="w-full border-neutral-200/70 border-b bg-white/70 py-3.5 backdrop-blur-xs dark:border-neutral-800/80 dark:bg-neutral-950/70">
			<div className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
				{/* Left: Platform Toggle & Filter Controls */}
				<div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
					{/* iOS / Web Switcher */}
					<div className="flex items-center rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200/60 dark:bg-neutral-900 dark:ring-neutral-800">
						<button
							type="button"
							onClick={() => onPlatformChange("ios")}
							className={`rounded-full px-3.5 py-1 font-semibold text-xs transition-all ${
								platform === "ios"
									? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							iOS
						</button>
						<button
							type="button"
							onClick={() => onPlatformChange("web")}
							className={`rounded-full px-3.5 py-1 font-semibold text-xs transition-all ${
								platform === "web"
									? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Web
						</button>
					</div>

					{/* Industry / Categories Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3.5 py-1.5 font-medium text-neutral-800 text-xs shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
								>
									<span>{selectedCategory}</span>
									<ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
								</button>
							}
						/>
						<DropdownMenuContent className="w-48 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
							{CATEGORIES.map((cat) => (
								<DropdownMenuItem
									key={cat}
									onClick={() => onCategoryChange(cat)}
									className={`cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-xs ${
										selectedCategory === cat
											? "bg-neutral-100 font-semibold text-neutral-950 dark:bg-neutral-800 dark:text-white"
											: "text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
								>
									{cat}
								</DropdownMenuItem>
							))}
						</DropdownMenuContent>
					</DropdownMenu>

					{/* Flow Pill Options */}
					<div className="flex flex-wrap items-center gap-1.5">
						{FLOW_OPTIONS.map((flow) => {
							const isActive = selectedFlow === flow.id;
							return (
								<button
									key={flow.id}
									type="button"
									onClick={() => onFlowChange(isActive ? "all" : flow.id)}
									className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-xs transition-all ${
										isActive
											? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
											: "border border-neutral-200/90 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
								>
									<span>{flow.label}</span>
									{isActive && (
										<span
											onClick={(e) => {
												e.stopPropagation();
												onFlowChange("all");
											}}
											className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-200 dark:text-neutral-900"
											aria-label="Remove filter"
										>
											<X className="h-2.5 w-2.5" />
										</span>
									)}
								</button>
							);
						})}
					</div>
				</div>

				{/* Right: Showing Count & Sorting */}
				<div className="flex items-center gap-3">
					<span className="text-neutral-500 text-xs dark:text-neutral-400">
						Showing{" "}
						<strong className="font-semibold text-neutral-900 dark:text-white">
							{totalFlowsCount.toLocaleString()}
						</strong>{" "}
						flows
					</span>

					{/* Sort Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-800 text-xs shadow-xs transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
								>
									<span>
										{sortBy === "popular"
											? "Most popular"
											: sortBy === "latest"
												? "Latest"
												: "Top rated"}
									</span>
									<ChevronDown className="h-3.5 w-3.5 text-neutral-400" />
								</button>
							}
						/>
						<DropdownMenuContent
							align="end"
							className="w-36 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
						>
							<DropdownMenuItem
								onClick={() => onSortByChange("popular")}
								className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-xs"
							>
								Most popular
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onSortByChange("latest")}
								className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-xs"
							>
								Latest
							</DropdownMenuItem>
							<DropdownMenuItem
								onClick={() => onSortByChange("rated")}
								className="cursor-pointer rounded-lg px-2.5 py-1.5 font-medium text-xs"
							>
								Top rated
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>
		</div>
	);
}
