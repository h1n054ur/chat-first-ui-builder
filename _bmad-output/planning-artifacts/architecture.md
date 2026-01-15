---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
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
lastEdited: '2026-01-15'
editHistory:
  - date: '2026-01-15'
    changes: 'Incorporate Void Shell (Overlay) architecture and SSE Fragment Streaming pipeline.'
---

# System Architecture: 02 - Professional AI IDE

## Project Context Analysis
### Requirements Overview
The system centers on an immersive, "Canvas-First" professional AI IDE. Key capabilities include natural language UI generation via character-by-character SSE streaming, intent-based "nudging" (AST-constrained), and direct manipulation through a "Point-and-Chat" selector. The architecture must eliminate UI boundaries, treating the output canvas as the base layer.

### Technical Constraints & Dependencies
- **Runtime**: Bun (Local), Cloudflare Workers (Production).
- **Frameworks**: Hono (BFF), Vite (SSR/Frontend), Tailwind CSS v4.
- **Infrastructure**: Cloudflare Durable Objects (StateManager), D1 (Persistence), R2 (Assets).
- **AI**: Claude 3.5 Sonnet (Anthropic SDK).

## Core Architectural Decisions

### 1. The "Void Shell" (Overlay Architecture)
To reach Bolt/Replit parity, the UI is refactored from a CSS Grid model to an **Absolute Overlay** model.
- **Base Layer (z-0)**: The Preview Iframe Canvas fills the entire viewport.
- **Overlay Layer (z-10)**: Translucent "Glass" panels (History, Code, Control Pill) float on top using `backdrop-blur-xl`.
- **OmniBox Layer (z-20)**: The centered command bar pulses with Indigo glow during processing.

### 2. SSE Fragment Streaming Pipeline
AI generation uses Hono's `streamSSE` helper to deliver real-time character-by-character updates.
- **Backend**: Emits surgical JSX fragments.
- **Frontend**: `EventSource` listener parses fragments and patches the local AST.
- **Latency**: TTFT (Time To First Token) < 500ms.

### 3. Digital Clay: Point-and-Chat Integration
Direct element selection uses a bidirectional `postMessage` protocol between the Host and the Sandbox.
- **Iframe**: Listens for click events and sends `element-metadata` (tags, classes, ID) to the host.
- **Host**: High-fidelity indigo ring overlay follows the selected element in the iframe coordinate space.

### 4. Transactional State & RPC
- **State Manager**: Cloudflare Durable Object stores the "Source of Truth" AST.
- **Workers RPC**: Using native RPC for sub-millisecond communication between the API Worker and the State Manager DO.
- **Hono Client (hc)**: Type-safe interaction for the floating OmniBox actions.

## Implementation Patterns

### Naming & Structure
- **Feature-based**: Components and logic co-located in `src/features/`.
- **Naming**: PascalCase for Components, camelCase for logic, snake_case for D1 schemas.

### Security & Sanitization
- **Cross-Origin**: Previews run in sandboxed subdomains.
- **Sanitization**: Every SSE fragment passes `DOMPurify` before insertion.

## Project Structure & Boundaries
```
project-02/
├── src/
│   ├── index.ts (Worker Entry & Routes)
│   ├── features/
│   │   ├── chat/ (SSE & Claude logic)
│   │   ├── nudge-engine/ (AST Patching)
│   │   ├── preview-sandbox/ (postMessage & Ghosting)
│   │   └── state-manager/ (DO & RPC)
│   ├── components/
│   │   └── ui/ (Glass Overlays & OmniBox)
│   └── infrastructure/ (Platform Bindings)
```

---
**Architecture Status:** READY FOR RE-IMPLEMENTATION ✅
