import type { DashboardFlow } from "@/data/dashboard-flows";
import {
	copy,
	type Decision,
	isDecider,
	snapshotFlow,
	type Version,
} from "./model";
import { decisionSchema, versionSchema } from "./schema";

const PREFIX = "alignment-decision-v1:";
export const DECISION_EVENT = "alignment-decision-updated";
const overrideKey = (id: string) => `alignment-current-version-v1:${id}`;
export interface Override {
	snapshot: Version;
	appliedAt: string;
}
export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}
function storage(): StorageLike {
	if (typeof window === "undefined")
		throw new Error("Browser storage is unavailable.");
	return window.localStorage;
}
// A malformed or incompatible record is recoverable through the explicit reset action.
export function validateStored(value: unknown, flowId: string): Decision {
	const result = decisionSchema.safeParse(value);
	if (!result.success || result.data.flowId !== flowId)
		throw new Error(
			"This local decision could not be read. Reset it to start again.",
		);
	return result.data;
}
export function loadDecision(
	id: string,
	target?: StorageLike,
): Decision | null {
	if (!target && typeof window === "undefined") return null;
	const raw = (target || storage()).getItem(PREFIX + id);
	if (!raw) return null;
	try {
		return validateStored(JSON.parse(raw), id);
	} catch {
		throw new Error(
			"This local decision could not be read. Reset it to start again.",
		);
	}
}
export function saveDecision(d: Decision, target?: StorageLike) {
	validateStored(d, d.flowId);
	(target || storage()).setItem(PREFIX + d.flowId, JSON.stringify(d));
}
export function resetDecision(id: string) {
	storage().removeItem(PREFIX + id);
}
function database(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open("alignment-decision-assets", 1);
		request.onupgradeneeded = () => request.result.createObjectStore("assets");
		request.onsuccess = () => resolve(request.result);
		request.onerror = () =>
			reject(new Error("Unable to open local image storage."));
	});
}
export async function putAsset(blob: Blob): Promise<string> {
	const db = await database();
	const id = crypto.randomUUID();
	await new Promise<void>((resolve, reject) => {
		const tx = db.transaction("assets", "readwrite");
		tx.objectStore("assets").put(blob, id);
		tx.oncomplete = () => resolve();
		tx.onerror = () =>
			reject(
				new Error("Unable to save this image. Local storage may be full."),
			);
		tx.onabort = () => reject(new Error("Image save was cancelled."));
	});
	db.close();
	return id;
}
export async function getAsset(id: string): Promise<Blob> {
	const db = await database();
	try {
		return await new Promise<Blob>((resolve, reject) => {
			const request = db.transaction("assets").objectStore("assets").get(id);
			request.onsuccess = () =>
				request.result instanceof Blob
					? resolve(request.result)
					: reject(
							new Error(
								"A saved snapshot image is missing. Replace the image before voting.",
							),
						);
			request.onerror = () =>
				reject(new Error("Unable to read a saved image."));
		});
	} finally {
		db.close();
	}
}
export async function freezeAssets(d: Decision): Promise<Decision> {
	const next = copy(d);
	const cache = new Map<string, string>();
	for (const version of [...next.attempt.versions, next.attempt.context])
		for (const screen of version.screens) {
			if (screen.assetId) {
				await getAsset(screen.assetId);
				continue;
			}
			if (!screen.imageUrl) continue;
			let id = cache.get(screen.imageUrl);
			if (!id) {
				const response = await fetch(screen.imageUrl);
				if (!response.ok)
					throw new Error(`Could not freeze image for “${screen.title}”.`);
				const blob = await response.blob();
				if (!blob.type.startsWith("image/"))
					throw new Error("Snapshot asset is not an image.");
				id = await putAsset(blob);
				cache.set(screen.imageUrl, id);
			}
			screen.assetId = id;
			delete screen.imageUrl;
		}
	return next;
}
export async function resolveVersion(
	version: Version,
): Promise<{ version: Version; release: () => void }> {
	const next = copy(version);
	const urls: string[] = [];
	try {
		for (const screen of next.screens)
			if (screen.assetId) {
				screen.imageUrl = URL.createObjectURL(await getAsset(screen.assetId));
				urls.push(screen.imageUrl);
			}
		return {
			version: next,
			release: () => {
				for (const url of urls) URL.revokeObjectURL(url);
			},
		};
	} catch (error) {
		for (const url of urls) URL.revokeObjectURL(url);
		throw error;
	}
}
export function loadOverride(id: string): Override | null {
	if (typeof window === "undefined") return null;
	const raw = storage().getItem(overrideKey(id));
	if (!raw) return null;
	const v = JSON.parse(raw) as Override;
	if (!versionSchema.safeParse(v.snapshot).success)
		throw new Error("The local current version is invalid.");
	return v;
}
export function applyOverride(d: Decision, actor: string): Override {
	if (!isDecider(d, actor))
		throw new Error("Only a decision maker can apply a version.");
	if (
		d.type !== "choice" ||
		d.attempt.phase !== "decided" ||
		!d.attempt.outcome?.selectedId
	)
		throw new Error("Finalize a Choice decision first.");
	const snapshot = d.attempt.versions.find(
		(v) => v.id === d.attempt.outcome?.selectedId,
	);
	if (!snapshot?.frozenAt) throw new Error("Choose a frozen version.");
	const result = {
		snapshot: copy(snapshot),
		appliedAt: new Date().toISOString(),
	};
	storage().setItem(overrideKey(d.flowId), JSON.stringify(result));
	window.dispatchEvent(new Event(DECISION_EVENT));
	return result;
}
export function restoreOverride(id: string) {
	storage().removeItem(overrideKey(id));
	window.dispatchEvent(new Event(DECISION_EVENT));
}
export function withSnapshot(
	flow: DashboardFlow,
	version: Version,
): DashboardFlow {
	return { ...snapshotFlow(flow, version), id: flow.id };
}
