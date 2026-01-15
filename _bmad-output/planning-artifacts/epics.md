---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# 02 - Professional AI IDE: Epic Breakdown

## Overview
This document transforms the "Canvas-First" professional AI IDE requirements into actionable epics and stories. The primary goal is to reach UX parity with Bolt.new and Replit by implementing an overlay-based architecture, surgical SSE streaming, and high-fidelity "Digital Clay" interactions.

## Requirements Inventory

### Functional Requirements
- **FR12:** Real-time SSE streaming of JSX fragments from backend to frontend.
- **FR13:** Absolute overlay system for floating tool panels using backdrop-filters.
- **FR15:** Direct element selection via iframe `postMessage` integration.
- **FR4:** The System can stream status updates via SSE during generation.
- **FR5:** Visual changes applied without modifying component hierarchy (Nudge Engine).
- **FR1:** Natural language component description.

### Non-Functional Requirements
- **Performance:** TTFT < 500ms; character throughput > 20 chars/sec.
- **Latency:** Interaction highlighting latency < 100ms.
- **UX Parity:** 0% perceived "flicker" during AI generation.

## Epic List

### Epic 6: The Void Shell (Overlay Architecture)
Shifting from a rigid dashboard to a canvas-first model where the output is the background.
**Stories:** 6.1 (Full-Bleed Canvas), 6.2 (Glass Panels), 6.3 (Top Control Pill).

### Epic 7: Real-Time SSE Pipeline
Implementing the "Alive" feedback loop through character-by-character streaming.
**Stories:** 7.1 (Surgical SSE Emitter), 7.2 (Live Thinking State), 7.3 (Character-by-Character Patching).

### Epic 8: Interactive Digital Clay
Enabling direct manipulation through high-fidelity selection and command palettes.
**Stories:** 8.1 (Bidirectional postMessage), 8.2 (Indigo Selector Overlay), 8.3 (Floating OmniBox).

### Epic 9: Professional Refinement
Closing the loop with visual verification and integrated code views.
**Stories:** 9.1 (Visual Diff Ghosting), 9.2 (Translucent Code Editor Overlay).

---

## Epic 6: The Void Shell (Overlay Architecture)

### Story 6.1: Full-Bleed Preview Canvas
**Goal:** Treat the output as the foundation of the app.
**Acceptance Criteria:**
- **Given** the workspace is loaded.
- **When** I view the screen.
- **Then** the preview iframe fills 100% of the viewport at `z-index: 0`.
- **And** there are no fixed sidebars or headers cutting into the canvas space.

### Story 6.2: Glassmorphism Floating Panels
**Goal:** High-fidelity tool overlays that don't obscure the canvas.
**Acceptance Criteria:**
- **Given** the "Void Shell" layout.
- **When** I open the History or Code panels.
- **Then** they slide in as floating overlays with `backdrop-filter: blur(20px)` and `bg-black/40`.
- **And** the 1px borders use `rgba(255,255,255,0.08)` for a "Professional Premium" feel.

---

## Epic 7: Real-Time SSE Pipeline

### Story 7.1: Surgical SSE Emitter
**Goal:** Deliver AI fragments with zero buffering.
**Acceptance Criteria:**
- **Given** an AI generation request.
- **When** Claude begins responding.
- **Then** the Hono backend streams surgical JSX chunks via `text/event-stream`.
- **And** `Content-Encoding: Identity` is used to prevent edge buffering.

### Story 7.3: Character-by-Character Patching
**Goal:** The UI grows live as the AI "thinks."
**Acceptance Criteria:**
- **Given** an incoming SSE fragment.
- **When** the frontend receives a chunk.
- **Then** it patches the local DOM/Iframe instantly without a full refresh.
- **And** the user sees code/UI appearing character-by-character.

---

## Epic 8: Interactive Digital Clay

### Story 8.1: Bidirectional postMessage Sync
**Goal:** Bridge the Host and the Sandbox.
**Acceptance Criteria:**
- **Given** a click inside the preview iframe.
- **When** an element is clicked.
- **Then** the sandbox sends `element-metadata` (Tag, Class, ID) to the host via `window.postMessage`.
- **And** the host validates the message origin for security.

### Story 8.2: Indigo Selector Overlay
**Goal:** High-fidelity visual targeting.
**Acceptance Criteria:**
- **Given** a selected element from the iframe.
- **When** metadata is received.
- **Then** a 1px indigo ring (`#8b5cf6`) is rendered on the Host layer, exactly over the iframe element coordinates.
- **And** the ring follows the element if the viewport is resized.

---

## Epic 9: Professional Refinement

### Story 9.1: Visual Diff Ghosting
**Goal:** Post-nudge feedback.
**Acceptance Criteria:**
- **Given** a successful design "nudge."
- **When** the new state is rendered.
- **Then** the previous state is "ghosted" in red/green overlays for 2 seconds to highlight specific class swaps.
