---
stepsCompleted:
  - 1
  - 2
  - 3
  - 4
  - 5
  - 6
  - 7
  - 8
inputDocuments:
  - ux-design-specification.md
  - prd.md
  - product-brief-02-2026-01-15.md
  - technical-Chat-first-frontend-UX-UI-builder-research-2026-01-15.md
workflowType: 'architecture'
project_name: '02'
user_name: 'Hani'
date: '2026-01-15'
status: 'complete'
completedAt: '2026-01-15T13:00:00Z'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
The system centers on a high-fidelity "Chat-Preview Loop." Key capabilities include natural language UI description, intent-based "nudging" (style-only updates), real-time high-fidelity previewing via HTMX, and zero-cleanup code export for the Bun/Hono ecosystem. The architecture must support surgical DOM updates that preserve business logic while allowing AI to manipulate visual properties.

**Non-Functional Requirements:**
- **Performance:** <200ms preview latency and <500ms TTFT for AI responses are mission-critical for the "sculpting" experience.
- **Security:** Strict sandboxing (iframes/subdomains) and edge-side sanitization (DOMPurify) for all AI-generated fragments.
- **Reliability:** Transactional session persistence using Cloudflare Durable Objects with WebSocket Hibernation support.

**Scale & Complexity:**
The project is of medium-high complexity due to the real-time synchronization requirements between the Claude Agent SDK, Durable Object state, and the HTMX frontend.

- Primary domain: Full-stack (Edge-first)
- Complexity level: Medium-High
- Estimated architectural components: ~6 core services (Chat Orchestrator, Nudge Engine, Preview Sandbox, State Manager, Asset Store, Export Serializer)

### Technical Constraints & Dependencies
- **Runtime:** Bun (Local), Cloudflare Workers (Production).
- **Frameworks:** Hono (BFF), HTMX (Interaction).
- **Infrastructure:** Cloudflare D1, R2, KV, Durable Objects, and Queues.
- **AI:** Claude Agent SDK (Anthropic).

### Cross-Cutting Concerns Identified
- **Intent-to-CSS Mapping:** Algorithmic translation of subjective terms to Tailwind scales.
- **Real-time State Sync:** Maintaining consistency across multiple user sessions and AI streaming tokens.
- **Structural Integrity:** Constraining AI output to style-only modifications during nudges to prevent layout collapse.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack (Edge-first) based on project requirements analysis.

### Starter Options Considered

We evaluated the `create-hono` ecosystem, comparing the `cloudflare-workers`, `cloudflare-workers+vite`, and `x-basic` (HonoX) templates. While HonoX offers powerful island hydration, the explicit control required for our "Nudge Engine" and the specialized Durable Object WebSocket integration favored a more direct Hono + Vite approach.

### Selected Starter: create-hono (Template: cloudflare-workers+vite)

**Rationale for Selection:**
This template provides the optimal balance of edge-first performance and modern build tooling. It enables full type-safety for Cloudflare Bindings (D1, DO, KV) while leveraging Vite for Tailwind v4 integration, which is essential for our design-token-driven visual foundation.

**Initialization Command:**

```bash
bun create hono@latest project-02 --template cloudflare-workers+vite
```

**Architectural Decisions Provided by Starter:**

**Language & Runtime:**
TypeScript with Bun for high-performance local development and Cloudflare Workers for global edge execution.

**Styling Solution:**
Tailwind CSS v4 integrated via `@tailwindcss/vite`, supporting deterministic utility-class swapping for intent-based nudges.

**Build Tooling:**
Vite-powered build pipeline, ensuring sub-200ms preview refreshes during development.

**Testing Framework:**
Standard Vitest/Bun test configuration for Hono route and business logic validation.

**Code Organization:**
Standard `src`-based layout with clear boundaries between Hono route handlers, JSX components, and infrastructure bindings.

**Development Experience:**
Fast HMR and full Wrangler simulation of the Cloudflare environment locally.

**Note:** Project initialization using this command should be the first implementation story.

## Core Architectural Decisions

### Data Architecture
**Active Session State:** Handled exclusively by **Cloudflare Durable Objects**. This provides the "Source of Truth" for the high-concurrency sculpting loop, utilizing transactional storage for sub-200ms updates.
**Long-term Persistence:** **Cloudflare D1 (SQLite)**. Active state from DO is flushed to D1 only when a user creates a "Milestone" or "Locks" a design.
**Asset Storage:** **Cloudflare R2**. Used for user uploads and generated static assets.

