---
project_name: '02'
user_name: 'Hani'
date: '2026-01-15'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: 'complete'
rule_count: 47
optimized_for_llm: true
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

### Core Runtime
- **Local:** Bun (latest)
- **Production:** Cloudflare Workers

### Framework & Build
- **Hono:** ^4.11.4 (BFF framework with JSX support)
- **Vite:** ^6.3.5 (build tooling)
- **TypeScript:** ESNext target, strict mode, Bundler moduleResolution

### Cloudflare Infrastructure
- **D1:** SQLite for persistent storage
- **R2:** Object storage for assets
- **KV:** Key-value cache
- **Durable Objects:** Real-time session state (source of truth for <200ms updates)
- **Queues:** Background job processing

### Critical Version Constraints
- JSX uses `hono/jsx` (`jsxImportSource: "hono/jsx"` in tsconfig)
- ESM modules only (`"type": "module"` in package.json)
- Tailwind CSS v4 required for design-token-driven styling

---

## Critical Implementation Rules

### TypeScript Rules

#### Configuration (MUST follow)
- Strict mode is enabled - no `any` types without explicit justification
- ESNext target - use modern JS features (optional chaining, nullish coalescing, etc.)
- Bundler module resolution - imports resolve via Vite, not Node

#### Import Patterns
- USE: `import { x } from 'package'` (ESM only)
- NEVER: `require()` or CommonJS patterns
- File extensions NOT needed in imports

#### JSX Rules (CRITICAL)
- JSX uses **Hono's JSX runtime**, NOT React
- Import JSX utilities from `hono/jsx-renderer`, NOT `react`
- Components return Hono JSX elements
- Use `jsxRenderer` middleware for page layouts (see `renderer.tsx` pattern)

#### Type Safety
- All function parameters must be typed
- Prefer `unknown` over `any` when type is uncertain
- Use Zod for runtime validation at API boundaries

### Hono Framework Rules

#### Route Handlers
- Use `c.render(<JSX />)` for HTML responses
- Use `c.json({ success, data, error })` for API responses
- Access Cloudflare bindings via `c.env.BINDING_NAME`

#### Middleware Pattern
- Define middleware in separate files (see `renderer.tsx`)
- Apply with `app.use(middlewareFn)`
- Middleware order matters - auth before route handlers

#### Internal Communication
- USE: Hono `hc` client for service-to-service RPC
- NEVER: Direct fetch calls between internal services

### Cloudflare Infrastructure Rules

#### Durable Objects (Session State)
- DO is the **source of truth** for active session state
- All real-time updates go through DO first
- Flush to D1 only on explicit user actions (Milestone/Lock)
- Use WebSocket Hibernation for idle connection management

#### D1 Database
- For persistent, long-term storage only
- NOT for real-time state (use DO instead)

#### Worker Bindings
- Type with `CloudflareBindings` interface
- Run `wrangler types` after adding new bindings to wrangler.toml

### Nudge Engine Rules (CRITICAL)

#### AI Output Constraints
- Claude returns **JSON style deltas**, not raw JSX/HTML
- Deltas specify Tailwind class additions/removals only
- A dedicated service patches the stable internal AST

#### Structural Integrity
- AI agents MUST NOT modify component hierarchy during nudges
- Style-only modifications preserve business logic
- Prevent layout collapse by constraining to visual properties

### Testing Rules

#### Test Organization
- Co-locate unit tests: `feature.ts` → `feature.test.ts`
- E2E tests in `tests/e2e/` directory
- Visual regression tests for UI components

#### Test Structure
- Use Vitest for unit and integration tests
- Use Bun test runner as alternative
- Mock Cloudflare bindings (D1, DO, KV) in unit tests

#### Edge Runtime Testing
- Use Miniflare for local Cloudflare environment simulation
- Test WebSocket Hibernation recovery scenarios
- Validate <200ms latency requirements in integration tests

#### What to Test
- Route handlers: Request/response contracts
- Nudge Engine: AST patch correctness, style-only mutations
- Durable Objects: State consistency, transaction handling
- Export: Code output matches conventions

### Code Quality & Style Rules

#### Naming Conventions (MUST follow)
| Context | Convention | Example |
|---------|------------|---------|
| Database tables/columns | snake_case | `project_milestones`, `created_at` |
| API endpoints | RESTful, pluralized | `/api/projects/:id/nudges` |
| JSX Components | PascalCase | `UserCard.tsx`, `NudgePanel.tsx` |
| Functions/variables | camelCase | `applyStylePatch`, `sessionState` |
| Types/Interfaces | PascalCase | `NudgeRequest`, `SessionState` |

#### File Organization
```
src/
├── index.ts              # Worker entry point
├── features/             # Feature modules (co-located logic + tests)
│   ├── chat/
│   ├── nudge-engine/
│   ├── preview-sandbox/
│   └── state-manager/
├── components/
│   ├── ui/               # System primitives
│   └── templates/        # Vibe fragments
├── infrastructure/       # Cloudflare bindings
│   ├── d1/
│   ├── r2/
│   └── durable-objects/
└── lib/                  # Shared utilities
```

#### API Response Format
All API responses MUST use this wrapper:
```typescript
{ success: boolean, data: T, error?: string }
```

#### Date Format
- USE: ISO 8601 strings exclusively (`2026-01-15T13:00:00Z`)
- NEVER: Unix timestamps or locale-specific formats

### Development Workflow Rules

#### Local Development
- Run `bun run dev` for local development
- Vite + Wrangler simulate Cloudflare environment locally
- Run `bun run cf-typegen` after modifying wrangler.toml bindings

#### Deployment
- Build: `bun run build` (Vite production build)
- Deploy: `bun run deploy` (Wrangler to Cloudflare)
- Preview subdomains: `{session-id}.02-preview.com`

#### Git Conventions (Recommended)
- Branch naming: `feature/`, `fix/`, `refactor/` prefixes
- Commit messages: Conventional commits (`feat:`, `fix:`, `refactor:`)
- PRs require passing build + type checks

#### Security Workflow
- All AI-generated HTML fragments pass through DOMPurify before injection
- Preview sandbox isolation via dynamic subdomains
- Clerk handles authentication (OIDC flow)

### Critical Don't-Miss Rules

#### NEVER Do These (Anti-Patterns)
- **NEVER** modify component structure during nudge operations (style-only!)
- **NEVER** use direct `fetch()` for internal service communication (use `hc` client)
- **NEVER** store real-time session state in D1 (use Durable Objects)
- **NEVER** return raw JSX/HTML from Claude (return JSON style deltas)
- **NEVER** inject AI-generated HTML without DOMPurify sanitization
- **NEVER** allow cross-origin access between preview sandbox and main app

#### Performance Requirements (MUST meet)
- Preview updates: <200ms latency
- AI TTFT: <500ms
- WebSocket wake-up: <1s recovery

#### Edge Cases to Handle
- Durable Object transactions may fail - implement retry logic
- WebSocket Hibernation requires explicit wake-up handling
- Large AST patches may need chunking for <200ms target

#### Security Checklist
- [ ] DOMPurify on all AI-generated fragments
- [ ] Preview isolated to `{session-id}.02-preview.com`
- [ ] Clerk auth middleware on protected routes
- [ ] No secrets in client-side code

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Flag any conflicts with these rules to the user

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review quarterly for outdated rules
- Remove rules that become obvious over time

---

_Last Updated: 2026-01-15_
