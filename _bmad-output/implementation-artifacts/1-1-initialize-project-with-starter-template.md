# Story 1.1: Initialize Project with Starter Template

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer (Marcus),
I want to initialize my project using the approved Hono/Cloudflare starter template,
so that I have a production-ready environment aligned with the project architecture.

## Acceptance Criteria

1. **Given** the `bun create` command specified in Architecture
   **When** I execute the command
   **Then** a new project directory is created with Hono, Vite, and Tailwind v4 configured.
2. **Given** the initialized project
   **When** I inspect `wrangler.toml`
   **Then** it includes correctly named bindings for D1 (`DB`), R2 (`ASSETS`), KV (`CACHE`), Durable Objects (`STATE_MANAGER`), and Queues (`TASKS`).
3. **Given** the initialized project
   **When** I inspect `package.json`
   **Then** it uses `"type": "module"` and includes dependencies for `hono`, `vite`, and `@tailwindcss/vite`.
4. **Given** the initialized project
   **When** I inspect `tsconfig.json`
   **Then** `jsxImportSource` is set to `hono/jsx`.

## Tasks / Subtasks

- [x] Initialize project using Hono template (AC: 1)
  - [x] Run `bun create hono@latest test-app --template cloudflare-workers+vite` (Note: User already has `test-app` but we need to ensure it matches the template or re-init/align)
- [x] Configure Tailwind CSS v4 (AC: 2)
  - [x] Ensure `@tailwindcss/vite` is installed and configured in `vite.config.ts`.
  - [x] Set up global CSS with `@import "tailwindcss";`.
- [x] Configure Cloudflare Bindings in `wrangler.toml` (AC: 2)
  - [x] Add D1 database binding `DB`.
  - [x] Add R2 bucket binding `ASSETS`.
  - [x] Add KV namespace binding `CACHE`.
  - [x] Add Durable Object binding `STATE_MANAGER` and class migration.
  - [x] Add Queue binding `TASKS`.
- [x] Set up project structure and boilerplate (AC: 3, 4)
  - [x] Create `src/features`, `src/components`, `src/infrastructure`, `src/lib` directories.
  - [x] Configure `tsconfig.json` for Hono JSX and Bundler resolution.
  - [x] Define `CloudflareBindings` type in a shared location.

## Dev Notes

- **Template:** Use `cloudflare-workers+vite` for the best balance of HMR and edge compatibility.
- **JSX Runtime:** This project explicitly uses `hono/jsx`. Do NOT install or use React.
- **Styling:** Tailwind v4 is a hard requirement. It uses a CSS-first configuration.
- **Infrastructure:**
  - Durable Objects are the "Source of Truth" for real-time state (<200ms target).
  - D1 is for long-term persistence (milestones).
- **Organization:** Follow the feature-based structure from the start to avoid later refactoring.

### Project Structure Notes

- `src/index.ts` is the entry point.
- Features should contain their own logic and tests (e.g., `src/features/state-manager/`).
- Components return Hono JSX elements.

### References

- [Architecture: Starter Template Selection](_bmad-output/planning-artifacts/architecture.md#selected-starter-create-hono-template-cloudflare-workersvite)
- [Project Context: Technology Stack & Versions](_bmad-output/project-context.md#technology-stack--versions)
- [Project Context: Naming Conventions](_bmad-output/project-context.md#naming-conventions-must-follow)

## Dev Agent Record

### Agent Model Used

Claude (claude-sonnet-4-20250514)

### Debug Log References

- Build verified: `bun run build` passes
- Tests verified: `bun test` passes (4/4 tests)

### Completion Notes List

- Verified existing `test-app` was created with correct Hono template
- Added Tailwind CSS v4 (`@tailwindcss/vite` ^4.1.18, `tailwindcss` ^4.1.18)
- Configured `vite.config.ts` with Tailwind plugin
- Updated `src/style.css` with `@import "tailwindcss";`
- Created `wrangler.toml` with all required Cloudflare bindings (DB, ASSETS, CACHE, STATE_MANAGER, TASKS)
- Created project structure: `src/features/`, `src/components/`, `src/infrastructure/`, `src/lib/`
- Defined `CloudflareBindings` type in `src/lib/types.ts`
- Created `StateManager` Durable Object placeholder in `src/infrastructure/durable-objects/`
- Updated `tsconfig.json` with Cloudflare Workers types
- Updated `src/index.tsx` with typed Hono app and Tailwind example

### File List

- test-app/package.json (modified)
- test-app/vite.config.ts (modified)
- test-app/tsconfig.json (modified)
- test-app/wrangler.toml (created)
- test-app/src/style.css (modified)
- test-app/src/index.tsx (modified)
- test-app/src/index.test.ts (created)
- test-app/src/lib/types.ts (created)
- test-app/src/infrastructure/durable-objects/StateManager.ts (created)
- test-app/src/features/ (created - directory structure)
- test-app/src/components/ (created - directory structure)
- test-app/wrangler.jsonc (deleted)

## Senior Developer Review (AI)

**Reviewer:** Claude Code Review Agent
**Date:** 2026-01-15
**Outcome:** APPROVED

### Review Notes

**Issues Found & Fixed:**
1. [M9] Added explicit TypeScript dependency to package.json for tooling compatibility
2. Added `.dev.vars.example` for environment variable documentation

**Verified:**
- All 4 Acceptance Criteria implemented correctly
- All tasks marked [x] are actually complete
- Build passes, 65 tests pass
- Project structure follows architecture requirements

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Initial implementation | Dev Agent |
| 2026-01-15 | Code review fixes applied | Review Agent |
