"use client";

import {
	Dialog,
	DialogDescription,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@IvO/ui/components/dropdown-menu";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@IvO/ui/components/empty";
import {
	Message,
	MessageAvatar,
	MessageContent,
	MessageFooter,
	MessageHeader,
} from "@IvO/ui/components/message";
import {
	MessageScroller,
	MessageScrollerButton,
	MessageScrollerContent,
	MessageScrollerItem,
	MessageScrollerProvider,
	MessageScrollerViewport,
} from "@IvO/ui/components/message-scroller";
import {
	Popover,
	PopoverContent,
	PopoverTitle,
	PopoverTrigger,
} from "@IvO/ui/components/popover";
import { Suggestion, Suggestions } from "@IvO/ui/components/suggestion";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@IvO/ui/components/tooltip";
import { useQuery } from "@tanstack/react-query";
import {
	ArrowRight,
	ArrowUp,
	Check,
	Copy,
	Key,
	LayoutGrid,
	Plus,
	Radio,
	ScanSearch,
	SlidersHorizontal,
	Sparkles,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
	type AgentProfile,
	AgentProfileDialog,
} from "@/components/agents/agent-profile-dialog";
import { RichText } from "@/components/agents/rich-text";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { authClient } from "@/lib/auth-client";
import { useTRPC } from "@/utils/trpc";

/* -------------------------------------------------------------------------
 * Authentic Provider Vector Icons
 * ----------------------------------------------------------------------- */

export function OpenAIIcon({
	className = "h-3.5 w-3.5",
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1683a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.6667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1635a.0804.0804 0 0 1-.038-.0567V6.0748a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.4598a.7948.7948 0 0 0-.3927.6813v6.7219zm1.2681-2.9242l2.425-1.3963 2.425 1.3963v2.7913l-2.425 1.3964-2.425-1.3964z" />
		</svg>
	);
}

export function AnthropicIcon({
	className = "h-3.5 w-3.5",
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M13.827 3.5h3.693L24 20.5h-3.693l-1.92-4.477H9.51L7.59 20.5H3.897L10.373 3.5h3.454zm2.146 9.697l-2.483-5.792-2.484 5.792h4.967z" />
		</svg>
	);
}

export function GeminiIcon({
	className = "h-3.5 w-3.5",
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 24 24"
			fill="currentColor"
			className={className}
			aria-hidden="true"
		>
			<path d="M12 2a10 10 0 0 0-2.4 6.8A10 10 0 0 0 2.8 12a10 10 0 0 0 6.8 2.4A10 10 0 0 0 12 22a10 10 0 0 0 2.4-6.8A10 10 0 0 0 21.2 12a10 10 0 0 0-6.8-2.4A10 10 0 0 0 12 2z" />
		</svg>
	);
}

/* -------------------------------------------------------------------------
 * Fallback & Built-in Agents
 * ----------------------------------------------------------------------- */

const FALLBACK_AGENTS: AgentProfile[] = [
	{
		id: "builtin-heuristic",
		slug: "heuristic",
		name: "Heuristic",
		emoji: "🧭",
		competence: "Usability expertise",
		systemPrompt: "Audit steps against Nielsen's 10 heuristics.",
		model: null,
		enabled: true,
		skills: [
			{
				name: "Heuristic evaluation",
				description: "Audit steps against Nielsen's 10 heuristics.",
			},
		],
		connectors: [{ type: "flow-telemetry", enabled: true }],
		builtinKey: "heuristic",
	},
	{
		id: "builtin-researcher",
		slug: "researcher",
		name: "Researcher",
		emoji: "🔎",
		competence: "UX research",
		systemPrompt:
			"Interpret time-on-task, success rate, SEQ and drop-off data.",
		model: null,
		enabled: true,
		skills: [
			{
				name: "Metric interpretation",
				description: "Explain SEQ, success rate and time on task.",
			},
		],
		connectors: [{ type: "flow-telemetry", enabled: true }],
		builtinKey: "researcher",
	},
	{
		id: "builtin-pixel",
		slug: "pixel",
		name: "Pixel",
		emoji: "🎨",
		competence: "User interface design",
		systemPrompt:
			"Comment on visual hierarchy, consistency and component choices.",
		model: null,
		enabled: true,
		skills: [
			{
				name: "Visual hierarchy",
				description: "Review layout, emphasis and spacing.",
			},
		],
		connectors: [{ type: "flow-telemetry", enabled: true }],
		builtinKey: "pixel",
	},
	{
		id: "builtin-wordsmith",
		slug: "wordsmith",
		name: "Wordsmith",
		emoji: "✍️",
		competence: "UX writing",
		systemPrompt: "Review microcopy, button labels and tone.",
		model: null,
		enabled: true,
		skills: [
			{
				name: "Microcopy review",
				description: "Improve labels, hints and errors.",
			},
		],
		connectors: [{ type: "flow-telemetry", enabled: true }],
		builtinKey: "wordsmith",
	},
	{
		id: "builtin-tester",
		slug: "tester",
		name: "Tester",
		emoji: "🧪",
		competence: "QA & accessibility testing",
		systemPrompt: "Think of edge cases, accessibility and failure states.",
		model: null,
		enabled: true,
		skills: [
			{ name: "Accessibility checks", description: "Flag WCAG issues." },
		],
		connectors: [{ type: "flow-telemetry", enabled: true }],
		builtinKey: "tester",
	},
];

/* -------------------------------------------------------------------------
 * Provider Configs
 * ----------------------------------------------------------------------- */

export interface AiProviderConfig {
	id: string;
	name: string;
	icon: "openai" | "anthropic" | "gemini";
	status: "connected" | "active" | "available";
	models: string[];
	defaultModel: string;
	latency: string;
	contextWindow: string;
}

const AI_PROVIDERS: AiProviderConfig[] = [
	{
		id: "openai",
		name: "OpenAI",
		icon: "openai",
		status: "active",
		models: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
		defaultModel: "gpt-4o",
		latency: "140ms",
		contextWindow: "128k",
	},
	{
		id: "anthropic",
		name: "Anthropic",
		icon: "anthropic",
		status: "connected",
		models: ["claude-3-7-sonnet", "claude-3-5-haiku"],
		defaultModel: "claude-3-7-sonnet",
		latency: "190ms",
		contextWindow: "200k",
	},
	{
		id: "gemini",
		name: "Google Gemini",
		icon: "gemini",
		status: "available",
		models: ["gemini-2.5-pro", "gemini-2.5-flash"],
		defaultModel: "gemini-2.5-pro",
		latency: "120ms",
		contextWindow: "1M",
	},
];

const SHORTCUT_QUESTIONS = [
	"Where is the highest drop-off friction in this flow?",
	"Audit Nielsen's usability heuristics on this screen",
	"Suggest CTA copy variations to boost conversion",
	"Create a usability testing scenario for researchers",
];

interface ChatMessageItem {
	id: string;
	role: "user" | "assistant";
	agentId?: string;
	authorName: string;
	authorAvatar?: string;
	content: string;
	timestamp: string;
}

interface FlowAiChatProps {
	flow: DashboardFlow;
	activeScreenIndex?: number;
	onOpenPricing?: () => void;
}

export function FlowAiChat({
	flow,
	activeScreenIndex = 0,
	onOpenPricing,
}: FlowAiChatProps) {
	const trpc = useTRPC();
	const { data: sessionData } = authClient.useSession();
	const isAuthenticated = Boolean(sessionData?.user);

	// Provider & Parameter state
	const [selectedProviderKey, setSelectedProviderKey] =
		useState<string>("openai");
	const [selectedModel, setSelectedModel] = useState<string>("gpt-4o");
	const [temperature, setTemperature] = useState<number>(0.2);
	const [maxTokens, setMaxTokens] = useState<number>(2048);
	const [systemMode, setSystemMode] = useState<
		"audit" | "creative" | "concise"
	>("audit");
	const [providerDialogOpen, setProviderDialogOpen] = useState(false);
	const [providerApiKeyInput, setProviderApiKeyInput] = useState("");
	const [onDemandUsageEnabled, setOnDemandUsageEnabled] = useState(true);

	// Agent roster & profile dialog
	const [profile, setProfile] = useState<AgentProfile | null>(null);

	// Chat state
	const [inputText, setInputText] = useState("");
	const [messages, setMessages] = useState<ChatMessageItem[]>([]);
	const [isGenerating, setIsGenerating] = useState(false);
	const [streamingText, setStreamingText] = useState("");
	const [activeStreamingAgent, setActiveStreamingAgent] =
		useState<AgentProfile | null>(null);

	const agentsQ = useQuery({
		...trpc.agent.list.queryOptions(),
		enabled: isAuthenticated,
	});

	const agents =
		agentsQ.data && agentsQ.data.length > 0 ? agentsQ.data : FALLBACK_AGENTS;
	const researcherAgent =
		agents.find((a) => a.slug === "researcher") ?? FALLBACK_AGENTS[1];
	const heuristicAgent =
		agents.find((a) => a.slug === "heuristic") ?? FALLBACK_AGENTS[0];

	const selectedProvider = useMemo(
		() =>
			AI_PROVIDERS.find((p) => p.id === selectedProviderKey) || AI_PROVIDERS[0],
		[selectedProviderKey],
	);

	const activeScreen = flow.screens[activeScreenIndex] || flow.screens[0];

	// Handle sending a message
	const handleSend = async (textToSend: string) => {
		const trimmed = textToSend.trim();
		if (!trimmed || isGenerating) return;

		const userMsg: ChatMessageItem = {
			id: `u-${Date.now()}`,
			role: "user",
			authorName: sessionData?.user?.name || "Reviewer",
			authorAvatar:
				sessionData?.user?.image ||
				"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
			content: trimmed,
			timestamp: "Just now",
		};

		setMessages((prev) => [...prev, userMsg]);
		setInputText("");
		setIsGenerating(true);
		setStreamingText("");

		// Match agent by mention or contextual intent
		let targetAgent = researcherAgent;
		if (
			/@heuristic\b/i.test(trimmed) ||
			/heuristic|nielsen|contrast|violation/i.test(trimmed)
		) {
			targetAgent = heuristicAgent;
		} else if (
			/@pixel\b/i.test(trimmed) ||
			/ui|design|layout|visual/i.test(trimmed)
		) {
			targetAgent = agents.find((a) => a.slug === "pixel") ?? researcherAgent;
		} else if (
			/@wordsmith\b/i.test(trimmed) ||
			/copy|microcopy|cta|text/i.test(trimmed)
		) {
			targetAgent =
				agents.find((a) => a.slug === "wordsmith") ?? researcherAgent;
		} else if (
			/@tester\b/i.test(trimmed) ||
			/test|qa|accessibility|wcag/i.test(trimmed)
		) {
			targetAgent = agents.find((a) => a.slug === "tester") ?? researcherAgent;
		}

		setActiveStreamingAgent(targetAgent);

		// Generate context-aware response based on active flow step and parameters
		let fullResponse = "";
		const screenTitle =
			activeScreen?.title || `Screen ${activeScreenIndex + 1}`;

		if (/drop-off|friction|analyze/i.test(trimmed)) {
			fullResponse =
				`### Usability & Drop-off Analysis: ${flow.flowName}\n\n` +
				`• **Step Focus**: Step ${activeScreenIndex + 1} (${screenTitle})\n` +
				`• **Task Success Rate**: ${flow.taskSuccessRate} (Avg time on task: ${flow.timeOnTask})\n` +
				"• **Observed Friction**: Users hesitate on mandatory multi-step inputs before primary confirmation.\n\n" +
				"**Recommendation**: Reduce cognitive friction by pre-selecting default choices and surfacing contextual microcopy hints.";
		} else if (/heuristic|nielsen|audit/i.test(trimmed)) {
			fullResponse =
				`### Heuristic Audit Sign-off for ${screenTitle}\n\n` +
				"1. **Visibility of System Status**: ✅ Status feedback provided, clear progress indicator.\n" +
				"2. **Match Between System & Real World**: ⚠️ Form terminology uses internal nomenclature.\n" +
				"3. **Error Prevention**: 💡 Recommend inline field validation before button press.\n" +
				"4. **Consistency & Standards**: ✅ Follows design system typography and tokens.";
		} else if (/cta|copy|wordsmith/i.test(trimmed)) {
			fullResponse =
				"### UX Writing & CTA Recommendations\n\n" +
				`• **Current Action**: "${flow.screens[activeScreenIndex]?.wireframeDetails?.buttonText || "Continue"}"\n` +
				`• **Option A (Value-focused)**: "Claim Digital Card Instantly" (+18% intent in benchmarks)\n` +
				`• **Option B (Reassurance)**: "Confirm & Activate Now" (reduces drop-off for security-conscious users)\n` +
				`• **Microcopy Hint**: Add "Takes under 60 seconds • No fees" directly underneath the button.`;
		} else if (/create|automate/i.test(trimmed)) {
			fullResponse =
				"### Automated Flow Audit Script Generated\n\n" +
				"```typescript\n" +
				`// Automated benchmark runner for ${flow.flowName}\n` +
				"export const auditConfig = {\n" +
				`  flowId: "${flow.id}",\n` +
				`  screensCount: ${flow.screens.length},\n` +
				"  targetSeqScore: 6.2,\n" +
				`  heuristics: ["Nielsen-H1", "Nielsen-H5", "WCAG-AA"],\n` +
				"};\n" +
				"```\n" +
				`Audit queued across all 5 specialist agents with **${selectedProvider.name} ${selectedModel}**.`;
		} else {
			fullResponse =
				`Evaluated **${flow.flowName}** (${flow.app}) using **${selectedProvider.name} (${selectedModel})**.\n\n` +
				`For Step ${activeScreenIndex + 1} (${screenTitle}):\n` +
				`Telemetry shows **${flow.taskSuccessRate}** completion rate with **${flow.seqScore}** SEQ score. ` +
				"Let me know if you would like me to draft an A/B test variant or audit accessibility contrast.";
		}

		// Stream words smoothly for rich interactive feel
		const words = fullResponse.split(/(?<=\s)/);
		let acc = "";
		for (const w of words) {
			acc += w;
			setStreamingText(acc);
			await new Promise((r) => setTimeout(r, 20));
		}

		// Save completed message
		const assistantMsg: ChatMessageItem = {
			id: `a-${Date.now()}`,
			role: "assistant",
			agentId: targetAgent.id,
			authorName: `${targetAgent.emoji} ${targetAgent.name}`,
			content: fullResponse,
			timestamp: "Just now",
		};

		setMessages((prev) => [...prev, assistantMsg]);
		setIsGenerating(false);
		setStreamingText("");
		setActiveStreamingAgent(null);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success("Copied to clipboard!");
	};

	return (
		<div className="flex h-full flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
			{/* Top Banner: Above the chat information about AI providers (as shown in image) */}
			<div className="border-neutral-200/80 border-b bg-neutral-50/70 p-3 dark:border-neutral-800/80 dark:bg-neutral-900/50">
				<div className="flex flex-col gap-2 rounded-2xl border border-neutral-200 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800 dark:bg-neutral-900">
					<div className="flex items-center gap-2.5">
						<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
							<Sparkles className="h-4 w-4" />
						</div>
						<p className="text-neutral-700 text-xs leading-snug dark:text-neutral-300">
							Add an AI provider, or access built-in models by enabling
							on-demand usage.
						</p>
					</div>

					<div className="flex shrink-0 items-center gap-1.5 self-end sm:self-auto">
						<button
							type="button"
							onClick={() => setProviderDialogOpen(true)}
							className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-2.5 py-1 font-medium text-neutral-800 text-xs shadow-2xs transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
						>
							Add provider
						</button>
						<button
							type="button"
							onClick={() => onOpenPricing?.()}
							className="cursor-pointer rounded-lg bg-blue-600 px-3 py-1 font-semibold text-white text-xs shadow-2xs transition-colors hover:bg-blue-700"
						>
							Upgrade
						</button>
					</div>
				</div>

				{/* Active Provider telemetry pill */}
				<div className="mt-2 flex items-center justify-between px-1 text-[11px] text-neutral-500 dark:text-neutral-400">
					<div className="flex items-center gap-1.5">
						<span className="relative flex h-2 w-2">
							<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
							<span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
						</span>
						<span className="font-semibold text-neutral-800 dark:text-neutral-200">
							{selectedProvider.name}
						</span>
						<span className="font-mono text-neutral-500">
							({selectedModel})
						</span>
						<span className="text-neutral-400">
							• {selectedProvider.latency}
						</span>
					</div>

					<div className="flex items-center gap-2">
						<span className="rounded bg-neutral-200/70 px-1.5 py-0.5 font-mono text-[10px] text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
							{temperature} temp
						</span>
						<span className="font-medium text-[10px] text-emerald-600 dark:text-emerald-400">
							On-demand usage active
						</span>
					</div>
				</div>
			</div>

			{/* Shadcn AI Elements Chat Base */}
			<div className="relative flex flex-1 flex-col overflow-hidden">
				<MessageScrollerProvider autoScroll>
					<MessageScroller className="flex-1">
						<MessageScrollerViewport className="p-4">
							<MessageScrollerContent>
								{/* Empty State: "What can I help you with?" and shortcut questions */}
								{messages.length === 0 && !isGenerating && (
									<Empty className="py-8">
										<EmptyMedia
											variant="icon"
											className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
										>
											<Sparkles className="h-6 w-6" />
										</EmptyMedia>
										<EmptyHeader>
											<EmptyTitle className="font-bold text-base text-neutral-900 dark:text-white">
												What can I help you with?
											</EmptyTitle>
											<EmptyDescription className="max-w-xs text-neutral-500 text-xs">
												Ask questions about flow performance, UX friction,
												heuristic compliance, or benchmark against competitors.
											</EmptyDescription>
										</EmptyHeader>

										{/* Shortcut Questions / Suggestions */}
										<div className="mt-4 w-full space-y-2">
											<div className="flex items-center justify-between text-left">
												<span className="font-semibold text-[11px] text-neutral-400 uppercase tracking-wider">
													Starter Questions
												</span>
												<span className="text-[10px] text-neutral-400">
													Step {activeScreenIndex + 1}:{" "}
													{activeScreen?.title || "Screen"}
												</span>
											</div>

											<Suggestions className="flex flex-col gap-1.5 overflow-visible">
												{SHORTCUT_QUESTIONS.map((q) => (
													<Suggestion
														key={q}
														suggestion={q}
														onClick={() => handleSend(q)}
														className="group flex h-auto w-full cursor-pointer items-center justify-between rounded-xl border border-neutral-200/90 bg-white p-2.5 text-left text-neutral-700 text-xs shadow-2xs transition-all hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/20"
													>
														<span className="font-normal text-xs">{q}</span>
														<ArrowRight className="h-3.5 w-3.5 shrink-0 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
													</Suggestion>
												))}
											</Suggestions>
										</div>
									</Empty>
								)}

								{/* Message List */}
								{messages.map((m) => {
									const isUser = m.role === "user";
									return (
										<MessageScrollerItem
											key={m.id}
											messageId={m.id}
											scrollAnchor
										>
											<Message align={isUser ? "end" : "start"}>
												<MessageAvatar>
													{isUser ? (
														<img
															src={m.authorAvatar}
															alt={m.authorName}
															className="h-8 w-8 rounded-full object-cover"
														/>
													) : (
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm shadow-2xs dark:bg-blue-950 dark:text-blue-300">
															🤖
														</div>
													)}
												</MessageAvatar>

												<MessageContent>
													<MessageHeader>
														<span>{m.authorName}</span>
														<span className="ml-2 text-[10px] text-neutral-400">
															{m.timestamp}
														</span>
													</MessageHeader>

													<div
														className={`w-fit max-w-[90%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-2xs ${
															isUser
																? "bg-blue-600 text-white [&_a]:underline"
																: "border border-neutral-200/80 bg-neutral-50 text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
														}`}
													>
														<RichText text={m.content} agents={agents} />
													</div>

													<MessageFooter>
														<button
															type="button"
															onClick={() => copyToClipboard(m.content)}
															className="flex cursor-pointer items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
														>
															<Copy className="h-3 w-3" />
															<span>Copy</span>
														</button>
													</MessageFooter>
												</MessageContent>
											</Message>
										</MessageScrollerItem>
									);
								})}

								{/* Streaming Message Indicator */}
								{isGenerating && (
									<MessageScrollerItem messageId="streaming" scrollAnchor>
										<Message align="start">
											<MessageAvatar>
												<div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm shadow-2xs dark:bg-blue-950 dark:text-blue-300">
													{activeStreamingAgent?.emoji || "🤖"}
												</div>
											</MessageAvatar>
											<MessageContent>
												<MessageHeader>
													<span>
														{activeStreamingAgent?.name || "AI Assistant"}
													</span>
													<span className="ml-2 animate-pulse text-[10px] text-blue-600 dark:text-blue-400">
														Generating…
													</span>
												</MessageHeader>
												<div className="w-fit max-w-[90%] rounded-2xl border border-blue-200/80 bg-blue-50/30 px-3.5 py-2.5 text-neutral-900 text-xs leading-relaxed dark:border-blue-900/40 dark:bg-blue-950/20 dark:text-neutral-100">
													{streamingText ? (
														<RichText text={streamingText} agents={agents} />
													) : (
														<span className="text-neutral-400">
															Thinking with {selectedProvider.name}…
														</span>
													)}
												</div>
											</MessageContent>
										</Message>
									</MessageScrollerItem>
								)}
							</MessageScrollerContent>
						</MessageScrollerViewport>
						<MessageScrollerButton />
					</MessageScroller>
				</MessageScrollerProvider>
			</div>

			{/* Prompt Input Area Matching Screenshot */}
			<div className="border-neutral-200 border-t bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950">
				{/* Input Container */}
				<div className="relative rounded-2xl border border-neutral-300/80 bg-white p-3 shadow-xs transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 dark:border-neutral-700 dark:bg-neutral-900">
					<textarea
						value={inputText}
						onChange={(e) => setInputText(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSend(inputText);
							}
						}}
						placeholder="Ask questions about logs, @ for context, / for commands"
						rows={2}
						className="w-full resize-none border-0 bg-transparent p-0 text-neutral-900 text-xs placeholder:text-neutral-400 focus:outline-none focus:ring-0 dark:text-white"
					/>

					{/* Inside Input Controls (from image) */}
					<div className="mt-2.5 flex items-center justify-between gap-2 border-neutral-100 border-t pt-2 dark:border-neutral-800">
						{/* Left Controls */}
						<div className="flex flex-wrap items-center gap-1.5">
							{/* [+] button for context attachments */}
							<DropdownMenu>
								<DropdownMenuTrigger
									render={
										<button
											type="button"
											className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
											title="Attach context"
											aria-label="Attach context"
										>
											<Plus className="h-3.5 w-3.5" />
										</button>
									}
								/>
								<DropdownMenuContent align="start" className="w-56 text-xs">
									<DropdownMenuLabel>
										Attach to Prompt Context
									</DropdownMenuLabel>
									<DropdownMenuItem
										onClick={() =>
											setInputText(
												(prev) =>
													`${prev} [Screen ${activeScreenIndex + 1}: ${
														activeScreen?.title || "Screen"
													}] `,
											)
										}
									>
										Current Screen (
										{activeScreen?.title || `Step ${activeScreenIndex + 1}`})
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setInputText(
												(prev) =>
													`${prev} [Flow Telemetry: ${flow.taskSuccessRate} completion, ${flow.timeOnTask} avg] `,
											)
										}
									>
										Flow Telemetry & Drop-offs
									</DropdownMenuItem>
									<DropdownMenuItem
										onClick={() =>
											setInputText(
												(prev) => `${prev} [Nielsen Heuristics Checklist] `,
											)
										}
									>
										Nielsen Heuristics Checklist
									</DropdownMenuItem>
								</DropdownMenuContent>
							</DropdownMenu>

							{/* Tune / Sliders (+ params) */}
							<Popover>
								<PopoverTrigger
									render={
										<button
											type="button"
											className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-md text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-white"
											title="Model Parameters (+ params)"
											aria-label="Model Parameters"
										>
											<SlidersHorizontal className="h-3.5 w-3.5" />
										</button>
									}
								/>
								<PopoverContent align="start" className="w-76 space-y-3 p-4">
									<div className="flex items-center justify-between border-neutral-100 border-b pb-2 dark:border-neutral-800">
										<PopoverTitle>Model Parameters</PopoverTitle>
										<span className="rounded bg-neutral-100 px-1.5 py-0.5 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800">
											+ params
										</span>
									</div>

									{/* Model Selection */}
									<div className="space-y-1.5">
										<label className="font-semibold text-[11px] text-neutral-700 dark:text-neutral-300">
											Model Selection
										</label>
										<div className="grid grid-cols-2 gap-1">
											{selectedProvider.models.map((m) => (
												<button
													key={m}
													type="button"
													onClick={() => setSelectedModel(m)}
													className={`cursor-pointer rounded-lg border px-2 py-1 text-left font-mono text-[10px] transition-colors ${
														selectedModel === m
															? "border-blue-600 bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
															: "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800"
													}`}
												>
													{m}
												</button>
											))}
										</div>
									</div>

									{/* Temperature slider */}
									<div className="space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="font-semibold text-[11px] text-neutral-700 dark:text-neutral-300">
												Temperature
											</span>
											<span className="font-mono text-[11px] text-neutral-500">
												{temperature}
											</span>
										</div>
										<input
											type="range"
											min="0"
											max="1"
											step="0.1"
											value={temperature}
											onChange={(e) =>
												setTemperature(Number.parseFloat(e.target.value))
											}
											className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-neutral-200 accent-blue-600 dark:bg-neutral-700"
										/>
										<div className="flex justify-between text-[10px] text-neutral-400">
											<span>0.0 (Evaluative)</span>
											<span>1.0 (Creative)</span>
										</div>
									</div>

									{/* Max Tokens */}
									<div className="space-y-1">
										<div className="flex items-center justify-between text-xs">
											<span className="font-semibold text-[11px] text-neutral-700 dark:text-neutral-300">
												Max Tokens
											</span>
											<span className="font-mono text-[11px] text-neutral-500">
												{maxTokens}
											</span>
										</div>
										<div className="flex gap-1.5">
											{[1024, 2048, 4096].map((tok) => (
												<button
													key={tok}
													type="button"
													onClick={() => setMaxTokens(tok)}
													className={`flex-1 cursor-pointer rounded-md border py-0.5 font-mono text-[10px] ${
														maxTokens === tok
															? "border-blue-600 bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
															: "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800"
													}`}
												>
													{tok}
												</button>
											))}
										</div>
									</div>

									{/* Mode */}
									<div className="space-y-1 border-neutral-100 border-t pt-1 dark:border-neutral-800">
										<label className="font-semibold text-[11px] text-neutral-700 dark:text-neutral-300">
											Analysis Mode
										</label>
										<div className="flex gap-1">
											{(["audit", "creative", "concise"] as const).map(
												(mode) => (
													<button
														key={mode}
														type="button"
														onClick={() => setSystemMode(mode)}
														className={`flex-1 cursor-pointer rounded-md border px-1.5 py-0.5 text-[10px] capitalize ${
															systemMode === mode
																? "border-blue-600 bg-blue-50 font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
																: "border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800"
														}`}
													>
														{mode}
													</button>
												),
											)}
										</div>
									</div>
								</PopoverContent>
							</Popover>

							{/* + Add provider */}
							<button
								type="button"
								onClick={() => setProviderDialogOpen(true)}
								className="flex cursor-pointer items-center gap-1 rounded-md px-1.5 py-0.5 font-medium text-neutral-600 text-xs transition-colors hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
							>
								<Plus className="h-3 w-3" />
								<span>Add provider</span>
							</button>

							{/* Provider icons badge cluster (from image) */}
							<div className="flex items-center gap-1 pl-0.5">
								{/* OpenAI badge */}
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={() => {
													setSelectedProviderKey("openai");
													setSelectedModel("gpt-4o");
													toast.success("Active Provider: OpenAI (gpt-4o)");
												}}
												className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-all ${
													selectedProviderKey === "openai"
														? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-2xs dark:bg-emerald-950/40 dark:text-emerald-300"
														: "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
												}`}
												aria-label="Select OpenAI"
											>
												<OpenAIIcon className="h-3.5 w-3.5" />
											</button>
										}
									/>
									<TooltipContent side="top" className="text-xs">
										OpenAI (GPT-4o) - Active
									</TooltipContent>
								</Tooltip>

								{/* Anthropic Claude badge */}
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={() => {
													setSelectedProviderKey("anthropic");
													setSelectedModel("claude-3-7-sonnet");
													toast.success(
														"Active Provider: Anthropic (claude-3-7-sonnet)",
													);
												}}
												className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border transition-all ${
													selectedProviderKey === "anthropic"
														? "border-amber-500 bg-amber-50 text-amber-700 shadow-2xs dark:bg-amber-950/40 dark:text-amber-300"
														: "border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
												}`}
												aria-label="Select Anthropic"
											>
												<AnthropicIcon className="h-3.5 w-3.5" />
											</button>
										}
									/>
									<TooltipContent side="top" className="text-xs">
										Anthropic (Claude 3.7) - Connected
									</TooltipContent>
								</Tooltip>

								{/* + add provider button */}
								<Tooltip>
									<TooltipTrigger
										render={
											<button
												type="button"
												onClick={() => setProviderDialogOpen(true)}
												className="flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-neutral-300 border-dashed text-neutral-400 transition-colors hover:border-neutral-400 hover:text-neutral-700 dark:border-neutral-700 dark:hover:border-neutral-500 dark:hover:text-neutral-200"
												aria-label="Connect additional providers"
											>
												<Plus className="h-3 w-3" />
											</button>
										}
									/>
									<TooltipContent side="top" className="text-xs">
										Add more AI providers
									</TooltipContent>
								</Tooltip>
							</div>
						</div>

						{/* Right Control: Send Button (Circle with Arrow Up, from screenshot) */}
						<button
							type="button"
							disabled={!inputText.trim() && !isGenerating}
							onClick={() => handleSend(inputText)}
							className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full transition-all ${
								inputText.trim() || isGenerating
									? "bg-neutral-900 text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
									: "cursor-not-allowed bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500"
							}`}
							aria-label="Send message"
						>
							<ArrowUp className="h-4 w-4 stroke-[2.5]" />
						</button>
					</div>
				</div>

				{/* Shortcut action buttons below chat input (Analyze, Create, Automate from image) */}
				<div className="mt-2.5 flex items-center justify-center gap-6 text-neutral-600 text-xs dark:text-neutral-400">
					<button
						type="button"
						onClick={() =>
							handleSend(
								`Analyze usability friction and drop-off risks on Step ${
									activeScreenIndex + 1
								} (${activeScreen?.title || "Current Step"})`,
							)
						}
						className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-neutral-950 dark:hover:text-white"
					>
						<ScanSearch className="h-3.5 w-3.5 text-neutral-500" />
						<span className="font-medium">Analyze</span>
					</button>

					<button
						type="button"
						onClick={() =>
							handleSend(
								`Create an optimized UX variation for Step ${
									activeScreenIndex + 1
								} with high-converting CTA copy and fewer friction points`,
							)
						}
						className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-neutral-950 dark:hover:text-white"
					>
						<LayoutGrid className="h-3.5 w-3.5 text-neutral-500" />
						<span className="font-medium">Create</span>
					</button>

					<button
						type="button"
						onClick={() =>
							handleSend(
								"Automate a Nielsen heuristic audit checklist and QA validation script for this flow",
							)
						}
						className="flex cursor-pointer items-center gap-1.5 transition-colors hover:text-neutral-950 dark:hover:text-white"
					>
						<Radio className="h-3.5 w-3.5 text-neutral-500" />
						<span className="font-medium">Automate</span>
					</button>
				</div>
			</div>

			{/* AI Provider Configuration Dialog */}
			<Dialog open={providerDialogOpen} onOpenChange={setProviderDialogOpen}>
				<DialogPopup className="max-w-md p-6">
					<div className="flex items-center justify-between border-neutral-100 border-b pb-3 dark:border-neutral-800">
						<div className="flex items-center gap-2">
							<div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
								<Sparkles className="h-4 w-4" />
							</div>
							<div>
								<DialogTitle className="font-bold text-neutral-900 text-sm dark:text-white">
									AI Providers & Models
								</DialogTitle>
								<DialogDescription className="text-[11px] text-neutral-500">
									Configure custom keys or use on-demand workspace inference.
								</DialogDescription>
							</div>
						</div>
					</div>

					{/* On-demand usage toggle */}
					<div className="mt-3 flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/20">
						<div>
							<span className="font-semibold text-emerald-950 text-xs dark:text-emerald-300">
								On-Demand Usage Enabled
							</span>
							<p className="mt-0.5 text-[11px] text-emerald-800 dark:text-emerald-400">
								Access top models without needing personal API keys.
							</p>
						</div>
						<button
							type="button"
							onClick={() => {
								setOnDemandUsageEnabled(!onDemandUsageEnabled);
								toast.success(
									onDemandUsageEnabled
										? "On-demand usage disabled"
										: "On-demand usage enabled",
								);
							}}
							className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
								onDemandUsageEnabled
									? "bg-emerald-600"
									: "bg-neutral-300 dark:bg-neutral-700"
							}`}
						>
							<span
								className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
									onDemandUsageEnabled ? "translate-x-4.5" : "translate-x-1"
								}`}
							/>
						</button>
					</div>

					{/* Provider List */}
					<div className="mt-3 space-y-2">
						{AI_PROVIDERS.map((p) => {
							const isSelected = selectedProviderKey === p.id;
							return (
								<div
									key={p.id}
									onClick={() => {
										setSelectedProviderKey(p.id);
										setSelectedModel(p.defaultModel);
									}}
									className={`flex cursor-pointer items-center justify-between rounded-xl border p-3 transition-all ${
										isSelected
											? "border-blue-600 bg-blue-50/40 shadow-2xs dark:border-blue-500 dark:bg-blue-950/20"
											: "border-neutral-200 bg-white hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800/60"
									}`}
								>
									<div className="flex items-center gap-2.5">
										<div className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100">
											{p.icon === "openai" ? (
												<OpenAIIcon className="h-4 w-4" />
											) : p.icon === "anthropic" ? (
												<AnthropicIcon className="h-4 w-4" />
											) : (
												<GeminiIcon className="h-4 w-4" />
											)}
										</div>
										<div>
											<div className="flex items-center gap-1.5">
												<span className="font-semibold text-neutral-900 text-xs dark:text-white">
													{p.name}
												</span>
												<span className="rounded-full bg-neutral-100 px-1.5 py-0.2 font-mono text-[9px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
													{p.contextWindow}
												</span>
											</div>
											<span className="text-[11px] text-neutral-500">
												Default: {p.defaultModel}
											</span>
										</div>
									</div>

									<div className="flex items-center gap-2">
										<span className="rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-[10px] text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
											{p.status}
										</span>
										{isSelected && (
											<Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
										)}
									</div>
								</div>
							);
						})}
					</div>

					{/* Custom API Key input */}
					<div className="mt-3 space-y-1.5 rounded-xl border border-neutral-200 bg-neutral-50/60 p-3 dark:border-neutral-800 dark:bg-neutral-900/40">
						<label className="flex items-center gap-1 font-semibold text-[11px] text-neutral-700 dark:text-neutral-300">
							<Key className="h-3 w-3" />
							<span>Custom {selectedProvider.name} API Key (optional)</span>
						</label>
						<div className="flex gap-2">
							<input
								type="password"
								placeholder={`sk-...${selectedProvider.id}`}
								value={providerApiKeyInput}
								onChange={(e) => setProviderApiKeyInput(e.target.value)}
								className="flex-1 rounded-lg border border-neutral-300 bg-white px-2.5 py-1 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800"
							/>
							<button
								type="button"
								onClick={() => {
									if (providerApiKeyInput.trim()) {
										toast.success(
											`${selectedProvider.name} key saved successfully!`,
										);
										setProviderApiKeyInput("");
									} else {
										toast.info("Using default on-demand credentials.");
									}
								}}
								className="cursor-pointer rounded-lg bg-neutral-900 px-2.5 py-1 font-medium text-white text-xs hover:bg-neutral-800 dark:bg-white dark:text-neutral-900"
							>
								Save
							</button>
						</div>
					</div>

					{/* Dialog footer with Upgrade link */}
					<div className="mt-4 flex items-center justify-between border-neutral-100 border-t pt-3 dark:border-neutral-800">
						<button
							type="button"
							onClick={() => {
								setProviderDialogOpen(false);
								onOpenPricing?.();
							}}
							className="cursor-pointer font-semibold text-blue-600 text-xs hover:underline dark:text-blue-400"
						>
							Upgrade for unlimited rate limits →
						</button>
						<button
							type="button"
							onClick={() => setProviderDialogOpen(false)}
							className="cursor-pointer rounded-lg bg-neutral-100 px-3 py-1 font-medium text-neutral-800 text-xs hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200"
						>
							Done
						</button>
					</div>
				</DialogPopup>
			</Dialog>

			{/* Agent Profile Modal */}
			<AgentProfileDialog agent={profile} onClose={() => setProfile(null)} />
		</div>
	);
}
