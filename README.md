# Koro

A TypeScript monorepo for an auth-backed web app: a Next.js frontend, an Express
API that exposes a tRPC + OpenAPI surface, and shared packages for the database
(Drizzle), services, logging, and config.

## Stack

- **Monorepo:** [Turborepo](https://turbo.build) + [pnpm](https://pnpm.io) workspaces
- **Web:** Next.js (`apps/web`) on port `3000`
- **API:** Express + [tRPC](https://trpc.io), auto-generated OpenAPI docs via
  [trpc-to-openapi](https://github.com/mcampa/trpc-to-openapi) and a
  [Scalar](https://scalar.com) reference (`apps/api`) on port `8000`
- **Database:** Postgres (Neon) via [Drizzle ORM](https://orm.drizzle.team) (`packages/database`)
- **Auth:** JWT in an httpOnly cookie; passwords hashed with argon2id

## Layout

```
apps/
  api/         Express server: tRPC + OpenAPI + Scalar docs
  web/         Next.js frontend
packages/
  database/    Drizzle schema, client, migrations
  services/    Business logic (user auth: hashing, tokens)
  trpc/        tRPC router, context, procedures, client
  logger/      Shared logger
  eslint-config/, typescript-config/   Shared config
```

## Prerequisites

- **Node.js** >= 20
- **pnpm** — managed via Corepack (pinned to `pnpm@9.15.9` in `package.json`)
- A **Postgres** database (e.g. a [Neon](https://neon.tech) project)

### Enabling pnpm via Corepack

This repo pins its package manager with the `packageManager` field, so you don't
install pnpm globally — Corepack (bundled with Node) provisions the exact version:

```bash
corepack enable          # one-time: activates the corepack shims
corepack install         # provisions pnpm@9.15.9 as pinned in package.json
pnpm -v                  # should print 9.15.9
```

If Corepack is out of date and refuses to fetch the pinned version, update it
first: `npm install -g corepack@latest && corepack enable`.

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Configure environment
cp .env.example .env     # then fill in DATABASE_URL, JWT_SECRET, etc.

# 3. Create the database schema
pnpm db:generate         # generate SQL migrations from the Drizzle schema
pnpm db:migrate          # apply migrations to DATABASE_URL
```

See [.env.example](.env.example) for the full list of variables. The key ones:

| Variable              | Used by         | Description                                |
| --------------------- | --------------- | ------------------------------------------ |
| `DATABASE_URL`        | database        | Postgres/Neon connection string            |
| `JWT_SECRET`          | services        | Secret for signing/verifying JWT tokens    |
| `BASE_URL`            | api             | Public base URL of the API (OpenAPI/docs)  |
| `NODE_ENV`            | api, cookies    | `development` \| `prod`                     |
| `NEXT_PUBLIC_API_URL` | web             | API tRPC endpoint the browser calls (`…/trpc`) |

## Development

```bash
pnpm dev                 # runs all apps (web + api) via Turborepo
```

Local URLs:

| What            | URL                                  |
| --------------- | ------------------------------------ |
| Web app         | http://localhost:3000                |
| API root        | http://localhost:8000                |
| Health check    | http://localhost:8000/health         |
| API docs (Scalar) | http://localhost:8000/docs         |
| OpenAPI spec    | http://localhost:8000/openapi.json   |
| REST endpoints  | http://localhost:8000/api            |
| tRPC endpoint   | http://localhost:8000/trpc           |

## Common scripts

| Command                          | Description                              |
| -------------------------------- | ---------------------------------------- |
| `pnpm dev`                       | Run all apps in dev mode                 |
| `pnpm build`                     | Build all apps and packages              |
| `pnpm lint`                      | Lint via Turborepo                       |
| `pnpm check-types`               | Type-check via Turborepo                 |
| `pnpm format`                    | Prettier across the repo                 |
| `pnpm db:generate`               | Generate Drizzle migrations              |
| `pnpm db:migrate`                | Apply Drizzle migrations                 |
| `pnpm --filter @repo/services test` | Run the service-layer test suite      |

## Authentication

- Passwords are hashed with **argon2id** (`packages/services/user/password.ts`).
  Legacy HMAC-SHA256 hashes are still verified and transparently upgraded on the
  next successful login.
- Sign-in/sign-up issue a JWT (7-day expiry, scoped issuer/audience) stored in an
  httpOnly, `sameSite=strict` cookie. The `secure` flag is enabled only outside
  development so localhost over HTTP works.
- tRPC exposes `publicProcedure` and `protectedProcedure`; protected routes
  require an authenticated `ctx.user`.
