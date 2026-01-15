# System Architecture: 02 - Chat-First UI Builder

## High-Level Architecture
The application is a full-stack "Edge-First" application built on Hono and Cloudflare Workers. It leverages a feature-based architecture to separate concerns.

## Infrastructure Components
| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **API/Server** | Hono (Cloudflare Workers) | Routes, middleware, and business logic. |
| **State Storage** | Durable Objects (StateManager) | Transactional state for project AST, vibe, and history. |
| **Database** | D1 | Persistent project metadata and long-term storage. |
| **Asset Storage** | R2 | Storage for generated assets and export bundles. |
| **Caching** | KV | Fast access to session data and vibes. |
| **Background Tasks** | Queues | Asynchronous processing for long-running AI tasks. |

## Core Features
### 1. Nudge Engine (`src/features/nudge-engine`)
The heart of the "sculpting" experience. It translates subjective intent (e.g., "more air") into deterministic Tailwind class deltas.
- **AST Patcher**: Surgically applies class changes to JSX strings without affecting logic.
- **Vibe System**: Defines design tokens and CSS variables for different "vibes."

### 2. State Manager (`src/features/state-manager`)
Manages project sessions across sessions.
- **Durable Object Client**: High-performance sync using Cloudflare Durable Objects.
- **Undo/Redo**: Maintains a visual history of design moves.

### 3. Chat System (`src/features/chat`)
Handles communication with the Anthropic AI API.
- **Streaming**: Uses SSE to provide real-time feedback during generation.
- **Sanitization**: Ensures generated JSX is safe and follows conventions.

### 4. Export Serializer (`src/features/export-serializer`)
Bundles the generated UI into a production-ready project.
- **Zip Generation**: Creates a ready-to-deploy ZIP with Hono and Tailwind configuration.

## Frontend Rendering
- **Vite SSR**: Server-side rendering for Hono components.
- **Tailwind v4**: Next-gen CSS utility framework.
- **HTMX (Implicit)**: Used for surgical UI updates without full page reloads.
