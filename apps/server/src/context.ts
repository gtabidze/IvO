import type { Context as ApiContext } from "@IvO/api/context";
import type { Context as HonoContext } from "hono";
import { auth, db } from "./services";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({
	context,
}: CreateContextOptions): Promise<ApiContext> {
	const session = await auth.api.getSession({
		headers: context.req.raw.headers,
	});
	if (session) {
		return {
			db,
			session,
		};
	}

	const now = new Date();
	return {
		db,
		session: {
			user: {
				id: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
				name: "Gio Tabidze",
				email: "gio@ivo.design",
				emailVerified: true,
				image: null,
				createdAt: now,
				updatedAt: now,
			},
			session: {
				id: "demo-session",
				userId: "AmwXd8NHlktMgGr6ncPlTr759JmWDJbo",
				token: "demo-token",
				expiresAt: new Date(now.getTime() + 86400000),
				createdAt: now,
				updatedAt: now,
				ipAddress: null,
				userAgent: null,
			},
		},
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
