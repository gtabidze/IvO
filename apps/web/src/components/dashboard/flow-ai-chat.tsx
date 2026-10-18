import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bot, ChevronDown, Trash2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AgentAvatar } from "@/components/agents/agent-avatar";
import {
	type AgentCheckResult,
	computeAgentChecks,
} from "@/components/agents/agent-checks-dialog";
import {
	type AgentProfile,
	AgentProfileDialog,
} from "@/components/agents/agent-profile-dialog";
import { buildFlowContext, serverUrl } from "@/components/agents/flow-context";
import { MentionInput } from "@/components/agents/mention-input";
import { RichText } from "@/components/agents/rich-text";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { useTRPC } from "@/utils/trpc";

export function FlowAiChat({
	flow,
	activeScreenIndex = 0,
}: {
	flow: DashboardFlow;
	activeScreenIndex?: number;
}) {
	const trpc = useTRPC();
	const qc = useQueryClient();
	const [profile, setProfile] = useState<AgentProfile | null>(null);
	const [inputText, setInputText] = useState("");

	const agentsQ = useQuery(trpc.agent.list.queryOptions());
	const messagesQ = useQuery(
		trpc.agent.messages.queryOptions({ flowId: flow.id }),
	);

	const agents = agentsQ.data ?? [];
	const enabled = agents.filter((a) => a.enabled);
	const agentById = new Map(agents.map((a) => [a.id, a]));
	const context = buildFlowContext(flow);

	// Compute agent checks for warnings
	const checks = useMemo(
		() => computeAgentChecks(flow, activeScreenIndex),
		[flow, activeScreenIndex],
	);
	const warningChecks = useMemo(
		() =>
			checks.filter((c) => c.status === "warning" || c.status === "failure"),
		[checks],
	);

	// ---- Chat ----
	const [pendingUser, setPendingUser] = useState<string | null>(null);
	const [live, setLive] = useState<Record<string, string>>({});
	const [liveOrder, setLiveOrder] = useState<string[]>([]);
	const [sending, setSending] = useState(false);
	const endRef = useRef<HTMLDivElement>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: scroll on any new content
	useEffect(() => {
		endRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messagesQ.data, live, pendingUser]);

	const send = async (message: string) => {
		setInputText("");
		setPendingUser(message);
		setLive({});
		setLiveOrder([]);
		setSending(true);
		try {
			const res = await fetch(serverUrl("/api/chat"), {
				method: "POST",
				credentials: "include",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ flowId: flow.id, message, context }),
			});
			if (!res.ok || !res.body) {
				throw new Error(
					res.status === 401 ? "Please sign in to chat" : "Request failed",
				);
			}
			const reader = res.body.getReader();
			const decoder = new TextDecoder();
			let buf = "";
			for (;;) {
				const { done, value } = await reader.read();
				if (done) break;
				buf += decoder.decode(value, { stream: true });
				let nl = buf.indexOf("\n");
				while (nl >= 0) {
					const line = buf.slice(0, nl).trim();
					buf = buf.slice(nl + 1);
					nl = buf.indexOf("\n");
					if (!line) continue;
					const ev = JSON.parse(line) as
						| { type: "agents"; agentIds: string[] }
						| { type: "delta"; agentId: string; text: string }
						| { type: "done" | "error"; agentId: string };
					if (ev.type === "agents") setLiveOrder(ev.agentIds);
					else if (ev.type === "delta")
						setLive((s) => ({
							...s,
							[ev.agentId]: (s[ev.agentId] ?? "") + ev.text,
						}));
					else if (ev.type === "error")
						toast.error(
							`${agentById.get(ev.agentId)?.name ?? "Agent"} failed to reply`,
						);
				}
			}
		} catch (err) {
			toast.error(err instanceof Error ? err.message : "Chat failed");
		} finally {
			await qc.invalidateQueries({
				queryKey: trpc.agent.messages.queryKey({ flowId: flow.id }),
			});
			setPendingUser(null);
			setLive({});
			setLiveOrder([]);
			setSending(false);
		}
	};

	const openProfile = (id: string) => {
		const a = agentById.get(id);
		if (a) setProfile(a);
	};

	const handleAskAgent = (agentSlug: string, headline?: string) => {
		setInputText(
			`@${agentSlug} ${headline ? `Regarding "${headline}": how should we fix this?` : "Could you explain this issue and recommend a solution?"}`,
		);
	};

	const messages = messagesQ.data ?? [];

	return (
		<>
			{/* Agent roster */}
			<div className="flex items-center gap-2 border-neutral-200/80 border-b px-4 py-2.5 dark:border-neutral-800">
				{agentsQ.isLoading && (
					<span className="text-[11px] text-neutral-400">Loading agents…</span>
				)}
				{agents.map((a) => (
					<AgentAvatar
						key={a.id}
						emoji={a.emoji}
						name={a.name}
						dimmed={!a.enabled}
						onClick={() => openProfile(a.id)}
					/>
				))}
				<div className="ml-auto text-[11px] text-neutral-400">
					{enabled.length} {enabled.length === 1 ? "agent" : "agents"} active
				</div>
			</div>

			{/* Main Chat Scroll Container */}
			<div className="flex-1 space-y-3 overflow-y-auto p-4">
				{/* Warning Agent Message Header (compact, expandable for details) */}
				{warningChecks.length > 0 && (
					<div className="space-y-2">
						{warningChecks.map((check) => (
							<WarningAgentCard
								key={check.id}
								check={check}
								onAskAgent={handleAskAgent}
							/>
						))}
					</div>
				)}

				{/* Empty state prompt */}
				{messages.length === 0 && !pendingUser && (
					<div className="flex flex-col items-center justify-center py-10 text-center">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
							<Bot className="h-5 w-5" />
						</div>
						<p className="mt-2.5 font-bold text-neutral-900 text-xs dark:text-white">
							Chat with Workspace AI Team
						</p>
						<p className="mt-1 max-w-[240px] text-[11px] text-neutral-500">
							Ask all agents together, or type @ to consult a specific
							specialist.
						</p>
					</div>
				)}

				{/* Chat message bubbles */}
				{messages.map((m) => (
					<Bubble
						key={m.id}
						from={m.role}
						agent={m.agentId ? agentById.get(m.agentId) : undefined}
						text={m.content}
						agents={agents}
						onAvatar={openProfile}
					/>
				))}

				{pendingUser && (
					<Bubble from="user" text={pendingUser} agents={agents} />
				)}

				{liveOrder.map((id) => (
					<Bubble
						key={id}
						from="agent"
						agent={agentById.get(id)}
						text={live[id] ?? ""}
						agents={agents}
						onAvatar={openProfile}
						streaming
					/>
				))}

				{messages.length > 0 && !sending && <ClearButton flowId={flow.id} />}

				<div ref={endRef} />
			</div>

			<div className="border-neutral-200 border-t bg-neutral-50/60 p-3.5 dark:border-neutral-800 dark:bg-neutral-900/60">
				<MentionInput
					agents={enabled}
					disabled={sending}
					value={inputText}
					onChange={setInputText}
					onSend={send}
				/>
			</div>

			<AgentProfileDialog agent={profile} onClose={() => setProfile(null)} />
		</>
	);
}

