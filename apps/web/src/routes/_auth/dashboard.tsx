import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import {
	DashboardToolbar,
	type FlowFilterType,
	type PlatformType,
} from "@/components/dashboard/dashboard-toolbar";
import { FlowDetailModal } from "@/components/dashboard/flow-detail-modal";
import { FlowRow } from "@/components/dashboard/flow-row";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { ProfileMetadataModal } from "@/components/dashboard/profile-metadata-modal";
import { RequestContentModal } from "@/components/dashboard/request-content-modal";
import { SellingPointBanner } from "@/components/dashboard/selling-point-banner";
import { usePro } from "@/context/pro-context";
import {
	DASHBOARD_FLOWS,
	type DashboardFlow,
	type FlowScreen,
} from "@/data/dashboard-flows";
import { flowStore } from "@/lib/flow-store";

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const { session } = Route.useRouteContext();
	const navigate = useNavigate();
	const { isPro } = usePro();

	// Custom user published flows
	const [customFlows, setCustomFlows] = useState(() => flowStore.getFlows());

	useEffect(() => {
		const handleUpdate = () => {
			setCustomFlows(flowStore.getFlows());
		};
		window.addEventListener("ivo_flows_updated", handleUpdate);
		return () => {
			window.removeEventListener("ivo_flows_updated", handleUpdate);
		};
	}, []);

	// Modal States
	const [pricingOpen, setPricingOpen] = useState(false);
	const [requestContentOpen, setRequestContentOpen] = useState(false);
	const [profileMetadataOpen, setProfileMetadataOpen] = useState(false);
	const [selectedFlowModal, setSelectedFlowModal] =
		useState<DashboardFlow | null>(null);
	const [modalScreenIndex, setModalScreenIndex] = useState(0);

	// Navigation & Filter States
	const [activeTab, setActiveTab] = useState<"apps" | "sites">("apps");
	const [searchQuery, setSearchQuery] = useState("");
	const [platform, setPlatform] = useState<PlatformType>("ios");
	const [selectedCategory, setSelectedCategory] = useState("All Categories");
	const [selectedFlow, setSelectedFlow] = useState<FlowFilterType>("all");
	const [sortBy, setSortBy] = useState<"popular" | "latest" | "rated">(
		"popular",
	);

	// Sync Apps / Sites header tab with Platform toolbar switcher
	const handleHeaderTabChange = (tab: "apps" | "sites") => {
		setActiveTab(tab);
		setPlatform(tab === "apps" ? "ios" : "web");
	};

	const handlePlatformChange = (newPlatform: PlatformType) => {
		setPlatform(newPlatform);
		setActiveTab(newPlatform === "ios" ? "apps" : "sites");
	};

	// Adapt user custom published flows into DashboardFlow format
	const adaptedPublishedFlows: DashboardFlow[] = useMemo(() => {
		return customFlows
			.filter((cf) => cf.status === "published")
			.map((cf) => ({
				id: cf.id,
				flowType: "onboarding" as const,
				flowLabel: cf.name,
				flowName: `${cf.name} in ${cf.appName}`,
				app: cf.appName,
				appCategory:
					(cf.appCategory as DashboardFlow["appCategory"]) || "Banking",
				screensCount: cf.screens.length,
				platform: cf.platform,
				appColor: cf.appColor,
				appLogoText: cf.appName.charAt(0).toUpperCase(),
				isLocked: false,
				timeOnTask: "1m 30s",
				taskSuccessRate: "98.5%",
				seqScore: "6.7 / 7",
				seqRating: "Community Flow (Published)",
				usabilityIssues: [],
				initialComments: [],
				screens: cf.screens.map((s, idx) => ({
					id: s.id,
					title: s.title,
					subtitle: s.subtitle,
					screenType:
						(s.screenType as FlowScreen["screenType"]) || "generic-wireframe",
					wireframeDetails: {
						headlineText: s.title,
						subText: s.subtitle || `${cf.appName} Screen ${idx + 1}`,
						buttonText: "Continue",
					},
				})),
			}));
	}, [customFlows]);

	// Merge with DASHBOARD_FLOWS and respect Pro unlocked status
	const allDashboardFlows = useMemo(() => {
		const flows = [...adaptedPublishedFlows, ...DASHBOARD_FLOWS];
		if (isPro) {
			return flows.map((f) => ({ ...f, isLocked: false }));
		}
		return flows;
	}, [adaptedPublishedFlows, isPro]);

	// Filter flows according to active criteria
	const filteredFlows = useMemo(() => {
		return allDashboardFlows.filter((flow) => {
			// Platform match
			if (flow.platform !== platform && platform !== "ios") {
				// Allow demo display across modes
			}

			// Category match
			if (
				selectedCategory !== "All Categories" &&
				flow.appCategory !== selectedCategory
			) {
				return false;
			}

			// Flow type match
			if (selectedFlow !== "all" && flow.flowType !== selectedFlow) {
				return false;
			}

			// Search query match (search app name or flow label)
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const matchesApp = flow.app.toLowerCase().includes(query);
				const matchesFlow = flow.flowLabel.toLowerCase().includes(query);
				const matchesCategory = flow.appCategory.toLowerCase().includes(query);
				if (!matchesApp && !matchesFlow && !matchesCategory) {
					return false;
				}
			}

			return true;
		});
	}, [
		allDashboardFlows,
		platform,
		selectedCategory,
		selectedFlow,
		searchQuery,
	]);

	// Split flows: if Pro, all flows are primary without paywalling; if Free, first 2 are free
	const primaryFlows = isPro ? filteredFlows : filteredFlows.slice(0, 2);
	const paywalledFlows = isPro ? [] : filteredFlows.slice(2);

	return (
		<div className="flex min-h-screen w-full flex-col bg-[#fafafa] text-neutral-900 selection:bg-blue-600 selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
			{/* Top Header */}
			<DashboardHeader
				activeTab={activeTab}
				onTabChange={handleHeaderTabChange}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				onOpenPricing={() => setPricingOpen(true)}
				onOpenRequestContent={() => setRequestContentOpen(true)}
				onOpenProfileMetadata={() => setProfileMetadataOpen(true)}
			/>

			{/* Sub-toolbar (iOS/Web switcher, Categories, Flow filters, Count & Sort) */}
			<DashboardToolbar
				platform={platform}
				onPlatformChange={handlePlatformChange}
				selectedCategory={selectedCategory}
				onCategoryChange={setSelectedCategory}
				selectedFlow={selectedFlow}
				onFlowChange={setSelectedFlow}
				totalFlowsCount={1035}
				sortBy={sortBy}
				onSortByChange={setSortBy}
			/>

			{/* Pro Status Ribbon */}
			{!isPro ? (
				<div className="border-neutral-200/50 border-b bg-neutral-100/50 px-4 py-2 text-center text-neutral-600 text-xs dark:border-neutral-900 dark:bg-neutral-900/40 dark:text-neutral-400">
					<div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
						<span className="rounded-full bg-neutral-900 px-2 py-0.5 font-bold text-[10px] text-white dark:bg-neutral-100 dark:text-neutral-900">
							PRO
						</span>
						<span>
							Upgrade for full access beyond the first 2 flows —{" "}
							<button
								type="button"
								onClick={() => setPricingOpen(true)}
								className="cursor-pointer font-semibold text-neutral-950 underline underline-offset-2 hover:text-blue-600 dark:text-white"
							>
								Get Pro
							</button>
						</span>
					</div>
				</div>
			) : (
				<div className="border-emerald-200/40 border-b bg-emerald-50/40 px-4 py-1.5 text-center text-emerald-800 text-xs dark:border-emerald-950/50 dark:bg-emerald-950/20 dark:text-emerald-300">
					<div className="mx-auto flex max-w-7xl items-center justify-center gap-2">
						<span className="rounded-full bg-emerald-600 px-2 py-0.2 font-bold text-[9px] text-white uppercase tracking-wider">
							PRO ACTIVE
						</span>
						<span>
							Full benchmark teardowns unlocked. Manage your sequences in{" "}
							<button
								type="button"
								onClick={() => navigate({ to: "/my-flows" })}
								className="cursor-pointer font-semibold underline underline-offset-2 hover:text-emerald-950 dark:hover:text-white"
							>
								My Flows
							</button>
							.
						</span>
					</div>
				</div>
			)}

			{/* Main Content Area */}
			<main className="flex-1 pb-16">
				{filteredFlows.length === 0 ? (
					<div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
						<p className="font-semibold text-base text-neutral-800 dark:text-neutral-200">
							No flows match your filters
						</p>
						<p className="mt-1 text-neutral-500 text-xs dark:text-neutral-400">
							Try adjusting your search query, flow selection, or category.
						</p>
						<button
							type="button"
							onClick={() => {
								setSearchQuery("");
								setSelectedCategory("All Categories");
								setSelectedFlow("all");
							}}
							className="mt-4 rounded-full bg-neutral-900 px-4 py-1.5 font-semibold text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
						>
							Clear all filters
						</button>
					</div>
				) : (
					<>
						{/* Primary Flows */}
						<div className="divide-y divide-neutral-100 dark:divide-neutral-900">
							{primaryFlows.map((flow) => (
								<FlowRow
									key={flow.id}
									flow={flow}
									onOpenPricing={() => setPricingOpen(true)}
									onSelectFlowScreen={(selectedFlow, screenIdx) => {
										setSelectedFlowModal(selectedFlow);
										setModalScreenIndex(screenIdx);
									}}
								/>
							))}
						</div>

						{/* Mid-feed Selling Point Banner (Only shown when not Pro) */}
						{!isPro && (
							<SellingPointBanner onOpenPricing={() => setPricingOpen(true)} />
						)}

						{/* Subsequent Paywalled / Teaser Flows (Only when not Pro) */}
						{paywalledFlows.length > 0 && (
							<div className="divide-y divide-neutral-100 dark:divide-neutral-900">
								{paywalledFlows.map((flow) => (
									<FlowRow
										key={flow.id}
										flow={flow}
										onOpenPricing={() => setPricingOpen(true)}
										onSelectFlowScreen={(selectedFlow, screenIdx) => {
											setSelectedFlowModal(selectedFlow);
											setModalScreenIndex(screenIdx);
										}}
									/>
								))}
							</div>
						)}
					</>
				)}
			</main>

			{/* Modals */}
			<FlowDetailModal
				flow={selectedFlowModal}
				initialScreenIndex={modalScreenIndex}
				open={!!selectedFlowModal}
				onClose={() => setSelectedFlowModal(null)}
				onOpenPricing={() => {
					setSelectedFlowModal(null);
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
				initialOrg={
					session.data?.user.name
						? `${session.data.user.name}'s Studio`
						: "IvO Labs"
				}
			/>
		</div>
	);
}
