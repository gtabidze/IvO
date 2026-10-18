import type { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";
import { ScreenMockup } from "./screen-mockup";

const W = 230;
const H = 480;

/** Scaled-down phone screen preview built on the full-size mockup. */
export function ScreenThumb({
	flow,
	screen,
	index,
	scale = 0.72,
	className = "",
	onClick,
}: {
	flow: DashboardFlow;
	screen: FlowScreen;
	index: number;
	scale?: number;
	className?: string;
	onClick?: (index: number) => void;
}) {
	const outerRadius = Math.round(36 * scale);

	return (
		<div
			className={`relative shrink-0 overflow-hidden shadow-xs transition-all duration-300 hover:shadow-xl ${className}`}
			style={{
				width: Math.round(W * scale),
				height: Math.round(H * scale),
				borderRadius: `${outerRadius}px`,
			}}
		>
			<div
				style={{
					width: W,
					height: H,
					transform: `scale(${scale})`,
					transformOrigin: "top left",
				}}
			>
				<ScreenMockup
					screen={screen}
					index={index}
					appColor={flow.appColor}
					appName={flow.app}
					onScreenClick={onClick}
				/>
			</div>
		</div>
	);
}
