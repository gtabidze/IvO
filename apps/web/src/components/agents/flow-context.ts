import type { DashboardFlow } from "@/data/dashboard-flows";
import { ENV } from "@/env";

export function buildFlowContext(flow: DashboardFlow) {
	return [
		`Flow: ${flow.flowName} (${flow.app}, ${flow.appCategory}, ${flow.platform})`,
		`Screens: ${flow.screens.map((s, i) => `${i + 1}. ${s.title}`).join("; ")}`,
		`Time on task: ${flow.timeOnTask}; success rate: ${flow.taskSuccessRate}; SEQ: ${flow.seqScore}`,
		`Usability issues: ${
			flow.usabilityIssues.length
				? flow.usabilityIssues
						.map((i) => `[${i.severity}] ${i.title} - ${i.description}`)
						.join(" | ")
				: "none"
		}`,
	].join("\n");
}

export function serverUrl(path: string) {
	const base = (ENV.VITE_SERVER_URL || "").replace(/\/$/, "");
	return `${base}${path}`;
}
