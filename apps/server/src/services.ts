import { createAuth } from "@IvO/auth";
import { createDb } from "@IvO/db";

import { ENV } from "./env.server";

export const db = createDb(ENV);
export const auth = createAuth(ENV, db);
