export default function LogoTicker() {
	const clients = [
		{ name: "REVOLUT", category: "Global Neobank" },
		{ name: "MONZO", category: "Digital Banking" },
		{ name: "RAMP", category: "Spend Management" },
		{ name: "MERCURY", category: "Startup Banking" },
		{ name: "POLYMARKET", category: "Prediction Rails" },
		{ name: "STRIPE", category: "Payments Infrastructure" },
		{ name: "ROBINHOOD", category: "Retail Investing" },
		{ name: "BREX", category: "Corporate Cards" },
		{ name: "WISE", category: "FX Routing" },
		{ name: "COINBASE", category: "Digital Assets" },
	];

	return (
		<div className="w-full border-neutral-100/80 border-b pt-8 pb-14">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<p className="mb-8 text-center font-mono font-semibold text-[11px] text-neutral-700 uppercase tracking-[0.2em] sm:text-left">
					TRUSTED BY THE BEST PRODUCT &amp; DESIGN TEAMS
				</p>

				{/* Grid of Minimalist Client Marks */}
				<div className="grid grid-cols-2 items-center gap-6 sm:grid-cols-3 sm:gap-8 md:grid-cols-5">
					{clients.map((client) => (
						<div
							key={client.name}
							className="group flex cursor-default flex-col items-center justify-center rounded-lg border border-transparent p-3 transition-all duration-200 hover:border-neutral-200/60 hover:bg-neutral-50/50 sm:items-start"
						>
							<span className="font-bold font-mono text-neutral-700 text-sm tracking-wider transition-colors group-hover:text-neutral-950">
								{client.name}
							</span>
							<span className="mt-0.5 font-mono text-[10px] text-neutral-600 tracking-tight">
								{client.category}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
