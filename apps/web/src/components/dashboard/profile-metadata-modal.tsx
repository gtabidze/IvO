import { Button } from "@IvO/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Input } from "@IvO/ui/components/input";
import { Label } from "@IvO/ui/components/label";
import { useState } from "react";
import { toast } from "sonner";

interface ProfileMetadataModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialRole?: string;
	initialOrg?: string;
}

export function ProfileMetadataModal({
	open,
	onOpenChange,
	initialRole = "Product Designer",
	initialOrg = "IvO Labs",
}: ProfileMetadataModalProps) {
	const [role, setRole] = useState(initialRole);
	const [org, setOrg] = useState(initialOrg);
	const [primaryPlatform, setPrimaryPlatform] = useState<"ios" | "web" | "all">(
		"all",
	);
	const [primaryTool, setPrimaryTool] = useState("Figma");

	const handleSave = (e: React.FormEvent) => {
		e.preventDefault();
		toast.success("Profile metadata saved!", {
			description: `Role: ${role} • Org: ${org} • Platform: ${primaryPlatform.toUpperCase()}`,
		});
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-md rounded-3xl border border-neutral-200 p-6 shadow-2xl sm:p-8 dark:border-neutral-800">
				<DialogHeader>
					<DialogTitle className="font-bold text-neutral-950 text-xl dark:text-white">
						Profile & Workspace Metadata
					</DialogTitle>
					<DialogDescription className="text-neutral-500 text-xs dark:text-neutral-400">
						Customize your design intelligence profile, team taxonomy, and flow
						recommendations.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSave} className="mt-4 space-y-4">
					<div className="space-y-1.5">
						<Label className="font-semibold text-neutral-700 text-xs dark:text-neutral-300">
							Your Primary Role
						</Label>
						<Input
							type="text"
							value={role}
							onChange={(e) => setRole(e.target.value)}
							placeholder="e.g. Lead Product Designer, UX Researcher"
							className="h-10 rounded-xl text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="font-semibold text-neutral-700 text-xs dark:text-neutral-300">
							Organization or Studio
						</Label>
						<Input
							type="text"
							value={org}
							onChange={(e) => setOrg(e.target.value)}
							placeholder="e.g. IvO Labs Inc."
							className="h-10 rounded-xl text-xs"
						/>
					</div>

					<div className="space-y-1.5">
						<Label className="font-semibold text-neutral-700 text-xs dark:text-neutral-300">
							Preferred Design Platform
						</Label>
						<div className="grid grid-cols-3 gap-2">
							{(["ios", "web", "all"] as const).map((platform) => (
								<button
									key={platform}
									type="button"
									onClick={() => setPrimaryPlatform(platform)}
									className={`rounded-xl border py-2 font-medium text-xs transition-all ${
										primaryPlatform === platform
											? "border-neutral-900 bg-neutral-900 text-white dark:border-white dark:bg-white dark:text-neutral-950"
											: "border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
									}`}
								>
									{platform === "all"
										? "Both"
										: platform === "ios"
											? "iOS Native"
											: "Web Apps"}
								</button>
							))}
						</div>
					</div>

					<div className="space-y-1.5">
						<Label className="font-semibold text-neutral-700 text-xs dark:text-neutral-300">
							Primary Design Tool
						</Label>
						<Input
							type="text"
							value={primaryTool}
							onChange={(e) => setPrimaryTool(e.target.value)}
							placeholder="e.g. Figma, Framer, Origami"
							className="h-10 rounded-xl text-xs"
						/>
					</div>

					<div className="pt-2">
						<Button
							type="submit"
							className="w-full rounded-xl bg-neutral-950 py-2.5 font-medium text-white text-xs shadow-sm hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							Save Profile Metadata
						</Button>
					</div>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
