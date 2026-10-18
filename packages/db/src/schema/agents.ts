import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { user } from "./auth";

export type AgentSkill = { name: string; description: string };
export type AgentConnector = { type: string; enabled: boolean };

const now = sql`(cast(unixepoch('subsecond') * 1000 as integer))`;

export const agent = sqliteTable(
	"agent",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		/** Mention handle, e.g. "heuristic" for @heuristic */
		slug: text("slug").notNull(),
		name: text("name").notNull(),
		emoji: text("emoji").notNull(),
		competence: text("competence").notNull(),
		systemPrompt: text("system_prompt").notNull(),
		model: text("model"),
		skills: text("skills", { mode: "json" })
			.$type<AgentSkill[]>()
			.notNull()
			.default(sql`'[]'`),
		connectors: text("connectors", { mode: "json" })
			.$type<AgentConnector[]>()
			.notNull()
			.default(sql`'[]'`),
		enabled: integer("enabled", { mode: "boolean" }).notNull().default(true),
		/** Key of the built-in template this agent was seeded from */
		builtinKey: text("builtin_key"),
		sortOrder: integer("sort_order").notNull().default(0),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(now)
			.notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp_ms" })
			.default(now)
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("agent_userId_idx").on(table.userId),
		uniqueIndex("agent_user_slug_idx").on(table.userId, table.slug),
	],
);

export const flowAgentMessage = sqliteTable(
	"flow_agent_message",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		flowId: text("flow_id").notNull(),
		role: text("role", { enum: ["user", "agent"] }).notNull(),
		agentId: text("agent_id").references(() => agent.id, {
			onDelete: "set null",
		}),
		content: text("content").notNull(),
		mentions: text("mentions", { mode: "json" })
			.$type<string[]>()
			.notNull()
			.default(sql`'[]'`),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(now)
			.notNull(),
	},
	(table) => [index("flow_agent_message_idx").on(table.userId, table.flowId)],
);

export const flowAgentFeedback = sqliteTable(
	"flow_agent_feedback",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		flowId: text("flow_id").notNull(),
		agentId: text("agent_id")
			.notNull()
			.references(() => agent.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: integer("created_at", { mode: "timestamp_ms" })
			.default(now)
			.notNull(),
	},
	(table) => [
		uniqueIndex("flow_agent_feedback_uq").on(
			table.userId,
			table.flowId,
			table.agentId,
		),
	],
);

export const agentRelations = relations(agent, ({ one }) => ({
	user: one(user, { fields: [agent.userId], references: [user.id] }),
}));

export type Agent = typeof agent.$inferSelect;
export type InsertAgent = typeof agent.$inferInsert;
