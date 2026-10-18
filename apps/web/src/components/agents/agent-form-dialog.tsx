import {
	Bold,
	Check,
	ChevronDown,
	Code,
	Globe,
	Italic,
	Link2,
	List,
	ListOrdered,
	MoreHorizontal,
	Pencil,
	Plus,
	Quote,
	Redo2,
	Save,
	Send,
	Sparkles,
	Stethoscope,
	Strikethrough,
	Undo2,
	X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { HexAgentGlyph } from "./agent-avatar";
import type { AgentProfile } from "./agent-profile-dialog";

export interface AgentFormValues {
	slug: string;
	name: string;
	emoji: string;
	competence: string;
	systemPrompt: string;
	model?: string | null;
	skills: { name: string; description: string }[];
	connectors: { type: string; enabled: boolean }[];
	enabled: boolean;
}

export interface ConnectorOption {
	type: string;
	label: string;
	available: boolean;
}

const MODEL_OPTIONS = [
	"Claude Opus 5.5",
	"Claude Sonnet 4.5",
	"GPT-5",
	"Gemini 2.5 Pro",
	"o3-pro",
] as const;

const CHANNEL_PRESETS = [
	"Flow Review Chat",
	"Automated Flow Checks",
	"Slack",
	"Microsoft Teams",
	"Web Chat Widget",
] as const;

const SKILL_PRESETS = [
	{
		name: "Heuristic evaluation",
		description: "Audit steps against Nielsen's 10 usability heuristics.",
	},
	{
		name: "Friction finding",
		description: "Locate high cognitive-load steps likely to cause drop-off.",
	},
	{
		name: "Metric interpretation",
		description: "Interpret SEQ, task success rate, and time-on-task data.",
	},
	{
		name: "Microcopy review",
		description: "Audit button labels, error recovery hints, and tone clarity.",
	},
	{
		name: "Accessibility checks",
		description: "Flag WCAG 2.2 AA contrast and 48px touch target issues.",
	},
] as const;

const TOOL_PRESETS = [
	{ type: "flow-telemetry", label: "Flow telemetry" },
	{ type: "figma", label: "Figma inspect" },
	{ type: "mcp", label: "MCP server" },
	{ type: "jira", label: "Jira issues" },
	{ type: "github", label: "GitHub PR checks" },
] as const;

const KNOWLEDGE_PRESETS = [
	"Search all websites",
	"Alignment 663k Screens Benchmark DB",
	"Nielsen Norman 10 Heuristics",
	"WCAG 2.2 Accessibility Guidelines",
] as const;

const CONNECTED_AGENT_PRESETS = [
	{
		slug: "heuristic",
		name: "Heuristic",
		emoji: "🧭",
		role: "Usability expertise",
	},
	{ slug: "researcher", name: "Researcher", emoji: "🔎", role: "UX research" },
	{ slug: "pixel", name: "Pixel", emoji: "🎨", role: "User interface design" },
	{ slug: "wordsmith", name: "Wordsmith", emoji: "✍️", role: "UX writing" },
	{ slug: "tester", name: "Tester", emoji: "🧪", role: "QA & accessibility" },
] as const;

const EMOJI_CHOICES = [
	"</>",
	"🧭",
	"🔎",
	"🎨",
	"✍️",
	"🧪",
	"🤖",
	"🧠",
	"📊",
	"♿",
	"🛡️",
	"🚀",
];

const EXAMPLE_INSTRUCTION =
	"You are an IT support agent for Contoso employees. Help users troubleshoot common device and access issues. Be concise and clear. Ask follow-up questions if details are missing. If the issue requires admin access or sensitive account changes, direct the user to the help desk.";

const EMPTY: AgentFormValues = {
	slug: "",
	name: "",
	emoji: "</>",
	competence: "",
	systemPrompt: "",
	model: "Claude Opus 5.5",
	skills: [],
	connectors: [{ type: "web-search", enabled: true }],
	enabled: true,
};

function slugifyName(name: string): string {
	const cleaned = name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 24);
	return cleaned.length >= 2 ? cleaned : "untitled-agent";
}

type StudioTab = "build" | "preview" | "evaluate" | "monitor";

