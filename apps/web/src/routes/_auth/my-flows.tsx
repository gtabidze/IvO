import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
	Layers,
	Package,
	PackagePlus,
	Plus,
	Sparkles,
	X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FlowDetailModal } from "@/components/dashboard/flow-detail-modal";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { ProfileMetadataModal } from "@/components/dashboard/profile-metadata-modal";
import { RequestContentModal } from "@/components/dashboard/request-content-modal";
import { FlowCard } from "@/components/flows/flow-card";
import { FlowCreatorModal } from "@/components/flows/flow-creator-modal";
import { ProductCard } from "@/components/flows/product-card";
import { ProductCreatorModal } from "@/components/flows/product-creator-modal";
import { usePro } from "@/context/pro-context";
import { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";
import { UserCustomFlow, UserProduct, flowStore } from "@/lib/flow-store";

export const Route = createFileRoute("/_auth/my-flows")({
	component: MyFlowsComponent,
});

type StatusFilter = "all" | "published" | "draft";
type PlatformFilter = "all" | "ios" | "web";
type ViewMode = "flows" | "products";

function MyFlowsComponent() {
	const navigate = useNavigate();
	const { isPro, setPro } = usePro();

	// Modal States
	const [creatorOpen, setCreatorOpen] = useState(false);
	const [productCreatorOpen, setProductCreatorOpen] = useState(false);
	const [creatorInitialProductId, setCreatorInitialProductId] = useState<string | undefined>();
	const [pricingOpen, setPricingOpen] = useState(false);
	const [requestContentOpen, setRequestContentOpen] = useState(false);
	const [profileMetadataOpen, setProfileMetadataOpen] = useState(false);
	const [previewFlow, setPreviewFlow] = useState<DashboardFlow | null>(null);

	// Navigation & Search States
	const [activeTab, setActiveTab] = useState<"apps" | "sites">("apps");
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
	const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
	const [selectedProductId, setSelectedProductId] = useState<string>("all");
	const [viewMode, setViewMode] = useState<ViewMode>("flows");

	// Flow and Product state
	const [flows, setFlows] = useState<UserCustomFlow[]>(() => flowStore.getFlows());
	const [products, setProducts] = useState<UserProduct[]>(() => flowStore.getProducts());

	useEffect(() => {
		const handleFlowsUpdate = () => {
			setFlows(flowStore.getFlows());
		};
		const handleProdsUpdate = () => {
			setProducts(flowStore.getProducts());
		};

		window.addEventListener("ivo_flows_updated", handleFlowsUpdate);
		window.addEventListener("ivo_products_updated", handleProdsUpdate);
		return () => {
			window.removeEventListener("ivo_flows_updated", handleFlowsUpdate);
			window.removeEventListener("ivo_products_updated", handleProdsUpdate);
		};
	}, []);

	// Flow action handlers
	const handleToggleStatus = (id: string) => {
		const newStatus = flowStore.toggleStatus(id);
		if (newStatus) {
			toast.success(
				newStatus === "published"
					? "Flow published to platform!"
					: "Flow moved to Drafts.",
			);
		}
	};

	const handleDeleteFlow = (id: string) => {
		flowStore.deleteFlow(id);
		toast.success("Flow deleted");
	};

	const handleDeleteProduct = (productId: string) => {
		flowStore.deleteProduct(productId);
		toast.success("Product and grouped flows deleted");
	};

	const handleAddFlowToProduct = (product: UserProduct) => {
		setCreatorInitialProductId(product.id);
		setCreatorOpen(true);
	};

	const handlePreviewFlow = (customFlow: UserCustomFlow) => {
		const adaptedScreens: FlowScreen[] = customFlow.screens.map((s, idx) => ({
			id: s.id,
			title: s.title,
			subtitle: s.subtitle,
			screenType:
				(s.screenType as FlowScreen["screenType"]) || "generic-wireframe",
			wireframeDetails: {
				headlineText: s.title,
				subText: s.subtitle || `${customFlow.appName} • Step ${idx + 1}`,
				buttonText: "Continue",
			},
		}));

		const adapted: DashboardFlow = {
			id: customFlow.id,
			flowType: "onboarding",
			flowLabel: customFlow.name,
			flowName: `${customFlow.name} in ${customFlow.appName}`,
			app: customFlow.appName,
			appCategory:
				(customFlow.appCategory as DashboardFlow["appCategory"]) || "Banking",
			screensCount: customFlow.screens.length,
			platform: customFlow.platform,
			appColor: customFlow.appColor,
			appLogoText: customFlow.appName.charAt(0),
			timeOnTask: "1m 15s",
			taskSuccessRate: "99.1%",
			seqScore: "6.8 / 7",
			seqRating: "Seamless Flow",
			usabilityIssues: [],
			initialComments: [],
			screens: adaptedScreens,
		};

		setPreviewFlow(adapted);
	};

	// Filtered flows
	const filteredFlows = useMemo(() => {
		return flows.filter((f) => {
			if (selectedProductId !== "all" && f.productId !== selectedProductId) {
				return false;
			}
			if (statusFilter !== "all" && f.status !== statusFilter) return false;
			if (platformFilter !== "all" && f.platform !== platformFilter) return false;
			if (searchQuery.trim()) {
				const q = searchQuery.toLowerCase();
				const matchName = f.name.toLowerCase().includes(q);
				const matchApp = f.appName.toLowerCase().includes(q);
				const matchCat = f.appCategory.toLowerCase().includes(q);
				const matchProd = (f.productName || "").toLowerCase().includes(q);
				if (!matchName && !matchApp && !matchCat && !matchProd) return false;
			}
			return true;
		});
	}, [flows, selectedProductId, statusFilter, platformFilter, searchQuery]);

	const publishedCount = flows.filter((f) => f.status === "published").length;
	const draftCount = flows.filter((f) => f.status === "draft").length;
	const activeProduct = products.find((p) => p.id === selectedProductId);

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900 selection:bg-blue-600 selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
			{/* Header */}
			<DashboardHeader
				activeTab={activeTab}
				onTabChange={setActiveTab}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onOpenPricing={() => setPricingOpen(true)}
				onOpenRequestContent={() => setRequestContentOpen(true)}
				onOpenProfileMetadata={() => setProfileMetadataOpen(true)}
			/>

			{/* Main Container */}
			<main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
				{/* Non-Pro Paywall Gate */}
				{!isPro ? (
					<div className="mx-auto mt-12 max-w-lg rounded-3xl border border-neutral-200/80 bg-white p-8 text-center shadow-lg dark:border-neutral-800 dark:bg-neutral-900">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white shadow-md dark:bg-white dark:text-neutral-900">
							<Sparkles className="h-6 w-6 fill-current" />
						</div>
						<h2 className="mt-4 font-bold text-neutral-900 text-xl tracking-tight dark:text-white">
							Pro Membership Required
						</h2>
						<p className="mt-2 text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
							"My Flows" is exclusively available to Pro members. Create products,
							upload custom screen sequences, and publish teardowns for UX
							observability.
						</p>

						<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
							<button
								type="button"
								onClick={() => setPro(true)}
								className="w-full cursor-pointer rounded-full bg-neutral-950 px-5 py-2.5 font-semibold text-white text-xs shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.97] sm:w-auto dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								Switch to Pro (Admin Test)
							</button>
							<button
								type="button"
								onClick={() => navigate({ to: "/dashboard" })}
								className="w-full cursor-pointer rounded-full border border-neutral-200 px-5 py-2.5 font-semibold text-neutral-700 text-xs hover:bg-neutral-100 sm:w-auto dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
							>
								Back to Dashboard
							</button>
						</div>
					</div>
				) : (
					<>
						{/* Page Title & Dual Action Cluster */}
						<div className="flex flex-col gap-4 pb-6 sm:flex-row sm:items-center sm:justify-between">
							<div>
								<div className="flex items-center gap-2.5">
									<h1 className="font-extrabold text-3xl text-neutral-950 tracking-tight sm:text-4xl dark:text-white">
										My Flows
									</h1>
									<span className="rounded-full bg-neutral-200/70 px-2.5 py-0.5 font-bold text-neutral-800 text-xs dark:bg-neutral-800 dark:text-neutral-200">
										{flows.length}
									</span>
								</div>
								<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
									Group teardowns under products, upload screen sequences, and
									publish to the platform.
								</p>
							</div>

							<div className="flex items-center gap-2.5">
								{/* Create Product Button */}
								<button
									type="button"
									onClick={() => setProductCreatorOpen(true)}
									className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2.5 font-semibold text-neutral-800 text-xs shadow-xs transition-all hover:bg-neutral-50 active:scale-[0.97] dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
								>
									<PackagePlus className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
									<span>New Product</span>
								</button>

								{/* Create Flow Button */}
								<button
									type="button"
									onClick={() => {
										setCreatorInitialProductId(undefined);
										setCreatorOpen(true);
									}}
									className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-neutral-950 px-5 py-2.5 font-semibold text-white text-xs shadow-md transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
								>
									<Plus className="h-4 w-4" />
									<span>Create flow</span>
								</button>
							</div>
						</div>

						{/* Top Control Bar: View Switcher (Flows vs Products) & Status / Platforms */}
						<div className="space-y-3.5 border-neutral-200/70 border-b pb-5 dark:border-neutral-800">
							<div className="flex flex-wrap items-center justify-between gap-3">
								{/* View Mode Switcher: By Flows vs By Products */}
								<div className="flex items-center gap-1 rounded-full bg-neutral-200/70 p-1 dark:bg-neutral-800 ring-1 ring-neutral-300/60 dark:ring-neutral-700/60">
									<button
										type="button"
										onClick={() => setViewMode("flows")}
										className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-semibold text-xs transition-all cursor-pointer ${
											viewMode === "flows"
												? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white"
												: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
										}`}
									>
										<Layers className="h-3.5 w-3.5" />
										<span>Flows ({flows.length})</span>
									</button>
									<button
										type="button"
										onClick={() => setViewMode("products")}
										className={`flex items-center gap-1.5 rounded-full px-3.5 py-1 font-semibold text-xs transition-all cursor-pointer ${
											viewMode === "products"
												? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-900 dark:text-white"
												: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
										}`}
									>
										<Package className="h-3.5 w-3.5" />
										<span>Products ({products.length})</span>
									</button>
								</div>

								{/* Status Filters (Only applicable in Flows view) */}
								{viewMode === "flows" && (
									<div className="flex items-center gap-1.5 rounded-full bg-neutral-100 p-1 ring-1 ring-neutral-200/80 dark:bg-neutral-900 dark:ring-neutral-800">
										<button
											type="button"
											onClick={() => setStatusFilter("all")}
											className={`rounded-full px-3.5 py-1 font-medium text-xs transition-all cursor-pointer ${
												statusFilter === "all"
													? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
													: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
											}`}
										>
											All ({flows.length})
										</button>
										<button
											type="button"
											onClick={() => setStatusFilter("published")}
											className={`rounded-full px-3.5 py-1 font-medium text-xs transition-all cursor-pointer ${
												statusFilter === "published"
													? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
													: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
											}`}
										>
											Published ({publishedCount})
										</button>
										<button
											type="button"
											onClick={() => setStatusFilter("draft")}
											className={`rounded-full px-3.5 py-1 font-medium text-xs transition-all cursor-pointer ${
												statusFilter === "draft"
													? "bg-white text-neutral-950 shadow-xs dark:bg-neutral-800 dark:text-white"
													: "text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white"
											}`}
										>
											Drafts ({draftCount})
										</button>
									</div>
								)}

								{/* Platform Filter */}
								<div className="flex items-center gap-1.5 text-neutral-500 text-xs">
									<button
										type="button"
										onClick={() => setPlatformFilter("all")}
										className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
											platformFilter === "all"
												? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-800 dark:text-white"
												: "hover:text-neutral-900 dark:hover:text-white"
										}`}
									>
										All Platforms
									</button>
									<button
										type="button"
										onClick={() => setPlatformFilter("ios")}
										className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
											platformFilter === "ios"
												? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-800 dark:text-white"
												: "hover:text-neutral-900 dark:hover:text-white"
										}`}
									>
										Mobile (iOS)
									</button>
									<button
										type="button"
										onClick={() => setPlatformFilter("web")}
										className={`cursor-pointer rounded-lg px-2.5 py-1 font-medium transition-colors ${
											platformFilter === "web"
												? "bg-neutral-200/80 text-neutral-900 dark:bg-neutral-800 dark:text-white"
												: "hover:text-neutral-900 dark:hover:text-white"
										}`}
									>
										Web
									</button>
								</div>
							</div>

							{/* Product Filter Pills Row (When in Flows View) */}
							{viewMode === "flows" && (
								<div className="flex flex-wrap items-center gap-2 pt-1">
									<span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider select-none pr-1">
										Product:
									</span>

									<button
										type="button"
										onClick={() => setSelectedProductId("all")}
										className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
											selectedProductId === "all"
												? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
												: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
										}`}
									>
										<span>All Products</span>
										<span className="text-[10px] opacity-70">({flows.length})</span>
									</button>

									{products.map((p) => {
										const count = flows.filter((f) => f.productId === p.id).length;
										const isSelected = selectedProductId === p.id;
										return (
											<button
												key={p.id}
												type="button"
												onClick={() => setSelectedProductId(p.id)}
												className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${
													isSelected
														? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
														: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/80 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
												}`}
											>
												<span
													style={{ backgroundColor: p.color || "#0075eb" }}
													className="h-2 w-2 rounded-full shrink-0"
												/>
												<span>{p.name}</span>
												<span className="text-[10px] opacity-70">({count})</span>
											</button>
										);
									})}

									{/* Inline Clear Filter if product active */}
									{selectedProductId !== "all" && (
										<button
											type="button"
											onClick={() => setSelectedProductId("all")}
											className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer ml-1"
										>
											<X className="h-3 w-3" />
											<span>Reset filter</span>
										</button>
									)}
								</div>
							)}
						</div>

						{/* Content Area Based on View Mode */}
						{viewMode === "products" ? (
							/* Products Mode View */
							<div className="mt-6">
								{products.length === 0 ? (
									<div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
										<div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 mb-4 shadow-xs">
											<Package className="h-7 w-7" />
										</div>
										<h3 className="font-bold text-lg text-neutral-950 dark:text-white tracking-tight">
											No products created yet
										</h3>
										<p className="mt-1.5 max-w-xs text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
											Create a product like "Revolut", "Wise", or "Stripe" to neatly
											organize flows under.
										</p>
										<button
											type="button"
											onClick={() => setProductCreatorOpen(true)}
											className="mt-5 rounded-full bg-neutral-950 px-5 py-2 text-xs font-semibold text-white shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 cursor-pointer"
										>
											Create product
										</button>
									</div>
								) : (
									<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
										{products.map((product) => {
											const prodsFlows = flows.filter(
												(f) => f.productId === product.id,
											);
											const screensTotal = prodsFlows.reduce(
												(acc, f) => acc + (f.screens?.length || f.screensCount || 0),
												0,
											);
											return (
												<ProductCard
													key={product.id}
													product={product}
													flowsCount={prodsFlows.length}
													screensCount={screensTotal}
													onSelectProduct={(pId) => {
														setSelectedProductId(pId);
														setViewMode("flows");
													}}
													onAddFlowToProduct={handleAddFlowToProduct}
													onDeleteProduct={handleDeleteProduct}
												/>
											);
										})}
									</div>
								)}
							</div>
						) : (
							/* Flows Mode View */
							<div className="mt-6">
								{/* Active Product Filter Pill Banner */}
								{activeProduct && (
									<div className="mb-5 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white px-4 py-2.5 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900">
										<div className="flex items-center gap-2.5">
											<div
												style={{ backgroundColor: activeProduct.color }}
												className="flex h-6 w-6 items-center justify-center rounded-md font-bold font-mono text-[11px] text-white"
											>
												{activeProduct.name.charAt(0)}
											</div>
											<div>
												<span className="font-semibold text-xs text-neutral-900 dark:text-white">
													Showing flows in {activeProduct.name}
												</span>
												<span className="ml-2 text-[11px] text-neutral-400">
													({filteredFlows.length}{" "}
													{filteredFlows.length === 1 ? "flow" : "flows"})
												</span>
											</div>
										</div>

										<div className="flex items-center gap-2">
											<button
												type="button"
												onClick={() => handleAddFlowToProduct(activeProduct)}
												className="inline-flex items-center gap-1 rounded-full bg-neutral-950 px-3 py-1 font-semibold text-white text-xs hover:bg-neutral-800 active:scale-[0.96] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 cursor-pointer"
											>
												<Plus className="h-3 w-3" />
												<span>Add flow to {activeProduct.name}</span>
											</button>
											<button
												type="button"
												onClick={() => setSelectedProductId("all")}
												className="rounded-full p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
												aria-label="Clear product filter"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									</div>
								)}

								{filteredFlows.length === 0 ? (
									/* Empty State (matching Screenshot 1) */
									<div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
										{/* Stacked Cards Silhouette Graphic */}
										<div className="relative mb-6 flex h-36 w-36 items-center justify-center">
											<div className="-left-2 -rotate-15 absolute top-3 h-28 w-20 rounded-2xl border border-neutral-200/90 bg-neutral-100/90 shadow-xs dark:border-neutral-800 dark:bg-neutral-800" />
											<div className="-right-2 absolute top-3 h-28 w-20 rotate-15 rounded-2xl border border-neutral-200/90 bg-neutral-100/90 shadow-xs dark:border-neutral-800 dark:bg-neutral-800" />
											<div className="relative flex h-32 w-22 flex-col items-center justify-between rounded-2xl border border-neutral-300 bg-white p-2.5 shadow-md dark:border-neutral-700 dark:bg-neutral-900">
												<div className="h-3 w-3 rounded-full bg-neutral-200 dark:bg-neutral-700" />
												<div className="flex w-full flex-col items-center gap-1">
													<div className="h-1.5 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700" />
													<div className="h-1.5 w-6 rounded-full bg-neutral-200 dark:bg-neutral-700" />
												</div>
												<div className="h-1 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800" />
											</div>
										</div>

										<h3 className="font-bold text-lg text-neutral-950 tracking-tight dark:text-white">
											{activeProduct
												? `No flows in ${activeProduct.name} yet`
												: "Gather your inspiration"}
										</h3>
										<p className="mt-1.5 max-w-xs text-neutral-500 text-xs leading-relaxed dark:text-neutral-400">
											{activeProduct
												? `Start uploading flows and screen sequences for ${activeProduct.name}.`
												: "Start saving anything you find interesting, upload screen sequences, and neatly organize them under products."}
										</p>
										<button
											type="button"
											onClick={() => {
												setCreatorInitialProductId(
													activeProduct ? activeProduct.id : undefined,
												);
												setCreatorOpen(true);
											}}
											className="mt-5 cursor-pointer rounded-full bg-neutral-950 px-5 py-2 font-semibold text-white text-xs shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.97] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
										>
											Create flow
										</button>
									</div>
								) : (
									/* Grid of Flows (matching Screenshot 3) */
									<div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
										{filteredFlows.map((flow) => (
											<FlowCard
												key={flow.id}
												flow={flow}
												onToggleStatus={handleToggleStatus}
												onDelete={handleDeleteFlow}
												onPreview={handlePreviewFlow}
											/>
										))}
									</div>
								)}
							</div>
						)}
					</>
				)}
			</main>

			{/* Flow Creator Modal */}
			<FlowCreatorModal
				open={creatorOpen}
				onOpenChange={setCreatorOpen}
				initialProductId={creatorInitialProductId}
				onOpenCreateProduct={() => setProductCreatorOpen(true)}
				onFlowCreated={() => setFlows(flowStore.getFlows())}
			/>

			{/* Product Creator Modal */}
			<ProductCreatorModal
				open={productCreatorOpen}
				onOpenChange={setProductCreatorOpen}
				onProductCreated={(prod) => {
					setProducts(flowStore.getProducts());
					setSelectedProductId(prod.id);
					setViewMode("flows");
				}}
			/>

			{/* Flow Preview Modal */}
			<FlowDetailModal
				flow={previewFlow}
				initialScreenIndex={0}
				open={!!previewFlow}
				onClose={() => setPreviewFlow(null)}
				onOpenPricing={() => {
					setPreviewFlow(null);
					setPricingOpen(true);
				}}
			/>

			{/* Additional Utility Modals */}
			<PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
			<RequestContentModal
				open={requestContentOpen}
				onOpenChange={setRequestContentOpen}
			/>
			<ProfileMetadataModal
				open={profileMetadataOpen}
				onOpenChange={setProfileMetadataOpen}
				initialRole="Product Designer"
				initialOrg="IvO Labs"
			/>
		</div>
	);
}
