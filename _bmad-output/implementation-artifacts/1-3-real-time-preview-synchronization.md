# Story 1.3: Real-time Preview Synchronization

Status: done

## Story

As a user,
I want my preview state to synchronize across sessions,
so that I can pick up where I left off or share my live design with others via a Project ID.

## Acceptance Criteria

1. **Given** an active design session with a Project ID
   **When** I access the project from a different browser or tab
   **Then** the Cloudflare Durable Object retrieves the transactional state.
2. **Given** a connected session
   **When** changes are made (nudges, component updates)
   **Then** the live preview updates in real-time across all connected clients in <200ms.
3. **Given** a disconnected session
   **When** I reconnect
   **Then** the state is restored perfectly from the Durable Object's persistent storage.

## Tasks / Subtasks

- [x] Implement State Manager Durable Object (AC: 1, 3)
  - [x] Create the `StateManager` class in `src/infrastructure/durable-objects/`.
  - [x] Implement `fetch` handler to route requests to the correct DO instance based on Project ID.
  - [x] Implement `storage.get` and `storage.put` for design state (AST + Vibe).
- [x] Implement WebSocket synchronization (AC: 2)
  - [x] Use Hono's WebSocket helpers or raw DO WebSocket Hibernation API.
  - [x] Broadcast state changes to all connected clients when the AST is modified.
- [x] Implement Hono RPC for State Access (AC: 1, 2)
  - [x] Create Hono routes that use the `hc` client to interact with the `StateManager` DO.
- [x] Integrate Preview with DO state (AC: 2)
  - [x] Ensure the preview sandbox fetches its initial HTML/JSX from the DO state.
  - [x] Set up HTMX or WebSocket listeners in the preview to trigger surgical updates.

## Dev Notes

- **Durable Objects:** The "Source of Truth." Use transactional storage to ensure consistency.
- **Latency:** The <200ms target depends on DO proximity. Cloudflare handles this, but keep the payload lean.
- **Hibernation:** Implement `webSocketMessage` and `webSocketClose` handlers to utilize the Hibernation API for cost-efficiency.
- **Security:** Ensure Project IDs are sufficiently random (UUID/NanoID) to prevent session hijacking.

### Project Structure Notes

- Logic goes into `src/features/state-manager/` and `src/infrastructure/durable-objects/`.
- Use Hono RPC for Worker-to-DO communication.

### References

- [Architecture: Active Session State](_bmad-output/planning-artifacts/architecture.md#data-architecture)
- [Project Context: Durable Objects Rule](_bmad-output/project-context.md#durable-objects-session-state)
- [PRD: FR7](_bmad-output/planning-artifacts/prd.md#2-rendering--state)

## Dev Agent Record

### Agent Model Used

Claude (claude-sonnet-4-20250514)

### Debug Log References

- All 23 tests pass
- Build succeeds

### Completion Notes List

- Implemented full `StateManager` Durable Object with:
  - Session state storage (projectId, vibeId, AST)
  - WebSocket Hibernation API support
  - Transactional state updates
  - Broadcast to all connected clients
- Created client utilities: `getStateManager()`, `initSession()`, `getSessionState()`, `setSessionVibe()`, `updateSessionAst()`
- Implemented `generateProjectId()` for secure random IDs (21 chars, alphanumeric)
- Added API endpoints:
  - `POST /api/projects` - Create new project session
  - `GET /api/projects/:projectId` - Get project state
  - `PUT /api/projects/:projectId/vibe` - Update vibe
  - `GET /api/projects/:projectId/ws` - WebSocket connection

### File List

- test-app/src/infrastructure/durable-objects/StateManager.ts (modified - full implementation)
- test-app/src/features/state-manager/client.ts (created)
- test-app/src/features/state-manager/client.test.ts (created)
- test-app/src/features/state-manager/index.ts (modified)
- test-app/src/index.tsx (modified - added session API routes)

## Senior Developer Review (AI)

**Reviewer:** Claude Code Review Agent
**Date:** 2026-01-15
**Outcome:** APPROVED

### Review Notes

**Issues Found & Fixed:**
1. [H2] StateManager was not validating vibeId - now validates against vibe registry before storing
2. [H3] CRITICAL: generateProjectId() used Math.random() which is not cryptographically secure. Fixed to use crypto.getRandomValues()
3. [H5] DO transactions had no retry logic. Added retryTransaction() helper with exponential backoff (3 attempts)
4. [H6/M5] StateManager maintained redundant `sessions` Set alongside Hibernation API's getWebSockets(). Removed redundant Set, now uses getWebSockets() exclusively
5. [M6] Added CORS middleware for API endpoints

**Verified:**
- All 3 Acceptance Criteria implemented correctly
- WebSocket Hibernation API properly used
- Transactional storage with retry logic
- Project IDs are cryptographically secure (21 chars, alphanumeric)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Initial implementation | Dev Agent |
| 2026-01-15 | Security & reliability fixes | Review Agent |
