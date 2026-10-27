import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import { Skeleton } from "@IvO/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
	Bell,
	BookOpen,
	Bot,
	CreditCard,
	Ellipsis,
	FileText,
	Hash,
	Home,
	Layers,
	LogOut,
	Plus,
	Search,
	Sparkles,
	User,
	UserCheck,
	UserCog,
	UserPlus,
	X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import type { AgentProfile } from "@/components/agents/agent-profile-dialog";
import { AdminProSwitcher } from "@/components/dashboard/admin-pro-switcher";
import { LogoMark } from "@/components/logo";
import { usePro } from "@/context/pro-context";
import { DASHBOARD_FLOWS } from "@/data/dashboard-flows";
import { authClient } from "@/lib/auth-client";
import { toDashboardFlow } from "@/lib/flow-adapter";
import { flowStore } from "@/lib/flow-store";
import { useTRPC } from "@/utils/trpc";

export interface ChannelDef {
	id: string;
	label: string;
	name: string;
	description: string;
	category: string;
}

export const CHANNELS_LIST: ChannelDef[] = [
	{
		id: "onboarding",
		label: "#onboarding",
		name: "Onboarding & Auth",
		description: "Account creation, KYC scanning, biometric setup",
		category: "Core",
	},
	{
		id: "ordercard",
		label: "#ordercard",
		name: "Card Ordering",
		description: "Physical & virtual debit cards, PIN configuration",
		category: "Cards",
	},
	{
		id: "fclloan",
		label: "#fclloan",
		name: "Loans & Credit",
		description: "Instant personal credit, underwriting & disbursement",
		category: "Credit",
	},
	{
		id: "transfermoney_p2p",
		label: "#transfermoney_p2p",
		name: "P2P Transfers",
		description: "Peer-to-peer wire transfers, split bill & contacts",
		category: "Payments",
	},
	{
		id: "savings",
		label: "#savings",
		name: "Vaults & Savings",
		description: "Automated spare change roundups, interest pots & goals",
		category: "Wealth",
	},
	{
		id: "crypto",
		label: "#crypto",
		name: "Crypto & Web3",
		description: "Token swaps, digital asset portfolios, staking",
		category: "Wealth",
	},
	{
		id: "security",
		label: "#security",
		name: "Security & Passkeys",
		description: "Two-factor authentication, device authorization",
		category: "Security",
	},
	{
		id: "billpay",
		label: "#billpay",
		name: "Bill Payments",
		description: "Utility invoices, automated direct debits",
		category: "Payments",
	},
	{
		id: "rewards",
		label: "#rewards",
		name: "Rewards & Perks",
		description: "Cashback tracking, loyalty perks & tier upgrades",
		category: "Perks",
	},
	{
		id: "investing",
		label: "#investing",
		name: "Stocks & Wealth",
		description: "Fractional shares, ETF portfolios, market orders",
		category: "Wealth",
	},
];

export const PRODUCT_FLOW_TAGS = [
	{ id: "onboarding", label: "#onboarding" },
	{ id: "ordercard", label: "#ordercard" },
	{ id: "fclloan", label: "#fclloan" },
	{ id: "transfermoney_p2p", label: "#transfermoney_p2p" },
] as const;

export interface SidebarNavProps {
	onOpenNewFlow: () => void;
	onOpenSearch?: () => void;
	onOpenNotifications?: () => void;
	onSelectAgent?: (agent: AgentProfile) => void;
	onOpenNewAgent?: () => void;
	onOpenPricing: () => void;
	onOpenRequestContent?: () => void;
	onOpenProfileMetadata: () => void;
	onOpenInviteMembers?: () => void;
	onOpenAddCompetence?: () => void;
	selectedTag?: string | null;
	onSelectTag?: (tag: string | null) => void;
	activeSecondaryPanel?: "channels" | "agents" | null;
	onActiveSecondaryPanelChange?: (panel: "channels" | "agents" | null) => void;
}

