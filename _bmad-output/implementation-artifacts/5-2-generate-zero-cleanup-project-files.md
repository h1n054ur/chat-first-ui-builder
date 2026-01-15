# Story 5.2: Generate Zero-Cleanup Project Files

Status: done

## Story

As a developer (Marcus),
I want the exported code to include all necessary Tailwind directives and imports,
so that I have zero manual cleanup work after the hand-off.

## Acceptance Criteria

1. **Given** a multi-component design
   **When** I download the export package
   **Then** it includes a ready-to-run file structure (e.g., `Component.tsx`, `index.tsx`, `tailwind.config.js` if custom).
2. **Given** the exported files
   **When** run in a standard Bun/Hono environment
   **Then** they render correctly without any modifications.

## Tasks / Subtasks

- [ ] Implement Project Packaging (AC: 1)
  - [ ] Create a utility to generate a ZIP or multi-file export bundle.
  - [ ] Include necessary boilerplate (imports, Tailwind directives).
- [ ] Implement Download Handler (AC: 1)
  - [ ] Create a Hono endpoint to serve the generated bundle.
- [ ] Verify "Drop-in" Readiness (AC: 2)
  - [ ] Create a "Smoke Test" project using the exported files to ensure they work out-of-the-box.

## Dev Notes

- **Success Metric:** 100% first-try success rate in a clean Bun/Hono environment.
- **Vibe Integration:** Ensure any custom Tailwind theme variables from the Vibe are included in the export.

### Project Structure Notes

- Logic in `src/features/export-serializer/`.

### References

- [PRD: FR10](_bmad-output/planning-artifacts/prd.md#3-export--management)
- [Architecture: Implementation Readiness](_bmad-output/planning-artifacts/architecture.md#architecture-validation-results)

## Dev Agent Record

### Agent Model Used

claude-opus-4-20250514

### Debug Log References

None

### Completion Notes List

- Created `src/features/export-serializer/bundler.ts` with full project packaging
- Implemented `createProjectBundle()` to generate complete project structure:
  - `src/components.tsx` - Generated Hono/JSX components
  - `src/styles.css` - Tailwind v4 directives + vibe CSS
  - `src/main.tsx` - Application entry point
  - `package.json` - With Hono, Tailwind v4, Vite dependencies
  - `vite.config.ts` - Configured for Hono JSX and Tailwind
  - `tsconfig.json` - TypeScript config with Hono JSX source
  - `README.md` - Setup instructions
- Implemented `createZipFile()` with proper ZIP format (CRC-32, headers)
- Added `/api/projects/:projectId/export` endpoint for ZIP download
- Added `/api/projects/:projectId/export/info` endpoint for export metadata
- All tests passing (24 tests for this story)

### File List

- src/features/export-serializer/bundler.ts
- src/features/export-serializer/bundler.test.ts
- src/features/export-serializer/index.ts (updated)
- src/index.tsx (added export endpoints)
