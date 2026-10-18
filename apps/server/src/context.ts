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
				id: "UVWCTLP0yUdo8BbIkwlF1h25QzYPDvbK",
				name: "HBF Admin",
				email: "hbf@admin.com",
				emailVerified: true,
				image: null,
				createdAt: now,
				updatedAt: now,
			},
			session: {
				id: "demo-session",
				userId: "UVWCTLP0yUdo8BbIkwlF1h25QzYPDvbK",
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
