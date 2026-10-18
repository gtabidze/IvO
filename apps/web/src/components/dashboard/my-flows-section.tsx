import { Link } from "@tanstack/react-router";
import { Layers, Plus } from "lucide-react";
import { toDashboardFlow } from "@/lib/flow-adapter";
import type { UserCustomFlow, UserProduct } from "@/lib/flow-store";
import { ScreenThumb } from "./screen-thumb";

interface Props {
	flows: UserCustomFlow[];
	products: UserProduct[];
	onCreate: () => void;
	onCreateProduct: () => void;
}

export function MyFlowsSection({
	flows,
	products,
	onCreate,
	onCreateProduct,
}: Props) {
	return (
		<section className="mx-auto w-full max-w-7xl px-4 pt-10 pb-4 sm:px-6 lg:px-8">
			<div className="flex items-center justify-between gap-4">
				<div>
					<h2 className="font-extrabold text-3xl text-neutral-950 tracking-tight dark:text-white">
						My Flows
					</h2>
					<p className="mt-1 text-neutral-500 text-xs">
						Organized into product collections.
					</p>
				</div>
				<div className="flex items-center gap-2.5">
					<button
						type="button"
						onClick={onCreateProduct}
						className="cursor-pointer rounded-full border border-neutral-200/90 bg-white px-4 py-2 font-semibold text-neutral-800 text-xs shadow-2xs transition-all hover:bg-neutral-50 active:scale-[0.96] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
					>
						New product
					</button>
					<button
						type="button"
						onClick={onCreate}
						className="flex cursor-pointer items-center gap-1.5 rounded-full bg-neutral-950 px-5 py-2 font-semibold text-white text-xs shadow-xs transition-all hover:bg-neutral-800 active:scale-[0.96] dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
					>
						<Plus className="h-3.5 w-3.5" /> Create
					</button>
				</div>
			</div>

			{/* Products (grouping) */}
			<div className="scrollbar-none mt-6 flex gap-5 overflow-x-auto pt-1 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{products.map((p) => {
					const pf = flows.filter(
						(f) =>
							f.productId === p.id ||
							(!f.productId &&
								f.appName?.toLowerCase() === p.name.toLowerCase()),
					);
					const screens = pf.reduce((n, f) => n + f.screens.length, 0);
					return (
						<ProductTile
							key={p.id}
							productId={p.id}
							title={p.name}
							subtitle={`${pf.length} ${pf.length === 1 ? "flow" : "flows"} · ${screens} screens`}
							color={p.color}
							preview={pf[0]}
						/>
					);
				})}
			</div>
		</section>
	);
}

function ProductTile({
	productId,
	title,
	subtitle,
	color,
	preview,
}: {
	productId: string;
	title: string;
	subtitle: string;
	color?: string;
	preview?: UserCustomFlow;
}) {
	const flow = preview ? toDashboardFlow(preview) : null;
	const screen = flow?.screens[0];

	return (
		<Link
			to="/products/$productId"
			params={{ productId }}
			className="group w-[216px] shrink-0 cursor-pointer text-left"
		>
			<div className="relative flex h-[270px] items-start justify-center overflow-hidden rounded-[2rem] border border-neutral-200/80 bg-[#f4f4f6] pt-4 shadow-2xs transition-all duration-300 group-hover:-translate-y-1.5 group-hover:border-neutral-300 group-hover:shadow-[0_12px_28px_rgba(0,0,0,0.07)] dark:border-neutral-800 dark:bg-neutral-900/90 dark:group-hover:border-neutral-700">
				{/* Top-left product accent pip */}
				<div className="absolute top-3.5 left-3.5 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-white/60 bg-white/85 shadow-xs backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/85">
					<span
						className="h-2.5 w-2.5 rounded-full shadow-2xs"
						style={{ backgroundColor: color || "#0075eb" }}
					/>
				</div>

				{flow && screen ? (
					<div className="transition-transform duration-300 group-hover:scale-[1.03]">
						<ScreenThumb flow={flow} screen={screen} index={0} scale={0.68} />
					</div>
				) : (
					<div className="mt-16 flex flex-col items-center gap-2 text-neutral-400">
						<Layers className="h-8 w-8 text-neutral-300 dark:text-neutral-700" />
						<span className="font-medium text-[11px]">Empty flow</span>
					</div>
				)}
			</div>

			<div className="mt-3.5 truncate font-bold text-neutral-950 text-sm tracking-tight transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
				{title}
			</div>
			<div className="mt-0.5 truncate font-medium text-[11px] text-neutral-500">
				{subtitle}
			</div>
		</Link>
	);
}
