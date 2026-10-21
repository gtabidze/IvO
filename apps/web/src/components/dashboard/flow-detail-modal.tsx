import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbSeparator,
} from "@IvO/ui/components/breadcrumb";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
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
	Link2,
	ListChecks,
	Maximize2,
	Minimize2,
	Play,
	Plus,
	ScanSearch,
	Search,
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
import { FlowComparisonSidebar } from "./flow-comparison-sidebar";
import { FlowSidebarPanel } from "./flow-sidebar-panel";
import { PrototypeCanvas } from "./prototype-canvas";
import { RequestBenchmarkSheet } from "./request-benchmark-sheet";
import { ScreenMockup } from "./screen-mockup";

const CATEGORIES = [
	{ id: "finance", name: "Finance", isReadOnly: false },
	{ id: "gambling", name: "Gambling", isReadOnly: true },
	{ id: "ecommerce", name: "E-commerce", isReadOnly: true },
	{ id: "telecom", name: "Telecom", isReadOnly: true },
	{ id: "ticketing", name: "Ticketing", isReadOnly: true },
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
	initialSidebarTab?: "ai" | "usability" | "comments";
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
	const [sidebarTab, setSidebarTab] = useState<"ai" | "usability" | "comments">(
		"ai",
	);
	const [comparedFlows, setComparedFlows] = useState<DashboardFlow[]>([]);
	const [comparedActiveIndices, setComparedActiveIndices] = useState<
		Record<string, number>
	>({});
	const [canvasZoom, setCanvasZoom] = useState(1);
	const [isCompareSidebarOpen, setIsCompareSidebarOpen] = useState(false);
	const [isMaximized, setIsMaximized] = useState(false);
	const compareRowRef = useRef<HTMLDivElement>(null);

	const [selectedCategory, setSelectedCategory] = useState("Finance");
	const [categorySearch, setCategorySearch] = useState("");
	const [currentFlowTitle, setCurrentFlowTitle] = useState(
		flow?.flowLabel || flow?.flowName || "Order Digital Card",
	);
	const [flowSearch, setFlowSearch] = useState("");
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [sheetDefaultMode, setSheetDefaultMode] = useState<"category" | "flow">(
		"category",
	);

	useEffect(() => {
		if (flow) {
			setCurrentFlowTitle(
				flow.flowLabel || flow.flowName || "Order Digital Card",
			);
		}
	}, [flow]);

	const filteredCategories = useMemo(() => {
		if (!categorySearch.trim()) return CATEGORIES;
		const query = categorySearch.toLowerCase();
		return CATEGORIES.filter((c) => c.name.toLowerCase().includes(query));
	}, [categorySearch]);

	const filteredFlows = useMemo(() => {
		if (!flowSearch.trim()) return FINANCE_FLOW_NAMES;
		const query = flowSearch.toLowerCase();
		return FINANCE_FLOW_NAMES.filter((f) => f.toLowerCase().includes(query));
	}, [flowSearch]);

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

								{/* Category Dropdown (Finance) */}
								<BreadcrumbItem>
									<DropdownMenu>
										<DropdownMenuTrigger className="group inline-flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 font-medium text-neutral-700 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus:outline-none sm:text-[13px] dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white">
											<span>{selectedCategory}</span>
											<ChevronDown className="-mr-1 h-3 w-0 overflow-hidden opacity-0 transition-all duration-150 group-hover:mr-0 group-hover:w-3 group-hover:opacity-60 group-data-[state=open]:mr-0 group-data-[state=open]:w-3 group-data-[state=open]:opacity-60" />
										</DropdownMenuTrigger>
										<DropdownMenuContent align="start" className="w-56">
											{/* Search Input */}
											<div className="relative mb-1 flex items-center px-1">
												<Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
												<input
													type="text"
													placeholder="Search categories..."
													value={categorySearch}
													onChange={(e) => setCategorySearch(e.target.value)}
													onClick={(e) => e.stopPropagation()}
													onKeyDown={(e) => e.stopPropagation()}
													className="h-8 w-full rounded-sm border border-input bg-transparent pr-2 pl-7 text-xs outline-none placeholder:text-muted-foreground focus:border-ring"
												/>
											</div>

											<DropdownMenuGroup>
												{filteredCategories.length === 0 ? (
													<div className="px-2 py-3 text-center text-muted-foreground text-xs">
														No categories found
													</div>
												) : (
													filteredCategories.map((cat) => (
														<DropdownMenuItem
															key={cat.id}
															disabled={cat.isReadOnly}
															onClick={() => {
																if (!cat.isReadOnly) {
																	setSelectedCategory(cat.name);
																}
															}}
															className="justify-between"
														>
															<span className="flex items-center gap-2">
																{cat.name}
																{selectedCategory === cat.name && (
																	<Check className="h-3.5 w-3.5 text-primary" />
																)}
															</span>
															{cat.isReadOnly && (
																<span className="rounded bg-muted px-1.5 py-0.5 font-medium text-[10px] text-muted-foreground">
																	Coming soon
																</span>
															)}
														</DropdownMenuItem>
													))
												)}
											</DropdownMenuGroup>

											<DropdownMenuSeparator />

											<DropdownMenuItem
												onClick={() => {
													setSheetDefaultMode("category");
													setIsSheetOpen(true);
												}}
											>
												<Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
												<span className="font-medium text-xs">
													Request category
												</span>
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
									<DropdownMenuLabel>Compare</DropdownMenuLabel>

									<DropdownMenuGroup>
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

							{/* Cluster 2: Present Mode Toggle (Icon only!) */}
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
											className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												viewMode === "prototype"
													? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Present prototype"
										>
											<Play
												className={`h-3.5 w-3.5 ${
													viewMode === "prototype" ? "fill-current" : ""
												}`}
											/>
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

							{/* Cluster 3: Patterns & Review */}
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
												if (isSidebarOpen) {
													setIsSidebarOpen(false);
												} else {
													setIsCompareSidebarOpen(false);
													setSidebarTab("comments");
													setIsSidebarOpen(true);
												}
											}}
											className={`relative flex h-8 w-8 cursor-pointer items-center justify-center rounded-full transition-all ${
												isSidebarOpen
													? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950"
													: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
											}`}
											aria-label="Review checklist & comments"
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
									Review checklist & comments
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
						<div
							onWheel={handleCanvasWheel}
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
									className="absolute top-1/2 left-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white"
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
										className="absolute top-1/2 right-6 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/95 text-neutral-800 shadow-xl ring-1 ring-black/5 hover:scale-105 active:scale-95 dark:bg-neutral-900 dark:text-white"
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
											className={`scrollbar-none flex gap-6 overflow-x-auto scroll-smooth px-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
												isComparing ? "py-2" : "py-6"
											}`}
										>
											{flow.screens.map((screen, idx) => (
												<ScreenMockup
													key={screen.id}
													screen={screen}
													index={idx}
													totalScreens={flow.screens.length}
													appColor={flow.appColor}
													appName={flow.app}
													isLocked={flow.isLocked}
													isSelected={idx === activeScreenIndex}
													onLockedClick={onOpenPricing}
													onScreenClick={(clickedIdx) =>
														setActiveScreenIndex(clickedIdx)
													}
												/>
											))}
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

												<div className="scrollbar-none flex gap-6 overflow-x-auto scroll-smooth px-4 py-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
													{comparedFlow.screens.map((screen, idx) => (
														<ScreenMockup
															key={screen.id}
															screen={screen}
															index={idx}
															totalScreens={comparedFlow.screens.length}
															appColor={comparedFlow.appColor}
															appName={comparedFlow.app}
															isLocked={comparedFlow.isLocked}
															isSelected={idx === selectedStep}
															onLockedClick={onOpenPricing}
															onScreenClick={(clickedIdx) =>
																setComparedActiveIndices((prev) => ({
																	...prev,
																	[comparedFlow.id]: clickedIdx,
																}))
															}
														/>
													))}
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
						<div className="slide-in-from-right-4 absolute top-0 right-0 bottom-0 z-30 flex max-w-full animate-in duration-200 ease-out">
							{isSidebarOpen ? (
								<FlowSidebarPanel
									flow={flow}
									activeTab={sidebarTab}
									onTabChange={setSidebarTab}
									onClose={() => setIsSidebarOpen(false)}
									activeScreenIndex={activeScreenIndex}
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

			{/* Talk to Team: Request Category or Flow Sheet (Slides in from Right) */}
			<RequestBenchmarkSheet
				open={isSheetOpen}
				onOpenChange={setIsSheetOpen}
				defaultMode={sheetDefaultMode}
				initialCategory={selectedCategory}
			/>
		</div>
	);
}
