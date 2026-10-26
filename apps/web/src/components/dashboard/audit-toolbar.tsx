import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@IvO/ui/components/tooltip";
import {
	Eraser,
	Highlighter,
	MousePointer2,
	Pen,
	Redo2,
	RotateCcw,
	Undo2,
	X,
} from "lucide-react";
import { useEffect } from "react";
import type { AuditTool } from "./audit-canvas-overlay";

interface AuditToolbarProps {
	activeTool: AuditTool;
	onToolChange: (tool: AuditTool) => void;
	canUndo: boolean;
	canRedo: boolean;
	onUndo: () => void;
	onRedo: () => void;
	onReset: () => void;
	onClose: () => void;
}

export function AuditToolbar({
	activeTool,
	onToolChange,
	canUndo,
	canRedo,
	onUndo,
	onRedo,
	onReset,
	onClose,
}: AuditToolbarProps) {
	// Keyboard shortcut shortcuts for switching tools (V, P, H, E)
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement | null;
			if (
				target &&
				(target.tagName === "INPUT" ||
					target.tagName === "TEXTAREA" ||
					target.isContentEditable)
			) {
				return;
			}

			// Don't intercept if Cmd/Ctrl is pressed (allow Cmd+Z etc.)
			if (e.metaKey || e.ctrlKey || e.altKey) return;

			const key = e.key.toLowerCase();
			if (key === "v") {
				onToolChange("select");
			} else if (key === "p") {
				onToolChange(activeTool === "pen" ? "select" : "pen");
			} else if (key === "h") {
				onToolChange(activeTool === "highlighter" ? "select" : "highlighter");
			} else if (key === "e") {
				onToolChange(activeTool === "eraser" ? "select" : "eraser");
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [activeTool, onToolChange]);

	return (
		<TooltipProvider delay={150}>
			<aside
				aria-label="Audit Drawing Toolbar"
				className="z-30 flex h-full w-[52px] shrink-0 flex-col items-center justify-between border-neutral-200/80 border-l bg-white/95 py-3 shadow-lg backdrop-blur-md transition-all duration-200 dark:border-neutral-800 dark:bg-neutral-900/95"
			>
				{/* Primary Tools */}
				<div className="flex flex-col items-center gap-1.5">
					{/* Select / Pointer */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={() => onToolChange("select")}
									className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 ${
										activeTool === "select"
											? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
									aria-label="Select / Inspect mode (V)"
								>
									<MousePointer2 className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Select & Navigate <span className="opacity-60">(V)</span>
						</TooltipContent>
					</Tooltip>

					{/* Pen Tool (Red) */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={() =>
										onToolChange(activeTool === "pen" ? "select" : "pen")
									}
									className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 ${
										activeTool === "pen"
											? "bg-red-500/15 text-red-600 shadow-xs ring-1.5 ring-red-500 dark:bg-red-500/20 dark:text-red-400 dark:ring-red-400"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
									aria-label="Pen tool (P)"
								>
									<Pen className="h-4 w-4" />
									<span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-red-500 ring-1 ring-white dark:ring-neutral-900" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Pen <span className="text-red-400">(Red)</span>{" "}
							<span className="opacity-60">(P)</span>
						</TooltipContent>
					</Tooltip>

					{/* Highlighter Tool (Yellow Translucent) */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={() =>
										onToolChange(
											activeTool === "highlighter" ? "select" : "highlighter",
										)
									}
									className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 ${
										activeTool === "highlighter"
											? "bg-amber-400/20 text-amber-600 shadow-xs ring-1.5 ring-amber-400 dark:bg-amber-400/25 dark:text-amber-300 dark:ring-amber-400"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
									aria-label="Highlighter tool (H)"
								>
									<Highlighter className="h-4 w-4" />
									<span className="absolute right-1 bottom-1 h-1.5 w-1.5 rounded-full bg-amber-400 ring-1 ring-white dark:ring-neutral-900" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Highlighter <span className="text-amber-400">(Yellow)</span>{" "}
							<span className="opacity-60">(H)</span>
						</TooltipContent>
					</Tooltip>

					{/* Eraser */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={() =>
										onToolChange(activeTool === "eraser" ? "select" : "eraser")
									}
									className={`relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl transition-all duration-150 ${
										activeTool === "eraser"
											? "bg-neutral-950 text-white shadow-xs dark:bg-white dark:text-neutral-950"
											: "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
									}`}
									aria-label="Eraser tool (E)"
								>
									<Eraser className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Eraser <span className="opacity-60">(E)</span>
						</TooltipContent>
					</Tooltip>

					<div className="my-1 h-px w-6 bg-neutral-200 dark:bg-neutral-800" />

					{/* Undo (Cmd+Z) */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={onUndo}
									disabled={!canUndo}
									className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 ${
										canUndo
											? "cursor-pointer text-neutral-600 hover:bg-neutral-100 active:scale-95 dark:text-neutral-300 dark:hover:bg-neutral-800"
											: "cursor-not-allowed text-neutral-400 opacity-30 dark:text-neutral-600"
									}`}
									aria-label="Undo (⌘Z)"
								>
									<Undo2 className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Undo <span className="opacity-60">(⌘Z)</span>
						</TooltipContent>
					</Tooltip>

					{/* Redo (Cmd+Shift+Z / Cmd+Y) */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={onRedo}
									disabled={!canRedo}
									className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 ${
										canRedo
											? "cursor-pointer text-neutral-600 hover:bg-neutral-100 active:scale-95 dark:text-neutral-300 dark:hover:bg-neutral-800"
											: "cursor-not-allowed text-neutral-400 opacity-30 dark:text-neutral-600"
									}`}
									aria-label="Redo (⌘⇧Z)"
								>
									<Redo2 className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Redo <span className="opacity-60">(⌘⇧Z)</span>
						</TooltipContent>
					</Tooltip>

					{/* Reset / Clear */}
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={onReset}
									className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-neutral-600 transition-all duration-150 hover:bg-red-50 hover:text-red-600 active:scale-95 dark:text-neutral-300 dark:hover:bg-red-950/40 dark:hover:text-red-400"
									aria-label="Reset Canvas (Clear all)"
								>
									<RotateCcw className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Reset / Clear Canvas
						</TooltipContent>
					</Tooltip>
				</div>

				{/* Close Rail Button */}
				<div className="flex flex-col items-center">
					<Tooltip>
						<TooltipTrigger
							render={
								<button
									type="button"
									onClick={onClose}
									className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-neutral-400 transition-all hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-white"
									aria-label="Close Audit Toolbar"
								>
									<X className="h-4 w-4" />
								</button>
							}
						/>
						<TooltipContent
							side="left"
							sideOffset={8}
							className="rounded-lg bg-neutral-900 px-2.5 py-1 text-white text-xs shadow-md dark:bg-white dark:text-neutral-900"
						>
							Close Audit
						</TooltipContent>
					</Tooltip>
				</div>
			</aside>
		</TooltipProvider>
	);
}
