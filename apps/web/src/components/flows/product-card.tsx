import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import {
	Globe,
	Layers,
	MoreVertical,
	Plus,
	Smartphone,
	Trash2,
} from "lucide-react";
import type { UserProduct } from "@/lib/flow-store";

interface ProductCardProps {
	product: UserProduct;
	flowsCount: number;
	screensCount: number;
	onSelectProduct: (productId: string) => void;
	onAddFlowToProduct: (product: UserProduct) => void;
	onDeleteProduct: (productId: string) => void;
}

export function ProductCard({
	product,
	flowsCount,
	screensCount,
	onSelectProduct,
	onAddFlowToProduct,
	onDeleteProduct,
}: ProductCardProps) {
	return (
		<div className="group relative flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-all duration-200 hover:border-neutral-300 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700">
			{/* Top Header */}
			<div>
				<div className="flex items-start justify-between gap-3">
					<div className="flex items-center gap-3">
						{/* Product Logo / Color Square */}
						<div
							style={{ backgroundColor: product.color || "#0075eb" }}
							className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-bold font-mono text-base text-white shadow-xs"
						>
							{product.name.charAt(0).toUpperCase()}
						</div>

						<div className="min-w-0 flex-1">
							<button
								type="button"
								onClick={() => onSelectProduct(product.id)}
								className="block cursor-pointer truncate text-left font-bold text-neutral-950 text-sm transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400"
							>
								{product.name}
							</button>
							<div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
								<span>{product.category}</span>
								<span>•</span>
								<span className="flex items-center gap-0.5">
									{product.platform === "ios" ? (
										<Smartphone className="h-3 w-3" />
									) : (
										<Globe className="h-3 w-3" />
									)}
									<span>{product.platform === "ios" ? "iOS" : "Web"}</span>
								</span>
							</div>
						</div>
					</div>

					{/* Options Dropdown */}
					<DropdownMenu>
						<DropdownMenuTrigger
							render={
								<button
									type="button"
									className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
									aria-label="Product options"
								>
									<MoreVertical className="h-4 w-4" />
								</button>
							}
						/>
						<DropdownMenuContent
							align="end"
							className="w-40 rounded-xl border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-800 dark:bg-neutral-900"
						>
							<DropdownMenuItem
								onClick={() => onDeleteProduct(product.id)}
								className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-1.5 font-medium text-red-600 text-xs hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
							>
								<Trash2 className="h-3.5 w-3.5 text-red-600" />
								<span>Delete product</span>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>

				{/* Description */}
				{product.description && (
					<p className="mt-3 line-clamp-2 text-neutral-600 text-xs leading-relaxed dark:text-neutral-300">
						{product.description}
					</p>
				)}
			</div>

			{/* Footer Stats & Actions */}
			<div className="mt-5 flex items-center justify-between border-neutral-100 border-t pt-3.5 dark:border-neutral-800">
				<div className="flex items-center gap-1.5 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
					<Layers className="h-3.5 w-3.5 text-neutral-400" />
					<span>
						{flowsCount} {flowsCount === 1 ? "flow" : "flows"}
					</span>
					<span>•</span>
					<span>{screensCount} screens</span>
				</div>

				<div className="flex items-center gap-1.5">
					<button
						type="button"
						onClick={() => onSelectProduct(product.id)}
						className="cursor-pointer rounded-full px-2.5 py-1 font-medium text-neutral-700 text-xs hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
					>
						View
					</button>

					<button
						type="button"
						onClick={() => onAddFlowToProduct(product)}
						className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 font-semibold text-white text-xs shadow-2xs hover:bg-neutral-800 active:scale-[0.96] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						<Plus className="h-3 w-3" />
						<span>Add flow</span>
					</button>
				</div>
			</div>
		</div>
	);
}
