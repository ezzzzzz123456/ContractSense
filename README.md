# ContractSense

> AI-powered legal contract analysis and verified lawyer marketplace.

---

## What is ContractSense?

ContractSense is a full-stack platform that:
1. **Analyses contracts** with AI — every clause explained in plain English, risk flags (🔴🟡🟢), counter-clauses, and future risk predictions
2. **Researches counterparties** via Playwright web scraping + LLM synthesis (trust score, reputation, red flags)
3. **Provides a lawyer marketplace** — browse verified lawyers by specialisation, hire for a review
4. **Generates a Trust Seal** — a SHA-256 cryptographic badge proving a real lawyer validated the AI report

---

## Architecture

| Service | Tech | Port |
|---|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind, Radix UI | 3000 (via Nginx) |
| Core API | Node.js, Express, TypeScript, Prisma | 4000 (via Nginx) |
| AI Backend | Python 3.11, FastAPI, LangChain, Celery | 8000 (via Nginx) |
| PostgreSQL | Relational DB (users, contracts, payments, seals) | 5432 |
| MongoDB | Document DB (AI analysis blobs, chat messages) | 27017 |
| Redis | Celery broker + cache | 6379 |
| MinIO | S3-compatible file storage | 9000 |
| Nginx | Reverse proxy / entry point | **80** |

---

## Quick Start

```bash
# 1. Clone the repo
git clone <repo-url>
cd contractsense

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — add OPENAI_API_KEY, JWT_SECRET, STRIPE keys, etc.

# 3. Start all services
docker-compose up --build

# 4. Run database migration (first time only)
docker exec cs_core_api npx prisma migrate dev --name init

# 5. Open the app
open http://localhost
```

### Service URLs

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Core API health | http://localhost/api/core/health |
| AI Backend docs | http://localhost/api/ai/health |
| FastAPI Swagger | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |
| Celery Flower | http://localhost:5555 |

---

## Project Structure

```
contractsense/
├── .agents/rules/style-guide.md   ← Agent constitution (read first!)
├── PROJECT_STATE.md               ← Live project memory
├── API_MOCK_DATA.json             ← Data contract
├── docker-compose.yml
├── apps/
│   ├── web/                       ← Next.js 14 frontend
│   ├── core-api/                  ← Node.js + Express API
│   └── ai-backend/                ← Python + FastAPI + Celery
└── packages/
    ├── types/                     ← Shared TypeScript types
    └── db/                        ← Prisma migrations
```

---

## For AI Agents

**Before working on this project, always read:**
1. `.agents/rules/style-guide.md`
2. `PROJECT_STATE.md`
3. `API_MOCK_DATA.json`

---

## Development

```bash
# Install dependencies (all workspaces)
npm install

# Type-check all workspaces
npm run type-check

# Lint all workspaces
npm run lint

# Python AI backend (local dev)
cd apps/ai-backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
playwright install chromium
uvicorn app.main:app --reload --port 8000
```

### Running the frontend standalone (without Docker)

```bash
# Copy web app to /tmp (avoids macOS quarantine on the contractSense directory)
cp -r apps/web /tmp/cs-web && cp -r packages /tmp/cs-web/
cd /tmp/cs-web/web
npm install --cache /tmp/npm-cache-cs
npm run dev
# → http://localhost:3000
```

---

## Key Design Decisions

- **Only the AI backend calls OpenAI** — never Core API or Frontend
- **Celery** processes PDF analysis as background jobs — never blocking the FastAPI event loop
- **PostgreSQL + MongoDB hybrid** — structured relations in Postgres, flexible AI blobs in Mongo
- **Trust Seal** = `SHA-256(contractId + lawyerId + timestamp + reportHash)` — tamper-evident, verifiable forever
- **JWT in Authorization header** — access (15 min) + refresh (7 days) with rotation
- **`@apply dark` is invalid in Tailwind CSS** — dark mode is activated by `class="dark"` on the `<html>` element in `layout.tsx`, not via `@apply`

---

## Known Gotchas

| Issue | Fix |
|---|---|
| `npm install` EPERM in `contractSense/node_modules` | macOS provenance xattr blocks writes; copy app to `/tmp` and install there |
| `@radix-ui/react-badge` does not exist on npm | Use plain Tailwind classes for badges — already implemented in the codebase |
| `@apply dark` in globals.css breaks Tailwind compilation | `dark` is a variant, not a utility — remove it; use `class="dark"` on `<html>` |
