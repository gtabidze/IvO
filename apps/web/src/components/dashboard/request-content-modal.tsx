import { Button } from "@IvO/ui/components/button";
import { Dialog, DialogPopup } from "@IvO/ui/components/dialog";
import { Input } from "@IvO/ui/components/input";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface RequestContentModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function RequestContentModal({
	open,
	onOpenChange,
}: RequestContentModalProps) {
	const [step, setStep] = useState<1 | 2>(1);
	const [url, setUrl] = useState("");
	const [appName, setAppName] = useState("");
	const [flowNotes, setFlowNotes] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim()) {
			toast.error("Please enter a valid website or App Store URL");
			return;
		}

		if (step === 1) {
			setStep(2);
			return;
		}

		toast.success("Content request submitted!", {
			description: `Our teardown team has queued ${url} for multi-screen recording.`,
		});
		onOpenChange(false);
		setStep(1);
		setUrl("");
		setAppName("");
		setFlowNotes("");
	};

	const handleBack = () => {
		if (step === 2) {
			setStep(1);
		} else {
			onOpenChange(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-md rounded-3xl border border-neutral-200 p-8 shadow-2xl sm:p-10 dark:border-neutral-800">
				{/* Back Arrow button */}
				<div className="flex items-center justify-between pb-2">
					<button
						type="button"
						onClick={handleBack}
						className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
						aria-label="Back"
					>
						<ArrowLeft className="h-4 w-4" />
					</button>
				</div>

				<form
					onSubmit={handleSubmit}
					className="flex flex-col items-center text-center"
				>
					<span className="font-semibold text-neutral-400 text-xs uppercase tracking-widest">
						Request Screen Audit
					</span>

					{step === 1 ? (
						<>
							<h2 className="mt-3 font-bold text-2xl text-neutral-950 tracking-tight sm:text-3xl dark:text-white">
								What’s the URL?
							</h2>
							<p className="mt-2 text-neutral-500 text-xs dark:text-neutral-400">
								Provide the website, web app, or iOS App Store link you'd like
								us to record.
							</p>

							<div className="mt-6 w-full">
								<Input
									type="text"
									placeholder="www.example.com"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									className="h-12 w-full rounded-xl border-neutral-300 bg-neutral-50/50 px-4 text-center font-medium text-neutral-900 text-sm focus:border-neutral-900 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
									autoFocus
								/>
							</div>
						</>
					) : (
						<>
							<h2 className="mt-3 font-bold text-2xl text-neutral-950 tracking-tight sm:text-3xl dark:text-white">
								Specific flow or focus?
							</h2>
							<p className="mt-2 text-neutral-500 text-xs dark:text-neutral-400">
								e.g. Onboarding, KYC verification, checkout, or cancellation.
							</p>

							<div className="mt-6 w-full space-y-3">
								<Input
									type="text"
									placeholder="App or Brand name (optional)"
									value={appName}
									onChange={(e) => setAppName(e.target.value)}
									className="h-11 w-full rounded-xl border-neutral-300 bg-neutral-50/50 px-4 font-medium text-neutral-900 text-sm focus:border-neutral-900 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
								/>
								<Input
									type="text"
									placeholder="Flow note (e.g. test with European passport)"
									value={flowNotes}
									onChange={(e) => setFlowNotes(e.target.value)}
									className="h-11 w-full rounded-xl border-neutral-300 bg-neutral-50/50 px-4 font-medium text-neutral-900 text-sm focus:border-neutral-900 focus:bg-white dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
								/>
							</div>
						</>
					)}

					<Button
						type="submit"
						className="mt-6 h-12 w-full rounded-xl bg-neutral-950 font-medium text-sm text-white shadow-sm transition-all hover:bg-neutral-800 active:scale-[0.98] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						{step === 1 ? "Continue" : "Submit Request"}
					</Button>

					{/* Step Indicator Dots */}
					<div className="mt-6 flex items-center justify-center gap-1.5">
						<span
							className={`h-1 rounded-full transition-all ${
								step === 1
									? "w-6 bg-neutral-950 dark:bg-white"
									: "w-1.5 bg-neutral-300 dark:bg-neutral-700"
							}`}
						/>
						<span
							className={`h-1 rounded-full transition-all ${
								step === 2
									? "w-6 bg-neutral-950 dark:bg-white"
									: "w-1.5 bg-neutral-300 dark:bg-neutral-700"
							}`}
						/>
					</div>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
