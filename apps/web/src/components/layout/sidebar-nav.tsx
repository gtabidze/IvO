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
	ChevronDown,
	CreditCard,
	Ellipsis,
	FileText,
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
} from "lucide-react";
import { useState } from "react";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import type { AgentProfile } from "@/components/agents/agent-profile-dialog";
import { AdminProSwitcher } from "@/components/dashboard/admin-pro-switcher";
import { LogoMark } from "@/components/logo";
import { usePro } from "@/context/pro-context";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

export const PRODUCT_FLOW_TAGS = [
	{ id: "onboarding", label: "#onboarding" },
	{ id: "ordercard", label: "#ordercard" },
	{ id: "fclloan", label: "#fclloan" },
	{ id: "transfermoney_p2p", label: "#transfermoney_p2p" },
] as const;

interface SidebarNavProps {
	onOpenNewFlow: () => void;
	onOpenSearch?: () => void;
	onOpenNotifications?: () => void;
	onSelectAgent?: (agent: AgentProfile) => void;
	onOpenNewAgent?: () => void;
	onOpenPricing: () => void;
	onOpenRequestContent: () => void;
	onOpenProfileMetadata: () => void;
	onOpenInviteMembers?: () => void;
	onOpenAddCompetence?: () => void;
	selectedTag?: string | null;
	onSelectTag?: (tag: string | null) => void;
}

