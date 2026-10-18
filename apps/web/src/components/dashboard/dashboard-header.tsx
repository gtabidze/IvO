import { Link } from "@tanstack/react-router";
import { Plus, Scan, Search, UserPlus } from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/logo";
import { AddCompetenceModal } from "./add-competence-modal";
import { DashboardUserMenu } from "./dashboard-user-menu";
import { InviteMembersModal } from "./invite-members-modal";

interface DashboardHeaderProps {
	searchQuery: string;
	onSearchChange: (query: string) => void;
	onOpenPricing?: () => void;
	onOpenRequestContent: () => void;
	onOpenProfileMetadata: () => void;
	savedCount?: number;
}

export function DashboardHeader({
	searchQuery,
	onSearchChange,
	onOpenPricing = () => {},
	onOpenRequestContent,
	onOpenProfileMetadata,
	savedCount: _savedCount = 12,
}: DashboardHeaderProps) {
	const [inviteOpen, setInviteOpen] = useState(false);
	const [competenceOpen, setCompetenceOpen] = useState(false);

	return (
		<>
			<header className="sticky top-0 z-40 w-full border-neutral-200/80 border-b bg-white/90 backdrop-blur-md dark:border-neutral-800 dark:bg-neutral-950/90">
				<div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
					{/* Left: Logo */}
					<div className="flex shrink-0 items-center gap-6">
						<Link
							to="/dashboard"
							aria-label="Home"
							className="group flex items-center"
						>
							<LogoMark className="h-5 w-auto text-neutral-950 transition-opacity group-hover:opacity-80 dark:text-white" />
						</Link>
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
								placeholder="Search or ask workspace agents..."
								className="h-10 w-full rounded-full border border-neutral-200/80 bg-neutral-50/80 pr-10 pl-10 font-medium text-neutral-900 text-xs transition-all placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-900 dark:text-white dark:focus:border-neutral-600 dark:placeholder:text-neutral-500"
							/>
							<div className="absolute inset-y-0 right-0 flex items-center pr-3">
								<span className="flex items-center gap-0.5 text-neutral-400 hover:text-neutral-600 dark:text-neutral-500">
									<Scan className="h-3.5 w-3.5" />
								</span>
							</div>
						</div>
					</div>

					{/* Right: Secondary Actions (Invite members, Add competence) & User Menu */}
					<div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
						{/* Secondary Button: Invite members */}
						<button
							type="button"
							onClick={() => setInviteOpen(true)}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 font-medium text-neutral-700 text-xs shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] sm:px-3.5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
						>
							<UserPlus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
							<span>Invite members</span>
						</button>

						{/* Secondary Button: Add competence */}
						<button
							type="button"
							onClick={() => setCompetenceOpen(true)}
							className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-200/90 bg-white px-3 py-1.5 font-medium text-neutral-700 text-xs shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50 active:scale-[0.98] sm:px-3.5 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
						>
							<Plus className="h-3.5 w-3.5 text-neutral-500 dark:text-neutral-400" />
							<span>Add competence</span>
						</button>

						{/* User Avatar Menu */}
						<DashboardUserMenu
							onOpenProfileMetadata={onOpenProfileMetadata}
							onOpenRequestContent={onOpenRequestContent}
							onOpenPricing={onOpenPricing}
						/>
					</div>
				</div>
			</header>

			{/* Interactive Modals */}
			<InviteMembersModal open={inviteOpen} onOpenChange={setInviteOpen} />
			<AddCompetenceModal
				open={competenceOpen}
				onOpenChange={setCompetenceOpen}
			/>
		</>
	);
}
