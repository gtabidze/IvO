import { getStroke } from "perfect-freehand";
import {
	type PointerEvent as ReactPointerEvent,
	useCallback,
	useEffect,
	useState,
} from "react";
import { toast } from "sonner";

export type AuditTool = "select" | "pen" | "highlighter" | "eraser";

export interface StrokePoint {
	x: number;
	y: number;
	pressure?: number;
}

export interface AuditStroke {
	id: string;
	tool: "pen" | "highlighter";
	color: string;
	size: number;
	opacity: number;
	points: [number, number, number][]; // [x, y, pressure]
	createdAt: number;
}

interface AuditCanvasOverlayProps {
	flowId: string;
	activeTool: AuditTool;
	scrollContainerRef: React.RefObject<HTMLDivElement | null>;
	onUndoAvailableChange?: (canUndo: boolean) => void;
	onRedoAvailableChange?: (canRedo: boolean) => void;
	undoTrigger?: number;
	redoTrigger?: number;
	resetTrigger?: number;
}

/**
 * Converts stroke polygon points from `perfect-freehand` into an SVG path string.
 */
function getSvgPathFromStroke(stroke: number[][]): string {
	if (!stroke.length) return "";

	const d = stroke.reduce(
		(acc, [x, y], i, arr) => {
			const [x2, y2] = arr[(i + 1) % arr.length];
			acc.push(x, y, (x + x2) / 2, (y + y2) / 2);
			return acc;
		},
		["M", ...stroke[0], "Q"],
	);

	d.push("Z");
	return d.join(" ");
}

const STORAGE_PREFIX = "ivo_audit_strokes_";

