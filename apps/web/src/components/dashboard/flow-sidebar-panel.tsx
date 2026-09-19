import {
	AlertTriangle,
	BarChart3,
	CheckCircle2,
	Clock,
	Info,
	MessageSquare,
	Send,
	Sparkles,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DashboardFlow, FlowComment } from "@/data/dashboard-flows";

interface FlowSidebarPanelProps {
	flow: DashboardFlow;
	activeTab: "usability" | "comments";
	onTabChange: (tab: "usability" | "comments") => void;
	onClose: () => void;
	activeScreenIndex: number;
}

export function FlowSidebarPanel({
	flow,
	activeTab,
	onTabChange,
	onClose,
	activeScreenIndex,
}: FlowSidebarPanelProps) {
	const [comments, setComments] = useState<FlowComment[]>(
		flow.initialComments || [],
	);
	const [newCommentText, setNewCommentText] = useState("");

	const handleAddComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!newCommentText.trim()) return;

		const newComment: FlowComment = {
			id: `c-${Date.now()}`,
			authorName: "Gio Tabidze",
			authorAvatar:
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
			content: newCommentText.trim(),
			timestamp: "Just now",
			screenStep: activeScreenIndex + 1,
		};

		setComments((prev) => [newComment, ...prev]);
		setNewCommentText("");
		toast.success("Comment saved & flow bookmarked!", {
			description: `Linked to Step ${activeScreenIndex + 1}: ${
				flow.screens[activeScreenIndex]?.title || "Screen"
			}`,
		});
	};

	return (
		<aside className="z-30 flex h-full w-80 shrink-0 flex-col border-neutral-200 border-l bg-white shadow-2xl transition-all duration-200 sm:w-96 dark:border-neutral-800 dark:bg-neutral-900">
			{/* Panel Header */}
			<div className="flex items-center justify-between border-neutral-200/80 border-b px-4 py-3 dark:border-neutral-800">
				{/* Tabs: Usability Evals vs Comments */}
				<div className="flex items-center gap-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-800">
					<button
						type="button"
						onClick={() => onTabChange("usability")}
						className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs transition-all ${
							activeTab === "usability"
								? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white"
								: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
						}`}
					>
						<Sparkles className="h-3 w-3 text-blue-600 dark:text-blue-400" />
						<span>Usability</span>
						<span className="rounded-full bg-blue-50 px-1 text-[10px] text-blue-600 dark:bg-blue-950 dark:text-blue-300">
							{flow.usabilityIssues.length}
						</span>
					</button>

					<button
						type="button"
						onClick={() => onTabChange("comments")}
						className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold text-xs transition-all ${
							activeTab === "comments"
								? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white"
								: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
						}`}
					>
						<MessageSquare className="h-3 w-3" />
						<span>Comments</span>
						{comments.length > 0 && (
							<span className="rounded-full bg-neutral-200 px-1 text-[10px] text-neutral-700 dark:bg-neutral-700 dark:text-neutral-300">
								{comments.length}
							</span>
						)}
					</button>
				</div>

				{/* Close Sidebar button */}
				<button
					type="button"
					onClick={onClose}
					className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
					aria-label="Close sidebar"
				>
					<X className="h-4 w-4" />
				</button>
			</div>

			{/* Panel Content Body */}
			<div className="flex-1 space-y-6 overflow-y-auto p-4">
				{activeTab === "usability" ? (
					/* USABILITY & TELEMETRY SECTION */
					<div className="space-y-6">
						{/* Top Telemetry KPI Cards */}
						<div className="space-y-2">
							<span className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
								Benchmark Telemetry
							</span>

							<div className="grid grid-cols-2 gap-2.5">
								{/* Time on Task */}
								<div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
									<div className="flex items-center gap-1.5 text-neutral-500 text-xs">
										<Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
										<span>Time on Task</span>
									</div>
									<div className="mt-1.5 font-bold text-lg text-neutral-950 dark:text-white">
										{flow.timeOnTask}
									</div>
									<div className="text-[10px] text-neutral-400">
										Median completion
									</div>
								</div>

								{/* Task Success Rate */}
								<div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/70 p-3 dark:border-neutral-800 dark:bg-neutral-800/40">
									<div className="flex items-center gap-1.5 text-neutral-500 text-xs">
										<CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
										<span>Success Rate</span>
									</div>
									<div className="mt-1.5 font-bold text-lg text-neutral-950 dark:text-white">
										{flow.taskSuccessRate}
									</div>
									<div className="font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
										Unassisted pass
									</div>
								</div>
							</div>

							{/* SEQ (Single Ease Question) Survey Result */}
							<div className="rounded-2xl border border-neutral-200/80 bg-blue-50/40 p-3.5 dark:border-blue-900/40 dark:bg-blue-950/20">
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-1.5 font-semibold text-blue-900 text-xs dark:text-blue-300">
										<BarChart3 className="h-4 w-4 text-blue-600" />
										<span>SEQ Ease Survey (1–7)</span>
									</div>
									<span className="font-bold font-mono text-blue-700 text-xs dark:text-blue-300">
										{flow.seqScore}
									</span>
								</div>
								<div className="mt-1.5 flex items-center justify-between text-xs">
									<span className="font-semibold text-neutral-900 dark:text-white">
										{flow.seqRating}
									</span>
								</div>
								<p className="mt-1 text-[10.5px] text-neutral-600 dark:text-neutral-400">
									Post-task questionnaire rating difficulty across test cohort.
								</p>
							</div>
						</div>

						{/* Potential Usability Issues List */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
									Potential Usability Issues
								</span>
								<span className="font-mono text-neutral-500 text-xs">
									{flow.usabilityIssues.length} found
								</span>
							</div>

							<div className="space-y-2.5">
								{flow.usabilityIssues.map((issue) => (
									<div
										key={issue.id}
										className="rounded-2xl border border-neutral-200 bg-white p-3.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
									>
										<div className="flex items-center justify-between gap-2">
											<span
												className={`rounded-full px-2 py-0.5 font-bold text-[10px] uppercase tracking-wide ${
													issue.severity === "high"
														? "border border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/60 dark:text-red-300"
														: issue.severity === "medium"
															? "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-300"
															: "border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300"
												}`}
											>
												{issue.severity} friction
											</span>
											<span className="font-mono text-[10.5px] text-neutral-500">
												{issue.dropOffImpact}
											</span>
										</div>

										<h4 className="mt-2 font-bold text-neutral-900 text-xs dark:text-white">
											{issue.title}
										</h4>

										<p className="mt-1 text-[11px] text-neutral-600 leading-relaxed dark:text-neutral-400">
											{issue.description}
										</p>

										<div className="mt-2 flex items-center gap-1.5 border-neutral-100 border-t pt-2 font-medium text-[10px] text-neutral-400 dark:border-neutral-800">
											<AlertTriangle className="h-3 w-3 text-neutral-400" />
											<span>{issue.heuristic}</span>
										</div>
									</div>
								))}
							</div>
						</div>
					</div>
				) : (
					/* COMMENTS SECTION */
					<div className="space-y-4">
						{/* Note to Self Header */}
						<div className="rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 text-center dark:border-neutral-800 dark:bg-neutral-800/30">
							<h4 className="font-bold text-neutral-900 text-xs dark:text-white">
								Add a note-to-self
							</h4>
							<p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
								Anything you want to remember about this flow or step for later?
							</p>
						</div>

						{/* Comments List */}
						<div className="space-y-3">
							{comments.length === 0 ? (
								<p className="py-6 text-center text-neutral-400 text-xs">
									No comments yet on this flow.
								</p>
							) : (
								comments.map((comment) => (
									<div
										key={comment.id}
										className="space-y-1.5 rounded-2xl border border-neutral-200/80 bg-white p-3 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
									>
										<div className="flex items-center justify-between">
											<div className="flex items-center gap-2">
												{comment.authorAvatar ? (
													<img
														src={comment.authorAvatar}
														alt={comment.authorName}
														className="h-5 w-5 rounded-full object-cover"
													/>
												) : (
													<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900 font-bold text-[10px] text-white">
														{comment.authorName.charAt(0)}
													</div>
												)}
												<span className="font-semibold text-neutral-900 text-xs dark:text-white">
													{comment.authorName}
												</span>
											</div>
											<span className="text-[10px] text-neutral-400">
												{comment.timestamp}
											</span>
										</div>

										<p className="text-neutral-700 text-xs leading-relaxed dark:text-neutral-300">
											{comment.content}
										</p>

										{comment.screenStep && (
											<div className="font-mono text-[10px] text-neutral-400">
												Step {comment.screenStep}
											</div>
										)}
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>

			{/* Comments Input Form at Bottom */}
			<div className="border-neutral-200 border-t bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
				<form onSubmit={handleAddComment} className="space-y-2">
					<div className="relative">
						<input
							type="text"
							value={newCommentText}
							onChange={(e) => setNewCommentText(e.target.value)}
							placeholder={`Add a comment on Step ${activeScreenIndex + 1}...`}
							className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3.5 pr-10 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
						/>
						<button
							type="submit"
							disabled={!newCommentText.trim()}
							className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-neutral-950"
							aria-label="Send comment"
						>
							<Send className="h-3.5 w-3.5" />
						</button>
					</div>

					<div className="flex items-center gap-1.5 px-1 text-[10px] text-neutral-400">
						<Info className="h-3 w-3 shrink-0" />
						<span>This will automatically save the flow.</span>
					</div>
				</form>
			</div>
		</aside>
	);
}