### AI & Agent Orchestration
**The "Nudge" Engine:** **AST-Constrained Patching**. The Claude Agent SDK returns a JSON object representing style deltas (Tailwind class additions/removals) rather than raw JSX. A dedicated Hono service patches the stable internal AST to ensure zero structural hallucinations.
**Streaming:** **Server-Sent Events (SSE)**. Used for unidirectional AI text responses, synchronized with WebSocket-driven UI updates in the preview.

### Frontend & Previews
**Sandboxing:** **Dynamic Subdomains**. Each project session is isolated within a unique `session-id.02-preview.com` subdomain to enforce the Same-Origin Policy and protect the primary application context.
**Rendering:** **HTMX Fragments**. The system pushes surgical HTML updates to the preview canvas, minimizing network payload and maintaining client-side state.

### Authentication & Security
**Auth Provider:** **Clerk (OIDC)**. Integrated via Hono middleware for seamless edge-compatible user management.
**Sanitization:** **DOMPurify (Edge Edition)**. Every generated fragment is sanitized before HTMX injection.

## Implementation Patterns & Consistency Rules

### Naming Patterns
- **Database:** snake_case for tables and columns (e.g., `project_milestones`).
- **API:** RESTful pluralized endpoints (e.g., `/api/projects/:id/nudges`).
- **Code:** PascalCase for JSX Components (`UserCard.tsx`), camelCase for functions and variables (`applyStylePatch`).

### Structure Patterns
- **Feature-based:** Components and logic are co-located within feature directories (e.g., `src/features/nudge-engine/`).
- **Test Placement:** Co-located `*.test.ts` files for unit tests; `tests/e2e/` for visual regression.

### Format Patterns
- **API Response:** Standard wrapper: `{ success: boolean, data: T, error?: string }`.
- **Date Format:** ISO 8601 strings exclusively.

### Enforcement Guidelines
- **AI Agents MUST** use Hono's `hc` client for all internal RPC calls.
- **AI Agents MUST NOT** modify the component structure during a `nudge` request.

## Project Structure & Boundaries

### Complete Project Directory Structure
```
project-02/
├── wrangler.toml
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── src/
│   ├── index.ts (Worker Entry)
│   ├── features/
│   │   ├── chat/
│   │   ├── nudge-engine/ (AST Patching Logic)
│   │   ├── preview-sandbox/
│   │   └── state-manager/ (DO logic)
│   ├── components/
│   │   ├── ui/ (System Primitives)
│   │   └── templates/ (Vibe fragments)
│   ├── infrastructure/
│   │   ├── d1/
│   │   ├── r2/
│   │   └── durable-objects/
│   └── lib/ (Shared utils)
├── tests/
└── public/
```

### Architectural Boundaries
- **Worker-to-DO:** Communication via Service Bindings and Hono RPC.
- **Preview-to-App:** Strictly via postMessage and Cross-Origin Subdomains.

## Architecture Validation Results

### Coherence Validation ✅
All decisions are edge-compatible and optimized for the Cloudflare environment. The use of Durable Objects for real-time state directly supports the <200ms latency requirement.

### Requirements Coverage Validation ✅
- **FRs:** 100% covered, including the specialized Nudge Engine logic.
- **NFRs:** Performance and Security requirements are explicitly addressed via the AST-constrained engine and subdomain sandboxing.

### Implementation Readiness Validation ✅
The architecture is comprehensive, specific, and provides clear guardrails for AI agents to prevent structural hallucinations.

**Confidence Level:** HIGH

## Architecture Completion Summary

### Final Architecture Deliverables
- **📋 Complete Architecture Document** finalized at `/home/hani/bmad-testing/02/_bmad-output/planning-artifacts/architecture.md`.
- **🏗️ Implementation Ready Foundation** for the Bun/Hono/HTMX/Cloudflare stack.
- **📚 AI Agent Implementation Guide** including Nudge Engine constraints and naming conventions.

### Implementation Handoff
**First Implementation Priority:**
Initialize the project using: `bun create hono@latest project-02 --template cloudflare-workers+vite`

---
**Architecture Status:** READY FOR IMPLEMENTATION ✅
