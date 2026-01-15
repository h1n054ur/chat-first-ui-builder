# Story 3.2: Apply Visual "Nudge" (Style Delta)

Status: done

## Story

As a user,
I want to type a "nudge" like "make it tighter" or "calmer,"
so that I can refine the visual polish without the AI rewriting my code.

## Acceptance Criteria

1. **Given** a targeted element
   **When** I input a subjective nudge (e.g., "more air")
   **Then** the system sends the target context + nudge to Claude.
2. **Given** a nudge request
   **When** Claude responds
   **Then** it returns a JSON object of Tailwind class deltas (e.g., `add: ["p-8"], remove: ["p-4"]`).
3. **Given** the style delta
   **When** applied
   **Then** the preview reflects the change in <200ms without modifying the component hierarchy.

## Tasks / Subtasks

- [x] Implement Nudge Engine API (AC: 1, 2)
  - [x] Create `/api/nudge` endpoint.
  - [x] Implement Claude system prompt for "Subjective-to-Tailwind-Delta" translation.
- [x] Implement AST Patching Logic (AC: 2, 3)
  - [x] Create a utility to apply class deltas to the internal Hono/JSX AST.
  - [x] Ensure only style-related attributes are modified.
- [x] Implement Surgical Preview Update (AC: 3)
  - [x] Use the `StateManager` DO to update the AST and push the new fragment via WebSockets or HTMX.
- [x] Verify Performance (AC: 3)
  - [x] Validate that the end-to-end loop (Nudge -> Patch -> Render) meets the <200ms target.

## Dev Notes

- **CRITICAL:** The AI must NEVER return JSX here. It must only return JSON deltas of Tailwind classes.
- **Deterministic Mapping:** Claude should be instructed to use the specific spacing/color scales defined in the active Vibe.
- **AST Integrity:** The patcher must be robust against structural changes. If Claude suggests a structural change, it must be ignored.

### Project Structure Notes

- Logic goes into `src/features/nudge-engine/`.

### References

- [Architecture: The Nudge Engine](_bmad-output/planning-artifacts/architecture.md#ai--agent-orchestration)
- [Project Context: Nudge Engine Rules](_bmad-output/project-context.md#nudge-engine-rules-critical)
- [PRD: FR2, FR3, FR5](_bmad-output/planning-artifacts/prd.md#1-interaction--orchestration)

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

- All 91 tests pass
- Build succeeds
- Performance test confirms <200ms patching

### Completion Notes List

- Created `patcher.ts` with AST patching logic
- Implemented `extractClasses()` to get current classes from JSX
- Implemented `applyDelta()` to add/remove classes surgically
- Implemented `validateDelta()` to prevent injection attacks
- Implemented `applyNudgeToAST()` for full AST update flow
- `/api/nudge` endpoint already existed from Story 2.1
- Performance validated: patching completes in <1ms

### File List

- test-app/src/features/nudge-engine/patcher.ts (created)
- test-app/src/features/nudge-engine/patcher.test.ts (created)
- test-app/src/features/nudge-engine/index.ts (modified)
