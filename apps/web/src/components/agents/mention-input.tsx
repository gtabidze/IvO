import { Send } from "lucide-react";
import { useRef, useState } from "react";
import { AgentAvatar } from "./agent-avatar";

interface MentionAgent {
	id: string;
	slug: string;
	name: string;
	emoji: string;
	competence: string;
}

export function MentionInput({
	agents,
	disabled,
	onSend,
	onPickAgent,
	placeholder,
	value: controlledValue,
	onChange: onControlledChange,
}: {
	agents: MentionAgent[];
	disabled?: boolean;
	onSend: (text: string) => void;
	onPickAgent?: (
		agent: MentionAgent,
		defaultNextValue: string,
	) => string | undefined;
	placeholder?: string;
	value?: string;
	onChange?: (value: string) => void;
}) {
	const [internalValue, setInternalValue] = useState("");
	const isControlled = controlledValue !== undefined;
	const value = isControlled ? controlledValue : internalValue;
	const setValue = (val: string) => {
		if (isControlled) {
			onControlledChange?.(val);
		} else {
			setInternalValue(val);
		}
	};
	const [cursor, setCursor] = useState(0);
	const [active, setActive] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	const match = value.slice(0, cursor).match(/(?:^|\s)@([a-z0-9_-]*)$/i);
	const query = match?.[1]?.toLowerCase();
	const options =
		query === undefined
			? []
			: agents.filter(
					(a) =>
						a.slug.startsWith(query) || a.name.toLowerCase().startsWith(query),
				);
	const open = options.length > 0;

	const pick = (agent: MentionAgent) => {
		if (query === undefined) return;
		const start = cursor - query.length - 1;
		const defaultNext = `${value.slice(0, start)}@${agent.slug} ${value.slice(cursor)}`;
		const customNext = onPickAgent?.(agent, defaultNext);
		const next = customNext ?? defaultNext;
		const pos = customNext ? next.length : start + agent.slug.length + 2;
		setValue(next);
		setCursor(pos);
		setActive(0);
		requestAnimationFrame(() => {
			inputRef.current?.focus();
			inputRef.current?.setSelectionRange(pos, pos);
		});
	};

	const submit = () => {
		const text = value.trim();
		if (!text || disabled) return;
		onSend(text);
		setValue("");
		setCursor(0);
	};

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submit();
			}}
			className="relative"
		>
			{open && (
				<div
					role="listbox"
					className="absolute right-0 bottom-12 left-0 z-10 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
				>
					{options.map((a, i) => (
						<button
							key={a.id}
							type="button"
							role="option"
							aria-selected={i === active}
							onMouseDown={(e) => {
								e.preventDefault();
								pick(a);
							}}
							className={`flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-xs ${
								i === active ? "bg-blue-50 dark:bg-blue-950/40" : ""
							}`}
						>
							<AgentAvatar emoji={a.emoji} name={a.name} size="sm" />
							<span className="font-semibold">@{a.slug}</span>
							<span className="truncate text-neutral-500">{a.competence}</span>
						</button>
					))}
				</div>
			)}
			<input
				ref={inputRef}
				type="text"
				value={value}
				disabled={disabled}
				onChange={(e) => {
					setValue(e.target.value);
					setCursor(e.target.selectionStart ?? e.target.value.length);
					setActive(0);
				}}
				onSelect={(e) => setCursor(e.currentTarget.selectionStart ?? 0)}
				onKeyDown={(e) => {
					if (!open) return;
					if (e.key === "ArrowDown") {
						e.preventDefault();
						setActive((i) => (i + 1) % options.length);
					} else if (e.key === "ArrowUp") {
						e.preventDefault();
						setActive((i) => (i - 1 + options.length) % options.length);
					} else if (e.key === "Enter" || e.key === "Tab") {
						e.preventDefault();
						const a = options[active];
						if (a) pick(a);
					} else if (e.key === "Escape") {
						setCursor(0);
					}
				}}
				placeholder={placeholder ?? "Message all agents, or @mention one…"}
				className="h-10 w-full rounded-xl border border-neutral-300 bg-white px-3.5 pr-10 text-neutral-900 text-xs placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
			/>
			<button
				type="submit"
				disabled={!value.trim() || disabled}
				className="absolute top-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-950 text-white transition-opacity disabled:opacity-30 dark:bg-white dark:text-neutral-950"
				aria-label="Send message"
			>
				<Send className="h-3.5 w-3.5" />
			</button>
		</form>
	);
}