export function SidebarNav({
	onOpenNewFlow,
	onOpenSearch,
	onOpenNotifications,
	onSelectAgent,
	onOpenNewAgent,
	onOpenPricing,
	onOpenRequestContent,
	onOpenProfileMetadata,
	onOpenInviteMembers,
	onOpenAddCompetence,
	selectedTag,
	onSelectTag,
}: SidebarNavProps) {
	const navigate = useNavigate();
	const location = useLocation();
	const { isPro } = usePro();
	const { data: session, isPending: sessionPending } = authClient.useSession();

	const trpc = useTRPC();
	const agentsQ = useQuery(trpc.agent.list.queryOptions());
	const agents = (agentsQ.data ?? []) as unknown as AgentProfile[];

	// Toggle inline flows and agents lists in sidebar
	const [flowsExpanded, setFlowsExpanded] = useState(true);
	const [agentsExpanded, setAgentsExpanded] = useState(false);

	const userName = session?.user?.name || "HBF Admin";
	const userEmail = session?.user?.email || "hbf@admin.com";
	const userHandle = `@${(session?.user?.name || "hbfadmin").toLowerCase().replace(/\s+/g, "")}`;
	const initial = userName.charAt(0).toUpperCase() || "H";

	const pathname = location.pathname;
	const isHomeActive = pathname === "/dashboard" || pathname === "/";
	const isProfileActive =
		pathname.startsWith("/settings") || pathname === "/my-flows";

	return (
		<aside className="sticky top-0 flex h-screen w-18 flex-col justify-between border-neutral-200/80 border-r bg-white px-2.5 py-4 xl:w-68 xl:px-4 dark:border-neutral-800 dark:bg-neutral-950">
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

				{/* 5. Flows (with expandable products list) */}
				<div className="flex flex-col">
					<button
						type="button"
						onClick={() => setFlowsExpanded((prev) => !prev)}
						className="group flex cursor-pointer items-center justify-between rounded-full px-3.5 py-3 font-medium text-base text-neutral-700 transition-colors hover:bg-neutral-100 xl:px-4 dark:text-neutral-300 dark:hover:bg-neutral-900"
					>
						<div className="flex items-center gap-4">
							<Layers className="h-6 w-6 shrink-0 transition-transform group-hover:scale-105" />
							<span className="hidden xl:inline">Flows</span>
						</div>
						<div className="hidden items-center gap-1.5 xl:flex">
							{selectedTag && (
								<span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-[10px] text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
									#{selectedTag}
								</span>
							)}
							<ChevronDown
								className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
									flowsExpanded ? "rotate-180" : ""
								}`}
							/>
						</div>
					</button>

					{/* Expandable list of product names */}
					{flowsExpanded && (
						<div className="my-1 hidden flex-col gap-0.5 pl-9 xl:flex xl:pl-10">
							{PRODUCT_FLOW_TAGS.map((t) => {
								const isSelected = selectedTag === t.id;
								return (
									<button
										key={t.id}
										type="button"
										onClick={() => onSelectTag?.(t.id)}
										className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
											isSelected
												? "font-semibold text-neutral-950 dark:text-white"
												: "font-normal text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
										}`}
									>
										<span className="truncate">{t.label}</span>
									</button>
								);
							})}

							{/* See all flows */}
							<button
								type="button"
								onClick={() => onSelectTag?.(null)}
								className={`px-2.5 py-1 text-left font-medium text-xs transition-colors ${
									!selectedTag
										? "font-semibold text-blue-600 dark:text-blue-400"
										: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
								}`}
							>
								See all flows →
							</button>
						</div>
					)}
				</div>

				{/* 6. Agents (with expandable created agents list) */}
				<div className="flex flex-col">
					<button
						type="button"
						onClick={() => setAgentsExpanded((prev) => !prev)}
						className="group flex cursor-pointer items-center justify-between rounded-full px-3.5 py-3 font-medium text-base text-neutral-700 transition-colors hover:bg-neutral-100 xl:px-4 dark:text-neutral-300 dark:hover:bg-neutral-900"
					>
						<div className="flex items-center gap-4">
							<Bot className="h-6 w-6 shrink-0 transition-transform group-hover:scale-105" />
							<span className="hidden xl:inline">Agents</span>
						</div>
						<div className="hidden items-center gap-1.5 xl:flex">
							{agents.length > 0 && (
								<span className="rounded-full bg-neutral-100 px-2 py-0.5 font-bold text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
									{agents.length}
								</span>
							)}
							<ChevronDown
								className={`h-4 w-4 text-neutral-400 transition-transform duration-200 ${
									agentsExpanded ? "rotate-180" : ""
								}`}
							/>
						</div>
					</button>

					{/* Expandable list of created agents */}
					{agentsExpanded && (
						<div className="my-1 hidden flex-col gap-0.5 pl-9 xl:flex xl:pl-10">
							{agents.length === 0 ? (
								<div className="px-2.5 py-1.5 text-neutral-400 text-xs">
									No agents created yet.
								</div>
							) : (
								agents.map((agent) => (
									<button
										key={agent.id}
										type="button"
										onClick={() => onSelectAgent?.(agent)}
										className="flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left transition-colors hover:text-neutral-950 dark:hover:text-white"
									>
										<AgentAvatar
											emoji={agent.emoji}
											name={agent.name}
											size="sm"
											dimmed={!agent.enabled}
										/>
										<span className="min-w-0 flex-1 truncate font-medium text-neutral-700 text-xs dark:text-neutral-300">
											{agent.name}
										</span>
									</button>
								))
							)}

							{/* Actions: New agent & Manage */}
							<div className="flex flex-col gap-0.5 pt-1">
								<button
									type="button"
									onClick={onOpenNewAgent}
									title="New Agent"
									className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1 font-medium text-blue-600 text-xs hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Plus className="h-3.5 w-3.5 shrink-0" />
									<span>New Agent</span>
								</button>
								<Link
									to="/settings/account"
									search={{ tab: "agents" }}
									className="rounded-lg px-2.5 py-1 font-medium text-neutral-500 text-xs hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
								>
									Manage all agents →
								</Link>
							</div>
						</div>
					)}
				</div>

				{/* 6. Profile */}
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

				{/* 7. More (Dropdown menu) */}
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
								onClick={onOpenRequestContent}
								className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
							>
								<Layers className="h-4 w-4 text-neutral-500" />
								<span>Request content</span>
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

				{/* 8. Primary "New" Action Button */}
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

			{/* 9. Bottom User Profile Component (Matches screenshot 1 & 2) */}
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
								{/* User identity row */}
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

								{/* Admin Pro switcher */}
								<div className="px-1.5 pb-1">
									<AdminProSwitcher />
								</div>

								{/* Pro Gated Option: My Flows */}
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
									onClick={onOpenRequestContent}
									className="flex cursor-pointer items-center gap-2.5 rounded-2xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
								>
									<Plus className="h-4 w-4 text-neutral-500" />
									<span>Request content</span>
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

								{/* Log out item (matching screenshot 2) */}
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
	);
}
