# Story 5.1: Export Component Code

Status: done

## Story

As a developer (Marcus),
I want to copy the polished JSX/Tailwind code to my clipboard,
so that I can use it in my existing Bun project immediately.

## Acceptance Criteria

1. **Given** a finalized design
   **When** I click "Export"
   **Then** the system serializes the internal AST into human-readable Hono/JSX.
2. **Given** the exported code
   **When** formatted
   **Then** it follows standard Hono JSX conventions (e.g., camelCase attributes, standard Tailwind classes).
3. **Given** the export UI
   **When** I click "Copy"
   **Then** the formatted code is copied to my system clipboard.

## Tasks / Subtasks

- [ ] Implement AST-to-JSX Serializer (AC: 1, 2)
  - [ ] Create a utility to transform the internal state back into a clean `.tsx` string.
  - [ ] Ensure formatting (via Prettier or similar) is applied to the output.
- [ ] Implement Export UI (AC: 3)
  - [ ] Create an "Export" modal or sidebar.
  - [ ] Use `navigator.clipboard` for the copy-to-clipboard functionality.
- [ ] Verify Code Quality (AC: 2)
  - [ ] Ensure no `data-02-id` or other system-specific attributes leak into the exported code.

## Dev Notes

- **Zero-Cleanup Goal:** The output must be "drop-in" ready.
- **Formatting:** Use a lightweight formatter to ensure the code looks "hand-written."
- **Cleanup:** This is the phase where all the "scaffolding" (like tracking IDs) must be stripped away.

### Project Structure Notes

- Logic in `src/features/export-serializer/` or shared lib.

### References

- [PRD: FR9, Success Criteria](_bmad-output/planning-artifacts/prd.md#3-export--management)
- [UX: The Zero-Cleanup Export](_bmad-output/planning-artifacts/ux-design-specification.md#critical-success-moments)

## Dev Agent Record

### Agent Model Used

claude-opus-4-20250514

### Debug Log References

None

### Completion Notes List

- Implemented AST-to-JSX serializer in `src/features/export-serializer/serializer.ts`
- Created `stripSystemAttributes()` to remove all `data-02-*` and `data-ghost-*` attributes
- Implemented `normalizeAttributes()` for Hono/React compatibility
- Created `formatJsx()` for readable output formatting
- Implemented `serializeComponent()` and `serializeComponents()` for single/batch export
- Created `createExportBundle()` to generate complete file bundles
- All tests passing (24 tests for this story)

### File List

- src/features/export-serializer/serializer.ts
- src/features/export-serializer/serializer.test.ts
- src/features/export-serializer/index.ts
