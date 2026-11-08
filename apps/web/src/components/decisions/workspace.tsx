import { Alert, AlertDescription, AlertTitle } from "@IvO/ui/components/alert";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@IvO/ui/components/alert-dialog";
import { Avatar, AvatarFallback } from "@IvO/ui/components/avatar";
import { Badge } from "@IvO/ui/components/badge";
import { Button, buttonVariants } from "@IvO/ui/components/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@IvO/ui/components/card";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@IvO/ui/components/empty";
import { FieldGroup } from "@IvO/ui/components/field";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@IvO/ui/components/popover";
import {
	ResizableHandle,
	ResizablePanel,
	ResizablePanelGroup,
} from "@IvO/ui/components/resizable";
import { Separator } from "@IvO/ui/components/separator";
import {
	Tabs,
	TabsContent,
	TabsList,
	TabsTrigger,
} from "@IvO/ui/components/tabs";
import { ToggleGroup, ToggleGroupItem } from "@IvO/ui/components/toggle-group";
import {
	ArrowLeft,
	ArrowRight,
	BookOpen,
	ChevronLeft,
	ChevronRight,
	GitBranch,
	ListOrdered,
	LockKeyhole,
	RotateCcw,
	Scale,
	X,
} from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import { ScreenMockup } from "../dashboard/screen-mockup";
import { PeopleProperty, Picker, Property } from "./controls";
import { EvidencePanel } from "./evidence-panel";
import { createDecision, makeBrief } from "./fixtures";
import {
	type Action,
	addProposal,
	copy,
	type Decision,
	type DecisionType,
	editPreparation,
	electorate,
	isDecider,
	mergeProposals,
	PHASE_LABELS,
	setupErrors,
	TEAM,
	transition,
	uid,
	type Version,
} from "./model";
import { OutcomePanel } from "./outcome";
import { Proposals } from "./proposals";
import {
	applyOverride,
	freezeAssets,
	loadOverride,
	resetDecision,
	resolveVersion,
	restoreOverride,
} from "./storage";
import { useDecision, useResolvedVersion } from "./use-decision";
import { VersionEditor } from "./version-editor";
import { BallotForm, DiscussionForm, Results } from "./voting";

type Section = "properties" | "evidence" | "deliberate" | "decide";
interface Confirmation {
	title: string;
	description: string;
	action: () => void | Promise<void>;
}

