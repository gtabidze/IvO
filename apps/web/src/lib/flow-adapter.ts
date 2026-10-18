import type { DashboardFlow, FlowScreen } from "@/data/dashboard-flows";
import type { UserCustomFlow } from "@/lib/flow-store";

/** Adapts a user-created flow into the shape the dashboard UI renders. */
export function toDashboardFlow(cf: UserCustomFlow): DashboardFlow {
	return {
		id: cf.id,
		flowType: "onboarding",
		flowLabel: cf.name,
		flowName: `${cf.name} in ${cf.appName}`,
		app: cf.appName,
		appCategory: (cf.appCategory as DashboardFlow["appCategory"]) || "Banking",
		screensCount: cf.screens.length,
		platform: cf.platform,
		appColor: cf.appColor,
		appLogoText: cf.appName.charAt(0).toUpperCase(),
		isLocked: false,
		timeOnTask: "1m 30s",
		taskSuccessRate: "98.5%",
		seqScore: "6.7 / 7",
		seqRating: "Community Flow (Published)",
		usabilityIssues: [],
		initialComments: [],
		screens: cf.screens.map((s, idx) => ({
			id: s.id,
			title: s.title,
			subtitle: s.subtitle,
			screenType:
				(s.screenType as FlowScreen["screenType"]) || "generic-wireframe",
			wireframeDetails: {
				headlineText: s.title,
				subText: s.subtitle || `${cf.appName} Screen ${idx + 1}`,
				buttonText: "Continue",
			},
		})),
	};
}
