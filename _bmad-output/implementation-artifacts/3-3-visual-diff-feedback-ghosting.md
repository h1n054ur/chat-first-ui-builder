# Story 3.3: Visual Diff Feedback (Ghosting)

Status: done

## Story

As a user,
I want to see what exactly changed after a nudge,
so that I can verify the AI correctly understood my intent.

## Acceptance Criteria

1. **Given** a successful style update (nudge)
   **When** the new state is rendered
   **Then** the previous state is "ghosted" behind the new state for 2 seconds using opacity.
2. **Given** a design change
   **When** the preview updates
   **Then** a "Diff Toast" appears in the corner showing the specific Tailwind classes added and removed.

## Tasks / Subtasks

- [x] Implement Ghosting Overlay in Preview (AC: 1)
  - [x] Before applying a nudge update, capture a "snapshot" of the current DOM fragment.
  - [x] Render the snapshot as a semi-transparent layer behind the new content.
  - [x] Implement a CSS animation to fade out the ghosted layer after 2 seconds.
- [x] Implement Diff Toast UI (AC: 2)
  - [x] Create a notification component in the main app.
  - [x] Populate it with the `add/remove` deltas from the Nudge Engine.
- [x] Synchronize Ghosting with HTMX/WebSocket updates (AC: 1)
  - [x] Trigger the ghosting transition in sync with the arrival of the new HTML fragment.

## Dev Notes

- **UX Pattern:** This is the "Visual Diff" overlay from the UX spec.
- **Performance:** Ensure the ghosting logic doesn't block the main rendering path (<200ms target).
- **Implementation:** Use CSS transitions/animations for the "pulse" and "fade" effects.

### Project Structure Notes

- Overlay logic in `src/features/preview-sandbox/`.
- Toast logic in `src/components/ui/`.

### References

- [UX: Visual Diff Feedback (Ghosting)](_bmad-output/planning-artifacts/ux-design-specification.md#story-33-visual-diff-feedback-ghosting)
- [UX: Micro-Emotions](_bmad-output/planning-artifacts/ux-design-specification.md#micro-emotions)

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

- All 108 tests pass
- Build succeeds

### Completion Notes List

- Created `ghosting.ts` with visual diff overlay logic
- Implemented `createGhost()` for capturing and rendering previous state
- Ghost fades out over 2 seconds using CSS transition
- Created `DiffToast` component showing added/removed classes
- Created `DiffToastContainer` for managing multiple toasts
- Implemented toast management (create, dismiss, clear)
- `formatDeltaForDisplay()` helper for UI rendering

### File List

- test-app/src/features/preview-sandbox/ghosting.ts (created)
- test-app/src/features/preview-sandbox/ghosting.test.ts (created)
- test-app/src/features/preview-sandbox/index.ts (modified)
- test-app/src/components/ui/DiffToast.tsx (created)
- test-app/src/components/ui/index.ts (modified)