export function DecisionWorkspace({
	flow,
	onClose,
}: {
	flow: DashboardFlow;
	onClose: () => void;
}) {
	const {
		decision: d,
		commit,
		error,
		setError,
		ready,
		clear,
	} = useDecision(flow.id);
	const [actor, setActor] = useState("you");
	const [section, setSection] = useState<Section>("properties");
	const [busy, setBusy] = useState(false);
	const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
	const [selected, setSelected] = useState<string | null>(null);
	const [previewOnly, setPreviewOnly] = useState(false);
	const [applied, setApplied] = useState(false);
	const [wide, setWide] = useState(false);
	const [saved, setSaved] = useState("");
	const root = useRef<HTMLDivElement>(null);
	const scroll = useRef<HTMLDivElement>(null);
	useEffect(() => {
		if (section) scroll.current?.scrollTo({ top: 0 });
	}, [section]);
	useEffect(() => {
		const element = root.current;
		if (!element) return;
		const observer = new ResizeObserver((entries) =>
			setWide(entries[0].contentRect.width >= 900),
		);
		observer.observe(element);
		return () => observer.disconnect();
	}, []);
	useEffect(() => {
		try {
			const current = loadOverride(flow.id);
			const chosen = d?.attempt.versions.find(
				(v) => v.id === d.attempt.outcome?.selectedId,
			);
			setApplied(
				Boolean(
					current &&
						chosen &&
						current.snapshot.id === chosen.id &&
						current.snapshot.frozenAt === chosen.frozenAt,
				),
			);
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Unable to read the current version.",
			);
		}
	}, [flow.id, d, setError]);
	const perform = async (work: () => void | Promise<void>) => {
		if (busy) return;
		setBusy(true);
		try {
			await work();
			setError("");
			setSaved("Saved in this browser");
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "This change could not be saved.",
			);
		} finally {
			setBusy(false);
		}
	};
	const persist = (next: Decision) => {
		commit(next);
		setSaved("Saved in this browser");
	};
	const manage = d ? isDecider(d, actor) : false;
	const preparation = d?.attempt.phase === "preparation";
	const editable = manage && preparation && !busy;
	const change = (edit: (draft: Decision) => void) => {
		if (d) void perform(() => persist(editPreparation(d, actor, edit)));
	};
	const action = (a: Action) => {
		if (!d) return;
		void perform(async () => {
			const next =
				a.type === "start"
					? transition(await freezeAssets(d), actor, a)
					: transition(d, actor, a);
			persist(next);
			if (a.type === "start" || a.type === "second") setSection("deliberate");
			if (a.type === "finalize" || a.type === "request_changes")
				setSection("decide");
		});
	};
	const restart = (incorporate = false) => {
		setConfirmation({
			title: incorporate
				? "Update the brief and restart voting?"
				: "Reopen this decision?",
			description:
				"The current attempt stays available in history. New ballots and opened-version checks will start fresh; versions, participants, and proposals can then be edited.",
			action: () => {
				action({ type: "restart", incorporate });
				setSelected(null);
			},
		});
	};
	const reset = () =>
		setConfirmation({
			title: "Reset this local decision?",
			description:
				"This removes the decision, ballots, and history from this browser and restores the original flow. Other flows are unaffected.",
			action: () =>
				perform(() => {
					restoreOverride(flow.id);
					resetDecision(flow.id);
					clear();
					setApplied(false);
					setSelected(null);
					setSection("properties");
				}),
		});
	const setup = (type: DecisionType, demo: boolean) =>
		void perform(() => {
			persist(createDecision(flow, type, demo));
			setSelected(null);
			setSection(demo ? "evidence" : "properties");
		});
	const openVersion = (v: Version) =>
		void perform(async () => {
			const loaded = await resolveVersion(v);
			loaded.release();
			if (d) persist(transition(d, actor, { type: "open", versionId: v.id }));
			setSelected(v.id);
			if (!wide) setPreviewOnly(true);
		});
	const version = d
		? d.attempt.versions.find((v) => v.id === selected) || d.attempt.context
		: null;
	const errors = d ? setupErrors(d) : [];
	const currentRound = d?.attempt.phase === "round1" ? 0 : 1;
	const missing = d
		? d.attempt.electorate.filter(
				(id) => !d.attempt.rounds[currentRound].ballots[id],
			)
		: [];
	const closeRound = () =>
		missing.length
			? setConfirmation({
					title: `Close round ${currentRound + 1} with missing ballots?`,
					description: `${missing.map((id) => TEAM.find((p) => p.id === id)?.name).join(", ")} ${missing.length === 1 ? "has" : "have"} not submitted. Their ballots remain missing, not abstentions. Closing reveals submitted votes.`,
					action: () => action({ type: "close", confirmMissing: true }),
				})
			: action({ type: "close" });
	const onApply = () =>
		setConfirmation({
			title: "Make the chosen snapshot current?",
			description:
				"The dashboard and flow viewer will use this frozen version in this browser. Original reviews stay attached to the original version. You can restore the original later.",
			action: () =>
				perform(() => {
					if (!d) return;
					applyOverride(d, actor);
					setApplied(true);
				}),
		});
	const onRestore = () =>
		setConfirmation({
			title: "Restore the original flow?",
			description:
				"The decision and its selected snapshot remain recorded. Only the local current-version override is removed.",
			action: () =>
				perform(() => {
					restoreOverride(flow.id);
					setApplied(false);
				}),
		});
	const onEvidence = (id: string) => {
		setSection("evidence");
		requestAnimationFrame(() =>
			document
				.getElementById(`evidence-${id}`)
				?.scrollIntoView({ block: "start", behavior: "smooth" }),
		);
	};

	let content: ReactNode;
	if (!ready)
		content = (
			<p className="p-6 text-muted-foreground text-sm">
				Opening local decision…
			</p>
		);
	else if (!d)
		content = (
			<div className="flex flex-col gap-5 p-5">
				<Empty>
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Scale />
						</EmptyMedia>
						<EmptyTitle>A clear place to decide</EmptyTitle>
						<EmptyDescription>
							Bring evidence, review alternatives, and make the next step
							explicit.
						</EmptyDescription>
					</EmptyHeader>
				</Empty>
				{(
					[
						{
							type: "choice",
							icon: GitBranch,
							title: "Choose a version",
							description:
								"Compare two frozen versions. Review, vote, and decide which moves forward.",
						},
						{
							type: "prioritization",
							icon: ListOrdered,
							title: "Prioritize improvements",
							description:
								"Discuss proposals, distribute votes, and commit to a ranked plan for next quarter.",
						},
					] as const
				).map((item) => (
					<Card key={item.type}>
						<CardHeader>
							<item.icon className="size-5" />
							<CardTitle>{item.title}</CardTitle>
							<CardDescription>{item.description}</CardDescription>
						</CardHeader>
						<CardContent>
							<Badge variant="secondary">Local prototype</Badge>
						</CardContent>
						<CardFooter className="flex-wrap gap-2">
							<Button
								disabled={busy || Boolean(error)}
								onClick={() => setup(item.type, false)}
							>
								Start {item.type}
							</Button>
							<Button
								disabled={busy || Boolean(error)}
								variant="outline"
								onClick={() => setup(item.type, true)}
							>
								Load {item.type} demo example
							</Button>
						</CardFooter>
					</Card>
				))}
				<p className="text-muted-foreground text-xs">
					Human participants, agent findings, and connector reports are
					simulated. Everything stays in this browser.
				</p>
			</div>
		);
	else
		content = (
			<Tabs
				value={section}
				onValueChange={(value) => setSection(value as Section)}
				className="flex min-h-0 flex-1 flex-col gap-0"
			>
				<div className="shrink-0 px-4">
					<TabsList
						variant="line"
						className="w-full"
						aria-label="Decision sections"
					>
						{(["properties", "evidence", "deliberate", "decide"] as const).map(
							(key, index) => (
								<TabsTrigger key={key} value={key}>
									{index + 1}. {key[0].toUpperCase() + key.slice(1)}
								</TabsTrigger>
							),
						)}
					</TabsList>
				</div>
				<Separator />
				<div
					className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5"
					ref={scroll}
					data-testid="decision-scroll"
				>
					<TabsContent value="properties">
						<div className="flex flex-col gap-6">
							<div>
								<h3 className="font-semibold">Properties</h3>
								<p className="text-muted-foreground text-sm">
									Agree on the question, people, and constraints.
								</p>
							</div>
							<FieldGroup className="gap-3">
								<Property
									label="Decision question"
									value={d.question}
									disabled={!editable}
									onSave={(value) =>
										change((d) => {
											d.question = value;
										})
									}
								/>
								<Property
									label="Due date"
									value={d.dueDate}
									type="date"
									disabled={!editable}
									onSave={(value) =>
										change((d) => {
											d.dueDate = value;
										})
									}
								/>
								{(
									[
										{ key: "deciders", label: "Decision makers" },
										{ key: "providers", label: "Input providers" },
									] as const
								).map(({ key, label }) => (
									<div key={key} className="flex items-start gap-2">
										<span className="w-36 shrink-0 pt-2 text-muted-foreground text-xs">
											{label}
										</span>
										<Popover>
											<PopoverTrigger
												render={
													<Button
														variant="ghost"
														className="h-auto min-h-8 justify-start whitespace-normal text-left"
														disabled={!editable}
													/>
												}
											>
												{d[key]
													.map((id) => TEAM.find((p) => p.id === id)?.name)
													.join(", ") || "Not assigned"}
											</PopoverTrigger>
											<PopoverContent>
												<PeopleProperty
													label={label}
													ids={d[key]}
													disabled={!editable}
													onChange={(ids) =>
														change((d) => {
															d[key] = ids;
														})
													}
												/>
											</PopoverContent>
										</Popover>
									</div>
								))}
								<Property
									label="People affected"
									value={d.affected}
									disabled={!editable}
									onSave={(value) =>
										change((d) => {
											d.affected = value;
										})
									}
								/>
								<Property
									label="Decision type"
									value={d.type === "choice" ? "Choice" : "Prioritization"}
									disabled
								/>
								<Property
									label="Commitment (days)"
									value={d.commitmentDays}
									type="number"
									disabled={!editable}
									onSave={(value) =>
										change((d) => {
											if (
												value &&
												(!Number.isInteger(Number(value)) || Number(value) < 1)
											)
												throw new Error("Use a positive whole number of days.");
											d.commitmentDays = value;
										})
									}
								/>
								<Property
									label="Earliest revisit"
									value={d.revisitDate}
									type="date"
									disabled={!editable}
									onSave={(value) =>
										change((d) => {
											d.revisitDate = value;
										})
									}
									hint={
										editable &&
										!d.revisitDate &&
										d.dueDate &&
										Number(d.commitmentDays) > 0 ? (
											<Button
												variant="link"
												size="sm"
												onClick={() =>
													change((d) => {
														const date = new Date(`${d.dueDate}T12:00:00Z`);
														date.setUTCDate(
															date.getUTCDate() + Number(d.commitmentDays),
														);
														d.revisitDate = date.toISOString().slice(0, 10);
													})
												}
											>
												Use due date + commitment
											</Button>
										) : null
									}
								/>
								<Property
									label="Votes per person"
									value={String(d.voteBudget)}
									type="number"
									disabled={!editable || d.type === "choice"}
									onSave={(value) =>
										change((d) => {
											const n = Number(value);
											if (!Number.isInteger(n) || n < 1)
												throw new Error(
													"Use a positive whole-number allowance.",
												);
											d.voteBudget = n;
										})
									}
								/>
							</FieldGroup>
							<Alert>
								<LockKeyhole />
								<AlertTitle>
									{preparation
										? "Ready when the team is"
										: "Parameters locked for this attempt"}
								</AlertTitle>
								<AlertDescription>
									{preparation
										? "Starting round one freezes the evidence, versions, proposal list, and voter roster."
										: "Reopen the decision to change versions, evidence, or participants. Previous voting remains in history."}
								</AlertDescription>
							</Alert>
							<Button variant="ghost" onClick={reset} disabled={busy}>
								Reset local decision
							</Button>
						</div>
					</TabsContent>
					<TabsContent value="evidence">
						<EvidencePanel
							decision={d}
							canManage={manage}
							busy={busy}
							onRefresh={() =>
								change((d) => {
									d.attempt.brief = makeBrief(
										flow,
										d.attempt.brief.revision + 1,
									);
								})
							}
							onFinding={() =>
								void perform(() => {
									if (d.attempt.phase === "decided")
										throw new Error("Reopen before adding findings.");
									const next = copy(d);
									next.incoming.push({
										...makeBrief(flow).items[2],
										id: `incoming-${uid()}`,
										title: "New research signal · outside the frozen brief",
										observation:
											"A simulated follow-up session raises a new concern about recovery after interruption.",
									});
									persist(next);
								})
							}
							onIncorporate={() => {
								if (preparation)
									change((draft) => {
										draft.attempt.brief.items.push(...draft.incoming);
										draft.attempt.brief.revision += 1;
										draft.attempt.brief.publishedAt = new Date().toISOString();
										draft.incoming = [];
									});
								else restart(true);
							}}
						/>
					</TabsContent>
					<TabsContent value="deliberate">
						<div className="flex flex-col gap-6">
							{d.type === "choice" ? (
								d.attempt.versions.map((v) => (
									<VersionEditor
										key={v.id}
										version={v}
										editable={editable}
										busy={busy}
										opened={Boolean(d.attempt.opened[actor]?.includes(v.id))}
										onError={setError}
										onUploadBusy={setBusy}
										onOpen={() => openVersion(v)}
										onChange={(version) =>
											change((d) => {
												d.attempt.versions = d.attempt.versions.map((v) =>
													v.id === version.id ? version : v,
												);
											})
										}
									/>
								))
							) : (
								<>
									<Button
										variant="outline"
										onClick={() => openVersion(d.attempt.context)}
									>
										Open journey context
									</Button>
									<Proposals
										decision={d}
										editable={editable}
										canPropose={
											preparation && electorate(d).includes(actor) && !busy
										}
										onEdit={(proposals) =>
											change((d) => {
												d.attempt.proposals = proposals;
											})
										}
										onAdd={(proposal) =>
											void perform(() =>
												persist(addProposal(d, actor, proposal)),
											)
										}
										onMerge={(target, source) =>
											void perform(() =>
												persist(mergeProposals(d, actor, target, source)),
											)
										}
										onEvidence={onEvidence}
									/>
								</>
							)}
							{["round1", "round2"].includes(d.attempt.phase) && (
								<>
									<p className="text-muted-foreground text-xs">
										{Object.keys(d.attempt.rounds[currentRound].ballots).length}
										/{d.attempt.electorate.length} ballots submitted. Other
										votes are hidden.
									</p>
									<BallotForm
										key={`${actor}:${d.attempt.number}:${d.attempt.phase}`}
										decision={d}
										actor={actor}
										onAction={action}
									/>
								</>
							)}
							<Results decision={d} actor={actor} />
							<DiscussionForm
								key={`${d.attempt.number}:${actor}`}
								decision={d}
								actor={actor}
								onAction={action}
							/>
						</div>
					</TabsContent>
					<TabsContent value="decide">
						<OutcomePanel
							key={`${d.attempt.number}:${d.attempt.phase}`}
							decision={d}
							canManage={manage}
							busy={busy}
							onAction={action}
							onApply={onApply}
							onRestore={onRestore}
							applied={applied}
						/>
					</TabsContent>
					{d.history.length > 0 && (
						<details className="mt-6 border-t pt-4">
							<summary className="cursor-pointer font-medium text-sm">
								Previous attempts ({d.history.length})
							</summary>
							{d.history.map((attempt) => (
								<Card key={attempt.number} className="mt-3">
									<CardHeader>
										<CardTitle>
											Attempt {attempt.number} · {PHASE_LABELS[attempt.phase]}
										</CardTitle>
										<CardDescription>
											Brief {attempt.brief.revision} ·{" "}
											{attempt.discussions.length} notes ·{" "}
											{attempt.outcome?.rationale ||
												attempt.changesRationale ||
												"Voting restarted"}
										</CardDescription>
									</CardHeader>
									<CardContent className="flex flex-col gap-3">
										<Results decision={{ ...d, attempt }} actor={actor} />
										<details>
											<summary className="cursor-pointer text-xs">
												Archived evidence and notes
											</summary>
											<p className="mt-2 text-xs">{attempt.brief.summary}</p>
											{attempt.brief.items.map((item) => (
												<p
													className="mt-2 text-muted-foreground text-xs"
													key={item.id}
												>
													{item.title}: {item.observation}
												</p>
											))}
											{attempt.discussions.map((note) => (
												<p className="mt-2 text-xs" key={note.id}>
													{TEAM.find((p) => p.id === note.authorId)?.name} ·{" "}
													{note.kind}: {note.text}
												</p>
											))}
										</details>
									</CardContent>
								</Card>
							))}
						</details>
					)}
				</div>
				<Separator />
				<footer className="flex shrink-0 flex-col gap-2 p-4">
					<div className="flex items-center justify-between gap-2">
						<span className="text-muted-foreground text-xs" role="status">
							{busy ? "Saving…" : saved || "Local prototype"}
						</span>
						{d.attempt.phase === "preparation" ? (
							<Button
								disabled={!manage || busy || errors.length > 0}
								onClick={() => action({ type: "start" })}
							>
								Start round one <ArrowRight data-icon="inline-end" />
							</Button>
						) : d.attempt.phase === "round1" || d.attempt.phase === "round2" ? (
							<Button disabled={!manage || busy} onClick={closeRound}>
								Close round & reveal
							</Button>
						) : d.attempt.phase === "discussion" ? (
							<Button
								disabled={!manage || busy}
								onClick={() => action({ type: "second" })}
							>
								Open round two <ArrowRight data-icon="inline-end" />
							</Button>
						) : d.attempt.phase === "ready" ? (
							<Button onClick={() => setSection("decide")}>
								Record outcome <ArrowRight data-icon="inline-end" />
							</Button>
						) : (
							<Button
								variant="outline"
								disabled={!manage || busy}
								onClick={() => restart()}
							>
								<RotateCcw data-icon="inline-start" />
								Reopen decision
							</Button>
						)}
					</div>
					{preparation && errors.length > 0 && (
						<p className="text-muted-foreground text-xs">{errors.join(" ")}</p>
					)}
					{!manage && (
						<p className="text-muted-foreground text-xs">
							Viewing as a participant. Switch to a decision maker to manage
							rounds.
						</p>
					)}
				</footer>
			</Tabs>
		);

	const panel = (
		<aside
			aria-label="Decision workspace"
			className="flex h-full min-h-0 w-full flex-col bg-background text-foreground"
		>
			<header className="flex shrink-0 flex-col gap-3 p-4">
				<div className="flex items-start justify-between gap-3">
					<div className="flex min-w-0 flex-col gap-1">
						<div className="flex items-center gap-2">
							<Scale className="size-4" />
							<h2 className="font-semibold">Decision</h2>
							<Badge variant="secondary">Prototype</Badge>
						</div>
						{d && (
							<p
								className="truncate text-muted-foreground text-sm"
								title={d.question}
							>
								{d.question || "Untitled decision"}
							</p>
						)}
					</div>
					<div className="flex shrink-0 items-center gap-1">
						<a
							href="/guide.html#decision-types"
							target="_blank"
							rel="noopener noreferrer"
							aria-label="Decision user guide (opens in a new tab)"
							className={buttonVariants({ variant: "ghost", size: "sm" })}
						>
							<BookOpen data-icon="inline-start" />
							Guide
						</a>
						<Button
							variant="ghost"
							size="icon-sm"
							aria-label="Close decision"
							onClick={onClose}
						>
							<X />
						</Button>
					</div>
				</div>
				{d && (
					<>
						<div className="flex flex-wrap items-center gap-2">
							<Badge variant="outline">
								{d.type === "choice" ? "Choice" : "Prioritization"}
							</Badge>
							<Badge variant="secondary">{PHASE_LABELS[d.attempt.phase]}</Badge>
							<span className="text-muted-foreground text-xs">
								Attempt {d.attempt.number}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<Avatar size="sm">
								<AvatarFallback>
									{actor === "you"
										? "Y"
										: TEAM.find((p) => p.id === actor)
												?.name.split(" ")
												.map((s) => s[0])
												.join("")}
								</AvatarFallback>
							</Avatar>
							<span className="shrink-0 text-muted-foreground text-xs">
								Viewing as
							</span>
							<Picker
								label="Viewing as simulated participant"
								value={actor}
								onChange={setActor}
								disabled={busy}
								options={TEAM.map((p) => ({
									value: p.id,
									label: `${p.name}${d.deciders.includes(p.id) ? " · Decision maker" : d.providers.includes(p.id) ? " · Input provider" : " · Observer"}`,
								}))}
							/>
						</div>
					</>
				)}
			</header>
			<Separator />
			{error && (
				<div className="shrink-0 p-4">
					<Alert variant="destructive">
						<AlertTitle>Change could not be saved</AlertTitle>
						<AlertDescription>{error}</AlertDescription>
					</Alert>
					{!d && (
						<Button variant="outline" onClick={reset} className="mt-2">
							Reset unreadable decision
						</Button>
					)}
				</div>
			)}
			{content}
		</aside>
	);
	const canvas = (
		<DecisionCanvas
			flow={flow}
			decision={d}
			version={version}
			selected={selected}
			onSelect={(id) => {
				const v = d?.attempt.versions.find((v) => v.id === id);
				if (v) openVersion(v);
			}}
		/>
	);
	return (
		<div
			ref={root}
			className="relative flex min-h-0 min-w-0 flex-1 overflow-hidden"
			data-testid="decision-workspace"
		>
			{wide ? (
				<ResizablePanelGroup orientation="horizontal">
					<ResizablePanel id="decision-canvas" minSize="360px">
						{canvas}
					</ResizablePanel>
					<ResizableHandle withHandle aria-label="Resize decision panel" />
					<ResizablePanel
						id="decision-panel"
						defaultSize="480px"
						minSize="400px"
						maxSize="640px"
					>
						{panel}
					</ResizablePanel>
				</ResizablePanelGroup>
			) : previewOnly ? (
				<div className="flex min-h-0 flex-1 flex-col">
					<div className="shrink-0 border-b bg-background p-2">
						<Button variant="ghost" onClick={() => setPreviewOnly(false)}>
							<ArrowLeft data-icon="inline-start" />
							Back to Decision
						</Button>
					</div>
					<div className="min-h-0 flex-1">{canvas}</div>
				</div>
			) : (
				<>
					<div className="min-w-0 flex-1">{canvas}</div>
					<div className="absolute inset-y-0 right-0 w-[min(480px,100%)] border-l shadow-xl">
						{panel}
					</div>
				</>
			)}
			<AlertDialog
				open={Boolean(confirmation)}
				onOpenChange={(open) => {
					if (!open && !busy) setConfirmation(null);
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>{confirmation?.title}</AlertDialogTitle>
						<AlertDialogDescription>
							{confirmation?.description}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
						<AlertDialogAction
							disabled={busy}
							onClick={() => {
								const current = confirmation;
								setConfirmation(null);
								void current?.action();
							}}
						>
							Confirm
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

function DecisionCanvas({
	flow,
	decision,
	version,
	selected,
	onSelect,
}: {
	flow: DashboardFlow;
	decision: Decision | null;
	version: Version | null;
	selected: string | null;
	onSelect: (id: string) => void;
}) {
	const { resolved, error } = useResolvedVersion(version);
	const [step, setStep] = useState(0);
	useEffect(() => {
		if (version?.id) setStep(0);
	}, [version?.id]);
	const screens = resolved?.screens || (!version ? flow.screens : []);
	const index = Math.min(step, Math.max(0, screens.length - 1));
	const screen = screens[index];
	return (
		<section
			aria-label="Decision version canvas"
			className="flex h-full min-h-0 flex-col bg-muted/30"
		>
			<header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
				<div>
					<p className="font-medium text-muted-foreground text-xs uppercase tracking-widest">
						{version?.frozenAt ? "Frozen snapshot" : "Journey preview"}
					</p>
					<h3 className="mt-1 font-medium">
						{decision?.type === "prioritization"
							? "Journey context"
							: selected && version
								? version.name
								: flow.flowLabel}
					</h3>
				</div>
				{decision?.type === "choice" && (
					<ToggleGroup
						value={selected ? [selected] : []}
						onValueChange={(values) => {
							if (values[0]) onSelect(String(values[0]));
						}}
						variant="outline"
						aria-label="Preview version"
					>
						{decision.attempt.versions.map((v, i) => (
							<ToggleGroupItem key={v.id} value={v.id}>
								{i === 0 ? "Version A" : "Version B"}
							</ToggleGroupItem>
						))}
					</ToggleGroup>
				)}
			</header>
			{error ? (
				<Alert variant="destructive">
					<AlertTitle>Snapshot unavailable</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			) : (
				<div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-6">
					{screen ? (
						<ScreenMockup
							screen={screen}
							index={index}
							totalScreens={screens.length}
							appColor={flow.appColor}
							appName={flow.app}
							onScreenClick={() => {}}
						/>
					) : (
						<Empty>
							<EmptyHeader>
								<EmptyTitle>
									{version ? "Opening snapshot…" : "No screens yet"}
								</EmptyTitle>
								<EmptyDescription>
									Add a screen to review this version.
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					)}
				</div>
			)}
			<footer className="flex shrink-0 items-center justify-center gap-3 border-t p-3">
				<Button
					variant="outline"
					size="icon-sm"
					aria-label="Previous snapshot screen"
					disabled={index === 0}
					onClick={() => setStep(index - 1)}
				>
					<ChevronLeft />
				</Button>
				<span className="text-muted-foreground text-xs">
					{screens.length ? index + 1 : 0} / {screens.length}
				</span>
				<Button
					variant="outline"
					size="icon-sm"
					aria-label="Next snapshot screen"
					disabled={index >= screens.length - 1}
					onClick={() => setStep(index + 1)}
				>
					<ChevronRight />
				</Button>
			</footer>
		</section>
	);
}
