const SIZES = {
	sm: "h-6 w-6 text-sm",
	md: "h-8 w-8 text-base",
	lg: "h-14 w-14 text-3xl",
} as const;

export function HexAgentGlyph({
	className = "h-4 w-4",
}: {
	className?: string;
}) {
	return (
		<svg
			viewBox="0 0 36 36"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
			aria-hidden="true"
		>
			{/* Left half of hexagon */}
			<path
				d="M15.5 7.5L7.5 18L15.5 28.5"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Right half of hexagon */}
			<path
				d="M20.5 7.5L28.5 18L20.5 28.5"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			{/* Center diagonal slash */}
			<path
				d="M20.5 7.5L15.5 28.5"
				stroke="white"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function AgentAvatar({
	emoji,
	name,
	size = "md",
	onClick,
	dimmed,
}: {
	emoji: string;
	name: string;
	size?: keyof typeof SIZES;
	onClick?: () => void;
	dimmed?: boolean;
}) {
	const isHex = emoji === "</>" || emoji === "hex";
	const cls = `flex shrink-0 items-center justify-center ${
		isHex
			? "rounded-xl bg-gradient-to-br from-[#4f9cf9] via-[#6366f1] to-[#7c3aed] text-white shadow-2xs"
			: "rounded-full bg-neutral-100 dark:bg-neutral-800"
	} leading-none transition-transform ${SIZES[size]} ${
		dimmed ? "opacity-40 grayscale" : ""
	} ${onClick ? "cursor-pointer hover:scale-110" : ""}`;

	const glyphSize =
		size === "lg" ? "h-8 w-8" : size === "md" ? "h-5 w-5" : "h-3.5 w-3.5";

	const content = isHex ? <HexAgentGlyph className={glyphSize} /> : emoji;

	if (!onClick) {
		return (
			<span className={cls} role="img" aria-label={name}>
				{content}
			</span>
		);
	}
	return (
		<button
			type="button"
			onClick={onClick}
			className={cls}
			title={`${name} – view profile`}
			aria-label={`${name} profile`}
		>
			{content}
		</button>
	);
}
