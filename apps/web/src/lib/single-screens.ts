import type { SingleScreenItem } from "@/components/feed/single-screen-card";
import type { DashboardFlow } from "@/data/dashboard-flows";
import type { FeedCreator } from "./feed";
import { getFlowChannel } from "./feed";

const SCREEN_INSIGHTS: Record<string, string> = {
	splash:
		"High-contrast brand iconography with immediate zero-latency action button boosts initial activation.",
	welcome:
		"Clear upfront value proposition with OAuth options reduces bounce rate by 31%.",
	"phone-input":
		"Auto-formatting country prefix with localized SMS provider reduces carrier bounce to <0.5%.",
	otp: "Automatic clipboard code detection and 6-digit split input accelerates verification by 2.8x.",
	"kyc-scan":
		"Real-time edge detection and anti-glare guidance prevents camera retry frustration.",
	pin: "Randomized keypad option provides biometric-level security against shoulder-surfing attacks.",
	"account-ready":
		"Celebratory micro-interaction with instant next-step CTA converts first deposit at 88%.",
	"transfer-amount":
		"Dynamic FX conversion and transparent fee breakdown eliminates checkout price hesitation.",
	"recipient-select":
		"Frequent recipient avatars with recent transfer chips eliminate 80% of typing effort.",
	confirmation:
		"Biometric slide-to-confirm pattern drastically cuts accidental duplicate transactions.",
	"switch-profile":
		"Clear organizational badges prevent cross-entity data contamination.",
	"workspace-picker":
		"Quick multi-org switcher with team permissions overview.",
	"generic-wireframe":
		"Structured component layout aligned with Nielsen Norman heuristic guidelines.",
};

const TEAM_CREATORS: FeedCreator[] = [
	{ name: "Sara Kim", initial: "S", color: "#7c3aed" },
	{ name: "Marcus Lee", initial: "M", color: "#0ea5e9" },
	{ name: "Nina Patel", initial: "N", color: "#f97316" },
	{ name: "Tom Becker", initial: "T", color: "#10b981" },
	{ name: "Ana Costa", initial: "A", color: "#ec4899" },
];

export function buildSingleScreens(
	flows: DashboardFlow[],
	me: { name: string },
	now = Date.now(),
): SingleScreenItem[] {
	const items: SingleScreenItem[] = [];
	const myCreator: FeedCreator = {
		name: me.name,
		initial: me.name.charAt(0).toUpperCase() || "U",
		color: "#171717",
	};

	if (flows.length === 0) return items;

	const maxScreens = Math.max(...flows.map((f) => f.screens.length));

	for (let step = 0; step < maxScreens; step++) {
		flows.forEach((flow, flowIdx) => {
			const screen = flow.screens[step];
			if (!screen) return;

			const isMine =
				flow.id.startsWith("user-") || flow.id.startsWith("custom-");
			const creator = isMine
				? myCreator
				: (TEAM_CREATORS[
						(flowIdx + step) % TEAM_CREATORS.length
					] as FeedCreator);

			const insight =
				SCREEN_INSIGHTS[screen.screenType] ??
				`Optimized ${screen.title} flow screen verified against mobile usability standards.`;

			const rank = step * flows.length + flowIdx;
			const timeOffsetHours = rank * 1.6 + 0.4;

			items.push({
				id: `single-${flow.id}-${screen.id}-${step}`,
				flow,
				screen,
				screenIndex: step,
				creator,
				project: flow.app,
				channel: getFlowChannel(flow),
				createdAt: new Date(now - timeOffsetHours * 3600_000),
				insight,
				isMine,
			});
		});
	}

	// Return chronological order
	return items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
