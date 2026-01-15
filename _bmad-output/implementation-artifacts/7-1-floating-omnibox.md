# Story 7.1: Floating OmniBox Command Bar

Status: ready-for-dev

## Story

As a user,
I want a floating command bar that I can summon with a hotkey,
so that I can quickly issue "nudges" without taking my eyes off the preview.

## Acceptance Criteria

1. **Given** any screen
   **When** I press `Cmd+K` (or `Ctrl+K`)
   **Then** a floating "OmniBox" command bar appears centered at the top.
2. **Given** the OmniBox is open
   **When** I type a command and hit Enter
   **Then** the command is sent to the chat orchestrator and the box shows a loading state.
3. **Given** a selected element in the preview
   **When** the OmniBox is open
   **Then** it displays the selection context (e.g., "Sculpting Hero Section...").

## Tasks / Subtasks

- [ ] Create `OmniBox` component with Raycast-style design
- [ ] Implement global keyboard listener for `Cmd+K`
- [ ] Add context-aware placeholder text (dynamic based on selection)
- [ ] Implement transition animations (scale/fade-in)

## Dev Notes

- Use "Electric Indigo" (`#6366f1`) for the active border and selection text.
- Box should have a subtle frosted glass effect (`backdrop-blur`).
- Accessibility: Focus must be trapped within the OmniBox when open.
