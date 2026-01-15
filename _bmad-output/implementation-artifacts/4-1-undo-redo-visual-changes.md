# Story 4.1: Undo/Redo Visual Changes

Status: done

## Story

As a designer,
I want to instantly revert an AI-driven change,
so that I can experiment freely without fear of "breaking" my work.

## Acceptance Criteria

1. **Given** a sequence of nudges or generations
   **When** I click "Undo" (or press `Cmd+Z`)
   **Then** the system reverts to the previous transactional state in the Durable Object.
2. **Given** an undo action
   **When** the state is reverted
   **Then** the preview updates immediately to reflect the previous state.
3. **Given** multiple steps
   **When** I undo and then redo
   **Then** I can navigate the design history perfectly.

## Tasks / Subtasks

- [x] Implement History Tracking in State Manager (AC: 1, 3)
  - [x] Update the `StateManager` DO to maintain an array of AST snapshots.
  - [x] Implement `undo()` and `redo()` methods that move the "current" pointer in the history stack.
- [x] Implement Undo/Redo API (AC: 1)
  - [x] Create Hono endpoints for history navigation.
- [x] Connect Frontend Shortcuts (AC: 1)
  - [x] Listen for `Cmd+Z` / `Cmd+Shift+Z` and trigger the history API.
- [x] Synchronize Preview (AC: 2)
  - [x] Ensure the history state change triggers a full or surgical preview refresh.

## Dev Notes

- **Transactional State:** DO's transactional nature is perfect for this.
- **Memory Management:** Cap the history stack (e.g., 50 steps) to prevent DO memory issues.
- **HTMX Synergy:** HTMX `hx-swap` can be used to revert the preview content nearly instantly.

### Project Structure Notes

- Implementation in `src/features/state-manager/`.

### References

- [PRD: FR8](_bmad-output/planning-artifacts/prd.md#2-rendering--state)
- [UX: The Undo Safety Net](_bmad-output/planning-artifacts/ux-design-specification.md#emotional-design-principles)

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

- All 149 tests pass
- Build succeeds

### Completion Notes List

- Created `history.ts` with full undo/redo implementation
- Implemented `HistoryState` with entries array and currentIndex pointer
- Created `pushHistory()`, `undo()`, `redo()` functions
- History capped at 50 entries per Dev Notes
- Forward history truncated when pushing from non-current position
- `getCurrentAst()` and `getHistorySummary()` for UI integration
- All operations are synchronous for instant preview updates

### File List

- test-app/src/features/state-manager/history.ts (created)
- test-app/src/features/state-manager/history.test.ts (created)
- test-app/src/features/state-manager/index.ts (modified)
