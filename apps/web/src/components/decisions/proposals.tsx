import { Badge } from "@IvO/ui/components/badge";
import { Button } from "@IvO/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@IvO/ui/components/card";
import { Checkbox } from "@IvO/ui/components/checkbox";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@IvO/ui/components/collapsible";
import { Field, FieldGroup, FieldLabel } from "@IvO/ui/components/field";
import { Input } from "@IvO/ui/components/input";
import { Textarea } from "@IvO/ui/components/textarea";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Picker } from "./controls";
import { copy, type Decision, type Proposal, uid } from "./model";

export function Proposals({
	decision,
	editable,
	canPropose,
	onEdit,
	onAdd,
	onMerge,
	onEvidence,
}: {
	decision: Decision;
	editable: boolean;
	canPropose: boolean;
	onEdit: (proposals: Proposal[]) => void;
	onAdd: (p: Proposal) => void;
	onMerge: (target: string, source: string) => void;
	onEvidence: (id: string) => void;
}) {
	const [title, setTitle] = useState("");
	const proposals = decision.attempt.proposals;
	const update = (id: string, edit: (p: Proposal) => void) => {
		const next = copy(proposals);
		const p = next.find((p) => p.id === id);
		if (p) {
			edit(p);
			onEdit(next);
		}
	};
	const move = (i: number, delta: number) => {
		const next = copy(proposals);
		[next[i], next[i + delta]] = [next[i + delta], next[i]];
		onEdit(next);
	};
	return (
		<div className="flex flex-col gap-4">
			<div>
				<h3 className="font-semibold">Improvement proposals</h3>
				<p className="text-muted-foreground text-sm">
					One consolidated list. Specialist suggestions are simulated and
					editable.
				</p>
			</div>
			{proposals.map((p, index) => (
				<Card key={p.id}>
					<CardHeader>
						<div className="flex flex-wrap gap-1">
							{p.contributors.map((agent) => (
								<Badge key={agent} variant="secondary">
									{agent}
								</Badge>
							))}
						</div>
						<CardTitle>{p.title}</CardTitle>
						<CardDescription>{p.description}</CardDescription>
					</CardHeader>
					<CardContent className="flex flex-col gap-3">
						{editable && (
							<Collapsible>
								<CollapsibleTrigger
									render={<Button variant="ghost" size="sm" />}
								>
									Edit proposal
								</CollapsibleTrigger>
								<CollapsibleContent className="mt-3">
									<FieldGroup>
										<Field data-invalid={!p.title.trim()}>
											<FieldLabel htmlFor={`${p.id}-title`}>
												Proposal title
											</FieldLabel>
											<Input
												id={`${p.id}-title`}
												aria-invalid={!p.title.trim()}
												key={p.title}
												defaultValue={p.title}
												onBlur={(e) =>
													update(p.id, (p) => {
														p.title = e.target.value;
													})
												}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor={`${p.id}-description`}>
												Description
											</FieldLabel>
											<Textarea
												id={`${p.id}-description`}
												key={p.description}
												defaultValue={p.description}
												onBlur={(e) =>
													update(p.id, (p) => {
														p.description = e.target.value;
													})
												}
											/>
										</Field>
										<Field>
											<FieldLabel htmlFor={`${p.id}-benefit`}>
												Expected benefit
											</FieldLabel>
											<Input
												id={`${p.id}-benefit`}
												key={p.benefit}
												defaultValue={p.benefit}
												onBlur={(e) =>
													update(p.id, (p) => {
														p.benefit = e.target.value;
													})
												}
											/>
										</Field>
										<Field>
											<FieldLabel>Effort</FieldLabel>
											<Picker
												label={`Effort for ${p.title}`}
												value={p.effort}
												onChange={(value) =>
													update(p.id, (p) => {
														p.effort = value as Proposal["effort"];
													})
												}
												options={["Small", "Medium", "Large", "Unknown"].map(
													(value) => ({ value, label: value }),
												)}
											/>
										</Field>
										<Field>
											<FieldLabel>Supporting evidence</FieldLabel>
											<div className="flex flex-col gap-2">
												{decision.attempt.brief.items.map((item) => (
													<label
														key={item.id}
														className="flex items-start gap-2 text-xs"
													>
														<Checkbox
															checked={p.evidenceIds.includes(item.id)}
															onCheckedChange={(checked) =>
																update(p.id, (p) => {
																	p.evidenceIds = checked
																		? [...p.evidenceIds, item.id]
																		: p.evidenceIds.filter(
																				(id) => id !== item.id,
																			);
																})
															}
														/>
														{item.title}
													</label>
												))}
											</div>
										</Field>
										<Field>
											<FieldLabel>Affected screens</FieldLabel>
											<div className="flex flex-wrap gap-1">
												{decision.attempt.context.screens.map((screen) => (
													<label
														key={screen.id}
														className="flex items-center gap-1 text-xs"
													>
														<Checkbox
															checked={p.screenIds.includes(screen.id)}
															onCheckedChange={(checked) =>
																update(p.id, (p) => {
																	p.screenIds = checked
																		? [...p.screenIds, screen.id]
																		: p.screenIds.filter(
																				(id) => id !== screen.id,
																			);
																})
															}
														/>
														{screen.title}
													</label>
												))}
											</div>
										</Field>
									</FieldGroup>
								</CollapsibleContent>
							</Collapsible>
						)}
						<p className="text-muted-foreground text-sm">
							Expected benefit: {p.benefit || "Not estimated"}
						</p>
						<Badge variant="outline">Effort · {p.effort}</Badge>
						<div className="flex flex-wrap gap-1">
							{p.evidenceIds.map((id) => (
								<Button
									key={id}
									variant="link"
									size="sm"
									onClick={() => onEvidence(id)}
								>
									{decision.attempt.brief.items.find((e) => e.id === id)
										?.title || id}
								</Button>
							))}
						</div>
						{editable && (
							<Picker
								label={`Merge ${p.title} into`}
								value=""
								options={[
									{ value: "", label: "Merge into another proposal…" },
									...proposals
										.filter((other) => other.id !== p.id)
										.map((other) => ({ value: other.id, label: other.title })),
								]}
								onChange={(target) => {
									if (target) onMerge(target, p.id);
								}}
							/>
						)}
					</CardContent>
					{editable && (
						<CardFooter className="gap-1">
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Move ${p.title} up`}
								disabled={index === 0}
								onClick={() => move(index, -1)}
							>
								<ArrowUp />
							</Button>
							<Button
								variant="ghost"
								size="icon-sm"
								aria-label={`Move ${p.title} down`}
								disabled={index === proposals.length - 1}
								onClick={() => move(index, 1)}
							>
								<ArrowDown />
							</Button>
							<Button
								variant="ghost"
								size="sm"
								onClick={() =>
									onEdit(proposals.filter((other) => other.id !== p.id))
								}
							>
								<Trash2 data-icon="inline-start" />
								Remove
							</Button>
						</CardFooter>
					)}
				</Card>
			))}
			{canPropose && (
				<form
					onSubmit={(e) => {
						e.preventDefault();
						if (!title.trim()) return;
						onAdd({
							id: uid(),
							title: title.trim(),
							description: "",
							contributors: [],
							evidenceIds: [],
							screenIds: [],
							benefit: "",
							effort: "Unknown",
						});
						setTitle("");
					}}
				>
					<FieldGroup>
						<Field>
							<FieldLabel htmlFor="new-proposal">
								Propose an improvement
							</FieldLabel>
							<Input
								id="new-proposal"
								value={title}
								onChange={(e) => setTitle(e.target.value)}
								placeholder="What should we improve?"
								required
							/>
						</Field>
						<Button type="submit" variant="outline" disabled={!title.trim()}>
							<Plus data-icon="inline-start" />
							Add proposal
						</Button>
					</FieldGroup>
				</form>
			)}
		</div>
	);
}
