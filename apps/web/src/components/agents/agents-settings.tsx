import { Button } from "@IvO/ui/components/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/utils/trpc";
import { AgentAvatar } from "./agent-avatar";
import { AgentFormDialog, type AgentFormValues } from "./agent-form-dialog";
import { type AgentProfile, AgentProfileDialog } from "./agent-profile-dialog";

export function AgentsSettings() {
	const trpc = useTRPC();
	const qc = useQueryClient();
	const agentsQ = useQuery(trpc.agent.list.queryOptions());
	const connectorsQ = useQuery(trpc.agent.connectors.queryOptions());
	const [editing, setEditing] = useState<AgentProfile | null>(null);
	const [creating, setCreating] = useState(false);
	const [viewing, setViewing] = useState<AgentProfile | null>(null);

	const refresh = () =>
		qc.invalidateQueries({ queryKey: trpc.agent.list.queryKey() });
	const onError = (e: { message: string }) => toast.error(e.message);

	const create = useMutation(
		trpc.agent.create.mutationOptions({
			onSuccess: () => {
				toast.success("Agent created");
				setCreating(false);
				refresh();
			},
			onError,
		}),
	);
	const update = useMutation(
		trpc.agent.update.mutationOptions({
			onSuccess: () => {
				setEditing(null);
				refresh();
			},
			onError,
		}),
	);
	const remove = useMutation(
		trpc.agent.delete.mutationOptions({
			onSuccess: () => {
				toast.success("Agent deleted");
				refresh();
			},
			onError,
		}),
	);
	const reset = useMutation(
		trpc.agent.reset.mutationOptions({
			onSuccess: () => {
				toast.success("Agent reset to default");
				refresh();
			},
			onError,
		}),
	);

	const submit = (v: AgentFormValues) => {
		if (editing) {
			const { slug: _slug, ...data } = v;
			update.mutate({ id: editing.id, data });
		} else {
			create.mutate(v);
		}
	};

	const agents = agentsQ.data ?? [];

	return (
		<div className="space-y-6">
			<div className="flex items-start justify-between gap-4">
				<div>
					<h2 className="font-bold text-base text-neutral-950 dark:text-white">
						AI agents
					</h2>
					<p className="mt-1 text-neutral-500 text-xs">
						Your UX team. Every flow shows feedback from all enabled agents;
						@mention one in chat to talk to it directly.
					</p>
				</div>
				<Button onClick={() => setCreating(true)} size="sm">
					<Plus className="h-4 w-4" /> New agent
				</Button>
			</div>

			<div className="space-y-2.5">
				{agentsQ.isLoading && (
					<p className="text-neutral-400 text-xs">Loading…</p>
				)}
				{agents.map((a) => (
					<div
						key={a.id}
						className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3.5 dark:border-neutral-800 dark:bg-neutral-900"
					>
						<AgentAvatar
							emoji={a.emoji}
							name={a.name}
							size="lg"
							dimmed={!a.enabled}
							onClick={() => setViewing(a)}
						/>
						<div className="min-w-0 flex-1">
							<div className="flex items-center gap-2">
								<span className="font-bold text-neutral-950 text-sm dark:text-white">
									{a.name}
								</span>
								<span className="text-neutral-400 text-xs">@{a.slug}</span>
								{a.builtinKey && (
									<span className="rounded-full bg-neutral-100 px-1.5 py-0.5 font-semibold text-[9px] text-neutral-500 dark:bg-neutral-800">
										BUILT-IN
									</span>
								)}
							</div>
							<p className="truncate text-neutral-500 text-xs">
								{a.competence}
							</p>
						</div>

						<label className="flex cursor-pointer items-center gap-1.5 text-neutral-500 text-xs">
							<input
								type="checkbox"
								checked={a.enabled}
								onChange={(e) =>
									update.mutate({
										id: a.id,
										data: { enabled: e.target.checked },
									})
								}
							/>
							Enabled
						</label>
						<Button variant="outline" size="sm" onClick={() => setEditing(a)}>
							Edit
						</Button>
						{a.builtinKey ? (
							<button
								type="button"
								title="Reset to default"
								aria-label={`Reset ${a.name}`}
								onClick={() => reset.mutate({ id: a.id })}
								className="cursor-pointer text-neutral-400 hover:text-neutral-700"
							>
								<RotateCcw className="h-4 w-4" />
							</button>
						) : (
							<button
								type="button"
								title="Delete"
								aria-label={`Delete ${a.name}`}
								onClick={() => {
									if (confirm(`Delete ${a.name}?`)) remove.mutate({ id: a.id });
								}}
								className="cursor-pointer text-neutral-400 hover:text-red-500"
							>
								<Trash2 className="h-4 w-4" />
							</button>
						)}
					</div>
				))}
			</div>

			<AgentFormDialog
				open={creating || !!editing}
				agent={editing}
				connectorOptions={[...(connectorsQ.data ?? [])]}
				saving={create.isPending || update.isPending}
				onClose={() => {
					setCreating(false);
					setEditing(null);
				}}
				onSubmit={submit}
			/>
			<AgentProfileDialog
				agent={viewing}
				onClose={() => setViewing(null)}
				onEdit={(a) => setEditing(a)}
			/>
		</div>
	);
}
