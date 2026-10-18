export interface FlowScreen {
	id: string;
	title: string;
	subtitle?: string;
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

export const DASHBOARD_FLOWS: DashboardFlow[] = [
	{
		id: "monzo-order-card",
		flowType: "order-card",
		flowLabel: "Order Card",
		flowName: "Physical & Virtual Debit Card Ordering in Monzo",
		app: "Monzo",
		appCategory: "Banking",
		screensCount: 4,
		platform: "ios",
		appColor: "#ff4d4f",
		appLogoText: "M",
		isLocked: false,
		tags: ["ordercard"],
		timeOnTask: "45s",
		taskSuccessRate: "98.9%",
		seqScore: "6.8 / 7",
		seqRating: "Exceptional Ease (99th percentile)",
		usabilityIssues: [
			{
				id: "mnz-card-iss-1",
				title: "Card color contrast against dark mode background",
				severity: "low",
				heuristic: "Aesthetic and Minimalist Design (Nielsen #8)",
				description:
					"Midnight Metal edition preview blends with ultra-dark OLED themes on step 1.",
				dropOffImpact: "1.2% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-card-1",
				authorName: "Marcus Lee",
				content:
					"The 3D card rotation physics during color selection has zero dropped frames on iOS.",
				timestamp: "2h ago",
				screenStep: 0,
			},
		],
		screens: [
			{
				id: "mnz-card-1",
				title: "Choose Card Design",
				screenType: "welcome",
				isDark: false,
				wireframeDetails: {
					headerText: "Card Selection",
					headlineText: "Neon Coral or Midnight Metal",
					subText: "Contactless Mastercard with zero foreign transaction fees.",
					buttonText: "Select Neon Coral",
					hasCards: true,
				},
			},
			{
				id: "mnz-card-2",
				title: "Custom Engraving",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Personalize",
					headlineText: "Choose name printed on card",
					subText: "Laser engraved on the reverse side for cardholder privacy.",
					inputsCount: 1,
					buttonText: "Review Shipping",
				},
			},
			{
				id: "mnz-card-3",
				title: "Delivery Address",
				screenType: "phone-input",
				isDark: false,
				wireframeDetails: {
					headerText: "Shipping Destination",
					headlineText: "Confirm delivery address",
					subText:
						"Free Royal Mail 1st class delivery. Dispatched within 24 hours.",
					inputsCount: 2,
					buttonText: "Confirm & Order",
				},
			},
			{
				id: "mnz-card-4",
				title: "Apple Wallet Ready",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Card Activated",
					headlineText: "Card is live in Apple Pay",
					subText:
						"Start spending online and in stores while your card is in transit.",
					buttonText: "Add to Apple Wallet",
				},
			},
		],
	},
	{
		id: "revolut-fcl-loan",
		flowType: "fcl-loan",
		flowLabel: "Flexible Credit Loan",
		flowName: "Instant Flexible Credit Line (FCL) & Loan in Revolut",
		app: "Revolut",
		appCategory: "Lending",
		screensCount: 4,
		platform: "ios",
		appColor: "#0075eb",
		appLogoText: "R",
		isLocked: false,
		tags: ["fclloan"],
		timeOnTask: "1m 15s",
		taskSuccessRate: "97.1%",
		seqScore: "6.3 / 7",
		seqRating: "Very Easy (92nd percentile)",
		usabilityIssues: [
			{
				id: "rev-fcl-iss-1",
				title: "APR tier explanation hidden behind tooltip",
				severity: "medium",
				heuristic: "Recognition rather than Recall (Nielsen #6)",
				description:
					"Representative example requires tapping micro-link on step 3.",
				dropOffImpact: "3.5% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-fcl-1",
				authorName: "Sara Kim",
				content:
					"Open Banking instant aggregation cuts loan decision time from 2 days to 30 seconds.",
				timestamp: "1d ago",
				screenStep: 1,
			},
		],
		screens: [
			{
				id: "rev-fcl-1",
				title: "Credit Amount",
				screenType: "transfer-amount",
				isDark: false,
				wireframeDetails: {
					headerText: "Flexible Credit Line",
					headlineText: "Credit line up to €15,000",
					subText: "Only pay interest on the exact amount you draw down.",
					hasKeypad: true,
					buttonText: "Check Pre-approved Rate",
				},
			},
			{
				id: "rev-fcl-2",
				title: "Open Banking Check",
				screenType: "kyc-scan",
				isDark: false,
				wireframeDetails: {
					headerText: "Instant Eligibility",
					headlineText: "Connect bank for verification",
					subText: "Zero impact on credit score during preliminary quotation.",
					buttonText: "Connect Bank via Open Banking",
				},
			},
			{
				id: "rev-fcl-3",
				title: "Repayment Schedule",
				screenType: "confirmation",
				isDark: false,
				wireframeDetails: {
					headerText: "Repayment Terms",
					headlineText: "Select 3 to 36 month schedule",
					subText: "Fixed 5.9% APR with zero early repayment or penalty fees.",
					hasCards: true,
					buttonText: "Sign Loan Agreement",
				},
			},
			{
				id: "rev-fcl-4",
				title: "Funds Disbursed",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Credit Line Activated",
					headlineText: "€15,000 line available now",
					subText:
						"Tap to transfer money instantly to your primary spending balance.",
					buttonText: "Access Credit Line",
				},
			},
		],
	},
	{
		id: "revolut-onboarding",
		flowType: "onboarding",
		flowLabel: "Onboarding",
		flowName: "Onboarding in Revolut",
		app: "Revolut",
		appCategory: "Banking",
		screensCount: 9,
		platform: "ios",
		appColor: "#0075eb",
		appLogoText: "R",
		isLocked: false,
		tags: ["onboarding"],
		timeOnTask: "1m 42s",
		taskSuccessRate: "97.8%",
		seqScore: "6.4 / 7",
		seqRating: "Very Easy (94th percentile)",
		usabilityIssues: [
			{
				id: "rev-iss-1",
				title: "Biometric Liveness drop-off in low lighting",
				severity: "high",
				heuristic: "Error Prevention (Nielsen #5)",
				description:
					"Step 7 selfie verification fails 18% of attempts if ambient brightness is below 120 lux without proactive guidance.",
				dropOffImpact: "14.2% drop-off risk",
			},
			{
				id: "rev-iss-2",
				title: "Numeric keypad conceals legal disclaimer",
				severity: "medium",
				heuristic: "Visibility of System Status (Nielsen #1)",
				description:
					"On 375pt iOS viewports, the fixed bottom sheet covers the privacy consent footnote when input is focused.",
				dropOffImpact: "5.1% drop-off risk",
			},
			{
				id: "rev-iss-3",
				title: "No inline edit on 6-digit phone prefix",
				severity: "low",
				heuristic: "Flexibility and Efficiency (Nielsen #7)",
				description:
					"Country code defaults to device SIM region with no quick inline tap-to-switch without opening modal.",
				dropOffImpact: "1.8% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-1",
				authorName: "Sarah Chen",
				authorAvatar:
					"https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop",
				content:
					"Notice how they removed the SMS code countdown and automatically focus the next OTP input.",
				timestamp: "2 hours ago",
				screenStep: 6,
			},
		],
		screens: [
			{
				id: "rev-1",
				title: "Splash",
				screenType: "splash",
				isDark: false,
				wireframeDetails: {
					headlineText: "Revolut",
					subText: "One app, all things money.",
					buttonText: "Get Started",
				},
			},
			{
				id: "rev-2",
				title: "Value Prop",
				screenType: "welcome",
				isDark: true,
				wireframeDetails: {
					headerText: "Welcome to Revolut",
					headlineText: "READY TO CHANGE THE WAY YOU MONEY?",
					buttonText: "Sign up",
					subText: "Log in or create a new account in under 2 minutes.",
				},
			},
			{
				id: "rev-5",
				title: "Phone Entry",
				screenType: "phone-input",
				isDark: false,
				wireframeDetails: {
					headerText: "Let's get started!",
					headlineText: "Enter your phone number",
					subText: "We will send you a 6-digit confirmation code.",
					buttonText: "Sign up",
					hasKeypad: true,
					inputsCount: 1,
				},
			},
			{
				id: "rev-6",
				title: "OTP Verification",
				screenType: "otp",
				isDark: false,
				wireframeDetails: {
					headerText: "Verify number",
					headlineText: "6-digit code",
					subText: "Sent to +65 9036 6027. Didn't receive? Resend",
					buttonText: "Verify",
					hasKeypad: true,
					inputsCount: 6,
				},
			},
			{
				id: "rev-7",
				title: "ID Check",
				screenType: "kyc-scan",
				isDark: false,
				wireframeDetails: {
					headerText: "Identity Verification",
					headlineText: "Scan Government ID",
					subText: "Position passport or national ID within frame",
					buttonText: "Take photo",
				},
			},
			{
				id: "rev-8",
				title: "Passcode",
				screenType: "pin",
				isDark: false,
				wireframeDetails: {
					headerText: "Security",
					headlineText: "Create 4-digit passcode",
					subText: "This passcode unlocks Revolut on this device.",
					buttonText: "Confirm",
					hasKeypad: true,
					inputsCount: 4,
				},
			},
			{
				id: "rev-9",
				title: "Account Ready",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "All set!",
					headlineText: "Welcome aboard, Alex",
					subText: "Your virtual Mastercard is activated & ready.",
					buttonText: "Open Dashboard",
					hasCards: true,
				},
			},
		],
	},
	{
		id: "wise-transfer-money",
		flowType: "transfer-money",
		flowLabel: "Transfer Money",
		flowName: "Transfer Money in Wise",
		app: "Wise",
		appCategory: "Payments",
		screensCount: 4,
		platform: "ios",
		appColor: "#9fe870",
		appLogoText: "W",
		isLocked: false,
		tags: ["transfermoney_p2p"],
		timeOnTask: "54s",
		taskSuccessRate: "98.2%",
		seqScore: "6.5 / 7",
		seqRating: "Very Easy (95th percentile)",
		usabilityIssues: [
			{
				id: "wis-iss-1",
				title: "Guaranteed FX rate timer pressure",
				severity: "medium",
				heuristic: "Visibility of System Status (Nielsen #1)",
				description:
					"A 10-minute rate lock countdown bar causes anxiety on recipient review step.",
				dropOffImpact: "4.7% drop-off risk",
			},
		],
		initialComments: [],
		screens: [
			{
				id: "wis-1",
				title: "Amount",
				screenType: "transfer-amount",
				isDark: false,
				wireframeDetails: {
					headerText: "Send Money",
					headlineText: "1,000 USD → 915.40 EUR",
					subText: "Guaranteed mid-market rate (fee: $4.12)",
					hasKeypad: true,
					buttonText: "Continue",
				},
			},
			{
				id: "wis-2",
				title: "Recipient",
				screenType: "recipient-select",
				isDark: false,
				wireframeDetails: {
					headerText: "Who are you sending to?",
					headlineText: "Recipients & IBANs",
					subText: "Select saved contact or enter bank coordinates",
					avatarRow: true,
					buttonText: "Select Recipient",
					inputsCount: 1,
				},
			},
			{
				id: "wis-3",
				title: "Review",
				screenType: "confirmation",
				isDark: false,
				wireframeDetails: {
					headerText: "Transfer Summary",
					headlineText: "Arrives by Today, 14:30",
					subText: "Instant SEPA network transfer",
					hasCards: true,
					buttonText: "Confirm & Pay",
				},
			},
			{
				id: "wis-4",
				title: "Success",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Funds Dispatched",
					headlineText: "Transfer on its way!",
					subText: "Track live status and share payment receipt.",
					buttonText: "Done",
				},
			},
		],
	},
	{
		id: "stripe-issuing-card",
		flowType: "order-card",
		flowLabel: "Corporate Card",
		flowName: "Corporate Card Issuing & Spend Controls in Stripe",
		app: "Stripe",
		appCategory: "Payments",
		screensCount: 4,
		platform: "ios",
		appColor: "#635bff",
		appLogoText: "S",
		isLocked: false,
		tags: ["ordercard"],
		timeOnTask: "40s",
		taskSuccessRate: "99.1%",
		seqScore: "6.8 / 7",
		seqRating: "Seamless (99th percentile)",
		usabilityIssues: [
			{
				id: "str-iss-1",
				title: "Category restriction presets lack bulk multi-select",
				severity: "low",
				heuristic: "Flexibility and Efficiency (Nielsen #7)",
				description:
					"Users must toggle SaaS, Travel, and Office categories individually rather than batching.",
				dropOffImpact: "1.4% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-str-1",
				authorName: "Ana Costa",
				content:
					"Instant card provisioning into Apple Wallet with auto-spending limits.",
				timestamp: "4h ago",
				screenStep: 3,
			},
		],
		screens: [
			{
				id: "str-1",
				title: "Card Type & Limits",
				screenType: "welcome",
				isDark: false,
				wireframeDetails: {
					headerText: "Issue Team Card",
					headlineText: "Corporate Visa with custom budget limit",
					subText: "Set monthly limit, category restrictions, and auto-freeze.",
					buttonText: "Set Spend Controls",
					hasCards: true,
				},
			},
			{
				id: "str-2",
				title: "Cardholder Assignment",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Cardholder Details",
					headlineText: "Assign team member & department",
					subText: "Physical card laser-engraved with employee name.",
					inputsCount: 2,
					buttonText: "Review & Authorize",
				},
			},
			{
				id: "str-3",
				title: "Manager Approval",
				screenType: "pin",
				isDark: false,
				wireframeDetails: {
					headerText: "Biometric Authorization",
					headlineText: "Confirm card issuing with Face ID",
					subText: "Instant verification for Alignment Europe Corp.",
					buttonText: "Authorize Issuing",
				},
			},
			{
				id: "str-4",
				title: "Digital Card Active",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Card Created",
					headlineText: "Ready for digital wallet spending",
					subText:
						"Add to Apple Pay immediately; physical card arrives in 3 days.",
					buttonText: "Add to Apple Wallet",
					hasCards: true,
				},
			},
		],
	},
	{
		id: "monzo-flex-credit",
		flowType: "fcl-loan",
		flowLabel: "Flex Credit Line",
		flowName: "Monzo Flex Credit Line & Instant Loan",
		app: "Monzo",
		appCategory: "Lending",
		screensCount: 4,
		platform: "ios",
		appColor: "#ff4d4f",
		appLogoText: "M",
		isLocked: false,
		tags: ["fclloan"],
		timeOnTask: "48s",
		taskSuccessRate: "98.6%",
		seqScore: "6.7 / 7",
		seqRating: "Exceptional Ease (98th percentile)",
		usabilityIssues: [
			{
				id: "mnz-flex-iss-1",
				title: "APR tier comparison requires tapping expandable disclosure",
				severity: "medium",
				heuristic: "Recognition rather than Recall (Nielsen #6)",
				description:
					"First-time borrowers overlook 19% APR comparison on 6-month tier without expanding drawer.",
				dropOffImpact: "2.8% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-flex-1",
				authorName: "Marcus Lee",
				content:
					"0% APR installment breakdown is crystal clear on the first screen.",
				timestamp: "6h ago",
				screenStep: 0,
			},
		],
		screens: [
			{
				id: "mnz-flex-1",
				title: "Credit Calculator",
				screenType: "transfer-amount",
				isDark: false,
				wireframeDetails: {
					headerText: "Pre-approved Flex Line",
					headlineText: "Up to £3,000 at 0% APR",
					subText: "Spread payments over 3 monthly installments interest-free.",
					buttonText: "Select Payment Plan",
					hasKeypad: true,
				},
			},
			{
				id: "mnz-flex-2",
				title: "Installment Terms",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Payment Schedule",
					headlineText: "3 monthly payments of £333.33",
					subText: "Auto-deducted from your Monzo account with 0 hidden fees.",
					buttonText: "Accept & Sign",
					hasCards: true,
				},
			},
			{
				id: "mnz-flex-3",
				title: "Agreement & Direct Debit",
				screenType: "confirmation",
				isDark: false,
				wireframeDetails: {
					headerText: "Review Agreement",
					headlineText: "Direct debit mandate confirmation",
					subText: "No impact on credit score when repaid on time.",
					buttonText: "Confirm Direct Debit",
				},
			},
			{
				id: "mnz-flex-4",
				title: "Virtual Flex Ready",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Credit Line Live",
					headlineText: "£3,000 Flex line ready to spend",
					subText: "Pay with virtual Flex card online or in stores.",
					buttonText: "Open Flex Dashboard",
					hasCards: true,
				},
			},
		],
	},
	{
		id: "monzo-creating-account",
		flowType: "creating-account",
		flowLabel: "Creating Account",
		flowName: "Creating Account in Monzo",
		app: "Monzo",
		appCategory: "Banking",
		screensCount: 4,
		platform: "ios",
		appColor: "#ff4d4f",
		appLogoText: "M",
		isLocked: false,
		tags: ["onboarding"],
		timeOnTask: "1m 12s",
		taskSuccessRate: "96.5%",
		seqScore: "6.7 / 7",
		seqRating: "Exceptional Ease (98th percentile)",
		usabilityIssues: [
			{
				id: "mnz-iss-1",
				title: "Video selfie script pronunciation ambiguity",
				severity: "medium",
				heuristic: "Recognition rather than Recall (Nielsen #6)",
				description:
					"Some users stammer on the required phrase prompt because the text scrolls too rapidly on smaller displays.",
				dropOffImpact: "6.8% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-3",
				authorName: "Marcus Vance",
				authorAvatar:
					"https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=80&auto=format&fit=crop",
				content:
					"The coral card animation during step 5 triggers immediate emotional delight.",
				timestamp: "3 days ago",
				screenStep: 3,
			},
		],
		screens: [
			{
				id: "mnz-1",
				title: "Welcome",
				screenType: "welcome",
				isDark: false,
				wireframeDetails: {
					headerText: "Monzo Bank",
					headlineText: "Banking made easy",
					subText: "Join 9+ million people who budget and save with Monzo.",
					buttonText: "Apply for an account",
				},
			},
			{
				id: "mnz-2",
				title: "Account Type",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Choose account",
					headlineText: "What type of account do you need?",
					subText: "Personal, Joint, or Business current account",
					hasCards: true,
					buttonText: "Continue",
				},
			},
			{
				id: "mnz-4",
				title: "Video Selfie",
				screenType: "kyc-scan",
				isDark: false,
				wireframeDetails: {
					headerText: "Biometric Liveness",
					headlineText: "Quick video selfie",
					subText: "Say: 'Hi, my name is Alex and I want a Monzo account'",
					buttonText: "Record 5s video",
				},
			},
			{
				id: "mnz-6",
				title: "First Deposit",
				screenType: "transfer-amount",
				isDark: false,
				wireframeDetails: {
					headerText: "Fund your account",
					headlineText: "Top up your balance",
					subText: "Transfer from your other bank via Open Banking",
					buttonText: "Link UK Bank",
					hasKeypad: true,
				},
			},
		],
	},
	{
		id: "revolut-transfer-p2p",
		flowType: "transfer-money",
		flowLabel: "P2P Transfer",
		flowName: "Instant P2P Split Bill & Transfer in Revolut",
		app: "Revolut",
		appCategory: "Payments",
		screensCount: 4,
		platform: "ios",
		appColor: "#0075eb",
		appLogoText: "R",
		isLocked: false,
		tags: ["transfermoney_p2p"],
		timeOnTask: "32s",
		taskSuccessRate: "99.4%",
		seqScore: "6.9 / 7",
		seqRating: "Exceptional Ease (99th percentile)",
		usabilityIssues: [
			{
				id: "rev-p2p-iss-1",
				title: "GIF picker on payment note has subtle lag on cold launch",
				severity: "low",
				heuristic: "Flexibility and Efficiency (Nielsen #7)",
				description:
					"Keyboard dismiss gesture slightly conflicts with vertical GIF scroll view.",
				dropOffImpact: "0.8% drop-off risk",
			},
		],
		initialComments: [
			{
				id: "c-p2p-1",
				authorName: "Nina Patel",
				content:
					"The split bill calculator automatically factors in uneven tips.",
				timestamp: "1h ago",
				screenStep: 1,
			},
		],
		screens: [
			{
				id: "rev-p2p-1",
				title: "Select Contact",
				screenType: "recipient-select",
				isDark: false,
				wireframeDetails: {
					headerText: "Friends on Revolut",
					headlineText: "Send or request money instantly",
					subText: "Free, zero-fee instant P2P payments in 30+ currencies.",
					buttonText: "Select Recipient",
					avatarRow: true,
					inputsCount: 1,
				},
			},
			{
				id: "rev-p2p-2",
				title: "Split & Amount",
				screenType: "transfer-amount",
				isDark: false,
				wireframeDetails: {
					headerText: "Split Amount",
					headlineText: "€45.00 dinner bill",
					subText: "Add emoji note or animated GIF to payment.",
					buttonText: "Review & Send",
					hasKeypad: true,
				},
			},
			{
				id: "rev-p2p-3",
				title: "Slide to Transfer",
				screenType: "confirmation",
				isDark: false,
				wireframeDetails: {
					headerText: "Instant Transfer",
					headlineText: "Slide to send €45.00 to Sarah",
					subText: "Delivered instantly to recipient's Revolut balance.",
					buttonText: "Slide to Confirm",
					hasCards: true,
				},
			},
			{
				id: "rev-p2p-4",
				title: "Payment Dispatched",
				screenType: "account-ready",
				isDark: false,
				wireframeDetails: {
					headerText: "Payment Sent!",
					headlineText: "€45.00 sent to Sarah Chen",
					subText: "Shared receipt sent with confetti animation.",
					buttonText: "Done",
				},
			},
		],
	},
];
