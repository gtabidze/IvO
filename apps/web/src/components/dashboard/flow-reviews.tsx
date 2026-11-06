import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@IvO/ui/components/empty";
import {
	MessageSquare,
	PenLine,
	Search,
	Sparkles,
	UserRound,
} from "lucide-react";
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import {
	ResearchExhibits,
	specialistExamples,
	WriterExhibit,
} from "./review-exhibits";

type Observation = {
	id: string;
	screen: number;
	x?: number;
	y?: number;
	text: string;
	replies: string[];
};
type Review = {
	id: string;
	name: string;
	agent: boolean;
	overall: string;
	observations: Observation[];
};
type Draft = { screen: number; x: number; y: number };
type State = {
	flows: DashboardFlow[];
	byFlow: Record<string, Review[]>;
	updateFlow: (id: string, action: React.SetStateAction<Review[]>) => void;
	activate: (id: string) => void;
	visible: boolean;
	reviews: Review[];
	setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
	reviewer: string;
	setReviewer: (id: string) => void;
	selected: string | null;
	mode: boolean;
	setMode: (v: boolean) => void;
	draft: Draft | null;
	setDraft: (d: Draft | null) => void;
	select: (r: Review, o: Observation, flowId?: string) => void;
	place: (d: Draft, flowId?: string) => void;
	flow: DashboardFlow;
};
const Context = createContext<State | null>(null);
function loadReviews(flow: DashboardFlow): Review[] {
	try {
		const current = localStorage.getItem(`alignment-reviews-v2:${flow.id}`);
		const raw = current || localStorage.getItem(`alignment-reviews:${flow.id}`);
		if (raw) {
			const saved: Review[] = JSON.parse(raw);
			if (!current) {
				const own = saved.find((r) => r.id === "you");
				if (own) {
					own.observations = [];
					own.overall = "";
				}
			}
			return [
				...saved.map((r) => {
					const fresh = specialistExamples(flow).find((e) => e.id === r.id);
					return fresh
						? {
								...fresh,
								observations: fresh.observations.map((o) => ({
									...o,
									replies:
										r.observations.find((old) => old.id === o.id)?.replies ||
										[],
								})),
							}
						: r;
				}),
				...specialistExamples(flow).filter(
					(example) => !saved.some((r) => r.id === example.id),
				),
			];
		}
	} catch {}
	const names = [...new Set(flow.initialComments.map((c) => c.authorName))];
	return [
		{ id: "you", name: "You", agent: false, overall: "", observations: [] },
		...names.map((name) => ({
			id: name,
			name,
			agent: false,
			overall: "",
			observations: flow.initialComments
				.filter((c) => c.authorName === name)
				.map((c) => ({
					id: c.id,
					screen: Math.max(0, (c.screenStep || 1) - 1),
					text: c.content,
					replies: [],
				})),
		})),
		...specialistExamples(flow),
	];
}

