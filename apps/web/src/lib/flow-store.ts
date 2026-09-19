export interface UserProduct {
	id: string;
	userId: string;
	name: string;
	category: string;
	platform: "ios" | "web";
	color: string;
	description?: string;
	logoUrl?: string;
	createdAt: string;
	updatedAt: string;
}

export interface UserScreenItem {
	id: string;
	title: string;
	subtitle?: string;
	imageUrl?: string;
	screenType?: string;
	orderIndex: number;
}

export interface UserCustomFlow {
	id: string;
	userId: string;
	productId?: string;
	productName?: string;
	name: string;
	appName: string;
	appCategory: string;
	platform: "ios" | "web";
	description: string;
	status: "draft" | "published";
	appColor: string;
	screensCount: number;
	createdAt: string;
	updatedAt: string;
	screens: UserScreenItem[];
}

const FLOWS_STORAGE_KEY = "ivo_user_custom_flows";
const PRODUCTS_STORAGE_KEY = "ivo_user_custom_products";

const INITIAL_DEMO_PRODUCTS: UserProduct[] = [
	{
		id: "prod-revolut",
		userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
		name: "Revolut",
		category: "Banking",
		platform: "ios",
		color: "#0075eb",
		description: "Global financial super-app with banking, crypto, and currency exchange.",
		createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
		updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
	},
	{
		id: "prod-wise",
		userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
		name: "Wise",
		category: "Payments",
		platform: "ios",
		color: "#9fe870",
		description: "Cross-border international payment network and multi-currency accounts.",
		createdAt: new Date(Date.now() - 3600000 * 96).toISOString(),
		updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
	},
];

const INITIAL_DEMO_FLOWS: UserCustomFlow[] = [
	{
		id: "flow-sample-1",
		userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
		productId: "prod-revolut",
		productName: "Revolut",
		name: "Dark Mode Onboarding Experience",
		appName: "Revolut",
		appCategory: "Banking",
		platform: "ios",
		description: "High-contrast dark mode welcome and biometric onboarding flow for iOS 18.",
		status: "published",
		appColor: "#0075eb",
		screensCount: 4,
		createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
		updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
		screens: [
			{
				id: "scr-1",
				title: "Welcome Splash Screen",
				subtitle: "Logo pulse animation & brand entry point",
				orderIndex: 0,
				screenType: "splash",
			},
			{
				id: "scr-2",
				title: "Phone & Country Selector",
				subtitle: "Carrier auto-detection with keypad",
				orderIndex: 1,
				screenType: "phone-input",
			},
			{
				id: "scr-3",
				title: "6-Digit Passcode Verification",
				subtitle: "Haptic feedback input grid",
				orderIndex: 2,
				screenType: "otp",
			},
			{
				id: "scr-4",
				title: "Biometric KYC Liveness",
				subtitle: "Direct camera guidance ring",
				orderIndex: 3,
				screenType: "welcome",
			},
		],
	},
	{
		id: "flow-sample-2",
		userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
		productId: "prod-wise",
		productName: "Wise",
		name: "Multi-Currency Instant Swap",
		appName: "Wise",
		appCategory: "Payments",
		platform: "ios",
		description: "Mid-market FX quote card with zero-fee instant currency conversion.",
		status: "draft",
		appColor: "#9fe870",
		screensCount: 3,
		createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
		updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
		screens: [
			{
				id: "scr-w1",
				title: "Quote & FX Calculator",
				subtitle: "Live rate guarantee countdown timer",
				orderIndex: 0,
				screenType: "welcome",
			},
			{
				id: "scr-w2",
				title: "Recipient Bank Details",
				subtitle: "IBAN instant validation step",
				orderIndex: 1,
				screenType: "phone-input",
			},
			{
				id: "scr-w3",
				title: "Transfer Review & Authorize",
				subtitle: "FaceID instant authorization sheet",
				orderIndex: 2,
				screenType: "otp",
			},
		],
	},
];

export const flowStore = {
	// Product Operations
	getProducts: (): UserProduct[] => {
		if (typeof window === "undefined") return INITIAL_DEMO_PRODUCTS;
		try {
			const raw = localStorage.getItem(PRODUCTS_STORAGE_KEY);
			if (!raw) {
				localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_PRODUCTS));
				return INITIAL_DEMO_PRODUCTS;
			}
			return JSON.parse(raw);
		} catch (e) {
			console.error("Failed to load products", e);
			return INITIAL_DEMO_PRODUCTS;
		}
	},

	saveProduct: (product: UserProduct): void => {
		if (typeof window === "undefined") return;
		const products = flowStore.getProducts();
		const index = products.findIndex((p) => p.id === product.id);
		if (index >= 0) {
			products[index] = { ...product, updatedAt: new Date().toISOString() };
		} else {
			products.unshift(product);
		}
		localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
		window.dispatchEvent(new Event("ivo_products_updated"));
	},

	deleteProduct: (id: string): void => {
		if (typeof window === "undefined") return;
		const products = flowStore.getProducts();
		const filteredProds = products.filter((p) => p.id !== id);
		localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(filteredProds));

		// Cascade delete flows belonging to this product
		const flows = flowStore.getFlows();
		const filteredFlows = flows.filter((f) => f.productId !== id);
		localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(filteredFlows));

		window.dispatchEvent(new Event("ivo_products_updated"));
		window.dispatchEvent(new Event("ivo_flows_updated"));
	},

	getProductById: (id: string): UserProduct | undefined => {
		return flowStore.getProducts().find((p) => p.id === id);
	},

	// Flow Operations
	getFlows: (productId?: string): UserCustomFlow[] => {
		if (typeof window === "undefined") return INITIAL_DEMO_FLOWS;
		try {
			const raw = localStorage.getItem(FLOWS_STORAGE_KEY);
			let flows: UserCustomFlow[] = INITIAL_DEMO_FLOWS;
			if (raw) {
				flows = JSON.parse(raw);
			} else {
				localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_FLOWS));
			}

			if (productId && productId !== "all") {
				return flows.filter((f) => f.productId === productId);
			}
			return flows;
		} catch (e) {
			console.error("Failed to load custom flows", e);
			return INITIAL_DEMO_FLOWS;
		}
	},

	saveFlow: (flow: UserCustomFlow): void => {
		if (typeof window === "undefined") return;
		const flows = flowStore.getFlows();
		const index = flows.findIndex((f) => f.id === flow.id);
		if (index >= 0) {
			flows[index] = { ...flow, updatedAt: new Date().toISOString() };
		} else {
			flows.unshift(flow);
		}
		localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(flows));
		window.dispatchEvent(new Event("ivo_flows_updated"));
	},

	toggleStatus: (id: string): "draft" | "published" | null => {
		if (typeof window === "undefined") return null;
		const flows = flowStore.getFlows();
		const flow = flows.find((f) => f.id === id);
		if (!flow) return null;
		const nextStatus = flow.status === "draft" ? "published" : "draft";
		flow.status = nextStatus;
		flow.updatedAt = new Date().toISOString();
		localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(flows));
		window.dispatchEvent(new Event("ivo_flows_updated"));
		return nextStatus;
	},

	deleteFlow: (id: string): void => {
		if (typeof window === "undefined") return;
		const flows = flowStore.getFlows();
		const filtered = flows.filter((f) => f.id !== id);
		localStorage.setItem(FLOWS_STORAGE_KEY, JSON.stringify(filtered));
		window.dispatchEvent(new Event("ivo_flows_updated"));
	},
};
