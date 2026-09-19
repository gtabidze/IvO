import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import {
	Globe,
	ImagePlus,
	Layers,
	Plus,
	Smartphone,
	UploadCloud,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	flowStore,
	type UserCustomFlow,
	type UserProduct,
	type UserScreenItem,
} from "@/lib/flow-store";

interface FlowCreatorModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFlowCreated?: (flow: UserCustomFlow) => void;
	initialProductId?: string;
	onOpenCreateProduct?: () => void;
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
];

export function FlowCreatorModal({
	open,
	onOpenChange,
	onFlowCreated,
	initialProductId,
	onOpenCreateProduct,
}: FlowCreatorModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Products State
	const [products, setProducts] = useState<UserProduct[]>(() => flowStore.getProducts());
	const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId || "");

	// Flow Form State
	const [name, setName] = useState("");
	const [appName, setAppName] = useState("");
	const [appCategory, setAppCategory] = useState("Banking");
	const [platform, setPlatform] = useState<"ios" | "web">("ios");
	const [description, setDescription] = useState("");
	const [appColor, setAppColor] = useState("#0075eb");
	const [screens, setScreens] = useState<UserScreenItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Sync products and prefill if initialProductId provided
	useEffect(() => {
		const prods = flowStore.getProducts();
		setProducts(prods);

		const targetId = initialProductId || (prods.length > 0 ? prods[0]?.id : "");
		if (targetId) {
			setSelectedProductId(targetId);
			const prod = prods.find((p) => p.id === targetId);
			if (prod) {
				setAppName(prod.name);
				setAppCategory(prod.category);
				setPlatform(prod.platform);
				setAppColor(prod.color);
			}
		}
	}, [open, initialProductId]);

	useEffect(() => {
		const handleProdsUpdate = () => {
			setProducts(flowStore.getProducts());
		};
		window.addEventListener("ivo_products_updated", handleProdsUpdate);
		return () => {
			window.removeEventListener("ivo_products_updated", handleProdsUpdate);
		};
	}, []);

	const handleProductChange = (prodId: string) => {
		setSelectedProductId(prodId);
		const prod = products.find((p) => p.id === prodId);
		if (prod) {
			setAppName(prod.name);
			setAppCategory(prod.category);
			setPlatform(prod.platform);
			setAppColor(prod.color);
		}
	};

	// Handle Image File Uploads
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;

		const currentCount = screens.length;

		Array.from(files).forEach((file, index) => {
			const reader = new FileReader();
			reader.onload = (event) => {
				const dataUrl = event.target?.result as string;
				setScreens((prev) => [
					...prev,
					{
						id: `scr-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 4)}`,
						title: file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
						imageUrl: dataUrl,
						screenType: "generic-wireframe",
						orderIndex: currentCount + index,
					},
				]);
			};
			reader.readAsDataURL(file);
		});

		toast.success(`Loaded ${files.length} screen(s)`, {
			description: "Screens added to the flow sequence.",
		});

		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const removeScreen = (id: string) => {
		setScreens((prev) => prev.filter((s) => s.id !== id));
	};

	const updateScreenTitle = (id: string, newTitle: string) => {
		setScreens((prev) =>
			prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
		);
	};

	// Save or Publish Handler
	const handleSubmit = (status: "draft" | "published") => {
		if (!name.trim()) {
			toast.error("Flow name required", {
				description: "Please enter a name for this flow.",
			});
			return;
		}

		if (!appName.trim()) {
			toast.error("App name required", {
				description: "Please enter the product or app name.",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const selectedProd = products.find((p) => p.id === selectedProductId);
			const newFlow: UserCustomFlow = {
				id: `flow-${Date.now()}`,
				userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
				productId: selectedProductId || undefined,
				productName: selectedProd?.name || appName.trim(),
				name: name.trim(),
				appName: appName.trim(),
				appCategory,
				platform,
				description: description.trim(),
				status,
				appColor,
				screensCount: screens.length,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				screens,
			};

			flowStore.saveFlow(newFlow);

			toast.success(
				status === "published"
					? "Flow published successfully!"
					: "Draft saved successfully!",
				{
					description:
						status === "published"
							? "Your flow is now live in My Flows and visible on the platform."
							: "Your flow draft has been saved to My Flows.",
				},
			);

			onFlowCreated?.(newFlow);

			// Reset form
			setName("");
			setAppName("");
			setDescription("");
			setScreens([]);
			onOpenChange(false);
		} catch (error) {
			console.error("Failed to create flow", error);
			toast.error("Error creating flow", {
				description: "Please check details and try again.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogPopup className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl border border-neutral-200/80 bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-800 dark:bg-neutral-900">
				<DialogHeader className="flex flex-row items-center justify-between border-neutral-100 border-b pb-4 dark:border-neutral-800">
					<div>
						<DialogTitle className="font-bold text-lg text-neutral-900 tracking-tight dark:text-white">
							Create new flow
						</DialogTitle>
						<DialogDescription className="mt-0.5 text-neutral-500 text-xs dark:text-neutral-400">
							Upload screen sequences, organize steps, and publish or save as
							draft.
						</DialogDescription>
					</div>
				</DialogHeader>

				<div className="mt-5 space-y-4">
					{/* Product Selector */}
					<div>
						<div className="mb-1.5 flex items-center justify-between">
							<label className="block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Product Group
							</label>
							{onOpenCreateProduct && (
								<button
									type="button"
									onClick={() => {
										onOpenChange(false);
										onOpenCreateProduct();
									}}
									className="flex items-center gap-1 font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400 cursor-pointer"
								>
									<Plus className="h-3 w-3" />
									<span>New product</span>
								</button>
							)}
						</div>
						<select
							value={selectedProductId}
							onChange={(e) => handleProductChange(e.target.value)}
							className="w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-neutral-900 text-xs focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
						>
							<option value="">Custom (standalone / no product)</option>
							{products.map((p) => (
								<option key={p.id} value={p.id}>
									{p.name} ({p.category} • {p.platform === "ios" ? "iOS" : "Web"})
								</option>
							))}
						</select>
					</div>

					{/* Flow Name */}
					<div>
						<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
							Flow Name <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							value={name}
							onChange={(e) => setName(e.target.value)}
							placeholder='I.e. "Dark Mode Onboarding"'
							className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
						/>
					</div>

					{/* App & Category Grid */}
					<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
						<div>
							<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								App Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								value={appName}
								onChange={(e) => setAppName(e.target.value)}
								placeholder='e.g. "Revolut"'
								className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
							/>
						</div>

						<div>
							<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Category
							</label>
							<select
								value={appCategory}
								onChange={(e) => setAppCategory(e.target.value)}
								className="w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2.5 text-neutral-900 text-xs focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
							>
								{CATEGORIES.map((c) => (
									<option key={c} value={c}>
										{c}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Platform & Accent Color Selector */}
					<div className="grid grid-cols-1 gap-3.5 pt-1 sm:grid-cols-2">
						<div>
							<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Platform
							</label>
							<div className="flex rounded-xl bg-neutral-100 p-1 ring-1 ring-neutral-200/80 dark:bg-neutral-800 dark:ring-neutral-700/60">
								<button
									type="button"
									onClick={() => setPlatform("ios")}
									className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium text-xs transition-all ${
										platform === "ios"
											? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-700 dark:text-white"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
									}`}
								>
									<Smartphone className="h-3.5 w-3.5" />
									<span>iOS Mobile</span>
								</button>
								<button
									type="button"
									onClick={() => setPlatform("web")}
									className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 font-medium text-xs transition-all ${
										platform === "web"
											? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-700 dark:text-white"
											: "text-neutral-600 hover:text-neutral-900 dark:text-neutral-400"
									}`}
								>
									<Globe className="h-3.5 w-3.5" />
									<span>Web / Desktop</span>
								</button>
							</div>
						</div>

						<div>
							<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Brand Accent Color
							</label>
							<div className="flex items-center gap-2 pt-0.5">
								{PRESET_APP_COLORS.map((color) => (
									<button
										key={color}
										type="button"
										onClick={() => setAppColor(color)}
										style={{ backgroundColor: color }}
										className={`h-7 w-7 cursor-pointer rounded-full transition-transform ${
											appColor === color
												? "scale-110 ring-2 ring-neutral-900 ring-offset-2 dark:ring-white dark:ring-offset-neutral-900"
												: "opacity-80 hover:scale-105"
										}`}
										aria-label={`Select accent color ${color}`}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Description */}
					<div>
						<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
							Description
						</label>
						<textarea
							rows={2}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="How would you describe this flow sequence?"
							className="w-full rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3.5 py-2.5 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
						/>
					</div>

					{/* Screen Upload & Sequences Area */}
					<div>
						<div className="mb-2 flex items-center justify-between">
							<label className="block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Upload Screens ({screens.length})
							</label>
							<span className="text-[11px] text-neutral-500">
								PNG, JPG, or WEBP
							</span>
						</div>

						{/* Drag & Drop / File Input Box */}
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							aria-label="Upload screens file selector"
							className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-neutral-200 border-dashed p-5 text-center transition-all hover:border-neutral-400 hover:bg-neutral-50/50 dark:border-neutral-800 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/50"
						>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept="image/png, image/jpeg, image/webp"
								onChange={handleFileSelect}
								className="hidden"
							/>
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition-transform group-hover:scale-105 dark:bg-neutral-800 dark:text-neutral-300">
								<ImagePlus className="h-5 w-5" />
							</div>
							<p className="mt-2 font-medium text-neutral-800 text-xs dark:text-neutral-200">
								Click to select screen files or drag & drop here
							</p>
							<p className="mt-0.5 text-[11px] text-neutral-400 dark:text-neutral-500">
								Select multiple images to build the sequence
							</p>
						</button>

						{/* Uploaded Screen Thumbnails List */}
						{screens.length > 0 && (
							<div className="mt-3 grid max-h-48 grid-cols-2 gap-3 overflow-y-auto p-1 sm:grid-cols-4">
								{screens.map((screen, idx) => (
									<div
										key={screen.id}
										className="group/item relative flex flex-col rounded-xl border border-neutral-200/80 bg-neutral-50 p-2 dark:border-neutral-800 dark:bg-neutral-800/60"
									>
										<div className="relative aspect-9/16 w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700">
											{screen.imageUrl ? (
												<img
													src={screen.imageUrl}
													alt={screen.title}
													className="h-full w-full object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center">
													<Layers className="h-4 w-4 text-neutral-400" />
												</div>
											)}
											<span className="absolute top-1 left-1 rounded-md bg-black/70 px-1 py-0.2 font-mono text-[9px] text-white">
												{idx + 1}
											</span>
											<button
												type="button"
												onClick={(e) => {
													e.stopPropagation();
													removeScreen(screen.id);
												}}
												className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity group-hover/item:opacity-100"
												aria-label="Remove screen"
											>
												<X className="h-3 w-3" />
											</button>
										</div>
										<input
											type="text"
											value={screen.title}
											onChange={(e) =>
												updateScreenTitle(screen.id, e.target.value)
											}
											placeholder="Screen title"
											className="mt-1.5 w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-medium text-[10px] text-neutral-800 hover:border-neutral-300 focus:border-neutral-400 focus:bg-white focus:outline-none dark:text-neutral-200 dark:focus:bg-neutral-900"
										/>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Modal Footer Controls */}
				<div className="mt-8 flex flex-col-reverse gap-2.5 border-neutral-100 border-t pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-neutral-800">
					<button
						type="button"
						onClick={() => onOpenChange(false)}
						disabled={isSubmitting}
						className="cursor-pointer rounded-full border border-neutral-200 px-5 py-2 font-semibold text-neutral-700 text-xs transition-all hover:bg-neutral-100 active:scale-[0.97] dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
					>
						Cancel
					</button>

					<button
						type="button"
						onClick={() => handleSubmit("draft")}
						disabled={isSubmitting}
						className="cursor-pointer rounded-full border border-neutral-300 bg-white px-5 py-2 font-semibold text-neutral-900 text-xs shadow-xs transition-all hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
					>
						Save as Draft
					</button>

					<button
						type="button"
						onClick={() => handleSubmit("published")}
						disabled={isSubmitting}
						className="flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-6 py-2 font-semibold text-white text-xs shadow-md transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						<UploadCloud className="h-3.5 w-3.5" />
						<span>Publish Flow</span>
					</button>
				</div>
			</DialogPopup>
		</Dialog>
	);
}
