---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
workflowType: 'research'
lastStep: 4
research_type: 'technical'
research_topic: 'sse-streaming-overlay-ui'
research_goals: 'Define technical implementation for real-time SSE streaming and absolute overlay layouts to reach Bolt/Replit parity.'
user_name: 'Hani'
date: '2026-01-15'
web_research_enabled: true
source_verification: true
---

# Technical Research: Real-time SSE & Overlay UI

**Date:** 2026-01-15
**Author:** Hani
**Research Type:** technical

---

## Technical Research Scope Confirmation

[... previous scope confirmation content ...]

---

## Technology Stack Analysis

[... previous technology stack content ...]

---

## Integration Patterns Analysis

[... previous integration patterns content ...]

---

## Architectural Patterns and Design

[... previous architectural patterns content ...]

---

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies
- **Overlay Migration**: Re-engineering the main workspace from a CSS Grid model to an Absolute Overlay model. This requires `inset-0` on the preview canvas and `pointer-events-none` on overlay containers to allow interaction with the iframe beneath.
- **SSE-First Refactoring**: Replacing standard `fetch` POST/JSON responses with `EventSource` listeners. This involves refactoring `src/features/chat/stream.ts` to emit high-frequency fragments.

### Development Workflows and Tooling
- **Hono Client (hc)**: Mandatory for all frontend-to-backend communication to ensure type safety during the SSE stream setup.
- **Vite Dev Server + Wrangler**: Critical for local testing of SSE, as Cloudflare-specific headers (`Content-Encoding: Identity`) are needed to prevent buffering.

### Testing and Quality Assurance
- **Simulated Latency Testing**: Testing the "Thinking State" and SSE stream under throttled network conditions to ensure the UI doesn't flicker.
- **Iframe Message Validation**: Using Zod to validate `postMessage` payloads between the sandbox and host.

### Deployment and Operations Practices
- **Worker Service Bindings**: Connecting the UI Worker to the State Manager Worker via RPC for sub-millisecond internal latency.
- **Durable Object SQLite**: Ensuring design history is persisted across isolate restarts.

## Technical Research Recommendations

### Implementation Roadmap
1.  **Phase 1: The Void Shell**: Implement the absolute overlay layout in `src/style.css` and `UtilityMaster.tsx`.
2.  **Phase 2: SSE Pipeline**: Update `src/index.tsx` and `src/features/chat/stream.ts` to support surgical SSE fragment streaming.
3.  **Phase 3: Direct Selection**: Implement `postMessage` logic in `src/features/preview-sandbox` for "Digital Clay" interaction.

### Technology Stack Recommendations
- **Hono `streamSSE`**: Highly recommended for real-time AI feedback.
- **Tailwind v4 `backdrop-blur`**: Recommended for the "Professional Premium" overlay aesthetic.
- **Cloudflare Workers RPC**: Recommended for efficient State Manager communication.

### Success Metrics and KPIs
- **TTFT (Time To First Token)**: < 500ms for AI responses.
- **Interaction Latency**: < 100ms for direct selection highlighting.
- **Visual Consistency**: 100% elimination of rigid grid boundaries.

---

## Conclusions and Recommendations
The research confirms that reaching Bolt/Replit parity requires a fundamental shift from a "Panel-based" dashboard to a "Canvas-based" overlay architecture. The technical foundation (Hono, Cloudflare, Tailwind v4) is perfectly suited for this, but the implementation must transition to an asynchronous, event-driven model using SSE and `postMessage`.

## Sources and Citations
- Hono Streaming Helper: [https://hono.dev/docs/helpers/streaming](https://hono.dev/docs/helpers/streaming)
- MDN Server-Sent Events: [https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
- Cloudflare Workers RPC: [https://developers.cloudflare.com/workers/runtime-apis/rpc/](https://developers.cloudflare.com/workers/runtime-apis/rpc/)
- Tailwind v4 Documentation: [https://tailwindcss.com/docs/v4-beta](https://tailwindcss.com/docs/v4-beta)
