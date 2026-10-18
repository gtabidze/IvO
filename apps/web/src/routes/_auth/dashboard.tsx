import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
	AgentFormDialog,
	type AgentFormValues,
} from "@/components/agents/agent-form-dialog";
import {
	type AgentProfile,
	AgentProfileDialog,
} from "@/components/agents/agent-profile-dialog";
import { AddCompetenceModal } from "@/components/dashboard/add-competence-modal";
import { FlowDetailModal } from "@/components/dashboard/flow-detail-modal";
import { InviteMembersModal } from "@/components/dashboard/invite-members-modal";
import { PricingModal } from "@/components/dashboard/pricing-modal";
import { ProfileMetadataModal } from "@/components/dashboard/profile-metadata-modal";
import { RequestContentModal } from "@/components/dashboard/request-content-modal";
import { UnifiedFeed } from "@/components/feed/unified-feed";
import { FlowCreatorModal } from "@/components/flows/flow-creator-modal";
import { ProductCreatorModal } from "@/components/flows/product-creator-modal";
import { NotificationsModal } from "@/components/layout/notifications-modal";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { usePro } from "@/context/pro-context";
import { DASHBOARD_FLOWS, type DashboardFlow } from "@/data/dashboard-flows";
import { buildFeed } from "@/lib/feed";
import { toDashboardFlow } from "@/lib/flow-adapter";
import { flowStore } from "@/lib/flow-store";
import { buildSingleScreens } from "@/lib/single-screens";
import { useTRPC } from "@/utils/trpc";

export const Route = createFileRoute("/_auth/dashboard")({
	component: DashboardComponent,
});

