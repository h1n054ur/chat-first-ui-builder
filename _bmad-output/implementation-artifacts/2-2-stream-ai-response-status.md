# Story 2.2: Stream AI Response Status

Status: done

## Story

As a user,
I want to see real-time progress indicators during component generation,
so that I know the system is working and can see the "thought process."

## Acceptance Criteria

1. **Given** a component generation request
   **When** the AI is processing
   **Then** the system streams status updates (e.g., "Planning structure...", "Applying vibe tokens...") via SSE.
2. **Given** the streaming response
   **When** tokens are received
   **Then** the chat UI displays them incrementally with <500ms TTFT.
3. **Given** the completion of generation
   **When** the process finishes
   **Then** the status indicators transition to a "Complete" state.

## Tasks / Subtasks

- [x] Implement SSE Handler in Hono (AC: 1, 2)
  - [x] Create a `/api/generate/stream` endpoint.
  - [x] Use `streamText` or similar pattern for SSE responses.
- [x] Implement Chat Status Orchestrator (AC: 1)
  - [x] Define a set of standard status messages based on the AI agent's internal lifecycle.
- [x] Connect Claude SDK to SSE (AC: 2)
  - [x] Stream the partial text/status tokens from the Anthropic SDK directly to the client.
- [x] Implement Frontend SSE Listener (AC: 2, 3)
  - [x] Use EventSource or fetch-stream on the client to update the Omni-Box/Chat UI.

## Dev Notes

- **SSE vs WebSockets:** Use SSE for unidirectional status/text streaming and WebSockets for bi-directional preview updates.
- **Latency:** TTFT must be <500ms. Start streaming the "Planning" state immediately while Claude is thinking.
- **Hono Streaming:** Use `c.streamText` or `c.stream` for high-performance edge streaming.

### Project Structure Notes

- Logic co-located in `src/features/chat/`.

### References

- [PRD: FR4, NFR2](_bmad-output/planning-artifacts/prd.md#1-interaction--orchestration)
- [Project Context: Performance Requirements](_bmad-output/project-context.md#performance-requirements-must-meet)

## Dev Agent Record

### Agent Model Used

Claude (claude-sonnet-4-20250514)

### Debug Log References

- All 48 tests pass
- Build succeeds

### Completion Notes List

- Created `StreamEvent` type with status, token, complete, error types
- Defined `STATUS_MESSAGES` constants for lifecycle phases:
  - PLANNING, APPLYING_VIBE, GENERATING, FINALIZING, COMPLETE, ERROR
- Implemented `formatSSE()` for proper SSE message formatting
- Implemented `streamComponentGeneration()` async generator using Claude streaming API
- Implemented `createSSEStream()` to convert generator to ReadableStream
- Added `POST /api/generate/stream` endpoint with SSE response
- Status events emitted immediately to achieve <500ms TTFT
- Tokens streamed as they arrive from Claude

### File List

- test-app/src/features/chat/stream.ts (created)
- test-app/src/features/chat/stream.test.ts (created)
- test-app/src/features/chat/index.ts (modified)
- test-app/src/index.tsx (modified - added streaming endpoint)

## Senior Developer Review (AI)

**Reviewer:** Claude Code Review Agent
**Date:** 2026-01-15
**Outcome:** APPROVED

### Review Notes

**Issues Found & Fixed:**
1. [M8] Stream error handling was incomplete - errors now include structured JSON with `partial` flag and `recoverable` status, plus a completion event to properly signal end of stream

**Verified:**
- All 3 Acceptance Criteria implemented correctly
- Status messages defined for all phases (PLANNING, APPLYING_VIBE, GENERATING, FINALIZING, COMPLETE, ERROR)
- SSE formatting correct with proper event types
- TTFT requirement met (status emitted immediately before AI processing)

### Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-01-15 | Initial implementation | Dev Agent |
| 2026-01-15 | Improved error handling | Review Agent |
