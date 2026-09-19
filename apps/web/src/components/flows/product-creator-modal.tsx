import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Globe, PackagePlus, Smartphone } from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { UserProduct, flowStore } from "@/lib/flow-store";

interface ProductCreatorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onProductCreated?: (product: UserProduct) => void;
}

const CATEGORIES = [
	"Banking",
	"Crypto & Web3",
	"Investing",
	"Payments",
	"Lending",
	"SaaS",
];

const PRESET_APP_COLORS = [
	"#0075eb", // Revolut Blue
	"#10b981", // Emerald
	"#8b5cf6", // Purple
	"#f59e0b", // Amber
	"#000000", // Onyx
	"#9fe870", // Wise Lime
	"#ff4b4b", // Red
	"#06b6d4", // Cyan
];

export function ProductCreatorModal({
	open,
	onOpenChange,
	onProductCreated,
}: ProductCreatorModalProps) {
	const [name, setName] = useState("");
	const [category, setCategory] = useState("Banking");
	const [platform, setPlatform] = useState<"ios" | "web">("ios");
	const [color, setColor] = useState("#0075eb");
	const [description, setDescription] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim()) {
			toast.error("Product name required", {
				description: "Please provide a name for this product.",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const newProduct: UserProduct = {
				id: `prod-${Date.now()}`,
				userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
				name: name.trim(),
				category,
				platform,
				color,
				description: description.trim(),
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};

			flowStore.saveProduct(newProduct);
			toast.success("Product created successfully!", {
				description: `You can now add and group flows under ${newProduct.name}.`,
			});

			onProductCreated?.(newProduct);

			// Reset form
			setName("");
			setDescription("");
			onOpenChange(false);
		} catch (err) {
			console.error("Failed to create product", err);
			toast.error("Error creating product");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-w-md rounded-3xl p-6 sm:p-8 bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 shadow-2xl">
				<DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
					<div>
						<DialogTitle className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
							New product
						</DialogTitle>
						<DialogDescription className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
							Create a product to group and organize your user teardown flows.
						</DialogDescription>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="mt-5 space-y-4">
					{/* Product Name */}
					<div>
						<label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
							Product Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='e.g. "Robinhood", "Monzo", "Stripe"'
							className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
							autoFocus
						/>
					</div>

					{/* Category */}
					<div>
						<label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
							Category
						</label>
						<select
							value={category}
							onChange={(e) => setCategory(e.target.value)}
							className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-xs text-neutral-900 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400 cursor-pointer"
						>
							{CATEGORIES.map((c) => (
								<option key={c} value={c}>
									{c}
								</option>
							))}
						</select>
					</div>

					{/* Platform & Accent Color */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
						<div>
							<label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
								Platform
							</label>
							<div className="flex rounded-xl bg-neutral-100 p-1 dark:bg-neutral-800 ring-1 ring-neutral-200/80 dark:ring-neutral-700/60">
								<button
									type="button"
									onClick={() => setPlatform("ios")}
									className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
										platform === "ios"
											? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-700 dark:text-white"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
									}`}
								>
									<Smartphone className="h-3.5 w-3.5" />
									<span>iOS</span>
								</button>
								<button
									type="button"
									onClick={() => setPlatform("web")}
									className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-all ${
										platform === "web"
											? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-700 dark:text-white"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
									}`}
								>
									<Globe className="h-3.5 w-3.5" />
									<span>Web</span>
								</button>
							</div>
						</div>

						<div>
							<label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
								Brand Color
							</label>
							<div className="flex flex-wrap items-center gap-2 pt-0.5">
								{PRESET_APP_COLORS.map((c) => (
									<button
										key={c}
										type="button"
										onClick={() => setColor(c)}
										style={{ backgroundColor: c }}
										className={`h-6 w-6 rounded-full transition-transform cursor-pointer ${
											color === c
												? "scale-110 ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-900"
												: "hover:scale-105 opacity-80"
										}`}
										aria-label={`Select accent color ${c}`}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
							Description (optional)
						</label>
						<textarea
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Short overview of the product..."
							className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
						/>
					</div>

					{/* Actions */}
					<div className="mt-6 flex items-center justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800">
						<button
							type="button"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="rounded-full border border-neutral-200 px-5 py-2 text-xs font-semibold text-neutral-700 transition-all hover:bg-neutral-100 active:scale-[0.97] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 cursor-pointer"
						>
							Cancel
						</button>

						<button
							type="submit"
							disabled={isSubmitting}
							className="inline-flex items-center gap-1.5 rounded-full bg-neutral-950 px-6 py-2 text-xs font-semibold text-white shadow-md transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 cursor-pointer"
						>
							<PackagePlus className="h-3.5 w-3.5" />
							<span>Create Product</span>
						</button>
					</div>
				</form>
			</DialogPopup>
		</Dialog>
	);
}