function DashboardComponent() {
	const { session } = Route.useRouteContext();
	const { isPro } = usePro();
	const userName = session.data?.user.name || "Gua.";

	// Agents TRPC
	const trpc = useTRPC();
	const qc = useQueryClient();
	const connectorsQ = useQuery(trpc.agent.connectors.queryOptions());

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

	// Search & Feed navigation
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedTag, setSelectedTag] = useState<string | null>(null);

	// Modal States
	const [pricingOpen, setPricingOpen] = useState(false);
	const [requestContentOpen, setRequestContentOpen] = useState(false);
	const [profileMetadataOpen, setProfileMetadataOpen] = useState(false);
	const [inviteMembersOpen, setInviteMembersOpen] = useState(false);
	const [addCompetenceOpen, setAddCompetenceOpen] = useState(false);
	const [notificationsOpen, setNotificationsOpen] = useState(false);

	// Creator modals
	const [flowCreatorOpen, setFlowCreatorOpen] = useState(false);
	const [productCreatorOpen, setProductCreatorOpen] = useState(false);

	// Agent inspect & edit modals
	const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
	const [agentCreating, setAgentCreating] = useState(false);
	const [editingAgent, setEditingAgent] = useState<AgentProfile | null>(null);

	// Screen & Flow Detail Modal state
	const [detailModal, setDetailModal] = useState<{
		flow: DashboardFlow;
		screenIndex: number;
		tab?: "comments" | "ai" | "usability";
	} | null>(null);

	// Agent creation & update mutations
	const createAgent = useMutation(
		trpc.agent.create.mutationOptions({
			onSuccess: (created) => {
				toast.success(
					created?.enabled ? "Agent published!" : "Agent saved as draft",
				);
				setAgentCreating(false);
				qc.invalidateQueries({ queryKey: trpc.agent.list.queryKey() });
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	const updateAgent = useMutation(
		trpc.agent.update.mutationOptions({
			onSuccess: () => {
				toast.success("Agent updated");
				setEditingAgent(null);
				qc.invalidateQueries({ queryKey: trpc.agent.list.queryKey() });
			},
			onError: (e) => toast.error(e.message),
		}),
	);

	// Combine custom flows with DASHBOARD_FLOWS
	const allDashboardFlows = useMemo(() => {
		const adapted = customFlows
			.filter((cf) => cf.status === "published")
			.map(toDashboardFlow);
		const combined = [...adapted, ...DASHBOARD_FLOWS];
		if (isPro) {
			return combined.map((f) => ({ ...f, isLocked: false }));
		}
		return combined;
	}, [customFlows, isPro]);

	// Build multi-screen flow items
	const flowItems = useMemo(() => {
		return buildFeed(DASHBOARD_FLOWS, customFlows, { name: userName });
	}, [customFlows, userName]);

	// Build single screens showcase items
	const singleScreenItems = useMemo(() => {
		return buildSingleScreens(allDashboardFlows, { name: userName });
	}, [allDashboardFlows, userName]);

	const handleOpenFlowScreen = (
		flow: DashboardFlow,
		screenIndex: number,
		tab?: "comments" | "ai",
	) => {
		setDetailModal({
			flow,
			screenIndex,
			tab,
		});
	};

	return (
		<div className="flex min-h-screen w-full justify-center bg-white text-neutral-900 selection:bg-blue-600 selection:text-white dark:bg-neutral-950 dark:text-neutral-100">
			<div className="flex w-full max-w-5xl justify-center">
				{/* Column 1: Left Navigation Sidebar (Twitter/X style) */}
				<SidebarNav
					onOpenNewFlow={() => setFlowCreatorOpen(true)}
					onOpenSearch={() => {
						const searchInput = document.querySelector(
							'input[type="search"]',
						) as HTMLInputElement | null;
						searchInput?.focus();
					}}
					onOpenNotifications={() => setNotificationsOpen(true)}
					onSelectAgent={(agent) => setSelectedAgent(agent)}
					onOpenNewAgent={() => setAgentCreating(true)}
					onOpenPricing={() => setPricingOpen(true)}
					onOpenRequestContent={() => setRequestContentOpen(true)}
					onOpenProfileMetadata={() => setProfileMetadataOpen(true)}
					onOpenInviteMembers={() => setInviteMembersOpen(true)}
					onOpenAddCompetence={() => setAddCompetenceOpen(true)}
					selectedTag={selectedTag}
					onSelectTag={setSelectedTag}
				/>

				{/* Column 2: Center Feed */}
				<UnifiedFeed
					flowItems={flowItems}
					singleScreenItems={singleScreenItems}
					searchQuery={searchQuery}
					onSearchChange={setSearchQuery}
					onOpenFlowScreen={handleOpenFlowScreen}
					isPro={isPro}
					onOpenPricing={() => setPricingOpen(true)}
					selectedTag={selectedTag}
					onSelectTag={setSelectedTag}
				/>
			</div>

			{/* Interactive Modals */}
			<FlowDetailModal
				flow={detailModal?.flow ?? null}
				initialScreenIndex={detailModal?.screenIndex ?? 0}
				initialSidebarTab={detailModal?.tab}
				open={!!detailModal}
				onClose={() => setDetailModal(null)}
				onOpenPricing={() => {
					setDetailModal(null);
					setPricingOpen(true);
				}}
			/>

			<FlowCreatorModal
				open={flowCreatorOpen}
				onOpenChange={setFlowCreatorOpen}
				onOpenCreateProduct={() => setProductCreatorOpen(true)}
				onFlowCreated={() => setCustomFlows(flowStore.getFlows())}
			/>

			<ProductCreatorModal
				open={productCreatorOpen}
				onOpenChange={setProductCreatorOpen}
				onProductCreated={() => {}}
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
						: "Alignment Labs"
				}
			/>

			<InviteMembersModal
				open={inviteMembersOpen}
				onOpenChange={setInviteMembersOpen}
			/>

			<AddCompetenceModal
				open={addCompetenceOpen}
				onOpenChange={setAddCompetenceOpen}
			/>

			<NotificationsModal
				open={notificationsOpen}
				onOpenChange={setNotificationsOpen}
			/>

			<AgentProfileDialog
				agent={selectedAgent}
				onClose={() => setSelectedAgent(null)}
				onEdit={(ag) => setEditingAgent(ag)}
			/>

			<AgentFormDialog
				open={agentCreating || !!editingAgent}
				agent={editingAgent}
				connectorOptions={[...(connectorsQ.data ?? [])]}
				saving={createAgent.isPending || updateAgent.isPending}
				onClose={() => {
					setAgentCreating(false);
					setEditingAgent(null);
				}}
				onSubmit={(v: AgentFormValues) => {
					if (editingAgent) {
						const { slug: _slug, ...data } = v;
						updateAgent.mutate({ id: editingAgent.id, data });
					} else {
						createAgent.mutate(v);
					}
				}}
			/>
		</div>
	);
}
