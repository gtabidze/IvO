import { Alert, AlertDescription, AlertTitle } from "@IvO/ui/components/alert";
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
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@IvO/ui/components/collapsible";
import {
	BarChart3,
	ChevronDown,
	Database,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import type { Decision, Evidence } from "./model";

export function EvidenceReport({ item }: { item: Evidence }) {
	return (
		<Card id={`evidence-${item.id}`}>
			<CardHeader>
				<div className="flex items-center justify-between gap-2">
					<Badge variant="outline">{item.source}</Badge>
					<Badge variant="secondary">Demo</Badge>
				</div>
				<CardTitle>{item.title}</CardTitle>
				<CardDescription>
					{item.period} · {item.sample}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex flex-col gap-3">
				<div>
					<p className="font-medium text-xs">Observation</p>
					<p className="text-muted-foreground text-sm">{item.observation}</p>
				</div>
				<div>
					<p className="font-medium text-xs">Interpretation</p>
					<p className="text-muted-foreground text-sm">{item.interpretation}</p>
				</div>
				<div>
					<p className="font-medium text-xs">Recommendation</p>
					<p className="text-muted-foreground text-sm">{item.recommendation}</p>
				</div>
			</CardContent>
			<CardFooter>
				<Collapsible className="w-full">
					<CollapsibleTrigger
						render={
							<Button
								variant="ghost"
								size="sm"
								className="w-full justify-between"
							/>
						}
					>
						Open local source report <ChevronDown data-icon="inline-end" />
					</CollapsibleTrigger>
					<CollapsibleContent>
						<pre className="mt-3 whitespace-pre-wrap text-muted-foreground text-xs leading-relaxed">
							{item.details}
						</pre>
					</CollapsibleContent>
				</Collapsible>
			</CardFooter>
		</Card>
	);
}
export function EvidencePanel({
	decision,
	onRefresh,
	onFinding,
	onIncorporate,
	canManage,
	busy,
}: {
	decision: Decision;
	onRefresh: () => void;
	onFinding: () => void;
	onIncorporate: () => void;
	canManage: boolean;
	busy: boolean;
}) {
	const brief = decision.attempt.brief;
	return (
		<div className="flex flex-col gap-5">
			<div className="flex items-start gap-3">
				<Database className="mt-1 size-5 shrink-0" />
				<div>
					<h3 className="font-semibold">Product Data agent</h3>
					<p className="text-muted-foreground text-xs">
						Automatically published · Brief {brief.revision} ·{" "}
						{new Date(brief.publishedAt).toLocaleDateString()}
					</p>
				</div>
			</div>
			<Alert>
				<Sparkles />
				<AlertTitle>
					{brief.frozenAt
						? "Evidence frozen for this attempt"
						: "Shared evidence brief"}
				</AlertTitle>
				<AlertDescription>
					<p>{brief.summary}</p>
					<div
						role="group"
						className="flex flex-wrap gap-1"
						aria-label="Summary sources"
					>
						{brief.summaryEvidenceIds.map((id) => (
							<Button
								key={id}
								variant="link"
								size="sm"
								onClick={() =>
									document
										.getElementById(`evidence-${id}`)
										?.scrollIntoView({ block: "start", behavior: "smooth" })
								}
							>
								{brief.items.find((item) => item.id === id)?.source || id}
							</Button>
						))}
					</div>
				</AlertDescription>
			</Alert>
			<div className="flex flex-wrap gap-2">
				{!brief.frozenAt ? (
					<Button
						variant="outline"
						size="sm"
						disabled={!canManage || busy}
						onClick={onRefresh}
					>
						<RefreshCw data-icon="inline-start" />
						Refresh demo evidence
					</Button>
				) : (
					<Button
						variant="outline"
						size="sm"
						disabled={busy || decision.attempt.phase === "decided"}
						onClick={onFinding}
					>
						<BarChart3 data-icon="inline-start" />
						Simulate new finding
					</Button>
				)}
				<Badge variant="secondary">No live connectors</Badge>
			</div>
			{decision.incoming.length > 0 && (
				<Alert>
					<AlertTitle>
						{decision.incoming.length} new finding outside the frozen brief
					</AlertTitle>
					<AlertDescription>
						<p>
							New evidence does not change the brief participants are voting
							against.
						</p>
						<Button
							variant="outline"
							size="sm"
							disabled={!canManage || busy}
							onClick={onIncorporate}
						>
							{brief.frozenAt
								? "Incorporate and restart voting"
								: "Incorporate in brief"}
						</Button>
					</AlertDescription>
				</Alert>
			)}
			{decision.incoming.length > 0 && (
				<div className="flex flex-col gap-3">
					<h4 className="font-medium text-sm">
						Incoming findings · not in the frozen brief
					</h4>
					{decision.incoming.map((item) => (
						<EvidenceReport key={item.id} item={item} />
					))}
				</div>
			)}
			{brief.items.map((item) => (
				<EvidenceReport key={item.id} item={item} />
			))}
			<Card>
				<CardHeader>
					<CardTitle>Gaps and conflicting signals</CardTitle>
					<CardDescription>What this brief cannot establish</CardDescription>
				</CardHeader>
				<CardContent>
					<ul className="flex list-disc flex-col gap-2 pl-4 text-muted-foreground text-sm">
						{brief.gaps.map((gap) => (
							<li key={gap}>{gap}</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	);
}
