import { Alert, AlertDescription, AlertTitle } from "@IvO/ui/components/alert";
import { Badge } from "@IvO/ui/components/badge";
import { Button } from "@IvO/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@IvO/ui/components/card";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
} from "@IvO/ui/components/field";
import { Input } from "@IvO/ui/components/input";
import { Textarea } from "@IvO/ui/components/textarea";
import { ArrowDown, ArrowUp, CheckCheck } from "lucide-react";
import { useState } from "react";
import { Picker } from "./controls";
import { type Action, type Decision, TEAM, totals } from "./model";

export function OutcomePanel({
	decision,
	canManage,
	onAction,
	onApply,
	onRestore,
	applied,
	busy,
}: {
	decision: Decision;
	canManage: boolean;
	onAction: (action: Action) => void;
	onApply: () => void;
	onRestore: () => void;
	applied: boolean;
	busy: boolean;
}) {
	const a = decision.attempt;
	const o = a.outcome;
	const scores = totals(decision, 1);
	const [selectedId, setSelected] = useState(o?.selectedId || "");
	const [ranking, setRanking] = useState(
		o?.ranking.length
			? o.ranking
			: [...a.proposals]
					.sort((x, y) => (scores[y.id] || 0) - (scores[x.id] || 0))
					.map((p) => p.id),
	);
	const [cutoff, setCutoff] = useState(
		o?.cutoff || Math.min(3, a.proposals.length),
	);
	const [rationale, setRationale] = useState(
		o?.rationale || a.changesRationale || "",
	);
	const [communicatedOn, setOn] = useState(o?.communicatedOn || "");
	const [communicatedTo, setTo] = useState(o?.communicatedTo || "");
	const invalidCutoff =
		!Number.isInteger(cutoff) || cutoff < 1 || cutoff > ranking.length;
	const ready = a.phase === "ready" && canManage && !busy;
	const move = (index: number, delta: number) => {
		const next = [...ranking];
		[next[index], next[index + delta]] = [next[index + delta], next[index]];
		setRanking(next);
	};
	return (
		<div className="flex flex-col gap-5">
			<div>
				<h3 className="font-semibold">Record the decision</h3>
				<p className="text-muted-foreground text-sm">
					Votes inform the decision. The decision maker owns the final call.
				</p>
			</div>
			{o && (
				<Alert>
					<CheckCheck />
					<AlertTitle>Decision recorded</AlertTitle>
					<AlertDescription>
						{TEAM.find((p) => p.id === o.actorId)?.name} ·{" "}
						{new Date(o.createdAt).toLocaleString()}
					</AlertDescription>
				</Alert>
			)}
			{a.phase === "changes_requested" && (
				<Alert>
					<AlertTitle>Changes requested</AlertTitle>
					<AlertDescription>
						<p>{a.changesRationale}</p>
						{a.changesRequestedBy && (
							<p>
								{
									TEAM.find((person) => person.id === a.changesRequestedBy)
										?.name
								}{" "}
								·{" "}
								{a.changesRequestedAt
									? new Date(a.changesRequestedAt).toLocaleString()
									: ""}
							</p>
						)}
					</AlertDescription>
				</Alert>
			)}
			{!["ready", "decided", "changes_requested"].includes(a.phase) && (
				<Alert>
					<AlertTitle>Voting is not complete</AlertTitle>
					<AlertDescription>
						Close both rounds before recording the final outcome. You can review
						results in Deliberate.
					</AlertDescription>
				</Alert>
			)}
			<FieldGroup>
				{decision.type === "choice" ? (
					<Field>
						<FieldLabel>Chosen version</FieldLabel>
						<Picker
							label="Chosen version"
							value={selectedId}
							disabled={!ready}
							onChange={setSelected}
							options={[
								{ value: "", label: "Choose the version to move forward…" },
								...a.versions.map((v) => ({ value: v.id, label: v.name })),
							]}
						/>
					</Field>
				) : (
					<>
						<p className="text-muted-foreground text-sm">
							Use the arrows to set the final order. Move the cutoff to define
							this quarter’s commitment.
						</p>
						<ol className="flex flex-col gap-2">
							{ranking.map((id, index) => (
								<li key={id}>
									<div className="flex items-start gap-2 rounded-md border p-3">
										<Badge variant={index < cutoff ? "default" : "secondary"}>
											{index + 1}
										</Badge>
										<div className="min-w-0 flex-1">
											<p className="font-medium text-sm">
												{a.proposals.find((p) => p.id === id)?.title}
											</p>
											<p className="text-muted-foreground text-xs">
												{scores[id] || 0} votes ·{" "}
												{a.proposals.find((p) => p.id === id)?.effort} effort
											</p>
										</div>
										{ready && (
											<div className="flex">
												<Button
													variant="ghost"
													size="icon-xs"
													aria-label={`Rank ${a.proposals.find((p) => p.id === id)?.title} higher`}
													disabled={index === 0}
													onClick={() => move(index, -1)}
												>
													<ArrowUp />
												</Button>
												<Button
													variant="ghost"
													size="icon-xs"
													aria-label={`Rank ${a.proposals.find((p) => p.id === id)?.title} lower`}
													disabled={index === ranking.length - 1}
													onClick={() => move(index, 1)}
												>
													<ArrowDown />
												</Button>
											</div>
										)}
									</div>
									{index === cutoff - 1 && (
										<p className="py-2 text-center font-medium text-muted-foreground text-xs">
											↑ Committed this quarter · Later candidates ↓
										</p>
									)}
								</li>
							))}
						</ol>
						<Field orientation="horizontal" data-invalid={invalidCutoff}>
							<FieldLabel htmlFor="commitment-cutoff">
								Commit top improvements
							</FieldLabel>
							<Input
								className="w-20"
								id="commitment-cutoff"
								aria-invalid={invalidCutoff}
								type="number"
								min={1}
								max={ranking.length}
								value={cutoff}
								disabled={!ready}
								onChange={(e) => setCutoff(Number(e.target.value))}
							/>
						</Field>
						{invalidCutoff && (
							<FieldDescription>
								Choose a whole-number cutoff from 1 to {ranking.length}.
							</FieldDescription>
						)}
					</>
				)}
				<Field>
					<FieldLabel htmlFor="decision-rationale">
						Rationale <span aria-hidden="true">*</span>
					</FieldLabel>
					<Textarea
						id="decision-rationale"
						placeholder="Why this outcome? Explain tradeoffs and any difference from the vote results."
						value={rationale}
						onChange={(e) => setRationale(e.target.value)}
						disabled={!ready}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="communicated-on">
						Communicated on · optional
					</FieldLabel>
					<Input
						id="communicated-on"
						type="date"
						value={communicatedOn}
						disabled={!ready}
						onChange={(e) => setOn(e.target.value)}
					/>
				</Field>
				<Field>
					<FieldLabel htmlFor="communicated-to">
						Communicated to · optional
					</FieldLabel>
					<Input
						id="communicated-to"
						value={communicatedTo}
						disabled={!ready}
						onChange={(e) => setTo(e.target.value)}
						placeholder="Team, meeting, or channel"
					/>
				</Field>
				<p className="text-muted-foreground text-xs">
					Communication fields are a record only. No messages are sent.
				</p>
				{ready && (
					<>
						<Button
							disabled={
								!rationale.trim() ||
								(decision.type === "choice"
									? !selectedId
									: !Number.isInteger(cutoff) ||
										cutoff < 1 ||
										cutoff > ranking.length)
							}
							onClick={() =>
								onAction({
									type: "finalize",
									outcome: {
										selectedId: selectedId || undefined,
										ranking,
										cutoff,
										rationale,
										communicatedOn,
										communicatedTo,
									},
								})
							}
						>
							Finalize decision
						</Button>
						<Button
							variant="outline"
							disabled={!rationale.trim()}
							onClick={() => onAction({ type: "request_changes", rationale })}
						>
							Request changes instead
						</Button>
					</>
				)}
			</FieldGroup>
			{o && decision.type === "choice" && (
				<Card>
					<CardHeader>
						<CardTitle>
							{applied
								? "Chosen version is current"
								: "Ready to advance this version?"}
						</CardTitle>
						<CardDescription>
							Finalizing recorded the choice. Applying it changes the flow in
							this browser only.
						</CardDescription>
					</CardHeader>
					<CardContent>
						{applied ? (
							<Button
								variant="outline"
								disabled={!canManage || busy}
								onClick={onRestore}
							>
								Restore original version
							</Button>
						) : (
							<Button disabled={!canManage || busy} onClick={onApply}>
								Make current version
							</Button>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