export function FlowReviewsProvider({
	visible,
	comparedFlows = [],
	flow,
	enabled,
	onOpen,
	onScreen,
	children,
}: {
	flow: DashboardFlow;
	comparedFlows?: DashboardFlow[];
	visible: boolean;
	enabled: boolean;
	onOpen: () => void;
	onScreen: (flowId: string, screen: number) => void;
	children: React.ReactNode;
}) {
	const flows = useMemo(() => [flow, ...comparedFlows], [flow, comparedFlows]);
	const [byFlow, setByFlow] = useState<Record<string, Review[]>>(() =>
		Object.fromEntries(flows.map((f) => [f.id, loadReviews(f)])),
	);
	const [activeId, setActiveId] = useState(flow.id);
	const activeFlow = flows.find((f) => f.id === activeId) || flow;
	const reviews = byFlow[activeFlow.id] || [];
	const updateFlow = (id: string, action: React.SetStateAction<Review[]>) =>
		setByFlow((prev) => ({
			...prev,
			[id]: typeof action === "function" ? action(prev[id] || []) : action,
		}));
	const setReviews: React.Dispatch<React.SetStateAction<Review[]>> = (action) =>
		updateFlow(activeFlow.id, action);
	// Load newly compared flows without discarding reviews when rows are removed.
	useEffect(() => {
		setByFlow((prev) => {
			const next = { ...prev };
			for (const f of flows) if (!next[f.id]) next[f.id] = loadReviews(f);
			return next;
		});
	}, [flows]);

	const [reviewer, setReviewer] = useState("you");
	const [selected, setSelected] = useState<string | null>(null);
	const [mode, setMode] = useState(false);
	const [draft, setDraft] = useState<Draft | null>(null);
	const openRef = useRef(onOpen);
	openRef.current = onOpen;
	useEffect(() => {
		try {
			for (const [id, items] of Object.entries(byFlow))
				localStorage.setItem(
					`alignment-reviews-v2:${id}`,
					JSON.stringify(items),
				);
		} catch {}
	}, [byFlow]);
	useEffect(() => {
		if (!enabled) {
			setMode(false);
			setDraft(null);
			return;
		}
		const key = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setMode(false);
				setDraft(null);
				return;
			}
			if (
				e.metaKey ||
				e.ctrlKey ||
				e.altKey ||
				(e.target as HTMLElement).closest(
					"input,textarea,select,[contenteditable=true]",
				)
			)
				return;
			if (e.key.toLowerCase() === "c") {
				e.preventDefault();
				setMode(true);
				openRef.current();
			}
		};
		window.addEventListener("keydown", key);
		return () => window.removeEventListener("keydown", key);
	}, [enabled]);
	const select = (r: Review, o: Observation, flowId = activeFlow.id) => {
		setActiveId(flowId);
		setDraft(null);
		setReviewer(r.id);
		setSelected(o.id);
		onOpen();
		onScreen(flowId, o.screen);
		requestAnimationFrame(() =>
			document
				.getElementById(`review-${o.id}`)
				?.scrollIntoView({ block: "nearest" }),
		);
	};
	return (
		<Context.Provider
			value={{
				flows,
				byFlow,
				updateFlow,
				activate: setActiveId,
				visible,
				reviews,
				setReviews,
				reviewer,
				setReviewer,
				selected,
				mode,
				setMode,
				draft,
				setDraft,
				select,
				flow: activeFlow,
				place: (d, flowId = activeFlow.id) => {
					setActiveId(flowId);
					setReviewer("you");
					setDraft(d);
					onOpen();
				},
			}}
		>
			{children}
		</Context.Provider>
	);
}
function MovableReviewPin({
	review,
	observation: o,
}: {
	review: Review;
	observation: Observation;
}) {
	const ctx = useContext(Context);
	const [preview, setPreview] = useState<{ x: number; y: number } | null>(null);
	const drag = useRef<{
		pointer: number;
		startX: number;
		startY: number;
		left: number;
		top: number;
		width: number;
		height: number;
		x: number;
		y: number;
		moved: boolean;
	} | null>(null);
	const suppressClick = useRef(false);
	if (!ctx) return null;
	const movable = review.id === "you";
	const save = (x: number, y: number) =>
		ctx.setReviews((prev) =>
			prev.map((r) =>
				r.id === review.id
					? {
							...r,
							observations: r.observations.map((item) =>
								item.id === o.id ? { ...item, x, y } : item,
							),
						}
					: r,
			),
		);
	return (
		<button
			type="button"
			aria-label={`${review.name}: ${o.text}`}
			aria-pressed={ctx.selected === o.id}
			title={
				movable ? "Drag to reposition · Arrow keys to move" : "View observation"
			}
			className={`absolute z-30 flex h-7 w-7 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full rounded-bl-sm border-2 border-white text-xs shadow-md ${movable ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-pointer"} ${ctx.selected === o.id ? "bg-blue-600 text-white ring-4 ring-blue-300/50" : "bg-neutral-900 text-white"}`}
			style={{ left: `${preview?.x ?? o.x}%`, top: `${preview?.y ?? o.y}%` }}
			onDoubleClick={(e) => e.stopPropagation()}
			onPointerDown={(e) => {
				e.stopPropagation();
				if (!movable || e.button !== 0) return;
				const rect = e.currentTarget.parentElement?.getBoundingClientRect();
				if (!rect) return;
				suppressClick.current = false;
				drag.current = {
					pointer: e.pointerId,
					startX: e.clientX,
					startY: e.clientY,
					left: rect.left,
					top: rect.top,
					width: rect.width,
					height: rect.height,
					x: o.x ?? 0,
					y: o.y ?? 0,
					moved: false,
				};
				e.currentTarget.setPointerCapture(e.pointerId);
			}}
			onPointerMove={(e) => {
				const d = drag.current;
				if (!d || d.pointer !== e.pointerId) return;
				e.stopPropagation();
				const dx = e.clientX - d.startX;
				const dy = e.clientY - d.startY;
				if (!d.moved && Math.hypot(dx, dy) < 4) return;
				d.moved = true;
				setPreview({
					x: Math.max(0, Math.min(100, d.x + (dx / d.width) * 100)),
					y: Math.max(0, Math.min(100, d.y + (dy / d.height) * 100)),
				});
			}}
			onPointerUp={(e) => {
				const d = drag.current;
				if (!d || d.pointer !== e.pointerId) return;
				e.stopPropagation();
				if (d.moved) {
					const x = Math.max(
						0,
						Math.min(100, d.x + ((e.clientX - d.startX) / d.width) * 100),
					);
					const y = Math.max(
						0,
						Math.min(100, d.y + ((e.clientY - d.startY) / d.height) * 100),
					);
					save(x, y);
					suppressClick.current = true;
				}
				drag.current = null;
				setPreview(null);
				if (e.currentTarget.hasPointerCapture(e.pointerId))
					e.currentTarget.releasePointerCapture(e.pointerId);
			}}
			onPointerCancel={() => {
				drag.current = null;
				setPreview(null);
				suppressClick.current = true;
			}}
			onLostPointerCapture={() => {
				drag.current = null;
				setPreview(null);
			}}
			onClick={(e) => {
				e.stopPropagation();
				if (suppressClick.current) {
					suppressClick.current = false;
					return;
				}
				ctx.select(review, o);
			}}
			onKeyDown={(e) => {
				if (
					!movable ||
					!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
				)
					return;
				e.preventDefault();
				e.stopPropagation();
				const step = e.shiftKey ? 5 : 1;
				save(
					Math.max(
						0,
						Math.min(
							100,
							(o.x ?? 0) +
								(e.key === "ArrowLeft"
									? -step
									: e.key === "ArrowRight"
										? step
										: 0),
						),
					),
					Math.max(
						0,
						Math.min(
							100,
							(o.y ?? 0) +
								(e.key === "ArrowUp"
									? -step
									: e.key === "ArrowDown"
										? step
										: 0),
						),
					),
				);
			}}
		>
			{review.observations.findIndex((item) => item.id === o.id) + 1}
		</button>
	);
}
export function ReviewPins({
	screenId,
	flowId,
}: {
	screenId: string;
	flowId?: string;
}) {
	const root = useContext(Context);
	if (!root?.visible) return null;
	const owner = root.flows.find((f) =>
		flowId ? f.id === flowId : f.screens.some((s) => s.id === screenId),
	);
	if (!owner) return null;
	const ctx: State = {
		...root,
		flow: owner,
		reviews: root.byFlow[owner.id] || [],
		setReviews: (action) => root.updateFlow(owner.id, action),
		select: (r, o) => root.select(r, o, owner.id),
		place: (d) => root.place(d, owner.id),
	};
	const screen = ctx.flow.screens.findIndex((s) => s.id === screenId);
	if (screen < 0) return null;
	return (
		<Context.Provider value={ctx}>
			{ctx.mode && (
				<button
					type="button"
					aria-label={`Place comment on ${ctx.flow.screens[screen].title}`}
					style={{
						cursor: `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M5 4h21v18H13l-8 6V4Z" fill="white" stroke="#171717" stroke-width="2" stroke-linejoin="round"/><path d="M11 10h9M11 15h6" stroke="#171717" stroke-width="1.5" stroke-linecap="round"/></svg>')}") 5 27, auto`,
					}}
					className="absolute inset-0 z-20 rounded-[inherit]"
					onClick={(e) => {
						e.stopPropagation();
						const r = e.currentTarget.getBoundingClientRect();
						ctx.place({
							screen,
							x: ((e.clientX - r.left) / r.width) * 100,
							y: ((e.clientY - r.top) / r.height) * 100,
						});
					}}
				/>
			)}
			{ctx.reviews.flatMap((r) =>
				r.observations
					.filter(
						(o) =>
							o.screen === screen && o.x !== undefined && o.y !== undefined,
					)
					.map((o) => (
						<MovableReviewPin key={o.id} review={r} observation={o} />
					)),
			)}
			{ctx.draft?.screen === screen && (
				<span
					className="pointer-events-none absolute z-30 -translate-x-1/2 -translate-y-full rounded-full border-2 border-blue-600 border-dashed bg-white p-1 text-blue-600"
					style={{ left: `${ctx.draft.x}%`, top: `${ctx.draft.y}%` }}
				>
					＋
				</span>
			)}
		</Context.Provider>
	);
}
export function FlowReviewsPanel({ onClose }: { onClose: () => void }) {
	const ctx = useContext(Context);
	const [text, setText] = useState("");
	const [reply, setReply] = useState<string | null>(null);
	const [overall, setOverall] = useState(false);
	const input = useRef<HTMLTextAreaElement>(null);
	useEffect(() => {
		setText("");
		setReply(null);
		setOverall(false);
		if (ctx?.draft) requestAnimationFrame(() => input.current?.focus());
	}, [ctx?.draft]);
	useEffect(() => {
		if (
			ctx?.reviewer === "you" &&
			!ctx.reviews.find((r) => r.id === "you")?.observations.length
		)
			ctx.setMode(true);
	}, [ctx?.reviewer, ctx?.reviews, ctx?.setMode]);
	if (!ctx) return null;
	const r = ctx.reviews.find((r) => r.id === ctx.reviewer) || ctx.reviews[0];
	const submit = () => {
		if (!text.trim()) return;
		const content = text.trim();
		ctx.setReviews((prev) =>
			prev.map((item) => {
				if (reply)
					return {
						...item,
						observations: item.observations.map((o) =>
							o.id === reply ? { ...o, replies: [...o.replies, content] } : o,
						),
					};
				if (item.id !== "you") return item;
				if (overall) return { ...item, overall: content };
				if (ctx.draft)
					return {
						...item,
						observations: [
							...item.observations,
							{
								...ctx.draft,
								id: crypto.randomUUID(),
								text: content,
								replies: [],
							},
						],
					};
				return item;
			}),
		);
		ctx.setDraft(null);
		setText("");
		setReply(null);
		setOverall(false);
	};

	return (
		<aside className="flex h-full w-[min(380px,100vw-32px)] flex-col border-neutral-200 border-l bg-white text-neutral-900 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white">
			<header className="flex items-center justify-between border-neutral-200 border-b p-4">
				<strong>Reviews</strong>
				<button type="button" onClick={onClose} aria-label="Close Reviews">
					✕
				</button>
			</header>
			{ctx.flows.length > 1 && (
				<div className="border-neutral-200 border-b px-4 py-2">
					<select
						aria-label="Review flow"
						className="w-full bg-transparent text-xs"
						value={ctx.flow.id}
						onChange={(e) => {
							ctx.activate(e.target.value);
							ctx.setDraft(null);
							setReply(null);
							setText("");
						}}
					>
						{ctx.flows.map((f) => (
							<option key={f.id} value={f.id}>
								{f.app} · {f.flowLabel}
							</option>
						))}
					</select>
				</div>
			)}
			<div className="flex shrink-0 gap-2 overflow-x-auto border-neutral-200 border-b p-3">
				{ctx.reviews.map((person) => (
					<button
						type="button"
						key={person.id}
						aria-pressed={r.id === person.id}
						aria-label={
							person.agent
								? `${person.id.includes("research") ? "Research" : "Writing"} (AI)`
								: person.name
						}
						className={`flex min-w-0 flex-1 flex-col items-center gap-2 rounded-xl px-1 py-2 text-xs ${r.id === person.id ? "bg-blue-50 text-blue-700" : "bg-neutral-50 text-neutral-600"}`}
						onClick={() => {
							ctx.setReviewer(person.id);
							ctx.setDraft(null);
							setReply(null);
							setOverall(false);
							setText("");
						}}
					>
						<span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-600 ring-1 ring-neutral-200 dark:bg-neutral-800 dark:text-neutral-200">
							{person.agent ? (
								person.id.includes("research") ? (
									<Search className="h-4 w-4" />
								) : (
									<PenLine className="h-4 w-4" />
								)
							) : person.id === "you" ? (
								<UserRound className="h-4 w-4" />
							) : (
								<span className="font-semibold text-[11px]">
									{person.name
										.split(" ")
										.map((n) => n[0])
										.slice(0, 2)
										.join("")}
								</span>
							)}
							{person.agent && (
								<span
									className="absolute -right-1 -bottom-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-white ring-2 ring-white"
									title="AI review"
								>
									<Sparkles aria-hidden="true" className="h-2.5 w-2.5" />
								</span>
							)}
						</span>
						<span className="max-w-full truncate font-medium text-[11px]">
							{person.agent
								? person.id.includes("research")
									? "Research"
									: "Writing"
								: person.id === "you"
									? "You"
									: person.name.split(" ")[0]}
						</span>
					</button>
				))}
			</div>
			<div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
				<div>
					<h3 className="font-semibold">
						{r.id === "you"
							? "Your review"
							: r.agent
								? `${r.id.includes("research") ? "Research" : "Writing"} review`
								: `${r.name}'s review`}
					</h3>
				</div>
				{r.agent && (
					<p className="rounded-lg bg-amber-50 p-2 text-amber-900 text-xs">
						Prepared example from demo flow data · not a completed live AI run.
					</p>
				)}
				{r.id === "reference-researcher" && (
					<ResearchExhibits flow={ctx.flow} />
				)}
				{r.observations.map((o, i) => (
					<div
						id={`review-${o.id}`}
						key={o.id}
						className={`rounded-xl border p-3 ${ctx.selected === o.id ? "border-blue-400 bg-blue-50/50" : "border-neutral-200"}`}
					>
						<button
							type="button"
							className="w-full text-left"
							onClick={() => ctx.select(r, o)}
						>
							<span className="text-blue-600 text-xs">
								{i + 1} · {ctx.flow.screens[o.screen]?.title || "Flow"}
								{o.x === undefined ? " · Screen note" : ""}
							</span>
							<p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
								{o.text}
							</p>
						</button>
						{r.id === "reference-writer" && (
							<WriterExhibit flow={ctx.flow} screen={o.screen} />
						)}
						{o.replies.map((t, i) => (
							<p
								key={`${o.id}-${i}`}
								className="mt-3 border-blue-200 border-l-2 pl-3 text-xs leading-relaxed"
							>
								<strong>You</strong>
								<br />
								{t}
							</p>
						))}
						<button
							type="button"
							className="mt-3 text-blue-600 text-xs"
							onClick={() => {
								setReply(o.id);
								setOverall(false);
								setText("");
								requestAnimationFrame(() => input.current?.focus());
							}}
						>
							Reply
						</button>
					</div>
				))}
				{!r.observations.length && !r.overall && (
					<Empty className="min-h-72">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<MessageSquare />
							</EmptyMedia>
							<EmptyTitle>Your perspective matters</EmptyTitle>
							<EmptyDescription>
								Give feedback, ask a question, or just leave a note of
								appreciation.
							</EmptyDescription>
							<EmptyDescription>
								Click anywhere in the flow to leave a comment.
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				)}
				{r.overall && (
					<section className="border-neutral-200 border-t pt-4">
						<h4 className="font-semibold text-xs">Overall feedback</h4>
						<p className="mt-2 whitespace-pre-wrap text-neutral-500 text-sm leading-relaxed">
							{r.overall}
						</p>
					</section>
				)}
			</div>
			{(ctx.draft || reply || overall) && (
				<div className="shrink-0 border-neutral-200 border-t p-3">
					<p className="mb-2 text-neutral-500 text-xs">
						{ctx.draft
							? `New observation · ${ctx.flow.screens[ctx.draft.screen]?.title}`
							: overall
								? "Overall feedback"
								: "Reply"}
					</p>
					<textarea
						ref={input}
						aria-label="Add comment"
						placeholder="Add comment"
						value={text}
						onChange={(e) => setText(e.target.value)}
						className="min-h-20 w-full rounded-lg border border-neutral-200 p-3 text-sm"
					/>
					<div className="mt-2 flex justify-end gap-2">
						<button
							type="button"
							className="px-3 py-2 text-xs"
							onClick={() => {
								ctx.setDraft(null);
								setReply(null);
								setOverall(false);
								setText("");
							}}
						>
							Cancel
						</button>
						<button
							type="button"
							className="rounded-lg bg-neutral-900 px-3 py-2 text-white text-xs disabled:opacity-40"
							disabled={!text.trim()}
							onClick={submit}
						>
							Save
						</button>
					</div>
				</div>
			)}
		</aside>
	);
}
