import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@IvO/ui/components/breadcrumb";
import { Button } from "@IvO/ui/components/button";
import {
	Dialog,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import { Input } from "@IvO/ui/components/input";
import { Label } from "@IvO/ui/components/label";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@IvO/ui/components/tooltip";
import {
	Check,
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Info,
	Link2,
	ListChecks,
	Maximize2,
	Minimize2,
	PenTool,
	Play,
	Plus,
	ScanSearch,
	Search,
	Sparkles,
	X,
	ZoomIn,
	ZoomOut,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { DASHBOARD_FLOWS, type DashboardFlow } from "@/data/dashboard-flows";
import {
	// AgentChecksBadge,
	AgentChecksDialog,
} from "../agents/agent-checks-dialog";
import { AuditCanvasOverlay, type AuditTool } from "./audit-canvas-overlay";
import { AuditToolbar } from "./audit-toolbar";
import { FlowComparisonSidebar } from "./flow-comparison-sidebar";
import {
	JIRA_STATUSES,
	type JiraFlowPriority,
	type JiraFlowStatus,
} from "./flow-details-config";
import { FlowSidebarPanel } from "./flow-sidebar-panel";
import { PrototypeCanvas } from "./prototype-canvas";
import { RequestBenchmarkSheet } from "./request-benchmark-sheet";
import { ScreenMockup } from "./screen-mockup";

export interface ChannelCategory {
	id: string;
	name: string;
	tag: string;
	description: string;
}

const DEFAULT_CHANNELS: ChannelCategory[] = [
	{
		id: "cards",
		name: "Cards",
		tag: "#cards",
		description: "Digital, physical debit & credit cards",
	},
	{
		id: "transfers",
		name: "Transfers",
		tag: "#transfers",
		description: "P2P, SEPA, SWIFT & money movement",
	},
	{
		id: "fcl",
		name: "Fast Consumer Loan",
		tag: "#fclloan",
		description: "Instant personal credit, underwriting & BNPL",
	},
	{
		id: "kyc",
		name: "KYC",
		tag: "#kyc",
		description: "Biometric liveness, identity check & onboarding",
	},
	{
		id: "savings",
		name: "Savings & Vaults",
		tag: "#savings",
		description: "Target pots, roundups & high-yield vaults",
	},
	{
		id: "crypto",
		name: "Crypto & Web3",
		tag: "#crypto",
		description: "Token swaps, digital asset portfolios & custody",
	},
	{
		id: "billpay",
		name: "Bill Payments",
		tag: "#billpay",
		description: "Utility invoices, automated direct debits",
	},
	{
		id: "rewards",
		name: "Rewards & Perks",
		tag: "#rewards",
		description: "Cashback loyalty, airport lounges & perks",
	},
];

const FINANCE_FLOW_NAMES = [
	"Order Digital Card",
	"Top Up Phone Balance",
	"Send Money Abroad",
	"Open Savings Account",
	"KYC & Identity Verification",
	"Instant Bank Transfer",
	"Crypto Buy & Sell",
];

const APP_TOOLTIP_NAMES: Record<string, string> = {
	BOG: "Bank of Georgia",
	TBC: "TBC Bank",
	Silk: "Silk Bank",
};

interface FlowDetailModalProps {
	flow: DashboardFlow | null;
	initialScreenIndex?: number;
	/** Opens the right sidebar on this tab when the modal opens. */
	initialSidebarTab?: "details" | "ai" | "usability" | "comments";
	open: boolean;
	onClose: () => void;
	onOpenPricing: () => void;
	embedded?: boolean;
}

export function FlowDetailModal({
	flow,
	initialScreenIndex = 0,
	initialSidebarTab,
	open,
	onClose,
	onOpenPricing,
	embedded = false,
}: FlowDetailModalProps) {
	const [viewMode, setViewMode] = useState<"screens" | "prototype">("screens");
	const [activeScreenIndex, setActiveScreenIndex] =
		useState(initialScreenIndex);
	const [checksOpen, setChecksOpen] = useState(false);
	const [checksFlowOverride, setChecksFlowOverride] =
		useState<DashboardFlow | null>(null);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [sidebarTab, setSidebarTab] = useState<
		"details" | "ai" | "usability" | "comments"
	>(initialSidebarTab || "details");

	// Jira Flow Status, Labels, Priority, Assignee & Notes state
	const [flowStatus, setFlowStatus] = useState<JiraFlowStatus>(() => {
		if (!flow) return "in_review";
		try {
			const saved = localStorage.getItem(`ivo_flow_status_${flow.id}`);
			if (saved && saved in JIRA_STATUSES) return saved as JiraFlowStatus;
		} catch {}
		return flow.isLocked ? "to_do" : "in_review";
	});

	const [flowLabels, setFlowLabels] = useState<string[]>(() => {
		if (!flow) return [];
		try {
			const saved = localStorage.getItem(`ivo_flow_labels_${flow.id}`);
			if (saved) return JSON.parse(saved);
		} catch {}
		return flow.tags && flow.tags.length > 0
			? flow.tags
			: [
					"#fintech",
					"#ux-audit",
					`#${(flow.app || "bank").toLowerCase()}`,
					"#benchmark",
				];
	});

	const [flowPriority, setFlowPriority] = useState<JiraFlowPriority>(() => {
		if (!flow) return "medium";
		try {
			const saved = localStorage.getItem(`ivo_flow_priority_${flow.id}`);
			if (saved) return saved as JiraFlowPriority;
		} catch {}
		return flow.usabilityIssues && flow.usabilityIssues.length > 2
			? "high"
			: "medium";
	});

	const [flowAssigneeId, setFlowAssigneeId] = useState<string>("gua-tabidze");

	// Synchronize Jira details when flow changes
	useEffect(() => {
		if (!flow) return;
		try {
			const savedStatus = localStorage.getItem(`ivo_flow_status_${flow.id}`);
			setFlowStatus(
				savedStatus && savedStatus in JIRA_STATUSES
					? (savedStatus as JiraFlowStatus)
					: flow.isLocked
						? "to_do"
						: "in_review",
			);

			const savedLabels = localStorage.getItem(`ivo_flow_labels_${flow.id}`);
			setFlowLabels(
				savedLabels
					? JSON.parse(savedLabels)
					: flow.tags && flow.tags.length > 0
						? flow.tags
						: [
								"#fintech",
								"#ux-audit",
								`#${(flow.app || "bank").toLowerCase()}`,
								"#benchmark",
							],
			);

			const savedPriority = localStorage.getItem(
				`ivo_flow_priority_${flow.id}`,
			);
			setFlowPriority(
				savedPriority
					? (savedPriority as JiraFlowPriority)
					: flow.usabilityIssues && flow.usabilityIssues.length > 2
						? "high"
						: "medium",
			);
		} catch {}
	}, [flow]);

	const handleStatusChange = (newStatus: JiraFlowStatus) => {
		setFlowStatus(newStatus);
		if (flow) {
			try {
				localStorage.setItem(`ivo_flow_status_${flow.id}`, newStatus);
			} catch {}
		}
	};

	const handleLabelsChange = (newLabels: string[]) => {
		setFlowLabels(newLabels);
		if (flow) {
			try {
				localStorage.setItem(
					`ivo_flow_labels_${flow.id}`,
					JSON.stringify(newLabels),
				);
			} catch {}
		}
	};

	const handlePriorityChange = (newPriority: JiraFlowPriority) => {
		setFlowPriority(newPriority);
		if (flow) {
			try {
				localStorage.setItem(`ivo_flow_priority_${flow.id}`, newPriority);
			} catch {}
		}
	};

	const [comparedFlows, setComparedFlows] = useState<DashboardFlow[]>([]);
	const [comparedActiveIndices, setComparedActiveIndices] = useState<
		Record<string, number>
	>({});
	const [canvasZoom, setCanvasZoom] = useState(1);
	const [isCompareSidebarOpen, setIsCompareSidebarOpen] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const compareRowRef = useRef<HTMLDivElement>(null);

	const [channelsList, setChannelsList] =
		useState<ChannelCategory[]>(DEFAULT_CHANNELS);
	const [selectedChannel, setSelectedChannel] = useState<ChannelCategory>(
		DEFAULT_CHANNELS[0],
	);
	const [channelSearch, setChannelSearch] = useState("");
	const [isCreateChannelOpen, setIsCreateChannelOpen] = useState(false);
	const [newChannelName, setNewChannelName] = useState("");
	const [newChannelTag, setNewChannelTag] = useState("");
	const [newChannelDesc, setNewChannelDesc] = useState("");
	const [currentFlowTitle, setCurrentFlowTitle] = useState(
		flow?.flowLabel || flow?.flowName || "Order Digital Card",
	);
	const [flowSearch, setFlowSearch] = useState("");
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [sheetDefaultMode, setSheetDefaultMode] = useState<"category" | "flow">(
		"category",
	);

	// Audit & Drawing Mode State
	const [isAuditOpen, setIsAuditOpen] = useState(false);
	const [auditTool, setAuditTool] = useState<AuditTool>("pen");
	const [canUndoAudit, setCanUndoAudit] = useState(false);
	const [canRedoAudit, setCanRedoAudit] = useState(false);
	const [undoTrigger, setUndoTrigger] = useState(0);
	const [redoTrigger, setRedoTrigger] = useState(0);
	const [resetTrigger, setResetTrigger] = useState(0);

	// Keynote Stage: Focus Mode for individual screen & multi flow items
	const [focusedScreenIndex, setFocusedScreenIndex] = useState<number | null>(
		null,
	);
	const [selectedScreenKeys, setSelectedScreenKeys] = useState<string[]>([]);
	const [isMultiFocusActive, setIsMultiFocusActive] = useState(false);
	const screenWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);

	// Reset focus when flow or modal changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset focus when flow or modal changes
	useEffect(() => {
		setFocusedScreenIndex(null);
		setIsMultiFocusActive(false);
		setSelectedScreenKeys([]);
	}, [flow?.id, open]);

	// Escape key dismisses focus mode (both single & multi) or clears multi-selection
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				if (isMultiFocusActive) {
					e.stopPropagation();
					setIsMultiFocusActive(false);
					setSelectedScreenKeys([]);
				} else if (focusedScreenIndex !== null) {
					e.stopPropagation();
					setFocusedScreenIndex(null);
				} else if (selectedScreenKeys.length > 1) {
					e.stopPropagation();
					setSelectedScreenKeys([]);
				}
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [focusedScreenIndex, isMultiFocusActive, selectedScreenKeys.length]);

	// Smoothly center the focused screen in single focus
	useEffect(() => {
		if (
			focusedScreenIndex !== null &&
			screenWrapperRefs.current[focusedScreenIndex]
		) {
			screenWrapperRefs.current[focusedScreenIndex]?.scrollIntoView({
				behavior: "smooth",
				inline: "center",
				block: "nearest",
			});
		}
	}, [focusedScreenIndex]);

	// Smoothly center the first focused screen when multi-focus activates
	useEffect(() => {
		if (isMultiFocusActive && selectedScreenKeys.length > 0 && flow) {
			const firstMatch = selectedScreenKeys.find((key) =>
				key.startsWith(`${flow.id}:`),
			);
			if (firstMatch) {
				const idx = Number.parseInt(firstMatch.split(":")[1], 10);
				if (screenWrapperRefs.current[idx]) {
					screenWrapperRefs.current[idx]?.scrollIntoView({
						behavior: "smooth",
						inline: "center",
						block: "nearest",
					});
				}
			}
		}
	}, [isMultiFocusActive, selectedScreenKeys, flow]);

	// Keyboard shortcut: Enter key triggers multi-focus when 2+ items selected
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (
				e.key === "Enter" &&
				selectedScreenKeys.length >= 2 &&
				!isMultiFocusActive &&
				focusedScreenIndex === null
			) {
				e.preventDefault();
				setIsMultiFocusActive(true);
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [selectedScreenKeys.length, isMultiFocusActive, focusedScreenIndex]);

	// Screen selection handler (Figma-like Shift + Select)
	const handleScreenSelect = (
		flowId: string,
		screenIdx: number,
		e?: React.MouseEvent,
	) => {
		const key = `${flowId}:${screenIdx}`;
		const isShiftOrCmd = Boolean(e?.shiftKey || e?.metaKey || e?.ctrlKey);

		// If currently in multi-focus mode:
		if (isMultiFocusActive) {
			// "If i select elsewhere, then exit."
			if (!selectedScreenKeys.includes(key)) {
				setIsMultiFocusActive(false);
				setSelectedScreenKeys([key]);
				if (flow && flowId === flow.id) setActiveScreenIndex(screenIdx);
				return;
			}
			// Shift+click on an already focused item removes it
			if (isShiftOrCmd) {
				const next = selectedScreenKeys.filter((k) => k !== key);
				if (next.length === 0) {
					setIsMultiFocusActive(false);
				}
				setSelectedScreenKeys(next);
				return;
			}
			return;
		}

		// If in single focus mode:
		if (focusedScreenIndex !== null) {
			if (isShiftOrCmd) {
				const initialKey = flow ? `${flow.id}:${focusedScreenIndex}` : null;
				setFocusedScreenIndex(null);
				setSelectedScreenKeys(
					initialKey && initialKey !== key ? [initialKey, key] : [key],
				);
				return;
			}
			if (flow && flowId === flow.id && screenIdx !== focusedScreenIndex) {
				setFocusedScreenIndex(screenIdx);
				setActiveScreenIndex(screenIdx);
				setSelectedScreenKeys([key]);
				return;
			}
		}

		// Normal mode:
		if (isShiftOrCmd) {
			setSelectedScreenKeys((prev) => {
				if (prev.includes(key)) {
					return prev.filter((k) => k !== key);
				}
				return [...prev, key];
			});
			if (flow && flowId === flow.id) {
				setActiveScreenIndex(screenIdx);
			}
		} else {
			setSelectedScreenKeys([key]);
			if (flow && flowId === flow.id) {
				setActiveScreenIndex(screenIdx);
			}
		}
	};

	const handleExitFocusMode = () => {
		if (isMultiFocusActive) {
			setIsMultiFocusActive(false);
			setSelectedScreenKeys([]);
		}
		if (focusedScreenIndex !== null) {
			setFocusedScreenIndex(null);
		}
	};

	useEffect(() => {
		if (flow) {
			setCurrentFlowTitle(
				flow.flowLabel || flow.flowName || "Order Digital Card",
			);
			const flowText =
				`${flow.flowName} ${flow.flowType} ${(flow.tags ?? []).join(" ")}`.toLowerCase();
			const match = channelsList.find((ch) => {
				const chName = ch.name.toLowerCase();
				const chId = ch.id.toLowerCase();
				return (
					flowText.includes(chId) ||
					flowText.includes(chName) ||
					(ch.id === "fcl" &&
						(flowText.includes("loan") || flowText.includes("credit"))) ||
					(ch.id === "kyc" &&
						(flowText.includes("onboarding") || flowText.includes("auth")))
				);
			});
			if (match) {
				setSelectedChannel(match);
			}
		}
	}, [flow, channelsList]);

	const filteredChannels = useMemo(() => {
		if (!channelSearch.trim()) return channelsList;
		const query = channelSearch.toLowerCase().replace(/^#/, "");
		return channelsList.filter(
			(c) =>
				c.name.toLowerCase().includes(query) ||
				c.tag.toLowerCase().includes(query) ||
				c.description.toLowerCase().includes(query),
		);
	}, [channelsList, channelSearch]);

	const filteredFlows = useMemo(() => {
		if (!flowSearch.trim()) return FINANCE_FLOW_NAMES;
		const query = flowSearch.toLowerCase();
		return FINANCE_FLOW_NAMES.filter((f) => f.toLowerCase().includes(query));
	}, [flowSearch]);

	const handleCreateChannel = (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		const trimmedName = newChannelName.trim();
		if (!trimmedName) {
			toast.error("Please enter a channel name");
			return;
		}

		const slug = trimmedName
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/^-|-$/g, "");
		const cleanTag = newChannelTag.trim()
			? newChannelTag.trim().startsWith("#")
				? newChannelTag.trim()
				: `#${newChannelTag.trim()}`
			: `#${slug.replace(/-/g, "")}`;

		const newChannel: ChannelCategory = {
			id: `ch-${Date.now()}-${slug}`,
			name: trimmedName,
			tag: cleanTag,
			description:
				newChannelDesc.trim() || `${trimmedName} product flow channel`,
		};

		setChannelsList((prev) => [...prev, newChannel]);
		setSelectedChannel(newChannel);
		setIsCreateChannelOpen(false);
		setNewChannelName("");
		setNewChannelTag("");
		setNewChannelDesc("");
		toast.success(`Channel "${newChannel.name}" created!`, {
			description: `Flow assigned to ${newChannel.name} (${newChannel.tag})`,
		});
	};

	const MAX_TOTAL_FLOWS = 3;
	const MAX_COMPARED_FLOWS = MAX_TOTAL_FLOWS - 1;

	const candidatePool = useMemo(() => {
		if (!flow) return [];
		const all = DASHBOARD_FLOWS.filter((f) => f.id !== flow.id);
		const sameType = all.filter((f) => f.flowType === flow.flowType);
		const otherType = all.filter((f) => f.flowType !== flow.flowType);
		return [...sameType, ...otherType];
	}, [flow]);

	useEffect(() => {
		if (open && initialSidebarTab) {
			if (initialSidebarTab === "usability") {
				setIsCompareSidebarOpen(true);
				setIsSidebarOpen(false);
			} else {
				setSidebarTab(initialSidebarTab);
				setIsSidebarOpen(true);
				setIsCompareSidebarOpen(false);
			}
		}
	}, [open, initialSidebarTab]);

	const screensScrollRef = useRef<HTMLDivElement>(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(true);

	// Synchronize when initialScreenIndex or flow changes
	// biome-ignore lint/correctness/useExhaustiveDependencies: reset modal state when flow changes
	useEffect(() => {
		setActiveScreenIndex(initialScreenIndex);
		setViewMode("screens");
		setComparedFlows([]);
		setComparedActiveIndices({});
		setCanvasZoom(1);
		setIsCompareSidebarOpen(false);
	}, [initialScreenIndex, flow?.id]);

	// Auto scroll to clicked screen
	useEffect(() => {
		if (open && viewMode === "screens" && screensScrollRef.current) {
			const targetChild = screensScrollRef.current.children[
				activeScreenIndex
			] as HTMLElement;
			if (targetChild) {
				targetChild.scrollIntoView({
					behavior: "smooth",
					inline: "center",
					block: "nearest",
				});
			}
		}
	}, [open, viewMode, activeScreenIndex]);

	// Keyboard navigation: ArrowLeft / ArrowRight jumps between flow screens
	useEffect(() => {
		if (!open || !flow) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			if (e.key === "ArrowRight") {
				e.preventDefault();
				setActiveScreenIndex((prev) =>
					Math.min(flow.screens.length - 1, prev + 1),
				);
			} else if (e.key === "ArrowLeft") {
				e.preventDefault();
				setActiveScreenIndex((prev) => Math.max(0, prev - 1));
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, flow]);

	// Evaluate horizontal scroll buttons on mount and view change
	// biome-ignore lint/correctness/useExhaustiveDependencies: run when view or flow mounts
	useEffect(() => {
		if (open && viewMode === "screens") {
			const timer = setTimeout(() => {
				checkScroll();
			}, 120);
			return () => clearTimeout(timer);
		}
	}, [open, viewMode, flow?.id]);

	if (!open || !flow) return null;

	const checkScroll = () => {
		if (!screensScrollRef.current) return;
		const { scrollLeft, scrollWidth, clientWidth } = screensScrollRef.current;
		setCanScrollLeft(scrollLeft > 20);
		setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 20);
	};

	const handlePreviousScreen = () => {
		setActiveScreenIndex((prev) => Math.max(0, prev - 1));
	};

	const handleNextScreen = () => {
		if (!flow) return;
		setActiveScreenIndex((prev) => Math.min(flow.screens.length - 1, prev + 1));
	};

	const handleCopyFlow = () => {
		const shareUrl = `${window.location.origin}/dashboard?flow=${flow.id}&step=${activeScreenIndex + 1}`;
		navigator.clipboard.writeText(shareUrl);
		toast.success("Shareable flow link copied!", {
			description: `Link to ${flow.flowName} (Step ${activeScreenIndex + 1}) copied to clipboard.`,
		});
	};

	const isComparing = comparedFlows.length > 0;
	const totalFlowsCount = 1 + comparedFlows.length;
	const isFullScreen = isComparing || isMaximized;

	const handleZoomIn = () => {
		setCanvasZoom((prev) => Math.min(1.5, Number((prev + 0.1).toFixed(2))));
	};

	const handleZoomOut = () => {
		setCanvasZoom((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))));
	};

	const handleResetZoom = () => {
		setCanvasZoom(0.75);
	};

	const handleExitCompareCanvas = () => {
		setComparedFlows([]);
		setCanvasZoom(1);
		setIsMaximized(false);
		toast.info("Returned to default single-flow view");
	};

	const handleSelectCompareFlows = (selectedIds: string[]) => {
		if (selectedIds.length > MAX_COMPARED_FLOWS) {
			toast.info(`Flow comparison is limited to ${MAX_TOTAL_FLOWS} flows.`);
			return;
		}

		const nextFlows = selectedIds
			.map((id) => candidatePool.find((c) => c.id === id))
			.filter((c): c is DashboardFlow => Boolean(c));

		const prevIds = new Set(comparedFlows.map((cf) => cf.id));
		const addedFlow = nextFlows.find((nf) => !prevIds.has(nf.id));
		const removedFlow = comparedFlows.find(
			(cf) => !selectedIds.includes(cf.id),
		);

		setComparedFlows(nextFlows);

		if (nextFlows.length === 0) {
			setCanvasZoom(1);
			if (removedFlow) {
				toast.info(`Removed ${removedFlow.app} from comparison`);
			}
			return;
		}

		if (viewMode !== "prototype") {
			setViewMode("screens");
			setCanvasZoom(0.75);
			setIsCompareSidebarOpen(true);
			setIsSidebarOpen(false);
		}

		if (addedFlow) {
			toast.success(`Comparing ${flow.app} with ${addedFlow.app}`, {
				description:
					viewMode === "prototype"
						? "Interactive prototype comparison updated."
						: "Diff comparison canvas updated.",
			});
			if (viewMode !== "prototype") {
				setTimeout(() => {
					compareRowRef.current?.scrollIntoView({
						behavior: "smooth",
						block: "nearest",
					});
				}, 120);
			}
		} else if (removedFlow) {
			toast.info(`Removed ${removedFlow.app} from comparison`);
		}
	};

	const handleAddAnotherFlow = () => {
		if (comparedFlows.length >= MAX_COMPARED_FLOWS) {
			toast.info(`Flow comparison is limited to ${MAX_TOTAL_FLOWS} flows.`);
			return;
		}
		const existingIds = new Set([flow.id, ...comparedFlows.map((cf) => cf.id)]);
		const nextCandidate = candidatePool.find((c) => !existingIds.has(c.id));
		if (!nextCandidate) {
			toast.info("All matching benchmark flows are already in this view.");
			return;
		}
		setComparedFlows((prev) => [...prev, nextCandidate]);
		toast.success(
			`Added "${nextCandidate.flowName}" (${totalFlowsCount + 1}/${MAX_TOTAL_FLOWS} flows)`,
		);
	};

	const handleRemoveComparedFlow = (flowId: string) => {
		setComparedFlows((prev) => {
			const next = prev.filter((cf) => cf.id !== flowId);
			if (next.length === 0) {
				setCanvasZoom(1);
			}
			return next;
		});
	};

	const handleCanvasWheel = (e: React.WheelEvent) => {
		if (!isComparing) return;
		if (e.ctrlKey || e.metaKey) {
			e.preventDefault();
			const delta = e.deltaY < 0 ? 0.08 : -0.08;
			setCanvasZoom((prev) =>
				Math.min(1.5, Math.max(0.4, Number((prev + delta).toFixed(2)))),
			);
		}
	};

	return (
		<div
			className={
				isFullScreen
					? "fade-in-0 fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-0 backdrop-blur-xs transition-all duration-200"
					: embedded
						? "relative w-full overflow-hidden rounded-[20px] bg-white shadow-[0_2px_18px_-4px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.06)] transition-all duration-200 sm:rounded-[24px] dark:bg-neutral-950"
						: "fade-in-0 fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/70 p-2 backdrop-blur-xs transition-all duration-200 sm:p-4 md:p-6"
			}
		>
			{/* Main Modal Shell */}
			<div
				className={`relative flex flex-col overflow-hidden transition-all duration-200 ${
					isFullScreen
						? "h-screen w-screen max-w-none rounded-none border-0 shadow-2xl"
						: embedded
							? "h-[720px] w-full border border-neutral-200/90 sm:h-[750px] dark:border-neutral-800"
							: "h-[94vh] w-full max-w-7xl rounded-3xl border shadow-2xl"
				} border-neutral-200/90 bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white`}
			>
				{/* Top Modal Header Bar */}
				<header className="relative z-20 flex h-15 shrink-0 items-center justify-between border-neutral-200/80 border-b bg-white px-5 transition-colors sm:px-6 dark:border-neutral-800 dark:bg-neutral-900">
					{/* Left: Breadcrumbs + App Comparison Selector + Agent Checks Badge */}
					<div className="flex min-w-0 items-center gap-2.5">
						<Breadcrumb className="min-w-0">
							<BreadcrumbList className="flex-nowrap gap-0.5 sm:gap-1">
								<BreadcrumbItem>
									<BreadcrumbLink
										href="/dashboard"
										onClick={(e) => {
											e.preventDefault();
											onClose();
										}}
										className="cursor-pointer font-medium text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
									>
										Flows
									</BreadcrumbLink>
								</BreadcrumbItem>

								<BreadcrumbSeparator />

								{/* Channel Dropdown (Cards, Transfers, Fast Consumer Loan, KYC, etc.) */}
								<BreadcrumbItem>
									<DropdownMenu>
										<DropdownMenuTrigger className="group inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 font-medium text-neutral-700 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none sm:text-[13px] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">
											<span>{selectedChannel.name}</span>
											<ChevronDown className="-mr-1 h-3 w-0 overflow-hidden opacity-0 transition-all duration-150 group-hover:mr-0 group-hover:w-3 group-hover:opacity-60 group-data-[state=open]:mr-0 group-data-[state=open]:w-3 group-data-[state=open]:opacity-60" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-64">
											{/* Search Input */}
											<div className="relative mb-1 flex items-center px-1">
												<Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
												<input
													type="text"
													placeholder="Search channels..."
													value={channelSearch}
													onChange={(e) => setChannelSearch(e.target.value)}
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => e.stopPropagation()}
													className="h-8 w-full rounded-sm border border-input bg-transparent pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
												/>
											</div>

											<DropdownMenuGroup className="max-h-60 overflow-y-auto">
												{filteredChannels.length === 0 ? (
													<div className="px-2 py-3 text-center text-muted-foreground text-xs">
														No channels found
													</div>
												) : (
													filteredChannels.map((ch) => (
														<DropdownMenuItem
															key={ch.id}
															onClick={() => {
																setSelectedChannel(ch);
															}}
															className="flex cursor-pointer items-center justify-between py-1.5"
														>
															<div className="flex min-w-0 flex-col pr-2">
																<div className="flex items-center gap-1.5">
																	<span className="font-medium text-neutral-900 text-xs dark:text-neutral-100">
																		{ch.name}
																	</span>
																	<span className="font-mono text-[10px] text-muted-foreground">
																		{ch.tag}
																	</span>
																</div>
																{ch.description && (
																	<span className="max-w-[180px] truncate text-[11px] text-muted-foreground">
																		{ch.description}
																	</span>
																)}
															</div>
															{selectedChannel.id === ch.id && (
																<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
															)}
														</DropdownMenuItem>
													))
												)}
											</DropdownMenuGroup>

											<DropdownMenuSeparator />

											<DropdownMenuItem
												className="cursor-pointer font-medium text-primary focus:text-primary"
												onClick={() => {
													setIsCreateChannelOpen(true);
												}}
											>
												<Plus className="mr-2 h-4 w-4 shrink-0" />
												<span className="text-xs">Create channel</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</BreadcrumbItem>

								<BreadcrumbSeparator />

								{/* Flow Dropdown (Order Digital Card) */}
								<BreadcrumbItem className="min-w-0 truncate">
									<DropdownMenu>
										<DropdownMenuTrigger className="inline-flex max-w-[140px] cursor-pointer items-center gap-1 truncate rounded-md px-1 py-0.5 font-medium text-neutral-900 text-xs transition-colors hover:bg-neutral-100 focus:outline-none sm:max-w-[200px] sm:text-[13px] md:max-w-xs dark:text-white dark:hover:bg-neutral-800">
											<span className="truncate">{currentFlowTitle}</span>
											<ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-64">
											{/* Search Input */}
											<div className="relative mb-1 flex items-center px-1">
												<Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
												<input
													type="text"
													placeholder="Search flows..."
													value={flowSearch}
													onChange={(e) => setFlowSearch(e.target.value)}
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => e.stopPropagation()}
													className="h-8 w-full rounded-sm border border-input bg-transparent pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
												/>
											</div>

											<DropdownMenuGroup>
												{filteredFlows.length === 0 ? (
													<div className="px-2 py-3 text-center text-muted-foreground text-xs">
														No user flows found
													</div>
												) : (
													filteredFlows.map((fName) => (
														<DropdownMenuItem
															key={fName}
															onClick={() => {
																setCurrentFlowTitle(fName);
																toast.info(`Switched to "${fName}"`);
															}}
															className="justify-between"
														>
															<span className="truncate">{fName}</span>
															{currentFlowTitle === fName && (
																<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
															)}
														</DropdownMenuItem>
													))
												)}
											</DropdownMenuGroup>

											<DropdownMenuSeparator />

											<DropdownMenuItem
												onClick={() => {
													setSheetDefaultMode("flow");
													setIsSheetOpen(true);
												}}
											>
												<Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
												<span className="font-medium text-xs">
													Request flow
												</span>
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</BreadcrumbItem>
							</BreadcrumbList>
						</Breadcrumb>
					</div>

					{/* Right: 4-Cluster Toolbar (Compare, Present, Intelligence, Utilities) */}
					<TooltipProvider delay={150}>
						<div className="flex items-center gap-1.5 sm:gap-2">
							{/* Cluster 1: Comparison Component (Pills + Dropdown Trigger) */}
							<DropdownMenu>
								<div className="flex items-center -space-x-1.5 sm:-space-x-2">
									{/* Compared flow pills */}
									{comparedFlows.map((cf) => (
										<Tooltip key={cf.id}>
											<TooltipTrigger
												render={
													<div className="relative z-10 inline-flex h-8 cursor-default items-center gap-1.5 rounded-full bg-neutral-100 pr-3 pl-2 font-semibold text-neutral-900 text-xs shadow-2xs ring-2 ring-white transition-all dark:bg-neutral-800/90 dark:text-white dark:ring-neutral-900" />
												}
											>
												{cf.appLogoUrl ? (
													<img
														src={cf.appLogoUrl}
														alt={cf.app}
														className="h-4.5 w-4.5 shrink-0 rounded-md object-cover shadow-2xs"
													/>
												) : (
													<span
														style={{ backgroundColor: cf.appColor }}
														className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md font-bold text-[9px] text-white shadow-2xs"
													>
														{cf.appLogoText}
													</span>
												)}
												<span className="font-semibold text-xs tracking-tight">
													{cf.app}
												</span>
											</TooltipTrigger>
											<TooltipContent
												side="bottom"
												sideOffset={6}
												className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
											>
												{APP_TOOLTIP_NAMES[cf.app] || cf.app}
											</TooltipContent>
										</Tooltip>
									))}

									{/* Primary baseline flow pill */}
									<Tooltip>
										<TooltipTrigger
											render={
												<div className="relative z-20 inline-flex h-8 cursor-default items-center gap-1.5 rounded-full bg-neutral-100 pr-3 pl-2 font-semibold text-neutral-900 text-xs shadow-2xs ring-2 ring-white transition-all dark:bg-neutral-800/90 dark:text-white dark:ring-neutral-900" />
											}
										>
											{flow.appLogoUrl ? (
												<img
													src={flow.appLogoUrl}
													alt={flow.app}
													className="h-4.5 w-4.5 shrink-0 rounded-md object-cover shadow-2xs"
												/>
											) : (
												<span
													style={{ backgroundColor: flow.appColor }}
													className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-md font-bold text-[9px] text-white shadow-2xs"
												>
													{flow.appLogoText}
												</span>
											)}
											<span className="font-semibold text-xs tracking-tight">
												{flow.app}
											</span>
										</TooltipTrigger>
										<TooltipContent
											side="bottom"
											sideOffset={6}
											className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
										>
											{APP_TOOLTIP_NAMES[flow.app] || flow.app}
										</TooltipContent>
									</Tooltip>

									{/* Chevron Dropdown Trigger Button */}
									<DropdownMenuTrigger
										aria-label="Compare apps"
										className="relative z-30 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-700 ring-2 ring-white transition-colors hover:bg-neutral-200 focus:outline-none active:scale-96 dark:bg-neutral-800 dark:text-neutral-200 dark:ring-neutral-900 dark:hover:bg-neutral-700"
									>
										<ChevronDown className="h-4 w-4" />
									</DropdownMenuTrigger>
								</div>

								<DropdownMenuContent
									align="end"
									sideOffset={6}
									className="w-48"
								>
									<DropdownMenuGroup>
										<DropdownMenuLabel>Compare</DropdownMenuLabel>
										{candidatePool.map((candidate) => {
											const isSelected = comparedFlows.some(
												(cf) => cf.id === candidate.id,
											);
											return (
												<DropdownMenuItem
													key={candidate.id}
													onClick={() => {
														if (isSelected) {
															handleRemoveComparedFlow(candidate.id);
														} else {
															if (comparedFlows.length >= MAX_COMPARED_FLOWS) {
																toast.info(
																	`Flow comparison is limited to ${MAX_TOTAL_FLOWS} flows.`,
																);
																return;
															}
															handleSelectCompareFlows([
																...comparedFlows.map((cf) => cf.id),
																candidate.id,
															]);
														}
													}}
													className="justify-between"
												>
													<div className="flex min-w-0 items-center gap-2">
														{candidate.appLogoUrl ? (
															<img
																src={candidate.appLogoUrl}
																alt={candidate.app}
																className="h-4.5 w-4.5 shrink-0 rounded-sm object-cover shadow-2xs"
															/>
														) : (
															<span
																style={{ backgroundColor: candidate.appColor }}
																className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-sm font-bold text-[9px] text-white shadow-2xs"
															>
																{candidate.appLogoText}
															</span>
														)}
														<span className="font-medium text-xs">
															{candidate.app}
														</span>
													</div>

													{isSelected && (
														<Check className="h-4 w-4 shrink-0 text-primary" />
													)}
												</DropdownMenuItem>
											);
										})}
									</DropdownMenuGroup>

									<DropdownMenuSeparator />

									<DropdownMenuItem
										onClick={() => {
											setSheetDefaultMode("flow");
											setIsSheetOpen(true);
										}}
									>
										<Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
										<span className="font-medium text-xs">Request Flow</span>
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							<div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

							{/* Cluster 2: Present Mode Toggle (Icon + Prototype label) */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={() =>
												setViewMode(
													viewMode === "prototype" ? "screens" : "prototype",
												)
											}
											className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-2.5 font-medium text-xs transition-all ${
												viewMode === "prototype"
													? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
													: "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Prototype"
										>
											<Play
												className={`h-3.5 w-3.5 ${
													viewMode === "prototype" ? "fill-current" : ""
												}`}
											/>
											<span>Prototype</span>
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									{viewMode === "prototype"
										? "Exit presentation mode"
										: "Present prototype"}
								</TooltipContent>
							</Tooltip>

							<div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

							{/* Cluster 3: Details, Patterns & Review */}
							{/* Details (Info: Status, Labels & Attributes) */}
							{flow && (
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={() => {
													if (isSidebarOpen && sidebarTab === "details") {
														setIsSidebarOpen(false);
													} else {
														setIsCompareSidebarOpen(false);
														setSidebarTab("details");
														setIsSidebarOpen(true);
													}
												}}
												className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
													isSidebarOpen && sidebarTab === "details"
														? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
														: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
												}`}
												aria-label="Flow Details"
											>
												<Info className="h-4 w-4" />
											</button>
										}
									/>
									<TooltipContent
										side="bottom"
										sideOffset={6}
										className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
									>
										Flow Details
									</TooltipContent>
								</Tooltip>
							)}

							{/* Patterns (ScanSearch: Insights, KPIs & AI inquiry) */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={() => {
												if (isCompareSidebarOpen && !isSidebarOpen) {
													setIsCompareSidebarOpen(false);
												} else {
													setIsSidebarOpen(false);
													setIsCompareSidebarOpen(true);
												}
											}}
											className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												isCompareSidebarOpen && !isSidebarOpen
													? "bg-blue-600 text-white shadow-xs"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Patterns, KPIs & AI insights"
										>
											<ScanSearch className="h-4 w-4" />
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									Patterns, KPIs & AI insights
								</TooltipContent>
							</Tooltip>

							{/* Review (ListChecks: Checklist & Comments) */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={() => {
												if (isSidebarOpen && sidebarTab === "comments") {
													setIsSidebarOpen(false);
												} else {
													setIsCompareSidebarOpen(false);
													setSidebarTab("comments");
													setIsSidebarOpen(true);
												}
											}}
											className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												isSidebarOpen && sidebarTab === "comments"
													? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Flow Review (checklist & comments)"
										>
											<ListChecks className="h-4 w-4" />
											{flow.initialComments?.length > 0 && (
												<span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-blue-600" />
											)}
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									Flow Review
								</TooltipContent>
							</Tooltip>

							{/* AI Chat (Star icon after Flow review) */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={() => {
												if (isSidebarOpen && sidebarTab === "ai") {
													setIsSidebarOpen(false);
												} else {
													setIsCompareSidebarOpen(false);
													setSidebarTab("ai");
													setIsSidebarOpen(true);
												}
											}}
											className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												isSidebarOpen && sidebarTab === "ai"
													? "bg-blue-600 text-white shadow-xs"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="AI Chat & Copilot"
										>
											<Sparkles className="h-4 w-4" />
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									AI Chat
								</TooltipContent>
							</Tooltip>

							{/* Audit (PenTool: Freehand canvas markup & audit) */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={() => setIsAuditOpen((prev) => !prev)}
											className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												isAuditOpen
													? "bg-red-500 text-white shadow-xs"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Audit & Canvas Markup"
										>
											<PenTool className="h-4 w-4" />
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									Audit & Canvas Markup
								</TooltipContent>
							</Tooltip>

							<div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />

							{/* Cluster 4: Utilities (Copy link, Fullscreen, Close) */}
							{/* Copy Link */}
							<Tooltip>
								<TooltipTrigger
									render={
										<button
											type="button"
											onClick={handleCopyFlow}
											className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 transition-all hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											aria-label="Copy shareable link"
										>
											<Link2 className="h-4 w-4" />
										</button>
									}
								/>
								<TooltipContent
									side="bottom"
									sideOffset={6}
									className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
								>
									Copy share link
								</TooltipContent>
							</Tooltip>

							{/* Fullscreen toggle or Close Dialog */}
							{embedded ? (
								isFullScreen ? (
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													type="button"
													onClick={() => {
														setIsMaximized(false);
														if (isComparing) handleExitCompareCanvas();
													}}
													className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
													aria-label="Exit full screen"
												>
													<Minimize2 className="h-4 w-4" />
												</button>
											}
										/>
										<TooltipContent
											side="bottom"
											sideOffset={6}
											className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
										>
											Exit full screen
										</TooltipContent>
									</Tooltip>
								) : (
									<Tooltip>
										<TooltipTrigger
											render={
												<button
													type="button"
													onClick={() => setIsMaximized(true)}
													className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
													aria-label="Expand to full screen"
												>
													<Maximize2 className="h-4 w-4" />
												</button>
											}
										/>
										<TooltipContent
											side="bottom"
											sideOffset={6}
											className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
										>
											Expand to full screen
										</TooltipContent>
									</Tooltip>
								)
							) : (
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={onClose}
												className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
												aria-label="Close dialog"
											>
												<X className="h-4 w-4" />
											</button>
										}
									/>
									<TooltipContent
										side="bottom"
										sideOffset={6}
										className="rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
									>
										Close
									</TooltipContent>
								</Tooltip>
							)}
						</div>
					</TooltipProvider>
				</header>

				{/* Middle Body Area (Screens / Prototype Canvas + Optional Right Overlay Sidebar) */}
				<div className="relative flex flex-1 overflow-hidden">
					{/* Main View Area */}
					{viewMode === "screens" ? (
						// biome-ignore lint/a11y/noStaticElementInteractions: canvas background click dismisses focus
						<div
							onWheel={handleCanvasWheel}
							onClick={() => {
								handleExitFocusMode();
							}}
							className={`relative flex flex-1 flex-col justify-between overflow-hidden p-6 ${
								isComparing
									? "bg-[#f8f9fa] bg-[radial-gradient(#d4d4d8_1px,transparent_1px)] [background-size:20px_20px] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] dark:bg-neutral-950"
									: "bg-neutral-50/50 dark:bg-neutral-950/50"
							}`}
						>
							{/* Floating Screen Step Controls (Single-flow mode) */}
							{!isComparing && (canScrollLeft || activeScreenIndex > 0) && (
								<button
									type="button"
									onClick={handlePreviousScreen}
									className={`absolute top-1/2 left-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white ${
										focusedScreenIndex !== null || isMultiFocusActive
											? "pointer-events-none scale-90 opacity-0"
											: "scale-100 opacity-100"
									}`}
									aria-label="Previous screen"
									title="Previous screen (←)"
								>
									<ChevronLeft className="h-6 w-6" />
								</button>
							)}

							{!isComparing &&
								(canScrollRight ||
									activeScreenIndex < flow.screens.length - 1) && (
									<button
										type="button"
										onClick={handleNextScreen}
										className={`absolute top-1/2 right-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 transition-all duration-200 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white ${
											focusedScreenIndex !== null || isMultiFocusActive
												? "pointer-events-none scale-90 opacity-0"
												: "scale-100 opacity-100"
										}`}
										aria-label="Next screen"
										title="Next screen (→)"
									>
										<ChevronRight className="h-6 w-6" />
									</button>
								)}

							{/* Flows Canvas (Single Flow or Multi-Flow Compare Stack) */}
							<div
								className={`scrollbar-none flex-1 overflow-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
									isComparing ? "py-2" : "flex flex-col"
								}`}
							>
								<div
									className={
										isComparing ? "space-y-8 pb-6" : "my-auto flex flex-col"
									}
									style={isComparing ? { zoom: canvasZoom } : undefined}
								>
									{/* Primary Flow Section */}
									<div className={isComparing ? "space-y-3" : "my-auto"}>
										{isComparing && (
											<div className="flex flex-wrap items-center justify-between gap-2 px-4">
												<div className="flex items-center gap-2">
													{flow.appLogoUrl ? (
														<img
															src={flow.appLogoUrl}
															alt={flow.app}
															className="h-5 w-5 shrink-0 rounded-md object-cover shadow-2xs"
														/>
													) : (
														<span
															style={{ backgroundColor: flow.appColor }}
															className="flex h-5 w-5 items-center justify-center rounded-md font-bold text-[10px] text-white shadow-2xs"
														>
															{flow.appLogoText}
														</span>
													)}
													<span className="font-bold text-neutral-900 text-sm dark:text-white">
														{flow.flowName}
													</span>
													<span className="rounded-full bg-neutral-200/80 px-2 py-0.5 font-semibold text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
														Flow 1 (Baseline) · {flow.screens.length} screens
													</span>
													{/* Checks icon (commented for now) */}
													{/* <AgentChecksBadge
														flow={flow}
														screenIndex={activeScreenIndex}
														onOpenChecks={() => {
															setChecksFlowOverride(null);
															setChecksOpen(true);
														}}
													/> */}
												</div>
												<div className="flex items-center gap-2 font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
													<span>Time: {flow.timeOnTask}</span>
													<span>·</span>
													<span>Success: {flow.taskSuccessRate}</span>
													<span>·</span>
													<span>SEQ: {flow.seqScore}</span>
												</div>
											</div>
										)}

										{/* Horizontal Screens Carousel */}
										<div
											ref={screensScrollRef}
											onScroll={checkScroll}
											className={`scrollbar-none relative flex overflow-x-auto scroll-smooth px-4 transition-all duration-300 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
												isMultiFocusActive ? "gap-10 sm:gap-12" : "gap-6"
											} ${
												isComparing
													? focusedScreenIndex !== null || isMultiFocusActive
														? "py-10"
														: "py-2"
													: focusedScreenIndex !== null || isMultiFocusActive
														? "py-16"
														: "py-6"
											}`}
										>
											{/* Audit Drawing Overlay Canvas */}
											{isAuditOpen && (
												<AuditCanvasOverlay
													flowId={flow.id}
													activeTool={auditTool}
													scrollContainerRef={screensScrollRef}
													onUndoAvailableChange={setCanUndoAudit}
													onRedoAvailableChange={setCanRedoAudit}
													undoTrigger={undoTrigger}
													redoTrigger={redoTrigger}
													resetTrigger={resetTrigger}
												/>
											)}
											{flow.screens.map((screen, idx) => {
												const screenKey = `${flow.id}:${idx}`;
												const isMultiSelected =
													selectedScreenKeys.includes(screenKey);
												const multiSelectIndex = isMultiSelected
													? selectedScreenKeys.indexOf(screenKey) + 1
													: undefined;
												const isLastSelected =
													selectedScreenKeys.length > 0 &&
													selectedScreenKeys[selectedScreenKeys.length - 1] ===
														screenKey;

												const isSingleFocused = focusedScreenIndex === idx;
												const isMultiFocused =
													isMultiFocusActive && isMultiSelected;
												const isAnyFocusActive =
													isMultiFocusActive || focusedScreenIndex !== null;

												let containerStyle = "cursor-zoom-in";
												if (isSingleFocused) {
													containerStyle = "z-30 scale-[1.2] cursor-zoom-out";
												} else if (isMultiFocused) {
													containerStyle =
														"z-30 scale-[1.06] shadow-2xl cursor-default mx-1.5 sm:mx-2";
												} else if (isAnyFocusActive) {
													containerStyle =
														"pointer-events-none scale-[0.92] opacity-20 blur-[2px]";
												} else if (isMultiSelected) {
													containerStyle = "z-20 scale-[1.02]";
												}

												return (
													// biome-ignore lint/a11y/noStaticElementInteractions: screen selection wrapper
													<div
														key={screen.id}
														ref={(el) => {
															screenWrapperRefs.current[idx] = el;
														}}
														onClick={(e) => {
															e.stopPropagation();
														}}
														onDoubleClick={(e) => {
															e.stopPropagation();
															if (isSingleFocused) {
																setFocusedScreenIndex(null);
															} else {
																setIsMultiFocusActive(false);
																setSelectedScreenKeys([screenKey]);
																setFocusedScreenIndex(idx);
																setActiveScreenIndex(idx);
															}
														}}
														className={`relative flex shrink-0 flex-col items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${containerStyle}`}
														title={
															isSingleFocused
																? "Double-click to exit focus"
																: isMultiFocused
																	? "Screen in multi-focus. Click elsewhere to exit"
																	: "Shift+click to multi-select, Double-click to focus"
														}
													>
														{/* Multi-Selection Action Button on Top Right of Last Selected Screen */}
														{isLastSelected &&
															selectedScreenKeys.length >= 2 &&
															!isMultiFocusActive && (
																<div className="fade-in zoom-in-95 absolute -top-3.5 right-0 z-40 animate-in duration-150">
																	<button
																		type="button"
																		onClick={(e) => {
																			e.stopPropagation();
																			setIsMultiFocusActive(true);
																			setFocusedScreenIndex(null);
																		}}
																		className="group/focusbtn flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 font-semibold text-white text-xs shadow-blue-500/35 shadow-lg ring-2 ring-white transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 dark:ring-neutral-900"
																		title={`Focus ${selectedScreenKeys.length} selected flow items`}
																	>
																		<Maximize2 className="h-3.5 w-3.5 transition-transform group-hover/focusbtn:scale-110" />
																		<span>
																			Focus ({selectedScreenKeys.length})
																		</span>
																	</button>
																</div>
															)}

														{/* Action Button on Top Right to Exit Multi-Focus */}
														{isLastSelected && isMultiFocusActive && (
															<div className="fade-in zoom-in-95 absolute -top-3.5 right-0 z-40 animate-in duration-150">
																<button
																	type="button"
																	onClick={(e) => {
																		e.stopPropagation();
																		handleExitFocusMode();
																	}}
																	className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-900/90 px-2.5 py-1 font-semibold text-white text-xs shadow-lg ring-2 ring-white transition-all hover:scale-105 hover:bg-neutral-950 active:scale-95 dark:bg-white/90 dark:text-neutral-900 dark:ring-neutral-900"
																	title="Exit focus mode (Esc or click elsewhere)"
																>
																	<Minimize2 className="h-3 w-3" />
																	<span>Exit focus</span>
																</button>
															</div>
														)}

														<ScreenMockup
															screen={screen}
															index={idx}
															totalScreens={flow.screens.length}
															appColor={flow.appColor}
															appName={flow.app}
															isLocked={flow.isLocked}
															isSelected={idx === activeScreenIndex}
															isMultiSelected={isMultiSelected}
															selectionIndex={multiSelectIndex}
															onLockedClick={onOpenPricing}
															onScreenClick={(clickedIdx, mouseEvent) => {
																handleScreenSelect(
																	flow.id,
																	clickedIdx,
																	mouseEvent,
																);
															}}
														/>
													</div>
												);
											})}
										</div>
									</div>

									{/* Compared Flows Stacked Below (Max 2 additional flows = 3 flows total) */}
									{comparedFlows.map((comparedFlow, cIdx) => {
										const selectedStep =
											comparedActiveIndices[comparedFlow.id] ?? 0;
										return (
											<div
												key={comparedFlow.id}
												ref={cIdx === 0 ? compareRowRef : undefined}
												className="space-y-3 border-neutral-200/80 border-t pt-6 dark:border-neutral-800"
											>
												<div className="flex flex-wrap items-center justify-between gap-2 px-4">
													<div className="flex items-center gap-2">
														{comparedFlow.appLogoUrl ? (
															<img
																src={comparedFlow.appLogoUrl}
																alt={comparedFlow.app}
																className="h-5 w-5 shrink-0 rounded-md object-cover shadow-2xs"
															/>
														) : (
															<span
																style={{
																	backgroundColor: comparedFlow.appColor,
																}}
																className="flex h-5 w-5 items-center justify-center rounded-md font-bold text-[10px] text-white shadow-2xs"
															>
																{comparedFlow.appLogoText}
															</span>
														)}
														<span className="font-bold text-neutral-900 text-sm dark:text-white">
															{comparedFlow.flowName}
														</span>
														<span className="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-[10px] text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
															Flow {cIdx + 2} (Compared) ·{" "}
															{comparedFlow.screens.length} screens
														</span>
														{/* Checks icon (commented for now) */}
														{/* <AgentChecksBadge
															flow={comparedFlow}
															screenIndex={selectedStep}
															onOpenChecks={() => {
																setChecksFlowOverride(comparedFlow);
																setChecksOpen(true);
															}}
														/> */}
													</div>

													<div className="flex items-center gap-3">
														<div className="hidden items-center gap-2 font-mono text-[11px] text-neutral-500 sm:flex dark:text-neutral-400">
															<span>Time: {comparedFlow.timeOnTask}</span>
															<span>·</span>
															<span>
																Success: {comparedFlow.taskSuccessRate}
															</span>
															<span>·</span>
															<span>SEQ: {comparedFlow.seqScore}</span>
														</div>
														<button
															type="button"
															onClick={() =>
																handleRemoveComparedFlow(comparedFlow.id)
															}
															className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-200/70 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
															aria-label={`Remove ${comparedFlow.flowName} from comparison`}
															title="Remove flow from comparison"
														>
															<X className="h-3.5 w-3.5" />
														</button>
													</div>
												</div>

												<div
													className={`scrollbar-none flex overflow-x-auto scroll-smooth px-4 transition-all duration-300 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
														isMultiFocusActive ? "gap-10 sm:gap-12" : "gap-6"
													} ${
														isMultiFocusActive || focusedScreenIndex !== null
															? "py-8"
															: "py-2"
													}`}
												>
													{comparedFlow.screens.map((screen, idx) => {
														const screenKey = `${comparedFlow.id}:${idx}`;
														const isMultiSelected =
															selectedScreenKeys.includes(screenKey);
														const multiSelectIndex = isMultiSelected
															? selectedScreenKeys.indexOf(screenKey) + 1
															: undefined;
														const isLastSelected =
															selectedScreenKeys.length > 0 &&
															selectedScreenKeys[
																selectedScreenKeys.length - 1
															] === screenKey;

														const isMultiFocused =
															isMultiFocusActive && isMultiSelected;
														const isAnyFocusActive =
															isMultiFocusActive || focusedScreenIndex !== null;

														let containerStyle = "cursor-zoom-in";
														if (isMultiFocused) {
															containerStyle =
																"z-30 scale-[1.06] shadow-2xl cursor-default mx-1.5 sm:mx-2";
														} else if (isAnyFocusActive) {
															containerStyle =
																"pointer-events-none scale-[0.92] opacity-20 blur-[2px]";
														} else if (isMultiSelected) {
															containerStyle = "z-20 scale-[1.02]";
														}

														return (
															// biome-ignore lint/a11y/noStaticElementInteractions: screen selection wrapper
															<div
																key={screen.id}
																onClick={(e) => {
																	e.stopPropagation();
																}}
																className={`relative flex shrink-0 flex-col items-center transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${containerStyle}`}
															>
																{/* Multi-Selection Action Button on Top Right of Last Selected Screen */}
																{isLastSelected &&
																	selectedScreenKeys.length >= 2 &&
																	!isMultiFocusActive && (
																		<div className="fade-in zoom-in-95 absolute -top-3.5 right-0 z-40 animate-in duration-150">
																			<button
																				type="button"
																				onClick={(e) => {
																					e.stopPropagation();
																					setIsMultiFocusActive(true);
																					setFocusedScreenIndex(null);
																				}}
																				className="group/focusbtn flex cursor-pointer items-center gap-1.5 rounded-full bg-blue-600 px-3 py-1 font-semibold text-white text-xs shadow-blue-500/35 shadow-lg ring-2 ring-white transition-all hover:scale-105 hover:bg-blue-700 active:scale-95 dark:ring-neutral-900"
																				title={`Focus ${selectedScreenKeys.length} selected flow items`}
																			>
																				<Maximize2 className="h-3.5 w-3.5 transition-transform group-hover/focusbtn:scale-110" />
																				<span>
																					Focus ({selectedScreenKeys.length})
																				</span>
																			</button>
																		</div>
																	)}

																{/* Action Button on Top Right to Exit Multi-Focus */}
																{isLastSelected && isMultiFocusActive && (
																	<div className="fade-in zoom-in-95 absolute -top-3.5 right-0 z-40 animate-in duration-150">
																		<button
																			type="button"
																			onClick={(e) => {
																				e.stopPropagation();
																				handleExitFocusMode();
																			}}
																			className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-900/90 px-2.5 py-1 font-semibold text-white text-xs shadow-lg ring-2 ring-white transition-all hover:scale-105 hover:bg-neutral-950 active:scale-95 dark:bg-white/90 dark:text-neutral-900 dark:ring-neutral-900"
																			title="Exit focus mode (Esc or click elsewhere)"
																		>
																			<Minimize2 className="h-3 w-3" />
																			<span>Exit focus</span>
																		</button>
																	</div>
																)}

																<ScreenMockup
																	screen={screen}
																	index={idx}
																	totalScreens={comparedFlow.screens.length}
																	appColor={comparedFlow.appColor}
																	appName={comparedFlow.app}
																	isLocked={comparedFlow.isLocked}
																	isSelected={idx === selectedStep}
																	isMultiSelected={isMultiSelected}
																	selectionIndex={multiSelectIndex}
																	onLockedClick={onOpenPricing}
																	onScreenClick={(clickedIdx, mouseEvent) => {
																		handleScreenSelect(
																			comparedFlow.id,
																			clickedIdx,
																			mouseEvent,
																		);
																		setComparedActiveIndices((prev) => ({
																			...prev,
																			[comparedFlow.id]: clickedIdx,
																		}));
																	}}
																/>
															</div>
														);
													})}
												</div>
											</div>
										);
									})}

									{isComparing &&
										comparedFlows.length < MAX_COMPARED_FLOWS &&
										comparedFlows.length < candidatePool.length && (
											<div className="flex justify-center pt-2 pb-4">
												<button
													type="button"
													onClick={handleAddAnotherFlow}
													className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 border-dashed bg-white px-4 py-1.5 font-semibold text-neutral-700 text-xs shadow-2xs transition-colors hover:border-neutral-400 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
												>
													<Plus className="h-3.5 w-3.5" />
													<span>
														Add another flow to compare ({totalFlowsCount}/
														{MAX_TOTAL_FLOWS})
													</span>
												</button>
											</div>
										)}
								</div>
							</div>

							{/* Bottom Floating Bar */}
							{isComparing && (
								<div className="flex w-full shrink-0 flex-wrap items-center justify-between gap-2 pt-2">
									<div className="flex flex-wrap items-center gap-2">
										<div className="flex items-center rounded-full border border-neutral-300 bg-white p-0.5 shadow-2xs dark:border-neutral-700 dark:bg-neutral-800">
											<button
												type="button"
												onClick={handleZoomOut}
												disabled={canvasZoom <= 0.4}
												className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-200 dark:hover:bg-neutral-700"
												aria-label="Zoom out canvas"
											>
												<ZoomOut className="h-3.5 w-3.5" />
											</button>
											<button
												type="button"
												onClick={handleResetZoom}
												className="min-w-[48px] cursor-pointer px-1.5 font-mono font-semibold text-neutral-800 text-xs dark:text-neutral-200"
											>
												{Math.round(canvasZoom * 100)}%
											</button>
											<button
												type="button"
												onClick={handleZoomIn}
												disabled={canvasZoom >= 1.5}
												className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 dark:text-neutral-200 dark:hover:bg-neutral-700"
												aria-label="Zoom in canvas"
											>
												<ZoomIn className="h-3.5 w-3.5" />
											</button>
										</div>

										<button
											type="button"
											onClick={handleExitCompareCanvas}
											className="flex cursor-pointer items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-3.5 py-2 font-semibold text-neutral-800 text-xs shadow-2xs hover:bg-neutral-50 active:scale-95 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
										>
											<Minimize2 className="h-3.5 w-3.5" />
											<span>Return to default</span>
										</button>
									</div>
								</div>
							)}
						</div>
					) : (
						/* Prototype Canvas Mode (Screenshot 2) */
						<PrototypeCanvas
							flow={flow}
							currentStep={activeScreenIndex}
							onStepChange={setActiveScreenIndex}
							comparedFlows={comparedFlows}
							comparedSteps={comparedActiveIndices}
							onComparedStepChange={(flowId, step) =>
								setComparedActiveIndices((prev) => ({
									...prev,
									[flowId]: step,
								}))
							}
							onRemoveComparedFlow={handleRemoveComparedFlow}
						/>
					)}

					{/* Right Side Overlay Panel: Pinned directly below header (top-0), overlays canvas */}
					{(isSidebarOpen || isCompareSidebarOpen) && (
						<div
							className={`slide-in-from-right-4 absolute top-0 bottom-0 z-30 flex max-w-full animate-in duration-200 ease-out ${
								isAuditOpen ? "right-[52px]" : "right-0"
							}`}
						>
							{isSidebarOpen ? (
								<FlowSidebarPanel
									flow={flow}
									activeTab={sidebarTab}
									onTabChange={setSidebarTab}
									onClose={() => setIsSidebarOpen(false)}
									activeScreenIndex={activeScreenIndex}
									onOpenPricing={onOpenPricing}
									flowStatus={flowStatus}
									onStatusChange={handleStatusChange}
									flowLabels={flowLabels}
									onLabelsChange={handleLabelsChange}
									flowPriority={flowPriority}
									onPriorityChange={handlePriorityChange}
									flowAssigneeId={flowAssigneeId}
									onAssigneeChange={setFlowAssigneeId}
								/>
							) : (
								isCompareSidebarOpen && (
									<FlowComparisonSidebar
										primaryFlow={flow}
										comparedFlows={comparedFlows}
										onClose={() => setIsCompareSidebarOpen(false)}
									/>
								)
							)}
						</div>
					)}

					{/* Vertical Audit Toolbar (Docked flush to the far right edge) */}
					{isAuditOpen && (
						<div className="slide-in-from-right-2 absolute top-0 right-0 bottom-0 z-40 flex animate-in duration-150 ease-out">
							<AuditToolbar
								activeTool={auditTool}
								onToolChange={setAuditTool}
								canUndo={canUndoAudit}
								canRedo={canRedoAudit}
								onUndo={() => setUndoTrigger((t) => t + 1)}
								onRedo={() => setRedoTrigger((t) => t + 1)}
								onReset={() => setResetTrigger((t) => t + 1)}
								onClose={() => setIsAuditOpen(false)}
							/>
						</div>
					)}
				</div>
			</div>

			{/* GitHub Actions-style Agent Checks Dialog */}
			<AgentChecksDialog
				flow={checksFlowOverride ?? flow}
				screenIndex={activeScreenIndex}
				open={checksOpen}
				onOpenChange={(nextOpen) => {
					setChecksOpen(nextOpen);
					if (!nextOpen) setChecksFlowOverride(null);
				}}
			/>

			{/* Create Channel Dialog */}
			<Dialog
				open={isCreateChannelOpen}
				onOpenChange={(nextOpen) => {
					setIsCreateChannelOpen(nextOpen);
					if (!nextOpen) {
						setNewChannelName("");
						setNewChannelTag("");
						setNewChannelDesc("");
					}
				}}
			>
				<DialogPopup className="max-w-md rounded-2xl border border-neutral-200/80 bg-white p-6 shadow-2xl dark:border-neutral-800 dark:bg-neutral-950">
					<DialogHeader>
						<DialogTitle className="font-bold text-base text-neutral-950 dark:text-white">
							Create channel
						</DialogTitle>
						<DialogDescription className="text-neutral-500 text-xs">
							Add a new product channel (e.g. Cards, Transfers, Fast Consumer
							Loan, KYC) to organize your flows.
						</DialogDescription>
					</DialogHeader>

					<form
						onSubmit={(e) => {
							e.preventDefault();
							handleCreateChannel();
						}}
						className="mt-4 flex flex-col gap-3.5"
					>
						<div className="space-y-1.5">
							<Label
								htmlFor="channel-name"
								className="font-medium text-neutral-700 text-xs dark:text-neutral-300"
							>
								Channel Name <span className="text-red-500">*</span>
							</Label>
							<Input
								id="channel-name"
								placeholder="e.g. Mortgages, Wealth, KYC"
								value={newChannelName}
								onChange={(e) => setNewChannelName(e.target.value)}
								autoFocus
								required
								className="h-9 rounded-lg"
							/>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="channel-tag"
								className="font-medium text-neutral-700 text-xs dark:text-neutral-300"
							>
								Tag identifier{" "}
								<span className="font-normal text-neutral-400">(optional)</span>
							</Label>
							<Input
								id="channel-tag"
								placeholder="e.g. #mortgages or #wealth"
								value={newChannelTag}
								onChange={(e) => setNewChannelTag(e.target.value)}
								className="h-9 rounded-lg"
							/>
						</div>

						<div className="space-y-1.5">
							<Label
								htmlFor="channel-desc"
								className="font-medium text-neutral-700 text-xs dark:text-neutral-300"
							>
								Description{" "}
								<span className="font-normal text-neutral-400">(optional)</span>
							</Label>
							<Input
								id="channel-desc"
								placeholder="Short summary of flows in this product line"
								value={newChannelDesc}
								onChange={(e) => setNewChannelDesc(e.target.value)}
								className="h-9 rounded-lg"
							/>
						</div>

						<DialogFooter className="mt-2 flex items-center justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setIsCreateChannelOpen(false)}
								className="h-8 rounded-lg text-xs"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								className="h-8 rounded-lg bg-neutral-900 text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
							>
								Create channel
							</Button>
						</DialogFooter>
					</form>
				</DialogPopup>
			</Dialog>

			{/* Talk to Team: Request Category or Flow Sheet (Slides in from Right) */}
			<RequestBenchmarkSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				defaultMode={sheetDefaultMode}
				initialCategory={selectedChannel.name}
			/>
		</div>
	);
}