export function AgentFormDialog({
	open,
	agent,
	connectorOptions: _connectorOptions,
	saving,
	onClose,
	onSubmit,
}: {
	open: boolean;
	/** null → create mode */
	agent: AgentProfile | null;
	connectorOptions: ConnectorOption[];
	saving?: boolean;
	onClose: () => void;
	onSubmit: (values: AgentFormValues) => void;
}) {
	const [v, setV] = useState<AgentFormValues>(EMPTY);
	const [activeTab, setActiveTab] = useState<StudioTab>("build");

	// Identity inline editor state
	const [editingIdentity, setEditingIdentity] = useState(false);
	const titleInputRef = useRef<HTMLInputElement>(null);

	// Instructions undo/redo stack & ref
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [history, setHistory] = useState<string[]>([""]);
	const [historyIndex, setHistoryIndex] = useState(0);

	// Right-column interactive section states
	const [modelMenuOpen, setModelMenuOpen] = useState(false);
	const [channels, setChannels] = useState<string[]>([]);
	const [addingChannel, setAddingChannel] = useState(false);

	const [addingSkill, setAddingSkill] = useState(false);
	const [customSkillName, setCustomSkillName] = useState("");
	const [customSkillDesc, setCustomSkillDesc] = useState("");

	const [addingTool, setAddingTool] = useState(false);

	const [knowledgeItems, setKnowledgeItems] = useState<string[]>([
		"Search all websites",
	]);
	const [addingKnowledge, setAddingKnowledge] = useState(false);
	const [customKnowledge, setCustomKnowledge] = useState("");

	const [connectedAgents, setConnectedAgents] = useState<string[]>([]);
	const [addingConnectedAgent, setAddingConnectedAgent] = useState(false);

	const [memoryEnabled, setMemoryEnabled] = useState(false);

	// Top-bar popovers
	const [moreMenuOpen, setMoreMenuOpen] = useState(false);
	const [reviewModalOpen, setReviewModalOpen] = useState(false);

	// Preview chat state
	const [previewMessages, setPreviewMessages] = useState<
		{ id: string; role: "user" | "agent"; text: string }[]
	>([]);
	const [previewInput, setPreviewInput] = useState("");

	useEffect(() => {
		if (!open) return;
		setActiveTab("build");
		setEditingIdentity(false);
		setModelMenuOpen(false);
		setMoreMenuOpen(false);
		setReviewModalOpen(false);
		setAddingChannel(false);
		setAddingSkill(false);
		setAddingTool(false);
		setAddingKnowledge(false);
		setAddingConnectedAgent(false);
		setPreviewMessages([]);
		setPreviewInput("");

		if (agent) {
			const hasWebSearch = agent.connectors.some(
				(c) => c.type === "web-search" && c.enabled,
			);
			setV({
				slug: agent.slug,
				name: agent.name,
				emoji: agent.emoji || "</>",
				competence: agent.competence,
				systemPrompt: agent.systemPrompt,
				model: agent.model || "Claude Opus 5.5",
				skills: agent.skills,
				connectors: agent.connectors,
				enabled: agent.enabled,
			});
			setHistory([agent.systemPrompt]);
			setHistoryIndex(0);
			setKnowledgeItems(
				hasWebSearch ? ["Search all websites"] : ["Search all websites"],
			);
		} else {
			setV(EMPTY);
			setHistory([""]);
			setHistoryIndex(0);
			setChannels([]);
			setKnowledgeItems(["Search all websites"]);
			setConnectedAgents([]);
			setMemoryEnabled(false);
		}
	}, [open, agent]);

	useEffect(() => {
		if (!open) return;
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && !reviewModalOpen && !editingIdentity) {
				onClose();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [open, reviewModalOpen, editingIdentity, onClose]);

	useEffect(() => {
		if (editingIdentity) {
			requestAnimationFrame(() => {
				titleInputRef.current?.focus();
				titleInputRef.current?.select();
			});
		}
	}, [editingIdentity]);

	if (!open || typeof document === "undefined") return null;

	const set = <K extends keyof AgentFormValues>(
		k: K,
		val: AgentFormValues[K],
	) => setV((s) => ({ ...s, [k]: val }));

	const updateInstructions = (nextText: string) => {
		set("systemPrompt", nextText);
		const nextHistory = [...history.slice(0, historyIndex + 1), nextText].slice(
			-40,
		);
		setHistory(nextHistory);
		setHistoryIndex(nextHistory.length - 1);
	};

	const handleUndo = () => {
		if (historyIndex > 0) {
			const nextIdx = historyIndex - 1;
			setHistoryIndex(nextIdx);
			set("systemPrompt", history[nextIdx] ?? "");
		}
	};

	const handleRedo = () => {
		if (historyIndex < history.length - 1) {
			const nextIdx = historyIndex + 1;
			setHistoryIndex(nextIdx);
			set("systemPrompt", history[nextIdx] ?? "");
		}
	};

	const applyFormat = (
		prefix: string,
		suffix = prefix,
		placeholder = "text",
	) => {
		const el = textareaRef.current;
		if (!el) return;
		const start = el.selectionStart ?? v.systemPrompt.length;
		const end = el.selectionEnd ?? v.systemPrompt.length;
		const selected = v.systemPrompt.slice(start, end) || placeholder;
		const updated = `${v.systemPrompt.slice(0, start)}${prefix}${selected}${suffix}${v.systemPrompt.slice(end)}`;
		updateInstructions(updated);
		requestAnimationFrame(() => {
			el.focus();
			el.setSelectionRange(
				start + prefix.length,
				start + prefix.length + selected.length,
			);
		});
	};

	const buildFinalPayload = (publishNow: boolean): AgentFormValues => {
		const finalName = v.name.trim() || "Untitled Agent";
		const finalSlug =
			agent?.slug ||
			(v.slug.trim() && /^[a-z0-9_-]{2,40}$/.test(v.slug.trim())
				? v.slug.trim()
				: slugifyName(finalName));
		const finalPrompt = v.systemPrompt.trim() || EXAMPLE_INSTRUCTION;
		const firstLine = finalPrompt
			.split("\n")
			.map((l) => l.trim())
			.find(Boolean);
		const finalCompetence =
			v.competence.trim() ||
			(firstLine ? firstLine.slice(0, 80) : "Custom AI Specialist");

		const mergedConnectors = [...v.connectors];
		const hasWeb = knowledgeItems.includes("Search all websites");
		const webIdx = mergedConnectors.findIndex((c) => c.type === "web-search");
		if (webIdx >= 0) {
			mergedConnectors[webIdx] = { type: "web-search", enabled: hasWeb };
		} else if (hasWeb) {
			mergedConnectors.push({ type: "web-search", enabled: true });
		}

		return {
			slug: finalSlug,
			name: finalName,
			emoji: v.emoji.trim() || "</>",
			competence: finalCompetence,
			systemPrompt: finalPrompt,
			model: v.model || "Claude Opus 5.5",
			skills: v.skills,
			connectors: mergedConnectors,
			enabled: publishNow,
		};
	};

	const handleSaveDraft = () => {
		const payload = buildFinalPayload(false);
		onSubmit(payload);
	};

	const handlePublish = () => {
		const payload = buildFinalPayload(true);
		onSubmit(payload);
	};

	const activeTools = v.connectors.filter(
		(c) => c.enabled && c.type !== "web-search",
	);

	const toggleTool = (type: string) => {
		const exists = v.connectors.find((c) => c.type === type);
		if (exists) {
			set(
				"connectors",
				v.connectors.map((c) =>
					c.type === type ? { ...c, enabled: !c.enabled } : c,
				),
			);
		} else {
			set("connectors", [...v.connectors, { type, enabled: true }]);
		}
	};

	const handleSendPreview = (e: React.FormEvent) => {
		e.preventDefault();
		const msg = previewInput.trim();
		if (!msg) return;
		const displayName = v.name.trim() || "Untitled Agent";
		const userMsg = {
			id: `u-${Date.now()}`,
			role: "user" as const,
			text: msg,
		};
		const instructionsSummary = v.systemPrompt.trim()
			? `Following instructions ("${v.systemPrompt.trim().slice(0, 90)}${v.systemPrompt.trim().length > 90 ? "…" : ""}")`
			: "Operating with default Contoso IT support instructions";
		const replyMsg = {
			id: `a-${Date.now() + 1}`,
			role: "agent" as const,
			text: `[${displayName} · ${v.model || "Claude Opus 5.5"}] ${instructionsSummary}: I can help you evaluate "${msg}".${
				knowledgeItems.length > 0
					? ` Grounded with ${knowledgeItems.join(", ")}.`
					: ""
			}`,
		};
		setPreviewMessages((prev) => [...prev, userMsg, replyMsg]);
		setPreviewInput("");
	};

	const displayTitle = v.name.trim() || "Untitled Agent";
	const isHexAvatar = v.emoji === "</>" || v.emoji === "hex";

	return createPortal(
		<div className="fixed inset-0 z-50 flex flex-col bg-white text-neutral-900 antialiased selection:bg-indigo-600 selection:text-white">
			{/* ==================== TOP HEADER BAR (Matches Screenshot) ==================== */}
			<header className="flex h-14 shrink-0 items-center justify-between border-neutral-200/80 border-b bg-white px-5">
				{/* Left: Agent Title + Draft Badge */}
				<div className="flex min-w-0 items-center gap-3">
					<button
						type="button"
						onClick={() => setEditingIdentity(true)}
						className="cursor-pointer truncate font-semibold text-[15px] text-neutral-800 tracking-tight hover:text-neutral-950"
						title="Click to rename agent"
					>
						{displayTitle}
					</button>
					<span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/90 bg-neutral-100/90 px-2.5 py-0.5 font-medium text-[11px] text-neutral-600">
						<span
							className={`h-2 w-2 rounded-full ${
								agent?.enabled ? "bg-emerald-500" : "bg-neutral-500"
							}`}
						/>
						<span>{agent ? "Saved" : "Draft"}</span>
					</span>
				</div>

				{/* Center: Build | Preview | Evaluate | Monitor Segmented Switcher */}
				<div className="hidden items-center rounded-lg border border-neutral-200/90 bg-[#f3f4f6] p-0.5 sm:flex">
					<button
						type="button"
						onClick={() => setActiveTab("build")}
						className={`cursor-pointer rounded-[6px] px-5 py-1 text-xs transition-all ${
							activeTab === "build"
								? "border border-neutral-200/80 bg-white font-semibold text-[#4f52b2] shadow-2xs"
								: "font-medium text-neutral-700 hover:text-neutral-950"
						}`}
					>
						Build
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("preview")}
						className={`cursor-pointer rounded-[6px] px-5 py-1 text-xs transition-all ${
							activeTab === "preview"
								? "border border-neutral-200/80 bg-white font-semibold text-[#4f52b2] shadow-2xs"
								: "font-medium text-neutral-700 hover:text-neutral-950"
						}`}
					>
						Preview
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("evaluate")}
						className={`cursor-pointer rounded-[6px] px-5 py-1 text-xs transition-all ${
							activeTab === "evaluate"
								? "border border-neutral-200/80 bg-white font-semibold text-[#4f52b2] shadow-2xs"
								: "bg-neutral-200/50 font-medium text-neutral-400 hover:text-neutral-600"
						}`}
					>
						Evaluate
					</button>
					<button
						type="button"
						onClick={() => setActiveTab("monitor")}
						className={`cursor-pointer rounded-[6px] px-5 py-1 text-xs transition-all ${
							activeTab === "monitor"
								? "border border-neutral-200/80 bg-white font-semibold text-[#4f52b2] shadow-2xs"
								: "bg-neutral-200/50 font-medium text-neutral-400 hover:text-neutral-600"
						}`}
					>
						Monitor
					</button>
				</div>

				{/* Right: Action Icons + Review + Publish */}
				<div className="flex items-center gap-1.5">
					{/* 1. More (...) */}
					<div className="relative">
						<button
							type="button"
							onClick={() => setMoreMenuOpen((prev) => !prev)}
							aria-label="More options"
							className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
						>
							<MoreHorizontal className="h-4 w-4" />
						</button>

						{moreMenuOpen && (
							<div className="absolute top-10 right-0 z-30 w-52 rounded-xl border border-neutral-200 bg-white p-1.5 text-xs shadow-xl">
								<button
									type="button"
									onClick={() => {
										setMoreMenuOpen(false);
										setEditingIdentity(true);
									}}
									className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-neutral-700 hover:bg-neutral-100"
								>
									<Pencil className="h-3.5 w-3.5 text-neutral-500" />
									<span>Edit name, @handle &amp; icon</span>
								</button>
								<button
									type="button"
									onClick={() => {
										setMoreMenuOpen(false);
										updateInstructions(EXAMPLE_INSTRUCTION);
										toast.success("Inserted example instructions");
									}}
									className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-neutral-700 hover:bg-neutral-100"
								>
									<Sparkles className="h-3.5 w-3.5 text-neutral-500" />
									<span>Fill example instructions</span>
								</button>
								<div className="my-1 h-px bg-neutral-100" />
								<button
									type="button"
									onClick={() => {
										setMoreMenuOpen(false);
										onClose();
									}}
									className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left font-medium text-red-600 hover:bg-red-50"
								>
									<X className="h-3.5 w-3.5" />
									<span>Close agent studio</span>
								</button>
							</div>
						)}
					</div>

					{/* 2. Chat bubble with sparkles icon (matches screenshot) */}
					<button
						type="button"
						onClick={() =>
							setActiveTab((prev) => (prev === "preview" ? "build" : "preview"))
						}
						title="Test agent in Preview"
						aria-label="Test agent in Preview"
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
					>
						<svg
							viewBox="0 0 20 20"
							fill="none"
							className="h-4 w-4"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M14.5 3.5L15 5L16.5 5.5L15 6L14.5 7.5L14 6L12.5 5.5L14 5L14.5 3.5Z" />
							<path d="M10.5 6H6.5C4.84315 6 3.5 7.34315 3.5 9V12.5C3.5 14.1569 4.84315 15.5 6.5 15.5H7.5V17.5L10.5 15.5H13.5C15.1569 15.5 16.5 14.1569 16.5 12.5V9.5" />
						</svg>
					</button>

					{/* 3. Share / Export icon (matches screenshot box with top-right arrow) */}
					<button
						type="button"
						onClick={() => {
							navigator.clipboard?.writeText(window.location.href);
							toast.success("Agent configuration link copied to clipboard");
						}}
						title="Share agent"
						aria-label="Share agent"
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
					>
						<svg
							viewBox="0 0 20 20"
							fill="none"
							className="h-4 w-4"
							stroke="currentColor"
							strokeWidth="1.6"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M11 4.5H6.5C5.39543 4.5 4.5 5.39543 4.5 6.5V13.5C4.5 14.6046 5.39543 15.5 6.5 15.5H13.5C14.6046 15.5 15.5 14.6046 15.5 13.5V10.5" />
							<path d="M13.5 3.5H16.5V6.5" />
							<path d="M10.5 9.5L16.5 3.5" />
						</svg>
					</button>

					{/* 4. Save (Floppy disk icon) */}
					<button
						type="button"
						disabled={saving}
						onClick={handleSaveDraft}
						title="Save draft"
						aria-label="Save draft"
						className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-neutral-900 disabled:opacity-40"
					>
						<Save className="h-4 w-4" />
					</button>

					{/* 5. Review Button (with Stethoscope icon) */}
					<button
						type="button"
						onClick={() => setReviewModalOpen(true)}
						className="ml-1 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-200/90 bg-white px-3.5 font-semibold text-neutral-700 text-xs shadow-2xs transition-colors hover:bg-neutral-50"
					>
						<Stethoscope className="h-3.5 w-3.5 text-neutral-600" />
						<span>Review</span>
					</button>

					{/* 6. Publish Button (Soft lavender/indigo matching screenshot) */}
					<button
						type="button"
						disabled={saving}
						onClick={handlePublish}
						className="ml-1 inline-flex h-8 cursor-pointer items-center justify-center rounded-lg bg-[#e8ebfa] px-4 font-semibold text-[#4f52b2] text-xs transition-colors hover:bg-[#dce1f7] disabled:opacity-50"
					>
						{saving ? "Publishing…" : "Publish"}
					</button>
				</div>
			</header>

			{/* ==================== MAIN WORKSPACE AREA ==================== */}
			<div className="flex-1 overflow-y-auto bg-white">
				{activeTab === "build" && (
					<div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 items-start gap-10 px-6 pt-8 pb-20 sm:px-10 lg:grid-cols-[1fr_410px] lg:gap-14">
						{/* ==================== LEFT COLUMN: IDENTITY + INSTRUCTIONS ==================== */}
						<div className="min-w-0 pt-2">
							{/* Agent Identity Row */}
							<div className="flex items-center justify-between gap-4 pb-10">
								<div className="flex min-w-0 flex-1 items-center gap-5">
									{/* Blue-to-Purple Gradient Rounded Icon with Hexagonal </> Emblem */}
									<button
										type="button"
										onClick={() => setEditingIdentity((prev) => !prev)}
										title="Customize agent icon & identity"
										className="flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center rounded-[18px] bg-gradient-to-br from-[#4f9cf9] via-[#6366f1] to-[#7c3aed] text-white shadow-sm transition-transform hover:scale-105"
									>
										{isHexAvatar ? (
											<HexAgentGlyph className="h-9 w-9" />
										) : (
											<span className="text-3xl leading-none">{v.emoji}</span>
										)}
									</button>

									{/* Title or Inline Identity Editor */}
									{editingIdentity ? (
										<div className="flex flex-1 flex-col gap-2.5 rounded-2xl border border-neutral-200 bg-neutral-50/70 p-3.5">
											<div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
												<label className="space-y-1">
													<span className="font-semibold text-[11px] text-neutral-500">
														Agent Name
													</span>
													<input
														ref={titleInputRef}
														type="text"
														value={v.name}
														maxLength={80}
														placeholder="Untitled Agent"
														onChange={(e) => set("name", e.target.value)}
														onKeyDown={(e) => {
															if (e.key === "Enter") setEditingIdentity(false);
														}}
														className="h-8 w-full rounded-lg border border-neutral-300 bg-white px-2.5 font-semibold text-neutral-900 text-xs focus:border-[#4f52b2] focus:outline-none"
													/>
												</label>
												<label className="space-y-1">
													<span className="font-semibold text-[11px] text-neutral-500">
														@handle (optional)
													</span>
													<input
														type="text"
														value={v.slug}
														disabled={!!agent}
														placeholder={slugifyName(
															v.name || "Untitled Agent",
														)}
														onChange={(e) =>
															set(
																"slug",
																e.target.value
																	.toLowerCase()
																	.replace(/[^a-z0-9_-]/g, ""),
															)
														}
														className="h-8 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-neutral-900 text-xs focus:border-[#4f52b2] focus:outline-none disabled:opacity-50"
													/>
												</label>
											</div>

											<label className="space-y-1">
												<span className="font-semibold text-[11px] text-neutral-500">
													Role / Specialty Summary
												</span>
												<input
													type="text"
													value={v.competence}
													maxLength={140}
													placeholder="e.g. IT support & device troubleshooting specialist"
													onChange={(e) => set("competence", e.target.value)}
													className="h-8 w-full rounded-lg border border-neutral-300 bg-white px-2.5 text-neutral-900 text-xs focus:border-[#4f52b2] focus:outline-none"
												/>
											</label>

											<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
												<div className="flex flex-wrap items-center gap-1">
													{EMOJI_CHOICES.map((em) => (
														<button
															key={em}
															type="button"
															onClick={() => set("emoji", em)}
															className={`flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-xs transition-all ${
																v.emoji === em
																	? "bg-[#e8ebfa] ring-2 ring-[#4f52b2]"
																	: "bg-white hover:bg-neutral-100"
															}`}
														>
															{em === "</>" ? (
																<span className="font-bold font-mono text-[#4f52b2] text-[10px]">
																	&lt;/&gt;
																</span>
															) : (
																em
															)}
														</button>
													))}
												</div>
												<button
													type="button"
													onClick={() => setEditingIdentity(false)}
													className="cursor-pointer rounded-lg bg-[#4f52b2] px-3 py-1 font-semibold text-white text-xs hover:bg-[#404399]"
												>
													Done
												</button>
											</div>
										</div>
									) : (
										<h1
											onClick={() => setEditingIdentity(true)}
											className="cursor-pointer truncate font-bold text-[#52525b] text-[32px] tracking-tight hover:text-neutral-800"
										>
											{displayTitle}
										</h1>
									)}
								</div>

								{/* Pencil Edit Button on the Right */}
								{!editingIdentity && (
									<button
										type="button"
										onClick={() => setEditingIdentity(true)}
										aria-label="Edit agent name and icon"
										className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-800"
									>
										<Pencil className="h-4 w-4" />
									</button>
								)}
							</div>

							{/* ==================== INSTRUCTIONS SECTION ==================== */}
							<div className="pt-2">
								{/* Instructions Header + Rich Formatting Toolbar */}
								<div className="flex items-center justify-between pb-3">
									<span className="font-bold text-[13px] text-neutral-800">
										Instructions
									</span>

									{/* Rich-text formatting toolbar (Matches every icon in screenshot) */}
									<div className="flex items-center gap-0.5 text-neutral-500">
										<button
											type="button"
											onClick={handleUndo}
											disabled={historyIndex <= 0}
											title="Undo"
											aria-label="Undo"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40"
										>
											<Undo2 className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={handleRedo}
											disabled={historyIndex >= history.length - 1}
											title="Redo"
											aria-label="Redo"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800 disabled:opacity-40"
										>
											<Redo2 className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={() => applyFormat("**", "**", "bold")}
											title="Bold"
											aria-label="Bold"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Bold className="h-3.5 w-3.5 stroke-[2.5]" />
										</button>
										<button
											type="button"
											onClick={() => applyFormat("*", "*", "italic")}
											title="Italic"
											aria-label="Italic"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Italic className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={() => applyFormat("~~", "~~", "strikethrough")}
											title="Strikethrough"
											aria-label="Strikethrough"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Strikethrough className="h-3.5 w-3.5" />
										</button>

										<span className="mx-1.5 h-4 w-px bg-neutral-200" />

										<button
											type="button"
											onClick={() => applyFormat("\n- ", "", "List item")}
											title="Bulleted list"
											aria-label="Bulleted list"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<List className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={() => applyFormat("\n1. ", "", "Numbered item")}
											title="Numbered list"
											aria-label="Numbered list"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<ListOrdered className="h-3.5 w-3.5" />
										</button>

										<span className="mx-1.5 h-4 w-px bg-neutral-200" />

										{/* "Ab" formatting icon matching screenshot */}
										<button
											type="button"
											onClick={() => applyFormat("## ", "", "Heading")}
											title="Text style"
											aria-label="Text style"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<span className="font-semibold text-[11px] leading-none tracking-tighter">
												Ab
											</span>
										</button>

										<span className="mx-1.5 h-4 w-px bg-neutral-200" />

										<button
											type="button"
											onClick={() => applyFormat("\n> ", "", "Quote")}
											title="Quote"
											aria-label="Quote"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Quote className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={() => applyFormat("`", "`", "code")}
											title="Code"
											aria-label="Code"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Code className="h-3.5 w-3.5" />
										</button>
										<button
											type="button"
											onClick={() =>
												applyFormat("[", "](https://example.com)", "link")
											}
											title="Insert link"
											aria-label="Insert link"
											className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md hover:bg-neutral-100 hover:text-neutral-800"
										>
											<Link2 className="h-3.5 w-3.5" />
										</button>
									</div>
								</div>

								{/* Instructions Editor with Exact Multi-paragraph Guide Overlay */}
								<div className="relative min-h-[380px]">
									{!v.systemPrompt && (
										<div
											onClick={() => textareaRef.current?.focus()}
											className="pointer-events-none select-none space-y-5 pt-1 text-[13.5px] text-neutral-600 leading-[1.65]"
										>
											<p>
												Instructions tell your agent how to behave, what it
												should help with, and how it should respond.
											</p>

											<div>
												<p>Describe:</p>
												<ul className="space-y-0.5">
													<li>- The agent&apos;s role and goal</li>
													<li>- What is in and out of scope</li>
													<li>- The tone and response style</li>
													<li>
														- When the agent should ask questions, use
														knowledge, or take actions
													</li>
												</ul>
											</div>

											<div>
												<p>Example:</p>
												<p className="max-w-2xl">
													You are an IT support agent for Contoso employees.
													Help users troubleshoot common device and access
													issues. Be concise and clear. Ask follow-up questions
													if details are missing. If the issue requires admin
													access or sensitive account changes, direct the user
													to the help desk.
												</p>
											</div>
										</div>
									)}

									<textarea
										ref={textareaRef}
										value={v.systemPrompt}
										onChange={(e) => updateInstructions(e.target.value)}
										aria-label="Agent instructions"
										className={`w-full resize-none bg-transparent pt-1 text-[13.5px] text-neutral-800 leading-[1.65] focus:outline-none ${
											v.systemPrompt
												? "min-h-[380px]"
												: "absolute inset-0 h-full w-full"
										}`}
									/>
								</div>
							</div>
						</div>

						{/* ==================== RIGHT COLUMN: CONFIGURATION CARD (Matches Screenshot) ==================== */}
						<div className="space-y-6 rounded-2xl border border-neutral-200/90 bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
							{/* 1. Model */}
							<div className="flex items-center justify-between gap-4">
								<span className="font-bold text-[13px] text-neutral-800">
									Model
								</span>
								<div className="relative">
									<button
										type="button"
										onClick={() => setModelMenuOpen((prev) => !prev)}
										className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 text-xs shadow-2xs transition-colors hover:bg-neutral-50"
									>
										<span>{v.model || "Claude Opus 5.5"}</span>
										<ChevronDown className="h-3.5 w-3.5 text-neutral-500" />
									</button>

									{modelMenuOpen && (
										<div className="absolute top-9 right-0 z-20 w-48 rounded-xl border border-neutral-200 bg-white p-1 shadow-xl">
											{MODEL_OPTIONS.map((m) => (
												<button
													key={m}
													type="button"
													onClick={() => {
														set("model", m);
														setModelMenuOpen(false);
													}}
													className={`flex w-full cursor-pointer items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs ${
														(v.model || "Claude Opus 5.5") === m
															? "bg-[#e8ebfa]/60 font-semibold text-[#4f52b2]"
															: "text-neutral-700 hover:bg-neutral-100"
													}`}
												>
													<span>{m}</span>
													{(v.model || "Claude Opus 5.5") === m && (
														<Check className="h-3.5 w-3.5 text-[#4f52b2]" />
													)}
												</button>
											))}
										</div>
									)}
								</div>
							</div>

							{/* 2. Channels */}
							<div className="space-y-2.5">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-bold text-[13px] text-neutral-800">
											Channels
										</div>
										<div className="mt-0.5 text-neutral-500 text-xs">
											Define where users can interact with the agent.
										</div>
									</div>
									<button
										type="button"
										onClick={() => setAddingChannel((prev) => !prev)}
										aria-label="Add channel"
										className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>

								{channels.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{channels.map((ch) => (
											<span
												key={ch}
												className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 text-xs shadow-2xs"
											>
												<span>{ch}</span>
												<button
													type="button"
													onClick={() =>
														setChannels((prev) => prev.filter((x) => x !== ch))
													}
													aria-label={`Remove ${ch}`}
													className="cursor-pointer text-neutral-400 hover:text-neutral-700"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											</span>
										))}
									</div>
								)}

								{addingChannel && (
									<div className="space-y-1.5 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
										<div className="font-semibold text-[11px] text-neutral-500">
											Add interaction channel
										</div>
										<div className="flex flex-wrap gap-1.5">
											{CHANNEL_PRESETS.map((ch) => {
												const active = channels.includes(ch);
												return (
													<button
														key={ch}
														type="button"
														onClick={() => {
															setChannels((prev) =>
																active
																	? prev.filter((x) => x !== ch)
																	: [...prev, ch],
															);
														}}
														className={`cursor-pointer rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
															active
																? "border-[#4f52b2] bg-[#e8ebfa] text-[#4f52b2]"
																: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
														}`}
													>
														{ch}
													</button>
												);
											})}
										</div>
									</div>
								)}
							</div>

							{/* 3. Skills */}
							<div className="space-y-2.5">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-bold text-[13px] text-neutral-800">
											Skills
										</div>
										<div className="mt-0.5 text-neutral-500 text-xs">
											Define behaviors through structured instructions
										</div>
									</div>
									<button
										type="button"
										onClick={() => setAddingSkill((prev) => !prev)}
										aria-label="Add skill"
										className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>

								{v.skills.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{v.skills.map((s, idx) => (
											<span
												key={`${s.name}-${idx}`}
												title={s.description}
												className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 text-xs shadow-2xs"
											>
												<span>{s.name}</span>
												<button
													type="button"
													onClick={() =>
														set(
															"skills",
															v.skills.filter((_, i) => i !== idx),
														)
													}
													aria-label={`Remove ${s.name}`}
													className="cursor-pointer text-neutral-400 hover:text-neutral-700"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											</span>
										))}
									</div>
								)}

								{addingSkill && (
									<div className="space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3">
										<div className="font-semibold text-[11px] text-neutral-500">
											Preset skills
										</div>
										<div className="flex flex-wrap gap-1.5">
											{SKILL_PRESETS.map((preset) => {
												const active = v.skills.some(
													(s) => s.name === preset.name,
												);
												return (
													<button
														key={preset.name}
														type="button"
														onClick={() => {
															if (active) {
																set(
																	"skills",
																	v.skills.filter(
																		(s) => s.name !== preset.name,
																	),
																);
															} else {
																set("skills", [...v.skills, { ...preset }]);
															}
														}}
														className={`cursor-pointer rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
															active
																? "border-[#4f52b2] bg-[#e8ebfa] text-[#4f52b2]"
																: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
														}`}
													>
														{preset.name}
													</button>
												);
											})}
										</div>

										<div className="space-y-1.5 border-neutral-200 border-t pt-2">
											<input
												type="text"
												value={customSkillName}
												onChange={(e) => setCustomSkillName(e.target.value)}
												placeholder="Custom skill name..."
												className="h-7 w-full rounded-lg border border-neutral-200 bg-white px-2.5 text-xs focus:border-[#4f52b2] focus:outline-none"
											/>
											<div className="flex gap-1.5">
												<input
													type="text"
													value={customSkillDesc}
													onChange={(e) => setCustomSkillDesc(e.target.value)}
													placeholder="Structured instruction..."
													className="h-7 flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs focus:border-[#4f52b2] focus:outline-none"
												/>
												<button
													type="button"
													onClick={() => {
														if (!customSkillName.trim()) return;
														set("skills", [
															...v.skills,
															{
																name: customSkillName.trim(),
																description:
																	customSkillDesc.trim() ||
																	"Structured behavioral skill",
															},
														]);
														setCustomSkillName("");
														setCustomSkillDesc("");
													}}
													className="cursor-pointer rounded-lg bg-[#4f52b2] px-2.5 font-semibold text-[11px] text-white hover:bg-[#404399]"
												>
													Add
												</button>
											</div>
										</div>
									</div>
								)}
							</div>

							{/* 4. Tools */}
							<div className="space-y-2.5">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-bold text-[13px] text-neutral-800">
											Tools
										</div>
										<div className="mt-0.5 text-neutral-500 text-xs">
											Connect the agent to external systems and actions
										</div>
									</div>
									<button
										type="button"
										onClick={() => setAddingTool((prev) => !prev)}
										aria-label="Add tool"
										className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>

								{activeTools.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{activeTools.map((tool) => {
											const label =
												TOOL_PRESETS.find((t) => t.type === tool.type)?.label ||
												tool.type;
											return (
												<span
													key={tool.type}
													className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 text-xs shadow-2xs"
												>
													<span>{label}</span>
													<button
														type="button"
														onClick={() => toggleTool(tool.type)}
														aria-label={`Remove ${label}`}
														className="cursor-pointer text-neutral-400 hover:text-neutral-700"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												</span>
											);
										})}
									</div>
								)}

								{addingTool && (
									<div className="space-y-1.5 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
										<div className="font-semibold text-[11px] text-neutral-500">
											Connect external tools
										</div>
										<div className="flex flex-wrap gap-1.5">
											{TOOL_PRESETS.map((tool) => {
												const isOn = v.connectors.some(
													(c) => c.type === tool.type && c.enabled,
												);
												return (
													<button
														key={tool.type}
														type="button"
														onClick={() => toggleTool(tool.type)}
														className={`cursor-pointer rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
															isOn
																? "border-[#4f52b2] bg-[#e8ebfa] text-[#4f52b2]"
																: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
														}`}
													>
														{tool.label}
													</button>
												);
											})}
										</div>
									</div>
								)}
							</div>

							{/* 5. Knowledge (Includes "🌐 Search all websites ×" Pill Matching Screenshot) */}
							<div className="space-y-3">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-bold text-[13px] text-neutral-800">
											Knowledge
										</div>
										<div className="mt-0.5 text-neutral-500 text-xs">
											Provide trusted context to guide decisions
										</div>
									</div>
									<button
										type="button"
										onClick={() => setAddingKnowledge((prev) => !prev)}
										aria-label="Add knowledge source"
										className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>

								{/* Active Knowledge Pills (Default: Search all websites) */}
								{knowledgeItems.length > 0 && (
									<div className="flex flex-wrap gap-2">
										{knowledgeItems.map((item) => (
											<div
												key={item}
												className="inline-flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-1.5 font-medium text-neutral-700 text-xs shadow-2xs"
											>
												<Globe className="h-3.5 w-3.5 text-neutral-500" />
												<span>{item}</span>
												<button
													type="button"
													onClick={() =>
														setKnowledgeItems((prev) =>
															prev.filter((x) => x !== item),
														)
													}
													aria-label={`Remove ${item}`}
													className="ml-0.5 cursor-pointer text-neutral-400 transition-colors hover:text-neutral-700"
												>
													<X className="h-3.5 w-3.5" />
												</button>
											</div>
										))}
									</div>
								)}

								{addingKnowledge && (
									<div className="space-y-2 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
										<div className="flex flex-wrap gap-1.5">
											{KNOWLEDGE_PRESETS.map((k) => {
												const active = knowledgeItems.includes(k);
												return (
													<button
														key={k}
														type="button"
														onClick={() =>
															setKnowledgeItems((prev) =>
																active
																	? prev.filter((x) => x !== k)
																	: [...prev, k],
															)
														}
														className={`cursor-pointer rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
															active
																? "border-[#4f52b2] bg-[#e8ebfa] text-[#4f52b2]"
																: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
														}`}
													>
														{k}
													</button>
												);
											})}
										</div>
										<div className="flex gap-1.5">
											<input
												type="text"
												value={customKnowledge}
												onChange={(e) => setCustomKnowledge(e.target.value)}
												placeholder="Add website URL or knowledge base..."
												className="h-7 flex-1 rounded-lg border border-neutral-200 bg-white px-2.5 text-xs focus:border-[#4f52b2] focus:outline-none"
											/>
											<button
												type="button"
												onClick={() => {
													if (!customKnowledge.trim()) return;
													setKnowledgeItems((prev) => [
														...prev,
														customKnowledge.trim(),
													]);
													setCustomKnowledge("");
												}}
												className="cursor-pointer rounded-lg bg-[#4f52b2] px-2.5 font-semibold text-[11px] text-white hover:bg-[#404399]"
											>
												Add
											</button>
										</div>
									</div>
								)}
							</div>

							{/* 6. Connected agents */}
							<div className="space-y-2.5">
								<div className="flex items-start justify-between gap-3">
									<div>
										<div className="font-bold text-[13px] text-neutral-800">
											Connected agents
										</div>
										<div className="mt-0.5 text-neutral-500 text-xs">
											Collaborate across agents to complete work
										</div>
									</div>
									<button
										type="button"
										onClick={() => setAddingConnectedAgent((prev) => !prev)}
										aria-label="Connect agent"
										className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
									>
										<Plus className="h-4 w-4" />
									</button>
								</div>

								{connectedAgents.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{connectedAgents.map((slug) => {
											const found = CONNECTED_AGENT_PRESETS.find(
												(a) => a.slug === slug,
											);
											return (
												<span
													key={slug}
													className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-2.5 py-1 font-medium text-neutral-700 text-xs shadow-2xs"
												>
													<span>{found?.emoji || "🤖"}</span>
													<span>{found?.name || slug}</span>
													<button
														type="button"
														onClick={() =>
															setConnectedAgents((prev) =>
																prev.filter((x) => x !== slug),
															)
														}
														aria-label={`Disconnect ${slug}`}
														className="cursor-pointer text-neutral-400 hover:text-neutral-700"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												</span>
											);
										})}
									</div>
								)}

								{addingConnectedAgent && (
									<div className="space-y-1.5 rounded-xl border border-neutral-200 bg-neutral-50/70 p-2.5">
										<div className="font-semibold text-[11px] text-neutral-500">
											Select workspace agents to collaborate
										</div>
										<div className="flex flex-wrap gap-1.5">
											{CONNECTED_AGENT_PRESETS.map((ag) => {
												const active = connectedAgents.includes(ag.slug);
												return (
													<button
														key={ag.slug}
														type="button"
														onClick={() =>
															setConnectedAgents((prev) =>
																active
																	? prev.filter((x) => x !== ag.slug)
																	: [...prev, ag.slug],
															)
														}
														className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-medium text-[11px] transition-colors ${
															active
																? "border-[#4f52b2] bg-[#e8ebfa] text-[#4f52b2]"
																: "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
														}`}
													>
														<span>{ag.emoji}</span>
														<span>{ag.name}</span>
													</button>
												);
											})}
										</div>
									</div>
								)}
							</div>

							{/* 7. Memory (Preview badge + Toggle Switch matching screenshot) */}
							<div className="flex items-start justify-between gap-4 pt-1">
								<div className="space-y-0.5">
									<div className="flex items-center gap-1.5">
										<span className="font-bold text-[13px] text-neutral-800">
											Memory
										</span>
										<span className="rounded border border-neutral-200/90 bg-neutral-100 px-1.5 py-0.5 font-medium text-[10px] text-neutral-500 leading-none">
											Preview
										</span>
									</div>
									<p className="text-neutral-500 text-xs leading-relaxed">
										Allow the agent to remember and use information to improve
										future responses.
									</p>
								</div>

								{/* Toggle Switch matching Screenshot */}
								<button
									type="button"
									role="switch"
									aria-checked={memoryEnabled}
									aria-label="Toggle agent memory"
									onClick={() => setMemoryEnabled((prev) => !prev)}
									className={`mt-1 flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors ${
										memoryEnabled
											? "border-[#4f52b2] bg-[#4f52b2]"
											: "border-neutral-300 bg-white"
									}`}
								>
									<span
										className={`h-4 w-4 rounded-full transition-transform ${
											memoryEnabled
												? "translate-x-5 bg-white"
												: "translate-x-0.5 bg-neutral-600"
										}`}
									/>
								</button>
							</div>
						</div>
					</div>
				)}

				{/* ==================== PREVIEW TAB ==================== */}
				{activeTab === "preview" && (
					<div className="mx-auto flex max-w-2xl flex-col px-6 py-10">
						<div className="flex flex-col items-center pb-8 text-center">
							<div className="flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#4f9cf9] via-[#6366f1] to-[#7c3aed] text-white shadow-sm">
								{isHexAvatar ? (
									<HexAgentGlyph className="h-9 w-9" />
								) : (
									<span className="text-3xl">{v.emoji}</span>
								)}
							</div>
							<h2 className="mt-4 font-bold text-neutral-900 text-xl">
								{displayTitle}
							</h2>
							<p className="mt-1 text-neutral-500 text-xs">
								Powered by {v.model || "Claude Opus 5.5"} ·{" "}
								{knowledgeItems.length} knowledge source(s)
							</p>
						</div>

						<div className="flex min-h-[340px] flex-col justify-between rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5">
							<div className="max-h-[320px] space-y-3 overflow-y-auto">
								{previewMessages.length === 0 ? (
									<div className="py-16 text-center text-neutral-400 text-xs">
										Send a test prompt to preview how{" "}
										<strong className="text-neutral-600">{displayTitle}</strong>{" "}
										responds using your instructions.
									</div>
								) : (
									previewMessages.map((m) => (
										<div
											key={m.id}
											className={`flex ${
												m.role === "user" ? "justify-end" : "justify-start"
											}`}
										>
											<div
												className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
													m.role === "user"
														? "bg-[#4f52b2] text-white"
														: "border border-neutral-200 bg-white text-neutral-800 shadow-2xs"
												}`}
											>
												{m.text}
											</div>
										</div>
									))
								)}
							</div>

							<form
								onSubmit={handleSendPreview}
								className="mt-4 flex items-center gap-2"
							>
								<input
									type="text"
									value={previewInput}
									onChange={(e) => setPreviewInput(e.target.value)}
									placeholder={`Ask ${displayTitle} a question...`}
									className="h-10 flex-1 rounded-xl border border-neutral-200 bg-white px-3.5 text-xs focus:border-[#4f52b2] focus:outline-none"
								/>
								<button
									type="submit"
									className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-[#4f52b2] text-white hover:bg-[#404399]"
									aria-label="Send test message"
								>
									<Send className="h-4 w-4" />
								</button>
							</form>
						</div>
					</div>
				)}

				{/* ==================== EVALUATE / MONITOR TABS ==================== */}
				{(activeTab === "evaluate" || activeTab === "monitor") && (
					<div className="mx-auto max-w-2xl px-6 py-16 text-center">
						<div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#e8ebfa] text-[#4f52b2]">
							<Stethoscope className="h-6 w-6" />
						</div>
						<h3 className="mt-4 font-bold text-base text-neutral-900">
							{activeTab === "evaluate"
								? "Agent Evaluation Suite"
								: "Real-Time Telemetry Monitor"}
						</h3>
						<p className="mt-1 text-neutral-500 text-xs leading-relaxed">
							{activeTab === "evaluate"
								? "Publish your agent first to run automated test sets, accuracy benchmarks, and groundedness evaluations."
								: "Publish your agent to monitor response latency, token consumption, and user satisfaction scores."}
						</p>
						<button
							type="button"
							onClick={() => setActiveTab("build")}
							className="mt-5 cursor-pointer rounded-lg bg-[#e8ebfa] px-4 py-2 font-semibold text-[#4f52b2] text-xs hover:bg-[#dce1f7]"
						>
							Back to Build
						</button>
					</div>
				)}
			</div>

			{/* ==================== REVIEW READINESS MODAL ==================== */}
			{reviewModalOpen && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
					<div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-2">
								<Stethoscope className="h-4 w-4 text-[#4f52b2]" />
								<h3 className="font-bold text-neutral-900 text-sm">
									Agent Readiness Review
								</h3>
							</div>
							<button
								type="button"
								onClick={() => setReviewModalOpen(false)}
								className="cursor-pointer text-neutral-400 hover:text-neutral-700"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						<div className="mt-4 space-y-2.5 text-xs">
							<div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5">
								<span className="font-medium text-neutral-700">
									Agent Identity
								</span>
								<span className="font-semibold text-emerald-600">
									{displayTitle}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5">
								<span className="font-medium text-neutral-700">
									Foundation Model
								</span>
								<span className="font-semibold text-neutral-900">
									{v.model || "Claude Opus 5.5"}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5">
								<span className="font-medium text-neutral-700">
									Instructions
								</span>
								<span
									className={`font-semibold ${
										v.systemPrompt.trim()
											? "text-emerald-600"
											: "text-amber-600"
									}`}
								>
									{v.systemPrompt.trim()
										? `${v.systemPrompt.trim().split(/\s+/).length} words configured`
										: "Will use default template"}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5">
								<span className="font-medium text-neutral-700">
									Knowledge &amp; Grounding
								</span>
								<span className="font-semibold text-neutral-900">
									{knowledgeItems.length} active
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neutral-200/80 bg-neutral-50/70 px-3.5 py-2.5">
								<span className="font-medium text-neutral-700">Memory</span>
								<span className="font-semibold text-neutral-900">
									{memoryEnabled ? "Enabled (Preview)" : "Disabled"}
								</span>
							</div>
						</div>

						<div className="mt-5 flex justify-end gap-2">
							<button
								type="button"
								onClick={() => setReviewModalOpen(false)}
								className="cursor-pointer rounded-lg border border-neutral-200 px-3.5 py-1.5 font-semibold text-neutral-700 text-xs hover:bg-neutral-50"
							>
								Close
							</button>
							<button
								type="button"
								disabled={saving}
								onClick={() => {
									setReviewModalOpen(false);
									handlePublish();
								}}
								className="cursor-pointer rounded-lg bg-[#e8ebfa] px-4 py-1.5 font-semibold text-[#4f52b2] text-xs hover:bg-[#dce1f7]"
							>
								Publish Agent
							</button>
						</div>
					</div>
				</div>
			)}
		</div>,
		document.body,
	);
}
