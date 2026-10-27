import { Badge } from "@IvO/ui/components/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import { Label } from "@IvO/ui/components/label";
import { Separator } from "@IvO/ui/components/separator";
import {
	Activity,
	Calendar,
	Check,
	ChevronDown,
	ChevronsDown,
	ChevronsUp,
	ChevronUp,
	Layers,
	Minus,
	Sparkles,
	Tag,
	User,
	X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { DashboardFlow } from "@/data/dashboard-flows";
import {
	ASSIGNEE_OPTIONS,
	JIRA_PRIORITIES,
	JIRA_STATUSES,
	type JiraFlowPriority,
	type JiraFlowStatus,
} from "./flow-details-config";

interface FlowDetailsViewProps {
	flow: DashboardFlow;
	status: JiraFlowStatus;
	onStatusChange: (status: JiraFlowStatus) => void;
	labels: string[];
	onLabelsChange: (labels: string[]) => void;
	priority: JiraFlowPriority;
	onPriorityChange: (priority: JiraFlowPriority) => void;
	assigneeId?: string;
	onAssigneeChange?: (assigneeId: string) => void;
}

export function FlowDetailsView({
	flow,
	status,
	onStatusChange,
	labels,
	onLabelsChange,
	priority,
	onPriorityChange,
	assigneeId = "gua-tabidze",
	onAssigneeChange,
}: FlowDetailsViewProps) {
	const [selectedAssigneeId, setSelectedAssigneeId] = useState(assigneeId);

	const currentStatus = JIRA_STATUSES[status] || JIRA_STATUSES.in_review;
	const currentPriority = JIRA_PRIORITIES[priority] || JIRA_PRIORITIES.medium;
	const currentAssignee =
		ASSIGNEE_OPTIONS.find((a) => a.id === selectedAssigneeId) ||
		ASSIGNEE_OPTIONS[0];

	// Handle removing a label
	const handleRemoveLabel = (tagToRemove: string) => {
		const updated = labels.filter((t) => t !== tagToRemove);
		onLabelsChange(updated);
		toast.info("Label removed", {
			description: tagToRemove,
		});
	};

	const renderPriorityIcon = (
		pId: JiraFlowPriority,
		className = "h-3.5 w-3.5",
	) => {
		switch (pId) {
			case "highest":
				return (
					<ChevronsUp
						className={`${className} text-rose-600 dark:text-rose-400`}
					/>
				);
			case "high":
				return (
					<ChevronUp
						className={`${className} text-orange-600 dark:text-orange-400`}
					/>
				);
			case "medium":
				return (
					<Minus
						className={`${className} stroke-[3] text-amber-500 dark:text-amber-400`}
					/>
				);
			case "low":
				return (
					<ChevronDown
						className={`${className} text-emerald-600 dark:text-emerald-400`}
					/>
				);
			case "lowest":
				return (
					<ChevronsDown
						className={`${className} text-blue-600 dark:text-blue-400`}
					/>
				);
			default:
				return <Minus className={`${className} text-neutral-500`} />;
		}
	};

	return (
		<div className="flex flex-1 flex-col space-y-5 overflow-y-auto p-4 text-neutral-900 dark:text-neutral-100">
			{/* Section 1: Jira-Like Status & Priority */}
			<div className="space-y-3">
				<Label className="font-semibold text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
					Status & Priority
				</Label>

				<div className="grid grid-cols-2 gap-2.5">
					{/* Jira Status Dropdown */}
					<div className="flex flex-col gap-1.5">
						<span className="font-medium text-[11px] text-neutral-500 dark:text-neutral-400">
							Status
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-200 bg-white px-2.5 font-medium text-xs shadow-2xs transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
								<div className="flex min-w-0 items-center gap-2">
									<span
										className={`h-2.5 w-2.5 shrink-0 rounded-full ${currentStatus.dotColor}`}
									/>
									<span
										className={`truncate font-bold text-[11px] uppercase tracking-wider ${currentStatus.textColor}`}
									>
										{currentStatus.badgeLabel}
									</span>
								</div>
								<ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
							</DropdownMenuTrigger>

							<DropdownMenuContent align="start" className="w-56 p-1">
								<DropdownMenuLabel className="text-[10px] text-neutral-400 uppercase tracking-wider">
									Workflow Statuses
								</DropdownMenuLabel>
								<DropdownMenuGroup>
									{(Object.keys(JIRA_STATUSES) as JiraFlowStatus[]).map(
										(key) => {
											const item = JIRA_STATUSES[key];
											const isSelected = item.id === status;
											return (
												<DropdownMenuItem
													key={item.id}
													onClick={() => {
														onStatusChange(item.id);
														toast.success(`Status updated to ${item.label}`);
													}}
													className="flex items-center justify-between py-2 text-xs"
												>
													<div className="flex min-w-0 items-center gap-2">
														<span
															className={`h-2.5 w-2.5 shrink-0 rounded-full ${item.dotColor}`}
														/>
														<div className="flex min-w-0 flex-col">
															<span
																className={`font-bold text-[11px] uppercase tracking-wider ${item.textColor}`}
															>
																{item.badgeLabel}
															</span>
															<span className="truncate text-[10px] text-neutral-500 dark:text-neutral-400">
																{item.description}
															</span>
														</div>
													</div>
													{isSelected && (
														<Check className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
													)}
												</DropdownMenuItem>
											);
										},
									)}
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Jira Priority Dropdown */}
					<div className="flex flex-col gap-1.5">
						<span className="font-medium text-[11px] text-neutral-500 dark:text-neutral-400">
							Priority
						</span>
						<DropdownMenu>
							<DropdownMenuTrigger className="flex h-9 w-full cursor-pointer items-center justify-between rounded-lg border border-neutral-200 bg-white px-2.5 font-medium text-xs shadow-2xs transition-all hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 active:scale-[0.98] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800">
								<div className="flex min-w-0 items-center gap-2">
									{renderPriorityIcon(currentPriority.id)}
									<span className="truncate font-semibold text-xs">
										{currentPriority.label}
									</span>
								</div>
								<ChevronDown className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end" className="w-44 p-1">
								<DropdownMenuLabel className="text-[10px] text-neutral-400 uppercase tracking-wider">
									Priority
								</DropdownMenuLabel>
								<DropdownMenuGroup>
									{(Object.keys(JIRA_PRIORITIES) as JiraFlowPriority[]).map(
										(pKey) => {
											const item = JIRA_PRIORITIES[pKey];
											const isSelected = item.id === priority;
											return (
												<DropdownMenuItem
													key={item.id}
													onClick={() => {
														onPriorityChange(item.id);
														toast.success(`Priority set to ${item.label}`);
													}}
													className="flex items-center justify-between py-1.5 text-xs"
												>
													<div className="flex items-center gap-2">
														{renderPriorityIcon(item.id)}
														<span className="font-medium text-xs">
															{item.label}
														</span>
													</div>
													{isSelected && (
														<Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
													)}
												</DropdownMenuItem>
											);
										},
									)}
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>
			</div>

			<Separator />

			{/* Section 2: Labels */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-1.5">
						<Tag className="h-3.5 w-3.5 text-neutral-500" />
						<Label className="font-semibold text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
							Labels
						</Label>
					</div>
					<Badge
						variant="secondary"
						className="rounded-full px-1.5 py-0 font-semibold text-[10px]"
					>
						{labels.length}
					</Badge>
				</div>

				{/* Active Label Items */}
				<div className="flex min-h-[34px] flex-wrap gap-1.5 rounded-lg border border-neutral-200 border-dashed p-2 dark:border-neutral-800">
					{labels.length === 0 ? (
						<span className="text-[11px] text-neutral-400 italic">
							No labels
						</span>
					) : (
						labels.map((lbl) => (
							<span
								key={lbl}
								className="group inline-flex items-center gap-1 rounded-md border border-neutral-200 bg-white px-2 py-0.5 font-medium text-neutral-800 text-xs shadow-2xs transition-all hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200"
							>
								<span className="text-neutral-400">#</span>
								<span>{lbl.replace(/^#/, "")}</span>
								<button
									type="button"
									onClick={() => handleRemoveLabel(lbl)}
									className="ml-0.5 flex h-3.5 w-3.5 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200 hover:text-neutral-900 dark:hover:bg-neutral-700 dark:hover:text-white"
									aria-label={`Remove label ${lbl}`}
								>
									<X className="h-2.5 w-2.5" />
								</button>
							</span>
						))
					)}
				</div>
			</div>

			<Separator />

			{/* Section 3: Properties */}
			<div className="space-y-3">
				<Label className="font-semibold text-[11px] text-neutral-500 uppercase tracking-wider dark:text-neutral-400">
					Properties
				</Label>

				<div className="divide-y divide-neutral-100 rounded-lg border border-neutral-200 bg-white dark:divide-neutral-800/60 dark:border-neutral-800 dark:bg-neutral-900/60">
					{/* Assignee Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
							<User className="h-3.5 w-3.5" />
							<span>Assignee</span>
						</div>

						<DropdownMenu>
							<DropdownMenuTrigger className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 font-medium text-neutral-900 text-xs transition-colors hover:bg-neutral-100 dark:text-neutral-100 dark:hover:bg-neutral-800">
								{currentAssignee.avatar ? (
									<img
										src={currentAssignee.avatar}
										alt={currentAssignee.name}
										className="h-4.5 w-4.5 rounded-full object-cover"
									/>
								) : (
									<span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-neutral-200 text-[10px] text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
										?
									</span>
								)}
								<span className="font-medium text-xs">
									{currentAssignee.name}
								</span>
								<ChevronDown className="h-3 w-3 text-neutral-400" />
							</DropdownMenuTrigger>

							<DropdownMenuContent align="end" className="w-52 p-1">
								<DropdownMenuLabel className="text-[10px] text-neutral-400 uppercase tracking-wider">
									Assign to
								</DropdownMenuLabel>
								{ASSIGNEE_OPTIONS.map((opt) => (
									<DropdownMenuItem
										key={opt.id}
										onClick={() => {
											setSelectedAssigneeId(opt.id);
											onAssigneeChange?.(opt.id);
											toast.success(`Assigned to ${opt.name}`);
										}}
										className="flex items-center justify-between py-1.5 text-xs"
									>
										<div className="flex items-center gap-2">
											{opt.avatar ? (
												<img
													src={opt.avatar}
													alt={opt.name}
													className="h-5 w-5 rounded-full object-cover"
												/>
											) : (
												<div className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-200 text-[10px] dark:bg-neutral-700">
													?
												</div>
											)}
											<div className="flex flex-col">
												<span className="font-medium text-xs">{opt.name}</span>
												<span className="text-[10px] text-neutral-400">
													{opt.role}
												</span>
											</div>
										</div>
										{opt.id === selectedAssigneeId && (
											<Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
										)}
									</DropdownMenuItem>
								))}
							</DropdownMenuContent>
						</DropdownMenu>
					</div>

					{/* Flow Category / Channel Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
							<Layers className="h-3.5 w-3.5" />
							<span>Category</span>
						</div>
						<span className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
							{flow.appCategory}
						</span>
					</div>

					{/* Benchmark SEQ Score Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
							<Activity className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
							<span>SEQ Score</span>
						</div>
						<div className="flex items-center gap-1.5">
							<span className="font-bold font-mono text-neutral-900 text-xs dark:text-white">
								{flow.seqScore || "6.8 / 7.0"}
							</span>
							<span className="rounded-sm bg-emerald-50 px-1 py-0.5 font-semibold text-[10px] text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
								High
							</span>
						</div>
					</div>

					{/* Task Success Rate Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
							<Sparkles className="h-3.5 w-3.5 text-blue-500" />
							<span>Success Rate</span>
						</div>
						<span className="font-bold font-mono text-neutral-900 text-xs dark:text-white">
							{flow.taskSuccessRate || "96.4%"}
						</span>
					</div>

					{/* Last Updated Row */}
					<div className="flex items-center justify-between p-2.5">
						<div className="flex items-center gap-2 text-neutral-500 text-xs dark:text-neutral-400">
							<Calendar className="h-3.5 w-3.5" />
							<span>Last Updated</span>
						</div>
						<span className="text-[11px] text-neutral-500 dark:text-neutral-400">
							Today, 12:46 PM
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
