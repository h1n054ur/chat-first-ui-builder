---
stepsCompleted:
  - step-01-validate-prerequisites
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# 02 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 02, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can describe components using natural language.
FR2: Users can provide visual "nudges" to existing generated UI.
FR3: The System can interpret subjective design intent (e.g., "calm," "tight").
FR4: The System can stream status updates via SSE during generation.
FR5: The System can apply visual changes without modifying component hierarchy.
FR6: The System can preserve custom user logic during AI updates.
FR7: The System can synchronize preview state across sessions via Project IDs.
FR8: Users can perform Undo/Redo across the visual history.
FR9: Users can export components as human-readable Bun/Hono/HTMX code.
FR10: The System can generate "drop-in" files requiring zero cleanup.
FR11: Users can initialize projects from a "Vibe Template" library.

### NonFunctional Requirements

NFR1: Preview updates must reflect in <200ms from the receipt of AI fragments.
NFR2: Time to first token (TTFT) for AI chat responses must be <500ms.
NFR3: 100% of rendering logic must execute on Cloudflare Workers/Durable Objects.
NFR4: All generated UI code must run in dynamic subdomain sandboxes to enforce Same-Origin Policy.
NFR5: Every generated fragment must pass DOMPurify checks before injection.
NFR6: AI-generated code must pass WCAG 2.1 Level AA automated audits by default.
NFR7: WebWebSockets must utilize Hibernation APIs for persistent connections with <1s recovery.
NFR8: Transactional state persistence for session history via Durable Object storage.

### Additional Requirements

**From Architecture:**
- **Starter Template:** `bun create hono@latest project-02 --template cloudflare-workers+vite`
- Infrastructure: Cloudflare Workers, D1, R2, KV, Durable Objects, Queues.
- Nudge Logic: AST-Constrained Patching (AI returns JSON deltas).
- Auth: Clerk (OIDC) integration via Hono middleware.
- Communication: Service Bindings and Hono RPC for Worker-to-DO calls.

**From UX Design:**
- Defining Experience: "Sculpt UI through Intent-Based Nudges."
- Primary Interaction: "Point-and-Chat" (Click element to target for chat).
- Visual Design: "Functional Premium" vibe, Inter/Geist typography, 4px grid.
- Specialized Components: Omni-Box Command Bar (`Cmd+K`), Visual Diff Overlay (ghosting), Device Simulator.

---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-final-validation
inputDocuments:
  - prd.md
  - architecture.md
  - ux-design-specification.md
---

# 02 - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for 02, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can describe components using natural language.
FR2: Users can provide visual "nudges" to existing generated UI.
FR3: The System can interpret subjective design intent (e.g., "calm," "tight").
FR4: The System can stream status updates via SSE during generation.
FR5: The System can apply visual changes without modifying component hierarchy.
FR6: The System can preserve custom user logic during AI updates.
FR7: The System can synchronize preview state across sessions via Project IDs.
FR8: Users can perform Undo/Redo across the visual history.
FR9: Users can export components as human-readable Bun/Hono/HTMX code.
FR10: The System can generate "drop-in" files requiring zero cleanup.
FR11: Users can initialize projects from a "Vibe Template" library.

### NonFunctional Requirements

NFR1: Preview updates must reflect in <200ms from the receipt of AI fragments.
NFR2: Time to first token (TTFT) for AI chat responses must be <500ms.
NFR3: 100% of rendering logic must execute on Cloudflare Workers/Durable Objects.
NFR4: All generated UI code must run in dynamic subdomain sandboxes to enforce Same-Origin Policy.
NFR5: Every generated fragment must pass DOMPurify checks before injection.
NFR6: AI-generated code must pass WCAG 2.1 Level AA automated audits by default.
NFR7: WebWebSockets must utilize Hibernation APIs for persistent connections with <1s recovery.
NFR8: Transactional state persistence for session history via Durable Object storage.

### Additional Requirements