export function SidebarNav({
	onOpenNewFlow,
	onOpenSearch,
	onOpenNotifications,
	onSelectAgent,
	onOpenNewAgent,
	onOpenPricing,
	onOpenRequestContent: _onOpenRequestContent,
	onOpenProfileMetadata,
	onOpenInviteMembers,
	onOpenAddCompetence,
	selectedTag,
	onSelectTag,
	activeSecondaryPanel: controlledActivePanel,
	onActiveSecondaryPanelChange,
}: SidebarNavProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { isPro } = usePro();
	const { data: session, isPending: sessionPending } = authClient.useSession();

	const trpc = useTRPC();
	const agentsQ = useQuery(trpc.agent.list.queryOptions());
	const agents = (agentsQ.data ?? []) as unknown as AgentProfile[];

	// Uncontrolled / controlled secondary sidebar state
	const [uncontrolledPanel, setUncontrolledPanel] = useState<
		"channels" | "agents" | null
	>(null);

	const activePanel =
		controlledActivePanel !== undefined
			? controlledActivePanel
			: uncontrolledPanel;

	const setActivePanel = (panel: "channels" | "agents" | null) => {
		setUncontrolledPanel(panel);
		onActiveSecondaryPanelChange?.(panel);
	};

	// Search filter inside secondary sidebars
	const [channelFilter, setChannelFilter] = useState("");
	const [agentFilter, setAgentFilter] = useState("");

	const userName = session?.user?.name || "HBF Admin";
	const userEmail = session?.user?.email || "hbf@admin.com";
	const userHandle = `@${(session?.user?.name || "hbfadmin").toLowerCase().replace(/\s+/g, "")}`;
	const initial = userName.charAt(0).toUpperCase() || "H";

	const pathname = location.pathname;
	const isHomeActive = pathname === "/dashboard" || pathname === "/";
	const isProfileActive =
		pathname.startsWith("/settings") || pathname === "/my-flows";
	const isChannelsActive = activePanel === "channels";
	const isAgentsActive = activePanel === "agents";

	// Combine flows to compute channel item counts
	const allFlows = useMemo(() => {
		const custom = flowStore.getFlows();
		const customAdapted = custom
			.filter((cf) => cf.status === "published")
			.map(toDashboardFlow);
		return [...customAdapted, ...DASHBOARD_FLOWS];
	}, []);

	// Dynamic extra channels from flows if any
	const dynamicChannels = useMemo(() => {
		const existingIds = new Set(CHANNELS_LIST.map((c) => c.id));
		const extra: ChannelDef[] = [];
		for (const flow of allFlows) {
			for (const tag of flow.tags ?? []) {
				const clean = tag.toLowerCase().replace(/^#/, "");
				if (clean && !existingIds.has(clean)) {
					existingIds.add(clean);
					extra.push({
						id: clean,
						label: `#${clean}`,
						name:
							clean.charAt(0).toUpperCase() + clean.slice(1).replace(/_/g, " "),
						description: "Custom flow channel",
						category: "Custom",
					});
				}
			}
		}
		return [...CHANNELS_LIST, ...extra];
	}, [allFlows]);

	// Filtered channel list
	const filteredChannels = useMemo(() => {
		if (!channelFilter.trim()) return dynamicChannels;
		const q = channelFilter.toLowerCase().replace(/^#/, "");
		return dynamicChannels.filter(
			(c) =>
				c.id.toLowerCase().includes(q) ||
				c.name.toLowerCase().includes(q) ||
				c.description.toLowerCase().includes(q) ||
				c.category.toLowerCase().includes(q),
		);
	}, [dynamicChannels, channelFilter]);

	// Filtered agents list
	const filteredAgents = useMemo(() => {
		if (!agentFilter.trim()) return agents;
		const q = agentFilter.toLowerCase();
		return agents.filter(
			(a) =>
				a.name.toLowerCase().includes(q) ||
				a.slug.toLowerCase().includes(q) ||
				a.competence.toLowerCase().includes(q),
		);
	}, [agents, agentFilter]);

	const getChannelCount = (channelId: string) => {
		const norm = channelId.toLowerCase().replace(/^#/, "");
		return allFlows.filter((f) => {
			const tags = f.tags ?? [];
			const flowType = (f.flowType || "").toLowerCase();
			const flowId = (f.id || "").toLowerCase();
			const flowName = (f.flowName || "").toLowerCase();
			return (
				tags.some((t) => t.toLowerCase() === norm) ||
				flowType.includes(norm) ||
				flowId.includes(norm.replace(/_/g, "-")) ||
				flowName.includes(norm.replace(/_/g, " ")) ||
				(norm === "ordercard" &&
					(flowType.includes("card") ||
						flowName.includes("card") ||
						flowId.includes("card"))) ||
				(norm === "fclloan" &&
					(flowType.includes("loan") ||
						flowName.includes("loan") ||
						flowType.includes("credit") ||
						flowName.includes("credit"))) ||
				(norm === "onboarding" &&
					(flowType.includes("onboarding") ||
						flowType.includes("account") ||
						flowName.includes("onboarding"))) ||
				(norm === "transfermoney_p2p" &&
					(flowType.includes("transfer") || flowName.includes("transfer")))
			);
		}).length;
	};

	const handleChannelsClick = () => {
		if (pathname !== "/dashboard" && pathname !== "/") {
			navigate({ to: "/dashboard" });
		}
		setActivePanel(activePanel === "channels" ? null : "channels");
	};

	const handleAgentsClick = () => {
		setActivePanel(activePanel === "agents" ? null : "agents");
	};

	return (
		<div className="sticky top-0 z-30 flex h-screen shrink-0">
			{/* Primary Navigation Sidebar */}
			<aside className="flex h-screen w-18 flex-col justify-between border-neutral-200/80 border-r bg-white px-2.5 py-4 xl:w-68 xl:px-4 dark:border-neutral-800 dark:bg-neutral-950">
				{/* Top: Logo & Main Navigation List */}
				<div className="scrollbar-none flex flex-col gap-1 overflow-y-auto overflow-x-hidden">
					{/* 1. Logo */}
					<div className="mb-2 flex items-center">
						<Link
							to="/dashboard"
							aria-label="Alignment Home"
							className="flex h-12 w-fit items-center rounded-full px-3.5 transition-colors hover:bg-neutral-100 xl:px-4 dark:hover:bg-neutral-900"
						>
							<LogoMark className="h-5.5 w-auto text-neutral-950 xl:h-6 dark:text-white" />
						</Link>
					</div>

					{/* 2. Home */}
					<Link
						to="/dashboard"
						className={`group flex items-center gap-4 rounded-full px-3.5 py-3 text-base transition-colors hover:bg-neutral-100 xl:px-4 dark:hover:bg-neutral-900 ${
							isHomeActive
								? "font-bold text-neutral-950 dark:text-white"
								: "font-medium text-neutral-700 dark:text-neutral-300"
						}`}
					>
						<Home
							className={`h-6 w-6 shrink-0 transition-transform group-hover:scale-105 ${
								isHomeActive ? "stroke-[2.5px]" : "stroke-2"
							}`}
						/>
						<span className="hidden xl:inline">Home</span>
					</Link>

					{/* 3. Search */}
					<button
						type="button"
						onClick={onOpenSearch}
						className="group flex cursor-pointer items-center gap-4 rounded-full px-3.5 py-3 font-medium text-base text-neutral-700 transition-colors hover:bg-neutral-100 xl:px-4 dark:text-neutral-300 dark:hover:bg-neutral-900"
					>
						<Search className="h-6 w-6 shrink-0 transition-transform group-hover:scale-105" />
						<span className="hidden xl:inline">Search</span>
					</button>

					{/* 4. Notifications */}
					<button
						type="button"
						onClick={onOpenNotifications}
						className="group relative flex cursor-pointer items-center gap-4 rounded-full px-3.5 py-3 font-medium text-base text-neutral-700 transition-colors hover:bg-neutral-100 xl:px-4 dark:text-neutral-300 dark:hover:bg-neutral-900"
					>
						<div className="relative shrink-0">
							<Bell className="h-6 w-6 transition-transform group-hover:scale-105" />
							<span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 font-bold text-[10px] text-white">
								1
							</span>
						</div>
						<span className="hidden xl:inline">Notifications</span>
					</button>

					{/* 5. Channels (Replaces Flows, with Hash # Icon, no accordion) */}
					<button
						type="button"
						onClick={handleChannelsClick}
						aria-label="Channels"
						className={`group flex cursor-pointer items-center justify-between rounded-full px-3.5 py-3 text-base transition-colors hover:bg-neutral-100 xl:px-4 dark:hover:bg-neutral-900 ${
							isChannelsActive
								? "bg-neutral-100 font-bold text-neutral-950 dark:bg-neutral-900 dark:text-white"
								: "font-medium text-neutral-700 dark:text-neutral-300"
						}`}
					>
						<div className="flex items-center gap-4">
							<Hash
								className={`h-6 w-6 shrink-0 transition-transform group-hover:scale-105 ${
									isChannelsActive
										? "stroke-[2.5px] text-blue-600 dark:text-blue-400"
										: "stroke-2"
								}`}
							/>
							<span className="hidden xl:inline">Channels</span>
						</div>
						{selectedTag && (
							<span className="hidden rounded-full bg-blue-100 px-2 py-0.5 font-bold text-[10px] text-blue-700 xl:inline dark:bg-blue-900/60 dark:text-blue-300">
								#{selectedTag}
							</span>
						)}
					</button>

					{/* 6. Agents (No accordion, opens agents secondary sidebar grid) */}
					<button
						type="button"
						onClick={handleAgentsClick}
						aria-label="Agents"
						className={`group flex cursor-pointer items-center justify-between rounded-full px-3.5 py-3 text-base transition-colors hover:bg-neutral-100 xl:px-4 dark:hover:bg-neutral-900 ${
							isAgentsActive
								? "bg-neutral-100 font-bold text-neutral-950 dark:bg-neutral-900 dark:text-white"
								: "font-medium text-neutral-700 dark:text-neutral-300"
						}`}
					>
						<div className="flex items-center gap-4">
							<Bot
								className={`h-6 w-6 shrink-0 transition-transform group-hover:scale-105 ${
									isAgentsActive
										? "stroke-[2.5px] text-blue-600 dark:text-blue-400"
										: "stroke-2"
								}`}
							/>
							<span className="hidden xl:inline">Agents</span>
						</div>
						{agents.length > 0 && (
							<span className="hidden rounded-full bg-neutral-100 px-2 py-0.5 font-bold text-[10px] text-neutral-600 xl:inline dark:bg-neutral-800 dark:text-neutral-400">
								{agents.length}
							</span>
						)}
					</button>

					{/* 7. Profile */}
					<Link
						to="/settings/account"
						className={`group flex items-center gap-4 rounded-full px-3.5 py-3 text-base transition-colors hover:bg-neutral-100 xl:px-4 dark:hover:bg-neutral-900 ${
							isProfileActive
								? "font-bold text-neutral-950 dark:text-white"
								: "font-medium text-neutral-700 dark:text-neutral-300"
						}`}
					>
						<User
							className={`h-6 w-6 shrink-0 transition-transform group-hover:scale-105 ${
								isProfileActive ? "stroke-[2.5px]" : "stroke-2"
							}`}
						/>
						<span className="hidden xl:inline">Profile</span>
					</Link>

					{/* 8. More (Dropdown menu) */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className="group flex cursor-pointer items-center gap-4 rounded-full px-3.5 py-3 font-medium text-base text-neutral-700 transition-colors hover:bg-neutral-100 xl:px-4 dark:text-neutral-300 dark:hover:bg-neutral-900"
								>
									<Ellipsis className="h-6 w-6 shrink-0 transition-transform group-hover:scale-105" />
									<span className="hidden xl:inline">More</span>
								</button>
							}
						/>
						<DropdownMenuContent
							align="start"
							side="top"
							className="w-56 rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
						>
							<DropdownMenuGroup>
								<DropdownMenuItem
									onClick={onOpenInviteMembers}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<UserPlus className="h-4 w-4 text-neutral-500" />
									<span>Invite members</span>
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={onOpenAddCompetence}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<Sparkles className="h-4 w-4 text-neutral-500" />
									<span>Add competence</span>
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={onOpenNewFlow}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<Plus className="h-4 w-4 text-neutral-500" />
									<span>Add flow</span>
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={onOpenPricing}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<CreditCard className="h-4 w-4 text-neutral-500" />
									<span className="flex-1">Pricing</span>
									<span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-semibold text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
										Pro
									</span>
								</DropdownMenuItem>

								<DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />

								<DropdownMenuItem
									onClick={() => {
										window.open("https://github.com", "_blank");
									}}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<FileText className="h-4 w-4 text-neutral-500" />
									<span>Changelog</span>
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={() => {
										window.open("https://ivo.design/blog", "_blank");
									}}
									className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<BookOpen className="h-4 w-4 text-neutral-500" />
									<span>Blog</span>
								</DropdownMenuItem>
							</DropdownMenuGroup>
						</DropdownMenuContent>
					</DropdownMenu>

					{/* 9. Primary "New" Action Button */}
					<div className="mt-4 px-1">
						<button
							type="button"
							onClick={onOpenNewFlow}
							className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-neutral-950 font-bold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-95 xl:h-12 xl:w-full xl:rounded-full xl:px-6 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							<Plus className="h-5 w-5 xl:hidden" />
							<span className="hidden text-base tracking-wide xl:inline">
								New
							</span>
						</button>
					</div>
				</div>

				{/* 10. Bottom User Profile Component */}
				<div className="pt-3">
					{sessionPending ? (
						<div className="flex items-center gap-3 p-2">
							<Skeleton className="h-10 w-10 rounded-full" />
							<div className="hidden flex-1 space-y-1.5 xl:block">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="h-2.5 w-16" />
							</div>
						</div>
					) : (
						<DropdownMenu>
							<DropdownMenuTrigger
								render={
									<button
										type="button"
										className="group flex w-full cursor-pointer items-center justify-between rounded-full p-2 transition-colors hover:bg-neutral-100 xl:p-2.5 dark:hover:bg-neutral-900"
										aria-label="User navigation menu"
									>
										<div className="flex items-center gap-3">
											<div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-900 font-bold text-sm text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900">
												{initial}
												<span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-950" />
											</div>
											<div className="hidden min-w-0 text-left xl:block">
												<div className="truncate font-bold text-neutral-950 text-sm leading-tight dark:text-white">
													{userName}
												</div>
												<div className="truncate font-normal text-neutral-500 text-xs">
													{userHandle}
												</div>
											</div>
										</div>
										<Ellipsis className="hidden h-5 w-5 text-neutral-500 group-hover:text-neutral-900 xl:block dark:text-neutral-400 dark:group-hover:text-white" />
									</button>
								}
							/>
							<DropdownMenuContent
								align="start"
								side="top"
								sideOffset={8}
								className="w-68 rounded-3xl border border-neutral-200/80 bg-white p-2 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900"
							>
								<DropdownMenuGroup>
									<div className="px-3 py-2.5">
										<div className="flex items-center justify-between">
											<p className="truncate font-bold text-neutral-900 text-sm dark:text-white">
												{userName}
											</p>
											{isPro ? (
												<span className="rounded-full bg-neutral-950 px-2 py-0.5 font-bold text-[9px] text-white dark:bg-white dark:text-neutral-900">
													PRO
												</span>
											) : (
												<span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-[9px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
													FREE
												</span>
											)}
										</div>
										<p className="truncate text-neutral-500 text-xs dark:text-neutral-400">
											{userEmail}
										</p>
									</div>

									<DropdownMenuSeparator className="my-1.5 bg-neutral-100 dark:bg-neutral-800" />

									<div className="px-1.5 pb-1">
										<AdminProSwitcher />
									</div>

									{isPro && (
										<DropdownMenuItem
											onClick={() => navigate({ to: "/my-flows" })}
											className="mb-1 flex cursor-pointer items-center gap-2.5 rounded-2xl bg-neutral-900 px-3 py-2.5 font-semibold text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
										>
											<Layers className="h-4 w-4" />
											<span className="flex-1">My Flows</span>
											<span className="rounded-full bg-blue-500/20 px-1.5 py-0.2 font-bold text-[9px] text-blue-300 uppercase tracking-wider">
												Studio
											</span>
										</DropdownMenuItem>
									)}

									<DropdownMenuItem
										onClick={() => navigate({ to: "/settings/account" })}
										className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
									>
										<UserCog className="h-4 w-4 text-neutral-500" />
										<span>Account settings</span>
									</DropdownMenuItem>

									<DropdownMenuItem
										onClick={onOpenProfileMetadata}
										className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
									>
										<UserCheck className="h-4 w-4 text-neutral-500" />
										<span>Setup profile metadata</span>
									</DropdownMenuItem>

									<DropdownMenuItem
										onClick={onOpenNewFlow}
										className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
									>
										<Plus className="h-4 w-4 text-neutral-500" />
										<span>Add flow</span>
									</DropdownMenuItem>

									<DropdownMenuItem
										onClick={onOpenPricing}
										className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
									>
										<CreditCard className="h-4 w-4 text-neutral-500" />
										<span className="flex-1">Pricing</span>
										<span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-semibold text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
											Pro
										</span>
									</DropdownMenuItem>

									<DropdownMenuSeparator className="my-1.5 bg-neutral-100 dark:bg-neutral-800" />

									<DropdownMenuItem
										variant="destructive"
										onClick={() => {
											authClient.signOut({
												fetchOptions: {
													onSuccess: () => {
														navigate({ to: "/" });
													},
												},
											});
										}}
										className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2.5 font-semibold text-red-600 text-xs hover:bg-red-50 dark:hover:bg-red-950/40"
									>
										<LogOut className="h-4 w-4 text-red-600" />
										<span>Log out {userHandle}</span>
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					)}
				</div>
			</aside>

			{/* Secondary Sidebar: Channels */}
			{activePanel === "channels" && (
				<aside className="flex h-screen w-72 flex-col border-neutral-200/80 border-r bg-white xl:w-80 dark:border-neutral-800 dark:bg-neutral-950">
					{/* Header */}
					<div className="flex items-center justify-between border-neutral-200/80 border-b px-4 py-3.5 dark:border-neutral-800">
						<div className="flex items-center gap-2.5">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 font-bold font-mono text-blue-600 text-sm dark:bg-blue-950 dark:text-blue-400">
								#
							</div>
							<div>
								<h2 className="font-bold text-neutral-950 text-sm leading-tight dark:text-white">
									Channels
								</h2>
								<p className="text-[11px] text-neutral-400">
									{dynamicChannels.length} channels available
								</p>
							</div>
						</div>
						<button
							type="button"
							onClick={() => setActivePanel(null)}
							aria-label="Close channels sidebar"
							className="cursor-pointer rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
						>
							<X className="h-4 w-4" />
						</button>
					</div>

					{/* Search inline filter */}
					<div className="border-neutral-200/60 border-b px-3 py-2 dark:border-neutral-800/80">
						<div className="relative">
							<Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-neutral-400" />
							<input
								type="search"
								value={channelFilter}
								onChange={(e) => setChannelFilter(e.target.value)}
								placeholder="Filter #channels..."
								className="h-8 w-full rounded-xl border border-neutral-200 bg-neutral-100/60 pr-3 pl-8 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-700 dark:placeholder:text-neutral-500"
							/>
						</div>
					</div>

					{/* All channels visible, scroll inline */}
					<div className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-2.5 py-2.5">
						{/* "All Channels" reset option */}
						<button
							type="button"
							onClick={() => onSelectTag?.(null)}
							className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
								!selectedTag
									? "bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-300"
									: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
							}`}
						>
							<div className="flex min-w-0 items-center gap-2.5">
								<div
									className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold font-mono text-xs ${
										!selectedTag
											? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
											: "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
									}`}
								>
									*
								</div>
								<div className="min-w-0">
									<p className="truncate font-semibold text-xs leading-tight">
										All Channels
									</p>
									<p className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
										View all flows & screens
									</p>
								</div>
							</div>
							<span
								className={`shrink-0 rounded-full px-2 py-0.5 font-bold text-[10px] ${
									!selectedTag
										? "bg-blue-200/80 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
										: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
								}`}
							>
								{allFlows.length}
							</span>
						</button>

						<div className="px-3 pt-2 pb-1 font-bold text-[10px] text-neutral-400 uppercase tracking-wider">
							Channels ({filteredChannels.length})
						</div>

						{filteredChannels.length === 0 ? (
							<p className="px-3 py-4 text-center text-neutral-400 text-xs">
								No channels matching "{channelFilter}"
							</p>
						) : (
							filteredChannels.map((channel) => {
								const isSelected = selectedTag === channel.id;
								const count = getChannelCount(channel.id);
								return (
									<button
										key={channel.id}
										type="button"
										onClick={() =>
											onSelectTag?.(isSelected ? null : channel.id)
										}
										className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-left transition-colors ${
											isSelected
												? "bg-blue-50 font-semibold text-blue-700 ring-1 ring-blue-500/20 dark:bg-blue-950/60 dark:text-blue-300"
												: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-900"
										}`}
									>
										<div className="flex min-w-0 items-center gap-2.5">
											<div
												className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-bold font-mono text-xs ${
													isSelected
														? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
														: "bg-neutral-100 text-neutral-500 group-hover:bg-neutral-200 group-hover:text-neutral-800 dark:bg-neutral-800 dark:text-neutral-400 dark:group-hover:bg-neutral-700"
												}`}
											>
												#
											</div>
											<div className="min-w-0">
												<p className="truncate font-semibold text-xs leading-tight">
													{channel.id}
												</p>
												<p className="truncate text-[10px] text-neutral-400 dark:text-neutral-500">
													{channel.name}
												</p>
											</div>
										</div>
										{count > 0 && (
											<span
												className={`shrink-0 rounded-full px-2 py-0.5 font-bold text-[10px] ${
													isSelected
														? "bg-blue-200/80 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
														: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
												}`}
											>
												{count}
											</span>
										)}
									</button>
								);
							})
						)}
					</div>
				</aside>
			)}

			{/* Secondary Sidebar: Agents (Grid view) */}
			{activePanel === "agents" && (
				<aside className="flex h-screen w-80 flex-col border-neutral-200/80 border-r bg-white xl:w-92 dark:border-neutral-800 dark:bg-neutral-950">
					{/* Header */}
					<div className="flex items-center justify-between border-neutral-200/80 border-b px-4 py-3.5 dark:border-neutral-800">
						<div className="flex items-center gap-2.5">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
								<Bot className="h-4 w-4" />
							</div>
							<div>
								<h2 className="font-bold text-neutral-950 text-sm leading-tight dark:text-white">
									Agents
								</h2>
								<p className="text-[11px] text-neutral-400">
									{agents.length} workspace team members
								</p>
							</div>
						</div>
						<div className="flex items-center gap-1.5">
							<button
								type="button"
								onClick={onOpenNewAgent}
								className="flex cursor-pointer items-center gap-1 rounded-full bg-neutral-950 px-2.5 py-1 font-semibold text-[11px] text-white hover:bg-neutral-800 active:scale-95 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								<Plus className="h-3 w-3" />
								<span>New</span>
							</button>
							<button
								type="button"
								onClick={() => setActivePanel(null)}
								aria-label="Close agents sidebar"
								className="cursor-pointer rounded-full p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-white"
							>
								<X className="h-4 w-4" />
							</button>
						</div>
					</div>

					{/* Search inline filter */}
					<div className="border-neutral-200/60 border-b px-3 py-2 dark:border-neutral-800/80">
						<div className="relative">
							<Search className="pointer-events-none absolute top-2.5 left-2.5 h-3.5 w-3.5 text-neutral-400" />
							<input
								type="search"
								value={agentFilter}
								onChange={(e) => setAgentFilter(e.target.value)}
								placeholder="Filter agents..."
								className="h-8 w-full rounded-xl border border-neutral-200 bg-neutral-100/60 pr-3 pl-8 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-300 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-700 dark:placeholder:text-neutral-500"
							/>
						</div>
					</div>

					{/* Agent List as a GRID not table */}
					<div className="scrollbar-thin flex-1 space-y-3 overflow-y-auto p-3">
						{agentsQ.isLoading ? (
							<div className="grid grid-cols-2 gap-2.5">
								<Skeleton className="h-36 rounded-2xl" />
								<Skeleton className="h-36 rounded-2xl" />
								<Skeleton className="h-36 rounded-2xl" />
								<Skeleton className="h-36 rounded-2xl" />
							</div>
						) : filteredAgents.length === 0 ? (
							<div className="py-8 text-center">
								<p className="text-neutral-400 text-xs">No agents found.</p>
								<button
									type="button"
									onClick={onOpenNewAgent}
									className="mt-2 text-blue-600 text-xs hover:underline dark:text-blue-400"
								>
									Create your first agent
								</button>
							</div>
						) : (
							<div className="grid grid-cols-2 gap-2.5">
								{filteredAgents.map((agent) => (
									<button
										key={agent.id}
										type="button"
										onClick={() => onSelectAgent?.(agent)}
										className="group relative flex cursor-pointer flex-col items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/50 p-3 text-center transition-all hover:-translate-y-0.5 hover:border-neutral-300 hover:bg-white hover:shadow-xs active:scale-98 dark:border-neutral-800 dark:bg-neutral-900/50 dark:hover:border-neutral-700 dark:hover:bg-neutral-900"
									>
										{/* Active status indicator dot */}
										<div className="absolute top-2.5 right-2.5 flex items-center">
											<span
												className={`h-2 w-2 rounded-full ${
													agent.enabled
														? "bg-emerald-500 shadow-emerald-500/50 shadow-xs"
														: "bg-neutral-300 dark:bg-neutral-600"
												}`}
												title={agent.enabled ? "Active" : "Disabled"}
											/>
										</div>

										{/* Avatar */}
										<div className="mt-1">
											<AgentAvatar
												emoji={agent.emoji}
												name={agent.name}
												size="md"
												dimmed={!agent.enabled}
											/>
										</div>

										{/* Info */}
										<div className="mt-2 w-full min-w-0">
											<p className="truncate font-bold text-neutral-950 text-xs dark:text-white">
												{agent.name}
											</p>
											<p className="truncate text-[10px] text-neutral-400">
												@{agent.slug}
											</p>
											<p className="mt-1 line-clamp-2 px-0.5 text-[10px] text-neutral-500 leading-snug dark:text-neutral-400">
												{agent.competence}
											</p>
										</div>

										{/* Built-in / Custom tag */}
										<div className="mt-2.5 flex w-full items-center justify-center">
											{agent.builtinKey ? (
												<span className="rounded-full bg-neutral-100 px-2 py-0.5 font-semibold text-[9px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
													BUILT-IN
												</span>
											) : (
												<span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-[9px] text-blue-600 dark:bg-blue-950 dark:text-blue-400">
													CUSTOM
												</span>
											)}
										</div>
									</button>
								))}
							</div>
						)}
					</div>

					{/* Footer Link */}
					<div className="border-neutral-200/80 border-t p-3 dark:border-neutral-800">
						<Link
							to="/settings/account"
							search={{ tab: "agents" }}
							className="flex w-full items-center justify-center rounded-xl py-2 font-semibold text-neutral-600 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
						>
							Manage all agents in Settings →
						</Link>
					</div>
				</aside>
			)}
		</div>
	);
}
