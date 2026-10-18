import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
} from "@IvO/ui/components/dialog";
import { Link } from "@tanstack/react-router";
import { AgentAvatar } from "./agent-avatar";

export interface AgentProfile {
	id: string;
	slug: string;
	name: string;
	emoji: string;
	competence: string;
	systemPrompt: string;
	model: string | null;
	enabled: boolean;
	skills: { name: string; description: string }[];
	connectors: { type: string; enabled: boolean }[];
}

const CONNECTOR_LABELS: Record<string, string> = {
	"flow-telemetry": "Flow telemetry",
	"web-search": "Web search",
	figma: "Figma",
	mcp: "MCP server",
};

function Section({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-1.5">
			<h4 className="font-bold text-[11px] text-neutral-400 uppercase tracking-wider">
				{title}
			</h4>
			{children}
		</div>
	);
}

export function AgentProfileDialog({
	agent,
	onClose,
	onEdit,
}: {
	agent: AgentProfile | null;
	onClose: () => void;
	onEdit?: (agent: AgentProfile) => void;
}) {
	return (
		<Dialog open={!!agent} onOpenChange={(o) => !o && onClose()}>
			<DialogPopup>
				{agent && (
					<>
						<DialogHeader>
							<div className="flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<AgentAvatar
										emoji={agent.emoji}
										name={agent.name}
										size="lg"
									/>
									<div>
										<DialogTitle>{agent.name}</DialogTitle>
										<DialogDescription>
											{agent.competence} · @{agent.slug}
											{!agent.enabled && " · draft"}
										</DialogDescription>
									</div>
								</div>
								{onEdit && (
									<button
										type="button"
										onClick={() => {
											const target = agent;
											onClose();
											onEdit(target);
										}}
										className="cursor-pointer rounded-lg bg-[#e8ebfa] px-3 py-1.5 font-semibold text-[#4f52b2] text-xs hover:bg-[#dce1f7]"
									>
										Open in Studio
									</button>
								)}
							</div>
						</DialogHeader>

						<div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 pb-6 text-xs">
							<Section title="System prompt">
								<pre className="whitespace-pre-wrap rounded-xl bg-neutral-50 p-3 font-mono text-[11px] text-neutral-700 leading-relaxed dark:bg-neutral-800/50 dark:text-neutral-300">
									{agent.systemPrompt}
								</pre>
							</Section>

							<Section title="Skills">
								{agent.skills.length === 0 ? (
									<p className="text-neutral-400">No skills.</p>
								) : (
									<ul className="space-y-1.5">
										{agent.skills.map((s) => (
											<li key={s.name}>
												<span className="font-semibold">{s.name}</span>
												<span className="text-neutral-500">
													{" "}
													– {s.description}
												</span>
											</li>
										))}
									</ul>
								)}
							</Section>

							<Section title="Connectors">
								{agent.connectors.length === 0 ? (
									<p className="text-neutral-400">No connectors.</p>
								) : (
									<div className="flex flex-wrap gap-1.5">
										{agent.connectors.map((c) => (
											<span
												key={c.type}
												className={`rounded-full border px-2 py-0.5 ${
													c.enabled
														? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
														: "border-neutral-200 text-neutral-400 dark:border-neutral-800"
												}`}
											>
												{CONNECTOR_LABELS[c.type] ?? c.type}
											</span>
										))}
									</div>
								)}
							</Section>

							<Link
								to="/settings/account"
								search={{ tab: "agents" }}
								className="inline-block font-semibold text-blue-600 hover:underline"
							>
								Manage agents in settings →
							</Link>
						</div>
					</>
				)}
			</DialogPopup>
		</Dialog>
	);
}