**From Architecture:**
- **Starter Template:** `bun create hono@latest project-02 --template cloudflare-workers+vite`
- Infrastructure: Cloudflare Workers, D1, R2, KV, Durable Objects, Queues.
- Nudge Logic: AST-Constrained Patching (AI returns JSON deltas).
- Auth: Clerk (OIDC) integration via Hono middleware.
- Communication: Service Bindings and Hono RPC for Worker-to-DO calls.

**From UX Design:**
- Defining Experience: "Sculpt UI through Intent-Based Nudges."
- Primary Interaction: "Point-and-Chat" (Click element to target for chat).
- Visual Design: "Functional Premium" vibe, Inter/Geist typography, 4px grid.
- Specialized Components: Omni-Box Command Bar (`Cmd+K`), Visual Diff Overlay (ghosting), Device Simulator.

### FR Coverage Map

FR1: Epic 2 - Story 2.1
FR2: Epic 3 - Story 3.2
FR3: Epic 3 - Story 3.2
FR4: Epic 2 - Story 2.2
FR5: Epic 3 - Story 3.2, 3.4
FR6: Epic 3 - Story 3.4
FR7: Epic 1 - Story 1.3
FR8: Epic 4 - Story 4.1
FR9: Epic 5 - Story 5.1
FR10: Epic 5 - Story 5.2
FR11: Epic 1 - Story 1.2

## Epic List

### Epic 1: Project Foundation & Vibe Selection
Users can initialize a new UI design project by selecting from a curated library of high-end design "vibes," ensuring a professional starting point with near-instant synchronization.
**FRs covered:** FR7, FR11.

### Epic 2: Natural Language Component Generation
Users can create UI components by simply describing them and see them streamed into existence in real-time, allowing for rapid movement from concept to high-fidelity code.
**FRs covered:** FR1, FR4.

### Epic 3: Intent-Based UI Sculpting (The "Nudge" Engine)
The defining experience where users "sculpt" their UI through subtle, intent-based adjustments (e.g., "make it tighter"). The engine applies precise style changes while preserving structural integrity and custom logic.
**FRs covered:** FR2, FR3, FR5, FR6.

### Epic 4: Visual History & Iteration Management
Users can safely explore different design directions with robust undo/redo capabilities and session history, ensuring a risk-free creative process.
**FRs covered:** FR8.

### Epic 5: Production-Ready Export & Hand-off
Users can export their polished designs as clean, convention-correct Bun/Hono/HTMX code that is ready to be dropped into production projects with zero manual cleanup.
**FRs covered:** FR9, FR10.

---

## Epic 1: Project Foundation & Vibe Selection
**Goal:** Establish the technical foundation and provide users with curated visual starting points.

### Story 1.1: Initialize Project with Starter Template
As a developer (Marcus),
I want to initialize my project using the approved Hono/Cloudflare starter template,
So that I have a production-ready environment aligned with the project architecture.

**Acceptance Criteria:**
**Given** the `bun create` command specified in Architecture
**When** I execute the command
**Then** a new project directory is created with Hono, Vite, and Tailwind v4 configured
**And** the `wrangler.toml` file includes bindings for D1, R2, and Durable Objects.

### Story 1.2: Select Design Vibe from Gallery
As a non-techie (Maya),
I want to choose from a gallery of high-end design templates,
So that I can start with a professional aesthetic without needing design skills.

**Acceptance Criteria:**
**Given** a new project initialization
**When** I select a "Vibe" (e.g., "Minimalist", "High Fashion") from the browser
**Then** the system loads the corresponding Tailwind config tokens
**And** the initial scaffold reflects the selected visual signature.

### Story 1.3: Real-time Preview Synchronization
As a user,
I want my preview state to synchronize across sessions,
So that I can pick up where I left off or share my live design with others via a Project ID.

**Acceptance Criteria:**
**Given** an active design session
**When** I access the project using its unique Project ID
**Then** the Cloudflare Durable Object retrieves the transactional state
**And** the live preview updates to reflect the current design.

---

## Epic 2: Natural Language Component Generation
**Goal:** Transform natural language descriptions into live, interactive UI components.

