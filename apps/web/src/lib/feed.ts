import { useCallback, useEffect, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import type { UserCustomFlow } from "@/lib/flow-store";
import { toDashboardFlow } from "./flow-adapter";

export interface FeedCreator {
	name: string;
	initial: string;
	color: string;
}

export interface FeedItem {
	flow: DashboardFlow;
	creator: FeedCreator;
	project: string;
	channel: { id: string; label: string };
	createdAt: Date;
	isMine: boolean;
}

export function getFlowChannel(flow: DashboardFlow): {
	id: string;
	label: string;
} {
	const tags = flow.tags ?? [];
	for (const tag of tags) {
		const clean = tag.toLowerCase().replace(/^#/, "");
		if (clean === "ordercard" || clean.includes("card")) {
			return { id: "ordercard", label: "#ordercard" };
		}
		if (
			clean === "fclloan" ||
			clean.includes("loan") ||
			clean.includes("credit")
		) {
			return { id: "fclloan", label: "#fclloan" };
		}
		if (
			clean === "transfermoney_p2p" ||
			clean.includes("transfer") ||
			clean.includes("p2p")
		) {
			return { id: "transfermoney_p2p", label: "#transfermoney_p2p" };
		}
		if (clean === "onboarding" || clean.includes("account")) {
			return { id: "onboarding", label: "#onboarding" };
		}
		if (clean) {
			return { id: clean, label: `#${clean}` };
		}
	}
	const flowType = (flow.flowType || "").toLowerCase();
	const flowId = (flow.id || "").toLowerCase();
	if (flowType.includes("card") || flowId.includes("card")) {
		return { id: "ordercard", label: "#ordercard" };
	}
	if (
		flowType.includes("loan") ||
		flowType.includes("credit") ||
		flowId.includes("loan")
	) {
		return { id: "fclloan", label: "#fclloan" };
	}
	if (flowType.includes("transfer") || flowId.includes("transfer")) {
		return { id: "transfermoney_p2p", label: "#transfermoney_p2p" };
	}
	return { id: "onboarding", label: "#onboarding" };
}

const TEAM: FeedCreator[] = [
	{ name: "Sara Kim", initial: "S", color: "#7c3aed" },
	{ name: "Marcus Lee", initial: "M", color: "#0ea5e9" },
	{ name: "Nina Patel", initial: "N", color: "#f97316" },
	{ name: "Tom Becker", initial: "T", color: "#10b981" },
	{ name: "Ana Costa", initial: "A", color: "#ec4899" },
];

export function hashString(s: string) {
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	return h;
}

/** Builds the feed: my published flows plus demo flows from the team. */
export function buildFeed(
	demoFlows: DashboardFlow[],
	myFlows: UserCustomFlow[],
	me: { name: string },
	now = Date.now(),
): FeedItem[] {
	const meCreator: FeedCreator = {
		name: me.name,
		initial: me.name.charAt(0).toUpperCase() || "U",
		color: "#171717",
	};
	const mine: FeedItem[] = myFlows
		.filter((f) => f.status === "published")
		.map((f) => {
			const df = toDashboardFlow(f);
			return {
				flow: df,
				creator: meCreator,
				project: f.productName || f.appName,
				channel: getFlowChannel(df),
				createdAt: new Date(f.createdAt),
				isMine: true,
			};
		});
	const team: FeedItem[] = demoFlows.map((flow, i) => ({
		flow: { ...flow, isLocked: false },
		creator: TEAM[i % TEAM.length] as FeedCreator,
		project: flow.app,
		channel: getFlowChannel(flow),
		createdAt: new Date(now - (i * 3.4 + 1.1) * 3600_000),
		isMine: false,
	}));
	return [...mine, ...team].sort(
		(a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
	);
}

// ---- Reactions ----------------------------------------------------------

export const REACTION_EMOJIS = ["👍", "❤️", "🔥", "👏", "🤔", "😮"] as const;

const KEY = "alignment_feed_reactions";
const EVENT = "alignment_feed_updated";
type Mine = Record<string, string[]>;

function readMine(): Mine {
	if (typeof window === "undefined") return {};
	try {
		return JSON.parse(localStorage.getItem(KEY) || "{}") as Mine;
	} catch {
		return {};
	}
}

/** Deterministic demo counts so teammates' flows look alive. */
export function baseReactionCounts(item: FeedItem): Record<string, number> {
	if (item.isMine) return {};
	const h = hashString(item.flow.id);
	const out: Record<string, number> = {};
	REACTION_EMOJIS.forEach((e, i) => {
		const n = (h >> (i * 4)) % 6;
		if (n > 1 && i < 4) out[e] = n;
	});
	return out;
}

export function useReactions() {
	const [mine, setMine] = useState<Mine>({});
	useEffect(() => {
		setMine(readMine());
		const on = () => setMine(readMine());
		window.addEventListener(EVENT, on);
		return () => window.removeEventListener(EVENT, on);
	}, []);

	const toggle = useCallback((flowId: string, emoji: string) => {
		const cur = readMine();
		const set = new Set(cur[flowId] ?? []);
		if (set.has(emoji)) set.delete(emoji);
		else set.add(emoji);
		cur[flowId] = [...set];
		localStorage.setItem(KEY, JSON.stringify(cur));
		window.dispatchEvent(new Event(EVENT));
	}, []);

	return { mine, toggle };
}
