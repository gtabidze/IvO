import { userFlow, userFlowScreen, userProduct } from "@IvO/db/schema/flows";
import { and, desc, eq } from "drizzle-orm";
import z from "zod";

import { publicProcedure, router } from "../index";

export const flowRouter = router({
	// Products CRUD
	listProducts: publicProcedure
		.input(
			z
				.object({
					userId: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [];
			if (input?.userId) {
				conditions.push(eq(userProduct.userId, input.userId));
			}

			const products = await ctx.db
				.select()
				.from(userProduct)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(userProduct.updatedAt));

			// Fetch flow counts for each product
			const productsWithCounts = await Promise.all(
				products.map(async (prod) => {
					const flows = await ctx.db
						.select()
						.from(userFlow)
						.where(eq(userFlow.productId, prod.id));
					return {
						...prod,
						flowsCount: flows.length,
						screensCount: flows.reduce((acc, f) => acc + f.screensCount, 0),
					};
				}),
			);

			return productsWithCounts;
		}),

	createProduct: publicProcedure
		.input(
			z.object({
				id: z.string(),
				userId: z.string().default("AmwXd8NHlktMgGr6ncPlTr759JmWDJbo"),
				name: z.string().min(1),
				category: z.string().default("Banking"),
				platform: z.enum(["ios", "web"]).default("ios"),
				color: z.string().default("#0075eb"),
				description: z.string().optional(),
				logoUrl: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const record = {
				id: input.id,
				userId: ctx.session?.user?.id || input.userId,
				name: input.name,
				category: input.category,
				platform: input.platform,
				color: input.color,
				description: input.description,
				logoUrl: input.logoUrl,
			};

			await ctx.db.insert(userProduct).values(record);
			return { success: true, id: input.id };
		}),

	deleteProduct: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(userProduct).where(eq(userProduct.id, input.id));
			return { success: true };
		}),

	// List flows for a user or public published flows
	list: publicProcedure
		.input(
			z
				.object({
					status: z.enum(["all", "draft", "published"]).optional(),
					platform: z.enum(["all", "ios", "web"]).optional(),
					productId: z.string().optional(),
					userId: z.string().optional(),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const conditions = [];

			if (input?.status && input.status !== "all") {
				conditions.push(eq(userFlow.status, input.status));
			}

			if (input?.platform && input.platform !== "all") {
				conditions.push(eq(userFlow.platform, input.platform));
			}

			if (input?.productId && input.productId !== "all") {
				conditions.push(eq(userFlow.productId, input.productId));
			}

			if (input?.userId) {
				conditions.push(eq(userFlow.userId, input.userId));
			}

			const flows = await ctx.db
				.select()
				.from(userFlow)
				.where(conditions.length > 0 ? and(...conditions) : undefined)
				.orderBy(desc(userFlow.updatedAt));

			// Fetch screens for each flow
			const flowsWithScreens = await Promise.all(
				flows.map(async (flow) => {
					const screens = await ctx.db
						.select()
						.from(userFlowScreen)
						.where(eq(userFlowScreen.flowId, flow.id))
						.orderBy(userFlowScreen.orderIndex);
					return {
						...flow,
						screens,
					};
				}),
			);

			return flowsWithScreens;
		}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.query(async ({ ctx, input }) => {
			const [flow] = await ctx.db
				.select()
				.from(userFlow)
				.where(eq(userFlow.id, input.id))
				.limit(1);

			if (!flow) {
				return null;
			}

			const screens = await ctx.db
				.select()
				.from(userFlowScreen)
				.where(eq(userFlowScreen.flowId, flow.id))
				.orderBy(userFlowScreen.orderIndex);

			return {
				...flow,
				screens,
			};
		}),

	create: publicProcedure
		.input(
			z.object({
				id: z.string(),
				userId: z.string().default("AmwXd8NHlktMgGr6ncPlTr759JmWDJbo"),
				productId: z.string().optional(),
				name: z.string().min(1),
				appName: z.string().min(1),
				appCategory: z.string().default("Banking"),
				platform: z.enum(["ios", "web"]).default("ios"),
				description: z.string().optional(),
				status: z.enum(["draft", "published"]).default("draft"),
				appColor: z.string().default("#0075eb"),
				screens: z
					.array(
						z.object({
							id: z.string(),
							title: z.string(),
							imageUrl: z.string().optional(),
							screenType: z.string().optional(),
							subtitle: z.string().optional(),
						}),
					)
					.default([]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const flowRecord = {
				id: input.id,
				userId: ctx.session?.user?.id || input.userId,
				productId: input.productId,
				name: input.name,
				appName: input.appName,
				appCategory: input.appCategory,
				platform: input.platform,
				description: input.description,
				status: input.status,
				appColor: input.appColor,
				screensCount: input.screens.length,
			};

			await ctx.db.insert(userFlow).values(flowRecord);

			if (input.screens.length > 0) {
				for (const [i, s] of input.screens.entries()) {
					await ctx.db.insert(userFlowScreen).values({
						id: s.id,
						flowId: input.id,
						title: s.title,
						orderIndex: i,
						imageUrl: s.imageUrl,
						screenType: s.screenType || "generic-wireframe",
						subtitle: s.subtitle,
					});
				}
			}

			return { success: true, id: input.id };
		}),

	toggleStatus: publicProcedure
		.input(
			z.object({
				id: z.string(),
				status: z.enum(["draft", "published"]),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.update(userFlow)
				.set({
					status: input.status,
					updatedAt: new Date(),
				})
				.where(eq(userFlow.id, input.id));

			return { success: true, status: input.status };
		}),

	delete: publicProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db.delete(userFlow).where(eq(userFlow.id, input.id));
			return { success: true };
		}),
});
