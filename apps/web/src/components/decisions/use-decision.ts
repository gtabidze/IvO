import { useCallback, useEffect, useState } from "react";
import type { DashboardFlow } from "@/data/dashboard-flows";
import type { Decision, Version } from "./model";
import {
	DECISION_EVENT,
	loadDecision,
	loadOverride,
	resolveVersion,
	saveDecision,
	withSnapshot,
} from "./storage";

export function useDecision(flowId: string) {
	const [decision, setDecision] = useState<Decision | null>(null);
	const [error, setError] = useState("");
	const [ready, setReady] = useState(false);
	useEffect(() => {
		try {
			setDecision(loadDecision(flowId));
			setError("");
		} catch (e) {
			setError(
				e instanceof Error ? e.message : "Unable to load this decision.",
			);
		}
		setReady(true);
	}, [flowId]);
	const commit = useCallback((next: Decision) => {
		saveDecision(next);
		setDecision(next);
		setError("");
	}, []);
	return {
		decision,
		commit,
		error,
		setError,
		ready,
		clear: () => {
			setDecision(null);
			setError("");
		},
	};
}
export function useResolvedVersion(version: Version | null) {
	const [resolved, setResolved] = useState<Version | null>(null);
	const [error, setError] = useState("");
	const serialized = version ? JSON.stringify(version) : null;
	useEffect(() => {
		let cancelled = false;
		let release: (() => void) | undefined;
		setResolved(null);
		setError("");
		if (serialized)
			resolveVersion(JSON.parse(serialized) as Version)
				.then((result) => {
					if (cancelled) result.release();
					else {
						release = result.release;
						setResolved(result.version);
					}
				})
				.catch((e) => {
					if (!cancelled)
						setError(
							e instanceof Error ? e.message : "Unable to open snapshot.",
						);
				});
		return () => {
			cancelled = true;
			release?.();
		};
	}, [serialized]);
	return { resolved, error };
}
export function useCurrentFlow(original: DashboardFlow | null) {
	const [version, setVersion] = useState<Version | null>(null);
	const [error, setError] = useState("");
	useEffect(() => {
		const load = () => {
			try {
				setVersion(
					original ? loadOverride(original.id)?.snapshot || null : null,
				);
				setError("");
			} catch (e) {
				setVersion(null);
				setError(
					e instanceof Error ? e.message : "Unable to read current version.",
				);
			}
		};
		load();
		window.addEventListener(DECISION_EVENT, load);
		window.addEventListener("storage", load);
		return () => {
			window.removeEventListener(DECISION_EVENT, load);
			window.removeEventListener("storage", load);
		};
	}, [original?.id, original]);
	const { resolved, error: assetError } = useResolvedVersion(version);
	return {
		flow: original && resolved ? withSnapshot(original, resolved) : original,
		revisionId: resolved ? `${resolved.id}:${resolved.frozenAt}` : undefined,
		error: error || assetError,
	};
}

/** Resolve local overrides once for dashboard cards and single-screen feeds. */
export function useCurrentFlows(flows: DashboardFlow[]) {
	const [resolved, setResolved] = useState<DashboardFlow[]>(flows);
	const [error, setError] = useState("");
	const [revision, setRevision] = useState(0);
	useEffect(() => {
		const update = () => setRevision((value) => value + 1);
		window.addEventListener(DECISION_EVENT, update);
		window.addEventListener("storage", update);
		return () => {
			window.removeEventListener(DECISION_EVENT, update);
			window.removeEventListener("storage", update);
		};
	}, []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: override events require fresh image URLs even when the source flows are unchanged.
	useEffect(() => {
		let cancelled = false;
		const releases: (() => void)[] = [];
		const load = async () => {
			try {
				const result = await Promise.all(
					flows.map(async (flow) => {
						const current = loadOverride(flow.id);
						if (!current) return flow;
						const asset = await resolveVersion(current.snapshot);
						if (cancelled) {
							asset.release();
							return flow;
						}
						releases.push(asset.release);
						return withSnapshot(flow, asset.version);
					}),
				);
				if (!cancelled) {
					setResolved(result);
					setError("");
				}
			} catch (e) {
				if (!cancelled)
					setError(
						e instanceof Error ? e.message : "Unable to load local versions.",
					);
			}
		};
		// A local override revision also requires resolving fresh object URLs.
		void load();
		return () => {
			cancelled = true;
			for (const release of releases) release();
		};
	}, [flows, revision]);
	return { flows: resolved, error };
}
