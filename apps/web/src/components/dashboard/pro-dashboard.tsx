import { useEffect, useMemo, useState } from "react";
import { FlowCreatorModal } from "@/components/flows/flow-creator-modal";
import { ProductCreatorModal } from "@/components/flows/product-creator-modal";
import { DASHBOARD_FLOWS, type DashboardFlow } from "@/data/dashboard-flows";
import { buildFeed, type FeedItem } from "@/lib/feed";
import { flowStore } from "@/lib/flow-store";
import { FeedSection } from "./feed-section";
import { FlowDetailModal } from "./flow-detail-modal";
import { MyFlowsSection } from "./my-flows-section";

type SidebarTab = "details" | "ai" | "usability" | "comments";

export function ProDashboard({
	userName,
	searchQuery,
	onOpenPricing,
}: {
	userName: string;
	searchQuery: string;
	onOpenPricing: () => void;
}) {
	const [flows, setFlows] = useState(() => flowStore.getFlows());
	const [products, setProducts] = useState(() => flowStore.getProducts());
	const [creatorOpen, setCreatorOpen] = useState(false);
	const [creatorProductId, setCreatorProductId] = useState<
		string | undefined
	>();
	const [productCreatorOpen, setProductCreatorOpen] = useState(false);
	const [open, setOpen] = useState<{
		flow: DashboardFlow;
		screenIndex: number;
		tab?: SidebarTab;
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

	const q = searchQuery.trim().toLowerCase();

	const myFlows = useMemo(
		() =>
			q
				? flows.filter((f) =>
						`${f.name} ${f.appName} ${f.productName ?? ""}`
							.toLowerCase()
							.includes(q),
					)
				: flows,
		[flows, q],
	);

	const feed = useMemo(() => {
		const all = buildFeed(DASHBOARD_FLOWS, flows, { name: userName });
		return q
			? all.filter((i) =>
					`${i.flow.flowName} ${i.project} ${i.creator.name}`
						.toLowerCase()
						.includes(q),
				)
			: all;
	}, [flows, userName, q]);

	const openFeed = (item: FeedItem, screenIndex: number, tab?: SidebarTab) =>
		setOpen({ flow: item.flow, screenIndex, tab });

	return (
		<>
			<MyFlowsSection
				flows={myFlows}
				products={products}
				onCreate={() => {
					setCreatorProductId(undefined);
					setCreatorOpen(true);
				}}
				onCreateProduct={() => setProductCreatorOpen(true)}
			/>

			<FeedSection items={feed} onOpen={openFeed} />

			<FlowCreatorModal
				open={creatorOpen}
				onOpenChange={setCreatorOpen}
				initialProductId={creatorProductId}
				onOpenCreateProduct={() => setProductCreatorOpen(true)}
				onFlowCreated={() => setFlows(flowStore.getFlows())}
			/>
			<ProductCreatorModal
				open={productCreatorOpen}
				onOpenChange={setProductCreatorOpen}
				onProductCreated={() => setProducts(flowStore.getProducts())}
			/>
			<FlowDetailModal
				flow={open?.flow ?? null}
				initialScreenIndex={open?.screenIndex ?? 0}
				initialSidebarTab={open?.tab}
				open={!!open}
				onClose={() => setOpen(null)}
				onOpenPricing={() => {
					setOpen(null);
					onOpenPricing();
				}}
			/>
		</>
	);
}
