import { MessageSquare, SmilePlus } from "lucide-react";
import { useMemo, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import {
	baseReactionCounts,
	type FeedItem,
	REACTION_EMOJIS,
	useReactions,
} from "@/lib/feed";
import { timeAgo } from "@/lib/time";
import {
	AgentChecksBadge,
	AgentChecksDialog,
} from "../agents/agent-checks-dialog";
import { ScreenThumb } from "../dashboard/screen-thumb";
import { SingleScreenCard, type SingleScreenItem } from "./single-screen-card";

interface UnifiedFeedProps {
	flowItems: FeedItem[];
	singleScreenItems: SingleScreenItem[];
	searchQuery: string;
	onSearchChange: (q: string) => void;
	onOpenFlowScreen: (
		flow: DashboardFlow,
		screenIndex: number,
		tab?: "comments" | "ai",
	) => void;
	isPro: boolean;
	onOpenPricing: () => void;
	selectedTag?: string | null;
	onSelectTag?: (tag: string | null) => void;
}

export function UnifiedFeed({
	flowItems,
	singleScreenItems,
	searchQuery,
	onSearchChange,
	onOpenFlowScreen,
	isPro: _isPro,
	onOpenPricing: _onOpenPricing,
	selectedTag,
	onSelectTag,
}: UnifiedFeedProps) {
	const { mine, toggle } = useReactions();
	const [checksModal, setChecksModal] = useState<{
		flow: DashboardFlow;
		screenIndex?: number;
	} | null>(null);

	// Filter flows by tag and search
	const filteredFlows = useMemo(() => {
		let items = flowItems;
		if (selectedTag) {
			const tagNormalized = selectedTag.toLowerCase().replace(/^#/, "");
			items = items.filter((i) => {
				const tags = i.flow.tags ?? [];
				const flowType = i.flow.flowType.toLowerCase();
				const flowId = i.flow.id.toLowerCase();
				const flowName = i.flow.flowName.toLowerCase();
				return (
					i.channel.id === tagNormalized ||
					tags.some((t) => t.toLowerCase() === tagNormalized) ||
					flowType.includes(tagNormalized) ||
					flowId.includes(tagNormalized.replace(/_/g, "-")) ||
					flowName.includes(tagNormalized.replace(/_/g, " ")) ||
					(tagNormalized === "ordercard" &&
						(flowType.includes("card") ||
							flowName.includes("card") ||
							flowId.includes("card"))) ||
					(tagNormalized === "fclloan" &&
						(flowType.includes("loan") ||
							flowName.includes("loan") ||
							flowType.includes("credit") ||
							flowName.includes("credit"))) ||
					(tagNormalized === "onboarding" &&
						(flowType.includes("onboarding") ||
							flowType.includes("account") ||
							flowName.includes("onboarding"))) ||
					(tagNormalized === "transfermoney_p2p" &&
						(flowType.includes("transfer") || flowName.includes("transfer")))
				);
			});
		}
		if (!searchQuery.trim()) return items;
		const q = searchQuery.toLowerCase();
		return items.filter(
			(i) =>
				i.flow.flowName.toLowerCase().includes(q) ||
				i.project.toLowerCase().includes(q) ||
				i.creator.name.toLowerCase().includes(q),
		);
	}, [flowItems, selectedTag, searchQuery]);

	// Filter single screens by tag and search
	const filteredScreens = useMemo(() => {
		let items = singleScreenItems;
		if (selectedTag) {
			const tagNormalized = selectedTag.toLowerCase().replace(/^#/, "");
			items = items.filter((s) => {
				const tags = s.flow.tags ?? [];
				const flowType = s.flow.flowType.toLowerCase();
				const flowId = s.flow.id.toLowerCase();
				const flowName = s.flow.flowName.toLowerCase();
				return (
					s.channel.id === tagNormalized ||
					tags.some((t) => t.toLowerCase() === tagNormalized) ||
					flowType.includes(tagNormalized) ||
					flowId.includes(tagNormalized.replace(/_/g, "-")) ||
					flowName.includes(tagNormalized.replace(/_/g, " ")) ||
					(tagNormalized === "ordercard" &&
						(flowType.includes("card") ||
							flowName.includes("card") ||
							flowId.includes("card"))) ||
					(tagNormalized === "fclloan" &&
						(flowType.includes("loan") ||
							flowName.includes("loan") ||
							flowType.includes("credit") ||
							flowName.includes("credit"))) ||
					(tagNormalized === "onboarding" &&
						(flowType.includes("onboarding") ||
							flowType.includes("account") ||
							flowName.includes("onboarding"))) ||
					(tagNormalized === "transfermoney_p2p" &&
						(flowType.includes("transfer") || flowName.includes("transfer")))
				);
			});
		}
		if (!searchQuery.trim()) return items;
		const q = searchQuery.toLowerCase();
		return items.filter(
			(s) =>
				s.screen.title.toLowerCase().includes(q) ||
				s.flow.flowName.toLowerCase().includes(q) ||
				s.project.toLowerCase().includes(q) ||
				s.insight.toLowerCase().includes(q),
		);
	}, [singleScreenItems, selectedTag, searchQuery]);

	// Interleave for default "Home All" feed (flows + single screens)
	const combinedFeed = useMemo(() => {
		type FeedEntry =
			| { type: "flow"; item: FeedItem; date: Date }
			| { type: "screen"; item: SingleScreenItem; date: Date };

		const entries: FeedEntry[] = [
			...filteredFlows.map((f) => ({
				type: "flow" as const,
				item: f,
				date: f.createdAt,
			})),
			...filteredScreens.map((s) => ({
				type: "screen" as const,
				item: s,
				date: s.createdAt,
			})),
		];

		return entries.sort((a, b) => b.date.getTime() - a.date.getTime());
	}, [filteredFlows, filteredScreens]);

	return (
		<main className="min-h-screen w-full max-w-[640px] shrink-0 border-neutral-200/80 border-r bg-white pb-24 dark:border-neutral-800 dark:bg-neutral-950">
			{/* Tag filter status banner */}
			{selectedTag && (
				<div className="flex items-center justify-between border-neutral-200/80 border-b bg-neutral-50/90 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900/70">
					<div className="flex items-center gap-2">
						<span className="rounded-md bg-neutral-900 px-2 py-0.5 font-bold text-white text-xs dark:bg-white dark:text-neutral-900">
							#{selectedTag}
						</span>
						<span className="font-medium text-neutral-600 text-xs dark:text-neutral-400">
							{filteredFlows.length}{" "}
							{filteredFlows.length === 1 ? "user flow" : "user flows"} found
						</span>
					</div>
					<button
						type="button"
						onClick={() => onSelectTag?.(null)}
						className="cursor-pointer font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
					>
						See all flows
					</button>
				</div>
			)}

			{/* Optional search status chip if user searched */}
			{searchQuery && (
				<div className="flex items-center justify-between border-neutral-200/80 border-b bg-neutral-50/80 px-4 py-2.5 dark:border-neutral-800 dark:bg-neutral-900/60">
					<span className="font-medium text-neutral-600 text-xs dark:text-neutral-400">
						Showing results for:{" "}
						<strong className="text-neutral-950 dark:text-white">
							"{searchQuery}"
						</strong>
					</span>
					<button
						type="button"
						onClick={() => onSearchChange("")}
						className="cursor-pointer font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
					>
						Clear
					</button>
				</div>
			)}

			{/* Feed Stream - Default Home All View */}
			<div className="divide-y divide-neutral-200/80 dark:divide-neutral-800">
				{combinedFeed.length === 0 ? (
					<EmptyFeedState searchQuery={searchQuery} />
				) : (
					combinedFeed.map((entry) => {
						if (entry.type === "flow") {
							return (
								<FeedFlowCard
									key={`feed-flow-${entry.item.flow.id}`}
									item={entry.item}
									mine={mine[entry.item.flow.id] ?? []}
									onToggle={(e) => toggle(entry.item.flow.id, e)}
									onOpen={(item, idx, tab) =>
										onOpenFlowScreen(item.flow, idx, tab)
									}
									onOpenChecks={() => setChecksModal({ flow: entry.item.flow })}
									onSelectChannel={onSelectTag}
								/>
							);
						}
						return (
							<SingleScreenCard
								key={entry.item.id}
								item={entry.item}
								mine={mine[entry.item.id] ?? []}
								onToggleReaction={(e) => toggle(entry.item.id, e)}
								onOpenScreen={(flow, idx, tab) =>
									onOpenFlowScreen(flow, idx, tab)
								}
								onOpenChecks={(flow, sIdx) =>
									setChecksModal({ flow, screenIndex: sIdx })
								}
								onSelectChannel={onSelectTag}
							/>
						);
					})
				)}
			</div>

			{/* GitHub Actions-style Agent Checks Popover/Dialog */}
			<AgentChecksDialog
				flow={checksModal?.flow ?? null}
				screenIndex={checksModal?.screenIndex}
				open={!!checksModal}
				onOpenChange={(open) => !open && setChecksModal(null)}
				onInspectFlow={(flow, screenIndex) => {
					setChecksModal(null);
					onOpenFlowScreen(flow, screenIndex);
				}}
			/>
		</main>
	);
}

function EmptyFeedState({ searchQuery }: { searchQuery: string }) {
	return (
		<div className="px-4 py-20 text-center">
			<p className="font-bold text-base text-neutral-800 dark:text-neutral-200">
				No results found
			</p>
			<p className="mt-1 text-neutral-500 text-xs">
				{searchQuery
					? `No benchmark flows or screens match "${searchQuery}".`
					: "Your feed is currently up to date."}
			</p>
		</div>
	);
}

/** Multi-screen flow card formatted for the timeline feed */
export function FeedFlowCard({
	item,
	mine,
	onToggle,
	onOpen,
	onOpenChecks,
	onSelectChannel,
	className = "",
}: {
	item: FeedItem;
	mine: string[];
	onToggle: (emoji: string) => void;
	onOpen: (
		item: FeedItem,
		screenIndex: number,
		tab?: "comments" | "ai",
	) => void;
	onOpenChecks?: () => void;
	onSelectChannel?: (channelId: string) => void;
	className?: string;
}) {
	const [picker, setPicker] = useState(false);
	const { flow, creator } = item;
	const base = baseReactionCounts(item);
	const counts = new Map<string, number>(Object.entries(base));
	for (const e of mine) counts.set(e, (counts.get(e) ?? 0) + 1);
	const commentCount = flow.initialComments.length;

	return (
		<article
			className={`border-neutral-200/80 border-b bg-white p-5 transition-colors hover:bg-neutral-50/50 sm:p-6 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900/30 ${className}`}
		>
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
						{timeAgo(item.createdAt)} · {flow.screens.length} screens ·{" "}
						{flow.app}
					</p>
				</div>
			</header>

			{/* Flow title & Agent checks badge */}
			<div className="mt-4 flex items-center justify-between gap-2">
				<button
					type="button"
					onClick={() => onOpen(item, 0)}
					className="cursor-pointer text-left font-bold text-base text-neutral-950 tracking-tight transition-colors hover:text-blue-600 sm:text-lg dark:text-white dark:hover:text-blue-400"
				>
					{flow.flowName}
				</button>
				{onOpenChecks && (
					<AgentChecksBadge flow={flow} onOpenChecks={onOpenChecks} />
				)}
			</div>

			{/* Screens horizontal strip */}
			<div className="scrollbar-none mt-4 flex gap-4 overflow-x-auto px-1 pt-1 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{flow.screens.map((s, i) => (
					<ScreenThumb
						key={s.id}
						flow={flow}
						screen={s}
						index={i}
						scale={0.72}
						className="cursor-pointer transition-all duration-300 hover:-translate-y-1.5"
						onClick={(idx) => onOpen(item, idx)}
					/>
				))}
			</div>

			{/* Footer actions */}
			<footer className="relative mt-4 flex flex-wrap items-center gap-2 border-neutral-100 border-t pt-4 dark:border-neutral-800/80">
				{[...counts.entries()].map(([emoji, n]) => (
					<button
						key={emoji}
						type="button"
						onClick={() => onToggle(emoji)}
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
										onToggle(e);
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

				<button
					type="button"
					onClick={() => onOpen(item, 0, "comments")}
					className="ml-auto flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-neutral-600 text-xs transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.96] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
				>
					<MessageSquare className="h-3.5 w-3.5" />
					<span>{commentCount > 0 ? `${commentCount}` : "Comment"}</span>
				</button>
			</footer>
		</article>
	);
}
