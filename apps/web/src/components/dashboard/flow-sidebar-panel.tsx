import {
	AlertTriangle,
	Check,
	CheckCircle2,
	Info,
	ListChecks,
	MessageSquare,
	Reply,
	Send,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { MentionInput } from "@/components/agents/mention-input";
import type { DashboardFlow, FlowComment } from "@/data/dashboard-flows";
import { FlowAiChat } from "./flow-ai-chat";

export interface ThreadedFlowComment extends FlowComment {
	replies?: FlowComment[];
}

const COMMENT_AGENTS = [
	{
		id: "builtin-heuristic",
		slug: "heuristic",
		name: "Heuristic",
		emoji: "🧭",
		competence: "Usability expertise",
	},
	{
		id: "builtin-researcher",
		slug: "researcher",
		name: "Researcher",
		emoji: "🔎",
		competence: "UX research",
	},
	{
		id: "builtin-pixel",
		slug: "pixel",
		name: "Pixel",
		emoji: "🎨",
		competence: "User interface design",
	},
	{
		id: "builtin-wordsmith",
		slug: "wordsmith",
		name: "Wordsmith",
		emoji: "✍️",
		competence: "UX writing",
	},
	{
		id: "builtin-tester",
		slug: "tester",
		name: "Tester",
		emoji: "🧪",
		competence: "QA & accessibility testing",
	},
];

interface FlowSidebarPanelProps {
	flow: DashboardFlow;
	activeTab?: "ai" | "usability" | "comments";
	onTabChange?: (tab: "ai" | "usability" | "comments") => void;
	onClose: () => void;
	activeScreenIndex: number;
	onOpenPricing?: () => void;
}

export function FlowSidebarPanel({
	flow,
	activeTab = "comments",
	onTabChange,
	onClose,
	activeScreenIndex,
	onOpenPricing,
}: FlowSidebarPanelProps) {
	const [reviewSubTab, setReviewSubTab] = useState<"comments" | "checklist">(
		"comments",
	);

	const [reviewedScreens, setReviewedScreens] = useState<
		Record<number, boolean>
	>({});

	const toggleScreenReviewed = (screenIdx: number) => {
		setReviewedScreens((prev) => {
			const next = { ...prev, [screenIdx]: !prev[screenIdx] };
			if (next[screenIdx]) {
				toast.success(`Screen ${screenIdx + 1} marked as reviewed.`);
			}
			return next;
		});
	};

	const [comments, setComments] = useState<ThreadedFlowComment[]>(() => {
		return (flow.initialComments || []).map((c) => ({
			...c,
			replies: [],
		}));
	});

	const [newCommentText, setNewCommentText] = useState("");
	const [replyingToId, setReplyingToId] = useState<string | null>(null);
	const [replyText, setReplyText] = useState("");

	const totalCommentsCount =
		comments.length +
		comments.reduce((acc, c) => acc + (c.replies?.length || 0), 0);

	const submitComment = (text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return;

		const newComment: ThreadedFlowComment = {
			id: `c-${Date.now()}`,
			authorName: "Reviewer",
			authorAvatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
			content: trimmed,
			timestamp: "Just now",
			screenStep: activeScreenIndex + 1,
			replies: [],
		};

		setComments((prev) => [newComment, ...prev]);
		setNewCommentText("");
		toast.success("Review note saved!", {
			description: `Linked to Step ${activeScreenIndex + 1}: ${
				flow.screens[activeScreenIndex]?.title || "Screen"
			}`,
		});

		if (/@researcher\b/i.test(trimmed)) {
			setTimeout(() => {
				const researcherReply: FlowComment = {
					id: `c-researcher-${Date.now()}`,
					authorName: "🔎 Researcher",
					content:
						"I have set up the usability test session for this flow step and will share the results in the thread.",
					timestamp: "Just now",
					screenStep: activeScreenIndex + 1,
				};
				setComments((prev) =>
					prev.map((c) =>
						c.id === newComment.id
							? { ...c, replies: [...(c.replies || []), researcherReply] }
							: c,
					),
				);
			}, 650);
		}
	};

	const submitReply = (parentCommentId: string, text: string) => {
		const trimmed = text.trim();
		if (!trimmed) return;

		const replyObj: FlowComment = {
			id: `rep-${Date.now()}`,
			authorName: "Reviewer",
			authorAvatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
			content: trimmed,
			timestamp: "Just now",
			screenStep: activeScreenIndex + 1,
		};

		setComments((prev) =>
			prev.map((c) =>
				c.id === parentCommentId
					? { ...c, replies: [...(c.replies || []), replyObj] }
					: c,
			),
		);
		setReplyText("");
		setReplyingToId(null);
		toast.success("Reply added to review thread!");

		if (/@researcher\b/i.test(trimmed)) {
			setTimeout(() => {
				const researcherReply: FlowComment = {
					id: `c-researcher-${Date.now()}`,
					authorName: "🔎 Researcher",
					content: "Great review point! Tagging this for the sprint synthesis.",
					timestamp: "Just now",
					screenStep: activeScreenIndex + 1,
				};
				setComments((prev) =>
					prev.map((c) =>
						c.id === parentCommentId
							? { ...c, replies: [...(c.replies || []), researcherReply] }
							: c,
					),
				);
			}, 650);
		}
	};

	return (
		<aside
			className={`z-30 flex h-full shrink-0 flex-col border-neutral-200 border-l bg-white shadow-2xl transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900 ${
				activeTab === "ai" ? "w-88 sm:w-96 md:w-[460px]" : "w-84 sm:w-96"
			}`}
		>
			{/* Panel Header */}
			<div className="flex items-center justify-between border-neutral-200/80 border-b px-3.5 py-2.5 dark:border-neutral-800">
				{/* Mode switcher: Flow Review vs AI Chat */}
				<div className="flex items-center gap-1 rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
					<button
						type="button"
						onClick={() => onTabChange?.("comments")}
						className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs transition-colors ${
							activeTab !== "ai"
								? "bg-white font-semibold text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
								: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
						}`}
					>
						<ListChecks className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
						<span>Flow Review</span>
					</button>

					<button
						type="button"
						onClick={() => onTabChange?.("ai")}
						className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1 font-medium text-xs transition-colors ${
							activeTab === "ai"
								? "bg-blue-600 font-semibold text-white shadow-xs"
								: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
						}`}
					>
						<Sparkles className="h-3.5 w-3.5" />
						<span>AI Chat</span>
					</button>
				</div>

				{/* Sub-tabs when in Flow Review mode */}
				{activeTab !== "ai" ? (
					<div className="flex items-center gap-1 rounded-full bg-neutral-100 p-0.5 dark:bg-neutral-800">
						<button
							type="button"
							onClick={() => setReviewSubTab("comments")}
							className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs transition-colors ${
								reviewSubTab === "comments"
									? "bg-white font-semibold text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							<MessageSquare className="h-3 w-3" />
							<span>Notes</span>
							{totalCommentsCount > 0 && (
								<span className="rounded-full bg-neutral-200/80 px-1 py-0.1 font-semibold text-[9px] text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
									{totalCommentsCount}
								</span>
							)}
						</button>

						<button
							type="button"
							onClick={() => setReviewSubTab("checklist")}
							className={`flex cursor-pointer items-center gap-1 rounded-full px-2 py-0.5 font-medium text-xs transition-colors ${
								reviewSubTab === "checklist"
									? "bg-white font-semibold text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
									: "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
							}`}
						>
							<CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
							<span>Checklist</span>
						</button>
					</div>
				) : (
					<span className="rounded-full bg-blue-50 px-2 py-0.5 font-medium text-[11px] text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
						Step {activeScreenIndex + 1}
					</span>
				)}

				{/* Close Sidebar button */}
				<button
					type="button"
					onClick={onClose}
					className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					aria-label="Close review sidebar"
					title="Close review sidebar"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Review / AI Chat Panel Body */}
			{activeTab === "ai" ? (
				<div className="flex flex-1 flex-col overflow-hidden">
					<FlowAiChat
						flow={flow}
						activeScreenIndex={activeScreenIndex}
						onOpenPricing={onOpenPricing}
					/>
				</div>
			) : reviewSubTab === "checklist" ? (
				/* SCREEN REVIEW CHECKLIST */
				<div className="flex-1 space-y-3 overflow-y-auto p-4">
					<div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800/30">
						<h4 className="font-bold text-neutral-900 text-xs dark:text-white">
							Screen Quality & Audit Checklist
						</h4>
						<p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
							Audit each step against design heuristics and sign off.
						</p>
					</div>

					<div className="space-y-2.5">
						{flow.screens.map((screen, idx) => {
							const isCurrent = idx === activeScreenIndex;
							const isChecked = Boolean(reviewedScreens[idx]);
							const issue = flow.usabilityIssues?.[idx];

							return (
								<div
									key={screen.id || `scr-${idx}`}
									className={`space-y-2 rounded-2xl border p-3.5 transition-all ${
										isCurrent
											? "border-blue-500/50 bg-blue-50/20 shadow-xs dark:border-blue-500/40 dark:bg-blue-950/10"
											: "border-neutral-200 bg-white shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
									}`}
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => toggleScreenReviewed(idx)}
												className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-md border transition-colors ${
													isChecked
														? "border-emerald-600 bg-emerald-600 text-white"
														: "border-neutral-300 bg-neutral-50 hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-800"
												}`}
												aria-label={`Toggle review status for step ${idx + 1}`}
											>
												{isChecked && (
													<Check className="h-3.5 w-3.5 stroke-[2.5]" />
												)}
											</button>
											<span className="font-semibold text-neutral-900 text-xs dark:text-white">
												Step {idx + 1}: {screen.title || "Screen"}
											</span>
										</div>
										<span className="rounded-full bg-neutral-100 px-2 py-0.5 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
											{isChecked ? "Reviewed" : "Pending"}
										</span>
									</div>

									{issue ? (
										<div className="flex items-start gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50/70 p-2 text-[11px] text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-200">
											<AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
											<div className="flex-1">
												<span className="font-semibold">{issue.title}</span> (
												{issue.dropOffImpact})
												<p className="mt-0.5 text-[10.5px] text-amber-800 dark:text-amber-300">
													{issue.description}
												</p>
											</div>
										</div>
									) : (
										<div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400">
											<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
											<span>Passed heuristic & contrast checks</span>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			) : (
				/* THREADED COMMENTS & REVIEW NOTES */
				<div className="flex flex-1 flex-col overflow-hidden">
					<div className="flex-1 space-y-4 overflow-y-auto p-4">
						{/* Context banner */}
						<div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-3 text-center dark:border-neutral-800 dark:bg-neutral-800/30">
							<h4 className="font-bold text-neutral-900 text-xs dark:text-white">
								Review Comments & Notes
							</h4>
							<p className="mt-0.5 text-[11px] text-neutral-500 dark:text-neutral-400">
								Leave feedback, reply to reviewers, or @mention specialist
								agents.
							</p>
						</div>

						{/* Comments & Threads List */}
						<div className="space-y-3.5">
							{comments.length === 0 ? (
								<p className="py-6 text-center text-neutral-400 text-xs">
									No review comments yet on this flow.
								</p>
							) : (
								comments.map((comment) => (
									<div
										key={comment.id}
										className="space-y-2 rounded-2xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
									>
										{/* Comment Author Header */}
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{comment.authorAvatar ? (
													<img
														src={comment.authorAvatar}
														alt={comment.authorName}
														className="h-5 w-5 rounded-full object-cover"
													/>
												) : (
													<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 font-bold text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">
														{comment.authorName.charAt(0)}
													</div>
												)}
												<span className="font-semibold text-neutral-900 text-xs dark:text-white">
													{comment.authorName}
												</span>
											</div>
											<div className="flex items-center gap-2">
												{comment.screenStep && (
													<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-medium font-mono text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
														Step {comment.screenStep}
													</span>
												)}
												<span className="text-[10px] text-neutral-400">
													{comment.timestamp}
												</span>
											</div>
										</div>

										{/* Comment Text */}
										<p className="text-neutral-700 text-xs leading-relaxed dark:text-neutral-300">
											{comment.content}
										</p>

										{/* Thread Action: Reply Trigger */}
										<div className="flex items-center justify-between pt-1">
											<button
												type="button"
												onClick={() => {
													setReplyingToId(
														replyingToId === comment.id ? null : comment.id,
													);
													setReplyText("");
												}}
												className="inline-flex cursor-pointer items-center gap-1 text-[11px] text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
											>
												<Reply className="h-3 w-3" />
												<span>Reply</span>
												{(comment.replies?.length || 0) > 0 && (
													<span className="ml-0.5 text-neutral-400">
														({comment.replies?.length})
													</span>
												)}
											</button>
										</div>

										{/* Nested Thread Replies */}
										{comment.replies && comment.replies.length > 0 && (
											<div className="mt-2 space-y-2 border-neutral-200 border-l-2 pl-3 dark:border-neutral-800">
												{comment.replies.map((reply) => (
													<div
														key={reply.id}
														className="space-y-1 rounded-xl bg-neutral-50/80 p-2 text-xs dark:bg-neutral-800/40"
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-1.5">
																{reply.authorAvatar ? (
																	<img
																		src={reply.authorAvatar}
																		alt={reply.authorName}
																		className="h-4 w-4 rounded-full object-cover"
																	/>
																) : (
																	<span className="font-bold text-[10px]">
																		{reply.authorName.charAt(0)}
																	</span>
																)}
																<span className="font-semibold text-[11px] text-neutral-900 dark:text-white">
																	{reply.authorName}
																</span>
															</div>
															<span className="text-[10px] text-neutral-400">
																{reply.timestamp}
															</span>
														</div>
														<p className="text-[11.5px] text-neutral-600 dark:text-neutral-300">
															{reply.content}
														</p>
													</div>
												))}
											</div>
										)}

										{/* Inline Reply Input Form */}
										{replyingToId === comment.id && (
											<div className="mt-2 space-y-2 rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 dark:border-neutral-800 dark:bg-neutral-800/60">
												<MentionInput
													agents={COMMENT_AGENTS}
													value={replyText}
													onChange={setReplyText}
													placeholder="Write a reply or @mention agent..."
													onSend={(text) => submitReply(comment.id, text)}
												/>
												<div className="flex items-center justify-end gap-2 pt-1">
													<button
														type="button"
														onClick={() => {
															setReplyingToId(null);
															setReplyText("");
														}}
														className="cursor-pointer text-[11px] text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
													>
														Cancel
													</button>
													<button
														type="button"
														disabled={!replyText.trim()}
														onClick={() => submitReply(comment.id, replyText)}
														className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-[11px] text-white hover:bg-neutral-800 disabled:opacity-40 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
													>
														<Send className="h-3 w-3" />
														<span>Reply</span>
													</button>
												</div>
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>

					{/* New Review Comment Input Form at Bottom */}
					<div className="space-y-2 border-neutral-200 border-t bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
						<MentionInput
							agents={COMMENT_AGENTS}
							value={newCommentText}
							onChange={setNewCommentText}
							placeholder={`Add a review comment on Step ${activeScreenIndex + 1} or @mention agent...`}
							onPickAgent={(picked, defaultNext) => {
								if (
									(flow.id === "bog-order-card" ||
										flow.id === "monzo-order-card") &&
									picked.slug === "researcher" &&
									defaultNext.trim() === `@${picked.slug}`
								) {
									return "@researcher Let's plan the usability test for this step.";
								}
								return undefined;
							}}
							onSend={submitComment}
						/>

						<div className="flex items-center gap-1.5 px-1 text-[10px] text-neutral-400">
							<Info className="h-3 w-3 shrink-0" />
							<span>Review comments are saved to this flow.</span>
						</div>
					</div>
				</div>
			)}
		</aside>
	);
}
