export interface FlowScreen {
	id: string;
	title: string;
	subtitle?: string;
	imageUrl?: string;
	screenType:
		| "splash"
		| "welcome"
		| "phone-input"
		| "otp"
		| "kyc-scan"
		| "pin"
		| "account-ready"
		| "transfer-amount"
		| "recipient-select"
		| "confirmation"
		| "switch-profile"
		| "workspace-picker"
		| "generic-wireframe";
	badge?: string;
	accentColor?: string;
	isDark?: boolean;
	wireframeDetails?: {
		headerText?: string;
		headlineText?: string;
		subText?: string;
		buttonText?: string;
		inputsCount?: number;
		hasKeypad?: boolean;
		hasCards?: boolean;
		hasChart?: boolean;
		avatarRow?: boolean;
	};
}

export interface UsabilityIssue {
	id: string;
	title: string;
	severity: "high" | "medium" | "low";
	heuristic: string;
	description: string;
	dropOffImpact: string;
}

export interface FlowComment {
	id: string;
	authorName: string;
	authorAvatar?: string;
	content: string;
	timestamp: string;
	screenStep?: number;
}

export interface DashboardFlow {
	id: string;
	flowType:
		| "creating-account"
		| "onboarding"
		| "switching-account"
		| "transfer-money"
		| "order-card"
		| "fcl-loan";
	flowLabel: string;
	flowName: string;
	app: string;
	appCategory:
		| "Banking"
		| "Crypto & Web3"
		| "Investing"
		| "Payments"
		| "Lending"
		| "SaaS";
	screensCount: number;
	platform: "ios" | "web";
	appColor: string;
	appLogoText: string;
	appLogoUrl?: string;
	isLocked?: boolean;
	timeOnTask: string;
	taskSuccessRate: string;
	seqScore: string;
	seqRating: string;
	usabilityIssues: UsabilityIssue[];
	initialComments: FlowComment[];
	screens: FlowScreen[];
	tags?: string[];
}

const BOG_SCREEN_FILES = [
	{ fileNum: 1, title: "Home Dashboard" },
	{ fileNum: 2, title: "Hub & Products" },
	{ fileNum: 3, title: "Cards Catalog" },
	{ fileNum: 4, title: "Select Digital Card" },
	{ fileNum: 5, title: "Card Benefits & Terms" },
	{ fileNum: 7, title: "Choose Card Currency" },
	{ fileNum: 8, title: "Card Design & Skin" },
	{ fileNum: 9, title: "Account Linking" },
	{ fileNum: 10, title: "Order Summary" },
	{ fileNum: 11, title: "Terms & Conditions" },
	{ fileNum: 12, title: "SMS / Biometric Confirm" },
	{ fileNum: 13, title: "Processing Card Issue" },
	{ fileNum: 14, title: "Digital Card Issued" },
	{ fileNum: 15, title: "Add to Apple Wallet" },
	{ fileNum: 16, title: "Active Card View" },
];

const TBC_SCREEN_FILES = [
	{ fileNum: 1, title: "Home Dashboard" },
	{ fileNum: 2, title: "Products Menu" },
	{ fileNum: 3, title: "Order New Card" },
	{ fileNum: 4, title: "Card Tier Selection" },
	{ fileNum: 5, title: "Digital Card Details" },
	{ fileNum: 6, title: "Select Currency" },
	{ fileNum: 7, title: "Cardholder Information" },
	{ fileNum: 8, title: "Contract & Tariff" },
	{ fileNum: 9, title: "Review Order" },
	{ fileNum: 10, title: "OTP Verification" },
	{ fileNum: 11, title: "Card Provisioning" },
	{ fileNum: 12, title: "Card Ready" },
	{ fileNum: 13, title: "Apple Pay Setup" },
	{ fileNum: 14, title: "Card Active in App" },
];

const SILK_SCREEN_FILES = [
	{ fileNum: 1, title: "Home Balance" },
	{ fileNum: 2, title: "Products Hub" },
	{ fileNum: 3, title: "Digital Card Intro" },
	{ fileNum: 4, title: "Card Plan & Perks" },
	{ fileNum: 5, title: "Customize Card Color" },
	{ fileNum: 6, title: "Currency & Limits" },
	{ fileNum: 7, title: "Billing Details" },
	{ fileNum: 8, title: "Agreement Preview" },
	{ fileNum: 9, title: "Passcode Confirm" },
	{ fileNum: 10, title: "Issuing Digital Card" },
	{ fileNum: 11, title: "Card Activated" },
	{ fileNum: 12, title: "Card Details & CVV" },
	{ fileNum: 13, title: "Wallet Provisioning" },
	{ fileNum: 14, title: "Ready to Spend" },
];

