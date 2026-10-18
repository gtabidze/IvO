import { protectedProcedure, publicProcedure, router } from "../index";
import { agentRouter } from "./agent";
import { flowRouter } from "./flow";
import { todoRouter } from "./todo";

export const appRouter = router({
	healthCheck: publicProcedure.query(() => {
		return "OK";
	}),
	privateData: protectedProcedure.query(({ ctx }) => {
		return {
			message: "This is private",
			user: ctx.session.user,
		};
	}),
	todo: todoRouter,
	flow: flowRouter,
	agent: agentRouter,
});
export type AppRouter = typeof appRouter;
