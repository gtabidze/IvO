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
import { Check, Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface AddCompetenceModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const PRESET_COMPETENCES = [
	{
		id: "usability-audit",
		name: "Usability Auditor",
		description:
			"Detects cognitive load, ambiguous affordances, and multi-step friction points.",
		badge: "Heuristics",
	},
	{
		id: "benchmark-extraction",
		name: "Benchmark Extractor",
		description:
			"Compares step sequences directly against Revolut, Wise, and Stripe benchmarks.",
		badge: "Competitive",
	},
	{
		id: "a11y-validator",
		name: "Accessibility & Contrast",
		description:
			"Verifies WCAG 2.2 AA tap targets, color contrast ratios, and screen readability.",
		badge: "WCAG 2.2",
	},
	{
		id: "copy-clarity",
		name: "Microcopy & Intent Alignment",
		description:
			"Audits CTA clarity, instruction copy, and gap between intent and outcome.",
		badge: "Content",
	},
];

export function AddCompetenceModal({
	open,
	onOpenChange,
}: AddCompetenceModalProps) {
	const [activeCompetences, setActiveCompetences] = useState<string[]>([
		"usability-audit",
		"benchmark-extraction",
	]);
	const [customName, setCustomName] = useState("");
	const [showCustom, setShowCustom] = useState(false);

	const handleToggle = (id: string, name: string) => {
		setActiveCompetences((prev) => {
			const exists = prev.includes(id);
			if (exists) {
				toast.info(`Competence "${name}" removed from workspace agents`);
				return prev.filter((item) => item !== id);
			}
			toast.success(`Competence "${name}" enabled for workspace agents!`);
			return [...prev, id];
		});
	};

	const handleAddCustom = (e: React.FormEvent) => {
		e.preventDefault();
		if (!customName.trim()) {
			toast.error("Please enter a competence title");
			return;
		}
		toast.success(`Custom competence "${customName.trim()}" added!`, {
			description:
				"Workspace agents can now leverage this specialized instruction.",
		});
		setCustomName("");
		setShowCustom(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-lg rounded-3xl border border-neutral-200/90 p-6 sm:p-8 dark:border-neutral-800">
				<DialogHeader className="space-y-1.5">
					<div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-white">
						<Sparkles className="h-5 w-5" />
					</div>
					<DialogTitle className="pt-2 font-bold text-lg text-neutral-950 tracking-tight dark:text-white">
						Add agent competence
					</DialogTitle>
					<DialogDescription className="text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
						Equip your workspace agents with specialized evaluation capabilities
						to automatically dissect flows, calculate friction, and benchmark
						designs.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-5 space-y-3">
					<div className="space-y-2">
						{PRESET_COMPETENCES.map((comp) => {
							const isEnabled = activeCompetences.includes(comp.id);
							return (
								<div
									key={comp.id}
									onClick={() => handleToggle(comp.id, comp.name)}
									onKeyDown={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											e.preventDefault();
											handleToggle(comp.id, comp.name);
										}
									}}
									tabIndex={0}
									role="button"
									className={`flex cursor-pointer items-start justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
										isEnabled
											? "border-neutral-950 bg-neutral-950/5 dark:border-white/80 dark:bg-white/5"
											: "border-neutral-200/80 bg-neutral-50/50 hover:bg-neutral-100/60 dark:border-neutral-800 dark:bg-neutral-900/40 dark:hover:bg-neutral-800/60"
									}`}
								>
									<div className="space-y-1">
										<div className="flex items-center gap-2">
											<span className="font-semibold text-neutral-900 text-xs dark:text-white">
												{comp.name}
											</span>
											<span className="rounded-full bg-neutral-200/70 px-2 py-0.5 font-medium text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
												{comp.badge}
											</span>
										</div>
										<p className="text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
											{comp.description}
										</p>
									</div>

									<div
										className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
											isEnabled
												? "border-neutral-950 bg-neutral-950 text-white dark:border-white dark:bg-white dark:text-neutral-950"
												: "border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800"
										}`}
									>
										{isEnabled && <Check className="h-3 w-3 stroke-[3]" />}
									</div>
								</div>
							);
						})}
					</div>

					{showCustom ? (
						<form
							onSubmit={handleAddCustom}
							className="space-y-3 rounded-2xl border border-neutral-200/90 bg-neutral-50/70 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60"
						>
							<div className="space-y-1.5">
								<Label className="font-medium text-neutral-700 text-xs dark:text-neutral-300">
									Custom competence name
								</Label>
								<Input
									value={customName}
									onChange={(e) => setCustomName(e.target.value)}
									placeholder='e.g. "KYC Drop-off Heuristic"'
									className="h-9 rounded-xl text-xs"
									autoFocus
								/>
							</div>
							<div className="flex justify-end gap-2">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCustom(false)}
									className="h-8 rounded-full text-xs"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									className="h-8 rounded-full bg-neutral-950 text-white text-xs dark:bg-white dark:text-neutral-950"
								>
									Add to agents
								</Button>
							</div>
						</form>
					) : (
						<button
							type="button"
							onClick={() => setShowCustom(true)}
							className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-neutral-300 border-dashed py-2.5 font-medium text-neutral-600 text-xs transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-900"
						>
							<Plus className="h-3.5 w-3.5" />
							<span>Create custom competence</span>
						</button>
					)}
				</div>

				<DialogFooter className="mt-6 flex flex-row items-center justify-end gap-2 pt-2">
					<Button
						type="button"
						onClick={() => onOpenChange(false)}
						className="rounded-full bg-neutral-950 text-white text-xs dark:bg-white dark:text-neutral-950"
					>
						Done
					</Button>
				</DialogFooter>
			</DialogPopup>
		</Dialog>
	);
}
