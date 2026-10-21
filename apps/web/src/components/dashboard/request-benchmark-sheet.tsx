import { Button } from "@IvO/ui/components/button";
import { Input } from "@IvO/ui/components/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@IvO/ui/components/sheet";
import { Textarea } from "@IvO/ui/components/textarea";
import {
	CheckCircle2,
	Layers,
	Mail,
	Plus,
	Sparkles,
	Trash2,
	Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export interface RequestBenchmarkSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultMode?: "category" | "flow";
	initialCategory?: string;
}

export function RequestBenchmarkSheet({
	open,
	onOpenChange,
	defaultMode = "category",
	initialCategory = "Finance",
}: RequestBenchmarkSheetProps) {
	const [mode, setMode] = useState<"category" | "flow">(defaultMode);
	const [categories, setCategories] = useState<string[]>([""]);
	const [flows, setFlows] = useState<string[]>([""]);
	const [selectedCategory, setSelectedCategory] =
		useState<string>(initialCategory);
	const [email, setEmail] = useState("");
	const [notes, setNotes] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		if (open) {
			setMode(defaultMode);
			setSelectedCategory(initialCategory);
		}
	}, [open, defaultMode, initialCategory]);

	const handleAddCategory = () => {
		setCategories((prev) => [...prev, ""]);
	};

	const handleRemoveCategory = (index: number) => {
		setCategories((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUpdateCategory = (index: number, value: string) => {
		setCategories((prev) => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	};

	const handleAddFlow = () => {
		setFlows((prev) => [...prev, ""]);
	};

	const handleRemoveFlow = (index: number) => {
		setFlows((prev) => prev.filter((_, i) => i !== index));
	};

	const handleUpdateFlow = (index: number, value: string) => {
		setFlows((prev) => {
			const next = [...prev];
			next[index] = value;
			return next;
		});
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!email.trim() || !email.includes("@")) {
			toast.error("Please enter a valid email address");
			return;
		}

		if (mode === "category") {
			const validCategories = categories.map((c) => c.trim()).filter(Boolean);
			if (validCategories.length === 0) {
				toast.error("Please enter at least one category title");
				return;
			}
		} else {
			const validFlows = flows.map((f) => f.trim()).filter(Boolean);
			if (validFlows.length === 0) {
				toast.error("Please enter at least one user flow title");
				return;
			}
		}

		setIsSubmitting(true);

		setTimeout(() => {
			setIsSubmitting(false);
			toast.success(
				mode === "category"
					? "Category request submitted!"
					: "User flow request submitted!",
				{
					description: `Our benchmarking team will review and notify you at ${email}.`,
				},
			);
			onOpenChange(false);
			// Reset inputs
			setCategories([""]);
			setFlows([""]);
			setNotes("");
		}, 300);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
				<SheetHeader className="space-y-1 pb-2">
					<div className="flex items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400">
							<Sparkles className="h-4 w-4" />
						</span>
						<SheetTitle className="font-bold text-base text-neutral-900 sm:text-lg dark:text-white">
							Talk to Team
						</SheetTitle>
					</div>
					<SheetDescription className="text-neutral-500 text-xs dark:text-neutral-400">
						Tell our benchmarking team which categories and user flows you need
						indexed. We'll capture and notify you as soon as they're ready.
					</SheetDescription>
				</SheetHeader>

				{/* Mode Switcher Tabs */}
				<div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800">
					<button
						type="button"
						onClick={() => setMode("category")}
						className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold text-xs transition-all ${
							mode === "category"
								? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
								: "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
						}`}
					>
						<Layers className="h-3.5 w-3.5" />
						<span>Request Category</span>
					</button>

					<button
						type="button"
						onClick={() => setMode("flow")}
						className={`flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg py-1.5 font-semibold text-xs transition-all ${
							mode === "flow"
								? "bg-white text-neutral-900 shadow-2xs dark:bg-neutral-900 dark:text-white"
								: "text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
						}`}
					>
						<Workflow className="h-3.5 w-3.5" />
						<span>Request Flow</span>
					</button>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-1">
					{mode === "category" ? (
						<>
							{/* Category Title(s) with Tertiary + Button */}
							<div className="space-y-2">
								<div className="flex items-center justify-between">
									<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
										Category Titles <span className="text-red-500">*</span>
									</label>
									<span className="text-[11px] text-neutral-400">
										Industry or domain
									</span>
								</div>

								<div className="space-y-2">
									{categories.map((cat, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<Input
												type="text"
												placeholder="e.g. Healthcare, Real Estate, Gaming..."
												value={cat}
												onChange={(e) =>
													handleUpdateCategory(idx, e.target.value)
												}
												className="h-8 rounded-lg text-xs"
												autoFocus={idx === 0}
											/>
											{categories.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveCategory(idx)}
													className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
													aria-label="Remove category"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											)}
										</div>
									))}
								</div>

								{/* Tertiary Add Category Button */}
								<button
									type="button"
									onClick={handleAddCategory}
									className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-blue-600 text-xs hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Plus className="h-3.5 w-3.5" />
									<span>Add additional category</span>
								</button>
							</div>

							{/* Category User Flows with Tertiary + Button */}
							<div className="space-y-2 pt-1">
								<div className="flex items-center justify-between">
									<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
										Category User Flows
									</label>
									<span className="text-[11px] text-neutral-400">Optional</span>
								</div>

								<div className="space-y-2">
									{flows.map((flowItem, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<Input
												type="text"
												placeholder="e.g. Book Doctor Appointment, Upload Prescription..."
												value={flowItem}
												onChange={(e) => handleUpdateFlow(idx, e.target.value)}
												className="h-8 rounded-lg text-xs"
											/>
											{flows.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveFlow(idx)}
													className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
													aria-label="Remove flow"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											)}
										</div>
									))}
								</div>

								{/* Tertiary Add Flow Button */}
								<button
									type="button"
									onClick={handleAddFlow}
									className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-blue-600 text-xs hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Plus className="h-3.5 w-3.5" />
									<span>Add additional flow</span>
								</button>
							</div>
						</>
					) : (
						<>
							{/* Flow Mode: Target Category */}
							<div className="space-y-1.5">
								<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
									Category
								</label>
								<div className="flex items-center gap-2">
									<span className="rounded-lg bg-neutral-100 px-3 py-1.5 font-medium text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200">
										{selectedCategory}
									</span>
									<span className="text-[11px] text-neutral-400">
										(Benchmark category for these flows)
									</span>
								</div>
							</div>

							{/* User Flow Name(s) with Tertiary + Button */}
							<div className="space-y-2 pt-1">
								<div className="flex items-center justify-between">
									<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
										User Flow Names <span className="text-red-500">*</span>
									</label>
									<span className="text-[11px] text-neutral-400">
										Specific user journeys
									</span>
								</div>

								<div className="space-y-2">
									{flows.map((flowItem, idx) => (
										<div key={idx} className="flex items-center gap-2">
											<Input
												type="text"
												placeholder="e.g. Top Up Phone Balance, Split Bill, Open Savings..."
												value={flowItem}
												onChange={(e) => handleUpdateFlow(idx, e.target.value)}
												className="h-8 rounded-lg text-xs"
												autoFocus={idx === 0}
											/>
											{flows.length > 1 && (
												<button
													type="button"
													onClick={() => handleRemoveFlow(idx)}
													className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-red-500 dark:hover:bg-neutral-800"
													aria-label="Remove flow"
												>
													<Trash2 className="h-3.5 w-3.5" />
												</button>
											)}
										</div>
									))}
								</div>

								{/* Tertiary Add Flow Button */}
								<button
									type="button"
									onClick={handleAddFlow}
									className="inline-flex cursor-pointer items-center gap-1.5 font-semibold text-blue-600 text-xs hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
								>
									<Plus className="h-3.5 w-3.5" />
									<span>Add additional flow</span>
								</button>
							</div>
						</>
					)}

					{/* Notification Email */}
					<div className="space-y-1.5 pt-1">
						<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
							Email to notify once added <span className="text-red-500">*</span>
						</label>
						<div className="relative flex items-center">
							<Mail className="absolute left-2.5 h-3.5 w-3.5 text-neutral-400" />
							<Input
								type="email"
								placeholder="name@company.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="h-8 rounded-lg pl-8 text-xs"
								required
							/>
						</div>
						<p className="text-[11px] text-neutral-400">
							We'll send you a link with the full screen teardown as soon as
							it's published.
						</p>
					</div>

					{/* Additional Notes */}
					<div className="space-y-1.5">
						<label className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
							Specific benchmark apps or notes{" "}
							<span className="font-normal text-neutral-400">(Optional)</span>
						</label>
						<Textarea
							placeholder="e.g. Please benchmark Revolut, Wise, and Monzo for this journey."
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={2}
							className="rounded-lg text-xs"
						/>
					</div>

					<SheetFooter className="pt-2">
						<Button
							type="submit"
							disabled={isSubmitting}
							className="w-full cursor-pointer rounded-xl bg-neutral-900 py-2.5 font-semibold text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
						>
							{isSubmitting ? (
								"Submitting request..."
							) : (
								<span className="flex items-center gap-1.5">
									<CheckCircle2 className="h-3.5 w-3.5" />
									<span>Submit Request</span>
								</span>
							)}
						</Button>
					</SheetFooter>
				</form>
			</SheetContent>
		</Sheet>
	);
}