export function AuditCanvasOverlay({
	flowId,
	activeTool,
	scrollContainerRef,
	onUndoAvailableChange,
	onRedoAvailableChange,
	undoTrigger,
	redoTrigger,
	resetTrigger,
}: AuditCanvasOverlayProps) {
	const [strokes, setStrokes] = useState<AuditStroke[]>(() => {
		try {
			const saved = localStorage.getItem(`${STORAGE_PREFIX}${flowId}`);
			return saved ? JSON.parse(saved) : [];
		} catch {
			return [];
		}
	});

	const [redoStack, setRedoStack] = useState<AuditStroke[]>([]);
	const [currentPoints, setCurrentPoints] = useState<
		[number, number, number][] | null
	>(null);
	const [isDrawing, setIsDrawing] = useState(false);

	// Custom cursor tracking state (canvas-relative coordinates)
	const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(
		null,
	);
	const [isCursorInside, setIsCursorInside] = useState(false);

	// Canvas dimensions matching scrollContainer content
	const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

	// Sync undo/redo availability to parent
	useEffect(() => {
		onUndoAvailableChange?.(strokes.length > 0);
	}, [strokes, onUndoAvailableChange]);

	useEffect(() => {
		onRedoAvailableChange?.(redoStack.length > 0);
	}, [redoStack, onRedoAvailableChange]);

	// Save to localStorage whenever strokes change
	useEffect(() => {
		try {
			localStorage.setItem(
				`${STORAGE_PREFIX}${flowId}`,
				JSON.stringify(strokes),
			);
		} catch {
			// Ignore quota exceeded errors
		}
	}, [strokes, flowId]);

	// Update overlay size to match scrollable canvas dimensions
	useEffect(() => {
		const updateDimensions = () => {
			const el = scrollContainerRef.current;
			if (!el) return;
			setDimensions({
				width: Math.max(el.scrollWidth, el.clientWidth),
				height: Math.max(el.scrollHeight, el.clientHeight),
			});
		};

		updateDimensions();
		const el = scrollContainerRef.current;
		if (!el) return;

		const observer = new ResizeObserver(updateDimensions);
		observer.observe(el);

		window.addEventListener("resize", updateDimensions);
		return () => {
			observer.disconnect();
			window.removeEventListener("resize", updateDimensions);
		};
	}, [scrollContainerRef]);

	// Undo action
	const handleUndo = useCallback(() => {
		setStrokes((prev) => {
			if (prev.length === 0) return prev;
			const last = prev[prev.length - 1];
			setRedoStack((r) => [...r, last]);
			return prev.slice(0, -1);
		});
	}, []);

	// Redo action
	const handleRedo = useCallback(() => {
		setRedoStack((prev) => {
			if (prev.length === 0) return prev;
			const next = prev[prev.length - 1];
			setStrokes((s) => [...s, next]);
			return prev.slice(0, -1);
		});
	}, []);

	// Reset / Clear action
	const handleReset = useCallback(() => {
		if (strokes.length === 0) return;
		const previous = [...strokes];
		setStrokes([]);
		setRedoStack([]);
		try {
			localStorage.removeItem(`${STORAGE_PREFIX}${flowId}`);
		} catch {
			// Ignore
		}
		toast("Canvas audit markings cleared", {
			action: {
				label: "Undo",
				onClick: () => setStrokes(previous),
			},
		});
	}, [strokes, flowId]);

	// Watch triggers from toolbar
	useEffect(() => {
		if (undoTrigger && undoTrigger > 0) handleUndo();
	}, [undoTrigger, handleUndo]);

	useEffect(() => {
		if (redoTrigger && redoTrigger > 0) handleRedo();
	}, [redoTrigger, handleRedo]);

	useEffect(() => {
		if (resetTrigger && resetTrigger > 0) handleReset();
	}, [resetTrigger, handleReset]);

	// Keyboard shortcuts for Undo (Cmd+Z) / Redo (Cmd+Shift+Z, Cmd+Y)
	useEffect(() => {
		const onKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
			const isModifier = isMac ? e.metaKey : e.ctrlKey;

			if (isModifier && e.key.toLowerCase() === "z") {
				e.preventDefault();
				if (e.shiftKey) {
					handleRedo();
				} else {
					handleUndo();
				}
			} else if (isModifier && e.key.toLowerCase() === "y") {
				e.preventDefault();
				handleRedo();
			}
		};

		window.addEventListener("keydown", onKeyDown);
		return () => window.removeEventListener("keydown", onKeyDown);
	}, [handleUndo, handleRedo]);

	const getRelativePoint = (
		e: ReactPointerEvent<SVGSVGElement>,
	): [number, number, number] => {
		const svgRect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - svgRect.left;
		const y = e.clientY - svgRect.top;
		const pressure = e.pressure && e.pressure > 0 ? e.pressure : 0.5;
		return [x, y, pressure];
	};

	const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
		if (activeTool === "select") return;

		e.currentTarget.setPointerCapture(e.pointerId);
		const pt = getRelativePoint(e);

		if (activeTool === "eraser") {
			eraseAtPoint(pt[0], pt[1]);
			setIsDrawing(true);
			return;
		}

		setIsDrawing(true);
		setCurrentPoints([pt]);
		setRedoStack([]); // New action invalidates redo history
	};

	const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
		const svgRect = e.currentTarget.getBoundingClientRect();
		const x = e.clientX - svgRect.left;
		const y = e.clientY - svgRect.top;
		setCursorPos({ x, y });

		if (!isDrawing) return;

		const pt = getRelativePoint(e);

		if (activeTool === "eraser") {
			eraseAtPoint(pt[0], pt[1]);
			return;
		}

		if (currentPoints) {
			setCurrentPoints((prev) => (prev ? [...prev, pt] : [pt]));
		}
	};

	const eraseAtPoint = (x: number, y: number) => {
		const ERASE_RADIUS = 24;
		setStrokes((prev) =>
			prev.filter((stroke) => {
				// Check if any point in stroke is within radius
				return !stroke.points.some(([px, py]) => {
					const dx = px - x;
					const dy = py - y;
					return dx * dx + dy * dy <= ERASE_RADIUS * ERASE_RADIUS;
				});
			}),
		);
	};

	const handlePointerUp = () => {
		if (!isDrawing) return;
		setIsDrawing(false);

		if (currentPoints && currentPoints.length > 0 && activeTool !== "eraser") {
			const isHighlighter = activeTool === "highlighter";
			const newStroke: AuditStroke = {
				id: `stroke_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
				tool: isHighlighter ? "highlighter" : "pen",
				color: isHighlighter ? "#facc15" : "#ef4444",
				size: isHighlighter ? 24 : 3.5,
				opacity: isHighlighter ? 0.45 : 0.95,
				points: currentPoints,
				createdAt: Date.now(),
			};
			setStrokes((prev) => [...prev, newStroke]);
		}
		setCurrentPoints(null);
	};

	const isDrawingTool = activeTool === "pen" || activeTool === "highlighter";

	return (
		<div
			className={`pointer-events-none absolute inset-0 z-20 ${
				isDrawingTool ? "cursor-none" : ""
			}`}
			style={{
				width: dimensions.width > 0 ? dimensions.width : "100%",
				height: dimensions.height > 0 ? dimensions.height : "100%",
			}}
		>
			<svg
				className={`h-full w-full ${
					activeTool !== "select"
						? "pointer-events-auto touch-none"
						: "pointer-events-none"
				}`}
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerEnter={() => setIsCursorInside(true)}
				onPointerLeave={() => {
					setIsCursorInside(false);
					if (isDrawing) handlePointerUp();
				}}
			>
				{/* Existing strokes */}
				{strokes.map((stroke) => {
					const strokeOptions =
						stroke.tool === "highlighter"
							? {
									size: stroke.size,
									thinning: 0,
									smoothing: 0.85,
									streamline: 0.6,
									start: { cap: true, taper: 0 },
									end: { cap: true, taper: 0 },
								}
							: {
									size: stroke.size,
									thinning: 0.55,
									smoothing: 0.5,
									streamline: 0.45,
								};

					const pathData = getSvgPathFromStroke(
						getStroke(stroke.points, strokeOptions),
					);

					return (
						<path
							key={stroke.id}
							d={pathData}
							fill={stroke.color}
							fillOpacity={stroke.opacity}
							style={
								stroke.tool === "highlighter"
									? { mixBlendMode: "multiply" }
									: undefined
							}
						/>
					);
				})}

				{/* Active stroke currently being drawn */}
				{currentPoints && currentPoints.length > 0 && (
					<path
						d={getSvgPathFromStroke(
							getStroke(
								currentPoints,
								activeTool === "highlighter"
									? {
											size: 24,
											thinning: 0,
											smoothing: 0.85,
											streamline: 0.6,
											start: { cap: true, taper: 0 },
											end: { cap: true, taper: 0 },
										}
									: {
											size: 3.5,
											thinning: 0.55,
											smoothing: 0.5,
											streamline: 0.45,
										},
							),
						)}
						fill={activeTool === "highlighter" ? "#facc15" : "#ef4444"}
						fillOpacity={activeTool === "highlighter" ? 0.45 : 0.95}
						style={
							activeTool === "highlighter"
								? { mixBlendMode: "multiply" }
								: undefined
						}
					/>
				)}
			</svg>

			{/* Custom Auditor Cursor with Pencil Icon & "Gua Tabidze" Badge */}
			{isCursorInside && isDrawingTool && cursorPos && (
				<div
					className="pointer-events-none absolute select-none transition-transform duration-75 ease-out"
					style={{
						left: cursorPos.x,
						top: cursorPos.y,
						transform: "translate(-2px, -2px)",
					}}
				>
					{/* Pencil Tip / Icon */}
					<div className="relative flex items-center">
						<svg
							className="h-6 w-6 -rotate-45 drop-shadow-md"
							viewBox="0 0 24 24"
							fill="none"
							stroke={activeTool === "pen" ? "#ef4444" : "#eab308"}
							strokeWidth="2.4"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
							<path d="m15 5 4 4" />
						</svg>
					</div>

					{/* Auditor Name Badge directly below pencil */}
					<div className="-mt-1 ml-5 inline-flex items-center gap-1.5 rounded-full border border-neutral-700/60 bg-neutral-900/95 px-2.5 py-0.5 font-semibold text-[11px] text-white shadow-xl backdrop-blur-md dark:border-neutral-300/40 dark:bg-white/95 dark:text-neutral-900">
						<span
							className={`h-2 w-2 rounded-full ${
								activeTool === "pen"
									? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
									: "bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.8)]"
							}`}
						/>
						<span className="whitespace-nowrap tracking-tight">
							Gua Tabidze
						</span>
						<span className="font-normal text-[9px] uppercase opacity-60">
							{activeTool === "pen" ? "Pen" : "Highlight"}
						</span>
					</div>
				</div>
			)}
		</div>
	);
}
