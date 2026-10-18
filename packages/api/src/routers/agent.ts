import {
	agent,
	flowAgentFeedback,
	flowAgentMessage,
} from "@IvO/db/schema/agents";
import { TRPCError } from "@trpc/server";
import { and, asc, eq } from "drizzle-orm";
import z from "zod";
import { KNOWN_CONNECTORS } from "../agents/defaults";
import { listAgents, resetBuiltinAgent } from "../agents/service";
import { protectedProcedure, router } from "../index";

const slugSchema = z
	.string()
	.min(2)
	.max(40)
	.regex(/^[a-z0-9_-]+$/, "Use lowercase letters, numbers, - or _");

const agentFields = {
	name: z.string().min(1).max(80),
	emoji: z.string().min(1).max(16),
	competence: z.string().min(1).max(160),
	systemPrompt: z.string().min(1).max(8000),
	model: z.string().max(100).nullable().optional(),
	skills: z
		.array(
			z.object({
				name: z.string().min(1).max(80),
				description: z.string().max(400),
			}),
		)
		.max(30),
	connectors: z
		.array(z.object({ type: z.string().max(80), enabled: z.boolean() }))
		.max(40),
	enabled: z.boolean(),
};

export const agentRouter = router({
	list: protectedProcedure.query(({ ctx }) =>
		listAgents(ctx.db, ctx.session.user.id),
	),

	connectors: protectedProcedure.query(() => KNOWN_CONNECTORS),

	create: protectedProcedure
		.input(z.object({ slug: slugSchema, ...agentFields }))
		.mutation(async ({ ctx, input }) => {
			const existing = await listAgents(ctx.db, ctx.session.user.id);
			let finalSlug = input.slug;
			let counter = 2;
			while (existing.some((a) => a.slug === finalSlug)) {
				finalSlug = `${input.slug.slice(0, 32)}-${counter}`;
				counter++;
			}
			const [row] = await ctx.db
				.insert(agent)
				.values({
					...input,
					slug: finalSlug,
					id: crypto.randomUUID(),
					userId: ctx.session.user.id,
					sortOrder: existing.length,
				})
				.returning();
			return row;
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				data: z.object(agentFields).partial(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.update(agent)
				.set(input.data)
				.where(
					and(eq(agent.id, input.id), eq(agent.userId, ctx.session.user.id)),
				)
				.returning();
			if (!row) throw new TRPCError({ code: "NOT_FOUND" });
			return row;
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const [row] = await ctx.db
				.select()
				.from(agent)
				.where(
					and(eq(agent.id, input.id), eq(agent.userId, ctx.session.user.id)),
				);
			if (!row) throw new TRPCError({ code: "NOT_FOUND" });
			if (row.builtinKey) {
				throw new TRPCError({
					code: "BAD_REQUEST",
					message: "Built-in agents can be disabled but not deleted",
				});
			}
			await ctx.db.delete(agent).where(eq(agent.id, input.id));
			return { ok: true };
		}),

	reset: protectedProcedure
		.input(z.object({ id: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const row = await resetBuiltinAgent(
				ctx.db,
				ctx.session.user.id,
				input.id,
			);
			if (!row) throw new TRPCError({ code: "NOT_FOUND" });
			return row;
		}),

	messages: protectedProcedure
		.input(z.object({ flowId: z.string() }))
		.query(({ ctx, input }) =>
			ctx.db
				.select()
				.from(flowAgentMessage)
				.where(
					and(
						eq(flowAgentMessage.userId, ctx.session.user.id),
						eq(flowAgentMessage.flowId, input.flowId),
					),
				)
				.orderBy(asc(flowAgentMessage.createdAt)),
		),

	clearMessages: protectedProcedure
		.input(z.object({ flowId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(flowAgentMessage)
				.where(
					and(
						eq(flowAgentMessage.userId, ctx.session.user.id),
						eq(flowAgentMessage.flowId, input.flowId),
					),
				);
			return { ok: true };
		}),

	feedback: protectedProcedure
		.input(z.object({ flowId: z.string() }))
		.query(({ ctx, input }) =>
			ctx.db
				.select()
				.from(flowAgentFeedback)
				.where(
					and(
						eq(flowAgentFeedback.userId, ctx.session.user.id),
						eq(flowAgentFeedback.flowId, input.flowId),
					),
				),
		),
});
