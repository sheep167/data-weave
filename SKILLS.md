# Skills Demonstrated — DataWeave

**Project Name:** `DataWeave`  
**Live Demo:** (Vercel link — to be added after first deploy)  
**Repo:** https://github.com/YOUR-USERNAME/data-weave  
**Status:** Portfolio MVP (full-stack lite) — AI Data Architecture Lab

## 1. Purpose & Vision

**DataWeave** is a **professional-grade AI Data Architecture Lab** built to showcase senior-level full-stack and data-modeling skills to recruiters while laying the foundation for a future passive-income SaaS product.

**Core Idea**  
A visual ERD-style canvas (inspired by chartdb.io) where indie devs and startups can:

- Design complex relational schemas with proper cardinality and foreign keys
- Ask an AI “What if…?” about real architectural decisions (normalization, many-to-many junction tables, polymorphic entities, audit columns, etc.)
- Instantly see architectural changes visualized side-by-side
- Generate production-ready synthetic datasets (realistic or clearly-mock) that respect relationships, edge cases, and domain realism (HK/SG flavor)
- Export ready-to-run SQL, Parquet, CSV, JSON

The app proves the builder thinks like a Staff Data Engineer: modeling, refactoring, consistency enforcement, and production export pipelines — all in one delightful UI.

**Portfolio Value**

- Complex reactive graph UI (React Flow + MobX)
- Secure LLM orchestration via unified gateway on the backend
- Architectural reasoning + visual diffing
- Full-stack lite architecture that scales to real monetization without rework

**Future Passive-Income Path** (stubbed for MVP)  
Freemium model → $12–$25/mo for unlimited generations, team workspaces, scheduled fresh-data packs.

## 2. Key Features (MVP Scope)

### Visual Schema Builder (ChartDB-inspired but smarter)

- Drag-and-drop entities with inline field editing (types, constraints, PII flags)
- Visual relationship drawing (1:1, 1:N, N:M) with automatic FK inference
- Dark-mode canvas, zoom/pan, auto-layout

### AI Schema Architect — “What If?” Panel (Unique Differentiator)

- Powered by **DuckLLM** (unified gateway to 30+ models)
- Analyzes live schema graph and suggests production-grade improvements:
  - “What if we convert this 1:N to true Many-to-Many → auto-create junction table”
  - “What if we normalize duplicated address fields → extract new Addresses entity”
  - “What if we simplify over-normalized lookup tables → polymorphic pattern”
  - Performance, indexing, soft-delete, temporal, partitioning hints
- Side-by-side React Flow canvases with colored diffs (green = new, red = removed, animated edges)
- One-click “Apply” → updates main canvas + refreshes data preview

### Synthetic Data Generation (Two Modes)

- **Realistic Mode** → DuckLLM (routed to best available model — e.g. Grok, Claude, Gemini, DeepSeek via single key)
- **Clearly Mock Mode** → `@faker-js/faker` + deterministic rules (obviously fake data for testing)
- Live TanStack Table previews with infinite scroll
- Quality scoring (realism, consistency, diversity, storage impact)

### What-If Data Mutations

- Sliders/controls: churn rate, null injection, outliers, volume scaling
- Mutations respect relationships and architectural changes

### Exports & Polish

- One-click: CSV, JSON, SQL (INSERTs with FKs), Parquet
- LocalStorage export history
- “Copy SQL ready for Neon/Postgres” button
- Domain templates (e-commerce, SaaS events, finance, logistics, healthcare-lite)

## 3. Tech Stack & Architecture (Full-Stack Lite)

### Frontend (Vite + React 19)

- **React 19** + TypeScript
- **MobX** (state management) — `SchemaStore`, `DataGenerationStore`, `ArchitectStore`, `UIStore`
- **React Flow** (core canvas + side-by-side diff view)
- Tailwind CSS + shadcn/ui
- TanStack Table + TanStack React Query (for preview data)

### Backend (NestJS — Vercel Serverless)

- Stateless API routes only
- Clean service layer for LLM orchestration via **DuckLLM**
- Official DuckLLM integration (https://duckllm.com/en + https://doc.duckllm.com/)
- Automatic failover + load balancing across 30+ models
- Structured JSON outputs + few-shot prompting for schema refactoring
- Heavy export logic (Parquet generation, large SQL)

### LLM Layer — DuckLLM Unified Gateway

- Primary: DuckLLM[](https://duckllm.com/)
- One API key for OpenAI, Claude, Gemini, Grok, DeepSeek, and 30+ others
- Enterprise-grade reliability, transparent pay-as-you-go pricing
- Full availability in Hong Kong (no geo-blocks)
- Easy fallback / model routing logic in backend

### Deployment

- **Vercel** (frontend + serverless backend in one repo)
- Zero database for MVP (all in-memory per session)
- Ready to add Neon + Prisma in one PR when monetization begins

### Project Structure (Monorepo)

data-weave/
├── apps/
│ ├── frontend/ ← Vite + React 19 + MobX + React Flow
│ └── backend/ ← NestJS serverless
├── packages/
│ └── shared/ ← types, schema validation, export utils
├── turbo.json
└── SKILLS.md ← this file

## 4. Skills Explicitly Demonstrated (Recruiter / AI Agent Reference)

**Frontend Mastery**

- Advanced React 19 + concurrent features
- Complex state management with MobX on a graph UI
- React Flow custom nodes, edges, controls, and side-by-side diff rendering
- High-performance live previews (TanStack Table)

**Backend & Architecture**

- Clean NestJS service layer + API design
- Unified LLM gateway integration (DuckLLM)
- Stateless full-stack lite architecture that scales to production

**Data Engineering & AI**

- Relational data modeling & normalization reasoning
- LLM-orchestrated schema refactoring with structured outputs
- Synthetic data generation with FK integrity and edge-case handling
- Architectural “what-if” simulation and visualization

**Production Mindset**

- Export pipelines (Parquet, SQL with FKs)
- Quality scoring algorithms
- Future-proof design for auth, quotas, and monetization
- Cost-effective multi-model LLM routing

**Bonus Portfolio Signals**

- ChartDB-inspired beautiful UI without cloning
- Focus on architectural depth rather than surface-level mocking
- Ready for passive-income evolution (freemium + team workspaces)

---

**How to use this file with AI agents:**

- Paste the entire content into Copilot / Cursor / Claude as system prompt
- Reference sections by name: “Follow the AI Schema Architect feature spec from SKILLS.md”
- When adding new features: “Stay consistent with the skills and architecture defined in SKILLS.md”

This file will be our single source of truth as we build.
