export interface FintechFlow {
	id: string;
	app: string;
	category:
		| "Banking"
		| "Crypto & Web3"
		| "Investing"
		| "Prediction Markets"
		| "Payments"
		| "Lending";
	flowName: string;
	screensCount: number;
	timeOnTask: string;
	successRate: string;
	errorRate: string;
	frictionScore: number; // out of 10 (10 is seamless, lower is high friction)
	isKycGated: boolean;
	regionLock: string;
	heroImage: string;
	avatar: string;
	tags: string[];
	highlight: string;
}

export const FINTECH_FLOWS: FintechFlow[] = [
	{
		id: "revolut-kyc-onboarding",
		app: "Revolut",
		category: "Banking",
		flowName: "Identity Verification & Liveness Check",
		screensCount: 14,
		timeOnTask: "1m 42s",
		successRate: "97.8%",
		errorRate: "1.4%",
		frictionScore: 9.4,
		isKycGated: true,
		regionLock: "EEA / UK",
		heroImage:
			"https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=120&auto=format&fit=crop",
		tags: ["NFC Passport Scan", "Biometric Liveness", "Instant Account"],
		highlight:
			"Reduces biometric drop-off by 64% using real-time frame guidance.",
	},
	{
		id: "polymarket-usdc-ramp",
		app: "Polymarket",
		category: "Prediction Markets",
		flowName: "Polygon USDC Deposit & Order Execution",
		screensCount: 8,
		timeOnTask: "48s",
		successRate: "94.2%",
		errorRate: "3.1%",
		frictionScore: 8.9,
		isKycGated: false,
		regionLock: "Global (Non-US)",
		heroImage:
			"https://images.unsplash.com/photo-1642543492481-44e81e3914a7?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?q=80&w=120&auto=format&fit=crop",
		tags: ["Magic Link Auth", "Gasless Relayer", "Order Book UX"],
		highlight:
			"Zero-gas signature abstraction allows sub-minute first market trade.",
	},
	{
		id: "monzo-flex-credit",
		app: "Monzo",
		category: "Lending",
		flowName: "Instant Flex Credit Line Approval",
		screensCount: 11,
		timeOnTask: "1m 12s",
		successRate: "96.5%",
		errorRate: "1.8%",
		frictionScore: 9.2,
		isKycGated: true,
		regionLock: "UK Only",
		heroImage:
			"https://images.unsplash.com/photo-1559526324-4b87b5e36e44?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1579621970795-87facc2f976d?q=80&w=120&auto=format&fit=crop",
		tags: ["Soft Credit Pull", "Dynamic Slider", "Instant Virtual Card"],
		highlight: "Transparent APR slider previews exact interest before signing.",
	},
	{
		id: "robinhood-options-level3",
		app: "Robinhood",
		category: "Investing",
		flowName: "Options Level 3 Approval & Spread Order",
		screensCount: 16,
		timeOnTask: "3m 05s",
		successRate: "88.1%",
		errorRate: "5.6%",
		frictionScore: 8.1,
		isKycGated: true,
		regionLock: "US Only",
		heroImage:
			"https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1616077168079-7e09a677fb2c?q=80&w=120&auto=format&fit=crop",
		tags: ["Suitability Quiz", "Collateral Locking", "Multi-Leg Order"],
		highlight:
			"Gated behind 14 regulatory disclosures with automatic error checks.",
	},
	{
		id: "mercury-treasury-sweep",
		app: "Mercury",
		category: "Banking",
		flowName: "Automated Treasury T-Bill Yield Setup",
		screensCount: 7,
		timeOnTask: "52s",
		successRate: "99.1%",
		errorRate: "0.4%",
		frictionScore: 9.8,
		isKycGated: true,
		regionLock: "US Incorporated",
		heroImage:
			"https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=120&auto=format&fit=crop",
		tags: ["Yield Automation", "SIPC Coverage", "Founder Dashboard"],
		highlight:
			"One-click allocation between operating checking and 5.2% yield sweep.",
	},
	{
		id: "ramp-spend-controls",
		app: "Ramp",
		category: "Payments",
		flowName: "Corporate Card Issue & Strict Merchant Lock",
		screensCount: 9,
		timeOnTask: "1m 04s",
		successRate: "98.5%",
		errorRate: "0.9%",
		frictionScore: 9.6,
		isKycGated: true,
		regionLock: "US / Multi-entity",
		heroImage:
			"https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1563986768494-4dee2763ff3f?q=80&w=120&auto=format&fit=crop",
		tags: ["Apple Pay Push", "MCC Restriction", "Receipt Match"],
		highlight:
			"Pre-approves virtual card directly into Apple Wallet in 3 taps.",
	},
	{
		id: "etoro-copy-trader",
		app: "eToro",
		category: "Investing",
		flowName: "Social CopyTrader Allocation & Stop-Loss",
		screensCount: 12,
		timeOnTask: "2m 18s",
		successRate: "91.3%",
		errorRate: "4.2%",
		frictionScore: 8.6,
		isKycGated: true,
		regionLock: "Global",
		heroImage:
			"https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=120&auto=format&fit=crop",
		tags: ["Copy Allocation", "Trailing Stop", "Risk Profile"],
		highlight:
			"Visualizes historical drawdown curves directly within the allocation slider.",
	},
	{
		id: "stripe-embedded-onboarding",
		app: "Stripe",
		category: "Payments",
		flowName: "Embedded Connect Express KYC & Payout Flow",
		screensCount: 10,
		timeOnTask: "1m 35s",
		successRate: "96.9%",
		errorRate: "1.7%",
		frictionScore: 9.5,
		isKycGated: true,
		regionLock: "46 Countries",
		heroImage:
			"https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=1200&auto=format&fit=crop",
		avatar:
			"https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=120&auto=format&fit=crop",
		tags: ["Co-branded KYC", "Plaid Instant Verify", "Tax ID Match"],
		highlight: "Achieves sub-2-minute onboarding with instant EIN lookup.",
	},
];
