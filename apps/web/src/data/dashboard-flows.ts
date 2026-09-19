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
		| "transfer-money";
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
}

export const DASHBOARD_FLOWS: DashboardFlow[] = [
	{
		id: "revolut-onboarding",
		flowType: "onboarding",
		flowLabel: "Onboarding",
		flowName: "Onboarding in Revolut",
		app: "Revolut",
		appCategory: "Banking",
		screensCount: 26,
		platform: "ios",
		appColor: "#0075eb",
		appLogoText: "R",
		isLocked: false,
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
			{
				id: "c-2",
				authorName: "Alex Rivera",
				authorAvatar:
					"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=80&auto=format&fit=crop",
				content:
					"The dynamic island pill animation on step 2 adds nice tactile feedback.",
				timestamp: "Yesterday",
				screenStep: 2,
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
				id: "rev-3",
				title: "Invest Pitch",
				screenType: "welcome",
				isDark: true,
				wireframeDetails: {
					headerText: "Global Investments",
					headlineText: "INVEST YOUR WAY, FROM $1",
					subText: "Capital at risk. Easy zero-commission trading.",
					buttonText: "Explore assets",
				},
			},
			{
				id: "rev-4",
				title: "Protection",
				screenType: "welcome",
				isDark: true,
				wireframeDetails: {
					headerText: "Bank Grade Security",
					headlineText: "YOUR MONEY, PROTECTED — PERIOD.",
					subText: "Regulated bank deposits up to €100,000.",
					buttonText: "Sign up",
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
					headlineText: "Create a 6-digit passcode",
					subText: "Used to unlock app and authorize payments",
					buttonText: "Confirm Passcode",
					hasKeypad: true,
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
		id: "monzo-creating-account",
		flowType: "creating-account",
		flowLabel: "Creating Account",
		flowName: "Creating Account in Monzo",
		app: "Monzo",
		appCategory: "Banking",
		screensCount: 19,
		platform: "ios",
		appColor: "#ff4d4f",
		appLogoText: "M",
		isLocked: false,
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
			{
				id: "mnz-iss-2",
				title: "Postcode lookup requires exact flat number format",
				severity: "low",
				heuristic: "Help Users Recognize and Recover from Errors (Nielsen #9)",
				description:
					"Fails silently if user enters 'Flat 4B' instead of '4B', requiring manual address entry fallback.",
				dropOffImpact: "2.4% drop-off risk",
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
				screenStep: 5,
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
				id: "mnz-3",
				title: "Email & Address",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Personal details",
					headlineText: "Where do you live?",
					subText:
						"We need your UK residential address to send your debit card.",
					inputsCount: 3,
					buttonText: "Next",
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
				id: "mnz-5",
				title: "Card Customization",
				screenType: "generic-wireframe",
				isDark: true,
				wireframeDetails: {
					headerText: "Hot Coral Card",
					headlineText: "Your iconic card is in the mail",
					subText: "Add to Apple Pay immediately while your card ships.",
					buttonText: "Add to Apple Wallet",
					hasCards: true,
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
		id: "stripe-switching-account",
		flowType: "switching-account",
		flowLabel: "Switching Account",
		flowName: "Switching Account in Stripe",
		app: "Stripe",
		appCategory: "Payments",
		screensCount: 14,
		platform: "ios",
		appColor: "#635bff",
		appLogoText: "S",
		isLocked: true,
		timeOnTask: "38s",
		taskSuccessRate: "99.1%",
		seqScore: "6.8 / 7",
		seqRating: "Seamless (99th percentile)",
		usabilityIssues: [
			{
				id: "str-iss-1",
				title: "Organization switcher requires 3 taps from drawer",
				severity: "low",
				heuristic: "Flexibility and Efficiency (Nielsen #7)",
				description:
					"Frequent multi-entity founders request direct long-press switching from bottom bar.",
				dropOffImpact: "1.2% drop-off risk",
			},
		],
		initialComments: [],
		screens: [
			{
				id: "str-1",
				title: "Merchant Hub",
				screenType: "switch-profile",
				isDark: false,
				wireframeDetails: {
					headerText: "Active Account",
					headlineText: "IvO Labs Inc. (US)",
					subText: "Select account or create new organization",
					buttonText: "Switch Workspace",
					hasCards: true,
				},
			},
			{
				id: "str-2",
				title: "Select Entity",
				screenType: "workspace-picker",
				isDark: false,
				wireframeDetails: {
					headerText: "Organizations",
					headlineText: "Switch Workspace",
					subText: "4 active merchant profiles with shared 2FA",
					buttonText: "Confirm Selection",
					avatarRow: true,
				},
			},
			{
				id: "str-3",
				title: "Multi-Factor Check",
				screenType: "pin",
				isDark: false,
				wireframeDetails: {
					headerText: "Security Step-up",
					headlineText: "Authorize switch with Touch ID",
					subText: "Confirm session key for IvO Global Europe Ltd",
					buttonText: "Authorize Face ID",
				},
			},
			{
				id: "str-4",
				title: "Live Dashboard",
				screenType: "generic-wireframe",
				isDark: false,
				wireframeDetails: {
					headerText: "Gross Volume",
					headlineText: "€148,290.00",
					subText: "+24.8% vs last 30 days",
					buttonText: "View Transactions",
					hasChart: true,
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
		screensCount: 22,
		platform: "ios",
		appColor: "#9fe870",
		appLogoText: "W",
		isLocked: true,
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
];
