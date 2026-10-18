import type { Database } from "@IvO/db";
import { agent } from "@IvO/db/schema/agents";
import { user } from "@IvO/db/schema/auth";
import { and, asc, eq } from "drizzle-orm";
import { BUILTIN_AGENTS, type BuiltinAgent } from "./defaults";

function rowFromBuiltin(userId: string, b: BuiltinAgent, sortOrder: number) {
	return {
		id: crypto.randomUUID(),
		userId,
		slug: b.slug,
		name: b.name,
		emoji: b.emoji,
		competence: b.competence,
		systemPrompt: b.systemPrompt,
		skills: b.skills,
		connectors: b.connectors,
		builtinKey: b.key,
		sortOrder,
	};
}

/** Lists the user's agents, seeding the built-in team on first use. */
export async function listAgents(db: Database, userId: string) {
	const existing = await db
		.select()
		.from(agent)
		.where(eq(agent.userId, userId))
		.orderBy(asc(agent.sortOrder), asc(agent.createdAt));
	if (existing.length > 0) return existing;

	await db
		.insert(user)
		.values({
			id: userId,
			name: "Gio Tabidze",
			email: `${userId}@ivo.design`,
			emailVerified: true,
		})
		.onConflictDoNothing();

	await db
		.insert(agent)
		.values(BUILTIN_AGENTS.map((b, i) => rowFromBuiltin(userId, b, i)))
		.onConflictDoNothing();
	return db
		.select()
		.from(agent)
		.where(eq(agent.userId, userId))
		.orderBy(asc(agent.sortOrder), asc(agent.createdAt));
}

export async function resetBuiltinAgent(
	db: Database,
	userId: string,
	agentId: string,
) {
	const [row] = await db
		.select()
		.from(agent)
		.where(and(eq(agent.id, agentId), eq(agent.userId, userId)));
	const tpl = BUILTIN_AGENTS.find((b) => b.key === row?.builtinKey);
	if (!row || !tpl) return null;
	const [updated] = await db
		.update(agent)
		.set({
			name: tpl.name,
			emoji: tpl.emoji,
			competence: tpl.competence,
			systemPrompt: tpl.systemPrompt,
			skills: tpl.skills,
			connectors: tpl.connectors,
			model: null,
			enabled: true,
		})
		.where(eq(agent.id, agentId))
		.returning();
	return updated;
}
