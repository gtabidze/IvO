# Codex project guide

## What this project is

Alignment (repo name `IvO`) is a prototype for browsing and evaluating product flows and screens. The web app includes a public landing page, a dashboard/feed, flow and product creation, usability review tools, and configurable AI agents. Some experiences use seeded or static demo content.

## Repository map

- `apps/web`: React 19, TanStack Start/Router, TanStack Query, Tailwind CSS 4. File routes are under `src/routes`; feature UI is under `src/components`.
- `apps/server`: Hono server on port 3000. Mounts Better Auth at `/api/auth/*`, tRPC at `/trpc/*`, and chat at `/api/chat`.
- `packages/api`: tRPC routers and business logic (`flow`, `agent`, `todo`). Add or change procedures here, then consume their inferred types in the web app.
- `packages/db`: Drizzle schema, migrations, and database setup for SQLite/libSQL.
- `packages/auth`: Better Auth setup.
- `packages/ui`: shared shadcn-style UI primitives and global design tokens.
- `packages/config`: shared TypeScript configuration.

## Data and authentication boundaries

- Dashboard demo flows are defined in `apps/web/src/data/dashboard-flows.ts`. Feed composition lives in `apps/web/src/lib/feed.ts` and `single-screens.ts`.
- User-created flows and products in the current dashboard are managed by `apps/web/src/lib/flow-store.ts` in browser `localStorage`; `flow-adapter.ts` converts them for dashboard display. The database-backed flow endpoints are separate in `packages/api/src/routers/flow.ts`. Check which path a feature actually uses before changing persistence or assuming data is shared across devices.
- Agent configuration, messages, and feedback use the database-backed API in `packages/api/src/routers/agent.ts` and server chat route. Web callers use the tRPC provider in `apps/web/src/router.tsx` and `useTRPC()`.
- Both `apps/web/src/routes/_auth/route.tsx` and `apps/server/src/context.ts` currently supply a demo session when no real session is available. Do not treat the `_auth` route or `protectedProcedure` as enforcing production access until this fallback is removed deliberately.
- The server seeds a demo user and example data at startup via `apps/server/src/seed.ts`. Avoid treating seeded records as user-owned production data.

## Local workflow

- Use pnpm (the root pins `pnpm@10.32.1`). Run commands from the repo root unless a package script or Varlock task requires its owning app directory.
- `pnpm install` installs dependencies and generates Varlock environment accessors.
- `pnpm run dev` starts web and server; web is at `http://localhost:3001`, API at `http://localhost:3000`.
- `pnpm run dev:web` and `pnpm run dev:server` start one app.
- `pnpm run check-types` runs the monorepo type checks; `pnpm run build` builds the apps.
- `pnpm exec biome check <changed paths>` checks formatting and lint without rewriting unrelated files. The root `pnpm run check` runs `biome check --write .`, so use it only when a repository-wide rewrite is intended.
- Database commands include `pnpm run db:push`, `db:generate`, `db:migrate`, and `db:studio`. Review schema and generated migration changes before applying them. `pnpm run db:seed` runs the demo seeder.

## Editing conventions

- Follow existing TypeScript, tab indentation, double quotes, and Biome configuration in `biome.json`.
- Keep shared primitives in `packages/ui`; put feature-specific components near the relevant web feature. Use the existing `@/` alias in the web app and `@IvO/*` workspace packages across package boundaries.
- Add web routes as TanStack file routes in `apps/web/src/routes`. `apps/web/src/routeTree.gen.ts` is generated and ignored; do not hand-edit it.
- Environment schemas are `apps/web/.env.schema`, `apps/server/.env.schema`, and `packages/db/.env.schema`. After schema changes, run `pnpm run env:generate`. Keep credentials in ignored env files; do not put secrets in source or this guide.
- For UI changes, verify the affected desktop and mobile states and any interactive behavior in a browser. For API or database changes, check the relevant caller and run focused type checks/builds. Report any checks that could not run.
- Preserve unrelated local edits. Inspect `git status` before editing and keep the final diff scoped to the requested work.
