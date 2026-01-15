---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-e-01-discovery
  - step-e-02-review
  - step-e-03-edit
inputDocuments:
  - product-brief-02-2026-01-15.md
  - technical-Chat-first-frontend-UX-UI-builder-research-2026-01-15.md
  - brainstorming-session-2026-01-15.md
  - project-documentation/index.md
documentCounts:
  briefCount: 1
  researchCount: 1
  brainstormingCount: 1
  projectDocsCount: 1
classification:
  projectType: Developer Tool / AI IDE
  domain: Software Development / AI Tooling
  complexity: High
  projectContext: brownfield
workflowType: 'prd'
workflow: 'edit'
lastEdited: '2026-01-15'
editHistory:
  - date: '2026-01-15'
    changes: 'Incorporate Bolt/Replit-style UX, SSE streaming, and Overlay-based architecture to fix rigid UI gaps.'
---

# Product Requirements Document - 02 (Professional AI IDE)

**Author:** Hani
**Date:** 2026-01-15

## Executive Summary
Project 02 is a high-fidelity, "Canvas-First" AI IDE designed to solve the "AI Handover Gap." Unlike traditional generators, 02 provides an immersive, professional sculpting environment parity with tools like Bolt.new and Replit. It enables developers to iterate on layout and visual intent via real-time SSE streaming, outputting production-ready Bun/Hono/HTMX code. The core differentiator is the "Void Shell" architecture—an overlay-based UI that treats the output as the foundation, not just a panel.

## Success Criteria
### User Success
- **Direct Manipulation Mastery:** Users can target elements via "Point-and-Chat" with <100ms interaction latency.
- **Fluid Creative Flow:** SSE streaming ensures character-by-character code/UI updates, maintaining user engagement during "Thinking" states.
- **Zero-Cleanup Export:** 100% production-readiness for generated Hono/Tailwind components.

### Technical Success
- **TTFT (Time To First Token):** AI generation begins streaming in <500ms.
- **State Integrity:** Transactional consistency across design moves via Durable Objects.
- **Sub-Second Sync:** Real-time preview updates reflect visual nudges in <200ms.

## Product Scope
### MVP - Minimum Viable Product
- **Void Shell Overlays:** Absolute-positioned tool panels with high-fidelity glassmorphism.
- **SSE Streaming Pipeline:** Real-time fragment delivery from Claude to the UI.
- **Digital Clay Interactions:** Direct selection in the preview iframe sending metadata to the host via `postMessage`.
- **Nudge AST Engine:** Surgical style updates to Tailwind classes.

### Growth & Future Vision
- **Zoom-Out History:** Spatial 2D plane for exploring previous design iterations.
- **Predictive Nudging:** Zero-latency client-side CSS transforms before AI response returns.

## User Journeys
### Marcus (The Precision Developer)
- **Journey:** Marcus selects an element directly in the canvas. He types "make it bolder" in the floating OmniBox. He sees the code and UI update instantly as characters stream in.
- **Outcome:** Total control without UI friction.

## Innovation Analysis
- **Canvas-as-Background:** Eliminating the dashboard boundary to maximize focus on the output.
- **Zero-Refresh DOM Patching:** Updating the preview iframe live during streaming without full reloads.

## Functional Requirements
### 1. Interaction & Orchestration
- **FR1:** Users can describe components using natural language.
- **FR2:** Users can provide visual "nudges" to existing generated UI.
- **FR3:** The System can interpret subjective design intent.
- **FR12:** Real-time SSE streaming of JSX fragments from backend to frontend.
- **FR13:** Absolute overlay system for floating tool panels using backdrop-filters.
- **FR15:** Direct element selection via iframe `postMessage` integration.

### 2. Rendering & State
- **FR5:** The System can apply visual changes without modifying component hierarchy.
- **FR6:** The System can preserve custom user logic during AI updates.
- **FR7:** The System can synchronize preview state across sessions via Project IDs.
- **FR8:** Users can perform Undo/Redo across the visual history.

### 3. Export & Management
- **FR9:** Users can export components as human-readable Bun/Hono/HTMX code.
- **FR10:** The System can generate "drop-in" files requiring zero cleanup.

## Non-Functional Requirements
### Performance
- **Streaming Latency:** TTFT < 500ms; character throughput > 20 chars/sec.
- **Interaction Latency:** < 100ms for element selection highlighting.

### Security
- **Cross-Origin Isolation:** Using `postMessage` with origin validation for sandbox-host communication.
- **Fragment Sanitization:** DOMPurify checks on every incoming SSE chunk.
