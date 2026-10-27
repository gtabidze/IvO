import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { FlowDetailModal } from "@/components/dashboard/flow-detail-modal";
import { FlowStripList } from "@/components/dashboard/flow-strip-list";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { ProfileMetadataModal } from "@/components/dashboard/profile-metadata-modal";
import { RequestContentModal } from "@/components/dashboard/request-content-modal";
import { FlowCreatorModal } from "@/components/flows/flow-creator-modal";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { flowStore } from "@/lib/flow-store";

export const Route = createFileRoute("/_auth/products/$productId")({
	component: ProductPage,
});

function ProductPage() {
	const { productId } = Route.useParams();
	const [flows, setFlows] = useState(() => flowStore.getFlows());
	const [products, setProducts] = useState(() => flowStore.getProducts());
	const [searchQuery, setSearchQuery] = useState("");
	const [creatorOpen, setCreatorOpen] = useState(false);
	const [pricingOpen, setPricingOpen] = useState(false);
	const [requestContentOpen, setRequestContentOpen] = useState(false);
	const [profileMetadataOpen, setProfileMetadataOpen] = useState(false);
	const [open, setOpen] = useState<{
		flow: DashboardFlow;
		screenIndex: number;
	} | null>(null);

	useEffect(() => {
		const onFlows = () => setFlows(flowStore.getFlows());
		const onProducts = () => setProducts(flowStore.getProducts());
		window.addEventListener("ivo_flows_updated", onFlows);
		window.addEventListener("ivo_products_updated", onProducts);
		return () => {
			window.removeEventListener("ivo_flows_updated", onFlows);
			window.removeEventListener("ivo_products_updated", onProducts);
		};
	}, []);

	const product = products.find((p) => p.id === productId);
	const q = searchQuery.trim().toLowerCase();
	const productFlows = useMemo(
		() =>
			flows
				.filter(
					(f) =>
						f.productId === productId ||
						(!f.productId &&
							product &&
							f.appName?.toLowerCase() === product.name.toLowerCase()),
				)
				.filter((f) => !q || f.name.toLowerCase().includes(q)),
		[flows, productId, product, q],
	);
	const screensCount = productFlows.reduce((n, f) => n + f.screens.length, 0);

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
			<DashboardHeader
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onOpenPricing={() => setPricingOpen(true)}
				onOpenRequestContent={() => setCreatorOpen(true)}
				onOpenProfileMetadata={() => setProfileMetadataOpen(true)}
			/>

			<main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-10 pb-20 sm:px-6 lg:px-8">
				<Link
					to="/dashboard"
					className="inline-flex items-center gap-2 font-semibold text-neutral-500 text-xs transition-colors hover:text-neutral-950 dark:hover:text-white"
				>
					<ArrowLeft className="h-4 w-4" /> Back to Dashboard
				</Link>

				{!product ? (
					<div className="py-24 text-center">
						<p className="font-semibold text-base">Product not found</p>
						<p className="mt-1 text-neutral-500 text-xs">
							It may have been deleted.
						</p>
					</div>
				) : (
					<>
						<div className="mt-6 mb-10 flex flex-wrap items-center justify-between gap-6">
							<div className="flex items-center gap-5">
								<span
									className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] font-bold text-2xl text-white shadow-sm"
									style={{ backgroundColor: product.color }}
								>
									{product.name.charAt(0).toUpperCase()}
								</span>
								<div>
									<h1 className="font-extrabold text-3xl text-neutral-950 tracking-tight dark:text-white">
										{product.name}
									</h1>
									<div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
										<span className="rounded-full border border-neutral-200/80 bg-white px-2.5 py-0.5 font-semibold text-neutral-700 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
											{product.category}
										</span>
										<span className="text-neutral-400">·</span>
										<span className="font-medium text-neutral-500">
											{productFlows.length}{" "}
											{productFlows.length === 1 ? "flow" : "flows"}
										</span>
										<span className="text-neutral-400">·</span>
										<span className="font-medium text-neutral-500">
											{screensCount} screens
										</span>
									</div>
									{product.description && (
										<p className="mt-2 max-w-xl text-neutral-600 text-xs leading-relaxed dark:text-neutral-400">
											{product.description}
										</p>
									)}
								</div>
							</div>
							<button
								type="button"
								onClick={() => setCreatorOpen(true)}
								className="flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 font-semibold text-white text-xs shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.96] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								<Plus className="h-4 w-4" /> Add flow
							</button>
						</div>

						<div>
							{productFlows.length === 0 ? (
								<div className="flex flex-col items-center justify-center rounded-[2rem] border-2 border-neutral-200 border-dashed py-16 text-center dark:border-neutral-800">
									<p className="font-semibold text-neutral-700 text-sm dark:text-neutral-300">
										No flows in this product yet
									</p>
									<p className="mt-1 text-neutral-400 text-xs">
										Create your first flow to begin benchmarking.
									</p>
									<button
										type="button"
										onClick={() => setCreatorOpen(true)}
										className="mt-4 flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-950 px-4 py-2 font-semibold text-white text-xs dark:bg-white dark:text-neutral-950"
									>
										<Plus className="h-3.5 w-3.5" /> Create flow
									</button>
								</div>
							) : (
								<FlowStripList
									flows={productFlows}
									onOpenFlow={(flow, screenIndex) =>
										setOpen({ flow, screenIndex })
									}
								/>
							)}
						</div>
					</>
				)}
			</main>

			<FlowCreatorModal
				open={creatorOpen}
				onOpenChange={setCreatorOpen}
				initialProductId={productId}
				onFlowCreated={() => setFlows(flowStore.getFlows())}
			/>
			<FlowDetailModal
				flow={open?.flow ?? null}
				initialScreenIndex={open?.screenIndex ?? 0}
				open={!!open}
				onClose={() => setOpen(null)}
				onOpenPricing={() => {
					setOpen(null);
					setPricingOpen(true);
				}}
			/>
			<PricingModal open={pricingOpen} onOpenChange={setPricingOpen} />
			<RequestContentModal
				open={requestContentOpen}
				onOpenChange={setRequestContentOpen}
			/>
			<ProfileMetadataModal
				open={profileMetadataOpen}
				onOpenChange={setProfileMetadataOpen}
				initialRole="Product Designer"
				initialOrg="Alignment Labs"
			/>
		</div>
	);
}
