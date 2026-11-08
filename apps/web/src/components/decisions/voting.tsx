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
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@IvO/ui/components/field";
import { Input } from "@IvO/ui/components/input";
import { RadioGroup, RadioGroupItem } from "@IvO/ui/components/radio-group";
import { Textarea } from "@IvO/ui/components/textarea";
import { useState } from "react";
import { Picker } from "./controls";
import {
	type Action,
	type Ballot,
	type Decision,
	TEAM,
	totals,
	validateBallot,
	visibleRound,
} from "./model";

export function Results({
	decision,
	actor,
}: {
	decision: Decision;
	actor: string;
}) {
	const options =
		decision.type === "choice"
			? decision.attempt.versions
			: decision.attempt.proposals;
	return (
		<div className="flex flex-col gap-3">
			{decision.attempt.rounds.map((r, index) =>
				r.closedAt ? (
					<Card key={index === 0 ? "first" : "second"}>
						<CardHeader>
							<CardTitle>Round {index + 1} results</CardTitle>
							<CardDescription>
								Closed · {Object.keys(r.ballots).length}/
								{decision.attempt.electorate.length} submitted
							</CardDescription>
						</CardHeader>
						<CardContent className="flex flex-col gap-3">
							{options.map((option) => (
								<div
									key={option.id}
									className="flex items-start justify-between gap-3 text-sm"
								>
									<span>{"name" in option ? option.name : option.title}</span>
									<Badge variant="secondary">
										{totals(decision, index)[option.id] || 0}
									</Badge>
								</div>
							))}
							<p className="text-muted-foreground text-xs">
								Abstained:{" "}
								{Object.values(r.ballots).filter((b) => b.abstain).length} ·
								Missing:{" "}
								{decision.attempt.electorate
									.filter((id) => !r.ballots[id])
									.map((id) => TEAM.find((p) => p.id === id)?.name)
									.join(", ") || "None"}
							</p>
							<details>
								<summary className="cursor-pointer text-xs">
									Individual ballots
								</summary>
								{Object.entries(
									visibleRound(decision, index, actor).ballots,
								).map(([id, b]) => (
									<p className="mt-2 text-muted-foreground text-xs" key={id}>
										{TEAM.find((p) => p.id === id)?.name}:{" "}
										{b.abstain
											? "Abstained"
											: decision.type === "choice"
												? options.find((o) => o.id === b.optionId) &&
													("name" in options[0]
														? decision.attempt.versions.find(
																(v) => v.id === b.optionId,
															)?.name
														: b.optionId)
												: Object.entries(b.allocations || {})
														.map(
															([id, n]) =>
																`${decision.attempt.proposals.find((p) => p.id === id)?.title}: ${n}`,
														)
														.join("; ") || "0 allocated"}
									</p>
								))}
							</details>
						</CardContent>
					</Card>
				) : null,
			)}
		</div>
	);
}
export function BallotForm({
	decision,
	actor,
	onAction,
}: {
	decision: Decision;
	actor: string;
	onAction: (action: Action) => void;
}) {
	const index = decision.attempt.phase === "round1" ? 0 : 1;
	const existing = decision.attempt.rounds[index].ballots[actor];
	const [choice, setChoice] = useState(
		existing?.abstain ? "abstain" : existing?.optionId || "",
	);
	const [allocations, setAllocations] = useState<Record<string, number>>(
		existing?.allocations || {},
	);
	const [abstain, setAbstain] = useState(existing?.abstain || false);
	const ballot: Ballot =
		decision.type === "choice"
			? {
					abstain: choice === "abstain",
					...(choice && choice !== "abstain" ? { optionId: choice } : {}),
				}
			: abstain
				? { abstain: true }
				: { abstain: false, allocations };
	let error = "";
	try {
		validateBallot(decision, actor, ballot);
	} catch (e) {
		error = e instanceof Error ? e.message : "Invalid ballot";
	}
	const total = Object.values(allocations).reduce((sum, n) => sum + n, 0);
	return (
		<Card>
			<CardHeader>
				<CardTitle>Your round {index + 1} ballot</CardTitle>
				<CardDescription>
					Others’ votes are hidden until the round closes.{" "}
					{existing
						? "Your ballot is submitted; you can update it."
						: "Your ballot has not been submitted."}
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onAction({ type: "submit", ballot });
					}}
				>
					<FieldGroup>
						{decision.type === "choice" ? (
							<FieldSet>
								<FieldLegend>Which version should move forward?</FieldLegend>
								<RadioGroup
									value={choice}
									onValueChange={(v) => setChoice(String(v))}
								>
									{[
										...decision.attempt.versions.map((v) => ({
											id: v.id,
											label: v.name,
										})),
										{ id: "abstain", label: "Abstain" },
									].map((v) => (
										<Field orientation="horizontal" key={v.id}>
											<RadioGroupItem value={v.id} id={`vote-${v.id}`} />
											<FieldLabel htmlFor={`vote-${v.id}`}>
												{v.label}
											</FieldLabel>
										</Field>
									))}
								</RadioGroup>
							</FieldSet>
						) : (
							<>
								<Field>
									<FieldLabel>Participation</FieldLabel>
									<Picker
										label="Ballot participation"
										value={abstain ? "abstain" : "allocate"}
										onChange={(v) => setAbstain(v === "abstain")}
										options={[
											{ value: "allocate", label: "Allocate votes" },
											{ value: "abstain", label: "Abstain" },
										]}
									/>
								</Field>
								{!abstain && (
									<>
										<p className="text-sm">
											{decision.attempt.voteBudget - total} votes remaining
										</p>
										{decision.attempt.proposals.map((p) => (
											<Field
												key={p.id}
												orientation="horizontal"
												data-invalid={
													total > decision.attempt.voteBudget ||
													!Number.isInteger(allocations[p.id] ?? 0) ||
													(allocations[p.id] ?? 0) < 0
												}
											>
												<FieldLabel
													htmlFor={`allocation-${p.id}`}
													className="flex-1"
												>
													{p.title}
												</FieldLabel>
												<Input
													id={`allocation-${p.id}`}
													aria-invalid={
														total > decision.attempt.voteBudget ||
														!Number.isInteger(allocations[p.id] ?? 0) ||
														(allocations[p.id] ?? 0) < 0
													}
													className="w-20"
													type="number"
													min={0}
													max={decision.attempt.voteBudget}
													step={1}
													value={allocations[p.id] ?? 0}
													onChange={(e) =>
														setAllocations((prev) => ({
															...prev,
															[p.id]: Number(e.target.value),
														}))
													}
												/>
											</Field>
										))}
									</>
								)}
							</>
						)}
						{error && (
							<p className="text-muted-foreground text-sm" role="status">
								{error}
							</p>
						)}
						<Button type="submit" disabled={Boolean(error)}>
							{existing ? "Update ballot" : "Submit ballot"}
						</Button>
					</FieldGroup>
				</form>
			</CardContent>
		</Card>
	);
}
export function DiscussionForm({
	decision,
	actor,
	onAction,
}: {
	decision: Decision;
	actor: string;
	onAction: (action: Action) => void;
}) {
	const options =
		decision.type === "choice"
			? decision.attempt.versions.map((v) => ({ value: v.id, label: v.name }))
			: decision.attempt.proposals.map((p) => ({
					value: p.id,
					label: p.title,
				}));
	const [optionId, setOption] = useState(
		options[0]?.value || decision.attempt.context.id,
	);
	const [screenId, setScreen] = useState("");
	const [kind, setKind] = useState<"pro" | "con" | "comment">("comment");
	const [text, setText] = useState("");
	const version =
		decision.attempt.versions.find((v) => v.id === optionId) ||
		decision.attempt.context;
	const readonly = ["decided", "changes_requested"].includes(
		decision.attempt.phase,
	);
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h3 className="font-semibold">Discussion</h3>
				<p className="text-muted-foreground text-sm">
					Capture evidence, pros, cons, and optional review feedback.
				</p>
			</div>
			{decision.attempt.discussions.map((n) => (
				<Card key={n.id}>
					<CardHeader>
						<div className="flex items-center justify-between">
							<Badge variant="outline">{n.kind}</Badge>
							<span className="text-muted-foreground text-xs">
								{TEAM.find((p) => p.id === n.authorId)?.name}
							</span>
						</div>
						<CardDescription>
							{options.find((o) => o.value === n.optionId)?.label}
							{n.screenId
								? ` · ${(decision.attempt.versions.find((v) => v.id === n.optionId) || decision.attempt.context).screens.find((s) => s.id === n.screenId)?.title || "Screen note"}`
								: ""}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="whitespace-pre-wrap text-sm">{n.text}</p>
					</CardContent>
				</Card>
			))}
			{!readonly && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						onAction({
							type: "discuss",
							entry: { optionId, kind, text, screenId: screenId || undefined },
						});
						setText("");
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel>Option</FieldLabel>
							<Picker
								label="Discussion option"
								value={optionId}
								options={options}
								onChange={(v) => {
									setOption(v);
									setScreen("");
								}}
							/>
						</Field>
						<Field>
							<FieldLabel>Note type</FieldLabel>
							<Picker
								label="Discussion note type"
								value={kind}
								options={["comment", "pro", "con"].map((value) => ({
									value,
									label:
										value === "pro"
											? "Pro"
											: value === "con"
												? "Con"
												: "Comment",
								}))}
								onChange={(v) => setKind(v as typeof kind)}
							/>
						</Field>
						<Field>
							<FieldLabel>Screen reference</FieldLabel>
							<Picker
								label="Discussion screen"
								value={screenId}
								options={[
									{ value: "", label: "Whole option" },
									...version.screens.map((s) => ({
										value: s.id,
										label: s.title,
									})),
								]}
								onChange={setScreen}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="discussion-note">Your note</FieldLabel>
							<Textarea
								id="discussion-note"
								value={text}
								onChange={(e) => setText(e.target.value)}
								required
							/>
						</Field>
						<Button
							variant="outline"
							type="submit"
							disabled={
								!text.trim() ||
								![...decision.deciders, ...decision.providers].includes(actor)
							}
						>
							Add note
						</Button>
					</FieldGroup>
				</form>
			)}
			{decision.attempt.phase === "discussion" && (
				<Alert>
					<AlertTitle>Discuss before reconsidering</AlertTitle>
					<AlertDescription>
						Round-one results inform the conversation. The decision maker can
						open round two when the team is ready.
					</AlertDescription>
				</Alert>
			)}
		</div>
	);
}
