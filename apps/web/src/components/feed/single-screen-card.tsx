import { ArrowUpRight, MessageSquare, SmilePlus } from "lucide-react";
import { useState } from "react";
import type { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";
import type { FeedCreator } from "@/lib/feed";
import { baseReactionCounts, REACTION_EMOJIS } from "@/lib/feed";
import { timeAgo } from "@/lib/time";
import { AgentChecksBadge } from "../agents/agent-checks-dialog";
import { ScreenMockup } from "../dashboard/screen-mockup";

export interface SingleScreenItem {
	id: string;
	flow: DashboardFlow;
	screen: FlowScreen;
	screenIndex: number;
	creator: FeedCreator;
	project: string;
	channel: { id: string; label: string };
	createdAt: Date;
	insight: string;
	isMine: boolean;
}

interface SingleScreenCardProps {
	item: SingleScreenItem;
	mine: string[];
	onToggleReaction: (emoji: string) => void;
	onOpenScreen: (
		flow: DashboardFlow,
		screenIndex: number,
		tab?: "comments" | "ai",
	) => void;
	onOpenChecks?: (flow: DashboardFlow, screenIndex: number) => void;
	onSelectChannel?: (channelId: string) => void;
}

export function SingleScreenCard({
	item,
	mine,
	onToggleReaction,
	onOpenScreen,
	onOpenChecks,
	onSelectChannel,
}: SingleScreenCardProps) {
	const [picker, setPicker] = useState(false);
	const { flow, screen, screenIndex, creator, insight, createdAt, project } =
		item;

	const base = baseReactionCounts({
		flow,
		creator,
		project,
		channel: item.channel,
		createdAt,
		isMine: item.isMine,
	});
	const counts = new Map<string, number>(Object.entries(base));
	for (const e of mine) counts.set(e, (counts.get(e) ?? 0) + 1);

	const commentCount = flow.initialComments.filter(
		(c) => c.screenStep === undefined || c.screenStep === screenIndex,
	).length;

	return (
		<article className="border-neutral-200/80 border-b bg-white p-5 transition-colors hover:bg-neutral-50/50 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900/30">
			{/* Header: Author + Channel badge + Timestamp */}
			<header className="flex items-center gap-3">
				<span
					className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white shadow-xs ring-2 ring-white dark:ring-neutral-800"
					style={{ backgroundColor: creator.color }}
					aria-hidden
				>
					{creator.initial}
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1.5 text-neutral-900 text-sm dark:text-white">
						<span className="font-bold">{creator.name}</span>
						<span className="font-normal text-neutral-500 text-xs">
							contributed to
						</span>
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								onSelectChannel?.(item.channel.id);
							}}
							className="inline-flex cursor-pointer items-center gap-0.5 rounded-md border border-neutral-200/80 bg-neutral-100/90 px-2 py-0.5 font-bold text-[11px] text-neutral-900 transition-colors hover:border-neutral-300 hover:bg-neutral-200/80 hover:text-blue-600 dark:border-neutral-700/80 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700 dark:hover:text-blue-400"
						>
							<span className="font-normal text-neutral-400 dark:text-neutral-500">
								#
							</span>
							<span>{item.channel.id}</span>
						</button>
					</div>
					<p className="mt-0.5 font-medium text-neutral-400 text-xs">
						{timeAgo(createdAt)} · Screen {screenIndex + 1} of{" "}
						{flow.screens.length} · {flow.app}
					</p>
				</div>
			</header>

			{/* Screen Headline & Heuristic Badge + Agent Checks Badge */}
			<div className="mt-4 flex flex-wrap items-center justify-between gap-2">
				<div className="flex items-center gap-2">
					<button
						type="button"
						onClick={() => onOpenScreen(flow, screenIndex)}
						className="cursor-pointer text-left font-bold text-base text-neutral-950 tracking-tight transition-colors hover:text-blue-600 sm:text-lg dark:text-white dark:hover:text-blue-400"
					>
						{screen.title}
					</button>
					{onOpenChecks && (
						<AgentChecksBadge
							flow={flow}
							screenIndex={screenIndex}
							onOpenChecks={() => onOpenChecks(flow, screenIndex)}
						/>
					)}
				</div>
				{screen.badge && (
					<span className="rounded-full bg-blue-50 px-2.5 py-0.5 font-semibold text-[11px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
						{screen.badge}
					</span>
				)}
			</div>

			{/* Centered Phone Screen Mockup Container */}
			<div className="mt-5 flex justify-center py-2">
				<div className="relative cursor-pointer transition-transform duration-300 hover:scale-[1.02]">
					<div className="overflow-hidden rounded-[2.25rem] shadow-[0_12px_36px_rgba(0,0,0,0.08)] ring-1 ring-black/5 dark:shadow-[0_12px_36px_rgba(0,0,0,0.35)] dark:ring-white/10">
						<ScreenMockup
							screen={screen}
							index={screenIndex}
							appColor={flow.appColor}
							appName={flow.app}
							onScreenClick={() => onOpenScreen(flow, screenIndex)}
						/>
					</div>
				</div>
			</div>

			{/* UX Heuristic / Key Insight Note */}
			{insight && (
				<div className="mt-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-3.5 text-neutral-700 text-xs leading-relaxed dark:border-neutral-800/80 dark:bg-neutral-900/50 dark:text-neutral-300">
					<span className="mr-1.5 font-semibold text-neutral-950 dark:text-white">
						💡 UX Pattern Insight:
					</span>
					{insight}
				</div>
			)}

			{/* Footer Actions: Reactions, Comments, View in Flow */}
			<footer className="relative mt-5 flex flex-wrap items-center gap-2 border-neutral-100 border-t pt-4 dark:border-neutral-800/80">
				{[...counts.entries()].map(([emoji, n]) => (
					<button
						key={emoji}
						type="button"
						onClick={() => onToggleReaction(emoji)}
						aria-pressed={mine.includes(emoji)}
						className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-semibold text-xs transition-all active:scale-[0.96] ${
							mine.includes(emoji)
								? "border-blue-300 bg-blue-50 text-blue-700 shadow-2xs dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
								: "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
						}`}
					>
						<span>{emoji}</span>
						<span>{n}</span>
					</button>
				))}

				{/* Emoji picker */}
				<div className="relative">
					<button
						type="button"
						onClick={() => setPicker((o) => !o)}
						aria-label="Add reaction"
						aria-expanded={picker}
						className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.96] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
					>
						<SmilePlus className="h-3.5 w-3.5" />
					</button>
					{picker && (
						<div className="absolute bottom-10 left-0 z-20 flex gap-1 rounded-full border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
							{REACTION_EMOJIS.map((e) => (
								<button
									key={e}
									type="button"
									onClick={() => {
										onToggleReaction(e);
										setPicker(false);
									}}
									className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-sm transition-transform hover:scale-125 hover:bg-neutral-100 dark:hover:bg-neutral-800"
								>
									{e}
								</button>
							))}
						</div>
					)}
				</div>

				{/* Comment button */}
				<button
					type="button"
					onClick={() => onOpenScreen(flow, screenIndex, "comments")}
					className="flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-neutral-600 text-xs transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.96] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
				>
					<MessageSquare className="h-3.5 w-3.5" />
					<span>{commentCount > 0 ? `${commentCount}` : "Comment"}</span>
				</button>

				{/* Full Flow Inspector Link */}
				<button
					type="button"
					onClick={() => onOpenScreen(flow, screenIndex)}
					className="ml-auto inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1 font-semibold text-neutral-600 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-white"
				>
					<span>View flow</span>
					<ArrowUpRight className="h-3.5 w-3.5" />
				</button>
			</footer>
		</article>
	);
}
