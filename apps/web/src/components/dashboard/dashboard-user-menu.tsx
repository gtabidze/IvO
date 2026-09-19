import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import { Skeleton } from "@IvO/ui/components/skeleton";
import { useNavigate } from "@tanstack/react-router";
import {
	BookOpen,
	CreditCard,
	FileText,
	Layers,
	LogOut,
	PlusCircle,
	UserCheck,
	UserCog,
} from "lucide-react";

import { usePro } from "@/context/pro-context";
import { authClient } from "@/lib/auth-client";

interface DashboardUserMenuProps {
	onOpenProfileMetadata: () => void;
	onOpenRequestContent: () => void;
	onOpenPricing: () => void;
}

export function DashboardUserMenu({
	onOpenProfileMetadata,
	onOpenRequestContent,
	onOpenPricing,
}: DashboardUserMenuProps) {
	const navigate = useNavigate();
	const { isPro } = usePro();
	const { data: session, isPending } = authClient.useSession();

	if (isPending) {
		return <Skeleton className="h-8 w-8 rounded-full" />;
	}

	const userName = session?.user?.name || "User";
	const userEmail = session?.user?.email || "user@ivo.design";
	const initial = userName.charAt(0).toUpperCase() || "G";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<button
						type="button"
						className="relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900 font-medium text-white text-xs shadow-xs transition-transform hover:scale-105 active:scale-95 dark:bg-neutral-100 dark:text-neutral-900"
						aria-label="User profile and menu"
					>
						{initial}
						<span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-neutral-950" />
					</button>
				}
			/>
			<DropdownMenuContent
				align="end"
				className="w-60 rounded-2xl border border-neutral-200/80 bg-white p-1.5 shadow-xl dark:border-neutral-800 dark:bg-neutral-900"
			>
				<DropdownMenuGroup>
					<div className="px-3 py-2">
						<div className="flex items-center justify-between">
							<p className="truncate font-semibold text-neutral-900 text-xs dark:text-white">
								{userName}
							</p>
							{isPro ? (
								<span className="rounded-full bg-neutral-950 px-1.5 py-0.2 font-bold text-[9px] text-white dark:bg-white dark:text-neutral-900">
									PRO
								</span>
							) : (
								<span className="rounded-full bg-neutral-100 px-1.5 py-0.2 font-semibold text-[9px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
									FREE
								</span>
							)}
						</div>
						<p className="truncate text-[11px] text-neutral-500 dark:text-neutral-400">
							{userEmail}
						</p>
					</div>

					<DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />

					{/* Pro Gated Option: My Flows */}
					{isPro && (
						<DropdownMenuItem
							onClick={() => navigate({ to: "/my-flows" })}
							className="mb-1 flex cursor-pointer items-center gap-2.5 rounded-xl bg-neutral-900 px-3 py-2 font-semibold text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
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
						className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
					>
						<UserCog className="h-4 w-4 text-neutral-500" />
						<span>Account settings</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={onOpenProfileMetadata}
						className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
					>
						<UserCheck className="h-4 w-4 text-neutral-500" />
						<span>Setup profile metadata</span>
					</DropdownMenuItem>

					<DropdownMenuItem
						onClick={onOpenRequestContent}
						className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-neutral-700 text-xs hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
					>
						<PlusCircle className="h-4 w-4 text-neutral-500" />
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

					<DropdownMenuSeparator className="my-1 bg-neutral-100 dark:bg-neutral-800" />

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
						className="flex cursor-pointer items-center gap-2.5 rounded-xl px-3 py-2 font-medium text-red-600 text-xs hover:bg-red-50 dark:hover:bg-red-950/40"
					>
						<LogOut className="h-4 w-4 text-red-600" />
						<span>Logout</span>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
