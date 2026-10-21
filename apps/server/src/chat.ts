import { listAgents } from "@IvO/api/agents/service";
import type { Agent } from "@IvO/db/schema/agents";
import { flowAgentFeedback, flowAgentMessage } from "@IvO/db/schema/agents";
import { generateText, streamText } from "ai";
import { and, desc, eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { auth, db } from "./services";

const DEFAULT_MODEL = () =>
	process.env.AI_MODEL || "anthropic/claude-sonnet-4.5";

type Env = { Variables: { userId: string } };

export const chatRoute = new Hono<Env>();

chatRoute.use("*", async (c, next) => {
	const session = await auth.api.getSession({ headers: c.req.raw.headers });
	c.set("userId", session?.user?.id || "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo");
	await next();
});

function systemFor(agent: Agent, context: string, team: Agent[]) {
	const connectors = new Set(
		agent.connectors.filter((x) => x.enabled).map((x) => x.type),
	);
	const skills = agent.skills.length
		? `\n\nYour skills:\n${agent.skills.map((s) => `- ${s.name}: ${s.description}`).join("\n")}`
		: "";
	const ctx = connectors.has("flow-telemetry")
		? `\n\nFlow context:\n${context}`
		: "";
	const mates = team
		.filter((t) => t.id !== agent.id)
		.map((t) => `${t.name} (${t.competence})`)
		.join(", ");
	return `You are ${agent.name} ${agent.emoji}, specialist in ${agent.competence}.\n${agent.systemPrompt}${skills}${ctx}\n\nTeammates: ${mates || "none"}. Do not speak for them.`;
}

/** Extracts @handles that match enabled agents. */
export function parseMentions(text: string, agents: Agent[]) {
	const handles = new Set(
		[...text.matchAll(/@([a-z0-9_-]+)/gi)].map((m) => m[1]?.toLowerCase()),
	);
	return agents.filter((a) => handles.has(a.slug));
}

const feedbackSchema = z.object({
	flowId: z.string().min(1).max(200),
	agentId: z.string(),
	context: z.string().max(8000),
	force: z.boolean().optional(),
});

/** Cached per-agent review for a flow; generated on first request. */
chatRoute.post("/feedback", async (c) => {
	const userId = c.get("userId");
	const parsed = feedbackSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
	const { flowId, agentId, context, force } = parsed.data;

	const agents = await listAgents(db, userId);
	const agent = agents.find((a) => a.id === agentId);
	if (!agent) return c.json({ error: "Agent not found" }, 404);

	if (!force) {
		const [cached] = await db
			.select()
			.from(flowAgentFeedback)
			.where(
				and(
					eq(flowAgentFeedback.userId, userId),
					eq(flowAgentFeedback.flowId, flowId),
					eq(flowAgentFeedback.agentId, agentId),
				),
			);
		if (cached) return c.json({ content: cached.content, cached: true });
	}

	const { text } = await generateText({
		model: agent.model || DEFAULT_MODEL(),
		system: systemFor(agent, context, agents),
		prompt:
			"Give your top 3 findings on this flow from your specialty, most important first. Each finding: one bold headline + one sentence.",
	});

	await db
		.insert(flowAgentFeedback)
		.values({ id: crypto.randomUUID(), userId, flowId, agentId, content: text })
		.onConflictDoUpdate({
			target: [
				flowAgentFeedback.userId,
				flowAgentFeedback.flowId,
				flowAgentFeedback.agentId,
			],
			set: { content: text, createdAt: new Date() },
		});
	return c.json({ content: text, cached: false });
});

const chatSchema = z.object({
	flowId: z.string().min(1).max(200),
	message: z.string().min(1).max(4000),
	context: z.string().max(8000),
});

/**
 * Posts a user message and streams replies as NDJSON events:
 * {type:"agents", agentIds}, {type:"delta", agentId, text},
 * {type:"done", agentId}, {type:"error", agentId}
 */
chatRoute.post("/", async (c) => {
	const userId = c.get("userId");
	const parsed = chatSchema.safeParse(await c.req.json().catch(() => null));
	if (!parsed.success) return c.json({ error: "Invalid request" }, 400);
	const { flowId, message, context } = parsed.data;

	const agents = await listAgents(db, userId);
	const enabled = agents.filter((a) => a.enabled);
	const mentioned = parseMentions(message, enabled);
	const targets = mentioned.length ? mentioned : enabled;
	if (targets.length === 0) {
		return c.json({ error: "No enabled agents" }, 400);
	}

	await db.insert(flowAgentMessage).values({
		id: crypto.randomUUID(),
		userId,
		flowId,
		role: "user",
		content: message,
		mentions: mentioned.map((a) => a.id),
	});

	const historyRows = (
		await db
			.select()
			.from(flowAgentMessage)
			.where(
				and(
					eq(flowAgentMessage.userId, userId),
					eq(flowAgentMessage.flowId, flowId),
				),
			)
			.orderBy(desc(flowAgentMessage.createdAt))
			.limit(20)
	).reverse();
	const byId = new Map(agents.map((a) => [a.id, a]));

	const historyFor = (agent: Agent) =>
		historyRows.map((m) => {
			if (m.role === "user") {
				return { role: "user" as const, content: m.content };
			}
			if (m.agentId === agent.id) {
				return { role: "assistant" as const, content: m.content };
			}
			const other = m.agentId ? byId.get(m.agentId) : undefined;
			return {
				role: "user" as const,
				content: `[${other?.name ?? "Teammate"} said]: ${m.content}`,
			};
		});

	const encoder = new TextEncoder();
	const stream = new ReadableStream({
		async start(controller) {
			const send = (obj: unknown) =>
				controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
			send({ type: "agents", agentIds: targets.map((a) => a.id) });

			await Promise.all(
				targets.map(async (agent) => {
					try {
						if (flowId === "monzo-order-card" && agent.slug === "researcher") {
							const mockReply =
								"I have set up the usability test session for this flow and will share the results here and in Slack once I have enough results.";
							await new Promise((r) => setTimeout(r, 350));
							for (const word of mockReply.split(/(?<=\s)/)) {
								send({ type: "delta", agentId: agent.id, text: word });
								await new Promise((r) => setTimeout(r, 35));
							}
							await db.insert(flowAgentMessage).values({
								id: crypto.randomUUID(),
								userId,
								flowId,
								role: "agent",
								agentId: agent.id,
								content: mockReply,
							});
							send({ type: "done", agentId: agent.id });
							return;
						}

						const result = streamText({
							model: agent.model || DEFAULT_MODEL(),
							system: systemFor(agent, context, agents),
							messages: historyFor(agent),
						});
						let full = "";
						for await (const delta of result.textStream) {
							full += delta;
							send({ type: "delta", agentId: agent.id, text: delta });
						}
						await db.insert(flowAgentMessage).values({
							id: crypto.randomUUID(),
							userId,
							flowId,
							role: "agent",
							agentId: agent.id,
							content: full,
						});
						send({ type: "done", agentId: agent.id });
					} catch {
						send({ type: "error", agentId: agent.id });
					}
				}),
			);
			controller.close();
		},
	});

	return new Response(stream, {
		headers: { "Content-Type": "application/x-ndjson; charset=utf-8" },
	});
});
