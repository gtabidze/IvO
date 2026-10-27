import { Button } from "@IvO/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Input } from "@IvO/ui/components/input";
import {
	ArrowLeft,
	ArrowRight,
	Clipboard,
	Globe,
	ImagePlus,
	Layers,
	Plus,
	Smartphone,
	UploadCloud,
	X,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
	flowStore,
	type UserCustomFlow,
	type UserProduct,
	type UserScreenItem,
} from "@/lib/flow-store";

export interface AddFlowModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onFlowCreated?: (flow: UserCustomFlow) => void;
	initialProductId?: string;
	onOpenCreateProduct?: () => void;
}

function FigmaIcon({ className = "h-3.5 w-3.5" }: { className?: string }) {
	return (
		<svg
			viewBox="0 0 38 57"
			className={className}
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z"
				fill="#1ABCFE"
			/>
			<path
				d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z"
				fill="#0ACF83"
			/>
			<path
				d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z"
				fill="#FF7262"
			/>
			<path
				d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z"
				fill="#F24E1E"
			/>
			<path
				d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z"
				fill="#A259FF"
			/>
		</svg>
	);
}

export function AddFlowModal({
	open,
	onOpenChange,
	onFlowCreated,
	initialProductId,
	onOpenCreateProduct,
}: AddFlowModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	// Product selection
	const [products, setProducts] = useState<UserProduct[]>(() =>
		flowStore.getProducts(),
	);
	const [selectedProductId, setSelectedProductId] = useState<string>(
		initialProductId || "",
	);

	// Flow fields
	const [name, setName] = useState("");
	const [platform, setPlatform] = useState<"ios" | "web">("ios");
	const [screens, setScreens] = useState<UserScreenItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);

	// Sync products and initialProductId
	useEffect(() => {
		const prods = flowStore.getProducts();
		setProducts(prods);

		if (initialProductId) {
			setSelectedProductId(initialProductId);
		} else if (!selectedProductId && prods.length > 0) {
			setSelectedProductId(prods[0]?.id || "");
		}
	}, [initialProductId, selectedProductId]);

	useEffect(() => {
		const handleProdsUpdate = () => {
			setProducts(flowStore.getProducts());
		};
		window.addEventListener("ivo_products_updated", handleProdsUpdate);
		return () => {
			window.removeEventListener("ivo_products_updated", handleProdsUpdate);
		};
	}, []);

	// Add images helper
	const appendImages = useCallback(
		(
			newImages: Array<{
				url: string;
				title?: string;
			}>,
			source: "figma" | "upload" | "drop",
		) => {
			if (newImages.length === 0) return;

			setScreens((prev) => {
				const startIdx = prev.length;
				const created: UserScreenItem[] = newImages.map((img, i) => ({
					id: `scr-${Date.now()}-${startIdx + i}-${Math.random().toString(36).substring(2, 6)}`,
					title: img.title || `Screen ${startIdx + i + 1}`,
					imageUrl: img.url,
					screenType: "generic-wireframe",
					orderIndex: startIdx + i,
				}));
				return [...prev, ...created];
			});

			if (source === "figma") {
				toast.success(
					`Pasted ${newImages.length} frame${newImages.length > 1 ? "s" : ""} from Figma!`,
					{
						description: "Screens added to your sequence flow.",
					},
				);
			} else {
				toast.success(
					`Added ${newImages.length} screen${newImages.length > 1 ? "s" : ""}`,
					{
						description: "Screens added to your sequence flow.",
					},
				);
			}
		},
		[],
	);

	// Extract images from HTML if Figma pastes HTML representation
	const extractImagesFromHtml = useCallback((html: string): string[] => {
		if (!html) return [];
		try {
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, "text/html");
			const imgs = Array.from(doc.querySelectorAll("img"));
			return imgs
				.map((img) => img.getAttribute("src"))
				.filter((src): src is string =>
					Boolean(
						src &&
							(src.startsWith("data:image/") ||
								src.startsWith("http://") ||
								src.startsWith("https://") ||
								src.startsWith("blob:")),
					),
				);
		} catch {
			return [];
		}
	}, []);

	// Process image File objects to DataURLs
	const processImageFiles = useCallback(
		async (files: File[], source: "figma" | "upload" | "drop") => {
			const results: Array<{ url: string; title: string }> = [];

			for (let i = 0; i < files.length; i++) {
				const file = files[i];
				if (!file?.type.startsWith("image/")) continue;

				try {
					const dataUrl = await new Promise<string>((resolve, reject) => {
						const reader = new FileReader();
						reader.onload = (e) => resolve(e.target?.result as string);
						reader.onerror = reject;
						reader.readAsDataURL(file);
					});

					const cleanTitle = file.name
						? file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
						: `Screen ${screens.length + i + 1}`;

					results.push({ url: dataUrl, title: cleanTitle });
				} catch (err) {
					console.error("Failed to read image file", err);
				}
			}

			if (results.length > 0) {
				appendImages(results, source);
			}
		},
		[screens.length, appendImages],
	);

	// Global / Modal paste listener
	const handlePaste = useCallback(
		async (e: ClipboardEvent) => {
			if (!open) return;

			const clipboardData = e.clipboardData;
			if (!clipboardData) return;

			// 1. Check for image files in clipboardData.items or files
			const imageFiles: File[] = [];
			const items = clipboardData.items;

			if (items) {
				for (let i = 0; i < items.length; i++) {
					const item = items[i];
					if (item && item.type.indexOf("image") !== -1) {
						const blob = item.getAsFile();
						if (blob) {
							imageFiles.push(blob);
						}
					}
				}
			}

			if (imageFiles.length > 0) {
				e.preventDefault();
				await processImageFiles(imageFiles, "figma");
				return;
			}

			// 2. Check for HTML snippet (Figma multi-frame clipboard often uses HTML img elements)
			const html = clipboardData.getData("text/html");
			if (html) {
				const htmlImages = extractImagesFromHtml(html);
				if (htmlImages.length > 0) {
					e.preventDefault();
					appendImages(
						htmlImages.map((url, i) => ({
							url,
							title: `Figma Frame ${screens.length + i + 1}`,
						})),
						"figma",
					);
					return;
				}
			}

			// 3. Fallback: Check files property
			if (clipboardData.files && clipboardData.files.length > 0) {
				const directFiles = Array.from(clipboardData.files).filter((f) =>
					f.type.startsWith("image/"),
				);
				if (directFiles.length > 0) {
					e.preventDefault();
					await processImageFiles(directFiles, "figma");
				}
			}
		},
		[
			open,
			screens.length,
			appendImages,
			extractImagesFromHtml,
			processImageFiles,
		],
	);

	// Attach window-level paste event when modal is open
	useEffect(() => {
		if (!open) return;

		const onWindowPaste = (e: ClipboardEvent) => {
			handlePaste(e);
		};

		window.addEventListener("paste", onWindowPaste);
		return () => {
			window.removeEventListener("paste", onWindowPaste);
		};
	}, [open, handlePaste]);

	// File browser upload handler
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (!files || files.length === 0) return;
		processImageFiles(Array.from(files), "upload");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Drag & Drop handlers
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingOver(false);

		const files = e.dataTransfer.files;
		if (files && files.length > 0) {
			processImageFiles(Array.from(files), "drop");
		}
	};

	// Screen sequence operations
	const moveScreen = (index: number, direction: "left" | "right") => {
		const targetIdx = direction === "left" ? index - 1 : index + 1;
		if (targetIdx < 0 || targetIdx >= screens.length) return;

		setScreens((prev) => {
			const updated = [...prev];
			const [moved] = updated.splice(index, 1);
			if (moved) {
				updated.splice(targetIdx, 0, moved);
			}
			return updated.map((item, idx) => ({ ...item, orderIndex: idx }));
		});
	};

	const removeScreen = (id: string) => {
		setScreens((prev) =>
			prev
				.filter((s) => s.id !== id)
				.map((item, idx) => ({ ...item, orderIndex: idx })),
		);
	};

	const updateScreenTitle = (id: string, newTitle: string) => {
		setScreens((prev) =>
			prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s)),
		);
	};

	// Submit handler (Draft or Publish)
	const handleSubmit = (status: "draft" | "published") => {
		if (!name.trim()) {
			toast.error("Flow title required", {
				description: "Please enter a title for this flow.",
			});
			return;
		}

		if (screens.length === 0) {
			toast.error("At least one screen required", {
				description: "Paste from Figma or upload screens to build your flow.",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			const prod = products.find((p) => p.id === selectedProductId);
			const appName = prod ? prod.name : "Custom App";
			const appCategory = prod ? prod.category : "General";
			const appColor = prod ? prod.color : "#0075eb";

			const newFlow: UserCustomFlow = {
				id: `flow-${Date.now()}`,
				userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
				productId: selectedProductId || undefined,
				productName: prod?.name || appName,
				name: name.trim(),
				appName,
				appCategory,
				platform,
				description: `Sequence of ${screens.length} screens`,
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
					: "Draft flow saved!",
				{
					description:
						status === "published"
							? `"${newFlow.name}" with ${screens.length} screens is now live.`
							: `"${newFlow.name}" saved to your drafts.`,
				},
			);

			onFlowCreated?.(newFlow);

			// Reset
			setName("");
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
			<DialogPopup className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-3xl border border-neutral-200/90 bg-white p-6 shadow-2xl sm:p-7 dark:border-neutral-800 dark:bg-neutral-900">
				<div className="space-y-5">
					{/* Modal Header */}
					<DialogHeader className="border-neutral-100 border-b pb-3.5 dark:border-neutral-800">
						<div className="flex items-center gap-2">
							<div className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
								<Layers className="h-4 w-4" />
							</div>
							<div>
								<DialogTitle className="font-bold text-lg text-neutral-900 tracking-tight dark:text-white">
									Add flow
								</DialogTitle>
								<DialogDescription className="text-neutral-500 text-xs dark:text-neutral-400">
									Copy frames in Figma and paste here directly, or upload
									images.
								</DialogDescription>
							</div>
						</div>
					</DialogHeader>

					{/* Form Metadata Section */}
					<div className="space-y-3.5">
						{/* Flow Title Input */}
						<div>
							<label className="mb-1.5 block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Flow title <span className="text-red-500">*</span>
							</label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g. Identity Verification KYC, Onboarding, Checkout..."
								className="h-10 rounded-xl border-neutral-200 bg-neutral-50/80 px-3.5 text-neutral-900 text-xs focus-visible:ring-neutral-900 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-white dark:focus-visible:ring-white"
								autoFocus
							/>
						</div>

						{/* Product & Platform row */}
						<div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
							{/* Product selector */}
							<div>
								<div className="mb-1.5 flex items-center justify-between">
									<label className="block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
										Product
									</label>
									{onOpenCreateProduct && (
										<button
											type="button"
											onClick={() => {
												onOpenChange(false);
												onOpenCreateProduct();
											}}
											className="flex cursor-pointer items-center gap-1 font-semibold text-[11px] text-blue-600 hover:underline dark:text-blue-400"
										>
											<Plus className="h-3 w-3" />
											<span>New product</span>
										</button>
									)}
								</div>
								<select
									value={selectedProductId}
									onChange={(e) => setSelectedProductId(e.target.value)}
									className="w-full cursor-pointer rounded-xl border border-neutral-200/80 bg-neutral-50/80 px-3 py-2 text-neutral-900 text-xs focus:border-neutral-900 focus:bg-white focus:outline-none dark:border-neutral-800 dark:bg-neutral-800 dark:text-white dark:focus:border-neutral-400"
								>
									<option value="">Standalone / No Product</option>
									{products.map((p) => (
										<option key={p.id} value={p.id}>
											{p.name} ({p.category})
										</option>
									))}
								</select>
							</div>

							{/* Platform Selector */}
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
						</div>
					</div>

					{/* Image Ingestion Zone (Paste from Figma / Drop / Upload) */}
					<div>
						<div className="mb-1.5 flex items-center justify-between">
							<label className="block font-semibold text-neutral-800 text-xs dark:text-neutral-200">
								Screen sequence ({screens.length})
							</label>
							<div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
								<FigmaIcon className="h-3.5 w-3.5" />
								<span>Figma PNG paste supported</span>
							</div>
						</div>

						{/* Drop / Paste Trigger Area */}
						<button
							type="button"
							aria-label="Upload screens or paste from Figma"
							onDragOver={handleDragOver}
							onDragLeave={handleDragLeave}
							onDrop={handleDrop}
							onClick={() => fileInputRef.current?.click()}
							className={`group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
								isDraggingOver
									? "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-950/20"
									: "border-neutral-200/90 bg-neutral-50/50 hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-800/40 dark:hover:border-neutral-700"
							}`}
						>
							<input
								ref={fileInputRef}
								type="file"
								multiple
								accept="image/png, image/jpeg, image/webp"
								onChange={handleFileSelect}
								className="hidden"
							/>

							<div className="flex items-center gap-2">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-xs ring-1 ring-neutral-200 transition-transform group-hover:scale-105 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
									<Clipboard className="h-5 w-5" />
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-neutral-700 shadow-xs ring-1 ring-neutral-200 transition-transform group-hover:scale-105 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-700">
									<ImagePlus className="h-5 w-5" />
								</div>
							</div>

							<div className="mt-3">
								<p className="font-semibold text-neutral-800 text-xs dark:text-neutral-200">
									Paste frames with{" "}
									<kbd className="rounded bg-neutral-200/80 px-1.5 py-0.5 font-mono text-[11px] text-neutral-800 dark:bg-neutral-700 dark:text-neutral-200">
										⌘V
									</kbd>{" "}
									or click to browse files
								</p>
								<p className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400">
									Select one or more frames in Figma & Copy as PNG, then paste
									directly into this window.
								</p>
							</div>

							<div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 font-medium text-[10px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
								<span>
									💡 Tip: Select multiple Figma frames and copy all at once
								</span>
							</div>
						</button>

						{/* Screen Sequence Preview Gallery */}
						{screens.length > 0 && (
							<div className="mt-4 space-y-2">
								<div className="flex items-center justify-between text-[11px] text-neutral-500">
									<span>Reorder sequence or rename individual screens</span>
									<span>
										{screens.length}{" "}
										{screens.length === 1 ? "screen" : "screens"} total
									</span>
								</div>

								<div className="scrollbar-none flex gap-3 overflow-x-auto pt-1 pb-2">
									{screens.map((screen, idx) => (
										<div
											key={screen.id}
											className="group/item relative flex w-36 shrink-0 flex-col rounded-xl border border-neutral-200/90 bg-neutral-50 p-2 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800/80"
										>
											{/* Image Thumbnail */}
											<div
												className={`relative w-full overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-700 ${
													platform === "ios" ? "aspect-9/16" : "aspect-16/10"
												}`}
											>
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

												{/* Step Number Badge */}
												<span className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-neutral-950/80 font-mono text-[10px] text-white">
													{idx + 1}
												</span>

												{/* Delete Button */}
												<button
													type="button"
													onClick={(e) => {
														e.stopPropagation();
														removeScreen(screen.id);
													}}
													className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-white opacity-0 transition-opacity hover:bg-red-700 group-hover/item:opacity-100"
													aria-label="Remove screen"
												>
													<X className="h-3 w-3" />
												</button>

												{/* Reorder Left/Right overlay controls */}
												<div className="absolute inset-x-0 bottom-1 flex justify-between px-1 opacity-0 transition-opacity group-hover/item:opacity-100">
													<button
														type="button"
														disabled={idx === 0}
														onClick={(e) => {
															e.stopPropagation();
															moveScreen(idx, "left");
														}}
														className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/80 text-white hover:bg-neutral-900 disabled:pointer-events-none disabled:opacity-30"
														aria-label="Move left"
													>
														<ArrowLeft className="h-3 w-3" />
													</button>
													<button
														type="button"
														disabled={idx === screens.length - 1}
														onClick={(e) => {
															e.stopPropagation();
															moveScreen(idx, "right");
														}}
														className="flex h-5 w-5 items-center justify-center rounded-full bg-neutral-900/80 text-white hover:bg-neutral-900 disabled:pointer-events-none disabled:opacity-30"
														aria-label="Move right"
													>
														<ArrowRight className="h-3 w-3" />
													</button>
												</div>
											</div>

											{/* Editable Title */}
											<input
												type="text"
												value={screen.title}
												onChange={(e) =>
													updateScreenTitle(screen.id, e.target.value)
												}
												placeholder="Screen name"
												className="mt-1.5 w-full rounded border border-transparent bg-transparent px-1 py-0.5 font-medium text-[11px] text-neutral-800 hover:border-neutral-300 focus:border-neutral-400 focus:bg-white focus:outline-none dark:text-neutral-200 dark:focus:bg-neutral-900"
											/>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					{/* Modal Footer */}
					<div className="flex flex-col-reverse gap-2.5 border-neutral-100 border-t pt-4 sm:flex-row sm:items-center sm:justify-end dark:border-neutral-800">
						<Button
							type="button"
							variant="outline"
							onClick={() => onOpenChange(false)}
							disabled={isSubmitting}
							className="rounded-full text-xs"
						>
							Cancel
						</Button>

						<Button
							type="button"
							variant="outline"
							onClick={() => handleSubmit("draft")}
							disabled={isSubmitting || !name.trim() || screens.length === 0}
							className="rounded-full text-xs"
						>
							Save as Draft
						</Button>

						<Button
							type="button"
							onClick={() => handleSubmit("published")}
							disabled={isSubmitting || !name.trim() || screens.length === 0}
							className="rounded-full bg-neutral-950 text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
						>
							<UploadCloud className="mr-1.5 h-3.5 w-3.5" />
							<span>Publish Flow</span>
						</Button>
					</div>
				</div>
			</DialogPopup>
		</Dialog>
	);
}
