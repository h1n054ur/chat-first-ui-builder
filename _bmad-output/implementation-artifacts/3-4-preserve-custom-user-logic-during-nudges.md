# Story 3.4: Preserve Custom User Logic during Nudges

Status: done

## Story

As a developer (Marcus),
I want my custom logic (e.g., click handlers, state) to remain untouched during AI style nudges,
so that I don't lose my business implementation to the design process.

## Acceptance Criteria

1. **Given** a component with custom event handlers (`onclick`), hooks, or logic
   **When** an intent-based nudge is applied
   **Then** only the Tailwind classes/styles are modified.
2. **Given** a nudge operation
   **When** the AST is patched
   **Then** the functional logic (attributes starting with `on`, `bind`, etc.) is preserved 100% in the internal AST.
3. **Given** the updated preview
   **When** I interact with the component
   **Then** the existing custom logic still functions correctly.

## Tasks / Subtasks

- [x] Implement "Logic Guard" in AST Patcher (AC: 1, 2)
  - [x] Define a "Protected Attributes" list (e.g., `onclick`, `hx-get`, etc.).
  - [x] Ensure the Nudge Engine patcher only iterates over `class` and `style` attributes.
- [x] Verify Logic Persistence (AC: 3)
  - [x] Create a test component with a functioning button (e.g., alerts on click).
  - [x] Perform a nudge and verify the button still alerts.
- [x] Prevent Hierarchy Modification (AC: 2)
  - [x] Ensure the patcher cannot add/remove/move nodes, only update attributes of existing nodes.

## Dev Notes

- **Non-Destructive Alignment:** This is the core technical innovation of the product.
- **AST Constraint:** Use a robust JSX parser (like the one in Hono or a dedicated AST tool) to ensure surgical precision.
- **Developer Trust:** Marcus will only use the tool if he's 100% sure his logic is safe.

### Project Structure Notes

- Core logic in `src/features/nudge-engine/patcher.ts`.

### References

- [PRD: FR6, FR5](_bmad-output/planning-artifacts/prd.md#2-rendering--state)
- [Architecture: The Nudge Engine](_bmad-output/planning-artifacts/architecture.md#ai--agent-orchestration)

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

- All 132 tests pass
- Build succeeds

### Completion Notes List

- Created `logic-guard.ts` with protected attribute patterns
- Implemented `isProtectedAttribute()` covering: onclick, HTMX (hx-*), Alpine.js (x-*, @), Vue.js (v-*, :)
- Implemented `isModifiableAttribute()` for class/style only
- Created `validateNudgePreservesLogic()` to verify no logic was altered
- Implemented `safeApplyNudge()` that validates before returning
- 24 comprehensive tests verifying logic preservation
- Hierarchy modification detection prevents structural changes

### File List

- test-app/src/features/nudge-engine/logic-guard.ts (created)
- test-app/src/features/nudge-engine/logic-guard.test.ts (created)
- test-app/src/features/nudge-engine/index.ts (modified)
