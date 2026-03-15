# ContractSense — Agent Constitution (Style Guide)

> **You must read this file at the start of every working session. These rules are non-negotiable.**

---

## 1. General Principles

- **Read before you write.** Always read `PROJECT_STATE.md` and `API_MOCK_DATA.json` before modifying any file.
- **Plan before you execute.** Propose an implementation plan (what you'll add/change and why) before touching any code.
- **Never assume state from memory.** Always check `PROJECT_STATE.md` for the current task, decisions, and progress.
- **Small, atomic commits.** Each task should be one logical unit. Don't mix unrelated changes.

---

## 2. Code Style

### TypeScript (Frontend + Core API)
- **Strict mode enabled** — `"strict": true` in all `tsconfig.json` files.
- **No `any` types** — use `unknown` and narrow, or define proper types in `packages/types`.
- **Named exports only** — no default exports except for Next.js page components.
- **Interfaces over types** for object shapes; `type` for unions and primitives.
- **Async/await** over raw Promises and `.then()` chains.
- **Error handling**: always use try/catch in async functions; never swallow errors silently.
- **File naming**: `camelCase.ts` for utilities/services; `PascalCase.tsx` for React components.
- **Import order**: 1) Node builtins, 2) external packages, 3) internal `@contractsense/*`, 4) relative imports.

### Python (AI Backend)
- **Python 3.11+** features allowed (match/case, tomllib, etc.).
- **Type annotations everywhere** — every function must have full type hints.
- **Pydantic `BaseSettings`** for all environment variables — never `os.environ` directly.
- **Async FastAPI** routes — use `async def` for all route handlers.
- **Ruff** for linting; **Black** for formatting (line length: 100).
- **File naming**: `snake_case.py` for all Python files.

### CSS / Styling
- **Tailwind CSS** utility classes — no custom CSS files unless absolutely necessary.
- **Shadcn/UI** components — customise via `className` prop, not internal style overrides.
- **Responsive first** — mobile layout must work, then tablet, then desktop.
- **Dark mode**: ContractSense uses a dark-first design. Use `dark:` variants.

---

## 3. API Contract

- **All API responses must use the envelope format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "error": null,
    "meta": { "timestamp": "...", "requestId": "..." }
  }
  ```
- **Error responses:**
  ```json
  {
    "success": false,
    "data": null,
    "error": { "code": "VALIDATION_ERROR", "message": "...", "details": [] },
    "meta": { "timestamp": "...", "requestId": "..." }
  }
  ```
- **HTTP status codes**:
  - `200` — Success
  - `201` — Created
  - `400` — Validation error
  - `401` — Unauthenticated
  - `403` — Forbidden (wrong role)
  - `404` — Not found
  - `409` — Conflict (duplicate)
  - `422` — Unprocessable entity
  - `500` — Internal server error

---

## 4. Authentication & Authorisation

- **JWT-based auth** — access token (15 min), refresh token (7 days), stored in httpOnly cookies.
- **Role system**: `user | lawyer | admin` — every protected route must check role.
- **Middleware chain**: `authenticate → authorise(role) → handler`
- Never skip role guards on any protected endpoint.
- The `admin` role bypasses all other role checks.

---

## 5. Security Rules

- **Never hardcode secrets.** Use `process.env` (Node) or Pydantic `BaseSettings` (Python).
- **Never commit `.env` files.** Always use `.env.example` with placeholder values.
- **Validate all file uploads**: MIME type must be `application/pdf` or `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; max 20 MB.
- **Input sanitisation**: validate all request bodies with Zod (Node) or Pydantic (Python).
- **SQL injection**: Prisma ORM only — no raw SQL unless absolutely necessary and parameterised.
- **Rate limiting**: all public endpoints must be rate-limited (express-rate-limit / slowapi).
- **CORS**: only allow origins defined in `CORS_ORIGINS` env variable.

---

## 6. Service Boundaries

| Service | Allowed to call OpenAI? | Allowed to call Scraper? | Database access |
|---|---|---|---|
| `apps/web` | ❌ | ❌ | None (API only) |
| `apps/core-api` | ❌ | ❌ | PostgreSQL (Prisma) |
| `apps/ai-backend` | ✅ | ✅ | MongoDB (Mongoose) + PostgreSQL callback |

- **Only `apps/ai-backend` may call the OpenAI API.** Any OpenAI call in `core-api` or `web` is a critical violation.
- Core API triggers AI work by **publishing a job to Redis** — it never calls the AI backend HTTP API directly during analysis.
- The AI backend calls back to Core API via `POST /api/core/contracts/:id/callback` when analysis is complete.

---

## 7. File Storage

- All uploaded contracts are stored in **MinIO** (S3-compatible).
- Bucket: `contracts` — files keyed as `uploads/{userId}/{contractId}.{ext}`
- Sealed PDFs keyed as `sealed/{contractId}/sealed_report.pdf`
- Never store file contents in PostgreSQL or MongoDB — store the MinIO object key only.

---

## 8. Background Jobs

- All heavy processing (PDF parsing, LLM chains, scraping) runs via **Celery** workers.
- **Never block the FastAPI event loop** with synchronous heavy work.
- Celery broker: **Redis** (`REDIS_URL` env var).
- Celery result backend: **Redis**.
- Monitor Celery tasks via **Flower** on port 5555.

---

## 9. Trust Seal Rules

- A Trust Seal is generated **only** after a lawyer signs off on a review.
- The seal is a SHA-256 hash of: `contractId + lawyerId + timestamp + reportHash`
- The seal hash is stored in PostgreSQL in the `TrustSeal` table.
- The sealed PDF is stored in MinIO and linked from the TrustSeal record.
- A seal can be verified publicly at `GET /api/core/seals/:hash/verify` — no auth required.

---

## 10. Project Memory Rules

- **After every completed task**, update `PROJECT_STATE.md`:
  - Move the task from `🚧 In Progress` to `✅ Completed`
  - Add any architectural decisions made
  - Add any new environment variables introduced
- **After every new schema or endpoint**, update `API_MOCK_DATA.json`.
- **Never mark a task complete** unless lint and type-check pass.

---

## 11. Lint & Type-Check Commands

```bash
# From monorepo root:
npm run lint          # runs ESLint across all workspaces
npm run type-check    # runs tsc --noEmit across all workspaces

# Python (from apps/ai-backend):
ruff check .
black --check .
mypy app/
```

---

## 12. Commit Message Format

```
<type>(<scope>): <short description>

Types: feat | fix | chore | refactor | docs | test | ci
Scopes: web | core-api | ai-backend | types | db | infra

Examples:
feat(core-api): add JWT refresh token rotation
fix(web): resolve hydration mismatch on contract report page
chore(infra): update docker-compose nginx config
```
