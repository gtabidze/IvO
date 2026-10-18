import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Bell, Check, Flame, MessageSquare, Sparkles } from "lucide-react";

interface NotificationItem {
	id: string;
	title: string;
	description: string;
	timestamp: string;
	read: boolean;
	icon: "flame" | "comment" | "agent" | "system";
}

const NOTIFICATIONS: NotificationItem[] = [
	{
		id: "n1",
		title: "Sara Kim reacted with 🔥",
		description: "to your 'Revolut · Identity Verification & KYC' flow",
		timestamp: "12m ago",
		read: false,
		icon: "flame",
	},
	{
		id: "n2",
		title: "UX Heuristic Copilot evaluated Monzo Checkout",
		description:
			"Identified a potential friction point on screen 3 (Card details input).",
		timestamp: "1h ago",
		read: false,
		icon: "agent",
	},
	{
		id: "n3",
		title: "Marcus Lee left a comment",
		description:
			"'The OTP split-input pattern here reduced SMS delay dropoff significantly.'",
		timestamp: "3h ago",
		read: true,
		icon: "comment",
	},
	{
		id: "n4",
		title: "New benchmark flow published",
		description:
			"Stripe · Multi-entity Workspace Switcher is now available in your team feed.",
		timestamp: "1d ago",
		read: true,
		icon: "system",
	},
];

export function NotificationsModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-md rounded-3xl p-6">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2.5">
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
								<Bell className="h-4 w-4" />
							</div>
							<DialogTitle className="font-bold text-base">
								Notifications
							</DialogTitle>
						</div>
						<span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-[10px] text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
							1 unread
						</span>
					</div>
					<DialogDescription>
						Activity across your benchmark flows, agent evals, and team
						reactions.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 divide-y divide-neutral-100 dark:divide-neutral-800">
					{NOTIFICATIONS.map((n) => (
						<div
							key={n.id}
							className={`flex items-start gap-3.5 py-3.5 transition-colors ${
								!n.read
									? "-mx-3 rounded-2xl bg-blue-50/30 px-3 dark:bg-blue-950/20"
									: ""
							}`}
						>
							<div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
								{n.icon === "flame" && (
									<Flame className="h-3.5 w-3.5 text-amber-500" />
								)}
								{n.icon === "comment" && (
									<MessageSquare className="h-3.5 w-3.5 text-blue-500" />
								)}
								{n.icon === "agent" && (
									<Sparkles className="h-3.5 w-3.5 text-purple-500" />
								)}
								{n.icon === "system" && (
									<Check className="h-3.5 w-3.5 text-emerald-500" />
								)}
							</div>
							<div className="min-w-0 flex-1">
								<p className="font-semibold text-neutral-900 text-xs dark:text-white">
									{n.title}
								</p>
								<p className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
									{n.description}
								</p>
								<span className="mt-1 block font-medium text-[10px] text-neutral-400">
									{n.timestamp}
								</span>
							</div>
						</div>
					))}
				</div>
			</DialogPopup>
		</Dialog>
	);
}
