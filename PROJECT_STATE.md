# ContractSense — Project State

> **Last updated:** 2026-03-15  
> **Agent:** Antigravity  
> **Session:** #2 — Frontend Run + Project Sync

---

## Current Sprint Goal

Wire the real Core API into the frontend auth flow and implement the first end-to-end feature: contract upload → Celery analysis → report display.

---

## Task Status

### ✅ Completed

| ID | Task | Session | Notes |
|---|---|---|---|
| `INIT-01` | Create `.agents/rules/style-guide.md` | #1 | Agent constitution |
| `INIT-02` | Create `PROJECT_STATE.md` | #1 | This file |
| `INIT-03` | Create `API_MOCK_DATA.json` | #1 | Full data contract |
| `INIT-04` | Create root `package.json` + `turbo.json` | #1 | Turborepo monorepo |
| `INIT-05` | Create `.env.example` | #1 | All env vars documented |
| `INIT-06` | Create `packages/types` | #1 | Shared TS types |
| `INIT-07` | Create `packages/db` | #1 | Prisma schema |
| `INIT-08` | Scaffold `apps/core-api` | #1 | Node.js + Express skeleton |
| `INIT-09` | Scaffold `apps/ai-backend` | #1 | Python + FastAPI + Celery skeleton |
| `INIT-10` | Scaffold `apps/web` | #1 | Next.js 14 App Router skeleton |
| `INIT-11` | Create `docker-compose.yml` | #1 | Full stack orchestration |
| `INIT-12` | Create `infrastructure/nginx/nginx.conf` | #1 | Reverse proxy |
| `RUN-01` | Run frontend locally | #2 | Installed deps to `/tmp` (macOS provenance workaround); all 8 pages render |
| `RUN-02` | Fix `@apply dark` CSS bug | #2 | `dark` is a Tailwind variant, not a class; removed from globals.css |
| `RUN-03` | Fix non-existent `@radix-ui/react-badge` | #2 | Package doesn't exist on npm; removed from `package.json` |
| `RUN-04` | Resolve README.md merge conflict | #2 | Cleaned up git conflict markers; added Known Gotchas section |

### 🚧 In Progress

*(none)*

### 📋 Backlog

| ID | Task | Priority | Depends On |
|---|---|---|---|
| `FEAT-01` | Wire auth forms → Core API (login/register/refresh) | P0 | Docker |
| `FEAT-02` | Contract upload UI + Core API MinIO storage | P0 | FEAT-01 |
| `FEAT-03` | Redis job queue: Core API → Celery worker | P0 | FEAT-02 |
| `FEAT-04` | PDF parser service end-to-end test | P0 | Docker |
| `FEAT-05` | LangChain chain integration test | P0 | FEAT-04 |
| `FEAT-06` | Risk classifier end-to-end | P0 | FEAT-05 |
| `FEAT-07` | Counter-clause generator live | P0 | FEAT-05 |
| `FEAT-08` | Party Intelligence (Playwright scraper) | P1 | Docker |
| `FEAT-09` | Celery worker full pipeline test | P0 | FEAT-03 |
| `FEAT-10` | MongoDB analysis storage + retrieval | P0 | FEAT-09 |
| `FEAT-11` | Trust Seal generation + verification endpoint | P1 | FEAT-10 |
| `FEAT-12` | Stripe payment flow + webhook | P1 | FEAT-01 |
| `FEAT-13` | Lawyer marketplace hire flow (end-to-end) | P1 | FEAT-12 |
| `FEAT-14` | Connect frontend auth pages to NextAuth + Core API | **P0 — NEXT** | FEAT-01 |
| `FEAT-15` | Dashboard: load real contracts from Core API | P0 | FEAT-14 |
| `FEAT-16` | Contract upload page + progress indicator | P0 | FEAT-15 |
| `FEAT-17` | Report page: load real analysis from MongoDB | P0 | FEAT-10 |
| `FEAT-18` | Outcome Simulator: connect to ai-backend /chat | P1 | FEAT-17 |
| `FEAT-19` | Party Intelligence: connect to ai-backend /party-intelligence | P1 | FEAT-17 |
| `FEAT-20` | Lawyer marketplace: connect hire flow to Stripe | P1 | FEAT-12 |
| `FEAT-21` | Lawyer dashboard + review submission UI | P1 | FEAT-20 |
| `FEAT-22` | Trust Seal display + PDF download | P1 | FEAT-11 |
| `FEAT-23` | Admin panel — lawyer verification | P2 | FEAT-21 |
| `FEAT-24` | Run Prisma migrations + seed data | P0 | Docker |
| `FEAT-25` | End-to-end integration tests | P2 | All FEAT |