### Story 2.1: Generate Component from Text Prompt
As a developer (Marcus),
I want to describe a component (e.g., "a responsive hero section with a primary CTA"),
So that I can rapidly move from an idea to a working UI fragment.

**Acceptance Criteria:**
**Given** an active sculpting session
**When** I input a component description in the Omni-Box
**Then** the Claude Agent SDK generates the corresponding Hono/JSX code
**And** the component is rendered in the live preview sandbox.

### Story 2.2: Stream AI Response Status
As a user,
I want to see real-time progress indicators during component generation,
So that I know the system is working and can see the "thought process."

**Acceptance Criteria:**
**Given** a long-running generation task
**When** the AI is processing
**Then** status tokens are streamed via SSE to the chat UI
**And** the user sees "Generating structure...", "Applying styles...", etc.

---

## Epic 3: Intent-Based UI Sculpting (The "Nudge" Engine)
**Goal:** Enable surgical visual refinement through subjective intent.

### Story 3.1: Point-and-Chat Component Targeting
As a user,
I want to click an element in the preview to target it for refinement,
So that I can precisely control which part of the UI I am "sculpting."

**Acceptance Criteria:**
**Given** a rendered component in the preview
**When** I click a specific DOM element (e.g., a button)
**Then** the element is highlighted with an Indigo ring
**And** the Omni-Box focuses with that element as the chat context.

### Story 3.2: Apply Visual "Nudge" (Style Delta)
As a user,
I want to type a "nudge" like "make it tighter" or "calmer,"
So that I can refine the visual polish without the AI rewriting my code.

**Acceptance Criteria:**
**Given** a targeted element
**When** I input a subjective nudge
**Then** the system returns a JSON delta of Tailwind class changes
**And** the changes are applied surgically to the internal AST
**And** the preview reflects the change in <200ms.

### Story 3.3: Visual Diff Feedback (Ghosting)
As a user,
I want to see what exactly changed after a nudge,
So that I can verify the AI correctly understood my intent.

**Acceptance Criteria:**
**Given** a successful style update
**When** the new state is rendered
**Then** the previous state is "ghosted" behind the new state for 2 seconds
**And** a "Diff Toast" appears showing the specific class swaps.

### Story 3.4: Preserve Custom User Logic during Nudges
As a developer (Marcus),
I want my custom logic (e.g., click handlers, state) to remain untouched during AI style nudges,
So that I don't lose my business implementation to the design process.

**Acceptance Criteria:**
**Given** a component with custom event handlers or logic
**When** an intent-based nudge is applied
**Then** only the Tailwind classes/styles are modified
**And** the functional logic is preserved 100% in the internal AST.

---

## Epic 4: Visual History & Iteration Management
**Goal:** Provide a safe, versioned design exploration environment.

### Story 4.1: Undo/Redo Visual Changes
As a designer,
I want to instantly revert an AI-driven change,
So that I can experiment freely without fear of "breaking" my work.

**Acceptance Criteria:**
**Given** a sequence of nudges
**When** I click "Undo" (or `Cmd+Z`)
**Then** the system reverts to the previous transactional state in the Durable Object
**And** the preview updates immediately.

---

## Epic 5: Production-Ready Export & Hand-off
**Goal:** Deliver human-quality code that integrates seamlessly into existing projects.

### Story 5.1: Export Component Code
As a developer (Marcus),
I want to copy the polished JSX/Tailwind code to my clipboard,
So that I can use it in my existing Bun project immediately.

**Acceptance Criteria:**
**Given** a finalized design
**When** I click "Export"
**Then** the system serializes the component into human-readable Hono/JSX
**And** the output is formatted according to the project's naming conventions.

### Story 5.2: Generate Zero-Cleanup Project Files
As a developer (Marcus),
I want the exported code to include all necessary Tailwind directives and imports,
So that I have zero manual cleanup work after the hand-off.

**Acceptance Criteria:**
**Given** a multi-component design
**When** I download the export package
**Then** it includes a ready-to-run file structure
**And** all components render correctly in a standard Hono environment without modification.


