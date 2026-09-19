import { relations, sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export const userProduct = sqliteTable(
	"user_product",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		category: text("category").notNull().default("Banking"),
		platform: text("platform", { enum: ["ios", "web"] })
			.notNull()
			.default("ios"),
		color: text("color").notNull().default("#0075eb"),
		description: text("description"),
		logoUrl: text("logo_url"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("user_product_userId_idx").on(table.userId),
	],
);

export const userFlow = sqliteTable(
	"user_flow",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		productId: text("product_id")
			.references(() => userProduct.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		appName: text("app_name").notNull(),
		appCategory: text("app_category").notNull().default("Banking"),
		platform: text("platform", { enum: ["ios", "web"] })
			.notNull()
			.default("ios"),
		description: text("description"),
		status: text("status", { enum: ["draft", "published"] })
			.notNull()
			.default("draft"),
		appColor: text("app_color").notNull().default("#0075eb"),
		screensCount: integer("screens_count").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("user_flow_userId_idx").on(table.userId),
		index("user_flow_productId_idx").on(table.productId),
		index("user_flow_status_idx").on(table.status),
	],
);

export const userFlowScreen = sqliteTable(
	"user_flow_screen",
	{
		id: text("id").primaryKey(),
		flowId: text("flow_id")
			.notNull()
			.references(() => userFlow.id, { onDelete: "cascade" }),
		title: text("title").notNull(),
		orderIndex: integer("order_index").notNull().default(0),
		imageUrl: text("image_url"),
		screenType: text("screen_type").default("generic-wireframe"),
		subtitle: text("subtitle"),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
	},
	(table) => [
		index("user_flow_screen_flowId_idx").on(table.flowId),
		index("user_flow_screen_order_idx").on(table.orderIndex),
	],
);

export const userProductRelations = relations(userProduct, ({ one, many }) => ({
	user: one(user, {
		fields: [userProduct.userId],
		references: [user.id],
	}),
	flows: many(userFlow),
}));

export const userFlowRelations = relations(userFlow, ({ one, many }) => ({
	user: one(user, {
		fields: [userFlow.userId],
		references: [user.id],
	}),
	product: one(userProduct, {
		fields: [userFlow.productId],
		references: [userProduct.id],
	}),
	screens: many(userFlowScreen),
}));

export const userFlowScreenRelations = relations(userFlowScreen, ({ one }) => ({
	flow: one(userFlow, {
		fields: [userFlowScreen.flowId],
		references: [userFlow.id],
	}),
}));

export type UserProduct = typeof userProduct.$inferSelect;
export type InsertUserProduct = typeof userProduct.$inferInsert;
export type UserFlow = typeof userFlow.$inferSelect;
export type InsertUserFlow = typeof userFlow.$inferInsert;
export type UserFlowScreen = typeof userFlowScreen.$inferSelect;
export type InsertUserFlowScreen = typeof userFlowScreen.$inferInsert;
