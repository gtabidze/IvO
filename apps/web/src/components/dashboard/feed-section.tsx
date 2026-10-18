import { MessageSquare, SmilePlus } from "lucide-react";
import { useState } from "react";
import {
	baseReactionCounts,
	type FeedItem,
	REACTION_EMOJIS,
	useReactions,
} from "@/lib/feed";
import { timeAgo } from "@/lib/time";
import { ScreenThumb } from "./screen-thumb";

interface Props {
	items: FeedItem[];
	onOpen: (
		item: FeedItem,
		screenIndex: number,
		tab?: "comments" | "ai",
	) => void;
}

export function FeedSection({ items, onOpen }: Props) {
	const { mine, toggle } = useReactions();

	return (
		<section className="mx-auto w-full max-w-7xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
			<div className="flex flex-col gap-1">
				<h2 className="font-extrabold text-3xl text-neutral-950 tracking-tight dark:text-white">
					Feed
				</h2>
				<p className="text-neutral-500 text-sm">
					New flows from you and your team.
				</p>
			</div>

			{items.length === 0 ? (
				<p className="py-16 text-center text-neutral-400 text-sm">
					Nothing matches your search.
				</p>
			) : (
				<div className="mt-8 space-y-8">
					{items.map((item) => (
						<FeedCard
							key={item.flow.id}
							item={item}
							mine={mine[item.flow.id] ?? []}
							onToggle={(e) => toggle(item.flow.id, e)}
							onOpen={onOpen}
						/>
					))}
				</div>
			)}
		</section>
	);
}

function FeedCard({
	item,
	mine,
	onToggle,
	onOpen,
}: {
	item: FeedItem;
	mine: string[];
	onToggle: (emoji: string) => void;
	onOpen: Props["onOpen"];
}) {
	const [picker, setPicker] = useState(false);
	const { flow, creator } = item;
	const base = baseReactionCounts(item);
	const counts = new Map<string, number>(Object.entries(base));
	for (const e of mine) counts.set(e, (counts.get(e) ?? 0) + 1);
	const commentCount = flow.initialComments.length;

	return (
		<article className="rounded-[2.25rem] border border-neutral-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
			{/* Header: who, when, which project */}
			<header className="flex items-center gap-3.5">
				<span
					className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-bold text-sm text-white shadow-xs ring-2 ring-white dark:ring-neutral-800"
					style={{ backgroundColor: creator.color }}
					aria-hidden
				>
					{creator.initial}
				</span>
				<div className="min-w-0 flex-1">
					<div className="flex flex-wrap items-center gap-1.5 text-neutral-900 text-sm dark:text-white">
						<span className="font-bold">{creator.name}</span>
						<span className="font-normal text-neutral-500">contributed to</span>
						<span className="inline-flex items-center gap-0.5 rounded-lg border border-neutral-200/70 bg-neutral-100/80 px-2 py-0.5 font-bold text-neutral-800 text-xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-200">
							<span className="font-normal text-neutral-400 dark:text-neutral-500">
								#
							</span>
							<span>{item.channel.id}</span>
						</span>
					</div>
					<p className="mt-0.5 font-medium text-neutral-400 text-xs">
						{timeAgo(item.createdAt)} · {flow.screens.length} screens ·{" "}
						{flow.app}
					</p>
				</div>
			</header>

			{/* Flow title */}
			<button
				type="button"
				onClick={() => onOpen(item, 0)}
				className="mt-5 block cursor-pointer text-left font-bold text-lg text-neutral-950 tracking-tight transition-colors hover:text-blue-600 sm:text-xl dark:text-white dark:hover:text-blue-400"
			>
				{flow.flowName}
			</button>

			{/* Screens strip */}
			<div className="scrollbar-none mt-5 flex gap-5 overflow-x-auto px-1 pt-2 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
			<footer className="relative mt-6 flex flex-wrap items-center gap-2.5 border-neutral-100 border-t pt-5 dark:border-neutral-800/80">
				{[...counts.entries()].map(([emoji, n]) => (
					<button
						key={emoji}
						type="button"
						onClick={() => onToggle(emoji)}
						aria-pressed={mine.includes(emoji)}
						className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 font-semibold text-xs transition-all active:scale-[0.96] ${
							mine.includes(emoji)
								? "border-blue-300 bg-blue-50 text-blue-700 shadow-2xs dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-300"
								: "border-neutral-200/90 bg-neutral-50/70 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:bg-neutral-800"
						}`}
					>
						<span>{emoji}</span>
						<span>{n}</span>
					</button>
				))}

				<div className="relative">
					<button
						type="button"
						onClick={() => setPicker((o) => !o)}
						aria-label="Add reaction"
						aria-expanded={picker}
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 shadow-2xs transition-all hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-900 active:scale-[0.96] dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
					>
						<SmilePlus className="h-4 w-4" />
					</button>
					{picker && (
						<div className="absolute bottom-11 left-0 z-10 flex gap-1 rounded-full border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
							{REACTION_EMOJIS.map((e) => (
								<button
									key={e}
									type="button"
									onClick={() => {
										onToggle(e);
										setPicker(false);
									}}
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-base transition-transform hover:scale-125 hover:bg-neutral-100 dark:hover:bg-neutral-800"
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
					className="ml-auto flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-semibold text-neutral-600 text-xs transition-all hover:bg-neutral-100 hover:text-neutral-900 active:scale-[0.96] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
				>
					<MessageSquare className="h-4 w-4" />
					<span>
						{commentCount > 0 ? `${commentCount} comments` : "Comment"}
					</span>
				</button>
			</footer>
		</article>
	);
}