function WarningAgentCard({
	check,
	onAskAgent,
}: {
	check: AgentCheckResult;
	onAskAgent?: (slug: string, headline?: string) => void;
}) {
	const [expanded, setExpanded] = useState(false);

	return (
		<div className="overflow-hidden rounded-2xl border border-amber-200/90 bg-amber-50/60 shadow-2xs transition-all dark:border-amber-900/50 dark:bg-amber-950/20">
			{/* Warning Agent Message Header */}
			<div
				role="button"
				tabIndex={0}
				onClick={() => setExpanded((prev) => !prev)}
				onKeyDown={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						e.preventDefault();
						setExpanded((prev) => !prev);
					}
				}}
				className="flex cursor-pointer items-center justify-between gap-2.5 p-3 transition-colors hover:bg-amber-100/50 dark:hover:bg-amber-900/30"
			>
				<div className="flex min-w-0 items-center gap-2.5">
					<div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-sm shadow-2xs dark:bg-amber-900/50">
						{check.agentEmoji}
					</div>
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-1.5">
							<span className="font-semibold text-neutral-900 text-xs dark:text-white">
								{check.agentName}
							</span>
							<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-1.5 py-0.2 font-semibold text-[10px] text-amber-800 dark:bg-amber-900/70 dark:text-amber-200">
								<AlertTriangle className="h-2.5 w-2.5" />
								Warning
							</span>
						</div>
						<p className="truncate text-[11px] text-neutral-600 dark:text-neutral-400">
							{check.headline}
						</p>
					</div>
				</div>

				<div className="flex shrink-0 items-center gap-1 text-amber-800 dark:text-amber-300">
					<span className="font-semibold text-[11px]">
						{expanded ? "Hide" : "Details"}
					</span>
					<ChevronDown
						className={`h-3.5 w-3.5 transition-transform duration-200 ${
							expanded ? "rotate-180" : ""
						}`}
					/>
				</div>
			</div>

			{/* Expandable Details */}
			{expanded && (
				<div className="space-y-2.5 border-amber-200/80 border-t bg-white/80 p-3 text-neutral-700 text-xs dark:border-amber-900/40 dark:bg-neutral-900/70 dark:text-neutral-300">
					{check.oneLiner && (
						<p className="font-semibold text-neutral-900 dark:text-white">
							{check.oneLiner}
						</p>
					)}
					{check.detailedFeedback && (
						<p className="text-[11px] text-neutral-600 leading-relaxed dark:text-neutral-400">
							{check.detailedFeedback}
						</p>
					)}
					{check.recommendation && (
						<div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-[11px] text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200">
							<span className="font-bold">Recommendation: </span>
							{check.recommendation}
						</div>
					)}
					<div className="flex flex-wrap items-center justify-between gap-2 pt-1">
						<div className="flex flex-wrap gap-1">
							{check.heuristics.map((h) => (
								<span
									key={h}
									className="rounded-md bg-neutral-100 px-1.5 py-0.5 text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
								>
									{h}
								</span>
							))}
						</div>
						{onAskAgent && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									onAskAgent(check.agentSlug, check.headline);
								}}
								className="cursor-pointer font-semibold text-[11px] text-blue-600 hover:underline dark:text-blue-400"
							>
								Ask @{check.agentSlug} →
							</button>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

function ClearButton({ flowId }: { flowId: string }) {
	const trpc = useTRPC();
	const qc = useQueryClient();
	const clear = useMutation(
		trpc.agent.clearMessages.mutationOptions({
			onSuccess: () =>
				qc.invalidateQueries({
					queryKey: trpc.agent.messages.queryKey({ flowId }),
				}),
		}),
	);
	return (
		<button
			type="button"
			disabled={clear.isPending}
			onClick={() => clear.mutate({ flowId })}
			className="mx-auto flex cursor-pointer items-center gap-1 text-[10px] text-neutral-400 hover:text-neutral-600"
		>
			<Trash2 className="h-3 w-3" /> Clear conversation
		</button>
	);
}

function Bubble({
	from,
	agent,
	text,
	agents,
	onAvatar,
	streaming,
}: {
	from: "user" | "agent";
	agent?: AgentProfile;
	text: string;
	agents: { slug: string }[];
	onAvatar?: (id: string) => void;
	streaming?: boolean;
}) {
	if (from === "user") {
		return (
			<div className="flex justify-end">
				<div className="max-w-[85%] rounded-2xl bg-blue-600 px-3 py-2 text-white text-xs leading-relaxed [&_span]:bg-white/20 [&_span]:text-white">
					<RichText text={text} agents={agents} />
				</div>
			</div>
		);
	}
	return (
		<div className="flex items-start gap-2">
			{agent ? (
				<AgentAvatar
					emoji={agent.emoji}
					name={agent.name}
					size="sm"
					onClick={() => onAvatar?.(agent.id)}
				/>
			) : (
				<AgentAvatar emoji="🤖" name="Agent" size="sm" />
			)}
			<div className="max-w-[85%] rounded-2xl bg-neutral-100 px-3 py-2 text-neutral-900 text-xs leading-relaxed dark:bg-neutral-800 dark:text-neutral-100">
				<div className="mb-0.5 font-bold text-[10px] text-neutral-500">
					{agent?.name ?? "Agent"}
				</div>
				{text ? (
					<RichText text={text} agents={agents} />
				) : (
					streaming && <span className="text-neutral-400">Thinking…</span>
				)}
			</div>
		</div>
	);
}
