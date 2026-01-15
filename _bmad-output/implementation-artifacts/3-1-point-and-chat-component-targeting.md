# Story 3.1: Point-and-Chat Component Targeting

Status: done

## Story

As a user,
I want to click an element in the preview to target it for refinement,
so that I can precisely control which part of the UI I am "sculpting."

## Acceptance Criteria

1. **Given** a rendered component in the preview sandbox
   **When** I click a specific DOM element (e.g., a button or card)
   **Then** the element is highlighted in the preview with an Indigo ring.
2. **Given** a selected element
   **When** I focus the Omni-Box
   **Then** it indicates that the selected element is the context for the next command (e.g., "Sculpting Button...").
3. **Given** a selected element
   **When** I click elsewhere or press Escape
   **Then** the selection is cleared.

## Tasks / Subtasks

- [x] Implement Preview Message Handler (AC: 1)
  - [x] Add a `click` listener to the sandbox iframe.
  - [x] Use `postMessage` to communicate the target element's ID/Selector to the parent app.
- [x] Implement Selection Highlighting (AC: 1)
  - [x] Create a visual overlay or inject temporary Tailwind classes (e.g., `ring-2 ring-indigo-500`) to highlight the target.
- [x] Synchronize Selection with Omni-Box (AC: 2)
  - [x] Update the app's global state with the `currentTarget`.
  - [x] Update the Omni-Box UI to show the selected context.
- [x] Implement Deselection Logic (AC: 3)
  - [x] Handle clicks outside the component or Escape key presses to clear `currentTarget`.

## Dev Notes

- **Security:** Use `postMessage` with strict origin checks to communicate between the sandbox and the main app.
- **Selector Stability:** Use `data-02-id` attributes to uniquely identify elements in the AST for mapping between the DOM and the AI context.
- **Visuals:** Use the "Electric Indigo" accent color for selection rings as defined in the UX spec.

### Project Structure Notes

- Implementation in `src/features/preview-sandbox/` and `src/features/chat/`.

### References

- [UX: Point-and-Chat Component Targeting](_bmad-output/planning-artifacts/ux-design-specification.md#story-31-point-and-chat-component-targeting)
- [Architecture: Preview-to-App Boundary](_bmad-output/planning-artifacts/architecture.md#architectural-boundaries)

## Dev Agent Record

### Agent Model Used

gemini-2.0-flash-exp

### Debug Log References

- All 75 tests pass
- Build succeeds

### Completion Notes List

- Created `preview-sandbox` feature module with types, sandbox script, and selection manager
- Implemented `sandbox-script.ts` with click listener, postMessage communication, and Escape key handling
- Created `SelectionManager` class with subscribe/unsubscribe pattern for state management
- Implemented `OmniBox` component showing selected element context ("Sculpting Button...")
- Selection highlights use Electric Indigo ring classes per UX spec
- Secure postMessage with origin validation support

### File List

- test-app/src/features/preview-sandbox/types.ts (created)
- test-app/src/features/preview-sandbox/sandbox-script.ts (created)
- test-app/src/features/preview-sandbox/selection-manager.ts (created)
- test-app/src/features/preview-sandbox/index.ts (created)
- test-app/src/features/preview-sandbox/preview-sandbox.test.ts (created)
- test-app/src/components/ui/OmniBox.tsx (created)
- test-app/src/components/ui/index.ts (modified)
