export type JiraFlowStatus =
	| "to_do"
	| "in_progress"
	| "in_review"
	| "done"
	| "blocked";

export interface StatusConfig {
	id: JiraFlowStatus;
	label: string;
	badgeLabel: string;
	description: string;
	category: "To Do" | "In Progress" | "Done" | "Blocked";
	badgeClasses: string;
	dotColor: string;
	textColor: string;
	borderColor: string;
	bgLight: string;
}

export const JIRA_STATUSES: Record<JiraFlowStatus, StatusConfig> = {
	to_do: {
		id: "to_do",
		label: "To Do",
		badgeLabel: "TO DO",
		description: "Not started, queued for flow review",
		category: "To Do",
		badgeClasses:
			"bg-neutral-100 text-neutral-800 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:border-neutral-700",
		dotColor: "bg-neutral-400 dark:bg-neutral-500",
		textColor: "text-neutral-700 dark:text-neutral-300",
		borderColor: "border-neutral-300 dark:border-neutral-700",
		bgLight: "bg-neutral-100 dark:bg-neutral-800",
	},
	in_progress: {
		id: "in_progress",
		label: "In Progress",
		badgeLabel: "IN PROGRESS",
		description: "Active UX audit & screen analysis",
		category: "In Progress",
		badgeClasses:
			"bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800",
		dotColor: "bg-blue-500",
		textColor: "text-blue-600 dark:text-blue-400",
		borderColor: "border-blue-200 dark:border-blue-800",
		bgLight: "bg-blue-50 dark:bg-blue-950/60",
	},
	in_review: {
		id: "in_review",
		label: "In Review",
		badgeLabel: "IN REVIEW",
		description: "Peer heuristic & usability evaluation",
		category: "In Progress",
		badgeClasses:
			"bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800",
		dotColor: "bg-amber-500",
		textColor: "text-amber-600 dark:text-amber-400",
		borderColor: "border-amber-200 dark:border-amber-800",
		bgLight: "bg-amber-50 dark:bg-amber-950/60",
	},
	done: {
		id: "done",
		label: "Done",
		badgeLabel: "DONE",
		description: "Benchmark validated & approved baseline",
		category: "Done",
		badgeClasses:
			"bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800",
		dotColor: "bg-emerald-500",
		textColor: "text-emerald-600 dark:text-emerald-400",
		borderColor: "border-emerald-200 dark:border-emerald-800",
		bgLight: "bg-emerald-50 dark:bg-emerald-950/60",
	},
	blocked: {
		id: "blocked",
		label: "Blocked",
		badgeLabel: "BLOCKED",
		description: "Awaiting compliance, assets or API specs",
		category: "Blocked",
		badgeClasses:
			"bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800",
		dotColor: "bg-rose-500",
		textColor: "text-rose-600 dark:text-rose-400",
		borderColor: "border-rose-200 dark:border-rose-800",
		bgLight: "bg-rose-50 dark:bg-rose-950/60",
	},
};

export type JiraFlowPriority = "highest" | "high" | "medium" | "low" | "lowest";

export interface PriorityConfig {
	id: JiraFlowPriority;
	label: string;
	color: string;
	badgeClasses: string;
}

export const JIRA_PRIORITIES: Record<JiraFlowPriority, PriorityConfig> = {
	highest: {
		id: "highest",
		label: "Highest",
		color: "#EF4444",
		badgeClasses:
			"text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400 border-rose-200 dark:border-rose-800",
	},
	high: {
		id: "high",
		label: "High",
		color: "#F97316",
		badgeClasses:
			"text-orange-600 bg-orange-50 dark:bg-orange-950/50 dark:text-orange-400 border-orange-200 dark:border-orange-800",
	},
	medium: {
		id: "medium",
		label: "Medium",
		color: "#EAB308",
		badgeClasses:
			"text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400 border-amber-200 dark:border-amber-800",
	},
	low: {
		id: "low",
		label: "Low",
		color: "#10B981",
		badgeClasses:
			"text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
	},
	lowest: {
		id: "lowest",
		label: "Lowest",
		color: "#3B82F6",
		badgeClasses:
			"text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400 border-blue-200 dark:border-blue-800",
	},
};

export const SUGGESTED_LABELS: string[] = [
	"#onboarding",
	"#kyc",
	"#fintech",
	"#cards",
	"#transfers",
	"#benchmark",
	"#q3-audit",
	"#core-journey",
	"#biometrics",
	"#conversion-win",
	"#compliance",
];

export const ASSIGNEE_OPTIONS = [
	{
		id: "gua-tabidze",
		name: "Gua Tabidze",
		role: "Senior Product Designer",
		avatar:
			"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
	},
	{
		id: "ai-heuristic",
		name: "AI Usability Auditor",
		role: "Autonomous Evaluator",
		avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=heuristic",
	},
	{
		id: "alex-smith",
		name: "Alex Smith",
		role: "UX Researcher",
		avatar:
			"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
	},
	{
		id: "unassigned",
		name: "Unassigned",
		role: "Queue",
		avatar: "",
	},
];
