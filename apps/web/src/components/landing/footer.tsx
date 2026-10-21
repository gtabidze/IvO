import { useState } from "react";

// Exact tick positions analyzed from reference design
const UPPER_TICKS: [number, number][] = [
	[12, 1],
	[27, 1],
	[42, 1],
	[57, 1],
	[72, 1],
	[117, 1],
	[132, 1],
	[147, 1],
	[222, 1],
	[237, 2],
	[252, 1],
	[267, 2],
	[282, 2],
	[312, 2],
	[372, 2],
	[388, 1],
	[433, 1],
	[478, 1],
	[508, 1],
	[523, 1],
	[538, 1],
	[553, 1],
	[583, 1],
	[598, 2],
	[643, 1],
	[658, 2],
	[688, 2],
	[733, 2],
	[763, 2],
	[779, 1],
	[793, 2],
	[824, 1],
	[884, 1],
	[914, 1],
	[959, 1],
	[974, 1],
	[1004, 1],
	[1019, 1],
];

const LOWER_TICKS: [number, number][] = [
	[0, 2],
	[16, 1],
	[30, 2],
	[46, 1],
	[60, 2],
	[76, 1],
	[90, 2],
	[106, 1],
	[121, 1],
	[136, 1],
	[151, 1],
	[166, 1],
	[181, 1],
	[196, 1],
	[211, 1],
	[226, 1],
	[241, 1],
	[256, 1],
	[271, 1],
	[286, 1],
	[301, 1],
	[316, 2],
	[331, 1],
	[346, 2],
	[361, 1],
	[376, 2],
	[391, 1],
	[406, 2],
	[421, 1],
	[437, 1],
	[451, 2],
	[467, 1],
	[481, 2],
	[497, 1],
	[511, 2],
	[527, 1],
	[542, 1],
	[557, 1],
	[572, 1],
	[587, 1],
	[602, 1],
	[617, 1],
	[632, 1],
	[647, 1],
	[662, 1],
	[677, 1],
	[692, 1],
	[707, 1],
	[722, 1],
	[737, 1],
	[752, 1],
];

export default function Footer() {
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!email.trim()) return;
		setSubmitted(true);
	};

	return (
		<footer className="w-full bg-white pt-20 sm:pt-28 md:pt-36">
			{/* Content Area */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="max-w-4xl">
					<h2 className="font-medium text-2xl text-neutral-950 tracking-tight sm:text-3xl md:text-4xl lg:text-[42px] lg:leading-[1.18]">
						Your people, your agents, your product decisions — all in one place.
					</h2>

					{/* Email input pill */}
					<form onSubmit={handleSubmit} className="mt-6 sm:mt-7">
						<div className="flex h-9 w-full max-w-[280px] items-center justify-between rounded-[2px] bg-[#f3f4f6] px-3.5 transition-all focus-within:ring-1 focus-within:ring-[#2c20ea]/30">
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								placeholder={
									submitted ? "You're on the list!" : "Enter your email"
								}
								disabled={submitted}
								className="w-full bg-transparent font-normal text-neutral-900 text-xs outline-none placeholder:text-neutral-500"
							/>
							<button
								type="submit"
								disabled={submitted}
								className="ml-2 shrink-0 cursor-pointer border-none bg-transparent p-0 font-medium text-[#2c20ea] text-xs transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-50"
							>
								{submitted ? "Joined" : "Sign up"}
							</button>
						</div>
					</form>
				</div>
			</div>

			{/* Decorative Barcode / Signal Footer Graphic */}
			<div className="relative mt-20 w-full select-none overflow-hidden leading-none sm:mt-28 md:mt-36">
				<svg
					viewBox="0 0 1024 72"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					className="block h-auto max-h-[96px] min-h-[46px] w-full"
					preserveAspectRatio="none"
					role="presentation"
					aria-hidden="true"
				>
					{/* Solid blue base: step up from y=33 (x: 0..756) to y=20 (x: 756..1024) */}
					<path d="M0 33H756V20H1024V72H0Z" fill="#2c20ea" />

					{/* Lower ticks between y=20 and y=33 */}
					<g fill="#2c20ea">
						{LOWER_TICKS.map(([x, w], i) => (
							<rect key={`l-${i}`} x={x} y={20} width={w} height={13} />
						))}
					</g>

					{/* Upper ticks between y=0 and y=12 */}
					<g fill="#2c20ea">
						{UPPER_TICKS.map(([x, w], i) => (
							<rect key={`u-${i}`} x={x} y={0} width={w} height={12} />
						))}
					</g>
				</svg>

				{/* Brand geometric sparkle glyph in raised blue bar */}
				<div
					className="pointer-events-none absolute"
					style={{
						left: "90.43%",
						top: "27.78%",
					}}
				>
					<svg
						width="14"
						height="14"
						viewBox="0 0 14 14"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
						className="block"
						role="presentation"
						aria-hidden="true"
					>
						{/* Four quadrants with concave inner corners meeting in a cross gap */}
						<path d="M0 0H6V1C6 3.76 3.76 6 1 6H0Z" fill="white" />
						<path d="M8 0H14V6H13C10.24 6 8 3.76 8 1Z" fill="white" />
						<path d="M0 8H1C3.76 8 6 10.24 6 13V14H0Z" fill="white" />
						<path d="M13 8H14V14H8V13C8 10.24 10.24 8 13 8Z" fill="white" />
					</svg>
				</div>
			</div>
		</footer>
	);
}