export const DASHBOARD_FLOWS: DashboardFlow[] = [
	{
		id: "bog-order-card",
		flowType: "order-card",
		flowLabel: "Order Digital Card",
		flowName: "Order Digital Card in BOG",
		app: "BOG",
		appCategory: "Banking",
		screensCount: BOG_SCREEN_FILES.length,
		platform: "ios",
		appColor: "#ff600a",
		appLogoText: "B",
		appLogoUrl: "/logos/bog.png",
		isLocked: false,
		tags: ["ordercard"],
		timeOnTask: "45s",
		taskSuccessRate: "98.9%",
		seqScore: "6.8 / 7",
		seqRating: "Exceptional Ease (99th percentile)",
		usabilityIssues: [
			{
				id: "bog-card-iss-1",
				title: "Card color contrast against dark mode background",
				severity: "low",
				heuristic: "Aesthetic and Minimalist Design (Nielsen #8)",
				description:
					"Dark card skin preview blends slightly with dark mode surface on step 8.",
				dropOffImpact: "1.2% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-bog-1",
				authorName: "Marcus Lee",
				content:
					"Instant digital card issuing and Apple Wallet provisioning with zero friction.",
				timestamp: "2h ago",
				screenStep: 1,
			},
		],
		screens: BOG_SCREEN_FILES.map((s, idx) => ({
			id: `bog-card-${idx + 1}`,
			title: s.title,
			imageUrl: `/flows/bog/BOG_Oder_Digital_Card${s.fileNum}.png`,
			screenType: "welcome",
			isDark: true,
			wireframeDetails: {
				headerText: "BOG Digital Card",
				headlineText: s.title,
				subText: `Step ${idx + 1} of ${BOG_SCREEN_FILES.length} in BOG Digital Card ordering flow.`,
				buttonText: "Continue",
			},
		})),
	},
	{
		id: "tbc-order-card",
		flowType: "order-card",
		flowLabel: "Order Digital Card",
		flowName: "Order Digital Card in TBC",
		app: "TBC",
		appCategory: "Banking",
		screensCount: TBC_SCREEN_FILES.length,
		platform: "ios",
		appColor: "#0075eb",
		appLogoText: "T",
		appLogoUrl: "/logos/tbc.png",
		isLocked: false,
		tags: ["ordercard"],
		timeOnTask: "52s",
		taskSuccessRate: "98.4%",
		seqScore: "6.6 / 7",
		seqRating: "Very Easy (96th percentile)",
		usabilityIssues: [
			{
				id: "tbc-card-iss-1",
				title: "Concept tier selection adds extra confirmation step",
				severity: "medium",
				heuristic: "Flexibility and Efficiency (Nielsen #7)",
				description:
					"Users must review tariff breakdown before confirming digital card currency.",
				dropOffImpact: "2.4% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-tbc-1",
				authorName: "Sara Kim",
				content:
					"Clean card visual hierarchy and clear currency selector during onboarding.",
				timestamp: "3h ago",
				screenStep: 4,
			},
		],
		screens: TBC_SCREEN_FILES.map((s, idx) => ({
			id: `tbc-card-${idx + 1}`,
			title: s.title,
			imageUrl: `/flows/tbc/TBC_Order_Digital_Card${s.fileNum}.png`,
			screenType: "welcome",
			isDark: true,
			wireframeDetails: {
				headerText: "TBC Digital Card",
				headlineText: s.title,
				subText: `Step ${idx + 1} of ${TBC_SCREEN_FILES.length} in TBC Digital Card ordering flow.`,
				buttonText: "Continue",
			},
		})),
	},
	{
		id: "silk-order-card",
		flowType: "order-card",
		flowLabel: "Order Digital Card",
		flowName: "Order Digital Card in Silk",
		app: "Silk",
		appCategory: "Banking",
		screensCount: SILK_SCREEN_FILES.length,
		platform: "ios",
		appColor: "#111111",
		appLogoText: "S",
		appLogoUrl: "/logos/silk.png",
		isLocked: false,
		tags: ["ordercard"],
		timeOnTask: "40s",
		taskSuccessRate: "99.1%",
		seqScore: "6.8 / 7",
		seqRating: "Seamless (99th percentile)",
		usabilityIssues: [
			{
				id: "silk-card-iss-1",
				title: "Secondary action label contrast on dark surface",
				severity: "low",
				heuristic: "Visibility of System Status (Nielsen #1)",
				description:
					"Muted secondary label below primary CTA has lower contrast in low brightness.",
				dropOffImpact: "1.4% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-silk-1",
				authorName: "Ana Costa",
				content:
					"Minimalist black-and-violet card aesthetic feels super modern and fast.",
				timestamp: "4h ago",
				screenStep: 5,
			},
		],
		screens: SILK_SCREEN_FILES.map((s, idx) => ({
			id: `silk-card-${idx + 1}`,
			title: s.title,
			imageUrl: `/flows/silk/Silk_Order_Digital_Card${s.fileNum}.png`,
			screenType: "welcome",
			isDark: true,
			wireframeDetails: {
				headerText: "Silk Digital Card",
				headlineText: s.title,
				subText: `Step ${idx + 1} of ${SILK_SCREEN_FILES.length} in Silk Digital Card ordering flow.`,
				buttonText: "Continue",
			},
		})),
	},
];