---

## Architectural Decisions

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-15 | Use Turborepo for monorepo orchestration | Caching + parallel builds across workspaces |
| 2026-03-15 | PostgreSQL via Prisma for structured data | Strong relations: users, contracts, payments, seals |
| 2026-03-15 | MongoDB for AI analysis blobs | Flexible schema for varying clause structures |
| 2026-03-15 | Redis as Celery broker + cache | Simple, fast, dual-purpose |
| 2026-03-15 | MinIO for file storage | S3-compatible, self-hosted, no vendor lock-in |
| 2026-03-15 | JWT in Authorization header | Prevents XSS; refresh token rotation for security |
| 2026-03-15 | Nginx as single entry point | Single external port; clean path-based routing |
| 2026-03-15 | Radix UI + Tailwind for frontend | Accessible, composable, dark-mode first (no @radix-ui/react-badge — doesn't exist) |
| 2026-03-15 | Celery over Bull/BullMQ | Python-native; shares process with FastAPI workers |
| 2026-03-15 | Trust Seal = SHA-256(contractId+lawyerId+ts+reportHash) | Tamper-evident; verifiable without database lookup |
| 2026-03-15 | Install frontend in /tmp for local dev | macOS com.apple.provenance xattr blocks npm writes in contractSense/ root |

---

## Environment Variables Introduced

| Variable | Service | Purpose |
|---|---|---|
| `DATABASE_URL` | core-api | PostgreSQL connection string |
| `JWT_SECRET` | core-api | JWT signing secret |
| `JWT_REFRESH_SECRET` | core-api | Refresh token signing secret |
| `REDIS_URL` | core-api, ai-backend | Redis connection URL |
| `S3_ENDPOINT` | core-api | MinIO endpoint |
| `S3_ACCESS_KEY` | core-api | MinIO access key |
| `S3_SECRET_KEY` | core-api | MinIO secret key |
| `S3_BUCKET` | core-api | MinIO bucket name |
| `STRIPE_SECRET_KEY` | core-api | Stripe API key |
| `STRIPE_WEBHOOK_SECRET` | core-api | Stripe webhook signature secret |
| `OPENAI_API_KEY` | ai-backend | OpenAI API key |
| `MONGODB_URI` | ai-backend | MongoDB connection string |
| `CORE_API_CALLBACK_URL` | ai-backend | URL to call back when analysis is done |
| `INTERNAL_CALLBACK_SECRET` | core-api, ai-backend | Shared secret for internal service callbacks |
| `NEXT_PUBLIC_API_URL` | web | Public URL of core-api |
| `NEXTAUTH_SECRET` | web | NextAuth JWT secret |
| `NEXTAUTH_URL` | web | NextAuth canonical URL |
| `MINIO_ROOT_USER` | infra | MinIO admin username |
| `MINIO_ROOT_PASSWORD` | infra | MinIO admin password |
| `CORS_ORIGINS` | core-api | Allowed CORS origins |

---

## Known Issues / Gotchas

| Issue | Status | Fix |
|---|---|---|
| `npm install` EPERM in `contractSense/node_modules` | ⚠️ Persistent | macOS `com.apple.provenance` xattr; install in `/tmp` instead |
| `@radix-ui/react-badge` doesn't exist on npm | ✅ Fixed | Removed from `package.json`; use Tailwind classes |
| `@apply dark` in globals.css breaks Tailwind build | ✅ Fixed | `dark` is a Tailwind variant; use `class="dark"` on `<html>` |
| Docker not installed on dev machine | ⚠️ Open | Full stack (databases, AI) needs Docker; frontend-only works without it |

---

## Notes for Next Session

1. **Install Docker Desktop** to run the full stack (`docker-compose up --build`).
2. **Start with `FEAT-24`** — run `prisma migrate dev` to create all database tables.
3. **Then tackle `FEAT-14`** — wire the login/register forms to NextAuth credentials provider → Core API.
4. All frontend pages currently use **mock data** — they are visually complete and can be wired up to real APIs one page at a time.
5. The `INTERNAL_CALLBACK_SECRET` env var was added in Session #2 and must be added to `.env` before running.
