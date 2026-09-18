import type { Session } from "@IvO/auth";
import type { Database } from "@IvO/db";

export type Context = {
	session: Session | null;
	db: Database;
};
