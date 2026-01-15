---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
inputDocuments:
  - prd.md
  - product-brief-02-2026-01-15.md
  - technical-Chat-first-frontend-UX-UI-builder-research-2026-01-15.md
  - brainstorming-session-2026-01-15.md
---

# UX Design Specification: 02 - Professional AI IDE

**Author:** Hani
**Date:** 2026-01-15

## Executive Summary
Project 02 is a "Canvas-First" professional AI IDE parity with Bolt.new and Replit. It eliminates the "AI Handover Gap" by providing a fluid, immersive environment where the user's design output is the foundation, not just a panel. The UX focuses on high-fidelity visual sculpting through real-time SSE streaming and direct manipulation.

## Core User Experience
### Defining Experience: The "Void Shell"
The entire application is a "Void"—a full-bleed design canvas that acts as the background layer (`z-0`). All system UI elements float on top as "Glass Overlays" using high-fidelity `backdrop-blur`.

### Platform Strategy
- **Control Model**: Floating centered OmniBox (`Cmd+K`) for all actions.
- **Latency Target**: <100ms for direct element selection; <500ms TTFT for streaming.
- **Interactions**: "Digital Clay" - click any element in the preview to target it for a nudge.

### Effortless Interactions
- **Live Fragment Streaming**: Users watch code and UI appear character-by-character as Claude streams JSX fragments.
- **Zero-Refresh Synchronization**: The preview updates live via DOM patching, never requiring a full iframe reload during generation.

## Visual Design Foundation
### Color System: "Modern Void"
- **Background**: `#0b0f14` (The deepest black).
- **Glass Panels**: `rgba(0, 0, 0, 0.4)` with `backdrop-blur-xl`.
- **Accent**: Electric Indigo (`#8b5cf6`) for intent and active states.
- **Borders**: Subtle `rgba(255, 255, 255, 0.08)` hairline borders.

### Typography System
- **UI**: Space Grotesk (geometric, professional).
- **Code**: IBM Plex Mono (high-density, technical).

## Component Strategy
### 1. Floating OmniBox (The "Brain")
- **Visuals**: Centered at bottom-center, pill-shaped, indigo pulse during "Thinking."
- **Interaction**: Opens with `Cmd+K`. Supports natural language prompts and quick-action chips.

### 2. Glass Sidebars (The "Tools")
- **Left**: History & Context (collapsible `Cmd+B`).
- **Right**: Integrated Code Editor & Inspect (translucent overlay).

### 3. Control Pill (The "Status")
- **Location**: Top-center.
- **Content**: Project ID, Vibe selector, Viewport simulator (Mobile/Tablet/Desktop).

## User Journey Flows
### The "Live Sculpt" Loop
1.  **Selection**: User clicks a button in the preview canvas.
2.  **Highlight**: A 1px indigo ring appears around the button (`postMessage` sync).
3.  **Command**: User hits `Cmd+K`, types "make it glow."
4.  **Streaming**: AI fragments stream into the editor; the button in the preview starts glowing character-by-character.

## Innovation Analysis
- **Canvas-as-Background**: Removing the dashboard boundary to treat the output as the source of truth.
- **Surgical SSE Patching**: Updating specific DOM nodes within the iframe based on incoming fragments.

## Success Criteria (UX)
- **Visual Fluidity**: 0% perceived "flicker" during AI generation.
- **Interaction Parity**: Feels as fast and responsive as a local design tool (Figma/Cursor).
- **Professionalism**: Zero "shitty" dashboard borders; everything is overlay-based.
