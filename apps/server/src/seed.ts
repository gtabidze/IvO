import { listAgents } from "@IvO/api/agents/service";
import type { createAuth } from "@IvO/auth";
import type { Database } from "@IvO/db";
import { user } from "@IvO/db/schema/auth";
import { userFlow, userFlowScreen, userProduct } from "@IvO/db/schema/flows";
import { eq } from "drizzle-orm";

export const DEMO_USER_ID = "UVWCTLP0yUdo8BbIkwlF1h25QzYPDvbK";
export const DEMO_EMAIL = "hbf@admin.com";
export const DEMO_PASSWORD = "hbfstrong";
export const DEMO_NAME = "HBF Admin";

export async function seedTestingUser(
	db: Database,
	auth: ReturnType<typeof createAuth>,
) {
	try {
		const [existingUser] = await db
			.select()
			.from(user)
			.where(eq(user.email, DEMO_EMAIL));

		let userId = existingUser?.id;

		if (!existingUser) {
			console.log(`[Seed] Creating testing user ${DEMO_EMAIL}...`);
			const res = await auth.api.signUpEmail({
				body: {
					email: DEMO_EMAIL,
					password: DEMO_PASSWORD,
					name: DEMO_NAME,
				},
			});
			userId = res.user.id;
			console.log(`[Seed] Created ${DEMO_EMAIL} (id: ${userId})`);
		}

		if (!userId) return;

		// 1. Seed agents
		await listAgents(db, userId);

		// 2. Seed products if missing
		const existingProducts = await db
			.select()
			.from(userProduct)
			.where(eq(userProduct.userId, userId));

		if (existingProducts.length === 0) {
			await db.insert(userProduct).values([
				{
					id: "prod-revolut",
					userId,
					name: "Revolut",
					category: "Banking",
					platform: "ios",
					color: "#0075eb",
					description:
						"Global financial super-app with banking, crypto, and currency exchange.",
				},
				{
					id: "prod-wise",
					userId,
					name: "Wise",
					category: "Payments",
					platform: "ios",
					color: "#9fe870",
					description:
						"Cross-border international payment network and multi-currency accounts.",
				},
			]);
		}

		// 3. Seed flows if missing
		const existingFlows = await db
			.select()
			.from(userFlow)
			.where(eq(userFlow.userId, userId));

		if (existingFlows.length === 0) {
			await db.insert(userFlow).values([
				{
					id: "flow-sample-1",
					userId,
					productId: "prod-revolut",
					name: "Dark Mode Onboarding Experience",
					appName: "Revolut",
					appCategory: "Banking",
					platform: "ios",
					description:
						"High-contrast dark mode welcome and biometric onboarding flow for iOS 18.",
					status: "published",
					appColor: "#0075eb",
					screensCount: 4,
				},
				{
					id: "flow-sample-2",
					userId,
					productId: "prod-wise",
					name: "Multi-Currency Instant Swap",
					appName: "Wise",
					appCategory: "Payments",
					platform: "ios",
					description:
						"Mid-market FX quote card with zero-fee instant currency conversion.",
					status: "draft",
					appColor: "#9fe870",
					screensCount: 3,
				},
			]);

			await db.insert(userFlowScreen).values([
				{
					id: "scr-1",
					flowId: "flow-sample-1",
					title: "Welcome Splash Screen",
					subtitle: "Logo pulse animation & brand entry point",
					orderIndex: 0,
					screenType: "splash",
				},
				{
					id: "scr-2",
					flowId: "flow-sample-1",
					title: "Phone & Country Selector",
					subtitle: "Carrier auto-detection with keypad",
					orderIndex: 1,
					screenType: "phone-input",
				},
				{
					id: "scr-3",
					flowId: "flow-sample-1",
					title: "6-Digit Passcode Verification",
					subtitle: "Haptic feedback input grid",
					orderIndex: 2,
					screenType: "otp",
				},
				{
					id: "scr-4",
					flowId: "flow-sample-1",
					title: "Biometric KYC Liveness",
					subtitle: "Direct camera guidance ring",
					orderIndex: 3,
					screenType: "welcome",
				},
				{
					id: "scr-w1",
					flowId: "flow-sample-2",
					title: "Quote & FX Calculator",
					subtitle: "Live rate guarantee countdown timer",
					orderIndex: 0,
					screenType: "welcome",
				},
				{
					id: "scr-w2",
					flowId: "flow-sample-2",
					title: "Recipient Bank Details",
					subtitle: "IBAN instant validation step",
					orderIndex: 1,
					screenType: "phone-input",
				},
				{
					id: "scr-w3",
					flowId: "flow-sample-2",
					title: "Transfer Review & Authorize",
					subtitle: "FaceID instant authorization sheet",
					orderIndex: 2,
					screenType: "otp",
				},
			]);
		}
	} catch (err) {
		console.warn("[Seed] Warning initializing testing user:", err);
	}
}
