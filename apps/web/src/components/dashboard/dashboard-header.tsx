import { Link } from "@tanstack/react-router";
import { Bell, Bookmark, Globe, Scan, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { usePro } from "@/context/pro-context";
import { AdminProSwitcher } from "./admin-pro-switcher";
import { DashboardUserMenu } from "./dashboard-user-menu";

interface DashboardHeaderProps {
	activeTab: "apps" | "sites";
	onTabChange: (tab: "apps" | "sites") => void;
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onOpenPricing: () => void;
	onOpenRequestContent: () => void;
	onOpenProfileMetadata: () => void;
	savedCount?: number;
}

export function DashboardHeader({
	activeTab,
	onTabChange,
	searchQuery,
	onSearchChange,
	onOpenPricing,
	onOpenRequestContent,
	onOpenProfileMetadata,
	savedCount = 12,
}: DashboardHeaderProps) {
	const { isPro } = usePro();
	const [hasUnread, setHasUnread] = useState(true);

	return (
		<header className="sticky top-0 z-40 w-full border-neutral-200/80 border-b bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
			<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				{/* Left: Logo & Apps / Sites Switcher */}
				<div className="flex shrink-0 items-center gap-6">
					<Link to="/dashboard" className="group flex items-center gap-2.5">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-950 font-bold font-mono text-white text-xs shadow-xs transition-colors group-hover:bg-blue-600">
							<svg
								width="18"
								height="18"
								viewBox="0 0 24 24"
								fill="none"
								role="img"
								aria-label="IvO Logo"
								xmlns="http://www.w3.org/2000/svg"
								className="text-white"
							>
								<title>IvO Logo</title>
								<circle
									cx="12"
									cy="12"
									r="9"
									stroke="currentColor"
									strokeWidth="2"
									strokeDasharray="3 3"
								/>
								<circle cx="12" cy="12" r="3" fill="currentColor" />
								<path
									d="M4 12H9"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
								<path
									d="M15 12H20"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
								/>
							</svg>
						</div>
						<div className="flex flex-col">
							<span className="flex items-center gap-1.5 font-bold text-base text-neutral-950 tracking-tight dark:text-white">
								IvO
								<span className="rounded-full border border-blue-200/60 bg-blue-50 px-1.5 py-0.2 font-mono font-semibold text-[10px] text-blue-700 dark:border-blue-900/50 dark:bg-blue-950 dark:text-blue-300">
									Finance+
								</span>
							</span>
						</div>
					</Link>

					{/* Apps and Sites Navigation */}
					<nav className="flex items-center gap-1 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200/60 dark:bg-neutral-900 dark:ring-neutral-800">
						<button
							type="button"
							onClick={() => onTabChange("apps")}
							className={`rounded-full px-3.5 py-1 font-medium text-xs transition-all ${
								activeTab === "apps"
									? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
									: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Apps
						</button>
						<button
							type="button"
							onClick={() => onTabChange("sites")}
							className={`rounded-full px-3.5 py-1 font-medium text-xs transition-all ${
								activeTab === "sites"
									? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
									: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							Sites
						</button>
					</nav>
				</div>

				{/* Center: Search Bar */}
				<div className="flex max-w-xl flex-1 items-center">
					<div className="relative w-full">
						<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
							<Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
						</div>
						<input
							type="search"
							value={searchQuery}
							onChange={(e) => onSearchChange(e.target.value)}
							placeholder={
								activeTab === "apps" ? "Search on iOS..." : "Search on Web..."
							}
							className="h-10 w-full rounded-full border border-neutral-200/80 bg-neutral-50/80 pr-10 pl-10 font-medium text-neutral-900 text-xs transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-600 dark:placeholder:text-neutral-500"
						/>
						<div className="absolute inset-y-0 right-0 flex items-center pr-3">
							<span className="flex items-center gap-0.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500">
								<Scan className="h-3.5 w-3.5" />
							</span>
						</div>
					</div>
				</div>

				{/* Right: Saved, Globe, Bell, Get Pro & User Menu */}
				<div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
					{/* Saved / Bookmarks */}
					<button
						type="button"
						onClick={() =>
							toast.info(`Saved library: ${savedCount} screens bookmarked`)
						}
						className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
						aria-label="View saved screens"
					>
						<Bookmark className="h-4 w-4" />
						{savedCount > 0 && (
							<span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-neutral-900 font-semibold text-[9px] text-white dark:bg-neutral-100 dark:text-neutral-900">
								{savedCount}
							</span>
						)}
					</button>

					{/* Globe / Region */}
					<button
						type="button"
						onClick={() => toast.info("Global region: US & EEA benchmarks")}
						className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 sm:flex dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
						aria-label="Region switcher"
					>
						<Globe className="h-4 w-4" />
					</button>

					{/* Notifications Bell */}
					<button
						type="button"
						onClick={() => {
							setHasUnread(false);
							toast.success("All notifications caught up", {
								description:
									"4 new teardown flows added today in Banking & Crypto.",
							});
						}}
						className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
						aria-label="Notifications"
					>
						<Bell className="h-4 w-4" />
						{hasUnread && (
							<span className="absolute top-1.5 right-1.5 h-2 w-2 animate-pulse rounded-full bg-blue-600" />
						)}
					</button>

					{/* Admin Pro Switcher */}
					<AdminProSwitcher />

					{/* Get Pro Button or Pro Badge */}
					{!isPro ? (
						<button
							type="button"
							onClick={onOpenPricing}
							className="cursor-pointer rounded-full bg-neutral-950 px-3.5 py-1.5 font-semibold text-white text-xs shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							Get Pro
						</button>
					) : (
						<button
							type="button"
							onClick={onOpenPricing}
							className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-50 px-3 py-1.5 font-semibold text-neutral-900 text-xs transition-all hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:hover:bg-neutral-800"
							title="Pro Member status active"
						>
							<span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
							<span>Pro</span>
						</button>
					)}

					{/* User Avatar Menu */}
					<DashboardUserMenu
						onOpenProfileMetadata={onOpenProfileMetadata}
						onOpenRequestContent={onOpenRequestContent}
						onOpenPricing={onOpenPricing}
					/>
				</div>
			</div>
		</header>
	);
}
