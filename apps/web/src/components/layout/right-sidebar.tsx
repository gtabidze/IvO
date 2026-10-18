import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useState } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import type { AgentProfile } from "@/components/agents/agent-profile-dialog";

interface RightSidebarProps {
	searchQuery: string;
	onSearchChange: (q: string) => void;
	agents: AgentProfile[];
	onSelectAgent: (agent: AgentProfile) => void;
}

interface BenchmarkApp {
	id: string;
	name: string;
	handle: string;
	category: string;
	color: string;
	logoText: string;
	isFollowing: boolean;
}

const INITIAL_APPS: BenchmarkApp[] = [
	{
		id: "revolut",
		name: "Revolut",
		handle: "@revolutapp",
		category: "Fintech",
		color: "#0075eb",
		logoText: "R",
		isFollowing: true,
	},
	{
		id: "stripe",
		name: "Stripe",
		handle: "@stripe",
		category: "Payments",
		color: "#635bff",
		logoText: "S",
		isFollowing: false,
	},
	{
		id: "monzo",
		name: "Monzo",
		handle: "@monzo",
		category: "Banking",
		color: "#ff3366",
		logoText: "M",
		isFollowing: true,
	},
	{
		id: "wise",
		name: "Wise",
		handle: "@wise",
		category: "Transfers",
		color: "#163300",
		logoText: "W",
		isFollowing: false,
	},
];

export function RightSidebar({
	searchQuery,
	onSearchChange,
	agents,
	onSelectAgent,
}: RightSidebarProps) {
	const [apps, setApps] = useState(INITIAL_APPS);

	const toggleFollow = (id: string) => {
		setApps((prev) =>
			prev.map((app) =>
				app.id === id ? { ...app, isFollowing: !app.isFollowing } : app,
			),
		);
	};

	return (
		<aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto px-4 py-3 lg:flex xl:w-88 xl:px-6">
			{/* Search Bar */}
			<div className="relative w-full">
				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
					<Search className="h-4 w-4 text-neutral-400 dark:text-neutral-500" />
				</div>
				<input
					type="search"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
					placeholder="Search flows, screens, or agents..."
					className="h-11 w-full rounded-full border border-transparent bg-neutral-100/80 pr-4 pl-11 text-neutral-900 text-xs transition-all placeholder:text-neutral-500 focus:border-neutral-300 focus:bg-white focus:outline-none dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-700 dark:focus:bg-neutral-950 dark:placeholder:text-neutral-400"
				/>
			</div>

			{/* Workspace AI Agents Card */}
			<div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
				<h3 className="font-extrabold text-base text-neutral-950 tracking-tight dark:text-white">
					Workspace Agents
				</h3>

				<div className="mt-3 divide-y divide-neutral-200/50 dark:divide-neutral-800/60">
					{agents.slice(0, 3).map((agent) => (
						<div
							key={agent.id}
							className="flex items-center justify-between gap-3 py-2.5"
						>
							<div className="flex min-w-0 items-center gap-2.5">
								<AgentAvatar emoji={agent.emoji} name={agent.name} size="sm" />
								<div className="min-w-0 flex-1">
									<p className="truncate font-bold text-neutral-950 text-xs dark:text-white">
										{agent.name}
									</p>
									<p className="truncate text-[11px] text-neutral-500">
										{agent.competence}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => onSelectAgent(agent)}
								className="shrink-0 cursor-pointer rounded-full bg-neutral-900 px-3 py-1 font-semibold text-[11px] text-white hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								Profile
							</button>
						</div>
					))}
				</div>

				<div className="pt-2">
					<Link
						to="/settings/account"
						search={{ tab: "agents" }}
						className="cursor-pointer text-blue-600 text-xs hover:underline dark:text-blue-400"
					>
						Show more
					</Link>
				</div>
			</div>

			{/* "Who to follow" Benchmark Apps Card (Matches screenshot 1) */}
			<div className="rounded-3xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/40">
				<h3 className="font-extrabold text-base text-neutral-950 tracking-tight dark:text-white">
					Who to follow
				</h3>

				<div className="mt-3 divide-y divide-neutral-200/50 dark:divide-neutral-800/60">
					{apps.map((app) => (
						<div
							key={app.id}
							className="flex items-center justify-between gap-3 py-3"
						>
							<div className="flex min-w-0 items-center gap-3">
								<div
									style={{ backgroundColor: app.color }}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white shadow-xs"
								>
									{app.logoText}
								</div>
								<div className="min-w-0">
									<p className="truncate font-bold text-neutral-950 text-xs dark:text-white">
										{app.name}
									</p>
									<p className="truncate text-[11px] text-neutral-500">
										{app.handle}
									</p>
								</div>
							</div>
							<button
								type="button"
								onClick={() => toggleFollow(app.id)}
								className={`cursor-pointer rounded-full px-3.5 py-1.5 font-bold text-xs transition-all active:scale-95 ${
									app.isFollowing
										? "border border-neutral-300 bg-white text-neutral-900 hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:hover:border-red-800 dark:hover:bg-red-950/40 dark:hover:text-red-400"
										: "bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
								}`}
							>
								{app.isFollowing ? "Following" : "Follow"}
							</button>
						</div>
					))}
				</div>

				<div className="pt-2">
					<button
						type="button"
						onClick={() => onSearchChange("Fintech")}
						className="cursor-pointer text-blue-600 text-xs hover:underline dark:text-blue-400"
					>
						Show more
					</button>
				</div>
			</div>

			{/* Footer Links & Copyright (Matches screenshot 1) */}
			<div className="px-2 pt-2 text-[11px] text-neutral-400 leading-normal dark:text-neutral-500">
				<div className="flex flex-wrap gap-x-2 gap-y-1">
					<a href="/terms" className="hover:underline">
						Terms
					</a>
					<span>·</span>
					<a href="/privacy" className="hover:underline">
						Privacy
					</a>
					<span>·</span>
					<a href="/cookies" className="hover:underline">
						Cookies
					</a>
					<span>·</span>
					<a href="/accessibility" className="hover:underline">
						Accessibility
					</a>
					<span>·</span>
					<a href="/ads" className="hover:underline">
						Ads Info
					</a>
					<span>·</span>
					<span>© 2026 Ivo Corp.</span>
				</div>
			</div>
		</aside>
	);
}
