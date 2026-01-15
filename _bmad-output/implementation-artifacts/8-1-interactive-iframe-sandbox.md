# Story 8.1: Interactive Iframe Sandbox

Status: ready-for-dev

## Story

As a user,
I want my generated UI to render in a safe, isolated sandbox,
so that it doesn't conflict with the app's styles and can be accurately inspected.

## Acceptance Criteria

1. **Given** a generated component
   **When** it renders
   **Then** it appears inside an `<iframe>` with a unique session context.
2. **Given** the sandbox
   **When** I hover over elements inside the iframe
   **Then** they signal selection to the parent app via `postMessage`.
3. **Given** a style change (nudge)
   **When** applied
   **Then** the iframe updates surgically without a full page reload.

## Tasks / Subtasks

- [ ] Create `PreviewSandbox` component
- [ ] Implement `postMessage` bridge between App and Iframe
- [ ] Configure Tailwind v4 to inject styles into the iframe context
- [ ] Add loading skeletons for the iframe state

## Dev Notes

- Security: Ensure `sandbox` attribute is set on iframe with proper permissions.
- Use `data-02-id` to bridge DOM elements in the iframe with AST nodes in the app.
- Origin validation is critical for the `postMessage` handler.
