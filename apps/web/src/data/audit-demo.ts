export interface TeardownStep {
	id: number;
	title: string;
	flowStage: string;
	timestamp: string;
	appA: {
		name: string;
		screenImage: string;
		timeOnTask: string;
		frictionPoints: {
			severity: "critical" | "warning" | "positive";
			label: string;
			description: string;
		}[];
		heuristicsRating: number; // out of 10
	};
	appB: {
		name: string;
		screenImage: string;
		timeOnTask: string;
		frictionPoints: {
			severity: "critical" | "warning" | "positive";
			label: string;
			description: string;
		}[];
		heuristicsRating: number;
	};
	studioTakeaway: string;
}

export const AUDIT_CASE_STUDY = {
	title: "Cross-Border FX Transfer & Instant Rail Settlement",
	subtitle:
		"A comparative heuristic teardown of Revolut vs. Monzo across 2,400 recorded user sessions.",
	industry: "Tier-1 Neobanks",
	benchmarkSummary: {
		revolutAvgTime: "41.2s",
		monzoAvgTime: "1m 18s",
		revolutSuccessRate: "97.4%",
		monzoSuccessRate: "89.6%",
		revolutErrorRate: "1.2%",
		monzoErrorRate: "6.8%",
	},
	steps: [
		{
			id: 1,
			title: "Currency Pair & Fee Disclosure",
			flowStage: "Step 1 of 4 • Quote Initialization",
			timestamp: "00:04",
			appA: {
				name: "Revolut",
				screenImage:
					"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "4.2s",
				heuristicsRating: 9.6,
				frictionPoints: [
					{
						severity: "positive",
						label: "Live Interbank Spread Preview",
						description:
							"Real-time tick countdown with guaranteed rate lock for 120 seconds.",
					},
					{
						severity: "positive",
						label: "Zero Hidden Markup Breakdown",
						description:
							"Itemized partner rail fee ($0.45) displayed inline with guaranteed recipient amount.",
					},
				],
			},
			appB: {
				name: "Monzo",
				screenImage:
					"https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "14.8s",
				heuristicsRating: 7.2,
				frictionPoints: [
					{
						severity: "warning",
						label: "Ambiguous Partner Handoff",
						description:
							"Requires navigating to a secondary modal explaining Wise third-party intermediary rails.",
					},
				],
			},
			studioTakeaway:
				"Inverting fee disclosure to upfront inline preview reduced quote abandonments by 31.4% in high-volume FX cohorts.",
		},
		{
			id: 2,
			title: "IBAN Syntax & Real-Time Rail Verification",
			flowStage: "Step 2 of 4 • Recipient Onboarding",
			timestamp: "00:18",
			appA: {
				name: "Revolut",
				screenImage:
					"https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "8.1s",
				heuristicsRating: 9.4,
				frictionPoints: [
					{
						severity: "positive",
						label: "Algorithmic Bank Logo Lookup",
						description:
							"Validates routing & BIC within 120ms, rendering verified destination bank crest.",
					},
				],
			},
			appB: {
				name: "Monzo",
				screenImage:
					"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "26.4s",
				heuristicsRating: 6.8,
				frictionPoints: [
					{
						severity: "critical",
						label: "Silent Formatting Truncation",
						description:
							"Pasting IBAN with white spaces triggers a generic error toast instead of auto-stripping.",
					},
				],
			},
			studioTakeaway:
				"Auto-formatting pasted strings and instant BIC validation eliminates 88% of recipient input errors before submission.",
		},
		{
			id: 3,
			title: "Biometric Approval & Anti-Fraud Friction",
			flowStage: "Step 3 of 4 • Authorization Gate",
			timestamp: "00:32",
			appA: {
				name: "Revolut",
				screenImage:
					"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "6.5s",
				heuristicsRating: 9.1,
				frictionPoints: [
					{
						severity: "positive",
						label: "Frictionless FaceID Handoff",
						description:
							"Single haptic tap initiates system FaceID with clear destination confirmation.",
					},
				],
			},
			appB: {
				name: "Monzo",
				screenImage:
					"https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "18.2s",
				heuristicsRating: 7.0,
				frictionPoints: [
					{
						severity: "warning",
						label: "Redundant SMS 2FA Fallback",
						description:
							"Triggers SMS OTP despite active session biometric credentials, causing delay.",
					},
				],
			},
			studioTakeaway:
				"Risk-based adaptive step-up authentication protects accounts without imposing SMS fatigue on recurring trusted recipients.",
		},
		{
			id: 4,
			title: "Live Settlement & Proof of Payment",
			flowStage: "Step 4 of 4 • Post-Dispatch Telemetry",
			timestamp: "00:41",
			appA: {
				name: "Revolut",
				screenImage:
					"https://images.unsplash.com/photo-1556742049-0a67e5572293?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "3.2s",
				heuristicsRating: 9.8,
				frictionPoints: [
					{
						severity: "positive",
						label: "Animated SEPA Tracker & PDF",
						description:
							"Visual breadcrumbs show GPS/network progress with one-tap WhatsApp receipt sharing.",
					},
				],
			},
			appB: {
				name: "Monzo",
				screenImage:
					"https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop",
				timeOnTask: "12.6s",
				heuristicsRating: 7.9,
				frictionPoints: [
					{
						severity: "warning",
						label: "Static Pending Status",
						description:
							"No real-time rail indicator; user is left uncertain whether funds cleared immediately.",
					},
				],
			},
			studioTakeaway:
				"Post-transaction reassurance reduces support ticket volume by 42% regarding 'Where is my wire?'.",
		},
	],
};
