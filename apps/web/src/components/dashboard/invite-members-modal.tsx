import { Button } from "@IvO/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Input } from "@IvO/ui/components/input";
import { Label } from "@IvO/ui/components/label";
import { Check, Copy, Mail, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InviteMembersModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function InviteMembersModal({
	open,
	onOpenChange,
}: InviteMembersModalProps) {
	const [email, setEmail] = useState("");
	const [role, setRole] = useState<"editor" | "admin" | "viewer">("editor");
	const [copied, setCopied] = useState(false);

	const handleCopyLink = () => {
		const inviteUrl =
			typeof window !== "undefined"
				? `${window.location.origin}/invite/workspace-team`
				: "https://alignment.design/invite/workspace-team";
		navigator.clipboard?.writeText(inviteUrl);
		setCopied(true);
		toast.success("Workspace invite link copied to clipboard", {
			description: "Anyone with this link can join as a workspace member.",
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const handleSendInvite = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim() || !email.includes("@")) {
			toast.error("Please provide a valid email address");
			return;
		}

		toast.success(`Invite sent to ${email}`, {
			description: `Role assigned: ${role.charAt(0).toUpperCase() + role.slice(1)}. They will receive an email shortly.`,
		});
		setEmail("");
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-md rounded-3xl border border-neutral-200/90 p-6 sm:p-8 dark:border-neutral-800">
				<DialogHeader className="space-y-1.5">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white">
						<UserPlus className="h-5 w-5" />
					</div>
					<DialogTitle className="pt-2 font-bold text-lg text-neutral-950 tracking-tight dark:text-white">
						Invite team members
					</DialogTitle>
					<DialogDescription className="text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
						Collaborate with engineers and designers on teardown flows, friction
						telemetry, and custom AI workspace agents.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSendInvite} className="mt-5 space-y-4">
					<div className="space-y-1.5">
						<Label
							htmlFor="member-email"
							className="font-medium text-neutral-700 text-xs dark:text-neutral-300"
						>
							Email address
						</Label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-400">
								<Mail className="h-4 w-4" />
							</div>
							<Input
								id="member-email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder="colleague@company.com"
								className="h-10 rounded-xl pl-10 text-xs"
								autoFocus
							/>
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="font-medium text-neutral-700 text-xs dark:text-neutral-300">
							Workspace Role
						</Label>
						<div className="grid grid-cols-3 gap-2">
							{(
								[
									{ id: "editor", label: "Editor" },
									{ id: "viewer", label: "Viewer" },
									{ id: "admin", label: "Admin" },
								] as const
							).map((item) => (
								<button
									key={item.id}
									type="button"
									onClick={() => setRole(item.id)}
									className={`rounded-xl border py-2 text-center font-medium text-xs transition-colors ${
										role === item.id
											? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
											: "border-neutral-200/80 bg-neutral-50/70 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
									}`}
								>
									{item.label}
								</button>
							))}
						</div>
					</div>

					<div className="pt-2">
						<div className="flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/50">
							<div className="flex items-center gap-2">
								<Users className="h-4 w-4 text-neutral-400" />
								<span className="font-medium text-[11px] text-neutral-600 dark:text-neutral-400">
									Direct link invitation
								</span>
							</div>
							<button
								type="button"
								onClick={handleCopyLink}
								className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold text-[11px] text-neutral-900 transition-colors hover:bg-neutral-200/60 dark:text-neutral-100 dark:hover:bg-neutral-800"
							>
								{copied ? (
									<>
										<Check className="h-3 w-3 text-emerald-600" />
										<span className="text-emerald-600">Copied</span>
									</>
								) : (
									<>
										<Copy className="h-3 w-3" />
										<span>Copy link</span>
									</>
								)}
							</button>
						</div>
					</div>

					<DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 pt-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							className="rounded-full text-xs"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="rounded-full bg-neutral-950 text-white text-xs dark:bg-white dark:text-neutral-950"
						>
							Send invitation
						</Button>
					</DialogFooter>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
